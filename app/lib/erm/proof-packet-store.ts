/**
 * Micro Titan proof-packet persistence — internal ERM record only.
 *
 * Same gated pattern as app/lib/erm/change-log-store.ts and
 * app/lib/erm/followup-store.ts.
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every write
 *   and read returns "not_configured" and never throws, never
 *   connects, and never invents a packet.
 * - One packet per intake. The caller must supply a reference
 *   that already exists in intakes. This module never creates a
 *   client or an intake. An unknown reference returns
 *   "intake_not_found" and writes nothing.
 * - A draft can be replaced. A signed packet cannot be replaced,
 *   and this module never deletes a packet row. Replacing a draft
 *   deletes that draft's claim and check rows and inserts the
 *   new set in the same transaction. Signed claim and check rows
 *   are left in place.
 * - Every claim row and every check row must carry non-empty
 *   evidence. A check result is PASS, FAIL, or NOT_RUN. NOT_RUN
 *   also requires a reason and a target date (run_by_date).
 *   Lines in not-proven are explicit non-claims: they are stored
 *   in the packet document and are not claim rows.
 * - Heading and intro must be the approved text, verbatim, with
 *   the intake reference filled into the heading. Any other
 *   wording is rejected and nothing is written.
 * - Sign-off is recorded as the owner role. This module does not
 *   accept a client-supplied signer. POST /api/ops/proof-packet-sign
 *   is the only HTTP caller, and it requires OWNER_SIGNING_TOKEN
 *   in addition to OPS_DASHBOARD_TOKEN. The ops token alone
 *   cannot sign.
 * - proof_packets.sections stores the header and the not-proven
 *   lines only. Claims and checks live in proof_packet_claims and
 *   proof_packet_checks. Reads and the sign recheck assemble the
 *   document from those child rows, using each row's evidence
 *   column. The parent JSON is not the claim record.
 * - TEST intakes are allowed when the reference matches the
 *   intake shape MT-YYYYMMDD-XXXX and the four-character code is
 *   TEST. The packet is stored with test = true. The caller
 *   cannot turn that flag off or on. Other shapes are rejected.
 * - This module never advances an intake, never sends email,
 *   SMS, or a call, and never marks a packet as shared. A packet
 *   does not feed the public /receipts page.
 * - No PII is logged. Errors return a status string only.
 */

import type {
  ApprovedAgent,
  Lane,
  ProofAccessClaim,
  ProofAuthorshipClaim,
  ProofCheck,
  ProofCheckResult,
  ProofDiscoveryClaim,
  ProofFollowUpClaim,
  ProofMoneyClaim,
  ProofPacketSections,
  ProofPacketStatus,
  ProofSetupClaim,
  ProofTimelineClaim,
  ProofWordingClaim,
} from "./types";

/**
 * Approved intro, verbatim. The heading is this same approved
 * sentence's first clause, with the intake reference filled in.
 */
export const APPROVED_PROOF_PACKET_INTRO =
  "This record shows what we set up, what we checked, and the evidence for each. Anything without evidence isn't claimed here, and anything we couldn't check yet is listed as not run.";

/** Owner role already used as the actor on owner-written ERM rows. */
export const OWNER_ROLE = "owner";

const REFERENCE_RE = /^MT-\d{8}-[A-Z0-9]{4}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMPTY_EVIDENCE_RE = /^[-—–]+$/;
const SECRET_RE =
  /postgres:\/\/|sk_live|sk_test_|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY|OPS_DASHBOARD_TOKEN/;

const LANES: readonly Lane[] = ["Family", "Solo entrepreneur", "Business"];
const AGENTS: readonly ApprovedAgent[] = ["Muse", "Grok Bot", "Claude", "Gemini"];
const CHECK_RESULTS: readonly ProofCheckResult[] = ["PASS", "FAIL", "NOT_RUN"];
const FOLLOW_UP_STEPS = ["day1", "day3", "day7", "day14"] as const;
const FOLLOW_UP_CHANNELS = ["email", "text", "call", "manual_note"] as const;
const SECTION_KEYS = [
  "header",
  "authorship",
  "timeline",
  "money",
  "discovery",
  "setup",
  "access",
  "checks",
  "follow-ups",
  "wording",
  "not-proven",
] as const;
const HEADER_KEYS = [
  "clientDisplayName",
  "lane",
  "agent",
  "agentAccountOwner",
  "preparedBy",
  "version",
] as const;

