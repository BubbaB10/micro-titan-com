// node --test tests/book-discovery-server.test.mjs — server-side booking pins.
// Mirrors tests/intake-server.test.mjs (merged PR #20). Source pins guard
// the invariants that must not regress in review:
//   · destination is hello@micro-titan.com, never another address;
//   · no API key is ever hardcoded or committed;
//   · validation, honeypot, rate limit and size limit are present;
//   · the mailto fallback survives alongside the one-tap send;
//   · preferred times stay preferences only — no calendar booking claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const route = fs.readFileSync(path.join(root, 'app', 'api', 'book-discovery', 'route.ts'), 'utf8');
const form = fs.readFileSync(path.join(root, 'app', 'components', 'BookDiscoveryForm.tsx'), 'utf8');

test('destination is hello@micro-titan.com and only that default', () => {
  assert.match(route, /INTAKE_TO_EMAIL \|\| "hello@micro-titan\.com"/);
  assert.ok(!route.includes('billywbelljr@gmail.com'), 'must not send booking requests to personal Gmail');
  assert.ok(!route.includes('b.bell_10@yahoo.com'), 'must not send booking requests to Yahoo');
});

test('subject matches the existing mailto subject', () => {
  assert.match(route, /Discovery booking request — /);
  assert.match(form, /Discovery booking request — /);
});

test('no secret is hardcoded', () => {
  assert.ok(!/RESEND_API_KEY\s*=\s*["']re_/.test(route), 'no Resend key literal');
  assert.ok(route.includes('process.env.RESEND_API_KEY'), 'key comes from env only');
  assert.ok(route.includes('email_service_not_configured'), 'missing key returns a clear 503, not a silent drop');
});

test('validation, honeypot, rate limit and size limit are present', () => {
  assert.match(route, /Full name is required/);
  assert.match(route, /Email or phone/);
  assert.match(route, /Preferred date\/time 1 is required/);
  assert.match(route, /Intake reference is required/);
  assert.match(route, /website/);
  assert.match(route, /RATE_MAX = 5/);
  assert.match(route, /MAX_BODY_BYTES = 64 \* 1024/);
  assert.match(route, /method_not_allowed/);
});

test('route does not book a calendar slot', () => {
  assert.match(route, /does NOT book a calendar slot/);
  assert.match(route, /preferences only, not confirmed availability/);
});

test('form keeps the mailto fallback and adds a one-tap send', () => {
  assert.match(form, /mailto:hello@micro-titan\.com/);
  assert.match(form, /Send by email instead \(fallback\)/);
  assert.match(form, /fetch\("\/api\/book-discovery"/);
  assert.match(form, /Booking request sent\./);
  assert.match(form, /not confirmed availability/);
  assert.match(form, /does not book a calendar slot/);
  assert.ok(!form.includes('api.resend.com'), 'the browser form must never call the email provider directly');
});
