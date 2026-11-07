// Gemini Live WebSocket client. No npm package.
// Node's built-in WebSocket cannot send the x-goog-api-key header,
// and it is not an EventEmitter. This client speaks the same frames
// as ws-frames.mjs and emits open, message, error, and close.
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { randomBytes } from "node:crypto";
import { EventEmitter } from "node:events";
import { createMessageReassembler, decodeFrames, encodeFrame, websocketAccept } from "./ws-frames.mjs";

export function connectWebSocket(urlString, { headers = {} } = {}) {
  const url = new URL(urlString);
  const secure = url.protocol === "wss:";
  const key = randomBytes(16).toString("base64");
  const emitter = new EventEmitter();
  let socket = null;
  let buffer = Buffer.alloc(0);
  let state = 0;
  const reassembler = createMessageReassembler();
  const request = (secure ? httpsRequest : httpRequest)({
    hostname: url.hostname,
    port: url.port || (secure ? 443 : 80),
    path: `${url.pathname}${url.search}`,
    method: "GET",
    headers: {
      Host: url.host,
      Upgrade: "websocket",
      Connection: "Upgrade",
      "Sec-WebSocket-Key": key,
      "Sec-WebSocket-Version": "13",
      ...headers,
    },
  });
  const fail = (err) => {
    if (state === 3) return;
    state = 3;
    emitter.emit("error", err);
  };
  request.once("upgrade", (res, sock) => {
    if (res.headers["sec-websocket-accept"] !== websocketAccept(key)) {
      sock.destroy();
      fail(Object.assign(new Error("bad_websocket_accept"), { code: "bad_websocket_accept" }));
      return;
    }
    socket = sock;
    sock.unref();
    state = 1;
    emitter.emit("open");
    sock.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      let decoded;
      try {
        decoded = decodeFrames(buffer, { requireMask: false });
      } catch (err) {
        fail(err);
        sock.destroy();
        return;
      }
      buffer = decoded.rest;
      for (const frame of decoded.frames) {
        if (frame.opcode === 8) {
          const code = frame.payload.length >= 2 ? frame.payload.readUInt16BE(0) : 1005;
          state = 3;
          emitter.emit("close", code, frame.payload.subarray(Math.min(2, frame.payload.length)));
          sock.destroy();
          return;
        }
        if (frame.opcode === 9) sock.write(encodeFrame(frame.payload, 10, true));
      }
      let messages;
      try {
        messages = reassembler.push(decoded.frames);
      } catch (err) {
        fail(err);
        return;
      }
      for (const payload of messages) emitter.emit("message", payload);
    });
    sock.on("close", () => {
      if (state !== 3) {
        state = 3;
        emitter.emit("close", 1006, Buffer.alloc(0));
      }
    });
    sock.on("error", (err) => fail(err));
  });
  request.once("error", (err) => fail(err));
  request.once("response", (res) => {
    res.resume();
    fail(Object.assign(new Error(`websocket_rejected_${res.statusCode}`), { code: res.statusCode }));
  });
  request.end();
  emitter.send = (data) => {
    if (state !== 1 || !socket) return;
    socket.write(encodeFrame(data, 1, true));
  };
  emitter.close = () => {
    if (!socket || state !== 1) return;
    state = 2;
    try {
      socket.write(encodeFrame(Buffer.alloc(0), 8, true));
    } catch {
      // The peer may already be gone.
    }
    socket.end();
  };
  Object.defineProperty(emitter, "readyState", { get: () => state });
  return emitter;
}
