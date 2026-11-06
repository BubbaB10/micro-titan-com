/**
 * P1 item 6 — discovery caller route support: pure validation for
 * recording a completed agent-led discovery transcript in the ERM.
 * Pure logic (no I/O, no secrets stored, no database connection).
 *
 * The record shape already exists (app/lib/erm/discovery-call-store.ts,
 * PR #34): recordDiscoveryCall takes a channel ("text" | "voice"),
 * a full transcript, a session_key, and a recommendation, and
 * writes one discovery_calls row + one AuditLog row, idempotent by
 * session_key. What was missing was a caller: nothing could write
 * a record yet except the voice bridge (PR #41, preview-only,
 * voice only). This module is the shared validation for the
 * token-gated owner route POST /api/ops/discovery-record, which
 * accepts a completed transcript in EITHER channel.
 *
 * Validation mirrors app/lib/erm/voice-discovery.ts (PR #41) on
 * purpose — same limits, same error strings — but this module is
 * self-contained: it does not import voice-discovery.ts, so this
 * slice stands on master alone. If the two ever diverge, the
 * tests in tests/discovery-record.test.mjs pin these limits.
 *
 * - A transcript is an array of turns, each {speaker: "agent" |
 *   "client", text, at}. A summary is never a substitute for the
 *   transcript, and a turn with no speaker, no text, or no
 *   timestamp is not a record. At most 500 turns, at most 2000
 *   characters per turn.
 * - A recording reference is a provider reference (e.g. a Twilio
 *   recording SID), never audio. Reject anything that looks like
 *   audio data or a blob: a data: URI, or a value too long to be
 *   a reference (200 chars).
 *
 * This module never stores audio, never places a call, never sends
 * a text, and never advances an intake to setup — that last rule
 * lives in recordDiscoveryCall itself (a completed discovery only
 * ever moves discovery_paid -> discovery_booked; setup moves only
 * on the owner's approval after review).
 */

import type { DiscoveryTranscriptTurn } from "./types";

export const MAX_TRANSCRIPT_TURNS = 500;
export const MAX_TURN_TEXT_CHARS = 2000;
export const MAX_RECORDING_REF_CHARS = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate a completed discovery transcript before it is recorded:
 * an array of turns, each {speaker: "agent" | "client", text, at}.
 * Channel-agnostic: the same shape serves a text message log and
 * a voice call transcript.
 */
export function validateDiscoveryTranscript(
  input: unknown,
): { ok: true; turns: DiscoveryTranscriptTurn[] } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!Array.isArray(input)) return { ok: false, errors: ["transcript_not_an_array"] };
  if (input.length === 0) return { ok: false, errors: ["transcript_empty"] };
  if (input.length > MAX_TRANSCRIPT_TURNS) {
    return { ok: false, errors: ["transcript_too_long"] };
  }
  const turns: DiscoveryTranscriptTurn[] = [];
  input.forEach((raw, i) => {
    if (!isRecord(raw)) {
      errors.push(`turn_${i}_not_an_object`);
      return;
    }
    const speaker = raw.speaker;
    if (speaker !== "agent" && speaker !== "client") {
      errors.push(`turn_${i}_bad_speaker`);
      return;
    }
    const text = raw.text;
    if (typeof text !== "string" || text.trim().length === 0) {
      errors.push(`turn_${i}_empty_text`);
      return;
    }
    if (text.length > MAX_TURN_TEXT_CHARS) {
      errors.push(`turn_${i}_text_too_long`);
      return;
    }
    const at = raw.at;
    if (typeof at !== "string" || Number.isNaN(Date.parse(at))) {
      errors.push(`turn_${i}_bad_timestamp`);
      return;
    }
    turns.push({ speaker, text, at });
  });
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, turns };
}

/**
 * A recording reference is a provider reference (e.g. a Twilio
 * recording SID), never audio. Reject anything that looks like audio
 * data or a blob: a data: URI, or a value too long to be a reference.
 */
export function validateRecordingRef(
  input: unknown,
): { ok: true; recordingRef: string | null } | { ok: false; error: string } {
  if (input === undefined || input === null || input === "") {
    return { ok: true, recordingRef: null };
  }
  if (typeof input !== "string") return { ok: false, error: "recording_ref_not_a_string" };
  if (input.startsWith("data:")) return { ok: false, error: "recording_ref_is_audio_data" };
  if (input.length > MAX_RECORDING_REF_CHARS) {
    return { ok: false, error: "recording_ref_too_long" };
  }
  return { ok: true, recordingRef: input };
}
