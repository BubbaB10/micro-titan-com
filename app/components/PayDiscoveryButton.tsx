"use client";

/**
 * PayDiscoveryButton — the single pay button on /pay.
 *
 * Clicking it POSTs { reference } ONLY to /api/stripe/checkout — no
 * lane, no amount, nothing the client could edit. The server validates
 * the reference against the intake, uses the intake's recorded lane
 * as the source of truth, and returns a Stripe Checkout URL; the
 * client is redirected there and pays on Stripe's hosted page.
 * No card details are collected on Micro Titan, ever.
 *
 * The button is rendered ONLY for a verified unpaid intake (see
 * app/pay/page.tsx). It is never rendered for a paid, unknown, or
 * unverifiable reference.
 */

import { useState } from "react";

export default function PayDiscoveryButton({
  reference,
  amountLabel,
}: {
  reference: string;
  amountLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        url?: string;
        error?: string;
      } | null;
      if (res.ok && data?.ok && typeof data.url === "string" && data.url.length > 0) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 404) {
        setError("That intake reference was not found. Check the reference from your intake and try again.");
      } else if (res.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (res.status === 503) {
        setError("Payment is not available right now. Please try again later.");
      } else {
        setError("Something went wrong starting payment. Please try again.");
      }
    } catch {
      setError("Something went wrong starting payment. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <button type="button" className="pay-button" onClick={pay} disabled={busy}>
        {busy ? "Starting payment…" : `Pay discovery fee — ${amountLabel}`}
      </button>
      {error ? (
        <p className="pay-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
