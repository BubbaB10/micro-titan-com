/**
 * Micro Titan pitch-sheet persistence — gated, same pattern as
 * app/lib/erm/store.ts (PR #26).
 *
 * - If ERM_DATABASE_URL is absent, every function returns
 *   "not_configured" and never throws, never connects, and never
 *   invents data. The generate route then returns the draft sheet
 *   without a database row, so a missing database can never lose
 *   a generation or break the intake route.
 * - If the URL is present, the caller must supply an intake reference
 *   that already exists in intakes. This module never creates a
 *   client or an intake: a pitch sheet is generated FOR an intake,
 *   not instead of one. An unknown reference returns
 *   "intake_not_found" and writes nothing.
 * - Idempotency is enforced in code (pitch_sheets has no UNIQUE
 *   constraint on intake_id in schema.sql): a row already present
 *   for the intake is returned as "already_exists" with its stored
 *   content — no duplicate row, no overwrite. Sheets are insert-only
 *   here: this module never UPDATEs or DELETEs a pitch sheet, and
 *   never UPDATEs or DELETEs an audit_log row.
 * - New rows are always status "draft". Nothing in this module can
 *   mark a sheet "sent" or "agreed", publish it, or send it: those
 *   are separate, owner-approved steps, not generation.
 * - No PII is logged. Errors return a status string only.
 */

import type { GeneratedPitchSheet } from "./pitch";

export type RecordPitchSheetResult =
  | { status: "written"; pitchSheetId: string; content: GeneratedPitchSheet }
  | { status: "already_exists"; pitchSheetId: string; content: GeneratedPitchSheet }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export async function recordPitchSheet(
  reference: string,
  sheet: GeneratedPitchSheet,
): Promise<RecordPitchSheetResult> {
  const url = process.env.ERM_DATABASE_URL;
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
        const existing = await client.query(
          "SELECT id, content FROM pitch_sheets WHERE intake_id = $1 ORDER BY created_at ASC LIMIT 1",
          [intakeId],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            pitchSheetId: String(existing.rows[0].id),
            content: existing.rows[0].content as GeneratedPitchSheet,
          };
        }
        const inserted = await client.query(
          `INSERT INTO pitch_sheets (intake_id, client_id, status, content)
           VALUES ($1, $2, 'draft', $3::jsonb) RETURNING id`,
          [intakeId, clientId, JSON.stringify(sheet)],
        );
        const pitchSheetId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('pitch_sheet', $1, $2, 'system', 'pitch_sheet_draft', NULL, 'draft', $3)`,
          [pitchSheetId, clientId, reference],
        );
        await client.query("COMMIT");
        return { status: "written", pitchSheetId, content: sheet };
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
