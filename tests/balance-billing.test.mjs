// node --test tests/balance-billing.test.mjs — Gap 5 billing step:
// issue a balance on agreement of scope, build the Stripe Checkout
// Session for it, and record it paid via the webhook. Pure-logic +
// gated-store tests only: no database, no network, no Stripe
// account, no secrets, no prospect data. All Stripe payloads below
// are invented test fixtures, not real events. The gated stores
// return "not_configured" when ERM_DATABASE_URL is absent — that is
// tested, not worked around. No test in this file charges anything.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BALANCE_CENTS,
  parseBalanceEvent,
  parseDiscoveryEvent,
  stripeEventIntakeType,
} from '../app/lib/erm/stripe.ts';
import {
  BALANCE_CHECKOUT_CENTS,
  balanceMetadata,
  buildBalanceCheckoutSessionParams,
} from '../app/lib/erm/balance-checkout.ts';
import { BALANCE_CENTS as STORE_BALANCE_CENTS } from '../app/lib/erm/balance-store.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webhookSource = fs.readFileSync(path.join(root, 'app', 'api', 'stripe', 'webhook', 'route.ts'), 'utf8');
const routeSource = fs.readFileSync(path.join(root, 'app', 'api', 'stripe', 'balance-checkout', 'route.ts'), 'utf8');

function balanceCheckoutEvent({ id = 'evt_test_bal_1', session = 'cs_test_bal_1', paymentIntent = 'pi_test_bal_1', amount = 150000, reference = 'MT-20261103-TEST', lane = 'Family' } = {}) {
  return {
    id, type: 'checkout.session.completed',
    data: { object: { id: session, payment_intent: paymentIntent, amount_total: amount, metadata: { intake_reference: reference, lane, intake_type: 'balance' } } },
  };
}

function balanceIntentEvent({ id = 'evt_test_bal_2', paymentIntent = 'pi_test_bal_2', amount = 500000, reference = 'MT-20261103-TEST', lane = 'Solo entrepreneur' } = {}) {
  return {
    id, type: 'payment_intent.succeeded',
    data: { object: { id: paymentIntent, amount_received: amount, metadata: { intake_reference: reference, lane, intake_type: 'balance' } } },
  };
}

test('balance amounts are exactly the approved after-credit totals in cents', () => {
  const typesSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'types.ts'), 'utf8');
  // Pin the stripe.ts and balance-checkout.ts literals to LANE_PRICING.
  for (const [lane, cents] of [['Family', 150000], ['Solo entrepreneur', 500000], ['Business', 900000]]) {
    assert.equal(BALANCE_CENTS[lane], cents);
    assert.equal(BALANCE_CHECKOUT_CENTS[lane], cents);
    assert.equal(STORE_BALANCE_CENTS[lane], cents);
    assert.ok(typesSource.includes(`afterCreditCents: ${cents}`), `types.ts pins ${lane} afterCreditCents ${cents}`);
  }
  // Balance amounts are the totals minus the discovery fee, not a new price.
  assert.equal(BALANCE_CENTS.Family, 165000 - 15000);
  assert.equal(BALANCE_CENTS['Solo entrepreneur'], 550000 - 50000);
  assert.equal(BALANCE_CENTS.Business, 1000000 - 100000);
});

test('balance session params carry intake_type=balance on session and PaymentIntent, exact amount', () => {
  const params = buildBalanceCheckoutSessionParams('MT-20261103-TEST', 'Solo entrepreneur', 'https://micro-titan.com');
  assert.equal(params['metadata[intake_reference]'], 'MT-20261103-TEST');
  assert.equal(params['metadata[lane]'], 'Solo entrepreneur');
  assert.equal(params['metadata[intake_type]'], 'balance');
  assert.equal(params['payment_intent_data[metadata][intake_type]'], 'balance');
  assert.equal(params['payment_intent_data[metadata][intake_reference]'], 'MT-20261103-TEST');
  assert.equal(params['line_items[0][price_data][unit_amount]'], '500000');
  assert.equal(params['line_items[0][price_data][product_data][name]'], 'Micro Titan Program Balance — Solo entrepreneur');
  assert.equal(params.mode, 'payment');
  assert.deepEqual(balanceMetadata('MT-20261103-TEST', 'Family'), { intake_reference: 'MT-20261103-TEST', lane: 'Family', intake_type: 'balance' });
});

test('stripeEventIntakeType reads intake_type, defaults to null when absent', () => {
  assert.equal(stripeEventIntakeType(balanceCheckoutEvent()), 'balance');
  const discovery = { id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: 'cs_1', payment_intent: 'pi_1', amount_total: 15000, metadata: { intake_reference: 'MT-20261103-TEST', lane: 'Family', intake_type: 'discovery' } } } };
  assert.equal(stripeEventIntakeType(discovery), 'discovery');
  const noType = { id: 'evt_2', type: 'checkout.session.completed', data: { object: { id: 'cs_2', payment_intent: 'pi_2', amount_total: 15000, metadata: { intake_reference: 'MT-20261103-TEST', lane: 'Family' } } } };
  assert.equal(stripeEventIntakeType(noType), null);
});

