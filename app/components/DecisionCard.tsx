"use client";

import { useState } from "react";

type Phase = "idle" | "yes" | "no" | "maybe";

export default function DecisionCardDemo() {
  const [phase, setPhase] = useState<Phase>("idle");

  function reset() { setPhase("idle"); }

  if (phase === "yes") {
    return (
      <div className="bg-[#0a1628] border border-[#46cf93]/40 rounded-2xl p-6 max-w-sm mx-auto shadow-lg shadow-[#46cf93]/08">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#46cf93]" />
          <span className="text-xs font-semibold text-[#46cf93] uppercase tracking-wider">Receipt</span>
        </div>
        <p className="text-[#f4f7fa] font-semibold mb-1">Added to your calendar</p>
        <p className="text-sm text-[#a8d8f0] mb-1">Fri 10:00am · Golf with John</p>
        <p className="text-xs text-[#a8d8f0]/50 mt-3 leading-relaxed">
          Draft reply queued: &ldquo;Sounds great — see you Friday.&rdquo;
        </p>
        <button onClick={reset} className="mt-4 text-xs text-[#a8d8f0]/35 hover:text-[#a8d8f0]/65 transition-colors">
          ← try another
        </button>
      </div>
    );
  }

  if (phase === "no") {
    return (
      <div className="bg-[#0a1628] border border-[rgba(168,216,240,0.2)] rounded-2xl p-6 max-w-sm mx-auto shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#a8d8f0]/50" />
          <span className="text-xs font-semibold text-[#a8d8f0]/65 uppercase tracking-wider">Draft — not sent yet</span>
        </div>
        <div className="bg-[#12243d] rounded-xl p-4 mb-4 border border-[rgba(168,216,240,0.1)]">
          <p className="text-sm text-[#f4f7fa] italic leading-relaxed">
            &ldquo;Hey John — sorry, can&apos;t make it Friday. Let&apos;s find another time.&rdquo;
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors">
            Send
          </button>
          <button className="flex-1 bg-[#12243d] hover:bg-[#1e3a5f] text-[#a8d8f0] text-xs font-semibold py-2.5 rounded-lg border border-[rgba(168,216,240,0.1)] transition-colors">
            Edit first
          </button>
        </div>
        <p className="text-xs text-[#a8d8f0]/40 text-center mt-3">
          The draft is shown before it goes anywhere.
        </p>
        <button onClick={reset} className="mt-2 text-xs text-[#a8d8f0]/35 hover:text-[#a8d8f0]/65 transition-colors block mx-auto">
          ← try another
        </button>
      </div>
    );
  }

  if (phase === "maybe") {
    return (
      <div className="bg-[#0a1628] border border-[#e2a44a]/30 rounded-2xl p-6 max-w-sm mx-auto shadow-lg shadow-[#e2a44a]/05">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#e2a44a]" />
          <span className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider">Persistence policy</span>
        </div>
        <p className="text-[#f4f7fa] font-semibold mb-3">Here&apos;s how I&apos;ll follow this up:</p>
        <div className="flex flex-col gap-3">
          {[
            "I'll check back once a day until Friday.",
            "Two days out, I'll ask every few hours until you decide.",
            "If Friday arrives with no answer, I'll flag it and decline — unless you say otherwise.",
          ].map((line, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[#e2a44a] text-sm leading-snug flex-shrink-0">→</span>
              <p className="text-sm text-[#a8d8f0] leading-snug">{line}</p>
            </div>
          ))}
        </div>
        <button onClick={reset} className="mt-5 text-xs text-[#a8d8f0]/35 hover:text-[#a8d8f0]/65 transition-colors">
          ← try another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1f38] border border-[rgba(168,216,240,0.18)] rounded-2xl p-6 max-w-sm mx-auto shadow-xl">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-[#a8d8f0]">J</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f4f7fa]">John wants to play golf</p>
          <p className="text-sm text-[#a8d8f0]">Friday at 10:00am</p>
        </div>
        <span className="text-xs text-[#a8d8f0]/35 flex-shrink-0">now</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPhase("yes")}
          className="flex-1 bg-[#46cf93]/12 hover:bg-[#46cf93]/22 border border-[#46cf93]/40 text-[#46cf93] text-sm font-semibold py-3 rounded-xl transition-all duration-150"
        >
          Yes
        </button>
        <button
          onClick={() => setPhase("no")}
          className="flex-1 bg-[rgba(168,216,240,0.06)] hover:bg-[rgba(168,216,240,0.12)] border border-[rgba(168,216,240,0.15)] text-[#a8d8f0] text-sm font-semibold py-3 rounded-xl transition-all duration-150"
        >
          No
        </button>
        <button
          onClick={() => setPhase("maybe")}
          className="flex-1 bg-[#e2a44a]/10 hover:bg-[#e2a44a]/20 border border-[#e2a44a]/30 text-[#e2a44a] text-sm font-semibold py-3 rounded-xl transition-all duration-150"
        >
          Maybe
        </button>
      </div>
    </div>
  );
}
