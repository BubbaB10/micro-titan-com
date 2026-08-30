'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import HeroV5, { ARM_SUBHEADS, ArmStack, ARMS } from './HeroV5';

// ─── PILLAR DATA ───────────────────────────────────────────────────────────────

const PILLARS = [
  {
    title: 'One source of truth',
    body: 'Every number, every status, every commitment — pulled from the real thing, not a copy.',
    cta: null as null | { label: string; href: string },
  },
  {
    title: 'Verifiable, not just trustworthy',
    body: 'Every completion claim goes through a mechanical gate. You get a receipt, not a promise.',
    cta: { label: 'See the ledger', href: '/receipts' },
  },
  {
    title: 'Shows its work',
    body: 'You see what ran, what it found, and what it did. The agent is not a black box.',
    cta: null,
  },
  {
    title: 'Your rules, enforced',
    body: 'Behaviors, limits, and scope are set by you. The agent operates inside your envelope.',
    cta: null,
  },
];

// ─── ICON SVGs ─────────────────────────────────────────────────────────────────

function PersonIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <circle cx='12' cy='8' r='4' />
      <path d='M4 20c0-4 3.6-7 8-7s8 3 8 7' />
    </svg>
  );
}

function CodeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <polyline points='16 18 22 12 16 6' />
      <polyline points='8 6 2 12 8 18' />
    </svg>
  );
}

function CompassIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <circle cx='12' cy='12' r='10' />
      <polygon points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' />
    </svg>
  );
}

function InfoIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='16' x2='12' y2='12' />
      <line x1='12' y1='8' x2='12.01' y2='8' />
    </svg>
  );
}

function TagIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z' />
      <line x1='7' y1='7' x2='7.01' y2='7' />
    </svg>
  );
}

// ─── FEATURES (4-up block matching comp) ─────────────────────────────────────

function AgentIcon() {
  return (
    <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <circle cx='12' cy='8' r='3.5' />
      <path d='M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6' />
      <circle cx='18' cy='6' r='2' /><circle cx='6' cy='6' r='2' />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6L12 2z' />
      <polyline points='9 12 11 14 15 10' />
    </svg>
  );
}
function SlidersIcon() {
  return (
    <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <line x1='4' y1='6' x2='20' y2='6' /><line x1='4' y1='12' x2='20' y2='12' /><line x1='4' y1='18' x2='20' y2='18' />
      <circle cx='9' cy='6' r='2' fill='currentColor' stroke='none' />
      <circle cx='15' cy='12' r='2' fill='currentColor' stroke='none' />
      <circle cx='9' cy='18' r='2' fill='currentColor' stroke='none' />
    </svg>
  );
}
function ScreenIcon() {
  return (
    <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <rect x='2' y='4' width='20' height='14' rx='2' />
      <line x1='8' y1='22' x2='16' y2='22' /><line x1='12' y1='18' x2='12' y2='22' />
    </svg>
  );
}

const FEATURES = [
  { title: 'Smart Agents', body: 'Work in the background to get things done.', Icon: AgentIcon },
  { title: 'Verified & Secure', body: 'Checks, operates and built-in verification.', Icon: ShieldIcon },
  { title: 'Your Rules', body: 'You decide what and how it runs.', Icon: SlidersIcon },
  { title: 'One Clear Screen', body: 'Get back one system that proves itself.', Icon: ScreenIcon },
];

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number }>;
  href: string | null;
  armIndex: number | null;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'valet',   label: 'Valet',   Icon: PersonIcon,  href: null,       armIndex: 0 },
  { id: 'studio',  label: 'Studio',  Icon: CodeIcon,    href: null,       armIndex: 3 },
  { id: 'pivot',   label: 'Pivot',   Icon: CompassIcon, href: null,       armIndex: 2 },
  { id: 'about',   label: 'About',   Icon: InfoIcon,    href: '/about',   armIndex: null },
  { id: 'pricing', label: 'Pricing', Icon: TagIcon,     href: '/pricing', armIndex: null },
];

// ─── HOME PAGE CLIENT ─────────────────────────────────────────────────────────

