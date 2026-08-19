'use client';

const W = 680;
const H = 300;

const YOU_CX = 72;
const YOU_CY = 150;
const YOU_R = 30;

const ITEMS = [
  { id: 'bi', label: 'The Bills',           color: '#e2a44a', iy: 65  },
  { id: 'ki', label: "The Kids' Schedule",  color: '#46cf93', iy: 110 },
  { id: 'ap', label: 'Appointments',        color: '#818cf8', iy: 155 },
  { id: 'ho', label: 'The House',           color: '#4fb8e8', iy: 200 },
  { id: 've', label: 'The Vehicles',        color: '#a78bfa', iy: 245 },
];

const VALET_X = 165;
const VALET_Y = 22;
const VALET_W = 238;
const VALET_H = 256;

const COCKPIT_X = 452;
const COCKPIT_Y = 60;
const COCKPIT_W = 208;
const COCKPIT_H = 180;

// Tangled paths: lines cross each other (items at top dip down, items at bottom rise up)
const TANGLE = [
  // Bills (top, iy=65): dips DOWN to y=248 then back up — crosses Vehicles path
  `M${YOU_CX + YOU_R},${YOU_CY - 10} C${118},${248} ${148},${38} ${VALET_X},${65}`,
  // Kids (iy=110): dips DOWN to y=208 then up — crosses House path
  `M${YOU_CX + YOU_R},${YOU_CY - 5} C${120},${208} ${148},${82} ${VALET_X},${110}`,
  // Appts (middle, iy=155): slight wave through center
  `M${YOU_CX + YOU_R},${YOU_CY} C${128},${155} ${148},${155} ${VALET_X},${155}`,
  // House (iy=200): rises UP to y=88 then down — crosses Kids path
  `M${YOU_CX + YOU_R},${YOU_CY + 5} C${120},${88} ${148},${226} ${VALET_X},${200}`,
  // Vehicles (bottom, iy=245): rises UP to y=52 then down — crosses Bills path
  `M${YOU_CX + YOU_R},${YOU_CY + 10} C${118},${52} ${148},${272} ${VALET_X},${245}`,
];

// Clean parallel lines: Valet right edge → Cockpit left edge
const CLEAN_YS = [88, 118, 150, 182, 212];

