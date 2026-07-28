import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 overflow-hidden">
        {/* Aurora glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 65%)",
              animation: "aurora-1 7s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(79,184,232,0.07) 0%, transparent 65%)",
              animation: "aurora-2 9s ease-in-out infinite",
            }}
          />
        </div>
        {/* Tech grid */}
        <div
          className="absolute inset-0 pointer-events-none tech-grid"
          style={{ maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.15) 65%, transparent 100%)" }}
        />

        {/* Animated A-seal */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            marginBottom: "2rem",
            animation: "seal-appear 0.5s ease 0.1s both",
          }}
        >
          <div
            style={{
              position: "absolute", inset: "-24px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(129,140,248,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <svg viewBox="0 0 120 120" width="176" height="176" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer ring — indigo */}
            <circle
              cx="60" cy="60" r="52"
              stroke="#818cf8" strokeWidth="1.5" fill="none"
              style={{ strokeDasharray: 327, strokeDashoffset: 327, animation: "draw-ring 1.3s cubic-bezier(0.4,0,0.2,1) 0.3s forwards" }}
            />
            {/* Inner ring faint */}
            <circle cx="60" cy="60" r="47" stroke="rgba(129,140,248,0.18)" strokeWidth="0.5" fill="none" />
            {/* A legs */}
            <path
              d="M38 84 L60 32 L82 84"
              stroke="#f4f7fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
              style={{ strokeDasharray: 137, strokeDashoffset: 137, animation: "draw-a 0.75s cubic-bezier(0.4,0,0.2,1) 1.2s forwards" }}
            />
            {/* Crossbar */}
            <line
              x1="47" y1="65" x2="73" y2="65"
              stroke="#f4f7fa" strokeWidth="3" strokeLinecap="round"
              style={{ strokeDasharray: 28, strokeDashoffset: 28, animation: "draw-crossbar 0.28s ease 1.8s forwards" }}
            />
            {/* Checkmark — mint, glow-pop */}
            <path
              d="M42 72 L54 84 L80 52"
              stroke="#46cf93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
              style={{ strokeDasharray: 62, strokeDashoffset: 62, animation: "draw-check 0.48s cubic-bezier(0.4,0,0.2,1) 2.05s forwards, glow-pop 0.9s ease 2.52s forwards" }}
            />
          </svg>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold tracking-[0.28em] uppercase text-[#4fb8e8] mb-5"
            style={{ animation: "fade-in-up 0.5s ease 0.4s both" }}
          >
            Micro Titan
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-[300] leading-[1.05] tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)", animation: "fade-in-up 0.55s ease 0.55s both" }}
          >
            Provable software,<br />end to end.
          </h1>
          <p
            className="text-lg sm:text-xl text-[#a8d8f0] font-light max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ animation: "fade-in-up 0.55s ease 0.7s both" }}
          >
            We build your app or OS — and hand you the AI agent that runs it.
            Gate-verified either way.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ animation: "fade-in-up 0.55s ease 0.85s both" }}
          >
            <Link
              href="/aver"
              className="inline-flex items-center justify-center gap-2 bg-[#818cf8]/15 hover:bg-[#818cf8]/25 border border-[#818cf8]/40 text-[#c7d2fe] font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              Explore Aver →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              Start a build
            </Link>
          </div>
        </div>

        <div
          className="absolute bottom-10 flex flex-col items-center gap-1.5 text-[#a8d8f0]/30 text-xs"
          style={{ animation: "fade-in-up 0.5s ease 2s both" }}
        >
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* TWO PILLARS */}
      <section className="py-24 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-4">
            One provable core. Two ways in.
          </p>
          <h2
            className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-14"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Your agent. Your app.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aver */}
            <Link href="/aver" className="group block">
              <div className="h-full bg-[#12243d] border border-[#818cf8]/25 hover:border-[#818cf8]/50 rounded-2xl p-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#818cf8]/10">
                <div className="w-12 h-12 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#818cf8]/10 text-[#c7d2fe] border border-[#818cf8]/25 mb-3">The Agent</span>
                  <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>Aver</h3>
                  <p className="text-[#a8d8f0] text-sm leading-relaxed mb-6">
                    Your provable AI chief-of-staff. Runs your business or life,
                    verifies its own work, and fails closed to you — not to the world — when it&apos;s unsure.
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#46cf93]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93]" />
                      Gate proves every claim before it reaches you
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#e2a44a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e2a44a]" />
                      You decide direction — Aver handles execution
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#818cf8] group-hover:text-[#c7d2fe] transition-colors">
                  Explore Aver
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* The Studio */}
            <Link href="/studio" className="group block">
              <div className="h-full bg-[#12243d] border border-[#46cf93]/20 hover:border-[#46cf93]/40 rounded-2xl p-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#0a1628] border border-[#46cf93]/25 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/25 mb-3">Boutique Build Service</span>
                  <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>The Studio</h3>
                  <p className="text-[#a8d8f0] text-sm leading-relaxed mb-6">
                    We build your app or OS end-to-end. Scout → Architect → Builder → Breaker.
                    The gate breaks it before you see it. You keep the agent that runs it.
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#46cf93]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93]" />
                      Gate-broken before delivery — not just hand-tested
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#e2a44a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e2a44a]" />
                      You own the app and the agent that runs it
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#46cf93] group-hover:text-[#7fe9bb] transition-colors">
                  See the process
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-3">
            The portfolio
          </p>
          <h2
            className="text-2xl sm:text-3xl font-[300] text-[#f4f7fa] text-center mb-3"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Every product below is a live Aver instance.
          </h2>
          <p className="text-[#a8d8f0]/70 text-sm text-center mb-10">
            Greg — our own Aver — built and currently runs all six.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Fairway Bets",   desc: "Golf betting OS"  },
              { name: "The Club",       desc: "PGCC member app"  },
              { name: "Sandwich Etc.",  desc: "Order-ahead"      },
              { name: "Mineral Ledger", desc: "Royalty audit"    },
              { name: "Rosewood Dine",  desc: "Restaurant OS"    },
              { name: "Property OS",    desc: "Rental template"  },
            ].map((v, i) => (
              <div
                key={v.name}
                className="bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-xl px-5 py-4 flex items-center gap-3"
                style={{ animation: `fade-in-up 0.5s ease ${0.05 * i + 0.1}s both` }}
              >
                <span className="w-2 h-2 rounded-full bg-[#46cf93] flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#f4f7fa]">{v.name}</p>
                  <p className="text-xs text-[#a8d8f0]/60">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/proof" className="text-sm text-[#a8d8f0]/60 hover:text-[#f4f7fa] transition-colors">
              See full portfolio →
            </Link>
          </div>
        </div>
      </section>

      {/* BUSY MOM HOOK CARD */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#0f1f38] border border-[rgba(168,216,240,0.15)] rounded-2xl p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">
                  Not just for business.
                </p>
                <h3
                  className="text-2xl font-[300] text-[#f4f7fa] mb-3"
                  style={{ fontFamily: "var(--font-mulish)" }}
                >
                  Aver works for anyone whose life has more moving parts than one person can track.
                </h3>
                <p className="text-[#a8d8f0] text-sm leading-relaxed mb-6">
                  Busy parents. Solo operators. Caregivers managing a loved one&apos;s needs
                  across multiple providers. Aver holds the full picture so you don&apos;t have to.
                </p>
                <Link
                  href="/aver"
                  className="text-sm font-semibold text-[#818cf8] hover:text-[#c7d2fe] transition-colors"
                >
                  See who Aver is for →
                </Link>
              </div>
              <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-xl p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-3">
                  Busy Mom
                </span>
                <h4
                  className="text-lg font-[300] text-[#f4f7fa] mb-2"
                  style={{ fontFamily: "var(--font-mulish)" }}
                >
                  You stop being the family&apos;s memory.
                </h4>
                <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">
                  School pickups, appointment reminders, grocery lists, household task backlogs —
                  Aver holds the context so you don&apos;t have to carry it in your head.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#46cf93]/20">
                    <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-1">Gate Proves</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Commitments tracked and actioned. Reminders fire without you managing them.</p>
                  </div>
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#e2a44a]/20">
                    <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">You Decide</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Priorities and tradeoffs. Aver surfaces what&apos;s falling behind; you decide what moves.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
