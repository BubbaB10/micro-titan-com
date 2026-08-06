"use client";

import { useState } from "react";

type Variant = "hero" | "inline";

interface Props {
  variant?: Variant;
  source?: string; // where on the page (for Formspree metadata)
}

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

export default function EmailCapture({ variant = "inline", source = "page" }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error" | "email_fallback">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "submitting") return;

    setState("submitting");
    setErrorMsg("");

    if (!FORMSPREE_ID) {
      setState("email_fallback");
      return;
    }

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setState("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.errors?.[0]?.message ?? "Something went wrong — try again.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error — check your connection and try again.");
      setState("error");
    }
  }

  if (state === "email_fallback") {
    return (
      <div
        className={`flex flex-col items-center gap-3 ${
          variant === "hero" ? "py-4" : "py-2"
        }`}
      >
        <p className={`text-[#a8d8f0] text-center ${variant === "hero" ? "text-sm" : "text-xs"}`}>
          Email us and we&apos;ll send the guide directly:
        </p>
        <a
          href="mailto:hello@micro-titan.com?subject=Nothing%20Slips%20Guide"
          className={`font-semibold text-[#818cf8] hover:text-[#c7d2fe] transition-colors underline underline-offset-2 ${variant === "hero" ? "text-base" : "text-sm"}`}
        >
          hello@micro-titan.com
        </a>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div
        className={`flex flex-col items-center gap-3 ${
          variant === "hero" ? "py-4" : "py-2"
        }`}
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <circle cx="10" cy="10" r="9" stroke="#46cf93" strokeWidth="1.5" />
            <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#46cf93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className={`font-semibold text-[#46cf93] ${variant === "hero" ? "text-base" : "text-sm"}`}>
            You&apos;re in. Your guide is ready.
          </p>
        </div>
        <a
          href="/guide"
          className="text-sm font-semibold text-[#818cf8] hover:text-[#c7d2fe] transition-colors underline underline-offset-2"
        >
          Read &ldquo;Nothing Slips&rdquo; now →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={variant === "hero" ? "w-full max-w-sm mx-auto" : "w-full"}>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={`flex-1 rounded-xl border border-[rgba(168,216,240,0.2)] bg-[#12243d] text-[#f4f7fa] placeholder-[#a8d8f0]/40 focus:outline-none focus:border-[#818cf8]/60 transition-colors ${
            variant === "hero" ? "px-4 py-3 text-sm" : "px-3.5 py-2.5 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className={`flex-shrink-0 rounded-xl font-semibold transition-all duration-200 bg-[#818cf8] hover:bg-[#6366f1] text-white disabled:opacity-60 disabled:cursor-not-allowed ${
            variant === "hero" ? "px-5 py-3 text-sm" : "px-4 py-2.5 text-sm"
          }`}
        >
          {state === "submitting" ? "Sending…" : "Get the free guide →"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-xs text-[#f87171]">{errorMsg}</p>
      )}
      <p className="mt-2 text-xs text-[#a8d8f0]/30 text-center">
        🔒 We never ask for your passwords. Ever.
      </p>
    </form>
  );
}
