/**
 * /api/ops/proof-packet — owner-only proof packet draft.
 *
 * POST creates or replaces the draft for one intake. GET reads
 * that one packet. This route does not sign, does not send, and
 * does not share. A packet is an internal ERM record. It is not
 * a public receipt and it is not linked to /receipts.
 *
 * Same token gate as /api/ops/summary: Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN>. Missing token -> 503
 * ops_not_configured. Wrong token -> 401. Missing database ->
 * 503 not_configured. Unknown reference -> 404
 * intake_not_found.
 *
 * POST body: { reference, heading, intro, sections }. heading
 * and intro must be the approved text. Every claim and every
 * check needs non-empty evidence. A NOT_RUN check also needs
 * notRunReason and runByDate (YYYY-MM-DD). signedBy is not
 * accepted here; sign is POST /api/ops/proof-packet-sign, and
 * only the owner role can sign. sharedWithClient true is
 * rejected: this route never shares a packet.
 *
 * A TEST reference is allowed and stored with test: true.
 */

import { NextResponse } from "next/server";
import {
  readProofPacket,
  saveProofPacketDraft,
  validateProofPacketDraft,
} from "../../../lib/erm/proof-packet-store";

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

export async function GET(req: Request) {
  const gate = tokenGate(req);
  if (gate) return gate;
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") ?? "";
  if (reference.length === 0 || reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  const result = await readProofPacket(reference);
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "invalid") {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "proof_packet_read_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ ok: false, error: "packet_not_found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    reference: result.packet.reference,
    sharedWithClient: false,
    packet: result.packet,
  });
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
  if ("sharedWithClient" in b && b.sharedWithClient !== false) {
    return NextResponse.json({ ok: false, error: "share_not_allowed" }, { status: 400 });
  }
  if ("signedBy" in b || "ownerSignedAt" in b || (typeof b.status === "string" && b.status !== "draft")) {
    return NextResponse.json({ ok: false, error: "sign_via_sign_route" }, { status: 400 });
  }
  const reference = typeof b.reference === "string" ? b.reference : "";
  const heading = typeof b.heading === "string" ? b.heading : "";
  const intro = typeof b.intro === "string" ? b.intro : "";
  if (reference.length === 0 || reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  const error = validateProofPacketDraft({
    reference,
    heading,
    intro,
    sections: b.sections,
  });
  if (!error.ok) {
    return NextResponse.json({ ok: false, error: error.error }, { status: 400 });
  }
  const result = await saveProofPacketDraft({
    reference,
    heading,
    intro,
    sections: b.sections,
  });
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "invalid") {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "proof_packet_save_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "already_signed") {
    return NextResponse.json(
      { ok: false, error: "already_signed", packetId: result.packetId, sharedWithClient: false },
      { status: 409 },
    );
  }
  return NextResponse.json({
    ok: true,
    reference,
    erm: result.status,
    packetId: result.packetId,
    status: "draft",
    test: result.test,
    sharedWithClient: false,
  });
}
