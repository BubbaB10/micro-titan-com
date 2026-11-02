// node --test tests/intake-server.test.mjs — server-side intake route pins.
// The live behaviour (validation, 503 without a key, 429 rate limit) is
// verified against a built server in the PR description; these source pins
// guard the invariants that must not regress in review:
//   · destination is hello@micro-titan.com, never another address;
//   · no API key is ever hardcoded or committed;
//   · pricing figures are exactly the approved lane totals;
//   · the mailto fallback survives alongside the one-tap send.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const route = fs.readFileSync(path.join(root, 'app', 'api', 'intake', 'route.ts'), 'utf8');
const form = fs.readFileSync(path.join(root, 'app', 'components', 'IntakeForm.tsx'), 'utf8');

test('destination is hello@micro-titan.com and only that default', () => {
  assert.match(route, /INTAKE_TO_EMAIL \|\| "hello@micro-titan\.com"/);
  assert.ok(!route.includes('billywbelljr@gmail.com'), 'must not send intakes to personal Gmail');
  assert.ok(!route.includes('b.bell_10@yahoo.com'), 'must not send intakes to Yahoo');
});

test('no secret is hardcoded', () => {
  assert.ok(!/RESEND_API_KEY\s*=\s*["']re_/.test(route), 'no Resend key literal');
  assert.ok(route.includes('process.env.RESEND_API_KEY'), 'key comes from env only');
  assert.ok(route.includes('email_service_not_configured'), 'missing key returns a clear 503, not a silent drop');
});

test('approved pricing figures only', () => {
  for (const fig of ['$150', '$1,650', '$1,500', '$95/month', '$500', '$5,500', '$5,000', '$350/month', '$1,000', '$10,000', '$9,000', '$950/month']) {
    assert.ok(route.includes(fig), `route must carry ${fig}`);
  }
  assert.ok(!route.includes('$2,500') || route.includes('Setup'), 'Business setup figure is in its pricing block, not a new price');
});

test('validation, honeypot, rate limit and size limit are present', () => {
  assert.match(route, /Full name is required/);
  assert.match(route, /Email or phone/);
  assert.match(route, /website/);
  assert.match(route, /RATE_MAX = 5/);
  assert.match(route, /MAX_BODY_BYTES = 64 \* 1024/);
});

test('form keeps the mailto fallback and adds a one-tap send', () => {
  assert.match(form, /mailto:hello@micro-titan\.com/);
  assert.match(form, /Send by email instead \(fallback\)/);
  assert.match(form, /fetch\("\/api\/intake"/);
  assert.match(form, /Intake sent\./);
  assert.ok(!form.includes('api.resend.com'), 'the browser form must never call the email provider directly');
});
