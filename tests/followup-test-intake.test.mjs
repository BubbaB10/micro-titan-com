// node --test tests/followup-test-intake.test.mjs
// Test intakes are not prospects. Fixtures below are invented
// shapes of the markers (reference, first name word, email domain,
// source). They are not a client export. `pg` is redirected to an
// in-memory fake; the connection string uses the .invalid domain
// so a missed redirect cannot reach a real host.
import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

await register(new URL("./helpers/pg-resolve-hook.mjs", import.meta.url));

const { isTestIntake } = await import("../app/lib/erm/followup-store.ts");
const { GET: cronGet } = await import("../app/api/cron/followups/route.ts");
const { GET: dueGet } = await import("../app/api/ops/followups-due/route.ts");
const { setFakePgMode, setFakeFollowupIntakes, fakePgQueries } = await import(
  "./helpers/fake-pg.mjs"
);

const REAL = {
  reference: "MT-20261103-RO6Y",
  clientName: "Scott Moffitt",
  contactEmail: "client@yahoo.com",
  source: "micro-titan.com/intake",
};

const CREATED = "2020-01-15T15:00:00.000Z";
const CRON_SECRET = "cron-test-secret";
const OPS_TOKEN = "ops-test-token";
const FAKE_URL = "postgres://followups-unit.invalid/none";

function intakeRow(fields) {
  return {
    id: fields.id,
    reference: fields.reference,
    lane: fields.lane ?? "Family",
    status: "received",
    created_at: fields.createdAt ?? CREATED,
    source: fields.source,
    client_name: fields.clientName,
    contact_email: fields.contactEmail,
  };
}

// Old enough that Day 1 is due. One real client, and one row for
// each live test marker.
function mixedRows() {
  return [
    intakeRow({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      reference: "MT-20261103-GIVW",
      clientName: "TEST Boone ERM",
      contactEmail: "erm-check@micro-titan.com",
      source: "micro-titan.com/intake",
      lane: "Business",
    }),
    intakeRow({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
      reference: "MT-20261105-GLS0",
      clientName: "Test Test",
      contactEmail: "gls0@example.com",
      source: "micro-titan.com/intake",
    }),
    intakeRow({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
      reference: "MT-20261105-H1OK",
      clientName: "Test Test",
      contactEmail: "h1ok@example.com",
      source: "micro-titan.com/intake",
    }),
    intakeRow({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
      reference: "MT-20261107-TEST",
      clientName: "TEST voice bridge",
      contactEmail: "bridge@example.invalid",
      source: "voice-bridge-test",
      lane: "Solo entrepreneur",
    }),
    intakeRow({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5",
      reference: REAL.reference,
      clientName: REAL.clientName,
      contactEmail: REAL.contactEmail,
      source: REAL.source,
    }),
  ];
}

test("a real client is not a test intake", () => {
  assert.equal(isTestIntake(REAL), false);
  assert.equal(
    isTestIntake({
      reference: "MT-20261108-AB12",
      clientName: "Testa Smith",
      contactEmail: "testa.smith@gmail.com",
      source: "micro-titan.com/intake",
    }),
    false,
  );
  assert.equal(
    isTestIntake({
      ...REAL,
      clientName: "The Test Family",
      contactEmail: "family@gmail.com",
    }),
    false,
  );
});

test("reference ending in -TEST is a test intake", () => {
  assert.equal(isTestIntake({ ...REAL, reference: "MT-20261107-TEST" }), true);
  assert.equal(isTestIntake({ ...REAL, reference: "MT-20261103-TESTX" }), false);
  assert.equal(isTestIntake({ ...REAL, reference: "MT-TEST-RO6Y" }), false);
});

test("client name's first word test is a test intake, and Testa is not", () => {
  assert.equal(isTestIntake({ ...REAL, clientName: "TEST Boone ERM" }), true);
  assert.equal(isTestIntake({ ...REAL, clientName: "Test Test" }), true);
  assert.equal(isTestIntake({ ...REAL, clientName: "  test  " }), true);
  assert.equal(isTestIntake({ ...REAL, clientName: "TeSt Boone" }), true);
  assert.equal(isTestIntake({ ...REAL, clientName: "Testa Smith" }), false);
  assert.equal(isTestIntake({ ...REAL, clientName: "Testa" }), false);
  assert.equal(isTestIntake({ ...REAL, clientName: "Contestant Boone" }), false);
});

test("example and reserved email domains are test intakes", () => {
  for (const contactEmail of [
    "a@example.com",
    "a@example.org",
    "a@example.net",
    "A@Example.COM",
    "bridge@example.invalid",
    "a@foo.test",
    "a@foo.example",
    "a@sub.invalid",
  ]) {
    assert.equal(isTestIntake({ ...REAL, contactEmail }), true, contactEmail);
  }
  for (const contactEmail of [
    "client@yahoo.com",
    "testa.smith@gmail.com",
    "test@yahoo.com",
    "person@mail.example.com",
    "person@notexample.com",
    "person@example.com.evil",
    "erm-check@micro-titan.com",
  ]) {
    assert.equal(isTestIntake({ ...REAL, contactEmail }), false, contactEmail);
  }
  // Another marker still wins when the name itself is not the word test.
  assert.equal(
    isTestIntake({
      reference: "MT-20261108-AB12",
      clientName: "Testa Smith",
      contactEmail: "testa@example.com",
      source: "micro-titan.com/intake",
    }),
    true,
  );
});

