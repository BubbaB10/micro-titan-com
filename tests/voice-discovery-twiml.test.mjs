// node --test tests/voice-discovery-twiml.test.mjs
// The TwiML slice is off unless VOICE_DISCOVERY_ENABLED=true.
// No database, no network, no Twilio account, no call. Sample
// references are invented fixtures, not clients.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHmac } from "node:crypto";
import { fileURLToPath } from "node:url";
import { verifyTwilioSignature } from "../app/lib/erm/twilio.ts";
import { voiceIntakeExists } from "../app/lib/erm/discovery-call-store.ts";
import {
  VOICE_DISCOVERY_REJECT_TWIML,
  buildVoiceDiscoveryTwiml,
  decideVoiceDiscovery,
  voiceDiscoveryEnabled,
  voiceStreamToken,
} from "../app/lib/erm/voice-discovery.ts";
import { voiceStreamToken as bridgeStreamToken } from "../voice-bridge/stream-auth.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const routeSource = read("app/api/twilio/voice-discovery/route.ts");
const webhookSource = read("app/api/twilio/webhook/route.ts");
const storeSource = read("app/lib/erm/discovery-call-store.ts");

const TOKEN = "test_only_not_a_real_auth_token";
const STREAM_SECRET = "test_only_stream_secret";
const HOST = "bridge.example.test";
const REFERENCE = "MT-20261105-TEST";
const SESSION = "CA-test-1";
const CONSENT = "2026-11-05T20:55:00.000Z";

function params() {
  return new URLSearchParams({
    reference: REFERENCE,
    sessionKey: SESSION,
    consentAt: CONSENT,
  });
}

function sign(url, bodyParams, token = TOKEN) {
  const data = Object.keys(bodyParams)
    .sort()
    .reduce((acc, key) => acc + key + bodyParams[key], url);
  return createHmac("sha1", token).update(data, "utf8").digest("base64");
}

test("the flag is on only for the exact string true", () => {
  assert.equal(voiceDiscoveryEnabled("true"), true);
  assert.equal(voiceDiscoveryEnabled(undefined), false);
  assert.equal(voiceDiscoveryEnabled(""), false);
  assert.equal(voiceDiscoveryEnabled("TRUE"), false);
  assert.equal(voiceDiscoveryEnabled("1"), false);
  assert.equal(voiceDiscoveryEnabled("false"), false);
});

test("disabled rejects even a known consented intake, and speaks nothing", () => {
  const decision = decideVoiceDiscovery({
    enabled: false,
    authTokenPresent: true,
    signatureOk: true,
    hostRaw: HOST,
    searchParams: params(),
    intakeStatus: "found",
  });
  assert.equal(decision.action, "reject");
  assert.equal(decision.reason, "disabled");
  assert.equal(VOICE_DISCOVERY_REJECT_TWIML.includes("<Stream"), false);
  assert.equal(VOICE_DISCOVERY_REJECT_TWIML.includes("<Say"), false);
  assert.match(VOICE_DISCOVERY_REJECT_TWIML, /<Reject reason="busy"\/>/);
});

test("a bad signature is 403 and does not look up or stream", () => {
  const decision = decideVoiceDiscovery({
    enabled: true,
    authTokenPresent: true,
    signatureOk: false,
    hostRaw: HOST,
    searchParams: params(),
    intakeStatus: "found",
  });
  assert.deepEqual(decision, { action: "error", status: 403, error: "invalid_signature" });
});

test("missing Twilio token and missing bridge host fail closed", () => {
  assert.deepEqual(
    decideVoiceDiscovery({
      enabled: true,
      authTokenPresent: false,
      signatureOk: true,
      hostRaw: HOST,
      searchParams: params(),
    }),
    { action: "error", status: 503, error: "twilio_not_configured" },
  );
  assert.deepEqual(
    decideVoiceDiscovery({
      enabled: true,
      authTokenPresent: true,
      signatureOk: true,
      hostRaw: undefined,
      searchParams: params(),
    }),
    { action: "error", status: 503, error: "voice_bridge_not_configured" },
  );
});

test("consent, reference, and session key are required before any lookup", () => {
  const noConsent = new URLSearchParams({ reference: REFERENCE, sessionKey: SESSION });
  assert.equal(
    decideVoiceDiscovery({
      enabled: true,
      authTokenPresent: true,
      signatureOk: true,
      hostRaw: HOST,
      searchParams: noConsent,
    }).reason,
    "consent_required",
  );
  const badRef = new URLSearchParams({ reference: "nope", sessionKey: SESSION, consentAt: CONSENT });
  assert.equal(
    decideVoiceDiscovery({
      enabled: true,
      authTokenPresent: true,
      signatureOk: true,
      hostRaw: HOST,
      searchParams: badRef,
    }).reason,
    "bad_reference",
  );
  const ready = decideVoiceDiscovery({
    enabled: true,
    authTokenPresent: true,
    signatureOk: true,
    hostRaw: `wss://${HOST}`,
    searchParams: params(),
  });
  assert.equal(ready.action, "lookup");
  assert.equal(ready.reference, REFERENCE);
  assert.equal(ready.host, HOST);
});

