'use client';

const C = {
  bg: '#050c1a',
  frame: '#142038',
  border: 'rgba(255,255,255,0.07)',
  green: '#0ca30c',
  violet: '#818cf8',
  text: '#a8d8f0',
  dim: 'rgba(168,216,240,0.4)',
  faint: 'rgba(168,216,240,0.18)',
};

export default function CockpitDevice() {
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: '-50px',
        background: 'radial-gradient(ellipse at 50% 55%, rgba(12,163,12,0.13) 0%, rgba(37,99,235,0.07) 45%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Phone bezel */}
      <div style={{
        width: 228,
        background: C.bg,
        border: `7px solid ${C.frame}`,
        borderRadius: 38,
        boxShadow: `0 40px 90px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04)`,
        overflow: 'hidden',
        animation: 'device-float 5s ease-in-out infinite',
        position: 'relative',
      }}>
        {/* Pill notch */}
        <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
          <div style={{ width: 56, height: 5, borderRadius: 3, background: C.frame }} />
        </div>

        {/* Screen */}
        <div style={{ padding: '8px 11px 14px', minHeight: 360 }}>
          {/* Masthead */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: C.dim, letterSpacing: '0.15em' }}>COCKPIT</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
              <span style={{ fontSize: 7, color: C.dim }}>live</span>
            </div>
          </div>

          {/* Verdict chip */}
          <div style={{
            background: 'rgba(12,163,12,0.1)',
            border: '1px solid rgba(12,163,12,0.35)',
            borderRadius: 8, padding: '6px 9px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0,
              boxShadow: '0 0 6px rgba(12,163,12,0.7)',
            }} />
            <span style={{ fontSize: 8.5, fontWeight: 700, color: C.green, letterSpacing: '0.07em' }}>ALL CLEAR</span>
            <span style={{ marginLeft: 'auto', fontSize: 7, color: C.dim }}>0 need you</span>
          </div>

          {/* Domain cards */}
          {[
            { label: 'The House', note: 'covered' },
            { label: 'Money',     note: 'covered' },
            { label: 'The Kids',  note: 'covered' },
            { label: 'Health',    note: 'covered' },
          ].map((d) => (
            <div key={d.label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 8px', marginBottom: 3,
              background: '#060f1e',
              border: '1px solid rgba(168,216,240,0.07)',
              borderLeft: '2px solid rgba(12,163,12,0.45)',
              borderRadius: 6,
            }}>
              <span style={{ color: C.green, fontSize: 7.5 }}>✓</span>
              <span style={{ color: C.text, fontSize: 8 }}>{d.label}</span>
              <span style={{ marginLeft: 'auto', color: C.faint, fontSize: 7 }}>{d.note}</span>
            </div>
          ))}

          {/* Decision card */}
          <div style={{
            marginTop: 9, padding: '7px 9px',
            background: '#0a1628',
            border: '1px solid rgba(129,140,248,0.25)',
            borderRadius: 9,
          }}>
            <div style={{ fontSize: 7.5, color: C.dim, marginBottom: 6, lineHeight: 1.4 }}>
              John wants to golf Saturday?
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { label: 'Yes',   accent: C.green,  bg: 'rgba(12,163,12,0.15)',   border: 'rgba(12,163,12,0.4)' },
                { label: 'No',    accent: C.text,    bg: 'rgba(129,140,248,0.06)', border: 'rgba(129,140,248,0.2)' },
                { label: 'Maybe', accent: C.text,    bg: 'rgba(129,140,248,0.06)', border: 'rgba(129,140,248,0.2)' },
              ].map((opt) => (
                <div key={opt.label} style={{
                  flex: 1, textAlign: 'center', fontSize: 7, fontWeight: 600,
                  padding: '3px 0', background: opt.bg,
                  border: `1px solid ${opt.border}`, borderRadius: 5,
                  color: opt.accent,
                }}>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom pulse bar */}
          <div style={{
            marginTop: 10, height: 2, borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${C.green}55, transparent)`,
            animation: 'pulse-bar 2.8s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
