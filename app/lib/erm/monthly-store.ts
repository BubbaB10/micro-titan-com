/**
 * ERM monthly billing tracking — Gap 9 (record shape + owner checks).
 *
 * This closes the ERM half of Gap 9: operate-plan months
 * (Family $95 / Solo $350 / Business $950, optional) must be
 * tracked — who is on a plan, what month, whether it paid. It does
 * NOT charge anyone, create a Stripe Checkout Session, create a
 * Stripe subscription, or send anything. A Stripe monthly payment
 * confirmation calls recordMonthlyPaid; the owner enrolls a client
 * on the plan by hand through POST /api/ops/monthly-enroll.
 * A per-client monthly Checkout Session (mirroring the Gap 5
 * balance-checkout slice) is a later slice, not this one: the
 * shared monthly payment links carry no intake_type and no
 * intake_reference, so a shared-link monthly payment cannot be
 * linked to a client yet — same limitation discovery had before
 * per-client sessions. This slice records what Stripe reports
 * when the event does carry intake_type="monthly" + a reference.
 *
 * Same gated pattern as app/lib/erm/balance-store.ts (PR #35) and
 * app/lib/erm/payment-store.ts (PR #30, Gap 3):
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data. A missing database can never lose a
 *   monthly record: the caller keeps the event and retries.
 * - Monthly payments live in the existing payments table, kind
 *   "monthly" (already in the kind CHECK in schema.sql, alongside
 *   "discovery" and "balance"). The month is carried by a new
 *   period_month column (YYYY-MM, America/Chicago) — see migration
 *   007-monthly-billing.sql, NOT applied to Neon yet. The
 *   subscription itself lives in a new monthly_subscriptions
 *   table (same migration).
 * - The monthly plan is OPTIONAL. Enrollment is an explicit owner
 *   action (enrollMonthly), never automatic: a payment never
 *   enrolls a client, and nothing in this module enrolls anyone
 *   on its own. One active subscription per intake, ever at a
 *   time; cancelling then re-enrolling starts a new row.
 * - The amount is NEVER supplied by the caller. enrollMonthly
 *   takes a lane from the intake and uses MONTHLY_CENTS[lane] —
 *   the approved monthly totals, server-side.
 *   recordMonthlyPaid takes an amount and refuses it
 *   ("amount_mismatch", writes nothing) unless it equals that
 *   lane's monthly price exactly.
 * - One paid row per intake per month, ever. recordMonthlyPaid
 *   on an intake+month that already has a paid row returns
 *   "already_exists" — no second row, no overwrite. It is also
 *   idempotent by stripe_payment_id and stripe_event_id, like
 *   the discovery payment store: a duplicate webhook delivery
 *   returns "already_exists" with the stored payment id.
 * - Unknown reference: the payment is recorded as UNLINKED (a
 *   Payment row with intake_id/client_id NULL, intake_reference
 *   set, linked false) — it is never dropped silently and never
 *   attached to an invented intake. That needs migration 001
 *   applied (already applied in Neon) for the nullable columns,
 *   plus migration 007 for period_month.
 * - Records are insert-only, with one exception: cancelling a
 *   subscription UPDATEs that subscription row's status to
 *   "cancelled" (a subscription is live state, not an audit row;
 *   the cancel itself also leaves an AuditLog row). No payment
 *   row is ever UPDATE'd or DELETE'd, and no audit_log row is
 *   ever changed. Each enroll, cancel, and payment writes one
 *   AuditLog row. AuditLog rows are insert-only.
 * - This module deliberately does NOT change intakes.status.
 *   A client on the operate plan is in status "operate" by the
 *   time monthly billing matters, but this slice does not move
 *   anyone there — status transitions belong to the setup /
 *   handoff steps, not to billing tracking.
 * - No PII is logged. The owner status check returns lane,
 *   amount, plan status, and paid months only — no name, no
 *   contact details, no Stripe ids. Errors return a status
 *   string only.
 */

import type { Lane } from "./types";

