import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import EmailCapture from "./components/EmailCapture";
import HeroSystemDiagram from "./components/HeroSystemDiagram";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
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

        {/* MT firm mark */}
        <div
          className="mt-8 sm:mt-0"
          style={{
            position: "relative",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "1.75rem",
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
          <svg aria-hidden="true" viewBox="243 160 653 433" width="108" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="heroSilver" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFFFFF"/>
                <stop offset=".52" stopColor="#D7D7D8"/>
                <stop offset="1" stopColor="#85878A"/>
              </linearGradient>
              <linearGradient id="heroViolet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8589FF"/>
                <stop offset=".55" stopColor="#6669E8"/>
                <stop offset="1" stopColor="#4D51C9"/>
              </linearGradient>
            </defs>
            <path fill="url(#heroSilver)" fillRule="evenodd" d="M258 175 H345 L567 365 L793 175 H881 V578 H783 V548 H849 V205 H806 L567 405 L331 205 H289 V548 H359 V578 H258 Z"/>
            <path fill="url(#heroViolet)" d="M483 437 H655 V478 H590 V578 H548 V478 H483 Z"/>
          </svg>
          {/* Brand tagline — near the logo */}
          <p
            className="text-[10px] font-light tracking-[0.35em] uppercase text-[#a8d8f0]/25 mt-3"
            style={{ animation: "fade-in-up 0.5s ease 1.5s both" }}
          >
            Provable software, end to end.
          </p>
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
            className="text-4xl sm:text-6xl md:text-7xl font-[300] leading-[1.05] tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)", animation: "fade-in-up 0.55s ease 0.55s both" }}
          >
            We build your software.<br />Then we hand you the AI that runs it.
          </h1>
          <p
            className="text-lg sm:text-xl text-[#a8d8f0] font-light max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ animation: "fade-in-up 0.55s ease 0.7s both" }}
          >
            Custom apps and business operating systems — with an agent that won&apos;t tell you
            something&apos;s done until it actually is.
          </p>

          {/* CTAs — one dominant, one subordinate */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            style={{ animation: "fade-in-up 0.55s ease 0.85s both" }}
          >
            {/* PRIMARY — visually dominant */}
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-9 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-[#2563eb]/25"
            >
              Start a build →
            </Link>
            {/* SECONDARY — clearly subordinate */}
            <Link
              href="https://download.micro-titan.com"
              className="inline-flex items-center justify-center gap-2 text-[#a8d8f0]/60 hover:text-[#c7d2fe] text-sm font-medium transition-colors px-4 py-2"
            >
              or meet Valet
            </Link>
          </div>

          {/* Compact price row — answers "what it costs" above the fold */}
          <div
            className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-[#a8d8f0]/65"
            style={{ animation: "fade-in-up 0.5s ease 1.0s both" }}
          >
            <Link href="/studio" className="hover:text-[#46cf93] transition-colors">Custom build <span className="font-semibold text-[#f4f7fa]/80">from $5k</span></Link>
            <span className="text-[#a8d8f0]/20">·</span>
            <Link href="/pricing" className="hover:text-[#60a5fa] transition-colors">Valet Business <span className="font-semibold text-[#f4f7fa]/80">$1,500 + $349/mo</span></Link>
            <span className="text-[#a8d8f0]/20">·</span>
            <Link href="/pricing" className="hover:text-[#c7d2fe] transition-colors">Valet Personal <span className="font-semibold text-[#f4f7fa]/80">$495 + $59/mo</span></Link>
          </div>

          <div
            className="mt-6 pt-6 border-t border-[rgba(168,216,240,0.10)] w-full max-w-sm mx-auto"
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

      {/* ── 1b. SYSTEM FLOW DIAGRAM ──────────────────────────────────────────── */}
      <section className="py-14 px-4 border-t border-[rgba(168,216,240,0.07)] bg-[#07101e]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#a8d8f0]/35 text-center mb-8">
            How it works
          </p>
          <HeroSystemDiagram />
        </div>
      </section>

      {/* ── 2. WHAT YOU CAN BUY ──────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#06101f]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-10">
            What you can buy
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Custom Build */}
            <Link href="/studio" className="group block bg-[#0f1f38] border border-[#46cf93]/25 hover:border-[#46cf93]/50 rounded-2xl p-7 text-center transition-all duration-200 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#46cf93]/08 border border-[#46cf93]/25 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-[#46cf93] mb-1">from $5,000</div>
              <div className="text-sm font-semibold text-[#f4f7fa] mb-2">Custom Build</div>
              <div className="text-xs text-[#a8d8f0]/60 leading-relaxed mb-5">
                Your app or business OS, built end-to-end. Gate-broken before delivery.
              </div>
              <div className="text-xs text-[#46cf93] font-semibold group-hover:text-[#7fe9bb] transition-colors">
                See The Studio →
              </div>
            </Link>

            {/* Valet Business — featured */}
            <div className="relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#2563eb] text-white shadow shadow-[#2563eb]/40">
                  Most chosen
                </span>
              </div>
              <Link href="/pricing" className="group block h-full bg-[#0f1f38] border border-[#2563eb]/50 hover:border-[#2563eb]/80 rounded-2xl p-7 text-center transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-[#2563eb]/08">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/30 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2M8 11h8"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-[#60a5fa] mb-0.5">$1,500</div>
                <div className="text-sm text-[#a8d8f0]/50 mb-2">setup · then <span className="font-semibold text-[#a8d8f0]/80">$349/mo</span></div>
                <div className="text-sm font-semibold text-[#f4f7fa] mb-2">Valet for Business</div>
                <div className="text-xs text-[#a8d8f0]/60 leading-relaxed mb-5">
                  Your provable agent running your business, verified.
                </div>
                <div className="text-xs text-[#60a5fa] font-semibold group-hover:text-[#93c5fd] transition-colors">
                  See what&apos;s included →
                </div>
              </Link>
            </div>

            {/* Valet Personal */}
            <Link href="/pricing" className="group block bg-[#0f1f38] border border-[#818cf8]/25 hover:border-[#818cf8]/50 rounded-2xl p-7 text-center transition-all duration-200 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-[#c7d2fe] mb-0.5">$495</div>
              <div className="text-sm text-[#a8d8f0]/50 mb-2">build · then <span className="font-semibold text-[#a8d8f0]/80">$59/mo</span></div>
              <div className="text-sm font-semibold text-[#f4f7fa] mb-2">Valet for You</div>
              <div className="text-xs text-[#a8d8f0]/60 leading-relaxed mb-5">
                Your personal AI chief-of-staff, provably yours.
              </div>
              <div className="text-xs text-[#818cf8] font-semibold group-hover:text-[#c7d2fe] transition-colors">
                Get started →
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── 3. GATE DEMO ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#0f1f38] border border-[#2563eb]/20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">Live proof</p>
              <h3
                className="text-2xl sm:text-3xl font-[300] text-[#f4f7fa] mb-3"
                style={{ fontFamily: "var(--font-mulish)" }}
              >
                Watch our AI challenge its own answers<br className="hidden md:block" /> before it reaches you.
              </h3>
              <p className="text-[#a8d8f0] text-sm leading-relaxed">
                Our AI doesn&apos;t just produce — it audits. See a live run: what passes, what gets held, and why that matters to you.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/why-provable#gate"
                className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
              >
                Watch the gate run →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PORTFOLIO ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-3">
            The portfolio
          </p>
          <h2
            className="text-2xl sm:text-3xl font-[300] text-[#f4f7fa] text-center mb-3"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            One operator. Six businesses. One system.
          </h2>
          <p className="text-[#a8d8f0]/70 text-sm text-center mb-5">
            Built by one person running all six on the same provable system you can hire us to build for you.
          </p>
          {/* Stat bar */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#a8d8f0]/55 mb-8">
            <span><span className="font-semibold text-[#f4f7fa]/80">6</span> live businesses</span>
            <span className="text-[#a8d8f0]/20">·</span>
            <span><span className="font-semibold text-[#f4f7fa]/80">4</span> industries</span>
            <span className="text-[#a8d8f0]/20">·</span>
            <span><span className="font-semibold text-[#f4f7fa]/80">$350k+</span> royalties reconciled</span>
            <span className="text-[#a8d8f0]/20">·</span>
            <span>Live in as fast as <span className="font-semibold text-[#f4f7fa]/80">72 hours</span></span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Fairway Bets",   desc: "Settle golf bets without an argument or a spreadsheet.", audience: "Golf groups & leagues",    slug: "fairway-bets"   },
              { name: "The Club",       desc: "Member app — tee times, events, and club communications.", audience: "Golf & country clubs",   slug: "the-club"       },
              { name: "Sandwich Etc.",  desc: "Order ahead, no third-party fees.",                      audience: "Local restaurants",       slug: "sandwich-etc"   },
              { name: "Mineral Ledger", desc: "Royalty audit and cross-owner reconciliation.",            audience: "Mineral rights owners",  slug: "mineral-ledger" },
              { name: "Rosewood Dine",  desc: "Full restaurant OS — orders to kitchen to analytics.",     audience: "Restaurant owners",      slug: "rosewood-dine"  },
              { name: "Property OS",    desc: "AI-managed rental portfolio with zero admin hours.",        audience: "Landlords with 10+ units", slug: "property-os"  },
            ].map((v, i) => (
              <div
                key={v.name}
                className="bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-xl px-5 py-4 flex items-center gap-3"
                style={{ animation: `fade-in-up 0.5s ease ${0.05 * i + 0.1}s both` }}
              >
                <span className="w-2 h-2 rounded-full bg-[#46cf93] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#f4f7fa]">{v.name}</p>
                  <p className="text-xs text-[#a8d8f0]/60 leading-relaxed">{v.desc}</p>
                  <p className="text-xs text-[#4fb8e8]/50 mt-0.5">{v.audience}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#a8d8f0]/40 text-center mt-4">
            Each app ships as a clean template — your name, your brand.{" "}
            <Link href="/studio" className="underline underline-offset-2 hover:text-[#a8d8f0]/65 transition-colors">
              See The Studio →
            </Link>
          </p>
          <div className="text-center mt-3">
            <Link href="/about" className="text-sm text-[#a8d8f0]/60 hover:text-[#f4f7fa] transition-colors mr-5">
              The operator story →
            </Link>
            <Link href="/proof" className="text-sm text-[#a8d8f0]/60 hover:text-[#f4f7fa] transition-colors">
              Full portfolio →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. TWO PILLARS ───────────────────────────────────────────────────── */}
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
            {/* Valet */}
            <Link href="/valet" className="group block">
              <div className="h-full bg-[#12243d] border border-[#818cf8]/25 hover:border-[#818cf8]/50 rounded-2xl p-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#818cf8]/10">
                <div className="w-12 h-12 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <circle cx="12" cy="12" r="9.5" stroke="#818cf8" strokeWidth="1.4"/>
                    <path d="M8.5 17L12 8L15.5 17" stroke="#818cf8" strokeWidth="1.5"/>
                    <path d="M9.5 13.8L11.2 15.8L15 12.2" stroke="#46cf93" strokeWidth="1.7"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#818cf8]/10 text-[#c7d2fe] border border-[#818cf8]/25 mb-3">The Agent</span>
                  <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>Valet by Micro Titan™</h3>
                  <p className="text-[#a8d8f0] text-sm leading-relaxed mb-4">
                    Your provable AI chief-of-staff. Runs your business or life,
                    verifies its own work, and fails closed to you — not to the world — when it&apos;s unsure.
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#46cf93]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93]" />
                      Gate proves every claim before it reaches you
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#e2a44a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e2a44a]" />
                      You decide direction — Valet handles execution
                    </div>
                  </div>
                  <p className="text-xs text-[#818cf8]/60">
                    from <span className="font-semibold text-[#c7d2fe]">$495</span> build ·{" "}
                    <span className="font-semibold text-[#c7d2fe]">$59/mo</span>{" → "}pricing
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#818cf8] group-hover:text-[#c7d2fe] transition-colors">
                  Explore Valet
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
                    <path d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/25 mb-3">Boutique Build Service</span>
                  <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>The Studio</h3>
                  <p className="text-[#a8d8f0] text-sm leading-relaxed mb-4">
                    We build your app or OS end-to-end. Scout → Architect → Builder → Breaker.
                    The gate breaks it before you see it. You keep the agent that runs it.
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#46cf93]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93]" />
                      Gate-broken before delivery — not just hand-tested
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#e2a44a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e2a44a]" />
                      You own the app and the agent that runs it
                    </div>
                  </div>
                  <p className="text-xs text-[#46cf93]/60">
                    from <span className="font-semibold text-[#46cf93]">$5,000</span>{" → "}pricing
                  </p>
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

      {/* ── 6. EMAIL CAPTURE — LEAD MAGNET ───────────────────────────────────── */}
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

      {/* ── 7. BUSY MOM HOOK CARD ────────────────────────────────────────────── */}
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
                  Valet works for anyone whose life has more moving parts than one person can track.
                </h3>
                <p className="text-[#a8d8f0] text-sm leading-relaxed mb-6">
                  Busy parents. Solo operators. Caregivers managing a loved one&apos;s needs
                  across multiple providers. Valet holds the full picture so you don&apos;t have to.
                </p>
                <Link
                  href="/valet"
                  className="text-sm font-semibold text-[#818cf8] hover:text-[#c7d2fe] transition-colors"
                >
                  See who Valet is for →
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
                  School pickups, appointment reminders, grocery lists, household task backlogs,
                  summer camp sign-ups — Valet holds the context so you don&apos;t have to carry it in your head.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#46cf93]/20">
                    <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-1">Gate Proves</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Commitments tracked and actioned. Reminders fire without you managing them.</p>
                  </div>
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#e2a44a]/20">
                    <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">You Decide</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Priorities and tradeoffs. Valet surfaces what&apos;s falling behind; you decide what moves.</p>
                  </div>
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#818cf8]/20">
                    <p className="text-xs font-semibold text-[#818cf8] uppercase tracking-wider mb-1">Camps &amp; Activities</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Sign-up deadlines, permission forms, pickup windows — Valet tracks what&apos;s due and alerts you before it&apos;s late.</p>
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
