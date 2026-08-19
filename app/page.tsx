import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import HeroDemoV4 from "./components/HeroDemoV4";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-14 pb-16 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/3 translate-x-1/4 opacity-40"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">

          {/* Copy */}
          <div className="lg:flex-[5] lg:max-w-md">
            <h1
              aria-label="Your agent. Your operating system. Your rules."
              className="text-[2.15rem] sm:text-[2.6rem] font-[800] leading-[1.1] tracking-tight mb-5"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              <span className="block">Your agent.</span>
              <span className="block">Your operating system.</span>
              <span className="block">Your rules.</span>
            </h1>
            <p
              className="text-base sm:text-[1.05rem] text-[#a8d8f0] leading-relaxed font-[300] max-w-sm"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              One conversation. An operating system shaped to your life — books, parenting, the side
              business. Your agent runs what matters to you. We stand guard.
            </p>
          </div>

          {/* Demo — lazy-loads after first paint via client component */}
          <div className="lg:flex-[6] w-full max-w-lg mx-auto lg:mx-0">
            <HeroDemoV4 />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="px-4 py-14 border-t border-[rgba(168,216,240,0.08)] bg-[#06101f]">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {(
            [
              {
                n: "01",
                title: "Talk once",
                body: "Tell your agent what matters. One conversation builds the picture.",
              },
              {
                n: "02",
                title: "It runs the small stuff",
                body: "Scheduling, replies, reminders, receipts — handled silently while you focus.",
              },
              {
                n: "03",
                title: "You see everything",
                body: "One cockpit screen shows everything your agent touched, proved, or needs you for.",
              },
            ] as const
          ).map(({ n, title, body }) => (
            <div key={n}>
              <p className="text-[10px] font-semibold tracking-[0.28em] text-[#4fb8e8]/40 uppercase mb-2">{n}</p>
              <p className="text-base font-semibold text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>
                {title}
              </p>
              <p className="text-sm text-[#a8d8f0]/55 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

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
