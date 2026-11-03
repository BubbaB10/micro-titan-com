/**
 * TEMPORARY — one-shot schema migration, same auth gate as ops/summary.
 * DELETE THIS FILE and redeploy after the migration runs once.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_email TEXT NOT NULL DEFAULT '',
    contact_phone TEXT NOT NULL DEFAULT '',
    lane TEXT NOT NULL CHECK (lane IN ('Family', 'Solo entrepreneur', 'Business')),
    agent_preference TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    reference TEXT NOT NULL UNIQUE,
    lane TEXT NOT NULL CHECK (lane IN ('Family', 'Solo entrepreneur', 'Business')),
    plate TEXT NOT NULL DEFAULT '',
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'received',
    next_action TEXT NOT NULL DEFAULT 'Completeness check',
    source TEXT NOT NULL DEFAULT 'micro-titan.com/intake',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS pitch_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_id UUID NOT NULL REFERENCES intakes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'agreed')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ,
    agreed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_id UUID NOT NULL REFERENCES intakes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    lane TEXT NOT NULL,
    discovery_cents INT NOT NULL,
    total_cents INT NOT NULL,
    after_credit_cents INT NOT NULL,
    monthly_cents INT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('email', 'site')),
    signature_text TEXT NOT NULL DEFAULT '',
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_id UUID NOT NULL REFERENCES intakes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    kind TEXT NOT NULL CHECK (kind IN ('discovery', 'balance', 'monthly')),
    stripe_payment_id TEXT UNIQUE,
    amount_cents INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_id UUID NOT NULL REFERENCES intakes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    preferred_times JSONB NOT NULL DEFAULT '[]'::jsonb,
    confirmed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    shape TEXT NOT NULL CHECK (shape IN ('a_la_carte', 'scoped')),
    title TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT '',
    price_cents INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'delivered', 'proof', 'closed')),
    queue_position INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    reference TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS compliance_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT '',
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'overdue')),
    owner TEXT NOT NULL DEFAULT 'Boone',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_intakes_client ON intakes(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_client_status ON jobs(client_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_queue ON jobs(queue_position) WHERE status = 'queued'`,
  `CREATE INDEX IF NOT EXISTS idx_audit_client ON audit_log(client_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id, status)`,
];

export async function GET(req: Request) {
  const token = process.env.OPS_DASHBOARD_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ops_not_configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.ERM_DATABASE_URL ?? process.env.ERM_DATABASE_DATABASE_URL;
  if (!url) {
    return NextResponse.json({ ok: false, error: "no_database_url" }, { status: 503 });
  }

  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url, max: 1 });
  const results: { stmt: string; ok: boolean; error?: string }[] = [];

  for (const stmt of STATEMENTS) {
    const label = stmt.trim().split("\n")[0].trim().substring(0, 60);
    try {
      await pool.query(stmt);
      results.push({ stmt: label, ok: true });
    } catch (e: unknown) {
      results.push({ stmt: label, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  await pool.end().catch(() => undefined);
  const allOk = results.every((r) => r.ok);
  return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
}
