// Stream lock for the Railway voice bridge.
//
// Vendored from app/lib/erm/voice-discovery.ts, which is the source
// of truth. tests assert these functions return the same bytes.
// Twilio <Connect><Stream> does not forward URL query strings, so
// reference, sessionKey, consentAt, and streamToken arrive in the
// start event's customParameters. Query values are only a fallback.
import { createHmac, timingSafeEqual } from "node:crypto";

/** HMAC-SHA256 hex of reference|sessionKey|consentAt, keyed by the shared secret. */
export function voiceStreamToken(secret, reference, sessionKey, consentAt) {
  return createHmac("sha256", secret)
    .update(`${reference}|${sessionKey}|${consentAt}`, "utf8")
    .digest("hex");
}

/** Timing-safe check. Missing secret, missing token, or a length mismatch fails closed. */
export function verifyVoiceStreamToken(secret, reference, sessionKey, consentAt, token) {
  if (!secret || typeof token !== "string" || token.length === 0) return false;
  const expected = voiceStreamToken(secret, reference, sessionKey, consentAt);
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(token, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * customParameters win field by field. A missing custom field falls
 * back to the upgrade URL query string. Twilio does not send that
 * query string; the fallback is for a client that does.
 */
export function resolveStreamIdentity(customParameters, query) {
  const custom =
    customParameters && typeof customParameters === "object" ? customParameters : {};
  const pick = (name) => {
    const value = custom[name];
    if (typeof value === "string" && value.length > 0) return value;
    if (query && typeof query.get === "function") {
      const fromQuery = query.get(name);
      if (typeof fromQuery === "string" && fromQuery.length > 0) return fromQuery;
    }
    return "";
  };
  return {
    reference: pick("reference"),
    sessionKey: pick("sessionKey"),
    consentAt: pick("consentAt"),
    streamToken: pick("streamToken"),
  };
}
