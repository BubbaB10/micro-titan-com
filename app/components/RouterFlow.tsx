'use client';

const APPS = [
  { id: 'bi',  label: 'The Bills',          color: '#e2a44a', y: 30  },
  { id: 'ki',  label: "The Kids' Schedule", color: '#46cf93', y: 70  },
  { id: 'ap',  label: 'Appointments',       color: '#818cf8', y: 110 },
  { id: 'ho',  label: 'The House',          color: '#4fb8e8', y: 150 },
  { id: 've',  label: 'The Vehicles',       color: '#a78bfa', y: 190 },
];

const HUB_X = 310;
const HUB_Y = 110;
const APP_X = 100;
const COCKPIT_X = 490;
const COCKPIT_Y = 110;
const W = 620;
const H = 220;

export default function RouterFlow() {
  return (
    <div style={{ width: '100%', overflowX: 'auto', scrollbarWidth: 'none' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
        aria-label="Router flow: every app feeds through you to a single Cockpit view"
      >
        <defs>
          {/* Flow dot paths for each app → hub */}
          {APPS.map((app) => (
            <path
              key={`path-${app.id}`}
              id={`route-${app.id}`}
              d={`M${APP_X + 36},${app.y + 9} Q${(APP_X + HUB_X) / 2},${app.y} ${HUB_X},${HUB_Y}`}
              fill="none"
            />
          ))}
          {/* Hub → Cockpit path */}
          <path id="route-hub" d={`M${HUB_X + 28},${HUB_Y} L${COCKPIT_X},${COCKPIT_Y}`} fill="none" />

          {/* Radial glow for hub */}
          <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cockpit-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ca30c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ca30c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Spoke lines: app → hub ── */}
        {APPS.map((app) => (
          <path
            key={`line-${app.id}`}
            d={`M${APP_X + 36},${app.y + 9} Q${(APP_X + HUB_X) / 2},${app.y} ${HUB_X},${HUB_Y}`}
            stroke={app.color}
            strokeWidth="1"
            strokeOpacity="0.2"
            fill="none"
          />
        ))}

        {/* Hub → Cockpit line */}
        <line
          x1={HUB_X + 28} y1={HUB_Y}
          x2={COCKPIT_X} y2={COCKPIT_Y}
          stroke="rgba(37,99,235,0.4)"
          strokeWidth="1.5"
        />
        <path
          d={`M${COCKPIT_X - 8},${COCKPIT_Y - 4} L${COCKPIT_X},${COCKPIT_Y} L${COCKPIT_X - 8},${COCKPIT_Y + 4}`}
          stroke="rgba(37,99,235,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* ── App nodes ── */}
        {APPS.map((app) => (
          <g key={`node-${app.id}`}>
            <rect
              x={APP_X} y={app.y} width={96} height={18}
              rx="5"
              fill="#060f1e"
              stroke={app.color}
              strokeWidth="0.8"
              strokeOpacity="0.45"
            />
            <circle cx={APP_X + 9} cy={app.y + 9} r="2.5" fill={app.color} fillOpacity="0.75" />
            <text
              x={APP_X + 18} y={app.y + 12.5}
              fontSize="8" fill="rgba(168,216,240,0.75)"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {app.label}
            </text>
          </g>
        ))}

        {/* ── Hub node: YOU ── */}
        <circle cx={HUB_X} cy={HUB_Y} r="42" fill="url(#hub-glow)" />
        <circle cx={HUB_X} cy={HUB_Y} r="27" fill="#07101e" stroke="rgba(37,99,235,0.5)" strokeWidth="1.5" />
        {/* Ping ring */}
        <circle cx={HUB_X} cy={HUB_Y} r="27" fill="none" stroke="rgba(37,99,235,0.25)" strokeWidth="1.5"
          style={{ animation: 'node-ping 2.4s ease-out infinite' }}
        />
        <text x={HUB_X} y={HUB_Y - 4} textAnchor="middle"
          fontSize="9" fontWeight="700" letterSpacing="2"
          fill="rgba(168,216,240,0.9)" fontFamily="system-ui, sans-serif"
        >
          YOU
        </text>
        <text x={HUB_X} y={HUB_Y + 10} textAnchor="middle"
          fontSize="7" fill="rgba(37,99,235,0.7)" fontFamily="system-ui, sans-serif"
          letterSpacing="0.5"
        >
          the router
        </text>

        {/* ── Cockpit node ── */}
        <rect
          x={COCKPIT_X} y={COCKPIT_Y - 28} width={110} height={56}
          rx="9"
          fill="#08162e" stroke="rgba(37,99,235,0.5)" strokeWidth="1.5"
        />
        <rect
          x={COCKPIT_X} y={COCKPIT_Y - 28} width={110} height={3}
          rx="2" fill="rgba(37,99,235,0.6)"
        />
        <circle cx={COCKPIT_X + 55} cy={COCKPIT_Y - 28 + 3} r="24" fill="url(#cockpit-glow)" />
        {/* Verdict dot */}
        <circle cx={COCKPIT_X + 14} cy={COCKPIT_Y + 1} r="4" fill="#0ca30c"
          style={{ filter: 'drop-shadow(0 0 4px rgba(12,163,12,0.8))' }}
        />
        <text x={COCKPIT_X + 55} y={COCKPIT_Y - 6} textAnchor="middle"
          fontSize="9.5" fontWeight="700" letterSpacing="1.5"
          fill="rgba(168,216,240,0.9)" fontFamily="system-ui, sans-serif"
        >
          COCKPIT
        </text>
        <text x={COCKPIT_X + 55} y={COCKPIT_Y + 8} textAnchor="middle"
          fontSize="7.5" fill="#0ca30c" fontFamily="system-ui, sans-serif"
        >
          All clear · 0 need you
        </text>
        <text x={COCKPIT_X + 55} y={COCKPIT_Y + 19} textAnchor="middle"
          fontSize="7" fill="rgba(168,216,240,0.35)" fontFamily="system-ui, sans-serif"
        >
          one screen · verified
        </text>

        {/* ── Animated flow dots: app → hub ── */}
        {APPS.map((app, i) => (
          <circle
            key={`dot-${app.id}`}
            r="3"
            fill={app.color}
            style={{
              offsetPath: `path("M${APP_X + 36},${app.y + 9} Q${(APP_X + HUB_X) / 2},${app.y} ${HUB_X},${HUB_Y}")`,
              animation: `flow-dot 2.8s ease-in-out ${i * 0.56}s infinite`,
              filter: `drop-shadow(0 0 3px ${app.color})`,
            } as React.CSSProperties}
          />
        ))}

        {/* Flow dot: hub → cockpit */}
        <circle
          r="3.5"
          fill="#2563eb"
          style={{
            offsetPath: `path("M${HUB_X + 28},${HUB_Y} L${COCKPIT_X},${COCKPIT_Y}")`,
            animation: `flow-dot 1.8s ease-in-out 0.9s infinite`,
            filter: 'drop-shadow(0 0 4px rgba(37,99,235,0.9))',
          } as React.CSSProperties}
        />
      </svg>
    </div>
  );
}
