// node --test tests/proof-packet.test.mjs
// Validation for internal proof packets. No database, no network,
// no credentials. The sample reference is a TEST intake, not a client.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  APPROVED_PROOF_PACKET_INTRO,
  OWNER_ROLE,
  approvedProofPacketHeading,
  approvedProofPacketText,
  isTestIntake,
  readProofPacket,
  saveProofPacketDraft,
  signProofPacket,
  validateOwnerSigner,
  validateProofPacketDraft,
} from "../app/lib/erm/proof-packet-store.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REFERENCE = "MT-20261107-TEST";

function header(overrides = {}) {
  return {
    clientDisplayName: "TEST Solo Example Co",
    lane: "Solo entrepreneur",
    agent: "Grok Bot",
    agentAccountOwner: "Client (TEST Solo Example Co)",
    preparedBy: "Grok Bot (Micro Titan ops)",
    version: "v0 draft",
    ...overrides,
  };
}

function sections(overrides = {}) {
  return {
    header: header(),
    authorship: [],
    timeline: [],
    money: [],
    discovery: [],
    setup: [],
    access: [],
    checks: [],
    "follow-ups": [],
    wording: [],
    "not-proven": [],
    ...overrides,
  };
}

function draft(overrides = {}) {
  const reference = overrides.reference ?? REFERENCE;
  return {
    reference,
    heading: overrides.heading ?? approvedProofPacketHeading(reference),
    intro: overrides.intro ?? APPROVED_PROOF_PACKET_INTRO,
    sections: overrides.sections ?? sections(),
  };
}

function authorshipClaim(evidence) {
  return {
    item: "Intake reminder routine config",
    writtenBy: "Grok Bot (client's agent)",
    mergedBy: "Owner",
    verifiedBy: "Grok Bot (Micro Titan ops), live check",
    evidence,
  };
}

test("approved heading and intro are the owner's sentence, verbatim", () => {
  const text = approvedProofPacketText(REFERENCE);
  assert.equal(
    text,
    "Proof of work: MT-20261107-TEST. This record shows what we set up, what we checked, and the evidence for each. Anything without evidence isn't claimed here, and anything we couldn't check yet is listed as not run.",
  );
  assert.equal(approvedProofPacketHeading(REFERENCE), "Proof of work: MT-20261107-TEST.");
  assert.equal(
    APPROVED_PROOF_PACKET_INTRO,
    "This record shows what we set up, what we checked, and the evidence for each. Anything without evidence isn't claimed here, and anything we couldn't check yet is listed as not run.",
  );
});

test("a heading or intro that differs from the approved text is rejected", () => {
  const badHeading = validateProofPacketDraft(
    draft({ heading: "Proof of work: MT-20261107-TEST" }),
  );
  assert.equal(badHeading.ok, false);
  assert.equal(badHeading.error, "bad_heading");
  const paraphrased = validateProofPacketDraft(
    draft({
      intro:
        "This record lists what we set up, what we checked, and the evidence for each. Anything without evidence isn't claimed here, and anything we couldn't check yet is listed as not run.",
    }),
  );
  assert.equal(paraphrased.ok, false);
  assert.equal(paraphrased.error, "bad_intro");
  const otherReference = validateProofPacketDraft(
    draft({ heading: approvedProofPacketHeading("MT-20261107-AB12") }),
  );
  assert.equal(otherReference.ok, false);
  assert.equal(otherReference.error, "bad_heading");
});

test("a claim with no evidence is rejected", () => {
  for (const evidence of ["", "   ", "—", "-"]) {
    const result = validateProofPacketDraft(
      draft({ sections: sections({ authorship: [authorshipClaim(evidence)] }) }),
    );
    assert.equal(result.ok, false, `evidence ${JSON.stringify(evidence)} should fail`);
    assert.equal(result.error, "missing_evidence");
  }
});

test("NOT_RUN without a reason or a target date is rejected", () => {
  const base = {
    check: "Runs 5 days in a row",
    method: "Needs 5 days",
    result: "NOT_RUN",
    evidence: "LOG:routine-schedule@2026-11-07 16:00 CT",
  };
  const noReason = validateProofPacketDraft(
    draft({ sections: sections({ checks: [{ ...base, runByDate: "2026-11-12" }] }) }),
  );
  assert.equal(noReason.ok, false);
  assert.equal(noReason.error, "not_run_reason_required");
  const noDate = validateProofPacketDraft(
    draft({
      sections: sections({
        checks: [{ ...base, notRunReason: "Needs 5 weekday runs." }],
      }),
    }),
  );
  assert.equal(noDate.ok, false);
  assert.equal(noDate.error, "not_run_date_required");
  const badDate = validateProofPacketDraft(
    draft({
      sections: sections({
        checks: [{ ...base, notRunReason: "Needs 5 weekday runs.", runByDate: "Nov 12" }],
      }),
    }),
  );
  assert.equal(badDate.ok, false);
  assert.equal(badDate.error, "not_run_date_required");
});

