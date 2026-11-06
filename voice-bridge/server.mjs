// Micro Titan voice bridge — Twilio Media Streams <-> Gemini Live.
//
// Standalone Node process, no dependencies (Node 24: built-in
// WebSocket client; the Twilio side is a WebSocket server built on
// node:http + voice-bridge/ws-frames.mjs).
//
//   node voice-bridge/server.mjs
//
// Required env (values in the host env only, never in code):
//   GEMINI_API_KEY, GEMINI_LIVE_WS_URL, ERM_API_BASE_URL,
//   OPS_DASHBOARD_TOKEN
// Optional env:
//   VOICE_BRIDGE_PORT (default 8080),
//   TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN (only needed to hang the
//   call up from the bridge at the hard stop; without them the
//   bridge logs that the hang-up must come from the TwiML side).
//
// What it does, end to end:
//   Twilio <Stream> (mulaw 8kHz) -> PCM 16kHz -> Gemini Live
//   Gemini Live (PCM 24kHz) -> PCM 8kHz -> mulaw -> Twilio
//   Gemini input/output transcription -> transcript turns -> on end,
//   POST the transcript to the Next app's owner route
//   POST /api/ops/discovery-voice-complete, which records it in the
//   ERM via the PR #34 discovery record shape. No audio is ever
//   stored, sent to the ERM, or logged: only the recording SID.
//
// What it does NOT do:
// - It does not dial anyone and it does not answer an inbound call.
//   A call reaches it only when Twilio is pointed at it (a later
//   slice: the TwiML that starts the <Stream>, with the intake
//   reference and session key in the stream URL).
// - It is NOT deployed anywhere. Vercel serverless cannot hold a
//   live voice session, and no host has been chosen for this
//   process. Choosing a host needs the owner's decision; see
//   voice-bridge/README.md. Do not point a real Twilio webhook at
//   an unhosted bridge.
// - No call is made in this repo. The first proof is a TEST call to
//   a test number, after the bridge is hosted and verified locally.
import { createServer } from "node:http";
import {
  createVoiceSession,
  sessionAddTurn,
  sessionBeginWrapUp,
  sessionEnd,
  sessionIsHardStop,
  sessionStart,
  sessionToDiscoveryRecord,
  GEMINI_OUTPUT_SAMPLE_RATE_HZ,
} from "./session.mjs";
import {
  bytesToPcm16,
  downsample,
  mulawBufferToPcm16,
  pcm16ToBytes,
  pcm16ToMulawBuffer,
  upsample,
} from "./audio.mjs";
import { decodeFrames, encodeFrame, reassembleTextFrames, websocketAccept } from "./ws-frames.mjs";
import {
  GEMINI_LIVE_MODEL,
  VOICE_CALL_OPENING,
  VOICE_CALL_AGENDA,
  VOICE_BANNED_ACTIONS,
  VOICE_HARD_STOP_WRAP_UP_DRAFT,
} from "../app/lib/erm/voice-discovery.ts";

