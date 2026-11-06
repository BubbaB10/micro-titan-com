// node --test tests/twilio-webhook-voice.test.mjs
// Route-level voice webhook tests. No live Twilio, no live database,
// no real texts. `pg` is the in-memory fake; the connection string
// uses the .invalid domain so a missed redirect cannot reach a host.
import test, { beforeEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { createHmac } from 'node:crypto';
import { MISSED_CALL_AUTO_TEXT } from '../app/lib/erm/twilio.ts';

await register(new URL('./helpers/pg-resolve-hook.mjs', import.meta.url));

const { POST } = await import('../app/api/twilio/webhook/route.ts');
const { resetCommunicationLog, communicationLogRows } = await import('./helpers/fake-pg.mjs');

const TOKEN = 'test_only_not_a_real_auth_token';
const WEBHOOK_URL = 'https://example.test/api/twilio/webhook';
const FROM = '+19035550001';
const TO = '+19033005734';

function sign(params) {
  const data = Object.keys(params).sort().reduce((acc, key) => acc + key + params[key], WEBHOOK_URL);
  return createHmac('sha1', TOKEN).update(data, 'utf8').digest('base64');
}

function postVoice(fields) {
  const params = { From: FROM, To: TO, ...fields };
  const body = new URLSearchParams(params).toString();
  return POST(
    new Request(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-twilio-signature': sign(params),
      },
      body,
    }),
  );
}

async function read(res) {
  const type = res.headers.get('content-type') || '';
  if (type.includes('json')) {
    return { status: res.status, type, json: await res.json() };
  }
  return { status: res.status, type, text: await res.text() };
}

let fetchCalls = [];

