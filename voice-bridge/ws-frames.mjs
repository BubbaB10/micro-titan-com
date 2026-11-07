// Micro Titan voice bridge — minimal WebSocket framing, no dependencies.
//
// The bridge is a standalone Node process (see server.mjs). Twilio
// Media Streams and the Gemini Live client both use this framing.
// Node's built-in WebSocket cannot set the x-goog-api-key header, so
// the Gemini side is voice-bridge/ws-client.mjs. No npm package.
//
// Only text frames (Twilio sends JSON) and binary frames (audio, if
// a peer ever sends it) are handled. Control frames (ping/pong/close)
// are answered or honoured, not treated as data. Fragmented messages
// are reassembled. Anything else is a protocol error, not a call.
import { createHash, randomBytes } from "node:crypto";

export const WS_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

/** Sec-WebSocket-Accept for a client's Sec-WebSocket-Key. */
export function websocketAccept(key) {
  return createHash("sha1").update(key + WS_MAGIC).digest("base64");
}

/**
 * Encode one frame. opcode 1 = text, 2 = binary. Payloads under 64KB.
 * Servers must pass mask=false. Clients must pass mask=true (RFC 6455).
 */
export function encodeFrame(payload, opcode = 1, mask = false) {
  const raw = Buffer.isBuffer(payload) ? Buffer.from(payload) : Buffer.from(payload, "utf8");
  if (raw.length >= 65536) throw new Error("frame_too_large");
  const header = [0x80 | opcode];
  const maskKey = mask ? randomBytes(4) : null;
  const data = maskKey ? Buffer.from(raw) : raw;
  if (maskKey) {
    for (let i = 0; i < data.length; i++) data[i] ^= maskKey[i % 4];
  }
  const lengthByte = (mask ? 0x80 : 0) | (data.length < 126 ? data.length : 126);
  if (data.length < 126) {
    header.push(lengthByte);
  } else {
    header.push(lengthByte, (data.length >> 8) & 0xff, data.length & 0xff);
  }
  const parts = [Buffer.from(header)];
  if (maskKey) parts.push(maskKey);
  parts.push(data);
  return Buffer.concat(parts);
}

/**
 * Decode frames from a buffer. Returns { frames, rest }: frames is
 * an array of { opcode, payload: Buffer }, rest is the incomplete
 * trailing bytes to keep for the next chunk. Masked frames are
 * unmasked. Unmasked frames are a protocol error unless
 * requireMask is false (the Gemini client reading server frames).
 */
export function decodeFrames(buffer, options = {}) {
  const requireMask = options.requireMask !== false;
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
    if (!masked && requireMask) throw new Error("client_frame_not_masked");
    const payload = Buffer.from(
      buffer.subarray(
        offset + headerLength + maskLength,
        offset + headerLength + maskLength + length,
      ),
    );
    if (masked) {
      const mask = buffer.subarray(offset + headerLength, offset + headerLength + 4);
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
    }
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