const MAX_ROWS = 40;
const MAX_SHORT = 200;
const MAX_TEXT = 1000;
const MAX_EVIDENCE = 500;

export function approvedProofPacketHeading(reference: string): string {
  return `Proof of work: ${reference}.`;
}

/** The full approved sentence for one reference: heading, space, intro. */
export function approvedProofPacketText(reference: string): string {
  return `${approvedProofPacketHeading(reference)} ${APPROVED_PROOF_PACKET_INTRO}`;
}

/**
 * TEST intakes are allowed to carry a packet. The packet is flagged
 * test so it never counts as proof of client work. A reference
 * counts only when it matches the same intake shape the store
 * accepts (MT-YYYYMMDD-XXXX) and the four-character code is TEST.
 * MT-TEST-DUE and a TEST- prefix are not packet references.
 */
export function isTestIntake(reference: string): boolean {
  const ref = reference.trim().toUpperCase();
  return REFERENCE_RE.test(ref) && ref.endsWith("-TEST");
}

export type ProofPacketDraftInput = {
  reference: string;
  heading: string;
  intro: string;
  sections: unknown;
};

export type ValidatedProofPacketDraft = {
  ok: true;
  reference: string;
  heading: string;
  intro: string;
  sections: ProofPacketSections;
  test: boolean;
};

export type ProofPacketValidation =
  | ValidatedProofPacketDraft
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsSecret(value: unknown): boolean {
  if (typeof value === "string") return SECRET_RE.test(value);
  if (Array.isArray(value)) return value.some((item) => containsSecret(item));
  if (isRecord(value)) return Object.values(value).some((item) => containsSecret(item));
  return false;
}

function textField(row: Record<string, unknown>, key: string, max: number): string | null {
  const value = row[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

/** Blank, whitespace, and dash placeholders are not evidence. */
function evidenceField(row: Record<string, unknown>): string | null {
  const value = row.evidence;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EVIDENCE) return null;
  if (EMPTY_EVIDENCE_RE.test(trimmed)) return null;
  return trimmed;
}

function isIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function asRows(value: unknown): unknown[] | null {
  if (!Array.isArray(value) || value.length > MAX_ROWS) return null;
  return value;
}

function fail(error: string): ProofPacketValidation {
  return { ok: false, error };
}

function readHeader(value: unknown): ProofPacketSections["header"] | null {
  if (!isRecord(value)) return null;
  for (const key of Object.keys(value)) {
    if (!HEADER_KEYS.includes(key as (typeof HEADER_KEYS)[number])) return null;
  }
  const clientDisplayName = textField(value, "clientDisplayName", MAX_SHORT);
  const lane = textField(value, "lane", MAX_SHORT);
  const agent = textField(value, "agent", MAX_SHORT);
  const agentAccountOwner = textField(value, "agentAccountOwner", MAX_SHORT);
  const preparedBy = textField(value, "preparedBy", MAX_SHORT);
  const version = textField(value, "version", 80);
  if (!clientDisplayName || clientDisplayName.includes("@")) return null;
  if (!lane || !LANES.includes(lane as Lane)) return null;
  if (!agent || !AGENTS.includes(agent as ApprovedAgent)) return null;
  if (!agentAccountOwner || !/\bclient\b/i.test(agentAccountOwner)) return null;
  if (!preparedBy || !version) return null;
  return {
    clientDisplayName,
    lane: lane as Lane,
    agent: agent as ApprovedAgent,
    agentAccountOwner,
    preparedBy,
    version,
  };
}

function readAuthorship(value: unknown): ProofAuthorshipClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofAuthorshipClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const item = textField(row, "item", MAX_TEXT);
    const writtenBy = textField(row, "writtenBy", MAX_SHORT);
    const mergedBy = textField(row, "mergedBy", MAX_SHORT);
    const verifiedBy = textField(row, "verifiedBy", MAX_SHORT);
    if (!item || !writtenBy || !mergedBy || !verifiedBy) return null;
    out.push({ item, writtenBy, mergedBy, verifiedBy, evidence });
  }
  return out;
}

