// Static gate-flow proof visual for the /aver page.
// Shows both paths: claim → verify → PASS (delivered) and INSUFFICIENT EVIDENCE → NOT SENT.
// The failure beat is mandatory and visually prominent — per spec.
export default function AverGateFlow() {
  const C = {
    bg: "#060b18",
    cyan: "rgba(79,184,232,0.85)",
    cyanBorder: "rgba(79,184,232,0.28)",
    cyanBar: "rgba(79,184,232,0.6)",
    violet: "#818cf8",
    violetBorder: "rgba(129,140,248,0.5)",
    violetFill: "rgba(129,140,248,0.06)",
    violetBar: "#818cf8",
    green: "#46cf93",
    greenBorder: "rgba(70,207,147,0.5)",
    greenFill: "rgba(70,207,147,0.06)",
    greenBar: "#46cf93",
    red: "#f87171",
    redBorder: "rgba(248,113,113,0.5)",
    redFill: "rgba(248,113,113,0.06)",
    redBar: "#f87171",
    connector: "rgba(168,216,240,0.3)",
    connectorG: "rgba(70,207,147,0.4)",
    connectorR: "rgba(248,113,113,0.4)",
    muted: "rgba(168,216,240,0.4)",
  };

  // Vertical stack: y positions for each step
  const N1 = { x: 170, y: 10, w: 200, h: 44 }; // YOUR CLAIM
  const N2 = { x: 170, y: 76, w: 200, h: 44 };  // AVER ACTS
  const N3 = { x: 155, y: 142, w: 230, h: 44 }; // EVIDENCE COLLECTED
  const N4 = { x: 150, y: 208, w: 240, h: 48 }; // GATE VERIFIES (slightly taller)
  // Branch at y=256+
  const N5 = { x: 14, y: 290, w: 174, h: 48 };  // PASS → ANSWER DELIVERED
  const N6 = { x: 350, y: 290, w: 182, h: 64 }; // INSUFFICIENT EVIDENCE / NOT SENT

  const cx = (n: { x: number; w: number }) => n.x + n.w / 2;
  const bot = (n: { y: number; h: number }) => n.y + n.h;
  const top = (n: { y: number }) => n.y;

  // Branch split y
  const branchY = bot(N4) + 20; // y=276

  return (
    <div style={{ width: "100%", maxWidth: 548, margin: "0 auto" }}>
      <svg
        viewBox="0 0 548 368"
        style={{ width: "100%", height: "auto", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Gate flow: A claim enters, Aver acts, evidence is collected, the gate verifies. If evidence is sufficient, the answer is delivered. If insufficient, nothing is sent."
      >
        <defs>
          <marker id="agf-a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0.5,0.5 L5.5,3 L0.5,5.5" fill="none" stroke={C.connector} strokeWidth="0.9" />
          </marker>
          <marker id="agf-g" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0.5,0.5 L5.5,3 L0.5,5.5" fill="none" stroke={C.connectorG} strokeWidth="0.9" />
          </marker>
          <marker id="agf-r" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0.5,0.5 L5.5,3 L0.5,5.5" fill="none" stroke={C.connectorR} strokeWidth="0.9" />
          </marker>
        </defs>

        {/* ── Vertical connectors (main spine) ── */}
        <line x1={cx(N1)} y1={bot(N1)} x2={cx(N2)} y2={top(N2)} stroke={C.connector} strokeWidth="1" markerEnd="url(#agf-a)" />
        <line x1={cx(N2)} y1={bot(N2)} x2={cx(N3)} y2={top(N3)} stroke={C.connector} strokeWidth="1" markerEnd="url(#agf-a)" />
        <line x1={cx(N3)} y1={bot(N3)} x2={cx(N4)} y2={top(N4)} stroke={C.connector} strokeWidth="1" markerEnd="url(#agf-a)" />

        {/* ── Branch from bottom of GATE node ── */}
        {/* down to branch junction */}
        <line x1={cx(N4)} y1={bot(N4)} x2={cx(N4)} y2={branchY} stroke={C.connector} strokeWidth="1" />
        {/* left branch → PASS */}
        <line x1={cx(N4)} y1={branchY} x2={cx(N5)} y2={branchY} stroke={C.connectorG} strokeWidth="1" />
        <line x1={cx(N5)} y1={branchY} x2={cx(N5)} y2={N5.y} stroke={C.connectorG} strokeWidth="1" markerEnd="url(#agf-g)" />
        {/* right branch → INSUFFICIENT */}
        <line x1={cx(N4)} y1={branchY} x2={cx(N6)} y2={branchY} stroke={C.connectorR} strokeWidth="1" />
        <line x1={cx(N6)} y1={branchY} x2={cx(N6)} y2={N6.y} stroke={C.connectorR} strokeWidth="1" markerEnd="url(#agf-r)" />

        {/* Branch labels */}
        <text x={cx(N5) + 10} y={branchY - 5} fill={C.green} fontSize="8" fontWeight="700" letterSpacing="0.8" fontFamily="system-ui,sans-serif">PASS</text>
        <text x={cx(N6) - 42} y={branchY - 5} fill={C.red} fontSize="8" fontWeight="700" letterSpacing="0.8" fontFamily="system-ui,sans-serif">FAIL</text>

        {/* ── Node 1: YOUR CLAIM ── */}
        <rect x={N1.x} y={N1.y} width={N1.w} height={N1.h} rx="7" fill={C.bg} stroke={C.cyanBorder} strokeWidth="1" />
        <rect x={N1.x} y={N1.y} width={N1.w} height="3" rx="2" fill={C.cyanBar} />
        <text x={cx(N1)} y={N1.y + 19} textAnchor="middle" fill={C.cyan} fontSize="8" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui,sans-serif">YOUR CLAIM</text>
        <text x={cx(N1)} y={N1.y + 33} textAnchor="middle" fill={C.muted} fontSize="7" fontFamily="system-ui,sans-serif">enters the system</text>

        {/* ── Node 2: AVER ACTS ── */}
        <rect x={N2.x} y={N2.y} width={N2.w} height={N2.h} rx="7" fill={C.bg} stroke="rgba(129,140,248,0.25)" strokeWidth="1" />
        <rect x={N2.x} y={N2.y} width={N2.w} height="3" rx="2" fill="rgba(129,140,248,0.55)" />
        <text x={cx(N2)} y={N2.y + 19} textAnchor="middle" fill="rgba(129,140,248,0.85)" fontSize="8" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui,sans-serif">AVER ACTS</text>
        <text x={cx(N2)} y={N2.y + 33} textAnchor="middle" fill={C.muted} fontSize="7" fontFamily="system-ui,sans-serif">tasks executed, sources checked</text>

        {/* ── Node 3: EVIDENCE COLLECTED ── */}
        <rect x={N3.x} y={N3.y} width={N3.w} height={N3.h} rx="7" fill={C.bg} stroke={C.cyanBorder} strokeWidth="1" />
        <rect x={N3.x} y={N3.y} width={N3.w} height="3" rx="2" fill={C.cyanBar} />
        <text x={cx(N3)} y={N3.y + 19} textAnchor="middle" fill={C.cyan} fontSize="8" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui,sans-serif">EVIDENCE COLLECTED</text>
        <text x={cx(N3)} y={N3.y + 33} textAnchor="middle" fill={C.muted} fontSize="7" fontFamily="system-ui,sans-serif">raw data, receipts, primary sources</text>

        {/* ── Node 4: GATE VERIFIES (prominent violet) ── */}
        <rect x={N4.x} y={N4.y} width={N4.w} height={N4.h} rx="7" fill={C.violetFill} stroke={C.violetBorder} strokeWidth="1.2" />
        <rect x={N4.x} y={N4.y} width={N4.w} height="3" rx="2" fill={C.violetBar} />
        <text x={cx(N4)} y={N4.y + 20} textAnchor="middle" fill={C.violet} fontSize="10" fontWeight="700" letterSpacing="1.8" fontFamily="system-ui,sans-serif">GATE VERIFIES</text>
        <text x={cx(N4)} y={N4.y + 35} textAnchor="middle" fill="rgba(129,140,248,0.6)" fontSize="7" fontFamily="system-ui,sans-serif">owner-defined checks · mechanical · not advisory</text>

        {/* ── Node 5: ANSWER DELIVERED (green / success) ── */}
        <rect x={N5.x} y={N5.y} width={N5.w} height={N5.h} rx="7" fill={C.greenFill} stroke={C.greenBorder} strokeWidth="1" />
        <rect x={N5.x} y={N5.y} width={N5.w} height="3" rx="2" fill={C.greenBar} />
        <text x={cx(N5)} y={N5.y + 19} textAnchor="middle" fill={C.green} fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">✓ ANSWER</text>
        <text x={cx(N5)} y={N5.y + 33} textAnchor="middle" fill={C.green} fontSize="9" fontWeight="700" letterSpacing="1.2" fontFamily="system-ui,sans-serif">DELIVERED</text>

        {/* ── Node 6: INSUFFICIENT EVIDENCE / NOT SENT (red / failure — mandatory per spec) ── */}
        <rect x={N6.x} y={N6.y} width={N6.w} height={N6.h} rx="7" fill={C.redFill} stroke={C.redBorder} strokeWidth="1.2" />
        <rect x={N6.x} y={N6.y} width={N6.w} height="3" rx="2" fill={C.redBar} />
        <text x={cx(N6)} y={N6.y + 19} textAnchor="middle" fill={C.red} fontSize="8.5" fontWeight="700" letterSpacing="1.0" fontFamily="system-ui,sans-serif">INSUFFICIENT</text>
        <text x={cx(N6)} y={N6.y + 33} textAnchor="middle" fill={C.red} fontSize="8.5" fontWeight="700" letterSpacing="1.0" fontFamily="system-ui,sans-serif">EVIDENCE</text>
        <text x={cx(N6)} y={N6.y + 50} textAnchor="middle" fill="rgba(248,113,113,0.55)" fontSize="8" fontWeight="600" letterSpacing="0.8" fontFamily="system-ui,sans-serif">— NOT SENT —</text>
      </svg>
    </div>
  );
}
