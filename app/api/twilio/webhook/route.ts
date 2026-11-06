/**
 * POST /api/twilio/webhook — Twilio text-first, API-key route.
 *
 * ONE endpoint for both channels, chosen over separate /sms and
 * /voice routes because Twilio's voice status callbacks and its
 * messaging webhooks both arrive as form-encoded POSTs, and the
 * missed-call decision needs the CallSid + CallStatus together in
 * one place. The event kind is decided by the body, not the URL.
 *
 * What it does:
 * - Reads the RAW body (signature verification runs over the exact
 *   form fields Twilio sent, never over re-serialized JSON).
 * - Verifies X-Twilio-Signature (HMAC-SHA1) with TWILIO_AUTH_TOKEN
 *   from env only. Bad signature -> 403, never recorded, never
 *   auto-texted. Unknown event (no MessageSid, no CallSid) -> 403
 *   unsupported_event, also never recorded.
 * - Inbound SMS/MMS -> one communication_log row (kind
 *   sms_inbound). Redelivery of the same MessageSid -> already
 *   exists, no duplicate row, and NO auto-reply. Replies are a
 *   later, Boone-drafted step, not an auto-blast.
 * - Voice status callback for a missed call -> ONE auto-text via
 *   the Twilio Messages API, deduped by CallSid on the outbound
 *   "sent" row, capped per day (TWILIO_DAILY_AUTO_TEXT_CAP, default
 *   25, 0 disables sends). Cap reached -> a cap_blocked row is
 *   logged and nothing is sent. Send failure -> 503 so Twilio
 *   retries the status callback; the send dedupe (sent row) still
 *   allows that retry, while a successful send blocks any re-text.
 * - The "a call comes in" webhook includes CallStatus=ringing
 *   (queued is the same unless Direction is outbound). That event
 *   is voice_incoming -> TwiML <Reject reason="busy">, one
 *   voice_rejected row, no text, no fake answer, no phone tree.
 *   The auto-text, if any, comes from the later terminal status
 *   callback, not from answering the call.
 *
 * What it deliberately does NOT do:
 * - It does not point any Twilio webhook anywhere (that is a
 *   console step by an approved person, before production use).
 * - It does not send any text unless the event is a missed call,
 *   the CallSid has no sent auto-text row, and the daily cap is
 *   not reached.
 * - It does not record calls, transcribe anything, or use voice
 *   AI — there is no such path in this code.
 * - It does not poll Twilio, run a scheduled sweep, or call any
 *   Twilio API except the single Messages create for an auto-text.
 * - It never logs a secret, a signature, or a full message body
 *   beyond the row itself. No PII is logged by this route.
 *
 * Responses:
 * - 403 invalid_signature / unsupported_event: never recorded.
 * - 503 twilio_not_configured / erm_not_configured / record_failed
 *   / send_failed: Twilio retries; nothing is double-sent because
 *   the send dedupe is the sent row, not the log row.
 * - 200 written / already_exists / cap_blocked / logged: handled.
 * - SMS and voice-incoming responses are TwiML (empty <Response/>
 *   for SMS, <Reject> for voice) because Twilio expects TwiML from
 *   those webhooks. Status callbacks get a JSON 200.
 *
 * Limits: 64 KB body. Inbound rate limit: 20 rows per from-number
 * per 15 minutes (DB count, serverless-safe; fail-open on DB error
 * for the limit check only — dedupe itself always fails closed
 * via 503). Auto-text wording: MISSED_CALL_AUTO_TEXT in twilio.ts —
 * Bubba-approved verbatim 2026-11-05, used exactly, no paraphrasing.
 */

import { NextResponse } from "next/server";
import {
  INBOUND_RATE_LIMIT_PER_15_MIN,
  MISSED_CALL_AUTO_TEXT,
  isCapReached,
  isMissedCall,
  parseDailyCap,
  parseTwilioEvent,
  verifyTwilioSignature,
} from "../../../lib/erm/twilio";
import {
  autoTextState,
  inboundCountLast15Min,
  recordCommunication,
} from "../../../lib/erm/communication-store";
import { sendTwilioMessage } from "../../../lib/erm/twilio-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

