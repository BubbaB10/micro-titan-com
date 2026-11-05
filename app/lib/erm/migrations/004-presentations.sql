-- Presentation migration — apply ONCE, in the database provider's
-- SQL editor (Neon for micro-titan-erm), AFTER
-- app/lib/erm/schema.sql. This file is documentation + migration
-- text only: no code in the repo executes it automatically.
--
-- Why: agent-led discovery ends in a presentation — the pitch sheet,
-- upgraded — built by the agent from the intake + the discovery
-- transcript, verbatim answers only. The presentation is generated
-- as status "draft", never auto-sent or auto-published; the owner
-- reviews it with the transcript before any client sees it.
--
-- Rules:
-- * One draft presentation per intake, enforced in code
--   (app/lib/erm/presentation-store.ts returns "already_exists"
--   with the stored content — no duplicate row, no overwrite).
-- * discovery_session_key links the presentation to the discovery
--   attempt it was built from, without editing the discovery_calls
--   row: discovery records are insert-only.
-- * Records are insert-only: the application never UPDATEs or
--   DELETEs a presentations row. A corrected presentation after
--   an owner decline is a later, separately approved step.
-- * No audio, no promised integrations/timelines/outcomes, no
--   invented prices or testimonials are stored here: the generator
--   (app/lib/erm/presentation.ts) only emits verbatim quotes,
--   library examples labelled as possibilities, and approved lane
--   pricing.
--
-- If this migration errors on "already exists", stop and report —
-- do not re-run blindly.

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

CREATE INDEX IF NOT EXISTS idx_presentations_intake
  ON presentations(intake_id, created_at DESC);
