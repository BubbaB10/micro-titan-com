/**
 * POST /api/ops/proof-packet-sign — owner sign-off.
 *
 * Two secrets, both required. Authorization: Bearer
 * <OPS_DASHBOARD_TOKEN> is the general ops gate. The header
 * X-Owner-Signing-Token must match OWNER_SIGNING_TOKEN, a
 * different secret. The ops token alone cannot sign. If
 * OWNER_SIGNING_TOKEN is unset or blank, signing fails closed.
 * The two values are compared with a timing-safe digest compare.
 *
 * The signer recorded on the packet is the owner role, derived
 * here. A signedBy field in the body is ignored. It cannot
 * grant or refuse the signature.
 *
 * There is no client counter-signature. This route does not send
 * email, SMS, or a call, and it does not share the packet. A
 * signed packet stays an internal ERM record. Release to a client
 * would require both a client request and owner approval, and
 * this route does neither.
 *
 * Body: { reference }. Unknown reference -> 404
 * intake_not_found. No draft -> 404 packet_not_found.
 * Already signed -> 200 already_signed, and the stored sign-off
 * is left as it was.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { signProofPacket } from "../../../lib/erm/proof-packet-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNING_HEADER = "x-owner-signing-token";

function digestsMatch(provided: string, expected: string): boolean {
  const providedDigest = createHash("sha256").update(provided, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(providedDigest, expectedDigest);
}

export async function POST(req: Request) {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ops_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const signingToken = process.env.OWNER_SIGNING_TOKEN;
  if (typeof signingToken !== "string" || signingToken.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "owner_signing_not_configured" }, { status: 503 });
  }
  const presented = req.headers.get(SIGNING_HEADER) ?? "";
  if (!digestsMatch(presented, signingToken)) {
    return NextResponse.json({ ok: false, error: "owner_signing_required" }, { status: 401 });
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
  const result = await signProofPacket(reference);
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
