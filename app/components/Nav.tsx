"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/valet",        label: "Valet",       desc: "the agent" },
  { href: "/studio",       label: "The Studio",  desc: "custom builds" },
  { href: "/proof",        label: "Proof",        desc: "gate & receipts" },
  { href: "/about",        label: "About",        desc: "the operator story" },
  { href: "/pricing",      label: "Pricing",      desc: null },
];

// Mobile hamburger shows the overflow items the tab bar doesn't cover
const MOBILE_OVERFLOW = [
  { href: "/why-provable", label: "How it works" },
  { href: "https://download.micro-titan.com", label: "Meet Valet" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(168,216,240,0.1)] bg-[#0a1628]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 text-[#f4f7fa] hover:text-[#a8d8f0] transition-colors">
            <svg aria-hidden="true" height="20" viewBox="243 160 653 433" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M258 175 H345 L567 365 L793 175 H881 V578 H783 V548 H849 V205 H806 L567 405 L331 205 H289 V548 H359 V578 H258 Z"/>
              <path d="M483 437 H655 V478 H590 V578 H548 V478 H483 Z"/>
            </svg>
            <span className="text-sm font-semibold tracking-widest">MICRO TITAN™</span>
          </Link>

          {/* Desktop links — brand name + plain-language descriptor */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group flex flex-col items-center gap-0.5"
              >
                <span className="text-sm text-[#a8d8f0]/70 group-hover:text-[#f4f7fa] transition-colors leading-tight">
                  {l.label}
                </span>
                {l.desc && (
                  <span className="text-[10px] text-[#a8d8f0]/30 group-hover:text-[#a8d8f0]/50 transition-colors leading-tight">
                    {l.desc}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="https://download.micro-titan.com"
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

          {/* Mobile hamburger — overflow only (tab bar handles primary nav) */}
          <button
            className="lg:hidden text-[#a8d8f0] hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
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

        {/* Mobile menu — overflow items */}
        {menuOpen && (
          <div className="lg:hidden py-5 border-t border-[rgba(168,216,240,0.1)] flex flex-col gap-4">
            {MOBILE_OVERFLOW.map((l) => (
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
