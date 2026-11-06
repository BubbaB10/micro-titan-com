/**
 * Micro Titan voice discovery — agent-led 15–20 minute call, pure logic.
 *
 * Design: micro-titan-agent-led-discovery-design-2026-11-05.md (§4–§6).
 * Route A (Twilio Programmable Voice + Gemini Live, Media Streams)
 * is the recommended route; this module is the control plane for it:
 * the guardrail script, the consent gate, the 20-minute hard stop,
 * transcript validation, and the per-call cost estimate. It makes no
 * call, opens no socket, and sends nothing. The live audio bridge is
 * voice-bridge/ — a separate Node service. The owner chose Railway
 * (root directory /voice-bridge). Vercel serverless cannot hold a
 * live voice session, so the bridge does not run in this Next app.
 * This module still places no call. The TwiML route that can start
 * a Media Stream is off unless VOICE_DISCOVERY_ENABLED=true, and
 * /api/twilio/webhook still rejects inbound calls.
 *
 * APPROVED VERBATIM WORDING — 2026-11-05 ~14:59 CST:
 * VOICE_CALL_OPENING, VOICE_BOOKING_CONSENT, and
 * VOICE_DISCOVERY_FORMAT_CHOICE below are the wording Bubba approved
 * verbatim ("Nothing needs to change on any of it, I read through
 * them all and thought you did great, never sterile, warm but not
 * going over the top, and professional."). Source:
 * micro-titan-g7-discovery-wording-DRAFT-2026-11-05.md, sections 2–3.
 * Use them EXACTLY, no paraphrasing in code. A test asserts exact
 * equality, so no paraphrase can slip in.
 *
 * What this slice deliberately does NOT do:
 * - No call is placed or answered by this code. No Twilio call is
 *   created, no number is dialled, no client is contacted.
 * - No OpenAI / ChatGPT anywhere: OpenAI is explicitly excluded
 *   from the approved agent list (Muse, Grok Bot, Claude, Gemini).
 *   The voice brain is Gemini Live only. No Vapi, Retell, Bland,
 *   or ElevenLabs — managed voice platforms are parked, outside
 *   the approved-agent trust constraint.
 * - No audio is stored in the ERM. A voice discovery carries only
 *   recording_ref — the provider's recording reference (e.g. a
 *   Twilio recording SID). The transcript is text turns only.
 * - No auto-send: the no-answer follow-up text in this file is a
 *   DRAFT, not approved wording, and nothing in this slice sends it.
 * - No Railway service is created here and no paid add-on is added.
 *   The bridge is deployable as its own Railway service; creating
 *   that service and setting its secrets is an owner step. No
 *   Twilio webhook is pointed at it by this code.
 */

import type { DiscoveryTranscriptTurn } from "./types";

/**
 * Call discovery — suggested opening, spoken at the start of the
 * call, after consent at booking. APPROVED VERBATIM by Bubba
 * 2026-11-05 ~14:59 CST. Source:
 * micro-titan-g7-discovery-wording-DRAFT-2026-11-05.md, section 3.
 * Do not paraphrase, shorten, or reword this constant.
 */
export const VOICE_CALL_OPENING =
  "Before we start: I'm Micro Titan's agent, not a person. This call is recorded so we have an exact record of what you said, and I'll build your presentation from it. I can't promise a workflow, change a price, or move any money — if any of that comes up, I'll bring it to the team. Nothing moves to setup until you've seen your presentation and said go. Is that OK to continue?";

/**
 * Booking consent line (call). APPROVED VERBATIM by Bubba 2026-11-05
 * ~14:59 CST. Source: micro-titan-g7-discovery-wording-DRAFT-2026-11-05.md,
 * section 3. Do not paraphrase, shorten, or reword this constant.
 */
export const VOICE_BOOKING_CONSENT =
  "This call is recorded, and a transcript is kept with your intake so nothing gets lost. We keep it as your record — it's not shared, and nothing moves to setup until you've reviewed your presentation.";

/**
 * Discovery format choice (text or call), offered after the discovery
 * fee is paid. APPROVED VERBATIM by Bubba 2026-11-05 ~14:59 CST.
 * Source: micro-titan-g7-discovery-wording-DRAFT-2026-11-05.md,
 * section 2. Do not paraphrase, shorten, or reword this constant.
 */
export const VOICE_DISCOVERY_FORMAT_CHOICE =
  "Your discovery is paid — thank you. How would you like to do it?\n\n" +
  "Text — agent-led, at your pace\n" +
  "Chat with Micro Titan's agent by text, whenever you're ready. It will walk through your discovery questions one at a time.\n\n" +
  "Call — 15–20 minutes\n" +
  "A 15–20 minute call with Micro Titan's agent, at a time you pick. It's recorded so nothing you say gets lost.\n\n" +
  "Either way, what you say goes into your presentation, and nothing moves to setup until you've seen it.";

