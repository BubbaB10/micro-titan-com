import type { Metadata } from "next";
import Link from "next/link";
import ServicesShell from "./components/ServicesShell";
import VisionHeroLoop from "./components/VisionHeroLoop";
import { dollars, offer } from "./services-offer";
import VisionIcon from "./components/VisionIcon";
import type { VisionIconName } from "./components/VisionIcon";
import VisionFlowBand from "./components/VisionFlowBand";
import AgentFlowVisuals from "./components/AgentFlowVisuals";
import "./vision-home.css";

export const metadata: Metadata = {
  title: "Micro Titan — Agent setup and operation",
  description:
    "Micro Titan wires your own agent into your real work, proves each job with a record, and keeps operating it. Remote, nationwide. Custom apps, websites, and marketing support that work. hello@micro-titan.com.",
  keywords: ["Micro Titan", "AI agent setup", "custom business software", "business automation", "websites"],
  openGraph: {
    title: "Micro Titan — Agent setup and operation",
    description:
      "We wire the agent into your real work, prove each job with a record, and keep operating it. Remote, nationwide.",
    url: "https://micro-titan.com",
    siteName: "Micro Titan",
    type: "website",
    images: [{ url: "/icons/og-image.png", width: 1200, height: 630, alt: "Micro Titan" }],
  },
};

const TYING_LINE =
  "We don't sell you an agent, and we don't just build you software. We wire the agent into your real work, prove each job with a record, and keep operating it — so the work stops depending on you being available.";

/** Approved verbatim format choice (2026-11-05). Do not paraphrase. */
const DISCOVERY_FORMAT_CHOICE =
  "Your discovery is paid — thank you. How would you like to do it?\n\n" +
  "Text — agent-led, at your pace\n" +
  "Chat with Micro Titan's agent by text, whenever you're ready. It will walk through your discovery questions one at a time.\n\n" +
  "Call — 15–20 minutes\n" +
  "A 15–20 minute call with Micro Titan's agent, at a time you pick. It's recorded so nothing you say gets lost.\n\n" +
  "Either way, what you say goes into your presentation, and nothing moves to setup until you've seen it.";

const STEPS: { name: string; icon: VisionIconName; tone: "blue" | "red" | "green" | "yellow" }[] = [
  { name: "Start", icon: "chat", tone: "blue" },
  { name: "Set up", icon: "setup", tone: "red" },
  { name: "Prove", icon: "proof", tone: "green" },
  { name: "Operate", icon: "flag", tone: "yellow" },
];

const TIERS = [
  {
    tag: "FOR YOU — FAMILY",
    title: "Family",
    price: "$1,650",
    after: "$1,500 after the $150 discovery credit",
    monthly: "$95/month optional tune-up",
    points: [
      "$150 discovery, credited toward the program total",
      "$750 agent setup — your own agent, your accounts",
      "$750 first household project",
      "Additional projects $350–$750 each",
    ],
  },
  {
    tag: "FOR YOU — SOLO BUSINESS",
    title: "Solo entrepreneur",
    price: "$5,500",
    after: "$5,000 after the $500 discovery credit",
    monthly: "$350/month operate plan",
    points: [
      "$500 discovery, credited toward the program total",
      "$1,500 agent setup — your own agent, your accounts",
      "$3,500 first workflow, end to end",
      "Additional workflows $1,500–$3,500 each",
    ],
  },
  {
    tag: "FOR YOUR BUSINESS",
    title: "Business",
    price: "$10,000",
    after: "$9,000 after the $1,000 discovery credit",
    monthly: "$950/month operate plan",
    points: [
      "$1,000 discovery, credited toward the program total",
      "$2,500 agent setup — your own agent, your accounts",
      "$6,500 first job-flow project, end to end",
      "Additional job types $3,500–$6,500 each",
    ],
  },
];

const AGENTS = [
  { badge: "M", name: "Muse by Meta", note: "Default for administrative work: inbox, calendar, briefings, and follow-up." },
  { badge: "G", name: "Grok Bot by Grok", note: "Phone and call work. Call availability is checked in discovery, as rollout varies by account." },
  { badge: "C", name: "Claude by Anthropic", note: "Careful writing, long documents, and Google Workspace work. Gmail, Calendar, and Drive connectors." },
  { badge: "✦", name: "Gemini by Google", note: "The all-Google option: native Gmail, Calendar, Drive, and Docs, with a Daily Brief." },
];

