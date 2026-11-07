/**
 * GET /api/ops/followups-due — owner check: which intakes are due
 * a follow-up step right now.
 *
 * This is the ERM replacement for the daily follow-up reminder
 * cron's Sheet read. The scheduled job is GET /api/cron/followups
 * (vercel.json). It loads this same due list and returns it to
 * the owner. It sends nothing to any prospect, and it does not
 * change any intake. This route stays the owner check.
 * The follow-up itself is still done by hand by the owner, and
 * logged through POST /api/ops/followup-log.
 *
 * Same token gate as /api/ops/summary: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database -> 503
 * not_configured.
 *
 * Returns references, lanes, intake statuses, and steps only —
 * no names, no answers, no contact details. Bubba/Boone only,
 * NOT a client login.
 */

import { NextResponse } from "next/server";
import { followUpsDue } from "../../../lib/erm/followup-store";

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
  const result = await followUpsDue();
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "followups_due_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, due: result.due, count: result.due.length });
}
