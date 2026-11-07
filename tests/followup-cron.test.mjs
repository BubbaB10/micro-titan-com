// node --test tests/followup-cron.test.mjs — Gap 6 daily follow-up job.
// The cron surfaces due follow-ups for the owner. It does not write
// follow-up rows and it does not email, text, or otherwise message
// a client. Sample rows below are invented fixtures, not clients.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  authorizeCronBearer,
  chicagoCalendarDate,
  dailyFollowUpJob,
  handleDailyFollowUpCron,
} from "../app/lib/erm/followup-store.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cronRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "cron", "followups", "route.ts"),
  "utf8",
);
const storeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "followup-store.ts"),
  "utf8",
);
const handlerSource = storeSource.slice(storeSource.indexOf("export async function handleDailyFollowUpCron"));
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));

const DUE = [
  {
    reference: "MT-TEST-DUE",
    lane: "solo",
    intakeStatus: "received",
    step: "day1",
    label: "Intake acknowledged",
    daysSinceIntake: 1,
    dueDate: "2026-11-06T00:00:00.000Z",
  },
];

test("cron schedule is once a day at 14:00 UTC, on the follow-ups route", () => {
  assert.deepEqual(vercel.crons, [
    { path: "/api/cron/followups", schedule: "0 14 * * *" },
  ]);
  assert.match(cronRouteSource, /FOLLOW_UP_CRON_PATH = "\/api\/cron\/followups"/);
  assert.match(cronRouteSource, /FOLLOW_UP_CRON_SCHEDULE = "0 14 \* \* \*"/);
  assert.match(cronRouteSource, /8:00 AM Central Standard Time/);
  assert.match(cronRouteSource, /9:00 AM Central Daylight Time/);
});

test("Chicago calendar date, including the midnight and daylight-saving edges", () => {
  // 14:00 UTC on 6 Nov 2026 is 08:00 CST (standard time).
  assert.equal(chicagoCalendarDate(new Date("2026-11-06T14:00:00Z")), "2026-11-06");
  // 23:30 CST is still the 5th; 00:30 CST is the 6th.
  assert.equal(chicagoCalendarDate(new Date("2026-11-06T05:30:00Z")), "2026-11-05");
  assert.equal(chicagoCalendarDate(new Date("2026-11-06T06:30:00Z")), "2026-11-06");
  // 13:00 UTC on 6 Jul 2026 is 08:00 CDT.
  assert.equal(chicagoCalendarDate(new Date("2026-07-06T13:00:00Z")), "2026-07-06");
  assert.equal(chicagoCalendarDate(new Date("2026-07-06T04:30:00Z")), "2026-07-05");
});

test("CRON_SECRET bearer is required and a missing secret rejects", () => {
  assert.equal(authorizeCronBearer(null, undefined), "not_configured");
  assert.equal(authorizeCronBearer("Bearer anything", ""), "not_configured");
  assert.equal(authorizeCronBearer(null, "cron-test-secret"), "unauthorized");
  assert.equal(authorizeCronBearer("", "cron-test-secret"), "unauthorized");
  assert.equal(authorizeCronBearer("Bearer wrong", "cron-test-secret"), "unauthorized");
  assert.equal(authorizeCronBearer("bearer cron-test-secret", "cron-test-secret"), "unauthorized");
  assert.equal(authorizeCronBearer("cron-test-secret", "cron-test-secret"), "unauthorized");
  assert.equal(authorizeCronBearer("Bearer cron-test-secret ", "cron-test-secret"), "unauthorized");
  assert.equal(authorizeCronBearer("Bearer cron-test-secret", "cron-test-secret"), "ok");
});

test("the daily job is idempotent per Chicago day and writes nothing", () => {
  const loaded = { status: "found", due: DUE };
  const morning = new Date("2026-11-06T14:00:00Z");
  const afternoon = new Date("2026-11-06T20:00:00Z");
  const first = dailyFollowUpJob(loaded, morning);
  const second = dailyFollowUpJob(loaded, afternoon);
  assert.deepEqual(first, second);
  assert.equal(first.ok, true);
  assert.equal(first.runKey, "followups:2026-11-06");
  assert.equal(first.writes, 0);
  assert.equal(first.clientMessages, 0);
  assert.equal(first.count, 1);
  assert.equal(first.due[0].reference, "MT-TEST-DUE");
  assert.equal(first.due[0].step, "day1");
  assert.equal(DUE.length, 1);

  const nextMorning = dailyFollowUpJob(loaded, new Date("2026-11-07T14:00:00Z"));
  assert.equal(nextMorning.runKey, "followups:2026-11-07");
  assert.equal(nextMorning.writes, 0);
  assert.equal(nextMorning.clientMessages, 0);

  assert.deepEqual(dailyFollowUpJob({ status: "not_configured" }, morning), {
    ok: false,
    error: "not_configured",
  });
  assert.deepEqual(dailyFollowUpJob({ status: "failed" }, morning), {
    ok: false,
    error: "followups_due_failed",
  });
});

