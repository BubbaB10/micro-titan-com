// node --test tests/voice-discovery.test.mjs — voice discovery route v2
// (Twilio + Gemini Live). Pure-logic tests only: no database, no
// network, no credentials, no call, no prospect data. Sample
// references are invented test fixtures, not clients.
// The gated store returns "not_configured" when ERM_DATABASE_URL
// is absent — that is tested elsewhere, not worked around here.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GEMINI_INPUT_AUDIO_MIME,
  GEMINI_LIVE_MODEL,
  GEMINI_LIVE_WS_URL_DEFAULT,
  VOICE_BANNED_ACTIONS,
  VOICE_BOOKING_CONSENT,
  VOICE_CALL_AGENDA,
  VOICE_CALL_MAX_SECONDS,
  VOICE_CALL_OPENING,
  VOICE_DISCOVERY_FORMAT_CHOICE,
  VOICE_ESCALATION_TRIGGERS,
  VOICE_HARD_STOP_WRAP_UP,
  VOICE_NO_ANSWER_FOLLOW_UP,
  canStartVoiceCall,
  estimateVoiceCallCostUsd,
  isHardStop,
  secondsRemaining,
  validateRecordingRef,
  validateVoiceTranscript,
} from "../app/lib/erm/voice-discovery.ts";
import {
  VOICE_CALL_MAX_SECONDS as BRIDGE_MAX_SECONDS,
  createVoiceSession,
  sessionAddTurn,
  sessionBeginWrapUp,
  sessionEnd,
  sessionIsHardStop,
  sessionStart,
  sessionToDiscoveryRecord,
} from "../voice-bridge/session.mjs";
import {
  bytesToPcm16,
  createDownsampler,
  createUpsampler,
  downsample,
  mulawBufferToPcm16,
  mulawDecode,
  mulawEncode,
  pcm16ToBytes,
  pcm16ToMulawBuffer,
  upsample,
} from "../voice-bridge/audio.mjs";
import {
  createMessageReassembler,
  decodeFrames,
  encodeFrame,
  reassembleTextFrames,
  websocketAccept,
} from "../voice-bridge/ws-frames.mjs";
import {
  GEMINI_INPUT_AUDIO_MIME as COPY_MIME,
  GEMINI_LIVE_MODEL as COPY_MODEL,
  GEMINI_LIVE_WS_URL_DEFAULT as COPY_URL,
  VOICE_BANNED_ACTIONS as COPY_BANNED,
  VOICE_CALL_AGENDA as COPY_AGENDA,
  VOICE_CALL_OPENING as COPY_OPENING,
  VOICE_HARD_STOP_WRAP_UP as COPY_WRAP,
} from "../voice-bridge/guardrails.mjs";
import {
  LISTEN_HOST,
  buildGeminiGreetingKick,
  buildGeminiRealtimeAudioMessage,
  buildGeminiSetupMessage,
  buildVoiceSystemInstruction,
  resolveGeminiVoiceName,
  resolveListenPort,
  serverAudioPayloads,
  shouldResumeGemini,
  DEFAULT_GEMINI_VOICE_NAME,
} from "../voice-bridge/server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const voiceSource = read("app/lib/erm/voice-discovery.ts");
const completeRouteSource = read("app/api/ops/discovery-voice-complete/route.ts");
const statusRouteSource = read("app/api/ops/discovery-status/route.ts");
const serverSource = read("voice-bridge/server.mjs");
const bridgeReadme = read("voice-bridge/README.md");

// --- Approved verbatim wording (G7 doc, sections 2-3) ---

test("call opening is the approved verbatim text, exactly", () => {
  assert.equal(
    VOICE_CALL_OPENING,
    "Before we start: I'm Micro Titan's agent, not a person. This call is recorded so we have an exact record of what you said, and I'll build your presentation from it. I can't promise a workflow, change a price, or move any money — if any of that comes up, I'll bring it to the team. Nothing moves to setup until you've seen your presentation and said go. Is that OK to continue?",
  );
});