/** The call is 15–20 minutes. The hard stop is 20 minutes, no exceptions. */
export const VOICE_CALL_TARGET_SECONDS_MIN = 900;
export const VOICE_CALL_MAX_SECONDS = 1200;

/** Fixed agenda, in order (design §4). The agent works it top to bottom. */
export const VOICE_CALL_AGENDA: ReadonlyArray<string> = [
  "Confirm what the intake said, in the client's words",
  "The discovery questions the intake did not answer — what breaks today, what done looks like, what would make it a hard no, what 90 days from now looks like if it works",
  "Confirm the hard nos — never spend money, send texts, or make calls without approval, and any the client adds",
  "Close: what happens next is the presentation, then the owner reviews it",
];

/**
 * Things the agent cannot do on a call, in either format (design §6).
 * If any of these comes up, the agent says so plainly, records it as
 * an open question for the owner, and stops there.
 */
export const VOICE_BANNED_ACTIONS: ReadonlyArray<string> = [
  "promise_workflow",
  "promise_integration",
  "promise_timeline",
  "change_price",
  "offer_discount",
  "agree_scope",
  "spend_money",
  "send_text",
  "make_call",
  "move_to_setup",
];

/** Escalation triggers — any one of these hands the call to the owner (design §9). */
export const VOICE_ESCALATION_TRIGGERS: ReadonlyArray<string> = [
  "asks_for_human",
  "hesitation",
  "hard_question",
  "price_negotiation",
  "not_a_fit",
];

/**
 * DRAFT wrap-up line, spoken at the 20-minute hard stop (design §4).
 * DRAFT — NOT approved verbatim. Do not use it with a client until
 * the owner approves it in words. It exists here so the bridge has
 * one fixed line to speak, not a line invented at call time.
 */
export const VOICE_HARD_STOP_WRAP_UP_DRAFT =
  "That's our time — I'll finish the presentation from what you've told me and the owner will review it. If anything is unfinished, I'll follow up by text.";

/**
 * DRAFT no-answer follow-up (design §4): one text if the client does
 * not answer, then the discovery is marked "no_answer" and waits.
 * DRAFT — NOT approved verbatim. Nothing in this slice sends it, and
 * no repeated dialling ever happens.
 */
export const VOICE_NO_ANSWER_FOLLOW_UP_DRAFT =
  "We missed you — reply here to reschedule, or switch to text discovery instead.";

/**
 * Native-audio Gemini Live model id. Re-checked 2026-11-06 against
 * https://ai.google.dev/gemini-api/docs/deprecations (Live API models:
 * gemini-3.8-live, released 2026-09-15, no shutdown date announced;
 * the recommended replacement for the older native-audio preview
 * models) and the raw websocket getting-started sample
 * (MODEL_NAME = "gemini-3.8-live") at
 * https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket.
 * The setup message sends `models/${GEMINI_LIVE_MODEL}`. Still
 * unproven on a live call in this stack — the first proof is a TEST call.
 */
export const GEMINI_LIVE_MODEL = "gemini-3.8-live";
/**
 * Live API WebSocket endpoint, no API key in the URL.
 * https://ai.google.dev/api/live
 * The key is sent as the x-goog-api-key header, from GEMINI_API_KEY.
 */
export const GEMINI_LIVE_WS_URL_DEFAULT =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
/**
 * Input audio is raw 16-bit little-endian PCM at 16 kHz.
 * https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
 * Output is raw 16-bit little-endian PCM at 24 kHz.
 */
export const GEMINI_INPUT_AUDIO_MIME = "audio/pcm;rate=16000";
export const GEMINI_LIVE_AUDIO_IN_USD_PER_MIN = 0.005;
export const GEMINI_LIVE_AUDIO_OUT_USD_PER_MIN = 0.018;

/** Twilio list prices, US, Oct 2026 (design §5). List prices, not a measured bill. */
export const TWILIO_OUTBOUND_USD_PER_MIN = 0.014;
export const TWILIO_MEDIA_STREAMS_USD_PER_MIN = 0.0044;
export const TWILIO_RECORDING_USD_PER_MIN = 0.0025;
export const TWILIO_CONVERSATION_RELAY_USD_PER_MIN = 0.07;

/**
 * Environment names the bridge server reads. Values live in the host
 * env only, never in code. PORT is what Railway injects; VOICE_BRIDGE_PORT
 * is the fallback when PORT is unset. GEMINI_LIVE_WS_URL overrides
 * GEMINI_LIVE_WS_URL_DEFAULT when set.
 */
