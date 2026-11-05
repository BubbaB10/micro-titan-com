// node --test tests/agreement-erm.test.mjs — ERM agreement logging (Gap 2, second half).
// The acceptance page has been live since PR #22, but the route sent an
// email only. From this slice, a site acceptance also writes one
// Agreements row + one AuditLog row, idempotent by intake reference.
// No live database is used here: DB tests are gated (not_configured)
// and the rest are source pins + pure status-machine checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storeSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'agreement-store.ts'), 'utf8');
const routeSource = fs.readFileSync(path.join(root, 'app', 'api', 'agreement', 'route.ts'), 'utf8');
const statusSource = fs.readFileSync(path.join(root, 'app', 'api', 'ops', 'agreement-status', 'route.ts'), 'utf8');
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

test('Store: idempotent by intake — an existing agreement returns already_exists, no duplicate', () => {
  assert.ok(storeSource.includes('already_exists'));
  assert.ok(storeSource.includes('SELECT id, accepted_at FROM agreements WHERE intake_id'));
  assert.ok(!/UPDATE agreements/.test(storeSource));
  assert.ok(!/DELETE FROM agreements/.test(storeSource));
});

test('Store: one agreement row + one audit row, lane totals from LANE_PRICING (cents), never client totals', () => {
  assert.ok(storeSource.includes('INSERT INTO agreements'));
  assert.ok(storeSource.includes('INSERT INTO audit_log'));
  assert.ok(storeSource.includes('input.discoveryCents'));
  assert.ok(storeSource.includes('input.totalCents'));
  assert.ok(storeSource.includes("action, from_status, to_status, reference"));
  assert.ok(storeSource.includes("'agreement_accepted'"));
  assert.ok(!/UPDATE audit_log/.test(storeSource));
  assert.ok(!/DELETE FROM audit_log/.test(storeSource));
});

test('Store: intake status advances to agreed only when the status machine allows it', () => {
  // INTAKE_TRANSITIONS (types.ts): "agreed" is reachable only from "pitch_sent".
  assert.ok(storeSource.includes('currentStatus === "pitch_sent"'));
  assert.ok(storeSource.includes('"agreed"'));
});

test('Store: owner status returns lane + accepted date only — no name, no signature, no contact', () => {
  assert.ok(storeSource.includes('SELECT a.lane, a.accepted_at, a.method'));
  const statusFn = storeSource.slice(storeSource.indexOf('export async function agreementStatus'));
  assert.ok(!/signature_text|contact_email|contact_phone/.test(statusFn));
});

test('Route: email send is unchanged and still first; ERM result is reported, never hidden', () => {
  assert.ok(routeSource.includes('recordAgreement'));
  assert.ok(routeSource.includes('api.resend.com/emails'));
  assert.ok(routeSource.includes('erm: erm.status'));
  // A missing/failed ERM write never turns a sent acceptance into a failure:
  // both ERM branches after the email send return ok: true.
  assert.equal((routeSource.match(/ok: true,\n\s+reference: payload\.reference,\n\s+erm: erm\.status/g) || []).length, 2);
  // Lane totals passed to the store are cents from this route's approved pricing.
  assert.ok(routeSource.includes('discoveryCents: totals.discovery * 100'));
});

test('Route: acceptance is still recorded, not claimed as a legal e-signature', () => {
  assert.ok(routeSource.includes('NOT a legal e-signature'));
  assert.ok(!routeSource.includes('legal e-signature. Acceptance is captured by this email plus a row in the Micro Titan CRM Agreements tab'));
});

test('Owner check: token-gated, one reference only, no PII in the response', () => {
  assert.ok(statusSource.includes('OPS_DASHBOARD_TOKEN'));
  assert.ok(statusSource.includes('unauthorized'));
  assert.ok(statusSource.includes('bad_reference'));
  assert.ok(!statusSource.includes('signatureText'));
  assert.ok(!statusSource.includes('signature_text'));
  assert.ok(!statusSource.includes('contact_email'));
  assert.ok(!statusSource.includes('contact_phone'));
});

test('Schema: agreements table exists with the columns the store writes', () => {
  assert.ok(schemaSource.includes('CREATE TABLE IF NOT EXISTS agreements'));
  for (const col of ['intake_id', 'client_id', 'lane', 'discovery_cents', 'total_cents', 'after_credit_cents', 'monthly_cents', 'method', 'signature_text', 'accepted_at']) {
    assert.ok(schemaSource.includes(col), `schema missing ${col}`);
  }
});

test('DB gate: without ERM_DATABASE_URL, recordAgreement and agreementStatus return not_configured and never throw', async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  const { recordAgreement, agreementStatus } = await import('../app/lib/erm/agreement-store.ts');
  const recorded = await recordAgreement({ reference: 'MT-20261105-TEST', lane: 'Family', signatureText: '', method: 'site', discoveryCents: 15000, totalCents: 165000, afterCreditCents: 150000, monthlyCents: 9500 });
  assert.equal(recorded.status, 'not_configured');
  const status = await agreementStatus('MT-20261105-TEST');
  assert.equal(status.status, 'not_configured');
});

test('Status machine: pitch_sent can go to agreed, received cannot', async () => {
  const { canTransitionIntake } = await import('../app/lib/erm/types.ts');
  assert.equal(canTransitionIntake('pitch_sent', 'agreed'), true);
  assert.equal(canTransitionIntake('received', 'agreed'), false);
  assert.equal(canTransitionIntake('agreed', 'discovery_paid'), true);
});
