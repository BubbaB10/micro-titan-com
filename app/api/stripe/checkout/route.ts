/**
 * POST /api/stripe/checkout — Gap 3 follow-up: per-client Checkout
 * Session for the discovery fee.
 *
 * What this route does:
 * - Takes { reference, lane? } only. The reference must be an existing
 *   intake (MT-YYYYMMDD-XXXX); an unknown reference returns 404 and
 *   creates nothing. A supplied lane that does not match the intake's
 *   recorded lane returns 400 — the intake's lane is the source of
 *   truth, never the caller's claim.
 * - Creates ONE Stripe Checkout Session in payment mode for that
 *   lane's discovery fee (Family $150 / Solo entrepreneur $500 /
 *   Business $1,000, exact cents, via price_data — see
 *   app/lib/erm/checkout.ts for why price IDs are not reused here).
 * - The session carries metadata intake_reference + lane +
 *   intake_type=discovery on BOTH the session and, via
 *   payment_intent_data.metadata, the underlying PaymentIntent, so
 *   both checkout.session.completed and payment_intent.succeeded
 *   events link automatically in the PR #30 webhook.
 * - Returns only { ok, url, sessionId, reference, lane, amountCents }.
 *   The caller redirects the client to `url`; payment happens on
 *   Stripe's hosted page.
 *
 * What this route deliberately does NOT do:
 * - It does not charge anyone itself, store card details, create a
 *   payment link, refund anything, or call any other Stripe API.
 * - It does not create a client or an intake, change an intake
 *   status, book anything, send anything to a client, or log anyone
 *   in. There is no client login in this slice.
 * - It does not surface the session URL to a client anywhere (no
 *   /pay page, no link in the agreement confirmation). Surfacing is
 *   the flagged next step; this slice is the session-creation
 *   endpoint only.
 *
 * Secrets: STRIPE_SECRET_KEY from env only, never hardcoded, never
 * logged, never in a response. Missing secret → 503 (nothing created).
 * Missing database → 503 erm_not_configured (the reference cannot be
 * verified without it, so nothing is created on an unverified claim).
 *
 * Limits mirror the pitch route: 64 KB body, 5 requests per IP per
 * 15 minutes. No PII is logged. Stripe error bodies are never echoed.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  buildCheckoutSessionParams,
  CHECKOUT_CENTS,
  createCheckoutSession,
  isValidReference,
  normalizeCheckoutLane,
  type CheckoutLane,
} from "../../../lib/erm/checkout";
import { intakeLane } from "../../../lib/erm/checkout-store";

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
  const hits = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  rateHits.set(ip, hits);
  return hits.length > RATE_MAX;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
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
  const lane: CheckoutLane = found.lane;
  if (requestedLane !== null && requestedLane !== lane) {
    return NextResponse.json({ ok: false, error: "lane_mismatch" }, { status: 400 });
  }
  const siteUrl = process.env.MICRO_TITAN_SITE_URL ?? "https://micro-titan.com";
  const params = buildCheckoutSessionParams(reference, lane, siteUrl);
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
    amountCents: CHECKOUT_CENTS[lane],
  });
}
