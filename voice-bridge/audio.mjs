// Micro Titan voice bridge — audio transcoding helpers, no dependencies.
//
// Twilio Media Streams speaks μ-law at 8 kHz. Gemini Live speaks
// 16-bit PCM — 16 kHz in, 24 kHz out (per the design doc; the output
// rate is a config constant in session.mjs, re-check it before the
// first test call). The bridge has to convert both ways, so the
// conversion lives here, pure and tested, with no audio library.
//
// μ-law encode/decode is standard G.711. Resampling is deliberately
// simple — sample duplication up, decimation down — because a
// discovery call is speech, not music, and the alternative (a
// resampling library) is a dependency the bridge does not need.
const MULAW_BIAS = 0x84;
const MULAW_CLIP = 32635;

/** Decode one μ-law byte to a 16-bit PCM sample. */
export function mulawDecode(byte) {
  const u = ~byte & 0xff;
  const sign = u & 0x80;
  const exponent = (u >> 4) & 0x07;
  const mantissa = u & 0x0f;
  let sample = ((mantissa << 3) + MULAW_BIAS) << exponent;
  sample -= MULAW_BIAS;
  return sign !== 0 ? -sample : sample;
}

/** Encode one 16-bit PCM sample to a μ-law byte (standard G.711). */
export function mulawEncode(sample) {
  let s = Math.max(-MULAW_CLIP, Math.min(MULAW_CLIP, Math.trunc(sample)));
  const sign = s < 0 ? 0x80 : 0;
  if (s < 0) s = -s;
  s += MULAW_BIAS;
  // Segment boundaries: the segment is the first table entry >= s.
  const SEG_END = [0xff, 0x1ff, 0x3ff, 0x7ff, 0xfff, 0x1fff, 0x3fff, 0x7fff];
  let exponent = 7;
  for (let i = 0; i < 8; i++) {
    if (s <= SEG_END[i]) {
      exponent = i;
      break;
    }
  }
  const mantissa = (s >> (exponent + 3)) & 0x0f;
  return (~(sign | (exponent << 4) | mantissa)) & 0xff;
}

/** Decode a Buffer of μ-law bytes to an Int16Array of PCM samples. */
export function mulawBufferToPcm16(buffer) {
  const out = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) out[i] = mulawDecode(buffer[i]);
  return out;
}

/** Encode an Int16Array of PCM samples to a Buffer of μ-law bytes. */
export function pcm16ToMulawBuffer(samples) {
  const out = Buffer.alloc(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = mulawEncode(samples[i]);
  return out;
}

/** Upsample PCM by an integer factor by duplicating samples (8 kHz -> 16 kHz = factor 2). */
export function upsample(samples, factor) {
  if (!Number.isInteger(factor) || factor < 1) throw new Error("bad_upsample_factor");
  const out = new Int16Array(samples.length * factor);
  for (let i = 0; i < samples.length; i++) {
    for (let j = 0; j < factor; j++) out[i * factor + j] = samples[i];
  }
  return out;
}

/** Downsample PCM by an integer factor by decimation (24 kHz -> 8 kHz = factor 3). */
export function downsample(samples, factor) {
  if (!Number.isInteger(factor) || factor < 1) throw new Error("bad_downsample_factor");
  const out = new Int16Array(Math.floor(samples.length / factor));
  for (let i = 0; i < out.length; i++) out[i] = samples[i * factor];
  return out;
}

/** Int16Array -> little-endian PCM byte Buffer. */
export function pcm16ToBytes(samples) {
  const out = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) out.writeInt16LE(samples[i], i * 2);
  return out;
}

/** Little-endian PCM byte Buffer -> Int16Array. Trailing odd byte is dropped. */
export function bytesToPcm16(buffer) {
  const count = Math.floor(buffer.length / 2);
  const out = new Int16Array(count);
  for (let i = 0; i < count; i++) out[i] = buffer.readInt16LE(i * 2);
  return out;
}
