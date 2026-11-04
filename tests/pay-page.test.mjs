// node --test tests/pay-page.test.mjs — /pay surfacing slice (PR #30).
// Pure-logic + page/button source-shape tests only: no database, no
// network, no live Stripe, no secrets, no prospect data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatDollars, formatMonthly, PAY_PRICING, resolvePayState } from '../app/lib/erm/pay.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageSource = fs.readFileSync(path.join(root, 'app', 'pay', 'page.tsx'), 'utf8');
const buttonSource = fs.readFileSync(path.join(root, 'app', 'components', 'PayDiscoveryButton.tsx'), 'utf8');
const typesSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'types.ts'), 'utf8');

test('amounts are exactly the approved lane discovery/program totals, pinned to LANE_PRICING', () => {
  assert.match(typesSource, /Family: \{[^}]*discoveryCents: 15000[^}]*totalCents: 165000[^}]*afterCreditCents: 150000[^}]*monthlyCents: 9500/s);
  assert.match(typesSource, /"Solo entrepreneur": \{[^}]*discoveryCents: 50000[^}]*totalCents: 550000[^}]*afterCreditCents: 500000[^}]*monthlyCents: 35000/s);
  assert.match(typesSource, /Business: \{[^}]*discoveryCents: 100000[^}]*totalCents: 1000000[^}]*afterCreditCents: 900000[^}]*monthlyCents: 95000/s);
  assert.equal(PAY_PRICING.Family.discoveryCents, 15000);
  assert.equal(PAY_PRICING['Solo entrepreneur'].discoveryCents, 50000);
  assert.equal(PAY_PRICING.Business.discoveryCents, 100000);
  assert.equal(formatDollars(15000), '$150');
  assert.equal(formatDollars(1000000), '$10,000');
  assert.equal(formatMonthly(9500), '$95/mo');
});

test('state decision: invalid and not-found leak nothing, paid blocks the button, unavailable blocks the button', () => {
  assert.equal(resolvePayState(false, 'not-found', false), 'invalid');
  assert.equal(resolvePayState(true, 'not-found', false), 'not-found');
  assert.equal(resolvePayState(true, 'not-found', true), 'not-found');
  assert.equal(resolvePayState(true, 'found', true), 'paid');
  assert.equal(resolvePayState(true, 'found', false), 'unpaid');
  assert.equal(resolvePayState(true, 'unavailable', false), 'unavailable');
  assert.equal(resolvePayState(true, 'unavailable', true), 'unavailable');
});

test('unpaid reference renders pay button with correct lane amount; paid reference renders paid state, no button', () => {
  // The button is rendered only inside the unpaid (lane) branch.
  assert.match(pageSource, /state === "paid" \?/);
  assert.match(pageSource, /Discovery already paid/);
  assert.match(pageSource, /book-discovery/);
  assert.match(pageSource, /<PayDiscoveryButton reference=\{reference\}/);
  // Paid branch contains no PayDiscoveryButton.
  const paidBranch = pageSource.split('state === "paid"')[1].split(': lane ?')[0];
  assert.doesNotMatch(paidBranch, /PayDiscoveryButton/);
});

test('unknown/invalid reference renders not-found, no checkout call, no intake details', () => {
  assert.match(pageSource, /Reference not found/);
  assert.match(pageSource, /MT-YYYYMMDD-XXXX/);
  const notFoundBranch = pageSource.split('state === "invalid"')[1].split(': state === "unavailable"')[0];
  assert.doesNotMatch(notFoundBranch, /PayDiscoveryButton|paymentStatus|intakeLane/);
  assert.doesNotMatch(pageSource, /contactEmail|contactPhone|clientName/);
});

test('button flow calls checkout with the reference only, redirects to Stripe URL, no card fields, no amount/lane inputs', () => {
  assert.match(buttonSource, /fetch\("\/api\/stripe\/checkout"/);
  assert.match(buttonSource, /body: JSON\.stringify\(\{ reference \}\)/);
  assert.match(buttonSource, /window\.location\.href = data\.url/);
  // No amount, lane, or card data leaves the button: the POST body is
  // the reference alone (comments may mention "lane" as the server's
  // source of truth, so assert on the body shape, not the word).
  assert.doesNotMatch(buttonSource, /JSON\.stringify\(\{ reference, /);
  assert.doesNotMatch(buttonSource, /CardElement|<input|<select/);
  assert.doesNotMatch(pageSource, /<input|<select|amountCents|setLane|onChange/);
});

test('page uses intake lane as source of truth and success/cancel flow is unchanged', () => {
  assert.match(pageSource, /intakeLane\(reference\)/);
  assert.match(pageSource, /paymentStatus\(reference\)/);
  // Checkout endpoint owns success/cancel URLs; /pay links only to the
  // next step and back to acceptance, matching that flow.
  assert.match(pageSource, /\/book-discovery/);
  assert.match(pageSource, /\/accept-agreement/);
  assert.doesNotMatch(pageSource, /STRIPE_SECRET_KEY|OPS_DASHBOARD_TOKEN/);
});
