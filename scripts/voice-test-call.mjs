// First TEST call for the Railway voice bridge. Places nothing unless
// --confirm is passed. No secrets belong in this file.
//
// Twilio does not forward query strings on <Stream>. The script puts
// reference, sessionKey, consentAt, and streamToken on <Parameter>
// elements. streamToken is HMAC-SHA256 of reference|sessionKey|consentAt
// keyed by VOICE_BRIDGE_STREAM_SECRET (same value as on Railway).
// The bridge opens Gemini only after that token checks out.
// It does not look up the ERM before audio starts.
// When the call ends it POSTs the transcript to
// /api/ops/discovery-voice-complete, which stores the row only if
// that intake reference already exists.
//
// TEST intake (not a client). Run by hand in the ERM SQL editor
// before the call if the transcript should be kept. Status
// "received" so the write does not move the intake to
// discovery_booked.
//
//   INSERT INTO clients (name, contact_email, contact_phone, lane, agent_preference)
//   VALUES ('TEST voice bridge', 'test-voice@example.invalid', '', 'Solo entrepreneur', 'Gemini by Google')
//   RETURNING id;
//
//   INSERT INTO intakes (client_id, reference, lane, plate, answers, status, next_action, source)
//   VALUES ('<client-id from above>', 'MT-20261107-TEST', 'Solo entrepreneur',
//           'TEST — not a client. Voice bridge test call.', '[]'::jsonb,
//           'received', 'TEST voice call only', 'voice-bridge-test');
//
// Without an intake row the call still connects. The transcript POST
// returns intake_not_found and the bridge logs that. Nothing here
// sends the no-answer text.
//
// Dry run (no Twilio request):
//   TWILIO_ACCOUNT_SID=AC... TWILIO_AUTH_TOKEN=... TWILIO_PHONE_NUMBER=+1... \
//   VOICE_BRIDGE_STREAM_SECRET=... \
//   node scripts/voice-test-call.mjs --to +1... --reference MT-20261107-TEST
//
// Place the one call (owner only, after reading the dry run):
//   ...same env... node scripts/voice-test-call.mjs --to +1... --reference MT-20261107-TEST --confirm

import { pathToFileURL } from "node:url";
import { buildVoiceDiscoveryTwiml, voiceBridgeHost } from "../app/lib/erm/voice-discovery.ts";

/** Public Railway hostname. Override with VOICE_BRIDGE_HOST. Not a secret. */
export const DEFAULT_VOICE_BRIDGE_HOST = "voice-bridge-production-5a71.up.railway.app";

/** Only a reference whose suffix is TEST. A real intake reference is refused. */
export const TEST_REFERENCE_RE = /^MT-\d{8}-TEST$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

export function voiceTestSessionKey(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `voice-test-${stamp}`;
}

export function parseVoiceTestCallArgs(argv) {
  const out = { to: "", reference: "", confirm: false };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--confirm") {
      out.confirm = true;
      continue;
    }
    if (arg === "--to") {
      out.to = args[++i] ?? "";
      continue;
    }
    if (arg === "--reference") {
      out.reference = args[++i] ?? "";
      continue;
    }
    return { ok: false, error: "unknown_argument", argument: arg };
  }
  return { ok: true, ...out };
}

/**
 * Decide whether this process may build a Twilio call. dry_run is the
 * default: the plan is complete and no request is made. place is
 * returned only when confirm is true and every check passed.
 * The auth token is never copied onto the dry-run plan.
 */