test("booking consent line is the approved verbatim text, exactly", () => {
  assert.equal(
    VOICE_BOOKING_CONSENT,
    "This call is recorded, and a transcript is kept with your intake so nothing gets lost. We keep it as your record — it's not shared, and nothing moves to setup until you've reviewed your presentation.",
  );
});

test("format choice carries the approved sentences, agent-led at the client's pace, no day count", () => {
  assert.match(VOICE_DISCOVERY_FORMAT_CHOICE, /Your discovery is paid — thank you\. How would you like to do it\?/);
  assert.match(VOICE_DISCOVERY_FORMAT_CHOICE, /Text — agent-led, at your pace/);
  assert.match(
    VOICE_DISCOVERY_FORMAT_CHOICE,
    /Chat with Micro Titan's agent by text, whenever you're ready\. It will walk through your discovery questions one at a time\./,
  );
  assert.match(VOICE_DISCOVERY_FORMAT_CHOICE, /Call — 15–20 minutes/);
  assert.match(
    VOICE_DISCOVERY_FORMAT_CHOICE,
    /A 15–20 minute call with Micro Titan's agent, at a time you pick\. It's recorded so nothing you say gets lost\./,
  );
  assert.match(
    VOICE_DISCOVERY_FORMAT_CHOICE,
    /Either way, what you say goes into your presentation, and nothing moves to setup until you've seen it\./,
  );
  assert.doesNotMatch(VOICE_DISCOVERY_FORMAT_CHOICE, /day/i);
});

test("no owner personal details in any voice wording", () => {
  for (const text of [VOICE_CALL_OPENING, VOICE_BOOKING_CONSENT, VOICE_DISCOVERY_FORMAT_CHOICE]) {
    assert.doesNotMatch(text, /Bubba/i);
  }
});

// --- Hard stop, consent gate, agenda, guardrails ---

test("hard stop is 20 minutes, and the bridge agrees with the control plane", () => {
  assert.equal(VOICE_CALL_MAX_SECONDS, 1200);
  assert.equal(BRIDGE_MAX_SECONDS, VOICE_CALL_MAX_SECONDS);
  assert.equal(isHardStop(1199), false);
  assert.equal(isHardStop(1200), true);
  assert.equal(isHardStop(1500), true);
  assert.equal(secondsRemaining(0), 1200);
  assert.equal(secondsRemaining(900), 300);
  assert.equal(secondsRemaining(1200), 0);
});

test("a voice call starts only with consent at booking AND confirmed at the start", () => {
  assert.equal(canStartVoiceCall({ consentAtBooking: true, consentConfirmedAtStart: true }).ok, true);
  assert.equal(canStartVoiceCall({ consentAtBooking: false, consentConfirmedAtStart: true }).ok, false);
  assert.equal(canStartVoiceCall({ consentAtBooking: true, consentConfirmedAtStart: false }).ok, false);
  assert.equal(canStartVoiceCall({ consentAtBooking: false, consentConfirmedAtStart: false }).ok, false);
});

