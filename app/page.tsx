import Nav from "./components/Nav";
import Footer from "./components/Footer";

const ventures = [
  {
    iconSvg: '<line x1="12" y1="4" x2="12" y2="19"/><path d="M12 4 L19 7.5 L12 11"/><ellipse cx="12" cy="19" rx="4.5" ry="1.5"/>',
    name: "Fairway Bets",
    tagline: "Golf betting OS — handicaps, Wolf, Hammer, and multi-format trip planner. Zero math, zero arguments.",
    outcome: "10+ games proven zero-sum and wired end-to-end by gate verification.",
    status: "App Store Stage",
    statusColor: "#f59e0b",
    category: "iOS App",
    accent: "#10b981",
  },
  {
    iconSvg: '<line x1="9" y1="4" x2="16" y2="17"/><path d="M14 16 L18 18 L17 21 L11 21 Z"/>',
    name: "The Club",
    tagline: "Member app for Paris Golf & Country Club — tee times, events, news, and club communication.",
    outcome: "Groundskeeping hub, event lifecycle, and ticker board all live.",
    status: "Active",
    statusColor: "#3b82f6",
    category: "Club App",
    accent: "#1d4ed8",
  },
  {
    iconSvg: '<path d="M4 9 Q4 6 12 6 Q20 6 20 9"/><line x1="4" y1="13" x2="20" y2="13"/><path d="M4 16 Q4 18.5 12 18.5 Q20 18.5 20 16"/>',
    name: "Sandwich Etc.",
    tagline: "Order-ahead app for a Paris, TX sandwich shop. Twilio SMS confirmation, live for customers.",
    outcome: "Built, connected, and live with real orders inside one week.",
    status: "Live",
    statusColor: "#10b981",
    category: "Restaurant Tech",
    accent: "#dc2626",
  },
  {
    iconSvg: '<path d="M7 4 L7 20"/><path d="M5 4 L5 8 Q5 11 7 11 Q9 11 9 8 L9 4"/><path d="M15 4 L15 20"/><path d="M15 4 C17 5 18 8 15 11"/>',
    name: "Rosewood Dine",
    tagline: "Full restaurant OS — orders, kitchen display, inventory, customer CRM, and analytics.",
    outcome: "Live in 72 hours. Tax config, reservations, and full order flow operational.",
    status: "Live",
    statusColor: "#10b981",
    category: "Restaurant Tech",
    accent: "#7c3aed",
  },
  {
    iconSvg: '<path d="M12 4 C12 4 6 10 6 15 Q6 20 12 20 Q18 20 18 15 Q18 10 12 4 Z"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="10" y1="17" x2="14" y2="17"/>',
    name: "Mineral Ledger",
    tagline: "XTO Energy royalty audit and cross-sibling reconciliation. Every statement parsed, every gap flagged.",
    outcome: "16 statements parsed, discrepancies surfaced, and reconciliation live — first evening.",
    status: "Live",
    statusColor: "#10b981",
    category: "Finance Tool",
    accent: "#d97706",
  },
  {
    iconSvg: '<polyline points="3 12 12 4 21 12"/><path d="M5 12 L5 21 L19 21 L19 12"/><path d="M9 21 L9 15 L15 15 L15 21"/>',
    name: "Property OS",
    tagline: "AI-managed rental portfolio operations. Maintenance, leasing, and tenant comms on autopilot.",
    outcome: "Built as a reusable template from a real 25-unit portfolio. Zero hours/week on admin.",
    status: "Template",
    statusColor: "#8b5cf6",
    category: "Real Estate",
    accent: "#0891b2",
  },
];

