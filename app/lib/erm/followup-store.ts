/**
 * Micro Titan follow-up persistence — Gap 6, logging only.
 *
 * Same gated pattern as app/lib/erm/presentation-store.ts (PR #37)
 * and app/lib/erm/discovery-call-store.ts (PR #34).
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data.
 * - The caller must supply an intake reference that already exists
 *   in intakes. This module never creates a client or an intake:
 *   a follow-up is logged FOR an intake, not instead of one. An
 *   unknown reference returns "intake_not_found" and writes
 *   nothing.
 * - Idempotency is enforced in code: one logged row per step per
 *   intake. Recording a step that is already logged for the intake
 *   returns "already_exists" with the stored row — no duplicate
 *   row, no overwrite. Follow-ups are insert-only here: this
 *   module never UPDATEs or DELETEs a follow-up row, and never
 *   UPDATEs or DELETEs an audit_log row.
 * - This module never sends anything. There is no email, SMS, or
 *   call in this file, and no sender is created. A follow-up row
 *   records a follow-up the owner actually did, by hand, through
 *   the token-gated owner route — it is the audit trail, not the
 *   sending. Automated sending needs the owner's separate go.
 * - This module never advances an intake's status and never closes
 *   an intake. A logged "day14" step means "close as no reply" is
 *   due; the owner closes the intake as a separate, owner-approved
 *   step. Setup, payment, and agreement states are untouched.
 * - No PII is logged. Errors return a status string only. The
 *   owner due-list returns references, lanes, and steps only —
 *   no names, no answers, no contact details.
 */

import type { FollowUpChannel, FollowUpStep } from "./types";

/**
 * The four follow-up steps, in order, with the day each falls due.
 * Runtime constants live here, with the store that uses them:
 * repo source files never value-import another local .ts file
 * (see the same pattern in app/lib/erm/balance-store.ts, whose
 * BALANCE_CENTS mirrors LANE_PRICING in ./types, pinned equal by
 * test). The step/day pairs mirror the operating rule in
 * micro-titan-discovery-booking-and-followup.md.
 */
export const FOLLOW_UP_STEPS: ReadonlyArray<{
  step: FollowUpStep;
  day: number;
  label: string;
}> = [
  { step: "day1", day: 1, label: "Intake acknowledged" },
  { step: "day3", day: 3, label: "First follow-up" },
  { step: "day7", day: 7, label: "Second / final follow-up" },
  { step: "day14", day: 14, label: "Close as no reply" },
];

/** Intake statuses the follow-up sequence applies to. */
export const FOLLOW_UP_ELIGIBLE_STATUSES: ReadonlyArray<string> = [
  "received",
  "completeness_check",
  "pitch_sent",
  "agreed",
];

/**
 * Pure due-date computation. Lives here, with the store that uses
 * it, because repo source files never value-import another local
 * .ts file (see app/lib/erm/presentation.ts). Exported so tests
 * and owner routes can use the same computation the store uses.
 */

/** Intake statuses the follow-up sequence applies to. */
export function isFollowUpEligibleStatus(status: string): boolean {
  return FOLLOW_UP_ELIGIBLE_STATUSES.includes(status);
}

/**
 * Whole calendar days between two instants, counted in
 * America/Chicago. The time of day does not matter: two instants
 * on the same Chicago calendar date are 0 days apart, and two
 * instants on consecutive Chicago dates are 1 day apart, even
 * across a daylight-saving change.
 */
export function daysBetweenInChicago(from: Date, to: Date): number {
  const parts = (d: Date): [number, number, number] => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const p = fmt.formatToParts(d);
    const get = (type: string): number =>
      Number(p.find((x) => x.type === type)?.value ?? "0");
    return [get("year"), get("month"), get("day")];
  };
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  const fromDay = Date.UTC(fy, fm - 1, fd);
  const toDay = Date.UTC(ty, tm - 1, td);
  return Math.floor((toDay - fromDay) / 86_400_000);
}

