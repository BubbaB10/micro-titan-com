"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import AverGateFlow from "../components/AverGateFlow";

const TABS = [
  { id: "what",  label: "What it does" },
  { id: "foryou", label: "For you" },
  { id: "trade",  label: "Your trade" },
  { id: "model",  label: "The model" },
  { id: "where",  label: "Where it runs" },
] as const;

type TabId = typeof TABS[number]["id"];

function GpYd({ gp, yd }: { gp: string; yd: string }) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="bg-[#0a1628] rounded-lg p-3 border border-[#46cf93]/20">
        <p className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider mb-1">Gate Proves</p>
        <p className="text-xs text-[#f4f7fa] leading-relaxed">{gp}</p>
      </div>
      <div className="bg-[#0a1628] rounded-lg p-3 border border-[#e2a44a]/20">
        <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">You Decide</p>
        <p className="text-xs text-[#f4f7fa] leading-relaxed">{yd}</p>
      </div>
    </div>
  );
}

function WhatItDoes() {
  return (
    <div className="flex flex-col gap-6">
      {/* Lead card */}
      <div className="bg-[#12243d] border border-[rgba(168,216,240,0.18)] rounded-2xl p-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-4">Every instance</span>
        <h3 className="text-2xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>
          Nothing falls through the cracks.
        </h3>
        <p className="text-[#a8d8f0] leading-relaxed max-w-3xl">
          Valet tracks what you commit to, follows up without being asked, and surfaces gaps before
          they become problems — across every area of your life or business. The gate verifies
          its work mechanically before anything reaches you.
        </p>
        <GpYd
          gp="Tasks closed. Nothing slipped. Verified mechanically before it reaches you."
          yd="What to prioritize. Valet handles follow-through; direction is yours."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-3">Schedule awareness</span>
          <h4 className="text-lg font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>
            Your agent knows your calendar — and tells you when it can&apos;t see it.
          </h4>
          <p className="text-sm text-[#a8d8f0] leading-relaxed mb-3">
            You paste a private read-only calendar feed during intake. Valet reads it,
            reminds you before things happen, and tells you when something slipped — instead
            of hiding it. When you need an invite sent, Valet proposes it and you accept it
            in your own calendar app.
          </p>
          <p className="text-xs text-[#a8d8f0]/50 leading-relaxed mb-1">
            What Valet can&apos;t see: if your feed is unavailable, it says so. It doesn&apos;t
            pretend. No write access, no account connections — a read-only URL is all it ever has.
          </p>
          <GpYd
            gp="Upcoming conflicts surfaced. Slipped commitments flagged — not silently buried."
            yd="Which priorities shift when something moves. Valet reads your schedule; direction is yours."
          />
        </div>
        <div className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-3">Business context</span>
          <h4 className="text-lg font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>Every stakeholder loop closed without micromanagement.</h4>
          <p className="text-sm text-[#a8d8f0] leading-relaxed">Clients, vendors, team members — Valet keeps the communication threads alive, tracks commitments, and escalates only what genuinely needs your attention.</p>
          <GpYd
            gp="Communication threads tracked. Commitments logged."
            yd="Tone, relationship strategy, which relationships to prioritize."
          />
        </div>
      </div>
    </div>
  );
}

function ForYou() {
  const personas = [
    {
      badge: "Busy Parent",
      title: "You stop being the family's memory.",
      body: "School pickups, appointment reminders, grocery lists, household task backlogs — Valet holds the context so you don't have to carry it in your head.",
      gp: "Commitments tracked and actioned. Reminders fire without you managing them.",
      yd: "Priorities and tradeoffs. Valet surfaces what's falling behind; you decide what moves.",
    },
    {
      badge: "Solo Pro",
      title: "No lead cold. No invoice unsent.",
      body: "Valet keeps your pipeline moving — follow-ups, invoices, and client comms — without you micromanaging a CRM or a spreadsheet.",
      gp: "Follow-ups sent on schedule. Invoices out. Nothing lost between the cracks.",
      yd: "Which deals to chase. Valet keeps the engine running; strategy is yours.",
    },
    {
      badge: "Caregiver",
      title: "The care plan, held for the whole family.",
      body: "Medication schedules, appointment tracking, provider communication, family updates — Valet coordinates so you can be present instead of administrative.",
      gp: "Schedules followed. Gaps flagged to the right person before they become emergencies.",
      yd: "Care decisions. Valet handles logistics and surfaces concerns; family decides care.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {personas.map((p) => (
        <div key={p.badge} className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a5f] text-[#a8d8f0] border border-[rgba(168,216,240,0.2)] mb-3">{p.badge}</span>
          <h3 className="text-xl font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>{p.title}</h3>
          <p className="text-sm text-[#a8d8f0] leading-relaxed">{p.body}</p>
          <GpYd gp={p.gp} yd={p.yd} />
        </div>
      ))}
    </div>
  );
}

