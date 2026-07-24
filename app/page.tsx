import Nav from "./components/Nav";
import Footer from "./components/Footer";

const ventures = [
  {
    icon: "⛳",
    name: "Fairway Bets",
    tagline: "Golf betting OS — handicaps, Wolf, Hammer, and multi-format trip planner. Zero math, zero arguments.",
    outcome: "10+ games proven zero-sum and wired end-to-end by gate verification.",
    status: "App Store Stage",
    statusColor: "#f59e0b",
    category: "iOS App",
    accent: "#10b981",
  },
  {
    icon: "🏌️",
    name: "The Club",
    tagline: "Member app for Paris Golf & Country Club — tee times, events, news, and club communication.",
    outcome: "Groundskeeping hub, event lifecycle, and ticker board all live.",
    status: "Active",
    statusColor: "#3b82f6",
    category: "Club App",
    accent: "#1d4ed8",
  },
  {
    icon: "🥪",
    name: "Sandwich Etc.",
    tagline: "Order-ahead app for a Paris, TX sandwich shop. Twilio SMS confirmation, live for customers.",
    outcome: "Built, connected, and live with real orders inside one week.",
    status: "Live",
    statusColor: "#10b981",
    category: "Restaurant Tech",
    accent: "#dc2626",
  },
  {
    icon: "🍽️",
    name: "Rosewood Dine",
    tagline: "Full restaurant OS — orders, kitchen display, inventory, customer CRM, and analytics.",
    outcome: "Live in 72 hours. Tax config, reservations, and full order flow operational.",
    status: "Live",
    statusColor: "#10b981",
    category: "Restaurant Tech",
    accent: "#7c3aed",
  },
  {
    icon: "🛢️",
    name: "Mineral Ledger",
    tagline: "XTO Energy royalty audit and cross-sibling reconciliation. Every statement parsed, every gap flagged.",
    outcome: "16 statements parsed, discrepancies surfaced, and reconciliation live — first evening.",
    status: "Live",
    statusColor: "#10b981",
    category: "Finance Tool",
    accent: "#d97706",
  },
  {
    icon: "🏡",
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
    name: "Greg Foundation",
    price: "$500",
    period: "one-time setup",
    description: "Your AI chief of staff, live and working in 48 hours.",
    features: [
      "Persistent memory — knows your full context across every session",
      "Telegram interface — text Greg like a colleague, any time",
      "Background tasks and scheduled reports while you sleep",
      "Connected to your existing apps and data",
      "One industry context included (restaurant, golf, real estate, finance)",
      "2-hour guided onboarding session",
    ],
    cta: "Apply for Access",
    ctaHref: "mailto:hello@micro-titan.com?subject=Greg%20Foundation%20%E2%80%94%20Application",
    highlight: false,
    badge: null,
  },
  {
    name: "Build + Operate",
    price: "$1,500",
    period: "one-time build + Greg included",
    description: "Greg running your business, plus a custom app built for it.",
    features: [
      "Everything in Greg Foundation",
      "Custom app built for your vertical and deployed live",
      "Greg wired directly to your app data from day one",
      "Proven patterns from Sandwich Etc., Rosewood, Mineral Ledger",
      "Available for: restaurants, clubs, O&G royalty, rental portfolios, golf groups",
      "Ongoing: Greg manages the app on autopilot and flags exceptions",
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
            href="#get-greg"
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
          >
            Get Greg for your business
          </a>
        </div>
        <div className="absolute bottom-12 flex flex-col items-center gap-2 text-[#6e7681] text-xs">
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Greg — featured */}
      <section className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-6 text-center">
            The Operating System
          </p>
          <div className="bg-gradient-to-br from-[#161b22] to-[#1a1f2e] border border-[#6366f1]/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 bg-[#6366f1]/10 border border-[#6366f1]/30">
              🤖
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl md:text-4xl font-black">Greg</h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                  Active
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#161b22] text-[#8b949e] border border-[#21262d]">
                  AI Product
                </span>
              </div>
              <p className="text-xl text-[#8b949e] leading-relaxed mb-6 max-w-2xl">
                Your personal AI chief of staff. Greg runs in the background, works while you sleep, connects to your real data, and reports back on Telegram. Persistent memory. Background workers. Real automation — not a chatbot.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Persistent memory", desc: "Knows your full business context across every session" },
                  { label: "Background workers", desc: "Scheduled tasks that run and report without you watching" },
                  { label: "Telegram-native", desc: "One text away. No browser required." },
                ].map((f) => (
                  <div key={f.label} className="bg-[#0d1117]/60 rounded-xl p-4 border border-[#21262d]">
                    <p className="text-sm font-semibold text-white mb-1">{f.label}</p>
                    <p className="text-xs text-[#6e7681] leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
              <a
                href="#get-greg"
                className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Get started →
              </a>
            </div>
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
            Every venture below was designed, built, and deployed by one operator with Greg. These are live products, real customers, and real data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ventures.map((v) => (
              <div
                key={v.name}
                className="group bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-4 hover:border-[#30363d] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${v.accent}18`, border: `1px solid ${v.accent}40` }}
                  >
                    {v.icon}
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${v.statusColor}15`, color: v.statusColor, border: `1px solid ${v.statusColor}30` }}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-white">{v.name}</h3>
                  </div>
                  <p className="text-xs text-[#6e7681] mb-2">{v.category}</p>
                  <p className="text-sm text-[#8b949e] leading-relaxed mb-3">{v.tagline}</p>
                  <p
                    className="text-xs leading-relaxed font-medium"
                    style={{ color: v.accent }}
                  >
                    {v.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storefront — two offers */}
      <section id="get-greg" className="py-24 px-4 border-t border-[#21262d]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#6366f1] mb-4 text-center">
            Get Started
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Two ways in.</h2>
          <p className="text-center text-[#8b949e] mb-16 text-lg max-w-xl mx-auto">
            Start with Greg as your chief of staff, or have us build your custom app and wire Greg into it from day one.
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
            Micro Titan is a Texas holding company building AI-automated ventures across software, hospitality, real estate, and sports. One person. Seven businesses. A chief-of-staff AI running everything else.
          </p>
          <p className="text-[#8b949e] text-lg leading-relaxed">
            The thesis: a single founder with the right AI infrastructure can run what used to take a full team. We&apos;re proving it from Paris, Texas.
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
