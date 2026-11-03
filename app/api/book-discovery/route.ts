import { NextResponse, type NextRequest } from "next/server";

/**
 * Server-side Micro Titan discovery booking request.
 *
 * One tap on /book-discovery, no second Send in the visitor's email app.
 * Mirrors app/api/intake/route.ts (merged PR #20) exactly in behaviour:
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
 * The /book-discovery form then falls back to its existing mailto draft, so
 * a missing key or a backend outage never loses a booking request.
 *
 * Preferred times are preferences only, not confirmed availability.
 * This route does NOT book a calendar slot. No CRM write happens here.
 * CRM logging stays manual. No prospect data is stored by this route,
 * and no PII is logged.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANES = ["Family", "Solo entrepreneur", "Business"] as const;
type Lane = (typeof LANES)[number];

// --- Limits (deliberately tight: a booking request is a short form) ---
const MAX_BODY_BYTES = 64 * 1024;
const MAX_REFERENCE = 50;
const MAX_NAME = 200;
const MAX_CONTACT = 254;
const MAX_PHONE = 50;
const MAX_PREFERRED = 200;
const MAX_PREFERRED_COUNT = 3;

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

export type BookDiscoveryPayload = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  lane: Lane;
  preferred: string[];
};

function asString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length <= max ? t : null;
}

/** Validate a booking request payload. Returns field -> message, empty = valid. */
export function validateBookDiscovery(body: unknown): { errors: Record<string, string>; payload: BookDiscoveryPayload | null } {
  const errors: Record<string, string> = {};
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { errors: { form: "Invalid booking request." }, payload: null };
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
  if (!name) errors.name = "Full name is required.";
  const emailRaw = asString(b.email, MAX_CONTACT);
  const email = emailRaw ?? "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That email address does not look valid.";
  }
  const phoneRaw = asString(b.phone, MAX_PHONE);
  const phone = phoneRaw ?? "";
  if (!email && !phone) errors.contact = "Email or phone — at least one is required.";
  const lane = b.lane;
  if (typeof lane !== "string" || !(LANES as readonly string[]).includes(lane)) {
    errors.lane = "Pick a lane: Family, Solo entrepreneur, or Business.";
  }

  let preferred: string[] = [];
  if (!Array.isArray(b.preferred) || b.preferred.length === 0 || b.preferred.length > MAX_PREFERRED_COUNT) {
    errors.preferred = "Give up to 3 preferred date/times; the first one is required.";
  } else {
    for (const [i, p] of b.preferred.entries()) {
      const v = asString(p, MAX_PREFERRED);
      if (v === null) {
        errors.preferred = `Preferred date/time ${i + 1} is too long or malformed.`;
        break;
      }
      preferred.push(v);
    }
    if (!errors.preferred && !preferred[0]) {
      errors.preferred = "Preferred date/time 1 is required.";
    }
  }

  if (Object.keys(errors).length > 0) return { errors, payload: null };

  return {
    errors: {},
    payload: {
      reference: reference as string,
      name: name as string,
      email,
      phone,
      lane: lane as Lane,
      preferred,
    },
  };
}

export function buildEmailBody(p: BookDiscoveryPayload): string {
  const lines: string[] = [
    `Discovery booking request — ${p.reference}`,
    "",
    `Intake reference: ${p.reference}`,
    `Name: ${p.name}`,
    `Email: ${p.email || "(not provided)"}`,
    `Phone: ${p.phone || "(not provided)"}`,
    `Lane: ${p.lane}`,
    "",
    "Preferred date/times (America/Chicago) — preferences only, not confirmed availability:",
    `1: ${p.preferred[0] || "(left blank)"}`,
    `2: ${p.preferred[1] || "(left blank)"}`,
    `3: ${p.preferred[2] || "(left blank)"}`,
    "",
    "Notes: Preferred times are preferences only, not confirmed availability. This request does not book a calendar slot.",
  ];
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

  const { errors, payload } = validateBookDiscovery(body);
  if (!payload) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // Rate limit AFTER validation, so a bot hammering invalid payloads does
  // not burn the budget of a real visitor behind the same IP — but a
  // valid-payload flood still stops at the limit.
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many booking requests from this address. Please try again in a few minutes, or use the email fallback on the form." },
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
  const subject = `Discovery booking request — ${payload.reference}`;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text: buildEmailBody(payload) }),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "email_send_failed", message: "Could not send the booking request just now. Please use the email fallback on the form." },
      { status: 502 },
    );
  }
  if (!res.ok) {
    // Never echo the provider's error body: it can contain account details.
    return NextResponse.json(
      { ok: false, error: "email_send_failed", message: "Could not send the booking request just now. Please use the email fallback on the form." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, reference: payload.reference });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
