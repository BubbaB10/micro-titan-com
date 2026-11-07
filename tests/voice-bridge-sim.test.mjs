// Local end-to-end simulation. No Twilio account, no Gemini, no call.
// A fake Twilio client speaks the Media Streams events. A stub
// Gemini server accepts the bridge's WebSocket. The bridge under
// test is the real server.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { voiceStreamToken } from "../app/lib/erm/voice-discovery.ts";
import { createBridgeServer } from "../voice-bridge/server.mjs";
import { decodeFrames, encodeFrame, reassembleTextFrames, websocketAccept } from "../voice-bridge/ws-frames.mjs";
import { resolveStreamIdentity } from "../voice-bridge/stream-auth.mjs";

const SECRET = "test_only_stream_secret";
const REFERENCE = "MT-20261107-TEST";
const SESSION = "voice-test-sim";
const CONSENT = "2026-11-07T00:40:00.000Z";
const TOKEN = voiceStreamToken(SECRET, REFERENCE, SESSION, CONSENT);
const REPLY_PCM = Buffer.alloc(12);
REPLY_PCM.writeInt16LE(1000, 0);

function listen(server, host = "127.0.0.1") {
  return new Promise((resolve) => {
    server.listen(0, host, () => resolve(server.address().port));
  });
}

function closeServer(server) {
  return new Promise((resolve) => {
    const done = () => resolve();
    const timer = setTimeout(done, 250);
    server.closeAllConnections?.();
    server.close(() => {
      clearTimeout(timer);
      done();
    });
  });
}

function startGeminiStub() {
  const setups = [];
  const audios = [];
  const server = createServer();
  server.on("upgrade", (req, socket) => {
    const key = req.headers["sec-websocket-key"];
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        `Sec-WebSocket-Accept: ${websocketAccept(key)}\r\n\r\n`,
    );
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      let decoded;
      try {
        decoded = decodeFrames(buffer);
      } catch {
        socket.destroy();
        return;
      }
      buffer = decoded.rest;
      let texts;
      try {
        texts = reassembleTextFrames(decoded.frames);
      } catch {
        socket.destroy();
        return;
      }
      for (const text of texts) {
        const msg = JSON.parse(text);
        if (msg.setup) {
          setups.push(msg);
          socket.write(encodeFrame(JSON.stringify({ setupComplete: {} }), 1));
        }
        if (msg.realtimeInput?.audio) {
          audios.push(msg.realtimeInput.audio);
          socket.write(
            encodeFrame(
              JSON.stringify({
                serverContent: {
                  modelTurn: {
                    parts: [{ inlineData: { mimeType: "audio/pcm;rate=24000", data: REPLY_PCM.toString("base64") } }],
                  },
                  outputTranscription: { text: "ok" },
                },
              }),
              1,
            ),
          );
        }
      }
    });
  });
  return { server, setups, audios };
}

async function startBridge({ geminiUrl, startDeadlineMs = 5000 }) {
  const bridge = createBridgeServer({
    streamSecret: SECRET,
    geminiUrl,
    geminiApiKey: "test-gemini-key",
    ermApiBaseUrl: "http://127.0.0.1:9",
    opsDashboardToken: "test-ops-token",
    startDeadlineMs,
  });
  const port = await listen(bridge);
  return { bridge, port };
}

function waitForClose(socket, ms = 2000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("close timeout")), ms);
    socket.addEventListener("close", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function until(check, ms = 2000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (check()) resolve();
      else if (Date.now() - start > ms) reject(new Error("condition timeout"));
      else setTimeout(tick, 15);
    };
    tick();
  });
}

test("custom parameters win and query values fill gaps", () => {
  const query = new URLSearchParams({
    reference: "from-query",
    sessionKey: "query-key",
    consentAt: "query-consent",
    streamToken: "query-token",
  });
  assert.deepEqual(resolveStreamIdentity({ reference: "from-start", streamToken: "start-token" }, query), {
    reference: "from-start",
    sessionKey: "query-key",
    consentAt: "query-consent",
    streamToken: "start-token",
  });
});

