/**
 * POST /api/ops/followup-log — owner-only log of a follow-up the
 * owner actually did, by hand.
 *
 * Gap 6, logging only. This route RECORDS a follow-up; it does not
 * send one. There is no email, SMS, or call in this route, and no
 * sender is created. The owner (Boone/Bubba) calls it after doing
 * a follow-up manually — replying to an intake email, texting a
 * prospect, or calling them — so the follow-up leaves a checkable
 * record in the ERM with an audit row, instead of living only in
 * the Sheet or in memory.
 *
 * Same token gate as /api/ops/summary and
 * /api/ops/presentation-status: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503 ops_not_configured.
 * Wrong token -> 401. Missing database -> 503 not_configured.
 *
 * Body: { reference, step: "day1" | "day3" | "day7" | "day14",
 *   channel: "email" | "text" | "call" | "manual_note",
 *   note?: string, actor?: string }
 * step is the follow-up step being logged (which day of the
 * sequence this follow-up was), not a promise about the next one.
 * Unknown reference -> 404 intake_not_found, writes nothing.
 * A step already logged for the intake -> 200 already_exists,
 * no duplicate row. Logging "day14" does NOT close the intake:
 * the owner closes it as a separate, owner-approved step.
 */

import { NextResponse } from "next/server";
import { recordFollowUp } from "../../../lib/erm/followup-store";
import type { FollowUpChannel, FollowUpStep } from "../../../lib/erm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STEPS: ReadonlyArray<string> = ["day1", "day3", "day7", "day14"];
const VALID_CHANNELS: ReadonlyArray<string> = ["email", "text", "call", "manual_note"];

export async function POST(req: Request) {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ops_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const reference = typeof b.reference === "string" ? b.reference : "";
  const step = typeof b.step === "string" ? b.step : "";
  const channel = typeof b.channel === "string" ? b.channel : "";
  const note = typeof b.note === "string" ? b.note : "";
  const actor = typeof b.actor === "string" ? b.actor : "owner";
  if (reference.length === 0 || reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  if (!VALID_STEPS.includes(step)) {
    return NextResponse.json({ ok: false, error: "bad_step" }, { status: 400 });
  }
  if (!VALID_CHANNELS.includes(channel)) {
    return NextResponse.json({ ok: false, error: "bad_channel" }, { status: 400 });
  }
  const result = await recordFollowUp(reference, {
    step: step as FollowUpStep,
    channel: channel as FollowUpChannel,
    note,
    actor,
  });
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "followup_log_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "already_exists") {
    return NextResponse.json({
      ok: true,
      reference,
      erm: "already_exists",
      followUpId: result.followUpId,
      step: result.step,
      channel: result.channel,
    });
  }
  return NextResponse.json({
    ok: true,
    reference,
    erm: "written",
    followUpId: result.followUpId,
    step: result.step,
    channel: result.channel,
  });
}
