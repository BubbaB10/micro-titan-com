import Link from "next/link";
import MicroTitanMark from "./MicroTitanMark";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(168,216,240,0.1)] bg-[#060e1a] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3 text-[#f4f7fa] hover:opacity-80 transition-opacity">
              <MicroTitanMark height={32} idPrefix="ft" />
              <span className="text-sm font-semibold tracking-widest">MICRO TITAN™</span>
            </Link>
            <p className="text-sm text-[#a8d8f0]/60">Provable software, end to end.</p>
            <a href="mailto:hello@micro-titan.com" className="text-sm text-[#2563eb] hover:text-[#60a5fa] transition-colors">
              hello@micro-titan.com
            </a>
          </div>
          {/* Nav */}
          <div className="flex flex-col gap-2 text-sm text-[#a8d8f0]/60">
            <Link href="/valet" className="hover:text-[#f4f7fa] transition-colors">Valet</Link>
            <Link href="/studio" className="hover:text-[#f4f7fa] transition-colors">The Studio</Link>
            <Link href="/pivot" className="hover:text-[#f4f7fa] transition-colors">Pivot</Link>
            <Link href="/about" className="hover:text-[#f4f7fa] transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-[#f4f7fa] transition-colors">Pricing</Link>
            <Link href="/why-provable" className="hover:text-[#f4f7fa] transition-colors">How it works</Link>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[rgba(168,216,240,0.08)] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#a8d8f0]/40">&copy; 2026 Micro Titan LLC &middot; Paris, Texas &middot; All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-[#a8d8f0]/30 hover:text-[#a8d8f0]/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs text-[#a8d8f0]/30 hover:text-[#a8d8f0]/60 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
      {/* Clearance for fixed bottom nav on mobile (56px + safe-area) */}
      <div className='lg:hidden' style={{ height: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))', minHeight: '3.5rem' }} aria-hidden='true' />
    </footer>
  );
}