const offers = [
  {
    name: "Aver Foundation",
    price: "$500",
    period: "one-time setup",
    description: "Your provable AI agent, live and working in 48 hours.",
    features: [
      "Persistent memory — knows your full business context across every session",
      "Telegram interface — text your agent like a colleague, any time",
      "Background tasks and scheduled reports while you sleep",
      "Connected to your existing apps and data",
      "One industry context included (restaurant, golf, real estate, finance)",
      "2-hour guided onboarding session",
    ],
    cta: "Apply for Access",
    ctaHref: "mailto:hello@micro-titan.com?subject=Aver%20Foundation%20%E2%80%94%20Application",
    highlight: false,
    badge: null,
  },
  {
    name: "Build + Operate",
    price: "$1,500",
    period: "one-time build + Aver included",
    description: "Aver running your business, plus a custom app built for it.",
    features: [
      "Everything in Aver Foundation",
      "Custom app built for your vertical and deployed live",
      "Aver wired directly to your app data from day one",
      "Proven patterns from Sandwich Etc., Rosewood, Mineral Ledger",
      "Available for: restaurants, clubs, O&G royalty, rental portfolios, golf groups",
      "Ongoing: Aver manages the app on autopilot and flags exceptions",
    ],
    cta: "Tell us about your business",
    ctaHref: "mailto:hello@micro-titan.com?subject=Build%20%2B%20Operate%20%E2%80%94%20Inquiry",
    highlight: true,
    badge: "Most popular",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Nav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-6">
            Micro Titan
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight mb-6">
            AI-native ventures.<br />Built from scratch.
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] font-light max-w-2xl mx-auto mb-10">
            One operator. Seven ventures. All running on AI infrastructure built in Paris, Texas.
          </p>
          <a
            href="#get-aver"
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
          >
            Get Aver for your business
          </a>
        </div>
        <div className="absolute bottom-12 flex flex-col items-center gap-2 text-[#6e7681] text-xs">
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Aver OS — The Operating System */}
      <section id="aver" className="bg-[#0a1628] text-[#f4f7fa] border-t border-[rgba(168,216,240,0.15)]">

        {/* 1. Hero */}
        <div className="py-24 px-4 border-b border-[rgba(168,216,240,0.1)]">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">
              The Operating System
            </p>
            <h2 className="text-7xl sm:text-8xl md:text-9xl font-[300] leading-none tracking-tight text-[#f4f7fa] mb-6" style={{ fontFamily: "var(--font-mulish)" }}>
              Aver
            </h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30">
                Active
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#12243d] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)]">
                Provable AI Agent
              </span>
            </div>
            <p className="text-xl sm:text-2xl text-[#a8d8f0] font-light max-w-2xl mx-auto mb-12">
              Most AI tells you what it did. Aver proves it — or it doesn&apos;t reach you at all.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {["Provable not plausible", "Fail-closed", "Alert discipline"].map((pillar) => (
                <div key={pillar} className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-xl px-5 py-3">
                  <p className="text-sm font-semibold text-[#f4f7fa]">{pillar}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. What Aver does */}
        <div className="py-20 px-4 border-b border-[rgba(168,216,240,0.1)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-[300] text-center text-[#f4f7fa] mb-12" style={{ fontFamily: "var(--font-mulish)" }}>
              Whatever you do, it does it provably.
            </h2>

            {/* General Assistant lead card */}
            <div className="bg-[#12243d] border border-[rgba(168,216,240,0.18)] rounded-2xl p-8 mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-4">
                Every instance
              </span>
              <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>
                Nothing falls through the cracks
              </h3>
              <p className="text-[#a8d8f0] leading-relaxed mb-6 max-w-3xl">
                Aver tracks what you commit to, follows up without being asked, and surfaces gaps before they become problems — across every area of your life or business.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0a1628] rounded-xl p-4 border border-[#46cf93]/20">
                  <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-2">Gate Proves</p>
                  <p className="text-sm text-[#f4f7fa] leading-relaxed">Tasks closed. Nothing slipped. Verified mechanically before it reaches you.</p>
                </div>
                <div className="bg-[#0a1628] rounded-xl p-4 border border-[#e2a44a]/20">
                  <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-2">You Decide</p>
                  <p className="text-sm text-[#f4f7fa] leading-relaxed">What to prioritize. Aver handles follow-through; direction is yours.</p>
                </div>
              </div>
            </div>

            {/* Persona cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-3">
                  Everyday
                </span>
                <h3 className="text-xl font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>
                  You stop being the family&apos;s memory
                </h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">
                  School pickups, appointment reminders, grocery lists, household task backlogs — Aver holds the context so you don&apos;t have to.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#46cf93]/20">
                    <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-1">Gate Proves</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Commitments tracked and actioned. Reminders fire without you managing them.</p>
                  </div>
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#e2a44a]/20">
                    <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">You Decide</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Tradeoffs and priorities. Aver surfaces what&apos;s falling behind; you decide what moves.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-3">
                  Everyday
                </span>
                <h3 className="text-xl font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>
                  No lead cold. No invoice unsent.
                </h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">
                  Aver keeps your pipeline moving — follow-ups, invoices, and client comms — without you micromanaging a CRM.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#46cf93]/20">
                    <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-1">Gate Proves</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Follow-ups sent on schedule. Invoices out. Nothing lost between the cracks.</p>
                  </div>
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#e2a44a]/20">
                    <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">You Decide</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Which deals to chase. Aver keeps the engine running; strategy is yours.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade pack cards 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  badge: "Live", badgeColor: "#10b981",
                  title: "Bookkeeping",
                  body: "Categorizes, reconciles, and flags discrepancies — verified against source data before any number is reported.",
                  gateProves: "Reconciliation correct. Discrepancies surfaced before owner review.",
                  youDecide: "Accounting policy, owner draws, judgment calls.",
                },
                {
                  badge: "Live", badgeColor: "#10b981",
                  title: "Group Golf / Betting",
                  body: "Handicaps, pairings, scorekeeping, and payouts across any format — Wolf, Nassau, Skins, trip planner. Zero math, zero arguments.",
                  gateProves: "Every payout zero-sum. Verified before money moves.",
                  youDecide: "Format, stakes, house rules.",
                },
                {
                  badge: "Draft", badgeColor: "#a8d8f0",
                  title: "Elder Care",
                  body: "Medication schedules, appointment tracking, family communication — Aver holds the care plan so no one has to be the family memory.",
                  gateProves: "Schedules followed. Gaps flagged to the right person.",
                  youDecide: "Care decisions. Aver handles logistics and surfaces concerns; family decides care.",
                },
                {
                  badge: "Planned", badgeColor: "#6366f1",
                  title: "Food & Beverage",
                  body: "Orders, kitchen flow, inventory, reservations, and staff comms — one agent running the floor while you run the business.",
                  gateProves: "Orders captured, inventory tracked, nothing slips during service.",
                  youDecide: "Menu, pricing, vendor relationships.",
                },
              ].map((pack) => (
                <div key={pack.title} className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ backgroundColor: `${pack.badgeColor}18`, color: pack.badgeColor, border: `1px solid ${pack.badgeColor}40` }}
                  >
                    {pack.badge}
                  </span>
                  <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">{pack.title}</h3>
                  <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">{pack.body}</p>
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#0a1628] rounded-lg p-3 border border-[#46cf93]/20">
                      <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-1">Gate Proves</p>
                      <p className="text-xs text-[#f4f7fa] leading-relaxed">{pack.gateProves}</p>
                    </div>
                    <div className="bg-[#0a1628] rounded-lg p-3 border border-[#e2a44a]/20">
                      <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">You Decide</p>
                      <p className="text-xs text-[#f4f7fa] leading-relaxed">{pack.youDecide}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. The model */}
        <div className="py-20 px-4 border-b border-[rgba(168,216,240,0.1)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-[300] text-center text-[#f4f7fa] mb-12" style={{ fontFamily: "var(--font-mulish)" }}>
              Always verified. You choose privacy and purpose.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#12243d] border border-[#46cf93]/25 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#46cf93]/10 border border-[#46cf93]/30 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/25 mb-3">
                  Always on — never a paid tier
                </span>
                <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">The gate.</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed">
                  Every claim Aver makes is mechanically verified against the actual system before it reaches you. Provability is the floor — it never moves regardless of which tier you&apos;re on.
                </p>
              </div>

              <div className="bg-[#12243d] border border-[#a8d8f0]/25 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#a8d8f0]/10 border border-[#a8d8f0]/30 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a8d8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#a8d8f0]/10 text-[#a8d8f0] border border-[#a8d8f0]/25 mb-3">
                  You pay — data closer to you ↓
                </span>
                <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">Custody, not correctness.</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed">
                  The closer your data stays to you, the less you share. Cloud → Mac mini → Spark. Provability is identical on all three; you&apos;re paying for custody, not correctness.
                </p>
              </div>

              <div className="bg-[#12243d] border border-[#6366f1]/25 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                    <polyline points="16 7 22 7 22 13"/>
                  </svg>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/25 mb-3">
                  You pay — deeper vertical knowledge ↑
                </span>
                <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">Your industry, pre-packed.</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed">
                  Pre-packed knowledge and integrations for your industry — golf, restaurant, bookkeeping, real estate. You pay for faster time-to-value in your specific domain.
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-[#a8d8f0] font-light">
              You scale privacy and purpose — provability never moves.
            </p>
          </div>
        </div>

        {/* 4. Where it runs */}
        <div className="py-20 px-4 border-b border-[rgba(168,216,240,0.1)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-[300] text-center text-[#f4f7fa] mb-12" style={{ fontFamily: "var(--font-mulish)" }}>
              From shared cloud to your own box.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#4fb8e8] mb-2">Cloud</p>
                <h3 className="text-xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>Start here</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">
                  Data and reasoning both in the cloud. Cheapest entry. No privacy promise — Aver&apos;s reasoning happens on Anthropic&apos;s infrastructure. Right for most starting out.
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)]">
                  Entry
                </span>
              </div>
              <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#4fb8e8] mb-2">Mac mini</p>
                <h3 className="text-xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>Your data, local</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">
                  Your data stays on the device; Aver&apos;s reasoning still calls the cloud model. You own your data — but the thinking isn&apos;t air-gapped. Right for businesses that want data custody without full separation.
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#e2a44a]/10 text-[#e2a44a] border border-[#e2a44a]/30">
                  ~$600
                </span>
              </div>
              <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#4fb8e8] mb-2">DGX Spark</p>
                <h3 className="text-xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>Nothing leaves</h3>
                <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">
                  Data and reasoning both on the box. No cloud calls at all. Trade-off: a very good local model, not frontier Claude. Right for high-sensitivity workloads where full isolation is required.
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/30">
                  Full isolation
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-[#a8d8f0] font-light">
              Provability is identical on all three. Upgrading is a relocation, not a restart.
            </p>
          </div>
        </div>

        {/* 5. Proof */}
        <div className="py-20 px-4 border-b border-[rgba(168,216,240,0.1)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-[300] text-center text-[#f4f7fa] mb-4" style={{ fontFamily: "var(--font-mulish)" }}>
              Every product below is a live Aver instance.
            </h2>
            <p className="text-center text-[#a8d8f0] mb-12 max-w-2xl mx-auto">
              Greg — our own instance — built and currently runs all six. Each one is a proof point, not a pitch deck.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                { name: "Fairway Bets", desc: "Golf betting OS, gate-verified" },
                { name: "The Club", desc: "PGCC member app" },
                { name: "Sandwich Etc.", desc: "Order-ahead" },
                { name: "Mineral Ledger", desc: "Royalty audit" },
                { name: "Rosewood Dine", desc: "Restaurant OS" },
                { name: "Property OS", desc: "Rental template" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3 bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-xl px-5 py-4">
                  <div className="w-2 h-2 rounded-full bg-[#46cf93] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#f4f7fa]">{item.name}</p>
                    <p className="text-xs text-[#a8d8f0]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. CTA */}
        <div className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] mb-4" style={{ fontFamily: "var(--font-mulish)" }}>
              Tell it what you do. It comes back provisioned.
            </h2>
            <p className="text-[#a8d8f0] mb-8 text-lg leading-relaxed">
              Two ways in — a Foundation build that has Aver running in 48 hours, or a full Build + Operate with a custom app wired to it from day one.
            </p>
            <a
              href="#get-aver"
              className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
            >
              See the options →
            </a>
          </div>
        </div>
      </section>

      {/* Portfolio — proof */}
      <section id="ventures" className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-4 text-center">
            The Portfolio
          </p>
          <h2 className="text-3xl font-bold text-center mb-4">Built and proven.</h2>
          <p className="text-center text-[#8b949e] mb-16 text-lg max-w-2xl mx-auto">
            Every venture below was designed, built, and deployed by one operator running Aver (our instance: Greg). These are live products, real customers, and real data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ventures.map((v) => (
              <div
                key={v.name}
                className="group bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#30363d] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${v.accent}18`, border: `1px solid ${v.accent}40`, color: v.accent }}
                    dangerouslySetInnerHTML={{
                      __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">${v.iconSvg}</svg>`
                    }}
                  />
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${v.statusColor}15`, color: v.statusColor, border: `1px solid ${v.statusColor}30` }}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">{v.name}</h3>
                  <p className="text-xs text-[#6e7681] mb-2">{v.category}</p>
                  <p className="text-sm text-[#8b949e] leading-relaxed mb-3">{v.tagline}</p>
                  <p className="text-xs leading-relaxed font-medium" style={{ color: v.accent }}>
                    {v.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Busy Mom hook card */}
          <div className="mt-12 bg-[#0a1628] border border-[rgba(168,216,240,0.15)] rounded-2xl p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">
                  Not just for business.
                </p>
                <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>
                  The relatable hook.
                </h3>
                <p className="text-[#a8d8f0] leading-relaxed">
                  Aver works for anyone whose life has more moving parts than one person can track.
                </p>
              </div>
              <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-xl p-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-3">
                  Everyday
                </span>
                <h4 className="text-lg font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>
                  You stop being the family&apos;s memory
                </h4>
                <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">
                  School pickups, appointment reminders, grocery lists, household task backlogs — Aver holds the context so you don&apos;t have to.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#46cf93]/20">
                    <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-1">Gate Proves</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Commitments tracked and actioned. Reminders fire without you managing them.</p>
                  </div>
                  <div className="bg-[#0a1628] rounded-lg p-3 border border-[#e2a44a]/20">
                    <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">You Decide</p>
                    <p className="text-xs text-[#f4f7fa] leading-relaxed">Tradeoffs and priorities. Aver surfaces what&apos;s falling behind; you decide what moves.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storefront — two offers */}
      <section id="get-aver" className="py-24 px-4 border-t border-[#21262d]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-4 text-center">
            Get Started
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Two ways in.</h2>
          <p className="text-center text-[#8b949e] mb-16 text-lg max-w-xl mx-auto">
            Start with Aver as your provable agent, or have us build your custom app and wire Aver into it from day one.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {offers.map((offer) => (
              <div
                key={offer.name}
                className={`rounded-2xl p-8 flex flex-col gap-6 border transition-all duration-200 ${
                  offer.highlight
                    ? "bg-gradient-to-br from-[#1a1f2e] to-[#161b22] border-[#6366f1]/40 shadow-lg shadow-[#6366f1]/10"
                    : "bg-[#161b22] border-[#21262d]"
                }`}
              >
                <div>
                  {offer.badge && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#6366f1]/20 text-[#a78bfa] border border-[#6366f1]/30 mb-3">
                      {offer.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-1">{offer.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-black text-white">{offer.price}</span>
                    <span className="text-sm text-[#6e7681]">{offer.period}</span>
                  </div>
                  <p className="text-[#8b949e] text-sm leading-relaxed">{offer.description}</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {offer.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#8b949e]">
                      <svg className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={offer.ctaHref}
                  className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    offer.highlight
                      ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                      : "bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d]"
                  }`}
                >
                  {offer.cta} →
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-[#6e7681] text-sm mt-8">
            Not sure which fits? Email{" "}
            <a href="mailto:hello@micro-titan.com" className="text-[#6366f1] hover:text-[#a78bfa] transition-colors">
              hello@micro-titan.com
            </a>{" "}
            and we&apos;ll figure it out together.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-4 border-t border-[#21262d]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-6">
            About
          </p>
          <h2 className="text-3xl font-bold mb-6">One operator. All AI.</h2>
          <p className="text-[#8b949e] text-lg leading-relaxed mb-4">
            Micro Titan is a Texas holding company building AI-automated ventures across software, hospitality, real estate, and sports. One person. Seven businesses. Aver — our provable agent framework — running everything else.
          </p>
          <p className="text-[#8b949e] text-lg leading-relaxed">
            The thesis: a single founder with the right AI infrastructure can run what used to take a full team — and prove it mechanically, not just claim it. We&apos;re proving it from Paris, Texas.
          </p>
          <p className="text-[#6e7681] text-sm mt-6">
            Micro Titan LLC &mdash; Paris, Texas &mdash;{" "}
            <a href="mailto:hello@micro-titan.com" className="text-[#6366f1] hover:text-[#a78bfa] transition-colors">
              hello@micro-titan.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