function readTimeline(value: unknown): ProofTimelineClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofTimelineClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const stage = textField(row, "stage", MAX_SHORT);
    const when = textField(row, "when", MAX_SHORT);
    const actor = textField(row, "actor", MAX_SHORT);
    if (!stage || !when || !actor) return null;
    out.push({ stage, when, actor, evidence });
  }
  return out;
}

function readMoney(value: unknown): ProofMoneyClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofMoneyClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const line = textField(row, "line", MAX_SHORT);
    const amount = textField(row, "amount", MAX_SHORT);
    const status = textField(row, "status", MAX_SHORT);
    if (!line || !amount || !status) return null;
    out.push({ line, amount, status, evidence });
  }
  return out;
}

function readDiscovery(value: unknown): ProofDiscoveryClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofDiscoveryClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const field = textField(row, "field", MAX_SHORT);
    const itemValue = textField(row, "value", MAX_TEXT);
    if (!field || !itemValue) return null;
    out.push({ field, value: itemValue, evidence });
  }
  return out;
}

function readSetup(value: unknown): ProofSetupClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofSetupClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const change = textField(row, "change", MAX_TEXT);
    const kind = textField(row, "kind", MAX_SHORT);
    const actor = textField(row, "actor", MAX_SHORT);
    const fromTo = textField(row, "fromTo", MAX_SHORT);
    if (!change || !kind || !actor || !fromTo) return null;
    out.push({ change, kind, actor, fromTo, evidence });
  }
  return out;
}

function readAccess(value: unknown): ProofAccessClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofAccessClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const system = textField(row, "system", MAX_SHORT);
    const grantedTo = textField(row, "grantedTo", MAX_SHORT);
    const grantedOrRevoked = textField(row, "grantedOrRevoked", MAX_SHORT);
    if (!system || !grantedTo || !grantedOrRevoked) return null;
    out.push({ system, grantedTo, grantedOrRevoked, evidence });
  }
  return out;
}

function readFollowUps(value: unknown): ProofFollowUpClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofFollowUpClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const step = textField(row, "step", 20);
    const channel = textField(row, "channel", 40);
    const actor = textField(row, "actor", MAX_SHORT);
    const when = textField(row, "when", MAX_SHORT);
    if (!step || !FOLLOW_UP_STEPS.includes(step as (typeof FOLLOW_UP_STEPS)[number])) return null;
    if (!channel || !FOLLOW_UP_CHANNELS.includes(channel as (typeof FOLLOW_UP_CHANNELS)[number])) {
      return null;
    }
    if (!actor || !when) return null;
    out.push({
      step: step as ProofFollowUpClaim["step"],
      channel: channel as ProofFollowUpClaim["channel"],
      actor,
      when,
      evidence,
    });
  }
  return out;
}

function readWording(value: unknown): ProofWordingClaim[] | "missing_evidence" | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofWordingClaim[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const text = textField(row, "text", MAX_TEXT);
    const source = textField(row, "source", MAX_TEXT);
    if (!text || !source) return null;
    out.push({ text, source, evidence });
  }
  return out;
}

function readChecks(value: unknown): ProofCheck[] | string | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: ProofCheck[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return null;
    const evidence = evidenceField(row);
    if (!evidence) return "missing_evidence";
    const result = row.result;
    if (typeof result !== "string" || !CHECK_RESULTS.includes(result as ProofCheckResult)) {
      return "bad_check_result";
    }
    const check = textField(row, "check", MAX_TEXT);
    const method = textField(row, "method", MAX_TEXT);
    if (!check || !method) return "bad_check";
    if (result === "NOT_RUN") {
      const notRunReason = textField(row, "notRunReason", MAX_EVIDENCE);
      if (!notRunReason) return "not_run_reason_required";
      const runByDate = textField(row, "runByDate", 10);
      if (!runByDate || !isIsoDate(runByDate)) return "not_run_date_required";
      out.push({
        check,
        method,
        result,
        evidence,
        notRunReason,
        runByDate,
      });
      continue;
    }
    out.push({ check, method, result: result as ProofCheckResult, evidence });
  }
  return out;
}

