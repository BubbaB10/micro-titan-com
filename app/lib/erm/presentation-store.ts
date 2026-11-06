/**
 * Micro Titan presentation persistence — gated, same pattern as
 * app/lib/erm/pitch-store.ts (PR #28) and
 * app/lib/erm/discovery-call-store.ts (PR #34).
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data. A missing database can never lose a
 *   presentation draft: the caller keeps the generated content and
 *   retries the write.
 * - The caller must supply an intake reference that already exists
 *   in intakes. This module never creates a client or an intake:
 *   a presentation is generated FOR an intake, not instead of one.
 *   An unknown reference returns "intake_not_found" and writes
 *   nothing.
 * - Idempotency is enforced in code (presentations has no UNIQUE
 *   constraint on intake_id in schema.sql): a row already present
 *   for the intake is returned as "already_exists" with its stored
 *   content — no duplicate row, no overwrite. Presentations are
 *   insert-only here: this module never UPDATEs or DELETEs a
 *   presentation, and never UPDATEs or DELETEs an audit_log row.
 *   A corrected presentation is a new generation only after the
 *   owner declines the draft — handled by a later, separately
 *   approved step, not by editing the stored row here.
 * - New rows are always status "draft". Nothing in this module can
 *   mark a presentation "reviewed", "shown", or "declined",
 *   publish it, or send it: those are separate, owner-approved
 *   steps, not generation. The presentation_ref on a
 *   discovery_calls row is NOT updated here: discovery records
 *   are insert-only, and the presentation carries the discovery
 *   session key itself (discovery_session_key) so the two records
 *   are linked without editing the discovery row.
 * - This module never advances an intake's status. Setup moves
 *   only on the owner's approval after review, never by
 *   generation alone.
 * - No PII is logged. Errors return a status string only.
 */

import type { GeneratedPresentation } from "./presentation.ts";

export type RecordPresentationResult =
  | { status: "written"; presentationId: string; content: GeneratedPresentation }
  | { status: "already_exists"; presentationId: string; content: GeneratedPresentation }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export type PresentationStatusResult =
  | {
      status: "found";
      presentationId: string;
      presentationStatus: string;
      channel: string;
      formatChoice: string;
      content: GeneratedPresentation;
    }
  | { status: "not_found" }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

export async function recordPresentation(
  reference: string,
  discoverySessionKey: string,
  presentation: GeneratedPresentation,
): Promise<RecordPresentationResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  // A presentation is always a draft at generation time. A caller
  // that tries to smuggle in another status gets a draft anyway.
  const draft: GeneratedPresentation = {
    ...presentation,
    status: "draft",
    published: false,
    sent: false,
  };
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
        const existing = await client.query(
          "SELECT id, content FROM presentations WHERE intake_id = $1 ORDER BY created_at ASC LIMIT 1",
          [intakeId],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            presentationId: String(existing.rows[0].id),
            content: existing.rows[0].content as GeneratedPresentation,
          };
        }
        const inserted = await client.query(
          `INSERT INTO presentations
             (intake_id, client_id, reference, discovery_session_key, channel, format_choice, status, content)
           VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7::jsonb) RETURNING id`,
          [
            intakeId,
            clientId,
            reference,
            discoverySessionKey,
            draft.discoveryChannel,
            draft.formatChoice,
            JSON.stringify(draft),
          ],
        );
        const presentationId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('presentation', $1, $2, 'system', 'presentation_draft', NULL, 'draft', $3)`,
          [presentationId, clientId, reference],
        );
        await client.query("COMMIT");
        return { status: "written", presentationId, content: draft };
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

export async function presentationStatus(
  reference: string,
): Promise<PresentationStatusResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const intake = await client.query(
          "SELECT id FROM intakes WHERE reference = $1",
          [reference],
        );
        if (intake.rows.length === 0) {
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const row = await client.query(
          `SELECT id, status, channel, format_choice, content
             FROM presentations WHERE intake_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [intakeId],
        );
        if (row.rows.length === 0) {
          return { status: "not_found" };
        }
        return {
          status: "found",
          presentationId: String(row.rows[0].id),
          presentationStatus: String(row.rows[0].status),
          channel: String(row.rows[0].channel),
          formatChoice: String(row.rows[0].format_choice),
          content: row.rows[0].content as GeneratedPresentation,
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
