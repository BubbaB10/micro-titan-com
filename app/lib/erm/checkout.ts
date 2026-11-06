/**
 * Gap 3 follow-up — per-client Stripe Checkout Sessions for discovery
 * fees. Pure logic (no I/O, no secrets stored, no database connection).
 *
 * Why this exists: PR #30's webhook links a payment by the
 * `intake_reference` + `lane` metadata on the Stripe event. The existing
 * shared payment links carry `lane` + `intake_type=discovery` but NO
 * intake_reference — a shared link cannot carry a per-client reference —
 * and their `payment_intent_data` is empty, so
 * `payment_intent.succeeded` events carry no metadata at all. Payments
 * through the shared links therefore record as UNLINKED. A Checkout
 * Session created per client, for that client's own intake reference,
 * closes that gap: the session metadata AND the PaymentIntent metadata
 * both carry intake_reference + lane + intake_type, so both event types
 * the webhook handles link automatically.
 *
 * Discovery pricing (approved, from app/lib/erm/types.ts LANE_PRICING —
 * do not change here): Family $150, Solo entrepreneur $500,
 * Business $1,000, each credited toward the program total. Amounts in
 * cents: 15000 / 50000 / 100000. Kept as literals here, not imported
 * as a value, so this module stays importable by the plain
 * `node --test` suite, which strips types and cannot resolve
 * extensionless value imports. The test suite pins these literals to
 * the types.ts values.
 *
 * Session construction uses Stripe's `price_data` (ad-hoc price) rather
 * than reusing the shared links' price IDs: the three discovery price
 * IDs were not all confirmed in this slice, and an ad-hoc price keeps
 * the amount exactly pinned to LANE_PRICING with no dependency on a
 * price object that could be edited in the dashboard. Reusing the
 * existing price IDs is a safe later swap — the metadata, not the
 * price object, is what links the payment — and is flagged as an open
 * question in the PR body. The product name matches the shared links'
 * line-item description: "Micro Titan Discovery — {Lane}".
 *
 * This module never charges anyone, never stores card details, and
 * never touches a Stripe secret. The secret lives only in the route,
 * read from STRIPE_SECRET_KEY at request time, and is passed into
 * createCheckoutSession as an argument — never logged, never returned.
 * The route returns only the Checkout Session URL; the client is
 * redirected there and pays on Stripe's hosted page.
 */

export type CheckoutLane = "Family" | "Solo entrepreneur" | "Business";

/** Discovery amounts in cents, mirroring LANE_PRICING.discoveryCents. */
export const CHECKOUT_CENTS: Record<CheckoutLane, number> = {
  Family: 15000,
  "Solo entrepreneur": 50000,
  Business: 100000,
};

/** Intake reference format, same as the intake route: MT-YYYYMMDD-XXXX. */
export const INTAKE_REFERENCE_PATTERN = /^MT-\d{8}-[A-Z0-9]{4}$/;

export function isValidReference(value: unknown): value is string {
  return typeof value === "string" && INTAKE_REFERENCE_PATTERN.test(value);
}

/** Accept the short "Solo" alias, same as stripe.ts normalizeLane. Case-insensitive for consistency with stripe.ts: a client-supplied lane in lowercase ("family" / "solo" / "business") must normalize, not fail as bad_input. */
export function normalizeCheckoutLane(value: unknown): CheckoutLane | null {
  if (typeof value !== "string") return null;
  const lane = value.trim().toLowerCase();
  if (lane === "family") return "Family";
  if (lane === "business") return "Business";
  if (lane === "solo entrepreneur" || lane === "solo") return "Solo entrepreneur";
  return null;
}

/** The three metadata keys every discovery session must carry. */
export function discoveryMetadata(reference: string, lane: CheckoutLane): Record<string, string> {
  return { intake_reference: reference, lane, intake_type: "discovery" };
}

/**
 * Form-encoded Stripe Checkout Session create parameters, as
 * key/value pairs (Stripe's API takes application/x-www-form-urlencoded).
 * Both `metadata` (copied to the Checkout Session, which is what
 * checkout.session.completed carries) and `payment_intent_data.metadata`
 * (copied to the underlying PaymentIntent, which is what
 * payment_intent.succeeded carries) get the same three keys — that is
 * what closes the PI-metadata gap found in review.
 *
 * success_url sends the payer to /book-discovery (the next step after
 * paying in the adopted flow: agree → pay → book discovery); cancel_url
 * sends them back to /accept-agreement. Neither page is created here;
 * both already exist on the site.
 */
export function buildCheckoutSessionParams(
  reference: string,
  lane: CheckoutLane,
  siteUrl: string,
): Record<string, string> {
  const base = siteUrl.replace(/\/+$/, "");
  const metadata = discoveryMetadata(reference, lane);
  return {
    mode: "payment",
    "success_url": `${base}/book-discovery`,
    "cancel_url": `${base}/accept-agreement`,
    "metadata[intake_reference]": metadata.intake_reference,
    "metadata[lane]": metadata.lane,
    "metadata[intake_type]": metadata.intake_type,
    "payment_intent_data[metadata][intake_reference]": metadata.intake_reference,
    "payment_intent_data[metadata][lane]": metadata.lane,
    "payment_intent_data[metadata][intake_type]": metadata.intake_type,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(CHECKOUT_CENTS[lane]),
    "line_items[0][price_data][product_data][name]": `Micro Titan Discovery — ${lane}`,
  };
}

export type CreateCheckoutSessionResult =
  | { ok: true; sessionId: string; url: string }
  | { ok: false; error: "stripe_error" | "bad_response" };

/**
 * Create the session against Stripe's API with a caller-supplied fetch
 * (injected so tests never hit live Stripe). Uses fetch directly, not
 * the Stripe SDK, matching the Gap 3 no-SDK approach: one POST, no new
 * dependency, no SDK surface to keep current. The secret is used only
 * as the Bearer token for this one call and is never logged or
 * returned. Stripe errors are collapsed to "stripe_error" — Stripe's
 * error body is never echoed to the caller, so no account detail leaks.
 */
export async function createCheckoutSession(
  params: Record<string, string>,
  secret: string,
  fetchImpl: typeof fetch,
): Promise<CreateCheckoutSessionResult> {
  const body = new URLSearchParams(params).toString();
  let res: Response;
  try {
    res = await fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  } catch {
    return { ok: false, error: "stripe_error" };
  }
  if (!res.ok) return { ok: false, error: "stripe_error" };
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "bad_response" };
  }
  if (
    typeof data !== "object" ||
    data === null ||
    typeof (data as Record<string, unknown>).id !== "string" ||
    typeof (data as Record<string, unknown>).url !== "string"
  ) {
    return { ok: false, error: "bad_response" };
  }
  const d = data as { id: string; url: string };
  return { ok: true, sessionId: d.id, url: d.url };
}
