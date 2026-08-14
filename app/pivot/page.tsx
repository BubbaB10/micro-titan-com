import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import EmailCapture from "../components/EmailCapture";

export const metadata = {
  title: "Pivot by Micro Titan — Find what's next",
  description: "An agent-guided discovery of what you're good at, what you can afford to try, and what kind of business actually fits your life. Then we build it and run it.",
};

export default function PivotPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-4 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(226,164,74,0.10) 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#e2a44a] mb-5">
            Pivot by Micro Titan
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-[300] leading-[1.08] tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Don&apos;t know what&apos;s next?<br />
            <span className="text-[#e2a44a]">Start there.</span>
          </h1>
          <p className="text-lg text-[#a8d8f0] font-light max-w-xl mx-auto mb-10 leading-relaxed">
            Sometimes we reach a point where something has to change — we just can&apos;t quite name what yet. Pivot starts there: an agent-guided discovery of your skills, your constraints, and what you&apos;re actually starting from — then a shortlist of business shapes that fit your situation, and we build and run the one you pick.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <Link
              href="https://download.micro-titan.com/#/pivot"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0a1628] bg-[#e2a44a] hover:bg-[#f0b855] rounded-xl transition-colors shadow-lg"
            >
              Walk in now →
            </Link>
            <p className="text-xs text-[#a8d8f0]/40">~20 min · no signup required</p>
          </div>

          {/* Secondary: waitlist */}
          <div className="max-w-sm mx-auto mt-6 pt-6 border-t border-[rgba(168,216,240,0.08)]">
            <p className="text-xs text-[#a8d8f0]/40 mb-3 text-center">Or save your spot for updates</p>
            <EmailCapture variant="hero" source="pivot-waitlist" buttonText="Save my spot →" successCta={null} />
          </div>
        </div>
      </section>


      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#07101e]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-14" style={{ fontFamily: "var(--font-mulish)" }}>
            Three steps. No guesswork.
          </h2>

          <div className="flex flex-col gap-6">
            {[
              {
                step: "01",
                color: "#e2a44a",
                title: "Discovery",
                body: "The agent asks you structured questions about your skills, what you can afford to risk, how much time you have, and what kind of work you actually want to do. Not a quiz — a real conversation that gets to what matters.",
              },
              {
                step: "02",
                color: "#818cf8",
                title: "Shortlist",
                body: "From your answers, we map out a small set of business shapes that fit your situation. Viable means actually fit for where you are — not generic advice, not wishful thinking.",
              },
              {
                step: "03",
                color: "#46cf93",
                title: "Build & Run",
                body: "You pick one. The Studio builds the software your operation needs. Valet runs the day-to-day. You show up where the business actually needs you — not to manage tools.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-[#0f1f38] border border-[rgba(168,216,240,0.1)] rounded-2xl p-8 flex gap-6 items-start">
                <div
                  className="text-3xl font-bold flex-shrink-0 leading-none mt-1"
                  style={{ color: item.color, opacity: 0.4 }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#a8d8f0] leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HONEST FRAMING ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#a8d8f0]/40 mb-4">What Pivot is and isn&apos;t</p>
          <h2 className="text-2xl sm:text-3xl font-[300] text-[#f4f7fa] mb-6" style={{ fontFamily: "var(--font-mulish)" }}>
            Pivot won&apos;t tell you what to earn.<br />It helps you find what to try.
          </h2>
          <p className="text-[#a8d8f0] leading-relaxed mb-10 max-w-lg mx-auto">
            We don&apos;t make income claims. We don&apos;t promise a lifestyle. We help you map the intersection of what you&apos;re good at, what you can actually start, and what would feel worth doing — then build it with you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            {[
              { yes: true,  text: "Honest picture of what fits your situation" },
              { yes: true,  text: "Structured — not a vibes-based quiz" },
              { yes: true,  text: "Agent guides; you decide" },
              { yes: true,  text: "Studio builds, Valet runs, you own it" },
              { yes: false, text: "Income or earnings projections" },
              { yes: false, text: "A guaranteed path to anything" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-sm flex-shrink-0 mt-0.5 ${item.yes ? "text-[#46cf93]" : "text-[#a8d8f0]/30"}`}>
                  {item.yes ? "✓" : "✗"}
                </span>
                <p className={`text-sm ${item.yes ? "text-[#a8d8f0]" : "text-[#a8d8f0]/40"}`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / FINAL ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#07101e]">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>
            Ready to find what fits?
          </h2>
          <p className="text-sm text-[#a8d8f0]/70 mb-7">
            Twenty minutes. Your situation in full. A shortlist that makes sense.
          </p>
          <Link
            href="https://download.micro-titan.com/#/pivot"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-[#0a1628] bg-[#e2a44a] hover:bg-[#f0b855] rounded-xl transition-colors mb-6"
          >
            Walk in now →
          </Link>
          <div className="pt-5 border-t border-[rgba(168,216,240,0.07)]">
            <p className="text-xs text-[#a8d8f0]/30 mb-3">Or leave your email for updates</p>
            <EmailCapture variant="hero" source="pivot-waitlist" buttonText="Save my spot →" successCta={null} />
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/studio"
              className="text-sm text-[#a8d8f0]/50 hover:text-[#46cf93] transition-colors"
            >
              Already know what you want to build? → The Studio
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