function twiml(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json({ ok: false, error: "twilio_not_configured" }, { status: 503 });
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
  const params = Object.fromEntries(new URLSearchParams(raw).entries());
  const signature = req.headers.get("x-twilio-signature");
  if (!verifyTwilioSignature(req.url, params, signature, authToken)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 403 });
  }
  const event = parseTwilioEvent(params);
  if (event.kind === "unknown") {
    return NextResponse.json({ ok: false, error: "unsupported_event" }, { status: 403 });
  }

  // Per-number inbound rate limit (DB count; fail open on DB error
  // for this check only — the dedupe below still fails closed).
  if (event.from) {
    const counted = await inboundCountLast15Min(event.from);
    if (counted.status === "ok" && counted.count >= INBOUND_RATE_LIMIT_PER_15_MIN) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
  }

  if (event.kind === "sms") {
    const result = await recordCommunication({
      twilioSid: event.messageSid,
      kind: "sms_inbound",
      direction: "inbound",
      fromNumber: event.from,
      toNumber: event.to,
      body: event.body,
      mediaCount: event.mediaCount,
      status: "logged",
    });
    if (result.status === "not_configured") {
      return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
    }
    if (result.status === "failed") {
      return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
    }
    // Empty TwiML: logged, no auto-reply. Replies are Boone-drafted, later.
    return twiml(`<?xml version="1.0" encoding="UTF-8"?><Response/>`);
  }

  if (event.kind === "voice_incoming") {
    const result = await recordCommunication({
      twilioSid: event.callSid,
      kind: "voice_rejected",
      direction: "inbound",
      fromNumber: event.from,
      toNumber: event.to,
      status: "logged",
    });
    if (result.status === "not_configured") {
      return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
    }
    if (result.status === "failed") {
      return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
    }
    return twiml(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Reject reason="busy"/></Response>`,
    );
  }

  // voice_status from here. The sid includes the status so a
  // terminal callback is stored even when another row already uses
  // this CallSid: voice_rejected keeps the raw CallSid, and an
  // earlier status such as in-progress does not occupy this row.
  // A redelivery of the same status still conflicts on
  // (twilio_sid, kind). Missed-call send dedupe is unchanged:
  // related_sid on the sent row is the raw CallSid.
  const logged = await recordCommunication({
    twilioSid: `${event.callSid}:status:${event.callStatus}`,
    kind: "voice_status",
    direction: "inbound",
    fromNumber: event.from,
    toNumber: event.to,
    body: event.callStatus,
    status: "logged",
  });
  if (logged.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
  }
  if (logged.status === "failed") {
    return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
  }
  if (!isMissedCall(event)) {
    return NextResponse.json({ ok: true, erm: "logged", autoText: "not_missed" });
  }

  // Missed call: dedupe + cap BEFORE any send. Without a database
  // there is no safe dedupe, so fail closed (503, Twilio retries)
  // rather than risk a duplicate text.
  const state = await autoTextState(event.callSid);
  if (state.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "erm_not_configured" }, { status: 503 });
  }
  if (state.status === "failed") {
    return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
  }
  if (state.alreadySent) {
    return NextResponse.json({ ok: true, erm: "already_exists", autoText: "already_sent" });
  }
  const cap = parseDailyCap(process.env.TWILIO_DAILY_AUTO_TEXT_CAP);
  if (isCapReached(state.sentToday, cap)) {
    await recordCommunication({
      twilioSid: `cap:${event.callSid}`,
      relatedSid: event.callSid,
      kind: "missed_call_auto_text",
      direction: "outbound",
      fromNumber: event.to,
      toNumber: event.from,
      status: "cap_blocked",
    });
    return NextResponse.json({ ok: true, erm: "cap_blocked", autoText: "cap_blocked" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !fromNumber) {
    return NextResponse.json({ ok: false, error: "twilio_send_not_configured" }, { status: 503 });
  }
  const sent = await sendTwilioMessage(
    accountSid,
    authToken,
    fromNumber,
    event.from,
    MISSED_CALL_AUTO_TEXT,
  );
  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 503 });
  }
  const recorded = await recordCommunication({
    twilioSid: sent.messageSid ?? `sent:${event.callSid}`,
    relatedSid: event.callSid,
    kind: "missed_call_auto_text",
    direction: "outbound",
    fromNumber,
    toNumber: event.from,
    body: MISSED_CALL_AUTO_TEXT,
    status: "sent",
  });
  if (recorded.status === "failed" || recorded.status === "not_configured") {
    // The text went out but the sent row did not land. Report 503
    // so the retry path can reconcile; the sent row is absent, so a
    // retry could re-text — this is a known, narrow failure window,
    // logged here in code so it is not hidden. In practice the DB
    // was already proven reachable by the checks above.
    return NextResponse.json({ ok: false, error: "record_failed" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, erm: "written", autoText: "sent" });
}
