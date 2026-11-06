/**
 * Micro Titan change + access log — Gap 10, logging only.
 *
 * Same gated pattern as app/lib/erm/followup-store.ts (PR #38),
 * app/lib/erm/presentation-store.ts (PR #37) and
 * app/lib/erm/discovery-call-store.ts (PR #34).
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data.
 * - A log entry records a change the owner actually made, or
 *   access the owner actually granted / revoked / reviewed, by
 *   hand, through the token-gated owner route. It is the audit
 *   trail, not the change itself: nothing in this module changes
 *   a system, grants access, or sends anything. There is no
 *   email, SMS, or call in this file, and no sender is created.
 * - Two kinds of entry, in one append-only table:
 *   "change" — who changed what setup (a config value, an
 *   integration, a price, a route, an env var, a migration, a
 *   deployment). "access" — who holds access to what (which
 *   person or agent holds access to which system or resource,
 *   at which level, granted / revoked / reviewed).
 * - An entry may be linked to an intake (reference supplied)
 *   or system-wide (no reference). When a reference IS supplied
 *   it must already exist in intakes: this module never creates
 *   a client or an intake, and an unknown reference returns
 *   "intake_not_found" and writes nothing.
 * - Idempotency is enforced in code by event_key: one entry per
 *   event key, ever. Re-logging the same event key returns
 *   "already_exists" with the stored row — no duplicate row, no
 *   overwrite. The caller (the owner route) supplies the key;
 *   a re-POST of the same log is a no-op, not a second event.
 * - Records are insert-only here: this module issues no updates
 *   or deletes against a change_log row or an audit_log row, and
 *   it never advances or closes an intake. A change entry does
 *   not itself change anything — it records that a change was
 *   made, by whom, and what it was.
 * - No secrets in this log, ever. from_value / to_value carry
 *   descriptions ("enabled", "Family $1,500", "webhook URL
 *   pointed at production"), never a credential, key, token,
 *   or password value. No client passwords are stored, ever.
 *   No PII is logged. Errors return a status string only. The
 *   owner list returns references, kinds, actions, and
 *   descriptions only — no names, no answers, no contact
 *   details.
 */

import type { ChangeLogAction, ChangeLogKind } from "./types";

/**
 * Actions allowed for each kind. Runtime constants live here,
 * with the store that uses them: repo source files never
 * value-import another local .ts file (see the same pattern in
 * app/lib/erm/followup-store.ts and
 * app/lib/erm/balance-store.ts).
 */
export const CHANGE_LOG_ACTIONS: Record<ChangeLogKind, ReadonlyArray<ChangeLogAction>> = {
  change: [
    "config_changed",
    "integration_added",
    "integration_removed",
    "integration_rewired",
    "price_changed",
    "route_added",
    "route_changed",
    "env_updated",
    "migration_applied",
    "deployment_made",
    "other_change",
  ],
  access: [
    "access_granted",
    "access_revoked",
    "access_reviewed",
    "access_changed",
  ],
};

export const CHANGE_LOG_KINDS: ReadonlyArray<ChangeLogKind> = ["change", "access"];

const MAX_ACTOR = 100;
const MAX_SUBJECT = 200;
const MAX_SUMMARY = 1000;
const MAX_VALUE = 500;
const MAX_EVENT_KEY = 100;

const EVENT_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
const REFERENCE_RE = /^MT-\d{8}-[A-Z0-9]{4}$/;

export interface ChangeLogInput {
  kind: ChangeLogKind;
  action: ChangeLogAction;
  actor?: string;
  subject: string;
  summary?: string;
  fromValue?: string;
  toValue?: string;
  reference?: string;
  eventKey: string;
}

/**
 * Pure validation, exported so tests and the owner route can use
 * the same rule the store uses. Returns an error code, or null
 * when the input is valid. A "failed" from the store means one
 * of these codes.
 */
export function validateChangeLogInput(input: ChangeLogInput): string | null {
  if (!CHANGE_LOG_KINDS.includes(input.kind)) return "bad_kind";
  if (!CHANGE_LOG_ACTIONS[input.kind].includes(input.action)) return "bad_action";
  if (typeof input.subject !== "string" || input.subject.trim().length === 0) return "bad_subject";
  if (input.subject.length > MAX_SUBJECT) return "bad_subject";
  if (typeof input.eventKey !== "string" || !EVENT_KEY_RE.test(input.eventKey)) return "bad_event_key";
  if (input.summary !== undefined && input.summary.length > MAX_SUMMARY) return "bad_summary";
  if (input.fromValue !== undefined && input.fromValue.length > MAX_VALUE) return "bad_value";
  if (input.toValue !== undefined && input.toValue.length > MAX_VALUE) return "bad_value";
  if (input.actor !== undefined && input.actor.length > MAX_ACTOR) return "bad_actor";
  if (
    input.reference !== undefined &&
    input.reference !== "" &&
    !REFERENCE_RE.test(input.reference)
  ) {
    return "bad_reference";
  }
  return null;
}

