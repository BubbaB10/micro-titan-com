// Three-column hero diagram: tangle (left) → Valet phone (center) → domains (right)
// Annotation spans are sentence-case in DOM; text-transform:uppercase handles the visual look.

const TANGLE_CARDS = [
  {
    icon: "💬",
    source: "Text Message",
    content: "Dana — \u201cRunning 15 minutes late for the walkthrough\u201d",
    time: "12:47 PM",
    rotate: -1.5,
  },
  {
    icon: "\u2709\ufe0f",
    source: "Email",
    content: "Marcus — Re: Thursday site visit",
    time: "11:32 AM",
    rotate: 1,
  },
  {
    icon: "\u26a1",
    source: "Bill Received",
    content: "City Utilities — $186.40, due Sep 9",
    time: "10:18 AM",
    rotate: -0.8,
  },
  {
    icon: "\ud83d\udcc5",
    source: "Calendar",
    content: "Dentist — Thursday, 8:30 AM",
    time: "9:41 AM",
    rotate: 1.2,
  },
  {
    icon: "\ud83d\udcdd",
    source: "Quick Note",
    content: "Reorder filters for the shop",
    time: "9:02 AM",
    rotate: -1,
  },
  {
    icon: "\ud83e\uddfe",
    source: "Receipt",
    content: "Delta Supply — $64.20",
    time: "yesterday",
    rotate: 0.5,
  },
];

const HANDLED = [
  { text: "Water bill paid", time: "12:18 PM" },
  { text: "Dentist appointment confirmed", time: "11:47 AM" },
  { text: "Trailer registration renewed", time: "10:33 AM" },
  { text: "Thursday walkthrough moved to 9:00", time: "9:58 AM" },
  { text: "Invoice from Delta Supply filed", time: "9:21 AM" },
  { text: "Filters reordered for the shop", time: "8:42 AM" },
];

const DOMAINS = [
  { icon: "🏠", name: "The House", status: "All set" },
  { icon: "💰", name: "Money", status: "On track" },
  { icon: "👧", name: "The Kids", status: "Everything good" },
  { icon: "📆", name: "Schedule", status: "Locked in" },
  { icon: "🚗", name: "Vehicles", status: "All good" },
];

// Approximate card metrics for the connector SVG bezier curves.
// Each card is ~52px tall (py-2.5 + two lines of small text) with gap-2 (8px).
// 6 cards: total ~352px, centers at 26, 86, 146, 206, 266, 326, converging at y=176.
const CARD_CENTERS = [26, 86, 146, 206, 266, 326];
const CURVE_MID_Y = 176;
const CURVE_W = 56;
const CURVE_H = 352;

