/**
 * ERM balance billing — Gap 5 plumbing (record shape only).
 *
 * This closes the ERM half of Gap 5: after the discovery credit, the
 * balance (program total minus discovery fee — Family $1,500 /
 * Solo $5,000 / Business $9,000) must be issued and tracked in the
 * ERM on the proven Stripe + ERM payment plumbing. It does NOT
 * decide WHEN the balance is due — that decision is the owner's and
 * has not been made yet — and it does NOT create a Stripe Checkout
 * Session, charge anything, or send anything. The billing step that
 * issues a balance (once the owner decides when) will call
 * issueBalance; a Stripe payment confirmation will call
 * recordBalancePaid. This slice is the record shape + owner check.
 *
 * Same gated pattern as app/lib/erm/payment-store.ts (PR #30, Gap 3)
 * and app/lib/erm/agreement-store.ts (PR #33):
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data. A missing database can never lose a balance
 *   record: the caller keeps the issue/payment and retries the write.
 * - The balance lives in the existing payments table, kind
 *   "balance" (already in the kind CHECK in schema.sql, alongside
 *   "discovery" and "monthly"). No new table, no new migration:
 *   the stripe_event_id / intake_reference / linked columns the
 *   store writes come from migration 001, already applied in Neon.
 * - The caller must supply an intake reference that already exists
 *   in intakes. This module never creates a client or an intake:
 *   a balance is recorded FOR an intake, not instead of one.
 *   An unknown reference returns "intake_not_found" and writes
 *   nothing.
 * - The amount is NEVER supplied by the caller. issueBalance takes
 *   a lane and uses BALANCE_CENTS[lane] — the approved after-credit
 *   totals, server-side (see the import note below).
 *   recordBalancePaid takes an amount and refuses it
 *   ("amount_mismatch", writes nothing) unless it equals that lane's
 *   after-credit total exactly.
 * - One balance row per intake, ever. issueBalance on an intake
 *   that already has a balance row returns "already_exists" — no
 *   second row, no overwrite. recordBalancePaid is idempotent by
 *   stripe_payment_id and stripe_event_id, like the discovery
 *   payment store: a duplicate webhook delivery returns
 *   "already_exists" with the stored payment id.
 * - A pending balance row moves to "paid" by one UPDATE that sets
 *   only status, paid_at, stripe_payment_id and stripe_event_id.
 *   The amount is never changed, a paid row is never re-opened,
 *   and no row is ever deleted. Each issue and each payment writes
 *   one AuditLog row. AuditLog rows are insert-only.
 * - This module deliberately does NOT change intakes.status. When
 *   the balance is due — after discovery, before setup, or at job
 *   booking — is the owner's undecided call, and a status transition
 *   for it belongs to the billing step, not to this record shape.
 * - No PII is logged. The owner status check returns lane, amount,
 *   status and paid date only — no name, no contact details, no
 *   Stripe ids. Errors return a status string only.
 */

import type { Lane } from "./types";

// NOTE on imports: this module uses a type-only import on purpose.
// The codebase's test convention (node --test, no bundler) cannot
// resolve a runtime import of "./types" — every other store imports
// types only as types for exactly this reason. The balance amounts
// therefore live here as constants mirroring
// BALANCE_CENTS[lane] in ./types (the same precedent
// as the discovery amounts in checkout.ts), and tests/balance.test.mjs
// pins them equal to LANE_PRICING so the two can never drift apart
// silently.

/** Program balance in cents, mirroring LANE_PRICING.afterCreditCents. */
export const BALANCE_CENTS: Record<Lane, number> = {
  Family: 150000,
  "Solo entrepreneur": 500000,
  Business: 900000,
};

export interface IssueBalanceInput {
  reference: string;
  lane: Lane;
}

export type IssueBalanceResult =
  | { status: "issued"; paymentId: string; amountCents: number }
  | { status: "already_exists"; paymentId: string; amountCents: number }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export interface RecordBalancePaidInput {
  reference: string;
  stripePaymentId: string;
  stripeEventId: string;
  amountCents: number;
}

export type RecordBalancePaidResult =
  | { status: "written"; paymentId: string }
  | { status: "already_exists"; paymentId: string }
  | { status: "intake_not_found" }
  | { status: "amount_mismatch" }
  | { status: "not_configured" }
  | { status: "failed" };

