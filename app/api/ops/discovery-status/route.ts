/**
 * GET /api/ops/discovery-status?reference=MT-... — owner check.
 *
 * Answers, for ONE intake reference: is there a discovery record
 * (text or voice), in which channel, with what status and
 * recommendation, and what does the full transcript say? This is
 * the owner's review gate: the owner reads the transcript here,
 * with the presentation, before anything moves to setup. Same token
 * gate as /api/ops/summary and /api/ops/presentation-status:
 * Authorization: Bearer <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database -> 503
 * not_configured.
 *
 * Returns the full transcript — but only to the token holder. This
 * is Bubba/Boone only, NOT a client login: a client cannot call this
 * without the owner token, and a transcript is never shown or sent
 * to a client from this route.
 */

import { NextResponse } from "next/server";
import { discoveryCallStatus } from "../../../lib/erm/discovery-call-store";

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
  const result = await discoveryCallStatus(reference);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "discovery_status_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ ok: true, reference, found: false });
  }
  return NextResponse.json({
    ok: true,
    reference,
    found: true,
    channel: result.channel,
    status: result.callStatus,
    recommendation: result.recommendation,
    recommendationReason: result.recommendationReason,
    transcript: result.transcript,
    presentationRef: result.presentationRef,
  });
}
