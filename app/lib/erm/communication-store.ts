/**
 * Micro Titan ERM communication log — gated Postgres store.
 *
 * Gating (same pattern as the pitch / payment stores):
 * - If ERM_DATABASE_URL (or the Neon integration's
 *   ERM_DATABASE_DATABASE_URL fallback) is absent, every function
 *   returns "not_configured" and never throws, never connects.
 * - The communication_log table does NOT exist in schema.sql yet:
 *   apply app/lib/erm/migrations/002-twilio-communication-log.sql
 *   once in Neon before this route is pointed at production. If
 *   the table is missing, queries fail and the store returns
 *   "failed" — the webhook route then returns 503 so Twilio retries
 *   instead of dropping the event.
 *
 * Tenant / privacy rules:
 * - client_id and intake_id are NULLABLE: an inbound text or call
 *   from a number Micro Titan does not yet know must still be
 *   logged, never dropped, and never attached to an invented client.
 * - Dedupe is (twilio_sid, kind): a Twilio redelivery of the same
 *   MessageSid / CallSid + kind inserts nothing twice. The webhook
 *   passes a distinct twilio_sid per voice status
 *   (`${callSid}:status:${callStatus}`) so a terminal status is
 *   still inserted after voice_rejected (raw CallSid) or an earlier
 *   status for that call. No schema change: the unique key is
 *   already (twilio_sid, kind).
 * - The send dedupe is SEPARATE from the log dedupe, on purpose:
 *   whether an auto-text was already SENT is decided by the
 *   outbound "sent" row for that CallSid (related_sid), not by the
 *   voice log row. That key stays the raw CallSid.
 *   That way a redelivery after a failed send can still retry the
 *   send, while a redelivery after a successful send cannot
 *   re-text. A cap_blocked row never counts as sent.
 * - No recording, no transcription, no media URLs are stored:
 *   only a media count, so a photo/document thread is flagged
 *   without persisting a link to it.
 */

export type RecordCommunicationResult =
  | { status: "written"; id: string }
  | { status: "already_exists"; id: string }
  | { status: "not_configured" }
  | { status: "failed" };

export type AutoTextStateResult =
  | { status: "ok"; alreadySent: boolean; sentToday: number }
  | { status: "not_configured" }
  | { status: "failed" };

export type ThreadResult =
  | { status: "ok"; rows: ThreadRow[] }
  | { status: "not_configured" }
  | { status: "failed" };

export interface ThreadRow {
  kind: string;
  direction: string;
  fromNumber: string;
  toNumber: string;
  body: string;
  mediaCount: number;
  status: string;
  createdAt: string;
}

export interface CommunicationInput {
  twilioSid: string;
  relatedSid?: string;
  kind: string;
  direction: "inbound" | "outbound" | "system";
  fromNumber: string;
  toNumber: string;
  body?: string;
  mediaCount?: number;
  status?: string;
}

function dbUrl(): string | undefined {
  return process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
}

async function pool() {
  const { Pool } = await import("pg");
  return new Pool({ connectionString: dbUrl(), max: 1 });
}

export async function recordCommunication(
  input: CommunicationInput,
): Promise<RecordCommunicationResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const p = await pool();
    try {
      const res = await p.query(
        `INSERT INTO communication_log
           (twilio_sid, related_sid, kind, direction, from_number, to_number, body, media_count, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (twilio_sid, kind) DO NOTHING
         RETURNING id`,
        [
          input.twilioSid,
          input.relatedSid ?? "",
          input.kind,
          input.direction,
          input.fromNumber,
          input.toNumber,
          input.body ?? "",
          input.mediaCount ?? 0,
          input.status ?? "logged",
        ],
      );
      if (res.rows.length === 0) {
        const existing = await p.query(
          `SELECT id FROM communication_log WHERE twilio_sid = $1 AND kind = $2`,
          [input.twilioSid, input.kind],
        );
        return {
          status: "already_exists",
          id: existing.rows.length > 0 ? String(existing.rows[0].id) : "",
        };
      }
      return { status: "written", id: String(res.rows[0].id) };
    } finally {
      await p.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

/**
 * Auto-text state for one missed call. sentToday counts outbound
 * "sent" missed_call_auto_text rows on the database calendar day.
 * The cap is enforced by the route, not here.
 */
export async function autoTextState(callSid: string): Promise<AutoTextStateResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const p = await pool();
    try {
      const sent = await p.query(
        `SELECT COUNT(*)::int AS n FROM communication_log
         WHERE kind = 'missed_call_auto_text' AND direction = 'outbound' AND status = 'sent'
           AND related_sid = $1`,
        [callSid],
      );
      const today = await p.query(
        `SELECT COUNT(*)::int AS n FROM communication_log
         WHERE kind = 'missed_call_auto_text' AND direction = 'outbound' AND status = 'sent'
           AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
      );
      return {
        status: "ok",
        alreadySent: Number(sent.rows[0]?.n ?? 0) > 0,
        sentToday: Number(today.rows[0]?.n ?? 0),
      };
    } finally {
      await p.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

/** Inbound rows from one number in the last 15 minutes (rate limit). */
export async function inboundCountLast15Min(
  fromNumber: string,
): Promise<{ status: "ok"; count: number } | { status: "not_configured" } | { status: "failed" }> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const p = await pool();
    try {
      const res = await p.query(
        `SELECT COUNT(*)::int AS n FROM communication_log
         WHERE direction = 'inbound' AND from_number = $1
           AND created_at >= now() - INTERVAL '15 minutes'`,
        [fromNumber],
      );
      return { status: "ok", count: Number(res.rows[0]?.n ?? 0) };
    } finally {
      await p.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}

/** One thread only: the most recent rows for one from-number, newest first. */
export async function listThread(fromNumber: string, limit = 20): Promise<ThreadResult> {
  const url = dbUrl();
  if (!url) return { status: "not_configured" };
  try {
    const p = await pool();
    try {
      const res = await p.query(
        `SELECT kind, direction, from_number, to_number, body, media_count, status, created_at
         FROM communication_log WHERE from_number = $1
         ORDER BY created_at DESC LIMIT $2`,
        [fromNumber, limit],
      );
      return {
        status: "ok",
        rows: res.rows.map((r) => ({
          kind: String(r.kind),
          direction: String(r.direction),
          fromNumber: String(r.from_number),
          toNumber: String(r.to_number),
          body: String(r.body),
          mediaCount: Number(r.media_count),
          status: String(r.status),
          createdAt: String(r.created_at),
        })),
      };
    } finally {
      await p.end().catch(() => undefined);
    }
  } catch {
    return { status: "failed" };
  }
}
