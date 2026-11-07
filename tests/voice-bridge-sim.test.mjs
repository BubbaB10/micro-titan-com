// Local end-to-end simulation. No Twilio account, no Gemini, no call.
// A fake Twilio client speaks the Media Streams events. A stub
// Gemini server accepts the bridge's WebSocket. The bridge under
// test is the real server.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { voiceStreamToken } from "../app/lib/erm/voice-discovery.ts";
import { createBridgeServer } from "../voice-bridge/server.mjs";
import { connectWebSocket } from "../voice-bridge/ws-client.mjs";
import { createMessageReassembler, decodeFrames, encodeFrame, websocketAccept } from "../voice-bridge/ws-frames.mjs";
import { VOICE_CALL_OPENING } from "../app/lib/erm/voice-discovery.ts";
import { resolveStreamIdentity } from "../voice-bridge/stream-auth.mjs";

const SECRET = "test_only_stream_secret";
const REFERENCE = "MT-20261107-TEST";
const SESSION = "voice-test-sim";
const CONSENT = "2026-11-07T00:40:00.000Z";
const TOKEN = voiceStreamToken(SECRET, REFERENCE, SESSION, CONSENT);
const REPLY_PCM = Buffer.alloc(400);
for (let i = 0; i < REPLY_PCM.length; i += 2) REPLY_PCM.writeInt16LE(1000, i);

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
  const fromClient = [];
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
    const reassembler = createMessageReassembler();
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
      let payloads;
      try {
        payloads = reassembler.push(decoded.frames);
      } catch {
        socket.destroy();
        return;
      }
      for (const payload of payloads) {
        const msg = JSON.parse(payload.toString("utf8"));
        fromClient.push(msg);
        if (msg.setup) {
          setups.push(msg);
          // Gemini Live delivers JSON on binary frames (opcode 2).
          socket.write(encodeFrame(JSON.stringify({ setupComplete: {} }), 2));
        }
        if (msg.realtimeInput?.audio) {
          audios.push(msg.realtimeInput.audio);
          const body = JSON.stringify({
            serverContent: {
              modelTurn: {
                parts: [{ inlineData: { mimeType: "audio/pcm;rate=24000", data: REPLY_PCM.toString("base64") } }],
              },
              outputTranscription: { text: "ok" },
            },
          });
          const mid = 24;
          socket.write(encodeFrame(body.slice(0, mid), 2, false, false));
          socket.write(encodeFrame(body.slice(mid), 0));
        }
      }
    });
  });
  return { server, setups, audios, fromClient };
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

function until(check, ms = 2000, label = "condition") {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      let ok = false;
      try {
        ok = check();
      } catch (err) {
        reject(err);
        return;
      }
      if (ok) resolve();
      else if (Date.now() - start > ms) reject(new Error(`timeout ${label}`));
      else setTimeout(tick, 15);
    };
    tick();
  });
}

test("a binary setupComplete split across two socket writes is delivered", async () => {
  const body = JSON.stringify({ setupComplete: {} });
  const mid = 8;
  const server = createServer();
  server.on("upgrade", (req, socket) => {
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
        `Sec-WebSocket-Accept: ${websocketAccept(req.headers["sec-websocket-key"])}\r\n\r\n`,
    );
    // After the handshake, so the client is listening, then two reads.
    setTimeout(() => {
      socket.write(encodeFrame(body.slice(0, mid), 2, false, false));
      setTimeout(() => socket.write(encodeFrame(body.slice(mid), 0)), 30);
    }, 30);
  });
  const port = await listen(server);
  const client = connectWebSocket(`ws://127.0.0.1:${port}/`);
  const received = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("binary frame timeout")), 1500);
    client.on("message", (payload) => {
      clearTimeout(timer);
      resolve(payload.toString("utf8"));
    });
    client.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
  try {
    assert.equal(await received, body);
  } finally {
    client.close();
    await closeServer(server);
  }
});

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
    await until(() => stub.setups.length === 1, 2000, `setups=${stub.setups.length}`);
    await until(() => logs.some((line) => line.includes("gemini_setup_complete")), 2000, `logs=${logs.length}`);
    assert.equal(stub.setups[0].setup.model, "models/gemini-3.8-live");
    assert.deepEqual(stub.setups[0].setup.inputAudioTranscription, {});
    assert.deepEqual(stub.setups[0].setup.outputAudioTranscription, {});
    await until(
      () =>
        stub.fromClient.some(
          (msg) =>
            msg.clientContent?.turnComplete === true &&
            msg.clientContent.turns?.[0]?.parts?.[0]?.text?.includes(VOICE_CALL_OPENING),
        ),
      2000,
      "greeting",
    );
    client.send(
      JSON.stringify({
        event: "media",
        streamSid: "MZ_test",
        media: { payload: Buffer.alloc(160, 0xff).toString("base64") },
      }),
    );
    await until(
      () => stub.audios.length === 1 && messages.some((m) => m.event === "media" && m.media?.payload),
      2000,
      "audio",
    );
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
  assert.ok(parsed.some((row) => row.event === "gemini_first_message" && row.type === "setupComplete"));
  assert.ok(parsed.some((row) => row.event === "gemini_first_audio_out"));
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
