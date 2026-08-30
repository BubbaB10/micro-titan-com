// Three-column hero diagram: tangle (left) → phone (center) → right column
// Annotations are sentence-case in DOM; text-transform:uppercase handles the visual caps look.
// All four arms live in the DOM at once (ArmStack). Three columns NEVER stack on mobile.

import type { ReactNode } from 'react';
import Link from 'next/link';

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
      { icon: '💬', source: 'Text Message', content: 'Dana — “Running 15 minutes late for the walkthrough”', time: '12:47 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Marcus — Re: Thursday site visit', time: '11:32 AM', rotate: 1 },
      { icon: '⚡', source: 'Bill Received', content: 'City Utilities — $186.40, due Sep 9', time: '10:18 AM', rotate: -0.8 },
      { icon: '📅', source: 'Calendar', content: 'Dentist — Thursday, 8:30 AM', time: '9:41 AM', rotate: 1.2 },
      { icon: '📝', source: 'Quick Note', content: 'Reorder filters for the shop', time: '9:02 AM', rotate: -1 },
      { icon: '🧾', source: 'Receipt', content: 'Delta Supply — $64.20', time: 'yesterday', rotate: 0.5 },
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
      { icon: '🏠', name: 'The House', status: 'All set' },
      { icon: '💰', name: 'Money', status: 'On track' },
      { icon: '👧', name: 'The Kids', status: 'Everything good' },
      { icon: '📆', name: 'Schedule', status: 'Locked in' },
      { icon: '🚗', name: 'Vehicles', status: 'All good' },
    ],
  },
  {
    id: 'business',
    tangle: [
      { icon: '💬', source: 'Text Message', content: 'Ray — “Can you get me a quote on the Fulton job?”', time: '1:04 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Accounts payable — Invoice #2214 is 30 days out', time: '11:50 AM', rotate: 1 },
      { icon: '⚡', source: 'Bill Received', content: 'Fleet insurance — $612.00, due Sep 12', time: '10:22 AM', rotate: -0.8 },
      { icon: '📅', source: 'Calendar', content: 'Crew scheduling — Monday, 6:30 AM', time: '9:35 AM', rotate: 1.2 },
      { icon: '📝', source: 'Quick Note', content: 'Reorder shop consumables before the Fulton start', time: '9:10 AM', rotate: -1 },
      { icon: '🧾', source: 'Receipt', content: 'Fastener supply — $211.80', time: 'yesterday', rotate: 0.5 },
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
      { icon: '👥', name: 'Customers', status: 'All current' },
      { icon: '💵', name: 'Cash Flow', status: 'On track' },
      { icon: '👷', name: 'The Crew', status: 'Fully staffed' },
      { icon: '🔨', name: 'Jobs', status: '3 running' },
      { icon: '📦', name: 'Suppliers', status: 'All paid' },
    ],
  },
  {
    id: 'pivot',
    tangle: [
      { icon: '💬', source: 'Text Message', content: 'Nora — “Did you hear back about the interview?”', time: '2:15 PM', rotate: -1.5 },
      { icon: '✉️', source: 'Email', content: 'Course platform — Module 4 unlocks Friday', time: '12:05 PM', rotate: 1 },
      { icon: '🔔', source: 'Reminder', content: 'Certification renewal window opens Sep 15', time: '11:20 AM', rotate: -0.8 },
      { icon: '📅', source: 'Calendar', content: 'Informational call — Wednesday, 4:00 PM', time: '10:05 AM', rotate: 1.2 },
      { icon: '📝', source: 'Quick Note', content: 'Ask Marcus who runs hiring at the co-op', time: '9:30 AM', rotate: -1 },
      { icon: '🔖', source: 'Saved', content: 'Three roles worth a closer look', time: 'yesterday', rotate: 0.5 },
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
      { icon: '🎯', name: 'Skills', status: '2 in progress' },
      { icon: '📎', name: 'Applications', status: '4 out' },
      { icon: '📖', name: 'Learning', status: 'Module 4 Friday' },
      { icon: '🤝', name: 'Network', status: '3 new' },
      { icon: '➡️', name: 'Next Step', status: 'Ready' },
    ],
  },
  {
    id: 'studio',
    tangle: [
      { icon: '📊', source: 'Spreadsheet', content: 'Orders_FINAL_v7.xlsx — 3 people editing', time: '11:52 AM', rotate: -1.5 },
      { icon: '📄', source: 'Paper', content: 'Job tickets in a clipboard by the door', time: '10:40 AM', rotate: 1 },
      { icon: '💬', source: 'Text Thread', content: 'Scheduling, in a group chat, since 2023', time: '10:05 AM', rotate: -0.8 },
      { icon: '📝', source: 'Whiteboard', content: 'This week’s crew board — photographed daily', time: '9:30 AM', rotate: 1.2 },
      { icon: '🖥️', source: 'Legacy Tool', content: 'Quoting software nobody has the login for', time: '9:02 AM', rotate: -1 },
      { icon: '📌', source: 'Sticky Notes', content: 'Callbacks, on the monitor', time: 'yesterday', rotate: 0.5 },
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

// Approximate card metrics for connector SVG bezier curves (desktop only).
const CARD_CENTERS = [26, 86, 146, 206, 266, 326];
const CURVE_MID_Y = 176;
const CURVE_W = 56;
const CURVE_H = 352;

// ─── ARMSTACK ─────────────────────────────────────────────────────────────────
// All arms live in the DOM at once. Only one is visible (opacity). This means
// gate anchors are always present regardless of which arm is showing.

function ArmStack({ armIndex, arms }: { armIndex: number; arms: ReactNode[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateAreas: '"s"', gridTemplateColumns: '1fr' }}>
      {arms.map((arm, i) => (
        <div
          key={i}
          style={{
            gridArea: 's',
            opacity: i === armIndex ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
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

// ─── TANGLE CARD ──────────────────────────────────────────────────────────────

function TangleCard({ icon, source, content, time, rotate }: TangleItem) {
  return (
    <div
      className='relative bg-[#0f2040] rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2.5 shadow-lg shadow-black/30'
      style={{
        transform: `rotate(${rotate}deg)`,
        fontFamily: 'var(--font-mulish)',
        border: '1px solid #1e3a5f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className='flex items-start gap-1 sm:gap-1.5'>
        <span className='text-[0.6rem] sm:text-xs mt-0.5 flex-shrink-0'>{icon}</span>
        <div className='flex-1 min-w-0'>
          <div className='flex items-baseline justify-between gap-0.5 sm:gap-1'>
            <span className='text-[0.38rem] sm:text-[0.45rem] md:text-[0.52rem] font-[700] uppercase tracking-widest text-[#a8d8f0]/50 truncate'>
              {source}
            </span>
            <span className='text-[0.38rem] sm:text-[0.42rem] text-[#a8d8f0]/40 flex-shrink-0 hidden sm:inline'>{time}</span>
          </div>
          <p className='text-[0.45rem] sm:text-[0.52rem] md:text-[0.62rem] text-[#c8dff0] leading-snug mt-0.5 line-clamp-2'>{content}</p>
        </div>
      </div>
      <div
        className='absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 rounded-r-lg'
        style={{ background: 'linear-gradient(to right, transparent, rgba(37,99,235,0.22))' }}
      />
    </div>
  );
}

// ─── PHONE INTERIOR SECTIONS (cycling) ────────────────────────────────────────

function PhoneGreeting({ arm }: { arm: ArmData }) {
  return (
    <div className='px-2 sm:px-4 pt-2 sm:pt-3 pb-1 sm:pb-2'>
      <div
        className='text-[0.38rem] sm:text-[0.45rem] md:text-[0.55rem] font-[700] tracking-widest uppercase text-[#a8d8f0]/45'
        style={{ visibility: arm.greetingLabel ? 'visible' : 'hidden' }}
      >
        {arm.greetingLabel || 'Good afternoon,'}
      </div>
      <div className='flex items-center justify-between mt-0.5'>
        <span className='text-[0.6rem] sm:text-[0.72rem] md:text-[0.88rem] font-[800] tracking-[0.08em] text-[#f4f7fa] uppercase truncate flex-1 min-w-0'>
          {arm.greetingName}
        </span>
        <span className='text-[0.36rem] sm:text-[0.42rem] md:text-[0.52rem] text-[#22c55e] font-[600] ml-1 flex-shrink-0'>
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
          boxShadow: '0 0 0 1px rgba(34,197,94,0.12), 0 0 10px rgba(34,197,94,0.08)',
        }}
      >
        <div className='flex items-center gap-1 sm:gap-2'>
          <span className='text-[#22c55e] text-[0.6rem] sm:text-sm font-[800] flex-shrink-0'>✓</span>
          <span className='text-[0.48rem] sm:text-[0.58rem] md:text-[0.7rem] font-[700] text-[#f4f7fa]'>
            {arm.verdictMain}
          </span>
        </div>
        <div className='text-[0.42rem] sm:text-[0.52rem] md:text-[0.62rem] text-[#f0b429] mt-0.5 pl-3 sm:pl-6 font-[600]'>
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
          className='flex items-center justify-between py-[2px] sm:py-[3px] border-b border-[#1e3a5f]/25 last:border-0'
        >
          <div className='flex items-center gap-1 sm:gap-1.5 min-w-0'>
            <span className='text-[#22c55e] text-[0.4rem] sm:text-[0.55rem] flex-shrink-0'>✓</span>
            <span className='text-[0.4rem] sm:text-[0.52rem] md:text-[0.6rem] text-[#c8dff0] truncate'>{item.text}</span>
          </div>
          <span className='text-[0.36rem] sm:text-[0.45rem] text-[#a8d8f0]/35 flex-shrink-0 ml-1 hidden sm:inline'>{item.time}</span>
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
              <span className='text-[0.5rem] sm:text-[0.65rem] text-[#f0b429] font-[700] flex-shrink-0'>{card.icon}</span>
              <div className='min-w-0'>
                <div className='text-[0.42rem] sm:text-[0.55rem] md:text-[0.62rem] font-[700] text-[#f4f7fa] truncate'>{card.label}</div>
                <div className='text-[0.38rem] sm:text-[0.48rem] text-[#a8d8f0]/50 truncate'>{card.sub}</div>
              </div>
            </div>
            <span className='text-[#f0b429]/50 text-[0.5rem] sm:text-[0.7rem] ml-0.5 flex-shrink-0'>›</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VALET PHONE ──────────────────────────────────────────────────────────────

function ValetPhone({ armIndex }: { armIndex: number }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Pool of violet light beneath phone */}
      <div
        aria-hidden='true'
        style={{
          position: 'absolute',
          bottom: -16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: 60,
          background: 'radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        className='mx-auto relative z-10'
        style={{
          width: 'min(240px, 40vw)',
          background: '#060b18',
          borderRadius: 20,
          fontFamily: 'var(--font-mulish)',
          border: '1.5px solid rgba(109,40,217,0.55)',
          boxShadow: '0 0 0 1px rgba(109,40,217,0.2), 0 0 32px rgba(109,40,217,0.22), 0 0 64px rgba(109,40,217,0.1), 0 8px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Status bar */}
        <div className='flex justify-between items-center px-2 sm:px-4 pt-2 sm:pt-3 pb-1'>
          <span className='text-[0.38rem] sm:text-[0.52rem] text-[#a8d8f0]/40'>9:41</span>
          <span className='text-[0.38rem] sm:text-[0.52rem] text-[#a8d8f0]/40'>●●●</span>
        </div>

        {/* App header */}
        <div className='flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2 border-b border-[#1e3a5f]/50'>
          <span className='text-[0.42rem] sm:text-[0.6rem] text-[#a8d8f0]/50'>‹</span>
          <span className='text-[0.45rem] sm:text-[0.62rem] font-[700] tracking-[0.2em] text-[#a8d8f0]'>V A L E T</span>
          <span className='text-[0.42rem] sm:text-[0.6rem] text-[#a8d8f0]/50'>···</span>
        </div>

        {/* Greeting — cycles */}
        <ArmStack armIndex={armIndex} arms={ARMS.map(arm => <PhoneGreeting arm={arm} />)} />

        {/* Verdict — cycles */}
        <ArmStack armIndex={armIndex} arms={ARMS.map(arm => <PhoneVerdict arm={arm} />)} />

        {/* Tabs */}
        <div className='flex items-center border-b border-[#1e3a5f]/50 mx-1.5 sm:mx-3'>
          <div className='flex-1 text-[0.36rem] sm:text-[0.52rem] font-[700] text-[#22c55e] py-1 sm:py-1.5 text-center border-b-2 border-[#22c55e]'>
            ALL CLEAR
          </div>
          <div className='flex-1 text-[0.36rem] sm:text-[0.52rem] font-[600] text-[#f0b429] py-1 sm:py-1.5 text-center'>
            NEEDS YOU (2)
          </div>
          <div className='flex-1 text-[0.36rem] sm:text-[0.52rem] font-[600] text-[#a8d8f0]/35 py-1 sm:py-1.5 text-center'>
            ARCHIVE
          </div>
        </div>

        {/* Handled list — cycles */}
        <ArmStack armIndex={armIndex} arms={ARMS.map(arm => <PhoneHandled arm={arm} />)} />

        {/* NEEDS YOU cards — cycles */}
        <ArmStack armIndex={armIndex} arms={ARMS.map(arm => <PhoneNeedsYou arm={arm} />)} />

        {/* 47 other items — static, always in DOM */}
        <div className='mx-1.5 sm:mx-3 mb-1 sm:mb-2 bg-[#0a1c35]/70 rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2.5 flex items-center justify-between'>
          <span className='text-[0.4rem] sm:text-[0.55rem] md:text-[0.64rem] text-[#a8d8f0]/60 font-[500]'>
            47 other items handled quietly
          </span>
          <span className='text-[#a8d8f0]/30 text-[0.5rem] sm:text-xs ml-1 sm:ml-2'>⋁</span>
        </div>

        {/* Bottom bar */}
        <div className='flex items-center justify-around px-1 sm:px-2 py-1.5 sm:py-2 border-t border-[#1e3a5f]/50 bg-[#04080f]'>
          {['Home', 'Feed', 'Search', 'Settings'].map(item => (
            <span key={item} className='text-[0.3rem] sm:text-[0.45rem] md:text-[0.52rem] text-[#a8d8f0]/35 font-[600]'>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DOMAIN / MODULE CARDS ────────────────────────────────────────────────────

function DomainCard({ icon, name, status }: RightItem) {
  return (
    <div
      className='bg-[#0f2040] rounded-lg px-2 py-1.5 md:px-3 md:py-2.5 flex items-center justify-between'
      style={{
        fontFamily: 'var(--font-mulish)',
        border: '1px solid #1e3a5f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className='flex items-center gap-1 sm:gap-2'>
        <span className='text-[0.6rem] sm:text-sm flex-shrink-0'>{icon}</span>
        <span className='text-[0.45rem] sm:text-[0.58rem] md:text-[0.72rem] font-[600] text-[#f4f7fa]'>{name}</span>
      </div>
      <div className='flex items-center gap-1 sm:gap-1.5'>
        <span className='text-[#22c55e] text-[0.4rem] sm:text-[0.6rem]'>✓</span>
        <span className='text-[0.38rem] sm:text-[0.52rem] md:text-[0.65rem] text-[#22c55e]/75 hidden sm:inline'>{status}</span>
      </div>
    </div>
  );
}

function ModuleCard({ name, status }: Omit<RightItem, 'icon'>) {
  return (
    <div
      className='bg-[#0f1e35] rounded-lg px-2 py-1.5 md:px-3 md:py-2 flex items-center justify-between'
      style={{
        fontFamily: 'var(--font-mulish)',
        border: '1px solid rgba(109,40,217,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span className='text-[0.45rem] sm:text-[0.58rem] md:text-[0.7rem] font-[600] text-[#f4f7fa]'>{name}</span>
      <div className='flex items-center gap-0.5 sm:gap-1'>
        <span className='text-[#22c55e] text-[0.4rem] sm:text-[0.55rem]'>✓</span>
        <span className='text-[0.38rem] sm:text-[0.52rem] font-[700] text-[#22c55e]/80'>{status}</span>
      </div>
    </div>
  );
}

// ─── HERO V5 ──────────────────────────────────────────────────────────────────

export default function HeroV5({ armIndex }: { armIndex: number }) {
  return (
    <div className='w-full'>
      <div
        className='grid gap-1 sm:gap-2 lg:gap-4 items-start'
        style={{ gridTemplateColumns: '1fr auto 1fr' }}
      >

        {/* ── LEFT: The tangle ─────────────────────────────────────────── */}
        <div className='relative flex flex-col w-full min-w-0'>
          <div className='relative flex flex-col gap-1 sm:gap-1.5 md:gap-2'>
            {/* All four tangle card sets, only one visible */}
            <ArmStack
              armIndex={armIndex}
              arms={ARMS.map(arm => (
                <div className='flex flex-col gap-1 sm:gap-1.5 md:gap-2'>
                  {arm.tangle.map((card, i) => <TangleCard key={i} {...card} />)}
                </div>
              ))}
            />

            {/* Bezier connector curves — desktop only */}
            <svg
              className='absolute top-0 pointer-events-none hidden lg:block'
              style={{ left: '100%', overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(37,99,235,0.35))' }}
              width={CURVE_W}
              height={CURVE_H}
              viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
              aria-hidden='true'
            >
              {CARD_CENTERS.map((y, i) => (
                <path
                  key={i}
                  d={`M 0 ${y} C ${CURVE_W * 0.5} ${y} ${CURVE_W * 0.5} ${CURVE_MID_Y} ${CURVE_W} ${CURVE_MID_Y}`}
                  fill='none'
                  stroke={`rgba(37,99,235,${0.22 + i * 0.03})`}
                  strokeWidth='1.2'
                  strokeLinecap='round'
                />
              ))}
              <circle cx={CURVE_W} cy={CURVE_MID_Y} r='3' fill='rgba(37,99,235,0.5)' />
            </svg>
          </div>

          {/* Annotation: sentence-case in DOM, uppercased via text-transform */}
          <div className='mt-2 sm:mt-4 hidden sm:flex items-center gap-2 justify-start'>
            <svg width='28' height='14' viewBox='0 0 36 18' fill='none' aria-hidden='true' className='flex-shrink-0'>
              <path d='M 4 9 C 12 9 22 14 32 9' stroke='rgba(168,216,240,0.45)' strokeWidth='1' fill='none' strokeLinecap='round' />
              <path d='M 28 6 L 32 9 L 28 12' stroke='rgba(168,216,240,0.45)' strokeWidth='1' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <span
              className='text-[0.45rem] sm:text-[0.55rem] md:text-[0.62rem] font-[700] tracking-widest text-[#a8d8f0]/60 italic'
              style={{ textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}
            >
              The tangle goes in.
            </span>
          </div>
        </div>

        {/* ── CENTER: Valet phone ──────────────────────────────────────── */}
        <div className='flex-shrink-0 flex justify-center'>
          <ValetPhone armIndex={armIndex} />
        </div>

        {/* ── RIGHT: Domain / module cards ─────────────────────────────── */}
        <div className='w-full min-w-0'>
          {/* Annotation: sentence-case in DOM, uppercased via text-transform */}
          <div className='mb-2 sm:mb-4 hidden sm:flex items-center gap-2 justify-start'>
            <svg width='28' height='14' viewBox='0 0 36 18' fill='none' aria-hidden='true' className='flex-shrink-0'>
              <path d='M 32 9 C 24 9 14 4 4 9' stroke='rgba(168,216,240,0.45)' strokeWidth='1' fill='none' strokeLinecap='round' />
              <path d='M 8 6 L 4 9 L 8 12' stroke='rgba(168,216,240,0.45)' strokeWidth='1' fill='none' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <span
              className='text-[0.45rem] sm:text-[0.55rem] md:text-[0.62rem] font-[700] tracking-widest text-[#a8d8f0]/60 italic'
              style={{ textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}
            >
              One clear screen comes back.
            </span>
          </div>

          <ArmStack
            armIndex={armIndex}
            arms={ARMS.map(arm => (
              <div className='flex flex-col gap-1 sm:gap-1.5 md:gap-2'>
                {arm.rightType === 'modules' ? (
                  <>
                    {arm.right.map((item, i) => <ModuleCard key={i} name={item.name} status={item.status} />)}
                    <Link
                      href='/receipts'
                      className='mt-1 text-[0.38rem] sm:text-[0.5rem] text-[#7c3aed]/70 hover:text-[#7c3aed] font-[600] tracking-wide transition-colors text-center'
                    >
                      See the proof →
                    </Link>
                  </>
                ) : (
                  arm.right.map((item, i) => <DomainCard key={i} {...item} />)
                )}
              </div>
            ))}
          />
        </div>

      </div>
    </div>
  );
}
