import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">The operator story</p>
          <h1
            className="text-5xl sm:text-6xl font-[300] leading-tight tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Why one person runs six businesses instead of one.
          </h1>
          <p className="text-lg text-[#a8d8f0] font-light leading-relaxed">
            Micro Titan was built to prove a system — not just sell one. Here&apos;s what&apos;s actually running today, and why it works.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          {/* The founder */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">The founder</p>
            <p className="text-[#a8d8f0] leading-relaxed mb-4">
              Bubba Bell — former professional baseball player, self-taught builder, founder of Micro Titan LLC —
              runs six AI-automated businesses from Paris, Texas. Not because he has a large team, but because he built
              a system designed to run without one.
            </p>
            <p className="text-[#a8d8f0] leading-relaxed">
              The thesis is simple: a single operator with the right tools can run what used to require a company.
              Every business in the portfolio is proof of that claim — not a demo, not a mockup, but a live operation
              with real customers and real data.
            </p>
          </div>

          {/* Why six businesses */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">Why six businesses instead of one</p>
            <p className="text-[#a8d8f0] leading-relaxed mb-4">
              A single business validates one idea. Six businesses in four industries validate a system.
              The goal was never to pick the single best opportunity — it was to build an operating model that
              could run any of them, simultaneously, without the wheels coming off.
            </p>
            <p className="text-[#a8d8f0] leading-relaxed">
              That&apos;s what Micro Titan is: the operating system behind the portfolio. Aver is the agent that runs it.
              The gate is the mechanism that proves it&apos;s actually working — not just reported as working.
            </p>
          </div>

          {/* The system */}
          <div className="bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-2xl p-8">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">How the system works</p>
            <div className="flex flex-col gap-5">
              {[
                {
                  label: "Build",
                  color: "#46cf93",
                  text: "Every business is built end-to-end by The Studio — scoped, architected, coded, and tested before it touches a real customer.",
                },
                {
                  label: "Prove",
                  color: "#e2a44a",
                  text: "The gate runs owner-defined checks against a trusted mirror on every change. Payout math, order flow, statement parsing — verified mechanically, not assumed.",
                },
                {
                  label: "Run",
                  color: "#818cf8",
                  text: "Greg — Micro Titan&apos;s own Aver instance — manages all six operations. Monitoring, backup, anomaly detection, customer escalations. Bubba decides strategy; Greg handles execution.",
                },
              ].map((step) => (
                <div key={step.label} className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-16 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ backgroundColor: `${step.color}15`, color: step.color, border: `1px solid ${step.color}30` }}
                  >
                    {step.label}
                  </div>
                  <p className="text-[#a8d8f0] text-sm leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The moat */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">The moat is provability</p>
            <p className="text-[#a8d8f0] leading-relaxed mb-4">
              Any agent can tell you something is done. The Micro Titan gate proves it — it clones the trusted mirror,
              runs the checks, and returns a pass or a failure with a receipt. There is no self-reporting, no
              &quot;I think it worked,&quot; no summary to trust on faith.
            </p>
            <p className="text-[#a8d8f0] leading-relaxed">
              That mechanical proof is what lets one person run six businesses without a compliance team,
              a QA department, or a full-time manager watching every output.
              It&apos;s also what Aver and The Studio bring to a client build — not just a faster way to build software,
              but a provable way to run it.
            </p>
          </div>

          {/* The portfolio */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">What&apos;s running today</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "Fairway Bets",   audience: "Golf groups & leagues",    status: "App Store Stage" },
                { name: "The Club",       audience: "Golf & country clubs",      status: "Live" },
                { name: "Sandwich Etc.",  audience: "Local restaurants",         status: "Live" },
                { name: "Mineral Ledger", audience: "Mineral rights owners",     status: "Live" },
                { name: "Rosewood Dine",  audience: "Restaurant owners",         status: "Live" },
                { name: "Property OS",    audience: "Landlords with 10+ units",  status: "Template" },
              ].map((v) => (
                <div
                  key={v.name}
                  className="flex items-center gap-3 bg-[#12243d] border border-[rgba(168,216,240,0.08)] rounded-xl px-4 py-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f4f7fa]">{v.name}</p>
                    <p className="text-xs text-[#a8d8f0]/50">{v.audience}</p>
                  </div>
                  <span className="text-xs text-[#a8d8f0]/40">{v.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[rgba(168,216,240,0.08)]">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              Build yours →
            </Link>
            <Link
              href="/proof"
              className="inline-flex items-center justify-center gap-2 text-[#a8d8f0]/60 hover:text-[#c7d2fe] text-sm font-medium transition-colors px-4 py-2"
            >
              See the proof record →
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
