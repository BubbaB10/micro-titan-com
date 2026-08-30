'use client';

// Three-column hero diagram: tangle (left) → phone (center) → right column
// Annotations are sentence-case in DOM; text-transform:uppercase handles the visual caps look.
// All four arms live in the DOM at once (ArmStack). Three columns NEVER stack on mobile.

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRef, useEffect, useState, useCallback } from 'react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TangleItem = { icon: string; source: string; content: string; time: string; rotate: number };
type HandledItem = { text: string; time: string };
type NeedsYouItem = { icon: string; label: string; sub: string; time: string };
type RightItem = { icon: string; name: string; status: string };

type ArmData = {
  id: string;
  tangle: TangleItem[];
  greetingLabel: string;
  greetingName: string;
  greetingStatus: string;
  verdictMain: string;
  verdictSub: string;
  handled: HandledItem[];
  needsYou: NeedsYouItem[];
  rightType: 'domains' | 'modules';
  right: RightItem[];
};

// ─── ARM DATA ─────────────────────────────────────────────────────────────────

const ARMS: ArmData[] = [
  {
    id: 'valet',
    tangle: [
      { icon: '\u{1F4AC}', source: 'Text', content: 'Dana — running late for the walkthrough', time: '12:47 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Marcus — re: Thursday site visit', time: '11:32 AM', rotate: 1 },
      { icon: '⚡', source: 'Bill', content: 'City Utilities — $186.40, due Sep 9', time: '10:18 AM', rotate: -0.8 },
      { icon: '\u{1F4C5}', source: 'Calendar', content: 'Dentist — Thursday, 8:30 AM', time: '9:41 AM', rotate: 1.2 },
      { icon: '\u{1F4DD}', source: 'Note', content: 'Reorder filters for the shop', time: '9:02 AM', rotate: -1 },
      { icon: '\u{1F9FE}', source: 'Receipt', content: 'Delta Supply — $64.20', time: 'yesterday', rotate: 0.5 },
    ],
    greetingLabel: 'Good afternoon,',
    greetingName: 'Jordan',
    greetingStatus: '● System online',
    verdictMain: 'Everything’s handled.',
    verdictSub: '2 things need you.',
    handled: [
      { text: 'Water bill paid', time: '12:18 PM' },
      { text: 'Dentist appointment confirmed', time: '11:47 AM' },
      { text: 'Trailer registration renewed', time: '10:33 AM' },
      { text: 'Thursday walkthrough moved to 9:00', time: '9:58 AM' },
      { text: 'Invoice from Delta Supply filed', time: '9:21 AM' },
      { text: 'Filters reordered for the shop', time: '8:42 AM' },
    ],
    needsYou: [
      { icon: '$', label: 'Approve $890', sub: 'Materials order from Delta Supply', time: '12:18' },
      { icon: '◑', label: 'Reply to Marcus about Thursday', sub: 'Re: Site visit at 2:00 PM', time: '11:32' },
    ],
    rightType: 'domains',
    right: [
      { icon: '\u{1F3E0}', name: 'The House', status: 'All set' },
      { icon: '\u{1F4B0}', name: 'Money', status: 'On track' },
      { icon: '\u{1F467}', name: 'The Kids', status: 'Everything good' },
      { icon: '\u{1F4C6}', name: 'Schedule', status: 'Locked in' },
      { icon: '\u{1F697}', name: 'Vehicles', status: 'All good' },
    ],
  },
  {
    id: 'business',
    tangle: [
      { icon: '\u{1F4AC}', source: 'Text', content: 'Ray — can you quote the Fulton job?', time: '1:04 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Accounts payable — Invoice #2214 is 30 days out', time: '11:50 AM', rotate: 1 },
      { icon: '⚡', source: 'Bill', content: 'Fleet insurance — $612.00, due Sep 12', time: '10:22 AM', rotate: -0.8 },
      { icon: '\u{1F4C5}', source: 'Calendar', content: 'Crew scheduling — Monday, 6:30 AM', time: '9:35 AM', rotate: 1.2 },
      { icon: '\u{1F4DD}', source: 'Note', content: 'Reorder shop consumables before Fulton', time: '9:10 AM', rotate: -1 },
      { icon: '\u{1F9FE}', source: 'Receipt', content: 'Fastener supply — $211.80', time: 'yesterday', rotate: 0.5 },
    ],
    greetingLabel: 'Good afternoon,',
    greetingName: 'Ray',
    greetingStatus: '● System online',
    verdictMain: 'Everything’s handled.',
    verdictSub: '2 things need you.',
    handled: [
      { text: 'Invoice #2214 chased', time: '1:12 PM' },
      { text: 'Fulton quote drafted', time: '12:40 PM' },
      { text: 'Crew confirmed for Monday', time: '11:15 AM' },
      { text: 'Fleet insurance scheduled', time: '10:31 AM' },
      { text: 'Consumables reordered', time: '9:48 AM' },
      { text: 'Timesheets filed', time: '8:20 AM' },
    ],
    needsYou: [
      { icon: '$', label: 'Approve $4,180', sub: 'Fulton material order', time: '1:04' },
      { icon: '◑', label: 'Reply to Ray with the quote', sub: 'Re: Fulton job estimate', time: '12:40' },
    ],
    rightType: 'domains',
    right: [
      { icon: '\u{1F465}', name: 'Customers', status: 'All current' },
      { icon: '\u{1F4B5}', name: 'Cash Flow', status: 'On track' },
      { icon: '\u{1F477}', name: 'The Crew', status: 'Fully staffed' },
      { icon: '\u{1F528}', name: 'Jobs', status: '3 running' },
      { icon: '\u{1F4E6}', name: 'Suppliers', status: 'All paid' },
    ],
  },
  {
    id: 'pivot',
    tangle: [
      { icon: '\u{1F4AC}', source: 'Text', content: 'Nora — did you hear back about the interview?', time: '2:15 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Course platform — Module 4 unlocks Friday', time: '12:05 PM', rotate: 1 },
      { icon: '\u{1F514}', source: 'Reminder', content: 'Certification renewal opens Sep 15', time: '11:20 AM', rotate: -0.8 },
      { icon: '\u{1F4C5}', source: 'Calendar', content: 'Informational call — Wednesday, 4:00 PM', time: '10:05 AM', rotate: 1.2 },
      { icon: '\u{1F4DD}', source: 'Note', content: 'Ask Marcus who runs hiring at the co-op', time: '9:30 AM', rotate: -1 },
      { icon: '\u{1F516}', source: 'Saved', content: 'Three roles worth a closer look', time: 'yesterday', rotate: 0.5 },
    ],
    greetingLabel: 'Good afternoon,',
    greetingName: 'Nora',
    greetingStatus: '● System online',
    verdictMain: 'Everything’s handled.',
    verdictSub: '2 things need you.',
    handled: [
      { text: 'Module 3 finished', time: '2:02 PM' },
      { text: 'Interview follow-up sent', time: '1:15 PM' },
      { text: 'Wednesday call confirmed', time: '11:40 AM' },
      { text: 'Certification window flagged', time: '10:50 AM' },
      { text: 'Two roles filed, one dropped', time: '9:55 AM' },
      { text: 'Portfolio page updated', time: '8:35 AM' },
    ],
    needsYou: [
      { icon: '◑', label: 'Reply to the co-op about Wednesday', sub: 'Informational call follow-up', time: '11:40' },
      { icon: '✓', label: 'Pick which two roles to pursue', sub: 'Shortlist from saved roles', time: '9:55' },
    ],
    rightType: 'domains',
    right: [
      { icon: '\u{1F3AF}', name: 'Skills', status: '2 in progress' },
      { icon: '\u{1F4CE}', name: 'Applications', status: '4 out' },
      { icon: '\u{1F4D6}', name: 'Learning', status: 'Module 4 Friday' },
      { icon: '\u{1F91D}', name: 'Network', status: '3 new' },
      { icon: '➡️', name: 'Next Step', status: 'Ready' },
    ],
  },
  {
    id: 'studio',
    tangle: [
      { icon: '\u{1F4CA}', source: 'Spreadsheet', content: 'Orders_FINAL_v7.xlsx — 3 people editing', time: '11:52 AM', rotate: -1.5 },
      { icon: '\u{1F4C4}', source: 'Paper', content: 'Job tickets in a clipboard by the door', time: '10:40 AM', rotate: 1 },
      { icon: '\u{1F4AC}', source: 'Text thread', content: 'Scheduling, in a group chat, since 2023', time: '10:05 AM', rotate: -0.8 },
      { icon: '\u{1F4DD}', source: 'Whiteboard', content: 'Crew board — photographed daily', time: '9:30 AM', rotate: 1.2 },
      { icon: '\u{1F5A5}️', source: 'Legacy tool', content: 'Quoting software nobody has the login for', time: '9:02 AM', rotate: -1 },
      { icon: '\u{1F4CC}', source: 'Sticky notes', content: 'Callbacks, on the monitor', time: 'yesterday', rotate: 0.5 },
    ],
    greetingLabel: '',
    greetingName: 'Fulton Operations',
    greetingStatus: '● Gate verified',
    verdictMain: 'Built, proved, delivered.',
    verdictSub: '2 things need you.',
    handled: [
      { text: 'Orders → one source of truth', time: 'stage 04' },
      { text: 'Job tickets → digital, searchable', time: 'stage 04' },
      { text: 'Scheduling → crew board in-app', time: 'stage 03' },
      { text: 'Quoting → rebuilt, owned by you', time: 'stage 03' },
      { text: 'Callbacks → tracked, nothing lost', time: 'stage 02' },
      { text: 'Data model + gate envelope signed off', time: 'stage 02' },
    ],
    needsYou: [
      { icon: '◑', label: 'Approve the hand-off checklist', sub: 'Four stages complete', time: 'stage 04' },
      { icon: '✓', label: 'Choose who gets admin on day one', sub: 'Access provisioning ready', time: 'stage 04' },
    ],
    rightType: 'modules',
    right: [
      { icon: '✓', name: 'Orders', status: 'PASS' },
      { icon: '✓', name: 'Scheduling', status: 'PASS' },
      { icon: '✓', name: 'Quoting', status: 'PASS' },
      { icon: '✓', name: 'Reporting', status: 'PASS' },
      { icon: '✓', name: 'Hand-off', status: 'PASS' },
    ],
  },
];

