/**
 * GET /api/ops/agreement-status?reference=MT-... — Gap 2 owner check.
 *
 * Answers, for ONE intake reference: is there an agreement recorded
 * in the ERM, and when was it accepted? Same token gate as
 * /api/ops/summary and /api/ops/payment-status: Authorization:
 * Bearer <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database -> 503
 * not_configured.
 *
 * Returns no names, no signature text, no intake details, no
 * contact details — only lane, accepted date, and method for the
 * requested reference. This is Bubba/Boone only, NOT a client
 * login: a client cannot call this without the owner token.
 */

import { NextResponse } from "next/server";
import { agreementStatus } from "../../../lib/erm/agreement-store";

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
  const result = await agreementStatus(reference);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "agreement_status_failed" }, { status: 502 });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ ok: true, reference, agreed: false });
  }
  return NextResponse.json({
    ok: true,
    reference,
    agreed: true,
    lane: result.lane,
    acceptedAt: result.acceptedAt,
    method: result.method,
  });
}
