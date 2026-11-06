import Link from "next/link";
import AgentFlowVisuals from "./AgentFlowVisuals";

/** Same tying line as the homepage agent-setup section (PR #46). */
const TYING_LINE =
  "We don't sell you an agent, and we don't just build you software. We wire the agent into your real work, prove each job with a record, and keep operating it — so the work stops depending on you being available.";

const STEPS = ["Start", "Set up", "Prove", "Operate"];

const tiers = [
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

const agents = [
  { badge: "M", name: "Muse by Meta", note: "Default for administrative work: inbox, calendar, briefings, and follow-up." },
  { badge: "G", name: "Grok Bot by Grok", note: "Phone and call work. Call availability is checked in discovery, as rollout varies by account." },
  { badge: "C", name: "Claude by Anthropic", note: "Careful writing, long documents, and Google Workspace work. Gmail, Calendar, and Drive connectors." },
  { badge: "✦", name: "Gemini by Google", note: "The all-Google option: native Gmail, Calendar, Drive, and Docs, with a Daily Brief." },
];

export default function AgentSetup() {
  return (
    <section className="section wrap" id="agent-setup">
      <div className="section-heading">
        <p className="eyebrow">AGENT SETUP AND OPERATION</p>
        <h2>The agent, wired in <em>and kept at work.</em></h2>
        <p>{TYING_LINE}</p>
      </div>
      <ol className="service-columns agent-setup-steps">
        {STEPS.map((name, index) => (
          <li key={name}>
            <span className="service-number" aria-hidden="true">0{index + 1}</span>
            <h3>{name}</h3>
          </li>
        ))}
      </ol>
      <div className="service-columns">
        {tiers.map((tier) => (
          <article key={tier.title}>
            <span className="service-label">{tier.tag}</span>
            <h3>{tier.title}</h3>
            <p><strong>{tier.price} total.</strong> {tier.after}. {tier.monthly}.</p>
            <ul>
              {tier.points.map((point) => (
                <li key={point} style={{ listStyle: "none", margin: "8px 0", fontSize: 14 }}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="path-band">
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
      <div className="section-heading" style={{ marginTop: 40 }}>
        <p className="eyebrow">YOUR AGENT, YOUR CHOICE</p>
        <h2>Four trusted options. <em>Discovery recommends.</em></h2>
        <p>We recommend an agent based on the job, the systems you already use, and your comfort with the platform. You own your agent account. Passwords never pass through Micro Titan, and an agent asks for your approval before sending, buying, or acting on your behalf. We do not offer self-hosted or open-source agents.</p>
      </div>
      <div className="path-grid">
        {agents.map((agent) => (
          <article key={agent.name}>
            <p className="path-tag">{agent.badge} — {agent.name}</p>
            <p>{agent.note}</p>
          </article>
        ))}
      </div>
      <AgentFlowVisuals />
      <p style={{ marginTop: 28 }}>
        <Link className="button" href="/intake">
          Start <span aria-hidden="true">↗</span>
        </Link>
      </p>
      <p className="fine-print">Prices above are the agent-setup tiers. Websites, custom software, SEO, and marketing are separate services, scoped separately.</p>
    </section>
  );
}
