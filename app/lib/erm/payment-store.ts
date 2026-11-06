/**
 * Gap 3 — Stripe discovery payment persistence, gated, same pattern as
 * app/lib/erm/pitch-store.ts (PR #28) and app/lib/erm/store.ts (PR #26).
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data.
 * - A discovery payment is recorded as ONE Payment row (kind
 *   "discovery", status "paid") plus ONE AuditLog row, in one
 *   transaction — only when the intake reference exists. This module
 *   never creates a client or an intake, and never UPDATEs or DELETEs
 *   a payment or an audit_log row.
 * - Idempotency: payments.stripe_payment_id is UNIQUE in schema.sql,
 *   and the code also checks stripe_event_id first. A duplicate
 *   webhook delivery returns "already_exists" with the stored payment
 *   id — no duplicate row, no overwrite, no second audit row.
 * - Unknown reference: the payment is recorded as UNLINKED (a Payment
 *   row with intake_id/client_id NULL, intake_reference set, linked
 *   false) — it is never dropped silently and never attached to an
 *   invented intake. Unlinked rows need migration
 *   app/lib/erm/migrations/001-gap3-unlinked-payments.sql applied to
 *   the database first; until then the webhook reports
 *   "unlinked_not_stored" and the event must be checked in the Stripe
 *   dashboard. No AuditLog row is written for an unlinked payment:
 *   audit_log.client_id is NOT NULL with a clients FK, so there is
 *   no client to attach it to — the unlinked Payment row itself is
 *   the record.
 * - This module deliberately does NOT change intakes.status. Moving
 *   an intake to "discovery_paid" is a status transition owned by a
 *   later step (and by the intake status machine in types.ts); the
 *   payment row + the owner payment-status endpoint are the proof
 *   in this slice, not a status rewrite.
 * - No PII is logged. Errors return a status string only.
 */

import type { ParsedDiscoveryPayment } from "./stripe";

export type RecordDiscoveryPaymentResult =
  | { status: "written"; paymentId: string; linked: true }
  | { status: "already_exists"; paymentId: string; linked: boolean }
  | { status: "unlinked"; paymentId: string }
  | { status: "unlinked_not_stored" }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

export async function recordDiscoveryPayment(
  payment: ParsedDiscoveryPayment,
): Promise<RecordDiscoveryPaymentResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const byPayment = await client.query(
          "SELECT id, intake_id FROM payments WHERE stripe_payment_id = $1",
          [payment.stripePaymentId],
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
          [payment.eventId],
        );
        if (byEvent.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            paymentId: String(byEvent.rows[0].id),
            linked: byEvent.rows[0].intake_id !== null,
          };
        }
        if (payment.reference === null) {
          // No reference at all: still record it unlinked, so the
          // money is never silently dropped.
          const inserted = await client
            .query(
              `INSERT INTO payments (intake_id, client_id, kind, stripe_payment_id, stripe_event_id, intake_reference, linked, amount_cents, status, paid_at)
               VALUES (NULL, NULL, 'discovery', $1, $2, NULL, false, $3, 'paid', now()) RETURNING id`,
              [payment.stripePaymentId, payment.eventId, payment.amountCents],
            )
            .catch(() => null);
          if (inserted === null) {
            await client.query("ROLLBACK");
            return { status: "unlinked_not_stored" };
          }
          await client.query("COMMIT");
          return { status: "unlinked", paymentId: String(inserted.rows[0].id) };
        }
        const intake = await client.query(
          "SELECT id, client_id, lane FROM intakes WHERE reference = $1",
          [payment.reference],
        );
        if (intake.rows.length === 0) {
          const inserted = await client
            .query(
              `INSERT INTO payments (intake_id, client_id, kind, stripe_payment_id, stripe_event_id, intake_reference, linked, amount_cents, status, paid_at)
               VALUES (NULL, NULL, 'discovery', $1, $2, $3, false, $4, 'paid', now()) RETURNING id`,
              [payment.stripePaymentId, payment.eventId, payment.reference, payment.amountCents],
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
        const inserted = await client.query(
          `INSERT INTO payments (intake_id, client_id, kind, stripe_payment_id, stripe_event_id, intake_reference, linked, amount_cents, status, paid_at)
           VALUES ($1, $2, 'discovery', $3, $4, $5, true, $6, 'paid', now()) RETURNING id`,
          [
            intakeId,
            clientId,
            payment.stripePaymentId,
            payment.eventId,
            payment.reference,
            payment.amountCents,
          ],
        );
        const paymentId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('payment', $1, $2, 'stripe_webhook', 'discovery_paid', NULL, 'paid', $3)`,
          [paymentId, clientId, payment.reference],
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

export type PaymentStatusResult =
  | {
      status: "ok";
      paid: boolean;
      stripePaymentId: string | null;
      amountCents: number | null;
      lane: string | null;
      unlinkedPayment: boolean;
    }
  | { status: "not_configured" }
  | { status: "failed" };

/**
 * Owner check for ONE intake reference only: is discovery paid, and
 * which Stripe payment id proves it? Returns no names, no answers, no
 * contact details — only payment status for that reference.
 */
export async function paymentStatus(reference: string): Promise<PaymentStatusResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const linked = await pool.query(
        `SELECT p.stripe_payment_id, p.amount_cents, i.lane
         FROM payments p JOIN intakes i ON i.id = p.intake_id
         WHERE i.reference = $1 AND p.kind = 'discovery' AND p.status = 'paid'
         ORDER BY p.paid_at ASC LIMIT 1`,
        [reference],
      );
      if (linked.rows.length > 0) {
        return {
          status: "ok",
          paid: true,
          stripePaymentId: String(linked.rows[0].stripe_payment_id),
          amountCents: Number(linked.rows[0].amount_cents),
          lane: String(linked.rows[0].lane),
          unlinkedPayment: false,
        };
      }
      const unlinked = await pool.query(
        `SELECT id FROM payments WHERE intake_reference = $1 AND linked = false AND kind = 'discovery' AND status = 'paid' LIMIT 1`,
        [reference],
      );
      return {
        status: "ok",
        paid: false,
        stripePaymentId: null,
        amountCents: null,
        lane: null,
        unlinkedPayment: unlinked.rows.length > 0,
      };
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}
