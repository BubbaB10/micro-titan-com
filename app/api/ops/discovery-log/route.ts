/**
 * POST /api/ops/discovery-log — owner/caller record of one discovery.
 *
 * A paid discovery (text, or a voice call the caller already held)
 * writes one ERM discovery_calls row through recordDiscoveryCall.
 * This route RECORDS a discovery. It does not place a call, charge
 * a card, or send a message. No voice host is contacted, no sender
 * is created, and no client is contacted from here.
 *
 * Same token gate as /api/ops/summary and
 * /api/ops/presentation-status: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503 ops_not_configured.
 * Wrong token -> 401. Missing database -> 503 not_configured.
 *
 * Body maps onto DiscoveryCallInput. sessionKey is required and
 * comes from the caller (a call SID, a text-thread id, or a
 * session id). This route never invents one. The transcript is
 * stored verbatim, every turn, in order — a summary is never a
 * substitute. recordingRef is a voice-only provider reference.
 * Audio bytes are rejected and never written.
 *
 * Unknown reference -> 404 intake_not_found, and the store writes
 * nothing. The same sessionKey again -> 200 already_exists, no
 * second row. written -> 200. A failed write -> 502.
 * Insert-only: this route never edits or removes a discovery_calls
 * row or an audit_log row, and it never advances an intake to setup.
 */

import { NextResponse } from "next/server";
import { recordDiscoveryCall } from "../../../lib/erm/discovery-call-store";
import type {
  DiscoveryCallInput,
  DiscoveryTranscriptTurn,
} from "../../../lib/erm/discovery-call-store";
import type {
  DiscoveryChannel,
  DiscoveryRecommendation,
  DiscoveryStatus,
} from "../../../lib/erm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CHANNELS: readonly DiscoveryChannel[] = ["text", "voice"];
const VALID_FORMATS: readonly DiscoveryCallInput["formatChoice"][] = ["text", "call"];
const VALID_STATUSES: readonly DiscoveryStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "no_answer",
  "awaiting_client",
  "escalated",
  "cancelled",
];
const VALID_RECOMMENDATIONS: readonly DiscoveryRecommendation[] = [
  "approve",
  "join_to_close",
  "decline",
  "needs_human",
];
const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const RECORDING_REF = /^[A-Za-z0-9_-]{1,128}$/;

type ParsedBody =
  | { ok: true; input: DiscoveryCallInput }
  | { ok: false; error: string };

function authorize(req: Request): NextResponse | null {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ops_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null;
}

function isForbiddenAudioKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[_-]/g, "");
  if (normalized === "recordingref") return false;
  if (normalized.includes("audio") || normalized.includes("base64")) return true;
  return (
    normalized === "recording" ||
    normalized === "recordingurl" ||
    normalized === "recordingbytes" ||
    normalized === "recordingdata" ||
    normalized === "media" ||
    normalized === "wav" ||
    normalized === "mp3" ||
    normalized === "blob"
  );
}

function containsAudioPayload(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsAudioPayload);
  if (typeof value !== "object" || value === null) return false;
  for (const [key, child] of Object.entries(value)) {
    if (isForbiddenAudioKey(key) || containsAudioPayload(child)) return true;
  }
  return false;
}

function isIsoTimestamp(value: string): boolean {
  return ISO_TIMESTAMP.test(value) && !Number.isNaN(Date.parse(value));
}

function optionalTimestamp(
  value: unknown,
): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "string" || !isIsoTimestamp(value)) return { ok: false };
  return { ok: true, value };
}

function optionalDuration(
  value: unknown,
): { ok: true; value: number | null } | { ok: false } {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 86_400) {
    return { ok: false };
  }
  return { ok: true, value };
}

function parseTranscript(
  value: unknown,
): { ok: true; value: DiscoveryTranscriptTurn[] } | { ok: false } {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200) {
    return { ok: false };
  }
  const turns: DiscoveryTranscriptTurn[] = [];
  for (const turn of value) {
    if (typeof turn !== "object" || turn === null || Array.isArray(turn)) {
      return { ok: false };
    }
    const candidate = turn as Record<string, unknown>;
    const speaker = candidate.speaker;
    const text = candidate.text;
    const at = candidate.at;
    if (speaker !== "agent" && speaker !== "client") return { ok: false };
    if (typeof text !== "string" || text.length === 0 || text.length > 10_000) {
      return { ok: false };
    }
    if (typeof at !== "string" || !isIsoTimestamp(at)) return { ok: false };
    turns.push({ speaker, text, at });
  }
  return { ok: true, value: turns };
}

function parseRecordingRef(
  channel: DiscoveryChannel,
  value: unknown,
): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  if (typeof value !== "string" || !RECORDING_REF.test(value)) return { ok: false };
  if (channel !== "voice") return { ok: false };
  return { ok: true, value };
}