/** The calendar date (America/Chicago) a given step falls due on. */
export function dueDateForStep(createdAt: Date, step: FollowUpStep): Date {
  const def = FOLLOW_UP_STEPS.find((s) => s.step === step);
  if (!def) throw new Error(`Unknown follow-up step: ${step}`);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const p = fmt.formatToParts(createdAt);
  const get = (type: string): number =>
    Number(p.find((x) => x.type === type)?.value ?? "0");
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day") + def.day));
}

export type NextDueStepResult =
  | {
      due: true;
      step: FollowUpStep;
      label: string;
      daysSinceIntake: number;
      dueDate: Date;
    }
  | { due: false; reason: "not_eligible" | "replied" | "not_yet_due" | "sequence_complete" };

export interface NextDueStepInput {
  status: string;
  createdAt: Date;
  loggedSteps: FollowUpStep[];
  now: Date;
  /** When the prospect last replied, if known. Fed by the communication log (Gap 7) later; until then, status advancement is the stop signal. */
  repliedAt?: Date | null;
}

/**
 * The next follow-up step due for an intake, if any: the earliest
 * step whose day has arrived and which has not already been logged.
 * A reply, a closed intake, or a status outside the early stages
 * stops the sequence. Day 14 means "close as no reply" — this
 * function reports it as due; it does not close the intake. The
 * owner closes it, as a separate, owner-approved step.
 */
export function nextDueStep(input: NextDueStepInput): NextDueStepResult {
  const { status, createdAt, loggedSteps, now } = input;
  if (status === "closed" || !isFollowUpEligibleStatus(status)) {
    return { due: false, reason: "not_eligible" };
  }
  if (input.repliedAt && input.repliedAt >= createdAt) {
    return { due: false, reason: "replied" };
  }
  const daysSinceIntake = daysBetweenInChicago(createdAt, now);
  const logged = new Set(loggedSteps);
  for (const def of FOLLOW_UP_STEPS) {
    if (logged.has(def.step)) continue;
    if (daysSinceIntake < def.day) {
      return { due: false, reason: "not_yet_due" };
    }
    return {
      due: true,
      step: def.step,
      label: def.label,
      daysSinceIntake,
      dueDate: dueDateForStep(createdAt, def.step),
    };
  }
  return { due: false, reason: "sequence_complete" };
}

export type RecordFollowUpResult =
  | {
      status: "written";
      followUpId: string;
      step: FollowUpStep;
      channel: FollowUpChannel;
    }
  | {
      status: "already_exists";
      followUpId: string;
      step: FollowUpStep;
      channel: FollowUpChannel;
    }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export interface LoggedFollowUp {
  followUpId: string;
  step: FollowUpStep;
  channel: FollowUpChannel;
  note: string;
  actor: string;
  loggedAt: string;
}

export type FollowUpStatusResult =
  | {
      status: "found";
      intakeStatus: string;
      lane: string;
      daysSinceIntake: number;
      logged: LoggedFollowUp[];
      nextDue:
        | { step: FollowUpStep; label: string; dueDate: string }
        | null;
      nextDueReason: string | null;
    }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export interface DueFollowUp {
  reference: string;
  lane: string;
  intakeStatus: string;
  step: FollowUpStep;
  label: string;
  daysSinceIntake: number;
  dueDate: string;
}

export type FollowUpsDueResult =
  | { status: "found"; due: DueFollowUp[] }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

const VALID_STEPS: ReadonlyArray<string> = ["day1", "day3", "day7", "day14"];
const VALID_CHANNELS: ReadonlyArray<string> = ["email", "text", "call", "manual_note"];