export const ARM_SUBHEADS: string[] = [
  'Give Valet the mess. Get back your life, organized.',
  'Give it the back office. Get back to the work you actually do.',
  'Give it the noise. Get a clear next step.',
  'Give us the mess you run on. Get back one system that proves itself.',
];

// ─── COLORS ───────────────────────────────────────────────────────────────────

// Hue per tangle card slot (index 0-5): cyan / violet / red / blue / amber / teal
const TANGLE_COLORS = ['#22d3ee', '#a78bfa', '#f87171', '#60a5fa', '#fbbf24', '#34d399'];
// Hue per domain card slot (index 0-4): blue / green / violet / amber / red
const DOMAIN_COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f87171'];

// Portrait ribbon strand node positions (fraction of image height, 941×1672).
// Six left strands enter cards on the left; five right strands terminate on the right.
const LEFT_NODES  = [0.15, 0.29, 0.44, 0.57, 0.70, 0.83];
const RIGHT_NODES = [0.32, 0.42, 0.50, 0.58, 0.67];

// ─── CURVE COMPUTATION (DOM-measured bezier connector lines) ─────────────────

type CurveSet = {
  leftCurves: Array<{ d: string; color: string }>;
  rightCurves: Array<{ d: string; color: string }>;
  leftNodes: Array<{ cx: number; cy: number; color: string }>;
  rightNodes: Array<{ cx: number; cy: number; color: string }>;
  w: number;
  h: number;
};

