export default function Footer() {
  return (
    <footer className="border-t border-[#21262d] bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-gradient">Micro Titan</span>
            <p className="text-sm text-[#8b949e]">AI tools that run your life.</p>
            <a href="mailto:hello@micro-titan.com" className="text-sm text-[#6366f1] hover:text-[#a78bfa] transition-colors">
              hello@micro-titan.com
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#21262d] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#6e7681]">&copy; 2026 Micro Titan LLC &middot; Paris, Texas</p>
        </div>
      </div>
    </footer>
  );
}