export function planVoiceTestCall(input) {
  const to = typeof input.to === "string" ? input.to.trim() : "";
  const reference = typeof input.reference === "string" ? input.reference.trim() : "";
  if (!E164_RE.test(to)) return { action: "error", error: "bad_destination" };
  if (!TEST_REFERENCE_RE.test(reference)) return { action: "error", error: "reference_not_test" };
  const from = typeof input.from === "string" ? input.from.trim() : "";
  const accountSid = typeof input.accountSid === "string" ? input.accountSid.trim() : "";
  const authToken = typeof input.authToken === "string" ? input.authToken.trim() : "";
  const streamSecret = typeof input.streamSecret === "string" ? input.streamSecret.trim() : "";
  const missing = [];
  if (!accountSid) missing.push("TWILIO_ACCOUNT_SID");
  if (!authToken) missing.push("TWILIO_AUTH_TOKEN");
  if (!E164_RE.test(from)) missing.push("TWILIO_PHONE_NUMBER");
  if (!streamSecret) missing.push("VOICE_BRIDGE_STREAM_SECRET");
  if (missing.length > 0) return { action: "error", error: "missing_env", missing };
  const host = voiceBridgeHost(input.bridgeHost || DEFAULT_VOICE_BRIDGE_HOST);
  if (!host) return { action: "error", error: "bad_bridge_host" };
  const now = input.now instanceof Date ? input.now : new Date();
  const sessionKey = voiceTestSessionKey(now);
  const consentAt = now.toISOString();
  const twiml = buildVoiceDiscoveryTwiml({ host, reference, sessionKey, consentAt, streamSecret });
  const streamUrl = `wss://${host}/twilio-stream`;
  const plan = { to, from, reference, sessionKey, consentAt, bridgeHost: host, streamUrl, twiml };
  if (!input.confirm) return { action: "dry_run", plan };
  return {
    action: "place",
    plan,
    request: buildVoiceTestCallRequest({ accountSid, authToken, from, to, twiml }),
  };
}

/** Twilio Calls create with inline TwiML. Token is only in the Authorization header. */
export function buildVoiceTestCallRequest({ accountSid, authToken, from, to, twiml }) {
  const credentials = Buffer.from(`${accountSid}:${authToken}`, "utf8").toString("base64");
  return {
    url: `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Calls.json`,
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Twiml: twiml }).toString(),
  };
}

function publicPlan(plan) {
  return {
    to: plan.to,
    from: plan.from,
    reference: plan.reference,
    sessionKey: plan.sessionKey,
    consentAt: plan.consentAt,
    bridgeHost: plan.bridgeHost,
    streamUrl: plan.streamUrl,
    speaksExtra: /<Say|<Play|<Gather|<Dial/.test(plan.twiml),
    parameters: ["reference", "sessionKey", "consentAt", "streamToken"].filter((name) =>
      plan.twiml.includes(`name="${name}"`),
    ),
  };
}

async function main() {
  const parsed = parseVoiceTestCallArgs(process.argv);
  if (!parsed.ok) {
    console.log(JSON.stringify({ ok: false, error: parsed.error, argument: parsed.argument }));
    process.exit(2);
  }
  const decision = planVoiceTestCall({
    to: parsed.to,
    reference: parsed.reference,
    from: process.env.TWILIO_PHONE_NUMBER,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    streamSecret: process.env.VOICE_BRIDGE_STREAM_SECRET,
    bridgeHost: process.env.VOICE_BRIDGE_HOST,
    confirm: parsed.confirm,
  });
  if (decision.action === "error") {
    console.log(JSON.stringify({ ok: false, error: decision.error, missing: decision.missing ?? null }));
    process.exit(2);
  }
  if (decision.action === "dry_run") {
    console.log(
      JSON.stringify({
        ok: false,
        error: "confirm_required",
        calledTwilio: false,
        plan: publicPlan(decision.plan),
        hint: "Re-run the same command with --confirm to place this one call. This process did not contact Twilio.",
      }),
    );
    process.exit(2);
  }
  const req = decision.request;
  const res = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log(JSON.stringify({ ok: false, error: "twilio_call_failed", status: res.status, code: body.code ?? null }));
    process.exit(1);
  }
  console.log(
    JSON.stringify({
      ok: true,
      callSid: typeof body.sid === "string" ? body.sid : null,
      reference: decision.plan.reference,
      sessionKey: decision.plan.sessionKey,
    }),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.log(JSON.stringify({ ok: false, error: "voice_test_call_failed" }));
    console.error(String(err));
    process.exit(1);
  });
}
