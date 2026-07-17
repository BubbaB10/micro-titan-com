import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const ventures = [
  {
    icon: "⛳",
    name: "Fairway Bets",
    tagline: "The golf betting app that handles handicaps, Wolf, Hammer, and Boondoggle — no math, no arguments.",
    status: "App Store Stage",
    statusColor: "#f59e0b",
    category: "iOS App",
    accent: "#10b981",
    href: null,
  },
  {
    icon: "🏌️",
    name: "The Club",
    tagline: "Member app for Paris Golf & Country Club. Tee times, events, dining, community — all in one place.",
    status: "Active Development",
    statusColor: "#3b82f6",
    category: "Club App",
    accent: "#1d4ed8",
    href: null,
  },
  {
    icon: "🥪",
    name: "Sandwich Etc.",
    tagline: "Order-ahead app for a Paris, TX sandwich shop. Built, Twilio-connected, and live for customers.",
    status: "Live",
    statusColor: "#10b981",
    category: "Restaurant Tech",
    accent: "#dc2626",
    href: null,
  },
  {
    icon: "🍽️",
    name: "Rosewood Dine",
    tagline: "Full restaurant OS — orders, kitchen display, inventory, customer CRM, and analytics.",
    status: "Beta",
    statusColor: "#8b5cf6",
    category: "Restaurant Tech",
    accent: "#7c3aed",
    href: null,
  },
  {
    icon: "🛢️",
    name: "Mineral Ledger",
    tagline: "XTO Energy royalty audit and cross-sibling reconciliation. Every statement parsed, every gap flagged.",
    status: "Live",
    statusColor: "#10b981",
    category: "Finance Tool",
    accent: "#d97706",
    href: null,
  },
  {
    icon: "🗼",
    name: "Eiffel West Properties",
    tagline: "25-unit rental portfolio in Paris, TX. AI-managed operations with acquisition in progress.",
    status: "Active",
    statusColor: "#10b981",
    category: "Real Estate",
    accent: "#0891b2",
    href: null,
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
            href="#ventures"
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
          >
            See the portfolio
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
                Your personal AI chief of staff. Greg runs in the background, works while you sleep, connects to your real data, and reports back on Telegram. Persistent memory. Background workers. Real automation.
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
                href="https://greg-installer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Learn about Greg →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ventures */}
      <section id="ventures" className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Active Ventures</h2>
          <p className="text-center text-[#8b949e] mb-16 text-lg">
            Real products. Real markets. Real customers.
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
                  <p className="text-sm text-[#8b949e] leading-relaxed">{v.tagline}</p>
                </div>
              </div>
            ))}
          </div>
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