test("source containing test is a test intake", () => {
  assert.equal(isTestIntake({ ...REAL, source: "voice-bridge-test" }), true);
  assert.equal(isTestIntake({ ...REAL, source: "Voice-Bridge-TEST" }), true);
  assert.equal(isTestIntake({ ...REAL, source: "micro-titan.com/intake" }), false);
});

test("each live marker is a test and the yahoo client is not", () => {
  assert.equal(
    isTestIntake({
      reference: "MT-20261103-GIVW",
      clientName: "TEST Boone ERM",
      contactEmail: "erm-check@micro-titan.com",
      source: "micro-titan.com/intake",
    }),
    true,
  );
  assert.equal(
    isTestIntake({
      reference: "MT-20261105-GLS0",
      clientName: "Test Test",
      contactEmail: "gls0@example.com",
      source: "micro-titan.com/intake",
    }),
    true,
  );
  assert.equal(
    isTestIntake({
      reference: "MT-20261105-H1OK",
      clientName: "Test Test",
      contactEmail: "h1ok@example.com",
      source: "micro-titan.com/intake",
    }),
    true,
  );
  assert.equal(
    isTestIntake({
      reference: "MT-20261107-TEST",
      clientName: "TEST voice bridge",
      contactEmail: "bridge@example.invalid",
      source: "voice-bridge-test",
    }),
    true,
  );
  assert.equal(isTestIntake(REAL), false);
});

const ENV_KEYS = [
  "ERM_DATABASE_URL",
  "ERM_DATABASE_DATABASE_URL",
  "CRON_SECRET",
  "OPS_DASHBOARD_TOKEN",
];
const previousEnv = {};

function cronRequest() {
  return cronGet(
    new Request("http://localhost/api/cron/followups", {
      method: "GET",
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    }),
  );
}

function dueRequest() {
  return dueGet(
    new Request("http://localhost/api/ops/followups-due", {
      method: "GET",
      headers: { authorization: `Bearer ${OPS_TOKEN}` },
    }),
  );
}

describe("follow-up routes omit test intakes", { concurrency: 1 }, () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) previousEnv[key] = process.env[key];
    process.env.ERM_DATABASE_URL = FAKE_URL;
    delete process.env.ERM_DATABASE_DATABASE_URL;
    process.env.CRON_SECRET = CRON_SECRET;
    process.env.OPS_DASHBOARD_TOKEN = OPS_TOKEN;
    setFakePgMode("followups_due");
    setFakeFollowupIntakes(mixedRows());
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
    setFakePgMode("intake_missing");
    setFakeFollowupIntakes(null);
  });

  test("cron JSON keeps the real intake, drops TEST rows, and counts them", async () => {
    const first = await cronRequest();
    const second = await cronRequest();
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    const body = await first.json();
    const again = await second.json();
    assert.deepEqual(body, again);
    assert.equal(body.ok, true);
    assert.equal(body.job, "followups");
    assert.equal(body.writes, 0);
    assert.equal(body.clientMessages, 0);
    assert.equal(body.count, 1);
    assert.equal(body.excludedTestCount, 4);
    assert.equal(body.due.length, 1);
    assert.equal(body.due[0].reference, "MT-20261103-RO6Y");
    assert.equal(body.due[0].step, "day1");
    assert.equal(body.due[0].label, "Intake acknowledged");
    assert.deepEqual(Object.keys(body.due[0]).sort(), [
      "daysSinceIntake",
      "dueDate",
      "intakeStatus",
      "label",
      "lane",
      "reference",
      "step",
    ]);

    const raw = JSON.stringify(body);
    for (const hidden of [
      "MT-20261103-GIVW",
      "MT-20261105-GLS0",
      "MT-20261105-H1OK",
      "MT-20261107-TEST",
      "TEST Boone ERM",
      "Test Test",
      "TEST voice bridge",
      "Scott Moffitt",
      "example.com",
      "example.invalid",
      "voice-bridge-test",
      "yahoo.com",
      "micro-titan.com",
    ]) {
      assert.equal(raw.includes(hidden), false, hidden);
    }

    const intakeSql = fakePgQueries().find((query) => query.sql.includes("FROM intakes"));
    assert.ok(intakeSql);
    assert.match(intakeSql.sql, /JOIN clients/);
    assert.match(intakeSql.sql, /client_name/);
    assert.match(intakeSql.sql, /contact_email/);
    assert.match(intakeSql.sql, /i\.source/);
    assert.deepEqual(intakeSql.params[0], [
      "received",
      "completeness_check",
      "pitch_sent",
      "agreed",
    ]);
    assert.equal(
      fakePgQueries().some((query) => query.sql.startsWith("INSERT INTO")),
      false,
    );
    assert.equal(
      fakePgQueries().some((query) => query.sql.startsWith("UPDATE")),
      false,
    );
  });

  test("the owner due view uses the same exclusion and does not name tests", async () => {
    const res = await dueRequest();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.count, 1);
    assert.equal(body.due.length, 1);
    assert.equal(body.due[0].reference, "MT-20261103-RO6Y");
    assert.equal(body.due[0].step, "day1");
    const raw = JSON.stringify(body);
    assert.equal(raw.includes("MT-20261107-TEST"), false);
    assert.equal(raw.includes("MT-20261103-GIVW"), false);
    assert.equal(raw.includes("TEST Boone ERM"), false);
    assert.equal(raw.includes("example.com"), false);
    assert.equal(raw.includes("Scott Moffitt"), false);
  });
});
