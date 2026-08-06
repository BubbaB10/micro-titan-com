import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

const VENTURES: Record<string, {
  name: string;
  tagline: string;
  audience: string;
  category: string;
  status: "Live" | "Template" | "App Store Stage";
  statusColor: string;
  accent: string;
  problem: string;
  desc: string;
  proof: string;
  gate: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}> = {
  "fairway-bets": {
    name: "Fairway Bets",
    tagline: "Settle golf bets without an argument or a spreadsheet.",
    audience: "Golf groups & leagues",
    category: "Sports / Fintech",
    status: "App Store Stage",
    statusColor: "#e2a44a",
    accent: "#10b981",
    problem: "Every golf group has someone who does the math wrong, or argues about it, or owes money for three weeks. Fairway Bets ends that.",
    desc: "Handicaps, Wolf, Hammer, banker, skins, multi-format trip planner, and a full settlement engine. Every payout verified zero-sum by the gate before money moves.",
    proof: "10+ game formats. Zero-sum verified mechanically. Full trip ledger — hotel splits, meals, tee fees — all in one settlement.",
    gate: "Every payout is gate-verified before money moves. Correct math is not assumed — it is proven.",
    cta: { label: "Join the waitlist", href: "/aver" },
    ctaSecondary: { label: "How the gate works →", href: "/why-provable" },
  },
  "the-club": {
    name: "The Club",
    tagline: "Everything your golf club needs to communicate and run.",
    audience: "Golf & country clubs",
    category: "Club Management",
    status: "Live",
    statusColor: "#3b82f6",
    accent: "#1d4ed8",
    problem: "Club communications are a mess of email chains, printed sheets, and phone trees. The Club puts tee times, events, and announcements in one place members actually check.",
    desc: "Member app for Paris Golf & Country Club — tee times, event lifecycle, news ticker, groundskeeping updates, and a full club communication hub.",
    proof: "Tee sheet, event management, ticker board, and full member directory all live. Built for PGCC; available to license for any club.",
    gate: "Tee sheet data integrity and event state transitions verified on every deploy.",
    cta: { label: "Talk to us about your club", href: "mailto:hello@micro-titan.com?subject=The Club — licensing inquiry" },
    ctaSecondary: { label: "See The Studio →", href: "/studio" },
  },
  "sandwich-etc": {
    name: "Sandwich Etc.",
    tagline: "Order-ahead for local restaurants — SMS-confirmed, no third-party fees.",
    audience: "Local restaurants",
    category: "Restaurant Tech",
    status: "Live",
    statusColor: "#46cf93",
    accent: "#dc2626",
    problem: "Third-party delivery apps take 20–30% and own the customer relationship. Sandwich Etc. gives that back to the restaurant.",
    desc: "Order-ahead app for a Paris, TX sandwich shop. Customers order on their phone and pick up. No commission, no app store, no middleman.",
    proof: "Built, connected, and live with real orders in under one week. Real customers, real orders.",
    gate: "Order capture verified before launch.",
    cta: { label: "License this template", href: "/studio" },
    ctaSecondary: { label: "Talk to us →", href: "mailto:hello@micro-titan.com?subject=Sandwich Etc. — restaurant inquiry" },
  },
  "mineral-ledger": {
    name: "Mineral Ledger",
    tagline: "Know exactly what you're owed — and whether you got it.",
    audience: "Mineral rights owners",
    category: "Finance / Royalty",
    status: "Live",
    statusColor: "#46cf93",
    accent: "#d97706",
    problem: "Royalty statements are dense, inconsistent, and almost nobody checks the math. Discrepancies go uncaught for years. Mineral Ledger changes that.",
    desc: "XTO Energy royalty audit and cross-sibling reconciliation. Every statement parsed, every discrepancy flagged, every month compared automatically.",
    proof: "16 statements parsed. $353k–$370k per sibling reconciled across three mineral-rights owners. Monthly comparison live.",
    gate: "Statement parsing and cross-owner math verified against source documents on every run.",
    cta: { label: "Talk to us about your minerals", href: "mailto:hello@micro-titan.com?subject=Mineral Ledger — inquiry" },
  },
  "rosewood-dine": {
    name: "Rosewood Dine",
    tagline: "A full restaurant OS — live in 72 hours.",
    audience: "Restaurant owners",
    category: "Restaurant Tech",
    status: "Live",
    statusColor: "#46cf93",
    accent: "#7c3aed",
    problem: "Restaurant software is either enterprise-priced or consumer-grade. Rosewood is built for owner-operators who want real systems without a six-figure IT budget.",
    desc: "Orders, kitchen display, inventory, customer CRM, reservations, and analytics. Everything a restaurant needs to run, in one place, gate-verified before delivery.",
    proof: "Live in 72 hours. Tax config, reservations, and full order-to-kitchen flow all operational for a real restaurant.",
    gate: "Order-to-kitchen flow and inventory tracking verified on every deploy.",
    cta: { label: "Request a demo", href: "mailto:hello@micro-titan.com?subject=Rosewood Dine — demo request" },
    ctaSecondary: { label: "License this template →", href: "/studio" },
  },
  "property-os": {
    name: "Property OS",
    tagline: "AI-managed rental portfolio ops — zero hours per week on admin.",
    audience: "Landlords with 10+ units",
    category: "Real Estate",
    status: "Template",
    statusColor: "#8b5cf6",
    accent: "#0891b2",
    problem: "Landlords with a real portfolio spend 20+ hours a week on maintenance coordination, leasing, and tenant communication. Property OS automates all three.",
    desc: "Built as a reusable template from a real 25-unit portfolio. Maintenance tickets, leasing pipeline, and tenant comms — all on autopilot with an agent that escalates to you only when it needs a decision.",
    proof: "Built and proven on a real 25-unit portfolio. Zero hours/week on admin after deployment.",
    gate: "Maintenance workflow and tenant communication delivery verified before handoff.",
    cta: { label: "License this template", href: "/studio" },
    ctaSecondary: { label: "Talk to us →", href: "mailto:hello@micro-titan.com?subject=Property OS — licensing inquiry" },
  },
};

