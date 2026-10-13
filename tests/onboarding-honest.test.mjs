// node --test tests/onboarding-honest.test.mjs — the public /onboarding page makes no claim it cannot back.
//
// Found 2026-10-06 (row wq-muxca5j0-41h): the page kept connector toggles in local state and rendered "Connected ✓"
// and "You're live." with no provider authorization behind them. Pins, on the SOURCE the site builds from:
//   · no "Connected" / "You're live" / "Open your dashboard" wording;
//   · no client state, no connector toggles, no step machine;
//   · the one way in is the real intake link on The Download;
//   · the five steps are the canonical paperless journey, in order;
//   · the page is server-rendered (no "use client").
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'app', 'onboarding', 'page.tsx'), 'utf8');

test('no fake state: nothing on the page is called connected or live', () => {
  for (const banned of ['Connected ✓', 'Connected</', "You're live", 'You’re live', 'Open your dashboard', 'href="/dashboard"', 'useState', 'toggleConnect', 'CONNECTORS', 'Bank via Plaid', 'Step 2 of 3']) {
    assert.ok(!src.includes(banned), `must not contain: ${banned}`);
  }
  assert.ok(!/^"use client";/m.test(src), 'server-rendered: no client state to hold a fake connection');
});

test('the one way in is the real intake on The Download, and the page says it connects nothing', () => {
  assert.ok(src.includes('https://download.micro-titan.com/#/studio'));
  assert.match(src, /Start the intake/);
  assert.match(src, /does not connect anything and it is not a sign-up form/);
  assert.match(src, /read\s+back before anyone calls it connected/i);
});

test('the five steps are the canonical paperless, phone-first journey, in order', () => {
  const steps = src.slice(src.indexOf('const STEPS'), src.indexOf('export const metadata'));
  const titles = [...steps.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(titles, [
    'Tell us what you want off your plate',
    'A consented capability check',
    'Findings, the setup that fits, and the terms',
    'Your own assistant, on your own box',
    'First use, read back',
  ]);
  assert.match(src, /Nothing is printed, signed on paper or mailed/);
  assert.match(src, /We never ask for your passwords\. Ever\./);
});