export default function HomePage() {
  return (
    <ServicesShell vision>
      <section className="mtv-hero" aria-labelledby="mtv-title">
        <div className="mtv-hero-main">
          <div className="mtv-hero-copy">
            <h1 id="mtv-title">
              Your own agent,<br />
              <em>wired into the work,</em>
              <br />
              and <span className="mtv-highlight">kept running.</span>
            </h1>
            <p>{TYING_LINE}</p>
            <div className="mtv-hero-actions">
              <Link className="mtv-button" href="/intake">
                Start <VisionIcon name="arrow" />
              </Link>
              <a className="mtv-button mtv-button-outline" href="#see-it-work">
                See it work
              </a>
            </div>
          </div>
          <VisionHeroLoop />
        </div>
        <div className="mtv-trust">
          <div>
            <VisionIcon name="layers" />
            <strong>You own the agent</strong>
          </div>
          <div>
            <VisionIcon name="shield" />
            <strong>You approve the actions</strong>
          </div>
          <div>
            <VisionIcon name="proof" />
            <strong>Proof at every step</strong>
          </div>
        </div>
      </section>
      <VisionFlowBand />
      <section className="mtv-steps" id="how-it-works" aria-labelledby="mtv-steps-title">
        <h2 id="mtv-steps-title">
          Four steps.
          <br />
          <em>Then we keep operating it.</em>
        </h2>
        <ol>
          {STEPS.map((step) => (
            <li key={step.name} className={`is-${step.tone}`}>
              <span>
                <VisionIcon name={step.icon} />
              </span>
              <strong>{step.name}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="section wrap" id="for-you">
        <div className="section-heading" id="agent-setup">
          <p className="eyebrow">01 / AGENT SETUP AND OPERATION</p>
          <h2>
            The agent, wired in
            <br />
            <em>and kept at work.</em>
          </h2>
          <p>{TYING_LINE}</p>
        </div>
        <div className="service-columns">
          {TIERS.map((tier) => (
            <article key={tier.title}>
              <span className="service-label">{tier.tag}</span>
              <h3>{tier.title}</h3>
              <p>
                <strong>{tier.price} total.</strong> {tier.after}. {tier.monthly}.
              </p>
              <ul>
                {tier.points.map((point) => (
                  <li key={point} style={{ listStyle: "none", margin: "8px 0", fontSize: 14 }}>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="path-band" style={{ marginTop: 28 }}>
          <div>
            <h3>Discovery fee, credited</h3>
            <p>
              The discovery fee is credited toward the program total. There is no time limit on that credit. The monthly tune-up and the operate plan are optional, and they are not part of the program total.
            </p>
          </div>
          <div>
            <h3>Cockpit, on the operate plan</h3>
            <p>
              Everything is sorted in one app — the Cockpit — as part of the operate plan: status, records, proof, and next steps.
            </p>
          </div>
        </div>
        <div className="section-heading" style={{ marginTop: 48 }}>
          <p className="eyebrow">YOUR AGENT, YOUR CHOICE</p>
          <h2>
            Four trusted options. <em>Discovery recommends.</em>
          </h2>
          <p>
            We recommend an agent based on the job, the systems you already use, and your comfort with the platform. You own your agent account. Passwords never pass through Micro Titan, and an agent asks for your approval before sending, buying, or acting on your behalf. We do not offer self-hosted or open-source agents.
          </p>
        </div>
        <div className="path-grid">
          {AGENTS.map((agent) => (
            <article key={agent.name}>
              <p className="path-tag">
                {agent.badge} — {agent.name}
              </p>
              <p>{agent.note}</p>
            </article>
          ))}
        </div>
        <AgentFlowVisuals />
        <div className="section-heading" id="discovery" style={{ marginTop: 48 }}>
          <p className="eyebrow">HOW DISCOVERY WORKS</p>
          <h2>
            Text or a call. <em>Your choice.</em>
          </h2>
        </div>
        <p className="mtv-discovery-verbatim">{DISCOVERY_FORMAT_CHOICE}</p>
        <p style={{ marginTop: 28 }}>
          <Link className="button" href="/intake">
            Start <span aria-hidden="true">↗</span>
          </Link>
        </p>
      </section>

      <section className="section wrap" id="services">
        <div className="section-heading" id="for-business">
          <p className="eyebrow">02 / CUSTOM APPS</p>
          <h2>
            The work your business does
            <br />
            every day, <em>in software you own.</em>
          </h2>
          <p>
            Custom apps come second. When the job needs software built around how the business already runs, we build that and keep running it with you. Agent setup does not replace this, and this does not replace the agent.
          </p>
        </div>
        <div className="service-columns">
          <article>
            <span className="service-number">01</span>
            <h3>Keep the work moving.</h3>
            <p>
              Software for the work behind the counter: orders, reservations, estimates, jobs, and invoices. We build it around how your business already runs, then keep running it with you.
            </p>
            <span className="service-label">CUSTOM APPS + OPERATIONS</span>
          </article>
          <article>
            <span className="service-number">02</span>
            <h3>Start with one useful system.</h3>
            <p>
              We recommend the smallest release that solves the problem you actually have, built so it can grow. A customer portal, a staff board, and an owner view are options — not things every build has to include.
            </p>
            <span className="service-label">SIZED TO YOUR NEEDS</span>
          </article>
          <article>
            <span className="service-number">03</span>
            <h3>An assistant, where it earns its place.</h3>
            <p>
              We can build an assistant into the software we make for you — something that answers questions about your own records, or watches the work and raises what needs a person. We scope it with you and show you what it does before it goes anywhere near your customers.
            </p>
            <span className="service-label">BUILT-IN ASSISTANT</span>
          </article>
        </div>
        <div className="work-grid plain" style={{ marginTop: 36 }}>
          <article>
            <p className="eyebrow">ORDERING</p>
            <h3>Order-ahead and a staff order board</h3>
            <p>
              A deli ordering system: customers place an order ahead, staff work from a live board, and the owner maintains the menu — items, prices, variants and add-ons — through a manager built for them.
            </p>
          </article>
          <article>
            <p className="eyebrow">CHECKING THE NUMBERS</p>
            <h3>Statement comparison</h3>
            <p>
              An oil-and-gas royalty ledger: statements go in, and the software compares them month to month so you can see what changed — which wells appear, what moved, and by how much.
            </p>
          </article>
          <article>
            <p className="eyebrow">BOOKING AND MEMBERSHIP</p>
            <h3>Member reservations and club operations</h3>
            <p>
              A golf club app: members reserve tee times, see events and order food; each department works from its own view of what it needs to do.
            </p>
          </article>
        </div>
      </section>

      <section className="package-section wrap" id="websites">
        <div>
          <p className="eyebrow">03 / WEBSITES AND MARKETING</p>
          <h2>
            Websites
            <br />
            and marketing.
            <br />
            <em>Supporting the work.</em>
          </h2>
          <p>
            Websites and marketing support the agent and the custom apps. They are available on their own, or alongside that work. This is a separate service with its own price — it is not part of an agent-setup total, and custom software is scoped and quoted separately.
          </p>
        </div>
        <div className="package-card">
          <p className="eyebrow">WEBSITE + MONTHLY CARE</p>
          <div className="package-price">
            {dollars(offer.monthly)}
            <small>/ month</small>
          </div>
          <p className="setup-price">+ {dollars(offer.setup)} one-time setup</p>
          <ul>
            {offer.includes.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="eyebrow not-yet-label">INCLUDED, ONCE YOU GRANT ACCESS</p>
          <ul className="not-yet">
            {offer.withAccess.map((item) => (
              <li key={item}>
                <span aria-hidden="true">·</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="fine-print">
            Writing and preparing is our side. Publishing to your accounts, or managing your listing, needs permission only you can give — an onboarding step, not an extra charge.
          </p>
          <Link className="button" href="/pricing#quote">
            Build your website quote ↗
          </Link>
          <p className="fine-print">
            Custom operations software is scoped and quoted separately. Advertising, photography and video are not part of this package. Scope and start date agreed before you commit.
          </p>
        </div>
      </section>

      <section className="closing wrap" id="contact">
        <p className="eyebrow">REMOTE, NATIONWIDE.</p>
        <h2>
          Start with the work
          <br />
          you want off your plate.
        </h2>
        <p className="closing-sub">
          Agent setup and operation come first. Custom apps are next. Websites and marketing support that work. Reach us at hello@micro-titan.com.
        </p>
        <p className="closing-sub">
          Text or call (903) 300-5734. Msg & data rates may apply. Reply STOP to opt out.
        </p>
        <Link className="button" href="/intake">
          Start <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </ServicesShell>
  );
}
