/**
 * POST /api/pitch/generate — generate a DRAFT pitch sheet from a
 * completed intake's verbatim answers.
 *
 * What this route does:
 * - Takes { reference, name, lane, plate, answers, agentPreference }
 *   and returns the deterministic draft sheet from
 *   app/lib/erm/pitch.ts (lane pricing, verbatim plate/answers,
 *   example cards drawn only from the /use-cases library).
 * - When ERM_DATABASE_URL is set and the reference already exists as
 *   an intake, it also records one PitchSheet row (status "draft")
 *   plus an AuditLog row via app/lib/erm/pitch-store.ts. A second
 *   generation for the same reference returns the existing draft —
 *   no duplicate row.
 *
 * What this route deliberately does NOT do:
 * - It does not publish anything at a public /pitch URL. A public
 *   sheet is a separate step: one new entry in the PR #23 shared
 *   template, on the owner's explicit go.
 * - It does not send anything to a client or prospect, by email or
 *   otherwise. There is no mail step in this route at all.
 * - It does not mark a sheet sent or agreed, book anything, or
 *   charge anything. Status is always "draft" at generation time;
 *   the Boone check gates every later step.
 * - It does not require a live database row to generate: with the
 *   database absent, it returns the draft with erm: "not_configured"
 *   (email-only mode, same fallback pattern as the intake route).
 *
 * Limits mirror the intake route: 64 KB body, 5 requests per IP per
 * 15 minutes, tight field caps. No PII is logged.
 */

import { NextResponse, type NextRequest } from "next/server";
import { generatePitchSheet, type PitchAnswer } from "../../../lib/erm/pitch";
import { recordPitchSheet } from "../../../lib/erm/pitch-store";
import { LANE_PRICING, type Lane } from "../../../lib/erm/types";
import { USE_CASES } from "../../../use-cases/use-cases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANES = ["Family", "Solo entrepreneur", "Business"] as const;

const MAX_BODY_BYTES = 64 * 1024;
const MAX_NAME = 200;
const MAX_PLATE = 2000;
const MAX_ANSWER = 2000;
const MAX_ANSWERS = 6;

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

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
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
  const reference = b.reference;
  const name = b.name;
  const lane = b.lane;
  if (
    !isString(reference) ||
    reference.length === 0 ||
    reference.length > 50 ||
    !isString(name) ||
    name.length === 0 ||
    name.length > MAX_NAME ||
    !isString(lane) ||
    !(LANES as readonly string[]).includes(lane)
  ) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const plate = isString(b.plate) ? b.plate : "";
  if (plate.length > MAX_PLATE) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const rawAnswers = Array.isArray(b.answers) ? b.answers : [];
  if (rawAnswers.length > MAX_ANSWERS) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const answers: PitchAnswer[] = [];
  for (const entry of rawAnswers) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
    }
    const e = entry as Record<string, unknown>;
    if (!isString(e.question) || !isString(e.answer) || e.answer.length > MAX_ANSWER) {
      return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
    }
    answers.push({ question: e.question, answer: e.answer });
  }
  const agentPreference = isString(b.agentPreference) ? b.agentPreference : "";

  const sheet = generatePitchSheet(
    {
      reference,
      name,
      lane: lane as Lane,
      agentPreference,
      plate,
      answers,
    },
    { pricing: LANE_PRICING, useCases: USE_CASES },
  );

  const recorded = await recordPitchSheet(reference, sheet);
  const storedSheet =
    recorded.status === "already_exists" ? recorded.content : sheet;

  return NextResponse.json({
    ok: true,
    reference,
    status: "draft",
    erm: recorded.status,
    pitchSheetId:
      recorded.status === "written" || recorded.status === "already_exists"
        ? recorded.pitchSheetId
        : null,
    published: false,
    sent: false,
    sheet: storedSheet,
  });
}