test("agenda is the four fixed steps, in order", () => {
  assert.equal(VOICE_CALL_AGENDA.length, 4);
  assert.match(VOICE_CALL_AGENDA[0], /Confirm what the intake said, in the client's words/);
  assert.match(VOICE_CALL_AGENDA[3], /Close: what happens next is the presentation/);
});

test("banned actions and escalation triggers cover the guardrails", () => {
  for (const action of [
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
  ]) {
    assert.ok(VOICE_BANNED_ACTIONS.includes(action), action);
  }
  for (const trigger of ["asks_for_human", "hesitation", "hard_question", "price_negotiation", "not_a_fit"]) {
    assert.ok(VOICE_ESCALATION_TRIGGERS.includes(trigger), trigger);
  }
});

test("wrap-up line is the approved verbatim text, exactly", () => {
  assert.equal(
    VOICE_HARD_STOP_WRAP_UP,
    "That's our time — I'll finish the presentation from what you've told me and the owner will review it. If anything is unfinished, I'll follow up by text.",
  );
  assert.match(voiceSource, /Approved verbatim by Bubba 2026-11-06 ~18:27 CST/);
  assert.doesNotMatch(voiceSource, /VOICE_HARD_STOP_WRAP_UP_DRAFT/);
  assert.doesNotMatch(voiceSource, /NOT approved verbatim/);
});

test("no-answer follow-up is the approved verbatim text, exactly, and nothing sends it", () => {
  assert.equal(
    VOICE_NO_ANSWER_FOLLOW_UP,
    "We missed you — reply here to reschedule, or switch to text discovery instead.",
  );
  assert.doesNotMatch(voiceSource, /VOICE_NO_ANSWER_FOLLOW_UP_DRAFT/);
  assert.match(voiceSource, /Nothing in this slice sends it/);
});

// --- Transcript + recording reference validation ---

const goodTurns = [
  { speaker: "agent", text: "Hello", at: "2026-11-05T21:00:00.000Z" },
  { speaker: "client", text: "Hi, this is a test.", at: "2026-11-05T21:00:05.000Z" },
];

test("a valid transcript validates, and bad ones do not", () => {
  const ok = validateVoiceTranscript(goodTurns);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.turns.length, 2);
  assert.equal(validateVoiceTranscript([]).ok, false);
  assert.equal(validateVoiceTranscript("not an array").ok, false);
  assert.equal(
    validateVoiceTranscript([{ speaker: "human", text: "x", at: "2026-11-05T21:00:00.000Z" }]).ok,
    false,
  );
  assert.equal(
    validateVoiceTranscript([{ speaker: "client", text: "   ", at: "2026-11-05T21:00:00.000Z" }]).ok,
    false,
  );
  assert.equal(
    validateVoiceTranscript([{ speaker: "client", text: "x", at: "not a date" }]).ok,
    false,
  );
  const tooMany = Array.from({ length: 501 }, (_, i) => ({
    speaker: "client",
    text: `turn ${i}`,
    at: "2026-11-05T21:00:00.000Z",
  }));
  assert.equal(validateVoiceTranscript(tooMany).ok, false);
});

test("recording ref is a reference only — never audio data", () => {
  assert.deepEqual(validateRecordingRef(null), { ok: true, recordingRef: null });
  assert.deepEqual(validateRecordingRef("RE123456"), { ok: true, recordingRef: "RE123456" });
  assert.equal(validateRecordingRef("data:audio/mp3;base64,AAAA").ok, false);
  assert.equal(validateRecordingRef("x".repeat(201)).ok, false);
  assert.equal(validateRecordingRef(123).ok, false);
});

// --- Cost estimate (list prices, not a bill) ---

test("a 20-minute call is under $1 at list prices", () => {
  const est = estimateVoiceCallCostUsd(20);
  assert.ok(est.totalUsd < 1, `total was ${est.totalUsd}`);
  assert.match(est.basis, /list prices/i);
  assert.match(est.basis, /not a measured bill/i);
  assert.equal(estimateVoiceCallCostUsd(0).totalUsd, 0);
});

// --- Bridge: WebSocket framing ---

test("websocket accept matches the RFC 6455 example", () => {
  assert.equal(websocketAccept("dGhlIHNhbXBsZSBub25jZQ=="), "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=");
});

test("server frames encode and client frames decode, with masking enforced", () => {
  const encoded = encodeFrame("hello", 1);
  assert.equal(encoded[0], 0x81);
  // Build a masked client text frame for "hi".
  const payload = Buffer.from("hi", "utf8");
  const mask = Buffer.from([0x01, 0x02, 0x03, 0x04]);
  const masked = Buffer.from(payload);
  for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4];
  const clientFrame = Buffer.concat([Buffer.from([0x81, 0x80 | payload.length]), mask, masked]);
  const { frames, rest } = decodeFrames(clientFrame);
  assert.equal(frames.length, 1);
  assert.equal(frames[0].payload.toString("utf8"), "hi");
  assert.equal(rest.length, 0);
  assert.deepEqual(reassembleTextFrames(frames), ["hi"]);
  // An unmasked client frame is a protocol error.
  assert.throws(() => decodeFrames(Buffer.from([0x81, 0x02, 0x68, 0x69])), /not_masked/);
});