function YourTrade() {
  const trades = [
    {
      badge: "Live",
      badgeColor: "#46cf93",
      title: "Bookkeeping",
      body: "Categorizes, reconciles, and flags discrepancies — verified against source data before any number is reported.",
      gp: "Reconciliation correct. Discrepancies surfaced before owner review.",
      yd: "Accounting policy, owner draws, judgment calls on unusual items.",
    },
    {
      badge: "Live",
      badgeColor: "#46cf93",
      title: "App Developer",
      body: "Manages task backlogs, surfaces blockers, tracks client commitments, and monitors deployments — while you write code, not status updates.",
      gp: "Backlog current. Client commitments tracked. Deployment checks run.",
      yd: "Architecture, technology choices, which features to build next.",
    },
    {
      badge: "In development",
      badgeColor: "#a8d8f0",
      title: "Construction",
      body: "Tracks bids, material costs, schedule dependencies, and subcontractor communication — all in one place, verified before it goes out.",
      gp: "Bid math correct. Material orders confirmed. Schedule gaps flagged before they delay.",
      yd: "Which bids to take, contractor relationships, design changes.",
    },
    {
      badge: "In development",
      badgeColor: "#a8d8f0",
      title: "Elder Care",
      body: "Medication schedules, appointment tracking, provider coordination, family loops — Valet holds the care plan so no one has to be the family memory.",
      gp: "Schedules followed. Gaps flagged to the right person.",
      yd: "Care decisions. Valet handles logistics; family decides care.",
    },
    {
      badge: "Live",
      badgeColor: "#46cf93",
      title: "Food & Beverage",
      body: "Orders, kitchen flow, inventory, reservations, and staff comms — one agent running the floor while you run the business.",
      gp: "Orders captured, inventory tracked, nothing slips during service.",
      yd: "Menu, pricing, vendor relationships, staffing decisions.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {trades.map((t) => (
        <div key={t.title} className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ backgroundColor: `${t.badgeColor}18`, color: t.badgeColor, border: `1px solid ${t.badgeColor}40` }}
          >
            {t.badge}
          </span>
          <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">{t.title}</h3>
          <p className="text-sm text-[#a8d8f0] leading-relaxed">{t.body}</p>
          <GpYd gp={t.gp} yd={t.yd} />
        </div>
      ))}
    </div>
  );
}

function TheModel() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-[#a8d8f0] max-w-2xl mx-auto">
        Provability is always on — never a paid tier. Privacy and purpose are the two axes you pay to move along.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#12243d] border border-[#46cf93]/25 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#46cf93]/10 border border-[#46cf93]/30 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#46cf93]/10 text-[#46cf93] border border-[#46cf93]/25 mb-3">Always on — never a paid tier</span>
          <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">Provability.</h3>
          <p className="text-sm text-[#a8d8f0] leading-relaxed">
            Every claim Valet makes is mechanically verified against the actual system before it reaches
            you. This is the floor — it never moves regardless of which plan you&apos;re on. It cannot be
            removed, overridden, or customized away.
          </p>
        </div>
        <div className="bg-[#12243d] border border-[#a8d8f0]/20 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#a8d8f0]/10 border border-[#a8d8f0]/25 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#a8d8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#a8d8f0]/10 text-[#a8d8f0] border border-[#a8d8f0]/25 mb-3">You pay — data closer to you</span>
          <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">Privacy.</h3>
          <p className="text-sm text-[#a8d8f0] leading-relaxed">
            The closer your data stays to you, the less you share with outside systems.
            Cloud → Mac mini → Spark. Provability is identical on all three. You&apos;re paying for
            custody, not correctness.
          </p>
        </div>
        <div className="bg-[#12243d] border border-[#818cf8]/20 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#818cf8]/10 text-[#818cf8] border border-[#818cf8]/25 mb-3">You pay — deeper domain knowledge</span>
          <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">Purpose.</h3>
          <p className="text-sm text-[#a8d8f0] leading-relaxed">
            Pre-packed knowledge and integrations for your industry — bookkeeping, restaurant,
            real estate, elder care. You pay for faster time-to-value in your specific domain.
          </p>
        </div>
      </div>
      <p className="text-center text-sm text-[#a8d8f0]/60">
        You scale privacy and purpose. Provability never moves.
      </p>
    </div>
  );
}

