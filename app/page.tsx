import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Link from "next/link";

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
  {
    q: "Do I need to download an app?",
    a: "No. Everything works over SMS text message. If you can send a text, you can use any helper.",
  },
  {
    q: "How does setup work?",
    a: "Takes about 2 minutes. We ask your name, phone number, and a few questions about your goals. Then your helper is live.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Text STOP and you're done. No questions asked, no cancellation fees.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT doesn't know you. Our helpers are pre-loaded with your goals, history, and context. The longer you use them, the smarter they get about you specifically.",
  },
  {
    q: "What if I want multiple helpers?",
    a: "Each one is a separate subscription with its own dedicated number. Bundle discounts available for 3+.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#a78bfa] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-[#6366f1] rounded-full animate-pulse"></span>
                AI Helpers &mdash; Available by Text
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Your personal AI team.{" "}
                <span className="text-gradient">One text away.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#8b949e] leading-relaxed mb-8">
                Choose an AI helper built for your life. Fitness coach, financial tracker, language tutor, business manager &mdash; each one knows your goals, remembers your history, and replies the moment you text.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <a
                  href="#personal"
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 text-center"
                >
                  Browse Helpers
                </a>
                <a
                  href="#how-it-works"
                  className="border border-[#6366f1] text-[#a78bfa] hover:bg-[#6366f1]/10 font-semibold px-8 py-3.5 rounded-xl transition-all text-center"
                >
                  See How It Works
                </a>
              </div>

              <p className="text-sm text-[#6e7681]">
                No app to download. No login. Just text.
              </p>
            </div>

            {/* Right: SMS thread mockup */}
            <div className="flex-shrink-0 w-full max-w-sm mx-auto lg:mx-0">
              <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-2xl">
                {/* Phone header */}
                <div className="bg-[#1c2128] px-4 py-3 flex items-center gap-3 border-b border-[#21262d]">
                  <div className="w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center text-xs font-bold">MT</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Your AI Helpers</p>
                    <p className="text-xs text-[#3fb950]">Active now</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 flex flex-col gap-4">
                  {/* Exchange 1 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <div className="sms-bubble-user px-3.5 py-2.5 text-sm max-w-[80%]">
                        Did I hit my protein goal today?
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-[#6366f1]/20 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">🏋️</div>
                      <div className="sms-bubble-ai px-3.5 py-2.5 text-sm max-w-[85%]">
                        Almost &mdash; you&apos;re at 142g of 160g. Add a protein shake before bed and you&apos;ll nail it.
                        <span className="block text-[10px] text-[#6e7681] mt-1">FitCoach</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#21262d]"></div>

                  {/* Exchange 2 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <div className="sms-bubble-user px-3.5 py-2.5 text-sm max-w-[80%]">
                        &iquest;C&oacute;mo se dice &quot;I&apos;m running late&quot;?
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-[#6366f1]/20 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">🇪🇸</div>
                      <div className="sms-bubble-ai px-3.5 py-2.5 text-sm max-w-[85%]">
                        &ldquo;Voy con retraso&rdquo; or casual: &ldquo;Llego tarde.&rdquo; Want to practice in context?
                        <span className="block text-[10px] text-[#6e7681] mt-1">TutorAI</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#21262d]"></div>

                  {/* Exchange 3 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <div className="sms-bubble-user px-3.5 py-2.5 text-sm max-w-[80%]">
                        Am I on track with my budget?
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-[#6366f1]/20 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">💰</div>
                      <div className="sms-bubble-ai px-3.5 py-2.5 text-sm max-w-[85%]">
                        Yes &mdash; $2,340 of $3,200 spent. Restaurants are biggest at $380. You&apos;ve got $860 left.
                        <span className="block text-[10px] text-[#6e7681] mt-1">Bookkeeper</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-[#8b949e] text-lg mb-14">Up and running in under two minutes.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Pick your helper",
                desc: "Browse the menu below, choose what fits your life — fitness, finance, language, family, business.",
              },
              {
                step: "2",
                title: "Set up in 2 minutes",
                desc: "Tell us your name, goals, and phone number. That's it. Your helper is configured for you.",
              },
              {
                step: "3",
                title: "Start texting",
                desc: "Your helper is live immediately, 24/7. Text it like a friend who actually knows their stuff.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-[#6366f1] rounded-full flex items-center justify-center text-xl font-bold shadow-lg shadow-[#6366f1]/30">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-[#8b949e] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Helpers */}
      <section id="personal" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Personal Helpers</h2>
            <p className="text-[#8b949e] text-lg">For individuals, families, and busy professionals.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {personalHelpers.map((helper) => (
              <div
                key={helper.name}
                className="bg-card rounded-2xl p-6 flex flex-col gap-4 hover:border-[#6366f1]/50 transition-all hover:shadow-lg hover:shadow-[#6366f1]/10 relative"
              >
                {helper.badge && (
                  <span className="absolute top-4 right-4 bg-[#f59e0b] text-[#0d1117] text-xs font-bold px-2.5 py-1 rounded-full">
                    {helper.badge}
                  </span>
                )}
                <div className="w-12 h-12 bg-[#6366f1]/15 rounded-full flex items-center justify-center text-2xl">
                  {helper.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">{helper.name}</h3>
                  <p className="text-sm text-[#8b949e] leading-snug">{helper.tagline}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
                  <span className="text-lg font-bold text-white">{helper.price}</span>
                  {helper.slug ? (
                    <Link
                      href={`/helpers/${helper.slug}`}
                      className="text-sm text-[#6366f1] border border-[#6366f1]/40 hover:bg-[#6366f1] hover:text-white px-3 py-1.5 rounded-lg transition-all font-medium"
                    >
                      Get Started &rarr;
                    </Link>
                  ) : (
                    <a
                      href={`mailto:hello@micro-titan.com?subject=I want to try ${helper.name}`}
                      className="text-sm text-[#6366f1] border border-[#6366f1]/40 hover:bg-[#6366f1] hover:text-white px-3 py-1.5 rounded-lg transition-all font-medium"
                    >
                      Get Started &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Systems */}
      <section id="business" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Business Systems</h2>
            <p className="text-[#8b949e] text-lg">For trade contractors, small businesses, and operators.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {businessHelpers.map((helper) => (
              <div
                key={helper.name}
                className="bg-card rounded-2xl p-6 flex flex-col gap-4 hover:border-[#6366f1]/50 transition-all hover:shadow-lg hover:shadow-[#6366f1]/10 relative"
              >
                {helper.badge && (
                  <span className="absolute top-4 right-4 bg-[#f59e0b] text-[#0d1117] text-xs font-bold px-2.5 py-1 rounded-full">
                    {helper.badge}
                  </span>
                )}
                <div className="w-12 h-12 bg-[#6366f1]/15 rounded-full flex items-center justify-center text-2xl">
                  {helper.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">{helper.name}</h3>
                  <p className="text-sm text-[#8b949e] leading-snug">{helper.tagline}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
                  <span className="text-lg font-bold text-white">{helper.price}</span>
                  <a
                    href={`mailto:hello@micro-titan.com?subject=I want to try ${helper.name}`}
                    className="text-sm text-[#6366f1] border border-[#6366f1]/40 hover:bg-[#6366f1] hover:text-white px-3 py-1.5 rounded-lg transition-all font-medium"
                  >
                    Get Started &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1e1b4b] via-[#1a1035] to-[#0d1117] border border-[#6366f1]/30 rounded-3xl p-10 text-center shadow-2xl shadow-[#6366f1]/10">
            <div className="inline-flex items-center gap-2 bg-[#6366f1]/20 text-[#a78bfa] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Business Bundle
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Run your business. We&apos;ll handle the rest.
            </h2>
            <p className="text-[#8b949e] text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              AI Estimator + AI Bookkeeper + Business Admin &mdash; everything a trade contractor needs to price jobs, track money, and manage the business side.
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-[#6e7681] text-xl line-through">$227/mo</span>
              <span className="text-4xl font-extrabold text-white">$199/mo</span>
            </div>
            <a
              href="mailto:hello@micro-titan.com?subject=Business Bundle"
              className="inline-block bg-[#f59e0b] hover:bg-[#d97706] text-[#0d1117] font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 text-lg"
            >
              Get the Bundle &rarr;
            </a>
            <p className="text-xs text-[#6e7681] mt-4">
              Built by a business owner who had to do all of this the hard way.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Why we built this.</h2>
          <div className="flex flex-col gap-6 text-[#8b949e] text-lg leading-relaxed text-left">
            <p>
              Most people are great at what they do &mdash; their trade, their craft, their family. The business side? That&apos;s a different story. Bookkeepers cost $400/mo. Estimating software is complicated. Office managers are expensive. And most people just&hellip; wing it.
            </p>
            <p>
              We built Micro Titan because we&apos;ve been on the other side of that. These tools exist so you can focus on the part of your life you&apos;re actually good at, and let the AI handle the rest.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-6">
            {faqItems.map((item) => (
              <div key={item.q} className="bg-card rounded-xl p-6">
                <h3 className="font-semibold text-lg text-white mb-2">{item.q}</h3>
                <p className="text-[#8b949e] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#21262d]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-[#8b949e] text-lg mb-8">Pick your first helper and be set up in under two minutes.</p>
          <a
            href="#personal"
            className="inline-block bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 text-lg"
          >
            Browse All Helpers &rarr;
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
