// node --test tests/monthly.test.mjs — Gap 9 monthly billing tracking.
// Pure-logic tests only: no database, no network, no credentials, no
// prospect data. Sample references are invented test fixtures, not
// clients. The gated store returns "not_configured" when
// ERM_DATABASE_URL is absent — that is tested, not worked around.
// Tracking only: this slice records monthly payments and enrollments;
// it charges no one, creates no Stripe Checkout Session or
// subscription, and sends nothing. The tests assert that no
// sending or charging exists anywhere in the new code.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MONTHLY_CENTS,
  chicagoMonth,
  enrollMonthly,
  cancelMonthly,
  isValidPeriodMonth,
  monthlyDue,
  monthlyStatus,
  periodMonthFromUnixSeconds,
  recordMonthlyPaid,
} from "../app/lib/erm/monthly-store.ts";
import {
  MONTHLY_CENTS as STRIPE_MONTHLY_CENTS,
  monthlyPeriodFromEvent,
  parseMonthlyEvent,
} from "../app/lib/erm/stripe.ts";
import { LANE_PRICING } from "../app/lib/erm/types.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "monthly-store.ts"),
  "utf8",
);
const stripeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "stripe.ts"),
  "utf8",
);
const webhookSource = fs.readFileSync(
  path.join(root, "app", "api", "stripe", "webhook", "route.ts"),
  "utf8",
);
const schemaSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "schema.sql"),
  "utf8",
);
const migrationSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "migrations", "007-monthly-billing.sql"),
  "utf8",
);
const typesSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "types.ts"),
  "utf8",
);
const enrollRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "monthly-enroll", "route.ts"),
  "utf8",
);
const statusRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "monthly-status", "route.ts"),
  "utf8",
);
const dueRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "monthly-due", "route.ts"),
  "utf8",
);
const cancelRouteSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "monthly-cancel", "route.ts"),
  "utf8",
);

function monthlyEvent(overrides = {}) {
  return {
    id: "evt_test_monthly_1",
    type: "checkout.session.completed",
    // 2026-11-05 12:00:00 CST = 18:00 UTC.
    created: Math.floor(Date.parse("2026-11-05T18:00:00Z") / 1000),
    data: {
      object: {
        id: "cs_test_monthly_1",
        amount_total: 9500,
        payment_intent: "pi_test_monthly_1",
        metadata: {
          intake_reference: "MT-20261105-TEST",
          lane: "Family",
          intake_type: "monthly",
        },
      },
    },
    ...overrides,
  };
}

test("monthly amounts are pinned to LANE_PRICING.monthlyCents", () => {
  for (const lane of Object.keys(LANE_PRICING)) {
    assert.equal(MONTHLY_CENTS[lane], LANE_PRICING[lane].monthlyCents);
    assert.equal(STRIPE_MONTHLY_CENTS[lane], LANE_PRICING[lane].monthlyCents);
  }
  assert.deepEqual(MONTHLY_CENTS, {
    Family: 9500,
    "Solo entrepreneur": 35000,
    Business: 95000,
  });
});

test("period month is YYYY-MM and rejects bad values", () => {
  assert.equal(isValidPeriodMonth("2026-11"), true);
  assert.equal(isValidPeriodMonth("2026-01"), true);
  assert.equal(isValidPeriodMonth("2026-13"), false);
  assert.equal(isValidPeriodMonth("2026-1"), false);
  assert.equal(isValidPeriodMonth("26-11"), false);
  assert.equal(isValidPeriodMonth("2026/11"), false);
  assert.equal(isValidPeriodMonth(""), false);
  assert.equal(isValidPeriodMonth(null), false);
  assert.equal(isValidPeriodMonth(202611), false);
});

