# Micro Titan own CRM/ERM — first slice (preview-only, not live)

## What this is

The replacement for the Google Sheet + hello@ inbox as the record of
the business. The intake route now records Client + Intake + AuditLog
in a Postgres database **first**, and sends the email to
hello@micro-titan.com as a **backup copy**, not the source of truth.
This is the automation top priority: client + Boone only, no Bubba
in the middle of an intake.

## What is NOT in this slice

- No client login. The owner summary API is gated by a bearer token
  (`OPS_DASHBOARD_TOKEN`) for Bubba/Boone only; a real login is a
  later slice.
- No payment webhook (Stripe → CRM). Payments are a later slice.
- No booking automation (appointment schedule / confirmed calendar
  event → record). Bookings are a later slice.
- No follow-up automation. Follow-ups are a later slice.
- No pitch-sheet generation from an intake. That is the next slice
  after this one, because payment in the adopted flow depends on it.
- No migration of prospect data. There is none to migrate: the CRM
  Sheet is header-only. See "Migration" below.

## Setup — Bubba, by hand (nothing here is automatic)

1. **Provision Postgres.** Vercel Postgres, Neon, or Supabase all
   work with the standard `pg` driver used here. No provider is
   hard-coded. In the provider, turn on **automated backups** and
   note the retention period — backups are part of the design, not
   an afterthought.
2. **Apply the schema once:** `app/lib/erm/schema.sql` (psql or the
   provider's SQL editor). It creates: clients, intakes,
   pitch_sheets, agreements, payments, bookings, jobs, audit_log
   (insert-only by convention — do not grant the application role
   UPDATE/DELETE on it), compliance_deadlines.
3. **Vercel env vars** (micro-titan-com, production + preview):
   - `ERM_DATABASE_URL` — the provider's pooled connection string.
     Never commit it, never paste it in chat.
   - `OPS_DASHBOARD_TOKEN` — a long random value, kept private.
     It gates the owner ops routes, including `GET /api/ops/summary`.
     It does not by itself authorize proof-packet signing.
   - `OWNER_SIGNING_TOKEN` — a secret, distinct from
     `OPS_DASHBOARD_TOKEN`. It is the owner credential for
     `POST /api/ops/proof-packet-sign` (header
     `X-Owner-Signing-Token`). The ops token alone cannot sign.
     Do not commit it, do not paste it in chat, and do not put a
     value in this repo. If it is unset, signing fails closed.
4. **Redeploy**, then test with a **TEST intake only**:
   - Verify one Client + Intake + AuditLog row appears.
   - Re-POST the same reference and verify **no duplicate intake**
     and **no duplicate email**.
   - Verify the owner summary API returns 401 without the token
     and the three sections (Issues / Approvals / Money) with it.

## Behaviour when the database is absent

Identical to the PR #20 / PR #24 gating pattern: the store returns
`not_configured`, the intake route falls back to the email-only
path, and the response reports `erm: "not_configured"`. A missing
database, a failed write, or a failed backup email after a recorded
intake can never silently lose an intake — see the route comments
for the exact 502 rule.

## Migration from the Sheet

- The "Micro Titan CRM" Sheet is header-only: no prospect rows
  exist to migrate. Nothing is copied, deleted, or reordered.
- Scott Moffitt (Family, redo intake arrived in Bubba's email) and
  Craig Corriston (Solo, starting today) are **pending manual
  logging in the meantime**: until the database is live, their rows
  are logged by hand from the intake email details Bubba supplies,
  exactly as before. Once the database is live, new intakes go
  straight to it, and the Sheet becomes an export/backup only —
  it is not written by this branch's intake route.
- The Gap 1 Sheet writer (`app/lib/crm.ts`, PR #24) is retained in
  this branch for reference, but the intake route no longer calls
  it. Merging this branch therefore supersedes PR #24's Sheet
  write. Do not merge both as if they were additive.

## Owner summary API

`GET /api/ops/summary` — requires
`Authorization: Bearer <OPS_DASHBOARD_TOKEN>`, returns 401 without
it, 503 `not_configured` without a database, and otherwise the
three sections Bubba sees: Issues (open intakes, overdue
deadlines), Approvals (draft pitch sheets, pitch-sent intakes
awaiting agreement), Money (discovery paid / pending, monthly
active, in cents). Counts and totals only — no names, no answers,
no contact details.
