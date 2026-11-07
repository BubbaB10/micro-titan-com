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
 * - dailyFollowUpJob is the daily cron's plan. It only surfaces
 *   the due list the caller already loaded. It inserts nothing,
 *   so two runs on the same Chicago day cannot create a duplicate
 *   follow-up row, and it sends nothing to a client or the owner.
 * - Test intakes are not prospects. followUpsDue omits them
 *   through isTestIntake. The cron reports that as
 *   excludedTestCount, a number only: no reference and no name.
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

/** Exact email domains that are reserved for examples and tests. */
const TEST_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  "example.com",
  "example.org",
  "example.net",
]);

/** Domain endings reserved for tests, documentation, and invalid addresses. */
const TEST_EMAIL_DOMAIN_SUFFIXES: readonly string[] = [".invalid", ".test", ".example"];

export interface TestIntakeSignals {
  reference?: string | null;
  clientName?: string | null;
  contactEmail?: string | null;
  source?: string | null;
}

function emailDomain(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0 || at === trimmed.length - 1) return "";
  return trimmed.slice(at + 1).trim();
}

/**
 * True when an intake is a test and is not a prospect. Any one
 * marker is enough. Pure: no I/O and no logging. followUpsDue
 * applies this to every eligible row, so the cron and the owner
 * view share one rule and the query does not restate it.
 *
 * - reference ends with "-TEST"
 * - the client name's first word is "test" (case-insensitive,
 *   ASCII word boundary, so a name such as "Testa" does not match)
 * - the email domain is example.com, example.org, or example.net,
 *   or that domain ends with .invalid, .test, or .example
 * - source contains "test" in any case
 */
export function isTestIntake(input: TestIntakeSignals): boolean {
  const reference = (input.reference ?? "").trim();
  if (reference.endsWith("-TEST")) return true;

  const clientName = (input.clientName ?? "").trim();
  if (/^test\b/i.test(clientName)) return true;

  const domain = emailDomain(input.contactEmail ?? "");
  if (
    domain.length > 0 &&
    (TEST_EMAIL_DOMAINS.has(domain) ||
      TEST_EMAIL_DOMAIN_SUFFIXES.some((suffix) => domain.endsWith(suffix)))
  ) {
    return true;
  }

  const source = input.source ?? "";
  if (source.toLowerCase().includes("test")) return true;

  return false;
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
  | { status: "found"; due: DueFollowUp[]; excludedTestCount: number }
  | { status: "not_configured" }
  | { status: "failed" };

function textCell(value: unknown): string {
  return value == null ? "" : String(value);
}

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
        // The join loads the signals isTestIntake reads. The rule
        // itself stays in that function — this query does not restate
        // it — and both the cron and the owner view call followUpsDue.
        const intakes = await client.query(
          `SELECT i.id, i.reference, i.lane, i.status, i.created_at, i.source,
                  c.name AS client_name, c.contact_email
             FROM intakes i
             JOIN clients c ON c.id = i.client_id
            WHERE i.status = ANY($1::text[])
            ORDER BY i.created_at ASC
            LIMIT 200`,
          [[...isFollowUpEligibleStatusList()]],
        );
        const due: DueFollowUp[] = [];
        let excludedTestCount = 0;
        for (const row of intakes.rows) {
          if (
            isTestIntake({
              reference: textCell(row.reference),
              clientName: textCell(row.client_name),
              contactEmail: textCell(row.contact_email),
              source: textCell(row.source),
            })
          ) {
            excludedTestCount += 1;
            continue;
          }
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
        return { status: "found", due, excludedTestCount };
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

/** YYYY-MM-DD calendar date in America/Chicago. */
export function chicagoCalendarDate(now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const p = fmt.formatToParts(now);
  const get = (type: string): string => p.find((x) => x.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when the
 * CRON_SECRET env var is set. Missing secret is not configured.
 * Anything other than that exact header is unauthorized. The
 * secret value is never read from source and never returned.
 */
export function authorizeCronBearer(
  authorization: string | null,
  secret: string | undefined,
): "ok" | "not_configured" | "unauthorized" {
  if (!secret) return "not_configured";
  if ((authorization ?? "") !== `Bearer ${secret}`) return "unauthorized";
  return "ok";
}

export type DailyFollowUpJobResult =
  | {
      ok: true;
      job: "followups";
      chicagoDate: string;
      runKey: string;
      due: DueFollowUp[];
      count: number;
      /** Eligible intakes omitted because isTestIntake matched. A count only. */
      excludedTestCount: number;
      writes: 0;
      clientMessages: 0;
    }
  | { ok: false; error: "not_configured" | "followups_due_failed" };

/**
 * Turn a loaded due-list into the daily job result. The run key is
 * the Chicago calendar date, so two invocations on that date are
 * the same run. This function does not insert, update, or delete,
 * and it does not send. A follow-up row still means the owner
 * logged a step they actually did; creating one here would hide
 * the due item and is intentionally not done.
 * excludedTestCount is copied from the load. It is a number only.
 */
export function dailyFollowUpJob(
  loaded: FollowUpsDueResult,
  now: Date = new Date(),
): DailyFollowUpJobResult {
  if (loaded.status === "not_configured") return { ok: false, error: "not_configured" };
  if (loaded.status === "failed") return { ok: false, error: "followups_due_failed" };
  const chicagoDate = chicagoCalendarDate(now);
  return {
    ok: true,
    job: "followups",
    chicagoDate,
    runKey: `followups:${chicagoDate}`,
    due: loaded.due,
    count: loaded.due.length,
    excludedTestCount: loaded.excludedTestCount ?? 0,
    writes: 0,
    clientMessages: 0,
  };
}

export type DailyFollowUpCronResponse =
  | { status: 503; body: { ok: false; error: "cron_not_configured" | "not_configured" } }
  | { status: 401; body: { ok: false; error: "unauthorized" } }
  | { status: 502; body: { ok: false; error: "followups_due_failed" } }
  | { status: 200; body: Extract<DailyFollowUpJobResult, { ok: true }> };

/**
 * The daily cron's whole decision: reject without CRON_SECRET,
 * then surface the due list. `load` defaults to the database
 * read. A caller can pass a load function in tests. This function
 * never calls recordFollowUp and never sends.
 */
export async function handleDailyFollowUpCron(input: {
  authorization: string | null;
  secret: string | undefined;
  now?: Date;
  load?: (now: Date) => Promise<FollowUpsDueResult>;
}): Promise<DailyFollowUpCronResponse> {
  const decision = authorizeCronBearer(input.authorization, input.secret);
  if (decision === "not_configured") {
    return { status: 503, body: { ok: false, error: "cron_not_configured" } };
  }
  if (decision !== "ok") {
    return { status: 401, body: { ok: false, error: "unauthorized" } };
  }
  const now = input.now ?? new Date();
  const load = input.load ?? followUpsDue;
  const job = dailyFollowUpJob(await load(now), now);
  if (!job.ok && job.error === "not_configured") {
    return { status: 503, body: { ok: false, error: "not_configured" } };
  }
  if (!job.ok) {
    return { status: 502, body: { ok: false, error: "followups_due_failed" } };
  }
  return { status: 200, body: job };
}