// Arm dwell. ~730ms of each cycle is crossfade (ArmStack: 380ms swap delay + 0.35s fade),
// so the readable hold is DWELL_MS minus that. 5000 gave only ~4.3s and was too fast to read.
const ARM_DWELL_MS = 9000;

export default function HomePageClient() {
  const [armIndex, setArmIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => {
      setArmIndex(prev => (prev + 1) % 4);
    }, ARM_DWELL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, paused]);

  // Business arm shares the Valet nav item; all others derive from product field
  const activeNavId = ARMS[armIndex].product.toLowerCase();

  const itemStyle = (active: boolean) => ({
    color: active ? '#7c3aed' : 'rgba(168,216,240,0.38)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
  } as const);

  const innerContent = (item: NavItem, active: boolean) => (
    <div className='flex flex-col items-center gap-0.5 py-2.5 sm:py-3 px-2'>
      <item.Icon size={20} />
      <span
        className='text-[0.5rem] sm:text-[0.6rem] font-[600] tracking-wide uppercase'
        style={{ fontFamily: 'var(--font-mulish)' }}
      >
        {item.label}
      </span>
    </div>
  );

  return (
    <>
      {/* ── HERO SECTION ───────────────────────────────────────────────── */}
      <section
        className='relative px-2 sm:px-4 pt-20 sm:pt-24 lg:pt-28 pb-6 overflow-hidden'
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          aria-hidden='true'
          className='absolute inset-0 pointer-events-none'
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(109,40,217,0.12) 0%, transparent 70%)' }}
        />

        <div className='relative z-10 max-w-6xl mx-auto'>
          {/* H1 */}
          <div className='flex flex-col items-center text-center mb-3 sm:mb-5'>
            <h1
              className='font-[800] tracking-tight text-[#f4f7fa] leading-[1.05] mb-2 sm:mb-3'
              style={{ fontFamily: 'var(--font-mulish)', fontSize: 'clamp(2.4rem, 9vw, 4rem)' }}
            >
              <span className='block'>Your system,</span>
              <span className='block'>your rules.</span>
            </h1>

            {/* Cycling subheads: routed through ArmStack for sequential fade (same mechanism as hero diagram) */}
            <ArmStack
              armIndex={armIndex}
              reduced={reducedMotion}
              arms={ARM_SUBHEADS.map((sub, i) => (
                <p
                  key={i}
                  className='text-[0.75rem] sm:text-base md:text-lg text-[#a8d8f0]/70 max-w-xl mx-auto leading-snug'
                  style={{ fontFamily: 'var(--font-mulish)' }}
                >
                  {sub}
                </p>
              ))}
            />
          </div>

          {/* Hero diagram */}
          <HeroV5 armIndex={armIndex} reduced={reducedMotion} />

        </div>
      </section>

      {/* ── LOWER HERO BLOCK: 4-up features + CTAs (matches comp) ─────── */}
      <section className='px-4 pb-6 sm:pb-8'>
        <div className='max-w-2xl mx-auto'>
          {/* 4-up grid */}
          <div
            className='grid grid-cols-4 gap-0 mb-6 sm:mb-8'
            style={{
              border: '1px solid rgba(30,58,95,0.5)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className='flex flex-col items-center text-center gap-1.5 sm:gap-2 py-4 sm:py-5 px-2'
                style={{
                  borderRight: i < 3 ? '1px solid rgba(30,58,95,0.5)' : 'none',
                  background: 'rgba(6,11,24,0.6)',
                }}
              >
                <div className='text-[#a8d8f0]/60' style={{ color: '#a8d8f0' }}>
                  <feat.Icon />
                </div>
                <div
                  className='text-[0.42rem] sm:text-[0.55rem] font-[700] text-[#f4f7fa] leading-tight'
                  style={{ fontFamily: 'var(--font-mulish)' }}
                >
                  {feat.title}
                </div>
                <p
                  className='text-[0.34rem] sm:text-[0.44rem] text-[#a8d8f0]/55 leading-snug'
                  style={{ fontFamily: 'var(--font-mulish)' }}
                >
                  {feat.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className='flex flex-col items-center gap-2.5'>
            <Link
              href='https://download.micro-titan.com'
              className='flex items-center justify-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg text-xs sm:text-sm font-[700] text-[#a8d8f0] transition-all duration-200 hover:bg-[rgba(168,216,240,0.08)] hover:border-[#a8d8f0]/60'
              style={{
                border: '1px solid rgba(168,216,240,0.35)',
                fontFamily: 'var(--font-mulish)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              See Valet in action <span aria-hidden='true'>→</span>
            </Link>
            <Link
              href='/receipts'
              className='text-[0.6rem] sm:text-[0.72rem] font-[600] text-[#a8d8f0]/45 hover:text-[#a8d8f0]/70 transition-colors tracking-widest uppercase'
              style={{ fontFamily: 'var(--font-mulish)' }}
            >
              Explore the cockpit ⊙
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOUR PILLARS ────────────────────────────────────────────────── */}
      <section className='py-10 sm:py-16 px-4'>
        <div className='max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8'>
          {PILLARS.map((pillar, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <h3
                className='text-xs sm:text-sm md:text-base font-[700] text-[#f4f7fa] leading-snug'
                style={{ fontFamily: 'var(--font-mulish)' }}
              >
                {pillar.title}
              </h3>
              <p
                className='text-[0.6rem] sm:text-xs md:text-sm text-[#a8d8f0]/60 leading-relaxed'
                style={{ fontFamily: 'var(--font-mulish)' }}
              >
                {pillar.body}
              </p>
              {pillar.cta && (
                <Link
                  href={pillar.cta.href}
                  className='text-[0.6rem] sm:text-xs text-[#7c3aed] hover:text-[#a855f7] font-[600] transition-colors mt-auto'
                  style={{ fontFamily: 'var(--font-mulish)' }}
                >
                  {pillar.cta.label} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className='py-8 sm:py-12 px-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <Link
            href='https://download.micro-titan.com'
            className='inline-block px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg text-sm sm:text-base font-[700] text-white transition-all duration-200 hover:opacity-90'
            style={{
              background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
              boxShadow: '0 4px 16px rgba(109,40,217,0.35)',
              fontFamily: 'var(--font-mulish)',
            }}
          >
            Meet your Valet →
          </Link>
        </div>
      </section>

      {/* ── ICON NAV BAR (replaces Footer on homepage) ──────────────────── */}
      <nav
        aria-label='Main navigation'
        style={{
          background: 'rgba(6,11,24,0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(30,58,95,0.5)',
        }}
      >
        <div className='max-w-sm mx-auto'>
          <div className='flex items-stretch justify-around'>
            {NAV_ITEMS.map(item => {
              const active = item.id === activeNavId;
              if (item.armIndex !== null) {
                return (
                  <button
                    key={item.id}
                    onClick={() => { setArmIndex(item.armIndex as number); setPaused(true); }}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className='flex-1 flex justify-center transition-colors duration-200'
                    style={itemStyle(active)}
                  >
                    {innerContent(item, active)}
                  </button>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.href as string}
                  className='flex-1 flex justify-center transition-colors duration-200'
                  style={itemStyle(false)}
                  aria-label={item.label}
                >
                  {innerContent(item, false)}
                </Link>
              );
            })}
          </div>

          {/* Legal line */}
          <div
            className='flex items-center justify-center gap-3 py-1.5 border-t text-[0.42rem] sm:text-[0.52rem] text-[#a8d8f0]/22'
            style={{
              borderColor: 'rgba(30,58,95,0.35)',
              fontFamily: 'var(--font-mulish)',
            }}
          >
            <span>© 2026 Micro Titan LLC</span>
            <Link href='/terms' className='hover:text-[#a8d8f0]/50 transition-colors'>Terms</Link>
            <Link href='/privacy' className='hover:text-[#a8d8f0]/50 transition-colors'>Privacy</Link>
          </div>
        </div>
      </nav>
    </>
  );
}
