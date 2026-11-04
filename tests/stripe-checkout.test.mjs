// node --test tests/stripe-checkout.test.mjs — Gap 3 follow-up: per-client
// Stripe Checkout Sessions. Pure-logic + route-shape tests only: no
// database, no network, no live Stripe, no secrets, no prospect data.
// The Stripe API call is tested through an injected fake fetch that
// captures the request; it never leaves this process.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCheckoutSessionParams, CHECKOUT_CENTS, createCheckoutSession,
  discoveryMetadata, isValidReference, normalizeCheckoutLane,
} from '../app/lib/erm/checkout.ts';
import { intakeLane } from '../app/lib/erm/checkout-store.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routeSource = fs.readFileSync(path.join(root, 'app', 'api', 'stripe', 'checkout', 'route.ts'), 'utf8');
const storeSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'checkout-store.ts'), 'utf8');

test('amounts are exactly the approved discovery fees, pinned to LANE_PRICING', () => {
  const typesSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'types.ts'), 'utf8');
  assert.match(typesSource, /Family: \{[^}]*discoveryCents: 15000/s);
  assert.match(typesSource, /"Solo entrepreneur": \{[^}]*discoveryCents: 50000/s);
  assert.match(typesSource, /Business: \{[^}]*discoveryCents: 100000/s);
  assert.equal(CHECKOUT_CENTS.Family, 15000);
  assert.equal(CHECKOUT_CENTS['Solo entrepreneur'], 50000);
  assert.equal(CHECKOUT_CENTS.Business, 100000);
});

test('reference validation matches the intake format MT-YYYYMMDD-XXXX', () => {
  assert.equal(isValidReference('MT-20261103-TEST'), true);
  assert.equal(isValidReference('MT-20261103-AB12'), true);
  assert.equal(isValidReference('MT-20261103-test'), false);
  assert.equal(isValidReference('MT-2026113-TEST'), false);
  assert.equal(isValidReference('not-a-reference'), false);
  assert.equal(isValidReference(''), false);
  assert.equal(isValidReference(null), false);
  assert.equal(isValidReference(123), false);
});

test('lane normalization accepts Solo alias, rejects unknowns', () => {
  assert.equal(normalizeCheckoutLane('Family'), 'Family');
  assert.equal(normalizeCheckoutLane('Solo'), 'Solo entrepreneur');
  assert.equal(normalizeCheckoutLane('Solo entrepreneur'), 'Solo entrepreneur');
  assert.equal(normalizeCheckoutLane('Business'), 'Business');
  assert.equal(normalizeCheckoutLane('Monthly'), null);
  assert.equal(normalizeCheckoutLane(''), null);
});

test('lane normalization is case-insensitive, consistent with stripe.ts normalizeLane', () => {
  assert.equal(normalizeCheckoutLane('family'), 'Family');
  assert.equal(normalizeCheckoutLane('FAMILY'), 'Family');
  assert.equal(normalizeCheckoutLane('solo'), 'Solo entrepreneur');
  assert.equal(normalizeCheckoutLane('business'), 'Business');
  assert.equal(normalizeCheckoutLane('BUSINESS'), 'Business');
  assert.equal(normalizeCheckoutLane('  solo  '), 'Solo entrepreneur');
  assert.equal(normalizeCheckoutLane(null), null);
  assert.equal(normalizeCheckoutLane(123), null);
});

test('session params carry intake_reference + lane + intake_type on BOTH session and PaymentIntent metadata', () => {
  for (const [lane, cents] of [['Family', 15000], ['Solo entrepreneur', 50000], ['Business', 100000]]) {
    const p = buildCheckoutSessionParams('MT-20261103-TEST', lane, 'https://micro-titan.com/');
    assert.equal(p.mode, 'payment');
    // Session metadata (what checkout.session.completed carries).
    assert.equal(p['metadata[intake_reference]'], 'MT-20261103-TEST');
    assert.equal(p['metadata[lane]'], lane);
    assert.equal(p['metadata[intake_type]'], 'discovery');
    // PaymentIntent metadata (what payment_intent.succeeded carries) — the PI gap fix.
    assert.equal(p['payment_intent_data[metadata][intake_reference]'], 'MT-20261103-TEST');
    assert.equal(p['payment_intent_data[metadata][lane]'], lane);
    assert.equal(p['payment_intent_data[metadata][intake_type]'], 'discovery');
    // Amount + product, exact cents, no price-ID dependency.
    assert.equal(p['line_items[0][price_data][unit_amount]'], String(cents));
    assert.equal(p['line_items[0][price_data][currency]'], 'usd');
    assert.equal(p['line_items[0][quantity]'], '1');
    assert.equal(p['line_items[0][price_data][product_data][name]'], `Micro Titan Discovery — ${lane}`);
    assert.equal(p['success_url'], 'https://micro-titan.com/book-discovery');
    assert.equal(p['cancel_url'], 'https://micro-titan.com/accept-agreement');
  }
  // Trailing slash on the site URL is stripped, never doubled.
  const p = buildCheckoutSessionParams('MT-20261103-TEST', 'Family', 'https://micro-titan.com///');
  assert.equal(p['success_url'], 'https://micro-titan.com/book-discovery');
  // Metadata helper agrees with the params.
  assert.deepEqual(discoveryMetadata('MT-20261103-TEST', 'Family'), { intake_reference: 'MT-20261103-TEST', lane: 'Family', intake_type: 'discovery' });
});

