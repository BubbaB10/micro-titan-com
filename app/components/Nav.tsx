"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/aver",         label: "Aver" },
  { href: "/studio",       label: "The Studio" },
  { href: "/proof",        label: "Proof" },
  { href: "/pricing",      label: "Pricing" },
  { href: "/why-provable", label: "Why provable" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(168,216,240,0.1)] bg-[#0a1628]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/*
            LOGO — The Monolith shield (MT crest mark) replaces this text when the file arrives.
            Drop the vector at: /public/logo-monolith.svg
            Then replace the <Link> text with: <Image src="/logo-monolith.svg" alt="Micro Titan" ... />
            Favicon: add <link rel="icon" href="/logo-monolith.svg" /> in app/layout.tsx
          */}
          <Link href="/" className="text-sm font-semibold tracking-widest text-[#f4f7fa] hover:text-[#a8d8f0] transition-colors">
            MICRO TITAN™
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[#a8d8f0]/70 hover:text-[#f4f7fa] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/onboarding"
              className="bg-[#818cf8]/15 hover:bg-[#818cf8]/25 border border-[#818cf8]/35 text-[#c7d2fe] text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Try Aver →
            </Link>
            <Link
              href="/pricing"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Start a build
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-[#a8d8f0] hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden py-5 border-t border-[rgba(168,216,240,0.1)] flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[#a8d8f0]/80 hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/onboarding"
              className="text-sm font-semibold text-[#818cf8] hover:text-[#c7d2fe] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Try Aver →
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[#2563eb] hover:text-[#60a5fa] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Start a build →
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