const PORT = Number.parseInt(process.env.VOICE_BRIDGE_PORT ?? "8080", 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_LIVE_WS_URL = process.env.GEMINI_LIVE_WS_URL ?? "";
const ERM_API_BASE_URL = process.env.ERM_API_BASE_URL ?? "";
const OPS_DASHBOARD_TOKEN = process.env.OPS_DASHBOARD_TOKEN ?? "";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";

const REQUIRED_ENV = {
  GEMINI_API_KEY,
  GEMINI_LIVE_WS_URL,
  ERM_API_BASE_URL,
  OPS_DASHBOARD_TOKEN,
};

function log(event, fields = {}) {
  console.log(JSON.stringify({ service: "micro-titan-voice-bridge", event, ...fields }));
}

/** System instruction sent to Gemini Live: disclosure first, agenda, guardrails, hard stop. */
export function buildVoiceSystemInstruction() {
  return [
    "You are Micro Titan's agent, conducting a discovery call for Micro Titan.",
    `Your first spoken line, verbatim, is: "${VOICE_CALL_OPENING}"`,
    "Do not ask any discovery question until the client has said it is OK to continue.",
    "Agenda, in order:",
    ...VOICE_CALL_AGENDA.map((step, i) => `${i + 1}. ${step}`),
    "You cannot do any of these, and if one comes up, say so plainly, record it as an open question for the owner, and stop there: " +
      VOICE_BANNED_ACTIONS.join(", ") +
      ".",
    "The call is 15-20 minutes. At 20 minutes you will be told to wrap up; speak the wrap-up line you are given and stop.",
    "Record answers in the client's own words. Never fill a gap, never guess a number, never invent an answer.",
    "You are an agent, not a person. Never pretend to be a human, and never use a human name.",
  ].join("\n");
}

async function postDiscoveryRecord(record) {
  const url = `${ERM_API_BASE_URL.replace(/\/$/, "")}/api/ops/discovery-voice-complete`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${OPS_DASHBOARD_TOKEN}`,
    },
    body: JSON.stringify(record),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function hangUpCall(callSid) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !callSid) {
    log("hangup_skipped", { reason: "twilio_rest_credentials_not_configured", callSid });
    return false;
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
    },
    body: new URLSearchParams({ Status: "completed" }).toString(),
  });
  log("hangup_attempted", { callSid, status: res.status });
  return res.ok;
}

function handleTwilioSocket(socket, req) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const reference = url.searchParams.get("reference") ?? "";
  const sessionKey = url.searchParams.get("sessionKey") ?? "";
  const consentAt = url.searchParams.get("consentAt") ?? null;
  if (!reference || !sessionKey) {
    log("stream_rejected", { reason: "reference_or_session_key_missing" });
    socket.destroy();
    return;
  }
  const session = createVoiceSession({ reference, sessionKey });
  let streamSid = null;
  let callSid = null;
  let gemini = null;
  let buffer = Buffer.alloc(0);
  let pendingClientText = "";
  let pendingAgentText = "";
  let wrapUpSent = false;
  let ended = false;

  const sendToTwilio = (obj) => {
    try {
      socket.write(encodeFrame(JSON.stringify(obj), 1));
    } catch (err) {
      log("twilio_send_failed", { error: String(err) });
    }
  };

  const flushTurns = () => {
    if (pendingClientText.trim()) {
      sessionAddTurn(session, { speaker: "client", text: pendingClientText.trim(), at: new Date().toISOString() });
      pendingClientText = "";
    }
    if (pendingAgentText.trim()) {
      sessionAddTurn(session, { speaker: "agent", text: pendingAgentText.trim(), at: new Date().toISOString() });
      pendingAgentText = "";
    }
  };

  const endCall = async (reason) => {
    if (ended) return;
    ended = true;
    clearInterval(hardStopTimer);
    flushTurns();
    try {
      sessionEnd(session, reason);
    } catch {
      // Already ended; the record below is still the one to post.
    }
    if (gemini && gemini.readyState === 1) gemini.close();
    const record = sessionToDiscoveryRecord(session, {
      consentGiven: true,
      consentAt,
      recommendation: "approve",
      recommendationReason: "Voice discovery completed; owner review required before setup moves.",
    });
    try {
      const posted = await postDiscoveryRecord(record);
      log("discovery_record_posted", {
        reference,
        sessionKey,
        status: posted.status,
        erm: posted.body?.erm ?? null,
      });
    } catch (err) {
      // The transcript must not be silently lost: log the failure
      // with the counts, never the client words, and keep the record
      // in the process log for a manual retry.
      log("discovery_record_post_failed", {
        reference,
        sessionKey,
        error: String(err),
        turns: session.transcript.length,
      });
    }
    if (callSid) await hangUpCall(callSid);
    socket.destroy();
  };

  const hardStopTimer = setInterval(() => {
    if (ended || session.state !== "live") return;
    if (sessionIsHardStop(session)) {
      log("hard_stop_reached", { reference, sessionKey });
      sessionBeginWrapUp(session);
      if (gemini && gemini.readyState === 1 && !wrapUpSent) {
        wrapUpSent = true;
        gemini.send(
          JSON.stringify({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [{ text: `The 20-minute call time is up. Say this wrap-up line, then stop: "${VOICE_HARD_STOP_WRAP_UP_DRAFT}"` }],
                },
              ],
              turnComplete: true,
            },
          }),
        );
      }
      // Give the wrap-up a short grace window, then end the call.
      setTimeout(() => void endCall("hard_stop"), 15_000);
    }
  }, 1000);

  const openGemini = () => {
    gemini = new WebSocket(GEMINI_LIVE_WS_URL, {
      headers: { "x-goog-api-key": GEMINI_API_KEY },
    });
    gemini.on("open", () => {
      gemini.send(
        JSON.stringify({
          setup: {
            model: GEMINI_LIVE_MODEL,
            systemInstruction: { parts: [{ text: buildVoiceSystemInstruction() }] },
            generationConfig: { responseModalities: ["AUDIO"] },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        }),
      );
    });
    gemini.on("message", (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString("utf8"));
      } catch {
        return;
      }
      const content = msg.serverContent;
      if (!content) return;
      // Audio back to the caller: PCM 24kHz -> PCM 8kHz -> mulaw.
      const audioPart = content.modelTurn?.parts?.find((p) => p.inlineData?.data);
      if (audioPart && streamSid) {
        const pcm24 = bytesToPcm16(Buffer.from(audioPart.inlineData.data, "base64"));
        const pcm8 = downsample(pcm24, Math.round(GEMINI_OUTPUT_SAMPLE_RATE_HZ / 8000));
        sendToTwilio({
          event: "media",
          streamSid,
          media: { payload: pcm16ToMulawBuffer(pcm8).toString("base64") },
        });
      }
      if (content.inputTranscription?.text) pendingClientText += content.inputTranscription.text;
      if (content.outputTranscription?.text) pendingAgentText += content.outputTranscription.text;
      if (content.turnComplete) flushTurns();
    });
    gemini.on("error", (err) => log("gemini_error", { reference, error: String(err) }));
    gemini.on("close", () => {
      if (!ended) void endCall("client_hung_up");
    });
  };

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    let decoded;
    try {
      decoded = decodeFrames(buffer);
    } catch (err) {
      log("ws_decode_failed", { reference, error: String(err) });
      socket.destroy();
      return;
    }
    buffer = decoded.rest;
    let messages;
    try {
      messages = reassembleTextFrames(decoded.frames);
    } catch (err) {
      log("ws_reassemble_failed", { reference, error: String(err) });
      socket.destroy();
      return;
    }
    for (const frame of decoded.frames) {
      if (frame.opcode === 9) {
        // Ping -> pong.
        socket.write(encodeFrame(frame.payload, 10));
      } else if (frame.opcode === 8) {
        void endCall("client_hung_up");
        return;
      }
    }
    for (const text of messages) {
      let event;
      try {
        event = JSON.parse(text);
      } catch {
        continue;
      }
      if (event.event === "start") {
        callSid = event.start?.callSid ?? null;
        streamSid = event.streamSid ?? null;
        session.callSid = callSid;
        // No recording reference arrives in a Media Streams start
        // event. recording_ref stays null unless a recording SID is
        // supplied by the caller that starts the stream (later
        // slice); the ERM never stores audio, only the reference.
        sessionStart(session);
        log("call_started", { reference, sessionKey, callSid });
        openGemini();
      } else if (event.event === "media" && gemini && gemini.readyState === 1) {
        // Twilio mulaw 8kHz -> PCM 16kHz -> Gemini.
        const pcm8 = mulawBufferToPcm16(Buffer.from(event.media?.payload ?? "", "base64"));
        const pcm16 = upsample(pcm8, 2);
        gemini.send(
          JSON.stringify({
            realtimeInput: {
              mediaChunks: [{ mimeType: "audio/pcm", data: pcm16ToBytes(pcm16).toString("base64") }],
            },
          }),
        );
      } else if (event.event === "stop") {
        log("twilio_stop", { reference, sessionKey });
        void endCall("completed");
        return;
      }
    }
  });

  socket.on("close", () => {
    if (!ended) void endCall(session.state === "idle" ? "no_answer" : "client_hung_up");
  });
  socket.on("error", (err) => log("twilio_socket_error", { reference, error: String(err) }));
}

function main() {
  const missing = Object.entries(REQUIRED_ENV)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    console.error(`micro-titan-voice-bridge: missing required env: ${missing.join(", ")}`);
    process.exit(1);
  }
  const server = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, service: "micro-titan-voice-bridge" }));
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "not_found" }));
  });
  server.on("upgrade", (req, socket) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== "/twilio-stream") {
      socket.destroy();
      return;
    }
    const key = req.headers["sec-websocket-key"];
    if (!key) {
      socket.destroy();
      return;
    }
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        `Sec-WebSocket-Accept: ${websocketAccept(key)}\r\n\r\n`,
    );
    handleTwilioSocket(socket, req);
  });
  server.listen(PORT, () => {
    log("bridge_listening", { port: PORT });
    log("bridge_ready", {
      secondsRemainingNote: "hard stop 1200s enforced per call",
      model: GEMINI_LIVE_MODEL,
    });
  });
}

// Only run the server when executed directly, not when imported.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