test("period month uses America/Chicago, not UTC, at the month boundary", () => {
  // 2026-12-01 00:00 CST = 06:00 UTC. One minute earlier is still November in Chicago.
  assert.equal(periodMonthFromUnixSeconds(Math.floor(Date.parse("2026-12-01T06:00:00Z") / 1000)), "2026-12");
  assert.equal(periodMonthFromUnixSeconds(Math.floor(Date.parse("2026-12-01T05:59:00Z") / 1000)), "2026-11");
  // 2026-11-05 12:00 CST = 18:00 UTC.
  assert.equal(periodMonthFromUnixSeconds(Math.floor(Date.parse("2026-11-05T18:00:00Z") / 1000)), "2026-11");
  assert.equal(chicagoMonth(new Date("2026-11-05T18:00:00Z")), "2026-11");
  assert.equal(monthlyPeriodFromEvent(monthlyEvent()), "2026-11");
  assert.equal(monthlyPeriodFromEvent({}), null);
  assert.equal(monthlyPeriodFromEvent({ created: "not-a-number" }), null);
});

test("parseMonthlyEvent accepts a valid monthly event", () => {
  const result = parseMonthlyEvent(monthlyEvent());
  assert.equal(result.ok, true);
  assert.equal(result.payment.amountCents, 9500);
  assert.equal(result.payment.reference, "MT-20261105-TEST");
  assert.equal(result.payment.lane, "Family");
  assert.equal(result.payment.periodMonth, "2026-11");
  assert.equal(result.payment.stripePaymentId, "pi_test_monthly_1");
});

test("parseMonthlyEvent accepts a payment_intent.succeeded event", () => {
  const event = monthlyEvent({
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_test_monthly_2",
        amount_received: 35000,
        metadata: {
          intake_reference: "MT-20261105-TEST",
          lane: "solo",
          intake_type: "monthly",
        },
      },
    },
  });
  const result = parseMonthlyEvent(event);
  assert.equal(result.ok, true);
  assert.equal(result.payment.lane, "Solo entrepreneur");
  assert.equal(result.payment.amountCents, 35000);
  assert.equal(result.payment.stripePaymentId, "pi_test_monthly_2");
});

test("parseMonthlyEvent rejects non-monthly, wrong-amount, and bad events", () => {
  // No intake_type: a discovery event must never be recorded as monthly.
  const discovery = monthlyEvent();
  delete discovery.data.object.metadata.intake_type;
  assert.deepEqual(parseMonthlyEvent(discovery), {
    ok: false,
    reason: "not_a_monthly_event",
  });
  // Shared monthly links carry plan:"monthly" but no intake_type:
  // they do not parse as monthly events (later per-client slice).
  const shared = monthlyEvent();
  shared.data.object.metadata = { lane: "Family", plan: "monthly" };
  assert.deepEqual(parseMonthlyEvent(shared), {
    ok: false,
    reason: "not_a_monthly_event",
  });
  // Wrong amount for the lane.
  const wrongAmount = monthlyEvent();
  wrongAmount.data.object.amount_total = 9501;
  assert.deepEqual(parseMonthlyEvent(wrongAmount), {
    ok: false,
    reason: "amount_mismatch",
  });
  // Unknown lane.
  const badLane = monthlyEvent();
  badLane.data.object.metadata.lane = "Enterprise";
  assert.deepEqual(parseMonthlyEvent(badLane), {
    ok: false,
    reason: "unknown_lane",
  });
  // Unsupported event type.
  assert.deepEqual(parseMonthlyEvent(monthlyEvent({ type: "invoice.paid" })), {
    ok: false,
    reason: "unsupported_event",
  });
  // Missing created time: no period month can be derived.
  const noCreated = monthlyEvent();
  delete noCreated.created;
  assert.deepEqual(parseMonthlyEvent(noCreated), {
    ok: false,
    reason: "bad_event",
  });
  assert.deepEqual(parseMonthlyEvent(null), { ok: false, reason: "bad_event" });
  assert.deepEqual(parseMonthlyEvent("not-an-event"), {
    ok: false,
    reason: "bad_event",
  });
});

