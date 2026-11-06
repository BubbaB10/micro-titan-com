// Micro Titan voice bridge — call session state machine, no I/O.
//
// One session = one discovery call attempt. States:
//   idle -> live -> wrapping -> ended
//   idle -> ended (no answer: Twilio never connected, or the client
//   did not pick up)
// The machine owns three things the wire code must not invent:
// the 20-minute hard stop (VOICE_CALL_MAX_SECONDS, same value as
// app/lib/erm/voice-discovery.ts — a test asserts the two agree),
// the transcript (turns in order, agent or client, with timestamps),
// and the end reason. It never dials, never sends a text, never
// records audio: the transcript is text, and the only recording
// reference it carries is the provider's recording SID, supplied by
// the caller.

export const VOICE_CALL_MAX_SECONDS = 1200;
export const GEMINI_OUTPUT_SAMPLE_RATE_HZ = 24000;
export const TWILIO_INPUT_SAMPLE_RATE_HZ = 8000;
export const GEMINI_INPUT_SAMPLE_RATE_HZ = 16000;

export const SESSION_STATES = ["idle", "live", "wrapping", "ended"];
export const END_REASONS = [
  "completed",
  "hard_stop",
  "no_answer",
  "client_hung_up",
  "error",
];

export function createVoiceSession({ reference, sessionKey, callSid = null }) {
  if (!reference || typeof reference !== "string") throw new Error("bad_reference");
  if (!sessionKey || typeof sessionKey !== "string") throw new Error("bad_session_key");
  return {
    reference,
    sessionKey,
    callSid,
    state: "idle",
    startedAt: null,
    endedAt: null,
    endReason: null,
    transcript: [],
    recordingRef: null,
    elapsedSeconds: 0,
  };
}

export function sessionStart(session, startedAt = new Date()) {
  if (session.state !== "idle") throw new Error("session_not_idle");
  session.state = "live";
  session.startedAt = startedAt instanceof Date ? startedAt : new Date(startedAt);
  return session;
}

/** Add one transcript turn. Turns are text only, in order, speaker agent or client. */
export function sessionAddTurn(session, turn) {
  if (session.state !== "live" && session.state !== "wrapping") {
    throw new Error("session_not_live");
  }
  if (!turn || (turn.speaker !== "agent" && turn.speaker !== "client")) {
    throw new Error("bad_turn_speaker");
  }
  if (typeof turn.text !== "string" || turn.text.trim().length === 0) {
    throw new Error("bad_turn_text");
  }
  const at = turn.at instanceof Date ? turn.at.toISOString() : turn.at;
  if (typeof at !== "string" || Number.isNaN(Date.parse(at))) {
    throw new Error("bad_turn_timestamp");
  }
  session.transcript.push({ speaker: turn.speaker, text: turn.text, at });
  return session;
}

/** Seconds left before the 20-minute hard stop. */
export function sessionSecondsRemaining(session, now = new Date()) {
  if (!session.startedAt) return VOICE_CALL_MAX_SECONDS;
  const elapsed = Math.floor((new Date(now) - new Date(session.startedAt)) / 1000);
  session.elapsedSeconds = Math.max(0, elapsed);
  return VOICE_CALL_MAX_SECONDS - session.elapsedSeconds;
}

export function sessionIsHardStop(session, now = new Date()) {
  return sessionSecondsRemaining(session, now) <= 0;
}

/** Move a live call into its wrap-up (hard stop reached: speak the wrap-up, then end). */
export function sessionBeginWrapUp(session) {
  if (session.state !== "live") throw new Error("session_not_live");
  session.state = "wrapping";
  return session;
}

export function sessionEnd(session, reason, endedAt = new Date()) {
  if (!END_REASONS.includes(reason)) throw new Error("bad_end_reason");
  if (session.state === "ended") throw new Error("session_already_ended");
  session.state = "ended";
  session.endReason = reason;
  session.endedAt = endedAt instanceof Date ? endedAt : new Date(endedAt);
  if (session.startedAt) {
    session.elapsedSeconds = Math.max(
      0,
      Math.floor((new Date(session.endedAt) - new Date(session.startedAt)) / 1000),
    );
  }
  return session;
}

/** The record the bridge posts back to the ERM when a call ends. No audio, ever. */
export function sessionToDiscoveryRecord(session, { consentGiven, consentAt = null, recommendation = "approve", recommendationReason = "" }) {
  if (session.state !== "ended") throw new Error("session_not_ended");
  if (!consentGiven) throw new Error("consent_not_given");
  return {
    reference: session.reference,
    sessionKey: session.sessionKey,
    channel: "voice",
    formatChoice: "call",
    status:
      session.endReason === "no_answer"
        ? "no_answer"
        : session.endReason === "completed" || session.endReason === "hard_stop"
          ? "completed"
          : "escalated",
    consentGiven: true,
    consentAt,
    scheduledAt: null,
    startedAt: session.startedAt ? session.startedAt.toISOString() : null,
    endedAt: session.endedAt ? session.endedAt.toISOString() : null,
    durationSeconds: session.elapsedSeconds,
    transcript: session.transcript,
    recordingRef: session.recordingRef,
    recommendation,
    recommendationReason,
  };
}
