'use client';

const BG = '#050c1a';
const TRACK = 'rgba(168,216,240,0.08)';
const TEXT = 'rgba(168,216,240,0.85)';
const DIM = 'rgba(168,216,240,0.4)';
const GREEN = '#0ca30c';
const AMBER = '#e2a44a';
const BLUE = '#2563eb';
const VIOLET = '#818cf8';

// Busy Parent — grocery spend per day (14 days), trending down
const GROCERY = [38, 42, 33, 29, 36, 45, 31, 24, 22, 18, 20, 26, 18, 12];
// Days (0-indexed out of 14) with kids activity logged (3 total)
const KIDS_ACTIVE = new Set([2, 6, 10]);
// Days with chores done (4 total)
const CHORES_DONE = new Set([1, 4, 7, 11]);

// Business Owner — daily order counts (weekend peaks at indices 2,3 and 9,10)
const ORDERS = [12, 18, 34, 41, 15, 11, 8, 22, 19, 37, 44, 17, 13, 9];
// Revenue per day ($k)
const REVENUE = [1.2, 1.8, 3.4, 4.1, 1.5, 1.1, 0.8, 2.2, 1.9, 3.7, 4.4, 1.7, 1.3, 0.9];

function TrendLine({ data, color, note }: { data: number[]; color: string; note: string }) {
  const W = 130, H = 34;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - 2 - ((v - min) / span) * (H - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `0,${H} ${pts} ${W},${H}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0, overflow: 'visible' }}>
        <polygon points={area} fill={`${color}18`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 8, color: DIM, whiteSpace: 'nowrap' }}>{note}</span>
    </div>
  );
}

function DotRow({ total, filled, color }: { total: number; filled: Set<number>; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: filled.has(i) ? color : TRACK,
            boxShadow: filled.has(i) ? `0 0 4px ${color}80` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueColor,
  children,
  warn,
}: {
  label: string;
  value: string;
  valueColor: string;
  children: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div
      style={{
        marginBottom: 7,
        padding: '6px 8px',
        background: '#060f1e',
        borderRadius: 7,
        border: `1px solid ${warn ? 'rgba(250,178,25,0.25)' : TRACK}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 8, color: TEXT }}>{label}</span>
        <span style={{ fontSize: 9, fontWeight: 600, color: valueColor }}>{value}</span>
      </div>
      {children}
    </div>
  );
}

export default function PersonaMetricsCard({ persona }: { persona: 'parent' | 'business' }) {
  const header = persona === 'parent' ? 'The Week at Home' : '14-DAY Business Activity';

  return (
    <div style={{ background: BG, padding: '12px 13px 14px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
        <span style={{ fontSize: 7, fontWeight: 700, color: DIM, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {header}
        </span>
        <span style={{ fontSize: 6.5, color: 'rgba(168,216,240,0.2)', letterSpacing: '0.08em' }}>SAMPLE DATA</span>
      </div>

      {persona === 'parent' ? (
        <>
          {/* Grocery spend — money → trend line */}
          <MetricRow label="Grocery $" value="$412" valueColor={AMBER}>
            <TrendLine data={GROCERY} color={AMBER} note="↓ trending down" />
          </MetricRow>

          {/* Kids activities — count → discrete day dots */}
          <MetricRow label="Kids activities" value="3 logged" valueColor={GREEN}>
            <DotRow total={14} filled={KIDS_ACTIVE} color={GREEN} />
          </MetricRow>

          {/* Chores done — count → discrete day dots */}
          <MetricRow label="Chores done" value="4 done" valueColor={VIOLET} warn={false}>
            <DotRow total={14} filled={CHORES_DONE} color={VIOLET} />
          </MetricRow>
        </>
      ) : (
        <>
          {/* Daily orders — money/count → trend, weekend peaks visible */}
          <MetricRow label="Daily orders" value="↑ wknd peaks" valueColor={BLUE}>
            <TrendLine data={ORDERS} color={BLUE} note="orders / day" />
          </MetricRow>

          {/* Revenue MTD — money → trend */}
          <MetricRow label="Revenue MTD" value="$29.4k" valueColor={GREEN}>
            <TrendLine data={REVENUE} color={GREEN} note="$ k / day" />
          </MetricRow>

          {/* Invoice aging — table, no chart */}
          <MetricRow label="Invoice Aging" value="⚠ overdue" valueColor={AMBER} warn>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 7.5, color: DIM }}>Acme Corp · 45 days</span>
              <span style={{ fontSize: 7.5, fontWeight: 600, color: AMBER }}>$2,340</span>
            </div>
          </MetricRow>
        </>
      )}
    </div>
  );
}
