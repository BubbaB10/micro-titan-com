import Nav from "../components/Nav";
import Footer from "../components/Footer";

const accent = "#8b5cf6";

export default function AIBookkeeperPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8"
            style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}40` }}
          >
            📊
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
            AI Bookkeeper
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] mb-4">
            Know if you made money. In plain English.
          </p>
          <p className="text-sm font-semibold mb-8" style={{ color: accent }}>
            $49/mo
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            Start Free Trial →
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: accent }}>
            The Problem
          </p>
          <h2 className="text-3xl font-bold mb-10">You finished a big job. Did you make money?</h2>
          <div className="flex flex-col gap-6">
            {[
              {
                title: "Most contractors have no idea.",
                body: "You invoiced $12,000. Materials were... somewhere around $4,000? Labor was five days with three guys? You think you made money. Probably.",
              },
              {
                title: "You find out months later — or never.",
                body: "By tax time you hand a shoebox of receipts to an accountant and hope for the best. That's not a business. That's a lottery ticket.",
              },
              {
                title: "QuickBooks isn't built for contractors.",
                body: "Accounting software designed for offices doesn't map to how trades work — job-level profitability, materials per project, labor by crew member. You need something that speaks your language.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-[#8b949e] text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: accent }}>
            How It Works
          </p>
          <h2 className="text-3xl font-bold mb-10">Your books, in plain English, every week.</h2>
          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "Connect your bank or enter transactions", body: "Bank feed sync or manual entry — whatever works for your workflow. No CPA required to get started." },
              { step: "02", title: "AI categorizes everything and tracks job profitability", body: "Every transaction gets tagged to a job, a category, and a cost type. Labor, materials, overhead, revenue — all separated automatically." },
              { step: "03", title: "Plain-English P&L every week", body: "\"You made $4,200 this week. Your best job was the Henderson HVAC install. Materials on the Martinez job ran 18% over estimate.\" Real numbers, human language." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="text-2xl font-black shrink-0 w-10" style={{ color: accent }}>
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-[#8b949e] text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: accent }}>
            Pricing
          </p>
          <h2 className="text-4xl font-black mb-4">$49/mo</h2>
          <p className="text-[#8b949e] mb-8">
            Unlimited jobs tracked. Weekly P&L included. Cancel anytime.
          </p>
          {/* TODO: wire Stripe link */}
          <a
            href="#"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90 mb-4"
            style={{ backgroundColor: accent }}
          >
            Start Free Trial →
          </a>
          <p className="text-sm text-[#6e7681]">
            Questions?{" "}
            <a href="mailto:hello@micro-titan.com" className="underline hover:text-white transition-colors">
              Email hello@micro-titan.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
