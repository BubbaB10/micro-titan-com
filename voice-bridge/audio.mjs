// Micro Titan voice bridge — audio transcoding helpers, no dependencies.
//
// Twilio Media Streams speaks μ-law at 8 kHz. Gemini Live speaks
// 16-bit PCM — 16 kHz in, 24 kHz out (per the design doc; the output
// rate is a config constant in session.mjs, re-check it before the
// first test call). The bridge has to convert both ways, so the
// conversion lives here, pure and tested, with no audio library.
//
// μ-law encode/decode is standard G.711. Resampling is a windowed-sinc
// FIR: low-pass before decimating 24 kHz to 8 kHz, and sinc
// interpolation from 8 kHz to 16 kHz. Each resampler keeps the taps
// of history from the previous chunk so a chunk boundary is not a click.
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

const RESAMPLE_TAPS = 63;

function sinc(x) {
  if (Math.abs(x) < 1e-12) return 1;
  const pix = Math.PI * x;
  return Math.sin(pix) / pix;
}

/** Unity-gain low-pass. cutoffCycles is cycles per sample at the rate the filter runs. */
function designLowpass(taps, cutoffCycles) {
  const mid = (taps - 1) / 2;
  const h = new Float64Array(taps);
  let sum = 0;
  for (let n = 0; n < taps; n++) {
    const x = n - mid;
    const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (taps - 1));
    h[n] = 2 * cutoffCycles * sinc(2 * cutoffCycles * x) * window;
    sum += h[n];
  }
  for (let n = 0; n < taps; n++) h[n] /= sum;
  return h;
}

function clamp16(value) {
  const rounded = Math.round(value);
  if (rounded > 32767) return 32767;
  if (rounded < -32768) return -32768;
  return rounded;
}

/**
 * Integer-factor resampler. "down" low-passes then keeps every Nth
 * sample. "up" stuffs zeros and low-passes at the higher rate.
 * The ring buffer is the filter memory, so chunked process() matches
 * one shot on the same samples.
 */
function createIntegerResampler(direction, factor) {
  if (!Number.isInteger(factor) || factor < 1) throw new Error("bad_resample_factor");
  const taps = RESAMPLE_TAPS;
  const h = designLowpass(taps, 0.45 / factor);
  if (direction === "up") {
    for (let i = 0; i < h.length; i++) h[i] *= factor;
  }
  const ring = new Float64Array(taps);
  let write = 0;
  let seen = 0;

  function push(sample) {
    ring[write] = sample;
    write = (write + 1) % taps;
    seen++;
  }

  function dot() {
    let acc = 0;
    let index = write;
    for (let k = 0; k < taps; k++) {
      acc += h[k] * ring[index];
      index = (index + 1) % taps;
    }
    return acc;
  }

  return {
    process(input) {
      const outputs = [];
      for (let i = 0; i < input.length; i++) {
        if (direction === "down") {
          push(input[i]);
          if (seen >= taps && seen % factor === 0) outputs.push(clamp16(dot()));
        } else {
          for (let j = 0; j < factor; j++) {
            push(j === 0 ? input[i] : 0);
            if (seen >= taps) outputs.push(clamp16(dot()));
          }
        }
      }
      return Int16Array.from(outputs);
    },
  };
}

/** 24 kHz -> 8 kHz is factor 3. State stays inside the returned object. */
export function createDownsampler(factor) {
  return createIntegerResampler("down", factor);
}

/** 8 kHz -> 16 kHz is factor 2. State stays inside the returned object. */
export function createUpsampler(factor) {
  return createIntegerResampler("up", factor);
}

/** One-shot downsample. A fresh filter, no history from a previous chunk. */
export function downsample(samples, factor) {
  return createDownsampler(factor).process(samples);
}

/** One-shot upsample. A fresh filter, no history from a previous chunk. */
export function upsample(samples, factor) {
  return createUpsampler(factor).process(samples);
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
