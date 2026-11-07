/**
 * GET /api/cron/followups — daily follow-up job (Gap 6).
 *
 * Scheduled from vercel.json once a day at 14:00 UTC, which is
 * 8:00 AM Central Standard Time and 9:00 AM Central Daylight Time.
 * Vercel Cron does not follow daylight saving; both are Chicago
 * morning. Vercel invokes this with
 * `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
 * Missing secret -> 503 cron_not_configured. Wrong or missing
 * header -> 401. The secret value is never written in source.
 *
 * Each run loads which intakes are due a Day 1 / 3 / 7 / 14
 * follow-up (America/Chicago calendar days) and returns that
 * list: reference, lane, intake status, and step only. It does
 * not insert, update, or delete a follow-up row, so a second run
 * the same Chicago day cannot create a duplicate. Follow-up rows
 * are still written only when the owner logs a step they actually
 * did, through POST /api/ops/followup-log, one row per step.
 *
 * It sends nothing. No email, SMS, or other client message, and
 * no owner email: this codebase has no owner-only follow-up
 * sender, and this route does not add one. The owner reads the
 * same due list at GET /api/ops/followups-due.
 *
 * Test intakes are not prospects. The shared due list omits them.
 * The JSON adds excludedTestCount, a number only: no test
 * reference and no name. Step timing, labels, and the zero
 * client-message result are unchanged.
 */

import { handleDailyFollowUpCron } from "../../../lib/erm/followup-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Pinned to the vercel.json cron entry. 14:00 UTC daily. */
export const FOLLOW_UP_CRON_PATH = "/api/cron/followups";
export const FOLLOW_UP_CRON_SCHEDULE = "0 14 * * *";

export async function GET(req: Request) {
  const result = await handleDailyFollowUpCron({
    authorization: req.headers.get("authorization"),
    secret: process.env.CRON_SECRET,
  });
  return Response.json(result.body, { status: result.status });
}