// NOTE on imports: this module uses a type-only import on purpose.
// The codebase's test convention (node --test, no bundler) cannot
// resolve a runtime import of "./types" — every other store imports
// types only as types for exactly this reason. The monthly amounts
// therefore live here as constants mirroring
// LANE_PRICING[lane].monthlyCents in ./types (the same precedent
// as the balance amounts in balance-store.ts), and
// tests/monthly.test.mjs pins them equal to LANE_PRICING so the
// two can never drift apart silently.

/** Monthly operate-plan price in cents, mirroring LANE_PRICING.monthlyCents. */
export const MONTHLY_CENTS: Record<Lane, number> = {
  Family: 9500,
  "Solo entrepreneur": 35000,
  Business: 95000,
};

export type MonthlySubscriptionStatus = "active" | "cancelled" | "none";

/** A month as YYYY-MM, in America/Chicago. */
export function isValidPeriodMonth(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
  );
}

/**
 * The YYYY-MM month of a date in America/Chicago. The monthly
 * plan is billed by calendar month, and the month a payment
 * belongs to is the month Stripe reports it in the client's
 * timezone, not UTC — a payment at 23:30 Chicago time on the
 * last day of the month is that month, not the next one.
 * `now` is injectable for tests only.
 */
export function chicagoMonth(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
  }).format(now);
  return parts.slice(0, 7);
}

/** The YYYY-MM month of a Stripe event's created time (Unix seconds). */
export function periodMonthFromUnixSeconds(createdSeconds: number): string {
  return chicagoMonth(new Date(createdSeconds * 1000));
}

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

export interface EnrollMonthlyInput {
  reference: string;
}

export type EnrollMonthlyResult =
  | {
      status: "enrolled";
      subscriptionId: string;
      lane: Lane;
      amountCents: number;
      startedMonth: string;
    }
  | {
      status: "already_exists";
      subscriptionId: string;
      lane: Lane;
      amountCents: number;
      startedMonth: string;
    }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export type CancelMonthlyResult =
  | { status: "cancelled"; subscriptionId: string }
  | { status: "not_enrolled" }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export interface RecordMonthlyPaidInput {
  reference: string;
  stripePaymentId: string;
  stripeEventId: string;
  amountCents: number;
  periodMonth: string;
}

export type RecordMonthlyPaidResult =
  | { status: "written"; paymentId: string; linked: true }
  | { status: "already_exists"; paymentId: string; linked: boolean }
  | { status: "unlinked"; paymentId: string }
  | { status: "unlinked_not_stored" }
  | { status: "intake_not_found" }
  | { status: "amount_mismatch" }
  | { status: "invalid_period" }
  | { status: "not_configured" }
  | { status: "failed" };

export type MonthlyStatusResult =
  | {
      status: "found";
      lane: string;
      amountCents: number;
      subscription: MonthlySubscriptionStatus;
      startedMonth: string | null;
      paidMonths: string[];
      lastPaidMonth: string | null;
      currentMonthPaid: boolean;
    }
  | { status: "not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export interface MonthlyDueRow {
  reference: string;
  lane: string;
  amountCents: number;
  month: string;
  lastPaidMonth: string | null;
}

export type MonthlyDueResult =
  | { status: "found"; due: MonthlyDueRow[] }
  | { status: "not_configured" }
  | { status: "failed" };

