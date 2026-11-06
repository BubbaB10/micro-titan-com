/**
 * ERM discovery-call logging — agent-led discovery, text or voice.
 *
 * Design: micro-titan-agent-led-discovery-design-2026-11-05.md (§7).
 * Same gated pattern as app/lib/erm/agreement-store.ts (PR #33) and
 * app/lib/erm/pitch-store.ts (PR #28).
 *
 * One discovery record per attempt, for one intake, in one channel:
 * - channel "text": agent-led text discovery, at the client's pace.
 *   The transcript IS the message log — every agent message and every
 *   client reply, in order, with timestamps.
 * - channel "voice": a 15–20 minute agent-led voice call, scheduled,
 *   recorded, transcribed. The transcript is the full call transcript
 *   — every turn, in order. A summary is never a substitute.
 * Both channels lead to the same next step: a presentation built from
 * intake + discovery, reviewed by the owner before setup moves.
 *
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects, and
 *   never invents data. A missing database can never lose a discovery
 *   record: the caller keeps the transcript and retries the write.
 * - The caller must supply an intake reference that already exists
 *   in intakes. This module never creates a client or an intake:
 *   a discovery is recorded FOR an intake, not instead of one.
 *   An unknown reference returns "intake_not_found" and writes
 *   nothing.
 * - Idempotency is enforced in code on session_key — one key per
 *   discovery attempt (a Twilio CallSid, a text-thread id, or a
 *   voice-session id, supplied by the caller, never invented here).
 *   A re-delivered transcript with the same session_key returns
 *   "already_exists" with the stored row — no duplicate row, no
 *   overwrite, no second audit row. A new attempt (a rescheduled
 *   call, a switched format) uses a new session_key and is a new row.
 * - Records are insert-only here: this module never UPDATEs or
 *   DELETEs a discovery_calls row, and never UPDATEs or DELETEs an
 *   audit_log row. A corrected transcript is a new attempt, not an
 *   edit of the old one — the old record stays checkable.
 * - The transcript is stored verbatim, in the client's words. This
 *   module never summarises, never fills a gap, never guesses a
 *   number. An unanswered question stays unanswered in the record.
 * - Intake status advances to "discovery_booked" ONLY when the
 *   status machine in types.ts allows it from the intake's current
 *   status (discovery_paid -> discovery_booked). A completed
 *   discovery never advances an intake to "setup" — setup moves
 *   only on the owner's approval after review, never by the agent
 *   alone.
 * - No audio is stored in the ERM. A voice discovery carries only
 *   recording_ref — the provider's recording reference (e.g. a
 *   Twilio recording SID). Text discoveries carry no recording_ref.
 * - No PII is logged. The owner status check is token-gated by the
 *   route that calls it and returns the transcript to the owner
 *   only, for review — that is the point of the record. Errors
 *   return a status string only.
 */

import type {
  DiscoveryChannel,
  DiscoveryRecommendation,
  DiscoveryStatus,
  DiscoveryTranscriptTurn,
} from "./types";

export type { DiscoveryTranscriptTurn };

export interface DiscoveryCallInput {
  reference: string;
  /** One key per discovery attempt, from the caller (CallSid, thread id, session id). Never invented here. */
  sessionKey: string;
  channel: DiscoveryChannel;
  /** What the client picked: "text" or "call". Recorded, not assumed. */
  formatChoice: "text" | "call";
  status: DiscoveryStatus;
  /** Voice only: consent to record + transcribe, given at booking and confirmed at the start of the call. */
  consentGiven: boolean;
  consentAt?: string | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  /** Full transcript, every turn in order. A summary is never a substitute. */
  transcript: DiscoveryTranscriptTurn[];
  /** Voice only: provider recording reference (e.g. Twilio recording SID). Never the audio itself. */
  recordingRef?: string | null;
  recommendation: DiscoveryRecommendation;
  /** Short reason, in the agent's words, plus the exact open questions for the owner. */
  recommendationReason: string;
  /** Reference to the presentation built from this discovery, once built. */
  presentationRef?: string | null;
}

export type RecordDiscoveryCallResult =
  | { status: "written"; discoveryCallId: string }
  | { status: "already_exists"; discoveryCallId: string }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

