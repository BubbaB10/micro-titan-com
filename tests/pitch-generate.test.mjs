// node --test tests/pitch-generate.test.mjs — pitch-sheet generation slice.
// Pure-logic tests only: no database, no network, no credentials, no
// prospect data. Sample intakes are invented test fixtures, not clients.
// The gated store returns "not_configured" when ERM_DATABASE_URL is
// absent — that is tested, not worked around.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generatePitchSheet, selectExamples, lanePricingRows, NOT_STATED,
} from '../app/lib/erm/pitch.ts';
import { USE_CASES } from '../app/use-cases/use-cases.ts';
import { LANE_PRICING } from '../app/lib/erm/types.ts';

const CATALOG = { pricing: LANE_PRICING, useCases: USE_CASES };
const generate = (input) => generatePitchSheet(input, CATALOG);
import { recordPitchSheet } from '../app/lib/erm/pitch-store.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pitchSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'pitch.ts'), 'utf8');
const routeSource = fs.readFileSync(path.join(root, 'app', 'api', 'pitch', 'generate', 'route.ts'), 'utf8');
const librarySlugs = new Set(USE_CASES.map((c) => c.slug));

const familyIntake = {
  reference: 'MT-20261103-TEST',
  name: 'Sample Family',
  lane: 'Family',
  agentPreference: 'Help me choose in discovery',
  plate: "School, practices, and pickups live in five different places, and my inbox keeps growing.",
  answers: [
    { question: 'What household jobs eat up your evenings?', answer: 'Every morning starts with ten loose ends.' },
    { question: 'Anything else?', answer: 'We want one morning brief.' },
  ],
};

const soloIntake = {
  reference: 'MT-20261103-TST2',
  name: 'Sample Solo',
  lane: 'Solo entrepreneur',
  agentPreference: 'Muse by Meta',
  plate: 'I start every day buried in emails, texts, and calls, and estimates go out then I chase both.',
  answers: [
    { question: 'What bookkeeping work takes up your time?', answer: 'Invoices go out and then I am the one chasing them.' },
  ],
};

test('Family generation: verbatim plate, lane pricing, examples only from the library', () => {
  const sheet = generate(familyIntake);
  assert.equal(sheet.status, 'draft');
  assert.equal(sheet.published, false);
  assert.equal(sheet.sent, false);
  // Verbatim, not paraphrased.
  assert.equal(sheet.plate, familyIntake.plate);
  assert.equal(sheet.answers[0].answer, 'Every morning starts with ten loose ends.');
  // Approved Family pricing only.
  const values = sheet.pricing.map((p) => p.value).join(' ');
  assert.ok(values.includes('$150 (credited)'));
  assert.ok(values.includes('$1,650'));
  assert.ok(values.includes('$1,500'));
  assert.ok(values.includes('$95/mo'));
  assert.ok(!values.includes('$5,500') && !values.includes('$10,000'));
  // Every example is a real library case, for this lane, labelled EXAMPLE.
  assert.ok(sheet.examples.length >= 1 && sheet.examples.length <= 5);
  for (const ex of sheet.examples) {
    assert.ok(librarySlugs.has(ex.slug), `invented workflow: ${ex.slug}`);
    assert.equal(ex.label, 'EXAMPLE / POSSIBILITY');
    const lib = USE_CASES.find((c) => c.slug === ex.slug);
    assert.equal(lib.lane, 'Family');
  }
  // The client's own words matched library cases.
  const slugs = sheet.examples.map((e) => e.slug);
  assert.ok(slugs.includes('kids-schedule-hub'));
  assert.ok(slugs.includes('inbox-triage'));
  assert.ok(sheet.examplesNote.includes('not promised integrations'));
});

test('Solo generation: matched examples, Solo pricing, no PHI promise', () => {
  const sheet = generate(soloIntake);
  const slugs = sheet.examples.map((e) => e.slug);
  assert.ok(slugs.includes('morning-triage-brief'));
  assert.ok(slugs.includes('invoicing-estimating-follow-up'));
  const values = sheet.pricing.map((p) => p.value).join(' ');
  assert.ok(values.includes('$500 (credited)') && values.includes('$5,500') && values.includes('$5,000') && values.includes('$350/mo'));
  const json = JSON.stringify(sheet);
  assert.ok(!json.includes('will handle patient') && !json.includes('handles patient health information'));
});

test('Regulated-operator wording stays operational-only, in the negative', () => {
  const sheet = generate({
    ...soloIntake,
    plate: 'I run a few facilities and the daily messages overwhelm me.',
  }, CATALOG);
  assert.ok(sheet.trustNote.includes('Operational messages only'));
  assert.ok(sheet.trustNote.includes('does not handle patient health information'));
});

test('Deterministic: same intake in, same sheet out', () => {
  assert.deepEqual(generate(familyIntake), generate(familyIntake));
  assert.deepEqual(selectExamples('Family', familyIntake.plate, familyIntake.answers, USE_CASES),
    selectExamples('Family', familyIntake.plate, familyIntake.answers, USE_CASES));
});

test('Thin intake: missing answers are stated, never invented', () => {
  const sheet = generate({
    reference: 'MT-20261103-THIN',
    name: 'Sample Thin',
    lane: 'Family',
    plate: '',
    answers: [{ question: 'Anything else we should know before discovery?', answer: '' }],
  }, CATALOG);
  assert.equal(sheet.plate, NOT_STATED);
  assert.equal(sheet.plateStated, false);
  assert.equal(sheet.answers[0].answer, NOT_STATED);
  assert.ok(sheet.missing.length >= 2);
  // Fallback is the lane's first library cases, not an invented fit.
  assert.deepEqual(sheet.examples.map((e) => e.slug),
    USE_CASES.filter((c) => c.lane === 'Family').slice(0, 3).map((c) => c.slug));
});

test('Forbidden content: no last name, Paris framing, unapproved agent, or other-lane price in generated sheets', () => {
  const json = JSON.stringify(generate(familyIntake)) + JSON.stringify(generate(soloIntake));
  assert.ok(!json.includes('Bell'));
  assert.ok(!json.includes('Paris'));
  assert.ok(!json.includes('OpenClaw'));
  assert.ok(!json.includes('self-hosted'));
  assert.ok(!json.includes('ChatGPT'));
  assert.ok(!json.includes('testimonial'));
  assert.ok(!json.includes('1-800') && !/\(\d{3}\) \d{3}-\d{4}/.test(json));
});

test('Draft gate: route publishes nothing, sends nothing, marks nothing sent', () => {
  assert.ok(routeSource.includes('status: "draft"'));
  assert.ok(routeSource.includes('published: false'));
  assert.ok(routeSource.includes('sent: false'));
  assert.ok(!routeSource.includes('RESEND_API_KEY'));
  assert.ok(!routeSource.includes('published: true'));
  assert.ok(!routeSource.includes('sent: true'));
  assert.ok(!routeSource.includes("status: 'sent'") && !routeSource.includes('status: "sent"'));
  assert.ok(pitchSource.includes('status: "draft"'));
});

test('DB gate: without ERM_DATABASE_URL, recording returns not_configured and never throws', async () => {
  delete process.env.ERM_DATABASE_URL;
  const sheet = generate(familyIntake);
  const result = await recordPitchSheet(familyIntake.reference, sheet);
  assert.equal(result.status, 'not_configured');
});
