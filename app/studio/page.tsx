import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const PIPELINE = [
  {
    step: "01",
    name: "Scout",
    color: "#a8d8f0",
    desc: "We map your domain — workflows, data sources, existing tools, stakeholders. No assumptions, no template-fitting. You get a scoped build plan with honest tradeoffs before a line of code is written.",
    deliverable: "Scoped build plan + honest tradeoffs, in writing.",
  },
  {
    step: "02",
    name: "Architect",
    color: "#818cf8",
    desc: "We design the data model, integration points, and the gate envelope — what the mechanical checks will cover. The architecture is your sign-off checkpoint before build starts.",
    deliverable: "Architecture doc + gate envelope spec. Your sign-off before build.",
  },
  {
    step: "03",
    name: "Builder",
    color: "#4fb8e8",
    desc: "We build it. Full app or OS, wired to Aver from day one. You get milestone previews as sections go live, not a big-bang delivery. Aver runs the build on our end so Greg can answer questions as they arise.",
    deliverable: "Live milestones. No big-bang delivery.",
  },
  {
    step: "04",
    name: "Breaker",
    color: "#46cf93",
    highlighted: true,
    desc: "The gate runs the owner-defined acceptance checks against the finished build. Not hand-tested — mechanically verified. If it fails, we fix it and resubmit. You don't see it until it passes.",
    deliverable: "Gate PASS receipt. You see it only after it passes.",
  },
];

const PROOF = [
  { name: "Fairway Bets",   desc: "10+ game formats, zero-sum verified per payout",  status: "Live" },
  { name: "The Club",       desc: "Tee sheet, event lifecycle, club comms",           status: "Live" },
  { name: "Sandwich Etc.",  desc: "Order-ahead + Twilio SMS, live for real customers", status: "Live" },
  { name: "Mineral Ledger", desc: "XTO royalty audit, 16 statements parsed",          status: "Live" },
  { name: "Rosewood Dine",  desc: "Full restaurant OS in 72 hours",                   status: "Live" },
  { name: "Property OS",    desc: "25-unit portfolio template",                        status: "Template" },
];

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">Boutique Build Service</p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-[300] leading-[1.08] tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            We build it.<br />The gate breaks it.<br />You keep it.
          </h1>
          <p className="text-lg sm:text-xl text-[#a8d8f0] font-light max-w-2xl mx-auto mb-10">
            A boutique build service where every delivery comes with a gate PASS receipt —
            and the Aver instance that runs it afterward.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200"
          >
            Start a build →
          </Link>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-20 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-4">The process</p>
          <h2
            className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-14"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Four stages. One gate.
          </h2>
          <div className="flex flex-col gap-4">
            {PIPELINE.map((stage, i) => (
              <div
                key={stage.name}
                className={`rounded-2xl p-7 border ${
                  stage.highlighted
                    ? "bg-[#0d1e10] border-[#46cf93]/35"
                    : "bg-[#12243d] border-[rgba(168,216,240,0.12)]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span
                      className="text-3xl font-[300] tabular-nums"
                      style={{ color: stage.color, fontFamily: "var(--font-mulish)" }}
                    >
                      {stage.step}
                    </span>
                    <span className="text-xl font-semibold text-[#f4f7fa]">{stage.name}</span>
                    {stage.highlighted && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#46cf93]/15 text-[#46cf93] border border-[#46cf93]/30">
                        The gate
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#a8d8f0] leading-relaxed mb-3">{stage.desc}</p>
                    <p className="text-xs font-semibold text-[#f4f7fa]/70">
                      → {stage.deliverable}
                    </p>
                  </div>
                </div>
                {/* Connector */}
                {i < PIPELINE.length - 1 && (
                  <div className="mt-4 flex items-center gap-2 text-[#a8d8f0]/30 text-xs ml-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* And you keep the agent */}
      <section className="py-20 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">After delivery</p>
              <h2
                className="text-3xl font-[300] text-[#f4f7fa] mb-4"
                style={{ fontFamily: "var(--font-mulish)" }}
              >
                And you keep the agent that runs it.
              </h2>
              <p className="text-[#a8d8f0] leading-relaxed mb-6">
                Every Studio build includes an Aver instance — wired to your app from day one.
                Once the gate passes, Aver takes over operations. You don&apos;t hire someone to
                manage what we built. Aver does it, and the gate proves it.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-[#a8d8f0]">Aver knows your app — it was there when we built it.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-[#a8d8f0]">The gate that broke the build keeps proving operations.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-[#a8d8f0]">You own both. The app and the agent. No lock-in.</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12243d] border border-[#818cf8]/20 rounded-2xl p-7">
              <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">Aver, included.</h3>
              <p className="text-sm text-[#a8d8f0] leading-relaxed">
                Every Studio build rolls directly into Aver for ongoing operations.
                The build fee covers construction. The monthly covers the agent that runs it.
                Same gate. Same provability. Always.
              </p>
              <div className="mt-5">
                <Link
                  href="/aver"
                  className="text-sm font-semibold text-[#818cf8] hover:text-[#c7d2fe] transition-colors"
                >
                  Learn about Aver →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-3">What we&apos;ve built</p>
          <h2
            className="text-3xl font-[300] text-[#f4f7fa] text-center mb-3"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Built by The Studio. Runs on Aver.
          </h2>
          <p className="text-[#a8d8f0]/70 text-sm text-center mb-10">
            Greg — our own Aver — built and operates all six. Each one is a proof point.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROOF.map((p) => (
              <div key={p.name} className="bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#f4f7fa]">{p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    p.status === "Live"
                      ? "bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/25"
                      : "bg-[#818cf8]/10 text-[#818cf8] border border-[#818cf8]/25"
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-[#a8d8f0]/70 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/proof" className="text-sm text-[#a8d8f0]/60 hover:text-[#f4f7fa] transition-colors">
              Full portfolio →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
