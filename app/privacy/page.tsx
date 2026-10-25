import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Micro Titan",
  description: "Privacy Policy for micro-titan.com and Micro Titan LLC services.",
};

// v1 — owner-approved 2026-10-24 ("Publish v1"). Facts checked against the running system on that date:
// the email form posts to our own service at download.micro-titan.com (app/components/EmailCapture.tsx);
// that service is hosted on Railway; operator backups go to Google Drive (encrypted at rest by Google; no encryption layer of our own).
// Not yet reviewed by an attorney; that is stated to the reader below.
const sections: { title: string; body: string[]; bullets?: string[] }[] = [
  {
    title: "1. Plain summary",
    body: [
      "We collect what you give us in the intake and what your assistant needs to do its job. We do not sell it. We never hold your passwords. You can export or delete your data on request.",
    ],
  },
  {
    title: "2. What we collect",
    body: [],
    bullets: [
      "Website: standard server logs (IP address, browser, pages) through our hosting provider, Vercel.",
      "Email form: if you submit it, your address goes to our own service at download.micro-titan.com and is used only to send the guide and the updates you asked for.",
      "Intake: what you tell us in the intake conversation on download.micro-titan.com — how your life or business runs, what you want handled, what must never be touched, and contact details. You can stop and come back; unfinished intakes are kept so you can.",
      "Your assistant: once you have a Valet assistant, it keeps the messages you send it, the memory it builds from them, reminders, calendar items you add, and files you give it, so that it can act for you.",
      "Operational records: delivery receipts, error logs and health checks about your assistant, so we can keep it running and prove to you that it did what it said.",
    ],
  },
  {
    title: "3. Where it lives",
    body: [
      "Your assistant runs on a computer you own or control, or on a server we run for you by arrangement, paired to a private page only you can open.",
      "Intake and private-page data are held on our service at download.micro-titan.com, hosted on Railway. Backups of operator records are kept in Google Drive, which encrypts stored data at rest; we do not add an encryption layer of our own.",
      "Messages your assistant sends to a model provider in order to think are processed by that provider under its own terms; you may choose to carry that account in your own name.",
    ],
  },
  {
    title: "4. How we use it",
    body: [
      "To run the service you asked for, to prove delivery to you, to fix faults, and to tell you about changes to your service. We do not use your data to train models, and we do not sell or rent it.",
    ],
  },
  {
    title: "5. Who else sees it",
    body: [
      "Hosting and infrastructure providers (Vercel, Railway, and the model provider your assistant uses) process data on our instructions. Telegram or another messaging service you choose carries your messages under its own policy. We do not share personal data with anyone for marketing.",
    ],
  },
  {
    title: "6. How long we keep it",
    body: [
      "Intake records: until your service ends or you ask for deletion. Assistant data on your box: it is yours; removing the box removes it. Operational receipts: up to 24 months. Email-form addresses: until you unsubscribe or ask.",
    ],
  },
  {
    title: "7. Your rights",
    body: [
      "Export: at any time, no fee. Correction and deletion: on request to hello@micro-titan.com; we confirm when it is done. If you are in a jurisdiction with specific rights (for example the EU or California), you have those rights too — email us and we will act on them.",
    ],
  },
  {
    title: "8. Security",
    body: [
      "Credentials for connections you authorize are stored only where the service needs them and never in chat, notes or logs. Access is limited to what each component needs, and every change to a running service leaves a receipt. No system is perfectly secure; if you believe your data has been exposed, contact us immediately.",
    ],
  },
  {
    title: "9. Children",
    body: [
      "Our services are for adults. Household setups that include a child’s information are configured by the adult account holder, who controls it.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      <section className="pt-32 pb-16 px-4 max-w-3xl mx-auto">
        <h1
          className="text-4xl font-[300] text-[#f4f7fa] mb-3"
          style={{ fontFamily: "var(--font-mulish)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-[#a8d8f0]/50 mb-2">Version 1 · Last updated: October 24, 2026</p>
        <p className="text-xs text-[#a8d8f0]/50 mb-10">
          Written in plain words by Micro Titan LLC from how the service actually works. Not yet reviewed by an attorney.
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
              {s.bullets && (
                <ul className="list-disc pl-5 flex flex-col gap-2 mt-1">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">10. Contact</h2>
            <p>
              Privacy questions:{" "}
              <a href="mailto:hello@micro-titan.com" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors">
                hello@micro-titan.com
              </a>{" "}
              · Micro Titan LLC · Paris, Texas
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