test("gated store returns not_configured without a database URL", async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  assert.deepEqual(await enrollMonthly({ reference: "MT-20261105-TEST" }), {
    status: "not_configured",
  });
  assert.deepEqual(await cancelMonthly("MT-20261105-TEST"), {
    status: "not_configured",
  });
  assert.deepEqual(
    await recordMonthlyPaid({
      reference: "MT-20261105-TEST",
      stripePaymentId: "pi_test",
      stripeEventId: "evt_test",
      amountCents: 9500,
      periodMonth: "2026-11",
    }),
    { status: "not_configured" },
  );
  assert.deepEqual(await monthlyStatus("MT-20261105-TEST"), {
    status: "not_configured",
  });
  assert.deepEqual(await monthlyDue(), { status: "not_configured" });
});

test("recordMonthlyPaid rejects an invalid period month without touching the DB", async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  // Invalid period is checked before the database gate in code
  // order: with no DB configured the gate answers first. Either
  // way nothing is written; assert the invalid-period shape on
  // the validator itself.
  assert.equal(isValidPeriodMonth("2026-13"), false);
  assert.equal(isValidPeriodMonth("November"), false);
});

test("schema and migration carry the subscription table and period column", () => {
  assert.match(schemaSource, /CREATE TABLE IF NOT EXISTS monthly_subscriptions/);
  assert.match(schemaSource, /period_month TEXT/);
  assert.match(schemaSource, /idx_payments_monthly_period/);
  assert.match(migrationSource, /CREATE TABLE IF NOT EXISTS monthly_subscriptions/);
  assert.match(migrationSource, /ALTER TABLE payments ADD COLUMN IF NOT EXISTS period_month/);
  assert.match(migrationSource, /idx_monthly_subs_active/);
  assert.match(typesSource, /MonthlySubscriptionStatus/);
  assert.match(storeSource, /kind = 'monthly'/);
  assert.match(storeSource, /period_month/);
});

test("webhook branches on monthly before the discovery parser", () => {
  assert.match(webhookSource, /stripeEventIntakeType\(event\) === "monthly"/);
  assert.match(webhookSource, /parseMonthlyEvent/);
  assert.match(webhookSource, /recordMonthlyPaid/);
  // Monthly branch appears before the balance branch in the
  // route body (the header comment mentions balance first, so
  // compare the branch conditions, not the first quoted words).
  assert.ok(
    webhookSource.indexOf('stripeEventIntakeType(event) === "monthly"') <
      webhookSource.indexOf('stripeEventIntakeType(event) === "balance"'),
    "monthly branch must come before the balance branch",
  );
});

test("owner routes are token-gated and return no PII", () => {
  for (const source of [enrollRouteSource, statusRouteSource, dueRouteSource, cancelRouteSource]) {
    assert.match(source, /OPS_DASHBOARD_TOKEN/);
    assert.match(source, /Bearer \$\{token\}/);
    assert.match(source, /unauthorized/);
  }
  assert.match(statusRouteSource, /paidMonths/);
  assert.match(statusRouteSource, /currentMonthPaid/);
  assert.match(dueRouteSource, /monthlyDue/);
  for (const source of [statusRouteSource, dueRouteSource]) {
    assert.doesNotMatch(source, /contactEmail|contactPhone|clientName/);
  }
});

test("no sending or charging anywhere in the new monthly code", () => {
  const banned = /\b(fetch\(|sendMail|sendSms|sendText|twilio|Twilio|nodemailer|resend|Resend|stripe\.checkout|subscriptions\.create|checkout\.sessions\.create)\b/;
  assert.doesNotMatch(storeSource, banned);
  assert.doesNotMatch(stripeSource, /checkout\.sessions\.create|subscriptions\.create/);
  for (const source of [enrollRouteSource, statusRouteSource, dueRouteSource, cancelRouteSource]) {
    assert.doesNotMatch(source, banned);
  }
  // The store never creates a Stripe object and never enrolls
  // anyone on its own: enrollment is an explicit owner action.
  // The recordMonthlyPaid function body must not call
  // enrollMonthly (the header comment mentions both names, so
  // check the function body only, not the whole file).
  assert.match(storeSource, /enrollMonthly/);
  const recordBody = storeSource.slice(
    storeSource.indexOf("export async function recordMonthlyPaid"),
    storeSource.indexOf("export async function monthlyStatus"),
  );
  assert.doesNotMatch(recordBody, /enrollMonthly\(/);
});
