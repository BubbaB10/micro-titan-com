/**
 * POST /api/stripe/monthly-checkout — P0 item 3: per-client
 * Checkout Session for the monthly operate-plan payment.
 *
 * The shared monthly payment links carry {lane, plan: "monthly"}
 * with no intake_type and no intake_reference, so a shared-link
 * monthly payment does NOT parse as a monthly event in the
 * webhook (PR #40) and cannot be linked to a client yet. This
 * route closes that gap, mirroring the Gap 5 balance-checkout
 * slice (PR #36, app/api/stripe/balance-checkout/route.ts).
 *
 * What this route does, in order:
 * - Takes { reference, lane? } only. No amount, no plan, no
 *   enrollment flag is accepted from the caller.
 * - The reference must be an existing intake (404 if unknown); a
 *   supplied lane that does not match the intake's recorded lane
 *   returns 400 — the intake's lane is the source of truth.
 * - If the current Chicago month is already paid for that intake
 *   (owner check GET /api/ops/monthly-status shows
 *   currentMonthPaid), returns 409 monthly_already_paid and
 *   creates nothing — one monthly payment per intake per month,
 *   ever. The webhook enforces the same rule on the record side
 *   (recordMonthlyPaid returns already_exists for a paid
 *   intake+month); this guard keeps the route from issuing a
 *   session a client could pay twice for the same month.
 * - Otherwise it creates ONE Stripe Checkout Session in payment
 *   mode for that lane's monthly price, with metadata
 *   intake_reference + lane + intake_type=monthly on both the
 *   session and the PaymentIntent, so the webhook links it.
 * - Returns only { ok, url, sessionId, reference, lane,
 *   amountCents, periodMonth } — periodMonth is the Chicago
 *   month this session is for. The caller shares `url` with the
 *   client; payment happens on Stripe's hosted page. This route
 *   does not surface the URL to a client anywhere itself.
 *
 * Enrollment gate: this route does NOT check whether the client
 * is enrolled on the operate plan, and it does NOT enroll anyone.
 * Enrollment stays an explicit owner action (POST
 * /api/ops/monthly-enroll, PR #40) — a payment never enrolls a
 * client. The owner only issues a monthly session for a client
 * they have enrolled; whether the route should also refuse a
 * non-enrolled intake is an open question for the owner, flagged
 * in the PR body, not a gate invented here.
 *
 * What this route deliberately does NOT do:
 * - It does not charge anyone itself, store card details, create
 *   a payment link, create a Stripe subscription, refund
 *   anything, or call any other Stripe API.
 * - It does not create a client or an intake, change an intake
 *   status, enroll anyone on the plan, book anything, send
 *   anything to a client, or log anyone in. There is no client
 *   login in this slice.
 * - It does not accept a caller-supplied amount, lane total, or
 *   price. Amounts come from LANE_PRICING via monthly-checkout.ts.
 *
 * Secrets: STRIPE_SECRET_KEY from env only, never hardcoded, never
 * logged, never in a response. Missing secret → 503 (nothing
 * created). Missing database → 503 erm_not_configured.
 *
 * Limits mirror the balance-checkout route: 64 KB body, 5
 * requests per IP per 15 minutes. No PII is logged. Stripe error
 * bodies are never echoed.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  MONTHLY_CHECKOUT_CENTS,
  buildMonthlyCheckoutSessionParams,
  type MonthlyLane,
} from "../../../lib/erm/monthly-checkout";
import { createCheckoutSession, isValidReference, normalizeCheckoutLane } from "../../../lib/erm/checkout";
import { intakeLane } from "../../../lib/erm/checkout-store";
import { chicagoMonth, monthlyStatus } from "../../../lib/erm/monthly-store";

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
  const lane: MonthlyLane = found.lane;
  if (requestedLane !== null && requestedLane !== lane) {
    return NextResponse.json({ ok: false, error: "lane_mismatch" }, { status: 400 });
  }
  // One monthly payment per intake per month, ever. If the current
  // Chicago month is already paid, issue no session — a second
  // payment for the same month would be recorded as already_exists
  // by the webhook, with the money taken and no new record.
  // "not_found" (never enrolled, never paid) is not a block: the
  // owner triggers this route, and enrollment is a separate
  // explicit owner action, not a precondition invented here.
  const paid = await monthlyStatus(reference);
  if (paid.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
  }
  if (paid.status === "failed") {
    return NextResponse.json({ ok: false, error: "lookup_failed" }, { status: 503 });
  }
  if (paid.status === "found" && paid.currentMonthPaid) {
    return NextResponse.json({ ok: false, error: "monthly_already_paid" }, { status: 409 });
  }
  const siteUrl = process.env.MICRO_TITAN_SITE_URL ?? "https://micro-titan.com";
  const params = buildMonthlyCheckoutSessionParams(reference, lane, siteUrl);
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
    amountCents: MONTHLY_CHECKOUT_CENTS[lane],
    periodMonth: chicagoMonth(),
  });
}
