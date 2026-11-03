/**
 * Micro Titan CRM write — Gap 1 (intake -> CRM closed loop).
 *
 * This module is deliberately narrow: it writes exactly one row to the
 * "Micro Titan CRM" Google Sheet, and nothing else. It never deletes,
 * moves, edits, or reorders existing rows, and it never touches any
 * other sheet or tab.
 *
 * Auth model (the only credential route for a Vercel serverless route):
 * a Google service account, NOT a personal Google account and NOT an
 * OAuth token for Bubba's account. Bubba must, by hand:
 *   1. In Google Cloud Console, create a project (or reuse one), enable
 *      the Google Sheets API, and create a service account.
 *   2. Create a JSON key for that service account and keep it private.
 *   3. Share the "Micro Titan CRM" sheet with the service account's
 *      email address as Editor.
 *   4. In Vercel (micro-titan-com, production + preview), set:
 *        GOOGLE_SERVICE_ACCOUNT_EMAIL
 *        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY   (the full key, \n as \n)
 *      CRM_SHEET_ID is optional: it defaults to the known CRM sheet id
 *      below, matching the existing INTAKE_TO_EMAIL default pattern.
 *      No credential is ever hardcoded or committed.
 *
 * Gating: if the service-account env vars are absent, the write is
 * SKIPPED (status "not_configured") and the caller must still return
 * success for the intake email itself. A CRM outage, a missing env
 * var, or a Sheets error must never lose an intake: the email to
 * hello@micro-titan.com is the primary record, the CRM row is the
 * secondary one, and a failed/skipped write is reported in the
 * response as `crm` so the manual fallback checklist can catch it.
 *
 * Idempotency: the reference column (Sheet1!A:A) is read first. If
 * the intake reference already exists, no second row is appended
 * (status "already_exists"). A retry with the same reference —
 * e.g. a visitor resubmitting, or a server retry — therefore cannot
 * create a duplicate CRM row. Note the form generates a fresh
 * reference per submission, so idempotency here covers server-side
 * retries and re-POSTs of the same payload, not two genuinely
 * separate intakes.
 *
 * No PII is logged by this module. Errors return a status string
 * only; the caller must not log the payload, the row, or any
 * provider error body.
 */

import { createSign } from "node:crypto";

export type Lane = "Family" | "Solo entrepreneur" | "Business";

export type IntakePayloadLike = {
  lane: Lane;
  name: string;
  email: string;
  phone: string;
  agent: string;
  plate: string;
  answers: { question: string; answer: string }[];
  reference: string;
};

export const CRM_COLUMNS = [
  "Intake reference",
  "Date received",
  "Name",
  "Contact (email/phone)",
  "Lane",
  "Agent preference",
  "What they want off their plate",
  "Discovery answers (verbatim)",
  "Discovery fee",
  "Program total",
  "Total after credit",
  "Monthly (optional)",
  "Status",
  "Next action",
  "Owner",
  "Discovery paid?",
  "Source",
  "Notes",
] as const;

// Approved lane totals, server-side only. These must match
// app/api/intake/route.ts exactly; the test pins both.
export const CRM_PRICING: Record<
  Lane,
  { discovery: string; total: string; afterCredit: string; monthly: string }
