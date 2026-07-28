import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const PORTFOLIO = [
  {
    name: "Fairway Bets",
    category: "Sports / Fintech",
    status: "App Store Stage",
    statusColor: "#e2a44a",
    accent: "#10b981",
    iconSvg: '<line x1="12" y1="4" x2="12" y2="19"/><path d="M12 4 L19 7.5 L12 11"/><ellipse cx="12" cy="19" rx="4.5" ry="1.5"/>',
    desc: "Golf betting OS — handicaps, Wolf, Hammer, multi-format trip planner, and full settlement engine. Zero math, zero arguments.",
    proof: "10+ game formats verified zero-sum by the gate. Payout correctness is mechanical, not manual.",
    gate: "Every payout is gate-verified before money moves.",
  },
  {
    name: "The Club",
    category: "Club Management",
    status: "Live",
    statusColor: "#3b82f6",
    accent: "#1d4ed8",
    iconSvg: '<line x1="9" y1="4" x2="16" y2="17"/><path d="M14 16 L18 18 L17 21 L11 21 Z"/>',
    desc: "Member app for Paris Golf & Country Club — tee times, event lifecycle, news ticker, and club communication hub.",
    proof: "Groundskeeping hub, event status lifecycle, ticker board, and full member directory all live.",
    gate: "Tee sheet data integrity and event state transitions verified.",
  },
  {
    name: "Sandwich Etc.",
    category: "Restaurant Tech",
    status: "Live",
    statusColor: "#46cf93",
    accent: "#dc2626",
    iconSvg: '<path d="M4 9 Q4 6 12 6 Q20 6 20 9"/><line x1="4" y1="13" x2="20" y2="13"/><path d="M4 16 Q4 18.5 12 18.5 Q20 18.5 20 16"/>',
    desc: "Order-ahead app for a Paris, TX sandwich shop. Twilio SMS confirmation, live for real customers.",
    proof: "Built, connected, and live with real orders inside one week. Warm cream UI, Twilio confirmed.",
    gate: "Order capture and SMS delivery verified before launch.",
  },
  {
    name: "Mineral Ledger",
    category: "Finance / Royalty",
    status: "Live",
    statusColor: "#46cf93",
    accent: "#d97706",
    iconSvg: '<path d="M12 4 C12 4 6 10 6 15 Q6 20 12 20 Q18 20 18 15 Q18 10 12 4 Z"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="10" y1="17" x2="14" y2="17"/>',
    desc: "XTO Energy royalty audit and cross-sibling reconciliation. Every statement parsed, every discrepancy flagged.",
    proof: "16 statements parsed, $353k–$370k per sibling reconciled, monthly comparison live.",
    gate: "Statement parsing and cross-owner math verified against source documents.",
  },
  {
    name: "Rosewood Dine",
    category: "Restaurant Tech",
    status: "Live",
    statusColor: "#46cf93",
    accent: "#7c3aed",
    iconSvg: '<path d="M7 4 L7 20"/><path d="M5 4 L5 8 Q5 11 7 11 Q9 11 9 8 L9 4"/><path d="M15 4 L15 20"/><path d="M15 4 C17 5 18 8 15 11"/>',
    desc: "Full restaurant OS — orders, kitchen display, inventory, customer CRM, reservations, and analytics.",
    proof: "Live in 72 hours. Tax config, reservations, and full order flow all operational.",
    gate: "Order-to-kitchen flow and inventory tracking verified on launch.",
  },
  {
    name: "Property OS",
    category: "Real Estate",
    status: "Template",
    statusColor: "#8b5cf6",
    accent: "#0891b2",
    iconSvg: '<polyline points="3 12 12 4 21 12"/><path d="M5 12 L5 21 L19 21 L19 12"/><path d="M9 21 L9 15 L15 15 L15 21"/>',
    desc: "AI-managed rental portfolio operations. Maintenance, leasing, and tenant comms on autopilot.",
    proof: "Built as a reusable template from a real 25-unit portfolio. Zero hours/week on admin.",
    gate: "Maintenance workflow and tenant communication delivery verified.",
  },
];

export default function ProofPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">The portfolio</p>
          <h1
            className="text-5xl sm:text-6xl font-[300] leading-tight tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Built by The Studio.<br />Runs on Aver.
          </h1>
          <p className="text-lg text-[#a8d8f0] font-light max-w-xl mx-auto">
            Greg — our own Aver instance — designed, built, and currently operates all six.
            Each is a live product, real customers, real data.
          </p>
        </div>
      </section>

      {/* Portfolio grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTFOLIO.map((v) => (
              <div
                key={v.name}
                className="group bg-[#12243d] border border-[rgba(168,216,240,0.1)] hover:border-[rgba(168,216,240,0.2)] rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5"
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
                  <p className="text-xs text-[#a8d8f0]/50 mb-2">{v.category}</p>
                  <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">{v.desc}</p>
                  <p className="text-xs font-medium leading-relaxed mb-3" style={{ color: v.accent }}>
                    {v.proof}
                  </p>
                  <div className="bg-[#0a1628] rounded-lg px-3 py-2 border border-[#46cf93]/15">
                    <p className="text-xs text-[#46cf93]">
                      <span className="font-semibold">Gate: </span>{v.gate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom callout */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-2xl font-[300] text-[#f4f7fa] mb-4"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            The same process that built these is available to you.
          </h2>
          <p className="text-[#a8d8f0] mb-8">
            Every build includes an Aver instance. The gate that verified delivery keeps proving operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 bg-[#12243d] hover:bg-[#1e3a5f] border border-[rgba(168,216,240,0.15)] text-[#f4f7fa] font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200"
            >
              How we build →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200"
            >
              Start a build
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
