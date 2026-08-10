"use client";

import { useState, useEffect, useRef } from "react";

const SCENARIOS = [
  {
    id: "clean",
    label: "CLEAN claim",
    claim: "All your bills are handled this month — none missed, none paid twice.",
    checks: [
      "Utility bill — Pacific Gas & Electric",
      "Water & sewer account",
      "Internet — Xfinity",
      "No duplicates in billing run",
    ],
    failAt: null as number | null,
    conflict: null as string | null,
    verdict: "VERIFIED",
    receipt: { gateId: "g-2a4f9c", checks: "4 / 4", elapsed: "51 ms" },
    outcomeText: "Reaches you — stamped 🔒",
  },
  {
    id: "caught",
    label: "CAUGHT claim",
    claim: "Added everyone's plans to the family calendar — all set.",
    checks: [
      "Emma's soccer — Mon 3:30 pm",
      "Dad's dentist — Tue 4:00 pm",
      "Grocery pickup — Wed 12:00 pm",
      "No two events overlap",
    ],
    failAt: 3 as number | null,
    conflict: "Double-booked: Emma's soccer & the dentist, Tue 4:00 pm",
    verdict: "UNVERIFIED — HELD",
    receipt: null,
    outcomeText: "Does NOT reach you as done. Flagged, fail-closed.",
  },
];

