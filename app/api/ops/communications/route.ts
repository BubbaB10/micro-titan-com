/**
 * GET /api/ops/communications?from=+1903... — owner thread check.
 *
 * Same token gate as /api/ops/summary: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503 ops_not_configured.
 * Wrong token -> 401. Missing database -> 503 not_configured.
 *
 * ONE thread only: the most recent 20 rows for the requested
 * from-number, newest first. No bulk export, no listing all
 * threads, no client names (the communication_log table stores
 * none — it stores only the thread itself: numbers, direction,
 * kind, body, media count, status). This is Bubba/Boone only,
 * NOT a client login: a client cannot call this without the
 * owner token, and the from-number must be supplied explicitly.
 */

import { NextResponse } from "next/server";
import { listThread } from "../../../lib/erm/communication-store";

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
  const from = url.searchParams.get("from") ?? "";
  if (from.length === 0 || from.length > 32) {
    return NextResponse.json({ ok: false, error: "bad_from" }, { status: 400 });
  }
  const result = await listThread(from, 20);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "thread_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, from, rows: result.rows });
}