function computeCurves(
  grid: HTMLElement,
  tangleEls: Element[],
  phoneEl: Element,
  domainEls: Element[],
): CurveSet | null {
  const gr = grid.getBoundingClientRect();
  if (gr.width < 1 || tangleEls.length === 0 || domainEls.length === 0) return null;

  const toL = (r: DOMRect) => ({
    left: r.left - gr.left,
    right: r.right - gr.left,
    centerY: (r.top + r.bottom) / 2 - gr.top,
  });

  const phRect = phoneEl.getBoundingClientRect();
  const ph = toL(phRect);
  const phH = phRect.height;
  const phCY = ph.centerY;

  const tang = tangleEls.map(el => toL(el.getBoundingClientRect()));
  const dom = domainEls.map(el => toL(el.getBoundingClientRect()));

  // Entry Y on phone left — shuffled so strands cross each other on the way in
  const SHUFFLE = [0.58, -0.42, 0.22, -0.22, 0.08, -0.58];
  const entryY = SHUFFLE.slice(0, tang.length).map(f => phCY + f * phH * 0.40);

  // Exit Y on phone right — orderly fan, no crossing
  const exitY = dom.map((_, i) => {
    const t = dom.length > 1 ? i / (dom.length - 1) : 0.5;
    return phCY + (t - 0.5) * phH * 0.45;
  });

  // Left curves: each strand leaves its card, converges toward phone-center Y
  // (crossing strands that go the opposite direction), then fans to its entry Y.
  // CP1 pulls all strands toward the phone's vertical midpoint — this guarantees
  // visible crossing because cards above center map to entry points below center
  // (SHUFFLE is inverted) and vice versa.
  const leftCurves = tang.map((t, i) => {
    const x0 = t.right, y0 = t.centerY;
    const x1 = ph.left, y1 = entryY[i];
    const dx = Math.max(x1 - x0, 1);
    // CP1: 40% across, 75% of the way from source Y toward phone center Y
    const cp1x = x0 + dx * 0.40;
    const cp1y = y0 + (phCY - y0) * 0.75;
    // CP2: 80% across, approaching individual entry Y
    const cp2x = x0 + dx * 0.80;
    const cp2y = y1;
    return {
      d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      color: TANGLE_COLORS[i % TANGLE_COLORS.length],
    };
  });

  // Right side: symmetric S-curves, non-crossing, orderly fan
  const rightCurves = dom.map((d, i) => {
    const x0 = ph.right, y0 = exitY[i];
    const x1 = d.left, y1 = d.centerY;
    const span = Math.max(x1 - x0, 20);
    const cp1x = x0 + span * 0.35;
    const cp2x = x1 - span * 0.35;
    return {
      d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${cp1x.toFixed(1)} ${y0.toFixed(1)} ${cp2x.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      color: DOMAIN_COLORS[i % DOMAIN_COLORS.length],
    };
  });

  const leftNodes = tang.map((t, i) => ({ cx: t.right, cy: t.centerY, color: TANGLE_COLORS[i % TANGLE_COLORS.length] }));
  const rightNodes = dom.map((d, i) => ({ cx: d.left, cy: d.centerY, color: DOMAIN_COLORS[i % DOMAIN_COLORS.length] }));

  return { leftCurves, rightCurves, leftNodes, rightNodes, w: gr.width, h: gr.height };
}

// ─── ARMSTACK ─────────────────────────────────────────────────────────────────
// All arms live in the DOM at once. Only one is visible (opacity). This means
// gate anchors are always present regardless of which arm is showing.

// ─── PORTRAIT COLUMN STACK ────────────────────────────────────────────────────
// Same sequential-fade logic as ArmStack, but uses absolute stacking instead of
// CSS grid so that each arm can fill a height-100% container and position its
// cards with percentage top values matching the ribbon's strand node fractions.

function PortraitColumnStack({
  armIndex,
  arms,
  reduced = false,
}: {
  armIndex: number;
  arms: ReactNode[];
  reduced?: boolean;
}) {
  const [showing, setShowing] = useState(armIndex);
  const [visible, setVisible] = useState(true);
  const showingRef = useRef<number>(armIndex);

  useEffect(() => {
    if (armIndex === showingRef.current) return;
    if (reduced) {
      showingRef.current = armIndex;
      setShowing(armIndex);
      setVisible(true);
      return;
    }
    setVisible(false);
    const timer = setTimeout(() => {
      showingRef.current = armIndex;
      setShowing(armIndex);
      setVisible(true);
    }, 380);
    return () => clearTimeout(timer);
  }, [armIndex, reduced]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {arms.map((arm, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === showing ? (visible ? 1 : 0) : 0,
            transition: reduced ? 'none' : 'opacity 0.35s ease-in-out',
            pointerEvents: i === showing && visible ? 'auto' : 'none',
          }}
          aria-hidden={i !== showing || undefined}
        >
          {arm}
        </div>
      ))}
    </div>
  );
}

// ─── ARMSTACK ─────────────────────────────────────────────────────────────────
// All arms live in the DOM at once. Only one is visible (opacity). This means
// gate anchors are always present regardless of which arm is showing.