export async function recordFollowUp(
  reference: string,
  input: { step: FollowUpStep; channel: FollowUpChannel; note?: string; actor?: string },
): Promise<RecordFollowUpResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  if (!VALID_STEPS.includes(input.step) || !VALID_CHANNELS.includes(input.channel)) {
    return { status: "failed" };
  }
  const note = (input.note ?? "").slice(0, 500);
  const actor = (input.actor ?? "owner").slice(0, 100);
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
          "SELECT id, step, channel FROM followups WHERE intake_id = $1 AND step = $2 ORDER BY created_at ASC LIMIT 1",
          [intakeId, input.step],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            followUpId: String(existing.rows[0].id),
            step: existing.rows[0].step as FollowUpStep,
            channel: existing.rows[0].channel as FollowUpChannel,
          };
        }
        const inserted = await client.query(
          `INSERT INTO followups
             (intake_id, client_id, reference, step, channel, note, actor)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [intakeId, clientId, reference, input.step, input.channel, note, actor],
        );
        const followUpId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('followup', $1, $2, $3, $4, NULL, NULL, $5)`,
          [followUpId, clientId, actor, `followup_${input.step}`, reference],
        );
        await client.query("COMMIT");
        return { status: "written", followUpId, step: input.step, channel: input.channel };
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

export async function followUpStatus(
  reference: string,
  now: Date = new Date(),
): Promise<FollowUpStatusResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const intake = await client.query(
          "SELECT id, status, lane, created_at FROM intakes WHERE reference = $1",
          [reference],
        );
        if (intake.rows.length === 0) {
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const intakeStatus = String(intake.rows[0].status);
        const lane = String(intake.rows[0].lane);
        const createdAt = new Date(intake.rows[0].created_at);
        const rows = await client.query(
          `SELECT id, step, channel, note, actor, created_at
             FROM followups WHERE intake_id = $1 ORDER BY created_at ASC`,
          [intakeId],
        );
        const logged: LoggedFollowUp[] = rows.rows.map((r: Record<string, unknown>) => ({
          followUpId: String(r.id),
          step: String(r.step) as FollowUpStep,
          channel: String(r.channel) as FollowUpChannel,
          note: String(r.note ?? ""),
          actor: String(r.actor ?? ""),
          loggedAt: new Date(String(r.created_at)).toISOString(),
        }));
        const next = nextDueStep({
          status: intakeStatus,
          createdAt,
          loggedSteps: logged.map((l) => l.step),
          now,
        });
        return {
          status: "found",
          intakeStatus,
          lane,
          daysSinceIntake: daysBetweenInChicago(createdAt, now),
          logged,
          nextDue: next.due
            ? {
                step: next.step,
                label: next.label,
                dueDate: next.dueDate.toISOString(),
              }
            : null,
          nextDueReason: next.due ? null : next.reason,
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

export async function followUpsDue(now: Date = new Date()): Promise<FollowUpsDueResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const intakes = await client.query(
          `SELECT id, reference, lane, status, created_at FROM intakes
            WHERE status = ANY($1::text[]) ORDER BY created_at ASC LIMIT 200`,
          [[...isFollowUpEligibleStatusList()]],
        );
        const due: DueFollowUp[] = [];
        for (const row of intakes.rows) {
          const intakeId = String(row.id);
          const createdAt = new Date(row.created_at);
          const loggedRows = await client.query(
            "SELECT step FROM followups WHERE intake_id = $1",
            [intakeId],
          );
          const next = nextDueStep({
            status: String(row.status),
            createdAt,
            loggedSteps: loggedRows.rows.map((r: Record<string, unknown>) => String(r.step) as FollowUpStep),
            now,
          });
          if (!next.due) continue;
          due.push({
            reference: String(row.reference),
            lane: String(row.lane),
            intakeStatus: String(row.status),
            step: next.step,
            label: next.label,
            daysSinceIntake: next.daysSinceIntake,
            dueDate: next.dueDate.toISOString(),
          });
        }
        return { status: "found", due };
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

function isFollowUpEligibleStatusList(): string[] {
  // Keep the SQL filter identical to the pure rule in followup.ts.
  return ["received", "completeness_check", "pitch_sent", "agreed"];
}
