// node --test tests/stripe-gap3.test.mjs — Gap 3: Stripe discovery
// payment linkage. Pure-logic + gated-store tests only: no database,
// no network, no Stripe account, no secrets, no prospect data. All
// Stripe payloads below are invented test fixtures, not real events.
// The gated store returns "not_configured" when ERM_DATABASE_URL is
// absent — that is tested, not worked around.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import {
  verifyStripeSignature, parseDiscoveryEvent, DISCOVERY_CENTS, normalizeLane,
} from '../app/lib/erm/stripe.ts';
import { recordDiscoveryPayment, paymentStatus } from '../app/lib/erm/payment-store.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webhookSource = fs.readFileSync(path.join(root, 'app', 'api', 'stripe', 'webhook', 'route.ts'), 'utf8');
const storeSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'payment-store.ts'), 'utf8');
const statusSource = fs.readFileSync(path.join(root, 'app', 'api', 'ops', 'payment-status', 'route.ts'), 'utf8');

const SECRET = 'whsec_test_only_not_a_real_secret';
const NOW = 1793750000;

function sign(payload, secret = SECRET, timestamp = NOW) {
  const sig = createHmac('sha256', secret).update(`${timestamp}.${payload}`, 'utf8').digest('hex');
  return `t=${timestamp},v1=${sig}`;
}

function checkoutEvent({ id = 'evt_test_1', session = 'cs_test_1', paymentIntent = 'pi_test_1', amount = 15000, reference = 'MT-20261103-TEST', lane = 'Family' } = {}) {
  return {
    id, type: 'checkout.session.completed',
    data: { object: { id: session, payment_intent: paymentIntent, amount_total: amount, metadata: { intake_reference: reference, lane } } },
  };
}

test('lane discovery amounts are exactly the approved fees in cents', () => {
  // Pin the stripe.ts literals to the LANE_PRICING table in types.ts.
  const typesSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'types.ts'), 'utf8');
  assert.match(typesSource, /Family: \{[^}]*discoveryCents: 15000/s);
  assert.match(typesSource, /"Solo entrepreneur": \{[^}]*discoveryCents: 50000/s);
  assert.match(typesSource, /Business: \{[^}]*discoveryCents: 100000/s);
  assert.equal(DISCOVERY_CENTS.Family, 15000);
  assert.equal(DISCOVERY_CENTS['Solo entrepreneur'], 50000);
  assert.equal(DISCOVERY_CENTS.Business, 100000);
  assert.equal(normalizeLane('Solo'), 'Solo entrepreneur');
  assert.equal(normalizeLane('Solo entrepreneur'), 'Solo entrepreneur');
  assert.equal(normalizeLane('Unknown'), null);
});

test('lane normalization is case-insensitive: shared-link lowercase lanes are accepted, not unknown_lane', () => {
  // Shared Stripe payment links carry lane lowercase ("family" / "solo" /
  // "business"); the pre-fix case-sensitive check rejected every such
  // payment with unknown_lane. Fixtures are invented, not real events.
  assert.equal(normalizeLane('family'), 'Family');
  assert.equal(normalizeLane('Family'), 'Family');
  assert.equal(normalizeLane('FAMILY'), 'Family');
  assert.equal(normalizeLane('  family  '), 'Family');
  assert.equal(normalizeLane('solo'), 'Solo entrepreneur');
  assert.equal(normalizeLane('Solo'), 'Solo entrepreneur');
  assert.equal(normalizeLane('business'), 'Business');
  assert.equal(normalizeLane('BUSINESS'), 'Business');
  assert.equal(normalizeLane('Platinum'), null);
  assert.equal(normalizeLane(''), null);
  assert.equal(normalizeLane(null), null);
  assert.equal(normalizeLane(123), null);
});

test('parse: lowercase shared-link lane with no intake_reference parses ok with null reference (unlinked path)', () => {
  // Mirrors a shared-link checkout.session.completed payload: lane
  // lowercase, no intake_reference. It must parse ok with reference
  // null (so the store records it as unlinked), not unknown_lane.
  // This fixture is invented; it is NOT the Nov 2 refunded test event
  // and must never be recorded as a paid discovery record.
  const event = checkoutEvent({ id: 'evt_test_lowercase', amount: 15000, lane: 'family' });
  delete event.data.object.metadata.intake_reference;
  const parsed = parseDiscoveryEvent(event);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.payment.lane, 'Family');
  assert.equal(parsed.payment.amountCents, 15000);
  assert.equal(parsed.payment.reference, null);
});