export type DiscoveryCallStatusResult =
  | {
      status: "found";
      channel: DiscoveryChannel;
      callStatus: DiscoveryStatus;
      recommendation: DiscoveryRecommendation;
      recommendationReason: string;
      transcript: DiscoveryTranscriptTurn[];
      presentationRef: string | null;
    }
  | { status: "not_found" }
  | { status: "intake_not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

export async function recordDiscoveryCall(
  input: DiscoveryCallInput,
): Promise<RecordDiscoveryCallResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const intake = await client.query(
          "SELECT id, client_id, status FROM intakes WHERE reference = $1",
          [input.reference],
        );
        if (intake.rows.length === 0) {
          await client.query("ROLLBACK");
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const clientId = String(intake.rows[0].client_id);
        const currentStatus = String(intake.rows[0].status);
        const existing = await client.query(
          "SELECT id FROM discovery_calls WHERE session_key = $1 ORDER BY created_at ASC LIMIT 1",
          [input.sessionKey],
        );
        if (existing.rows.length > 0) {
          await client.query("ROLLBACK");
          return {
            status: "already_exists",
            discoveryCallId: String(existing.rows[0].id),
          };
        }
        const inserted = await client.query(
          `INSERT INTO discovery_calls
             (intake_id, client_id, reference, session_key, channel, format_choice,
              status, consent_given, consent_at, scheduled_at, started_at, ended_at,
              duration_seconds, transcript, recording_ref, recommendation,
              recommendation_reason, presentation_ref)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, $16, $17, $18)
           RETURNING id`,
          [
            intakeId,
            clientId,
            input.reference,
            input.sessionKey,
            input.channel,
            input.formatChoice,
            input.status,
            input.consentGiven,
            input.consentAt ?? null,
            input.scheduledAt ?? null,
            input.startedAt ?? null,
            input.endedAt ?? null,
            input.durationSeconds ?? null,
            JSON.stringify(input.transcript),
            input.recordingRef ?? null,
            input.recommendation,
            input.recommendationReason,
            input.presentationRef ?? null,
          ],
        );
        const discoveryCallId = String(inserted.rows[0].id);
        await client.query(
          `INSERT INTO audit_log (entity_type, entity_id, client_id, actor, action, from_status, to_status, reference)
           VALUES ('discovery_call', $1, $2, 'system', 'discovery_completed', NULL, $3, $4)`,
          [discoveryCallId, clientId, input.status, input.reference],
        );
        // Intake status advances to "discovery_booked" only when the
        // status machine allows it (discovery_paid -> discovery_booked).
        // A completed discovery never advances an intake to "setup":
        // setup moves only on the owner's approval after review.
        if (currentStatus === "discovery_paid") {
          await client.query(
            "UPDATE intakes SET status = 'discovery_booked' WHERE id = $1",
            [intakeId],
          );
        }
        await client.query("COMMIT");
        return { status: "written", discoveryCallId };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } finally {
      await pool.end();
    }
  } catch {
    return { status: "failed" };
  }
}

export async function discoveryCallStatus(
  reference: string,
): Promise<DiscoveryCallStatusResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const client = await pool.connect();
      try {
        const intake = await client.query(
          "SELECT id FROM intakes WHERE reference = $1",
          [reference],
        );
        if (intake.rows.length === 0) {
          return { status: "intake_not_found" };
        }
        const intakeId = String(intake.rows[0].id);
        const row = await client.query(
          `SELECT channel, status, recommendation, recommendation_reason, transcript, presentation_ref
             FROM discovery_calls WHERE intake_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [intakeId],
        );
        if (row.rows.length === 0) {
          return { status: "not_found" };
        }
        return {
          status: "found",
          channel: row.rows[0].channel as DiscoveryChannel,
          callStatus: row.rows[0].status as DiscoveryStatus,
          recommendation: row.rows[0].recommendation as DiscoveryRecommendation,
          recommendationReason: String(row.rows[0].recommendation_reason ?? ""),
          transcript: row.rows[0].transcript as DiscoveryTranscriptTurn[],
          presentationRef: row.rows[0].presentation_ref as string | null,
        };
      } finally {
        client.release();
      }
    } finally {
      await pool.end();
    }
  } catch {
    return { status: "failed" };
  }
}

export type VoiceIntakeLookup =
  | { status: "found" }
  | { status: "not_found" }
  | { status: "not_configured" }
  | { status: "failed" };

/**
 * Read-only: does this intake reference exist? Used by the
 * voice-discovery TwiML route before it will connect a Media Stream.
 * No insert, no update, no delete. Missing database → not_configured,
 * which the route treats as "not a known intake" and rejects.
 */
export async function voiceIntakeExists(reference: string): Promise<VoiceIntakeLookup> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      const found = await pool.query("SELECT id FROM intakes WHERE reference = $1", [reference]);
      if (found.rows.length === 0) return { status: "not_found" };
      return { status: "found" };
    } finally {
      await pool.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}
