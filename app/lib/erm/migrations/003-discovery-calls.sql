-- Agent-led discovery migration — apply ONCE, in the database
-- provider's SQL editor (Neon for micro-titan-erm), AFTER
-- app/lib/erm/schema.sql. This file is documentation + migration
-- text only: no code in the repo executes it automatically.
--
-- Why: agent-led discovery (text, agent-led at the client's pace,
-- or a 15–20 minute voice call) needs one record per attempt, for
-- one intake, in one channel: the full transcript (message log for
-- text, call transcript for voice), the agent's recommendation, and
-- the presentation reference once a presentation is built. The
-- transcript is the record — a summary is never a substitute.
--
-- Rules:
-- * session_key is UNIQUE: one key per discovery attempt (a Twilio
--   CallSid, a text-thread id, or a voice-session id, supplied by
--   the caller). A re-delivered transcript with the same key writes
--   nothing twice. A new attempt uses a new key and is a new row.
-- * No audio is stored in the ERM. recording_ref carries only the
--   provider's recording reference (e.g. a Twilio recording SID).
-- * Records are insert-only: the application never UPDATEs or
--   DELETEs a discovery_calls row. A corrected transcript is a new
--   attempt, not an edit of the old one.
-- * The intake status machine is unchanged: discovery_paid ->
--   discovery_booked is the only transition this slice makes, and a
--   completed discovery never advances an intake to "setup" — setup
--   moves only on the owner's approval after review.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

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

CREATE INDEX IF NOT EXISTS idx_discovery_calls_intake
  ON discovery_calls(intake_id, created_at DESC);
