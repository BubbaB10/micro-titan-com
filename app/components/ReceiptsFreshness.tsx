"use client";

import { useEffect, useState } from "react";

export default function ReceiptsFreshness({ generatedAt }: { generatedAt: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function compute() {
      const diffMs = Date.now() - new Date(generatedAt).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 2) return "just now";
      if (mins < 60) return `${mins} min ago`;
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ${mins % 60}m ago`;
    }
    setLabel(compute());
    const t = setInterval(() => setLabel(compute()), 60000);
    return () => clearInterval(t);
  }, [generatedAt]);

  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#0f1f38] border border-[rgba(168,216,240,0.12)] text-[#a8d8f0]/50">
      <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93]/60" />
      updated {label}
    </span>
  );
}
