import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Micro Titan",
  description: "Terms of Service for micro-titan.com and Micro Titan LLC services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      <section className="pt-32 pb-16 px-4 max-w-3xl mx-auto">
        <div className="mb-10 p-5 rounded-xl border border-[#e2a44a]/30 bg-[#e2a44a]/05">
          <p className="text-xs font-semibold text-[#e2a44a] uppercase tracking-wider mb-1">Placeholder — Not yet reviewed by an attorney</p>
          <p className="text-xs text-[#a8d8f0]/70 leading-relaxed">
            This Terms of Service page is a stub. It is not a complete or legally binding document.
            It exists to satisfy basic site hygiene requirements. A licensed attorney must review
            and replace this content before it is relied upon or before commercial launch.
          </p>
        </div>

        <h1
          className="text-4xl font-[300] text-[#f4f7fa] mb-3"
          style={{ fontFamily: "var(--font-mulish)" }}
        >
          Terms of Service
        </h1>
        <p className="text-sm text-[#a8d8f0]/50 mb-10">Last updated: July 28, 2026 — DRAFT PLACEHOLDER</p>

        <div className="flex flex-col gap-8 text-sm text-[#a8d8f0] leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using micro-titan.com and any services provided by Micro Titan LLC
              ("Micro Titan," "we," "us," or "our"), you agree to be bound by these Terms of Service.
              If you do not agree, do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">2. Services</h2>
            <p>
              Micro Titan provides AI agent software, software development services, and related
              technology services. Specific terms governing paid services will be provided in
              separate service agreements. This page governs use of the public website.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">3. Intellectual Property</h2>
            <p>
              All content on this site — including text, graphics, logos, and software — is the
              property of Micro Titan LLC or its licensors and is protected by applicable
              intellectual property laws. "Micro Titan™" and "Aver™" are trademarks of Micro Titan LLC.
              Unauthorized use is prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">4. Disclaimer</h2>
            <p>
              This site and its content are provided &ldquo;as is&rdquo; without warranty of any kind.
              Micro Titan makes no representations or warranties about the accuracy, completeness,
              or suitability of any information on this site.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Micro Titan LLC shall not be
              liable for any indirect, incidental, special, or consequential damages arising
              from your use of this site or our services.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">6. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Texas. Any disputes shall
              be resolved in the courts of Lamar County, Texas.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#f4f7fa] mb-2">7. Contact</h2>
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
