/**
 * Owner dashboard shell — first slice.
 *
 * This page renders no client data. Client data reaches Bubba only
 * through GET /api/ops/summary, gated by OPS_DASHBOARD_TOKEN. A
 * real dashboard UI with login is a later slice; this shell exists
 * so the three sections Bubba sees (Issues, Approvals, Money) are
 * defined in the product, not just in a document, and so a future
 * slice has a single place to render them.
 *
 * This page is deliberately not linked from the public nav.
 */
export const dynamic = "force-dynamic";

export default function OpsPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Micro Titan — Owner view</h1>
      <p>
        This view has three sections only: <strong>Issues</strong>,{" "}
        <strong>Approvals</strong>, and <strong>Money</strong>. Everything
        else is Boone&apos;s work and does not appear here.
      </p>
      <section>
        <h2>Issues</h2>
        <p>Open intakes and overdue compliance deadlines. Served by the owner summary API; no data is rendered on this page until a login slice exists.</p>
      </section>
      <section>
        <h2>Approvals</h2>
        <p>Draft pitch sheets and pitch-sent intakes awaiting agreement. Nothing here is sent, merged, or paid without an explicit approval.</p>
      </section>
      <section>
        <h2>Money</h2>
        <p>Discovery paid, discovery pending, and monthly active — in cents, as totals only. No client names or contact details are shown through the summary API.</p>
      </section>
      <p>
        <em>Setup: provision Postgres, apply app/lib/erm/schema.sql, set
        ERM_DATABASE_URL and OPS_DASHBOARD_TOKEN in Vercel, then call
        GET /api/ops/summary with the token. Until then this page shows
        no data, by design.</em>
      </p>
    </main>
  );
}
