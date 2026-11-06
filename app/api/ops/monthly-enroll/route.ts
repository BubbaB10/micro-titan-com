/**
 * POST /api/ops/monthly-enroll — Gap 9 owner action.
 *
 * Enrolls ONE intake on the optional monthly operate plan, by
 * hand. Body: { reference: "MT-..." }. The monthly plan is
 * optional: enrollment is an explicit owner action, never
 * automatic, and a payment never enrolls anyone. The amount is
 * the lane's approved monthly price (Family $95 / Solo $350 /
 * Business $950) — it is never supplied by the caller.
 *
 * Same token gate as /api/ops/summary: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database ->
 * 503 not_configured. Unknown reference -> 404
 * intake_not_found. Already enrolled -> 200 already_exists.
 * This is Bubba/Boone only, NOT a client login: a client
 * cannot enroll themselves without the owner token. Nothing
 * here charges anyone or creates a Stripe subscription.
 */

import { NextResponse } from "next/server";
import { enrollMonthly } from "../../../lib/erm/monthly-store";

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
  const result = await enrollMonthly({ reference });
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "monthly_enroll_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "already_exists") {
    return NextResponse.json({
      ok: true,
      erm: "already_exists",
      reference,
      lane: result.lane,
      amountCents: result.amountCents,
      startedMonth: result.startedMonth,
    });
  }
  return NextResponse.json({
    ok: true,
    erm: "enrolled",
    reference,
    lane: result.lane,
    amountCents: result.amountCents,
    startedMonth: result.startedMonth,
  });
}
