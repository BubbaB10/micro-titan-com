import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { getHelper, getAllSlugs } from "../data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const helper = getHelper(slug);
  if (!helper) return { title: "Helper Not Found — Micro Titan" };
  return {
    title: `${helper.name} — Micro Titan`,
    description: helper.metaDescription,
  };
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function HelperPage({ params }: Props) {
  const { slug } = await params;
  const helper = getHelper(slug);

  if (!helper) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <Nav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-[#6366f1]/15 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
            {helper.emoji}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">{helper.name}</h1>
          <p className="text-xl text-[#8b949e] mb-6">{helper.tagline}</p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-3xl font-bold text-white">{helper.price}</span>
          </div>
          <a
            href={`mailto:hello@micro-titan.com?subject=I want to try ${helper.name}`}
            className="inline-block bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 text-lg"
          >
            Get Started &rarr;
          </a>
          <p className="text-sm text-[#6e7681] mt-4">No app to download &middot; Set up in 2 minutes &middot; Cancel anytime</p>
        </div>
      </section>

      {/* Description + Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-4">What {helper.name} does for you</h2>
              <p className="text-[#8b949e] leading-relaxed mb-6">{helper.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#a78bfa]">Included in your subscription</h3>
              <ul className="flex flex-col gap-3">
                {helper.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-[#6366f1]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-[#8b949e] text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SMS Thread */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">See it in action</h2>

          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-2xl">
            {/* Phone header */}
            <div className="bg-[#1c2128] px-4 py-3 flex items-center gap-3 border-b border-[#21262d]">
              <div className="w-8 h-8 bg-[#6366f1]/20 rounded-full flex items-center justify-center text-lg">
                {helper.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{helper.name}</p>
                <p className="text-xs text-[#3fb950]">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 flex flex-col gap-4">
              {helper.conversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start items-start gap-2"}`}>
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 bg-[#6366f1]/20 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {helper.emoji}
                    </div>
                  )}
                  <div className={`px-4 py-3 text-sm max-w-[82%] leading-relaxed ${msg.role === "user" ? "sms-bubble-user" : "sms-bubble-ai"}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Set Up */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">Get set up in 2 minutes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Send us your info", desc: `Email hello@micro-titan.com with your name, number, and goals for ${helper.name}.` },
              { step: "2", title: "We configure your helper", desc: `We set up ${helper.name} with your personal context, goals, and preferences.` },
              { step: "3", title: "Start texting", desc: "Within minutes, you'll get a text from your dedicated helper number. That's it — you're live." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-[#6366f1] rounded-full flex items-center justify-center text-xl font-bold shadow-lg shadow-[#6366f1]/30">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-[#8b949e] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Card + CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-lg mx-auto">
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#6366f1]/15 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              {helper.emoji}
            </div>
            <h3 className="text-2xl font-bold mb-1">{helper.name}</h3>
            <p className="text-[#8b949e] text-sm mb-6">{helper.tagline}</p>
            <div className="text-4xl font-extrabold text-white mb-2">{helper.price}</div>
            <p className="text-xs text-[#6e7681] mb-8">Billed monthly &middot; Cancel anytime</p>

            <a
              href={`mailto:hello@micro-titan.com?subject=I want to try ${helper.name}`}
              className="block bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 text-lg mb-4"
            >
              Get Started with {helper.name}
            </a>
            <p className="text-xs text-[#6e7681]">No app download &middot; No login &middot; Just text</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Questions about {helper.name}</h2>
          <div className="flex flex-col gap-5">
            {helper.faq.map((item) => (
              <div key={item.q} className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
                <h3 className="font-semibold text-lg text-white mb-2">{item.q}</h3>
                <p className="text-[#8b949e] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#8b949e] mb-4">Have more questions?</p>
            <a href="mailto:hello@micro-titan.com" className="text-[#6366f1] hover:text-[#a78bfa] font-medium transition-colors">
              Email us at hello@micro-titan.com &rarr;
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
