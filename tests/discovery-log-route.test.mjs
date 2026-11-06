// node --test tests/discovery-log-route.test.mjs
// HTTP caller for ERM discovery logging. No live database, no live
// client, no call, no charge, no send. `pg` is redirected to an
// in-memory fake; the connection string uses the .invalid domain so
// a missed redirect cannot reach a real host.
import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "discovery-log", "route.ts"),
  "utf8",
);
const statusSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "discovery-status", "route.ts"),
  "utf8",
);
const storeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "discovery-call-store.ts"),
  "utf8",
);

await register(new URL("./helpers/pg-resolve-hook.mjs", import.meta.url));

const { POST } = await import("../app/api/ops/discovery-log/route.ts");
const { GET } = await import("../app/api/ops/discovery-status/route.ts");
const { Pool } = await import("pg");
const { Pool: FakePool, setFakePgMode, fakePgQueries } = await import("./helpers/fake-pg.mjs");

const TOKEN = "test-ops-token";
const FAKE_URL = "postgres://discovery-log-unit.invalid/none";
const SESSION_KEY = "CA-test-session-001";
const REFERENCE = "MT-20261105-TEST";
const TRANSCRIPT = [
  {
    speaker: "agent",
    text: "What is the first job, in your words?",
    at: "2026-11-05T18:00:00Z",
  },
  {
    speaker: "client",
    text: "The patio, before the reunion — I am not asking for a summary.",
    at: "2026-11-05T18:01:00Z",
  },
];

function validBody(overrides = {}) {
  return {
    reference: REFERENCE,
    sessionKey: SESSION_KEY,
    channel: "voice",
    formatChoice: "call",
    status: "completed",
    consentGiven: true,
    consentAt: "2026-11-05T17:55:00Z",
    scheduledAt: "2026-11-05T18:00:00Z",
    startedAt: "2026-11-05T18:00:00Z",
    endedAt: "2026-11-05T18:20:00Z",
    durationSeconds: 1200,
    transcript: TRANSCRIPT,
    recordingRef: "REtestrecordingref0000000000000001",
    recommendation: "approve",
    recommendationReason: "Client named the first job in their own words.",
    presentationRef: null,
    ...overrides,
  };
}

function post(body, { token = TOKEN, raw } = {}) {
  const headers = { "content-type": "application/json" };
  if (token !== null) headers.authorization = `Bearer ${token}`;
  return POST(
    new Request("http://localhost/api/ops/discovery-log", {
      method: "POST",
      headers,
      body: raw ?? JSON.stringify(body),
    }),
  );
}

function getStatus(reference, { token = TOKEN } = {}) {
  const headers = {};
  if (token !== null) headers.authorization = `Bearer ${token}`;
  const query = reference === undefined ? "" : `?reference=${encodeURIComponent(reference)}`;
  return GET(
    new Request(`http://localhost/api/ops/discovery-status${query}`, {
      method: "GET",
      headers,
    }),
  );
}

function sqlTexts() {
  return fakePgQueries().map((query) => query.sql);
}

function insertCalls() {
  return fakePgQueries().filter((query) => query.sql.startsWith("INSERT INTO"));
}

