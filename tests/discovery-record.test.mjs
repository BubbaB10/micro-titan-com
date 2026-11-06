// node --test tests/discovery-record.test.mjs — P1 item 6: discovery
// caller route so a paid discovery can write an ERM record.
// Pure-logic tests only: no database, no network, no credentials, no
// prospect data, no call made, no text sent. Sample references are
// invented test fixtures, not clients. The record shape already
// exists (recordDiscoveryCall, PR #34); this slice adds the caller:
// a token-gated owner route that accepts a completed transcript in
// either channel (text or voice), validates consent for voice,
// writes nothing for an unknown reference, is idempotent by
// session_key, and never advances an intake to setup.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_RECORDING_REF_CHARS,
  MAX_TRANSCRIPT_TURNS,
  MAX_TURN_TEXT_CHARS,
  validateDiscoveryTranscript,
  validateRecordingRef,
} from "../app/lib/erm/discovery-record.ts";
import { recordDiscoveryCall } from "../app/lib/erm/discovery-call-store.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "discovery-record.ts"),
  "utf8",
);
const routeSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "discovery-record", "route.ts"),
  "utf8",
);
const storeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "discovery-call-store.ts"),
  "utf8",
);

const goodTurns = [
  { speaker: "agent", text: "What do you want off your plate first?", at: "2026-11-06T12:00:00.000Z" },
  { speaker: "client", text: "Phone calls and invoicing.", at: "2026-11-06T12:01:00.000Z" },
];

test("Transcript: a valid text or voice transcript passes through verbatim", () => {
  const result = validateDiscoveryTranscript(goodTurns);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.turns, goodTurns);
});

test("Transcript: not an array, empty, or over 500 turns is rejected", () => {
  assert.deepEqual(validateDiscoveryTranscript("not a transcript"), {
    ok: false,
    errors: ["transcript_not_an_array"],
  });
  assert.deepEqual(validateDiscoveryTranscript([]), {
    ok: false,
    errors: ["transcript_empty"],
  });
  const tooMany = Array.from({ length: MAX_TRANSCRIPT_TURNS + 1 }, (_, i) => ({
    speaker: "agent",
    text: `turn ${i}`,
    at: "2026-11-06T12:00:00.000Z",
  }));
  assert.deepEqual(validateDiscoveryTranscript(tooMany), {
    ok: false,
    errors: ["transcript_too_long"],
  });
  assert.equal(MAX_TRANSCRIPT_TURNS, 500);
});

test("Transcript: a turn with a bad speaker, empty text, over-long text, or bad timestamp is rejected", () => {
  const badSpeaker = validateDiscoveryTranscript([
    { speaker: "system", text: "hello", at: "2026-11-06T12:00:00.000Z" },
  ]);
  assert.equal(badSpeaker.ok, false);
  if (!badSpeaker.ok) assert.ok(badSpeaker.errors.includes("turn_0_bad_speaker"));

  const emptyText = validateDiscoveryTranscript([
    { speaker: "agent", text: "   ", at: "2026-11-06T12:00:00.000Z" },
  ]);
  assert.equal(emptyText.ok, false);
  if (!emptyText.ok) assert.ok(emptyText.errors.includes("turn_0_empty_text"));

  const longText = validateDiscoveryTranscript([
    { speaker: "agent", text: "x".repeat(MAX_TURN_TEXT_CHARS + 1), at: "2026-11-06T12:00:00.000Z" },
  ]);
  assert.equal(longText.ok, false);
  if (!longText.ok) assert.ok(longText.errors.includes("turn_0_text_too_long"));
  assert.equal(MAX_TURN_TEXT_CHARS, 2000);

  const badTime = validateDiscoveryTranscript([
    { speaker: "agent", text: "hello", at: "not a date" },
  ]);
  assert.equal(badTime.ok, false);
  if (!badTime.ok) assert.ok(badTime.errors.includes("turn_0_bad_timestamp"));
});

test("Recording ref: absent is null; a provider SID passes; audio data is rejected", () => {
  assert.deepEqual(validateRecordingRef(undefined), { ok: true, recordingRef: null });
  assert.deepEqual(validateRecordingRef(null), { ok: true, recordingRef: null });
  assert.deepEqual(validateRecordingRef(""), { ok: true, recordingRef: null });
  assert.deepEqual(validateRecordingRef("RE0123456789abcdef"), {
    ok: true,
    recordingRef: "RE0123456789abcdef",
  });
  assert.deepEqual(validateRecordingRef("data:audio/wav;base64,AAAA"), {
    ok: false,
    error: "recording_ref_is_audio_data",
  });
  assert.deepEqual(validateRecordingRef("x".repeat(MAX_RECORDING_REF_CHARS + 1)), {
    ok: false,
    error: "recording_ref_too_long",
  });
  assert.deepEqual(validateRecordingRef(123), {
    ok: false,
    error: "recording_ref_not_a_string",
  });
  assert.equal(MAX_RECORDING_REF_CHARS, 200);
});

