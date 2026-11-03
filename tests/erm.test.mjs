// node --test tests/erm.test.mjs — own CRM/ERM first-slice pins.
// Pure-logic tests only: no database, no network, no credentials,
// no prospect data. The gated store returns "not_configured" when
// ERM_DATABASE_URL is absent — that is tested, not worked around.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canTransitionIntake, canTransitionJob, LANE_PRICING,
  ADDITIONAL_JOB_RANGE_CENTS, nextQueuePosition,
  queueWeekForPosition, CAPACITY_JOBS_PER_WEEK,
} from '../app/lib/erm/types.ts';
import { recordIntake, ownerSummary } from '../app/lib/erm/store.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const route = fs.readFileSync(path.join(root, 'app', 'api', 'intake', 'route.ts'), 'utf8');
const schema = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'schema.sql'), 'utf8');

test('intake status machine: pitch must precede agreement, payment must precede booking', () => {
  assert.equal(canTransitionIntake('received', 'completeness_check'), true);
  assert.equal(canTransitionIntake('completeness_check', 'pitch_sent'), true);
  assert.equal(canTransitionIntake('pitch_sent', 'agreed'), true);
  assert.equal(canTransitionIntake('agreed', 'discovery_paid'), true);
  assert.equal(canTransitionIntake('discovery_paid', 'discovery_booked'), true);
  // Skips are rejected, not stored.
  assert.equal(canTransitionIntake('received', 'agreed'), false);
  assert.equal(canTransitionIntake('received', 'discovery_paid'), false);
  assert.equal(canTransitionIntake('pitch_sent', 'discovery_booked'), false);
  assert.equal(canTransitionIntake('closed', 'received'), false);
});

test('job status machine: queued -> in_progress -> delivered -> proof -> closed', () => {
  assert.equal(canTransitionJob('queued', 'in_progress'), true);
  assert.equal(canTransitionJob('in_progress', 'delivered'), true);
  assert.equal(canTransitionJob('delivered', 'proof'), true);
  assert.equal(canTransitionJob('proof', 'closed'), true);
  assert.equal(canTransitionJob('queued', 'delivered'), false);
  assert.equal(canTransitionJob('delivered', 'queued'), false);
});

test('lane pricing matches approved totals (cents)', () => {
  assert.deepEqual(LANE_PRICING.Family, { discoveryCents: 15000, setupCents: 75000, firstCents: 75000, totalCents: 165000, afterCreditCents: 150000, monthlyCents: 9500 });
  assert.equal(LANE_PRICING['Solo entrepreneur'].discoveryCents, 50000);
  assert.equal(LANE_PRICING['Solo entrepreneur'].totalCents, 550000);
  assert.equal(LANE_PRICING.Business.discoveryCents, 100000);
  assert.equal(LANE_PRICING.Business.totalCents, 1000000);
  assert.deepEqual(ADDITIONAL_JOB_RANGE_CENTS.Family, [35000, 75000]);
  assert.deepEqual(ADDITIONAL_JOB_RANGE_CENTS['Solo entrepreneur'], [150000, 350000]);
  assert.deepEqual(ADDITIONAL_JOB_RANGE_CENTS.Business, [350000, 650000]);
});

test('job queue: next position is max+1, 10/week capacity groups weeks', () => {
  assert.equal(nextQueuePosition([]), 1);
  assert.equal(nextQueuePosition([1, 2, 3]), 4);
  assert.equal(CAPACITY_JOBS_PER_WEEK, 10);
  assert.equal(queueWeekForPosition(1), 1);
  assert.equal(queueWeekForPosition(10), 1);
  assert.equal(queueWeekForPosition(11), 2);
});

test('gated store: no DATABASE_URL means not_configured, never an exception', async () => {
  delete process.env.ERM_DATABASE_URL;
  const r = await recordIntake({ reference: 'MT-20261103-TEST', lane: 'Family', name: 'Test Person', email: 'test@example.com', phone: '', agent: 'Muse by Meta', plate: 'Test', answers: [] });
  assert.equal(r.status, 'not_configured');
  const s = await ownerSummary();
  assert.equal(s.status, 'not_configured');
});

test('schema: unique reference, unique stripe payment, all nine entities, audit table', () => {
  assert.match(schema, /reference TEXT NOT NULL UNIQUE/);
  assert.match(schema, /stripe_payment_id TEXT UNIQUE/);
  for (const t of ['clients', 'intakes', 'pitch_sheets', 'agreements', 'payments', 'bookings', 'jobs', 'audit_log', 'compliance_deadlines']) {
    assert.ok(schema.includes(`CREATE TABLE IF NOT EXISTS ${t}`), `missing table ${t}`);
  }
  assert.ok(!schema.includes('UPDATE audit_log') && !schema.includes('DELETE FROM audit_log'), 'audit log is insert-only in schema');
});

test('store: no hardcoded credential, env var only; route: no Sheet call', () => {
  const store = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'store.ts'), 'utf8');
  assert.match(store, /ERM_DATABASE_URL/);
  assert.ok(!store.includes('postgres://') && !store.includes('postgresql://'), 'no connection string literal');
  assert.ok(!route.includes('appendIntakeRow(payload)'), 'intake route does not call the Sheet writer');
  assert.match(route, /recordIntake\(payload\)/);
});

test('route: a recorded intake counts even if the backup email fails', () => {
  assert.match(route, /email === "failed" && erm !== "written"/, '502 only when neither the database nor the email recorded the intake');
});
