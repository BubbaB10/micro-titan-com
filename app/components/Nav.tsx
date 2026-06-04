"use client";

import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#21262d] bg-[#0d1117]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gradient">Micro Titan</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#personal" className="text-sm text-[#8b949e] hover:text-white transition-colors">
              Personal Helpers
            </a>
            <a href="/#business" className="text-sm text-[#8b949e] hover:text-white transition-colors">
              Business Systems
            </a>
            <Link href="/pricing" className="text-sm text-[#8b949e] hover:text-white transition-colors">
              Pricing
            </Link>
            <a
              href="mailto:hello@micro-titan.com?subject=Get Started"
              className="text-sm font-medium bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-[#8b949e] hover:text-white"
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
          <div className="md:hidden py-4 border-t border-[#21262d] flex flex-col gap-4">
            <a href="/#personal" className="text-sm text-[#8b949e] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
              Personal Helpers
            </a>
            <a href="/#business" className="text-sm text-[#8b949e] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
              Business Systems
            </a>
            <Link href="/pricing" className="text-sm text-[#8b949e] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
              Pricing
            </Link>
            <a
              href="mailto:hello@micro-titan.com?subject=Get Started"
              className="text-sm font-medium bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg transition-colors text-center"
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
