/**
 * GET /api/ops/monthly-status?reference=MT-... — Gap 9 owner check.
 *
 * Answers, for ONE intake reference: is the client on the
 * monthly operate plan, for how much, which months are paid,
 * and is the current month paid? Same token gate as
 * /api/ops/summary: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database ->
 * 503 not_configured.
 *
 * Returns no names, no intake details, no contact details, no
 * Stripe ids — only lane, amount in cents, plan status, paid
 * months, last paid month, and whether the current month is
 * paid, for the requested reference. This is Bubba/Boone only,
 * NOT a client login.
 */

import { NextResponse } from "next/server";
import { monthlyStatus } from "../../../lib/erm/monthly-store";

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
  const result = await monthlyStatus(reference);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "monthly_status_failed" }, { status: 502 });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ ok: true, reference, enrolled: false });
  }
  return NextResponse.json({
    ok: true,
    reference,
    enrolled: result.subscription === "active",
    lane: result.lane,
    amountCents: result.amountCents,
    subscription: result.subscription,
    startedMonth: result.startedMonth,
    paidMonths: result.paidMonths,
    lastPaidMonth: result.lastPaidMonth,
    currentMonthPaid: result.currentMonthPaid,
  });
}
