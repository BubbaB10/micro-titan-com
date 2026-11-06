/**
 * POST /api/ops/discovery-record — record a completed agent-led
 * discovery transcript in the ERM, text or voice.
 *
 * Called by the owner (Boone) or by the owner's discovery caller —
 * the text agent or the voice bridge — when a discovery is
 * complete, and by nothing else. This route RECORDS a transcript;
 * it does not place a call, answer a call, send a text, or start
 * a discovery. There is no audio here at all: the transcript is
 * text turns only, and recording_ref carries only the provider's
 * recording reference.
 *
 * Same token gate as /api/ops/summary and
 * /api/ops/discovery-voice-complete: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database -> 503
 * not_configured.
 *
 * Body: { reference, sessionKey, channel: "text" | "voice",
 *   formatChoice: "text" | "call", status?, consentGiven?,
 *   consentAt?, scheduledAt?, startedAt?, endedAt?,
 *   durationSeconds?, transcript: [{speaker: "agent"|"client",
 *   text, at}], recordingRef?, recommendation,
 *   recommendationReason? }
 *
 * - channel and formatChoice must agree: text goes with "text",
 *   voice goes with "call". A mismatch is 400 bad_format_choice.
 * - Consent is the gate for VOICE only: consent at booking AND
 *   confirmed at the start of the call are both required before a
 *   voice discovery may be recorded (design §6). A voice call
 *   recorded without consent is rejected, not stored
 *   (400 consent_required). A text discovery needs no recording
 *   consent — the transcript IS the message log — so consentGiven
 *   may be false or absent for channel "text".
 * - A text discovery carries no recording_ref: a non-empty
 *   recordingRef with channel "text" is 400
 *   recording_ref_not_for_text. A voice recordingRef is validated
 *   (provider SID only, never audio data).
 * - Unknown reference -> 404 intake_not_found, writes nothing.
 * - A session key already recorded -> 200 already_exists, no
 *   duplicate row (idempotent by session_key, in
 *   recordDiscoveryCall).
 * - A completed discovery never advances an intake to "setup" —
 *   setup moves only on the owner's approval after review. The
 *   record itself only ever moves discovery_paid ->
 *   discovery_booked, inside recordDiscoveryCall.
 *
 * Body cap is 1 MB: a full transcript (up to 500 turns) is larger
 * than the 64 KB intake-style cap, and this route is owner-only
 * behind the token gate.
 */

import { NextResponse } from "next/server";
import { recordDiscoveryCall } from "../../../lib/erm/discovery-call-store";
import {
  validateDiscoveryTranscript,
  validateRecordingRef,
} from "../../../lib/erm/discovery-record";
import type {
  DiscoveryChannel,
  DiscoveryRecommendation,
  DiscoveryStatus,
} from "../../../lib/erm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024 * 1024;
const VALID_CHANNELS: ReadonlyArray<string> = ["text", "voice"];
const VALID_FORMAT_CHOICES: ReadonlyArray<string> = ["text", "call"];
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
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_body" }, { status: 400 });
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "body_too_large" }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
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
  const channel = asString(b.channel);
  if (!VALID_CHANNELS.includes(channel)) {
    return NextResponse.json({ ok: false, error: "bad_channel" }, { status: 400 });
  }
  const formatChoice = asString(b.formatChoice);
  if (!VALID_FORMAT_CHOICES.includes(formatChoice)) {
    return NextResponse.json({ ok: false, error: "bad_format_choice" }, { status: 400 });
  }
  // Channel and format choice must agree: text discovery is the
  // text format, voice discovery is the call format.
  if ((channel === "text") !== (formatChoice === "text")) {
    return NextResponse.json({ ok: false, error: "bad_format_choice" }, { status: 400 });
  }
  // Consent is the gate for voice only: a voice discovery without
  // consent at booking AND confirmed at the start is rejected, not
  // recorded. A text discovery needs no recording consent.
  if (channel === "voice" && b.consentGiven !== true) {
    return NextResponse.json({ ok: false, error: "consent_required" }, { status: 400 });
  }
  // A text discovery carries no recording reference.
  if (channel === "text" && asNullableString(b.recordingRef) !== null) {
    return NextResponse.json({ ok: false, error: "recording_ref_not_for_text" }, { status: 400 });
  }
  const transcript = validateDiscoveryTranscript(b.transcript);
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
    channel: channel as DiscoveryChannel,
    formatChoice: formatChoice as "text" | "call",
    status: status as DiscoveryStatus,
    consentGiven: b.consentGiven === true,
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
    return NextResponse.json({ ok: false, error: "discovery_record_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    reference,
    channel,
    erm: result.status,
    discoveryCallId: result.discoveryCallId,
  });
}
