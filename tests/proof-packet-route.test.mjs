// node --test tests/proof-packet-route.test.mjs
// Owner routes for an internal proof packet. No live database, no
// live client, no send. `pg` is redirected to the in-memory fake.
// The packet is the fictional MT-20261107-TEST example. Agreement
// amounts in that example are not charged and are not an earnings claim.
import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await register(new URL("./helpers/pg-resolve-hook.mjs", import.meta.url));

const { GET, POST } = await import("../app/api/ops/proof-packet/route.ts");
const { POST: SIGN } = await import("../app/api/ops/proof-packet-sign/route.ts");
const { Pool } = await import("pg");
const { Pool: FakePool, setFakePgMode, fakePgQueries } = await import("./helpers/fake-pg.mjs");
const { approvedProofPacketHeading, APPROVED_PROOF_PACKET_INTRO } = await import(
  "../app/lib/erm/proof-packet-store.ts"
);

const TOKEN = "test-ops-token";
const SIGNING = "test-owner-signing-token";
const FAKE_URL = "postgres://proof-packet-unit.invalid/none";
const REFERENCE = "MT-20261107-TEST";

function exampleSections() {
  return {
    header: {
      clientDisplayName: "TEST Solo Example Co",
      lane: "Solo entrepreneur",
      agent: "Grok Bot",
      agentAccountOwner: "Client (TEST Solo Example Co)",
      preparedBy: "Grok Bot (Micro Titan ops)",
      version: "v0 draft · Nov 7, 2026",
    },
    authorship: [
      {
        item: "Intake reminder routine config",
        writtenBy: "Grok Bot (client's agent)",
        mergedBy: "Owner",
        verifiedBy: "Grok Bot (Micro Titan ops), live check",
        evidence: "COMMIT:0000test · LOG:routine-run@2026-11-07 10:02 CT",
      },
      {
        item: "This packet",
        writtenBy: "Grok Bot (Micro Titan ops)",
        mergedBy: "—",
        verifiedBy: "Owner review pending",
        evidence: "this file",
      },
    ],
    timeline: [
      { stage: "received", when: "Nov 7, 9:00 AM", actor: "site intake form", evidence: "ERM:intakes.TEST-0001" },
      { stage: "completeness_check", when: "Nov 7, 9:20 AM", actor: "owner", evidence: "ERM:audit_log.TEST-0002" },
      { stage: "pitch_sent", when: "Nov 7, 9:40 AM", actor: "owner", evidence: "ERM:pitch_sheets.TEST-0003 (sent_at)" },
      { stage: "agreed", when: "Nov 7, 10:05 AM", actor: "client, method=site", evidence: "ERM:agreements.TEST-0004" },
      {
        stage: "discovery_paid",
        when: "—",
        actor: "—",
        evidence: "NOT RUN: no test charges allowed",
      },
      { stage: "discovery_booked", when: "Nov 7, 10:30 AM", actor: "owner", evidence: "ERM:discovery_calls.TEST-0005" },
      {
        stage: "setup → switchover",
        when: "Nov 7, 1:00–3:00 PM",
        actor: "Grok Bot / owner",
        evidence: "ERM:change_log.TEST-0006..0008",
      },
      { stage: "first_project", when: "Nov 7, 3:15 PM", actor: "Grok Bot", evidence: "ERM:jobs.TEST-0009" },
      {
        stage: "proof_and_handoff",
        when: "Nov 7, 4:00 PM",
        actor: "this packet",
        evidence: "this packet",
      },
    ],
    money: [
      {
        line: "Discovery fee (credited)",
        amount: "$500",
        status: "not charged (test)",
        evidence: "ERM:agreements.TEST-0004.discovery_cents",
      },
      {
        line: "Program total",
        amount: "$5,500",
        status: "—",
        evidence: "ERM:agreements.TEST-0004.total_cents",
      },
      {
        line: "Balance after credit",
        amount: "$5,000",
        status: "not charged (test)",
        evidence: "ERM:agreements.TEST-0004.after_credit_cents",
      },
      {
        line: "Monthly operate plan (optional)",
        amount: "$350/month",
        status: "not started",
        evidence: "ERM:agreements.TEST-0004.monthly_cents",
      },
    ],
    discovery: [
      { field: "Channel / format", value: "voice / call", evidence: "ERM:discovery_calls.TEST-0005" },
      { field: "Consent", value: "given, Nov 7, 10:31 AM", evidence: "ERM:discovery_calls.TEST-0005.consent_at" },
      { field: "Duration", value: "14 min", evidence: "ERM:discovery_calls.TEST-0005.duration_seconds" },
      {
        field: "Recommendation",
        value: 'approve: "single repeatable intake-reminder task"',
        evidence: "ERM:discovery_calls.TEST-0005.recommendation_reason",
      },
      { field: "Presentation", value: "reviewed → shown", evidence: "ERM:presentations.TEST-0010" },
    ],
    setup: [
      {
        change: "Weekday 10 AM reminder routine",
        kind: "config_changed",
        actor: "owner",
        fromTo: "none → enabled",
        evidence: "ERM:change_log.TEST-0006",
      },
      {
        change: "Calendar read connected",
        kind: "integration_added",
        actor: "owner",
        fromTo: "— → read-only",
        evidence: "ERM:change_log.TEST-0007",
      },
    ],
    access: [
      {
        system: "Client calendar (read-only)",
        grantedTo: "client's Grok Bot",
        grantedOrRevoked: "granted Nov 7, 1:10 PM",
        evidence: "ERM:change_log.TEST-0008 (kind=access)",
      },
      {
        system: "Micro Titan setup access",
        grantedTo: "Micro Titan ops",
        grantedOrRevoked: "revoked at handoff, 4:05 PM",
        evidence: "ERM:change_log.TEST-0011",
      },
    ],
    checks: [
      {
        check: "Remind me each weekday at 10 of tomorrow's appointments",
        method: "Watched 1 live run",
        result: "PASS",
        evidence: "LOG:routine-run@2026-11-07 10:02 CT · SHOT:test-run.png",
      },
      {
        check: "Nothing goes out to my customers without my OK",
        method: "Reviewed the routine config",
        result: "PASS",
        evidence: "SHOT:test-config.png",
      },
      {
        check: "Runs 5 days in a row",
        method: "Needs 5 days",
        result: "NOT_RUN",
        evidence: "LOG:routine-schedule@2026-11-07 16:00 CT",
        notRunReason: "Needs 5 weekday runs; this test job has one watched run.",
        runByDate: "2026-11-12",
      },
    ],
    "follow-ups": [
      {
        step: "day1",
        channel: "manual_note",
        actor: "owner",
        when: "Nov 7",
        evidence: "ERM:followups.TEST-0012",
      },
    ],
    wording: [
      {
        text: "We don't sell you an agent, and we don't just build you software. We wire the agent into your real work, prove each job with a record, and keep operating it — so the work stops depending on you being available.",
        source: "app/components/AgentSetup.tsx TYING_LINE",
        evidence: "app/components/AgentSetup.tsx TYING_LINE",
      },
      {
        text: "The discovery fee is credited toward the program total. There is no time limit on that credit.",
        source: "app/components/AgentSetup.tsx ~L98",
        evidence: "app/components/AgentSetup.tsx ~L98",
      },
      {
        text: "A passing software check alone is not proof of a business outcome.",
        source: "app/studio/page.tsx FAQ",
        evidence: "app/studio/page.tsx FAQ",
      },
    ],
    "not-proven": [
      "The discovery payment and balance were not charged (test). Payment rows are absent by design.",
      "Check 3 (5-day run) is not yet proven.",
      "This packet says nothing about business results for the client.",
    ],
  };
}

