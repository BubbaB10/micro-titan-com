/**
 * /api/ops/change-log — owner-only change + access log (Gap 10).
 *
 * POST records a change the owner actually made, or access the
 * owner actually granted / revoked / reviewed, by hand. This
 * route RECORDS a change; it does not make one. There is no
 * system change, no access grant, and no email, SMS, or call in
 * this route, and no sender is created. The owner calls it
 * after doing the change — pointing a webhook, rotating an env
 * var, changing a price, granting someone access — so the
 * change leaves a checkable record in the ERM instead of living
 * only in chat or in memory.
 *
 * GET lists the log, newest first: references, kinds, actions,
 * and descriptions only — no names, no answers, no contact
 * details. Optional filters: kind=change|access,
 * reference=MT-... (one intake), limit (1–200, default 50).
 *
 * Same token gate as /api/ops/summary and
 * /api/ops/followup-log: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database ->
 * 503 not_configured.
 *
 * POST body: { kind: "change" | "access",
 *   action: one of the actions for that kind (see
 *   change-log-store.ts CHANGE_LOG_ACTIONS),
 *   subject: string (what system / setup / resource),
 *   summary?: string, fromValue?: string, toValue?: string,
 *   reference?: string (an intake reference, or empty for a
 *   system-wide change), actor?: string, eventKey: string }
 * eventKey is required and unique: re-logging the same event
 * key -> 200 already_exists, no duplicate row. Unknown
 * reference -> 404 intake_not_found, writes nothing.
 * No secrets in fromValue / toValue, ever — descriptions
 * only, never a credential, key, token, or password value.
 *
 * This is Bubba/Boone only, NOT a client login.
 */

import { NextResponse } from "next/server";
import {
  changeLogList,
  recordChangeLog,
  validateChangeLogInput,
} from "../../../lib/erm/change-log-store";
import type { ChangeLogAction, ChangeLogKind } from "../../../lib/erm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tokenGate(req: Request): NextResponse | null {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ops_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request) {
  const gate = tokenGate(req);
  if (gate) return gate;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const kind = typeof b.kind === "string" ? b.kind : "";
  const action = typeof b.action === "string" ? b.action : "";
  const subject = typeof b.subject === "string" ? b.subject : "";
  const summary = typeof b.summary === "string" ? b.summary : "";
  const fromValue = typeof b.fromValue === "string" ? b.fromValue : "";
  const toValue = typeof b.toValue === "string" ? b.toValue : "";
  const reference = typeof b.reference === "string" ? b.reference : "";
  const actor = typeof b.actor === "string" ? b.actor : "owner";
  const eventKey = typeof b.eventKey === "string" ? b.eventKey : "";
  const error = validateChangeLogInput({
    kind: kind as ChangeLogKind,
    action: action as ChangeLogAction,
    actor,
    subject,
    summary,
    fromValue,
    toValue,
    reference,
    eventKey,
  });
  if (error !== null) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
  const result = await recordChangeLog({
    kind: kind as ChangeLogKind,
    action: action as ChangeLogAction,
    actor,
    subject,
    summary,
    fromValue,
    toValue,
    reference,
    eventKey,
  });
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "change_log_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "already_exists") {
    return NextResponse.json({
      ok: true,
      erm: "already_exists",
      changeLogId: result.changeLogId,
      kind: result.kind,
      action: result.action,
    });
  }
  return NextResponse.json({
    ok: true,
    erm: "written",
    changeLogId: result.changeLogId,
    kind: result.kind,
    action: result.action,
  });
}

export async function GET(req: Request) {
  const gate = tokenGate(req);
  if (gate) return gate;
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "";
  const reference = url.searchParams.get("reference") ?? "";
  const limitRaw = url.searchParams.get("limit") ?? "";
  if (kind !== "" && kind !== "change" && kind !== "access") {
    return NextResponse.json({ ok: false, error: "bad_kind" }, { status: 400 });
  }
  if (reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  let limit = 50;
  if (limitRaw !== "") {
    const parsed = Number(limitRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 200) {
      return NextResponse.json({ ok: false, error: "bad_limit" }, { status: 400 });
    }
    limit = parsed;
  }
  const result = await changeLogList({ kind, reference, limit });
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "change_log_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, entries: result.entries });
}
