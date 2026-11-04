-- Twilio text-first migration — apply ONCE, in the database provider's
-- SQL editor (Neon for micro-titan-erm), AFTER app/lib/erm/schema.sql,
-- and BEFORE the Twilio webhook is pointed at production. This file is
-- documentation + migration text only: no code in the repo executes
-- it automatically, and no code connects to a database unless
-- ERM_DATABASE_URL (or its Neon fallback) is set.
--
-- Why a new table instead of audit_log: audit_log.client_id is NOT
-- NULL with a clients FK, so a text or call from a number Micro
-- Titan does not yet know cannot be recorded there at all. The
-- communication log must record unknown callers too — never dropped
-- silently, never attached to an invented client — so client_id and
-- intake_id are NULLABLE here, and are filled in only when a thread
-- is later linked to a known client/intake by an owner step.
--
-- Dedupe: (twilio_sid, kind) is UNIQUE, so a Twilio redelivery of
-- the same MessageSid / CallSid + kind inserts nothing twice.
-- The auto-text send dedupe is separate (see communication-store):
-- it is the outbound "sent" row for a CallSid, not this log row.
--
-- No recording, no transcription, no media URLs are stored here:
-- only a media count, so a photo/document thread is flagged
-- without persisting a link to it.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  intake_id UUID REFERENCES intakes(id),
  twilio_sid TEXT NOT NULL,
  related_sid TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL CHECK (kind IN ('sms_inbound', 'sms_outbound', 'missed_call_auto_text', 'voice_status', 'voice_rejected')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'system')),
  from_number TEXT NOT NULL DEFAULT '',
  to_number TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  media_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'logged' CHECK (status IN ('logged', 'sent', 'cap_blocked', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (twilio_sid, kind)
);

CREATE INDEX IF NOT EXISTS idx_communication_from_created
  ON communication_log (from_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_related
  ON communication_log (related_sid) WHERE related_sid <> '';
CREATE INDEX IF NOT EXISTS idx_communication_auto_text_day
  ON communication_log (created_at) WHERE kind = 'missed_call_auto_text' AND status = 'sent';