function readNotProven(value: unknown): string[] | null {
  const rows = asRows(value);
  if (!rows) return null;
  const out: string[] = [];
  for (const row of rows) {
    if (typeof row !== "string") return null;
    const trimmed = row.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_TEXT) return null;
    out.push(trimmed);
  }
  return out;
}

/**
 * Pure validation. Returns the normalized packet, or an error code.
 * A claim or check with no evidence is "missing_evidence". A NOT_RUN
 * check without a reason or a target date is rejected. Heading and
 * intro must match the approved text for this reference.
 */
export function validateProofPacketDraft(input: ProofPacketDraftInput): ProofPacketValidation {
  const reference = typeof input.reference === "string" ? input.reference.trim() : "";
  if (!REFERENCE_RE.test(reference)) return fail("bad_reference");
  if (input.heading !== approvedProofPacketHeading(reference)) return fail("bad_heading");
  if (input.intro !== APPROVED_PROOF_PACKET_INTRO) return fail("bad_intro");
  if (!isRecord(input.sections)) return fail("bad_sections");
  if (containsSecret(input.sections)) return fail("secret_not_allowed");
  for (const key of Object.keys(input.sections)) {
    if (!SECTION_KEYS.includes(key as (typeof SECTION_KEYS)[number])) return fail("bad_sections");
  }
  for (const key of SECTION_KEYS) {
    if (!(key in input.sections)) return fail("bad_sections");
  }
  const header = readHeader(input.sections.header);
  if (!header) return fail("bad_header");
  const authorship = readAuthorship(input.sections.authorship);
  if (authorship === "missing_evidence") return fail("missing_evidence");
  if (!authorship) return fail("bad_claim");
  const timeline = readTimeline(input.sections.timeline);
  if (timeline === "missing_evidence") return fail("missing_evidence");
  if (!timeline) return fail("bad_claim");
  const money = readMoney(input.sections.money);
  if (money === "missing_evidence") return fail("missing_evidence");
  if (!money) return fail("bad_claim");
  const discovery = readDiscovery(input.sections.discovery);
  if (discovery === "missing_evidence") return fail("missing_evidence");
  if (!discovery) return fail("bad_claim");
  const setup = readSetup(input.sections.setup);
  if (setup === "missing_evidence") return fail("missing_evidence");
  if (!setup) return fail("bad_claim");
  const access = readAccess(input.sections.access);
  if (access === "missing_evidence") return fail("missing_evidence");
  if (!access) return fail("bad_claim");
  const followUps = readFollowUps(input.sections["follow-ups"]);
  if (followUps === "missing_evidence") return fail("missing_evidence");
  if (!followUps) return fail("bad_claim");
  const wording = readWording(input.sections.wording);
  if (wording === "missing_evidence") return fail("missing_evidence");
  if (!wording) return fail("bad_claim");
  const checks = readChecks(input.sections.checks);
  if (typeof checks === "string") return fail(checks);
  if (!checks) return fail("bad_check");
  const notProven = readNotProven(input.sections["not-proven"]);
  if (!notProven) return fail("bad_not_proven");
  return {
    ok: true,
    reference,
    heading: input.heading,
    intro: input.intro,
    test: isTestIntake(reference),
    sections: {
      header,
      authorship,
      timeline,
      money,
      discovery,
      setup,
      access,
      checks,
      "follow-ups": followUps,
      wording,
      "not-proven": notProven,
    },
  };
}

export interface StoredProofPacket {
  packetId: string;
  reference: string;
  test: boolean;
  status: ProofPacketStatus;
  heading: string;
  intro: string;
  sections: ProofPacketSections;
  ownerSignedAt: string | null;
  signedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SaveProofPacketResult =
  | { status: "written" | "updated"; packetId: string; test: boolean }
  | { status: "already_signed"; packetId: string }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "invalid"; error: string }
  | { status: "failed" };

export type ReadProofPacketResult =
  | { status: "found"; packet: StoredProofPacket }
  | { status: "not_found" }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "invalid"; error: string }
  | { status: "failed" };

