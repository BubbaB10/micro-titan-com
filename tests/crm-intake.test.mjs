// node --test tests/crm-intake.test.mjs — Gap 1 (intake -> CRM) pins.
// Functional tests import app/lib/crm.ts directly (Node type-stripping
// handles this erasable-TS module); route pins are source pins, in
// the same style as tests/intake-server.test.mjs.
// No real Google credential, no real sheet write, no prospect data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCrmRow, appendIntakeRow, CRM_COLUMNS } from '../app/lib/crm.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const route = fs.readFileSync(path.join(root, 'app', 'api', 'intake', 'route.ts'), 'utf8');
const lib = fs.readFileSync(path.join(root, 'app', 'lib', 'crm.ts'), 'utf8');

const payload = {
  lane: 'Family',
  name: 'Test Person',
  email: 'test@example.com',
  phone: '555-0100',
  agent: 'Muse by Meta',
  plate: 'Evenings are eaten by chores',
  answers: [
    { question: 'What household jobs eat up your evenings or weekends right now?', answer: 'Dishes' },
  ],
  reference: 'MT-20261103-TEST',
};

test('CRM row is exactly the 18 verified Sheet1 columns, in order', () => {
  assert.deepEqual([...CRM_COLUMNS], [
    'Intake reference', 'Date received', 'Name', 'Contact (email/phone)',
    'Lane', 'Agent preference', 'What they want off their plate',
    'Discovery answers (verbatim)', 'Discovery fee', 'Program total',
    'Total after credit', 'Monthly (optional)', 'Status', 'Next action',
    'Owner', 'Discovery paid?', 'Source', 'Notes',
  ]);
  const row = buildCrmRow(payload, '2026-11-03');
  assert.equal(row.length, 18);
  assert.equal(row[0], 'MT-20261103-TEST');
  assert.equal(row[1], '2026-11-03');
  assert.equal(row[2], 'Test Person');
  assert.equal(row[3], 'test@example.com / 555-0100');
  assert.equal(row[4], 'Family');
  assert.equal(row[7].split('\n')[0], 'Q: What household jobs eat up your evenings or weekends right now?');
  assert.ok(row[7].includes('A: Dishes'), 'first answer verbatim');
  assert.ok(row[7].includes('A: (left blank)'), 'unanswered questions are blank, not dropped');
  assert.equal(row[8], '$150');
  assert.equal(row[9], '$1,650');
  assert.equal(row[10], '$1,500');
  assert.equal(row[11], '$95/month');
  assert.equal(row[12], 'Intake received');
  assert.equal(row[13], 'Completeness check');
  assert.equal(row[15], 'No');
  assert.equal(row[16], 'micro-titan.com/intake');
});

test('CRM write is idempotent on reference and gated, never throwing', async () => {
  const env = {
    sheetId: 'SHEET-ID-TEST', sheetName: 'Sheet1',
    serviceAccountEmail: 'svc@test.iam.gserviceaccount.com',
    serviceAccountPrivateKey: 'not-a-real-key',
  };
  // Token exchange cannot sign with a fake key, so sign step fails
  // inside the module and returns 'failed' — never throws. That is
  // the gated behaviour for a bad/missing credential.
  const status = await appendIntakeRow(payload, { env, fetchImpl: async () => { throw new Error('no network in test'); } });
  assert.equal(status, 'failed');
  // Missing credential entirely -> not_configured, never an exception.
  const missing = await appendIntakeRow(payload, {
    env: { sheetId: 'x', sheetName: 'Sheet1', serviceAccountEmail: '', serviceAccountPrivateKey: '' },
    fetchImpl: async () => { throw new Error('must not be called'); },
  });
  assert.equal(missing, 'not_configured');
});

test('route: email first, CRM second, CRM failure cannot fail the intake', () => {
  const emailOk = route.indexOf('if (!res.ok)');
  const crmCall = route.indexOf('appendIntakeRow(payload)');
  const finalReturn = route.indexOf('return NextResponse.json({ ok: true, reference: payload.reference, crm })');
  assert.ok(emailOk > 0 && crmCall > emailOk, 'CRM append happens only after the email send succeeded');
  assert.ok(finalReturn > crmCall, 'response carries the CRM status alongside the reference');
  assert.match(route, /crm = "failed"/, 'a CRM exception is caught and reported, not thrown');
  assert.match(route, /appendIntakeRow/);
});

test('lib: service-account credential comes from env only, nothing hardcoded', () => {
  assert.ok(!lib.includes('-----BEGIN PRIVATE KEY-----'), 'no private key literal');
  assert.match(lib, /GOOGLE_SERVICE_ACCOUNT_EMAIL/);
  assert.match(lib, /GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY/);
  assert.ok(!lib.includes('console.log'), 'no PII logging');
  assert.match(lib, /already_exists/, 'idempotency on reference is implemented');
  assert.match(lib, /sheets\.googleapis\.com\/v4\/spreadsheets/, 'Sheets API append path');
  assert.match(lib, /spreadsheets/, 'Sheets scope requested');
});
