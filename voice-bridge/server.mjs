// Micro Titan voice bridge — Twilio Media Streams <-> Gemini Live.
//
// Standalone Node process, no dependencies (Node 24: built-in
// WebSocket client; the Twilio side is a WebSocket server built on
// node:http + voice-bridge/ws-frames.mjs).
//
//   node server.mjs          (Railway start: npm start)
//   node voice-bridge/server.mjs
//
// Required env (values in the host env only, never in code):
//   GEMINI_API_KEY, ERM_API_BASE_URL, OPS_DASHBOARD_TOKEN,
//   VOICE_BRIDGE_STREAM_SECRET (fail closed if unset)
//
// Twilio <Connect><Stream> does not forward URL query strings.
// reference, sessionKey, consentAt, and streamToken arrive in the
// start event's customParameters. Query values are a fallback only.
// Gemini opens only after a start event within 5s whose token
// matches HMAC-SHA256(secret, reference|sessionKey|consentAt).
// Optional env:
//   GEMINI_LIVE_WS_URL (default: the Live API WebSocket in
//   guardrails.mjs — no API key in the URL),
//   PORT (Railway sets this), else VOICE_BRIDGE_PORT, else 8080.
//   The process binds 0.0.0.0.
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
//   A call reaches it only when the Next.js TwiML route
//   (/api/twilio/voice-discovery) returns a <Connect><Stream> to
//   this process. That route is off unless
//   VOICE_DISCOVERY_ENABLED=true. /api/twilio/webhook still rejects
//   inbound calls.
// - Railway is the chosen host (root directory /voice-bridge). This
//   file does not create that service and does not point a Twilio
//   webhook at it. See voice-bridge/README.md.
// - No call is made in this repo. The first proof is a TEST call to
//   a test number, after the bridge is hosted and /health is ok.
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
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
import { connectWebSocket } from "./ws-client.mjs";
import { resolveStreamIdentity, verifyVoiceStreamToken } from "./stream-auth.mjs";
import {
  GEMINI_INPUT_AUDIO_MIME,
  GEMINI_LIVE_MODEL,
  GEMINI_LIVE_WS_URL_DEFAULT,
  VOICE_BANNED_ACTIONS,
  VOICE_CALL_AGENDA,
  VOICE_CALL_OPENING,
  VOICE_HARD_STOP_WRAP_UP,
} from "./guardrails.mjs";

