"use client";

import { useState, useRef } from "react";

export default function HeroChatInput() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    window.location.href = `https://download.micro-titan.com?seed=${encodeURIComponent(trimmed)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <div className="relative flex items-center bg-[#0f1f38] border border-[rgba(168,216,240,0.2)] rounded-xl overflow-hidden focus-within:border-[rgba(168,216,240,0.4)] transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell the agent one thing on your plate right now…"
          className="flex-1 bg-transparent px-4 py-3.5 text-sm text-[#f4f7fa] placeholder-[#a8d8f0]/30 outline-none"
        />
        <button
          type="submit"
          className="flex-shrink-0 mr-2 px-4 py-2 rounded-lg bg-[#818cf8]/20 hover:bg-[#818cf8]/35 text-[#c7d2fe] text-sm font-semibold transition-colors"
        >
          →
        </button>
      </div>
      <p className="text-center text-xs text-[#a8d8f0]/30 mt-2">free · no signup · the real agent</p>
    </form>
  );
}