export type RecordChangeLogResult =
  | { status: "written"; changeLogId: string; kind: ChangeLogKind; action: ChangeLogAction }
  | { status: "already_exists"; changeLogId: string; kind: ChangeLogKind; action: ChangeLogAction }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export interface LoggedChange {
  changeLogId: string;
  kind: ChangeLogKind;
  action: ChangeLogAction;
  actor: string;
  subject: string;
  summary: string;
  fromValue: string;
  toValue: string;
  reference: string;
  loggedAt: string;
}

export type ChangeLogListResult =
  | { status: "found"; entries: LoggedChange[] }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

export async function recordChangeLog(input: ChangeLogInput): Promise<RecordChangeLogResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  if (validateChangeLogInput(input) !== null) return { status: "failed" };
  const actor = (input.actor ?? "owner").slice(0, MAX_ACTOR) || "owner";
  const summary = (input.summary ?? "").slice(0, MAX_SUMMARY);
  const fromValue = (input.fromValue ?? "").slice(0, MAX_VALUE);
  const toValue = (input.toValue ?? "").slice(0, MAX_VALUE);
  const reference = input.reference ?? "";
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        let intakeId: string | null = null;
        let clientId: string | null = null;
        if (reference !== "") {
          const intake = await client.query(
            "SELECT id, client_id FROM intakes WHERE reference = $1",
            [reference],
          );
          if (intake.rows.length === 0) {
            await client.query("ROLLBACK");
            return { status: "intake_not_found" };
          }
          intakeId = String(intake.rows[0].id);
          clientId = String(intake.rows[0].client_id);
        }
        const existing = await client.query(
          "SELECT id, kind, action FROM change_log WHERE event_key = $1 LIMIT 1",
          [input.eventKey],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            changeLogId: String(existing.rows[0].id),
            kind: existing.rows[0].kind as ChangeLogKind,
            action: existing.rows[0].action as ChangeLogAction,
          };
        }
        const inserted = await client.query(
          `INSERT INTO change_log
             (intake_id, client_id, reference, event_key, kind, action, actor, subject, summary, from_value, to_value)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
          [
            intakeId,
            clientId,
            reference,
            input.eventKey,
            input.kind,
            input.action,
            actor,
            input.subject,
            summary,
            fromValue,
            toValue,
          ],
        );
        const changeLogId = String(inserted.rows[0].id);
        // audit_log.client_id is NOT NULL, so a system-wide entry
        // (no intake, no client) leaves no audit row: the
        // change_log row itself is the record in that case.
        if (clientId !== null) {
          await client.query(
            `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
             VALUES ('change_log', $1, $2, $3, $4, NULL, NULL, $5)`,
            [
              changeLogId,
              clientId,
              actor,
              `${input.kind}_${input.action}`,
              reference,
            ],
          );
        }
        await client.query("COMMIT");
        return { status: "written", changeLogId, kind: input.kind, action: input.action };
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

export async function changeLogList(input: {
  kind?: string;
  reference?: string;
  limit?: number;
}): Promise<ChangeLogListResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  const kind = input.kind ?? "";
  if (kind !== "" && !CHANGE_LOG_KINDS.includes(kind as ChangeLogKind)) {
    return { status: "failed" };
  }
  const reference = input.reference ?? "";
  if (reference !== "" && !REFERENCE_RE.test(reference)) return { status: "failed" };
  const limit = Math.min(Math.max(Math.floor(input.limit ?? 50) || 50, 1), 200);
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        if (reference !== "") {
          const intake = await client.query(
            "SELECT id FROM intakes WHERE reference = $1",
            [reference],
          );
          if (intake.rows.length === 0) return { status: "intake_not_found" };
        }
        const params: unknown[] = [];
        const where: string[] = [];
        if (kind !== "") {
          params.push(kind);
          where.push(`kind = $${params.length}`);
        }
        if (reference !== "") {
          params.push(reference);
          where.push(`reference = $${params.length}`);
        }
        params.push(limit);
        const rows = await client.query(
          `SELECT id, kind, action, actor, subject, summary, from_value, to_value, reference, created_at
             FROM change_log
             ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
             ORDER BY created_at DESC LIMIT $${params.length}`,
          params,
        );
        const entries: LoggedChange[] = rows.rows.map((r: Record<string, unknown>) => ({
          changeLogId: String(r.id),
          kind: String(r.kind) as ChangeLogKind,
          action: String(r.action) as ChangeLogAction,
          actor: String(r.actor ?? ""),
          subject: String(r.subject ?? ""),
          summary: String(r.summary ?? ""),
          fromValue: String(r.from_value ?? ""),
          toValue: String(r.to_value ?? ""),
          reference: String(r.reference ?? ""),
          loggedAt: new Date(String(r.created_at)).toISOString(),
        }));
        return { status: "found", entries };
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