type CheckState = "pending" | "running" | "pass" | "fail";
type Phase = "idle" | "running" | "done";

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#4fb8e8" strokeWidth="3" strokeOpacity="0.25" />
      <path fill="#4fb8e8" fillOpacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function GateDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [checkStates, setCheckStates] = useState<CheckState[]>(["pending", "pending", "pending", "pending"]);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scenario = SCENARIOS[scenarioIdx];

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const reset = () => {
    clearTimers();
    setCheckStates(["pending", "pending", "pending", "pending"]);
    setPhase("idle");
  };

  const switchScenario = (idx: number) => {
    reset();
    setScenarioIdx(idx);
  };

  const runDemo = () => {
    clearTimers();
    setCheckStates(["pending", "pending", "pending", "pending"]);
    setPhase("running");

    const s = SCENARIOS[scenarioIdx];
    const STEP = 480;

    for (let i = 0; i < 4; i++) {
      const t1 = setTimeout(() => {
        setCheckStates(prev => { const n = [...prev] as CheckState[]; n[i] = "running"; return n; });
      }, i * STEP);

      const t2 = setTimeout(() => {
        setCheckStates(prev => { const n = [...prev] as CheckState[]; n[i] = s.failAt === i ? "fail" : "pass"; return n; });
      }, i * STEP + 420);

      timers.current.push(t1, t2);
    }

    const t3 = setTimeout(() => setPhase("done"), 4 * STEP + 180);
    timers.current.push(t3);
  };

  useEffect(() => () => clearTimers(), []);

  const isClean = scenario.failAt === null;

  return (
    <div id="gate" className="max-w-2xl mx-auto">
      {/* Scenario tabs */}
      <div className="flex gap-2 mb-6">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => switchScenario(i)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${
              scenarioIdx === i
                ? i === 0
                  ? "bg-[#46cf93]/15 border-[#46cf93]/50 text-[#46cf93]"
                  : "bg-[#e74c3c]/12 border-[#e74c3c]/50 text-[#e74c3c]"
                : "bg-[#12243d] border-[rgba(168,216,240,0.12)] text-[#a8d8f0]/50 hover:text-[#a8d8f0]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Demo card */}
      <div className="bg-[#06101e] border border-[rgba(168,216,240,0.12)] rounded-2xl overflow-hidden shadow-xl shadow-black/40">
        {/* Claim header */}
        <div className="px-6 py-5 border-b border-[rgba(168,216,240,0.07)] flex items-start gap-4 bg-[#0a1628]">
          <div className="w-8 h-8 rounded-lg bg-[#818cf8]/10 border border-[#818cf8]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4fb8e8] mb-1.5">Valet says</p>
            <p className="text-sm text-[#f4f7fa] leading-relaxed italic">&ldquo;{scenario.claim}&rdquo;</p>
          </div>
        </div>

        {/* Gate checks */}
        <div className="px-6 py-5 border-b border-[rgba(168,216,240,0.07)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8d8f0]/30 mb-4">Gate running checks</p>
          <div className="flex flex-col gap-3.5">
            {scenario.checks.map((check, i) => {
              const state = checkStates[i];
              return (
                <div key={check} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {state === "pending" && <div className="w-3 h-3 rounded-full border border-[rgba(168,216,240,0.18)]" />}
                    {state === "running" && <Spinner />}
                    {state === "pass" && (
                      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                        <circle cx="10" cy="10" r="9" stroke="#46cf93" strokeWidth="1.5" />
                        <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#46cf93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {state === "fail" && (
                      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                        <circle cx="10" cy="10" r="9" stroke="#e74c3c" strokeWidth="1.5" />
                        <path d="M7 7l6 6M13 7l-6 6" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm flex-1 transition-colors duration-300 ${
                    state === "pending" ? "text-[#a8d8f0]/25" :
                    state === "running" ? "text-[#a8d8f0]/70" :
                    state === "pass" ? "text-[#f4f7fa]" :
                    "text-[#e74c3c]"
                  }`}>
                    {check}
                  </p>
                  {state === "pass" && (
                    <span className="text-[10px] font-bold text-[#46cf93] tracking-wider flex-shrink-0">✓</span>
                  )}
                  {state === "fail" && (
                    <span className="text-[10px] font-bold text-[#e74c3c] tracking-wide flex-shrink-0">✗ conflict found</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conflict detail — caught only, after done */}
        {phase === "done" && !isClean && (
          <div className="px-6 py-4 border-b border-[rgba(168,216,240,0.07)] bg-[#3a0a0a]/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e74c3c] mb-1.5">Conflict detected</p>
            <p className="text-sm text-[#f4f7fa]">{scenario.conflict}</p>
          </div>
        )}

        {/* Action / verdict */}
        <div className="px-6 py-5">
          {phase === "idle" && (
            <button
              onClick={runDemo}
              className="w-full py-3 rounded-xl bg-[#12243d] border border-[rgba(168,216,240,0.15)] text-[#a8d8f0] text-sm font-semibold hover:bg-[#1e3a5f] hover:text-[#f4f7fa] hover:border-[rgba(168,216,240,0.25)] transition-all duration-200"
            >
              Run the gate →
            </button>
          )}

          {phase === "running" && (
            <div className="flex items-center justify-center gap-2.5 py-3">
              <Spinner />
              <span className="text-sm text-[#a8d8f0]/50">Gate running…</span>
            </div>
          )}

          {phase === "done" && isClean && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5 bg-[#46cf93]/08 border border-[#46cf93]/30 rounded-xl px-5 py-4">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="#46cf93" strokeWidth="2" />
                  <path d="M8 12.5l3 3 5-6" stroke="#46cf93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-[#46cf93] tracking-widest">VERIFIED</p>
                  <p className="text-xs text-[#a8d8f0]/50 mt-0.5">
                    Gate ID {scenario.receipt?.gateId} · {scenario.receipt?.checks} checks · {scenario.receipt?.elapsed}
                  </p>
                </div>
              </div>
              <p className="text-sm text-center text-[#a8d8f0]">Reaches you — stamped 🔒</p>
              <div className="text-center">
                <button onClick={runDemo} className="text-xs text-[#a8d8f0]/35 hover:text-[#a8d8f0] transition-colors">
                  ↺ Replay
                </button>
              </div>
            </div>
          )}

          {phase === "done" && !isClean && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5 bg-[#e74c3c]/08 border border-[#e74c3c]/30 rounded-xl px-5 py-4">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2" />
                  <path d="M12 7v5.5M12 16.5v.5" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-[#e74c3c] tracking-widest">UNVERIFIED — HELD</p>
                  <p className="text-xs text-[#a8d8f0]/50 mt-0.5">1 check failed · claim not delivered</p>
                </div>
              </div>
              <p className="text-sm text-center text-[#a8d8f0]/80">
                Does <strong className="text-[#f4f7fa]">NOT</strong> reach you as done. Flagged, fail-closed.
              </p>
              <div className="text-center">
                <button onClick={runDemo} className="text-xs text-[#a8d8f0]/35 hover:text-[#a8d8f0] transition-colors">
                  ↺ Replay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
