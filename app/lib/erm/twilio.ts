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
 * PLACEHOLDER WARNING — read before merging:
 * MISSED_CALL_AUTO_TEXT_PLACEHOLDER below is NOT Bubba-approved
 * verbatim wording. Draft wording exists elsewhere, but it is also
 * not approved verbatim, so neither is used as if it were. Before
 * this PR merges, Bubba must approve the exact auto-text wording
 * and this constant must be replaced with it. Do not point a
 * Twilio webhook at this route with placeholder wording in place.
 *
 * What this slice deliberately does NOT do:
 * - No call recording, no transcription, no voice AI. Recording
 *   needs an attorney check first (Texas one-party consent;
 *   disclosure is the clean move) — it is never enabled here, and
 *   there is no recording/transcription path in this code at all.
 * - No phone tree, no fake live answer, no callback promise.
 *   An inbound voice request that is not a status callback gets a
 *   TwiML <Reject>, which is honest: we do not take live calls.
 * - No number purchases, no A2P re-registration, no paid add-ons.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * PLACEHOLDER auto-text — NOT approved verbatim. Replace with
 * Bubba's exact approved wording before merge. It offers the four
 * decided options (reply by text, send photo/document, start an
 * intake, book a discovery call) without claiming approved copy.
 */
export const MISSED_CALL_AUTO_TEXT_PLACEHOLDER =
  "Hi, this is Micro Titan. We missed your call — we don't take live " +
  "support calls, but a real agent can help right here by text. " +
  "[PLACEHOLDER WORDING — verbatim text requires Bubba's approval " +
  "before this is ever sent.] Reply with what you're trying to get " +
  "done, send a photo if it helps, start an intake at " +
  "micro-titan.com/intake, or book a discovery call at " +
  "micro-titan.com/book-discovery.";

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
    if (params.CallStatus) {
      return {
        kind: "voice_status",
        callSid: asString(params.CallSid),
        from,
        to,
        callStatus: asString(params.CallStatus),
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