test('parseBalanceEvent accepts a balance checkout.session.completed with the exact balance', () => {
  const parsed = parseBalanceEvent(balanceCheckoutEvent());
  assert.equal(parsed.ok, true);
  assert.equal(parsed.payment.amountCents, 150000);
  assert.equal(parsed.payment.reference, 'MT-20261103-TEST');
  assert.equal(parsed.payment.lane, 'Family');
  assert.equal(parsed.payment.stripePaymentId, 'pi_test_bal_1');
});

test('parseBalanceEvent accepts a balance payment_intent.succeeded', () => {
  const parsed = parseBalanceEvent(balanceIntentEvent());
  assert.equal(parsed.ok, true);
  assert.equal(parsed.payment.amountCents, 500000);
  assert.equal(parsed.payment.lane, 'Solo entrepreneur');
});

test('parseBalanceEvent rejects a discovery event and a wrong amount', () => {
  const discovery = { id: 'evt_3', type: 'checkout.session.completed', data: { object: { id: 'cs_3', payment_intent: 'pi_3', amount_total: 15000, metadata: { intake_reference: 'MT-20261103-TEST', lane: 'Family', intake_type: 'discovery' } } } };
  const notBalance = parseBalanceEvent(discovery);
  assert.equal(notBalance.ok, false);
  assert.equal(notBalance.reason, 'not_a_balance_event');
  const wrongAmount = parseBalanceEvent(balanceCheckoutEvent({ amount: 100000 }));
  assert.equal(wrongAmount.ok, false);
  assert.equal(wrongAmount.reason, 'amount_mismatch');
  const unknownLane = parseBalanceEvent(balanceCheckoutEvent({ lane: 'Nobody' }));
  assert.equal(unknownLane.ok, false);
  assert.equal(unknownLane.reason, 'unknown_lane');
});

test('a discovery event is never parsed as a balance, and a balance event is never parsed as discovery', () => {
  const discovery = { id: 'evt_4', type: 'checkout.session.completed', data: { object: { id: 'cs_4', payment_intent: 'pi_4', amount_total: 15000, metadata: { intake_reference: 'MT-20261103-TEST', lane: 'Family', intake_type: 'discovery' } } } };
  assert.equal(parseDiscoveryEvent(discovery).ok, true);
  assert.equal(parseBalanceEvent(discovery).ok, false);
  const balance = balanceCheckoutEvent();
  assert.equal(parseBalanceEvent(balance).ok, true);
  // The discovery parser rejects the balance amount — that is why the
  // webhook must branch on intake_type before parsing either type.
  assert.equal(parseDiscoveryEvent(balance).ok, false);
  assert.equal(parseDiscoveryEvent(balance).reason, 'amount_mismatch');
});

test('webhook branches on intake_type=balance before discovery parsing and records via recordBalancePaid', () => {
  assert.ok(webhookSource.includes("stripeEventIntakeType(event) === \"balance\""), 'webhook branches on intake_type');
  assert.ok(webhookSource.includes('parseBalanceEvent(event)'), 'webhook parses balance events');
  assert.ok(webhookSource.includes('recordBalancePaid('), 'webhook records balance payments');
  assert.ok(webhookSource.includes('parseDiscoveryEvent(event)'), 'discovery path still present');
  // A balance with an unknown reference is rejected, never unlinked.
  assert.ok(webhookSource.includes('intake_not_found'), 'unknown balance reference returns intake_not_found');
});

test('balance-checkout route gates on scope agreement, discovery paid, and one paid balance', () => {
  assert.ok(routeSource.includes('scopeAgreed !== true'), 'scopeAgreed must be true');
  assert.ok(routeSource.includes('scope_not_agreed'), 'missing scope agreement is a 400');
  assert.ok(routeSource.includes('paymentStatus(reference)'), 'discovery-paid gate is checked');
  assert.ok(routeSource.includes('discovery_unpaid'), 'unpaid discovery is rejected');
  assert.ok(routeSource.includes('balance_already_paid'), 'an already-paid balance creates nothing');
  assert.ok(routeSource.includes('issueBalance({ reference, lane })'), 'balance is issued via the PR #35 store');
  assert.ok(routeSource.includes('buildBalanceCheckoutSessionParams'), 'session built from the balance module');
  assert.ok(routeSource.includes('createCheckoutSession(params, secret, fetch)'), 'session created via the shared Stripe helper');
  assert.ok(routeSource.includes('balanceStatus(reference)'), 'existing balance is checked before issuing');
  // No caller-supplied amount: the route never reads an amount from the body.
  assert.ok(!routeSource.includes('b.amount'), 'route takes no amount from the caller');
  // Setup is not started here: the route never writes an intake status.
  assert.ok(!routeSource.includes('UPDATE intakes'), 'route does not update intake status');
  assert.ok(!routeSource.includes("to_status"), 'route writes no status transition');
});
