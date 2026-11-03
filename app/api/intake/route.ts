import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

/**
 * Server-side Micro Titan intake submission.
 *
 * One tap on /intake, no second Send in the visitor's email app.
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
 * The /intake form then falls back to its existing mailto draft, so a
 * missing key or a backend outage never loses an intake.
 *
 * No CRM write happens in this route. CRM logging stays manual:
 * hello@ -> CRM row (see the PR description). No prospect data is stored
 * by this route, and no PII is logged.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANES = ["Family", "Solo entrepreneur", "Business"] as const;
type Lane = (typeof LANES)[number];

const AGENTS = [
  "Muse by Meta",
  "Grok Bot by Grok",
  "Claude by Anthropic",
  "Gemini by Google",
  "Help me choose in discovery",
] as const;

const PRICING: Record<
  Lane,
  { discovery: string; setup: string; first: string; firstLabel: string; total: string; afterCredit: string; monthly: string }
> = {
  Family: {
    discovery: "$150",
    setup: "$750",
    first: "$750",
    firstLabel: "First household project",
    total: "$1,650",
    afterCredit: "$1,500",
    monthly: "$95/month",
  },
  "Solo entrepreneur": {
    discovery: "$500",
    setup: "$1,500",
    first: "$3,500",
    firstLabel: "First workflow",
    total: "$5,500",
    afterCredit: "$5,000",
    monthly: "$350/month",
  },
  Business: {
    discovery: "$1,000",
    setup: "$2,500",
    first: "$6,500",
    firstLabel: "First job-flow project",
    total: "$10,000",
    afterCredit: "$9,000",
    monthly: "$950/month",
  },
};

const QUESTIONS: Record<Lane, string[]> = {
  Family: [
    "What household jobs eat up your evenings or weekends right now?",
    "How do you handle bills, appointments, and school or family dates today?",
    "What calendar, inbox, or apps do you already use?",
    "Is there a trip, move, or property task coming up we should know about?",
    "What should an agent never do without your approval first?",
    "Anything else we should know before discovery?",
  ],
  "Solo entrepreneur": [
    "Where do your leads come from today?",
    "What happens to a lead between first contact and booking?",
    "How do you handle your inbox and calendar today?",
    "What bookkeeping or receipts work takes up your time?",
    "Would a morning brief help, and what would it need to cover?",
    "What should an agent never do without your approval first?",
  ],
  Business: [
    "How does a job get taken in today, from first contact to the shop floor?",
    "How do you decide how a job is routed or scheduled?",
    "How is art or proof approval handled with the customer today?",
    "How do you keep the production schedule and the customer updated?",
    "What would a daily brief need to cover for you?",
    "What should an agent never do without your approval first?",
  ],
};

// --- Limits (deliberately tight: an intake is a short form, not a file) ---
const MAX_BODY_BYTES = 64 * 1024;
const MAX_NAME = 200;
const MAX_CONTACT = 254;
const MAX_PHONE = 50;
const MAX_PLATE = 2000;
const MAX_ANSWER = 2000;
const MAX_ANSWERS = 6;

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

function makeReference(): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const code = randomBytes(3)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "0");
  return `MT-${date}-${code}`;
}

function isValidReference(v: unknown): v is string {
  return typeof v === "string" && /^MT-\d{8}-[A-Z0-9]{4}$/.test(v);
}

type Answer = { question: string; answer: string };

export type IntakePayload = {
  lane: Lane;
  name: string;
  email: string;
  phone: string;
  agent: string;
  plate: string;
  answers: Answer[];
  reference: string;
};

function asString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length <= max ? t : null;
}

/** Validate an intake payload. Returns field -> message, empty = valid. */
export function validateIntake(body: unknown): { errors: Record<string, string>; payload: IntakePayload | null } {
  const errors: Record<string, string> = {};
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { errors: { form: "Invalid intake submission." }, payload: null };
  }
  const b = body as Record<string, unknown>;

  // Honeypot: a real visitor never fills this (it is visually hidden).
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return { errors: { form: "Submission rejected." }, payload: null };
  }

  const lane = b.lane;
  if (typeof lane !== "string" || !(LANES as readonly string[]).includes(lane)) {
    errors.lane = "Pick a lane: Family, Solo entrepreneur, or Business.";
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
  const agent = asString(b.agent, 100);
  if (!agent || !(AGENTS as readonly string[]).includes(agent)) {
    errors.agent = "Pick an agent preference, or 'Help me choose in discovery'.";
  }
  const plate = asString(b.plate, MAX_PLATE);
  if (!plate) errors.plate = "What you most want taken off your plate is required.";

  let answers: Answer[] = [];
  if (b.answers !== undefined) {
    if (!Array.isArray(b.answers) || b.answers.length > MAX_ANSWERS) {
      errors.answers = "Discovery answers are not in the expected format.";
    } else {
      for (const [i, a] of b.answers.entries()) {
        if (typeof a !== "object" || a === null || Array.isArray(a)) {
          errors.answers = "Discovery answers are not in the expected format.";
          break;
        }
        const q = asString((a as Record<string, unknown>).question, 500);
        const ans = asString((a as Record<string, unknown>).answer, MAX_ANSWER);
        if (q === null || ans === null) {
          errors.answers = `Discovery answer ${i + 1} is too long or malformed.`;
          break;
        }
        answers.push({ question: q, answer: ans });
      }
    }
  }
  // Answers must match this lane's questions when provided; extra/mismatched
  // questions are rejected rather than silently stored.
  if (Object.keys(errors).length === 0 && answers.length > 0 && typeof lane === "string" && (LANES as readonly string[]).includes(lane)) {
    const expected = QUESTIONS[lane as Lane];
    const ok = answers.every((a, i) => a.question === expected[i]);
    if (!ok) errors.answers = "Discovery answers do not match this lane's questions.";
  }

  if (Object.keys(errors).length > 0) return { errors, payload: null };

  const reference = isValidReference(b.reference) ? (b.reference as string) : makeReference();
  return {
    errors: {},
    payload: {
      lane: lane as Lane,
      name: name as string,
      email,
      phone,
      agent: agent as string,
      plate: plate as string,
      answers,
      reference,
    },
  };
}

