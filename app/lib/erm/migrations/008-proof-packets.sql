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
-- that sends or shares a packet. Release to a client requires
-- both a client request and owner approval. This migration
-- does not release anything.
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
-- * status is draft or signed. A draft can be replaced. Once
--   signed, the packet and its claim and check rows are frozen
--   by trigger: no update, delete, reopen, or new child row.
-- * Sign-off stores signed_by = 'owner' only, and signed_by
--   must be non-null when status is signed. NULL does not
--   satisfy the check. The HTTP sign route derives that role
--   from OWNER_SIGNING_TOKEN. It does not trust a signedBy field.
-- * sections holds the header and the not-proven lines only.
--   Claims and checks are the child tables. Those rows are the
--   record the application reads and signs.
-- * proof_packet_claims is one row per claim. evidence must
--   still contain text after leading and trailing whitespace
--   (spaces, tabs, and other POSIX space) is removed.
--   not-proven lines are not claims and are not stored here.
-- * proof_packet_checks is one row per acceptance check.
--   result is PASS, FAIL, or NOT_RUN. NOT_RUN requires a
--   reason that is non-empty after the same whitespace trim,
--   and a run_by_date. Every check requires evidence under
--   that same trim.
-- * A TEST intake is a reference of the form MT-YYYYMMDD-XXXX
--   whose four-character code is TEST. It is stored with
--   test = true. Broader shapes are not packet references.
-- * Replacing a draft deletes that draft's claim and check
--   rows and inserts the new set, in one transaction. The
--   packet row stays. Signed rows are never deleted here.
-- * No secrets and no client passwords are stored by the
--   application. This migration does not send anything.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

