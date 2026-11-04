/**
 * GET /pay?reference=MT-YYYYMMDD-XXXX — Gap 3 surfacing slice (PR #30).
 *
 * This page is the client-facing hand-off for the per-client Stripe
 * Checkout Session created by POST /api/stripe/checkout. It does NOT
 * charge anyone, collect card details, or create a session itself:
 * it only shows the verified state for one intake reference and, for
 * a verified unpaid intake, renders the single PayDiscoveryButton,
 * which POSTs { reference } only and redirects to Stripe.
 *
 * States (see app/lib/erm/pay.ts):
 * - invalid / not-found: same clean "reference not found" message,
 *   no intake details leaked, no session created, no button.
 * - paid: "Discovery already paid" + next step (book discovery),
 *   NO button — never a second charge.
 * - unavailable: database/lookup failed — "could not be verified",
 *   NO button (the checkout endpoint itself is 503 without a DB).
 * - unpaid: lane, discovery fee (credited), program total, total
 *   after credit, monthly (optional), and the one pay button.
 *   No lane switching, no amount input — the client cannot edit
 *   what they pay.
 *
 * Success/cancel flow is unchanged from the checkout endpoint:
 * success → /book-discovery, cancel → /accept-agreement.
 * No auto-send is built here: how a client receives their /pay link
 * (Boone-sent, agreement-confirmation link, or otherwise) is a
 * separate decision, flagged in the PR body.
 */

import type { Metadata } from "next";
import PayDiscoveryButton from "../components/PayDiscoveryButton";
import { isValidReference } from "../lib/erm/checkout";
import { intakeLane } from "../lib/erm/checkout-store";
import { paymentStatus } from "../lib/erm/payment-store";
import { formatDollars, formatMonthly, PAY_PRICING, resolvePayState } from "../lib/erm/pay";
import "./pay.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pay discovery fee | Micro Titan",
  description:
    "Pay the Micro Titan discovery fee for your intake reference. The fee is credited toward the program total. Payment happens on Stripe's hosted page.",
};

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.reference;
  const reference = typeof raw === "string" ? raw : "";
  const valid = isValidReference(reference);

  let state = resolvePayState(valid, "not-found", false);
  let lane: keyof typeof PAY_PRICING | null = null;

  if (valid) {
    const laneResult = await intakeLane(reference);
    if (laneResult.status === "ok") {
      lane = laneResult.lane;
      const paidResult = await paymentStatus(reference);
      if (paidResult.status === "ok") {
        state = resolvePayState(true, "found", paidResult.paid);
      } else {
        state = resolvePayState(true, "unavailable", false);
      }
    } else if (laneResult.status === "not_found") {
      state = "not-found";
    } else {
      state = "unavailable";
    }
  }

  return (
    <main className="pay-page">
      <div className="pay-inner">
        <p className="pay-brand">Micro Titan</p>
        {state === "invalid" || state === "not-found" ? (
          <>
            <h1>Reference not found</h1>
            <p>
              We could not find an intake with that reference. Check the reference from your intake
              — it looks like MT-YYYYMMDD-XXXX — and try again.
            </p>
          </>
        ) : state === "unavailable" ? (
          <>
            <h1>Payment status could not be verified</h1>
            <p>
              We could not verify the payment status for this reference right now. Please try again
              later. No payment was started.
            </p>
          </>
        ) : state === "paid" ? (
          <>
            <h1>Discovery already paid</h1>
            <p>
              The discovery fee for intake reference {reference} has already been paid. There is
              nothing more to pay here.
            </p>
            <p>
              Next step:{" "}
              <a href="/book-discovery">book a discovery conversation</a>.
            </p>
          </>
        ) : lane ? (
          <>
            <h1>Pay discovery fee</h1>
            <p>
              Intake reference: <strong>{reference}</strong>
            </p>
            <p>Lane: {lane}</p>
            <dl className="pay-pricing">
              <div>
                <dt>Discovery fee (credited)</dt>
                <dd>{formatDollars(PAY_PRICING[lane].discoveryCents)}</dd>
              </div>
              <div>
                <dt>Program total</dt>
                <dd>{formatDollars(PAY_PRICING[lane].totalCents)}</dd>
              </div>
              <div>
                <dt>Total after credit</dt>
                <dd>{formatDollars(PAY_PRICING[lane].afterCreditCents)}</dd>
              </div>
              <div>
                <dt>Monthly operate plan (optional)</dt>
                <dd>{formatMonthly(PAY_PRICING[lane].monthlyCents)}</dd>
              </div>
            </dl>
            <p>
              The discovery fee is credited toward the program total. Payment happens on Stripe&apos;s
              hosted page — Micro Titan never sees your card details.
            </p>
            <PayDiscoveryButton reference={reference} amountLabel={formatDollars(PAY_PRICING[lane].discoveryCents)} />
            <p className="pay-fine">
              Changed your mind? You can go back to the{" "}
              <a href="/accept-agreement">Scope &amp; Terms acceptance page</a> instead.
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}
