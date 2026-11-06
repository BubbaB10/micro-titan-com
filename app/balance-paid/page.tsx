/**
 * GET /balance-paid — post-balance Stripe Checkout success page (P2 item 7).
 *
 * Stripe Checkout success_url used to dump payers on the site home with
 * ?balance=paid (ignored by the home page). This page is the dedicated
 * confirmation: it says the checkout returned here, what happens next,
 * and what this page does NOT do.
 *
 * Honesty bounds (do not loosen without evidence):
 * - This page is reached because Stripe redirected after Checkout. It
 *   does NOT look up ERM / Neon / webhook state, so it must not claim
 *   the balance is recorded, that setup already began, or that anything
 *   is live.
 * - Setup starts only after the payment lands (Stripe webhook confirms it).
 * - No intake reference, lane, amount, or client name is shown or invented.
 * - No Stripe live call, no charge, no send to any client.
 */
import type { Metadata } from "next";
import "./balance-paid.css";

export const metadata: Metadata = {
  title: "Program balance received | Micro Titan",
  description:
    "Stripe returned you here after the Micro Titan program balance checkout. Setup starts only after the payment is confirmed on our side; this page does not start setup or connect anything.",
  robots: { index: false, follow: false },
};

export default function BalancePaidPage() {
  return (
    <main className="balance-paid-page">
      <div className="balance-paid-inner">
        <p className="balance-paid-brand">Micro Titan</p>
        <h1>Program balance payment received</h1>
        <p>
          Stripe returned you here after Checkout for the Micro Titan program
          balance. Thank you — that payment is the trigger for setup on your
          side of the agreement.
        </p>

        <div className="balance-paid-note">
          <p style={{ margin: 0 }}>
            This page does not look up your intake, does not start setup, and
            does not connect any account. Setup begins only after the payment
            is confirmed on our side.
          </p>
        </div>

        <h2>What happens next</h2>
        <ul>
          <li>
            We confirm the payment on our side (Stripe webhook writes the
            program balance record).
          </li>
          <li>
            Once that confirmation lands, setup starts — not before.
          </li>
          <li>
            We contact you at the email or phone from your intake to begin.
            Nothing is installed or connected from this page.
          </li>
        </ul>

        <p>
          Questions? Email{" "}
          <a href="mailto:hello@micro-titan.com">hello@micro-titan.com</a>.
        </p>
        <p className="balance-paid-fine">
          If you closed Checkout without paying, nothing was charged and no
          setup was started. You can return to the agreement page from the
          link you were given.
        </p>
        <p>
          <a href="/">Back to Micro Titan</a>
        </p>
      </div>
    </main>
  );
}
