// node --test tests/voice-test-call.test.mjs
// The test-call script must refuse without --confirm and must not
// contact Twilio in that case. No real numbers, no real credentials.
import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_VOICE_BRIDGE_HOST,
  buildVoiceTestCallRequest,
  parseVoiceTestCallArgs,
  planVoiceTestCall,
} from "../scripts/voice-test-call.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "voice-test-call.mjs");
const TOKEN = "test_only_not_a_real_auth_token";
const STREAM_SECRET = "test_only_stream_secret";
const SID = "AC_test_only_not_a_real_sid";
const NOW = new Date("2026-11-07T00:27:00.000Z");

const ready = {
  to: "+15555550100",
  reference: "MT-20261107-TEST",
  from: "+15555550199",
  accountSid: SID,
  authToken: TOKEN,
  streamSecret: STREAM_SECRET,
  now: NOW,
};

test("a real intake reference and a bad number are refused", () => {
  assert.equal(planVoiceTestCall({ ...ready, reference: "MT-20261105-A1B2" }).error, "reference_not_test");
  assert.equal(planVoiceTestCall({ ...ready, to: "5555550100" }).error, "bad_destination");
  assert.equal(planVoiceTestCall({ ...ready, from: "" }).error, "missing_env");
});

test("without --confirm the plan is complete and no Twilio request is built", () => {
  const decision = planVoiceTestCall({ ...ready, confirm: false });
  assert.equal(decision.action, "dry_run");
  assert.equal(decision.request, undefined);
  assert.equal(decision.plan.bridgeHost, DEFAULT_VOICE_BRIDGE_HOST);
  assert.equal(decision.plan.sessionKey, "voice-test-20261107T002700Z");
  assert.equal(decision.plan.streamUrl, `wss://${DEFAULT_VOICE_BRIDGE_HOST}/twilio-stream`);
  assert.match(decision.plan.twiml, /<Parameter name="reference" value="MT-20261107-TEST"\/>/);
  assert.match(decision.plan.twiml, /<Parameter name="sessionKey" value="voice-test-20261107T002700Z"\/>/);
  assert.match(decision.plan.twiml, /<Parameter name="consentAt" value="2026-11-07T00:27:00.000Z"\/>/);
  assert.match(decision.plan.twiml, /<Parameter name="streamToken" value="[0-9a-f]{64}"\/>/);
  assert.doesNotMatch(decision.plan.twiml, /twilio-stream\?/);
  assert.doesNotMatch(decision.plan.twiml, /<Say|<Play|<Gather|<Dial/);
  assert.equal(JSON.stringify(decision.plan).includes(TOKEN), false);
  assert.equal(JSON.stringify(decision.plan).includes(STREAM_SECRET), false);
});

test("the Twilio request keeps the token in the header only", () => {
  const decision = planVoiceTestCall({ ...ready, confirm: true });
  assert.equal(decision.action, "place");
  const req = decision.request;
  assert.deepEqual(req, buildVoiceTestCallRequest({
    accountSid: SID,
    authToken: TOKEN,
    from: ready.from,
    to: ready.to,
    twiml: decision.plan.twiml,
  }));
  assert.match(req.url, /\/Calls\.json$/);
  assert.equal(req.url.includes(TOKEN), false);
  assert.equal(req.body.includes(TOKEN), false);
  assert.equal(req.body.includes(SID), false);
  assert.match(req.headers.authorization, /^Basic /);
  const params = new URLSearchParams(req.body);
  assert.equal(params.get("To"), ready.to);
  assert.equal(params.get("From"), ready.from);
  assert.match(params.get("Twiml"), /<Connect><Stream /);
  assert.equal(params.get("StatusCallback"), null);
});

test("--confirm is off unless the flag is present", () => {
  assert.equal(parseVoiceTestCallArgs(["node", "script", "--to", "+15555550100", "--reference", "MT-20261107-TEST"]).confirm, false);
  assert.equal(parseVoiceTestCallArgs(["node", "script", "--confirm", "--to", "+15555550100"]).confirm, true);
  assert.equal(parseVoiceTestCallArgs(["node", "script", "--place"]).ok, false);
});

test("a local run with fake creds stops before any Twilio request", async () => {
  const { stdout, code } = await execFileAsync(process.execPath, [
    script,
    "--to",
    "+15555550100",
    "--reference",
    "MT-20261107-TEST",
  ], {
    cwd: root,
    env: {
      ...process.env,
      TWILIO_ACCOUNT_SID: SID,
      TWILIO_AUTH_TOKEN: TOKEN,
      TWILIO_PHONE_NUMBER: "+15555550199",
      VOICE_BRIDGE_STREAM_SECRET: STREAM_SECRET,
    },
  }).then(
    (result) => ({ stdout: result.stdout, code: 0 }),
    (err) => ({ stdout: err.stdout ?? "", code: err.code }),
  );
  assert.equal(code, 2);
  const body = JSON.parse(stdout);
  assert.equal(body.ok, false);
  assert.equal(body.error, "confirm_required");
  assert.equal(body.calledTwilio, false);
  assert.equal(body.plan.bridgeHost, DEFAULT_VOICE_BRIDGE_HOST);
  assert.equal(body.plan.reference, "MT-20261107-TEST");
  assert.equal(body.plan.speaksExtra, false);
  assert.equal(stdout.includes(TOKEN), false);
  assert.equal(stdout.includes(STREAM_SECRET), false);
  assert.deepEqual(body.plan.parameters, ["reference", "sessionKey", "consentAt", "streamToken"]);
  assert.equal(stdout.includes("Calls.json"), false);
});
