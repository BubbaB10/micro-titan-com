import Link from "next/link";
import Image from "next/image";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import EmailCapture from "./components/EmailCapture";
import DecisionCardDemo from "./components/DecisionCard";
import HeroChatInput from "./components/HeroChatInput";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center px-4 pt-20 pb-0 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 65%)", animation: "aurora-1 7s ease-in-out infinite" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(79,184,232,0.07) 0%, transparent 65%)", animation: "aurora-2 9s ease-in-out infinite" }}
          />
        </div>
        <div
          className="absolute inset-0 pointer-events-none tech-grid"
          style={{ maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.15) 65%, transparent 100%)" }}
        />

        {/* MT mark — small, de-emphasised (nav already carries the full lockup) */}
        <div
          className="mt-8"
          style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", marginBottom: "1.25rem", animation: "seal-appear 0.5s ease 0.1s both" }}
        >
          <div style={{ position: "absolute", inset: "-28px", borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 68%)", pointerEvents: "none" }} />
          <svg aria-hidden="true" viewBox="243 160 653 433" width="72" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-[300] leading-[1.1] tracking-tight text-[#f4f7fa] mb-5"
            style={{ fontFamily: "var(--font-mulish)", animation: "fade-in-up 0.55s ease 0.35s both" }}
          >
            You&apos;re the router between every app, every plan, and your own head.
          </h1>
          <p
            className="text-base sm:text-lg text-[#a8d8f0] font-light max-w-xl mx-auto mb-4 leading-relaxed"
            style={{ animation: "fade-in-up 0.55s ease 0.5s both" }}
          >
            Micro Titan gives you an agent that does the carrying — and one screen that proves the work is done.
          </p>

          {/* Persona entry chips — anchor to Three Doors */}
          <div className="flex flex-wrap justify-center gap-x-1 gap-y-2 mb-7" style={{ animation: "fade-in-up 0.5s ease 0.58s both" }}>
            <a href="#three-doors" className="px-3 py-1 rounded-full text-xs text-[#46cf93]/80 border border-[#46cf93]/20 hover:border-[#46cf93]/45 hover:text-[#46cf93] transition-colors">For your business</a>
            <span className="text-[#a8d8f0]/20 self-center text-xs px-0.5">·</span>
            <a href="#three-doors" className="px-3 py-1 rounded-full text-xs text-[#818cf8]/80 border border-[#818cf8]/20 hover:border-[#818cf8]/45 hover:text-[#818cf8] transition-colors">For your life</a>
            <span className="text-[#a8d8f0]/20 self-center text-xs px-0.5">·</span>
            <a href="#three-doors" className="px-3 py-1 rounded-full text-xs text-[#e2a44a]/80 border border-[#e2a44a]/20 hover:border-[#e2a44a]/45 hover:text-[#e2a44a] transition-colors">For your next chapter</a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5" style={{ animation: "fade-in-up 0.55s ease 0.65s both" }}>
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-9 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-[#2563eb]/25"
            >
              Start a build →
            </Link>
            <Link
              href="https://download.micro-titan.com"
              className="inline-flex items-center justify-center gap-2 text-[#a8d8f0]/60 hover:text-[#c7d2fe] text-sm font-medium transition-colors px-4 py-2"
            >
              Or talk to the agent right now — free, no signup →
            </Link>
          </div>

          {/* Hero chat input — visitor is mid-conversation before they've decided anything */}
          <div className="w-full max-w-lg mx-auto mb-6" style={{ animation: "fade-in-up 0.55s ease 0.75s both" }}>
            <HeroChatInput />
          </div>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-[#a8d8f0]/65" style={{ animation: "fade-in-up 0.5s ease 0.8s both" }}>
            <Link href="/studio" className="hover:text-[#46cf93] transition-colors">Custom build <span className="font-semibold text-[#f4f7fa]/80">from $5k</span></Link>
            <span className="text-[#a8d8f0]/20">·</span>
            <Link href="/pricing" className="hover:text-[#60a5fa] transition-colors">Business Valet <span className="font-semibold text-[#f4f7fa]/80">$1,500 + $349/mo</span></Link>
            <span className="text-[#a8d8f0]/20">·</span>
            <Link href="/pricing" className="hover:text-[#c7d2fe] transition-colors">Personal Valet <span className="font-semibold text-[#f4f7fa]/80">$495 + $59/mo</span></Link>
          </div>
        </div>

        {/* DecisionCard — the hero image, visible in first viewport */}
        <div className="relative z-10 w-full max-w-sm mx-auto mt-10 pb-16" style={{ animation: "fade-in-up 0.55s ease 0.95s both" }}>
          <div className="text-center mb-4">
            <span className="text-xs text-[#a8d8f0]/40 tracking-widest uppercase font-semibold">Live demo · sample data</span>
          </div>
          <DecisionCardDemo />
          <p className="text-center text-xs text-[#a8d8f0]/40 mt-4 leading-relaxed max-w-xs mx-auto">
            Every tap produces a receipt — calendar event, draft reply, or a written persistence policy.
          </p>
        </div>
      </section>

      {/* ── THREE DOORS ──────────────────────────────────────────────────────── */}
      <section id="three-doors" className="py-20 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#06101f]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-4">Three doors</p>
          <h2 className="text-2xl sm:text-3xl font-[300] text-[#f4f7fa] text-center mb-14" style={{ fontFamily: "var(--font-mulish)" }}>
            Build your software &nbsp;·&nbsp; Run your life &nbsp;·&nbsp; Start your next chapter
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {/* Studio */}
            <div className="bg-[#0f1f38] border border-[#46cf93]/25 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#46cf93]/10 border border-[#46cf93]/25 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/25 mb-2">The Studio</span>
                <h3 className="text-lg font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>Build your software</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed">
                  You have a business idea, a workflow that's broken, or an operation that needs custom software. We build it end-to-end, gate-verified before delivery. You own the code.
                </p>
              </div>
              <Link href="/studio" className="mt-auto text-xs font-semibold text-[#46cf93] hover:text-[#7fe9bb] transition-colors">
                See The Studio →
              </Link>
            </div>

            {/* Valet */}
            <div className="bg-[#0f1f38] border border-[#818cf8]/25 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <circle cx="12" cy="12" r="9.5" stroke="#818cf8" strokeWidth="1.4"/>
                  <path d="M8.5 17L12 8L15.5 17" stroke="#818cf8" strokeWidth="1.5"/>
                  <path d="M9.5 13.8L11.2 15.8L15 12.2" stroke="#46cf93" strokeWidth="1.7"/>
                </svg>
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#818cf8]/10 text-[#c7d2fe] border border-[#818cf8]/25 mb-2">Valet by Micro Titan™</span>
                <h3 className="text-lg font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>Run your life</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed">
                  You know where you're going — you just need something to carry it. Valet runs your life or business: tasks, follow-ups, calendar, and all the carrying you've been doing alone.
                </p>
              </div>
              <Link href="https://download.micro-titan.com" className="mt-auto text-xs font-semibold text-[#818cf8] hover:text-[#c7d2fe] transition-colors">
                Meet Valet →
              </Link>
            </div>

            {/* Pivot */}
            <div className="bg-[#0f1f38] border border-[#e2a44a]/25 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e2a44a]/10 border border-[#e2a44a]/25 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#e2a44a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/><path d="M7.5 4.5l1 2"/><path d="M16.5 4.5l-1 2"/>
                </svg>
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e2a44a]/10 text-[#e2a44a] border border-[#e2a44a]/25 mb-2">Pivot by Micro Titan</span>
                <h3 className="text-lg font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>Start your next chapter</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed">
                  You don't know what's next — or you do, but the path isn't clear. An agent-guided discovery of your skills, constraints, and what you're starting from. Then Studio builds it and Valet runs it.
                </p>
              </div>
              <Link href="/pivot" className="mt-auto text-xs font-semibold text-[#e2a44a] hover:text-[#f0c07a] transition-colors">
                Explore Pivot →
              </Link>
            </div>
          </div>

          {/* Convergence visual */}
          <div className="flex items-center justify-center my-1 hidden md:flex">
            <svg viewBox="0 0 480 40" fill="none" className="w-full max-w-3xl" aria-hidden="true">
              <path d="M80 2 Q80 38 240 38" stroke="rgba(37,99,235,0.35)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M240 2 L240 38" stroke="rgba(37,99,235,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M400 2 Q400 38 240 38" stroke="rgba(37,99,235,0.35)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <circle cx="240" cy="38" r="3" fill="#2563eb" fillOpacity="0.6"/>
            </svg>
          </div>
          <div className="flex justify-center my-2 md:hidden" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>

          {/* Cockpit convergence frame — first named introduction of "Cockpit" */}
          <div className="bg-[#08162e] border border-[#2563eb]/35 rounded-2xl p-7 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#2563eb]/15 text-[#60a5fa] border border-[#2563eb]/35 mb-5">Every path ends here</span>
            <p className="text-xl sm:text-2xl font-[300] text-[#f4f7fa] mb-3 leading-snug" style={{ fontFamily: "var(--font-mulish)" }}>
              All three end at the same place: your <span className="text-[#60a5fa] font-semibold">Cockpit</span>.
            </p>
            <p className="text-sm text-[#a8d8f0]/70 max-w-lg mx-auto leading-relaxed">
              One screen. Everything the agent knows, verified and surfaced — whether you built it, run it, or just figured out what to try.
            </p>
            <a href="#cockpit" className="inline-block mt-5 text-xs font-semibold text-[#60a5fa] hover:text-[#93c5fd] transition-colors">
              See the Cockpit →
            </a>
          </div>
        </div>
      </section>

      {/* ── PRICING STRIP ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#06101f]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-10">
            What you can buy
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link href="/studio" className="group block bg-[#0f1f38] border border-[#46cf93]/25 hover:border-[#46cf93]/50 rounded-2xl p-7 text-center transition-all duration-200 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#46cf93]/08 border border-[#46cf93]/25 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-[#46cf93] mb-1">from $5,000</div>
              <div className="text-sm font-semibold text-[#f4f7fa] mb-2">Custom Build</div>
              <div className="text-xs text-[#a8d8f0]/60 leading-relaxed mb-5">Your app or business OS, built end-to-end. Gate-broken before delivery.</div>
              <div className="text-xs text-[#46cf93] font-semibold group-hover:text-[#7fe9bb] transition-colors">See The Studio →</div>
            </Link>

            <div className="relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#2563eb] text-white shadow shadow-[#2563eb]/40">Most chosen</span>
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
                <div className="text-xs text-[#a8d8f0]/60 leading-relaxed mb-5">Your provable agent running your business, verified.</div>
                <div className="text-xs text-[#60a5fa] font-semibold group-hover:text-[#93c5fd] transition-colors">See what&apos;s included →</div>
              </Link>
            </div>

            <Link href="/pricing" className="group block bg-[#0f1f38] border border-[#818cf8]/25 hover:border-[#818cf8]/50 rounded-2xl p-7 text-center transition-all duration-200 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-[#c7d2fe] mb-0.5">$495</div>
              <div className="text-sm text-[#a8d8f0]/50 mb-2">build · then <span className="font-semibold text-[#a8d8f0]/80">$59/mo</span></div>
              <div className="text-sm font-semibold text-[#f4f7fa] mb-2">Valet for You</div>
              <div className="text-xs text-[#a8d8f0]/60 leading-relaxed mb-5">Your personal AI chief-of-staff, provably yours.</div>
              <div className="text-xs text-[#818cf8] font-semibold group-hover:text-[#c7d2fe] transition-colors">Get started →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 3: THE COCKPIT, DECODED ──────────────────────────────────── */}
      <section id="cockpit" className="py-24 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-4">The Cockpit</p>
          <h2 className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-4" style={{ fontFamily: "var(--font-mulish)" }}>
            One glance answers &ldquo;does anything need me?&rdquo;
          </h2>
          <p className="text-[#a8d8f0] text-center max-w-xl mx-auto mb-16 leading-relaxed">
            Not a dashboard full of numbers — a single screen with a clear answer, backed by a mechanical check.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
            {[
              {
                color: "#46cf93",
                svgPath: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="#46cf93" strokeWidth="1.7"/></>,
                title: "Verdict-first",
                body: "The screen opens with a single verdict: needs you, or doesn't. You get the answer before you read a single detail.",
              },
              {
                color: "#818cf8",
                svgPath: <><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z" stroke="#818cf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#818cf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></>,
                title: "Empty means empty",
                body: "If nothing needs you, the Cockpit says so — and that claim is checked, not assumed. The absence of a warning is as verified as the warning itself.",
              },
              {
                color: "#e2a44a",
                svgPath: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#e2a44a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#e2a44a" strokeWidth="1.7" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#e2a44a" strokeWidth="1.7" strokeLinecap="round"/></>,
                title: "A false alarm is a bug",
                body: "We treat a wrong warning as seriously as a missed one. Alert fatigue is a failure — every flag that fires must be worth your attention.",
              },
            ].map((p) => (
              <div key={p.title} className="bg-[#0f1f38] border border-[rgba(168,216,240,0.1)] rounded-2xl p-7 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}12`, border: `1px solid ${p.color}30` }}>
                  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">{p.svgPath}</svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f4f7fa] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#a8d8f0] leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="h-px flex-1 bg-[rgba(168,216,240,0.08)]" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#a8d8f0]/40 px-3">Live demo · sample data</span>
              <div className="h-px flex-1 bg-[rgba(168,216,240,0.08)]" />
            </div>
            <DecisionCardDemo />
            <p className="text-center text-xs text-[#a8d8f0]/40 mt-5 leading-relaxed max-w-xs mx-auto">
              Every tap produces a receipt — calendar event, draft reply, or a written persistence policy. That mechanical follow-through is what makes one-tap delegation safe.
            </p>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 4: PICK YOUR COCKPIT ─────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#07101e]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-[#4fb8e8] mb-3">Pick your Cockpit</p>
          <h2 className="text-center text-3xl sm:text-4xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>
            Every life looks different. The Cockpit adapts.
          </h2>
          <p className="text-center text-[#a8d8f0] mb-4 max-w-xl mx-auto leading-relaxed">
            Same verifiable agent. Different domains, different stakes, same provability underneath.
          </p>
          <p className="text-center text-xs text-[#a8d8f0]/50 mb-8 max-w-lg mx-auto leading-relaxed">
            These aren&apos;t mockups — the real app rendering sample data, and that rendering is machine-tested on every change.
          </p>

          {/* Jargon decode */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14 max-w-xl mx-auto">
            <div className="bg-[#0f1f38] border border-[rgba(168,216,240,0.1)] rounded-xl px-5 py-4 flex-1">
              <p className="text-xs font-semibold text-[#46cf93] mb-1">Needs You</p>
              <p className="text-xs text-[#a8d8f0]/60 leading-relaxed">The only list you have to read. Everything else is handled.</p>
            </div>
            <div className="bg-[#0f1f38] border border-[rgba(168,216,240,0.1)] rounded-xl px-5 py-4 flex-1">
              <p className="text-xs font-semibold text-[#e2a44a] mb-1">Not covered</p>
              <p className="text-xs text-[#a8d8f0]/60 leading-relaxed">Checks we admit we haven&apos;t written yet — we show you that too.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start justify-items-center mb-12">
            {/* Busy Parent */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/mom-top.png"
                  alt="Busy Parent cockpit — verdict, needs-you items, and domain cards for The Kids, The House, Health, and Money"
                  width={780} height={1688} className="w-full h-auto" priority
                />
              </div>
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/mom-metrics.png"
                  alt="Busy Parent cockpit — grocery spend trending down, kids-activities logged, chores-done streak, and This Week summary table"
                  width={780} height={1688} className="w-full h-auto"
                />
              </div>
              <p className="text-sm font-semibold text-[#f4f7fa]">Busy Parent</p>
              <p className="text-xs text-[#a8d8f0]/70 text-center">The Kids · The House · Health · Money</p>
            </div>

            {/* Business Owner */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/biz-top.png"
                  alt="Business Owner cockpit — verdict, needs-you items, and domain cards for Orders, Money, Staff, and Marketing"
                  width={780} height={1688} className="w-full h-auto"
                />
              </div>
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/biz-metrics.png"
                  alt="Business Owner cockpit — daily orders with weekend peaks, revenue MTD, and Invoice Aging table showing overdue balance"
                  width={780} height={1688} className="w-full h-auto"
                />
              </div>
              <p className="text-sm font-semibold text-[#f4f7fa]">Business Owner</p>
              <p className="text-xs text-[#a8d8f0]/70 text-center">Orders · Money · Staff · Marketing</p>
            </div>
          </div>

          <p className="text-center text-xs text-[#a8d8f0]/35 mb-10">Illustrative — sample data.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="https://download.micro-titan.com"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200"
            >
              Meet Valet →
            </Link>
            <Link
              href="/valet"
              className="inline-flex items-center justify-center gap-2 bg-[#12243d] hover:bg-[#1e3a5f] text-[#a8d8f0] font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200 border border-[rgba(168,216,240,0.12)]"
            >
              See everything Valet does →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 5: PROOF OF DURABILITY ───────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-4">Proof of durability</p>
          <h2 className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-6" style={{ fontFamily: "var(--font-mulish)" }}>
            Built first to survive six businesses at once.
          </h2>
          <p className="text-[#a8d8f0] text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            The same engine that runs six-business mission control — reconfigured down to just your business, or just your life. The Cockpit didn&apos;t start as a product. It started as the only way to run this without burning out.
          </p>

          {/* Operator view */}
          <div className="bg-[#060e1a] border border-[rgba(168,216,240,0.12)] rounded-2xl overflow-hidden mb-5">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(168,216,240,0.08)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0ca30c]" />
                <span className="text-xs font-semibold text-[#a8d8f0]/60 tracking-wider uppercase">Operator · 6 apps</span>
              </div>
              <span className="text-xs text-[#a8d8f0]/30">Mon, 12:00 PM</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[rgba(168,216,240,0.06)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e2a44a] flex-shrink-0" />
                <p className="text-sm font-semibold text-[#f4f7fa]">2 apps need you · 4 running clean</p>
                <span className="ml-auto text-xs text-[#a8d8f0]/30">↑ 77 shipped all-time</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: "Sandwich Etc.",   status: "3 orders in queue",         state: "amber" },
                  { name: "Fairway Bets",    status: "4/4 games settled",          state: "green" },
                  { name: "Mineral Ledger",  status: "1 statement pending review", state: "amber" },
                  { name: "Rosewood Dine",   status: "Dinner service running",      state: "green" },
                  { name: "The Club",        status: "Tee sheet current",           state: "green" },
                  { name: "Property OS",     status: "2 maintenance items open",    state: "green" },
                ].map((app) => (
                  <div
                    key={app.name}
                    className="bg-[#0a1628] rounded-xl px-4 py-3 border"
                    style={{ borderColor: app.state === "amber" ? "rgba(226,164,74,0.3)" : "rgba(12,163,12,0.2)" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: app.state === "amber" ? "#e2a44a" : "#0ca30c" }} />
                      <p className="text-xs font-semibold text-[#f4f7fa] truncate">{app.name}</p>
                    </div>
                    <p className="text-xs text-[#a8d8f0]/55 leading-tight">{app.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-[#a8d8f0]/35 mb-16">Operator view · sample data</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "6 real businesses",
                body: "The operator Cockpit runs golf bets, restaurant OS, royalty audits, member clubs, order-ahead, and rental portfolio — all on the same provable engine.",
              },
              {
                title: "Same engine, any scope",
                body: "Reconfigure the same infrastructure for one life, one business, or six. The Cockpit scales in both directions without a rewrite.",
              },
              {
                title: "Proven in production",
                body: "Every business in the portfolio runs real money, real clients, and real operations on this system — daily, unattended, verified.",
              },
            ].map((c) => (
              <div key={c.title} className="bg-[#0f1f38] border border-[rgba(168,216,240,0.1)] rounded-2xl p-7">
                <h3 className="text-base font-semibold text-[#f4f7fa] mb-2">{c.title}</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/about" className="text-sm text-[#a8d8f0]/60 hover:text-[#f4f7fa] transition-colors">
              The operator story →
            </Link>
            <span className="hidden sm:block text-[#a8d8f0]/20 text-xs">·</span>
            <Link href="/receipts" className="text-sm text-[#46cf93]/70 hover:text-[#46cf93] transition-colors">
              Check the gate ledger →
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#e2a44a] mb-4">Free guide</p>
          <h2 className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] mb-4" style={{ fontFamily: "var(--font-mulish)" }}>
            Nothing Slips: The 15-Minute Weekly Reset
          </h2>
          <p className="text-[#a8d8f0] text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            A simple Friday ritual for anyone whose life has more moving parts than one person can track. Enter your email — the guide is yours, free. No pitch. Value-for-value.
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

      <Footer />
    </div>
  );
}
