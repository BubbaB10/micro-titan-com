'use client';

import { useEffect, useRef, useState } from 'react';

type Step = 'message' | 'card' | 'tapped' | 'receipts' | 'verdict';

const MSG = 'John wants to play golf Friday at 10';
const LOOP_MS = 14_000;

const RECEIPTS = [
  { label: 'Reply sent', sub: '"Sounds great — see you Friday."' },
  { label: 'Calendar hold', sub: 'Fri 10:00am · Golf with John' },
  { label: 'Receipt logged', sub: 'Visible · verified · done' },
];

export default function HeroDemoSequence() {
  const [step, setStep] = useState<Step>('message');
  const [chars, setChars] = useState(0);
  const [receiptCount, setReceiptCount] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) {
      setStep('verdict');
      setChars(MSG.length);
      setReceiptCount(3);
      return;
    }
    run();
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function push(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  function run() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStep('message');
    setChars(0);
    setReceiptCount(0);

    // Typewriter: MSG.length * 42ms ≈ 1.55s total
    for (let i = 1; i <= MSG.length; i++) {
      push(() => setChars(i), i * 42);
    }

    push(() => setStep('card'),     1_900);
    push(() => setStep('tapped'),   3_500);
    push(() => { setStep('receipts'); setReceiptCount(1); }, 4_700);
    push(() => setReceiptCount(2),  5_600);
    push(() => setReceiptCount(3),  6_500);
    push(() => setStep('verdict'),  8_000);
    push(run, LOOP_MS);
  }

  const showChat     = step === 'message' || step === 'card' || step === 'tapped';
  const showCard     = step === 'card'    || step === 'tapped';
  const tapYes       = step === 'tapped';
  const showReceipts = step === 'receipts' || step === 'verdict';
  const showVerdict  = step === 'verdict';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: -50,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(12,163,12,0.18) 0%, rgba(37,99,235,0.08) 45%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      {/* Phone bezel */}
      <div style={{
        background: '#050c1a',
        border: '7px solid #142038',
        borderRadius: 36,
        boxShadow: '0 40px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Notch */}
        <div style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050c1a' }}>
          <div style={{ width: 60, height: 5, borderRadius: 3, background: '#142038' }} />
        </div>

        {/* Screen */}
        <div style={{ padding: '10px 14px 22px', position: 'relative', minHeight: 420 }}>

          {/* Masthead */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(168,216,240,0.4)', letterSpacing: '0.2em' }}>COCKPIT</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#0ca30c',
                boxShadow: showVerdict ? '0 0 7px rgba(12,163,12,0.9)' : '0 0 4px rgba(12,163,12,0.5)',
                transition: 'box-shadow 0.6s ease',
              }} />
              <span style={{ fontSize: 7.5, color: 'rgba(168,216,240,0.4)' }}>live</span>
            </div>
          </div>

          {/* Chat group — fades out when receipts appear */}
          <div style={{
            position: 'absolute', top: 46, left: 14, right: 14,
            opacity: showChat ? 1 : 0,
            transition: 'opacity 0.45s ease',
            pointerEvents: 'none',
          }}>
            {/* Incoming message */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 12 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: '#1e3a5f', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(168,216,240,0.8)' }}>J</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 8, color: 'rgba(168,216,240,0.45)', marginBottom: 3 }}>John · just now</div>
                <div style={{
                  background: '#0f1f38',
                  border: '1px solid rgba(168,216,240,0.12)',
                  borderRadius: '4px 10px 10px 10px',
                  padding: '7px 9px',
                  fontSize: 11,
                  color: '#f4f7fa',
                  lineHeight: 1.45,
                  minHeight: 32,
                }}>
                  {MSG.slice(0, chars)}
                  {step === 'message' && chars < MSG.length && (
                    <span style={{
                      display: 'inline-block', width: 1.5, height: 10, background: '#a8d8f0',
                      marginLeft: 1, verticalAlign: 'middle',
                      animation: 'cursor-blink 0.75s step-end infinite',
                    }} />
                  )}
                </div>
              </div>
            </div>

            {/* Decision card */}
            <div style={{
              background: '#0a1628',
              border: '1px solid rgba(168,216,240,0.16)',
              borderRadius: 11,
              padding: '9px 11px',
              opacity: showCard ? 1 : 0,
              transform: showCard ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
              <div style={{ fontSize: 8.5, color: 'rgba(168,216,240,0.5)', marginBottom: 8 }}>
                Golf Friday at 10 — how do you want to reply?
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {[
                  { label: 'Yes',   tapThis: true },
                  { label: 'No',    tapThis: false },
                  { label: 'Maybe', tapThis: false },
                ].map(({ label, tapThis }) => {
                  const active = tapThis && tapYes;
                  return (
                    <div key={label} style={{
                      flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 600,
                      padding: '5px 0', borderRadius: 7,
                      background: active
                        ? 'rgba(12,163,12,0.28)'
                        : tapThis ? 'rgba(12,163,12,0.1)' : 'rgba(129,140,248,0.06)',
                      border: active
                        ? '1px solid rgba(12,163,12,0.65)'
                        : tapThis ? '1px solid rgba(12,163,12,0.3)' : '1px solid rgba(129,140,248,0.16)',
                      color: active ? '#46cf93' : tapThis ? 'rgba(12,163,12,0.8)' : 'rgba(168,216,240,0.55)',
                      boxShadow: active ? '0 0 10px rgba(12,163,12,0.35)' : 'none',
                      transform: active ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                    }}>
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Receipts group — fades in when chat fades out */}
          <div style={{
            position: 'absolute', top: 46, left: 14, right: 14,
            opacity: showReceipts ? 1 : 0,
            transition: 'opacity 0.45s ease',
            pointerEvents: 'none',
          }}>
            {RECEIPTS.map(({ label, sub }, i) => {
              const visible = receiptCount > i;
              return (
                <div key={label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 7,
                  padding: '6px 9px', marginBottom: 5,
                  background: '#060f1e',
                  border: '1px solid rgba(12,163,12,0.16)',
                  borderLeft: '2px solid rgba(12,163,12,0.5)',
                  borderRadius: 7,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `opacity 0.38s ease ${i * 0.12}s, transform 0.38s ease ${i * 0.12}s`,
                }}>
                  <span style={{ color: '#0ca30c', fontSize: 9, marginTop: 2, flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#f4f7fa' }}>{label}</div>
                    <div style={{ fontSize: 8, color: 'rgba(168,216,240,0.5)', marginTop: 1.5 }}>{sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verdict bar — always present, brightens at final step */}
          <div style={{
            position: 'absolute', bottom: 28, left: 14, right: 14,
            background: showVerdict ? 'rgba(12,163,12,0.12)' : 'rgba(12,163,12,0.04)',
            border: showVerdict ? '1px solid rgba(12,163,12,0.5)' : '1px solid rgba(12,163,12,0.14)',
            borderRadius: 9,
            padding: '7px 11px',
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'background 0.8s ease, border-color 0.8s ease',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#0ca30c', flexShrink: 0,
              boxShadow: showVerdict ? '0 0 9px rgba(12,163,12,0.9)' : 'none',
              transition: 'box-shadow 0.8s ease',
            }} />
            <span style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.09em',
              color: showVerdict ? '#46cf93' : 'rgba(12,163,12,0.4)',
              transition: 'color 0.8s ease',
            }}>ALL CLEAR</span>
            <span style={{ marginLeft: 'auto', fontSize: 8, color: 'rgba(168,216,240,0.38)' }}>0 need you</span>
          </div>

          {/* Pulse bar */}
          <div style={{
            position: 'absolute', bottom: 15, left: 14, right: 14,
            height: 2, borderRadius: 1,
            background: 'linear-gradient(90deg, transparent, rgba(12,163,12,0.5), transparent)',
            animation: 'pulse-bar 2.8s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