export const VOICE_BRIDGE_ENV_VARS: ReadonlyArray<string> = [
  "GEMINI_API_KEY",
  "GEMINI_LIVE_WS_URL",
  "ERM_API_BASE_URL",
  "OPS_DASHBOARD_TOKEN",
  "PORT",
  "VOICE_BRIDGE_PORT",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
];

/** A voice call may start only with consent at booking AND consent confirmed at the start of the call. */
export function canStartVoiceCall(input: {
  consentAtBooking: boolean;
  consentConfirmedAtStart: boolean;
}): { ok: true } | { ok: false; reason: string } {
  if (!input.consentAtBooking) {
    return { ok: false, reason: "consent_not_given_at_booking" };
  }
  if (!input.consentConfirmedAtStart) {
    return { ok: false, reason: "consent_not_confirmed_at_start" };
  }
  return { ok: true };
}

/** Seconds left before the 20-minute hard stop. Zero or less means wrap up now. */
export function secondsRemaining(elapsedSeconds: number): number {
  return VOICE_CALL_MAX_SECONDS - Math.max(0, Math.floor(elapsedSeconds));
}

/** True once the call has reached its 20-minute hard stop. */
export function isHardStop(elapsedSeconds: number): boolean {
  return elapsedSeconds >= VOICE_CALL_MAX_SECONDS;
}

export const MAX_TRANSCRIPT_TURNS = 500;
export const MAX_TURN_TEXT_CHARS = 2000;
export const MAX_RECORDING_REF_CHARS = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate a voice transcript before it is recorded: an array of
 * turns, each {speaker: "agent" | "client", text, at}. A summary is
 * never a substitute for the transcript, and a turn with no speaker,
 * no text, or no timestamp is not a record.
 */
