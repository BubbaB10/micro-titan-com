import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(168,216,240,0.1)] bg-[#060e1a] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="text-sm font-semibold tracking-widest text-[#f4f7fa]">MICRO TITAN</Link>
            <p className="text-sm text-[#a8d8f0]/60">Provable software, end to end.</p>
            <a href="mailto:hello@micro-titan.com" className="text-sm text-[#2563eb] hover:text-[#60a5fa] transition-colors">
              hello@micro-titan.com
            </a>
          </div>
          {/* Nav */}
          <div className="flex flex-col gap-2 text-sm text-[#a8d8f0]/60">
            <Link href="/aver" className="hover:text-[#f4f7fa] transition-colors">Aver</Link>
            <Link href="/studio" className="hover:text-[#f4f7fa] transition-colors">The Studio</Link>
            <Link href="/proof" className="hover:text-[#f4f7fa] transition-colors">Proof</Link>
            <Link href="/pricing" className="hover:text-[#f4f7fa] transition-colors">Pricing</Link>
            <Link href="/why-provable" className="hover:text-[#f4f7fa] transition-colors">Why provable</Link>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[rgba(168,216,240,0.08)] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#a8d8f0]/40">&copy; 2026 Micro Titan LLC &middot; Paris, Texas</p>
          <p className="text-xs text-[#a8d8f0]/30">Provability is always on &mdash; never an add-on.</p>
        </div>
      </div>
    </footer>
  );
}