test('createCheckoutSession posts form-encoded to Stripe and returns only id + url', async () => {
  let captured = null;
  const fakeFetch = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, json: async () => ({ id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' }) };
  };
  const params = buildCheckoutSessionParams('MT-20261103-TEST', 'Family', 'https://micro-titan.com');
  const res = await createCheckoutSession(params, 'sk_test_only_not_a_real_secret', fakeFetch);
  assert.equal(res.ok, true);
  assert.equal(res.sessionId, 'cs_test_123');
  assert.equal(res.url, 'https://checkout.stripe.com/pay/cs_test_123');
  assert.equal(captured.url, 'https://api.stripe.com/v1/checkout/sessions');
  assert.equal(captured.opts.method, 'POST');
  assert.equal(captured.opts.headers.Authorization, 'Bearer sk_test_only_not_a_real_secret');
  assert.equal(captured.opts.headers['Content-Type'], 'application/x-www-form-urlencoded');
  const body = new URLSearchParams(captured.opts.body);
  assert.equal(body.get('metadata[intake_reference]'), 'MT-20261103-TEST');
  assert.equal(body.get('payment_intent_data[metadata][lane]'), 'Family');
  assert.equal(body.get('line_items[0][price_data][unit_amount]'), '15000');
  // The secret is used only as the Bearer token — never in the body or URL.
  assert.equal(captured.opts.body.includes('sk_test_only'), false);
  assert.equal(captured.url.includes('sk_test_only'), false);
});

test('createCheckoutSession collapses Stripe errors and bad responses, never echoes them', async () => {
  const params = buildCheckoutSessionParams('MT-20261103-TEST', 'Family', 'https://micro-titan.com');
  const failing = async () => ({ ok: false, json: async () => ({ error: { message: 'acct_secret_leak_test' } }) });
  assert.deepEqual(await createCheckoutSession(params, 'sk_test_x', failing), { ok: false, error: 'stripe_error' });
  const badJson = async () => ({ ok: true, json: async () => ({ id: 'cs_test_1' }) });
  assert.deepEqual(await createCheckoutSession(params, 'sk_test_x', badJson), { ok: false, error: 'bad_response' });
  const throwing = async () => { throw new Error('network down'); };
  assert.deepEqual(await createCheckoutSession(params, 'sk_test_x', throwing), { ok: false, error: 'stripe_error' });
});

test('unknown reference, lane mismatch, and missing secret are handled by the route shape', () => {
  // Route source checks (the route itself needs Next + a database to run
  // end to end, so its status mapping is pinned here, same pattern as
  // the Gap 3 webhook route tests).
  assert.match(routeSource, /intake_not_found.*404/s);
  assert.match(routeSource, /lane_mismatch.*400/s);
  assert.match(routeSource, /checkout_not_configured.*503/s);
  assert.match(routeSource, /erm_not_configured.*503/s);
  assert.match(routeSource, /STRIPE_SECRET_KEY/);
  assert.match(routeSource, /process\.env\.STRIPE_SECRET_KEY/);
  // No secret is hardcoded, no card data is touched, no charge call exists.
  assert.doesNotMatch(routeSource, /sk_live|sk_test_[A-Za-z0-9]{10,}/);
  assert.doesNotMatch(routeSource, /payment_method|card_number|createPayment|charges\.create/);
  // Rate limit + body cap mirror the pitch route.
  assert.match(routeSource, /RATE_MAX = 5/);
  assert.match(routeSource, /MAX_BODY_BYTES = 64 \* 1024/);
  // The intake lane is the source of truth; a caller lane is only compared.
  assert.match(routeSource, /requestedLane !== null && requestedLane !== lane/);
});

test('intake lane lookup is gated: no database configured returns not_configured, never throws', async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  const res = await intakeLane('MT-20261103-TEST');
  assert.deepEqual(res, { status: 'not_configured' });
  // Read-only: one SELECT on intakes by reference, no writes, no creation.
  assert.match(storeSource, /SELECT lane FROM intakes WHERE reference = \$1/);
  assert.doesNotMatch(storeSource, /INSERT INTO|UPDATE |DELETE FROM/);
});
