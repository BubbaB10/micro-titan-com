/**
 * GET /api/ops/followup-status?reference=MT-... — owner check.
 *
 * Answers, for ONE intake reference: how many days since the
 * intake, which follow-up steps have been logged, and which step,
 * if any, is next due (Day 1 / 3 / 7 / 14, by calendar day in
 * America/Chicago). This is the owner's view of the follow-up
 * audit trail: it shows what was done and what is due, so the
 * owner can do the follow-up by hand. It sends nothing.
 *
 * Same token gate as /api/ops/summary and
 * /api/ops/presentation-status: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database -> 503
 * not_configured.
 *
 * Returns references, lane, and steps only — no names, no answers,
 * no contact details. This is Bubba/Boone only, NOT a client
 * login.
 */

import { NextResponse } from "next/server";
import { followUpStatus } from "../../../lib/erm/followup-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ops_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") ?? "";
  if (reference.length === 0 || reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  const result = await followUpStatus(reference);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "followup_status_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    reference,
    intakeStatus: result.intakeStatus,
    lane: result.lane,
    daysSinceIntake: result.daysSinceIntake,
    logged: result.logged,
    nextDue: result.nextDue,
    nextDueReason: result.nextDueReason,
  });
}
