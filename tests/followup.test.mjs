// node --test tests/followup.test.mjs — Gap 6 follow-up audit trail.
// Pure-logic tests only: no database, no network, no credentials, no
// prospect data. Sample intakes are invented test fixtures, not
// clients. The gated store returns "not_configured" when
// ERM_DATABASE_URL is absent — that is tested, not worked around.
// Logging only: this slice sends nothing, and the tests assert
// that no sending exists anywhere in the new code.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FOLLOW_UP_ELIGIBLE_STATUSES,
  FOLLOW_UP_STEPS,
  daysBetweenInChicago,
  dueDateForStep,
  followUpStatus,
  followUpsDue,
  isFollowUpEligibleStatus,
  nextDueStep,
  recordFollowUp,
} from "../app/lib/erm/followup-store.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "followup-store.ts"),
  "utf8",
);
const logRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "followup-log", "route.ts"),
  "utf8",
);
const statusRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "followup-status", "route.ts"),
  "utf8",
);
const dueRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "followups-due", "route.ts"),
  "utf8",
);
const schemaSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "schema.sql"),
  "utf8",
);
const migrationSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "migrations", "005-followups.sql"),
  "utf8",
);
const typesSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "types.ts"),
  "utf8",
);

// Intake received 2026-11-02 at 09:00 Chicago time.
const CREATED = new Date("2026-11-02T09:00:00-06:00");
const atDay = (day) => new Date(CREATED.getTime() + day * 86_400_000);

test("schedule is Day 1 / 3 / 7 / 14, in order", () => {
  assert.deepEqual(
    FOLLOW_UP_STEPS.map((s) => [s.step, s.day]),
    [
      ["day1", 1],
      ["day3", 3],
      ["day7", 7],
      ["day14", 14],
    ],
  );
});

test("day counting is by Chicago calendar day, not 24-hour spans", () => {
  // Same Chicago date, 23 hours apart: 0 days.
  assert.equal(
    daysBetweenInChicago(
      new Date("2026-11-02T01:00:00-06:00"),
      new Date("2026-11-03T00:30:00-06:00"),
    ),
    1,
  );
  assert.equal(
    daysBetweenInChicago(
      new Date("2026-11-02T09:00:00-06:00"),
      new Date("2026-11-02T23:30:00-06:00"),
    ),
    0,
  );
  // Across the Nov 1, 2026 fall-back: Nov 1 has 25 hours, but it is
  // still one calendar day.
  assert.equal(
    daysBetweenInChicago(
      new Date("2026-10-31T12:00:00-05:00"),
      new Date("2026-11-02T12:00:00-06:00"),
    ),
    2,
  );
});

test("due dates are the intake date plus the step day", () => {
  assert.equal(dueDateForStep(CREATED, "day1").toISOString(), "2026-11-03T00:00:00.000Z");
  assert.equal(dueDateForStep(CREATED, "day3").toISOString(), "2026-11-05T00:00:00.000Z");
  assert.equal(dueDateForStep(CREATED, "day7").toISOString(), "2026-11-09T00:00:00.000Z");
  assert.equal(dueDateForStep(CREATED, "day14").toISOString(), "2026-11-16T00:00:00.000Z");
});

test("nothing is due on Day 0; Day 1 is due on Day 1", () => {
  const base = { status: "received", createdAt: CREATED, loggedSteps: [] };
  assert.deepEqual(nextDueStep({ ...base, now: CREATED }), {
    due: false,
    reason: "not_yet_due",
  });
  const day1 = nextDueStep({ ...base, now: atDay(1) });
  assert.equal(day1.due, true);
  assert.equal(day1.step, "day1");
  assert.equal(day1.daysSinceIntake, 1);
});

test("a logged step is skipped; the next unlogged due step is next", () => {
  const base = { status: "received", createdAt: CREATED, loggedSteps: ["day1"] };
  // Day 2: day1 logged, day3 not yet due.
  assert.deepEqual(nextDueStep({ ...base, now: atDay(2) }), {
    due: false,
    reason: "not_yet_due",
  });
  // Day 3: day3 is next.
  const day3 = nextDueStep({ ...base, now: atDay(3) });
  assert.equal(day3.due, true);
  assert.equal(day3.step, "day3");
  // Day 8 with day1 and day3 logged: day7 is next (day 7 has passed).
  const day8 = nextDueStep({
    ...base,
    loggedSteps: ["day1", "day3"],
    now: atDay(8),
  });
  assert.equal(day8.due, true);
  assert.equal(day8.step, "day7");
});

test("Day 14 is reported due, not auto-closed", () => {
  const r = nextDueStep({
    status: "received",
    createdAt: CREATED,
    loggedSteps: ["day1", "day3", "day7"],
    now: atDay(14),
  });
  assert.equal(r.due, true);
  assert.equal(r.step, "day14");
  assert.equal(r.label, "Close as no reply");
});

test("all four steps logged means the sequence is complete", () => {
  assert.deepEqual(
    nextDueStep({
      status: "received",
      createdAt: CREATED,
      loggedSteps: ["day1", "day3", "day7", "day14"],
      now: atDay(20),
    }),
    { due: false, reason: "sequence_complete" },
  );
});

