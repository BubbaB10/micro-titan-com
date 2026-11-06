/**
 * Gap 5 — billing step: per-client Stripe Checkout Sessions for the
 * program balance. Pure logic (no I/O, no secrets stored, no database
 * connection). The record shape lives in app/lib/erm/balance-store.ts
 * (PR #35); this module is the step that issues a balance and builds
 * the session the client pays on.
 *
 * When the balance is due — DECIDED by the owner 2026-11-05:
 * collect the FULL program balance on agreement of scope. "Agreement
 * of scope" = after discovery, the client has seen the presentation
 * and said yes to the first job's scope. That agreement is the
 * trigger for the balance payment, and setup starts only after that
 * payment lands. One payment, one record: Family $1,500 / Solo
 * entrepreneur $5,000 / Business $9,000 — the program total minus
 * the discovery fee already paid (LANE_PRICING.afterCreditCents).
 *
 * How the trigger is attested in this slice: the route that calls
 * this module requires scopeAgreed === true in the request body.
 * The route is called by the owner (Boone) only after the client
 * has agreed scope — there is no client-facing scope-agreement form
 * yet, and no client can issue their own balance. The issue itself,
 * plus the AuditLog balance_issued row, is the record that scope
 * was agreed. A future presentation/scope record (presentation
 * generator, next item in the machine plan) will replace this
 * attestation with a record the client themselves agreed to; until
 * then, the owner-side call is the gate, and it must stay that way.
 *
 * Session construction mirrors app/lib/erm/checkout.ts (Gap 3
 * discovery sessions): price_data ad-hoc price, exact cents pinned
 * to LANE_PRICING, metadata intake_reference + lane +
 * intake_type="balance" on BOTH the session and, via
 * payment_intent_data.metadata, the underlying PaymentIntent — so
 * both checkout.session.completed and payment_intent.succeeded
 * events link in the webhook (see parseBalanceEvent in stripe.ts).
 * The product name matches the pattern of the discovery sessions:
 * "Micro Titan Program Balance — {Lane}".
 *
 * Amounts are kept as literals here, not imported as a value, so
 * this module stays importable by the plain `node --test` suite,
 * which strips types and cannot resolve extensionless value
 * imports. The test suite pins these literals to the types.ts
 * values (and to BALANCE_CENTS in balance-store.ts).
 *
 * This module never charges anyone, never stores card details, and
 * never touches a Stripe secret. The secret lives only in the route.
 *
 * success_url / cancel_url: success goes to /balance-paid (the
 * post-balance confirmation page). That page confirms Stripe
 * returned the payer here and states that setup starts only after
 * the payment is confirmed on our side; it does not look up ERM
 * state or invent client data. Cancel still goes back to the
 * agreement page.
 */

import type { Lane } from "./types";

export type BalanceLane = Lane;

/** Program balance in cents, mirroring LANE_PRICING.afterCreditCents. */
export const BALANCE_CHECKOUT_CENTS: Record<BalanceLane, number> = {
  Family: 150000,
  "Solo entrepreneur": 500000,
  Business: 900000,
};

/** The three metadata keys every balance session must carry. */
export function balanceMetadata(
  reference: string,
  lane: BalanceLane,
): Record<string, string> {
  return { intake_reference: reference, lane, intake_type: "balance" };
}

/**
 * Form-encoded Stripe Checkout Session create parameters, as
 * key/value pairs. Both `metadata` and
 * `payment_intent_data.metadata` get the same three keys — that is
 * what links both event types the webhook handles.
 */
export function buildBalanceCheckoutSessionParams(
  reference: string,
  lane: BalanceLane,
  siteUrl: string,
): Record<string, string> {
  const base = siteUrl.replace(/\/+$/, "");
  const metadata = balanceMetadata(reference, lane);
  return {
    mode: "payment",
    "success_url": `${base}/balance-paid`,
    "cancel_url": `${base}/accept-agreement`,
    "metadata[intake_reference]": metadata.intake_reference,
    "metadata[lane]": metadata.lane,
    "metadata[intake_type]": metadata.intake_type,
    "payment_intent_data[metadata][intake_reference]": metadata.intake_reference,
    "payment_intent_data[metadata][lane]": metadata.lane,
    "payment_intent_data[metadata][intake_type]": metadata.intake_type,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(
      BALANCE_CHECKOUT_CENTS[lane],
    ),
    "line_items[0][price_data][product_data][name]": `Micro Titan Program Balance — ${lane}`,
  };
}