function exampleBody(overrides = {}) {
  return {
    reference: REFERENCE,
    heading: approvedProofPacketHeading(REFERENCE),
    intro: APPROVED_PROOF_PACKET_INTRO,
    sections: exampleSections(),
    ...overrides,
  };
}

function post(body, { token = TOKEN, raw } = {}) {
  const headers = { "content-type": "application/json" };
  if (token !== null) headers.authorization = `Bearer ${token}`;
  return POST(
    new Request("http://localhost/api/ops/proof-packet", {
      method: "POST",
      headers,
      body: raw ?? JSON.stringify(body),
    }),
  );
}

function getPacket(reference = REFERENCE, { token = TOKEN } = {}) {
  const headers = {};
  if (token !== null) headers.authorization = `Bearer ${token}`;
  const query = reference === undefined ? "" : `?reference=${encodeURIComponent(reference)}`;
  return GET(
    new Request(`http://localhost/api/ops/proof-packet${query}`, {
      method: "GET",
      headers,
    }),
  );
}

function sign(body, { token = TOKEN, signingToken = SIGNING } = {}) {
  const headers = { "content-type": "application/json" };
  if (token !== null) headers.authorization = `Bearer ${token}`;
  if (signingToken !== null) headers["x-owner-signing-token"] = signingToken;
  return SIGN(
    new Request("http://localhost/api/ops/proof-packet-sign", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );
}

function sqlTexts() {
  return fakePgQueries().map((query) => query.sql);
}

describe("proof packet routes", { concurrency: 1 }, () => {
  beforeEach(() => {
    process.env.OPS_DASHBOARD_TOKEN = TOKEN;
    process.env.OWNER_SIGNING_TOKEN = SIGNING;
    process.env.ERM_DATABASE_URL = FAKE_URL;
    delete process.env.ERM_DATABASE_DATABASE_URL;
    setFakePgMode("written");
  });

  test("pg import is the unit fake and never a live driver", () => {
    assert.equal(Pool, FakePool);
    assert.equal(FAKE_URL.includes(".invalid"), true);
  });

  test("token gate: missing token is 503, wrong token is 401, and nothing is written", async () => {
    delete process.env.OPS_DASHBOARD_TOKEN;
    const missing = await post(exampleBody(), { token: null });
    assert.equal(missing.status, 503);
    assert.deepEqual(await missing.json(), { ok: false, error: "ops_not_configured" });
    const statusMissing = await getPacket(REFERENCE, { token: null });
    assert.equal(statusMissing.status, 503);
    const signMissing = await sign({ reference: REFERENCE, signedBy: "owner" }, { token: null });
    assert.equal(signMissing.status, 503);

    process.env.OPS_DASHBOARD_TOKEN = TOKEN;
    const wrong = await post(exampleBody(), { token: "not-the-token" });
    assert.equal(wrong.status, 401);
    assert.deepEqual(await wrong.json(), { ok: false, error: "unauthorized" });
    const signWrong = await sign({ reference: REFERENCE, signedBy: "owner" }, { token: "not-the-token" });
    assert.equal(signWrong.status, 401);
    assert.equal(sqlTexts().length, 0);
  });

  test("an ops token alone cannot sign, and a client signedBy field is ignored", async () => {
    delete process.env.OWNER_SIGNING_TOKEN;
    const unset = await sign({ reference: REFERENCE, signedBy: "owner" });
    assert.equal(unset.status, 503);
    assert.deepEqual(await unset.json(), { ok: false, error: "owner_signing_not_configured" });
    assert.equal(sqlTexts().length, 0);

    process.env.OWNER_SIGNING_TOKEN = "   ";
    const blank = await sign({ reference: REFERENCE, signedBy: "owner" }, { signingToken: "   " });
    assert.equal(blank.status, 503);
    assert.equal(sqlTexts().length, 0);

    process.env.OWNER_SIGNING_TOKEN = SIGNING;
    const opsOnly = await sign(
      { reference: REFERENCE, signedBy: "owner" },
      { signingToken: null },
    );
    assert.equal(opsOnly.status, 401);
    assert.deepEqual(await opsOnly.json(), { ok: false, error: "owner_signing_required" });
    const wrongSigning = await sign(
      { reference: REFERENCE, signedBy: "owner" },
      { signingToken: "not-the-signing-token" },
    );
    assert.equal(wrongSigning.status, 401);
    assert.deepEqual(await wrongSigning.json(), { ok: false, error: "owner_signing_required" });
    assert.equal(sqlTexts().length, 0);

    const signSource = fs.readFileSync(
      path.join(root, "app", "api", "ops", "proof-packet-sign", "route.ts"),
      "utf8",
    );
    assert.match(signSource, /timingSafeEqual/);
    assert.match(signSource, /OWNER_SIGNING_TOKEN/);
    assert.match(signSource, /ignored/i);
  });

  test("rejects a claim with no evidence and writes nothing", async () => {
    const sections = exampleSections();
    sections.authorship[0].evidence = "";
    const res = await post(exampleBody({ sections }));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, error: "missing_evidence" });
    assert.equal(sqlTexts().length, 0);
    const checks = exampleSections();
    checks.checks[2].evidence = "—";
    const dash = await post(exampleBody({ sections: checks }));
    assert.equal(dash.status, 400);
    assert.deepEqual(await dash.json(), { ok: false, error: "missing_evidence" });
    assert.equal(sqlTexts().length, 0);
  });

  test("creates the TEST example, keeps the NOT_RUN check, and signs as owner", async () => {
    const created = await post(exampleBody());
    assert.equal(created.status, 200);
    const createdBody = await created.json();
    assert.equal(createdBody.ok, true);
    assert.equal(createdBody.erm, "written");
    assert.equal(createdBody.reference, REFERENCE);
    assert.equal(createdBody.status, "draft");
    assert.equal(createdBody.test, true);
    assert.equal(createdBody.sharedWithClient, false);
    assert.equal(createdBody.packetId, "packet-1");

    const packetInsert = fakePgQueries().find((query) => query.sql.startsWith("INSERT INTO proof_packets"));
    assert.equal(packetInsert.params[2], REFERENCE);
    assert.equal(packetInsert.params[3], true);
    assert.equal(packetInsert.params[4], approvedProofPacketHeading(REFERENCE));
    assert.equal(packetInsert.params[5], APPROVED_PROOF_PACKET_INTRO);
    const storedDocument = JSON.parse(packetInsert.params[6]);
    assert.equal(storedDocument.checks, undefined);
    assert.equal(storedDocument.authorship, undefined);
    assert.equal(storedDocument.header.clientDisplayName, "TEST Solo Example Co");
    assert.ok(storedDocument["not-proven"].length > 0);
    assert.equal(sqlTexts().some((sql) => sql.startsWith("DELETE FROM proof_packet")), false);

    const notRun = fakePgQueries().find(
      (query) => query.sql.startsWith("INSERT INTO proof_packet_checks") && query.params[4] === "NOT_RUN",
    );
    assert.ok(notRun);
    assert.equal(notRun.params[2], "Runs 5 days in a row");
    assert.equal(notRun.params[5], "LOG:routine-schedule@2026-11-07 16:00 CT");
    assert.equal(notRun.params[6], "Needs 5 weekday runs; this test job has one watched run.");
    assert.equal(notRun.params[7], "2026-11-12");

    const read = await getPacket();
    assert.equal(read.status, 200);
    const readBody = await read.json();
    assert.equal(readBody.sharedWithClient, false);
    assert.equal(readBody.packet.test, true);
    assert.equal(readBody.packet.status, "draft");
    assert.equal(readBody.packet.heading, approvedProofPacketHeading(REFERENCE));
    assert.equal(readBody.packet.sections.checks[2].result, "NOT_RUN");
    assert.equal(readBody.packet.sections.checks[2].notRunReason, notRun.params[6]);
    assert.equal(readBody.packet.sections.checks[2].runByDate, "2026-11-12");
    assert.equal(readBody.packet.sections.header.clientDisplayName, "TEST Solo Example Co");
    assert.equal(JSON.stringify(readBody).includes("example.invalid"), false);

    const signed = await sign({ reference: REFERENCE, signedBy: "client" });
    assert.equal(signed.status, 200);
    const signedBody = await signed.json();
    assert.equal(signedBody.ok, true);
    assert.equal(signedBody.erm, "signed");
    assert.equal(signedBody.signedBy, "owner");
    assert.equal(signedBody.test, true);
    assert.equal(signedBody.sharedWithClient, false);
    assert.equal(signedBody.ownerSignedAt, "2026-11-07T22:00:00.000Z");
    const signUpdate = fakePgQueries().find((query) => query.sql.includes("status = 'signed'"));
    assert.deepEqual(signUpdate.params, ["owner", "packet-1"]);

    const after = await getPacket();
    const afterBody = await after.json();
    assert.equal(afterBody.packet.status, "signed");
    assert.equal(afterBody.packet.signedBy, "owner");
    assert.equal(afterBody.packet.test, true);

    const replacement = await post(exampleBody());
    assert.equal(replacement.status, 409);
    assert.equal((await replacement.json()).error, "already_signed");
  });

  test("unknown intake writes nothing", async () => {
    setFakePgMode("intake_missing");
    const res = await post(exampleBody());
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { ok: false, error: "intake_not_found" });
    assert.equal(sqlTexts().some((sql) => sql.startsWith("INSERT INTO proof_packets")), false);
  });

  test("route files are the ops token gate only", () => {
    for (const rel of ["app/api/ops/proof-packet/route.ts", "app/api/ops/proof-packet-sign/route.ts"]) {
      const src = fs.readFileSync(path.join(root, rel), "utf8");
      assert.match(src, /OPS_DASHBOARD_TOKEN/);
      assert.match(src, /sharedWithClient: false/);
      assert.doesNotMatch(src, /from ["'].*receipts|\/api\/receipts/);
    }
    const signSource = fs.readFileSync(
      path.join(root, "app", "api", "ops", "proof-packet-sign", "route.ts"),
      "utf8",
    );
    assert.match(signSource, /OWNER_SIGNING_TOKEN/);
  });
});