test("the cron route sends nothing and does not log a follow-up row", () => {
  assert.match(cronRouteSource, /handleDailyFollowUpCron/);
  assert.match(cronRouteSource, /CRON_SECRET/);
  assert.match(cronRouteSource, /req\.headers\.get\("authorization"\)/);
  assert.match(cronRouteSource, /It sends nothing/);
  assert.ok(!/recordFollowUp/.test(cronRouteSource));
  assert.ok(!/followUpsDue/.test(cronRouteSource));
  assert.ok(!/INSERT\s+INTO/i.test(cronRouteSource));
  assert.ok(!/resend|twilio|sendgrid|fetch\(|axios|nodemailer/i.test(cronRouteSource));
  assert.ok(!/sendFollowUp|send_followup|autoSend|auto_send/i.test(cronRouteSource));
  assert.ok(!/OPS_DASHBOARD_TOKEN/.test(cronRouteSource));

  assert.ok(handlerSource.length > 0);
  assert.match(handlerSource, /authorizeCronBearer/);
  assert.match(handlerSource, /cron_not_configured/);
  assert.match(handlerSource, /unauthorized/);
  assert.ok(
    handlerSource.indexOf("authorizeCronBearer") < handlerSource.indexOf("await load"),
    "auth must run before the due-list read",
  );
  assert.ok(!/recordFollowUp/.test(handlerSource));
  assert.ok(!/INSERT\s+INTO/i.test(handlerSource));
  assert.ok(!/UPDATE\s+followups/i.test(handlerSource));
  assert.ok(!/DELETE\s+FROM/i.test(handlerSource));
  assert.ok(!/resend|twilio|sendgrid|fetch\(|axios|nodemailer/i.test(handlerSource));
});

test("the handler rejects a missing secret, a missing header, and a wrong bearer", async () => {
  const unconfigured = await handleDailyFollowUpCron({
    authorization: "Bearer anything",
    secret: undefined,
  });
  assert.equal(unconfigured.status, 503);
  assert.deepEqual(unconfigured.body, { ok: false, error: "cron_not_configured" });

  const missing = await handleDailyFollowUpCron({
    authorization: null,
    secret: "cron-test-secret",
  });
  assert.equal(missing.status, 401);
  assert.deepEqual(missing.body, { ok: false, error: "unauthorized" });

  const wrong = await handleDailyFollowUpCron({
    authorization: "Bearer not-the-secret",
    secret: "cron-test-secret",
  });
  assert.equal(wrong.status, 401);
  assert.deepEqual(wrong.body, { ok: false, error: "unauthorized" });

  let loads = 0;
  const rejected = await handleDailyFollowUpCron({
    authorization: null,
    secret: "cron-test-secret",
    load: async () => {
      loads += 1;
      return { status: "found", due: [] };
    },
  });
  assert.equal(rejected.status, 401);
  assert.equal(loads, 0);

  const failed = await handleDailyFollowUpCron({
    authorization: "Bearer cron-test-secret",
    secret: "cron-test-secret",
    load: async () => ({ status: "failed" }),
  });
  assert.equal(failed.status, 502);
  assert.deepEqual(failed.body, { ok: false, error: "followups_due_failed" });
});

test("an authorized run surfaces the due list twice without writing or sending", async () => {
  let loads = 0;
  const load = async () => {
    loads += 1;
    return { status: "found", due: DUE };
  };
  const input = {
    authorization: "Bearer cron-test-secret",
    secret: "cron-test-secret",
    now: new Date("2026-11-06T14:00:00Z"),
    load,
  };
  const first = await handleDailyFollowUpCron(input);
  const second = await handleDailyFollowUpCron(input);
  assert.equal(loads, 2);
  assert.equal(first.status, 200);
  assert.deepEqual(first, second);
  assert.equal(first.body.ok, true);
  assert.equal(first.body.runKey, "followups:2026-11-06");
  assert.equal(first.body.writes, 0);
  assert.equal(first.body.clientMessages, 0);
  assert.equal(first.body.count, 1);
  assert.equal(first.body.due[0].reference, "MT-TEST-DUE");
  assert.equal(DUE.length, 1);

  const previousDb = process.env.ERM_DATABASE_URL;
  const previousFallback = process.env.ERM_DATABASE_DATABASE_URL;
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  const noDb = await handleDailyFollowUpCron({
    authorization: "Bearer cron-test-secret",
    secret: "cron-test-secret",
    now: new Date("2026-11-06T14:00:00Z"),
  });
  assert.equal(noDb.status, 503);
  assert.deepEqual(noDb.body, { ok: false, error: "not_configured" });
  if (previousDb === undefined) delete process.env.ERM_DATABASE_URL;
  else process.env.ERM_DATABASE_URL = previousDb;
  if (previousFallback === undefined) delete process.env.ERM_DATABASE_DATABASE_URL;
  else process.env.ERM_DATABASE_DATABASE_URL = previousFallback;
});