test("a NOT_RUN check with a reason and a date is accepted", () => {
  const result = validateProofPacketDraft(
    draft({
      sections: sections({
        checks: [
          {
            check: "Runs 5 days in a row",
            method: "Needs 5 days",
            result: "NOT_RUN",
            evidence: "LOG:routine-schedule@2026-11-07 16:00 CT",
            notRunReason: "Needs 5 weekday runs; this test job has one watched run.",
            runByDate: "2026-11-12",
          },
        ],
      }),
    }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.test, true);
  assert.equal(result.sections.checks[0].result, "NOT_RUN");
  assert.equal(result.sections.checks[0].runByDate, "2026-11-12");
});

test("signing is rejected for anyone except the owner role", () => {
  assert.equal(OWNER_ROLE, "owner");
  assert.equal(validateOwnerSigner("owner"), null);
  for (const signer of ["client", "agent", "Grok Bot", "", "Owner"]) {
    assert.equal(validateOwnerSigner(signer), "not_owner", signer);
  }
});

test("TEST references are allowed and flagged, other references are not flagged", () => {
  assert.equal(isTestIntake("MT-20261107-TEST"), true);
  assert.equal(isTestIntake("MT-TEST-DUE"), true);
  assert.equal(isTestIntake("TEST-intake"), true);
  assert.equal(isTestIntake("MT-20261107-AB12"), false);
  const testPacket = validateProofPacketDraft(draft());
  assert.equal(testPacket.ok, true);
  assert.equal(testPacket.test, true);
  const live = validateProofPacketDraft(draft({ reference: "MT-20261107-AB12" }));
  assert.equal(live.ok, true);
  assert.equal(live.test, false);
});

test("store stays closed when no database is configured", async () => {
  const previous = process.env.ERM_DATABASE_URL;
  const previousFallback = process.env.ERM_DATABASE_DATABASE_URL;
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  try {
    assert.deepEqual(await saveProofPacketDraft(draft()), { status: "not_configured" });
    assert.deepEqual(await readProofPacket(REFERENCE), { status: "not_configured" });
    assert.deepEqual(await signProofPacket(REFERENCE, "owner"), { status: "not_configured" });
    assert.deepEqual(await signProofPacket(REFERENCE, "client"), { status: "not_owner" });
    const missing = await saveProofPacketDraft(
      draft({ sections: sections({ authorship: [authorshipClaim("")] }) }),
    );
    assert.deepEqual(missing, { status: "invalid", error: "missing_evidence" });
  } finally {
    if (previous === undefined) delete process.env.ERM_DATABASE_URL;
    else process.env.ERM_DATABASE_URL = previous;
    if (previousFallback === undefined) delete process.env.ERM_DATABASE_DATABASE_URL;
    else process.env.ERM_DATABASE_DATABASE_URL = previousFallback;
  }
});

test("schema and migration enforce evidence, NOT_RUN, and owner sign-off", () => {
  const migration = fs.readFileSync(
    path.join(root, "app", "lib", "erm", "migrations", "008-proof-packets.sql"),
    "utf8",
  );
  const schema = fs.readFileSync(path.join(root, "app", "lib", "erm", "schema.sql"), "utf8");
  for (const src of [migration, schema]) {
    assert.match(src, /CREATE TABLE IF NOT EXISTS proof_packets \(/);
    assert.match(src, /intake_id UUID NOT NULL UNIQUE REFERENCES intakes\(id\)/);
    assert.match(src, /reference TEXT NOT NULL UNIQUE REFERENCES intakes\(reference\)/);
    assert.match(src, /status TEXT NOT NULL DEFAULT 'draft' CHECK \(status IN \('draft', 'signed'\)\)/);
    assert.match(src, /signed_by = 'owner'/);
    assert.match(src, /CREATE TABLE IF NOT EXISTS proof_packet_claims \(/);
    assert.match(src, /evidence TEXT NOT NULL CHECK \(length\(btrim\(evidence\)\) > 0\)/);
    assert.match(src, /result TEXT NOT NULL CHECK \(result IN \('PASS', 'FAIL', 'NOT_RUN'\)\)/);
    assert.match(src, /result <> 'NOT_RUN'/);
    assert.match(src, /run_by_date IS NOT NULL/);
  }
});

test("packets stay off the public site and off /receipts", () => {
  assert.equal(fs.existsSync(path.join(root, "app", "proof-packet")), false);
  assert.equal(fs.existsSync(path.join(root, "app", "api", "proof-packet")), false);
  const receipts = fs.readFileSync(path.join(root, "app", "receipts", "page.tsx"), "utf8");
  assert.equal(receipts.includes("proof_packet"), false);
  assert.equal(receipts.includes("proof-packet"), false);
  for (const rel of [
    "app/api/ops/proof-packet/route.ts",
    "app/api/ops/proof-packet-sign/route.ts",
    "app/lib/erm/proof-packet-store.ts",
  ]) {
    const src = fs.readFileSync(path.join(root, rel), "utf8");
    assert.match(src, /OPS_DASHBOARD_TOKEN/);
    assert.doesNotMatch(src, /resend|twilio|sendgrid|nodemailer|stripe\.|fetch\(/i);
  }
});
