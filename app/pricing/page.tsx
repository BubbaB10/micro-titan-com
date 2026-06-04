import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Micro Titan",
  description: "Clear, simple pricing for every AI helper. Personal helpers from $14/mo. Business systems from $49/mo.",
};

const personalHelpers = [
  { emoji: "💰", name: "Bookkeeper", tagline: "Know exactly where your money goes.", price: "$29/mo", badge: null, slug: "bookkeeper" },
  { emoji: "🏋️", name: "FitCoach", tagline: "Your personal trainer, available 24/7.", price: "$19/mo", badge: "Most Popular", slug: "fitcoach" },
  { emoji: "🇪🇸", name: "TutorAI", tagline: "Learn Spanish (or any language) by texting.", price: "$19/mo", badge: null, slug: "tutorai" },
  { emoji: "🍽️", name: "MealMind", tagline: "Weekly menus, grocery lists, nutrition tracking.", price: "$19/mo", badge: null, slug: null },
  { emoji: "🧘", name: "WellnessAI", tagline: "Daily check-ins, habit tracking, stress support.", price: "$24/mo", badge: null, slug: null },
  { emoji: "🎉", name: "EventPro", tagline: "Party planning, guest lists, vendor coordination.", price: "$19/mo", badge: null, slug: null },
  { emoji: "🐕", name: "PetPal", tagline: "Vet reminders, feeding schedules, training tips.", price: "$14/mo", badge: null, slug: null },
  { emoji: "📚", name: "StudyBuddy", tagline: "Homework help and tutoring for K-12.", price: "$19/mo", badge: null, slug: null },
  { emoji: "💼", name: "CareerCoach", tagline: "Resume, interview prep, job application tracking.", price: "$24/mo", badge: null, slug: null },
  { emoji: "🏠", name: "HomeBase", tagline: "Maintenance schedules, contractors, home management.", price: "$19/mo", badge: null, slug: null },
  { emoji: "👶", name: "FamilyHQ", tagline: "Family calendar, chores, schedules, all coordinated.", price: "$24/mo", badge: null, slug: null },
  { emoji: "🌙", name: "SleepCoach", tagline: "Sleep tracking, wind-down routines, energy optimization.", price: "$14/mo", badge: null, slug: null },
];

const businessHelpers = [
  { emoji: "🔧", name: "AI Estimator", tagline: "Price jobs right. Win more work.", price: "$49/mo", badge: null },
  { emoji: "📊", name: "AI Bookkeeper", tagline: "Plain-English P&L. Know if you made money.", price: "$79/mo", badge: null },
  { emoji: "🤖", name: "Business Admin", tagline: "Your AI office manager. Handles the rest.", price: "$99/mo", badge: "Most Popular" },
  { emoji: "📞", name: "Missed Call AI", tagline: "Never lose a job to a missed call again.", price: "$97/mo", badge: null },
  { emoji: "⭐", name: "ReviewIntel", tagline: "Protect your Amazon listings from fake reviews.", price: "$19/report", badge: null },
  { emoji: "🐾", name: "Rescue Social", tagline: "AI captions for animal rescue orgs.", price: "$99/mo", badge: null },
];