function parseDiscoveryLogBody(body: Record<string, unknown>): ParsedBody {
  if (containsAudioPayload(body)) return { ok: false, error: "audio_not_allowed" };

  const reference = body.reference;
  if (typeof reference !== "string" || reference.length === 0 || reference.length > 50) {
    return { ok: false, error: "bad_reference" };
  }

  const sessionKey = body.sessionKey;
  if (
    typeof sessionKey !== "string" ||
    sessionKey.length === 0 ||
    sessionKey.length > 200 ||
    sessionKey.trim() !== sessionKey ||
    /[\u0000-\u001F]/.test(sessionKey)
  ) {
    return { ok: false, error: "bad_session_key" };
  }

  const channel = body.channel;
  if (typeof channel !== "string" || !VALID_CHANNELS.includes(channel as DiscoveryChannel)) {
    return { ok: false, error: "bad_channel" };
  }
  const discoveryChannel = channel as DiscoveryChannel;

  const formatChoice = body.formatChoice;
  if (
    typeof formatChoice !== "string" ||
    !VALID_FORMATS.includes(formatChoice as DiscoveryCallInput["formatChoice"])
  ) {
    return { ok: false, error: "bad_format" };
  }

  const status = body.status;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as DiscoveryStatus)) {
    return { ok: false, error: "bad_status" };
  }

  if (typeof body.consentGiven !== "boolean") {
    return { ok: false, error: "bad_consent" };
  }
  if (discoveryChannel === "voice" && body.consentGiven !== true) {
    return { ok: false, error: "consent_required" };
  }

  const consentAt = optionalTimestamp(body.consentAt);
  const scheduledAt = optionalTimestamp(body.scheduledAt);
  const startedAt = optionalTimestamp(body.startedAt);
  const endedAt = optionalTimestamp(body.endedAt);
  if (!consentAt.ok || !scheduledAt.ok || !startedAt.ok || !endedAt.ok) {
    return { ok: false, error: "bad_timestamp" };
  }

  const durationSeconds = optionalDuration(body.durationSeconds);
  if (!durationSeconds.ok) return { ok: false, error: "bad_duration" };

  const transcript = parseTranscript(body.transcript);
  if (!transcript.ok) return { ok: false, error: "bad_transcript" };

  const recordingRef = parseRecordingRef(discoveryChannel, body.recordingRef);
  if (!recordingRef.ok) return { ok: false, error: "bad_recording_ref" };

  const recommendation = body.recommendation;
  if (
    typeof recommendation !== "string" ||
    !VALID_RECOMMENDATIONS.includes(recommendation as DiscoveryRecommendation)
  ) {
    return { ok: false, error: "bad_recommendation" };
  }

  const recommendationReason = body.recommendationReason;
  if (
    typeof recommendationReason !== "string" ||
    recommendationReason.trim().length === 0 ||
    recommendationReason.length > 4_000
  ) {
    return { ok: false, error: "bad_recommendation_reason" };
  }

  const presentationRef = body.presentationRef;
  let presentation: string | null = null;
  if (presentationRef !== undefined && presentationRef !== null && presentationRef !== "") {
    if (
      typeof presentationRef !== "string" ||
      presentationRef.length > 200 ||
      presentationRef.trim().length === 0
    ) {
      return { ok: false, error: "bad_presentation_ref" };
    }
    presentation = presentationRef;
  }

  return {
    ok: true,
    input: {
      reference,
      sessionKey,
      channel: discoveryChannel,
      formatChoice: formatChoice as DiscoveryCallInput["formatChoice"],
      status: status as DiscoveryStatus,
      consentGiven: body.consentGiven,
      consentAt: consentAt.value,
      scheduledAt: scheduledAt.value,
      startedAt: startedAt.value,
      endedAt: endedAt.value,
      durationSeconds: durationSeconds.value,
      transcript: transcript.value,
      recordingRef: recordingRef.value,
      recommendation: recommendation as DiscoveryRecommendation,
      recommendationReason,
      presentationRef: presentation,
    },
  };
}

export async function POST(req: Request) {
  const denied = authorize(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const parsed = parseDiscoveryLogBody(body as Record<string, unknown>);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const result = await recordDiscoveryCall(parsed.input);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "discovery_log_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "already_exists") {
    return NextResponse.json({
      ok: true,
      reference: parsed.input.reference,
      erm: "already_exists",
      discoveryCallId: result.discoveryCallId,
      sessionKey: parsed.input.sessionKey,
    });
  }
  return NextResponse.json({
    ok: true,
    reference: parsed.input.reference,
    erm: "written",
    discoveryCallId: result.discoveryCallId,
    sessionKey: parsed.input.sessionKey,
  });
}
