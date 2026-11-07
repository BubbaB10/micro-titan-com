/**
 * POST /api/ops/proof-packet-sign — owner-only sign-off.
 *
 * Signs the draft packet for one intake. The signer must be the
 * owner role ("owner"), the same actor value already stored on
 * owner-written rows. The route itself is gated by
 * OPS_DASHBOARD_TOKEN, the flag this repo uses for owner actions.
 * Any other signer is rejected and nothing is written.
 *
 * There is no client counter-signature. This route does not send
 * email, SMS, or a call, and it does not share the packet. A
 * signed packet stays an internal ERM record.
 *
 * Body: { reference, signedBy: "owner" }. Unknown reference ->
 * 404 intake_not_found. No draft -> 404 packet_not_found.
 * Already signed -> 200 already_signed, and the stored sign-off
 * is left as it was.
 */

import { NextResponse } from "next/server";
import { signProofPacket, validateOwnerSigner } from "../../../lib/erm/proof-packet-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ops_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
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
  const reference = typeof b.reference === "string" ? b.reference : "";
  if (reference.length === 0 || reference.length > 50) {
    return NextResponse.json({ ok: false, error: "bad_reference" }, { status: 400 });
  }
  const signerError = validateOwnerSigner(b.signedBy);
  if (signerError) {
    return NextResponse.json({ ok: false, error: signerError }, { status: 400 });
  }
  const result = await signProofPacket(reference, b.signedBy);
  if (result.status === "not_owner") {
    return NextResponse.json({ ok: false, error: "not_owner" }, { status: 400 });
  }
  if (result.status === "not_configured") {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (result.status === "invalid") {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  if (result.status === "failed") {
    return NextResponse.json({ ok: false, error: "proof_packet_sign_failed" }, { status: 502 });
  }
  if (result.status === "intake_not_found") {
    return NextResponse.json({ ok: false, error: "intake_not_found" }, { status: 404 });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ ok: false, error: "packet_not_found" }, { status: 404 });
  }
  if (result.status === "already_signed") {
    return NextResponse.json({
      ok: true,
      reference,
      erm: "already_signed",
      packetId: result.packetId,
      signedBy: result.signedBy,
      ownerSignedAt: result.ownerSignedAt,
      sharedWithClient: false,
    });
  }
  return NextResponse.json({
    ok: true,
    reference,
    erm: "signed",
    packetId: result.packetId,
    status: "signed",
    test: result.test,
    signedBy: result.signedBy,
    ownerSignedAt: result.ownerSignedAt,
    sharedWithClient: false,
  });
}
