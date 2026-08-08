import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nothing Slips: The 15-Minute Weekly Reset — Micro Titan",
  description:
    "A simple Friday ritual for anyone with too much to remember and not enough time to think.",
};

const PHASES = [
  {
    number: "01",
    time: "Minutes 1–5",
    title: "Capture",
    accent: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    tagline: "Don't organize. Don't decide. Just empty the tank.",
    body: `Most mental overload isn't a planning problem — it's a capture problem. Things live in your head as vague anxiety instead of as written words on a page. This phase fixes that.

Grab a notepad or open a blank doc. Set a 5-minute timer. Write down everything that is:`,
    bullets: [
      "A promise you made that isn't done",
      "Something you forgot this week (or almost forgot)",
      "Anything nagging at the back of your mind",
      "Anything due in the next two weeks",
      "Any unfinished conversation or unresolved tension",
    ],
    footer:
      "Don't filter. Don't sort. Don't judge. You're not solving anything yet. You're just getting it out of your head and onto the page.",
  },
  {
    number: "02",
    time: "Minutes 6–10",
    title: "Close Loops",
    accent: "#166534",
    bg: "#dcfce7",
    border: "#bbf7d0",
    tagline: "For every item on your list: do it, delegate it, or defer it.",
    body: `Look at what you wrote. For each item, pick exactly one of three moves:`,
    bullets: [
      "Under 2 minutes to finish → Do it right now.",
      "Someone else needs to handle it → Send the message or make the ask.",
      "Not this week → Set a reminder for the right week, or add it to a list.",
    ],
    footer: `The goal by the end of these 5 minutes: nothing on your list is just "floating." Every item has a status. Done, delegated, or deliberately deferred.

Don't let items sit as "I should do that." That's the sentence that haunts you all week. Give each one a specific home.`,
  },
  {
    number: "03",
    time: "Minutes 11–15",
    title: "Set the Week",
    accent: "#1e3a5f",
    bg: "#dbeafe",
    border: "#bfdbfe",
    tagline: "Three questions. Three non-negotiables. Then stop.",
    body: `This is where you look forward instead of back. Answer three questions — briefly:`,
    bullets: [
      "What are the 3 things that MUST happen next week? (Only 3. Pick ruthlessly.)",
      "Is there anything likely to fall through the cracks — something nobody's watching?",
      "What would make next week feel like a real win?",
    ],
    footer: `Write your three non-negotiables somewhere you'll see them Monday morning. That's your week's backbone.

Everything else is context. Everything else is optional until these three are handled.`,
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", color: "#1c1917" }}>

      {/* Minimal warm nav bar */}
      <header
        className="sticky top-0 z-50 border-b px-4 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#faf8f4", borderColor: "#e7e3dc" }}
      >
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.22em] uppercase transition-colors"
          style={{ color: "#78716c" }}
        >
          ← Micro Titan
        </Link>
        <span
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: "#a8a29e" }}
        >
          Free Guide
        </span>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 sm:py-24 max-w-2xl mx-auto text-center">
        <p
          className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
          style={{ color: "#b45309" }}
        >
          The Free Guide from Micro Titan
        </p>
        <h1
          className="text-4xl sm:text-5xl font-[300] leading-tight mb-5"
          style={{ fontFamily: "var(--font-mulish)", color: "#1c1917" }}
        >
          Nothing Slips
        </h1>
        <p
          className="text-xl font-semibold mb-4"
          style={{ color: "#44403c" }}
        >
          The 15-Minute Weekly Reset
        </p>
        <p className="text-base leading-relaxed" style={{ color: "#57534e" }}>
          A simple Friday ritual for anyone whose life has more moving parts
          than one person can track — and not enough time to stop and think.
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="border-t" style={{ borderColor: "#e7e3dc" }} />
      </div>

      {/* Intro */}
      <section className="px-4 py-12 max-w-2xl mx-auto">
        <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
          Most people don&apos;t lose track of things because they&apos;re disorganized.
        </p>
        <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
          They lose track because <strong style={{ color: "#1c1917" }}>life doesn&apos;t pause long enough to let you organize it.</strong>{" "}
          Kids, work, obligations, small promises you made to people — they pile up
          in the back of your mind as vague anxiety instead of as a list you can act on.
        </p>
        <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
          This guide is a <strong style={{ color: "#1c1917" }}>15-minute ritual done once a week</strong> — ideally
          Friday afternoon or Sunday evening — that clears the backlog, closes the open loops,
          and gives you a clean starting point for the week ahead.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "#44403c" }}>
          Three phases. Five minutes each. Nothing slips.
        </p>
      </section>

      {/* Phase cards */}
      <section className="px-4 pb-16 max-w-2xl mx-auto flex flex-col gap-8">
        {PHASES.map((phase) => (
          <div
            key={phase.number}
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: phase.bg, borderColor: phase.border }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: phase.accent, fontFamily: "var(--font-mulish)" }}
              >
                {phase.number}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: phase.accent, opacity: 0.7 }}>
                  {phase.time}
                </p>
                <h2 className="text-xl font-semibold" style={{ color: "#1c1917", fontFamily: "var(--font-mulish)" }}>
                  {phase.title}
                </h2>
              </div>
            </div>

            <p className="text-sm font-semibold mb-4 italic" style={{ color: phase.accent }}>
              &ldquo;{phase.tagline}&rdquo;
            </p>

            {phase.body.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: "#44403c" }}>
                {para}
              </p>
            ))}

            <ul className="flex flex-col gap-2 my-4">
              {phase.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#1c1917" }}>
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: phase.accent }}
                  />
                  {b}
                </li>
              ))}
            </ul>

            {phase.footer.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed mt-3" style={{ color: "#57534e" }}>
                {para}
              </p>
            ))}
          </div>
        ))}
      </section>

      {/* The rule */}
      <section
        className="px-4 py-12 border-y"
        style={{ backgroundColor: "#f5f0e8", borderColor: "#e7e3dc" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h3
            className="text-2xl font-[300] mb-4"
            style={{ fontFamily: "var(--font-mulish)", color: "#1c1917" }}
          >
            The one rule
          </h3>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#44403c" }}>
            <strong style={{ color: "#1c1917" }}>Do it once a week. Same time. Let go between sessions.</strong>
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#57534e" }}>
            This isn&apos;t a productivity system you maintain. It&apos;s a single 15-minute reset.
            The goal is the habit — not the perfect list. Show up on Friday, run the three phases,
            and trust that anything you didn&apos;t capture this week will come up next week.
            Nothing that matters slips twice.
          </p>
        </div>
      </section>

      {/* Aver CTA */}
      <section className="px-4 py-16 max-w-2xl mx-auto text-center">
        <p
          className="text-xs font-bold tracking-[0.25em] uppercase mb-4"
          style={{ color: "#818cf8" }}
        >
          Want this handled for you?
        </p>
        <h3
          className="text-2xl font-[300] mb-4"
          style={{ fontFamily: "var(--font-mulish)", color: "#1c1917" }}
        >
          Aver does the weekly reset with you — and tracks everything in between.
        </h3>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#57534e" }}>
          The guide gives you the framework. Aver is the agent that runs it alongside you,
          watches for things that slip between Fridays, and proves its own work before it
          calls anything done.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="https://ripple-the-download-production.up.railway.app"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            style={{ backgroundColor: "#818cf8", color: "#ffffff" }}
          >
            Try Aver free →
          </Link>
          <Link
            href="/aver"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-sm border transition-all duration-200"
            style={{ borderColor: "#d6d3d1", color: "#44403c", backgroundColor: "transparent" }}
          >
            Learn more
          </Link>
        </div>
        <p className="text-xs mt-4" style={{ color: "#a8a29e" }}>
          🔒 We never ask for your passwords. Ever.
        </p>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t text-center" style={{ borderColor: "#e7e3dc" }}>
        <p className="text-xs" style={{ color: "#a8a29e" }}>
          © 2026 Micro Titan LLC · Paris, Texas ·{" "}
          <Link href="/" className="hover:underline" style={{ color: "#a8a29e" }}>
            micro-titan.com
          </Link>
        </p>
      </footer>
    </div>
  );
}