> = {
  Family: {
    discovery: "$150",
    total: "$1,650",
    afterCredit: "$1,500",
    monthly: "$95/month",
  },
  "Solo entrepreneur": {
    discovery: "$500",
    total: "$5,500",
    afterCredit: "$5,000",
    monthly: "$350/month",
  },
  Business: {
    discovery: "$1,000",
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

/** Default CRM sheet id (the "Micro Titan CRM" sheet). Overridable via CRM_SHEET_ID. */
export const DEFAULT_CRM_SHEET_ID =
  "1PDfmXlJieMGEoJgDjaI1cEaYm8lmBfaaDb8Cz48GFP4";

export function chicagoDate(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Build the exact 18-column CRM row for an intake. Pure: no I/O, so
 * its shape is pin-able in tests. Column order matches CRM_COLUMNS
 * and the verified Sheet1 header exactly.
 */
export function buildCrmRow(
  p: IntakePayloadLike,
  dateReceived = chicagoDate(),
): string[] {
  const pricing = CRM_PRICING[p.lane];
  const contact =
    p.email && p.phone
      ? `${p.email} / ${p.phone}`
      : p.email || p.phone || "(not provided)";
  const qs = QUESTIONS[p.lane];
  const answersVerbatim = qs
    .map((q, i) => {
      const a = p.answers[i];
      return `Q: ${q}\nA: ${a ? a.answer || "(left blank)" : "(left blank)"}`;
    })
    .join("\n\n");
  return [
    p.reference, // Intake reference
    dateReceived, // Date received
    p.name, // Name
    contact, // Contact (email/phone)
    p.lane, // Lane (verbatim lane string from the intake)
    p.agent, // Agent preference
    p.plate, // What they want off their plate
    answersVerbatim, // Discovery answers (verbatim)
    pricing.discovery, // Discovery fee
    pricing.total, // Program total
    pricing.afterCredit, // Total after credit
    pricing.monthly, // Monthly (optional)
    "Intake received", // Status
    "Completeness check", // Next action
    "", // Owner — assigned at the completeness check, not invented here
    "No", // Discovery paid?
    "micro-titan.com/intake", // Source
    "", // Notes
  ];
}

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export type CrmStatus = "written" | "already_exists" | "not_configured" | "failed";

export type CrmEnv = {
  sheetId?: string;
  sheetName?: string;
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string;
};

export function readCrmEnv(env: NodeJS.ProcessEnv = process.env): CrmEnv {
  return {
    sheetId: env.CRM_SHEET_ID || DEFAULT_CRM_SHEET_ID,
    sheetName: env.CRM_SHEET_NAME || "Sheet1",
    serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
    serviceAccountPrivateKey: (env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(
      /\\n/g,
      "\n",
    ),
  };
}

async function serviceAccountAccessToken(
  cfg: CrmEnv,
  fetchImpl: typeof fetch,
): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: cfg.serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${claim}`;
  let signature: string;
  try {
    signature = base64url(
      createSign("RSA-SHA256").update(unsigned).end().sign(cfg.serviceAccountPrivateKey as string),
    );
  } catch {
    return null;
  }
  let res: Response;
  try {
    res = await fetchImpl("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${unsigned}.${signature}`,
      }).toString(),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token || null;
}

/**
 * Append one intake row to the CRM sheet, idempotently on reference.
 * Never throws for a Sheets/token failure: those return "failed" so
 * the caller can still report the intake email as sent and flag the
 * CRM row for the manual fallback. `fetchImpl` is injectable so the
 * flow is testable without a Google credential.
 */
export async function appendIntakeRow(
  p: IntakePayloadLike,
  opts: { env?: CrmEnv; fetchImpl?: typeof fetch } = {},
): Promise<CrmStatus> {
  const cfg = opts.env ?? readCrmEnv();
  const fetchImpl = opts.fetchImpl ?? fetch;
  if (!cfg.serviceAccountEmail || !cfg.serviceAccountPrivateKey) {
    return "not_configured";
  }
  const token = await serviceAccountAccessToken(cfg, fetchImpl);
  if (!token) return "failed";
  const sheet = encodeURIComponent(cfg.sheetName as string);
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${cfg.sheetId}/values`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  // Idempotency: read column A first; skip the append if present.
  let existing: Response;
  try {
    existing = await fetchImpl(`${base}/${sheet}!A:A`, { headers });
  } catch {
    return "failed";
  }
  if (!existing.ok) return "failed";
  const existingData = (await existing.json()) as { values?: string[][] };
  const refs = (existingData.values || []).flat();
  if (refs.includes(p.reference)) return "already_exists";
  let appended: Response;
  try {
    appended = await fetchImpl(
      `${base}/${sheet}!A:R:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ values: [buildCrmRow(p)] }),
      },
    );
  } catch {
    return "failed";
  }
  return appended.ok ? "written" : "failed";
}
