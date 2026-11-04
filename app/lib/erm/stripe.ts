/**
 * Gap 3 — Stripe discovery payment linkage, pure logic (no I/O, no secrets
 * stored, no database connection). The database side lives in
 * app/lib/erm/payment-store.ts; the webhook route lives in
 * app/api/stripe/webhook/route.ts.
 *
 * Why no Stripe SDK: this slice only verifies webhook signatures and
 * records what Stripe already charged through the existing payment links.
 * Signature verification is one HMAC-SHA256 (node:crypto, already in the
 * runtime), so no new dependency, no Stripe API key, and no SDK surface
 * to keep current. Nothing here charges anyone, creates a payment link,
 * or refunds anything.
 *
 * Discovery pricing (approved, from app/lib/erm/types.ts LANE_PRICING —
 * do not change here): Family $150, Solo entrepreneur $500,
 * Business $1,000, each credited toward the program total. Amounts are
 * in cents: 15000 / 50000 / 100000.
 *
 * Events handled: checkout.session.completed and
 * payment_intent.succeeded, for discovery payments only. A payment is a
 * discovery payment when its Stripe metadata names a lane whose
 * discovery price equals the amount paid. Anything else (other event
 * types, other amounts, other lanes) is rejected or ignored, never
 * recorded as a discovery payment.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Lane } from "./types";

export type DiscoveryLane = Lane;

/**
 * Discovery amounts in cents, mirroring LANE_PRICING.discoveryCents in
 * app/lib/erm/types.ts (Family 15000, Solo entrepreneur 50000,
 * Business 100000). Kept as literals here, not imported as a value,
 * so this module stays importable by the plain `node --test` suite,
 * which strips types and cannot resolve extensionless value imports.
 * The test suite pins these literals to the types.ts values.
 */
export const DISCOVERY_CENTS: Record<Lane, number> = {
  Family: 15000,
  "Solo entrepreneur": 50000,
  Business: 100000,
};

/**
 * Accept the short "Solo" alias Stripe metadata might carry.
 * Case-insensitive (trim + lowercase compare): the existing shared
 * Stripe payment links carry lane lowercase ("family" / "solo" /
 * "business"), and a case-sensitive check rejected every shared-link
 * payment with unknown_lane instead of recording it as unlinked.
 * Anything else is still rejected as null (unknown_lane).
 */
export function normalizeLane(value: unknown): Lane | null {
  if (typeof value !== "string") return null;
  const lane = value.trim().toLowerCase();
  if (lane === "family") return "Family";
  if (lane === "business") return "Business";
  if (lane === "solo entrepreneur" || lane === "solo") return "Solo entrepreneur";
  return null;
}

const SIGNATURE_TOLERANCE_SECONDS = 300;

function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Verify a Stripe webhook signature header ("t=...,v1=...,v1=...") over
 * the RAW request body. Never log the secret, the header, or the
 * computed signature. Returns false for a missing/old/tampered
 * signature. `nowSeconds` is injectable for tests only.
 */
export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!signatureHeader || !secret) return false;
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t" && value) timestamp = Number(value);
    if (key === "v1" && value) signatures.push(value);
  }
  if (timestamp === null || !Number.isFinite(timestamp) || signatures.length === 0) {
    return false;
  }
  if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  return signatures.some((sig) => safeEqual(Buffer.from(sig, "utf8"), expectedBuf));
}

export interface ParsedDiscoveryPayment {
  eventId: string;
  stripePaymentId: string;
  amountCents: number;
  /** Intake reference from Stripe metadata, or null when absent. */
  reference: string | null;
  lane: Lane;
}

export type ParseDiscoveryResult =
  | { ok: true; payment: ParsedDiscoveryPayment }
  | { ok: false; reason: "unsupported_event" | "bad_event" | "unknown_lane" | "amount_mismatch" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function metadataOf(object: unknown): Record<string, unknown> {
  if (isRecord(object) && isRecord(object.metadata)) return object.metadata;
  return {};
}

/**
 * Extract a discovery payment from a Stripe event object. Pure and
 * side-effect free: it never records anything. Amount must equal the
 * lane's discovery price exactly — a mismatch is rejected, never
 * recorded as a discovery payment, because a wrong amount proves
 * nothing about the discovery fee.
 */
export function parseDiscoveryEvent(event: unknown): ParseDiscoveryResult {
  if (!isRecord(event) || typeof event.id !== "string" || typeof event.type !== "string") {
    return { ok: false, reason: "bad_event" };
  }
  if (event.type !== "checkout.session.completed" && event.type !== "payment_intent.succeeded") {
    return { ok: false, reason: "unsupported_event" };
  }
  if (!isRecord(event.data) || !isRecord(event.data.object)) {
    return { ok: false, reason: "bad_event" };
  }
  const object = event.data.object;
  const metadata = metadataOf(object);
  const referenceRaw = metadata.intake_reference ?? metadata.client_reference_id;
  const reference =
    typeof referenceRaw === "string" && referenceRaw.length > 0 ? referenceRaw : null;
  const lane = normalizeLane(metadata.lane);
  if (lane === null) return { ok: false, reason: "unknown_lane" };

  let stripePaymentId: string | null = null;
  let amountCents: number | null = null;
  if (event.type === "checkout.session.completed") {
    amountCents =
      typeof object.amount_total === "number" ? object.amount_total : null;
    stripePaymentId =
      typeof object.payment_intent === "string"
        ? object.payment_intent
        : typeof object.id === "string"
          ? `cs_${object.id}`
          : null;
  } else {
    amountCents =
      typeof object.amount_received === "number"
        ? object.amount_received
        : typeof object.amount === "number"
          ? object.amount
          : null;
    stripePaymentId = typeof object.id === "string" ? object.id : null;
  }
  if (stripePaymentId === null || amountCents === null) {
    return { ok: false, reason: "bad_event" };
  }
  if (amountCents !== DISCOVERY_CENTS[lane]) {
    return { ok: false, reason: "amount_mismatch" };
  }
  return {
    ok: true,
    payment: { eventId: event.id, stripePaymentId, amountCents, reference, lane },
  };
}