function WhereItRuns() {
  const tiers = [
    {
      label: "Cloud",
      title: "Start here.",
      body: "Data and reasoning both in the cloud. Lowest entry cost. Valet's reasoning happens on Anthropic's infrastructure — no privacy promise, but the gate is identical. Right for most people starting out.",
      tag: "Entry",
      tagColor: "#a8d8f0",
    },
    {
      label: "Mac mini",
      title: "Your data, local.",
      body: "Your data stays on the device; Valet's reasoning still calls the cloud model. You own your data — but the thinking isn't air-gapped. Right for businesses that want data custody without full separation.",
      tag: "~$600 hardware",
      tagColor: "#e2a44a",
    },
    {
      label: "DGX Spark",
      title: "Nothing leaves.",
      body: "Data and reasoning both on the box. No cloud calls at all. Trade-off: a very capable local model, not frontier Claude. Right for high-sensitivity workloads where full isolation is required.",
      tag: "Full isolation",
      tagColor: "#46cf93",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((t) => (
          <div key={t.label} className="bg-[#12243d] border border-[rgba(168,216,240,0.12)] rounded-2xl p-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#4fb8e8] mb-2">{t.label}</p>
            <h3 className="text-xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>{t.title}</h3>
            <p className="text-sm text-[#a8d8f0] leading-relaxed mb-4">{t.body}</p>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${t.tagColor}15`, color: t.tagColor, border: `1px solid ${t.tagColor}35` }}
            >
              {t.tag}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-xl px-6 py-4 text-center">
        <p className="text-sm text-[#a8d8f0]">
          Provability is identical on all three. Upgrading is a relocation, not a restart.
          Your gate, your checks, your history — they all move with you.
        </p>
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  what:   <WhatItDoes />,
  foryou: <ForYou />,
  trade:  <YourTrade />,
  model:  <TheModel />,
  where:  <WhereItRuns />,
};

export default function ValetPage() {
  const [activeTab, setActiveTab] = useState<TabId>("what");

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">Valet by Micro Titan</p>
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-[300] leading-none tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Valet™
          </h1>
          <p className="text-xl sm:text-2xl text-[#a8d8f0] font-light max-w-2xl mx-auto mb-8">
            Most AI tells you what it did. Valet proves it — or it doesn&apos;t reach you at all.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-14">
            {["Provable not plausible", "Fail-closed", "Alert discipline"].map((p) => (
              <span key={p} className="px-4 py-2 rounded-full text-xs font-semibold bg-[#12243d] text-[#a8d8f0] border border-[rgba(168,216,240,0.15)]">
                {p}
              </span>
            ))}
          </div>
          <AverGateFlow />
        </div>
      </section>

      {/* Persona showcase */}
      <section className="py-20 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-[#4fb8e8] mb-3">Your cockpit, your life</p>
          <h2 className="text-center text-3xl sm:text-4xl font-[300] text-[#f4f7fa] mb-2" style={{ fontFamily: "var(--font-mulish)" }}>
            Every life looks different. The cockpit adapts.
          </h2>
          <p className="text-center text-[#a8d8f0] mb-12 max-w-xl mx-auto">
            Same verifiable agent. Different domains, different stakes, same provability underneath.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start justify-items-center">
            {/* Busy Parent persona */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/mom-top.png"
                  alt="Busy Parent cockpit — verdict, needs-you items, and domain cards for The Kids, The House, Health, and Money"
                  width={780}
                  height={1688}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/mom-metrics.png"
                  alt="Busy Parent cockpit — Business Activity charts: grocery spend trending down, kids-activities logged, chores-done streak, and This Week summary table"
                  width={780}
                  height={1688}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm font-medium text-[#f4f7fa]">Busy Parent</p>
              <p className="text-xs text-[#a8d8f0]/70 text-center">The Kids · The House · Health · Money</p>
            </div>
            {/* Business Owner persona */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/biz-top.png"
                  alt="Business Owner cockpit — verdict, needs-you items, and domain cards for Orders, Money, Staff, and Marketing"
                  width={780}
                  height={1688}
                  className="w-full h-auto"
                />
              </div>
              <div className="relative w-full rounded-[2.5rem] overflow-hidden border-[6px] border-[#1e3a5f] shadow-2xl shadow-black/60">
                <Image
                  src="/screenshots/personas/biz-metrics.png"
                  alt="Business Owner cockpit — Business Activity charts: daily orders with weekend peaks, revenue MTD, and Invoice Aging table showing overdue balance"
                  width={780}
                  height={1688}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm font-medium text-[#f4f7fa]">Business Owner</p>
              <p className="text-xs text-[#a8d8f0]/70 text-center">Orders · Money · Staff · Marketing</p>
            </div>
          </div>
          <p className="text-center text-xs text-[#a8d8f0]/40 mt-8">Illustrative — sample data.</p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="sticky top-16 z-40 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-[#12243d] text-[#f4f7fa] border border-[rgba(168,216,240,0.15)]"
                    : "text-[#a8d8f0]/60 hover:text-[#f4f7fa]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          {TAB_CONTENT[activeTab]}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-[300] text-[#f4f7fa] mb-4" style={{ fontFamily: "var(--font-mulish)" }}>
            Tell it what you do. It comes back provisioned.
          </h2>
          <p className="text-[#a8d8f0] mb-8">
            See the plans — a one-time build fee, then flat monthly. No upsells, no per-seat fees.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200"
          >
            See pricing →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