test("binary setupComplete is delivered, and a fragment split across two chunks is kept", () => {
  const setup = JSON.stringify({ setupComplete: {} });
  const binary = decodeFrames(encodeFrame(setup, 2, false), { requireMask: false }).frames;
  const once = createMessageReassembler();
  assert.deepEqual(once.push(binary).map((buf) => buf.toString("utf8")), [setup]);

  const mid = 11;
  const first = decodeFrames(encodeFrame(setup.slice(0, mid), 2, false, false), { requireMask: false }).frames;
  const second = decodeFrames(encodeFrame(setup.slice(mid), 0, false, true), { requireMask: false }).frames;
  const split = createMessageReassembler();
  assert.deepEqual(split.push(first), []);
  assert.deepEqual(split.push(second).map((buf) => buf.toString("utf8")), [setup]);
});

test("the greeting kick is the approved opening, sent as one completed turn", () => {
  const kick = buildGeminiGreetingKick();
  assert.equal(kick.clientContent.turnComplete, true);
  assert.equal(kick.clientContent.turns.length, 1);
  assert.match(kick.clientContent.turns[0].parts[0].text, /Speak your first line now, verbatim, then wait/);
  assert.ok(kick.clientContent.turns[0].parts[0].text.includes(VOICE_CALL_OPENING));
  assert.equal(kick.setup, undefined);
});

// --- Bridge: audio transcoding ---

test("mulaw decode of 0xff is silence and encode of 0 is 0xff", () => {
  assert.equal(mulawDecode(0xff), 0);
  assert.equal(mulawEncode(0), 0xff);
});

test("mulaw round-trip stays within quantization for speech levels", () => {
  for (const sample of [100, -100, 500, -500, 1000, -1000, 4000, -4000, 16000, -16000]) {
    const back = mulawDecode(mulawEncode(sample));
    assert.ok(Math.abs(back - sample) <= 256, `sample ${sample} came back ${back}`);
  }
});

test("mulaw buffer round-trip stays within quantization", () => {
  const pcm = new Int16Array([0, 1000, -1000, 8000, -8000]);
  const mulaw = pcm16ToMulawBuffer(pcm);
  const back = mulawBufferToPcm16(mulaw);
  for (let i = 0; i < pcm.length; i++) assert.ok(Math.abs(back[i] - pcm[i]) <= 256);
  const bytes = pcm16ToBytes(pcm);
  assert.deepEqual(Array.from(bytesToPcm16(bytes)), Array.from(pcm));
});

function tone(rate, freq, seconds, amp = 12000) {
  const count = Math.floor(rate * seconds);
  const out = new Int16Array(count);
  for (let i = 0; i < count; i++) out[i] = Math.round(amp * Math.sin((2 * Math.PI * freq * i) / rate));
  return out;
}