export default function RouterFlow() {
  return (
    <div style={{ width: '100%', overflowX: 'auto', scrollbarWidth: 'none' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        aria-label="The tangle goes in to Valet. One clear screen comes back."
      >
        <defs>
          {/* Path defs for animated dots */}
          {TANGLE.map((d, i) => <path key={`tp-${i}`} id={`tangle-${i}`} d={d} fill="none" />)}
          {CLEAN_YS.map((y, i) => (
            <path key={`cp-${i}`} id={`clean-${i}`}
              d={`M${VALET_X + VALET_W},${y} L${COCKPIT_X},${y}`} fill="none" />
          ))}

          <radialGradient id="you-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e2a44a" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#e2a44a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cockpit-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ca30c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ca30c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="valet-fill" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1e3a6e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0a1628" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* ── TANGLED lines: YOU → Valet ── */}
        {TANGLE.map((d, i) => (
          <path key={`tl-${i}`} d={d}
            stroke={ITEMS[i].color} strokeWidth="1.3"
            strokeOpacity={i === 2 ? 0.5 : 0.4}
            fill="none"
            strokeDasharray={i % 2 === 0 ? undefined : '4 5'}
          />
        ))}

        {/* ── YOU node — amber, stressed ── */}
        <circle cx={YOU_CX} cy={YOU_CY} r={YOU_R + 22} fill="url(#you-glow)" />
        <circle cx={YOU_CX} cy={YOU_CY} r={YOU_R}
          fill="#09130f" stroke="#e2a44a" strokeWidth="1.5" strokeOpacity="0.65"
        />
        {/* Stress ping */}
        <circle cx={YOU_CX} cy={YOU_CY} r={YOU_R}
          fill="none" stroke="#fab219" strokeWidth="1.5" strokeOpacity="0.25"
          style={{ animation: 'node-ping 1.9s ease-out infinite' }}
        />
        <text x={YOU_CX} y={YOU_CY + 5} textAnchor="middle"
          fontSize="14" fontWeight="700" letterSpacing="1.5" fill="#e2a44a"
          fontFamily="system-ui, sans-serif"
        >YOU</text>

        {/* ── Valet shell ── */}
        <rect x={VALET_X} y={VALET_Y} width={VALET_W} height={VALET_H}
          rx="13" fill="url(#valet-fill)"
          stroke="rgba(99,102,241,0.55)" strokeWidth="1.5"
        />
        {/* Header bar */}
        <rect x={VALET_X} y={VALET_Y} width={VALET_W} height={24} rx="13" fill="rgba(99,102,241,0.2)" />
        <rect x={VALET_X} y={VALET_Y + 12} width={VALET_W} height={12} fill="rgba(99,102,241,0.2)" />
        <text x={VALET_X + VALET_W / 2} y={VALET_Y + 16} textAnchor="middle"
          fontSize="9" fontWeight="800" letterSpacing="3.5" fill="rgba(165,180,252,0.9)"
          fontFamily="system-ui, sans-serif"
        >VALET</text>

        {/* Item chips inside Valet */}
        {ITEMS.map((item) => (
          <g key={`chip-${item.id}`}>
            <rect x={VALET_X + 14} y={item.iy - 13} width={VALET_W - 28} height={26}
              rx="7" fill="#060f1e"
              stroke={item.color} strokeWidth="0.8" strokeOpacity="0.45"
            />
            <circle cx={VALET_X + 27} cy={item.iy} r="4" fill={item.color} fillOpacity="0.8" />
            <text x={VALET_X + 40} y={item.iy + 5}
              fontSize="12" fill="rgba(168,216,240,0.85)"
              fontFamily="system-ui, -apple-system, sans-serif"
            >{item.label}</text>
          </g>
        ))}

        {/* ── CLEAN lines: Valet → Cockpit ── */}
        {CLEAN_YS.map((y, i) => (
          <line key={`cl-${i}`}
            x1={VALET_X + VALET_W} y1={y} x2={COCKPIT_X} y2={y}
            stroke={i < 2 ? '#46cf93' : i < 4 ? '#2563eb' : '#818cf8'}
            strokeWidth="1.6" strokeOpacity={0.55 - i * 0.04}
          />
        ))}
        {/* Arrow at Cockpit entry */}
        <path d={`M${COCKPIT_X - 9},${CLEAN_YS[2] - 5} L${COCKPIT_X},${CLEAN_YS[2]} L${COCKPIT_X - 9},${CLEAN_YS[2] + 5}`}
          stroke="rgba(37,99,235,0.65)" strokeWidth="1.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* ── Cockpit card — prominent, loud ── */}
        <circle cx={COCKPIT_X + COCKPIT_W / 2} cy={COCKPIT_Y + COCKPIT_H / 2} r="95" fill="url(#cockpit-glow)" />
        <rect x={COCKPIT_X} y={COCKPIT_Y} width={COCKPIT_W} height={COCKPIT_H}
          rx="13" fill="#071628"
          stroke="rgba(37,99,235,0.5)" strokeWidth="1.5"
        />
        {/* Green accent top strip */}
        <rect x={COCKPIT_X} y={COCKPIT_Y} width={COCKPIT_W} height={4} rx="3"
          fill="rgba(12,163,12,0.85)"
        />
        {/* Status dot */}
        <circle cx={COCKPIT_X + 20} cy={COCKPIT_Y + 30}
          r="6" fill="#0ca30c"
          style={{ filter: 'drop-shadow(0 0 6px rgba(12,163,12,0.9))' }}
        />
        {/* ALL CLEAR — largest, loudest */}
        <text x={COCKPIT_X + COCKPIT_W / 2} y={COCKPIT_Y + 40} textAnchor="middle"
          fontSize="22" fontWeight="800" letterSpacing="1"
          fill="#0ca30c" fontFamily="system-ui, sans-serif"
          style={{ filter: 'drop-shadow(0 0 10px rgba(12,163,12,0.5))' }}
        >ALL CLEAR</text>
        <text x={COCKPIT_X + COCKPIT_W / 2} y={COCKPIT_Y + 65} textAnchor="middle"
          fontSize="13" fill="rgba(168,216,240,0.75)"
          fontFamily="system-ui, sans-serif"
        >0 need you</text>
        <line
          x1={COCKPIT_X + 18} y1={COCKPIT_Y + 80}
          x2={COCKPIT_X + COCKPIT_W - 18} y2={COCKPIT_Y + 80}
          stroke="rgba(168,216,240,0.1)" strokeWidth="1"
        />
        <text x={COCKPIT_X + COCKPIT_W / 2} y={COCKPIT_Y + 103} textAnchor="middle"
          fontSize="11" letterSpacing="0.8" fill="rgba(168,216,240,0.45)"
          fontFamily="system-ui, sans-serif"
        >one screen · verified</text>

        {/* Mini domain status rows */}
        {[
          { label: 'The House', ok: true  },
          { label: 'Money',     ok: true  },
          { label: 'The Kids',  ok: true  },
        ].map((d, i) => (
          <g key={`dr-${i}`}>
            <rect x={COCKPIT_X + 14} y={COCKPIT_Y + 116 + i * 18} width={COCKPIT_W - 28} height={14}
              rx="4" fill="#060f1e"
              stroke="rgba(12,163,12,0.2)" strokeWidth="0.6"
            />
            <circle cx={COCKPIT_X + 24} cy={COCKPIT_Y + 123 + i * 18} r="2.5" fill="#0ca30c" fillOpacity="0.8" />
            <text x={COCKPIT_X + 33} y={COCKPIT_Y + 128 + i * 18}
              fontSize="9" fill="rgba(168,216,240,0.55)"
              fontFamily="system-ui, sans-serif"
            >{d.label}</text>
          </g>
        ))}

        {/* ── Animated tangled dots (amber chaos) ── */}
        {TANGLE.map((d, i) => (
          <circle key={`td-${i}`} r="3" fill={ITEMS[i].color}
            style={{
              offsetPath: `path("${d}")`,
              animation: `flow-dot 3.4s ease-in-out ${i * 0.68}s infinite`,
              filter: `drop-shadow(0 0 3px ${ITEMS[i].color})`,
            } as React.CSSProperties}
          />
        ))}

        {/* ── Animated clean dots (blue/green calm) ── */}
        {CLEAN_YS.map((y, i) => (
          <circle key={`cd-${i}`} r="2.8"
            fill={i < 2 ? '#46cf93' : '#3b82f6'}
            style={{
              offsetPath: `path("M${VALET_X + VALET_W},${y} L${COCKPIT_X},${y}")`,
              animation: `flow-dot 1.4s ease-in-out ${i * 0.22}s infinite`,
              filter: i < 2
                ? 'drop-shadow(0 0 4px rgba(70,207,147,0.85))'
                : 'drop-shadow(0 0 4px rgba(59,130,246,0.85))',
            } as React.CSSProperties}
          />
        ))}
      </svg>
    </div>
  );
}
