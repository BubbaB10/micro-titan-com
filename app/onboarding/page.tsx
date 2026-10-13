import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

/**
 * /onboarding — how onboarding ACTUALLY works.
 *
 * Until 2026-10 this page was a three-step mock: connector toggles held in local React state rendered a connected
 * mark and a final "live" screen with nothing behind them (2026-10-06 read-only audit; row wq-muxca5j0-41h).
 * A public page must not present a connection or a live setup that did not happen. This page states the real,
 * paperless, phone-first journey and offers the one real way in — the intake. No connector is shown as connected
 * anywhere on this site without a real authorized read, and nothing here claims to be live.
 *
 * Server-rendered: there is no state to keep and nothing to toggle.
 */

const INTAKE_URL = "https://download.micro-titan.com/#/studio";

const STEPS: Array<{ title: string; desc: string }> = [
  {
    title: "Tell us what you want off your plate",
    desc: "A short intake from your phone — what you handle today, what you want handled, and what must never be touched. Nothing is printed, signed on paper or mailed.",
  },
  {
    title: "A consented capability check",
    desc: "With your yes, we check what your situation actually supports and write down the result: what works now, what has a limit, and what we will not claim.",
  },
  {
    title: "Findings, the setup that fits, and the terms",
    desc: "You get the findings in plain words and the setup path that matches them. The service and its terms are agreed before anything is installed.",
  },
  {
    title: "Your own assistant, on your own box",
    desc: "The assistant runs on a computer you own, paired to a private page only you can open. We never ask for your passwords; any connection to your accounts is authorized by you, directly, and is read back before it is called connected.",
  },
  {
    title: "First use, read back",
    desc: "You tell it one real thing and see it on your page. Only when that round trip has happened do we say it is working.",
  },
];

export const metadata = {
  title: "Onboarding — how it works | Micro Titan",
  description: "The real, paperless, phone-first path from first contact to your own assistant on your own box. No mock steps, no fake connections.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#4fb8e8] text-center mb-3">How onboarding works</p>
          <h1
            className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] text-center mb-3 leading-tight"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Five steps, all from your phone. Nothing is called done until you see it.
          </h1>
          <p className="text-[#a8d8f0] text-center text-sm mb-10">
            This page describes the path. It does not connect anything and it is not a sign-up form.
          </p>

          <ol className="flex flex-col gap-3 mb-10" aria-label="The onboarding steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-[rgba(168,216,240,0.12)] bg-[#12243d] p-5 flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#0a1628] text-sm font-semibold text-[#a8d8f0]"
                  style={{ border: "1px solid rgba(168,216,240,0.15)" }}
                  aria-hidden
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#f4f7fa]">{s.title}</p>
                  <p className="text-xs text-[#a8d8f0]/70 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="bg-[#0f1f38] border border-[#46cf93]/20 rounded-xl px-5 py-4 mb-10 flex items-start gap-3">
            <span className="text-lg flex-shrink-0" aria-hidden>🔒</span>
            <div>
              <p className="text-sm font-bold text-[#f4f7fa] mb-1">We never ask for your passwords. Ever.</p>
              <p className="text-xs text-[#a8d8f0]/70 leading-relaxed">
                If a connection to one of your accounts is part of your setup, you authorize it yourself with that provider, and it is read
                back before anyone calls it connected. A page cannot connect your accounts, and this one does not try.
              </p>
            </div>
          </div>

          <a
            href={INTAKE_URL}
            className="block w-full text-center py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm transition-all duration-200"
          >
            Start the intake →
          </a>
          <p className="text-center text-xs text-[#a8d8f0]/40 mt-5">
            Takes a few minutes on your phone. We reply to you; nothing is set up until you have agreed to it.
          </p>

          <p className="text-center text-xs text-[#a8d8f0]/40 mt-10">
            <Link href="/" className="underline underline-offset-2 hover:text-[#a8d8f0]">Back to the front page</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