export type SignProofPacketResult =
  | {
      status: "signed";
      packetId: string;
      test: boolean;
      signedBy: typeof OWNER_ROLE;
      ownerSignedAt: string;
    }
  | {
      status: "already_signed";
      packetId: string;
      signedBy: string | null;
      ownerSignedAt: string | null;
    }
  | { status: "not_found" }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "invalid"; error: string }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

function asIso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  const text = String(value);
  return text.length > 0 ? text : null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true";
}

function asSections(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

type ClaimInsert = {
  section: string;
  position: number;
  body: object;
  evidence: string;
};

/**
 * The parent JSON is header + not-proven only. Claim and check
 * text is inserted into the child tables, which are the record
 * reads and signing use.
 */
function persistedDocument(sections: ProofPacketSections): string {
  return JSON.stringify({
    header: sections.header,
    "not-proven": sections["not-proven"],
  });
}

function asDateOnly(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    return match ? match[1] : null;
  }
  return null;
}

const CLAIM_SECTION_NAMES = [
  "authorship",
  "timeline",
  "money",
  "discovery",
  "setup",
  "access",
  "follow-ups",
  "wording",
] as const;

/**
 * Build the packet document from the parent header / not-proven
 * JSON plus the constrained child rows. Evidence always comes
 * from the child evidence column.
 */
export function assembleAuthoritativeSections(
  stored: unknown,
  claimRows: Array<Record<string, unknown>>,
  checkRows: Array<Record<string, unknown>>,
): unknown {
  if (!isRecord(stored)) return null;
  const grouped: Record<string, unknown[]> = {};
  for (const name of CLAIM_SECTION_NAMES) grouped[name] = [];
  const orderedClaims = [...claimRows].sort((a, b) => {
    const section = String(a.section).localeCompare(String(b.section));
    if (section !== 0) return section;
    return Number(a.position) - Number(b.position);
  });
  for (const row of orderedClaims) {
    const section = typeof row.section === "string" ? row.section : "";
    if (!CLAIM_SECTION_NAMES.includes(section as (typeof CLAIM_SECTION_NAMES)[number])) return null;
    const body = asSections(row.body);
    if (!isRecord(body)) return null;
    const evidence = typeof row.evidence === "string" ? row.evidence : "";
    grouped[section].push({ ...body, evidence });
  }
  const checks = [...checkRows]
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map((row) => {
      const built: Record<string, unknown> = {
        check: row.check_text,
        method: row.method,
        result: row.result,
        evidence: row.evidence,
      };
      if (row.result === "NOT_RUN") {
        built.notRunReason = typeof row.not_run_reason === "string" ? row.not_run_reason : "";
        built.runByDate = asDateOnly(row.run_by_date) ?? "";
      }
      return built;
    });
  return {
    header: stored.header,
    authorship: grouped.authorship,
    timeline: grouped.timeline,
    money: grouped.money,
    discovery: grouped.discovery,
    setup: grouped.setup,
    access: grouped.access,
    checks,
    "follow-ups": grouped["follow-ups"],
    wording: grouped.wording,
    "not-proven": stored["not-proven"],
  };
}

