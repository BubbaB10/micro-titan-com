// node --test tests/monthly-checkout.test.mjs — P0 item 3: per-client
// monthly Checkout Sessions.
// Pure-logic tests only: no database, no network, no credentials, no
// prospect data, no charge. Sample references are invented test
// fixtures, not clients. The shared monthly payment links carry
// {lane, plan: "monthly"} with no intake_type and no
// intake_reference, so a shared-link monthly payment does NOT parse
// as a monthly event and cannot be linked to a client — this slice
// (mirroring the Gap 5 balance-checkout slice, PR #36) creates a
// per-client session whose metadata links both event types the
// webhook handles. A payment never enrolls a client: enrollment
// stays an explicit owner action (POST /api/ops/monthly-enroll).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MONTHLY_CHECKOUT_CENTS,
  buildMonthlyCheckoutSessionParams,
  monthlyMetadata,
} from "../app/lib/erm/monthly-checkout.ts";
import {
  MONTHLY_CENTS as STRIPE_MONTHLY_CENTS,
  monthlyPeriodFromEvent,
  parseMonthlyEvent,
} from "../app/lib/erm/stripe.ts";
import { MONTHLY_CENTS as STORE_MONTHLY_CENTS } from "../app/lib/erm/monthly-store.ts";
import { LANE_PRICING } from "../app/lib/erm/types.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "monthly-checkout.ts"),
  "utf8",
);
const routeSource = fs.readFileSync(
  path.join(root, "app", "api", "stripe", "monthly-checkout", "route.ts"),
  "utf8",
);

const REF = "MT-20261106-TEST";

test("Amounts: monthly checkout cents pinned to LANE_PRICING.monthlyCents, stripe.ts, and monthly-store.ts", () => {
  for (const lane of ["Family", "Solo entrepreneur", "Business"]) {
    assert.equal(MONTHLY_CHECKOUT_CENTS[lane], LANE_PRICING[lane].monthlyCents);
    assert.equal(MONTHLY_CHECKOUT_CENTS[lane], STRIPE_MONTHLY_CENTS[lane]);
    assert.equal(MONTHLY_CHECKOUT_CENTS[lane], STORE_MONTHLY_CENTS[lane]);
  }
  assert.deepEqual(MONTHLY_CHECKOUT_CENTS, {
    Family: 9500,
    "Solo entrepreneur": 35000,
    Business: 95000,
  });
});

test("Metadata: intake_reference + lane + intake_type=monthly", () => {
  assert.deepEqual(monthlyMetadata(REF, "Family"), {
    intake_reference: REF,
    lane: "Family",
    intake_type: "monthly",
  });
  assert.deepEqual(monthlyMetadata(REF, "Solo entrepreneur"), {
    intake_reference: REF,
    lane: "Solo entrepreneur",
    intake_type: "monthly",
  });
});

test("Session params: payment mode, pinned amount, metadata on session AND PaymentIntent", () => {
  for (const lane of ["Family", "Solo entrepreneur", "Business"]) {
    const params = buildMonthlyCheckoutSessionParams(REF, lane, "https://micro-titan.com");
    assert.equal(params.mode, "payment");
    assert.equal(params["line_items[0][price_data][unit_amount]"], String(LANE_PRICING[lane].monthlyCents));
    assert.equal(params["line_items[0][price_data][currency]"], "usd");
    assert.equal(params["line_items[0][quantity]"], "1");
    assert.equal(
      params["line_items[0][price_data][product_data][name]"],
      `Micro Titan Monthly Operate Plan — ${lane}`,
    );
    assert.equal(params["metadata[intake_reference]"], REF);
    assert.equal(params["metadata[lane]"], lane);
    assert.equal(params["metadata[intake_type]"], "monthly");
    assert.equal(params["payment_intent_data[metadata][intake_reference]"], REF);
    assert.equal(params["payment_intent_data[metadata][lane]"], lane);
    assert.equal(params["payment_intent_data[metadata][intake_type]"], "monthly");
    assert.equal(params["success_url"], "https://micro-titan.com/?monthly=paid");
    assert.equal(params["cancel_url"], "https://micro-titan.com/");
  }
});

test("Session params: no caller-supplied amount — the builder takes reference, lane, siteUrl only", () => {
  assert.ok(
    libSource.includes(
      "buildMonthlyCheckoutSessionParams(\n  reference: string,\n  lane: MonthlyLane,\n  siteUrl: string,",
    ),
  );
  assert.ok(!/amountCents|amount_cents/.test(libSource.split("MONTHLY_CHECKOUT_CENTS")[1] ?? ""));
});