export type BalanceStatusResult =
  | {
      status: "found";
      lane: string;
      amountCents: number;
      paymentStatus: string;
      paidAt: string | null;
    }
  | { status: "not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

export async function issueBalance(
  input: IssueBalanceInput,
): Promise<IssueBalanceResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  const amountCents = BALANCE_CENTS[input.lane];
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const intake = await client.query(
          "SELECT id, client_id FROM intakes WHERE reference = $1",
          [input.reference],
        );
        if (intake.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const existing = await client.query(
          `SELECT id, amount_cents FROM payments
           WHERE intake_id = $1 AND kind = 'balance'
           ORDER BY created_at ASC LIMIT 1`,
          [intakeId],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            paymentId: String(existing.rows[0].id),
            amountCents: Number(existing.rows[0].amount_cents),
          };
        }
        const inserted = await client.query(
          `INSERT INTO payments
             (intake_id, client_id, kind, intake_reference, linked, amount_cents, status)
           VALUES ($1, $2, 'balance', $3, true, $4, 'pending')
           RETURNING id`,
          [intakeId, clientId, input.reference, amountCents],
        );
        const paymentId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('payment', $1, $2, 'system', 'balance_issued', NULL, 'pending', $3)`,
          [paymentId, clientId, input.reference],
        );
        await client.query("COMMIT");
        return { status: "issued", paymentId, amountCents };
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

export async function recordBalancePaid(
  input: RecordBalancePaidInput,
): Promise<RecordBalancePaidResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        // Idempotency first, exactly like the discovery payment store:
        // a duplicate webhook delivery returns the stored row.
        const byPayment = await client.query(
          "SELECT id FROM payments WHERE stripe_payment_id = $1",
          [input.stripePaymentId],
        );
        if (byPayment.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            paymentId: String(byPayment.rows[0].id),
          };
        }
        const byEvent = await client.query(
          "SELECT id FROM payments WHERE stripe_event_id = $1",
          [input.stripeEventId],
        );
        if (byEvent.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            paymentId: String(byEvent.rows[0].id),
          };
        }
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
        // Amount must equal the lane's after-credit total exactly.
        // A wrong amount writes nothing — it is never recorded as a
        // balance payment, and never attached to an invented total.
        if (input.amountCents !== BALANCE_CENTS[lane]) {
          await client.query("ROLLBACK");
          return { status: "amount_mismatch" };
        }
        const pending = await client.query(
          `SELECT id FROM payments
           WHERE intake_id = $1 AND kind = 'balance' AND status = 'pending'
           ORDER BY created_at ASC LIMIT 1`,
          [intakeId],
        );
        let paymentId: string;
        if (pending.rows.length > 0) {
          // One balance row per intake: the pending row moves to paid.
          // Only status, paid_at and the Stripe ids change — the
          // amount is never touched, and a paid row is never re-opened.
          paymentId = String(pending.rows[0].id);
          await client.query(
            `UPDATE payments
             SET status = 'paid', paid_at = now(),
                 stripe_payment_id = $1, stripe_event_id = $2
             WHERE id = $3`,
            [input.stripePaymentId, input.stripeEventId, paymentId],
          );
        } else {
          // No pending row (balance paid without a prior issue step):
          // insert the paid row directly, still one row per intake.
          const existing = await client.query(
            `SELECT id FROM payments WHERE intake_id = $1 AND kind = 'balance' ORDER BY created_at ASC LIMIT 1`,
            [intakeId],
          );
          if (existing.rows.length > 0) {
            await client.query("ROLLBACK");
            return {
              status: "already_exists",
              paymentId: String(existing.rows[0].id),
            };
          }
          const inserted = await client.query(
            `INSERT INTO payments
               (intake_id, client_id, kind, stripe_payment_id, stripe_event_id,
                intake_reference, linked, amount_cents, status, paid_at)
             VALUES ($1, $2, 'balance', $3, $4, $5, true, $6, 'paid', now())
             RETURNING id`,
            [
              intakeId,
              clientId,
              input.stripePaymentId,
              input.stripeEventId,
              input.reference,
              input.amountCents,
            ],
          );
          paymentId = String(inserted.rows[0].id);
        }
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('payment', $1, $2, 'system', 'balance_paid', 'pending', 'paid', $3)`,
          [paymentId, clientId, input.reference],
        );
        await client.query("COMMIT");
        return { status: "written", paymentId };
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

export async function balanceStatus(
  reference: string,
): Promise<BalanceStatusResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const rows = await client.query(
          `SELECT i.lane, p.amount_cents, p.status, p.paid_at
           FROM payments p
           JOIN intakes i ON i.id = p.intake_id
           WHERE i.reference = $1 AND p.kind = 'balance'
           ORDER BY p.created_at ASC LIMIT 1`,
          [reference],
        );
        if (rows.rows.length === 0) return { status: "not_found" };
        return {
          status: "found",
          lane: String(rows.rows[0].lane),
          amountCents: Number(rows.rows[0].amount_cents),
          paymentStatus: String(rows.rows[0].status),
          paidAt:
            rows.rows[0].paid_at === null
              ? null
              : String(rows.rows[0].paid_at),
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
