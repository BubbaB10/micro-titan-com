import Nav from "../components/Nav";
import Footer from "../components/Footer";

const accent = "#f97316";

export default function MissedCallAIPage() {
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
            📞
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-4">
            Missed Call AI
          </h1>
          <p className="text-xl sm:text-2xl text-[#8b949e] mb-4">
            Never lose a job to a missed call.
          </p>
          <p className="text-sm font-semibold mb-8" style={{ color: accent }}>
            $400/mo
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
          <h2 className="text-3xl font-bold mb-10">Every missed call is money you'll never see.</h2>
          <div className="flex flex-col gap-6">
            {[
              {
                title: "You're on a job. A homeowner calls.",
                body: "You can't answer. They don't leave a message. They call the next contractor in Google — and that guy answers.",
              },
              {
                title: "A missed call = $3,000–$8,000 gone.",
                body: "HVAC installs, plumbing emergencies, roofing replacements — these aren't small tickets. One missed call can wipe out a week of margin.",
              },
              {
                title: "You don't even know how many you're missing.",
                body: "No callback. No voicemail. No record. You're hemorrhaging leads and don't even have data to show for it.",
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
          <h2 className="text-3xl font-bold mb-10">Three steps. Zero missed opportunities.</h2>
          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "AI answers missed calls instantly via SMS", body: "When you can't pick up, our AI texts the caller within seconds — keeping them engaged before they move on." },
              { step: "02", title: "Qualifies the lead, books the callback", body: "The AI asks the right questions, captures the job details, and schedules a callback window that works for you." },
              { step: "03", title: "You close the job", body: "You get a clean lead summary. Show up ready. Close the job. No more guessing who called or why." },
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
          <h2 className="text-4xl font-black mb-4">$400/mo</h2>
          <p className="text-[#8b949e] mb-8">
            Flat rate. No per-call fees. No contracts. Cancel anytime.
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
