/**
 * Micro Titan Twilio text-first — pure logic, no I/O, no secrets.
 *
 * Fiscal design (hard constraint, not a nice-to-have):
 * - Event-driven ONLY. Twilio pushes events to the webhook. There is
 *   no polling loop, no scheduled sweep, and no per-minute check in
 *   this slice — polling is what racks up API usage. A webhook hit
 *   itself costs nothing beyond the message it carries; Twilio
 *   charges are per SMS/MMS sent or received plus the existing
 *   phone-number rental, NOT per API request. Verification below is
 *   a local HMAC — it makes zero Twilio API calls.
 * - Exactly ONE auto-text per missed call, deduped by CallSid (the
 *   store, not this module, owns the dedupe check). Redeliveries
 *   must never re-text.
 * - Exactly ONE reply per inbound thread step is the later,
 *   Boone-drafted step. This slice sends NO auto-reply to inbound
 *   SMS — it only logs the message. Auto-blasts are not a thing here.
 *
 * APPROVED VERBATIM WORDING — 2026-11-05 ~14:59 CST:
 * MISSED_CALL_AUTO_TEXT below is the missed-call auto-text Bubba
 * approved verbatim ("Nothing needs to change on any of it, I read
 * through them all and thought you did great, never sterile, warm
 * but not going over the top, and professional."). Source:
 * micro-titan-g7-discovery-wording-DRAFT-2026-11-05.md, section 1.
 * Use it EXACTLY, no paraphrasing in code.
 *
 * What this slice deliberately does NOT do:
 * - No call recording, no transcription, no voice AI. Recording
 *   needs an attorney check first (Texas one-party consent;
 *   disclosure is the clean move) — it is never enabled here, and
 *   there is no recording/transcription path in this code at all.
 * - No phone tree, no fake live answer, no callback promise.
 *   An inbound voice request gets a TwiML <Reject>, which is honest:
 *   we do not take live calls. Twilio's "A call comes in" webhook
 *   always includes CallStatus=ringing, so ringing (and queued,
 *   unless Direction says the call is outbound) is that request,
 *   not a terminal status callback.
 * - No number purchases, no A2P re-registration, no paid add-ons.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Missed-call auto-text — APPROVED VERBATIM by Bubba 2026-11-05
 * ~14:59 CST. Source: micro-titan-g7-discovery-wording-DRAFT-2026-11-05.md,
 * section 1. Do not paraphrase, shorten, or reword this constant.
 */
export const MISSED_CALL_AUTO_TEXT =
  "Hi \u2014 this is Micro Titan. We missed your call, sorry about that. " +
  "We work by text first, so just reply here and a real agent will pick it up.\n\n" +
  "You can:\n" +
  "1. Reply to this text\n" +
  "2. Send a photo or document here\n" +
  "3. Start an intake: micro-titan.com/intake\n" +
  "4. Book a discovery call: micro-titan.com/book-discovery\n\n" +
  "Nothing is booked, charged, or changed until you say so.";

export const DEFAULT_DAILY_AUTO_TEXT_CAP = 25;
export const MAX_DAILY_AUTO_TEXT_CAP = 1000;
export const MAX_BODY_CHARS = 2000;
export const INBOUND_RATE_LIMIT_PER_15_MIN = 20;

export type TwilioEvent =
  | {
      kind: "sms";
      messageSid: string;
      from: string;
      to: string;
      body: string;
      mediaCount: number;
    }
  | {
      kind: "voice_status";
      callSid: string;
      from: string;
      to: string;
      callStatus: string;
      durationSeconds: number;
    }
  | { kind: "voice_incoming"; callSid: string; from: string; to: string }
  | { kind: "unknown" };

/** Call statuses that mean "nobody live picked this up". */
export const MISSED_CALL_STATUSES = ["no-answer", "busy", "failed", "canceled"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asInt(value: unknown): number {
  const n = Number.parseInt(asString(value), 10);
  return Number.isFinite(n) ? n : 0;
}

export function truncateBody(body: string, maxChars = MAX_BODY_CHARS): string {
  const trimmed = body.trim();
  return trimmed.length > maxChars ? trimmed.slice(0, maxChars) : trimmed;
}

/**
 * Twilio request validation, per Twilio's own algorithm: sort the
 * POST parameters alphabetically, append each value to the full
 * request URL, HMAC-SHA1 with the auth token, base64-encode, and
 * compare in constant time. The URL must be exactly the URL Twilio
 * called (the webhook URL configured in the Twilio console) — a
 * trailing-slash or host difference will fail validation, by design.
 */
export function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null,
  authToken: string,
): boolean {
  if (!url || !authToken || !signature) return false;
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);
  const expected = createHmac("sha1", authToken).update(data, "utf8").digest("base64");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  try {
    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * The "A call comes in" webhook always includes CallStatus=ringing,
 * so a CallSid plus ringing is the TwiML request, not a status
 * callback. queued is the same request unless Direction is outbound
 * (outbound-api / outbound-dial), which is a status signal for a
 * call we placed. Terminal statuses stay voice_status.
 */
function isInboundVoiceRequest(callStatus: string, direction: string): boolean {
  const status = callStatus.toLowerCase();
  if (status === "ringing") return true;
  if (status !== "queued") return false;
  return !direction.toLowerCase().startsWith("outbound");
}

/** Parse Twilio's form-encoded webhook body into a typed event. */
export function parseTwilioEvent(params: Record<string, string>): TwilioEvent {
  const from = asString(params.From).slice(0, 32);
  const to = asString(params.To).slice(0, 32);
  if (params.MessageSid) {
    return {
      kind: "sms",
      messageSid: asString(params.MessageSid),
      from,
      to,
      body: truncateBody(asString(params.Body)),
      mediaCount: asInt(params.NumMedia),
    };
  }
  if (params.CallSid) {
    const callStatus = asString(params.CallStatus);
    if (callStatus && !isInboundVoiceRequest(callStatus, asString(params.Direction))) {
      return {
        kind: "voice_status",
        callSid: asString(params.CallSid),
        from,
        to,
        callStatus,
        durationSeconds: asInt(params.CallDuration),
      };
    }
    return { kind: "voice_incoming", callSid: asString(params.CallSid), from, to };
  }
  return { kind: "unknown" };
}

/**
 * A voice status event is a missed call when its status is a missed
 * status, or when it completed with zero seconds — in this design
 * nothing ever answers, so a zero-second completion is a miss, not
 * a conversation. A completed call with duration > 0 is NOT a miss
 * and must not trigger an auto-text.
 */
export function isMissedCall(event: TwilioEvent): boolean {
  if (event.kind !== "voice_status") return false;
  if (MISSED_CALL_STATUSES.includes(event.callStatus)) return true;
  return event.callStatus === "completed" && event.durationSeconds === 0;
}

/** Daily cap parsing: env value wins when it is a plain integer 0..1000. */
export function parseDailyCap(raw: string | undefined): number {
  if (raw !== undefined && /^\d+$/.test(raw.trim())) {
    const n = Number.parseInt(raw.trim(), 10);
    if (n <= MAX_DAILY_AUTO_TEXT_CAP) return n;
  }
  return DEFAULT_DAILY_AUTO_TEXT_CAP;
}

/** True when the daily auto-text budget is already spent. 0 disables sends. */
export function isCapReached(sentToday: number, cap: number): boolean {
  return sentToday >= cap;
}
