import { NextResponse, type NextRequest } from "next/server";
import { recordAgreement } from "../../lib/erm/agreement-store";

/**
 * Server-side Micro Titan Scope & Terms agreement acceptance.
 *
 * One tap on /accept-agreement, no second Send in the visitor's email app.
 * Mirrors app/api/intake/route.ts (merged PR #20) and
 * app/api/book-discovery/route.ts (merged PR #21) exactly in behaviour:
 * destination, validation style, limits, fallback semantics.
 *
 * Destination is unchanged: hello@micro-titan.com.
 *
 * Email is sent ONLY via the Resend API, configured ONLY through env vars:
 *   RESEND_API_KEY       — required. Never hardcoded, never committed.
 *   INTAKE_FROM_EMAIL    — optional. Must be a sender verified in Resend
 *                          (e.g. intake@micro-titan.com). Defaults to
 *                          Resend's onboarding sender, which can only send
 *                          to the Resend account owner — so a verified
 *                          sender is required before this route is useful
 *                          in production.
 *   INTAKE_TO_EMAIL      — optional, defaults to hello@micro-titan.com.
 *
 * If RESEND_API_KEY is not set, the route returns 503
 * { ok: false, error: "email_service_not_configured" } and sends nothing.
 * The /accept-agreement form then falls back to its existing mailto draft,
 * so a missing key or a backend outage never loses an acceptance.
 *
 * Acceptance is NOT a legal e-signature. That disclaimer is kept on the
 * page and in the email.
 *
 * ERM logging (Gap 2, second half): after the email sends, the route
 * also records the acceptance in the ERM via
 * app/lib/erm/agreement-store.ts — one Agreements row plus one
 * AuditLog row, idempotent by intake reference, lane totals from
 * this route's approved LANE_TOTALS (dollars x 100 = cents, never
 * from client-supplied totals).
 * If the database is absent or the write fails, the acceptance is
 * still ok: true with the email as the record, and the response
 * reports erm: "not_configured" / "failed" / "intake_not_found"
 * instead of hiding it. No PII is logged.
 *
 * Lane totals are derived server-side from the approved pricing below.
 * The client never supplies totals, so a tampered form cannot misstate
 * the totals that were accepted.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANES = ["Family", "Solo entrepreneur", "Business"] as const;
type Lane = (typeof LANES)[number];

// Approved pricing, exactly as on the Scope & Terms page:
// discovery fee credited / program total / after-credit total / monthly optional.
export const LANE_TOTALS: Record<Lane, { discovery: number; total: number; afterCredit: number; monthly: number }> = {
  Family: { discovery: 150, total: 1650, afterCredit: 1500, monthly: 95 },
  "Solo entrepreneur": { discovery: 500, total: 5500, afterCredit: 5000, monthly: 350 },
  Business: { discovery: 1000, total: 10000, afterCredit: 9000, monthly: 950 },
};

function money(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

// --- Limits (deliberately tight: an acceptance is a short form) ---
const MAX_BODY_BYTES = 64 * 1024;
const MAX_REFERENCE = 50;
const MAX_NAME = 200;
const MAX_DATE = 50;
const MAX_SIGNATURE = 500;

// Rate limiting: in-memory, per IP. This is a best-effort guard on a
// serverless route (each instance has its own map), not a substitute for
// provider-level abuse protection. It stops casual form spam, it does not
// claim to stop a distributed flood.
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

export type AgreementPayload = {
  reference: string;
  name: string;
  lane: Lane;
  date: string;
  signature: string;
};

function asString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length <= max ? t : null;
}

/** Validate an acceptance payload. Returns field -> message, empty = valid. */
export function validateAgreement(body: unknown): { errors: Record<string, string>; payload: AgreementPayload | null } {
  const errors: Record<string, string> = {};
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { errors: { form: "Invalid acceptance." }, payload: null };
  }
  const b = body as Record<string, unknown>;

  // Honeypot: a real visitor never fills this (it is visually hidden).
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return { errors: { form: "Submission rejected." }, payload: null };
  }

  const reference = asString(b.reference, MAX_REFERENCE);
  if (!reference || !/^MT-\d{8}-[A-Z0-9]{4}$/.test(reference)) {
    errors.reference = "Intake reference is required, for example MT-20261102-AB12.";
  }
  const name = asString(b.name, MAX_NAME);
  if (!name) errors.name = "Client name is required.";
  const lane = b.lane;
  if (typeof lane !== "string" || !(LANES as readonly string[]).includes(lane)) {
    errors.lane = "Pick a lane: Family, Solo entrepreneur, or Business.";
  }
  const dateRaw = asString(b.date, MAX_DATE);
  if (!dateRaw || Number.isNaN(Date.parse(dateRaw))) {
    errors.date = "A valid date is required.";
  }
  const signatureRaw = asString(b.signature, MAX_SIGNATURE);
  if (b.signature !== undefined && b.signature !== null && b.signature !== "" && signatureRaw === null) {
    errors.signature = "Signature text is too long.";
  }
  // The client must confirm they have read the Scope & Terms.
  if (b.readTerms !== true) {
    errors.readTerms = "Please confirm you have read the Micro Titan Scope and Terms before accepting.";
  }

  if (Object.keys(errors).length > 0) return { errors, payload: null };

  return {
    errors: {},
    payload: {
      reference: reference as string,
      name: name as string,
      lane: lane as Lane,
      date: dateRaw as string,
      signature: signatureRaw ?? "",
    },
  };
}

