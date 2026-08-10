// Static proof visual: system flow — YOUR BUSINESS → MT BUILDS → SOFTWARE → AVER → YOU
// Static-first (no animation); animation pass 2. Scrollable on mobile.
export default function HeroSystemDiagram() {
  const C = {
    bg: "#060b18",
    cyan: "rgba(79,184,232,0.9)",
    cyanBorder: "rgba(79,184,232,0.28)",
    cyanBar: "rgba(79,184,232,0.65)",
    violet: "#818cf8",
    violetBorder: "rgba(129,140,248,0.45)",
    violetFill: "rgba(129,140,248,0.05)",
    green: "#46cf93",
    greenBorder: "rgba(70,207,147,0.45)",
    greenFill: "rgba(70,207,147,0.04)",
    amber: "rgba(226,164,74,0.75)",
    connector: "rgba(168,216,240,0.28)",
    connectorGreen: "rgba(70,207,147,0.4)",
    muted: "rgba(168,216,240,0.55)",
  };

  return (
    <div style={{ width: "100%", overflowX: "auto", scrollbarWidth: "none" }}>
      <svg
        viewBox="0 0 800 158"
        width="800"
        height="158"
        style={{ display: "block", margin: "0 auto" }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="System flow: Your Business feeds Micro Titan, who builds Your Software, which Valet monitors, delivering verified insight to You."
      >
        <defs>
          <marker id="hsd-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5" fill="none" stroke={C.connector} strokeWidth="0.9" />
          </marker>
          <marker id="hsd-arr-g" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,1 L5,3 L0,5" fill="none" stroke={C.connectorGreen} strokeWidth="0.9" />
          </marker>
        </defs>

        {/* ── Connector lines ── */}
        <line x1="182" y1="80" x2="198" y2="80" stroke={C.connector} strokeWidth="1" markerEnd="url(#hsd-arr)" />
        <line x1="322" y1="80" x2="338" y2="80" stroke={C.connector} strokeWidth="1" markerEnd="url(#hsd-arr)" />
        <line x1="462" y1="80" x2="478" y2="80" stroke={C.connector} strokeWidth="1" markerEnd="url(#hsd-arr)" />
        <line x1="622" y1="80" x2="638" y2="80" stroke={C.connectorGreen} strokeWidth="1" markerEnd="url(#hsd-arr-g)" />

        {/* ── Node 1: YOUR BUSINESS ── */}
        <rect x="60" y="54" width="120" height="52" rx="7" fill={C.bg} stroke={C.cyanBorder} strokeWidth="1" />
        <rect x="60" y="54" width="120" height="3" rx="2" fill={C.cyanBar} />
        <text x="120" y="78" textAnchor="middle" fill={C.cyan} fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">YOUR</text>
        <text x="120" y="92" textAnchor="middle" fill={C.cyan} fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">BUSINESS</text>

        {/* ── Node 2: MICRO TITAN BUILDS ── */}
        <rect x="200" y="54" width="120" height="52" rx="7" fill={C.bg} stroke="rgba(129,140,248,0.22)" strokeWidth="1" />
        <rect x="200" y="54" width="120" height="3" rx="2" fill="rgba(129,140,248,0.55)" />
        <text x="260" y="78" textAnchor="middle" fill="rgba(129,140,248,0.85)" fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">MICRO TITAN</text>
        <text x="260" y="92" textAnchor="middle" fill="rgba(129,140,248,0.85)" fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">BUILDS</text>

        {/* ── Node 3: YOUR SOFTWARE ── */}
        <rect x="340" y="54" width="120" height="52" rx="7" fill={C.bg} stroke={C.cyanBorder} strokeWidth="1" />
        <rect x="340" y="54" width="120" height="3" rx="2" fill={C.cyanBar} />
        <text x="400" y="78" textAnchor="middle" fill={C.cyan} fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">YOUR</text>
        <text x="400" y="92" textAnchor="middle" fill={C.cyan} fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">SOFTWARE</text>

        {/* ── Node 4: AVER WATCHES (taller, signal tags inside) ── */}
        <rect x="480" y="38" width="140" height="84" rx="7" fill={C.violetFill} stroke={C.violetBorder} strokeWidth="1" />
        <rect x="480" y="38" width="140" height="3" rx="2" fill={C.violet} />
        <text x="550" y="64" textAnchor="middle" fill={C.violet} fontSize="11" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui,sans-serif">AVER</text>
        <text x="550" y="78" textAnchor="middle" fill={C.violet} fontSize="11" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui,sans-serif">WATCHES</text>
        {/* Signal tags */}
        <text x="492" y="97" fill={C.green} fontSize="7.5" fontFamily="system-ui,sans-serif">● Health</text>
        <text x="543" y="97" fill={C.green} fontSize="7.5" fontFamily="system-ui,sans-serif">● Revenue</text>
        <text x="492" y="111" fill="rgba(129,140,248,0.75)" fontSize="7.5" fontFamily="system-ui,sans-serif">● Decisions</text>
        <text x="552" y="111" fill={C.amber} fontSize="7.5" fontFamily="system-ui,sans-serif">● Issues</text>

        {/* ── Node 5: YOU ── */}
        <rect x="640" y="54" width="104" height="52" rx="7" fill={C.greenFill} stroke={C.greenBorder} strokeWidth="1" />
        <rect x="640" y="54" width="104" height="3" rx="2" fill={C.green} />
        <text x="692" y="80" textAnchor="middle" fill={C.green} fontSize="14" fontWeight="700" letterSpacing="3" fontFamily="system-ui,sans-serif">YOU</text>
        <text x="692" y="95" textAnchor="middle" fill="rgba(70,207,147,0.5)" fontSize="7" letterSpacing="0.8" fontFamily="system-ui,sans-serif">✓ INFORMED</text>
      </svg>
    </div>
  );
}