describe('twilio voice webhook', { concurrency: 1 }, () => {
  beforeEach(() => {
    process.env.TWILIO_AUTH_TOKEN = TOKEN;
    process.env.TWILIO_ACCOUNT_SID = 'AC_test';
    process.env.TWILIO_PHONE_NUMBER = TO;
    process.env.ERM_DATABASE_URL = 'postgres://twilio-unit.invalid/none';
    delete process.env.ERM_DATABASE_DATABASE_URL;
    delete process.env.TWILIO_DAILY_AUTO_TEXT_CAP;
    resetCommunicationLog();
    fetchCalls = [];
    globalThis.fetch = async (url, opts) => {
      fetchCalls.push({ url: String(url), body: opts?.body });
      return {
        ok: true,
        json: async () => ({ sid: `SM_auto_${fetchCalls.length}` }),
      };
    };
  });

  test('incoming CallStatus=ringing returns TwiML Reject and a voice_rejected row', async () => {
    const res = await read(await postVoice({ CallSid: 'CA_ring', CallStatus: 'ringing', Direction: 'inbound' }));
    assert.equal(res.status, 200);
    assert.match(res.type, /text\/xml/);
    assert.match(res.text, /<Response><Reject reason="busy"\/><\/Response>/);
    const rows = communicationLogRows();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].kind, 'voice_rejected');
    assert.equal(rows[0].twilio_sid, 'CA_ring');
    assert.equal(rows[0].status, 'logged');
    assert.equal(fetchCalls.length, 0);
  });

  test('queued without an outbound Direction is also the incoming reject', async () => {
    const res = await read(await postVoice({ CallSid: 'CA_queued', CallStatus: 'queued' }));
    assert.equal(res.status, 200);
    assert.match(res.text, /<Reject reason="busy"\/>/);
    assert.equal(communicationLogRows()[0].kind, 'voice_rejected');
    assert.equal(fetchCalls.length, 0);
  });

  test('terminal missed statuses each send one auto-text', async () => {
    for (const callStatus of ['no-answer', 'busy', 'failed', 'canceled']) {
      resetCommunicationLog();
      fetchCalls = [];
      const callSid = `CA_${callStatus}`;
      const res = await read(await postVoice({ CallSid: callSid, CallStatus: callStatus, CallDuration: '0' }));
      assert.equal(res.status, 200, callStatus);
      assert.equal(res.json.autoText, 'sent', callStatus);
      assert.equal(fetchCalls.length, 1, callStatus);
      const sentBody = new URLSearchParams(String(fetchCalls[0].body)).get('Body');
      assert.equal(sentBody, MISSED_CALL_AUTO_TEXT);
      const rows = communicationLogRows();
      const statusRow = rows.find((row) => row.kind === 'voice_status');
      const sentRows = rows.filter((row) => row.kind === 'missed_call_auto_text' && row.status === 'sent');
      assert.equal(statusRow.twilio_sid, `${callSid}:status:${callStatus}`);
      assert.equal(statusRow.body, callStatus);
      assert.equal(sentRows.length, 1);
      assert.equal(sentRows[0].related_sid, callSid);
    }
  });

  test('a repeat missed-call callback does not send a second text', async () => {
    for (const callStatus of ['no-answer', 'busy', 'failed', 'canceled']) {
      resetCommunicationLog();
      fetchCalls = [];
      const params = { CallSid: `CA_repeat_${callStatus}`, CallStatus: callStatus, CallDuration: '0' };
      const first = await read(await postVoice(params));
      const second = await read(await postVoice(params));
      assert.equal(first.json.autoText, 'sent', callStatus);
      assert.equal(second.json.autoText, 'already_sent', callStatus);
      assert.equal(fetchCalls.length, 1, callStatus);
      const sent = communicationLogRows().filter(
        (row) => row.kind === 'missed_call_auto_text' && row.status === 'sent',
      );
      assert.equal(sent.length, 1, callStatus);
      assert.equal(sent[0].related_sid, params.CallSid);
    }
  });

  test('completed with duration > 0 logs status and does not text', async () => {
    const res = await read(
      await postVoice({ CallSid: 'CA_done', CallStatus: 'completed', CallDuration: '42' }),
    );
    assert.equal(res.status, 200);
    assert.equal(res.json.autoText, 'not_missed');
    assert.equal(fetchCalls.length, 0);
    const rows = communicationLogRows();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].kind, 'voice_status');
    assert.equal(rows[0].twilio_sid, 'CA_done:status:completed');
    assert.equal(rows[0].body, 'completed');
  });

  test('ringing then the terminal status records both rows and texts once', async () => {
    const ringing = await read(
      await postVoice({ CallSid: 'CA_live', CallStatus: 'ringing', Direction: 'inbound' }),
    );
    const terminal = await read(
      await postVoice({ CallSid: 'CA_live', CallStatus: 'no-answer', CallDuration: '0' }),
    );
    assert.match(ringing.text, /<Reject reason="busy"\/>/);
    assert.equal(terminal.json.autoText, 'sent');
    assert.equal(fetchCalls.length, 1);
    const rows = communicationLogRows();
    const rejected = rows.find((row) => row.kind === 'voice_rejected');
    const status = rows.find((row) => row.kind === 'voice_status');
    const sent = rows.filter((row) => row.kind === 'missed_call_auto_text' && row.status === 'sent');
    assert.equal(rejected.twilio_sid, 'CA_live');
    assert.equal(status.twilio_sid, 'CA_live:status:no-answer');
    assert.equal(status.body, 'no-answer');
    assert.equal(sent.length, 1);
    assert.equal(sent[0].related_sid, 'CA_live');
  });

  test('an earlier non-terminal status does not block the terminal status row', async () => {
    const progress = await read(
      await postVoice({ CallSid: 'CA_prog', CallStatus: 'in-progress', CallDuration: '0' }),
    );
    const missed = await read(
      await postVoice({ CallSid: 'CA_prog', CallStatus: 'busy', CallDuration: '0' }),
    );
    assert.equal(progress.json.autoText, 'not_missed');
    assert.equal(missed.json.autoText, 'sent');
    assert.equal(fetchCalls.length, 1);
    const statuses = communicationLogRows().filter((row) => row.kind === 'voice_status');
    assert.deepEqual(
      statuses.map((row) => row.twilio_sid).sort(),
      ['CA_prog:status:busy', 'CA_prog:status:in-progress'],
    );
  });
});