test("Webhook path: a session built here parses as a monthly event (both event types)", () => {
  // A checkout.session.completed for a Family monthly session, created
  // 2026-11-06 18:40 America/Chicago.
  const params = buildMonthlyCheckoutSessionParams(REF, "Family", "https://micro-titan.com");
  const sessionEvent = {
    id: "evt_test_monthly_session",
    type: "checkout.session.completed",
    created: 1794012000,
    data: {
      object: {
        id: "cs_test_monthly",
        payment_intent: "pi_test_monthly",
        amount_total: Number(params["line_items[0][price_data][unit_amount]"]),
        metadata: {
          intake_reference: params["metadata[intake_reference]"],
          lane: params["metadata[lane]"],
          intake_type: params["metadata[intake_type]"],
        },
      },
    },
  };
  const parsed = parseMonthlyEvent(sessionEvent);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.payment.reference, REF);
    assert.equal(parsed.payment.lane, "Family");
    assert.equal(parsed.payment.amountCents, 9500);
    assert.equal(parsed.payment.periodMonth, "2026-11");
    assert.equal(parsed.payment.periodMonth, monthlyPeriodFromEvent(sessionEvent));
  }
  // A payment_intent.succeeded carries the same metadata via
  // payment_intent_data.metadata.
  const piEvent = {
    id: "evt_test_monthly_pi",
    type: "payment_intent.succeeded",
    created: 1794012000,
    data: {
      object: {
        id: "pi_test_monthly",
        amount_received: 9500,
        metadata: {
          intake_reference: params["payment_intent_data[metadata][intake_reference]"],
          lane: params["payment_intent_data[metadata][lane]"],
          intake_type: params["payment_intent_data[metadata][intake_type]"],
        },
      },
    },
  };
  const parsedPi = parseMonthlyEvent(piEvent);
  assert.equal(parsedPi.ok, true);
  if (parsedPi.ok) {
    assert.equal(parsedPi.payment.stripePaymentId, "pi_test_monthly");
    assert.equal(parsedPi.payment.periodMonth, "2026-11");
  }
});

test("Webhook path: a shared-link monthly payment still does NOT parse as monthly", () => {
  const sharedLinkEvent = {
    id: "evt_test_shared_monthly",
    type: "checkout.session.completed",
    created: 1794012000,
    data: {
      object: {
        id: "cs_test_shared",
        payment_intent: "pi_test_shared",
        amount_total: 9500,
        metadata: { lane: "family", plan: "monthly" },
      },
    },
  };
  const parsed = parseMonthlyEvent(sharedLinkEvent);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.equal(parsed.reason, "not_a_monthly_event");
});

test("Route: requires an existing intake, lane must match, no caller amount", () => {
  assert.ok(routeSource.includes("isValidReference(b.reference)"));
  assert.ok(routeSource.includes("intakeLane(reference)"));
  assert.ok(routeSource.includes('error: "intake_not_found"'));
  assert.ok(routeSource.includes('error: "lane_mismatch"'));
  assert.ok(routeSource.includes("normalizeCheckoutLane(b.lane)"));
  // The amount is never read from the body.
  assert.ok(!/b\.amount/.test(routeSource));
  assert.ok(routeSource.includes("MONTHLY_CHECKOUT_CENTS[lane]"));
});

test("Route: one monthly payment per intake per month — current month paid returns 409, creates nothing", () => {
  assert.ok(routeSource.includes("monthlyStatus(reference)"));
  assert.ok(routeSource.includes("currentMonthPaid"));
  assert.ok(routeSource.includes('error: "monthly_already_paid"'));
  assert.ok(routeSource.includes("status: 409"));
});

test("Route: a payment never enrolls a client — no enrollment call anywhere in this slice", () => {
  assert.ok(!routeSource.includes("enrollMonthly"));
  assert.ok(!libSource.includes("enrollMonthly"));
  assert.ok(!routeSource.includes("monthly_enrolled"));
});

test("Route: rate limit 5/IP/15 min, secret from env only, Stripe errors never echoed", () => {
  assert.ok(routeSource.includes("RATE_MAX = 5"));
  assert.ok(routeSource.includes("RATE_WINDOW_MS = 15 * 60 * 1000"));
  assert.ok(routeSource.includes("process.env.STRIPE_SECRET_KEY"));
  assert.ok(routeSource.includes('error: "checkout_not_configured"'));
  assert.ok(routeSource.includes('error: "stripe_error"'));
  assert.ok(!/console\.log\(.*secret|STRIPE_SECRET_KEY.*log/.test(routeSource));
  assert.ok(routeSource.includes("createCheckoutSession(params, secret, fetch)"));
});

test("Route: no charge, no subscription, no send, no intake/status change", () => {
  assert.ok(!/subscriptions\.create|paymentLinks\.create|payment_links/.test(routeSource));
  assert.ok(!/resend|sendgrid|twilio|sendEmail|sendText/i.test(routeSource));
  assert.ok(!/INSERT INTO intakes|INSERT INTO clients/.test(routeSource));
  assert.ok(!/UPDATE intakes/.test(routeSource));
});
