/**
 * /pay page state — pure logic, no I/O, no secrets, no database.
 *
 * The /pay page hands a client the per-client Stripe Checkout Session
 * created by POST /api/stripe/checkout (Gap 3 follow-up, PR #30). It
 * never charges anyone itself, never shows card fields, and never lets
 * the client choose an amount or a lane: the amount and lane come only
 * from the intake's recorded lane and the approved LANE_PRICING totals
 * in app/lib/erm/types.ts (Family $150 / $1,650 / $1,500 / $95/mo;
 * Solo entrepreneur $500 / $5,500 / $5,000 / $350/mo;
 * Business $1,000 / $10,000 / $9,000 / $950/mo — discovery credited
 * toward the program total). The literals here mirror those totals so
 * this module stays importable by the plain `node --test` suite, which
 * strips types and cannot resolve extensionless value imports; the
 * test suite pins these literals to the types.ts values.
 *
 * States, in decision order:
 * - "invalid" / "not-found": bad reference format, or no intake with
 *   that reference. The page shows the same clean "reference not
 *   found" message for both, leaks no intake details, and creates
 *   no Checkout Session.
 * - "paid": a linked discovery payment exists for the reference. The
 *   page shows "Discovery already paid" with the next step (book
 *   discovery) and NO pay button — never a second charge.
 * - "unavailable": the database could not be reached or the lookup
 *   failed. The page says payment status could not be verified and
 *   shows NO pay button: without a verified unpaid state, offering
 *   a button risks a double charge, and the checkout endpoint itself
 *   returns 503 without a database.
 * - "unpaid": verified existing intake, no linked discovery payment.
 *   Only this state renders the single "Pay discovery fee" button.
 */

export type PayState = "invalid" | "not-found" | "paid" | "unavailable" | "unpaid";

export type PayLane = "Family" | "Solo entrepreneur" | "Business";

export const PAY_PRICING: Record<
  PayLane,
  { discoveryCents: number; totalCents: number; afterCreditCents: number; monthlyCents: number }
> = {
  Family: { discoveryCents: 15000, totalCents: 165000, afterCreditCents: 150000, monthlyCents: 9500 },
  "Solo entrepreneur": { discoveryCents: 50000, totalCents: 550000, afterCreditCents: 500000, monthlyCents: 35000 },
  Business: { discoveryCents: 100000, totalCents: 1000000, afterCreditCents: 900000, monthlyCents: 95000 },
};

export function formatDollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatMonthly(cents: number): string {
  return `${formatDollars(cents)}/mo`;
}

/**
 * Decide the page state from lookup results only. `intake` is
 * "found" | "not-found" | "unavailable" (from intakeLane), `paid` is
 * true only when paymentStatus reported a linked discovery payment.
 * An invalid reference short-circuits before any lookup.
 */
export function resolvePayState(
  referenceValid: boolean,
  intake: "found" | "not-found" | "unavailable",
  paid: boolean,
): PayState {
  if (!referenceValid) return "invalid";
  if (intake === "not-found") return "not-found";
  if (intake === "unavailable") return "unavailable";
  if (paid) return "paid";
  return "unpaid";
}
