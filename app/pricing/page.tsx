import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const PLANS = [
  {
    name: "Personal",
    buildFee: "$495",
    monthly: "$59",
    monthlyUnit: "/mo",
    desc: "Your assistant — built and configured specifically for you.",
    featured: false,
    badge: null,
    features: [
      "Persistent memory across every session",
      "Free dashboard app included",
      "Scheduled reports and background tasks",
      "Connected to your data and apps",
      "One industry context included",
      "Deep intake — your assistant arrives already knowing your world",
    ],
    cta: "Apply for access",
    ctaHref: "mailto:hello@micro-titan.com?subject=Personal+Plan+%E2%80%94+Application",
  },
  {
    name: "Business",
    buildFee: "$1,500",
    monthly: "$349",
    monthlyUnit: "/mo",
    desc: "Aver running your business, with deeper integrations and broader context.",
    featured: true,
    badge: "Most chosen",
    features: [
      "Everything in Personal",
      "Full business context — vendors, clients, staff",
      "Multi-system integrations",
      "Expanded industry knowledge pack",
      "Priority onboarding + setup support",
      "Quarterly review session",
    ],
    cta: "Apply for access",
    ctaHref: "mailto:hello@micro-titan.com?subject=Business+Plan+%E2%80%94+Application",
  },
  {
    name: "On Your Hardware",
    buildFee: "$1,250",
    monthly: "$249",
    monthlyUnit: "/mo (Mac mini — by arrangement) · (Spark — by arrangement) + hardware",
    desc: "Your data stays on your box. Provability identical — custody is yours.",
    featured: false,
    badge: "Privacy tier",
    badgeColor: "#a8d8f0",
    features: [
      "Everything in Business",
      "Mac mini: data local, reasoning cloud (by arrangement)",
      "Spark: data + reasoning fully on-device (by arrangement)",
      "Hardware setup and configuration",
      "Air-gap option with local model (Spark only, by arrangement)",
      "Full data sovereignty — no cloud residency",
    ],
    cta: "Talk to us first",
    ctaHref: "mailto:hello@micro-titan.com?subject=On-Your-Hardware+%E2%80%94+Inquiry",
  },
];

const ALWAYS_INCLUDED = [
  "The gate — mechanical verification, always on",
  "Daily digest and fail-closed alerts",
  "Data export anytime, no hostage fees",
  "All updates — no versioning tiers",
  "No per-seat fees. No per-feature upsells. No silent overages.",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 text-center border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#4fb8e8] mb-4">Pricing</p>
          <h1
            className="text-5xl sm:text-6xl font-[300] leading-tight tracking-tight text-[#f4f7fa] mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            Transparent,<br />all up front.
          </h1>
          <p className="text-lg text-[#a8d8f0] font-light max-w-xl mx-auto">
            Every plan is a one-time build fee, then flat monthly. No trials that auto-upgrade.
            No features behind a higher tier. The gate is in every plan.
          </p>
        </div>
      </section>

      {/* Founding Member offer */}
      <section className="py-8 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0f1f38] border border-[#46cf93]/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#46cf93]">Founding Member</span>
                <span className="text-xs text-[#a8d8f0]/50">· the first 25 builds</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-[#f4f7fa]">$295</span>
                <span className="text-sm text-[#a8d8f0]/60">build · then <span className="font-semibold text-[#f4f7fa]">$59/mo</span></span>
              </div>
              <p className="text-sm text-[#a8d8f0]/70 leading-relaxed mt-2">
                Your assistant — built and configured specifically for you, at cost.
                In exchange: real feedback that makes it better for everyone who comes after.
                Genuine early-adopter exchange, not a countdown.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="mailto:hello@micro-titan.com?subject=Founding+Member+%E2%80%94+Application"
                className="inline-flex items-center gap-2 bg-[#46cf93]/10 hover:bg-[#46cf93]/20 border border-[#46cf93]/30 text-[#46cf93] font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200"
              >
                Apply for access →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border flex flex-col transition-all duration-200 ${
                  plan.featured
                    ? "bg-[#0f1f38] border-[#2563eb]/50 shadow-xl shadow-[#2563eb]/10"
                    : "bg-[#12243d] border-[rgba(168,216,240,0.12)]"
                }`}
              >
                <div className="p-7 border-b border-[rgba(168,216,240,0.08)]">
                  {plan.badge && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                      style={
                        plan.featured
                          ? { backgroundColor: "rgba(37,99,235,0.2)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.4)" }
                          : { backgroundColor: `${plan.badgeColor}15`, color: plan.badgeColor, border: `1px solid ${plan.badgeColor}30` }
                      }
                    >
                      {plan.badge}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold text-[#f4f7fa] mb-1">{plan.name}</h2>
                  <p className="text-xs text-[#a8d8f0]/60 mb-4">{plan.desc}</p>

                  {/* Pricing */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-[#f4f7fa]">{plan.buildFee}</span>
                      <span className="text-sm text-[#a8d8f0]/60">one-time build</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-[#a8d8f0]/50">then</span>
                      <span className="text-xl font-bold text-[#f4f7fa] mx-1">{plan.monthly}</span>
                      <span className="text-xs text-[#a8d8f0]/60">{plan.monthlyUnit}</span>
                    </div>
                  </div>
                </div>

                <div className="p-7 flex-1">
                  <ul className="flex flex-col gap-2.5 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-[#a8d8f0]">
                        <svg className="w-4 h-4 text-[#46cf93] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.ctaHref}
                    className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      plan.featured
                        ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                        : "bg-[#1e3a5f] hover:bg-[#243f6a] text-[#f4f7fa] border border-[rgba(168,216,240,0.15)]"
                    }`}
                  >
                    {plan.cta} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Always included */}
      <section className="py-12 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <h3
            className="text-xl font-[300] text-[#f4f7fa] text-center mb-6"
            style={{ fontFamily: "var(--font-mulish)" }}
          >
            In every plan, never an add-on:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALWAYS_INCLUDED.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#46cf93] mt-1.5 flex-shrink-0" />
                <p className="text-sm text-[#a8d8f0]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio callout */}
      <section className="py-12 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0f1f38] border border-[#46cf93]/20 rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#46cf93]/08 border border-[#46cf93]/25 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#f4f7fa] mb-2">Need a full app built first?</h3>
              <p className="text-sm text-[#a8d8f0] leading-relaxed">
                The Studio builds it from scratch — from $5,000 — then it rolls directly into your Aver plan.
                The gate breaks the build before delivery. You keep the agent that runs it.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 bg-[#46cf93]/10 hover:bg-[#46cf93]/20 border border-[#46cf93]/30 text-[#46cf93] font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200"
              >
                See The Studio →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Anti-upsell promise */}
      <section className="py-12 px-4 border-t border-[rgba(168,216,240,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-[#a8d8f0]/60 leading-relaxed mb-4">
            We automate where we can, in conjunction with human verification where needed.
            We won&apos;t oversell what&apos;s automated or hide what still needs your eyes.
          </p>
          <p className="text-sm text-[#a8d8f0]/60">
            Not sure which plan fits?{" "}
            <a href="mailto:hello@micro-titan.com" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors">
              Email us
            </a>{" "}
            and we&apos;ll figure it out together.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
