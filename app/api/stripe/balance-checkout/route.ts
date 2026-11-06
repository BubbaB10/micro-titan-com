/**
 * POST /api/stripe/balance-checkout — Gap 5 billing step: per-client
 * Checkout Session for the program balance, due on agreement of scope.
 *
 * When the balance is due — DECIDED by the owner 2026-11-05:
 * collect the FULL program balance on agreement of scope. "Agreement
 * of scope" = after discovery, the client has seen the presentation
 * and said yes to the first job's scope. That agreement is the
 * trigger for the balance payment, and setup starts only after that
 * payment lands. One payment, one record: Family $1,500 / Solo
 * entrepreneur $5,000 / Business $9,000 (the program total minus
 * the discovery fee already paid).
 *
 * What this route does, in order:
 * - Takes { reference, lane?, scopeAgreed } only. scopeAgreed must
 *   be true — the caller (the owner, Boone) attests the client has
 *   agreed scope. Without it the route creates nothing (400
 *   scope_not_agreed). There is no client-facing scope-agreement
 *   form yet; a future presentation/scope record will replace this
 *   attestation. Until then, this route is owner-triggered only.
 * - The reference must be an existing intake (404 if unknown); a
 *   supplied lane that does not match the intake's recorded lane
 *   returns 400 — the intake's lane is the source of truth.
 * - Discovery must already be paid for that intake (the paid
 *   discovery row in the ERM). A balance is never issued before the
 *   discovery fee, because the balance is defined as the total
 *   minus that fee. Unpaid discovery returns 402 discovery_unpaid.
 *   (402 here means "payment required first", not a charge.)
 * - A balance that is already paid returns 409 balance_already_paid
 *   and creates nothing — one balance payment per intake, ever.
 * - Otherwise it issues the balance via issueBalance (PR #35
 *   plumbing: one balance row per intake, amount server-side, never
 *   caller-supplied; an existing pending row returns already_exists
 *   and is reused, not duplicated), then creates ONE Stripe
 *   Checkout Session in payment mode for that lane's balance, with
 *   metadata intake_reference + lane + intake_type=balance on both
 *   the session and the PaymentIntent, so the webhook links it.
 * - Returns only { ok, url, sessionId, reference, lane,
 *   amountCents, balance } — balance is "issued" or
 *   "already_exists". The caller shares `url` with the client;
 *   payment happens on Stripe's hosted page. This route does not
 *   surface the URL to a client anywhere itself.
 *
 * Setup gate: this route does NOT start setup, and the webhook does
 * NOT move the intake to setup when the balance is paid. Setup
 * starts only after the owner check GET /api/ops/balance-status
 * shows the balance paid for that reference. The owner check is
 * the gate; the payment row is the proof.
 *
 * What this route deliberately does NOT do:
 * - It does not charge anyone itself, store card details, create a
 *   payment link, refund anything, or call any other Stripe API.
 * - It does not create a client or an intake, change an intake
 *   status, book anything, send anything to a client, or log anyone
 *   in. There is no client login in this slice.
 * - It does not accept a caller-supplied amount, lane total, or
 *   price. Amounts come from LANE_PRICING via balance-checkout.ts.
 *
 * Secrets: STRIPE_SECRET_KEY from env only, never hardcoded, never
 * logged, never in a response. Missing secret → 503 (nothing
 * created). Missing database → 503 erm_not_configured.
 *
 * Limits mirror the discovery checkout route: 64 KB body, 5
 * requests per IP per 15 minutes. No PII is logged. Stripe error
 * bodies are never echoed.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  BALANCE_CHECKOUT_CENTS,
  buildBalanceCheckoutSessionParams,
  type BalanceLane,
} from "../../../lib/erm/balance-checkout";
import { createCheckoutSession, isValidReference, normalizeCheckoutLane } from "../../../lib/erm/checkout";
import { intakeLane } from "../../../lib/erm/checkout-store";
import { balanceStatus, issueBalance } from "../../../lib/erm/balance-store";
import { paymentStatus } from "../../../lib/erm/payment-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const rateHits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = rateHits.get(ip) ?? [];
  const kept = hits.filter((t) => now - t < RATE_WINDOW_MS);
  kept.push(now);
  rateHits.set(ip, kept);
  return kept.length > RATE_MAX;
}

export async function POST(req: NextRequest) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "checkout_not_configured" }, { status: 503 });
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
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "bad_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  if (!isValidReference(b.reference)) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const reference = b.reference as string;
  // Scope agreement is the trigger for the balance. The caller must
  // attest it explicitly; a missing or false flag creates nothing.
  if (b.scopeAgreed !== true) {
    return NextResponse.json({ ok: false, error: "scope_not_agreed" }, { status: 400 });
  }
  const requestedLane =
    b.lane === undefined ? null : normalizeCheckoutLane(b.lane);
  if (b.lane !== undefined && requestedLane === null) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const found = await intakeLane(reference);
  if (found.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
  }
  if (found.status === "not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (found.status === "failed") {
    return NextResponse.json({ ok: false, error: "lookup_failed" }, { status: 503 });
  }
  const lane: BalanceLane = found.lane;
  if (requestedLane !== null && requestedLane !== lane) {
    return NextResponse.json({ ok: false, error: "lane_mismatch" }, { status: 400 });
  }
  // Discovery must be paid before the balance is issued: the balance
  // is the total minus the discovery fee already paid.
  const discovery = await paymentStatus(reference);
  if (discovery.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
  }
  if (discovery.status === "failed") {
    return NextResponse.json({ ok: false, error: "lookup_failed" }, { status: 503 });
  }
  if (!discovery.paid) {
    return NextResponse.json({ ok: false, error: "discovery_unpaid" }, { status: 402 });
  }
  // One balance payment per intake, ever.
  const existing = await balanceStatus(reference);
  if (existing.status === "found" && existing.paymentStatus === "paid") {
    return NextResponse.json({ ok: false, error: "balance_already_paid" }, { status: 409 });
  }
  if (existing.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
  }
  if (existing.status === "failed") {
    return NextResponse.json({ ok: false, error: "lookup_failed" }, { status: 503 });
  }
  const issued = await issueBalance({ reference, lane });
  if (issued.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (issued.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
  }
  if (issued.status === "failed") {
    return NextResponse.json({ ok: false, error: "balance_issue_failed" }, { status: 503 });
  }
  const siteUrl = process.env.MICRO_TITAN_SITE_URL ?? "https://micro-titan.com";
  const params = buildBalanceCheckoutSessionParams(reference, lane, siteUrl);
  const created = await createCheckoutSession(params, secret, fetch);
  if (!created.ok) {
    return NextResponse.json({ ok: false, error: "stripe_error" }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    url: created.url,
    sessionId: created.sessionId,
    reference,
    lane,
    amountCents: BALANCE_CHECKOUT_CENTS[lane],
    balance: issued.status,
  });
}
