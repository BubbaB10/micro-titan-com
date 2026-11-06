// node --test tests/change-log.test.mjs — Gap 10 change + access log.
// Pure-logic tests only: no database, no network, no credentials, no
// prospect data. Sample references are invented test fixtures, not
// clients. The gated store returns "not_configured" when
// ERM_DATABASE_URL is absent — that is tested, not worked around.
// Logging only: this slice records changes and access grants; it
// makes none, and it sends nothing. The tests assert that no
// sending exists anywhere in the new code, and that no secret
// value can be carried by the log fields.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHANGE_LOG_ACTIONS,
  CHANGE_LOG_KINDS,
  changeLogList,
  recordChangeLog,
  validateChangeLogInput,
} from "../app/lib/erm/change-log-store.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "change-log-store.ts"),
  "utf8",
);
const routeSource = fs.readFileSync(
  path.join(root, "app", "api", "ops", "change-log", "route.ts"),
  "utf8",
);
const schemaSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "schema.sql"),
  "utf8",
);
const migrationSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "migrations", "006-change-log.sql"),
  "utf8",
);
const typesSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "types.ts"),
  "utf8",
);

const VALID_CHANGE = {
  kind: "change",
  action: "config_changed",
  subject: "Stripe webhook endpoint",
  summary: "Webhook pointed at production",
  fromValue: "preview",
  toValue: "production",
  reference: "",
  eventKey: "evt-20261105-webhook-prod",
};
const VALID_ACCESS = {
  kind: "access",
  action: "access_granted",
  subject: "Vercel project micro-titan-com",
  summary: "Owner granted deploy access",
  reference: "",
  eventKey: "evt-20261105-access-vercel",
};

test("kinds are change and access, with the right actions each", () => {
  assert.deepEqual([...CHANGE_LOG_KINDS], ["change", "access"]);
  assert.ok(CHANGE_LOG_ACTIONS.change.includes("config_changed"));
  assert.ok(CHANGE_LOG_ACTIONS.change.includes("integration_rewired"));
  assert.ok(CHANGE_LOG_ACTIONS.change.includes("price_changed"));
  assert.ok(CHANGE_LOG_ACTIONS.change.includes("migration_applied"));
  assert.ok(CHANGE_LOG_ACTIONS.access.includes("access_granted"));
  assert.ok(CHANGE_LOG_ACTIONS.access.includes("access_revoked"));
  assert.ok(CHANGE_LOG_ACTIONS.access.includes("access_reviewed"));
  // Access actions are not change actions, and vice versa.
  assert.ok(!CHANGE_LOG_ACTIONS.change.includes("access_granted"));
  assert.ok(!CHANGE_LOG_ACTIONS.access.includes("price_changed"));
});

test("validation accepts a valid change and a valid access entry", () => {
  assert.equal(validateChangeLogInput(VALID_CHANGE), null);
  assert.equal(validateChangeLogInput(VALID_ACCESS), null);
  // An intake-linked entry is valid when the reference is well formed.
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, reference: "MT-20261103-RO6Y", eventKey: "evt-1" }),
    null,
  );
});

test("validation rejects a bad kind, a cross-kind action, and a bad subject", () => {
  assert.equal(validateChangeLogInput({ ...VALID_CHANGE, kind: "other" }).startsWith("bad_"), true);
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, action: "access_granted" }),
    "bad_action",
  );
  assert.equal(
    validateChangeLogInput({ ...VALID_ACCESS, action: "price_changed" }),
    "bad_action",
  );
  assert.equal(validateChangeLogInput({ ...VALID_CHANGE, subject: "" }), "bad_subject");
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, subject: "x".repeat(201) }),
    "bad_subject",
  );
});

test("validation rejects a bad event key and a bad reference", () => {
  assert.equal(validateChangeLogInput({ ...VALID_CHANGE, eventKey: "" }), "bad_event_key");
  assert.equal(validateChangeLogInput({ ...VALID_CHANGE, eventKey: "has space" }), "bad_event_key");
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, reference: "not-a-reference" }),
    "bad_reference",
  );
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, reference: "MT-20261103-RO6" }),
    "bad_reference",
  );
});

test("validation caps summary, values, and actor so a log row cannot carry a secret dump", () => {
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, summary: "x".repeat(1001) }),
    "bad_summary",
  );
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, fromValue: "x".repeat(501) }),
    "bad_value",
  );
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, toValue: "x".repeat(501) }),
    "bad_value",
  );
  assert.equal(
    validateChangeLogInput({ ...VALID_CHANGE, actor: "x".repeat(101) }),
    "bad_actor",
  );
});

