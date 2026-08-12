import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nothing Slips: The 15-Minute Weekly Reset — Micro Titan",
  description:
    "A once-a-week ritual for people running a household, a business, or both — so nothing falls through the cracks and you're not carrying it all in your head.",
};

export default function GuidePage() {
  return (
    <>
      <style>{`
        @media print {
          header, footer { display: none !important; }
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; font-size: 11pt; }
          .guide-body { max-width: 100% !important; padding: 0 !important; }
          h1 { font-size: 22pt; }
          h2 { font-size: 14pt; page-break-after: avoid; }
          p, li { orphans: 3; widows: 3; }
          section { page-break-inside: avoid; }
          a[href]::after { content: "" !important; }
        }
        .step-rule { display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px; }
        .step-num { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #6b7280; flex-shrink: 0; min-width: 56px; }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", color: "#1c1917" }}>

        {/* Nav */}
        <header
          className="sticky top-0 z-50 border-b px-5 py-4 flex items-center justify-between no-print"
          style={{ backgroundColor: "#faf8f4", borderColor: "#e7e3dc" }}
        >
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.22em] uppercase transition-colors"
            style={{ color: "#78716c" }}
          >
            ← Micro Titan
          </Link>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: "#a8a29e" }}>
            Free Guide
          </span>
        </header>

        <div className="guide-body max-w-2xl mx-auto px-5 pb-20">

          {/* Title block */}
          <section className="pt-14 pb-10 border-b" style={{ borderColor: "#e7e3dc" }}>
            <p className="text-xs font-bold tracking-[0.28em] uppercase mb-5" style={{ color: "#b45309" }}>
              Free Guide · Micro Titan
            </p>
            <h1
              id="nothing-slips"
              className="text-4xl sm:text-5xl font-light leading-tight mb-3"
              style={{ color: "#1c1917" }}
            >
              Nothing Slips
            </h1>
            <p className="text-xl font-semibold mb-5" style={{ color: "#44403c" }}>
              The 15-Minute Weekly Reset
            </p>
            <p className="text-base leading-relaxed italic" style={{ color: "#57534e" }}>
              A once-a-week ritual for people running a household, a business, or both — so nothing falls
              through the cracks and you&apos;re not carrying it all in your head.
            </p>
          </section>

          {/* Why 15 minutes works */}
          <section className="pt-10 pb-8 border-b" style={{ borderColor: "#e7e3dc" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#1c1917" }}>Why 15 minutes works</h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
              Most things don&apos;t slip because they&apos;re hard. They slip because nobody looked. A weekly reset
              isn&apos;t about doing the work — it&apos;s about <strong>looking at everything once, on purpose</strong>, so the week
              ahead has no surprises hiding in it. Fifteen minutes is enough, if you do the same five steps
              every time.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
              Pick a fixed slot (Sunday evening works for most people). Same time, same chair, phone on Do
              Not Disturb except for this.
            </p>
          </section>

          {/* Steps */}
          <section className="pt-10 flex flex-col gap-10">

            {/* Step 1 */}
            <div className="pb-8 border-b" style={{ borderColor: "#e7e3dc" }}>
              <div className="step-rule">
                <span className="step-num">Step 1</span>
                <h2 id="step-1" className="text-lg font-semibold" style={{ color: "#1c1917" }}>
                  Empty the pockets <span className="font-normal text-sm" style={{ color: "#6b7280" }}>(3 min)</span>
                </h2>
              </div>
              <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
                Everything floating in your head goes onto one list. Don&apos;t organize it, don&apos;t solve it — just
                get it out. The bill you keep remembering at midnight. The permission slip. The tire that looks
                low. The text you never answered.
              </p>
              <p className="text-base leading-relaxed font-medium px-4 py-3 rounded-xl" style={{ color: "#92400e", backgroundColor: "#fef3c7", borderLeft: "3px solid #fbbf24" }}>
                Rule: if it takes under 2 minutes, do it right now instead of writing it down.
              </p>
            </div>

            {/* Step 2 */}
            <div className="pb-8 border-b" style={{ borderColor: "#e7e3dc" }}>
              <div className="step-rule">
                <span className="step-num">Step 2</span>
                <h2 className="text-lg font-semibold" style={{ color: "#1c1917" }}>
                  Walk the domains <span className="font-normal text-sm" style={{ color: "#6b7280" }}>(4 min)</span>
                </h2>
              </div>
              <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
                Look at each area of your life the same way, every week, in the same order. For most people
                it&apos;s some version of:
              </p>
              <ul className="flex flex-col gap-2.5 mb-4 pl-1">
                {[
                  ["Money", "anything due in the next 14 days? Anything that looked wrong?"],
                  ["The house", "anything broken, expiring, or scheduled?"],
                  ["The people", "(kids, parents, partner) — appointments, forms, commitments made?"],
                  ["The vehicles", "anything with a date on it (registration, oil, inspection)?"],
                  ["Work / the business", "what's promised to someone else this week?"],
                ].map(([label, desc]) => (
                  <li key={label} className="flex items-start gap-3 text-sm" style={{ color: "#44403c" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#4b5563" }} />
                    <span><strong>{label}</strong> — {desc}</span>
                  </li>
                ))}
              </ul>
              <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
                The question is never &ldquo;is everything perfect?&rdquo; It&apos;s <strong>&ldquo;did I look?&rdquo;</strong> A domain you looked at
                and found calm is DONE. Say it out loud if it helps: <em>covered.</em>
              </p>
            </div>

            {/* Step 3 */}
            <div className="pb-8 border-b" style={{ borderColor: "#e7e3dc" }}>
              <div className="step-rule">
                <span className="step-num">Step 3</span>
                <h2 className="text-lg font-semibold" style={{ color: "#1c1917" }}>
                  Pull out the decisions <span className="font-normal text-sm" style={{ color: "#6b7280" }}>(3 min)</span>
                </h2>
              </div>
              <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
                Scan your list. Most items are chores — they just need doing. A few are <strong>decisions</strong> — they
                need a yes or a no from you and then they unblock themselves. Circle only the decisions.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
                Decide them now if you can. A decision made in 10 seconds on Sunday saves the three reminders,
                two texts, and one argument it costs on Thursday.
              </p>
            </div>

            {/* Step 4 */}
            <div className="pb-8 border-b" style={{ borderColor: "#e7e3dc" }}>
              <div className="step-rule">
                <span className="step-num">Step 4</span>
                <h2 className="text-lg font-semibold" style={{ color: "#1c1917" }}>
                  Put dates on the rest <span className="font-normal text-sm" style={{ color: "#6b7280" }}>(3 min)</span>
                </h2>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
                Everything left either gets a <strong>date</strong> (it goes on the calendar and leaves your head) or a{" "}
                <strong>&ldquo;not this week&rdquo;</strong> (it goes on next week&apos;s list without guilt). Nothing stays vague.
                Vague is where slipping starts.
              </p>
            </div>

            {/* Step 5 */}
            <div className="pb-8 border-b" style={{ borderColor: "#e7e3dc" }}>
              <div className="step-rule">
                <span className="step-num">Step 5</span>
                <h2 className="text-lg font-semibold" style={{ color: "#1c1917" }}>
                  Close the book <span className="font-normal text-sm" style={{ color: "#6b7280" }}>(2 min)</span>
                </h2>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
                Look at the week ahead one last time. Say what&apos;s true: <em>&ldquo;Three appointments, one bill, the
                inspection Friday. Everything else is covered.&rdquo;</em> Then put it down and go live your life — that&apos;s
                the whole point. The reset only works if it ends with an exhale, not a longer list.
              </p>
            </div>

          </section>

          {/* The honest fine print */}
          <section className="pt-10 pb-4">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#1c1917" }}>The honest fine print</h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
              This ritual works on paper, in a notes app, anywhere. You don&apos;t need us for it.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
              We built <strong>Valet</strong> for the people who want steps 1–4 to happen automatically, all week long,
              with proof — a personal agent that watches the domains, hands you only the decisions, and shows
              its work. If that&apos;s interesting, it&apos;s at{" "}
              <Link href="/valet" className="underline underline-offset-2" style={{ color: "#818cf8" }}>
                micro-titan.com/valet
              </Link>. If not, this guide is yours either way. Nothing slips.
            </p>
            <p className="mt-6 text-sm" style={{ color: "#9ca3af" }}>— Micro Titan · Paris, TX</p>
          </section>

        </div>

        {/* Footer */}
        <footer className="px-5 py-8 border-t text-center no-print" style={{ borderColor: "#e7e3dc" }}>
          <p className="text-xs" style={{ color: "#a8a29e" }}>
            © 2026 Micro Titan LLC · Paris, Texas ·{" "}
            <Link href="/" className="hover:underline" style={{ color: "#a8a29e" }}>
              micro-titan.com
            </Link>
          </p>
        </footer>

      </div>
    </>
  );
}
