// node --test tests/twilio-text-first.test.mjs — Twilio text-first.
// Pure-logic + gated-store tests only: no database, no network, no
// Twilio account, no secrets, no real texts, no real phone numbers.
// All SIDs, numbers, and bodies below are invented test fixtures.
// The gated store returns "not_configured" when ERM_DATABASE_URL is
// absent — that is tested, not worked around.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import {
  DEFAULT_DAILY_AUTO_TEXT_CAP,
  MISSED_CALL_AUTO_TEXT,
  isCapReached,
  isMissedCall,
  parseDailyCap,
  parseTwilioEvent,
  verifyTwilioSignature,
} from '../app/lib/erm/twilio.ts';
import { buildTwilioMessageRequest, sendTwilioMessage } from '../app/lib/erm/twilio-send.ts';
import {
  autoTextState,
  listThread,
  recordCommunication,
} from '../app/lib/erm/communication-store.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webhookSource = fs.readFileSync(path.join(root, 'app', 'api', 'twilio', 'webhook', 'route.ts'), 'utf8');
const storeSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'communication-store.ts'), 'utf8');
const twilioSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'twilio.ts'), 'utf8');
const migrationSource = fs.readFileSync(path.join(root, 'app', 'lib', 'erm', 'migrations', '002-twilio-communication-log.sql'), 'utf8');

const TOKEN = 'test_only_not_a_real_auth_token';
const URL = 'https://example.test/api/twilio/webhook';

function sign(url, params, token = TOKEN) {
  const data = Object.keys(params).sort().reduce((acc, k) => acc + k + params[k], url);
  return createHmac('sha1', token).update(data, 'utf8').digest('base64');
}

test('signature: valid passes, tampered/wrong/missing fail, token never in body or url', () => {
  const params = { From: '+19035550001', To: '+19033005734', Body: 'hello', MessageSid: 'SM_test_1' };
  assert.equal(verifyTwilioSignature(URL, params, sign(URL, params), TOKEN), true);
  assert.equal(verifyTwilioSignature(URL, { ...params, Body: 'hell0' }, sign(URL, params), TOKEN), false);
  assert.equal(verifyTwilioSignature(URL, params, sign(URL, params, 'other_token'), TOKEN), false);
  assert.equal(verifyTwilioSignature(URL, params, null, TOKEN), false);
  assert.equal(verifyTwilioSignature(URL, params, sign(URL, params), ''), false);
  const req = buildTwilioMessageRequest('AC_test', TOKEN, '+19033005734', '+19035550001', 'hi');
  assert.ok(req.headers.Authorization.startsWith('Basic '));
  assert.ok(!req.url.includes(TOKEN));
  assert.ok(!req.body.includes(TOKEN));
  assert.ok(!req.body.includes('AC_test'));
});

test('parse: sms, voice status, voice incoming, unknown', () => {
  const sms = parseTwilioEvent({ MessageSid: 'SM_1', From: '+19035550001', To: '+19033005734', Body: '  hi  ', NumMedia: '2' });
  assert.equal(sms.kind, 'sms');
  assert.equal(sms.body, 'hi');
  assert.equal(sms.mediaCount, 2);
  const status = parseTwilioEvent({ CallSid: 'CA_1', From: '+19035550001', To: '+19033005734', CallStatus: 'no-answer', CallDuration: '0' });
  assert.equal(status.kind, 'voice_status');
  assert.equal(isMissedCall(status), true);
  const incoming = parseTwilioEvent({ CallSid: 'CA_2', From: '+19035550001', To: '+19033005734' });
  assert.equal(incoming.kind, 'voice_incoming');
  assert.equal(isMissedCall(incoming), false);
  const ringing = parseTwilioEvent({ CallSid: 'CA_ring', From: '+19035550001', To: '+19033005734', CallStatus: 'ringing', Direction: 'inbound' });
  assert.equal(ringing.kind, 'voice_incoming');
  assert.equal(isMissedCall(ringing), false);
  assert.deepEqual(parseTwilioEvent({ Foo: 'bar' }), { kind: 'unknown' });
});

