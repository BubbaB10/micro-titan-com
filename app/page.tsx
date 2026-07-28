import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import EmailCapture from "./components/EmailCapture";

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

        {/* MT firm mark — placeholder for the Monolith shield (asset incoming from Bubba) */}
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
              position: "absolute", inset: "-36px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 68%)",
              pointerEvents: "none",
            }}
          />
          <svg viewBox="0 0 100 112" width="108" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 6L94 23L94 62Q94 90 50 107Q6 90 6 62L6 23Z"
              stroke="#818cf8" strokeWidth="1.3" fill="rgba(129,140,248,0.05)"
              style={{ strokeDasharray: 312, strokeDashoffset: 312, animation: "draw-ring 1.6s cubic-bezier(0.4,0,0.2,1) 0.3s forwards" }}
            />
            <text
              x="50" y="70"
              textAnchor="middle"
              fontSize="26"
              fontWeight="300"
              letterSpacing="4"
              fill="#f4f7fa"
              style={{ fontFamily: "var(--font-mulish), sans-serif", animation: "fade-in-up 0.5s ease 1.2s both" }}
            >MT</text>
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
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-[#818cf8]/15 hover:bg-[#818cf8]/25 border border-[#818cf8]/40 text-[#c7d2fe] font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              Try Aver →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              Start a build
            </Link>
          </div>
          <div
            className="mt-7 pt-7 border-t border-[rgba(168,216,240,0.12)] w-full max-w-sm mx-auto"
            style={{ animation: "fade-in-up 0.5s ease 1.1s both" }}
          >
            <p className="text-xs text-[#a8d8f0]/50 mb-3 text-center">
              Or get the free guide + early access:
            </p>
            <EmailCapture variant="hero" source="hero" />
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
                  {/* Aver A-check sub-mark: circle + A + crossbar-as-checkmark */}
                  <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <circle cx="12" cy="12" r="9.5" stroke="#818cf8" strokeWidth="1.4"/>
                    <path d="M8.5 17L12 8L15.5 17" stroke="#818cf8" strokeWidth="1.5"/>
                    <path d="M9.5 13.8L11.2 15.8L15 12.2" stroke="#46cf93" strokeWidth="1.7"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#818cf8]/10 text-[#c7d2fe] border border-[#818cf8]/25 mb-3">The Agent</span>
                  <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>Aver™</h3>
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
                  {/* The Studio — corner-frame sub-mark */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <path d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2"/>
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
            Software Micro Titan builds and runs.
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

      {/* GATE TEASER */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#0f1f38] border border-[#2563eb]/20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">Live proof</p>
              <h3
                className="text-2xl font-[300] text-[#f4f7fa] mb-3"
                style={{ fontFamily: "var(--font-mulish)" }}
              >
                Don&apos;t take our word for it.<br />Watch the gate run.
              </h3>
              <p className="text-[#a8d8f0] text-sm leading-relaxed">
                Pick a scenario — clean claim or conflict caught. See what gets stamped and what gets held.
                The &ldquo;held&rdquo; moment is the trust-maker.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/why-provable#gate"
                className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
              >
                Watch the gate →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EMAIL CAPTURE — LEAD MAGNET */}
      <section className="py-20 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#e2a44a] mb-4">
            Free guide
          </p>
          <h2
            className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] mb-4"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Nothing Slips: The 15-Minute Weekly Reset
          </h2>
          <p className="text-[#a8d8f0] text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            A simple Friday ritual for anyone whose life has more moving parts than one person
            can track. Enter your email — the guide is yours, free. No pitch. Value-for-value.
          </p>
          <div className="max-w-sm mx-auto">
            <EmailCapture variant="hero" source="home-mid" />
          </div>
          <p className="text-xs text-[#a8d8f0]/30 mt-4">
            Already have it?{" "}
            <Link href="/guide" className="underline underline-offset-2 hover:text-[#a8d8f0]/60 transition-colors">
              Read the guide →
            </Link>
          </p>
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