test("a fake Twilio stream reaches a stub Gemini and a bad token does not", async () => {
  const logs = [];
  const original = console.log;
  console.log = (line) => {
    logs.push(String(line));
  };
  const stub = startGeminiStub();
  const stubPort = await listen(stub.server);
  const { bridge, port } = await startBridge({ geminiUrl: `ws://127.0.0.1:${stubPort}` });
  const messages = [];
  try {
    const client = new WebSocket(`ws://127.0.0.1:${port}/twilio-stream`);
    client.addEventListener("message", (ev) => {
      messages.push(JSON.parse(String(ev.data)));
    });
    await new Promise((resolve, reject) => {
      client.addEventListener("open", resolve, { once: true });
      client.addEventListener("error", reject, { once: true });
    });
    client.send(JSON.stringify({ event: "connected", protocol: "Call", version: "1.0.0" }));
    client.send(
      JSON.stringify({
        event: "start",
        streamSid: "MZ_test",
        start: {
          callSid: "CA_test_sim",
          streamSid: "MZ_test",
          customParameters: {
            reference: REFERENCE,
            sessionKey: SESSION,
            consentAt: CONSENT,
            streamToken: TOKEN,
          },
        },
      }),
    );
    await until(() => stub.setups.length === 1 && logs.some((line) => line.includes("gemini_setup_complete")));
    assert.equal(stub.setups[0].setup.model, "models/gemini-3.8-live");
    assert.deepEqual(stub.setups[0].setup.inputAudioTranscription, {});
    assert.deepEqual(stub.setups[0].setup.outputAudioTranscription, {});
    client.send(
      JSON.stringify({
        event: "media",
        streamSid: "MZ_test",
        media: { payload: Buffer.alloc(16, 0xff).toString("base64") },
      }),
    );
    await until(() => stub.audios.length === 1 && messages.some((m) => m.event === "media" && m.media?.payload));
    assert.equal(stub.audios[0].mimeType, "audio/pcm;rate=16000");
    assert.ok(stub.audios[0].data.length > 0);
    client.send(JSON.stringify({ event: "stop", streamSid: "MZ_test" }));
    await waitForClose(client);
  } finally {
    console.log = original;
    await closeServer(bridge);
    await closeServer(stub.server);
  }
  const parsed = logs
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((row) => row && row.service === "micro-titan-voice-bridge");
  assert.ok(parsed.length > 0);
  for (const row of parsed) assert.equal(typeof row.message, "string");
  assert.ok(parsed.some((row) => row.event === "stream_started" && row.callSid === "CA_test_sim" && row.reference === REFERENCE));
  assert.ok(parsed.some((row) => row.event === "gemini_setup_complete" && row.message.includes("gemini_setup_complete")));
  assert.ok(parsed.some((row) => row.event === "twilio_stop"));
  assert.equal(parsed.some((row) => JSON.stringify(row).includes(SECRET)), false);
});

test("a bad token, a missing token, and a late start never open Gemini", { concurrency: false }, async () => {
  const stub = startGeminiStub();
  const stubPort = await listen(stub.server);
  const { bridge, port } = await startBridge({
    geminiUrl: `ws://127.0.0.1:${stubPort}`,
    startDeadlineMs: 200,
  });
  try {
    const bad = new WebSocket(`ws://127.0.0.1:${port}/twilio-stream`);
    await new Promise((resolve) => bad.addEventListener("open", resolve, { once: true }));
    bad.send(
      JSON.stringify({
        event: "start",
        start: {
          callSid: "CA_bad",
          customParameters: {
            reference: REFERENCE,
            sessionKey: SESSION,
            consentAt: CONSENT,
            streamToken: "0".repeat(64),
          },
        },
      }),
    );
    await waitForClose(bad);
    const missing = new WebSocket(`ws://127.0.0.1:${port}/twilio-stream`);
    await new Promise((resolve) => missing.addEventListener("open", resolve, { once: true }));
    missing.send(JSON.stringify({ event: "start", start: { callSid: "CA_missing", customParameters: {} } }));
    await waitForClose(missing);
    const late = new WebSocket(`ws://127.0.0.1:${port}/twilio-stream`);
    await new Promise((resolve) => late.addEventListener("open", resolve, { once: true }));
    await waitForClose(late, 1000);
    assert.equal(stub.setups.length, 0);
    const params = new URLSearchParams({
      reference: REFERENCE,
      sessionKey: SESSION,
      consentAt: CONSENT,
      streamToken: TOKEN,
    });
    const fallback = new WebSocket(`ws://127.0.0.1:${port}/twilio-stream?${params.toString()}`);
    await new Promise((resolve) => fallback.addEventListener("open", resolve, { once: true }));
    fallback.send(JSON.stringify({ event: "start", start: { callSid: "CA_query", customParameters: {} } }));
    await until(() => stub.setups.length === 1);
    fallback.close();
  } finally {
    await closeServer(bridge);
    await closeServer(stub.server);
  }
});
