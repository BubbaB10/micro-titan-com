/**
 * Micro Titan own CRM/ERM — gated Postgres store, first slice.
 *
 * Gating (same pattern as PR #20 Resend and PR #24 Sheets):
 * - If ERM_DATABASE_URL is absent, every function returns a
 *   "not_configured" result and never throws, never connects, and
 *   never invents data. The caller (the intake route) must then fall
 *   back to the email-only path, so a missing database can never
 *   lose an intake.
 * - If the URL is present, the `pg` driver is imported dynamically
 *   and a single transaction records: Client + Intake + AuditLog.
 *   The UNIQUE constraint on intakes.reference makes a re-POST
 *   with the same reference return "already_exists" instead of a
 *   duplicate row, even under a server retry.
 * - No function in this module ever UPDATEs or DELETEs audit_log.
 * - No PII is logged. Errors return a status string only.
 *
 * Required setup (Bubba, by hand — see app/lib/erm/README.md):
 *   1. Provision a Postgres database (Vercel Postgres, Neon, or
 *      Supabase — all work with the standard pg driver; no provider
 *      is hard-coded here). Turn on automated backups in that
 *      provider and note the retention period.
 *   2. Apply app/lib/erm/schema.sql to it, once.
 *   3. In Vercel (micro-titan-com, production + preview), set
 *      ERM_DATABASE_URL to the provider's pooled connection string.
 *   4. Set OPS_DASHBOARD_TOKEN to a long random value, kept private.
 *      It gates the owner summary API only; it is never a client
 *      login and never appears in any page bundle.
 *   5. Redeploy, then test with a TEST intake only, then re-POST
 *      the same reference and verify no duplicate intake row.
 */

import type { IntakeRow, Lane } from "./types";

export type RecordIntakeResult =
  | { status: "written"; intakeId: string }
  | { status: "already_exists"; intakeId: string }
  | { status: "not_configured" }
  | { status: "failed" };

export interface IntakeInput {
  reference: string;
  lane: Lane;
  name: string;
  email: string;
  phone: string;
  agent: string;
  plate: string;
  answers: { question: string; answer: string }[];
}

export async function recordIntake(
  input: IntakeInput,
): Promise<RecordIntakeResult> {
  const url = process.env.ERM_DATABASE_URL;
  if (!url) return { status: "not_configured" };
  try {
    // Dynamic import: the pg package is a server-only dependency and
    // must never be bundled into a client component.
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const existing = await client.query(
          "SELECT id FROM intakes WHERE reference = $1",
          [input.reference],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            intakeId: String(existing.rows[0].id),
          };
        }
        const clientRes = await client.query(
          `INSERT INTO clients (name, contact_email, contact_phone, lane, agent_preference)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [input.name, input.email, input.phone, input.lane, input.agent],
        );
        const clientId = String(clientRes.rows[0].id);
        const intakeRes = await client.query(
          `INSERT INTO intakes (client_id, reference, lane, plate, answers, status, next_action, source)
           VALUES ($1, $2, $3, $4, $5::jsonb, 'received', 'Completeness check', 'micro-titan.com/intake')
           RETURNING id`,
          [
            clientId,
            input.reference,
            input.lane,
            input.plate,
            JSON.stringify(input.answers),
          ],
        );
        const intakeId = String(intakeRes.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('intake', $1, $2, 'system', 'intake_received', NULL, 'received', $3)`,
          [intakeId, clientId, input.reference],
        );
        await client.query("COMMIT");
        return { status: "written", intakeId };
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

export interface OwnerSummary {
  issues: { openIntakes: number; overdueDeadlines: number };
  approvals: { pendingPitchSheets: number; pendingAgreements: number };
  money: {
    discoveryPaidCents: number;
    discoveryPendingCents: number;
    monthlyActiveCents: number;
  };
}

/**
 * Owner summary for Bubba's three sections only: Issues, Approvals,
 * Money. Counts and money totals only — no names, no answers, no
 * contact details leave the database through this function.
 */
export async function ownerSummary(): Promise<
  { status: "ok"; summary: OwnerSummary } | { status: "not_configured" } | { status: "failed" }
> {
  const url = process.env.ERM_DATABASE_URL;
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const [issues, approvals, money] = await Promise.all([
        pool.query(
          `SELECT
             (SELECT COUNT(*) FROM intakes WHERE status IN ('received', 'completeness_check')) AS open_intakes,
             (SELECT COUNT(*) FROM compliance_deadlines WHERE status = 'overdue') AS overdue_deadlines`,
        ),
        pool.query(
          `SELECT
             (SELECT COUNT(*) FROM pitch_sheets WHERE status = 'draft') AS pending_pitch,
             (SELECT COUNT(*) FROM intakes WHERE status = 'pitch_sent') AS pending_agreements`,
        ),
        pool.query(
          `SELECT
             (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE kind = 'discovery' AND status = 'paid') AS discovery_paid,
             (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE kind = 'discovery' AND status = 'pending') AS discovery_pending,
             (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE kind = 'monthly' AND status = 'paid') AS monthly_active`,
        ),
      ]);
      return {
        status: "ok",
        summary: {
          issues: {
            openIntakes: Number(issues.rows[0].open_intakes),
            overdueDeadlines: Number(issues.rows[0].overdue_deadlines),
          },
          approvals: {
            pendingPitchSheets: Number(approvals.rows[0].pending_pitch),
            pendingAgreements: Number(approvals.rows[0].pending_agreements),
          },
          money: {
            discoveryPaidCents: Number(money.rows[0].discovery_paid),
            discoveryPendingCents: Number(money.rows[0].discovery_pending),
            monthlyActiveCents: Number(money.rows[0].monthly_active),
          },
        },
      };
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

// Re-export the pure helpers for the intake route's row building.
export type { IntakeRow };