export async function enrollMonthly(
  input: EnrollMonthlyInput,
): Promise<EnrollMonthlyResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  const startedMonth = chicagoMonth();
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const intake = await client.query(
          "SELECT id, client_id, lane FROM intakes WHERE reference = $1",
          [input.reference],
        );
        if (intake.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const lane = String(intake.rows[0].lane) as Lane;
        const amountCents = MONTHLY_CENTS[lane];
        const existing = await client.query(
          `SELECT id, amount_cents, started_month FROM monthly_subscriptions
           WHERE intake_id = $1 AND status = 'active'
           ORDER BY created_at ASC LIMIT 1`,
          [intakeId],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            subscriptionId: String(existing.rows[0].id),
            lane,
            amountCents: Number(existing.rows[0].amount_cents),
            startedMonth: String(existing.rows[0].started_month),
          };
        }
        const inserted = await client.query(
          `INSERT INTO monthly_subscriptions
             (intake_id, client_id, reference, lane, amount_cents, status, started_month)
           VALUES ($1, $2, $3, $4, $5, 'active', $6)
           RETURNING id`,
          [intakeId, clientId, input.reference, lane, amountCents, startedMonth],
        );
        const subscriptionId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('monthly_subscription', $1, $2, 'owner', 'monthly_enrolled', NULL, 'active', $3)`,
          [subscriptionId, clientId, input.reference],
        );
        await client.query("COMMIT");
        return { status: "enrolled", subscriptionId, lane, amountCents, startedMonth };
      } catch {
        await client.query("ROLLBACK").catch(() => undefined);
        return { status: "failed" };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

export async function cancelMonthly(
  reference: string,
): Promise<CancelMonthlyResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const intake = await client.query(
          "SELECT id, client_id FROM intakes WHERE reference = $1",
          [reference],
        );
        if (intake.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const active = await client.query(
          `SELECT id FROM monthly_subscriptions
           WHERE intake_id = $1 AND status = 'active'
           ORDER BY created_at ASC LIMIT 1`,
          [intakeId],
        );
        if (active.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "not_enrolled" };
        }
        const subscriptionId = String(active.rows[0].id);
        await client.query(
          `UPDATE monthly_subscriptions
           SET status = 'cancelled', cancelled_at = now()
           WHERE id = $1`,
          [subscriptionId],
        );
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('monthly_subscription', $1, $2, 'owner', 'monthly_cancelled', 'active', 'cancelled', $3)`,
          [subscriptionId, clientId, reference],
        );
        await client.query("COMMIT");
        return { status: "cancelled", subscriptionId };
      } catch {
        await client.query("ROLLBACK").catch(() => undefined);
        return { status: "failed" };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

export async function recordMonthlyPaid(
  input: RecordMonthlyPaidInput,
): Promise<RecordMonthlyPaidResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  if (!isValidPeriodMonth(input.periodMonth)) {
    return { status: "invalid_period" };
  }
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        // Idempotency first, exactly like the discovery payment
        // store: a duplicate webhook delivery returns the stored row.
        const byPayment = await client.query(
          "SELECT id, intake_id FROM payments WHERE stripe_payment_id = $1",
          [input.stripePaymentId],
        );
        if (byPayment.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            paymentId: String(byPayment.rows[0].id),
            linked: byPayment.rows[0].intake_id !== null,
          };
        }
        const byEvent = await client.query(
          "SELECT id, intake_id FROM payments WHERE stripe_event_id = $1",
          [input.stripeEventId],
        );
        if (byEvent.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            paymentId: String(byEvent.rows[0].id),
            linked: byEvent.rows[0].intake_id !== null,
          };
        }
        const intake =
          input.reference.length === 0
            ? { rows: [] }
            : await client.query(
                "SELECT id, client_id, lane FROM intakes WHERE reference = $1",
                [input.reference],
              );
        if (intake.rows.length === 0) {
          // Unknown reference: record UNLINKED, never dropped.
          // Needs migration 001 (nullable intake/client columns,
          // already applied in Neon) plus migration 007
          // (period_month). If the insert fails, the event must be
          // checked in the Stripe dashboard.
          const inserted = await client
            .query(
              `INSERT INTO payments (intake_id, client_id, kind, stripe_payment_id, stripe_event_id, intake_reference, linked, period_month, amount_cents, status, paid_at)
               VALUES (NULL, NULL, 'monthly', $1, $2, $3, false, $4, $5, 'paid', now()) RETURNING id`,
              [
                input.stripePaymentId,
                input.stripeEventId,
                input.reference.length > 0 ? input.reference : null,
                input.periodMonth,
                input.amountCents,
              ],
            )
            .catch(() => null);
          if (inserted === null) {
            await client.query("ROLLBACK");
            return { status: "unlinked_not_stored" };
          }
          await client.query("COMMIT");
          return { status: "unlinked", paymentId: String(inserted.rows[0].id) };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const lane = String(intake.rows[0].lane) as Lane;
        // Amount must equal the lane's monthly price exactly.
        // A wrong amount writes nothing — it is never recorded
        // as a monthly payment, and never attached to an
        // invented total.
        if (input.amountCents !== MONTHLY_CENTS[lane]) {
          await client.query("ROLLBACK");
          return { status: "amount_mismatch" };
        }
        // One paid row per intake per month, ever.
        const sameMonth = await client.query(
          `SELECT id FROM payments
           WHERE intake_id = $1 AND kind = 'monthly' AND period_month = $2 AND status = 'paid'
           ORDER BY created_at ASC LIMIT 1`,
          [intakeId, input.periodMonth],
        );
        if (sameMonth.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            paymentId: String(sameMonth.rows[0].id),
            linked: true,
          };
        }
        const inserted = await client.query(
          `INSERT INTO payments
             (intake_id, client_id, kind, stripe_payment_id, stripe_event_id,
              intake_reference, linked, period_month, amount_cents, status, paid_at)
           VALUES ($1, $2, 'monthly', $3, $4, $5, true, $6, $7, 'paid', now())
           RETURNING id`,
          [
            intakeId,
            clientId,
            input.stripePaymentId,
            input.stripeEventId,
            input.reference,
            input.periodMonth,
            input.amountCents,
          ],
        );
        const paymentId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('payment', $1, $2, 'system', 'monthly_paid', 'pending', 'paid', $3)`,
          [paymentId, clientId, input.reference],
        );
        await client.query("COMMIT");
        return { status: "written", paymentId, linked: true };
      } catch {
        await client.query("ROLLBACK").catch(() => undefined);
        return { status: "failed" };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

export async function monthlyStatus(
  reference: string,
  now: Date = new Date(),
): Promise<MonthlyStatusResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const intake = await client.query(
          "SELECT id, lane FROM intakes WHERE reference = $1",
          [reference],
        );
        if (intake.rows.length === 0) return { status: "not_found" };
        const intakeId = String(intake.rows[0].id);
        const lane = String(intake.rows[0].lane);
        const sub = await client.query(
          `SELECT status, started_month FROM monthly_subscriptions
           WHERE intake_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [intakeId],
        );
        const paid = await client.query(
          `SELECT period_month FROM payments
           WHERE intake_id = $1 AND kind = 'monthly' AND status = 'paid' AND period_month IS NOT NULL
           ORDER BY period_month ASC`,
          [intakeId],
        );
        const paidMonths = paid.rows.map((r: { period_month: string }) =>
          String(r.period_month),
        );
        if (sub.rows.length === 0 && paidMonths.length === 0) {
          return { status: "not_found" };
        }
        const currentMonth = chicagoMonth(now);
        return {
          status: "found",
          lane,
          amountCents: MONTHLY_CENTS[lane as Lane],
          subscription:
            sub.rows.length === 0
              ? "none"
              : (String(sub.rows[0].status) as MonthlySubscriptionStatus),
          startedMonth:
            sub.rows.length === 0 ? null : String(sub.rows[0].started_month),
          paidMonths,
          lastPaidMonth:
            paidMonths.length === 0 ? null : paidMonths[paidMonths.length - 1],
          currentMonthPaid: paidMonths.includes(currentMonth),
        };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

export async function monthlyDue(
  now: Date = new Date(),
): Promise<MonthlyDueResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const month = chicagoMonth(now);
        const rows = await client.query(
          `SELECT s.reference, s.lane, s.amount_cents,
                  (SELECT MAX(period_month) FROM payments p
                   WHERE p.intake_id = s.intake_id AND p.kind = 'monthly' AND p.status = 'paid') AS last_paid
           FROM monthly_subscriptions s
           WHERE s.status = 'active'
             AND NOT EXISTS (
               SELECT 1 FROM payments p
               WHERE p.intake_id = s.intake_id AND p.kind = 'monthly'
                 AND p.status = 'paid' AND p.period_month = $1
             )
           ORDER BY s.reference ASC`,
          [month],
        );
        return {
          status: "found",
          due: rows.rows.map(
            (r: {
              reference: string;
              lane: string;
              amount_cents: number;
              last_paid: string | null;
            }) => ({
              reference: String(r.reference),
              lane: String(r.lane),
              amountCents: Number(r.amount_cents),
              month,
              lastPaidMonth: r.last_paid === null ? null : String(r.last_paid),
            }),
          ),
        };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}