test("an unconfirmed or unknown intake does not stream; a known one does, and speaks nothing extra", () => {
  for (const intakeStatus of ["not_found", "not_configured", "failed"]) {
    const decision = decideVoiceDiscovery({
      enabled: true,
      authTokenPresent: true,
      signatureOk: true,
      hostRaw: HOST,
      searchParams: params(),
      intakeStatus,
    });
    assert.equal(decision.action, "reject", intakeStatus);
    assert.equal(decision.twiml, undefined);
  }
  const missingSecret = decideVoiceDiscovery({
    enabled: true,
    authTokenPresent: true,
    signatureOk: true,
    hostRaw: HOST,
    searchParams: params(),
    intakeStatus: "found",
  });
  assert.deepEqual(missingSecret, { action: "error", status: 503, error: "stream_secret_not_configured" });
  const stream = decideVoiceDiscovery({
    enabled: true,
    authTokenPresent: true,
    signatureOk: true,
    hostRaw: HOST,
    searchParams: params(),
    streamSecret: STREAM_SECRET,
    intakeStatus: "found",
  });
  assert.equal(stream.action, "stream");
  const twiml = stream.twiml;
  assert.equal(twiml, buildVoiceDiscoveryTwiml({
    host: HOST,
    reference: REFERENCE,
    sessionKey: SESSION,
    consentAt: CONSENT,
    streamSecret: STREAM_SECRET,
  }));
  assert.match(twiml, /<Response><Connect><Stream url="wss:\/\/bridge\.example\.test\/twilio-stream">/);
  assert.doesNotMatch(twiml, /twilio-stream\?/);
  assert.doesNotMatch(twiml, /<Say|<Play|<Gather|<Dial|<Pause/);
  const token = voiceStreamToken(STREAM_SECRET, REFERENCE, SESSION, CONSENT);
  assert.equal(token, bridgeStreamToken(STREAM_SECRET, REFERENCE, SESSION, CONSENT));
  for (const [name, value] of [
    ["reference", REFERENCE],
    ["sessionKey", SESSION],
    ["consentAt", CONSENT],
    ["streamToken", token],
  ]) {
    assert.match(twiml, new RegExp(`<Parameter name="${name}" value="${value}"/>`));
  }
  assert.equal(twiml.includes(STREAM_SECRET), false);
});

test("signature helper agrees with the route's verifier, and the token is not in the TwiML", () => {
  const url = `https://example.test/api/twilio/voice-discovery?reference=${REFERENCE}&sessionKey=${SESSION}&consentAt=${encodeURIComponent(CONSENT)}`;
  const body = { CallSid: "CA_test_only", From: "+15555550100", To: "+15555550199" };
  const signature = sign(url, body);
  assert.equal(verifyTwilioSignature(url, body, signature, TOKEN), true);
  assert.equal(verifyTwilioSignature(url, body, signature, "other"), false);
  const twiml = buildVoiceDiscoveryTwiml({
    host: HOST,
    reference: REFERENCE,
    sessionKey: SESSION,
    consentAt: CONSENT,
    streamSecret: STREAM_SECRET,
  });
  assert.equal(twiml.includes(TOKEN), false);
});

test("without a database the intake lookup is not_configured and writes nothing", async () => {
  const previous = process.env.ERM_DATABASE_URL;
  const previousFallback = process.env.ERM_DATABASE_DATABASE_URL;
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  try {
    assert.deepEqual(await voiceIntakeExists(REFERENCE), { status: "not_configured" });
  } finally {
    if (previous === undefined) delete process.env.ERM_DATABASE_URL;
    else process.env.ERM_DATABASE_URL = previous;
    if (previousFallback === undefined) delete process.env.ERM_DATABASE_DATABASE_URL;
    else process.env.ERM_DATABASE_DATABASE_URL = previousFallback;
  }
  assert.match(storeSource, /export async function voiceIntakeExists/);
  assert.match(storeSource, /SELECT id FROM intakes WHERE reference = \$1/);
  const fn = storeSource.slice(storeSource.indexOf("export async function voiceIntakeExists"));
  assert.doesNotMatch(fn, /INSERT|UPDATE|DELETE/);
});

test("the TwiML route is gated and the existing webhook still rejects inbound calls", () => {
  assert.match(routeSource, /VOICE_DISCOVERY_ENABLED/);
  assert.match(routeSource, /voiceDiscoveryEnabled\(process\.env\.VOICE_DISCOVERY_ENABLED\)/);
  assert.match(routeSource, /verifyTwilioSignature/);
  assert.match(routeSource, /TWILIO_AUTH_TOKEN/);
  assert.match(routeSource, /voiceIntakeExists/);
  assert.match(routeSource, /decideVoiceDiscovery/);
  assert.match(routeSource, /VOICE_BRIDGE_STREAM_SECRET/);
  const post = routeSource.slice(routeSource.indexOf("export async function POST"));
  const enabledAt = post.indexOf("voiceDiscoveryEnabled");
  const textAt = post.indexOf("req.text()");
  const lookupAt = post.indexOf("voiceIntakeExists(");
  const signatureAt = post.indexOf("verifyTwilioSignature(");
  assert.ok(enabledAt >= 0 && enabledAt < textAt, "flag is checked before the body is read");
  assert.ok(signatureAt < lookupAt, "signature is checked before the intake lookup");
  assert.doesNotMatch(routeSource, /fetch\(/);
  assert.doesNotMatch(routeSource, /api\.twilio\.com/);
  assert.doesNotMatch(routeSource, /<Say/);
  // The inbound webhook is untouched in behaviour: it still rejects
  // voice, and it does not know about this stream.
  assert.match(webhookSource, /<Reject reason="busy"\/>/);
  assert.doesNotMatch(webhookSource, /twilio-stream/);
  assert.doesNotMatch(webhookSource, /VOICE_DISCOVERY_ENABLED/);
  assert.doesNotMatch(webhookSource, /voice-discovery/);
});
