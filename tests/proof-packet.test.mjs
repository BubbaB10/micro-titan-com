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

test("whitespace-only evidence is rejected, including tabs", () => {
  for (const evidence of ["\t", "\n", " \t "]) {
    const result = validateProofPacketDraft(
      draft({ sections: sections({ authorship: [authorshipClaim(evidence)] }) }),
    );
    assert.equal(result.ok, false, JSON.stringify(evidence));
    assert.equal(result.error, "missing_evidence");
  }
});

test("a client-supplied signer is not an input the store accepts", () => {
  assert.equal(OWNER_ROLE, "owner");
  assert.equal(signProofPacket.length, 1);
});

test("only MT-YYYYMMDD-TEST is a test packet reference", () => {
  assert.equal(isTestIntake("MT-20261107-TEST"), true);
  assert.equal(isTestIntake("MT-TEST-DUE"), false);
  assert.equal(isTestIntake("TEST-intake"), false);
  assert.equal(isTestIntake("MT-20261107-AB12"), false);
  const testPacket = validateProofPacketDraft(draft());
  assert.equal(testPacket.ok, true);
  assert.equal(testPacket.test, true);
  const live = validateProofPacketDraft(draft({ reference: "MT-20261107-AB12" }));
  assert.equal(live.ok, true);
  assert.equal(live.test, false);
  for (const reference of ["MT-TEST-DUE", "TEST-intake", "MT-20261107-TESTING"]) {
    assert.equal(validateProofPacketDraft(draft({ reference })).ok, false);
    assert.equal(validateProofPacketDraft(draft({ reference })).error, "bad_reference");
  }
});

test("store stays closed when no database is configured", async () => {
  const previous = process.env.ERM_DATABASE_URL;
  const previousFallback = process.env.ERM_DATABASE_DATABASE_URL;
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  try {
    assert.deepEqual(await saveProofPacketDraft(draft()), { status: "not_configured" });
    assert.deepEqual(await readProofPacket(REFERENCE), { status: "not_configured" });
    assert.deepEqual(await signProofPacket(REFERENCE), { status: "not_configured" });
    assert.deepEqual(await signProofPacket("MT-TEST-DUE"), { status: "invalid", error: "bad_reference" });
    assert.deepEqual(await readProofPacket("TEST-intake"), { status: "invalid", error: "bad_reference" });
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
    assert.match(src, /signed_by IS NOT NULL/);
    assert.match(src, /signed_by = 'owner'/);
    assert.match(src, /proof_packet_visible_text\(evidence\)/);
    assert.match(src, /proof_packet_visible_text\(not_run_reason\)/);
    assert.match(src, /CREATE TABLE IF NOT EXISTS proof_packet_claims \(/);
    assert.match(src, /result TEXT NOT NULL CHECK \(result IN \('PASS', 'FAIL', 'NOT_RUN'\)\)/);
    assert.match(src, /result <> 'NOT_RUN'/);
    assert.match(src, /run_by_date IS NOT NULL/);
    assert.match(src, /signed proof packet is frozen/);
    assert.match(src, /FOR UPDATE/);
    assert.match(src, /CREATE TRIGGER proof_packet_claims_freeze/);
    assert.match(src, /CREATE TRIGGER proof_packet_checks_freeze/);
  }
});

test("packet docs use the approved sentence, NOT RUN reason and date, and both release gates", () => {
  const approved = `${approvedProofPacketHeading("<REFERENCE>")} ${APPROVED_PROOF_PACKET_INTRO}`;
  const template = fs.readFileSync(path.join(root, "docs", "proof-packet", "TEMPLATE.md"), "utf8");
  const example = fs.readFileSync(
    path.join(root, "docs", "proof-packet", "EXAMPLE-MT-20261107-TEST.md"),
    "utf8",
  );
  const decisions = fs.readFileSync(path.join(root, "docs", "proof-packet", "DECISIONS.md"), "utf8");
  const notes = fs.readFileSync(path.join(root, "docs", "proof-packet", "NOTES.md"), "utf8");
  assert.equal(template.includes(approved), true);
  assert.equal(decisions.includes(approved), true);
  assert.equal(notes.includes(approved), true);
  assert.equal(example.includes(approvedProofPacketText("MT-20261107-TEST")), true);
  assert.equal(example.includes("Fully fictional"), true);
  assert.match(example, /NOT RUN \| LOG:routine-schedule@2026-11-07 16:00 CT \| Needs 5 weekday runs/);
  assert.match(example, /2026-11-12/);
  assert.equal(example.includes("| **NOT RUN** | — |"), false);
  for (const src of [template, example, decisions, notes]) {
    assert.match(src, /client request/);
    assert.match(src, /owner approval/);
  }
  assert.equal(notes.includes("## Open questions"), false);
  const readme = fs.readFileSync(path.join(root, "app", "lib", "erm", "README.md"), "utf8");
  assert.match(readme, /OWNER_SIGNING_TOKEN/);
  assert.match(readme, /secret/i);
  assert.doesNotMatch(readme, /OWNER_SIGNING_TOKEN` — [^`\n]*test-owner/);
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
