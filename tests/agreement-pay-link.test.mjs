// node --test tests/agreement-pay-link.test.mjs — acceptance-confirmation /pay link (PR #30).
// Source-shape tests only: no database, no network, no live Stripe, no
// secrets, no prospect data. The /pay link must appear ONLY after acceptance
// (the sent confirmation), never on the pre-acceptance form, and the same
// link must appear in the acceptance email body with all prior fields kept.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const formSource = fs.readFileSync(path.join(root, 'app', 'components', 'AgreementForm.tsx'), 'utf8');
const routeSource = fs.readFileSync(path.join(root, 'app', 'api', 'agreement', 'route.ts'), 'utf8');

test('confirmation view (sent) includes a /pay link with the just-submitted reference, not typed again', () => {
  const sentBranch = formSource.split('submitState === "sent"')[1];
  assert.match(sentBranch, /Next step — pay your discovery fee/);
  assert.match(sentBranch, /Pay discovery fee/);
  assert.match(sentBranch, /paying is the next step before booking discovery/i);
  assert.match(sentBranch, /credited toward the program total/);
  // Reference comes from the server-confirmed acceptance, URL-encoded, never an input.
  assert.match(sentBranch, /\/pay\?reference=\$\{encodeURIComponent\(serverReference\)\}/);
});

test('pre-acceptance form view contains NO pay link', () => {
  const formBranch = formSource.split('{step === 2')[0];
  assert.doesNotMatch(formBranch, /\/pay\?reference/);
  assert.doesNotMatch(formBranch, /Pay discovery fee/);
});

test('acceptance email body includes the same /pay link and retains all prior fields', () => {
  assert.match(routeSource, /payLinkForReference/);
  assert.match(routeSource, /Next step — pay the discovery fee/);
  assert.match(routeSource, /payLinkForReference\(p\.reference\)/);
  // Site base follows the checkout endpoint pattern, defaulting to production.
  assert.match(routeSource, /MICRO_TITAN_SITE_URL/);
  assert.match(routeSource, /https:\/\/micro-titan\.com/);
  assert.match(routeSource, /\/pay\?reference=\$\{encodeURIComponent\(reference\)\}/);
  // All prior acceptance fields unchanged in buildEmailBody.
  for (const field of [
    'Intake reference:',
    'Client name:',
    'Lane:',
    'Date:',
    'Discovery fee (credited):',
    'Program total:',
    'Total after credit:',
    'Monthly (optional):',
    'not a legal e-signature',
    'Micro Titan CRM Agreements tab',
  ]) {
    assert.ok(routeSource.includes(field), `missing prior email field: ${field}`);
  }
});