test('parse: ringing is incoming; queued is incoming unless Direction is outbound; terminal statuses stay voice_status', () => {
  const base = { CallSid: 'CA_q', From: '+19035550001', To: '+19033005734' };
  assert.equal(parseTwilioEvent({ ...base, CallStatus: 'ringing' }).kind, 'voice_incoming');
  assert.equal(parseTwilioEvent({ ...base, CallStatus: 'ringing', Direction: 'outbound-api' }).kind, 'voice_incoming');
  assert.equal(parseTwilioEvent({ ...base, CallStatus: 'queued' }).kind, 'voice_incoming');
  assert.equal(parseTwilioEvent({ ...base, CallStatus: 'queued', Direction: 'inbound' }).kind, 'voice_incoming');
  const queuedOut = parseTwilioEvent({ ...base, CallStatus: 'queued', Direction: 'outbound-api' });
  assert.equal(queuedOut.kind, 'voice_status');
  assert.equal(queuedOut.callStatus, 'queued');
  assert.equal(parseTwilioEvent({ ...base, CallStatus: 'queued', Direction: 'outbound-dial' }).kind, 'voice_status');
  for (const callStatus of ['no-answer', 'busy', 'failed', 'canceled', 'completed']) {
    const event = parseTwilioEvent({ ...base, CallStatus: callStatus, CallDuration: '3' });
    assert.equal(event.kind, 'voice_status', callStatus);
    assert.equal(event.callStatus, callStatus);
    assert.equal(event.durationSeconds, 3);
  }
});

test('missed-call decision: missed statuses and zero-duration completed text, answered does not', () => {
  for (const status of ['no-answer', 'busy', 'failed', 'canceled']) {
    assert.equal(isMissedCall({ kind: 'voice_status', callStatus: status, durationSeconds: 0 }), true, status);
  }
  assert.equal(isMissedCall({ kind: 'voice_status', callStatus: 'completed', durationSeconds: 0 }), true);
  assert.equal(isMissedCall({ kind: 'voice_status', callStatus: 'completed', durationSeconds: 42 }), false);
  assert.equal(isMissedCall({ kind: 'voice_status', callStatus: 'in-progress', durationSeconds: 0 }), false);
});

// Approved verbatim text, copied exactly from
// micro-titan-g7-discovery-wording-DRAFT-2026-11-05.md, section 1
// (approved verbatim by Bubba 2026-11-05 ~14:59 CST). The test
// asserts byte-for-byte equality so no paraphrase can slip in.
const APPROVED_MISSED_CALL_AUTO_TEXT =
  'Hi \u2014 this is Micro Titan. We missed your call, sorry about that. ' +
  'We work by text first, so just reply here and a real agent will pick it up.\n\n' +
  'You can:\n' +
  '1. Reply to this text\n' +
  '2. Send a photo or document here\n' +
  '3. Start an intake: micro-titan.com/intake\n' +
  '4. Book a discovery call: micro-titan.com/book-discovery\n\n' +
  'Nothing is booked, charged, or changed until you say so.';

test('approved verbatim wording: exact text, all four options, no placeholder anywhere', () => {
  assert.equal(MISSED_CALL_AUTO_TEXT, APPROVED_MISSED_CALL_AUTO_TEXT);
  assert.doesNotMatch(twilioSource, /PLACEHOLDER/);
  assert.doesNotMatch(webhookSource, /PLACEHOLDER/);
  assert.match(MISSED_CALL_AUTO_TEXT, /micro-titan\.com\/intake/);
  assert.match(MISSED_CALL_AUTO_TEXT, /micro-titan\.com\/book-discovery/);
  assert.match(MISSED_CALL_AUTO_TEXT, /photo/);
  assert.match(MISSED_CALL_AUTO_TEXT, /Nothing is booked, charged, or changed until you say so/);
});