function rms(samples) {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

function concatInt16(parts) {
  const total = parts.reduce((n, part) => n + part.length, 0);
  const out = new Int16Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

test("24 kHz to 8 kHz attenuates energy above 4 kHz, and chunks match one shot", () => {
  const low = downsample(tone(24000, 1000, 0.5), 3);
  const high = downsample(tone(24000, 7000, 0.5), 3);
  assert.ok(rms(high) < rms(low) * 0.1, `high ${rms(high)} low ${rms(low)}`);
  const all = tone(24000, 440, 0.2);
  const one = downsample(all, 3);
  const streaming = createDownsampler(3);
  const parts = [];
  for (let i = 0; i < all.length; i += 80) parts.push(streaming.process(all.subarray(i, i + 80)));
  assert.deepEqual(Array.from(concatInt16(parts)), Array.from(one));
});

test("8 kHz to 16 kHz chunks match one shot", () => {
  const all = tone(8000, 300, 0.25);
  const one = upsample(all, 2);
  const streaming = createUpsampler(2);
  const parts = [];
  for (let i = 0; i < all.length; i += 50) parts.push(streaming.process(all.subarray(i, i + 50)));
  assert.deepEqual(Array.from(concatInt16(parts)), Array.from(one));
  assert.ok(one.length > all.length);
});

// --- Bridge: session state machine ---

test("a voice session runs live, hits the hard stop, wraps up, and ends with a record", () => {
  const session = createVoiceSession({ reference: "MT-20261105-TEST", sessionKey: "CA-test-1" });
  assert.equal(session.state, "idle");
  const start = new Date("2026-11-05T21:00:00.000Z");
  sessionStart(session, start);
  assert.equal(session.state, "live");
  sessionAddTurn(session, { speaker: "agent", text: "Before we start", at: "2026-11-05T21:00:01.000Z" });
  assert.equal(session.transcript.length, 1);
  assert.equal(sessionIsHardStop(session, new Date("2026-11-05T21:19:59.000Z")), false);
  assert.equal(sessionIsHardStop(session, new Date("2026-11-05T21:20:00.000Z")), true);
  sessionBeginWrapUp(session);
  assert.equal(session.state, "wrapping");
  sessionEnd(session, "hard_stop", new Date("2026-11-05T21:20:15.000Z"));
  assert.equal(session.state, "ended");
  assert.equal(session.endReason, "hard_stop");
  assert.equal(session.elapsedSeconds, 1215);
  const record = sessionToDiscoveryRecord(session, {
    consentGiven: true,
    consentAt: "2026-11-05T20:55:00.000Z",
  });
  assert.equal(record.channel, "voice");
  assert.equal(record.formatChoice, "call");
  assert.equal(record.status, "completed");
  assert.equal(record.transcript.length, 1);
  assert.equal(record.recordingRef, null);
});

test("no answer ends as no_answer, and a record needs consent and an ended session", () => {
  const session = createVoiceSession({ reference: "MT-20261105-TEST", sessionKey: "CA-test-2" });
  sessionEnd(session, "no_answer");
  const record = sessionToDiscoveryRecord(session, { consentGiven: true });
  assert.equal(record.status, "no_answer");
  const live = createVoiceSession({ reference: "MT-20261105-TEST", sessionKey: "CA-test-3" });
  assert.throws(() => sessionToDiscoveryRecord(live, { consentGiven: true }), /session_not_ended/);
  const ended = createVoiceSession({ reference: "MT-20261105-TEST", sessionKey: "CA-test-4" });
  sessionEnd(ended, "completed");
  assert.throws(() => sessionToDiscoveryRecord(ended, { consentGiven: false }), /consent_not_given/);
  assert.throws(
    () => sessionAddTurn(ended, { speaker: "client", text: "x", at: "2026-11-05T21:00:00.000Z" }),
    /session_not_live/,
  );
});

// --- Routes + bridge: gates, constraints, no forbidden vendors ---

test("voice-complete route is token-gated and consent-gated, and records voice only", () => {
  assert.match(completeRouteSource, /OPS_DASHBOARD_TOKEN/);
  assert.match(completeRouteSource, /unauthorized/);
  assert.match(completeRouteSource, /consent_required/);
  assert.match(completeRouteSource, /validateVoiceTranscript/);
  assert.match(completeRouteSource, /validateRecordingRef/);
  assert.match(completeRouteSource, /channel: "voice"/);
  assert.match(completeRouteSource, /formatChoice: "call"/);
  assert.match(completeRouteSource, /recordDiscoveryCall/);
  assert.doesNotMatch(completeRouteSource, /fetch\(/);
});

test("discovery-status route is token-gated and returns the transcript to the owner only", () => {
  assert.match(statusRouteSource, /OPS_DASHBOARD_TOKEN/);
  assert.match(statusRouteSource, /unauthorized/);
  assert.match(statusRouteSource, /discoveryCallStatus/);
  assert.match(statusRouteSource, /transcript: result\.transcript/);
});

test("the bridge uses Gemini Live only — no OpenAI, no managed voice platforms", () => {
  assert.match(serverSource, /GEMINI_LIVE_MODEL/);
  assert.equal(GEMINI_LIVE_MODEL, "gemini-3.8-live");
  assert.equal(
    GEMINI_LIVE_WS_URL_DEFAULT,
    "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent",
  );
  assert.equal(GEMINI_INPUT_AUDIO_MIME, "audio/pcm;rate=16000");
  const setup = buildGeminiSetupMessage("system");
  assert.equal(setup.setup.model, "models/gemini-3.8-live");
  assert.equal(setup.setup.responseModalities, undefined);
  assert.deepEqual(setup.setup.generationConfig.responseModalities, ["AUDIO"]);
  assert.equal(
    setup.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName,
    DEFAULT_GEMINI_VOICE_NAME,
  );
  assert.equal(setup.setup.generationConfig.enableAffectiveDialog, undefined);
  assert.equal(setup.setup.proactivity, undefined);
  assert.deepEqual(setup.setup.contextWindowCompression, { slidingWindow: {} });
  assert.deepEqual(setup.setup.sessionResumption, {});
  assert.equal(resolveGeminiVoiceName("not-a-voice"), DEFAULT_GEMINI_VOICE_NAME);
  assert.equal(resolveGeminiVoiceName("Aoede"), "Aoede");
  const resumed = buildGeminiSetupMessage("system", { resumeHandle: "handle-1", voiceName: "Puck" });
  assert.deepEqual(resumed.setup.sessionResumption, { handle: "handle-1" });
  assert.equal(resumed.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, "Puck");
  assert.deepEqual(setup.setup.inputAudioTranscription, {});
  assert.deepEqual(setup.setup.outputAudioTranscription, {});
  const instruction = buildVoiceSystemInstruction();
  assert.ok(instruction.includes(VOICE_CALL_OPENING));
  assert.match(instruction, /One question at a time/);
  assert.match(instruction, /Never pretend to be a human/);
  assert.equal(shouldResumeGemini({ ended: false, code: 1011, resumeUsed: false, handle: "h" }), true);
  assert.equal(shouldResumeGemini({ ended: false, code: 1011, resumeUsed: true, handle: "h" }), false);
  assert.equal(shouldResumeGemini({ ended: false, code: 1011, resumeUsed: false, handle: "" }), false);
  assert.equal(shouldResumeGemini({ ended: true, code: 1011, resumeUsed: false, handle: "h" }), false);
  assert.equal(shouldResumeGemini({ ended: false, code: 1000, resumeUsed: false, handle: "h" }), false);
  const audio = buildGeminiRealtimeAudioMessage("AAAA");
  assert.equal(audio.realtimeInput.audio.mimeType, "audio/pcm;rate=16000");
  assert.equal(audio.realtimeInput.audio.data, "AAAA");
  assert.equal(audio.realtimeInput.mediaChunks, undefined);
  assert.deepEqual(
    serverAudioPayloads({
      modelTurn: { parts: [{ inlineData: { data: "one" } }, { text: "skip" }, { inlineData: { data: "two" } }] },
    }),
    ["one", "two"],
  );
  assert.match(serverSource, /setupComplete/);
  assert.doesNotMatch(serverSource, /mediaChunks:\s*\[/);
  for (const banned of ["openai", "gpt-", "vapi", "retell", "bland", "elevenlabs"]) {
    assert.doesNotMatch(serverSource.toLowerCase(), new RegExp(banned), banned);
  }
  // The control-plane file names the exclusion in its header comment;
  // what matters is that no OpenAI client, endpoint, or key is used.
  assert.doesNotMatch(voiceSource, /api\.openai\.com/);
  assert.doesNotMatch(voiceSource, /from ["']openai["']/);
  assert.doesNotMatch(voiceSource, /new OpenAI/);
});

test("the bridge holds no secrets and points at no production system by default", () => {
  assert.doesNotMatch(serverSource, /sk-[A-Za-z0-9]/);
  assert.match(serverSource, /process\.env\.GEMINI_API_KEY/);
  assert.match(serverSource, /process\.env\.GEMINI_LIVE_WS_URL/);
  assert.match(serverSource, /process\.env\.OPS_DASHBOARD_TOKEN/);
  assert.match(serverSource, /discovery-voice-complete/);
  assert.match(serverSource, /VOICE_CALL_OPENING|buildVoiceSystemInstruction/);
});

test("the bridge README names Railway, the default Gemini URL and model, and still requires a TEST call", () => {
  assert.match(bridgeReadme, /Railway/);
  assert.match(bridgeReadme, /Root Directory/);
  assert.match(bridgeReadme, /\/voice-bridge/);
  assert.match(bridgeReadme, /\/health/);
  assert.match(bridgeReadme, /gemini-3\.8-live/);
  assert.match(bridgeReadme, /generativelanguage\.googleapis\.com/);
  assert.match(bridgeReadme, /GEMINI_API_KEY/);
  assert.match(bridgeReadme, /\*\*secret\*\*/);
  assert.match(bridgeReadme, /TEST call/i);
  assert.match(bridgeReadme, /VOICE_DISCOVERY_ENABLED/);
});

test("vendored guardrails match voice-discovery.ts, and the bridge imports nothing outside its folder", () => {
  assert.equal(COPY_MODEL, GEMINI_LIVE_MODEL);
  assert.equal(COPY_URL, GEMINI_LIVE_WS_URL_DEFAULT);
  assert.equal(COPY_MIME, GEMINI_INPUT_AUDIO_MIME);
  assert.equal(COPY_OPENING, VOICE_CALL_OPENING);
  assert.equal(COPY_WRAP, VOICE_HARD_STOP_WRAP_UP);
  assert.deepEqual(COPY_AGENDA, [...VOICE_CALL_AGENDA]);
  assert.deepEqual(COPY_BANNED, [...VOICE_BANNED_ACTIONS]);
  for (const file of ["server.mjs", "session.mjs", "audio.mjs", "ws-frames.mjs", "ws-client.mjs", "guardrails.mjs", "stream-auth.mjs"]) {
    const src = read(`voice-bridge/${file}`);
    assert.doesNotMatch(src, /from\s+["']\.\.\//, file);
    assert.doesNotMatch(src, /from\s+["']@\//, file);
  }
  const pkg = JSON.parse(read("voice-bridge/package.json"));
  assert.equal(pkg.name, "micro-titan-voice-bridge");
  assert.equal(pkg.type, "module");
  assert.equal(pkg.engines.node, ">=24");
  assert.equal(pkg.scripts.start, "node server.mjs");
  assert.equal(pkg.dependencies, undefined);
  assert.equal(LISTEN_HOST, "0.0.0.0");
  assert.equal(resolveListenPort({ PORT: "4321" }), 4321);
  assert.equal(resolveListenPort({ VOICE_BRIDGE_PORT: "9090" }), 9090);
  assert.equal(resolveListenPort({}), 8080);
  assert.equal(resolveListenPort({ PORT: "0" }), null);
  assert.match(serverSource, /server\.listen\(port, LISTEN_HOST/);
  assert.match(serverSource, /VOICE_BRIDGE_STREAM_SECRET/);
  assert.match(serverSource, /customParameters/);
  assert.match(serverSource, /message: parts\.join/);
  assert.match(serverSource, /START_DEADLINE_MS = 5000/);
});
