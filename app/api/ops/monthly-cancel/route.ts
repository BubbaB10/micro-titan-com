/**
 * POST /api/ops/monthly-cancel — Gap 9 owner action.
 *
 * Cancels ONE intake's active monthly operate plan, by hand.
 * Body: { reference: "MT-..." }. Paid months stay paid: this
 * cancels the plan going forward, it does not refund or delete
 * any payment row. Same token gate as /api/ops/monthly-enroll.
 * Unknown reference -> 404 intake_not_found. No active plan ->
 * 200 not_enrolled. This is Bubba/Boone only, NOT a client
 * login. Nothing here refunds or charges anyone.
 */

import { NextResponse } from "next/server";
import { cancelMonthly } from "../../../lib/erm/monthly-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const reference =
    typeof body === "object" && body !== null && typeof (body as { reference?: unknown }).reference === "string"
      ? ((body as { reference: string }).reference as string)
      : "";
  if (reference.length === 0 || reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  const result = await cancelMonthly(reference);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "monthly_cancel_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "not_enrolled") {
    return NextResponse.json({ ok: true, reference, enrolled: false });
  }
  return NextResponse.json({ ok: true, reference, erm: "cancelled" });
}
