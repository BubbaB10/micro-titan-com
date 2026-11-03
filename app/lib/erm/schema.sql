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

CREATE INDEX IF NOT EXISTS idx_intakes_client ON intakes(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_status ON jobs(client_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_queue ON jobs(queue_position) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_audit_client ON audit_log(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id, status);
