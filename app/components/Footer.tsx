import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#21262d] bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-gradient">Micro Titan</span>
            <p className="text-sm text-[#8b949e]">AI helpers for real life.</p>
            <a href="mailto:hello@micro-titan.com" className="text-sm text-[#6366f1] hover:text-[#a78bfa] transition-colors">
              hello@micro-titan.com
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6e7681]">Navigation</p>
            <a href="/#personal" className="text-sm text-[#8b949e] hover:text-white transition-colors">Personal Helpers</a>
            <a href="/#business" className="text-sm text-[#8b949e] hover:text-white transition-colors">Business Systems</a>
            <Link href="/pricing" className="text-sm text-[#8b949e] hover:text-white transition-colors">Pricing</Link>
            <a href="mailto:hello@micro-titan.com" className="text-sm text-[#8b949e] hover:text-white transition-colors">Contact</a>
          </div>

          {/* Popular helpers */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6e7681]">Popular Helpers</p>
            <Link href="/helpers/fitcoach" className="text-sm text-[#8b949e] hover:text-white transition-colors">FitCoach</Link>
            <Link href="/helpers/bookkeeper" className="text-sm text-[#8b949e] hover:text-white transition-colors">Bookkeeper</Link>
            <Link href="/helpers/tutorai" className="text-sm text-[#8b949e] hover:text-white transition-colors">TutorAI</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#21262d] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#6e7681]">&copy; 2026 Micro Titan LLC &middot; Paris, TX</p>
          <p className="text-xs text-[#6e7681]">All AI helpers operate via SMS. Standard messaging rates may apply.</p>
        </div>
      </div>
    </footer>
  );
}
