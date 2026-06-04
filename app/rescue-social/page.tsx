import Nav from "../components/Nav";
import Footer from "../components/Footer";

const accent = "#ec4899";

export default function RescueSocialPage() {
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
            🐾
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
            Rescue Social
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] mb-4">
            AI-powered captions for animal rescue orgs.
          </p>
          <p className="text-sm font-semibold mb-8" style={{ color: accent }}>
            $99/mo — 14-day free trial
          </p>
          <a
            href="https://buy.stripe.com/bJebIT0Sx2uIfyudigg7e06"
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
          <h2 className="text-3xl font-bold mb-10">Animals need captions to get adopted. Nobody has time to write them.</h2>
          <div className="flex flex-col gap-6">
            {[
              {
                title: "Social media drives adoptions.",
                body: "Rescues that post consistently get more applications. But with 30 animals in foster, a staff of 2, and a budget of nothing — who has time to write good copy?",
              },
              {
                title: "Bad captions mean animals sit longer.",
                body: "\"Meet Max! He's a good boy!\" doesn't move the needle. A caption that speaks to the right adopter — their lifestyle, their fears, their capacity to love — that's what gets applications.",
              },
              {
                title: "14,000+ rescues across the US are all facing this exact problem.",
                body: "They're all posting with generic text, no strategy, and no time to fix it. Rescue Social is built for this gap.",
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
          <h2 className="text-3xl font-bold mb-10">Photo in. Caption out. Animal adopted.</h2>
          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "Upload a photo of the animal", body: "Just the photo. No forms, no intake sheets, no manual data entry. Our AI reads the image and gets to work." },
              { step: "02", title: "AI writes an adoption-focused caption in your rescue's voice", body: "We learn your org's tone, platform style, and target adopter profile. The caption sounds like you — just a better, faster version of you." },
              { step: "03", title: "Post directly or schedule", body: "Publish to Instagram, Facebook, or TikTok directly from the app. Or schedule a week of posts in 15 minutes on Monday morning." },
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
          <h2 className="text-4xl font-black mb-2">$99/mo</h2>
          <p className="text-sm mb-6" style={{ color: accent }}>14-day free trial — no credit card required</p>
          <p className="text-[#8b949e] mb-8">
            Unlimited captions. All platforms. Cancel anytime.
          </p>
          <a
            href="https://buy.stripe.com/bJebIT0Sx2uIfyudigg7e06"
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
