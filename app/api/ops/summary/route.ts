/**
 * Owner summary API — Bubba's three sections only: Issues, Approvals,
 * Money. Counts and money totals only; no names, no answers, no
 * contact details leave the database through this route.
 *
 * Auth (first slice, Bubba/Boone only — NOT a client login):
 *   Authorization: Bearer <OPS_DASHBOARD_TOKEN>
 * Missing token -> 401. Missing database -> 503 not_configured.
 * A real login (client login, sessions, roles) is a later slice.
 */
import { NextResponse } from "next/server";
import { ownerSummary } from "../../../lib/erm/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "ops_not_configured" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await ownerSummary();
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "summary_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, ...result.summary });
}
