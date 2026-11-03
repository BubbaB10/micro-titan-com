// node --test tests/agreement-server.test.mjs — server-side acceptance pins.
// Mirrors tests/intake-server.test.mjs (merged PR #20) and
// tests/book-discovery-server.test.mjs (merged PR #21). Source pins guard
// the invariants that must not regress in review:
//   · destination is hello@micro-titan.com, never another address;
//   · no API key is ever hardcoded or committed;
//   · validation, honeypot, rate limit and size limit are present;
//   · lane totals are derived server-side, never trusted from the client;
//   · the mailto fallback survives alongside the one-tap send;
//   · acceptance is never claimed as a legal e-signature;
//   · no CRM auto-write.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const route = fs.readFileSync(path.join(root, 'app', 'api', 'agreement', 'route.ts'), 'utf8');
const form = fs.readFileSync(path.join(root, 'app', 'components', 'AgreementForm.tsx'), 'utf8');
const page = fs.readFileSync(path.join(root, 'app', 'accept-agreement', 'page.tsx'), 'utf8');

test('destination is hello@micro-titan.com and only that default', () => {
  assert.match(route, /INTAKE_TO_EMAIL \|\| "hello@micro-titan\.com"/);
  assert.ok(!route.includes('billywbelljr@gmail.com'), 'must not send acceptances to personal Gmail');
  assert.ok(!route.includes('b.bell_10@yahoo.com'), 'must not send acceptances to Yahoo');
});

test('subject matches the existing mailto subject', () => {
  assert.match(route, /Agreement accepted — /);
  assert.match(form, /Agreement accepted — /);
});

test('no secret is hardcoded', () => {
  assert.ok(!/RESEND_API_KEY\s*=\s*["']re_/.test(route), 'no Resend key literal');
  assert.ok(route.includes('process.env.RESEND_API_KEY'), 'key comes from env only');
  assert.ok(route.includes('email_service_not_configured'), 'missing key returns a clear 503, not a silent drop');
});

test('validation, honeypot, rate limit and size limit are present', () => {
  assert.match(route, /Client name is required/);
  assert.match(route, /Intake reference is required/);
  assert.match(route, /A valid date is required/);
  assert.match(route, /have read the Micro Titan Scope and Terms/);
  assert.match(route, /website/);
  assert.match(route, /RATE_MAX = 5/);
  assert.match(route, /MAX_BODY_BYTES = 64 \* 1024/);
  assert.match(route, /method_not_allowed/);
});

test('lane totals are derived server-side from approved pricing', () => {
  assert.match(route, /Family: \{ discovery: 150, total: 1650, afterCredit: 1500, monthly: 95 \}/);
  assert.match(route, /"Solo entrepreneur": \{ discovery: 500, total: 5500, afterCredit: 5000, monthly: 350 \}/);
  assert.match(route, /Business: \{ discovery: 1000, total: 10000, afterCredit: 9000, monthly: 950 \}/);
  assert.match(route, /LANE_TOTALS\[p\.lane\]/);
  assert.ok(!form.includes('total:') || form.includes('Display totals only'), 'form must label its totals as display only');
});

test('acceptance is never claimed as a legal e-signature, and no CRM write', () => {
  assert.match(route, /NOT a legal e-signature/);
  assert.match(form, /not claimed as a legal e-signature/);
  assert.match(route, /No CRM write happens here/);
  assert.ok(!/sheets|CRM.*insert|appendRow/i.test(route) || route.includes('No CRM write'), 'route must not write to the CRM');
});

test('form keeps the mailto fallback and adds a one-tap send', () => {
  assert.match(form, /mailto:hello@micro-titan\.com/);
  assert.match(form, /Send by email instead \(fallback\)/);
  assert.match(form, /fetch\("\/api\/agreement"/);
  assert.match(form, /Acceptance sent\./);
  assert.match(form, /I have read the Micro Titan Scope and Terms/);
  assert.match(form, /does not re-host its/);
  assert.ok(!form.includes('api.resend.com'), 'the browser form must never call the email provider directly');
});

test('page does not re-host the Scope and Terms text', () => {
  assert.match(page, /is not re-hosted here/);
  assert.match(form, /does not re-host its/);
  assert.ok(!form.includes('Micro Titan supplies the apps'), 'form must not embed the full Scope and Terms text');
});
