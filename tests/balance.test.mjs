// node --test tests/balance.test.mjs — ERM balance billing plumbing (Gap 5, record shape only).
// The balance is the program total minus the discovery credit:
// Family $1,500 / Solo $5,000 / Business $9,000. This slice records
// and tracks it in the existing payments table (kind "balance") and
// gives the owner a check. It does NOT decide when the balance is
// due, create a Checkout Session, charge anything, or send anything.
// No live database is used here: DB tests are gated (not_configured)
// and the rest are source pins + pricing checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storeSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'balance-store.ts'), 'utf8');
const statusSource = fs.readFileSync(path.join(root, 'app', 'api', 'ops', 'balance-status', 'route.ts'), 'utf8');
const schemaSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'schema.sql'), 'utf8');

test('Store: gated on ERM_DATABASE_URL or the Neon fallback, never throws', () => {
  assert.ok(storeSource.includes('ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL'));
  assert.ok(storeSource.includes('return { status: "not_configured" }'));
});

test('Store: never creates a client or an intake; unknown reference writes nothing', () => {
  assert.ok(storeSource.includes('intake_not_found'));
  assert.ok(!/INSERT INTO clients/.test(storeSource));
  assert.ok(!/INSERT INTO intakes/.test(storeSource));
});

test('Store: amount is never caller-supplied — issue uses BALANCE_CENTS, paid refuses a wrong amount', () => {
  assert.ok(storeSource.includes('BALANCE_CENTS[input.lane]'));
  assert.ok(storeSource.includes('input.amountCents !== BALANCE_CENTS[lane]'));
  assert.ok(storeSource.includes('amount_mismatch'));
  // No amount comes in on the issue input at all.
  assert.ok(!/amountCents/.test(storeSource.slice(storeSource.indexOf('export interface IssueBalanceInput'), storeSource.indexOf('export type IssueBalanceResult'))));
});

test('Store: one balance row per intake — issue returns already_exists, paid never makes a second row', () => {
  assert.ok(storeSource.includes("kind = 'balance'"));
  assert.ok(storeSource.includes('already_exists'));
  assert.ok(!/DELETE FROM payments/.test(storeSource));
});

test('Store: paid is idempotent by Stripe payment id and event id, like the discovery payment store', () => {
  assert.ok(storeSource.includes('stripe_payment_id = $1'));
  assert.ok(storeSource.includes('stripe_event_id = $1'));
});

test('Store: a pending row moves to paid by setting only status, paid_at and Stripe ids — amount never changes', () => {
  const paidFn = storeSource.slice(storeSource.indexOf('export async function recordBalancePaid'));
  assert.ok(paidFn.includes("SET status = 'paid', paid_at = now()"));
  assert.ok(!/amount_cents =/.test(paidFn));
  assert.ok(!/status = 'pending'/.test(paidFn.slice(paidFn.indexOf("SET status = 'paid'"))));
});

test('Store: one audit row per issue and per payment, insert-only', () => {
  assert.ok(storeSource.includes("'balance_issued'"));
  assert.ok(storeSource.includes("'balance_paid'"));
  assert.ok(storeSource.includes('INSERT INTO audit_log'));
  assert.ok(!/UPDATE audit_log/.test(storeSource));
  assert.ok(!/DELETE FROM audit_log/.test(storeSource));
});

test('Store: does NOT change intake status — when the balance is due is the owner\'s undecided call', () => {
  assert.ok(!/UPDATE intakes/.test(storeSource));
});

test('Store: no Stripe session, no charge, no send in this slice', () => {
  assert.ok(!storeSource.includes('stripe.checkout'));
  assert.ok(!storeSource.includes('Checkout Session'));
  assert.ok(!storeSource.includes('fetch('));
});

test('Owner check: token-gated, one reference only, no PII and no Stripe ids in the response', () => {
  assert.ok(statusSource.includes('OPS_DASHBOARD_TOKEN'));
  assert.ok(statusSource.includes('unauthorized'));
  assert.ok(statusSource.includes('bad_reference'));
  assert.ok(!statusSource.includes('stripePaymentId'));
  assert.ok(!statusSource.includes('stripe_payment_id'));
  assert.ok(!statusSource.includes('contact_email'));
  assert.ok(!statusSource.includes('contact_phone'));
});

test('Schema: payments table already carries kind balance — no new table, no new migration in this slice', () => {
  assert.ok(schemaSource.includes("kind IN ('discovery', 'balance', 'monthly')"));
  assert.ok(!schemaSource.includes('balance_payments'));
});

test('Pricing: after-credit balances are Family $1,500 / Solo $5,000 / Business $9,000, and BALANCE_CENTS never drifts from LANE_PRICING', async () => {
  const { LANE_PRICING } = await import('../app/lib/erm/types.ts');
  const { BALANCE_CENTS } = await import('../app/lib/erm/balance-store.ts');
  assert.equal(LANE_PRICING.Family.afterCreditCents, 150000);
  assert.equal(LANE_PRICING['Solo entrepreneur'].afterCreditCents, 500000);
  assert.equal(LANE_PRICING.Business.afterCreditCents, 900000);
  for (const lane of ['Family', 'Solo entrepreneur', 'Business']) {
    assert.equal(BALANCE_CENTS[lane], LANE_PRICING[lane].afterCreditCents, `BALANCE_CENTS drift for ${lane}`);
  }
});

test('DB gate: without ERM_DATABASE_URL, issueBalance, recordBalancePaid and balanceStatus return not_configured and never throw', async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  const { issueBalance, recordBalancePaid, balanceStatus } = await import('../app/lib/erm/balance-store.ts');
  const issued = await issueBalance({ reference: 'MT-20261105-TEST', lane: 'Family' });
  assert.equal(issued.status, 'not_configured');
  const paid = await recordBalancePaid({ reference: 'MT-20261105-TEST', stripePaymentId: 'pi_test', stripeEventId: 'evt_test', amountCents: 150000 });
  assert.equal(paid.status, 'not_configured');
  const status = await balanceStatus('MT-20261105-TEST');
  assert.equal(status.status, 'not_configured');
});
