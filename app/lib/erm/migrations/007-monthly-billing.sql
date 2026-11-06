-- Monthly billing tracking migration — apply ONCE, in the database
-- provider's SQL editor (Neon for micro-titan-erm), AFTER
-- app/lib/erm/schema.sql. This file is documentation + migration
-- text only: no code in the repo executes it automatically.
--
-- Why: Gap 9 — operate-plan months (Family $95 / Solo $350 /
-- Business $950, optional) must be tracked: who is on a plan,
-- what month, whether it paid. Until now a monthly payment had
-- no month attached to it and no enrollment behind it: the
-- payments table knew a 'monthly' payment existed, but not which
-- month it covered, and nothing recorded who had actually opted
-- into the plan. This migration adds both.
--
-- Rules:
-- * Tracking only. This migration adds tables and columns; it
--   does not charge anyone, create a Stripe subscription, or
--   send anything. Enrollment is an explicit owner action
--   (POST /api/ops/monthly-enroll), never automatic, and a
--   payment never enrolls a client.
-- * monthly_subscriptions: one row per enrollment, one active
--   row per intake at a time (enforced in code, not by a
--   unique index — a cancelled row stays as the record and
--   re-enrolling inserts a new row).
-- * payments.period_month: YYYY-MM in America/Chicago, the
--   month the payment covers. One paid row per intake per
--   month, ever (enforced in code in monthly-store.ts).
-- * Depends on migration 001 (nullable payments.intake_id /
--   client_id, already applied in Neon) for UNLINKED monthly
--   payments: a monthly payment whose intake reference is
--   unknown is recorded unlinked, never dropped.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

CREATE TABLE IF NOT EXISTS monthly_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  reference TEXT NOT NULL,
  lane TEXT NOT NULL CHECK (lane IN ('Family', 'Solo entrepreneur', 'Business')),
  amount_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  started_month TEXT NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monthly_subs_intake
  ON monthly_subscriptions(intake_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_monthly_subs_active
  ON monthly_subscriptions(status, created_at ASC);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS period_month TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_monthly_period
  ON payments(intake_id, period_month) WHERE kind = 'monthly';