// Sequential fade: outgoing fades out fully before incoming fades in.
// This prevents both arms being legible at once during transitions.
export function ArmStack({ armIndex, arms, reduced = false }: { armIndex: number; arms: ReactNode[]; reduced?: boolean }) {
  const [showing, setShowing] = useState(armIndex);
  const [visible, setVisible] = useState(true);
  const showingRef = useRef<number>(armIndex);

  useEffect(() => {
    if (armIndex === showingRef.current) return;
    if (reduced) {
      showingRef.current = armIndex;
      setShowing(armIndex);
      setVisible(true);
      return;
    }
    setVisible(false);
    const timer = setTimeout(() => {
      showingRef.current = armIndex;
      setShowing(armIndex);
      setVisible(true);
    }, 380);
    return () => clearTimeout(timer);
  }, [armIndex, reduced]);

  return (
    <div style={{ display: 'grid', gridTemplateAreas: '"s"', gridTemplateColumns: '1fr' }}>
      {arms.map((arm, i) => (
        <div
          key={i}
          style={{
            gridArea: 's',
            opacity: i === showing ? (visible ? 1 : 0) : 0,
            transition: reduced ? 'none' : 'opacity 0.35s ease-in-out',
            pointerEvents: i === showing && visible ? 'auto' : 'none',
          }}
          aria-hidden={i !== showing || undefined}
        >
          {arm}
        </div>
      ))}
    </div>
  );
}

// ─── TANGLE CARD — tall card with colored left tile ───────────────────────────

