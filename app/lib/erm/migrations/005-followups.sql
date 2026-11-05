-- Follow-up audit trail migration — apply ONCE, in the database
-- provider's SQL editor (Neon for micro-titan-erm), AFTER
-- app/lib/erm/schema.sql. This file is documentation + migration
-- text only: no code in the repo executes it automatically.
--
-- Why: Gap 6 — Day 1 / 3 / 7 / 14 follow-ups for quiet prospects
-- must leave a checkable record against the intake, with an audit
-- row each time (operating rule:
-- micro-titan-discovery-booking-and-followup.md). Until now the
-- follow-up reminder cron read the Google Sheet and the follow-up
-- itself was logged by hand in the Sheet; the ERM had no place for
-- it. This table is that place.
--
-- Rules:
-- * Logging only. One row per follow-up the owner actually did,
--   by hand, for one intake. This table records follow-ups; it
--   does not send them. No email, SMS, or call is made by the
--   code that writes here, and no sender is created by this
--   migration. Automated sending needs the owner's separate go.
-- * One row per step per intake, enforced in code
--   (app/lib/erm/followup-store.ts returns "already_exists" —
--   no duplicate row, no overwrite).
-- * Records are insert-only: the application never UPDATEs or
--   DELETEs a followups row. A Day 14 row means "close as no
--   reply" is due; the owner closes the intake as a separate,
--   owner-approved step — this table never closes an intake.
-- * No names, answers, or contact details are stored here beyond
--   the intake reference: the owner due-list returns references,
--   lanes, and steps only.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

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

CREATE INDEX IF NOT EXISTS idx_followups_intake
  ON followups(intake_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_followups_step
  ON followups(intake_id, step);