export function payLinkForReference(reference: string): string {
  const base = (process.env.MICRO_TITAN_SITE_URL ?? "https://micro-titan.com").replace(/\/+$/, "");
  return `${base}/pay?reference=${encodeURIComponent(reference)}`;
}

export function buildEmailBody(p: AgreementPayload): string {
  const totals = LANE_TOTALS[p.lane];
  const lines: string[] = [
    "I have read and accept the Micro Titan Scope & Terms — Agent Setup for the lane below.",
    "",
    `Intake reference: ${p.reference}`,
    `Client name: ${p.name}`,
    `Lane: ${p.lane}`,
    `Date: ${p.date}`,
    `Discovery fee (credited): ${money(totals.discovery)}`,
    `Program total: ${money(totals.total)}`,
    `Total after credit: ${money(totals.afterCredit)}`,
    `Monthly (optional): ${money(totals.monthly)}/mo`,
  ];
  if (p.signature) {
    lines.push("", `Typed signature/acceptance text (typed text, not a legal e-signature): ${p.signature}`);
  }
  lines.push(
    "",
    "Next step — pay the discovery fee, credited toward the program total, before booking discovery:",
    payLinkForReference(p.reference),
    "",
    "This is not claimed as a legal e-signature. Nothing typed on the acceptance page is saved by the page itself.",
    "Acceptance is captured by this email plus a record in the Micro Titan ERM, logged against the intake reference.",
  );
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "could_not_read_body" }, { status: 400 });
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { errors, payload } = validateAgreement(body);
  if (!payload) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // Rate limit AFTER validation, so a bot hammering invalid payloads does
  // not burn the budget of a real visitor behind the same IP — but a
  // valid-payload flood still stops at the limit.
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many acceptances from this address. Please try again in a few minutes, or use the email fallback on the form." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Deliberate: no fallback send path, no hardcoded key, no silent drop.
    // The frontend falls back to mailto in this case.
    return NextResponse.json(
      { ok: false, error: "email_service_not_configured", message: "Email service is not configured yet. Please use the email fallback on the form." },
      { status: 503 },
    );
  }

  const to = process.env.INTAKE_TO_EMAIL || "hello@micro-titan.com";
  const from = process.env.INTAKE_FROM_EMAIL || "Micro Titan Intake <onboarding@resend.dev>";
  const subject = `Agreement accepted — ${payload.reference}`;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text: buildEmailBody(payload) }),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "email_send_failed", message: "Could not send the acceptance just now. Please use the email fallback on the form." },
      { status: 502 },
    );
  }
  if (!res.ok) {
    // Never echo the provider's error body: it can contain account details.
    return NextResponse.json(
      { ok: false, error: "email_send_failed", message: "Could not send the acceptance just now. Please use the email fallback on the form." },
      { status: 502 },
    );
  }

  // ERM logging, after the proven email send: the email remains the
  // record if the database is absent, the write fails, or the intake
  // reference is unknown in the ERM. None of those turns a sent
  // acceptance into a failure, and none is hidden: the response
  // reports the ERM result either way.
  const totals = LANE_TOTALS[payload.lane];
  const erm = await recordAgreement({
    reference: payload.reference,
    lane: payload.lane,
    signatureText: payload.signature,
    method: "site",
    discoveryCents: totals.discovery * 100,
    totalCents: totals.total * 100,
    afterCreditCents: totals.afterCredit * 100,
    monthlyCents: totals.monthly * 100,
  });
  if (erm.status === "written" || erm.status === "already_exists") {
    return NextResponse.json({
      ok: true,
      reference: payload.reference,
      erm: erm.status,
      agreementId: erm.agreementId,
    });
  }
  return NextResponse.json({
    ok: true,
    reference: payload.reference,
    erm: erm.status,
  });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