const faqItems = [
  { q: "Do I need to download an app?", a: "No. Everything works over SMS text message. If you can send a text, you can use any helper." },
  { q: "How does setup work?", a: "Takes about 2 minutes. We ask your name, phone number, and a few questions about your goals. Then your helper is live." },
  { q: "Can I cancel anytime?", a: "Yes. Text STOP and you're done. No questions asked, no cancellation fees." },
  { q: "How is this different from ChatGPT?", a: "ChatGPT doesn't know you. Our helpers are pre-loaded with your goals, history, and context. The longer you use them, the smarter they get about you specifically." },
  { q: "What if I want multiple helpers?", a: "Each one is a separate subscription with its own dedicated number. Bundle discounts available for 3+." },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <Nav />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Simple, clear pricing.</h1>
            <p className="text-[#8b949e] text-xl">No hidden fees. Cancel anytime. Start in 2 minutes.</p>
          </div>

          {/* Personal Helpers */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold">Personal Helpers</h2>
              <span className="text-sm text-[#8b949e] bg-[#161b22] border border-[#21262d] px-3 py-1 rounded-full">$14 &ndash; $29/mo</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#21262d]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#161b22] border-b border-[#21262d]">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#8b949e]">Helper</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#8b949e] hidden md:table-cell">What it does</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-[#8b949e]">Price</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-[#8b949e]"></th>
                  </tr>
                </thead>
                <tbody>
                  {personalHelpers.map((helper, i) => (
                    <tr key={helper.name} className={`border-b border-[#21262d] hover:bg-[#161b22] transition-colors ${i === personalHelpers.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{helper.emoji}</span>
                          <div>
                            <p className="font-semibold text-white">{helper.name}</p>
                            {helper.badge && (
                              <span className="text-xs bg-[#f59e0b] text-[#0d1117] font-bold px-2 py-0.5 rounded-full">{helper.badge}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8b949e] hidden md:table-cell">{helper.tagline}</td>
                      <td className="px-6 py-4 text-right font-bold text-white">{helper.price}</td>
                      <td className="px-6 py-4 text-right">
                        {helper.slug ? (
                          <Link
                            href={`/helpers/${helper.slug}`}
                            className="text-sm text-[#6366f1] hover:text-[#a78bfa] transition-colors font-medium"
                          >
                            Details &rarr;
                          </Link>
                        ) : (
                          <a
                            href={`mailto:hello@micro-titan.com?subject=I want to try ${helper.name}`}
                            className="text-sm text-[#6366f1] hover:text-[#a78bfa] transition-colors font-medium"
                          >
                            Get Started &rarr;
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Business Systems */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold">Business Systems</h2>
              <span className="text-sm text-[#8b949e] bg-[#161b22] border border-[#21262d] px-3 py-1 rounded-full">$49 &ndash; $199/mo</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#21262d]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#161b22] border-b border-[#21262d]">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#8b949e]">System</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#8b949e] hidden md:table-cell">What it does</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-[#8b949e]">Price</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-[#8b949e]"></th>
                  </tr>
                </thead>
                <tbody>
                  {businessHelpers.map((helper, i) => (
                    <tr key={helper.name} className={`border-b border-[#21262d] hover:bg-[#161b22] transition-colors ${i === businessHelpers.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{helper.emoji}</span>
                          <div>
                            <p className="font-semibold text-white">{helper.name}</p>
                            {helper.badge && (
                              <span className="text-xs bg-[#f59e0b] text-[#0d1117] font-bold px-2 py-0.5 rounded-full">{helper.badge}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8b949e] hidden md:table-cell">{helper.tagline}</td>
                      <td className="px-6 py-4 text-right font-bold text-white">{helper.price}</td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`mailto:hello@micro-titan.com?subject=I want to try ${helper.name}`}
                          className="text-sm text-[#6366f1] hover:text-[#a78bfa] transition-colors font-medium"
                        >
                          Get Started &rarr;
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bundle */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-[#1e1b4b] via-[#1a1035] to-[#0d1117] border border-[#6366f1]/30 rounded-3xl p-10 text-center shadow-2xl shadow-[#6366f1]/10">
              <div className="inline-flex items-center gap-2 bg-[#6366f1]/20 text-[#a78bfa] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                Best Value
              </div>
              <h2 className="text-3xl font-bold mb-4">The Business Bundle</h2>
              <p className="text-[#8b949e] text-lg mb-4 max-w-xl mx-auto">
                AI Estimator + AI Bookkeeper + Business Admin &mdash; everything a trade contractor needs.
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-[#6e7681] text-xl line-through">$227/mo</span>
                <span className="text-4xl font-extrabold text-white">$199/mo</span>
                <span className="bg-[#6366f1]/20 text-[#a78bfa] text-sm px-2 py-1 rounded-lg">Save $28/mo</span>
              </div>
              <a
                href="mailto:hello@micro-titan.com?subject=Business Bundle"
                className="inline-block bg-[#f59e0b] hover:bg-[#d97706] text-[#0d1117] font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 text-lg"
              >
                Get the Bundle &rarr;
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-center mb-10">FAQ</h2>
            <div className="flex flex-col gap-5">
              {faqItems.map((item) => (
                <div key={item.q} className="bg-[#161b22] border border-[#21262d] rounded-xl p-6">
                  <h3 className="font-semibold text-lg text-white mb-2">{item.q}</h3>
                  <p className="text-[#8b949e] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
