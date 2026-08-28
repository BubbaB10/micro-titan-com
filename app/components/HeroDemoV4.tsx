'use client';

import { useEffect, useRef, useState } from 'react';
import RouterFlow from './RouterFlow';

type Phase = 'router' | 'decision' | 'results';
const PHASE_MS = 5000;

export default function HeroDemoV4() {
  const [phase, setPhase] = useState<Phase>('router');
  const [tapped, setTapped] = useState(false);
  const [receipts, setReceipts] = useState<string[]>([]);
  const [cockpitClear, setCockpitClear] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // Static frame: cockpit ALL CLEAR
      setPhase('results');
      setReceipts(['Calendar hold created', 'Reply sent']);
      setCockpitClear(true);
      return;
    }

    let idx = 0;
    const phases: Phase[] = ['router', 'decision', 'results'];

    function clear() { timers.current.forEach(clearTimeout); timers.current = []; }
    function push(fn: () => void, ms: number) { timers.current.push(setTimeout(fn, ms)); }

    function runPhase(p: Phase) {
      clear();
      setPhase(p);
      setTapped(false);
      setReceipts([]);
      setCockpitClear(false);

      if (p === 'decision') {
        push(() => setTapped(true), 2600);
      }
      if (p === 'results') {
        push(() => setReceipts(['Calendar hold created']), 1000);
        push(() => setReceipts(['Calendar hold created', 'Reply sent']), 2200);
        push(() => setCockpitClear(true), 3200);
      }
    }

    runPhase(phases[0]);
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % phases.length;
      runPhase(phases[idx]);
    }, PHASE_MS);

    return () => {
      clear();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="w-full select-none">
      {/* Progress pips */}
      <div className="flex gap-1.5 justify-center mb-5">
        {(['router', 'decision', 'results'] as Phase[]).map((p) => (
          <div
            key={p}
            className="h-0.5 rounded-full transition-all duration-500"
            style={{
              width: phase === p ? 20 : 6,
              backgroundColor: phase === p ? 'rgba(168,216,240,0.55)' : 'rgba(168,216,240,0.15)',
            }}
          />
        ))}
      </div>

      {/* Panels container — fixed min-height so layout doesn't shift */}
      <div className="relative min-h-[220px] flex items-start justify-center">

        {/* Phase 1 — RouterFlow */}
        <div
          className="absolute inset-0 transition-opacity duration-700 flex items-center"
          style={{ opacity: phase === 'router' ? 1 : 0, pointerEvents: 'none' }}
          aria-hidden={phase !== 'router'}
        >
          <div className="w-full">
            <RouterFlow />
          </div>
        </div>

        {/* Phase 2 — Decision card */}
        <div
          className="absolute inset-0 transition-opacity duration-700 flex items-center justify-center"
          style={{ opacity: phase === 'decision' ? 1 : 0, pointerEvents: 'none' }}
          aria-hidden={phase !== 'decision'}
        >
          <div className="bg-[#0f1f38] border border-[rgba(168,216,240,0.14)] rounded-2xl p-5 w-full max-w-[320px] shadow-2xl">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#4fb8e8]/60 uppercase mb-3">Your call</p>
            <p className="text-sm text-[#f4f7fa] font-medium leading-snug mb-2">
              John wants to golf Saturday — conflicts with family dinner.
            </p>
            <p className="text-xs text-[#a8d8f0]/40 mb-5 leading-snug">
              Agent draft: "Can we move to Sunday?"
            </p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 text-sm font-semibold py-2.5 rounded-xl transition-all duration-500"
                style={{
                  backgroundColor: tapped ? '#0ca30c' : '#2563eb',
                  color: '#fff',
                  boxShadow: tapped ? '0 0 16px rgba(12,163,12,0.35)' : undefined,
                  transform: tapped ? 'scale(0.97)' : undefined,
                }}
              >
                {tapped ? '✓ Sent' : 'Send it'}
              </button>
              <button className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-[#060e1a] text-[#a8d8f0]/40 border border-[rgba(168,216,240,0.08)]">
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Phase 3 — Cockpit verdict + receipts */}
        <div
          className="absolute inset-0 transition-opacity duration-700 flex items-center justify-center"
          style={{ opacity: phase === 'results' ? 1 : 0, pointerEvents: 'none' }}
          aria-hidden={phase !== 'results'}
        >
          <div className="w-full max-w-[320px] space-y-2.5">
            {/* Cockpit card */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl transition-all duration-700"
              style={{
                background: '#071628',
                border: `1px solid ${cockpitClear ? 'rgba(12,163,12,0.45)' : 'rgba(168,216,240,0.1)'}`,
              }}
            >
              <div
                className="h-1 transition-all duration-700"
                style={{ backgroundColor: cockpitClear ? '#0ca30c' : 'rgba(168,216,240,0.08)' }}
              />
              <div className="px-4 py-3 flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-700"
                  style={{
                    backgroundColor: cockpitClear ? '#0ca30c' : '#475569',
                    boxShadow: cockpitClear ? '0 0 8px rgba(12,163,12,0.7)' : undefined,
                  }}
                />
                <div>
                  <p
                    className="text-sm font-[800] tracking-wide transition-colors duration-700"
                    style={{ color: cockpitClear ? '#0ca30c' : '#64748b', fontFamily: 'system-ui, sans-serif' }}
                  >
                    {cockpitClear ? 'ALL CLEAR' : 'UNKNOWN'}
                  </p>
                  <p className="text-[10px] text-[#a8d8f0]/35 transition-all duration-700">
                    {cockpitClear ? '0 need you · 2 handled' : 'checking…'}
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt lines */}
            {receipts.map((r) => (
              <div
                key={r}
                className="flex items-center gap-2 bg-[#060e1a] border border-[rgba(12,163,12,0.2)] rounded-xl px-3.5 py-2.5"
              >
                <span className="text-[#0ca30c] text-xs">✓</span>
                <span className="text-xs text-[#46cf93]">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-5 text-center text-[11px] text-[#a8d8f0]/30 h-4 transition-all duration-500">
        {phase === 'decision' && 'One tap. Done.'}
        {phase === 'results' && 'Everything logged. Nothing slips.'}
      </p>
    </div>
  );
}