describe("discovery log and status routes", { concurrency: 1 }, () => {
  beforeEach(() => {
    process.env.OPS_DASHBOARD_TOKEN = TOKEN;
    process.env.ERM_DATABASE_URL = FAKE_URL;
    delete process.env.ERM_DATABASE_DATABASE_URL;
    setFakePgMode("intake_missing");
  });

  test("pg import is the unit fake and never a live driver", () => {
    assert.equal(Pool, FakePool);
    assert.equal(FAKE_URL.includes(".invalid"), true);
  });

  test("token gate shapes: missing token is 503, wrong token is 401", async () => {
    delete process.env.OPS_DASHBOARD_TOKEN;
    const missing = await post(validBody(), { token: null });
    assert.equal(missing.status, 503);
    assert.deepEqual(await missing.json(), { ok: false, error: "ops_not_configured" });
    const statusUnconfigured = await getStatus(REFERENCE, { token: null });
    assert.equal(statusUnconfigured.status, 503);
    assert.deepEqual(await statusUnconfigured.json(), {
      ok: false,
      error: "ops_not_configured",
    });

    process.env.OPS_DASHBOARD_TOKEN = TOKEN;
    const wrong = await post(validBody(), { token: "not-the-token" });
    assert.equal(wrong.status, 401);
    assert.deepEqual(await wrong.json(), { ok: false, error: "unauthorized" });
    const statusWrong = await getStatus(REFERENCE, { token: "not-the-token" });
    assert.equal(statusWrong.status, 401);
    assert.deepEqual(await statusWrong.json(), { ok: false, error: "unauthorized" });
    const statusNoHeader = await getStatus(REFERENCE, { token: null });
    assert.equal(statusNoHeader.status, 401);
    assert.deepEqual(await statusNoHeader.json(), { ok: false, error: "unauthorized" });
    assert.equal(sqlTexts().length, 0);
  });

  test("missing database is 503 not_configured and writes nothing", async () => {
    delete process.env.ERM_DATABASE_URL;
    delete process.env.ERM_DATABASE_DATABASE_URL;
    const recorded = await post(validBody());
    assert.equal(recorded.status, 503);
    assert.deepEqual(await recorded.json(), { ok: false, error: "not_configured" });
    const status = await getStatus(REFERENCE);
    assert.equal(status.status, 503);
    assert.deepEqual(await status.json(), { ok: false, error: "not_configured" });
    assert.equal(sqlTexts().length, 0);
  });

  test("unknown reference is 404 and the store writes nothing", async () => {
    setFakePgMode("intake_missing");
    const res = await post(validBody());
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { ok: false, error: "intake_not_found" });
    assert.equal(insertCalls().length, 0);
    assert.equal(sqlTexts().some((sql) => sql.startsWith("UPDATE")), false);
    const status = await getStatus(REFERENCE);
    assert.equal(status.status, 404);
    assert.deepEqual(await status.json(), { ok: false, error: "intake_not_found" });
    assert.equal(insertCalls().length, 0);
  });

  test("idempotent session_key returns 200 already_exists and does not insert", async () => {
    setFakePgMode("already_exists");
    const res = await post(validBody());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      ok: true,
      reference: REFERENCE,
      erm: "already_exists",
      discoveryCallId: "33333333-3333-3333-3333-333333333333",
      sessionKey: SESSION_KEY,
    });
    const sessionLookup = fakePgQueries().find((query) => query.sql.includes("WHERE session_key"));
    assert.deepEqual(sessionLookup.params, [SESSION_KEY]);
    assert.equal(insertCalls().length, 0);
    assert.equal(sqlTexts().some((sql) => sql.startsWith("UPDATE")), false);
  });

  test("happy path writes the caller session key and the verbatim transcript", async () => {
    setFakePgMode("written");
    const res = await post(validBody());
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.erm, "written");
    assert.equal(payload.sessionKey, SESSION_KEY);
    assert.equal(payload.discoveryCallId, "44444444-4444-4444-4444-444444444444");
    const inserted = fakePgQueries().find((query) =>
      query.sql.startsWith("INSERT INTO discovery_calls"),
    );
    assert.equal(inserted.params[3], SESSION_KEY);
    assert.equal(inserted.params[13], JSON.stringify(TRANSCRIPT));
    assert.equal(inserted.params[14], "REtestrecordingref0000000000000001");
    assert.equal(JSON.stringify(inserted.params).includes("audio"), false);
    const intakeUpdate = sqlTexts().find((sql) => sql.startsWith("UPDATE intakes"));
    assert.match(intakeUpdate, /discovery_booked/);
    assert.doesNotMatch(intakeUpdate, /setup/);
  });

  test("route never invents sessionKey, never stores audio, and never sends", async () => {
    const missingKey = validBody();
    delete missingKey.sessionKey;
    const missing = await post(missingKey);
    assert.equal(missing.status, 400);
    assert.deepEqual(await missing.json(), { ok: false, error: "bad_session_key" });
    assert.equal(sqlTexts().length, 0);

    setFakePgMode("written");
    const audio = await post(validBody({ audioBase64: "UklGRg==" }));
    assert.equal(audio.status, 400);
    assert.deepEqual(await audio.json(), { ok: false, error: "audio_not_allowed" });
    assert.equal(sqlTexts().length, 0);

    const textWithRecording = await post(
      validBody({ channel: "text", formatChoice: "text", recordingRef: "REshouldnotstore" }),
    );
    assert.equal(textWithRecording.status, 400);
    assert.deepEqual(await textWithRecording.json(), { ok: false, error: "bad_recording_ref" });
    assert.equal(sqlTexts().length, 0);

    const noConsent = await post(validBody({ consentGiven: false }));
    assert.equal(noConsent.status, 400);
    assert.deepEqual(await noConsent.json(), { ok: false, error: "consent_required" });
    assert.equal(sqlTexts().length, 0);

    for (const src of [logSource, statusSource]) {
      assert.doesNotMatch(src, /randomUUID|randomBytes|crypto\.|Date\.now\(/);
      assert.doesNotMatch(src, /resend|twilio|sendgrid|fetch\(|axios|nodemailer/i);
      assert.doesNotMatch(src, /\b(INSERT INTO|UPDATE\s+\w+|DELETE\s+FROM)\b/i);
      assert.doesNotMatch(src, /sessionKey\s*\?\?/);
    }
    assert.match(logSource, /never invents one/);
    assert.match(logSource, /Audio bytes are rejected/);
    assert.match(logSource, /does not place a call, charge/);
    assert.match(statusSource, /nothing here places a/);
  });

  test("happy-path body validation rejects a missing transcript and a missing sessionKey", async () => {
    const noTranscript = validBody();
    delete noTranscript.transcript;
    const transcript = await post(noTranscript);
    assert.equal(transcript.status, 400);
    assert.deepEqual(await transcript.json(), { ok: false, error: "bad_transcript" });

    const emptyTranscript = await post(validBody({ transcript: [] }));
    assert.equal(emptyTranscript.status, 400);
    assert.deepEqual(await emptyTranscript.json(), { ok: false, error: "bad_transcript" });

    const noKey = validBody();
    delete noKey.sessionKey;
    const session = await post(noKey);
    assert.equal(session.status, 400);
    assert.deepEqual(await session.json(), { ok: false, error: "bad_session_key" });
    assert.equal(sqlTexts().length, 0);
  });

  test("owner status returns the stored transcript and does not write", async () => {
    setFakePgMode("status_found");
    const found = await getStatus(REFERENCE);
    assert.equal(found.status, 200);
    assert.deepEqual(await found.json(), {
      ok: true,
      reference: REFERENCE,
      discovery: true,
      channel: "voice",
      status: "completed",
      recommendation: "approve",
      recommendationReason: "Client named the first job in their own words.",
      transcript: [
        {
          speaker: "client",
          text: "The patio, before the reunion — I am not asking for a summary.",
          at: "2026-11-05T18:01:00Z",
        },
      ],
      presentationRef: null,
    });
    assert.equal(insertCalls().length, 0);

    setFakePgMode("written");
    const none = await getStatus(REFERENCE);
    assert.equal(none.status, 200);
    assert.deepEqual(await none.json(), {
      ok: true,
      reference: REFERENCE,
      discovery: false,
    });
    assert.equal(insertCalls().length, 0);
  });

  test("a store failure is 502 and still writes nothing new", async () => {
    setFakePgMode("throw");
    const res = await post(validBody());
    assert.equal(res.status, 502);
    assert.deepEqual(await res.json(), { ok: false, error: "discovery_log_failed" });
    assert.equal(insertCalls().length, 0);
    const status = await getStatus(REFERENCE);
    assert.equal(status.status, 502);
    assert.deepEqual(await status.json(), { ok: false, error: "discovery_status_failed" });
  });

  test("routes call the merged store and stay token-gated", () => {
    assert.match(logSource, /recordDiscoveryCall/);
    assert.match(logSource, /intake_not_found/);
    assert.match(logSource, /erm: "already_exists"/);
    assert.match(logSource, /erm: "written"/);
    assert.match(logSource, /status: 404/);
    assert.match(logSource, /status: 503/);
    assert.match(logSource, /status: 401/);
    assert.match(logSource, /OPS_DASHBOARD_TOKEN/);
    assert.match(statusSource, /discoveryCallStatus/);
    assert.match(statusSource, /OPS_DASHBOARD_TOKEN/);
    assert.match(statusSource, /discovery: false/);
    assert.match(storeSource, /session_key/);
    assert.match(storeSource, /intake_not_found/);
    assert.doesNotMatch(storeSource, /UPDATE discovery_calls/);
    assert.doesNotMatch(storeSource, /DELETE FROM discovery_calls/);
    assert.doesNotMatch(storeSource, /SET status = 'setup'/);
    assert.doesNotMatch(logSource, /contactEmail|contactPhone|contact_email|contact_phone/);
    assert.doesNotMatch(statusSource, /contactEmail|contactPhone|contact_email|contact_phone/);
  });
});
