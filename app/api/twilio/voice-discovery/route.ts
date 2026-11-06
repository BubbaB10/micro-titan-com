/**
 * POST /api/twilio/voice-discovery — TwiML for one consented
 * discovery call. Preview only. This route does not dial, does not
 * send a text, and does not change /api/twilio/webhook (inbound
 * calls there stay rejected).
 *
 * Off unless VOICE_DISCOVERY_ENABLED=true. Merging this file with
 * the flag unset returns <Reject> and never opens a Media Stream,
 * so a live Twilio number pointed at the existing webhook is
 * unchanged, and a number pointed here by mistake is not answered
 * by the agent.
 *
 * When the flag is on, in order:
 * - TWILIO_AUTH_TOKEN must be set (env only, never in code).
 * - X-Twilio-Signature is verified over the raw form body, same
 *   algorithm as /api/twilio/webhook. A bad signature is 403 and
 *   is not recorded.
 * - VOICE_BRIDGE_HOST must be the Railway hostname (no scheme).
 * - The signed URL must carry reference, sessionKey, and consentAt.
 *   consentAt is the booking-consent timestamp. Without it the
 *   call is rejected and nothing is spoken.
 * - The reference must already exist in intakes. The lookup is
 *   read-only. No database, or an unknown reference, rejects:
 *   the stream does not start for an unconfirmed intake.
 *
 * Success TwiML speaks nothing. It is only:
 *   <Connect><Stream url="wss://${VOICE_BRIDGE_HOST}/twilio-stream?reference=...&sessionKey=...&consentAt=..."/></Connect>
 * The agent's first spoken line is VOICE_CALL_OPENING, inside the
 * bridge. This route adds no spoken verb of its own.
 *
 * This route never calls the Twilio REST API.
 */

import { NextResponse } from "next/server";
import { voiceIntakeExists } from "../../../lib/erm/discovery-call-store";
import { verifyTwilioSignature } from "../../../lib/erm/twilio";
import {
  VOICE_DISCOVERY_REJECT_TWIML,
  decideVoiceDiscovery,
  voiceDiscoveryEnabled,
} from "../../../lib/erm/voice-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

function twiml(body: string, reason: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "X-Voice-Discovery": reason,
    },
  });
}

function render(
  decision:
    | { action: "reject"; reason: string }
    | { action: "error"; status: 503 | 403; error: string }
    | { action: "stream"; twiml: string },
): Response {
  if (decision.action === "error") {
    return NextResponse.json({ ok: false, error: decision.error }, { status: decision.status });
  }
  if (decision.action === "stream") return twiml(decision.twiml, "stream");
  return twiml(VOICE_DISCOVERY_REJECT_TWIML, decision.reason);
}

export async function POST(req: Request) {
  // Flag first, before the body is read and before any intake lookup.
  if (!voiceDiscoveryEnabled(process.env.VOICE_DISCOVERY_ENABLED)) {
    return twiml(VOICE_DISCOVERY_REJECT_TWIML, "disabled");
  }
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
  const signatureOk = verifyTwilioSignature(req.url, params, signature, authToken);
  const searchParams = new URL(req.url).searchParams;
  const hostRaw = process.env.VOICE_BRIDGE_HOST;
  const decision = decideVoiceDiscovery({
    enabled: true,
    authTokenPresent: true,
    signatureOk,
    hostRaw,
    searchParams,
  });
  if (decision.action !== "lookup") return render(decision);
  const intake = await voiceIntakeExists(decision.reference);
  const intakeStatus =
    intake.status === "found" || intake.status === "not_found" || intake.status === "not_configured"
      ? intake.status
      : "failed";
  const after = decideVoiceDiscovery({
    enabled: true,
    authTokenPresent: true,
    signatureOk: true,
    hostRaw,
    searchParams,
    intakeStatus,
  });
  if (after.action === "lookup") {
    return twiml(VOICE_DISCOVERY_REJECT_TWIML, "intake_lookup_failed");
  }
  return render(after);
}
