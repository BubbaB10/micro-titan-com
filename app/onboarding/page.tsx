"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const JOBS = [
  {
    id: "bills",
    title: "Bills",
    desc: "Never miss a due date or pay twice.",
    svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/>',
  },
  {
    id: "calendar",
    title: "Calendar",
    desc: "Your schedule, held in one head.",
    svg: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  },
  {
    id: "kids",
    title: "Kids' schedules",
    desc: "Soccer, pickups, appointments — all tracked.",
    svg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    id: "reminders",
    title: "Reminders",
    desc: "Things you said you'd do, surfaced when they matter.",
    svg: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  },
  {
    id: "tax",
    title: "Tax admin",
    desc: "Receipts, deductions, quarterly prep — organized.",
    svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  },
  {
    id: "parent",
    title: "Aging parent",
    desc: "Meds, appointments, calls — Aver holds the care thread.",
    svg: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  },
];

const CONNECTORS = [
  {
    id: "gcal",
    name: "Google Calendar",
    desc: "Read your events to check for conflicts and keep reminders in sync.",
    svg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    color: "#4fb8e8",
  },
  {
    id: "email",
    name: "Email",
    desc: "Scan for bills, confirmations, and anything that needs your attention.",
    svg: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    color: "#818cf8",
  },
  {
    id: "bank",
    name: "Bank via Plaid",
    desc: "Verify bills paid and flag any unusual or duplicate charges.",
    svg: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    color: "#46cf93",
  },
];