export function buildEmailBody(p: IntakePayload): string {
  const pricing = PRICING[p.lane];
  const lines: string[] = [
    `Micro Titan intake — ${p.lane}`,
    `Reference: ${p.reference}`,
    "",
    `Name: ${p.name}`,
    `Email: ${p.email || "(not provided)"}`,
    `Phone: ${p.phone || "(not provided)"}`,
    `Agent preference: ${p.agent}`,
    "",
    "What they most want taken off their plate:",
    p.plate,
    "",
    "Discovery answers (verbatim, as typed):",
  ];
  const qs = QUESTIONS[p.lane];
  for (let i = 0; i < qs.length; i++) {
    const a = p.answers[i];
    lines.push("", `Q: ${qs[i]}`, `A: ${a ? a.answer || "(left blank)" : "(left blank)"}`);
  }
  lines.push(
    "",
    `PRICING — ${p.lane}`,
    `Discovery fee: ${pricing.discovery} (credited toward the program total)`,
    `Setup: ${pricing.setup}`,
    `${pricing.firstLabel}: ${pricing.first}`,
    `Program total: ${pricing.total} / ${pricing.afterCredit} after discovery credit`,
    `Optional monthly plan: ${pricing.monthly} (optional, not part of the total)`,
    "",
    "Notes: The discovery fee is credited toward the program total. The monthly plan is optional. Filling out this intake charges nothing — sending it starts the process, it does not charge you.",
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

  const { errors, payload } = validateIntake(body);
  if (!payload) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // Rate limit AFTER validation, so a bot hammering invalid payloads does
  // not burn the budget of a real visitor behind the same IP — but a
  // valid-payload flood still stops at the limit.
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many intakes from this address. Please try again in a few minutes, or use the email fallback on the form." },
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
  const subject = `Micro Titan intake — ${payload.lane} — ${payload.reference}`;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text: buildEmailBody(payload) }),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "email_send_failed", message: "Could not send the intake just now. Please use the email fallback on the form." },
      { status: 502 },
    );
  }
  if (!res.ok) {
    // Never echo the provider's error body: it can contain account details.
    return NextResponse.json(
      { ok: false, error: "email_send_failed", message: "Could not send the intake just now. Please use the email fallback on the form." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, reference: payload.reference });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
