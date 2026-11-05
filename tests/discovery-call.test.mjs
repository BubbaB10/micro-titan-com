// node --test tests/discovery-call.test.mjs — ERM agent-led discovery logging.
// Design: micro-titan-agent-led-discovery-design-2026-11-05.md (§7).
// One discovery record per attempt, for one intake, in one channel
// (text, agent-led at the client's pace, or a 15–20 minute voice call):
// the full transcript/log + the agent's recommendation + the
// presentation reference, idempotent by session_key. No call system
// is built here — this is the record shape only. No live database is
// used here: DB tests are gated (not_configured) and the rest are
// source pins + pure status-machine checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storeSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'discovery-call-store.ts'), 'utf8');
const schemaSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'schema.sql'), 'utf8');
const migrationSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'migrations', '003-discovery-calls.sql'), 'utf8');
const typesSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'types.ts'), 'utf8');

const sampleInput = {
  reference: 'MT-20261105-TEST',
  sessionKey: 'test-session-1',
  channel: 'text',
  formatChoice: 'text',
  status: 'completed',
  consentGiven: true,
  consentAt: null,
  scheduledAt: null,
  startedAt: null,
  endedAt: null,
  durationSeconds: null,
  transcript: [{ speaker: 'agent', text: 'Hi, I am Micro Titan’s agent.', at: '2026-11-05T18:00:00Z' }],
  recordingRef: null,
  recommendation: 'approve',
  recommendationReason: 'Client confirmed the first job in their own words.',
  presentationRef: null,
};

test('Store: gated on ERM_DATABASE_URL or the Neon fallback, never throws', () => {
  assert.ok(storeSource.includes('ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL'));
  assert.ok(storeSource.includes('return { status: "not_configured" }'));
});

test('Store: never creates a client or an intake; unknown reference writes nothing', () => {
  assert.ok(storeSource.includes('intake_not_found'));
  assert.ok(!/INSERT INTO clients/.test(storeSource));
  assert.ok(!/INSERT INTO intakes/.test(storeSource));
});

test('Store: idempotent by session_key — a re-delivered transcript returns already_exists, no duplicate', () => {
  assert.ok(storeSource.includes('already_exists'));
  assert.ok(storeSource.includes('SELECT id FROM discovery_calls WHERE session_key = $1'));
  assert.ok(!/UPDATE discovery_calls/.test(storeSource));
  assert.ok(!/DELETE FROM discovery_calls/.test(storeSource));
});

test('Store: one discovery row + one audit row; transcript stored verbatim as JSONB, never summarised', () => {
  assert.ok(storeSource.includes('INSERT INTO discovery_calls'));
  assert.ok(storeSource.includes('INSERT INTO audit_log'));
  assert.ok(storeSource.includes('JSON.stringify(input.transcript)'));
  assert.ok(storeSource.includes("'discovery_completed'"));
  assert.ok(!/UPDATE audit_log/.test(storeSource));
  assert.ok(!/DELETE FROM audit_log/.test(storeSource));
});

test('Store: no audio in the ERM — only a recording reference, and only for voice', () => {
  assert.ok(storeSource.includes('recording_ref'));
  assert.ok(storeSource.includes('Never the audio itself'));
  assert.ok(!/recording_url|audio_base64|audio_data/.test(storeSource));
});

test('Store: intake status advances to discovery_booked only from discovery_paid; never to setup', () => {
  assert.ok(storeSource.includes('currentStatus === "discovery_paid"'));
  assert.ok(storeSource.includes("'discovery_booked'"));
  assert.ok(!/SET status = 'setup'/.test(storeSource));
});

test('Store: owner status returns the transcript for review — that is the point of the record', () => {
  assert.ok(storeSource.includes('export async function discoveryCallStatus'));
  assert.ok(storeSource.includes('transcript'));
  assert.ok(storeSource.includes('recommendation'));
});

test('Types: discovery channel, status, recommendation, and transcript turn are defined', () => {
  for (const t of ['DiscoveryChannel', 'DiscoveryStatus', 'DiscoveryRecommendation', 'DiscoveryTranscriptTurn']) {
    assert.ok(typesSource.includes(t), `types missing ${t}`);
  }
  assert.ok(typesSource.includes('"text" | "voice" | "in_app_voice"'));
  assert.ok(typesSource.includes('"approve"'));
  assert.ok(typesSource.includes('"join_to_close"'));
  assert.ok(typesSource.includes('"needs_human"'));
});

test('Schema + migration: discovery_calls table exists with the columns the store writes', () => {
  for (const src of [schemaSource, migrationSource]) {
    assert.ok(src.includes('CREATE TABLE IF NOT EXISTS discovery_calls'));
    for (const col of ['intake_id', 'client_id', 'reference', 'session_key', 'channel', 'format_choice', 'status', 'consent_given', 'transcript', 'recording_ref', 'recommendation', 'recommendation_reason', 'presentation_ref']) {
      assert.ok(src.includes(col), `discovery_calls missing ${col}`);
    }
    assert.ok(src.includes('session_key TEXT NOT NULL UNIQUE'));
  }
  assert.ok(migrationSource.includes('idx_discovery_calls_intake'));
});

test('DB gate: without ERM_DATABASE_URL, recordDiscoveryCall and discoveryCallStatus return not_configured and never throw', async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  const { recordDiscoveryCall, discoveryCallStatus } = await import('../app/lib/erm/discovery-call-store.ts');
  const recorded = await recordDiscoveryCall(sampleInput);
  assert.equal(recorded.status, 'not_configured');
  const status = await discoveryCallStatus('MT-20261105-TEST');
  assert.equal(status.status, 'not_configured');
});

test('Status machine: discovery_paid can go to discovery_booked, agreed cannot', async () => {
  const { canTransitionIntake } = await import('../app/lib/erm/types.ts');
  assert.equal(canTransitionIntake('discovery_paid', 'discovery_booked'), true);
  assert.equal(canTransitionIntake('agreed', 'discovery_booked'), false);
  assert.equal(canTransitionIntake('discovery_booked', 'setup'), true);
});
