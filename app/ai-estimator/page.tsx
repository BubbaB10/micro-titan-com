import Nav from "../components/Nav";
import Footer from "../components/Footer";

const accent = "#10b981";

export default function AIEstimatorPage() {
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
            📋
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
            AI Estimator
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] mb-4">
            Price every job right, every time.
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
          <h2 className="text-3xl font-bold mb-10">Guessing your price is costing you on every single job.</h2>
          <div className="flex flex-col gap-6">
            {[
              {
                title: "Underquote and you lose money.",
                body: "You win the job, do the work, and end up making $12/hr after materials and labor. You won't know until it's over.",
              },
              {
                title: "Overquote and you lose the job.",
                body: "You price too high, the customer calls someone else, and you're sitting at home wondering why your phone stopped ringing.",
              },
              {
                title: "Most contractors still guess.",
                body: "A gut feeling plus a rough materials list is how most estimates get built. It's not repeatable, it's not accurate, and it doesn't scale.",
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
          <h2 className="text-3xl font-bold mb-10">Professional estimate in 60 seconds.</h2>
          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "Describe the job in plain English", body: "Talk to it like you'd talk to another contractor. \"2-ton AC unit replacement, attic air handler, 10-year-old home in Rockwall.\" That's all it needs." },
              { step: "02", title: "AI generates a line-item estimate with labor + materials", body: "Get a fully itemized breakdown — parts, labor hours, markup, and total — based on current pricing for your trade and region." },
              { step: "03", title: "Send it to the customer in 60 seconds", body: "Clean, professional estimate ready to email or text. Your customer sees a real quote. You see a real margin." },
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
            Unlimited estimates. No per-job fees. Cancel anytime.
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
