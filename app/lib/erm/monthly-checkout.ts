/**
 * P0 item 3 — per-client Stripe Checkout Sessions for the monthly
 * operate-plan payment. Pure logic (no I/O, no secrets stored, no
 * database connection).
 *
 * Why this exists: PR #40's webhook (parseMonthlyEvent in stripe.ts)
 * records a monthly payment only when the Stripe event carries
 * metadata intake_reference + lane + intake_type="monthly". The
 * shared monthly payment links carry {lane, plan: "monthly"} with
 * no intake_type and no intake_reference, so a shared-link monthly
 * payment does NOT parse as a monthly event and cannot be linked
 * to a client yet. A Checkout Session created per client, for that
 * client's own intake reference, closes that gap — exactly as the
 * Gap 5 balance-checkout slice (PR #36, balance-checkout.ts) did
 * for program balances. The session metadata AND the PaymentIntent
 * metadata both carry intake_reference + lane +
 * intake_type="monthly", so both event types the webhook handles
 * link automatically.
 *
 * Monthly pricing (approved, from app/lib/erm/types.ts
 * LANE_PRICING — do not change here): Family $95 / Solo
 * entrepreneur $350 / Business $950 per month, optional plan.
 * Amounts in cents: 9500 / 35000 / 95000. Kept as literals here,
 * not imported as a value, so this module stays importable by the
 * plain `node --test` suite, which strips types and cannot resolve
 * extensionless value imports. The test suite pins these literals
 * to the types.ts values (and to MONTHLY_CENTS in stripe.ts and
 * monthly-store.ts).
 *
 * Session construction mirrors app/lib/erm/balance-checkout.ts
 * (PR #36): price_data ad-hoc price, exact cents pinned to
 * LANE_PRICING, metadata intake_reference + lane +
 * intake_type="monthly" on BOTH the session and, via
 * payment_intent_data.metadata, the underlying PaymentIntent — so
 * both checkout.session.completed and payment_intent.succeeded
 * events link in the webhook (see parseMonthlyEvent in stripe.ts).
 * The product name matches the pattern of the discovery and
 * balance sessions: "Micro Titan Monthly Operate Plan — {Lane}".
 *
 * This module never charges anyone, never stores card details, and
 * never touches a Stripe secret. The secret lives only in the route.
 *
 * success_url / cancel_url: there is no post-monthly client page
 * yet — after paying, the client waits for the next month, and the
 * monthly operate plan is tracked in the ERM, not on a client
 * page. Until a post-monthly confirmation page exists, success
 * goes to the site home with ?monthly=paid (ignored by the home
 * page) and cancel goes back to the site home. Neither URL is a
 * promise of a page; both are flagged as a later slice in the PR
 * body.
 *
 * A monthly payment never enrolls a client: enrollment stays an
 * explicit owner action (POST /api/ops/monthly-enroll, PR #40).
 * This module only builds the session the client pays on.
 */

import type { Lane } from "./types";

export type MonthlyLane = Lane;

/** Monthly operate-plan price in cents, mirroring LANE_PRICING.monthlyCents. */
export const MONTHLY_CHECKOUT_CENTS: Record<MonthlyLane, number> = {
  Family: 9500,
  "Solo entrepreneur": 35000,
  Business: 95000,
};

/** The three metadata keys every monthly session must carry. */
export function monthlyMetadata(
  reference: string,
  lane: MonthlyLane,
): Record<string, string> {
  return { intake_reference: reference, lane, intake_type: "monthly" };
}

/**
 * Form-encoded Stripe Checkout Session create parameters, as
 * key/value pairs. Both `metadata` and
 * `payment_intent_data.metadata` get the same three keys — that is
 * what links both event types the webhook handles.
 */
export function buildMonthlyCheckoutSessionParams(
  reference: string,
  lane: MonthlyLane,
  siteUrl: string,
): Record<string, string> {
  const base = siteUrl.replace(/\/+$/, "");
  const metadata = monthlyMetadata(reference, lane);
  return {
    mode: "payment",
    "success_url": `${base}/?monthly=paid`,
    "cancel_url": `${base}/`,
    "metadata[intake_reference]": metadata.intake_reference,
    "metadata[lane]": metadata.lane,
    "metadata[intake_type]": metadata.intake_type,
    "payment_intent_data[metadata][intake_reference]": metadata.intake_reference,
    "payment_intent_data[metadata][lane]": metadata.lane,
    "payment_intent_data[metadata][intake_type]": metadata.intake_type,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(
      MONTHLY_CHECKOUT_CENTS[lane],
    ),
    "line_items[0][price_data][product_data][name]": `Micro Titan Monthly Operate Plan — ${lane}`,
  };
}