/** Railway sets PORT. Fall back to VOICE_BRIDGE_PORT, then 8080. */
export function resolveListenPort(env = process.env) {
  const raw = env.PORT ?? env.VOICE_BRIDGE_PORT ?? "8080";
  const port = Number.parseInt(String(raw), 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  return port;
}

export const LISTEN_HOST = "0.0.0.0";
/** A start event after this is rejected. The upgrade itself stays open only this long. */
export const START_DEADLINE_MS = 5000;

/**
 * First Live API client message. Model resource name is
 * models/{id}. responseModalities lives only on generationConfig: the
 * live server rejects it at the top of setup (code 1007, test call
 * 2026-11-06). Empty transcription configs
 * turn input and output transcripts on.
 * https://ai.google.dev/api/live
 * https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
 */
export function buildGeminiSetupMessage(systemInstruction) {
  return {
    setup: {
      model: `models/${GEMINI_LIVE_MODEL}`,
      generationConfig: { responseModalities: ["AUDIO"] },
      systemInstruction: { parts: [{ text: systemInstruction }] },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  };
}

/** realtimeInput.audio — mediaChunks is deprecated and is not sent. */
export function buildGeminiRealtimeAudioMessage(pcm16leBase64) {
  return {
    realtimeInput: {
      audio: {
        mimeType: GEMINI_INPUT_AUDIO_MIME,
        data: pcm16leBase64,
      },
    },
  };
}

/** Every inline audio part on a serverContent event, not just the first. */
export function serverAudioPayloads(serverContent) {
  const parts = serverContent?.modelTurn?.parts;
  if (!Array.isArray(parts)) return [];
  const out = [];
  for (const part of parts) {
    const data = part?.inlineData?.data;
    if (typeof data === "string" && data.length > 0) out.push(data);
  }
  return out;
}

function log(event, fields = {}) {
  const parts = [event];
  if (fields.reason) parts.push(String(fields.reason));
  if (fields.code !== undefined && fields.code !== null && fields.code !== "") {
    parts.push(`code=${fields.code}`);
  }
  console.log(
    JSON.stringify({
      service: "micro-titan-voice-bridge",
      event,
      ...fields,
      message: parts.join(" "),
    }),
  );
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

export function createBridgeServer(config = {}) {
  const streamSecret = config.streamSecret ?? "";
  const geminiUrl = config.geminiUrl || GEMINI_LIVE_WS_URL_DEFAULT;
  const geminiApiKey = config.geminiApiKey ?? "";
  const ermApiBaseUrl = config.ermApiBaseUrl ?? "";
  const opsDashboardToken = config.opsDashboardToken ?? "";
  const twilioAccountSid = config.twilioAccountSid ?? "";
  const twilioAuthToken = config.twilioAuthToken ?? "";
  const startDeadlineMs = config.startDeadlineMs ?? START_DEADLINE_MS;

  async function postDiscoveryRecord(record) {
    const url = `${ermApiBaseUrl.replace(/\/$/, "")}/api/ops/discovery-voice-complete`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${opsDashboardToken}`,
      },
      body: JSON.stringify(record),
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  }

  async function hangUpCall(callSid) {
    if (!twilioAccountSid || !twilioAuthToken || !callSid) {
      log("hangup_skipped", { reason: "twilio_rest_credentials_not_configured", callSid });
      return false;
    }
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls/${callSid}.json`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
      },
      body: new URLSearchParams({ Status: "completed" }).toString(),
    });
    log("hangup_attempted", { callSid, status: res.status });
    return res.ok;
  }

  function handleTwilioSocket(socket, req) {
    const query = new URL(req.url ?? "/", "http://localhost").searchParams;
    let session = null;
    let streamSid = null;
    let callSid = null;
    let reference = "";
    let sessionKey = "";
    let consentAt = null;
    let gemini = null;
    let geminiReady = false;
    let buffer = Buffer.alloc(0);
    let pendingClientText = "";
    let pendingAgentText = "";
    let wrapUpSent = false;
    let ended = false;
    let started = false;
    let rejected = false;
    let hardStopTimer = null;
    let wrapUpTimer = null;

    const sendToTwilio = (obj) => {
      try {
        socket.write(encodeFrame(JSON.stringify(obj), 1));
      } catch (err) {
        log("twilio_send_failed", { error: String(err) });
      }
    };

    const flushTurns = () => {
      if (!session) return;
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
      if (ended || !session) return;
      ended = true;
      if (hardStopTimer) clearInterval(hardStopTimer);
      if (wrapUpTimer) clearTimeout(wrapUpTimer);
      clearTimeout(startTimer);
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

    const rejectStream = (reason) => {
      if (rejected || started) return;
      rejected = true;
      clearTimeout(startTimer);
      log("stream_rejected", { reason, reference: reference || null });
      socket.destroy();
    };

    const startTimer = setTimeout(() => {
      if (!started) rejectStream("start_timeout");
    }, startDeadlineMs);
    startTimer.unref();

    const openGemini = () => {
      geminiReady = false;
      gemini = connectWebSocket(geminiUrl, {
        headers: { "x-goog-api-key": geminiApiKey },
      });
      gemini.on("open", () => {
        gemini.send(JSON.stringify(buildGeminiSetupMessage(buildVoiceSystemInstruction())));
      });
      gemini.on("message", (data) => {
        let msg;
        try {
          msg = JSON.parse(data.toString("utf8"));
        } catch {
          return;
        }
        if (msg.setupComplete) {
          geminiReady = true;
          log("gemini_setup_complete", { reference, sessionKey });
          return;
        }
        const content = msg.serverContent;
        if (!content) return;
        if (streamSid) {
          for (const payload of serverAudioPayloads(content)) {
            const pcm24 = bytesToPcm16(Buffer.from(payload, "base64"));
            const pcm8 = downsample(pcm24, Math.round(GEMINI_OUTPUT_SAMPLE_RATE_HZ / 8000));
            sendToTwilio({
              event: "media",
              streamSid,
              media: { payload: pcm16ToMulawBuffer(pcm8).toString("base64") },
            });
          }
        }
        if (content.inputTranscription?.text) pendingClientText += content.inputTranscription.text;
        if (content.outputTranscription?.text) pendingAgentText += content.outputTranscription.text;
        if (content.turnComplete) flushTurns();
      });
      gemini.on("error", (err) => {
        const code = err && typeof err === "object" && "code" in err ? err.code : null;
        log("gemini_error", { reference, code, reason: String(err) });
      });
      gemini.on("close", (code, reason) => {
        const reasonText = Buffer.isBuffer(reason) ? reason.toString("utf8") : String(reason ?? "");
        log("gemini_close", { reference, code: code ?? null, reason: reasonText });
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
          socket.write(encodeFrame(frame.payload, 10));
        } else if (frame.opcode === 8) {
          if (session) void endCall("client_hung_up");
          else rejectStream("client_closed_before_start");
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
          if (started || rejected) return;
          const identity = resolveStreamIdentity(event.start?.customParameters, query);
          reference = identity.reference;
          sessionKey = identity.sessionKey;
          consentAt = identity.consentAt || null;
          if (!identity.reference || !identity.sessionKey || !identity.consentAt) {
            rejectStream("reference_session_or_consent_missing");
            return;
          }
          if (
            !verifyVoiceStreamToken(
              streamSecret,
              identity.reference,
              identity.sessionKey,
              identity.consentAt,
              identity.streamToken,
            )
          ) {
            rejectStream("bad_stream_token");
            return;
          }
          started = true;
          clearTimeout(startTimer);
          callSid = event.start?.callSid ?? null;
          streamSid = event.streamSid ?? event.start?.streamSid ?? null;
          session = createVoiceSession({ reference, sessionKey, callSid });
          sessionStart(session);
          log("stream_started", { callSid, reference });
          hardStopTimer = setInterval(() => {
            if (ended || !session || session.state !== "live") return;
            if (sessionIsHardStop(session)) {
              log("hard_stop_reached", { reference, sessionKey });
              sessionBeginWrapUp(session);
              if (gemini && geminiReady && gemini.readyState === 1 && !wrapUpSent) {
                wrapUpSent = true;
                gemini.send(
                  JSON.stringify({
                    clientContent: {
                      turns: [
                        {
                          role: "user",
                          parts: [
                            {
                              text: `The 20-minute call time is up. Say this wrap-up line, then stop: "${VOICE_HARD_STOP_WRAP_UP}"`,
                            },
                          ],
                        },
                      ],
                      turnComplete: true,
                    },
                  }),
                );
              }
              wrapUpTimer = setTimeout(() => void endCall("hard_stop"), 15_000);
              wrapUpTimer.unref();
            }
          }, 1000);
          hardStopTimer.unref();
          openGemini();
        } else if (event.event === "media" && gemini && geminiReady && gemini.readyState === 1) {
          const pcm8 = mulawBufferToPcm16(Buffer.from(event.media?.payload ?? "", "base64"));
          const pcm16 = upsample(pcm8, 2);
          gemini.send(JSON.stringify(buildGeminiRealtimeAudioMessage(pcm16ToBytes(pcm16).toString("base64"))));
        } else if (event.event === "stop") {
          log("twilio_stop", { reference: reference || null, sessionKey: sessionKey || null, callSid });
          if (session) void endCall("completed");
          else rejectStream("stop_before_start");
          return;
        }
      }
    });

    socket.on("close", () => {
      clearTimeout(startTimer);
      if (session && !ended) void endCall(session.state === "idle" ? "no_answer" : "client_hung_up");
    });
    socket.on("error", (err) => log("twilio_socket_error", { reference, reason: String(err) }));
  }

  const server = createServer((req, res) => {
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    if (req.method === "GET" && pathname === "/health") {
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
  return server;
}

function main() {
  const required = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
    ERM_API_BASE_URL: process.env.ERM_API_BASE_URL ?? "",
    OPS_DASHBOARD_TOKEN: process.env.OPS_DASHBOARD_TOKEN ?? "",
    VOICE_BRIDGE_STREAM_SECRET: process.env.VOICE_BRIDGE_STREAM_SECRET ?? "",
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    console.error(`micro-titan-voice-bridge: missing required env: ${missing.join(", ")}`);
    process.exit(1);
  }
  const port = resolveListenPort();
  if (port === null) {
    console.error("micro-titan-voice-bridge: bad port (PORT, else VOICE_BRIDGE_PORT, else 8080)");
    process.exit(1);
  }
  const server = createBridgeServer({
    streamSecret: process.env.VOICE_BRIDGE_STREAM_SECRET ?? "",
    geminiUrl: process.env.GEMINI_LIVE_WS_URL || GEMINI_LIVE_WS_URL_DEFAULT,
    geminiApiKey: process.env.GEMINI_API_KEY ?? "",
    ermApiBaseUrl: process.env.ERM_API_BASE_URL ?? "",
    opsDashboardToken: process.env.OPS_DASHBOARD_TOKEN ?? "",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  });
  server.listen(port, LISTEN_HOST, () => {
    log("bridge_listening", { port, host: LISTEN_HOST });
    log("bridge_ready", {
      secondsRemainingNote: "hard stop 1200s enforced per call",
      model: `models/${GEMINI_LIVE_MODEL}`,
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
