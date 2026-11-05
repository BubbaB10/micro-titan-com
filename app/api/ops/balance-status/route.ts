/**
 * GET /api/ops/balance-status?reference=MT-... — Gap 5 owner check.
 *
 * Answers, for ONE intake reference: has the program balance been
 * issued, for how much, and is it paid? Same token gate as
 * /api/ops/summary and /api/ops/payment-status: Authorization:
 * Bearer <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database -> 503
 * not_configured.
 *
 * Returns no names, no intake details, no contact details, no
 * Stripe ids — only lane, amount in cents, status, and paid date
 * for the requested reference. This is Bubba/Boone only, NOT a
 * client login: a client cannot call this without the owner token.
 */

import { NextResponse } from "next/server";
import { balanceStatus } from "../../../lib/erm/balance-store";

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
  const result = await balanceStatus(reference);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "balance_status_failed" }, { status: 502 });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ ok: true, reference, issued: false });
  }
  return NextResponse.json({
    ok: true,
    reference,
    issued: true,
    lane: result.lane,
    amountCents: result.amountCents,
    status: result.paymentStatus,
    paidAt: result.paidAt,
  });
}
