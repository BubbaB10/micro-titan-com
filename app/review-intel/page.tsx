import Nav from "../components/Nav";
import Footer from "../components/Footer";

const accent = "#3b82f6";

export default function ReviewIntelPage() {
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
            🔍
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
            ReviewIntel
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] mb-4">
            Protect your Amazon listings from fake reviews.
          </p>
          <p className="text-sm font-semibold mb-8" style={{ color: accent }}>
            $19/report
          </p>
          <a
            href="https://buy.stripe.com/eVq5kveJn7P20DA2DCg7e00"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            Get Your Report →
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: accent }}>
            The Problem
          </p>
          <h2 className="text-3xl font-bold mb-10">Your ranking can tank overnight. And you won't know why.</h2>
          <div className="flex flex-col gap-6">
            {[
              {
                title: "Competitors leave fake 1-star reviews.",
                body: "It's common, it's targeted, and it's effective. A coordinated fake review campaign can drop your listing from page one to page three in days.",
              },
              {
                title: "Amazon's filters miss a lot.",
                body: "Fake reviews have gotten sophisticated. Bot farms, verified purchase spoofing, review velocity manipulation — Amazon's automated systems catch some, but not all.",
              },
              {
                title: "You don't have evidence to fight back.",
                body: "To get Amazon to act, you need documented patterns, not just suspicion. Without a professional analysis, you're filing complaints in the dark.",
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
          <h2 className="text-3xl font-bold mb-10">Evidence you can actually use.</h2>
          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "Enter your ASIN", body: "Paste in your Amazon product ID. That's it. No account connections, no API keys, no setup." },
              { step: "02", title: "AI analyzes all reviews for fake patterns", body: "Our model scans reviewer history, velocity patterns, language fingerprints, and behavioral signals to flag suspicious reviews." },
              { step: "03", title: "Get a full report with evidence to file Amazon complaints", body: "Receive a detailed PDF with flagged reviews, pattern analysis, and pre-formatted complaint documentation ready to submit to Amazon Seller Support." },
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
          <h2 className="text-4xl font-black mb-4">$19 / report</h2>
          <p className="text-[#8b949e] mb-8">
            Pay per analysis. No subscription. Results in minutes.
          </p>
          <a
            href="https://buy.stripe.com/eVq5kveJn7P20DA2DCg7e00"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90 mb-4"
            style={{ backgroundColor: accent }}
          >
            Get Your Report →
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