test("a reply stops the sequence", () => {
  assert.deepEqual(
    nextDueStep({
      status: "received",
      createdAt: CREATED,
      loggedSteps: [],
      now: atDay(5),
      repliedAt: atDay(4),
    }),
    { due: false, reason: "replied" },
  );
  // A reply recorded before the intake was received does not stop it.
  // No step is logged yet, so the earliest due step is day1.
  const r = nextDueStep({
    status: "received",
    createdAt: CREATED,
    loggedSteps: [],
    now: atDay(5),
    repliedAt: new Date("2026-11-01T09:00:00-06:00"),
  });
  assert.equal(r.due, true);
  assert.equal(r.step, "day1");
});

test("sequence applies only to early intake statuses", () => {
  assert.deepEqual(FOLLOW_UP_ELIGIBLE_STATUSES, [
    "received",
    "completeness_check",
    "pitch_sent",
    "agreed",
  ]);
  for (const status of ["received", "completeness_check", "pitch_sent", "agreed"]) {
    assert.equal(isFollowUpEligibleStatus(status), true);
  }
  for (const status of ["discovery_paid", "discovery_booked", "setup", "closed", "operate"]) {
    assert.equal(isFollowUpEligibleStatus(status), false);
    assert.deepEqual(
      nextDueStep({ status, createdAt: CREATED, loggedSteps: [], now: atDay(5) }),
      { due: false, reason: "not_eligible" },
    );
  }
});

test("store is gated: no database configured means not_configured, never a throw", async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  assert.deepEqual(
    await recordFollowUp("MT-20261102-TEST", { step: "day1", channel: "email" }),
    { status: "not_configured" },
  );
  assert.deepEqual(await followUpStatus("MT-20261102-TEST"), { status: "not_configured" });
  assert.deepEqual(await followUpsDue(), { status: "not_configured" });
});

test("store rejects an invalid step or channel without touching a database", async () => {
  process.env.ERM_DATABASE_URL = "postgres://example.invalid/erm";
  const badStep = await recordFollowUp("MT-20261102-TEST", {
    step: "day2",
    channel: "email",
  });
  assert.equal(badStep.status, "failed");
  const badChannel = await recordFollowUp("MT-20261102-TEST", {
    step: "day1",
    channel: "smoke-signal",
  });
  assert.equal(badChannel.status, "failed");
  delete process.env.ERM_DATABASE_URL;
});

test("types carry the follow-up step and channel", () => {
  assert.match(typesSource, /export type FollowUpStep = "day1" \| "day3" \| "day7" \| "day14"/);
  assert.match(
    typesSource,
    /export type FollowUpChannel = "email" \| "text" \| "call" \| "manual_note"/,
  );
});

test("schema and migration define the followups table, insert-only", () => {
  for (const src of [schemaSource, migrationSource]) {
    assert.match(src, /CREATE TABLE IF NOT EXISTS followups \(/);
    assert.match(src, /step TEXT NOT NULL CHECK \(step IN \('day1', 'day3', 'day7', 'day14'\)\)/);
    assert.match(
      src,
      /channel TEXT NOT NULL CHECK \(channel IN \('email', 'text', 'call', 'manual_note'\)\)/,
    );
  }
  assert.match(schemaSource, /CREATE INDEX IF NOT EXISTS idx_followups_intake/);
  assert.match(migrationSource, /Logging only/);
});

test("no sending anywhere in the new code: no email, SMS, call, or sender", () => {
  for (const [name, src] of [
    ["followup-store.ts", storeSource],
    ["followup-log route", logRouteSource],
    ["followup-status route", statusRouteSource],
    ["followups-due route", dueRouteSource],
  ]) {
    assert.ok(!/resend|twilio|sendgrid|fetch\(|axios|nodemailer/i.test(src), `${name} must not send`);
    assert.ok(!/sendFollowUp|send_followup|autoSend|auto_send/i.test(src), `${name} must not auto-send`);
  }
  // The log route records a follow-up the owner did; it never sends one.
  assert.match(logRouteSource, /RECORDS a follow-up; it does not\s*\n \* send one/);
});

test("store never UPDATEs or DELETEs a follow-up or audit row, and never closes an intake", () => {
  assert.ok(!/UPDATE\s+followups/i.test(storeSource));
  assert.ok(!/DELETE\s+FROM\s+followups/i.test(storeSource));
  assert.ok(!/UPDATE\s+intakes/i.test(storeSource));
  assert.ok(!/UPDATE\s+audit_log/i.test(storeSource));
  assert.ok(!/DELETE\s+FROM\s+audit_log/i.test(storeSource));
  // One row per step per intake, enforced in code.
  assert.match(storeSource, /WHERE intake_id = \$1 AND step = \$2/);
  assert.match(storeSource, /already_exists/);
  // Unknown reference writes nothing.
  assert.match(storeSource, /intake_not_found/);
});

test("owner routes are token-gated and return no PII beyond reference/lane/step", () => {
  for (const [name, src] of [
    ["followup-log", logRouteSource],
    ["followup-status", statusRouteSource],
    ["followups-due", dueRouteSource],
  ]) {
    assert.match(src, /OPS_DASHBOARD_TOKEN/, `${name} must be token-gated`);
    assert.match(src, /unauthorized/, `${name} must 401 without the token`);
    assert.match(src, /ops_not_configured/, `${name} must 503 without the token configured`);
  }
  assert.ok(!/contactEmail|contactPhone|contact_email|contact_phone/.test(statusRouteSource));
  assert.ok(!/contactEmail|contactPhone|contact_email|contact_phone/.test(dueRouteSource));
  assert.match(dueRouteSource, /no names, no answers, no contact details/);
});
