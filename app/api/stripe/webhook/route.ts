/**
 * POST /api/stripe/webhook — Gap 3: Stripe discovery payment linkage.
 *
 * What this route does:
 * - Reads the RAW request body (never parsed JSON first — signature
 *   verification must run over the exact bytes Stripe signed).
 * - Verifies the Stripe signature (header "stripe-signature") with
 *   STRIPE_WEBHOOK_SECRET from env only. The secret is never
 *   hardcoded, never logged, and never appears in any response.
 * - Handles checkout.session.completed and
 *   payment_intent.succeeded for discovery payments (amount must
 *   equal the lane's discovery price exactly) and records one
 *   Payment row + one AuditLog row via
 *   app/lib/erm/payment-store.ts, idempotently on stripe_payment_id
 *   and stripe_event_id.
 * - Handles the same two event types for program-balance payments
 *   (Gap 5 billing step): an event whose metadata says
 *   intake_type="balance" is parsed by parseBalanceEvent (amount
 *   must equal the lane's after-credit balance exactly) and
 *   recorded via recordBalancePaid in app/lib/erm/balance-store.ts.
 *   The branch happens on intake_type BEFORE either parser runs:
 *   a balance amount would fail the discovery amount check, and a
 *   discovery event must never be recorded as a balance.
 * - Handles the same two event types for monthly operate-plan
 *   payments (Gap 9): an event whose metadata says
 *   intake_type="monthly" is parsed by parseMonthlyEvent (amount
 *   must equal the lane's monthly price exactly, period month
 *   derived from the event's created time in America/Chicago)
 *   and recorded via recordMonthlyPaid in
 *   app/lib/erm/monthly-store.ts. Unknown intake references are
 *   recorded as UNLINKED monthly payments, like discovery —
 *   never dropped, never attached to an invented intake.
 * - Unknown intake references are recorded as UNLINKED payments,
 *   never dropped silently and never attached to an invented intake.
 *   That applies to discovery payments only: a balance payment
 *   with an unknown reference is rejected (400 intake_not_found) —
 *   a balance is defined against an intake that already exists,
 *   and recordBalancePaid has no unlinked path.
 *
 * What this route deliberately does NOT do:
 * - It does not charge anyone, create a payment link, refund
 *   anything, or call any other Stripe API. It only verifies and
 *   records what Stripe reports.
 * - It does not create a client or an intake, change an intake
 *   status, book anything, send anything to a client, or log a
 *   client in. There is no client login in this slice.
 * - It does not use the Stripe SDK: verification is one HMAC-SHA256
 *   in app/lib/erm/stripe.ts, so no Stripe API key is needed here.
 *
 * Responses (Stripe retry semantics matter):
 * - 400 invalid_signature / bad_json / amount_mismatch /
 *   unknown_lane: Stripe will not usefully retry these — the event
 *   itself is wrong, not the delivery.
 * - 200 ignored: other event types are acknowledged, not recorded.
 * - 200 written / already_exists / unlinked: recorded (or already
 *   recorded). Duplicate deliveries return already_exists.
 * - 503 webhook_not_configured / erm_not_configured / record_failed:
 *   Stripe WILL retry these, which is what we want when the secret
 *   or database is not set up yet.
 * - 200 unlinked_not_stored: the event was acknowledged but could
 *   not be stored (migration 001 not applied yet). The owner must
 *   check the Stripe dashboard for it; returning 503 here would
 *   retry an event that will keep failing the same way until the
 *   migration is applied, so the route reports the gap instead of
 *   looping retries.
 *
 * Limits: 256 KB body (Stripe events are larger than intake posts).
 * No rate limit: Stripe's own retries are legitimate traffic, and
 * the signature check is the authentication.
 * No PII is logged. No secret is logged.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  parseBalanceEvent,
  parseDiscoveryEvent,
  parseMonthlyEvent,
  stripeEventIntakeType,
  verifyStripeSignature,
} from "../../../lib/erm/stripe";
import { recordDiscoveryPayment } from "../../../lib/erm/payment-store";
import { recordBalancePaid } from "../../../lib/erm/balance-store";
import { recordMonthlyPaid } from "../../../lib/erm/monthly-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024;

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "webhook_not_configured" }, { status: 503 });
  }
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_body" }, { status: 400 });
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "body_too_large" }, { status: 413 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!verifyStripeSignature(raw, signature, secret)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 });
  }
  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  // Monthly events branch FIRST, alongside balance: their amount
  // is the monthly price, not the discovery fee, so the discovery
  // parser would reject them as amount_mismatch before they were
  // ever recognised.
  if (stripeEventIntakeType(event) === "monthly") {
    const monthlyParsed = parseMonthlyEvent(event);
    if (!monthlyParsed.ok) {
      if (monthlyParsed.reason === "unsupported_event") {
        return NextResponse.json({ ok: true, ignored: true });
      }
      return NextResponse.json(
        { ok: false, error: monthlyParsed.reason },
        { status: 400 },
      );
    }
    const monthly = await recordMonthlyPaid({
      reference: monthlyParsed.payment.reference ?? "",
      stripePaymentId: monthlyParsed.payment.stripePaymentId,
      stripeEventId: monthlyParsed.payment.eventId,
      amountCents: monthlyParsed.payment.amountCents,
      periodMonth: monthlyParsed.payment.periodMonth,
    });
    switch (monthly.status) {
      case "written":
        return NextResponse.json({ ok: true, erm: "written", paymentId: monthly.paymentId });
      case "already_exists":
        return NextResponse.json({
          ok: true,
          erm: "already_exists",
          paymentId: monthly.paymentId,
          linked: monthly.linked,
        });
      case "unlinked":
        return NextResponse.json({ ok: true, erm: "unlinked", paymentId: monthly.paymentId });
      case "unlinked_not_stored":
        return NextResponse.json({ ok: true, erm: "unlinked_not_stored" });
      case "amount_mismatch":
        return NextResponse.json({ ok: false, error: "amount_mismatch" }, { status: 400 });
      case "invalid_period":
        return NextResponse.json({ ok: false, error: "invalid_period" }, { status: 400 });
      case "not_configured":
        return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
      default:
        return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
    }
  }
  // Balance events branch FIRST: their amount is the program
  // balance, not the discovery fee, so the discovery parser would
  // reject them as amount_mismatch before they were ever recognised.
  if (stripeEventIntakeType(event) === "balance") {
    const balanceParsed = parseBalanceEvent(event);
    if (!balanceParsed.ok) {
      if (balanceParsed.reason === "unsupported_event") {
        return NextResponse.json({ ok: true, ignored: true });
      }
      return NextResponse.json(
        { ok: false, error: balanceParsed.reason },
        { status: 400 },
      );
    }
    const balance = await recordBalancePaid({
      reference: balanceParsed.payment.reference ?? "",
      stripePaymentId: balanceParsed.payment.stripePaymentId,
      stripeEventId: balanceParsed.payment.eventId,
      amountCents: balanceParsed.payment.amountCents,
    });
    switch (balance.status) {
      case "written":
        return NextResponse.json({ ok: true, erm: "written", paymentId: balance.paymentId });
      case "already_exists":
        return NextResponse.json({ ok: true, erm: "already_exists", paymentId: balance.paymentId });
      case "intake_not_found":
        // A balance is defined against an intake that already
        // exists; there is no unlinked balance path. The event
        // itself names a reference that is not in the ERM.
        return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 400 });
      case "amount_mismatch":
        return NextResponse.json({ ok: false, error: "amount_mismatch" }, { status: 400 });
      case "not_configured":
        return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
      default:
        return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
    }
  }
  const parsed = parseDiscoveryEvent(event);
  if (!parsed.ok) {
    if (parsed.reason === "unsupported_event") {
      return NextResponse.json({ ok: true, ignored: true });
    }
    return NextResponse.json({ ok: false, error: parsed.reason }, { status: 400 });
  }
  const result = await recordDiscoveryPayment(parsed.payment);
  switch (result.status) {
    case "written":
      return NextResponse.json({ ok: true, erm: "written", paymentId: result.paymentId });
    case "already_exists":
      return NextResponse.json({
        ok: true,
        erm: "already_exists",
        paymentId: result.paymentId,
        linked: result.linked,
      });
    case "unlinked":
      return NextResponse.json({ ok: true, erm: "unlinked", paymentId: result.paymentId });
    case "unlinked_not_stored":
      return NextResponse.json({ ok: true, erm: "unlinked_not_stored" });
    case "not_configured":
      return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
    default:
      return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
  }
}