export function validateVoiceTranscript(
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

export interface VoiceCallCostEstimate {
  minutes: number;
  twilioOutboundUsd: number;
  mediaStreamsUsd: number;
  recordingUsd: number;
  geminiAudioUsd: number;
  totalUsd: number;
  /** List prices from Oct 2026, not a measured bill. */
  basis: string;
}

/**
 * Per-call cost estimate from published list prices (design §5).
 * A 20-minute call on Media Streams + Gemini Live is under $1 in
 * telephony + model, plus recording. This is an estimate, not a bill.
 */
export function estimateVoiceCallCostUsd(minutes: number): VoiceCallCostEstimate {
  const m = Math.max(0, minutes);
  const twilioOutboundUsd = m * TWILIO_OUTBOUND_USD_PER_MIN;
  const mediaStreamsUsd = m * TWILIO_MEDIA_STREAMS_USD_PER_MIN;
  const recordingUsd = m * TWILIO_RECORDING_USD_PER_MIN;
  const geminiAudioUsd =
    m * (GEMINI_LIVE_AUDIO_IN_USD_PER_MIN + GEMINI_LIVE_AUDIO_OUT_USD_PER_MIN);
  return {
    minutes: m,
    twilioOutboundUsd,
    mediaStreamsUsd,
    recordingUsd,
    geminiAudioUsd,
    totalUsd: twilioOutboundUsd + mediaStreamsUsd + recordingUsd + geminiAudioUsd,
    basis: "Twilio + Gemini Live list prices, US, Oct 2026 — estimate, not a measured bill",
  };
}

/** TwiML spoken by nobody: the call is rejected and no stream starts. */
export const VOICE_DISCOVERY_REJECT_TWIML =
  `<?xml version="1.0" encoding="UTF-8"?><Response><Reject reason="busy"/></Response>`;

/** The flag is on only for the exact string "true". Unset, "1", and "TRUE" stay off. */
export function voiceDiscoveryEnabled(raw: string | undefined): boolean {
  return raw === "true";
}

/**
 * Hostname (optional port) for the Railway voice bridge. A scheme is
 * stripped so a pasted URL still becomes the host in wss://${host}/...
 * A path, query, userinfo, or whitespace is rejected.
 */
export function voiceBridgeHost(raw: string | undefined): string | null {
  if (typeof raw !== "string") return null;
  const stripped = raw.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/\/+$/, "");
  if (!stripped || /[/?#@\s]/.test(stripped)) return null;
  return stripped;
}

const INTAKE_REFERENCE_RE = /^MT-\d{8}-[A-Z0-9]{4}$/;
const SESSION_KEY_RE = /^[A-Za-z0-9._:-]{1,100}$/;

/**
 * reference, sessionKey, and consentAt from the signed voice URL.
 * consentAt is the booking-consent timestamp: missing or unparseable
 * means consent was not supplied, and the stream must not start.
 * The reference format matches the intake reference (MT-YYYYMMDD-XXXX).
 */
export function parseVoiceDiscoveryStreamParams(
  searchParams: URLSearchParams,
):
  | { ok: true; reference: string; sessionKey: string; consentAt: string }
  | { ok: false; reason: "bad_reference" | "bad_session_key" | "consent_required" } {
  const reference = searchParams.get("reference") ?? "";
  const sessionKey = searchParams.get("sessionKey") ?? "";
  const consentAt = searchParams.get("consentAt") ?? "";
  if (!INTAKE_REFERENCE_RE.test(reference)) return { ok: false, reason: "bad_reference" };
  if (!SESSION_KEY_RE.test(sessionKey)) return { ok: false, reason: "bad_session_key" };
  if (consentAt.length === 0 || consentAt.length > 40 || Number.isNaN(Date.parse(consentAt))) {
    return { ok: false, reason: "consent_required" };
  }
  return { ok: true, reference, sessionKey, consentAt };
}

function xmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** wss URL the TwiML <Stream> connects to. Query values are percent-encoded. */
export function buildVoiceDiscoveryStreamUrl(input: {
  host: string;
  reference: string;
  sessionKey: string;
  consentAt: string;
}): string {
  const params = new URLSearchParams({
    reference: input.reference,
    sessionKey: input.sessionKey,
    consentAt: input.consentAt,
  });
  return `wss://${input.host}/twilio-stream?${params.toString()}`;
}

/**
 * TwiML that speaks nothing: no <Say>, no <Play>. It only connects
 * the Media Stream. The caller hears the agent through the bridge,
 * starting with VOICE_CALL_OPENING, not a line invented here.
 */
export function buildVoiceDiscoveryTwiml(input: {
  host: string;
  reference: string;
  sessionKey: string;
  consentAt: string;
}): string {
  const url = buildVoiceDiscoveryStreamUrl(input);
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="${xmlAttr(url)}"/></Connect></Response>`;
}

export type VoiceDiscoveryDecision =
  | { action: "reject"; reason: string }
  | { action: "error"; status: 503 | 403; error: string }
  | { action: "lookup"; reference: string; sessionKey: string; consentAt: string; host: string }
  | { action: "stream"; twiml: string };

/**
 * Gate for the voice-discovery TwiML route. Order:
 *   1. Off unless enabled (VOICE_DISCOVERY_ENABLED=true). A disabled
 *      route rejects even a valid, consented, known intake.
 *   2. Twilio auth token must be configured.
 *   3. X-Twilio-Signature must verify.
 *   4. VOICE_BRIDGE_HOST must be a hostname.
 *   5. reference, sessionKey, and consentAt must be present and valid.
 *   6. If intakeStatus is omitted, the caller must look the reference
 *      up before a stream can start. not_found, not_configured, and
 *      failed all reject: an unconfirmed intake is not a known intake.
 *   7. found + consentAt → TwiML <Connect><Stream>.
 */
export function decideVoiceDiscovery(input: {
  enabled: boolean;
  authTokenPresent: boolean;
  signatureOk: boolean;
  hostRaw: string | undefined;
  searchParams: URLSearchParams;
  intakeStatus?: "found" | "not_found" | "not_configured" | "failed";
}): VoiceDiscoveryDecision {
  if (!input.enabled) return { action: "reject", reason: "disabled" };
  if (!input.authTokenPresent) {
    return { action: "error", status: 503, error: "twilio_not_configured" };
  }
  if (!input.signatureOk) {
    return { action: "error", status: 403, error: "invalid_signature" };
  }
  const host = voiceBridgeHost(input.hostRaw);
  if (!host) return { action: "error", status: 503, error: "voice_bridge_not_configured" };
  const params = parseVoiceDiscoveryStreamParams(input.searchParams);
  if (!params.ok) return { action: "reject", reason: params.reason };
  if (input.intakeStatus === undefined) {
    return {
      action: "lookup",
      reference: params.reference,
      sessionKey: params.sessionKey,
      consentAt: params.consentAt,
      host,
    };
  }
  if (input.intakeStatus !== "found") {
    const reason =
      input.intakeStatus === "not_found"
        ? "intake_not_found"
        : input.intakeStatus === "not_configured"
          ? "intake_not_confirmed"
          : "intake_lookup_failed";
    return { action: "reject", reason };
  }
  return {
    action: "stream",
    twiml: buildVoiceDiscoveryTwiml({
      host,
      reference: params.reference,
      sessionKey: params.sessionKey,
      consentAt: params.consentAt,
    }),
  };
}
