/**
 * Gap 3 follow-up — intake lane lookup for per-client Checkout Sessions.
 * Gated, same pattern as app/lib/erm/payment-store.ts and
 * app/lib/erm/pitch-store.ts: if ERM_DATABASE_URL (or the Neon
 * integration's ERM_DATABASE_DATABASE_URL fallback) is absent, returns
 * "not_configured" and never throws, never connects, never invents
 * data. Read-only: one SELECT, no writes, no intake creation.
 */

import type { CheckoutLane } from "./checkout";

export type IntakeLaneResult =
  | { status: "ok"; lane: CheckoutLane }
  | { status: "not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

/** Look up the lane recorded on an existing intake, by reference. */
export async function intakeLane(reference: string): Promise<IntakeLaneResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const found = await pool.query(
        "SELECT lane FROM intakes WHERE reference = $1",
        [reference],
      );
      if (found.rows.length === 0) return { status: "not_found" };
      const lane = String(found.rows[0].lane);
      if (lane !== "Family" && lane !== "Solo entrepreneur" && lane !== "Business") {
        return { status: "failed" };
      }
      return { status: "ok", lane: lane as CheckoutLane };
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}
