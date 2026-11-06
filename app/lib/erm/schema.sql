-- Micro Titan own CRM/ERM — schema, first slice.
-- Apply with psql (or the database provider's SQL editor) AFTER a
-- database is provisioned. This file is documentation + migration
-- text only: no code in this repo executes it automatically, and no
-- code connects to a database unless ERM_DATABASE_URL is set.
--
-- Design rules:
-- * intake_reference is UNIQUE: a re-POST with the same reference
--   cannot create a duplicate intake (idempotency, same as PR #24).
-- * stripe_payment_id is UNIQUE when present: one Stripe payment
--   cannot be recorded twice.
-- * audit_log is INSERT-ONLY by convention: the application never
--   issues UPDATE or DELETE against it. Enforce with a trigger or a
--   read-only role if the provider supports it; at minimum, do not
--   grant the application role UPDATE/DELETE on audit_log.
-- * Every client-owned row carries client_id. Queries filter by
--   client_id, except the owner summary, which returns counts and
--   money totals only (no names, no answers, no contact details).
-- * No column stores a client password, ever. No column is intended
--   for patient health information or any other regulated data.

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL DEFAULT '',
  lane TEXT NOT NULL CHECK (lane IN ('Family', 'Solo entrepreneur', 'Business')),
  agent_preference TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  reference TEXT NOT NULL UNIQUE,
  lane TEXT NOT NULL CHECK (lane IN ('Family', 'Solo entrepreneur', 'Business')),
  plate TEXT NOT NULL DEFAULT '',
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'received',
  next_action TEXT NOT NULL DEFAULT 'Completeness check',
  source TEXT NOT NULL DEFAULT 'micro-titan.com/intake',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pitch_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'agreed')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  agreed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  lane TEXT NOT NULL,
  discovery_cents INT NOT NULL,
  total_cents INT NOT NULL,
  after_credit_cents INT NOT NULL,
  monthly_cents INT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('email', 'site')),
  signature_text TEXT NOT NULL DEFAULT '',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- NOTE: acceptance is recorded, not claimed as a legal e-signature.
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  kind TEXT NOT NULL CHECK (kind IN ('discovery', 'balance', 'monthly')),
  stripe_payment_id TEXT UNIQUE,
  amount_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  preferred_times JSONB NOT NULL DEFAULT '[]'::jsonb,
  confirmed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  shape TEXT NOT NULL CHECK (shape IN ('a_la_carte', 'scoped')),
  title TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT '',
  price_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'delivered', 'proof', 'closed')),
  queue_position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  reference TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'overdue')),
  owner TEXT NOT NULL DEFAULT 'Boone',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent-led discovery (design: micro-titan-agent-led-discovery-design-2026-11-05.md).
-- One record per attempt, for one intake, in one channel (text or voice).
-- The transcript is the record: message log for text, call transcript
-- for voice. No audio is stored here — recording_ref carries only the
-- provider's recording reference. See migration 003-discovery-calls.sql.
CREATE TABLE IF NOT EXISTS discovery_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  reference TEXT NOT NULL,
  session_key TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL CHECK (channel IN ('text', 'voice', 'in_app_voice')),
  format_choice TEXT NOT NULL CHECK (format_choice IN ('text', 'call')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'no_answer', 'awaiting_client', 'escalated', 'cancelled')),
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  recording_ref TEXT NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL CHECK (recommendation IN ('approve', 'join_to_close', 'decline', 'needs_human')),
  recommendation_reason TEXT NOT NULL DEFAULT '',
  presentation_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intakes_client ON intakes(client_id);
CREATE INDEX IF NOT EXISTS idx_discovery_calls_intake ON discovery_calls(intake_id, created_at DESC);

-- Presentation (design §8): generated from intake + discovery
-- transcript, verbatim answers only, status "draft", never
-- auto-sent or auto-published. Owner reviews before any client
-- sees it. See migration 004-presentations.sql.
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  reference TEXT NOT NULL,
  discovery_session_key TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL CHECK (channel IN ('text', 'voice', 'in_app_voice')),
  format_choice TEXT NOT NULL CHECK (format_choice IN ('text', 'call')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'shown', 'declined')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presentations_intake ON presentations(intake_id, created_at DESC);

-- Follow-up audit trail (Gap 6): logging only, no auto-sends.
-- One row per follow-up the owner actually did, by hand, for one
-- intake: Day 1 intake acknowledged, Day 3 first follow-up,
-- Day 7 second / final follow-up, Day 14 close as no reply.
-- The row is the audit trail, not the sending: nothing in this
-- slice sends an email, SMS, or call, and no sender is created.
-- A logged day14 step means "close as no reply" is due; the owner
-- closes the intake as a separate, owner-approved step — this
-- table never closes an intake by itself.
-- See migration 005-followups.sql.
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  reference TEXT NOT NULL,
  step TEXT NOT NULL CHECK (step IN ('day1', 'day3', 'day7', 'day14')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'text', 'call', 'manual_note')),
  note TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followups_intake ON followups(intake_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_followups_step ON followups(intake_id, step);

-- Change + access log (Gap 10): logging only, no auto-sends.
-- One row per change the owner actually made, or per access
-- the owner actually granted / revoked / reviewed, for one
-- intake or system-wide (empty reference). The row is the audit
-- trail, not the change itself: nothing in this slice changes a
-- system, grants access, or sends anything. One row per event
-- key, ever; records are insert-only. No secrets in from_value /
-- to_value — descriptions only, never a credential value.
-- See migration 006-change-log.sql.
CREATE TABLE IF NOT EXISTS change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intakes(id),
  client_id UUID REFERENCES clients(id),
  reference TEXT NOT NULL DEFAULT '',
  event_key TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('change', 'access')),
  action TEXT NOT NULL CHECK (action IN (
    'config_changed', 'integration_added', 'integration_removed',
    'integration_rewired', 'price_changed', 'route_added',
    'route_changed', 'env_updated', 'migration_applied',
    'deployment_made', 'other_change',
    'access_granted', 'access_revoked', 'access_reviewed',
    'access_changed'
  )),
  actor TEXT NOT NULL DEFAULT 'owner',
  subject TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  from_value TEXT NOT NULL DEFAULT '',
  to_value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_change_log_created ON change_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_reference ON change_log(reference, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_kind ON change_log(kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_client_status ON jobs(client_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_queue ON jobs(queue_position) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_audit_client ON audit_log(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id, status);
