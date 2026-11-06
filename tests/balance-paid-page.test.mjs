// node --test tests/balance-paid-page.test.mjs — post-balance success page
// (P2 item 7). Source pins only: no network, no Stripe, no secrets, no
// prospect data. Confirms the page is a real route, stays honest about
// what it knows, and that balance Checkout success_url points here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBalanceCheckoutSessionParams } from '../app/lib/erm/balance-checkout.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageSrc = fs.readFileSync(path.join(root, 'app', 'balance-paid', 'page.tsx'), 'utf8');
const cssSrc = fs.readFileSync(path.join(root, 'app', 'balance-paid', 'balance-paid.css'), 'utf8');
const checkoutSrc = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'balance-checkout.ts'), 'utf8');

test('balance Checkout success_url is /balance-paid, not home ?balance=paid', () => {
  const params = buildBalanceCheckoutSessionParams('MT-20261103-TEST', 'Family', 'https://micro-titan.com');
  assert.equal(params['success_url'], 'https://micro-titan.com/balance-paid');
  assert.ok(!params['success_url'].includes('?balance=paid'));
  assert.ok(checkoutSrc.includes('`${base}/balance-paid`'));
  assert.ok(!checkoutSrc.includes('`${base}/?balance=paid`'));
});

test('page is a dedicated server-rendered confirmation with no fake client data', () => {
  assert.ok(!/^"use client";/m.test(pageSrc), 'server-rendered: no client state');
  assert.match(pageSrc, /Program balance payment received/);
  assert.match(pageSrc, /Stripe returned you here after Checkout/);
  assert.match(pageSrc, /Setup begins only after the payment/);
  assert.match(pageSrc, /hello@micro-titan\.com/);
  assert.match(pageSrc, /robots:\s*\{\s*index:\s*false/);
  // No invented intake / lane / amount / name on the page.
  for (const banned of [
    'MT-2026',
    'Family',
    'Solo entrepreneur',
    'Business',
    '$1,500',
    '$5,000',
    '$9,000',
    'useState',
    'fetch(',
    'STRIPE_',
    'recordBalancePaid',
    "You're live",
    'Connected ✓',
    'setup has started',
    'setup is live',
  ]) {
    assert.ok(!pageSrc.includes(banned), `must not contain: ${banned}`);
  }
});

test('page styles are scoped and next steps are explicit', () => {
  assert.match(pageSrc, /className="balance-paid-page"/);
  assert.match(cssSrc, /\.balance-paid-page\s*\{/);
  assert.match(pageSrc, /What happens next/);
  assert.match(pageSrc, /We contact you at the email or phone from your intake/);
  assert.match(pageSrc, /Nothing is installed or connected from this page/);
});
