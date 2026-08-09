import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const GATE_CHECKS = [
  {
    app: "Fairway Bets",
    check: "Zero-sum payout verification",
    detail: "Every game format — Wolf, Hammer, banker, skins — verified that payouts sum to zero before money moves.",
    color: "#10b981",
  },
  {
    app: "Mineral Ledger",
    check: "Statement parse vs. source document",
    detail: "Extracted line amounts reconciled against the header totals. Parse flagged LOW_FIDELITY when volume and price can't be extracted.",
    color: "#d97706",
  },
  {
    app: "Sandwich Etc.",
    check: "Anonymous read blocked",
    detail: "Order and customer data must not be readable without authentication. The probe confirms it — not assumed.",
    color: "#dc2626",
  },
  {
    app: "Rosewood Dine",
    check: "Order-to-kitchen flow and SMS trigger",
    detail: "Station status transitions and the SMS-on-ready signal verified against a live test order on every deploy.",
    color: "#7c3aed",
  },
  {
    app: "The Club",
    check: "Tee sheet and event lifecycle",
    detail: "Tee sheet data integrity and event state transitions checked against their expected lifecycle on every change.",
    color: "#1d4ed8",
  },
];

export default function ProofPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">The proof record</p>
          <h1
            className="text-5xl sm:text-6xl font-[300] leading-tight tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Completion is mechanical,<br />not self-reported.
          </h1>
          <p className="text-lg text-[#a8d8f0] font-light leading-relaxed">
            The gate doesn&apos;t ask the agent if the work is done. It clones the trusted mirror,
            runs owner-defined checks, and returns a PASS or a receipt with what failed.
            There is no self-reporting path.
          </p>
        </div>
      </section>

      {/* How the gate works */}
      <section className="py-16 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-8">How it works</p>
          <div className="flex flex-col gap-6">
            {[
              {
                step: "01",
                color: "#46cf93",
                title: "A change lands in the mirror",
                body: "Every code change goes through Base44’s editor, which commits to a trusted GitHub mirror. The gate runs against that mirror — not a local copy, not a summary the agent provides.",
              },
              {
                step: "02",
                color: "#818cf8",
                title: "The host runs owner-defined checks",
                body: "The owner (Bubba) writes the acceptance criteria — what the gate checks for each app. The agent doesn’t choose the checks and can’t modify them. The host clones the trusted mirror and runs the checks against it.",
              },
              {
                step: "03",
                color: "#e2a44a",
                title: "PASS, FAIL, or HALT — with a receipt",
                body: "PASS means the work counts as complete. FAIL returns exactly what failed so it can be fixed. HALT means an integrity issue — leaked secret, removed test, out-of-scope edit — work stops and escalates to Bubba. The agent cannot clear a HALT.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-5">
                <span
                  className="text-3xl font-[300] tabular-nums flex-shrink-0 leading-none pt-1"
                  style={{ color: s.color, fontFamily: "var(--font-mulish)" }}
                >
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold text-[#f4f7fa] mb-1.5">{s.title}</h3>
                  <p className="text-sm text-[#a8d8f0] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real checks from real apps */}
      <section className="py-16 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-2">What the gate actually checks</p>
          <p className="text-sm text-[#a8d8f0]/60 mb-8">From the live apps. These run on every deploy.</p>
          <div className="flex flex-col gap-4">
            {GATE_CHECKS.map((c) => (
              <div
                key={c.app}
                className="bg-[#12243d] border border-[rgba(168,216,240,0.08)] rounded-xl px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <p className="font-semibold text-[#f4f7fa] text-sm">{c.check}</p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}
                  >
                    {c.app}
                  </span>
                </div>
                <p className="text-xs text-[#a8d8f0]/70 leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Failure beat */}
      <section className="py-16 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-6">What failure looks like</p>
          <div className="bg-[#0f1f38] border border-[rgba(168,216,240,0.15)] rounded-2xl p-8">
            <p className="text-[#a8d8f0] leading-relaxed mb-4">
              Failures are not hidden. They&apos;re the mechanism.
            </p>
            <p className="text-[#a8d8f0] leading-relaxed mb-4">
              A competence failure — wrong math, broken test, missing behavior — comes back with exactly
              what failed and what needs to change. The agent fixes it and resubmits. No arguing with the
              gate, no marking something complete that didn&apos;t pass.
            </p>
            <p className="text-[#a8d8f0] leading-relaxed">
              An integrity failure — a secret leaked, a test removed, an edit out of scope — halts everything
              and escalates directly to Bubba. The agent can&apos;t clear it. That&apos;s by design: integrity
              failures are not agent-resolvable. They require a human decision.
            </p>
          </div>
        </div>
      </section>

      {/* Link to operator story */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 bg-[#12243d] hover:bg-[#1e3a5f] border border-[rgba(168,216,240,0.15)] text-[#f4f7fa] font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
          >
            The operator story →
          </Link>
          <Link
            href="/why-provable"
            className="inline-flex items-center justify-center gap-2 text-[#a8d8f0]/60 hover:text-[#c7d2fe] text-sm font-medium transition-colors px-4 py-2"
          >
            Why provability matters →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