function TangleCard({
  icon, source, content, time, rotate, tileColor, tangleIndex,
}: TangleItem & { tileColor: string; tangleIndex?: number }) {
  return (
    <div
      {...(tangleIndex !== undefined ? { 'data-tangle': String(tangleIndex) } : {})}
      className='relative bg-[#0c1c36] rounded-lg shadow-md shadow-black/50 flex items-stretch overflow-hidden'
      style={{
        transform: `rotate(${rotate}deg)`,
        border: '1px solid rgba(255,255,255,0.07)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Left colored tile — holds the icon; scales with viewport via clamp */}
      <div
        aria-hidden='true'
        className='flex-shrink-0 flex items-center justify-center'
        style={{
          width: 'clamp(1.75rem, 3.5vw, 2.8rem)',
          minWidth: 'clamp(1.75rem, 3.5vw, 2.8rem)',
          background: `linear-gradient(160deg, ${tileColor}30 0%, ${tileColor}18 100%)`,
          borderRight: `1px solid ${tileColor}28`,
        }}
      >
        <span className='text-[0.65rem] lg:text-[1.1rem]' style={{ lineHeight: 1 }}>{icon}</span>
      </div>

      {/* Content: source label / content text / time */}
      <div className='flex-1 min-w-0 py-[3px] lg:py-[5px] px-1 lg:px-2'>
        <div className='flex items-baseline justify-between gap-0.5 mb-[1px]'>
          <span className='font-[700] uppercase tracking-widest text-[#a8d8f0]/40 truncate text-[0.3rem] lg:text-[0.52rem]'>
            {source}
          </span>
          <span className='text-[#a8d8f0]/30 flex-shrink-0 ml-0.5 text-[0.28rem] lg:text-[0.48rem]'>
            {time}
          </span>
        </div>
        {/* No line-clamp — content wraps naturally (mobile-first) */}
        <p className='text-[#ccdff0] leading-snug break-words text-[0.4rem] lg:text-[0.7rem]'>
          {content}
        </p>
      </div>
    </div>
  );
}

// ─── PHONE INTERIOR SECTIONS (cycling) ────────────────────────────────────────

function PhoneGreeting({ arm }: { arm: ArmData }) {
  return (
    <div className='px-2 sm:px-4 pt-2 sm:pt-3 pb-1 sm:pb-2'>
      <div
        className='text-[0.38rem] sm:text-[0.45rem] md:text-[0.55rem] lg:text-[0.65rem] font-[700] tracking-widest uppercase text-[#a8d8f0]/45'
        style={{ visibility: arm.greetingLabel ? 'visible' : 'hidden' }}
      >
        {arm.greetingLabel || 'Good afternoon,'}
      </div>
      <div className='flex items-center justify-between mt-0.5'>
        <span className='text-[0.6rem] sm:text-[0.72rem] md:text-[0.88rem] lg:text-[1rem] font-[800] tracking-[0.08em] text-[#f4f7fa] uppercase truncate flex-1 min-w-0'>
          {arm.greetingName}
        </span>
        <span className='text-[0.36rem] sm:text-[0.42rem] md:text-[0.52rem] lg:text-[0.62rem] text-[#22c55e] font-[600] ml-1 flex-shrink-0'>
          {arm.greetingStatus}
        </span>
      </div>
    </div>
  );
}

function PhoneVerdict({ arm }: { arm: ArmData }) {
  return (
    <div className='px-2 sm:px-4 pb-2 sm:pb-3'>
      <div
        className='bg-[#0a1c35] rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5'
        style={{
          border: '1px solid rgba(30,58,95,0.6)',
          boxShadow: '0 0 0 1px rgba(34,197,94,0.15), 0 0 14px rgba(34,197,94,0.1)',
        }}
      >
        <div className='flex items-center gap-1 sm:gap-2'>
          <span className='text-[#22c55e] text-[0.6rem] sm:text-sm lg:text-base font-[800] flex-shrink-0'>&#10003;</span>
          <span className='text-[0.48rem] sm:text-[0.58rem] md:text-[0.7rem] lg:text-[0.85rem] font-[700] text-[#f4f7fa]'>
            {arm.verdictMain}
          </span>
        </div>
        <div className='text-[0.42rem] sm:text-[0.52rem] md:text-[0.62rem] lg:text-[0.75rem] text-[#f0b429] mt-0.5 pl-3 sm:pl-6 font-[600]'>
          {arm.verdictSub}
        </div>
      </div>
    </div>
  );
}

function PhoneHandled({ arm }: { arm: ArmData }) {
  return (
    <div className='px-1.5 sm:px-3 pt-1 pb-0.5 sm:pb-1'>
      {arm.handled.map((item, i) => (
        <div
          key={i}
          className='flex items-center justify-between py-[2px] sm:py-[3px] lg:py-[4px] border-b border-[#1e3a5f]/25 last:border-0'
        >
          <div className='flex items-center gap-1 sm:gap-1.5 min-w-0'>
            <span className='text-[#22c55e] text-[0.4rem] sm:text-[0.55rem] lg:text-[0.65rem] flex-shrink-0'>&#10003;</span>
            <span className='text-[0.4rem] sm:text-[0.52rem] md:text-[0.6rem] lg:text-[0.72rem] text-[#c8dff0] truncate'>{item.text}</span>
          </div>
          <span className='text-[0.36rem] sm:text-[0.45rem] lg:text-[0.55rem] text-[#a8d8f0]/35 flex-shrink-0 ml-1 hidden sm:inline'>{item.time}</span>
        </div>
      ))}
    </div>
  );
}

function PhoneNeedsYou({ arm }: { arm: ArmData }) {
  return (
    <div className='px-1.5 sm:px-3 pb-1 sm:pb-2 flex flex-col gap-1 sm:gap-1.5'>
      {arm.needsYou.map((card, i) => (
        <div
          key={i}
          className='bg-[#0a1c35] rounded-md sm:rounded-lg px-2 sm:px-3 py-1 sm:py-2'
          style={{ border: '1px solid rgba(240,180,41,0.2)' }}
        >
          <div className='flex items-center justify-between gap-1'>
            <div className='flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0'>
              <span className='text-[0.5rem] sm:text-[0.65rem] lg:text-[0.8rem] text-[#f0b429] font-[700] flex-shrink-0'>{card.icon}</span>
              <div className='min-w-0'>
                <div className='text-[0.42rem] sm:text-[0.55rem] md:text-[0.62rem] lg:text-[0.75rem] font-[700] text-[#f4f7fa] truncate'>{card.label}</div>
                <div className='text-[0.38rem] sm:text-[0.48rem] lg:text-[0.58rem] text-[#a8d8f0]/50 truncate'>{card.sub}</div>
              </div>
            </div>
            <span className='text-[#f0b429]/50 text-[0.5rem] sm:text-[0.7rem] lg:text-[0.85rem] ml-0.5 flex-shrink-0'>&#8250;</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VALET PHONE ──────────────────────────────────────────────────────────────

function ValetPhone({ armIndex, reduced, enhanced = false }: { armIndex: number; reduced: boolean; enhanced?: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Glow pool beneath phone — soft violet ellipse, device sits in light */}
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          bottom: enhanced ? -48 : -20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: enhanced ? '240%' : '150%',
          height: enhanced ? 140 : 72,
          background: enhanced
            ? 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(109,40,217,0.65) 0%, rgba(109,40,217,0.28) 40%, transparent 72%)'
            : 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(109,40,217,0.38) 0%, rgba(109,40,217,0.12) 45%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        data-phone-body='true'
        className='mx-auto relative z-10 w-[min(240px,40vw)] lg:w-[clamp(240px,24vw,320px)]'
        style={{
          background: '#060b18',
          borderRadius: 20,
          fontFamily: 'var(--font-mulish)',
          border: enhanced ? '1.5px solid rgba(109,40,217,0.75)' : '1.5px solid rgba(109,40,217,0.55)',
          boxShadow: enhanced
            ? '0 0 0 1px rgba(109,40,217,0.32), 0 0 0 3px rgba(109,40,217,0.1), 0 0 56px rgba(109,40,217,0.45), 0 0 110px rgba(109,40,217,0.22), 0 12px 36px rgba(0,0,0,0.65), inset 0 1px 0 rgba(109,40,217,0.25)'
            : '0 0 0 1px rgba(109,40,217,0.2), 0 0 32px rgba(109,40,217,0.22), 0 0 64px rgba(109,40,217,0.1), 0 8px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Status bar */}
        <div className='flex justify-between items-center px-2 sm:px-4 pt-2 sm:pt-3 pb-1'>
          <span className='text-[0.38rem] sm:text-[0.52rem] lg:text-[0.65rem] text-[#a8d8f0]/40'>9:41</span>
          <span className='text-[0.38rem] sm:text-[0.52rem] lg:text-[0.65rem] text-[#a8d8f0]/40'>&#9679;&#9679;&#9679;</span>
        </div>

        {/* App header */}
        <div className='flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2 border-b border-[#1e3a5f]/50'>
          <span className='text-[0.42rem] sm:text-[0.6rem] lg:text-[0.75rem] text-[#a8d8f0]/50'>&#8249;</span>
          <span className='text-[0.45rem] sm:text-[0.62rem] lg:text-[0.78rem] font-[700] tracking-[0.2em] text-[#a8d8f0]'>V A L E T</span>
          <span className='text-[0.42rem] sm:text-[0.6rem] lg:text-[0.75rem] text-[#a8d8f0]/50'>&#8943;</span>
        </div>

        {/* Greeting — cycles */}
        <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => <PhoneGreeting arm={arm} />)} />

        {/* Verdict — cycles */}
        <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => <PhoneVerdict arm={arm} />)} />

        {/* Tabs */}
        <div className='flex items-center border-b border-[#1e3a5f]/50 mx-1.5 sm:mx-3'>
          <div className='flex-1 text-[0.36rem] sm:text-[0.52rem] lg:text-[0.65rem] font-[700] text-[#22c55e] py-1 sm:py-1.5 text-center border-b-2 border-[#22c55e]'>
            ALL CLEAR
          </div>
          <div className='flex-1 text-[0.36rem] sm:text-[0.52rem] lg:text-[0.65rem] font-[600] text-[#f0b429] py-1 sm:py-1.5 text-center'>
            NEEDS YOU (2)
          </div>
          <div className='flex-1 text-[0.36rem] sm:text-[0.52rem] lg:text-[0.65rem] font-[600] text-[#a8d8f0]/35 py-1 sm:py-1.5 text-center'>
            ARCHIVE
          </div>
        </div>

        {/* Handled list — cycles */}
        <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => <PhoneHandled arm={arm} />)} />

        {/* NEEDS YOU cards — cycles */}
        <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => <PhoneNeedsYou arm={arm} />)} />

        {/* 47 other items — static, always in DOM */}
        <div className='mx-1.5 sm:mx-3 mb-1 sm:mb-2 bg-[#0a1c35]/70 rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2.5 flex items-center justify-between'>
          <span className='text-[0.4rem] sm:text-[0.55rem] md:text-[0.64rem] lg:text-[0.76rem] text-[#a8d8f0]/60 font-[500]'>
            47 other items handled quietly
          </span>
          <span className='text-[#a8d8f0]/30 text-[0.5rem] sm:text-xs lg:text-sm ml-1 sm:ml-2'>&#8897;</span>
        </div>

        {/* Bottom bar */}
        <div className='flex items-center justify-around px-1 sm:px-2 py-1.5 sm:py-2 border-t border-[#1e3a5f]/50 bg-[#04080f]'>
          {['Home', 'Feed', 'Search', 'Settings'].map(item => (
            <span key={item} className='text-[0.3rem] sm:text-[0.45rem] md:text-[0.52rem] lg:text-[0.62rem] text-[#a8d8f0]/35 font-[600]'>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DOMAIN CARD — with colored left tile ─────────────────────────────────────

function DomainCard({
  icon, name, status, tileColor, domainIndex,
}: RightItem & { tileColor: string; domainIndex?: number }) {
  return (
    <div
      {...(domainIndex !== undefined ? { 'data-domain': String(domainIndex) } : {})}
      className='bg-[#0c1c36] rounded-lg flex items-stretch overflow-hidden shadow-sm shadow-black/40'
      style={{ border: '1px solid rgba(255,255,255,0.07)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
    >
      {/* Left colored tile; scales with viewport via clamp */}
      <div
        aria-hidden='true'
        className='flex-shrink-0 flex items-center justify-center'
        style={{
          width: 'clamp(1.65rem, 3.2vw, 2.6rem)',
          minWidth: 'clamp(1.65rem, 3.2vw, 2.6rem)',
          background: `linear-gradient(160deg, ${tileColor}30 0%, ${tileColor}18 100%)`,
          borderRight: `1px solid ${tileColor}22`,
        }}
      >
        <span className='text-[0.6rem] lg:text-[1rem]' style={{ lineHeight: 1 }}>{icon}</span>
      </div>

      {/* Name + status */}
      <div className='flex-1 min-w-0 flex items-center justify-between px-1 lg:px-2 py-[3px] lg:py-[6px]'>
        <span className='font-[600] text-[#f4f7fa] truncate text-[0.4rem] lg:text-[0.7rem]'>{name}</span>
        <div className='flex items-center gap-0.5 flex-shrink-0 ml-0.5'>
          <span className='text-[#22c55e] text-[0.36rem] lg:text-[0.62rem]'>&#10003;</span>
          <span className='text-[#22c55e]/65 hidden sm:inline text-[0.34rem] lg:text-[0.58rem]'>{status}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE CARD (Studio arm right column) ────────────────────────────────────

function ModuleCard({ name, status, domainIndex }: Omit<RightItem, 'icon'> & { domainIndex?: number }) {
  return (
    <div
      {...(domainIndex !== undefined ? { 'data-domain': String(domainIndex) } : {})}
      className='bg-[#0f1e35] rounded-lg flex items-center justify-between overflow-hidden shadow-sm shadow-black/30'
      style={{
        fontFamily: 'var(--font-mulish)',
        border: '1px solid rgba(109,40,217,0.28)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '3px 8px 3px 10px',
      }}
    >
      <span className='font-[600] text-[#f4f7fa] text-[0.4rem] lg:text-[0.7rem]'>{name}</span>
      <div className='flex items-center gap-0.5'>
        <span className='text-[#22c55e] text-[0.36rem] lg:text-[0.62rem]'>&#10003;</span>
        <span className='font-[700] text-[#22c55e]/80 text-[0.36rem] lg:text-[0.62rem]'>{status}</span>
      </div>
    </div>
  );
}

// ─── HERO V5 ──────────────────────────────────────────────────────────────────

export default function HeroV5({ armIndex, reduced = false }: { armIndex: number; reduced?: boolean }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [curves, setCurves] = useState<CurveSet | null>(null);
  const [motionReduced, setMotionReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const effectiveReduced = reduced || motionReduced;

  const measure = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const tangleEls = Array.from(grid.querySelectorAll('[data-tangle]')).sort(
      (a, b) => Number(a.getAttribute('data-tangle')) - Number(b.getAttribute('data-tangle'))
    );
    const phoneEl = grid.querySelector('[data-phone-body]');
    const domainEls = Array.from(grid.querySelectorAll('[data-domain]')).sort(
      (a, b) => Number(a.getAttribute('data-domain')) - Number(b.getAttribute('data-domain'))
    );
    if (!phoneEl) return;
    const result = computeCurves(grid, tangleEls, phoneEl, domainEls);
    setCurves(result);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(grid);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return (
    <div className='w-full overflow-x-hidden'>

      {/* ══ DESKTOP ≥ 1024px: ribbon artwork + percentage-positioned columns ══
          artwork is 1536×1024 (3:2). mix-blend-mode:screen maps opaque black
          to nothing over the dark page; neon colours add additively.             */}
      <div
        ref={gridRef}
        className='hidden lg:block relative w-full'
        style={{ aspectRatio: '1536 / 1024' }}
      >
        {/* Ribbon artwork — decorative, not LCP */}
        <picture aria-hidden='true'>
          <source type='image/avif' srcSet='/ribbons-layer.avif' />
          <source type='image/webp' srcSet='/ribbons-layer.webp' />
          <img
            src='/ribbons-layer.png'
            alt=''
            decoding='async'
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </picture>

        {/* Left column — tangle annotation + cards */}
        <div
          style={{
            position: 'absolute', left: '1%', top: '4%',
            width: '20%', height: '92%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width='12' height='16' viewBox='0 0 20 28' fill='none' aria-hidden='true' style={{ flexShrink: 0 }}>
              <path d='M 10 2 C 10 10 10 16 10 22' stroke='rgba(168,216,240,0.4)' strokeWidth='1' fill='none' strokeLinecap='round' />
              <path d='M 6 18 L 10 24 L 14 18' stroke='rgba(168,216,240,0.4)' strokeWidth='1' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <span
              style={{
                fontSize: '0.42rem', fontWeight: 600,
                color: 'rgba(168,216,240,0.5)', fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
              }}
            >
              The tangle goes in.
            </span>
          </div>
          <ArmStack
            armIndex={armIndex}
            reduced={effectiveReduced}
            arms={ARMS.map((arm, armIdx) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {arm.tangle.map((card, i) => (
                  <TangleCard key={i} {...card} tileColor={TANGLE_COLORS[i % TANGLE_COLORS.length]} tangleIndex={armIdx === 0 ? i : undefined} />
                ))}
              </div>
            ))}
          />
        </div>

        {/* Center — phone, centred in the dark gap between ribbon clusters */}
        <div
          style={{
            position: 'absolute', left: '34%', top: '5%',
            width: '32%', height: '90%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <ValetPhone armIndex={armIndex} reduced={effectiveReduced} enhanced={true} />
        </div>

        {/* Right column — annotation + domain / module cards */}
        <div
          style={{
            position: 'absolute', right: '1%', top: '4%',
            width: '20%', height: '92%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width='18' height='10' viewBox='0 0 36 18' fill='none' aria-hidden='true' style={{ flexShrink: 0 }}>
              <path d='M 32 9 C 24 9 14 4 4 9' stroke='rgba(168,216,240,0.4)' strokeWidth='1' fill='none' strokeLinecap='round' />
              <path d='M 8 6 L 4 9 L 8 12' stroke='rgba(168,216,240,0.4)' strokeWidth='1' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <span
              style={{
                fontSize: '0.42rem', fontWeight: 600,
                color: 'rgba(168,216,240,0.5)', fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.3,
              }}
            >
              One clear screen comes back.
            </span>
          </div>
          <ArmStack
            armIndex={armIndex}
            reduced={effectiveReduced}
            arms={ARMS.map((arm, armIdx) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {arm.rightType === 'modules' ? (
                  <>
                    {arm.right.map((item, i) => (
                      <ModuleCard key={i} name={item.name} status={item.status} domainIndex={armIdx === 0 ? i : undefined} />
                    ))}
                    <Link
                      href='/receipts'
                      className='text-[0.44rem] lg:text-[0.7rem]'
                      style={{ marginTop: 4, color: 'rgba(124,58,237,0.7)', fontWeight: 600, letterSpacing: '0.05em', textAlign: 'center' }}
                    >
                      See the proof &#8594;
                    </Link>
                  </>
                ) : (
                  arm.right.map((item, i) => (
                    <DomainCard key={i} {...item} tileColor={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} domainIndex={armIdx === 0 ? i : undefined} />
                  ))
                )}
              </div>
            ))}
          />
        </div>

        {/* DOM-measured connector curves — braiding left, orderly right, glow via SVG filter */}
        {curves && (
          <svg
            aria-hidden='true'
            style={{
              position: 'absolute', left: 0, top: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none',
              zIndex: 2,
            }}
            viewBox={`0 0 ${curves.w} ${curves.h}`}
            preserveAspectRatio='xMidYMid meet'
          >
            <defs>
              <filter id='hero-curve-glow' x='-40%' y='-40%' width='180%' height='180%' colorInterpolationFilters='sRGB'>
                <feGaussianBlur in='SourceGraphic' stdDeviation='4' result='blur' />
              </filter>
            </defs>
            {/* Glow layer */}
            <g filter='url(#hero-curve-glow)'>
              {curves.leftCurves.map((c, i) => (
                <path key={`lg${i}`} d={c.d} fill='none' stroke={c.color} strokeWidth='6' strokeOpacity='0.38' strokeLinecap='round' />
              ))}
              {curves.rightCurves.map((c, i) => (
                <path key={`rg${i}`} d={c.d} fill='none' stroke={c.color} strokeWidth='6' strokeOpacity='0.38' strokeLinecap='round' />
              ))}
              {curves.leftNodes.map((n, i) => (
                <circle key={`lgn${i}`} cx={n.cx} cy={n.cy} r='6' fill={n.color} fillOpacity='0.45' />
              ))}
              {curves.rightNodes.map((n, i) => (
                <circle key={`rgn${i}`} cx={n.cx} cy={n.cy} r='6' fill={n.color} fillOpacity='0.45' />
              ))}
            </g>
            {/* Core layer — bright thin strokes */}
            {curves.leftCurves.map((c, i) => (
              <path key={`lc${i}`} d={c.d} fill='none' stroke={c.color} strokeWidth='0.9' strokeOpacity='0.82' strokeLinecap='round' />
            ))}
            {curves.rightCurves.map((c, i) => (
              <path key={`rc${i}`} d={c.d} fill='none' stroke={c.color} strokeWidth='0.9' strokeOpacity='0.82' strokeLinecap='round' />
            ))}
            {curves.leftNodes.map((n, i) => (
              <circle key={`lcn${i}`} cx={n.cx} cy={n.cy} r='2.5' fill={n.color} fillOpacity='0.88' />
            ))}
            {curves.rightNodes.map((n, i) => (
              <circle key={`rcn${i}`} cx={n.cx} cy={n.cy} r='2.5' fill={n.color} fillOpacity='0.88' />
            ))}
          </svg>
        )}
      </div>

      {/* ══ MOBILE / TABLET < 1024px: portrait ribbon artwork ══
          artwork is 941×1672. mix-blend-mode:screen maps opaque black to
          nothing over the dark page; neon colours add additively.
          Cards sit at strand node positions (LEFT_NODES / RIGHT_NODES).   */}
      <div
        className='lg:hidden relative w-full'
        style={{ aspectRatio: '941 / 1672' }}
      >
        {/* Portrait ribbon artwork — decorative, not LCP */}
        <picture aria-hidden='true'>
          <source type='image/avif' srcSet='/ribbons-portrait.avif' />
          <source type='image/webp' srcSet='/ribbons-portrait.webp' />
          <img
            src='/ribbons-portrait.png'
            alt=''
            decoding='async'
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </picture>

        {/* Annotation — left (tangle goes in) */}
        <div
          style={{
            position: 'absolute', left: '1%', top: '1.5%',
            zIndex: 2, display: 'flex', alignItems: 'center', gap: 3,
          }}
        >
          <svg width='8' height='12' viewBox='0 0 20 28' fill='none' aria-hidden='true' style={{ flexShrink: 0 }}>
            <path d='M 10 2 C 10 10 10 16 10 22' stroke='rgba(168,216,240,0.4)' strokeWidth='1.5' fill='none' strokeLinecap='round' />
            <path d='M 6 18 L 10 24 L 14 18' stroke='rgba(168,216,240,0.4)' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          <span
            style={{
              fontSize: '0.3rem', fontWeight: 600,
              color: 'rgba(168,216,240,0.5)', fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
            }}
          >
            The tangle goes in.
          </span>
        </div>

        {/* Annotation — right (one clear screen) */}
        <div
          style={{
            position: 'absolute', right: '1%', top: '1.5%',
            zIndex: 2, display: 'flex', alignItems: 'center', gap: 3,
            maxWidth: '30%',
          }}
        >
          <span
            style={{
              fontSize: '0.3rem', fontWeight: 600,
              color: 'rgba(168,216,240,0.5)', fontStyle: 'italic',
              fontFamily: 'Georgia, serif', lineHeight: 1.3, textAlign: 'right',
            }}
          >
            One clear screen comes back.
          </span>
          <svg width='8' height='12' viewBox='0 0 20 28' fill='none' aria-hidden='true' style={{ flexShrink: 0 }}>
            <path d='M 10 2 C 10 10 10 16 10 22' stroke='rgba(168,216,240,0.4)' strokeWidth='1.5' fill='none' strokeLinecap='round' />
            <path d='M 6 18 L 10 24 L 14 18' stroke='rgba(168,216,240,0.4)' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>

        {/* Left column — 6 tangle cards at strand node positions */}
        <div
          style={{
            position: 'absolute', left: 0, top: 0,
            width: '18%', height: '100%', zIndex: 1,
          }}
        >
          <PortraitColumnStack
            armIndex={armIndex}
            reduced={effectiveReduced}
            arms={ARMS.map((arm) => (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {arm.tangle.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: `${LEFT_NODES[i] * 100}%`,
                      transform: 'translateY(-50%)',
                      left: 0, right: 0,
                    }}
                  >
                    <TangleCard {...card} tileColor={TANGLE_COLORS[i % TANGLE_COLORS.length]} />
                  </div>
                ))}
              </div>
            ))}
          />
        </div>

        {/* Center — phone over the vertical black band */}
        <div
          style={{
            position: 'absolute', left: '30.5%', top: '10%',
            width: '38%', height: '80%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <ValetPhone armIndex={armIndex} reduced={effectiveReduced} />
        </div>

        {/* Right column — 5 domain/module cards at strand node positions */}
        <div
          style={{
            position: 'absolute', right: 0, top: 0,
            width: '19%', height: '100%', zIndex: 1,
          }}
        >
          <PortraitColumnStack
            armIndex={armIndex}
            reduced={effectiveReduced}
            arms={ARMS.map((arm) => (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {arm.rightType === 'modules' ? (
                  arm.right.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: `${RIGHT_NODES[i] * 100}%`,
                        transform: 'translateY(-50%)',
                        left: 0, right: 0,
                      }}
                    >
                      <ModuleCard name={item.name} status={item.status} />
                    </div>
                  ))
                ) : (
                  arm.right.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: `${RIGHT_NODES[i] * 100}%`,
                        transform: 'translateY(-50%)',
                        left: 0, right: 0,
                      }}
                    >
                      <DomainCard {...item} tileColor={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />
                    </div>
                  ))
                )}
              </div>
            ))}
          />
        </div>

      </div>

    </div>
  );
}
