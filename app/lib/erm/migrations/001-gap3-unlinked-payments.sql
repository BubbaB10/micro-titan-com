-- Gap 3 migration — apply ONCE, in the database provider's SQL editor
-- (Neon for micro-titan-erm), AFTER app/lib/erm/schema.sql, and BEFORE
-- the Stripe webhook is pointed at production. This file is
-- documentation + migration text only: no code in the repo executes
-- it automatically.
--
-- Why: schema.sql defines payments.intake_id and payments.client_id
-- as NOT NULL with FKs, so a payment whose intake reference is
-- unknown cannot be recorded there at all. Gap 3 must record such
-- payments as UNLINKED (never dropped silently, never attached to an
-- invented intake), so those two columns become nullable and the
-- payment carries its own reference + event id + linked flag.
--
-- Existing linked rows are unaffected: linked defaults to true, and
-- intake_reference/stripe_event_id are NULL for rows written before
-- Gap 3 (their stripe_payment_id is still the idempotency key).
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly. If it errors on a column already dropped
-- to nullable, that step is already done; continue with the rest.

ALTER TABLE payments ADD COLUMN IF NOT EXISTS intake_reference TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_event_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS linked BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE payments ALTER COLUMN intake_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN client_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_event
  ON payments (stripe_event_id) WHERE stripe_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_intake_reference
  ON payments (intake_reference) WHERE intake_reference IS NOT NULL;
