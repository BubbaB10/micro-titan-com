-- Proof packet migration — apply ONCE, in the database
-- provider's SQL editor (Neon for micro-titan-erm), AFTER
-- app/lib/erm/schema.sql and migrations 001 through 007.
-- This file is documentation + migration text only: no code in
-- the repo executes it, and this change does not apply it.
--
-- Why: a proof packet is the Prove record for one intake. It
-- stores what was set up, what was checked, and the evidence
-- for each claim. It is an internal ERM record. It does not
-- feed the public /receipts page. The application has no route
-- that sends or shares a packet.
--
-- Approved heading and intro, verbatim, with the intake
-- reference filled in for <REFERENCE>:
--   Proof of work: <REFERENCE>. This record shows what we set
--   up, what we checked, and the evidence for each. Anything
--   without evidence isn't claimed here, and anything we
--   couldn't check yet is listed as not run.
-- The application rejects a packet whose heading or intro
-- differs from that text.
--
-- Rules:
-- * One packet per intake. intake_id references intakes(id)
--   and reference references intakes(reference). The store
--   writes both from the same intake row.
-- * status is draft or signed. A draft can be replaced. A
--   signed packet is not updated and is not deleted.
-- * Sign-off is the owner role only. signed_by stays NULL
--   until sign, and the sign check allows only 'owner' — the
--   same actor role already stored on owner-written rows.
--   owner_signed_at is set in that same update.
-- * sections is the packet document: header, authorship,
--   timeline, money, discovery, setup, access, checks,
--   follow-ups, wording, not-proven.
-- * proof_packet_claims is one row per claim. evidence is
--   NOT NULL and must be non-empty after trim. not-proven
--   lines are not claims and are not stored in this table.
-- * proof_packet_checks is one row per acceptance check.
--   result is PASS, FAIL, or NOT_RUN. NOT_RUN requires a
--   non-empty not_run_reason and a run_by_date. Every check
--   requires non-empty evidence.
-- * The application validates those same rules before it
--   writes (app/lib/erm/proof-packet-store.ts). A TEST intake
--   (reference ending in -TEST, or a -TEST- segment) is
--   allowed and stored with test = true.
-- * Replacing a draft deletes that draft's claim and check
--   rows and inserts the new set, in one transaction. The
--   packet row stays. Signed rows are never deleted here.
-- * No secrets and no client passwords are stored by the
--   application. This migration does not send anything.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

CREATE TABLE IF NOT EXISTS proof_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL UNIQUE REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  reference TEXT NOT NULL UNIQUE REFERENCES intakes(reference),
  test BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed')),
  heading TEXT NOT NULL,
  intro TEXT NOT NULL,
  sections JSONB NOT NULL,
  owner_signed_at TIMESTAMPTZ,
  signed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT proof_packets_sign_shape CHECK (
    (status = 'draft' AND owner_signed_at IS NULL AND signed_by IS NULL)
    OR (status = 'signed' AND owner_signed_at IS NOT NULL AND signed_by = 'owner')
  )
);

CREATE TABLE IF NOT EXISTS proof_packet_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_id UUID NOT NULL REFERENCES proof_packets(id),
  section TEXT NOT NULL CHECK (section IN (
    'authorship', 'timeline', 'money', 'discovery', 'setup',
    'access', 'follow-ups', 'wording'
  )),
  position INT NOT NULL,
  body JSONB NOT NULL,
  evidence TEXT NOT NULL CHECK (length(btrim(evidence)) > 0),
  UNIQUE (packet_id, section, position)
);

CREATE TABLE IF NOT EXISTS proof_packet_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_id UUID NOT NULL REFERENCES proof_packets(id),
  position INT NOT NULL,
  check_text TEXT NOT NULL,
  method TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('PASS', 'FAIL', 'NOT_RUN')),
  evidence TEXT NOT NULL CHECK (length(btrim(evidence)) > 0),
  not_run_reason TEXT NOT NULL DEFAULT '',
  run_by_date DATE,
  UNIQUE (packet_id, position),
  CONSTRAINT proof_packet_checks_not_run CHECK (
    result <> 'NOT_RUN'
    OR (length(btrim(not_run_reason)) > 0 AND run_by_date IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_proof_packet_claims_packet
  ON proof_packet_claims(packet_id, section, position);
CREATE INDEX IF NOT EXISTS idx_proof_packet_checks_packet
  ON proof_packet_checks(packet_id, position);
