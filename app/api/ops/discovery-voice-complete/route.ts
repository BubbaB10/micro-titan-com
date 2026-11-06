/**
 * POST /api/ops/discovery-voice-complete — record a completed voice
 * discovery transcript in the ERM.
 *
 * Called by the voice bridge (voice-bridge/server.mjs) when a call
 * ends, and by nothing else. This route RECORDS a transcript; it
 * does not place a call, answer a call, or send anything. There is
 * no audio here at all: the transcript is text turns only, and
 * recording_ref carries only the provider's recording reference.
 *
 * Same token gate as /api/ops/summary and /api/ops/presentation-status:
 * Authorization: Bearer <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database -> 503
 * not_configured.
 *
 * Body: { reference, sessionKey, consentGiven: true, consentAt?,
 *   scheduledAt?, startedAt?, endedAt?, durationSeconds,
 *   transcript: [{speaker: "agent"|"client", text, at}],
 *   recordingRef?, recommendation, recommendationReason? }
 * consentGiven must be true — consent at booking AND confirmed at
 * the start of the call are both required before a voice discovery
 * may be recorded (design §6). A call recorded without consent is
 * rejected, not stored. Unknown reference -> 404 intake_not_found,
 * writes nothing. A session key already recorded -> 200
 * already_exists, no duplicate row. A completed discovery never
 * advances an intake to "setup" — setup moves only on the owner's
 * approval after review.
 */

import { NextResponse } from "next/server";
import { recordDiscoveryCall } from "../../../lib/erm/discovery-call-store";
import {
  validateRecordingRef,
  validateVoiceTranscript,
} from "../../../lib/erm/voice-discovery";
import type {
  DiscoveryRecommendation,
  DiscoveryStatus,
} from "../../../lib/erm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_RECOMMENDATIONS: ReadonlyArray<string> = [
  "approve",
  "join_to_close",
  "decline",
  "needs_human",
];
const VALID_STATUSES: ReadonlyArray<string> = [
  "completed",
  "no_answer",
  "escalated",
  "cancelled",
];

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNullableInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.floor(value);
}

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
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const reference = asString(b.reference);
  const sessionKey = asString(b.sessionKey);
  if (reference.length === 0 || reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  if (sessionKey.length === 0 || sessionKey.length > 100) {
    return NextResponse.json({ ok: false, error: "bad_session_key" }, { status: 400 });
  }
  // Consent is the gate: a voice discovery without consent at booking
  // AND confirmed at the start is rejected, not recorded.
  if (b.consentGiven !== true) {
    return NextResponse.json({ ok: false, error: "consent_required" }, { status: 400 });
  }
  const transcript = validateVoiceTranscript(b.transcript);
  if (!transcript.ok) {
    return NextResponse.json(
      { ok: false, error: "bad_transcript", details: transcript.errors },
      { status: 400 },
    );
  }
  const recordingRef = validateRecordingRef(b.recordingRef);
  if (!recordingRef.ok) {
    return NextResponse.json({ ok: false, error: recordingRef.error }, { status: 400 });
  }
  const recommendation = asString(b.recommendation);
  if (!VALID_RECOMMENDATIONS.includes(recommendation)) {
    return NextResponse.json({ ok: false, error: "bad_recommendation" }, { status: 400 });
  }
  const status = asString(b.status) || "completed";
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "bad_status" }, { status: 400 });
  }
  const result = await recordDiscoveryCall({
    reference,
    sessionKey,
    channel: "voice",
    formatChoice: "call",
    status: status as DiscoveryStatus,
    consentGiven: true,
    consentAt: asNullableString(b.consentAt),
    scheduledAt: asNullableString(b.scheduledAt),
    startedAt: asNullableString(b.startedAt),
    endedAt: asNullableString(b.endedAt),
    durationSeconds: asNullableInt(b.durationSeconds),
    transcript: transcript.turns,
    recordingRef: recordingRef.recordingRef,
    recommendation: recommendation as DiscoveryRecommendation,
    recommendationReason: asString(b.recommendationReason),
  });
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "discovery_voice_complete_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    reference,
    erm: result.status,
    discoveryCallId: result.discoveryCallId,
  });
}
