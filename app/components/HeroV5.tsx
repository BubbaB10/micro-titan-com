'use client';

// Three-column hero diagram: tangle (left) → phone (center) → right column
// Annotations are sentence-case in DOM; text-transform:uppercase handles the visual caps look.
// All four arms live in the DOM at once (ArmStack). Three columns NEVER stack on mobile.

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TangleItem = { icon: string; source: string; content: string; time: string; rotate: number };
type HandledItem = { text: string; time: string };
type NeedsYouItem = { icon: string; label: string; sub: string; time: string };
type RightItem = { icon: string; name: string; status: string };

type ArmData = {
  id: string;
  product: string;
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

export const ARMS: ArmData[] = [
  {
    id: 'valet',
    product: 'Valet',
    tangle: [
      { icon: '\u{1F4AC}', source: 'Text Message', content: 'Morgan — Can you pick up milk on the way home?', time: '12:47 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Project team — Re: Tuesday meeting', time: '11:32 AM', rotate: 1 },
      { icon: '⚡', source: 'Bill Received', content: 'Electric Company — $247.63, due May 28', time: '10:18 AM', rotate: -0.8 },
      { icon: '\u{1F4C5}', source: 'Calendar', content: 'Vet Appointment — Tomorrow, 10:00 AM', time: '9:41 AM', rotate: 1.2 },
      { icon: '\u{1F4DD}', source: 'Quick Note', content: 'Order parts for laser trailer', time: '9:02 AM', rotate: -1 },
    ],
    greetingLabel: 'Good afternoon,',
    greetingName: 'Jordan',
    greetingStatus: '● System online',
    verdictMain: 'Everything’s handled.',
    verdictSub: '2 things need you.',
    handled: [
      { text: 'Electric bill paid', time: '12:18 PM' },
      { text: 'Vet appointment confirmed', time: '11:47 AM' },
      { text: 'Truck registration renewed', time: '10:33 AM' },
      { text: 'Friday dinner moved to 7:30', time: '9:58 AM' },
      { text: 'Invoice from Acme filed', time: '9:21 AM' },
      { text: 'Parts ordered for laser trailer', time: '8:42 AM' },
    ],
    needsYou: [
      { icon: '$', label: 'Approve $1,240', sub: 'Equipment purchase from Fastenal', time: '12:18' },
      { icon: '◑', label: 'Reply about Tuesday', sub: 'Re: Meeting at 2:00 PM', time: '11:32' },
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
    product: 'Valet',
    tangle: [
      { icon: '\u{1F4AC}', source: 'Text', content: 'Ray — can you quote the Fulton job?', time: '1:04 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Accounts payable — Invoice #2214 is 30 days out', time: '11:50 AM', rotate: 1 },
      { icon: '⚡', source: 'Bill', content: 'Fleet insurance — $612.00, due Sep 12', time: '10:22 AM', rotate: -0.8 },
      { icon: '\u{1F4C5}', source: 'Calendar', content: 'Crew scheduling — Monday, 6:30 AM', time: '9:35 AM', rotate: 1.2 },
      { icon: '\u{1F4DD}', source: 'Note', content: 'Reorder shop consumables before Fulton', time: '9:10 AM', rotate: -1 },
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
    product: 'Pivot',
    tangle: [
      { icon: '\u{1F4AC}', source: 'Text', content: 'Nora — did you hear back about the interview?', time: '2:15 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Course platform — Module 4 unlocks Friday', time: '12:05 PM', rotate: 1 },
      { icon: '\u{1F514}', source: 'Reminder', content: 'Certification renewal opens Sep 15', time: '11:20 AM', rotate: -0.8 },
      { icon: '\u{1F4C5}', source: 'Calendar', content: 'Informational call — Wednesday, 4:00 PM', time: '10:05 AM', rotate: 1.2 },
      { icon: '\u{1F4DD}', source: 'Note', content: 'Ask Marcus who runs hiring at the co-op', time: '9:30 AM', rotate: -1 },
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
    product: 'Studio',
    tangle: [
      { icon: '\u{1F4CA}', source: 'Spreadsheet', content: 'Orders_FINAL_v7.xlsx — 3 people editing', time: '11:52 AM', rotate: -1.5 },
      { icon: '\u{1F4C4}', source: 'Paper', content: 'Job tickets in a clipboard by the door', time: '10:40 AM', rotate: 1 },
      { icon: '\u{1F4AC}', source: 'Text thread', content: 'Scheduling, in a group chat, since 2023', time: '10:05 AM', rotate: -0.8 },
      { icon: '\u{1F4DD}', source: 'Whiteboard', content: 'Crew board — photographed daily', time: '9:30 AM', rotate: 1.2 },
      { icon: '\u{1F5A5}️', source: 'Legacy tool', content: 'Quoting software nobody has the login for', time: '9:02 AM', rotate: -1 },
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

// Hue per tangle card slot (index 0-4): cyan / violet / red / blue / amber
const TANGLE_COLORS = ['#22d3ee', '#a78bfa', '#f87171', '#60a5fa', '#fbbf24'];
// Hue per domain card slot (index 0-4): blue / green / sky / teal / lime — all cool output palette
const DOMAIN_COLORS = ['#60a5fa', '#34d399', '#38bdf8', '#2dd4bf', '#4ade80'];

// Fixed y-coordinates (CSS px) for the 402 × 460 stage.
const TANGLE_Y = [50, 108, 166, 224, 282];
const DOMAIN_Y  = [50, 110, 170, 230, 290];

// ─── TOPOLOGY ASSERTIONS ──────────────────────────────────────────────────────
// Throw at module load if any slot count diverges from the declared composition.
// Counts that must all agree: TANGLE_SLOTS (5) and DOMAIN_SLOTS (5).
const _TANGLE_SLOTS = 5;
const _DOMAIN_SLOTS = 5;
(() => {
  if (TANGLE_COLORS.length !== _TANGLE_SLOTS) throw new Error(`HeroV5: TANGLE_COLORS must have ${_TANGLE_SLOTS} entries, has ${TANGLE_COLORS.length}`);
  if (TANGLE_Y.length     !== _TANGLE_SLOTS) throw new Error(`HeroV5: TANGLE_Y must have ${_TANGLE_SLOTS} entries, has ${TANGLE_Y.length}`);
  if (DOMAIN_COLORS.length !== _DOMAIN_SLOTS) throw new Error(`HeroV5: DOMAIN_COLORS must have ${_DOMAIN_SLOTS} entries, has ${DOMAIN_COLORS.length}`);
  if (DOMAIN_Y.length      !== _DOMAIN_SLOTS) throw new Error(`HeroV5: DOMAIN_Y must have ${_DOMAIN_SLOTS} entries, has ${DOMAIN_Y.length}`);
  for (const arm of ARMS) {
    if (arm.tangle.length !== _TANGLE_SLOTS) throw new Error(`HeroV5: ARM "${arm.id}" tangle must have ${_TANGLE_SLOTS} entries, has ${arm.tangle.length}`);
    if (arm.right.length  !== _DOMAIN_SLOTS) throw new Error(`HeroV5: ARM "${arm.id}" right must have ${_DOMAIN_SLOTS} entries, has ${arm.right.length}`);
  }
})();

// ─── PORTRAIT COLUMN STACK ────────────────────────────────────────────────────
// Atomic swap: visibility toggled instantly — no crossfade. All arms stay in the
// DOM so gate anchors are always present. At every frame exactly one arm is
// visible; inactive arms are invisible but still occupy their layout slot.

function PortraitColumnStack({
  armIndex,
  arms,
  reduced = false,
}: {
  armIndex: number;
  arms: ReactNode[];
  reduced?: boolean;
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {arms.map((arm, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            visibility: i === armIndex ? 'visible' : 'hidden',
            pointerEvents: i === armIndex ? 'auto' : 'none',
          }}
          aria-hidden={i !== armIndex || undefined}
        >
          {arm}
        </div>
      ))}
    </div>
  );
}

// ─── ARMSTACK ─────────────────────────────────────────────────────────────────
// Atomic swap: visibility toggled instantly — no crossfade. All arms stay in the
// DOM so gate anchors are always present. At every frame exactly one arm is
// visible; inactive arms are invisible but still occupy their layout slot.
export function ArmStack({ armIndex, arms, reduced = false }: { armIndex: number; arms: ReactNode[]; reduced?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateAreas: '"s"', gridTemplateColumns: '1fr' }}>
      {arms.map((arm, i) => (
        <div
          key={i}
          style={{
            gridArea: 's',
            visibility: i === armIndex ? 'visible' : 'hidden',
            pointerEvents: i === armIndex ? 'auto' : 'none',
          }}
          aria-hidden={i !== armIndex || undefined}
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
      className='relative bg-[#0c1c36] rounded-lg shadow-md shadow-black/50 overflow-hidden'
      style={{
        transform: `rotate(${rotate}deg)`,
        border: '1px solid rgba(255,255,255,0.07)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className='flex items-start gap-[3px] lg:gap-[6px] p-[3px] lg:p-[5px]'>
        {/* Small flat icon badge — top-left inset, reclaims tile width */}
        <div
          aria-hidden='true'
          className='flex-shrink-0 flex items-center justify-center rounded-[2px] lg:rounded-[3px]'
          style={{
            width: 'clamp(0.7rem, 2vw, 1.25rem)',
            height: 'clamp(0.7rem, 2vw, 1.25rem)',
            background: `linear-gradient(135deg, ${tileColor}28 0%, ${tileColor}14 100%)`,
            border: `1px solid ${tileColor}24`,
          }}
        >
          <span className='text-[0.42rem] lg:text-[0.72rem]' style={{ lineHeight: 1 }}>{icon}</span>
        </div>

        {/* Content: source label / content text / time */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-baseline justify-between gap-0.5 mb-[1px]'>
            <span className='font-[700] uppercase tracking-wide text-[#a8d8f0]/40 truncate text-[0.3rem] lg:text-[0.52rem]'>
              {source}
            </span>
            <span className='text-[#a8d8f0]/30 flex-shrink-0 text-[0.28rem] lg:text-[0.48rem]'>
              {time}
            </span>
          </div>
          <p className='text-[#ccdff0] leading-snug break-words text-[0.4rem] lg:text-[0.7rem]'>
            {content}
          </p>
        </div>
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
          <span className='text-[0.45rem] sm:text-[0.62rem] lg:text-[0.78rem] font-[700] tracking-[0.2em] text-[#a8d8f0] uppercase'>{ARMS[armIndex].product.split('').join(' ')}</span>
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
      style={{
        border: '1px solid rgba(34,197,94,0.18)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 0 1px rgba(34,197,94,0.07), 0 0 10px rgba(34,197,94,0.13), 0 0 22px rgba(34,197,94,0.05)',
      }}
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

// ─── STAGE CARD COMPONENTS (authored at 402 CSS-px design width) ─────────────

function StageTangleCard({ icon, source, content, time, rotate, tileColor }: TangleItem & { tileColor: string }) {
  return (
    <div
      style={{
        background: 'transparent',
        borderRadius: 7,
        transform: `rotate(${rotate}deg)`,
        overflow: 'hidden',
        padding: '6px 7px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
      }}
    >
      {/* Circle icon */}
      <div
        style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
          background: `${tileColor}32`,
          border: `1px solid ${tileColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 1,
        }}
      >
        <span style={{ fontSize: 12, lineHeight: 1 }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
          <span style={{
            fontSize: 7, fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            color: 'rgba(168,216,240,0.50)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {source}
          </span>
          <span style={{ fontSize: 6, color: 'rgba(168,216,240,0.30)', flexShrink: 0, marginLeft: 3 }}>{time}</span>
        </div>
        <p style={{
          fontSize: 9, color: '#ccdff0', lineHeight: 1.35, margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }}>
          {content}
        </p>
      </div>
    </div>
  );
}

function StageDomainCard({ icon, name, status, tileColor }: RightItem & { tileColor: string }) {
  return (
    <div
      style={{
        height: '100%',
        background: 'transparent',
        borderRadius: 7,
        display: 'flex', alignItems: 'center',
        padding: '0 7px',
        gap: 7,
        boxSizing: 'border-box' as const,
      }}
    >
      {/* Circle icon */}
      <div
        style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
          background: `${tileColor}28`,
          border: `1px solid ${tileColor}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 12, lineHeight: 1 }}>{icon}</span>
      </div>
      {/* Name + status */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block', fontSize: 9, fontWeight: 600,
          color: '#f4f7fa',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 7.5, color: '#22c55e', flexShrink: 0 }}>&#10003;</span>
          <span style={{
            fontSize: 7.5, color: 'rgba(34,197,94,0.65)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

function StageModuleCard({ name, status }: { name: string; status: string }) {
  return (
    <div
      style={{
        height: '100%',
        background: 'transparent',
        borderRadius: 7,
        display: 'flex', alignItems: 'center',
        padding: '0 7px',
        gap: 7,
        boxSizing: 'border-box' as const,
      }}
    >
      {/* Circle icon */}
      <div style={{
        flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
        background: 'rgba(34,197,94,0.18)',
        border: '1px solid rgba(34,197,94,0.40)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 800, lineHeight: 1 }}>&#10003;</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 9, fontWeight: 600, color: '#f4f7fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <span style={{ fontSize: 7.5, fontWeight: 700, color: 'rgba(34,197,94,0.8)' }}>{status}</span>
      </div>
    </div>
  );
}

function StagePhone({ armIndex, reduced }: { armIndex: number; reduced: boolean }) {
  return (
    <div
      data-phone-body='true'
      style={{
        width: 116, height: 350,
        background: '#060b18',
        borderRadius: 16,
        border: '1.5px solid rgba(109,40,217,0.65)',
        boxShadow: '0 0 0 1px rgba(109,40,217,0.25), 0 0 32px rgba(109,40,217,0.42), 0 0 64px rgba(109,40,217,0.18), 0 8px 24px rgba(0,0,0,0.65)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-mulish)',
      }}
    >
      {/* Status bar — miniature scale */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px 1px', flexShrink: 0 }}>
        <span style={{ fontSize: 7, color: 'rgba(168,216,240,0.4)' }}>9:41</span>
        <span style={{ fontSize: 7, color: 'rgba(168,216,240,0.4)' }}>&#9679;&#9679;&#9679;</span>
      </div>
      {/* App header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1px 10px 2px', borderBottom: '1px solid rgba(30,58,95,0.5)', flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: 'rgba(168,216,240,0.45)' }}>&#8249;</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(168,216,240,0.85)', textTransform: 'uppercase' as const }}>
          {ARMS[armIndex].product.split('').join(' ')}
        </span>
        <span style={{ fontSize: 9, color: 'rgba(168,216,240,0.45)' }}>&#8943;</span>
      </div>
      {/* Greeting */}
      <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => (
        <div style={{ padding: '3px 10px 1px' }}>
          <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'rgba(168,216,240,0.5)' }}>
            {arm.greetingLabel || 'Good afternoon,'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.05em', color: '#f4f7fa', textTransform: 'uppercase' as const, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {arm.greetingName}
            </span>
            <span style={{ fontSize: 6, color: '#22c55e', fontWeight: 600, flexShrink: 0, marginLeft: 4 }}>{arm.greetingStatus}</span>
          </div>
        </div>
      ))} />
      {/* Verdict */}
      <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => (
        <div style={{ padding: '0 10px 2px' }}>
          <div style={{ background: '#0a1c35', borderRadius: 8, padding: '3px 8px', border: '1px solid rgba(30,58,95,0.6)', boxShadow: '0 0 0 1px rgba(34,197,94,0.12), 0 0 8px rgba(34,197,94,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ flexShrink: 0, width: 16, height: 16, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 900, lineHeight: 1 }}>&#10003;</span>
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#f4f7fa' }}>{arm.verdictMain}</span>
            </div>
            <div style={{ fontSize: 6, color: '#f0b429', marginTop: 2, paddingLeft: 21, fontWeight: 600 }}>{arm.verdictSub}</div>
          </div>
        </div>
      ))} />
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(30,58,95,0.5)', margin: '0 8px', flexShrink: 0 }}>
        {[
          { label: 'ALL CLEAR', color: '#22c55e', active: true },
          { label: 'NEEDS YOU (2)', color: '#f0b429', active: false },
          { label: 'ARCHIVE', color: 'rgba(168,216,240,0.35)', active: false },
        ].map(({ label, color, active }) => (
          <div key={label} style={{ flex: 1, fontSize: 6, fontWeight: active ? 700 : 600, color, padding: '2px 0', textAlign: 'center' as const, borderBottom: active ? `1.5px solid ${color}` : 'none' }}>
            {label}
          </div>
        ))}
      </div>
      {/* Handled items */}
      <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => (
        <div style={{ padding: '2px 8px' }}>
          {arm.handled.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', borderBottom: i < arm.handled.length - 1 ? '1px solid rgba(30,58,95,0.2)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 7, color: '#22c55e', flexShrink: 0 }}>&#10003;</span>
                <span style={{ fontSize: 7, color: '#c8dff0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</span>
              </div>
              <span style={{ fontSize: 5, color: 'rgba(168,216,240,0.35)', flexShrink: 0, marginLeft: 3 }}>{item.time}</span>
            </div>
          ))}
        </div>
      ))} />
      {/* Needs You */}
      <ArmStack armIndex={armIndex} reduced={reduced} arms={ARMS.map(arm => (
        <div style={{ padding: '2px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {arm.needsYou.map((card, i) => (
            <div key={i} style={{ background: '#0a1c35', borderRadius: 6, padding: '3px 7px', border: '1px solid rgba(240,180,41,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 9, color: '#f0b429', fontWeight: 700, flexShrink: 0 }}>{card.icon}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: '#f4f7fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.label}</div>
                  <div style={{ fontSize: 6, color: 'rgba(168,216,240,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.sub}</div>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(240,180,41,0.5)', flexShrink: 0 }}>&#8250;</span>
              </div>
            </div>
          ))}
        </div>
      ))} />
      {/* 47 other items — always in DOM */}
      <div style={{ margin: '1px 8px', background: 'rgba(10,28,53,0.7)', borderRadius: 6, padding: '2px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 7, color: 'rgba(168,216,240,0.6)', fontWeight: 500 }}>47 other items handled quietly</span>
        <span style={{ fontSize: 9, color: 'rgba(168,216,240,0.3)', marginLeft: 3 }}>&#8897;</span>
      </div>
      {/* Bottom bar — marginTop:auto pushes it down only if space remains */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '3px 5px 4px', borderTop: '1px solid rgba(30,58,95,0.5)', background: '#04080f', marginTop: 'auto', flexShrink: 0 }}>
        {['Home', 'Feed', 'Search', 'Settings'].map(item => (
          <span key={item} style={{ fontSize: 6, color: 'rgba(168,216,240,0.35)', fontWeight: 600 }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── HERO V5 ──────────────────────────────────────────────────────────────────

export default function HeroV5({ armIndex, reduced = false }: { armIndex: number; reduced?: boolean }) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [motionReduced, setMotionReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const effectiveReduced = reduced || motionReduced;

  // Scale the fixed 402-px mobile stage to match actual viewport width.
  // Clamped to 0.90–1.10; desktop (≥1024px) shows the lg:block section instead.
  useEffect(() => {
    const wrap  = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const update = () => {
      const w = wrap.offsetWidth;
      if (w < 1) return;
      const s = Math.min(Math.max(w / 402, 0.90), 1.10);
      stage.style.transform = `scale(${s.toFixed(4)})`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div className='w-full overflow-x-hidden'>

      {/* ══ DESKTOP ≥ 1024px: ribbon artwork + percentage-positioned columns ══
          artwork is 1536×1024 (3:2). mix-blend-mode:screen maps opaque black
          to nothing over the dark page; neon colours add additively.             */}
      <div
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
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width='14' height='20' viewBox='0 0 20 32' fill='none' aria-hidden='true' style={{ flexShrink: 0 }}>
              {/* hand-drawn down-arc arrow */}
              <path d='M 15 2 C 18 10 14 18 9 28' stroke='rgba(168,216,240,0.55)' strokeWidth='1.2' fill='none' strokeLinecap='round' />
              <path d='M 4 23 L 9 30 L 14 24' stroke='rgba(168,216,240,0.55)' strokeWidth='1.2' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <span
              style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: 'rgba(168,216,240,0.75)',
                fontFamily: 'var(--font-mulish)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
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
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <svg width='20' height='14' viewBox='0 0 36 22' fill='none' aria-hidden='true' style={{ flexShrink: 0, marginTop: 4 }}>
              {/* hand-drawn left-swoop arrow */}
              <path d='M 34 4 C 26 2 16 14 4 14' stroke='rgba(168,216,240,0.55)' strokeWidth='1.2' fill='none' strokeLinecap='round' />
              <path d='M 9 8 L 3 14 L 9 18' stroke='rgba(168,216,240,0.55)' strokeWidth='1.2' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <span
              style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: 'rgba(168,216,240,0.75)',
                fontFamily: 'var(--font-mulish)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1.4,
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

      </div>

      {/* ══ MOBILE / TABLET < 1024px: fixed-coordinate 402 × 420 stage ══
          Stage authored at 402 CSS px. ResizeObserver scales to fit.
          Phone: left=143, top=50, width=116, height=350 (fully visible).
          Left cards: left=6, width=96. Right cards: left=300, width=96.
          29 px gap each side between card columns and phone.              */}
      <div
        ref={wrapRef}
        className='lg:hidden'
        style={{ width: '100%', aspectRatio: '402 / 420', position: 'relative', overflow: 'hidden' }}
      >
        <div
          ref={stageRef}
          style={{ position: 'absolute', top: 0, left: 0, width: 402, height: 420, transformOrigin: 'top left' }}
        >
          {/* Ribbon artwork — two layers split at phone centre (x=201). */}
          {/* Layer L — left of phone centre, original colours */}
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
                objectFit: 'cover', objectPosition: 'top',
                mixBlendMode: 'screen',
                opacity: 0.28,
                pointerEvents: 'none',
                zIndex: 0,
                clipPath: 'inset(0 201px 82px 0)',
              }}
            />
          </picture>
          {/* Layer R — right of phone centre, blue-green */}
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
                objectFit: 'cover', objectPosition: 'top',
                mixBlendMode: 'screen',
                opacity: 0.28,
                pointerEvents: 'none',
                zIndex: 0,
                clipPath: 'inset(0 0 82px 201px)',
                filter: 'grayscale(1) sepia(1) hue-rotate(155deg) saturate(4)',
              }}
            />
          </picture>

          {/* Violet glow pool behind the phone */}
          <div
            aria-hidden='true'
            style={{
              position: 'absolute',
              left: 143, top: 62, width: 116, height: 280,
              background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(109,40,217,0.14) 0%, rgba(109,40,217,0.05) 50%, transparent 70%)',
              pointerEvents: 'none', zIndex: 1,
              filter: 'blur(14px)',
            }}
          />

          {/* Locked static artwork — z=2. Card shells, braid strands, output strands, port dots.
              Coordinate system: 402 × 460 stage (authored width).
              Left cards: x=6, width=96. Right cards: x=300, width=96. Phone: x=131, width=140.
              Left card centers (y): 75, 133, 191, 249, 307. Right card centers: 75, 135, 195, 255, 315.
              Braid: strand 0 straight, pairs (1,2) and (3,4) swap — one crossing each, none more. */}
          <svg
            aria-hidden='true'
            style={{ position: 'absolute', left: 0, top: 0, width: 402, height: 420, pointerEvents: 'none', zIndex: 2 }}
            viewBox='0 0 402 420'
          >
            <defs>
              <filter id='mcg' x='-50%' y='-50%' width='200%' height='200%' colorInterpolationFilters='sRGB'>
                <feGaussianBlur in='SourceGraphic' stdDeviation='2.5' result='blur' />
              </filter>
              <filter id='phone-glow' x='-30%' y='-10%' width='160%' height='120%' colorInterpolationFilters='sRGB'>
                <feGaussianBlur in='SourceGraphic' stdDeviation='10' result='blur' />
              </filter>
            </defs>

            {/* Phone glow pool */}
            <ellipse cx='201' cy='407' rx='55' ry='16' fill='rgba(109,40,217,0.22)' filter='url(#phone-glow)' />

            {/* Card shells — painted as stable SVG artwork */}
            {/* Left card shells */}
            <rect x='6'   y='50'  width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(255,255,255,0.07)' strokeWidth='1'/>
            <rect x='6'   y='108' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(255,255,255,0.07)' strokeWidth='1'/>
            <rect x='6'   y='166' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(255,255,255,0.07)' strokeWidth='1'/>
            <rect x='6'   y='224' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(255,255,255,0.07)' strokeWidth='1'/>
            <rect x='6'   y='282' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(255,255,255,0.07)' strokeWidth='1'/>
            {/* Right card shells */}
            <rect x='300' y='50'  width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(34,197,94,0.18)'   strokeWidth='1'/>
            <rect x='300' y='110' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(34,197,94,0.18)'   strokeWidth='1'/>
            <rect x='300' y='170' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(34,197,94,0.18)'   strokeWidth='1'/>
            <rect x='300' y='230' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(34,197,94,0.18)'   strokeWidth='1'/>
            <rect x='300' y='290' width='96' height='50' rx='7' fill='#0c1c36' stroke='rgba(34,197,94,0.18)'   strokeWidth='1'/>

            {/* Braid strands — left cards → phone left wall (with deterministic pair-swap crossings) */}
            <g filter='url(#mcg)' strokeLinecap='round' fill='none'>
              {/* Glow layer */}
              <path d='M102,75  C121,75  122,75  143,75'  stroke='#22d3ee' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M102,133 C122,133 123,191 143,191' stroke='#a78bfa' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M102,191 C122,191 123,133 143,133' stroke='#f87171' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M102,249 C122,249 123,307 143,307' stroke='#60a5fa' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M102,307 C122,307 123,249 143,249' stroke='#fbbf24' strokeWidth='4' strokeOpacity='0.30'/>
              {/* Output strands — phone right wall → right cards (all blue/green/teal) */}
              <path d='M259,75  C269,75  280,75  300,75'  stroke='#60a5fa' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M259,135 C269,135 280,135 300,135' stroke='#34d399' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M259,195 C269,195 280,195 300,195' stroke='#38bdf8' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M259,255 C269,255 280,255 300,255' stroke='#2dd4bf' strokeWidth='4' strokeOpacity='0.30'/>
              <path d='M259,315 C269,315 280,315 300,315' stroke='#4ade80' strokeWidth='4' strokeOpacity='0.30'/>
            </g>
            {/* Core strands */}
            <g strokeLinecap='round' fill='none' strokeWidth='0.9'>
              <path d='M102,75  C121,75  122,75  143,75'  stroke='#22d3ee' strokeOpacity='0.85'/>
              <path d='M102,133 C122,133 123,191 143,191' stroke='#a78bfa' strokeOpacity='0.85'/>
              <path d='M102,191 C122,191 123,133 143,133' stroke='#f87171' strokeOpacity='0.85'/>
              <path d='M102,249 C122,249 123,307 143,307' stroke='#60a5fa' strokeOpacity='0.85'/>
              <path d='M102,307 C122,307 123,249 143,249' stroke='#fbbf24' strokeOpacity='0.85'/>
              <path d='M259,75  C269,75  280,75  300,75'  stroke='#60a5fa' strokeOpacity='0.85'/>
              <path d='M259,135 C269,135 280,135 300,135' stroke='#34d399' strokeOpacity='0.85'/>
              <path d='M259,195 C269,195 280,195 300,195' stroke='#38bdf8' strokeOpacity='0.85'/>
              <path d='M259,255 C269,255 280,255 300,255' stroke='#2dd4bf' strokeOpacity='0.85'/>
              <path d='M259,315 C269,315 280,315 300,315' stroke='#4ade80' strokeOpacity='0.85'/>
            </g>

            {/* Port dots — glow layer */}
            <g filter='url(#mcg)'>
              {/* Left card ports */}
              <circle cx='102' cy='75'  r='3.5' fill='#22d3ee' fillOpacity='0.28'/>
              <circle cx='102' cy='133' r='3.5' fill='#a78bfa' fillOpacity='0.28'/>
              <circle cx='102' cy='191' r='3.5' fill='#f87171' fillOpacity='0.28'/>
              <circle cx='102' cy='249' r='3.5' fill='#60a5fa' fillOpacity='0.28'/>
              <circle cx='102' cy='307' r='3.5' fill='#fbbf24' fillOpacity='0.28'/>
              {/* Phone left entries (post-braid, positions match strand end-points) */}
              <circle cx='143' cy='75'  r='3.5' fill='#22d3ee' fillOpacity='0.28'/>
              <circle cx='143' cy='191' r='3.5' fill='#a78bfa' fillOpacity='0.28'/>
              <circle cx='143' cy='133' r='3.5' fill='#f87171' fillOpacity='0.28'/>
              <circle cx='143' cy='307' r='3.5' fill='#60a5fa' fillOpacity='0.28'/>
              <circle cx='143' cy='249' r='3.5' fill='#fbbf24' fillOpacity='0.28'/>
              {/* Phone right exits */}
              <circle cx='259' cy='75'  r='3.5' fill='#60a5fa' fillOpacity='0.28'/>
              <circle cx='259' cy='135' r='3.5' fill='#34d399' fillOpacity='0.28'/>
              <circle cx='259' cy='195' r='3.5' fill='#38bdf8' fillOpacity='0.28'/>
              <circle cx='259' cy='255' r='3.5' fill='#2dd4bf' fillOpacity='0.28'/>
              <circle cx='259' cy='315' r='3.5' fill='#4ade80' fillOpacity='0.28'/>
              {/* Right card ports */}
              <circle cx='300' cy='75'  r='3.5' fill='#60a5fa' fillOpacity='0.28'/>
              <circle cx='300' cy='135' r='3.5' fill='#34d399' fillOpacity='0.28'/>
              <circle cx='300' cy='195' r='3.5' fill='#38bdf8' fillOpacity='0.28'/>
              <circle cx='300' cy='255' r='3.5' fill='#2dd4bf' fillOpacity='0.28'/>
              <circle cx='300' cy='315' r='3.5' fill='#4ade80' fillOpacity='0.28'/>
            </g>
            {/* Port dots — core */}
            <circle cx='102' cy='75'  r='2' fill='#22d3ee' fillOpacity='0.92'/>
            <circle cx='102' cy='133' r='2' fill='#a78bfa' fillOpacity='0.92'/>
            <circle cx='102' cy='191' r='2' fill='#f87171' fillOpacity='0.92'/>
            <circle cx='102' cy='249' r='2' fill='#60a5fa' fillOpacity='0.92'/>
            <circle cx='102' cy='307' r='2' fill='#fbbf24' fillOpacity='0.92'/>
            <circle cx='143' cy='75'  r='2' fill='#22d3ee' fillOpacity='0.92'/>
            <circle cx='143' cy='191' r='2' fill='#a78bfa' fillOpacity='0.92'/>
            <circle cx='143' cy='133' r='2' fill='#f87171' fillOpacity='0.92'/>
            <circle cx='143' cy='307' r='2' fill='#60a5fa' fillOpacity='0.92'/>
            <circle cx='143' cy='249' r='2' fill='#fbbf24' fillOpacity='0.92'/>
            <circle cx='259' cy='75'  r='2' fill='#60a5fa' fillOpacity='0.92'/>
            <circle cx='259' cy='135' r='2' fill='#34d399' fillOpacity='0.92'/>
            <circle cx='259' cy='195' r='2' fill='#38bdf8' fillOpacity='0.92'/>
            <circle cx='259' cy='255' r='2' fill='#2dd4bf' fillOpacity='0.92'/>
            <circle cx='259' cy='315' r='2' fill='#4ade80' fillOpacity='0.92'/>
            <circle cx='300' cy='75'  r='2' fill='#60a5fa' fillOpacity='0.92'/>
            <circle cx='300' cy='135' r='2' fill='#34d399' fillOpacity='0.92'/>
            <circle cx='300' cy='195' r='2' fill='#38bdf8' fillOpacity='0.92'/>
            <circle cx='300' cy='255' r='2' fill='#2dd4bf' fillOpacity='0.92'/>
            <circle cx='300' cy='315' r='2' fill='#4ade80' fillOpacity='0.92'/>
          </svg>

          {/* Left annotation — "THE TANGLE GOES IN." */}
          <div
            style={{ position: 'absolute', left: 4, top: 8, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
          >
            <span
              style={{
                fontSize: 11, fontStyle: 'italic', fontWeight: 700,
                color: 'rgba(168,216,240,0.65)',
                fontFamily: 'var(--font-mulish)',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}
            >
              The tangle<br />goes in.
            </span>
            <svg width='16' height='22' viewBox='0 0 24 32' fill='none' aria-hidden='true'>
              <path d='M 6 2 C 10 8 18 16 20 28' stroke='rgba(168,216,240,0.50)' strokeWidth='1.5' fill='none' strokeLinecap='round' />
              <path d='M 14 23 L 21 30 L 24 21' stroke='rgba(168,216,240,0.50)' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </div>

          {/* Right annotation — "ONE CLEAR SCREEN COMES BACK." */}
          <div
            style={{ position: 'absolute', right: 4, top: 8, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}
          >
            <span
              style={{
                fontSize: 11, fontStyle: 'italic', fontWeight: 700,
                color: 'rgba(168,216,240,0.65)',
                fontFamily: 'var(--font-mulish)',
                letterSpacing: '0.06em',
                lineHeight: 1.2,
                textAlign: 'right' as const,
              }}
            >
              One clear screen<br />comes back.
            </span>
            <svg width='16' height='22' viewBox='0 0 24 32' fill='none' aria-hidden='true'>
              <path d='M 18 2 C 14 8 6 16 4 28' stroke='rgba(168,216,240,0.50)' strokeWidth='1.5' fill='none' strokeLinecap='round' />
              <path d='M 10 23 L 3 30 L 0 21' stroke='rgba(168,216,240,0.50)' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </div>

          {/* Left + right card columns — z=3, above SVG strands */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
            <PortraitColumnStack
              armIndex={armIndex}
              reduced={effectiveReduced}
              arms={ARMS.map((arm) => (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* Left column — 5 tangle cards */}
                  {arm.tangle.map((card, i) => (
                    <div
                      key={`l${i}`}
                      style={{ position: 'absolute', left: 6, width: 96, top: TANGLE_Y[i] }}
                    >
                      <StageTangleCard {...card} tileColor={TANGLE_COLORS[i % TANGLE_COLORS.length]} />
                    </div>
                  ))}
                  {/* Right column — 5 domain / module cards */}
                  {arm.rightType === 'modules' ? (
                    arm.right.map((item, i) => (
                      <div
                        key={`r${i}`}
                        style={{ position: 'absolute', left: 300, width: 96, height: 50, top: DOMAIN_Y[i] }}
                      >
                        <StageModuleCard name={item.name} status={item.status} />
                      </div>
                    ))
                  ) : (
                    arm.right.map((item, i) => (
                      <div
                        key={`r${i}`}
                        style={{ position: 'absolute', left: 300, width: 96, height: 50, top: DOMAIN_Y[i] }}
                      >
                        <StageDomainCard {...item} tileColor={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />
                      </div>
                    ))
                  )}
                </div>
              ))}
            />
          </div>

          {/* Phone — fixed position in the centre column, always on top */}
          <div style={{ position: 'absolute', left: 143, top: 50, width: 116, height: 350, zIndex: 4 }}>
            <StagePhone armIndex={armIndex} reduced={effectiveReduced} />
          </div>

        </div>
      </div>

    </div>
  );
}