test("Store: gated on ERM_DATABASE_URL or the Neon fallback, never throws", async () => {
  const result = await recordDiscoveryCall({
    reference: "MT-20261106-TEST",
    sessionKey: "test-session-key",
    channel: "text",
    formatChoice: "text",
    status: "completed",
    consentGiven: false,
    transcript: goodTurns,
    recommendation: "approve",
    recommendationReason: "test fixture",
  });
  assert.equal(result.status, "not_configured");
});

test("Route: token-gated owner route — missing token 503, wrong token 401", () => {
  assert.ok(routeSource.includes("process.env.OPS_DASHBOARD_TOKEN"));
  assert.ok(routeSource.includes('error: "ops_not_configured"'));
  assert.ok(routeSource.includes('error: "unauthorized"'));
  assert.ok(routeSource.includes("`Bearer ${token}`"));
});

test("Route: both channels accepted, and channel must agree with formatChoice", () => {
  assert.ok(routeSource.includes('"text", "voice"'));
  assert.ok(routeSource.includes('"text", "call"'));
  assert.ok(routeSource.includes('error: "bad_channel"'));
  assert.ok(routeSource.includes('error: "bad_format_choice"'));
  assert.ok(routeSource.includes('(channel === "text") !== (formatChoice === "text")'));
});

test("Route: consent is the gate for voice only — text needs no recording consent", () => {
  assert.ok(routeSource.includes('channel === "voice" && b.consentGiven !== true'));
  assert.ok(routeSource.includes('error: "consent_required"'));
  // No blanket consent requirement: the check is inside the voice branch.
  assert.ok(!/if \(b\.consentGiven !== true\) \{\n    return NextResponse\.json\(\{ ok: false, error: "consent_required"/.test(routeSource));
});

test("Route: a text discovery carries no recording ref; voice refs are validated, never audio", () => {
  assert.ok(routeSource.includes('error: "recording_ref_not_for_text"'));
  assert.ok(routeSource.includes("validateRecordingRef(b.recordingRef)"));
  assert.ok(routeSource.includes("validateDiscoveryTranscript(b.transcript)"));
});

test("Route: unknown reference writes nothing (404); re-delivered session key returns already_exists", () => {
  assert.ok(routeSource.includes("recordDiscoveryCall({"));
  assert.ok(routeSource.includes('error: "intake_not_found"'));
  assert.ok(routeSource.includes("status: 404"));
  assert.ok(routeSource.includes("erm: result.status"));
  assert.ok(routeSource.includes("discoveryCallId: result.discoveryCallId"));
  // Idempotency lives in the store, on session_key.
  assert.ok(storeSource.includes("SELECT id FROM discovery_calls WHERE session_key = $1"));
  assert.ok(storeSource.includes('status: "already_exists"'));
  assert.ok(storeSource.includes('status: "intake_not_found"'));
});

test("Route + store: a completed discovery never advances an intake to setup", () => {
  // The route never touches intake status at all.
  assert.ok(!/UPDATE intakes/.test(routeSource));
  // The store only ever moves discovery_paid -> discovery_booked.
  assert.ok(storeSource.includes('if (currentStatus === "discovery_paid")'));
  assert.ok(storeSource.includes(`SET status = 'discovery_booked'`));
  assert.ok(!/SET status = 'setup'/.test(storeSource));
  assert.ok(!/SET status = 'setup'/.test(routeSource));
});

test("Route: no call placed, no text sent, no audio stored", () => {
  assert.ok(!/twilio|calls\.create|messages\.create|sendText|sendEmail/i.test(routeSource));
  // The recording-ref validator rejects audio data; the lib stores no blobs.
  assert.ok(libSource.includes('input.startsWith("data:")'));
  assert.ok(!/Buffer\.from|readFile|createReadStream/.test(libSource));
  assert.ok(routeSource.includes("MAX_BODY_BYTES = 1024 * 1024"));
});

test("Validation module is self-contained: it does not import the preview-only voice-discovery module", () => {
  assert.ok(!/^\s*import\b[^;]*voice-discovery/m.test(libSource));
  assert.ok(!/^\s*import\b[^;]*voice-discovery/m.test(routeSource));
});