CREATE OR REPLACE FUNCTION proof_packet_visible_text(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(COALESCE(value, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
$$;

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
  content_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT proof_packets_sign_shape CHECK (
    (
      status = 'draft'
      AND owner_signed_at IS NULL
      AND signed_by IS NULL
      AND content_hash IS NULL
    )
    OR (
      status = 'signed'
      AND owner_signed_at IS NOT NULL
      AND signed_by IS NOT NULL
      AND signed_by = 'owner'
      AND content_hash IS NOT NULL
      AND content_hash ~ '^[0-9a-f]{64}$'
    )
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
  evidence TEXT NOT NULL CHECK (length(proof_packet_visible_text(evidence)) > 0),
  UNIQUE (packet_id, section, position)
);

CREATE TABLE IF NOT EXISTS proof_packet_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_id UUID NOT NULL REFERENCES proof_packets(id),
  position INT NOT NULL,
  check_text TEXT NOT NULL,
  method TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('PASS', 'FAIL', 'NOT_RUN')),
  evidence TEXT NOT NULL CHECK (length(proof_packet_visible_text(evidence)) > 0),
  not_run_reason TEXT NOT NULL DEFAULT '',
  run_by_date DATE,
  UNIQUE (packet_id, position),
  CONSTRAINT proof_packet_checks_not_run CHECK (
    result <> 'NOT_RUN'
    OR (
      length(proof_packet_visible_text(not_run_reason)) > 0
      AND run_by_date IS NOT NULL
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_proof_packet_claims_packet
  ON proof_packet_claims(packet_id, section, position);
CREATE INDEX IF NOT EXISTS idx_proof_packet_checks_packet
  ON proof_packet_checks(packet_id, position);

CREATE OR REPLACE FUNCTION proof_packets_freeze_signed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'signed' THEN
      RAISE EXCEPTION 'signed proof packet is frozen'
        USING ERRCODE = 'restrict_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.status = 'signed' THEN
    RAISE EXCEPTION 'signed proof packet is frozen'
      USING ERRCODE = 'restrict_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proof_packets_freeze_signed_update ON proof_packets;
CREATE TRIGGER proof_packets_freeze_signed_update
  BEFORE UPDATE ON proof_packets
  FOR EACH ROW
  EXECUTE FUNCTION proof_packets_freeze_signed();

DROP TRIGGER IF EXISTS proof_packets_freeze_signed_delete ON proof_packets;
CREATE TRIGGER proof_packets_freeze_signed_delete
  BEFORE DELETE ON proof_packets
  FOR EACH ROW
  EXECUTE FUNCTION proof_packets_freeze_signed();

CREATE OR REPLACE FUNCTION proof_packet_children_freeze_when_signed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  parent_ids UUID[];
  parent_id UUID;
  parent_status TEXT;
BEGIN
  -- packet_id never moves. Lock every parent this statement
  -- touches, smaller uuid first, so two parents cannot deadlock
  -- each other. A signed OLD parent blocks the change even when
  -- NEW points at a draft.
  IF TG_OP = 'INSERT' THEN
    parent_ids := ARRAY[NEW.packet_id];
  ELSIF TG_OP = 'DELETE' THEN
    parent_ids := ARRAY[OLD.packet_id];
  ELSIF NEW.packet_id = OLD.packet_id THEN
    parent_ids := ARRAY[OLD.packet_id];
  ELSIF OLD.packet_id < NEW.packet_id THEN
    parent_ids := ARRAY[OLD.packet_id, NEW.packet_id];
  ELSE
    parent_ids := ARRAY[NEW.packet_id, OLD.packet_id];
  END IF;

  FOREACH parent_id IN ARRAY parent_ids LOOP
    SELECT status INTO parent_status
      FROM proof_packets
     WHERE id = parent_id
     FOR UPDATE;
    IF parent_status IS NULL THEN
      RAISE EXCEPTION 'proof packet is missing'
        USING ERRCODE = 'restrict_violation';
    END IF;
    IF parent_status = 'signed' THEN
      RAISE EXCEPTION 'signed proof packet is frozen'
        USING ERRCODE = 'restrict_violation';
    END IF;
  END LOOP;

  IF TG_OP = 'UPDATE' AND NEW.packet_id IS DISTINCT FROM OLD.packet_id THEN
    RAISE EXCEPTION 'proof packet child packet_id is immutable'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proof_packet_claims_freeze ON proof_packet_claims;
CREATE TRIGGER proof_packet_claims_freeze
  BEFORE INSERT OR UPDATE OR DELETE ON proof_packet_claims
  FOR EACH ROW
  EXECUTE FUNCTION proof_packet_children_freeze_when_signed();

DROP TRIGGER IF EXISTS proof_packet_checks_freeze ON proof_packet_checks;
CREATE TRIGGER proof_packet_checks_freeze
  BEFORE INSERT OR UPDATE OR DELETE ON proof_packet_checks
  FOR EACH ROW
  EXECUTE FUNCTION proof_packet_children_freeze_when_signed();

-- intake_id, reference, and client_id must describe the same intake.
-- test is true only when the reference code is TEST.
CREATE OR REPLACE FUNCTION proof_packets_identity_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  intake_client UUID;
  intake_reference TEXT;
  reference_is_test BOOLEAN;
BEGIN
  SELECT client_id, reference
    INTO intake_client, intake_reference
    FROM intakes
   WHERE id = NEW.intake_id
   FOR SHARE;

  IF intake_reference IS NULL THEN
    RAISE EXCEPTION 'proof packet intake is missing'
      USING ERRCODE = 'restrict_violation';
  END IF;
  IF NEW.client_id IS DISTINCT FROM intake_client
     OR NEW.reference IS DISTINCT FROM intake_reference THEN
    RAISE EXCEPTION 'proof packet identity does not match intake'
      USING ERRCODE = 'restrict_violation';
  END IF;

  reference_is_test := NEW.reference ~ '^MT-[0-9]{8}-TEST$';
  IF NEW.test IS DISTINCT FROM reference_is_test THEN
    RAISE EXCEPTION 'proof packet test flag does not match reference'
      USING ERRCODE = 'restrict_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proof_packets_identity_guard ON proof_packets;
CREATE TRIGGER proof_packets_identity_guard
  BEFORE INSERT OR UPDATE ON proof_packets
  FOR EACH ROW
  EXECUTE FUNCTION proof_packets_identity_guard();