function Icon({ svg, color = "#f4f7fa", size = 20 }: { svg: string; color?: string; size?: number }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}">${svg}</svg>`,
      }}
    />
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-10">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`rounded-full transition-all duration-300 ${
            s === step
              ? "w-6 h-2 bg-[#818cf8]"
              : s < step
              ? "w-2 h-2 bg-[#46cf93]"
              : "w-2 h-2 bg-[rgba(168,216,240,0.2)]"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherText, setOtherText] = useState("");
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const toggleJob = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleConnect = (id: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <ProgressDots step={step} />

          {/* ── Step 1: Job picker ── */}
          {step === 1 && (
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-3">
                Step 1 of 3
              </p>
              <h1
                className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-3 leading-tight"
                style={{ fontFamily: "var(--font-mulish)" }}
              >
                What do you want off your plate?
              </h1>
              <p className="text-[#a8d8f0] text-center text-sm mb-10">
                Pick anything that applies. Aver handles it — and proves it.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {JOBS.map((job) => {
                  const isOn = selected.has(job.id);
                  return (
                    <button
                      key={job.id}
                      onClick={() => toggleJob(job.id)}
                      className={`text-left rounded-xl border p-5 flex items-start gap-4 transition-all duration-200 ${
                        isOn
                          ? "bg-[#818cf8]/10 border-[#818cf8]/60"
                          : "bg-[#12243d] border-[rgba(168,216,240,0.1)] hover:border-[rgba(168,216,240,0.25)]"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          isOn ? "bg-[#818cf8]/20" : "bg-[#0a1628]"
                        }`}
                        style={{ border: `1px solid ${isOn ? "rgba(129,140,248,0.4)" : "rgba(168,216,240,0.15)"}` }}
                      >
                        <Icon svg={job.svg} color={isOn ? "#818cf8" : "#a8d8f0"} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold ${isOn ? "text-[#c7d2fe]" : "text-[#f4f7fa]"}`}>
                            {job.title}
                          </p>
                          {isOn && (
                            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" className="flex-shrink-0">
                              <circle cx="10" cy="10" r="9" stroke="#818cf8" strokeWidth="1.5" />
                              <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-[#a8d8f0]/60 mt-0.5 leading-relaxed">{job.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Something else card — full width */}
              <div className="mb-8 rounded-xl border border-[rgba(168,216,240,0.12)] bg-[#12243d] p-5">
                <p className="text-sm font-semibold text-[#f4f7fa] mb-2">Something else</p>
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Describe what you want off your plate — anything."
                  rows={2}
                  className="w-full bg-transparent text-sm text-[#f4f7fa] placeholder:text-[#a8d8f0]/30 resize-none outline-none leading-relaxed"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm transition-all duration-200"
              >
                Next — connect your accounts →
              </button>

              <p className="text-center text-xs text-[#a8d8f0]/40 mt-5">
                🔒 We never ask for your passwords. Ever.
              </p>
            </div>
          )}

          {/* ── Step 2: Connectors ── */}
          {step === 2 && (
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-3">
                Step 2 of 3
              </p>
              <h1
                className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-3 leading-tight"
                style={{ fontFamily: "var(--font-mulish)" }}
              >
                Connect what those need
              </h1>
              <p className="text-[#a8d8f0] text-center text-sm mb-8">
                Read-only access only. Aver sees what's relevant — nothing else.
              </p>

              {/* Trust headline */}
              <div className="bg-[#0f1f38] border border-[#46cf93]/20 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
                <span className="text-lg flex-shrink-0">🔒</span>
                <div>
                  <p className="text-sm font-bold text-[#f4f7fa] mb-1">We never ask for your passwords. Ever.</p>
                  <p className="text-xs text-[#a8d8f0]/70 leading-relaxed">
                    Connections go through secure OAuth — you authorize directly with Google, your bank, etc.
                    Aver reads. Never writes. Never stores passwords.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                {CONNECTORS.map((c) => {
                  const isOn = connected.has(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`rounded-xl border p-5 transition-all duration-200 ${
                        isOn
                          ? "bg-[#0f1f38] border-[#46cf93]/40"
                          : "bg-[#12243d] border-[rgba(168,216,240,0.1)]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${c.color}15`,
                            border: `1px solid ${c.color}35`,
                          }}
                        >
                          <Icon svg={c.svg} color={c.color} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-semibold text-[#f4f7fa]">{c.name}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(168,216,240,0.08)] text-[#a8d8f0]/60 border border-[rgba(168,216,240,0.15)]">
                              read-only
                            </span>
                          </div>
                          <p className="text-xs text-[#a8d8f0]/60 leading-relaxed">{c.desc}</p>
                        </div>
                        <button
                          onClick={() => toggleConnect(c.id)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            isOn
                              ? "bg-[#46cf93]/15 border border-[#46cf93]/40 text-[#46cf93]"
                              : "bg-[#1e3a5f] border border-[rgba(168,216,240,0.15)] text-[#f4f7fa] hover:bg-[#243f6a]"
                          }`}
                        >
                          {isOn ? "Connected ✓" : "Connect →"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm transition-all duration-200 mb-3"
              >
                {connected.size > 0
                  ? `Continue with ${connected.size} connection${connected.size > 1 ? "s" : ""} →`
                  : "Continue →"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full py-2 text-xs text-[#a8d8f0]/40 hover:text-[#a8d8f0] transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* ── Step 3: You're live ── */}
          {step === 3 && (
            <div className="text-center">
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-6">
                Step 3 of 3
              </p>

              {/* Animated seal / check mark */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(70,207,147,0.18) 0%, transparent 70%)" }}
                  />
                  <svg viewBox="0 0 120 120" width="144" height="144" fill="none">
                    <circle cx="60" cy="60" r="52" stroke="#46cf93" strokeWidth="1.5" strokeOpacity="0.4" />
                    <circle cx="60" cy="60" r="44" stroke="#46cf93" strokeWidth="0.5" strokeOpacity="0.2" />
                    <path
                      d="M38 62 L52 76 L82 46"
                      stroke="#46cf93"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-[300] text-[#f4f7fa] mb-4"
                style={{ fontFamily: "var(--font-mulish)" }}
              >
                You're live.
              </h1>
              <p className="text-[#a8d8f0] mb-3 max-w-sm mx-auto leading-relaxed">
                Aver has what it needs. Give it a day to learn your patterns.
              </p>
              <p className="text-xs text-[#a8d8f0]/40 mb-10">
                Every item it surfaces will be gate-verified before it reaches you.
              </p>

              {connected.size > 0 && (
                <div className="bg-[#12243d] border border-[rgba(168,216,240,0.1)] rounded-xl p-5 mb-8 max-w-sm mx-auto">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#a8d8f0]/40 mb-3">Connected</p>
                  <div className="flex flex-col gap-2">
                    {CONNECTORS.filter((c) => connected.has(c.id)).map((c) => (
                      <div key={c.id} className="flex items-center gap-2.5 text-sm text-[#f4f7fa]">
                        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                          <circle cx="10" cy="10" r="9" stroke="#46cf93" strokeWidth="1.5" />
                          <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#46cf93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200"
              >
                Open your dashboard →
              </Link>

              <p className="text-center text-xs text-[#a8d8f0]/30 mt-6">
                🔒 We never asked for your password.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
