import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Micro Titan",
  description: "Privacy Policy for micro-titan.com and Micro Titan LLC services.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      <section className="pt-32 pb-16 px-4 max-w-3xl mx-auto">
        <div className="mb-10 p-5 rounded-xl border border-[#e2a44a]/30 bg-[#e2a44a]/05">
          <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">Placeholder — Not yet reviewed by an attorney</p>
          <p className="text-xs text-[#a8d8f0]/70 leading-relaxed">
            This Privacy Policy page is a stub. It is not a complete or legally binding document.
            It exists to satisfy basic site hygiene requirements. A licensed attorney must review
            and replace this content — especially before collecting any personal data at scale
            or before serving customers in jurisdictions with specific privacy law requirements
            (GDPR, CCPA, etc.).
          </p>
        </div>

        <h1
          className="text-4xl font-[300] text-[#f4f7fa] mb-3"
          style={{ fontFamily: "var(--font-mulish)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-[#a8d8f0]/50 mb-10">Last updated: July 28, 2026 — DRAFT PLACEHOLDER</p>

        <div className="flex flex-col gap-8 text-sm text-[#a8d8f0] leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">1. What We Collect</h2>
            <p className="mb-3">
              When you use micro-titan.com, we may collect:
            </p>
            <ul className="flex flex-col gap-1.5 ml-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] mt-1.5 flex-shrink-0"/>
                <span><strong className="text-[#f4f7fa]">Email address</strong> — if you submit the email capture form, your email is collected via Formspree and used to send the requested guide and early-access updates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] mt-1.5 flex-shrink-0"/>
                <span><strong className="text-[#f4f7fa]">Usage data</strong> — standard server logs (IP address, browser type, pages visited) collected by Vercel hosting infrastructure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] mt-1.5 flex-shrink-0"/>
                <span><strong className="text-[#f4f7fa]">No passwords, no financial data</strong> — we do not collect or store passwords or financial account credentials. Aver agents connect to external systems via secure integrations; credentials are never stored by Micro Titan.</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">2. How We Use It</h2>
            <p>
              Email addresses are used solely to send the requested guide and relevant Micro Titan
              updates. We do not sell email addresses to third parties. Usage logs are used for
              site reliability and security purposes only.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">3. Third Parties</h2>
            <p>
              This site uses Vercel (hosting), Formspree (email collection), and may use
              analytics services. Each third party operates under its own privacy policy.
              We do not share personal data with third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">4. Data Retention</h2>
            <p>
              Email addresses collected via the early-access form are retained until you
              unsubscribe or request deletion. You may request deletion at any time by
              emailing{" "}
              <a href="mailto:hello@micro-titan.com" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors">
                hello@micro-titan.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">5. Security</h2>
            <p>
              We take reasonable technical and organizational measures to protect your data.
              No system is perfectly secure — if you believe your data has been compromised,
              contact us immediately.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">6. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights to access, correct, or delete
              your personal data, or to opt out of certain data uses. Contact us to exercise
              these rights.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">7. Contact</h2>
            <p>
              Privacy questions:{" "}
              <a href="mailto:hello@micro-titan.com" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors">
                hello@micro-titan.com
              </a>
              {" "}· Micro Titan LLC · Paris, Texas
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
