'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MicroTitanMark from './MicroTitanMark';
import HeroV5, { ARM_SUBHEADS } from './HeroV5';

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
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, paused]);

  // Valet is "active" for both arm 0 and arm 1 (Business has no dedicated nav item)
  const activeNavId =
    armIndex === 0 || armIndex === 1 ? 'valet' :
    armIndex === 3 ? 'studio' :
    'pivot';

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
          {/* Mark + H1 */}
          <div className='flex flex-col items-center text-center mb-3 sm:mb-5'>
            <MicroTitanMark height={52} idPrefix='heroMark' className='mb-3 sm:mb-4' />
            <h1
              className='text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-[800] tracking-tight text-[#f4f7fa] leading-none mb-2 sm:mb-3'
              style={{ fontFamily: 'var(--font-mulish)' }}
            >
              Your system, your rules.
            </h1>

            {/* Cycling subheads: all four in DOM, one visible via opacity */}
            <div style={{ display: 'grid', gridTemplateAreas: '"s"', gridTemplateColumns: '1fr', minHeight: '1.6em' }}>
              {ARM_SUBHEADS.map((sub, i) => (
                <p
                  key={i}
                  className='text-[0.75rem] sm:text-base md:text-lg text-[#a8d8f0]/70 max-w-xl mx-auto leading-snug'
                  style={{
                    gridArea: 's',
                    opacity: i === armIndex ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    pointerEvents: i === armIndex ? 'auto' : 'none',
                    fontFamily: 'var(--font-mulish)',
                  }}
                  aria-hidden={i !== armIndex || undefined}
                >
                  {sub}
                </p>
              ))}
            </div>
          </div>

          {/* Hero diagram */}
          <HeroV5 armIndex={armIndex} />

          {/* Dot controls */}
          <div className='flex items-center justify-center gap-3 mt-4 sm:mt-6' role='group' aria-label='Hero section selector'>
            {['Valet', 'Business', 'Pivot', 'Studio'].map((label, i) => (
              <button
                key={i}
                onClick={() => { setArmIndex(i); setPaused(true); }}
                aria-label={`Show ${label} arm`}
                aria-pressed={armIndex === i}
                className='rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-1 focus:ring-offset-[#0a1628]'
                style={{
                  width: 8,
                  height: 8,
                  background: armIndex === i ? '#7c3aed' : 'rgba(168,216,240,0.25)',
                  transform: armIndex === i ? 'scale(1.5)' : 'scale(1)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUR PILLARS ────────────────────────────────────────────────── */}
      <section className='py-10 sm:py-16 px-4'>
        <div className='max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8'>
          {PILLARS.map((pillar, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <div
                className='text-[0.6rem] sm:text-[0.72rem] font-[700] tracking-[0.2em] uppercase text-[#a8d8f0]/40'
                style={{ fontFamily: 'var(--font-mulish)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
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
