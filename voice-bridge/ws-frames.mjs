// Micro Titan voice bridge — minimal WebSocket framing, no dependencies.
//
// The bridge is a standalone Node process (see server.mjs). Twilio
// Media Streams speaks WebSocket, and Node's built-in WebSocket
// client covers the Gemini Live side — but the Twilio side needs a
// WebSocket *server*, so the handshake and framing live here, in
// plain Node, with no npm package to install or keep updated.
//
// Only text frames (Twilio sends JSON) and binary frames (audio, if
// a peer ever sends it) are handled. Control frames (ping/pong/close)
// are answered or honoured, not treated as data. Fragmented messages
// are reassembled. Anything else is a protocol error, not a call.
import { createHash } from "node:crypto";

export const WS_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

/** Sec-WebSocket-Accept for a client's Sec-WebSocket-Key. */
export function websocketAccept(key) {
  return createHash("sha1").update(key + WS_MAGIC).digest("base64");
}

/**
 * Encode one server-to-client frame (never masked — servers must not
 * mask). opcode 1 = text, 2 = binary. Payloads under 64KB only;
 * the bridge never sends a larger single frame.
 */
export function encodeFrame(payload, opcode = 1) {
  const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, "utf8");
  if (data.length >= 65536) throw new Error("frame_too_large");
  const header = [0x80 | opcode];
  if (data.length < 126) {
    header.push(data.length);
  } else {
    header.push(126, (data.length >> 8) & 0xff, data.length & 0xff);
  }
  return Buffer.concat([Buffer.from(header), data]);
}

/**
 * Decode frames from a buffer. Returns { frames, rest }: frames is
 * an array of { opcode, payload: Buffer }, rest is the incomplete
 * trailing bytes to keep for the next chunk. Masked client frames
 * are unmasked; unmasked client frames are a protocol error.
 */
export function decodeFrames(buffer) {
  const frames = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    const fin = (first & 0x80) !== 0;
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;
    let headerLength = 2;
    if (length === 126) {
      if (offset + 4 > buffer.length) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (offset + 10 > buffer.length) break;
      const big = buffer.readBigUInt64BE(offset + 2);
      if (big > 65536n) throw new Error("frame_too_large");
      length = Number(big);
      headerLength = 10;
    }
    const maskLength = masked ? 4 : 0;
    if (offset + headerLength + maskLength + length > buffer.length) break;
    if (!masked) throw new Error("client_frame_not_masked");
    const mask = buffer.subarray(offset + headerLength, offset + headerLength + 4);
    const payload = Buffer.from(
      buffer.subarray(
        offset + headerLength + maskLength,
        offset + headerLength + maskLength + length,
      ),
    );
    for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
    frames.push({ fin, opcode, payload });
    offset += headerLength + maskLength + length;
  }
  return { frames, rest: buffer.subarray(offset) };
}

/** Reassemble fragmented text frames into complete messages. */
export function reassembleTextFrames(frames) {
  const messages = [];
  let current = null;
  for (const frame of frames) {
    if (frame.opcode === 1) {
      if (current !== null) throw new Error("fragmented_text_interrupted");
      if (frame.fin) {
        messages.push(frame.payload.toString("utf8"));
      } else {
        current = [frame.payload];
      }
    } else if (frame.opcode === 0) {
      if (current === null) throw new Error("continuation_without_start");
      current.push(frame.payload);
      if (frame.fin) {
        messages.push(Buffer.concat(current).toString("utf8"));
        current = null;
      }
    }
    // Opcodes 2 (binary), 8 (close), 9 (ping), 10 (pong) are handled
    // by the caller, not reassembled here.
  }
  if (current !== null) throw new Error("incomplete_fragmented_message");
  return messages;
}