test('signature verification: valid passes, tampered/wrong/old/missing fail', () => {
  const payload = JSON.stringify(checkoutEvent());
  assert.equal(verifyStripeSignature(payload, sign(payload), SECRET, NOW), true);
  assert.equal(verifyStripeSignature(payload + ' ', sign(payload), SECRET, NOW), false);
  assert.equal(verifyStripeSignature(payload, sign(payload, 'whsec_other'), SECRET, NOW), false);
  assert.equal(verifyStripeSignature(payload, sign(payload, SECRET, NOW - 301), SECRET, NOW), false);
  assert.equal(verifyStripeSignature(payload, sign(payload, SECRET, NOW - 300), SECRET, NOW), true);
  assert.equal(verifyStripeSignature(payload, null, SECRET, NOW), false);
  assert.equal(verifyStripeSignature(payload, sign(payload), '', NOW), false);
  // Multiple v1 values: one valid is enough (Stripe rotates signatures).
  const valid = sign(payload).split('v1=')[1];
  assert.equal(verifyStripeSignature(payload, `t=${NOW},v1=deadbeef,v1=${valid}`, SECRET, NOW), true);
});

test('parse: checkout.session.completed maps Family/Solo/Business amounts', () => {
  const family = parseDiscoveryEvent(checkoutEvent());
  assert.equal(family.ok, true);
  assert.equal(family.payment.stripePaymentId, 'pi_test_1');
  assert.equal(family.payment.amountCents, 15000);
  assert.equal(family.payment.reference, 'MT-20261103-TEST');
  assert.equal(family.payment.lane, 'Family');
  const solo = parseDiscoveryEvent(checkoutEvent({ id: 'evt_test_2', amount: 50000, lane: 'Solo entrepreneur' }));
  assert.equal(solo.ok, true);
  assert.equal(solo.payment.amountCents, 50000);
  const business = parseDiscoveryEvent(checkoutEvent({ id: 'evt_test_3', amount: 100000, lane: 'Business' }));
  assert.equal(business.ok, true);
  assert.equal(business.payment.amountCents, 100000);
});

test('parse: payment_intent.succeeded uses amount_received and intent id', () => {
  const event = { id: 'evt_test_pi', type: 'payment_intent.succeeded', data: { object: { id: 'pi_test_9', amount_received: 50000, metadata: { intake_reference: 'MT-20261103-TEST', lane: 'Solo' } } } };
  const parsed = parseDiscoveryEvent(event);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.payment.stripePaymentId, 'pi_test_9');
  assert.equal(parsed.payment.lane, 'Solo entrepreneur');
});

test('parse: amount mismatch, unknown lane, unsupported event are rejected, never recorded', () => {
  assert.deepEqual(parseDiscoveryEvent(checkoutEvent({ amount: 14999 })), { ok: false, reason: 'amount_mismatch' });
  assert.deepEqual(parseDiscoveryEvent(checkoutEvent({ lane: 'Platinum' })), { ok: false, reason: 'unknown_lane' });
  assert.deepEqual(parseDiscoveryEvent({ id: 'evt_x', type: 'invoice.paid', data: { object: {} } }), { ok: false, reason: 'unsupported_event' });
  assert.deepEqual(parseDiscoveryEvent({ type: 'checkout.session.completed' }), { ok: false, reason: 'bad_event' });
});

test('parse: missing reference is preserved as null (unlinked path), not invented', () => {
  const event = checkoutEvent({ reference: undefined });
  delete event.data.object.metadata.intake_reference;
  const parsed = parseDiscoveryEvent(event);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.payment.reference, null);
});

test('gated store: no database configured returns not_configured, never throws', async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  const parsed = parseDiscoveryEvent(checkoutEvent());
  assert.equal(parsed.ok, true);
  assert.deepEqual(await recordDiscoveryPayment(parsed.payment), { status: 'not_configured' });
  assert.deepEqual(await paymentStatus('MT-20261103-TEST'), { status: 'not_configured' });
});

test('idempotency is enforced in code on stripe_payment_id and stripe_event_id', () => {
  assert.match(storeSource, /WHERE stripe_payment_id = \$1/);
  assert.match(storeSource, /WHERE stripe_event_id = \$1/);
  assert.match(storeSource, /already_exists/);
  assert.match(storeSource, /stripe_payment_id TEXT UNIQUE|stripe_payment_id/);
});

test('unknown-reference handling: unlinked insert, no invented intake, no status rewrite', () => {
  assert.match(storeSource, /intake_reference/);
  assert.match(storeSource, /linked = false|linked, false/);
  assert.match(storeSource, /unlinked_not_stored/);
  assert.doesNotMatch(storeSource, /INSERT INTO clients/);
  assert.doesNotMatch(storeSource, /UPDATE intakes/);
});

test('webhook route: signature-checked, secret from env only, no SDK charge path', () => {
  assert.match(webhookSource, /stripe-signature/);
  assert.match(webhookSource, /STRIPE_WEBHOOK_SECRET/);
  assert.match(webhookSource, /invalid_signature/);
  assert.match(webhookSource, /already_exists/);
  assert.doesNotMatch(webhookSource, /whsec_/);
  assert.doesNotMatch(webhookSource, /paymentIntents\.create|checkout\.sessions\.create|refunds\.create/);
  assert.match(webhookSource, /raw/);
});

test('owner payment-status route: token-gated, one reference only, no client data', () => {
  assert.match(statusSource, /OPS_DASHBOARD_TOKEN/);
  assert.match(statusSource, /unauthorized/);
  assert.match(statusSource, /reference/);
  assert.doesNotMatch(statusSource, /contact_email|answers/);
});