async function authoritativeSections(
  client: {
    query: (sql: string, params?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;
  },
  packetId: string,
  stored: unknown,
): Promise<unknown> {
  const claims = await client.query(
    `SELECT section, position, body, evidence
       FROM proof_packet_claims
      WHERE packet_id = $1
      ORDER BY section, position`,
    [packetId],
  );
  const checks = await client.query(
    `SELECT position, check_text, method, result, evidence, not_run_reason, run_by_date
       FROM proof_packet_checks
      WHERE packet_id = $1
      ORDER BY position`,
    [packetId],
  );
  return assembleAuthoritativeSections(stored, claims.rows, checks.rows);
}

function claimInserts(sections: ProofPacketSections): ClaimInsert[] {
  const groups: Array<{ section: string; rows: Array<{ evidence: string }> }> = [
    { section: "authorship", rows: sections.authorship },
    { section: "timeline", rows: sections.timeline },
    { section: "money", rows: sections.money },
    { section: "discovery", rows: sections.discovery },
    { section: "setup", rows: sections.setup },
    { section: "access", rows: sections.access },
    { section: "follow-ups", rows: sections["follow-ups"] },
    { section: "wording", rows: sections.wording },
  ];
  const inserts: ClaimInsert[] = [];
  for (const group of groups) {
    group.rows.forEach((body, index) => {
      inserts.push({
        section: group.section,
        position: index + 1,
        body,
        evidence: body.evidence,
      });
    });
  }
  return inserts;
}

async function insertChildren(
  client: { query: (sql: string, params?: unknown[]) => Promise<unknown> },
  packetId: string,
  sections: ProofPacketSections,
): Promise<void> {
  for (const claim of claimInserts(sections)) {
    await client.query(
      `INSERT INTO proof_packet_claims (packet_id, section, position, body, evidence)
       VALUES ($1, $2, $3, $4::jsonb, $5)`,
      [packetId, claim.section, claim.position, JSON.stringify(claim.body), claim.evidence],
    );
  }
  for (let index = 0; index < sections.checks.length; index += 1) {
    const check = sections.checks[index];
    await client.query(
      `INSERT INTO proof_packet_checks
         (packet_id, position, check_text, method, result, evidence, not_run_reason, run_by_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        packetId,
        index + 1,
        check.check,
        check.method,
        check.result,
        check.evidence,
        check.result === "NOT_RUN" ? (check.notRunReason ?? "") : "",
        check.result === "NOT_RUN" ? (check.runByDate ?? null) : null,
      ],
    );
  }
}

async function replaceChildren(
  client: { query: (sql: string, params?: unknown[]) => Promise<unknown> },
  packetId: string,
  sections: ProofPacketSections,
): Promise<void> {
  await client.query("DELETE FROM proof_packet_claims WHERE packet_id = $1", [packetId]);
  await client.query("DELETE FROM proof_packet_checks WHERE packet_id = $1", [packetId]);
  await insertChildren(client, packetId, sections);
}

export async function saveProofPacketDraft(
  input: ProofPacketDraftInput,
): Promise<SaveProofPacketResult> {
  const validated = validateProofPacketDraft(input);
  if (!validated.ok) return { status: "invalid", error: validated.error };
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const intake = await client.query(
          "SELECT id, client_id FROM intakes WHERE reference = $1",
          [validated.reference],
        );
        if (intake.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const existing = await client.query(
          "SELECT id, status FROM proof_packets WHERE intake_id = $1 FOR UPDATE",
          [intakeId],
        );
        const sectionsJson = persistedDocument(validated.sections);
        if (existing.rows.length > 0) {
          const packetId = String(existing.rows[0].id);
          if (existing.rows[0].status === "signed") {
            await client.query("ROLLBACK");
            return { status: "already_signed", packetId };
          }
          const updated = await client.query(
            `UPDATE proof_packets
               SET heading = $1, intro = $2, sections = $3::jsonb, test = $4, updated_at = now()
             WHERE id = $5 AND status = 'draft'
             RETURNING id, test`,
            [validated.heading, validated.intro, sectionsJson, validated.test, packetId],
          );
          if (updated.rows.length === 0) {
            await client.query("ROLLBACK");
            return { status: "already_signed", packetId };
          }
          await replaceChildren(client, packetId, validated.sections);
          await client.query(
            `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
             VALUES ('proof_packet', $1, $2, 'owner', 'proof_packet_draft_updated', 'draft', 'draft', $3)`,
            [packetId, clientId, validated.reference],
          );
          await client.query("COMMIT");
          return { status: "updated", packetId, test: asBool(updated.rows[0].test) };
        }
        const inserted = await client.query(
          `INSERT INTO proof_packets
             (intake_id, client_id, reference, test, status, heading, intro, sections)
           VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7::jsonb)
           RETURNING id, test`,
          [
            intakeId,
            clientId,
            validated.reference,
            validated.test,
            validated.heading,
            validated.intro,
            sectionsJson,
          ],
        );
        const packetId = String(inserted.rows[0].id);
        await insertChildren(client, packetId, validated.sections);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('proof_packet', $1, $2, 'owner', 'proof_packet_drafted', NULL, 'draft', $3)`,
          [packetId, clientId, validated.reference],
        );
        await client.query("COMMIT");
        return { status: "written", packetId, test: asBool(inserted.rows[0].test) };
      } catch {
        await client.query("ROLLBACK").catch(() => undefined);
        return { status: "failed" };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

export async function readProofPacket(reference: string): Promise<ReadProofPacketResult> {
  const trimmed = reference.trim();
  if (!REFERENCE_RE.test(trimmed)) return { status: "invalid", error: "bad_reference" };
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const intake = await client.query("SELECT id FROM intakes WHERE reference = $1", [trimmed]);
        if (intake.rows.length === 0) return { status: "intake_not_found" };
        const found = await client.query(
          `SELECT id, reference, test, status, heading, intro, sections,
                  owner_signed_at, signed_by, created_at, updated_at
             FROM proof_packets WHERE reference = $1`,
          [trimmed],
        );
        if (found.rows.length === 0) return { status: "not_found" };
        const row = found.rows[0];
        const derived = await authoritativeSections(client, String(row.id), asSections(row.sections));
        const checked = validateProofPacketDraft({
          reference: String(row.reference),
          heading: String(row.heading),
          intro: String(row.intro),
          sections: derived,
        });
        if (!checked.ok) return { status: "failed" };
        return {
          status: "found",
          packet: {
            packetId: String(row.id),
            reference: String(row.reference),
            test: asBool(row.test),
            status: row.status === "signed" ? "signed" : "draft",
            heading: String(row.heading),
            intro: String(row.intro),
            sections: checked.sections,
            ownerSignedAt: asIso(row.owner_signed_at),
            signedBy: row.signed_by == null ? null : String(row.signed_by),
            createdAt: asIso(row.created_at) ?? "",
            updatedAt: asIso(row.updated_at) ?? "",
          },
        };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

export async function signProofPacket(reference: string): Promise<SignProofPacketResult> {
  const trimmed = reference.trim();
  if (!REFERENCE_RE.test(trimmed)) return { status: "invalid", error: "bad_reference" };
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const intake = await client.query(
          "SELECT id, client_id FROM intakes WHERE reference = $1",
          [trimmed],
        );
        if (intake.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const existing = await client.query(
          `SELECT id, status, test, heading, intro, sections, signed_by, owner_signed_at
             FROM proof_packets WHERE intake_id = $1 FOR UPDATE`,
          [intakeId],
        );
        if (existing.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "not_found" };
        }
        const row = existing.rows[0];
        const packetId = String(row.id);
        if (row.status === "signed") {
          await client.query("ROLLBACK");
          return {
            status: "already_signed",
            packetId,
            signedBy: row.signed_by == null ? null : String(row.signed_by),
            ownerSignedAt: asIso(row.owner_signed_at),
          };
        }
        const derived = await authoritativeSections(client, packetId, asSections(row.sections));
        const recheck = validateProofPacketDraft({
          reference: trimmed,
          heading: String(row.heading),
          intro: String(row.intro),
          sections: derived,
        });
        if (!recheck.ok) {
          await client.query("ROLLBACK");
          return { status: "invalid", error: recheck.error };
        }
        const signed = await client.query(
          `UPDATE proof_packets
             SET status = 'signed', signed_by = $1, owner_signed_at = now(), updated_at = now()
           WHERE id = $2 AND status = 'draft'
           RETURNING id, test, signed_by, owner_signed_at`,
          [OWNER_ROLE, packetId],
        );
        if (signed.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "already_signed", packetId, signedBy: null, ownerSignedAt: null };
        }
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('proof_packet', $1, $2, 'owner', 'proof_packet_signed', 'draft', 'signed', $3)`,
          [packetId, clientId, trimmed],
        );
        await client.query("COMMIT");
        return {
          status: "signed",
          packetId,
          test: asBool(signed.rows[0].test),
          signedBy: OWNER_ROLE,
          ownerSignedAt: asIso(signed.rows[0].owner_signed_at) ?? "",
        };
      } catch {
        await client.query("ROLLBACK").catch(() => undefined);
        return { status: "failed" };
      } finally {
        client.release();
      }
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}
