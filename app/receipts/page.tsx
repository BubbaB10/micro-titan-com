import fs from "fs";
import path from "path";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ReceiptsFreshness from "../components/ReceiptsFreshness";

export const metadata = {
  title: "Gate Ledger — Micro Titan",
  description: "The real gate ledger: every verified completion across the Micro Titan portfolio, rolling 90 days. Not marketing — the actual output of the mechanical gate.",
};

interface Receipt {
  app: string;
  verifiedAt: string;
  head: string;
  filesChanged: number;
}

interface ReceiptsData {
  generatedAt: string;
  windowDays: number;
  totalInWindow: number;
  perApp: Record<string, number>;
  failuresRecordedSince: string | null;
  receipts: Receipt[];
}

const APP_DISPLAY: Record<string, string> = {
  "fairway-bets":       "Fairway Bets",
  "sandwich-etc":       "Sandwich Etc.",
  "mineral-ledger":     "Mineral Ledger",
  "micro-titan-web":    "micro-titan.com",
  "micro-titan-hq":     "MT HQ Dashboard",
  "micro-titan-base":   "MT OS",
  "the-download":       "The Download",
  "ripple-the-download":"The Download",
  "rosewood":           "Rosewood Dine",
  "pgcc":               "The Club",
  "property-os":        "Property OS",
  "greg-installer":     "Greg (agent)",
};

function displayApp(app: string): string {
  return APP_DISPLAY[app] ?? app;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function loadData(): ReceiptsData | null {
  try {
    const p = path.join(process.cwd(), "data", "receipts-public.json");
    return JSON.parse(fs.readFileSync(p, "utf8")) as ReceiptsData;
  } catch {
    return null;
  }
}

// Merge ripple-the-download entries with the-download for display
function mergePerApp(perApp: Record<string, number>): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const [app, count] of Object.entries(perApp)) {
    const key = app === "ripple-the-download" ? "the-download" : app;
    merged[key] = (merged[key] ?? 0) + count;
  }
  return merged;
}

export default function ReceiptsPage() {
  const data = loadData();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
        <Nav />
        <section className="pt-36 pb-24 px-4 text-center">
          <p className="text-[#a8d8f0]/60">Feed not yet available — check back shortly.</p>
        </section>
        <Footer />
      </div>
    );
  }

  const mergedPerApp = mergePerApp(data.perApp);
  const sortedApps = Object.entries(mergedPerApp).sort((a, b) => b[1] - a[1]);

  // Merge receipt entries too
  const receipts = data.receipts.map(r => ({
    ...r,
    app: r.app === "ripple-the-download" ? "the-download" : r.app,
  }));

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-14 px-4 text-center border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-5">Gate ledger</p>
          <h1
            className="text-4xl sm:text-5xl font-[300] leading-tight tracking-tight text-[#f4f7fa] mb-5"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            {data.totalInWindow} verified completions<br />
            <span className="text-[#a8d8f0]/60">in the last {data.windowDays} days</span>
          </h1>
          <p className="text-base text-[#a8d8f0] font-light max-w-xl mx-auto mb-6 leading-relaxed">
            This feed is the actual gate ledger, not marketing. Every entry is a task that passed owner-defined checks run against the real app code — not a self-report, not a summary.
          </p>
          <ReceiptsFreshness generatedAt={data.generatedAt} />
        </div>
      </section>

      {/* ── HONEST FAILURE FRAMING ─────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-[#07101e] border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0f1f38] border border-[#e2a44a]/20 rounded-xl px-6 py-5">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#e2a44a] mb-3">What this ledger records — and what it doesn&apos;t</p>
            <p className="text-sm text-[#a8d8f0] leading-relaxed">
              This ledger records completions that survived the gate. Failed attempts never enter it — they bounce back to the agent.
              A public record of the gate&apos;s blocks is coming; it starts counting the day we ship it, not retroactively.
              A long list of PASSes doesn&apos;t mean zero failures — it means failures never slipped through as completions.
            </p>
          </div>
        </div>
      </section>

      {/* ── PER-APP COUNTS ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-6">By app</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedApps.map(([app, count]) => (
              <div
                key={app}
                className="bg-[#0f1f38] border border-[rgba(168,216,240,0.1)] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <span className="text-sm text-[#a8d8f0] truncate mr-3">{displayApp(app)}</span>
                <span className="text-base font-semibold text-[#f4f7fa] tabular-nums flex-shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLLING RECEIPT LIST ───────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-6">All receipts · newest first</p>

          <div className="flex flex-col divide-y divide-[rgba(168,216,240,0.06)]">
            {receipts.map((r, i) => (
              <div key={i} className="py-3 flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-[#f4f7fa] w-36 flex-shrink-0">{displayApp(r.app)}</span>
                <span className="text-xs text-[#a8d8f0]/50 w-28 flex-shrink-0">{formatDate(r.verifiedAt)}</span>
                <span className="text-xs text-[#a8d8f0]/35">{formatTime(r.verifiedAt)}</span>
                <code className="ml-auto text-xs font-mono text-[#818cf8]/70 flex-shrink-0">{r.head}</code>
                <span className="text-xs text-[#a8d8f0]/35 flex-shrink-0 w-20 text-right">{r.filesChanged} {r.filesChanged === 1 ? "file" : "files"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-t border-[rgba(168,216,240,0.08)] bg-[#07101e]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-[300] text-[#f4f7fa] mb-3" style={{ fontFamily: "var(--font-mulish)" }}>
            See how the gate works
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/why-provable"
              className="inline-flex items-center justify-center gap-2 bg-[#12243d] hover:bg-[#1e3a5f] border border-[rgba(168,216,240,0.15)] text-[#f4f7fa] font-semibold px-6 py-3 rounded-xl text-sm transition-all"
            >
              How provability works →
            </Link>
            <Link
              href="/valet"
              className="inline-flex items-center justify-center gap-2 text-[#a8d8f0]/60 hover:text-[#c7d2fe] text-sm transition-colors px-4 py-3"
            >
              Meet Valet →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