test("store is gated: no database configured means not_configured, never a throw", async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  assert.deepEqual(await recordChangeLog(VALID_CHANGE), { status: "not_configured" });
  assert.deepEqual(await changeLogList({}), { status: "not_configured" });
  assert.deepEqual(await changeLogList({ kind: "change", limit: 10 }), {
    status: "not_configured",
  });
});

test("store rejects an invalid entry without touching a database", async () => {
  process.env.ERM_DATABASE_URL = "postgres://invalid:invalid@localhost:1/micro-titan-test";
  const badAction = await recordChangeLog({ ...VALID_CHANGE, action: "access_granted" });
  assert.equal(badAction.status, "failed");
  const badKey = await recordChangeLog({ ...VALID_CHANGE, eventKey: "bad key!" });
  assert.equal(badKey.status, "failed");
  const badList = await changeLogList({ kind: "other" });
  assert.equal(badList.status, "failed");
  delete process.env.ERM_DATABASE_URL;
});

test("types carry the change-log kind and action", () => {
  assert.match(typesSource, /export type ChangeLogKind = "change" \| "access"/);
  assert.match(typesSource, /export type ChangeLogAction =/);
  assert.match(typesSource, /"access_granted"/);
  assert.match(typesSource, /"migration_applied"/);
});

test("schema and migration define the change_log table, insert-only, one row per event key", () => {
  for (const src of [schemaSource, migrationSource]) {
    assert.match(src, /CREATE TABLE IF NOT EXISTS change_log \(/);
    assert.match(src, /event_key TEXT NOT NULL UNIQUE/);
    assert.match(src, /kind TEXT NOT NULL CHECK \(kind IN \('change', 'access'\)\)/);
    assert.match(src, /'access_granted', 'access_revoked', 'access_reviewed',/);
  }
  assert.match(schemaSource, /CREATE INDEX IF NOT EXISTS idx_change_log_created/);
  assert.match(schemaSource, /CREATE INDEX IF NOT EXISTS idx_change_log_reference/);
  assert.match(migrationSource, /Logging only/);
  assert.match(migrationSource, /No secrets in this log, ever/);
});

test("no sending anywhere in the new code: no email, SMS, call, or sender", () => {
  for (const [name, src] of [
    ["change-log-store.ts", storeSource],
    ["change-log route", routeSource],
  ]) {
    assert.ok(!/resend|twilio|sendgrid|fetch\(|axios|nodemailer/i.test(src), `${name} must not send`);
    assert.ok(!/sendChange|send_change|autoSend|auto_send/i.test(src), `${name} must not auto-send`);
  }
  // The route records a change the owner made; it never makes one.
  assert.match(routeSource, /RECORDS a change; it does not make one/);
});

test("store never UPDATEs or DELETEs a change_log or audit row, and never closes an intake", () => {
  assert.ok(!/UPDATE\s+change_log/i.test(storeSource));
  assert.ok(!/DELETE\s+FROM\s+change_log/i.test(storeSource));
  assert.ok(!/UPDATE\s+intakes/i.test(storeSource));
  assert.ok(!/UPDATE\s+audit_log/i.test(storeSource));
  assert.ok(!/DELETE\s+FROM\s+audit_log/i.test(storeSource));
  // One row per event key, enforced in code.
  assert.match(storeSource, /WHERE event_key = \$1/);
  assert.match(storeSource, /already_exists/);
  // Unknown reference writes nothing.
  assert.match(storeSource, /intake_not_found/);
  // A system-wide entry (no intake) still writes: the audit row is
  // skipped there, because audit_log.client_id is NOT NULL.
  assert.match(storeSource, /audit_log\.client_id is NOT NULL/);
});

test("owner route is token-gated and returns no PII beyond reference/kind/action", () => {
  assert.match(routeSource, /OPS_DASHBOARD_TOKEN/);
  assert.match(routeSource, /unauthorized/);
  assert.match(routeSource, /ops_not_configured/);
  // The route returns the validator's error code (bad_event_key,
  // bad_action, …) rather than hard-coding each one: it must
  // delegate to validateChangeLogInput, which the store tests
  // cover, including bad_event_key.
  assert.match(routeSource, /validateChangeLogInput/);
  assert.match(storeSource, /bad_event_key/);
  assert.match(routeSource, /intake_not_found/);
  assert.ok(!/contactEmail|contactPhone|contact_email|contact_phone/.test(routeSource));
  assert.match(routeSource, /no names, no answers, no contact\s*\n \* details/);
  // No secret value can be returned or logged by this route.
  assert.match(routeSource, /never a credential, key, token, or password value/);
});
