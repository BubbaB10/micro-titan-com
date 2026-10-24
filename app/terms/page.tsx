import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Micro Titan",
  description: "Terms of Service for micro-titan.com and Micro Titan LLC services.",
};

// v1 — owner-approved 2026-10-24 ("Publish v1"). Written from what the site already promises
// (/onboarding, /valet/pricing). Not yet reviewed by an attorney; that is stated to the reader below.
const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Who we are",
    body: ["Micro Titan LLC, Paris, Texas. Contact: hello@micro-titan.com."],
  },
  {
    title: "2. What these terms cover",
    body: [
      "These terms cover your use of micro-titan.com and download.micro-titan.com, including the intake conversation.",
      "Paid services (Valet plans and Studio builds) are governed by these terms plus the Service Agreement you accept before anything is installed. If the two conflict, the Service Agreement wins for that service.",
    ],
  },
  {
    title: "3. The intake is free and creates no obligation",
    body: [
      "Starting the intake does not sign you up for anything and costs nothing. We reply to you. Nothing is built, installed or charged until you have agreed to a written scope and price.",
    ],
  },
  {
    title: "4. What we promise, and how we say “done”",
    body: [
      "We call something done only when it has been read back from where it lives: a message you sent that appears on your page, a connection that answered a real read. We do not call an account “connected” because a page says so.",
      "We will not oversell what is automated or hide what still needs your eyes.",
    ],
  },
  {
    title: "5. Passwords and your accounts",
    body: [
      "We never ask for your passwords. If a connection to one of your accounts is part of your setup, you authorize it yourself with that provider, and you can revoke it there at any time.",
    ],
  },
  {
    title: "6. Your data",
    body: [
      "Your data is yours. You can export it at any time without a fee. On request we delete the copies we hold, except what the law requires us to keep. Details are in the Privacy Policy.",
    ],
  },
  {
    title: "7. Prices and billing",
    body: [
      "Prices for Valet plans are published at micro-titan.com/valet/pricing: a one-time build fee, then a flat monthly fee. No per-seat fees, no per-feature upsells, no silent overages, no trial that upgrades itself.",
      "Outside costs you choose to carry yourself (for example your own model-provider or hosting account) are billed to you by that provider, not by us.",
      "Changes to prices never apply to a running plan without written notice before your next monthly charge.",
    ],
  },
  {
    title: "8. Cancelling",
    body: [
      "You may cancel a monthly plan at any time; it ends at the close of the paid month. We may end a service with 30 days’ written notice, or sooner if you misuse it or do not pay. Either way, your export right in section 6 stands.",
    ],
  },
  {
    title: "9. Acceptable use",
    body: [
      "Do not use our services to break the law, to harm others, or to attack systems you are not authorized to test. We may suspend a service used that way.",
    ],
  },
  {
    title: "10. Intellectual property",
    body: [
      "The site’s content, the Micro Titan™ and Valet™ marks, and our software are ours or our licensors’. Work we build for you under a Service Agreement is covered by that agreement. Your data and anything you write to your assistant stay yours.",
    ],
  },
  {
    title: "11. Disclaimer and limits",
    body: [
      "The public site is provided as is. For paid services, our liability is limited to the fees you paid us in the twelve months before the claim, to the extent the law allows. We are not liable for indirect or consequential losses. Nothing here limits liability that cannot be limited by law.",
    ],
  },
  {
    title: "12. Governing law",
    body: ["Texas law governs. Disputes go to the courts of Lamar County, Texas."],
  },
  {
    title: "13. Changes to these terms",
    body: [
      "We post changes here with a new date. Material changes to a paid service are notified in writing before they take effect.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      <section className="pt-32 pb-16 px-4 max-w-3xl mx-auto">
        <h1
          className="text-4xl font-[300] text-[#f4f7fa] mb-3"
          style={{ fontFamily: "var(--font-mulish)" }}
        >
          Terms of Service
        </h1>
        <p className="text-sm text-[#a8d8f0]/50 mb-2">Version 1 · Last updated: October 24, 2026</p>
        <p className="text-xs text-[#a8d8f0]/50 mb-10">
          Written in plain words by Micro Titan LLC from what this site already promises. Not yet reviewed by an attorney.
        </p>

        <div className="flex flex-col gap-8 text-sm text-[#a8d8f0] leading-relaxed">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className={i > 0 ? "mt-2" : undefined}>
                  {p}
                </p>
              ))}
            </div>
          ))}
          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">14. Contact</h2>
            <p>
              Questions about these Terms:{" "}
              <a href="mailto:hello@micro-titan.com" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors">
                hello@micro-titan.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(168,216,240,0.08)]">
          <Link href="/" className="text-sm text-[#a8d8f0]/50 hover:text-[#f4f7fa] transition-colors">
            ← Back to micro-titan.com
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
