-- Change + access log migration — apply ONCE, in the database
-- provider's SQL editor (Neon for micro-titan-erm), AFTER
-- app/lib/erm/schema.sql. This file is documentation + migration
-- text only: no code in the repo executes it automatically.
--
-- Why: Gap 10 — every change to a setup, and every grant of
-- access, must leave a checkable record: who changed what, and
-- who holds access to what. Until now those changes lived in
-- chat, in memory, or nowhere: a webhook pointed at production,
-- an env var rotated, a price changed, a person granted access
-- to a system — each was a fact with no row behind it. This
-- table is that row.
--
-- Rules:
-- * Logging only. One row per change or access event the owner
--   actually made, by hand, for one intake or system-wide.
--   This table records changes; it does not make them. No
--   system is changed, no access is granted, and nothing is
--   sent by the code that writes here. No email, SMS, or call
--   is made by that code, and no sender is created.
-- * One row per event key, ever, enforced in code
--   (app/lib/erm/change-log-store.ts returns "already_exists"
--   — no duplicate row, no overwrite). A re-POST of the same
--   event is a no-op, not a second event.
-- * Records are insert-only: the application never UPDATEs or
--   DELETEs a change_log row. An intake-linked entry also
--   leaves an audit_log row; a system-wide entry (no intake,
--   no client) leaves none, because audit_log.client_id is
--   NOT NULL — the change_log row itself is the record there.
-- * No secrets in this log, ever. from_value / to_value carry
--   descriptions ("enabled", "Family $1,500", "webhook pointed
--   at production"), never a credential, key, token, or
--   password value. No client passwords are stored, ever.
-- * An entry linked to an intake carries that intake's
--   reference; a system-wide entry carries an empty reference.
--   No names, answers, or contact details are stored here.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

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

CREATE INDEX IF NOT EXISTS idx_change_log_created
  ON change_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_reference
  ON change_log(reference, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_kind
  ON change_log(kind, created_at DESC);
