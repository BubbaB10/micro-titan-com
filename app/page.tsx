import Link from "next/link";
import Image from "next/image";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import EmailCapture from "./components/EmailCapture";
import RouterFlow from "./components/RouterFlow";
import PersonaMetricsCard from "./components/PersonaMetricsCard";
import HeroDemoSequence from "./components/HeroDemoSequence";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── BEAT 1: WATCH IT WORK ─────────────────────────────────────────── */}
      <section className="relative px-4 pt-16 pb-14 overflow-hidden flex flex-col items-center">
        {/* Ambient aurora */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(12,163,12,0.07) 0%, rgba(37,99,235,0.05) 45%, transparent 70%)", animation: "aurora-1 7s ease-in-out infinite" }}
          />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <HeroDemoSequence />
          <p className="mt-2 text-xs text-[#a8d8f0]/35 text-center">Preview — this flow ships with your agent's action layer.</p>

          <p className="mt-8 text-lg sm:text-xl font-[300] text-[#f4f7fa] text-center max-w-xs leading-snug" style={{ fontFamily: "var(--font-mulish)" }}>
            Your life, carried and proven.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xs sm:max-w-sm justify-center">
            <Link
              href="https://download.micro-titan.com"
              className="flex-1 inline-flex items-center justify-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#2563eb]/25"
            >
              Try Valet free →
            </Link>
            <Link
              href="/studio"
              className="flex-1 inline-flex items-center justify-center bg-[#0f1f38] hover:bg-[#1e3a5f] text-[#a8d8f0] font-semibold px-7 py-4 rounded-xl text-sm border border-[rgba(168,216,240,0.12)] transition-all duration-200"
            >
              Build with Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BEAT 2: PICK YOUR DOOR ────────────────────────────────────────── */}
      <section id="three-doors" className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#06101f]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-10">Three ways in</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {/* Valet */}
            <Link href="https://download.micro-titan.com" className="group bg-[#0f1f38] border border-[#818cf8]/25 hover:border-[#818cf8]/50 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#818cf8]/10 text-[#c7d2fe] border border-[#818cf8]/25 w-fit">Valet by Micro Titan™</span>
              <p className="text-sm text-[#a8d8f0] leading-relaxed">Your agent handles the carrying. One Cockpit screen shows the proof.</p>
              <span className="text-xs font-semibold text-[#818cf8] group-hover:text-[#c7d2fe] transition-colors mt-auto">Meet Valet →</span>
            </Link>

            {/* Studio */}
            <Link href="/studio" className="group bg-[#0f1f38] border border-[#46cf93]/25 hover:border-[#46cf93]/50 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/25 w-fit">The Studio</span>
              <p className="text-sm text-[#a8d8f0] leading-relaxed">We build your software end-to-end and gate-verify it before delivery.</p>
              <span className="text-xs font-semibold text-[#46cf93] group-hover:text-[#7fe9bb] transition-colors mt-auto">Start a build →</span>
            </Link>

            {/* Pivot */}
            <Link href="/pivot" className="group bg-[#0f1f38] border border-[#e2a44a]/25 hover:border-[#e2a44a]/50 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e2a44a]/10 text-[#e2a44a] border border-[#e2a44a]/25 w-fit">Pivot by Micro Titan</span>
              <p className="text-sm text-[#a8d8f0] leading-relaxed">Not sure what's next? An agent-guided discovery of your next chapter.</p>
              <span className="text-xs font-semibold text-[#e2a44a] group-hover:text-[#f0c07a] transition-colors mt-auto">Explore Pivot →</span>
            </Link>
          </div>

          {/* Pricing strip */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#a8d8f0]/60 mb-14">
            <Link href="/pricing" className="hover:text-[#c7d2fe] transition-colors">Valet Personal <span className="font-semibold text-[#f4f7fa]/75">$495 + $59/mo</span></Link>
            <span className="text-[#a8d8f0]/20 self-center">·</span>
            <Link href="/pricing" className="hover:text-[#60a5fa] transition-colors">Valet for Business <span className="font-semibold text-[#f4f7fa]/75">$1,500 + $349/mo</span></Link>
            <span className="text-[#a8d8f0]/20 self-center">·</span>
            <Link href="/studio" className="hover:text-[#46cf93] transition-colors">Custom Build <span className="font-semibold text-[#f4f7fa]/75">from $5k</span></Link>
          </div>

          {/* Email capture */}
          <div className="max-w-sm mx-auto text-center">
            <p className="text-sm font-semibold text-[#f4f7fa] mb-1">Nothing Slips — free guide</p>
            <p className="text-xs text-[#a8d8f0]/55 mb-4">The 15-minute weekly reset for anyone juggling too much.</p>
            <EmailCapture variant="hero" source="guide" />
            <p className="text-xs text-[#a8d8f0]/30 mt-3">
              <Link href="/guide" className="underline underline-offset-2 hover:text-[#a8d8f0]/55 transition-colors">Already have it? Read it here →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── BEAT 3: FOR THE SKEPTICS ──────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-3">For the skeptics</p>
          <p className="text-center text-[#a8d8f0]/60 text-sm mb-12 max-w-md mx-auto leading-relaxed">
            Proof is in the receipts, the architecture, and the people who use it daily.
          </p>

          {/* RouterFlow */}
          <div className="mb-3">
            <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-[#a8d8f0]/30 mb-5">
              The tangle goes in. One clear screen comes back.
            </p>
            <RouterFlow />
          </div>

          {/* Persona screenshots */}
          <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto mt-14 mb-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full rounded-[2rem] overflow-hidden border-[5px] border-[#1e3a5f] shadow-xl shadow-black/50">
                <Image
                  src="/screenshots/personas/mom-top.png"
                  alt="Busy Parent cockpit — verdict, needs-you items, domain cards"
                  width={780} height={1688} className="w-full h-auto"
                />
              </div>
              <div className="relative w-full rounded-[2rem] overflow-hidden border-[5px] border-[#1e3a5f] shadow-xl shadow-black/50">
                <PersonaMetricsCard persona="parent" />
              </div>
              <p className="text-xs text-[#a8d8f0]/60 text-center">Busy Parent</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full rounded-[2rem] overflow-hidden border-[5px] border-[#1e3a5f] shadow-xl shadow-black/50">
                <Image
                  src="/screenshots/personas/biz-top.png"
                  alt="Business Owner cockpit — verdict, needs-you items, domain cards"
                  width={780} height={1688} className="w-full h-auto"
                />
              </div>
              <div className="relative w-full rounded-[2rem] overflow-hidden border-[5px] border-[#1e3a5f] shadow-xl shadow-black/50">
                <PersonaMetricsCard persona="business" />
              </div>
              <p className="text-xs text-[#a8d8f0]/60 text-center">Business Owner</p>
            </div>
          </div>
          <p className="text-center text-xs text-[#a8d8f0]/30 mb-12">Illustrative · sample data</p>

          {/* Operator view */}
          <div className="bg-[#060e1a] border border-[rgba(168,216,240,0.1)] rounded-2xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(168,216,240,0.07)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0ca30c]" />
                <span className="text-xs font-semibold text-[#a8d8f0]/55 tracking-wider uppercase">Operator · 6 apps</span>
              </div>
              <span className="text-xs text-[#a8d8f0]/25">Mon 12:00 PM</span>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-[#f4f7fa] mb-4">2 apps need you · 4 running clean</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: "Sandwich Etc.",  status: "3 orders in queue",          state: "amber" },
                  { name: "Fairway Bets",   status: "4/4 games settled",           state: "green" },
                  { name: "Mineral Ledger", status: "1 statement pending review",  state: "amber" },
                  { name: "Rosewood Dine",  status: "Dinner service running",       state: "green" },
                  { name: "The Club",       status: "Tee sheet current",            state: "green" },
                  { name: "Property OS",    status: "2 maintenance items open",     state: "green" },
                ].map((app) => (
                  <div
                    key={app.name}
                    className="bg-[#0a1628] rounded-xl px-3 py-2.5 border"
                    style={{ borderColor: app.state === "amber" ? "rgba(226,164,74,0.28)" : "rgba(12,163,12,0.18)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: app.state === "amber" ? "#e2a44a" : "#0ca30c" }} />
                      <p className="text-xs font-semibold text-[#f4f7fa] truncate">{app.name}</p>
                    </div>
                    <p className="text-xs text-[#a8d8f0]/50 leading-tight">{app.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-[#a8d8f0]/30 mb-10">Operator view · sample data</p>

          {/* Proof links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <Link href="/receipts" className="text-[#46cf93]/70 hover:text-[#46cf93] transition-colors">Check the gate ledger →</Link>
            <span className="hidden sm:block text-[#a8d8f0]/20 text-xs">·</span>
            <Link href="/about" className="text-[#a8d8f0]/50 hover:text-[#f4f7fa] transition-colors">The operator story →</Link>
            <span className="hidden sm:block text-[#a8d8f0]/20 text-xs">·</span>
            <Link href="/valet" className="text-[#a8d8f0]/50 hover:text-[#f4f7fa] transition-colors">Everything Valet does →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