test('daily cap: default 25, env override, 0 disables, reached at cap', () => {
  assert.equal(DEFAULT_DAILY_AUTO_TEXT_CAP, 25);
  assert.equal(parseDailyCap(undefined), 25);
  assert.equal(parseDailyCap('10'), 10);
  assert.equal(parseDailyCap('0'), 0);
  assert.equal(parseDailyCap('abc'), 25);
  assert.equal(parseDailyCap('99999'), 25);
  assert.equal(isCapReached(25, 25), true);
  assert.equal(isCapReached(24, 25), false);
  assert.equal(isCapReached(0, 0), true);
});

test('send: fake fetch proves one Messages create, no polling, no recording paths', async () => {
  const calls = [];
  const fakeFetch = async (url, opts) => {
    calls.push({ url, opts });
    return { ok: true, json: async () => ({ sid: 'SM_sent_1' }) };
  };
  const res = await sendTwilioMessage('AC_test', TOKEN, '+19033005734', '+19035550001', 'hi', fakeFetch);
  assert.deepEqual(res, { ok: true, messageSid: 'SM_sent_1' });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /api\.twilio\.com\/2010-04-01\/Accounts\/AC_test\/Messages\.json/);
  assert.match(webhookSource, /Reject/);
  assert.doesNotMatch(webhookSource, /Record/);
  assert.doesNotMatch(webhookSource, /Transcription/);
  assert.doesNotMatch(webhookSource, /setInterval|setTimeout.*poll|fetch\(.*twilio.*list/i);
});

test('gated store: no database returns not_configured, never throws', async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  assert.deepEqual(await recordCommunication({ twilioSid: 'SM_1', kind: 'sms_inbound', direction: 'inbound', fromNumber: '+19035550001', toNumber: '+19033005734' }), { status: 'not_configured' });
  assert.deepEqual(await autoTextState('CA_1'), { status: 'not_configured' });
  assert.deepEqual(await listThread('+19035550001'), { status: 'not_configured' });
});

test('dedupe and cap are enforced in code, not just claimed', () => {
  assert.match(storeSource, /ON CONFLICT \(twilio_sid, kind\) DO NOTHING/);
  assert.match(storeSource, /related_sid = \$1/);
  assert.match(storeSource, /missed_call_auto_text/);
  assert.match(storeSource, /cap_blocked/);
  assert.match(webhookSource, /alreadySent/);
  assert.match(webhookSource, /isCapReached/);
  assert.match(webhookSource, /\$\{event\.callSid\}:status:\$\{event\.callStatus\}/);
  assert.match(webhookSource, /relatedSid: event\.callSid/);
  assert.match(webhookSource, /invalid_signature/);
  assert.match(webhookSource, /403/);
  assert.match(migrationSource, /CREATE TABLE IF NOT EXISTS communication_log/);
  assert.match(migrationSource, /UNIQUE \(twilio_sid, kind\)/);
  assert.match(migrationSource, /client_id UUID REFERENCES clients\(id\)/);
});

test('route shape: bad signature 403, unknown 403, no auto-reply to sms, no webhook pointing', () => {
  assert.match(webhookSource, /status: 403/);
  assert.match(webhookSource, /unsupported_event/);
  assert.match(webhookSource, /<Response\/>/);
  // Exactly one send call site in the route, and it sits in the
  // voice_status (missed-call) path, not the SMS path: the SMS
  // branch ends at the empty <Response/> with no send in between.
  const sendSites = (webhookSource.match(/sendTwilioMessage\(/g) || []).length;
  assert.equal(sendSites, 1);
  const smsBranch = webhookSource.slice(
    webhookSource.indexOf('event.kind === "sms"'),
    webhookSource.indexOf('<Response/>'),
  );
  assert.doesNotMatch(smsBranch, /sendTwilioMessage/);
  // The route never points a Twilio webhook anywhere and never
  // publishes the number: it only reads TWILIO_PHONE_NUMBER from env.
  assert.doesNotMatch(webhookSource, /903.*300.*5734/);
  assert.match(webhookSource, /TWILIO_PHONE_NUMBER/);
  assert.match(webhookSource, /TWILIO_AUTH_TOKEN/);
  assert.match(webhookSource, /TWILIO_ACCOUNT_SID/);
});
