import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GateDemo from "../components/GateDemo";

const PILLARS = [
  {
    number: "01",
    title: "Provable, not plausible.",
    color: "#46cf93",
    lead: "Any AI can sound confident. That’s not the bar.",
    body: `Valet doesn't claim to have done something — it proves it. Every task that can be
mechanically verified goes through the gate before it reaches you. If the gate can't verify it,
Valet tells you that clearly instead of asserting confidence it doesn't have.

The distinction matters because a plausible answer that's wrong costs more than an honest
"I can't verify this." Most AI optimizes for sounding right. Valet optimizes for being right
— and being transparent about the difference.`,
    examples: [
      "A payout calculation is verified zero-sum before money moves.",
      "A reconciliation is verified against source data before any number is reported.",
      "A schedule change is confirmed with the relevant systems before you're told it's done.",
    ],
  },
  {
    number: "02",
    title: "Fail closed.",
    color: "#818cf8",
    lead: "When Valet is unsure, it stops — it doesn't proceed and hope for the best.",
    body: `Most AI fails open: when in doubt, it guesses, proceeds, or hedges with language that
sounds careful but still commits to an answer. Valet fails closed: when it's outside a proven-safe
envelope, it escalates to you rather than auto-proceeding.

This is what makes autonomy safe enough to actually deploy. Valet earns the right to act
autonomously by demonstrating it knows when not to. Every time it escalates correctly,
that's not a failure — that's the gate working as designed.`,
    examples: [
      "An integrity check fails → work halts, Bubba is notified, nothing proceeds.",
      "An edit touches something out of scope → gate flags it before it lands.",
      "Valet is uncertain about a judgment call → it surfaces the question instead of guessing.",
    ],
  },
  {
    number: "03",
    title: "Alert discipline.",
    color: "#e2a44a",
    lead: "An alert that fires too often gets ignored. That's worse than no alert.",
    body: `Valet doesn't flood you with notifications to seem busy. Alerts are rare, high-signal,
and receipt-attached — meaning when Valet escalates something, it comes with exactly what it found
and what it thinks you need to decide. You don't get a nudge; you get a decision package.

Alert fatigue kills oversight. If every escalation is low-stakes, the one that matters gets
rubber-stamped. Valet is designed to surface things you genuinely need to act on — and stay
quiet the rest of the time.`,
    examples: [
      "An escalation comes with the relevant evidence already attached.",
      "Routine operations that pass don't generate noise.",
      "A new edge case → a gate check is proposed, not a one-time alert.",
    ],
  },
];

export default function WhyProvablePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">The philosophy</p>
          <h1
            className="text-5xl sm:text-6xl font-[300] leading-tight tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            One gate.<br />Every door.
          </h1>
          <p className="text-lg text-[#a8d8f0] font-light max-w-2xl mx-auto">
            Whether you came through The Studio, Valet, or Pivot — the same mechanical gate underlies
            everything. Provability isn&apos;t a feature tier. It&apos;s the floor.
          </p>
        </div>
      </section>

      {/* Gate demo — live interactive proof */}
      <section className="py-20 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">Live proof</p>
            <h2
              className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] mb-4"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              See the gate run.
            </h2>
            <p className="text-[#a8d8f0] font-light max-w-lg mx-auto text-sm leading-relaxed">
              Two everyday scenarios. Pick one, click run — watch what gets stamped and what gets held.
              The &ldquo;held&rdquo; moment is the one that matters.
            </p>
          </div>
          <GateDemo />
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          {PILLARS.map((pillar) => (
            <div key={pillar.number} className="flex flex-col gap-5">
              <div className="flex items-start gap-5">
                <span
                  className="text-4xl font-[300] tabular-nums flex-shrink-0 leading-none pt-1"
                  style={{ color: pillar.color, fontFamily: "var(--font-mulish)" }}
                >
                  {pillar.number}
                </span>
                <div className="flex-1">
                  <h2
                    className="text-2xl sm:text-3xl font-[300] text-[#f4f7fa] mb-2"
                    style={{ fontFamily: "var(--font-mulish)" }}
                  >
                    {pillar.title}
                  </h2>
                  <p className="text-[#a8d8f0] font-medium mb-4">{pillar.lead}</p>
                  <div className="text-sm text-[#a8d8f0]/80 leading-relaxed space-y-3">
                    {pillar.body.trim().split("\n\n").map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>
              {/* Examples */}
              <div
                className="ml-14 sm:ml-16 bg-[#12243d] border rounded-xl p-5"
                style={{ borderColor: `${pillar.color}25` }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: pillar.color }}
                >
                  In practice
                </p>
                <ul className="flex flex-col gap-2">
                  {pillar.examples.map((ex) => (
                    <li key={ex} className="flex items-start gap-2.5 text-sm text-[#a8d8f0]">
                      <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: pillar.color }} />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The gate is un-removable */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0f1f38] border border-[rgba(168,216,240,0.15)] rounded-2xl p-8 text-center">
            <h3
              className="text-2xl font-[300] text-[#f4f7fa] mb-4"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              The gate is un-removable.
            </h3>
            <p className="text-[#a8d8f0] leading-relaxed mb-4 max-w-xl mx-auto">
              Customers can customize Valet — industry context, tone, data sources, workflows.
              What they can&apos;t do is remove the gate. Provability is always on.
              That&apos;s not a policy; it&apos;s how the architecture is built.
            </p>
            <p className="text-sm text-[#a8d8f0]/60">
              We automate where we can, in conjunction with human verification where needed.
              We won&apos;t oversell the automation — or hide where human judgment is still required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-2xl font-[300] text-[#f4f7fa] mb-4"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Ready to run something on it?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              See pricing →
            </Link>
            <Link
              href="/valet"
              className="inline-flex items-center justify-center gap-2 bg-[#12243d] hover:bg-[#1e3a5f] border border-[rgba(168,216,240,0.15)] text-[#f4f7fa] font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              See Valet →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
