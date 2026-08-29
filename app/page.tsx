import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import HeroV5 from "./components/HeroV5";
import ThreeStepStrip from "./components/ThreeStepStrip";
import MicroTitanMark from "./components/MicroTitanMark";

const PILLARS = [
  {
    title: "Smart Agents",
    body: "Works in the background to get things done and shows its work.",
  },
  {
    title: "Verified & Secure",
    body: "Checks, balances, and built-in verification.",
    link: { text: "See the ledger", href: "/receipts" },
  },
  {
    title: "Your Rules",
    body: "You decide what matters and how it runs.",
  },
  {
    title: "One Clear Screen",
    body: "Your life, organized and always current.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-24 lg:pt-32 pb-12 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full -translate-y-1/3 opacity-25"
            style={{
              background:
                "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Mark + H1 + Subhead — centered above the diagram */}
          <div
            className="flex flex-col items-center text-center mb-12 lg:mb-16"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            <MicroTitanMark height={72} idPrefix="heroMark" className="mb-6" />

            <h1
              aria-label="Your system, your rules."
              className="text-[2.9rem] sm:text-[3.8rem] lg:text-[4.4rem] font-[800] leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              Your system, your rules.
            </h1>

            <p
              className="text-base sm:text-lg text-[#a8d8f0] leading-relaxed font-[300] max-w-md"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              Give Valet the mess. Get back your life, organized.
            </p>
          </div>

          {/* The three-column tangle diagram */}
          <HeroV5 />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <ThreeStepStrip />

      {/* ── FOUR PILLARS ─────────────────────────────────────────────────── */}
      <section className="px-4 py-16 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="px-6 py-8 sm:py-6"
              style={{
                borderLeft:
                  i > 0
                    ? "1px solid rgba(168,216,240,0.1)"
                    : undefined,
                fontFamily: "var(--font-mulish)",
              }}
            >
              <h3 className="text-sm font-[700] text-[#f4f7fa] mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-[#a8d8f0]/70 leading-relaxed font-[300]">
                {pillar.body}
                {pillar.link && (
                  <>
                    {" "}
                    <Link
                      href={pillar.link.href}
                      className="text-[#a8d8f0] underline underline-offset-2 hover:text-[#f4f7fa] transition-colors"
                    >
                      {pillar.link.text}
                    </Link>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-12 pb-20 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-sm mx-auto flex flex-col items-center gap-5 text-center">
          <Link
            href="/valet"
            className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#2563eb]/20 hover:shadow-[#2563eb]/35"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            See Valet in action →
          </Link>
          <Link
            href="https://hq.micro-titan.com"
            className="text-xs text-[#a8d8f0]/45 hover:text-[#a8d8f0]/75 transition-colors font-[600] tracking-widest uppercase"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Explore the cockpit ▶
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
