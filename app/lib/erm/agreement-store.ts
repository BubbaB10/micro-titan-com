/**
 * ERM agreement logging — gated, same pattern as
 * app/lib/erm/pitch-store.ts (PR #28) and
 * app/lib/erm/payment-store.ts (PR #30, Gap 3).
 *
 * This closes the second half of Gap 2 (agreement live + logged):
 * the acceptance page has been live since PR #22, but the route
 * sent an email only and wrote nothing to the ERM — "CRM Agreements
 * hand-logging stays manual" was the route's own comment. From this
 * slice, a site acceptance also writes one Agreements row plus one
 * AuditLog row, in one transaction, against the intake it belongs to.
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data. The route then returns the acceptance with
 *   erm: "not_configured" and the email remains the record, exactly
 *   as before — a missing database can never lose an acceptance.
 * - The caller must supply an intake reference that already exists
 *   in intakes. This module never creates a client or an intake:
 *   an agreement is recorded FOR an intake, not instead of one.
 *   An unknown reference returns "intake_not_found" and writes
 *   nothing. (The route sends the email first, as it always has,
 *   so an acceptance for an unknown reference is still captured
 *   by that email — the ERM simply refuses to attach it to an
 *   intake that does not exist.)
 * - Idempotency is enforced in code (agreements has no UNIQUE
 *   constraint on intake_id in schema.sql): a row already present
 *   for the intake is returned as "already_exists" with its stored
 *   id and accepted date — no duplicate row, no overwrite, no
 *   second audit row. Agreements are insert-only here: this module
 *   never UPDATEs or DELETEs an agreement, and never UPDATEs or
 *   DELETEs an audit_log row.
 * - Intake status advances to "agreed" ONLY when the status
 *   machine in types.ts allows it from the intake's current
 *   status (pitch_sent -> agreed). An intake that is still at
 *   "received" keeps its status — the agreement row is the
 *   record, not a status rewrite, and no transition is invented.
 * - Lane totals arrive in the input, in cents, computed by the
 *   route from its approved pricing — never from client-supplied
 *   totals. Acceptance is recorded, NOT claimed as a legal
 *   e-signature: nothing here changes that disclaimer.
 * - No PII is logged. The owner status check returns lane and
 *   accepted date only — no name, no signature text, no contact
 *   details. Errors return a status string only.
 */

import type { Lane } from "./types";

// NOTE on imports: this module uses a type-only import on purpose.
// The codebase's test convention (node --test, no bundler) cannot
// resolve a runtime import of "./types" — every other store imports
// types only as types for exactly this reason. Lane totals therefore
// arrive as cents in the input, computed by the route from its own
// approved LANE_TOTALS (dollars x 100), the same pricing the email
// already carries. The store never accepts totals from the client.

export interface AgreementInput {
  reference: string;
  lane: Lane;
  /** Typed acceptance text from the form; may be empty. Stored as-is. */
  signatureText: string;
  method: "site";
  /** Lane totals in cents, from the route's approved pricing. */
  discoveryCents: number;
  totalCents: number;
  afterCreditCents: number;
  monthlyCents: number;
}

export type RecordAgreementResult =
  | { status: "written"; agreementId: string; acceptedAt: string }
  | { status: "already_exists"; agreementId: string; acceptedAt: string }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

export async function recordAgreement(
  input: AgreementInput,
): Promise<RecordAgreementResult> {
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
          "SELECT id, client_id, status FROM intakes WHERE reference = $1",
          [input.reference],
        );
        if (intake.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const currentStatus = String(intake.rows[0].status);
        const existing = await client.query(
          "SELECT id, accepted_at FROM agreements WHERE intake_id = $1 ORDER BY accepted_at ASC LIMIT 1",
          [intakeId],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            agreementId: String(existing.rows[0].id),
            acceptedAt: String(existing.rows[0].accepted_at),
          };
        }
        const inserted = await client.query(
          `INSERT INTO agreements
             (intake_id, client_id, lane, discovery_cents, total_cents,
              after_credit_cents, monthly_cents, method, signature_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'site', $8)
           RETURNING id, accepted_at`,
          [
            intakeId,
            clientId,
            input.lane,
            input.discoveryCents,
            input.totalCents,
            input.afterCreditCents,
            input.monthlyCents,
            input.signatureText,
          ],
        );
        const agreementId = String(inserted.rows[0].id);
        const acceptedAt = String(inserted.rows[0].accepted_at);
        // Status advance, only where the intake status machine in
        // types.ts (INTAKE_TRANSITIONS) allows it: "agreed" is
        // reachable only from "pitch_sent". An intake still at
        // "received" keeps its status — the agreement row is the
        // record, not a status rewrite.
        const advances = currentStatus === "pitch_sent";
        if (advances) {
          await client.query(
            "UPDATE intakes SET status = 'agreed' WHERE id = $1",
            [intakeId],
          );
        }
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('agreement', $1, $2, 'system', 'agreement_accepted', $3, $4, $5)`,
          [
            agreementId,
            clientId,
            currentStatus,
            advances ? "agreed" : null,
            input.reference,
          ],
        );
        await client.query("COMMIT");
        return { status: "written", agreementId, acceptedAt };
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

export type AgreementStatusResult =
  | {
      status: "found";
      lane: string;
      acceptedAt: string;
      method: string;
    }
  | { status: "not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export async function agreementStatus(
  reference: string,
): Promise<AgreementStatusResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const rows = await client.query(
          `SELECT a.lane, a.accepted_at, a.method
           FROM agreements a
           JOIN intakes i ON i.id = a.intake_id
           WHERE i.reference = $1
           ORDER BY a.accepted_at ASC LIMIT 1`,
          [reference],
        );
        if (rows.rows.length === 0) return { status: "not_found" };
        return {
          status: "found",
          lane: String(rows.rows[0].lane),
          acceptedAt: String(rows.rows[0].accepted_at),
          method: String(rows.rows[0].method),
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
