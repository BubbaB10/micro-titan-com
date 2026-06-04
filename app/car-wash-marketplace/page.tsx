import Nav from "../components/Nav";
import Footer from "../components/Footer";

const accent = "#06b6d4";

export default function CarWashMarketplacePage() {
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
            🚗
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
            Car Wash Marketplace
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] mb-4">
            Buy and sell car washes. No broker.
          </p>
          <p className="text-sm font-semibold mb-8" style={{ color: accent }}>
            $99/mo featured listings
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            List Your Car Wash →
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-4 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: accent }}>
            The Problem
          </p>
          <h2 className="text-3xl font-bold mb-10">Buying or selling a car wash shouldn't cost you 6 figures in broker fees.</h2>
          <div className="flex flex-col gap-6">
            {[
              {
                title: "Broker fees run 5–8% of the deal.",
                body: "On a $2M car wash, that's $100,000–$160,000 out of your pocket for someone to make a few phone calls and write a teaser. The industry hasn't changed in 30 years.",
              },
              {
                title: "The process is painfully slow and opaque.",
                body: "No public prices. No verified financials. You're negotiating blind against people who've done this 50 times before. That information asymmetry costs operators millions.",
              },
              {
                title: "Qualified buyers can't find listings.",
                body: "PE groups, franchise buyers, and individual operators are all looking — but the inventory is scattered across broker desks, word-of-mouth, and cold calls. Nobody has a real marketplace.",
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
          <h2 className="text-3xl font-bold mb-10">Transparent deals. Direct connections. No commission.</h2>
          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "List your car wash (free basic, $99/mo featured)", body: "Publish your listing with real financials — revenue, car count, site details. Verified operators get priority placement on featured listings." },
              { step: "02", title: "Buyers find verified listings with real financials", body: "PE buyers, franchise groups, and individual operators browse a curated marketplace with actual numbers — not \"contact for details\" teaser sheets." },
              { step: "03", title: "Deal direct — no broker, no commission", body: "Connect with qualified buyers or sellers directly through the platform. You negotiate. You close. You keep the money you would have paid a broker." },
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 flex-1">
              <p className="text-sm text-[#8b949e] mb-1">Basic Listing</p>
              <p className="text-3xl font-black mb-2">Free</p>
              <p className="text-xs text-[#6e7681]">Standard placement</p>
            </div>
            <div className="rounded-xl p-6 flex-1" style={{ backgroundColor: `${accent}14`, border: `1px solid ${accent}50` }}>
              <p className="text-sm mb-1" style={{ color: accent }}>Featured Listing</p>
              <p className="text-3xl font-black mb-2">$99/mo</p>
              <p className="text-xs text-[#6e7681]">Top placement + verified badge</p>
            </div>
          </div>
          <p className="text-[#8b949e] mb-8">
            No commission. No broker. No surprises.
          </p>
          {/* TODO: wire Stripe link */}
          <a
            href="#"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:opacity-90 mb-4"
            style={{ backgroundColor: accent }}
          >
            List Your Car Wash →
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