function TangleCard({
  icon,
  source,
  content,
  time,
  rotate,
}: {
  icon: string;
  source: string;
  content: string;
  time: string;
  rotate: number;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate}deg)`, fontFamily: "var(--font-mulish)" }}
      className="relative bg-[#0f2040] border border-[#1e3a5f] rounded-lg px-3 py-2.5 shadow-lg shadow-black/30"
    >
      <div className="flex items-start gap-2">
        <span className="text-sm mt-0.5 flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-[0.58rem] font-[700] uppercase tracking-widest text-[#a8d8f0]/50 truncate">
              {source}
            </span>
            <span className="text-[0.58rem] text-[#a8d8f0]/40 flex-shrink-0">{time}</span>
          </div>
          <p className="text-[0.68rem] text-[#c8dff0] leading-snug mt-0.5 line-clamp-2">{content}</p>
        </div>
      </div>
      {/* Right-edge glow suggesting rightward flow toward the phone */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 rounded-r-lg"
        style={{ background: "linear-gradient(to right, transparent, rgba(37,99,235,0.22))" }}
      />
    </div>
  );
}

function ValetPhone() {
  return (
    <div
      className="mx-auto"
      style={{
        width: "100%",
        maxWidth: 264,
        background: "#060b18",
        borderRadius: 22,
        border: "1.5px solid rgba(37,99,235,0.45)",
        boxShadow:
          "0 0 48px rgba(37,99,235,0.18), 0 0 0 1px rgba(37,99,235,0.08), inset 0 0 24px rgba(37,99,235,0.04)",
        overflow: "hidden",
        fontFamily: "var(--font-mulish)",
      }}
    >
      {/* Status bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1">
        <span className="text-[0.52rem] text-[#a8d8f0]/40">9:41</span>
        <span className="text-[0.52rem] text-[#a8d8f0]/40">●●●</span>
      </div>

      {/* App header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e3a5f]/50">
        <span className="text-[0.6rem] text-[#a8d8f0]/50">‹</span>
        <span className="text-[0.62rem] font-[700] tracking-[0.2em] text-[#a8d8f0]">V A L E T</span>
        <span className="text-[0.6rem] text-[#a8d8f0]/50">···</span>
      </div>

      {/* Greeting */}
      <div className="px-4 pt-3 pb-2">
        <div className="text-[0.55rem] font-[700] tracking-widest uppercase text-[#a8d8f0]/45">
          Good afternoon,
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[0.88rem] font-[800] tracking-[0.1em] text-[#f4f7fa] uppercase">
            Jordan
          </span>
          <span className="text-[0.52rem] text-[#22c55e] font-[600]">● System online</span>
        </div>
      </div>

      {/* Verdict */}
      <div className="px-4 pb-3">
        <div className="bg-[#0a1c35] rounded-xl px-3 py-2.5 border border-[#1e3a5f]/60">
          <div className="flex items-center gap-2">
            <span className="text-[#22c55e] text-sm font-[800] flex-shrink-0">✓</span>
            <span className="text-[0.7rem] font-[700] text-[#f4f7fa]">
              Everything&apos;s handled.
            </span>
          </div>
          <div className="text-[0.62rem] text-[#f0b429] mt-0.5 pl-6 font-[600]">
            2 things need you.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#1e3a5f]/50 mx-3">
        <div className="flex-1 text-[0.52rem] font-[700] text-[#22c55e] py-1.5 text-center border-b-2 border-[#22c55e]">
          ALL CLEAR
        </div>
        <div className="flex-1 text-[0.52rem] font-[600] text-[#f0b429] py-1.5 text-center">
          NEEDS YOU (2)
        </div>
        <div className="flex-1 text-[0.52rem] font-[600] text-[#a8d8f0]/35 py-1.5 text-center">
          ARCHIVE
        </div>
      </div>

      {/* Handled list — truncate list on narrow screens, never the verdict or NEEDS YOU cards */}
      <div className="px-3 pt-1.5 pb-1">
        {HANDLED.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-[3px] border-b border-[#1e3a5f]/25 last:border-0"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[#22c55e] text-[0.55rem] flex-shrink-0">✓</span>
              <span className="text-[0.6rem] text-[#c8dff0] truncate">{item.text}</span>
            </div>
            <span className="text-[0.52rem] text-[#a8d8f0]/35 flex-shrink-0 ml-1">{item.time}</span>
          </div>
        ))}
      </div>

      {/* NEEDS YOU decision cards */}
      <div className="px-3 pb-2 flex flex-col gap-1.5">
        <div className="bg-[#0a1c35] border border-[#f0b429]/25 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[0.65rem] text-[#f0b429] font-[700] flex-shrink-0">$</span>
              <div className="min-w-0">
                <div className="text-[0.62rem] font-[700] text-[#f4f7fa]">Approve $890</div>
                <div className="text-[0.52rem] text-[#a8d8f0]/50 truncate">
                  Materials order from Delta Supply
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[0.5rem] text-[#a8d8f0]/35">12:18</span>
              <span className="text-[#f0b429]/50 text-[0.7rem] ml-0.5">›</span>
            </div>
          </div>
        </div>
        <div className="bg-[#0a1c35] border border-[#f0b429]/25 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[0.65rem] text-[#a8d8f0] font-[700] flex-shrink-0">◑</span>
              <div className="min-w-0">
                <div className="text-[0.62rem] font-[700] text-[#f4f7fa]">Reply to Marcus about Thursday</div>
                <div className="text-[0.52rem] text-[#a8d8f0]/50 truncate">
                  Re: Site visit at 2:00 PM
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[0.5rem] text-[#a8d8f0]/35">11:32</span>
              <span className="text-[#f0b429]/50 text-[0.7rem] ml-0.5">›</span>
            </div>
          </div>
        </div>
      </div>

      {/* 47 other items handled quietly — the best line; give it room */}
      <div className="mx-3 mb-2 bg-[#0a1c35]/70 rounded-lg px-3 py-2.5 flex items-center justify-between">
        <span className="text-[0.64rem] text-[#a8d8f0]/60 font-[500]">
          47 other items handled quietly
        </span>
        <span className="text-[#a8d8f0]/30 text-xs ml-2">⌄</span>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-around px-2 py-2 border-t border-[#1e3a5f]/50 bg-[#04080f]">
        {["Home", "Feed", "Search", "Settings"].map((item) => (
          <span key={item} className="text-[0.52rem] text-[#a8d8f0]/35 font-[600]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function DomainCard({
  icon,
  name,
  status,
}: {
  icon: string;
  name: string;
  status: string;
}) {
  return (
    <div
      className="bg-[#0f2040] border border-[#1e3a5f] rounded-lg px-3 py-2.5 flex items-center justify-between"
      style={{ fontFamily: "var(--font-mulish)" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm flex-shrink-0">{icon}</span>
        <span className="text-[0.72rem] font-[600] text-[#f4f7fa]">{name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[#22c55e] text-[0.6rem]">✓</span>
        <span className="text-[0.65rem] text-[#22c55e]/75">{status}</span>
      </div>
    </div>
  );
}

export default function HeroV5() {
  return (
    <div className="w-full">
      {/* Three-column grid: stacks on mobile (tangle → phone → domains), side-by-side on desktop */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-4 items-start">

        {/* ── LEFT: The tangle ─────────────────────────────────────────── */}
        <div className="relative flex flex-col max-w-xs mx-auto lg:max-w-none lg:mx-0 w-full">
          {/* Cards */}
          <div className="relative flex flex-col gap-2">
            {TANGLE_CARDS.map((card, i) => (
              <TangleCard key={i} {...card} />
            ))}

            {/* Bezier connector curves (desktop only).
                Positioned at right edge of cards container, overflow:visible lets curves
                reach across the gap into the phone area. */}
            <svg
              className="absolute top-0 pointer-events-none hidden lg:block"
              style={{ left: "100%", overflow: "visible" }}
              width={CURVE_W}
              height={CURVE_H}
              viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
              aria-hidden="true"
            >
              {CARD_CENTERS.map((y, i) => (
                <path
                  key={i}
                  d={`M 0 ${y} C ${CURVE_W * 0.5} ${y} ${CURVE_W * 0.5} ${CURVE_MID_Y} ${CURVE_W} ${CURVE_MID_Y}`}
                  fill="none"
                  stroke={`rgba(37,99,235,${0.18 + i * 0.025})`}
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              ))}
              <circle cx={CURVE_W} cy={CURVE_MID_Y} r="2.5" fill="rgba(37,99,235,0.35)" />
            </svg>
          </div>

          {/* Annotation: sentence-case in DOM, uppercased visually via text-transform */}
          <div className="mt-4 flex items-center gap-2 lg:justify-start justify-center">
            <svg width="36" height="18" viewBox="0 0 36 18" fill="none" aria-hidden="true" className="flex-shrink-0">
              <path d="M 4 9 C 12 9 22 14 32 9" stroke="rgba(168,216,240,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M 28 6 L 32 9 L 28 12" stroke="rgba(168,216,240,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="text-[0.62rem] font-[700] tracking-widest text-[#a8d8f0]/60 italic"
              style={{ textTransform: "uppercase", fontFamily: "Georgia, serif" }}
            >
              The tangle goes in.
            </span>
          </div>
        </div>

        {/* ── CENTER: Valet phone ──────────────────────────────────────── */}
        <div className="flex-shrink-0 flex justify-center lg:px-2">
          <ValetPhone />
        </div>

        {/* ── RIGHT: Domain cards ──────────────────────────────────────── */}
        <div className="max-w-xs mx-auto lg:max-w-none lg:mx-0 w-full">
          {/* Annotation: sentence-case in DOM, uppercased visually via text-transform */}
          <div className="mb-4 flex items-center gap-2 lg:justify-start justify-center">
            <svg width="36" height="18" viewBox="0 0 36 18" fill="none" aria-hidden="true" className="flex-shrink-0">
              <path d="M 32 9 C 24 9 14 4 4 9" stroke="rgba(168,216,240,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M 8 6 L 4 9 L 8 12" stroke="rgba(168,216,240,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="text-[0.62rem] font-[700] tracking-widest text-[#a8d8f0]/60 italic"
              style={{ textTransform: "uppercase", fontFamily: "Georgia, serif" }}
            >
              One clear screen comes back.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {DOMAINS.map((d, i) => (
              <DomainCard key={i} {...d} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
