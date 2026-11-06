/**
 * GET /api/ops/monthly-due — Gap 9 owner check: which clients
 * on the monthly operate plan have NOT paid the current month.
 *
 * The owner view for monthly billing: active plans whose
 * current Chicago month has no paid monthly row. It sends
 * nothing to any client and it does not change any intake or
 * subscription — the follow-up itself is done by hand, and a
 * payment is recorded only when Stripe reports one.
 *
 * Same token gate as /api/ops/summary: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database ->
 * 503 not_configured.
 *
 * Returns references, lanes, amounts, the due month, and last
 * paid month only — no names, no answers, no contact details.
 * Bubba/Boone only, NOT a client login.
 */

import { NextResponse } from "next/server";
import { monthlyDue } from "../../../lib/erm/monthly-store";

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
  const result = await monthlyDue();
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "monthly_due_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, due: result.due, count: result.due.length });
}