export function generateStaticParams() {
  return Object.keys(VENTURES).map((slug) => ({ slug }));
}

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = VENTURES[slug];
  if (!v) notFound();

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/#portfolio" className="text-xs text-[#a8d8f0]/50 hover:text-[#a8d8f0]/80 transition-colors">
              ← Portfolio
            </Link>
            <span className="text-[#a8d8f0]/20">·</span>
            <span className="text-xs text-[#a8d8f0]/50">{v.category}</span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full ml-1"
              style={{ backgroundColor: `${v.statusColor}15`, color: v.statusColor, border: `1px solid ${v.statusColor}30` }}
            >
              {v.status}
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-[300] leading-tight tracking-tight text-[#f4f7fa] mb-4"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            {v.name}
          </h1>
          <p className="text-xl text-[#a8d8f0] font-light mb-3">{v.tagline}</p>
          <p className="text-sm text-[#4fb8e8]/70">For: {v.audience}</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          {/* The problem */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">The problem it solves</p>
            <p className="text-[#a8d8f0] leading-relaxed">{v.problem}</p>
          </div>

          {/* What it does */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-3">What it does</p>
            <p className="text-[#a8d8f0] leading-relaxed">{v.desc}</p>
          </div>

          {/* Proof */}
          <div className="bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-2xl p-6">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: v.accent }}>Proof</p>
            <p className="text-[#f4f7fa] leading-relaxed mb-4">{v.proof}</p>
            <div className="bg-[#0a1628] rounded-lg px-4 py-3 border border-[#46cf93]/15">
              <p className="text-xs text-[#46cf93]">
                <span className="font-semibold">Gate: </span>{v.gate}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={v.cta.href}
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              {v.cta.label}
            </Link>
            {v.ctaSecondary && (
              <Link
                href={v.ctaSecondary.href}
                className="inline-flex items-center justify-center gap-2 text-[#a8d8f0]/60 hover:text-[#c7d2fe] text-sm font-medium transition-colors px-4 py-2"
              >
                {v.ctaSecondary.label}
              </Link>
            )}
          </div>

          {/* Back to portfolio */}
          <div className="pt-4 border-t border-[rgba(168,216,240,0.08)]">
            <Link href="/proof" className="text-sm text-[#a8d8f0]/50 hover:text-[#f4f7fa] transition-colors">
              ← See all six businesses
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
