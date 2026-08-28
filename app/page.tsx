import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import HeroDemoV4 from "./components/HeroDemoV4";
import ThreeStepStrip from "./components/ThreeStepStrip";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-24 lg:pt-32 pb-16 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/3 translate-x-1/4 opacity-40"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">

          {/* Copy */}
          <div className="lg:flex-[5] lg:max-w-md flex flex-col items-center text-center">
            {/* Hero-scale centered mark */}
            <svg
              aria-hidden="true"
              height="72"
              viewBox="243 160 653 433"
              fill="currentColor"
              className="text-[#f4f7fa] mb-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fillRule="evenodd" d="M258 175 H345 L567 365 L793 175 H881 V578 H783 V548 H849 V205 H806 L567 405 L331 205 H289 V548 H359 V578 H258 Z"/>
              <path d="M483 437 H655 V478 H590 V578 H548 V478 H483 Z"/>
            </svg>
            <h1
              aria-label="Say it however it comes out."
              className="text-[2.15rem] sm:text-[2.6rem] font-[800] leading-[1.1] tracking-tight mb-5"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              Say it however it comes out.
            </h1>
            <p
              className="text-base sm:text-[1.05rem] text-[#a8d8f0] leading-relaxed font-[300] max-w-sm"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              Everything you&apos;re holding in your head — the bills, the kids&apos; schedule, the side business — in whatever order it spills out. You get back one organized screen, run by an agent that shows its work.
            </p>
            <p
              className="text-base sm:text-[1.05rem] font-[700] italic text-[#f4f7fa]/80 leading-tight mt-4"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              The tangle goes in. One clear screen comes back.
            </p>
          </div>

          {/* Demo — lazy-loads after first paint via client component */}
          <div className="lg:flex-[6] w-full max-w-lg mx-auto lg:mx-0">
            <HeroDemoV4 />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <ThreeStepStrip />

      {/* ── TRUST BLOCK + CTA ────────────────────────────────────────────── */}
      <section className="px-4 py-16 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-sm text-[#a8d8f0]/50 leading-relaxed mb-8">
            Nothing goes out without your approval. Receipts for everything.
          </p>
          <Link
            href="https://download.micro-titan.com"
            className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#2563eb]/20 hover:shadow-[#2563eb]/35"
          >
            Meet your agent →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
