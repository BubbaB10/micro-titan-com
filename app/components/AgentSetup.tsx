import AgentInquiry from "./AgentInquiry";
import AgentFlowVisuals from "./AgentFlowVisuals";
import VisionFlowBand from "./VisionFlowBand";

const tiers = [
  {
    tag: "FOR YOU — FAMILY",
    title: "Family",
    price: "$1,650",
    after: "$1,500 after the $150 discovery credit",
    monthly: "$95/month optional tune-up",
    points: ["$150 discovery, credited if you proceed within 30 days", "$750 agent setup — your own agent, your accounts", "$750 first household project", "Additional projects $350–$750 each"],
  },
  {
    tag: "FOR YOU — SOLO BUSINESS",
    title: "Solo entrepreneur",
    price: "$5,500",
    after: "$5,000 after the $500 discovery credit",
    monthly: "$350/month operate plan",
    points: ["$500 discovery, credited if you proceed within 30 days", "$1,500 agent setup — your own agent, your accounts", "$3,500 first workflow, end to end", "Additional workflows $1,500–$3,500 each"],
  },
  {
    tag: "FOR YOUR BUSINESS",
    title: "Business",
    price: "$10,000",
    after: "$9,000 after the $1,000 discovery credit",
    monthly: "$950/month operate plan",
    points: ["$1,000 discovery, credited if you proceed within 30 days", "$2,500 agent setup — your own agent, your accounts", "$6,500 first job-flow project, end to end", "Additional job types $3,500–$6,500 each"],
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
        <p className="eyebrow">AGENT SETUP — NEW</p>
        <h2>Your own agent, <em>set up properly.</em></h2>
        <p>Consult, set up your own agent, help with the switchover and the project that motivated it, then hand it back with proof. This is in addition to our custom software, websites, and marketing services — not a replacement for them.</p>
      </div>
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
      <div className="section-heading" style={{ marginTop: 40 }}>
        <p className="eyebrow">YOUR AGENT, YOUR CHOICE</p>
        <h2>Four trusted options. <em>Discovery recommends.</em></h2>
        <p>We recommend an agent based on the job, the systems you already use, and your comfort with the platform — we do not force one platform on you.</p>
      </div>
      <div className="path-grid">
        {agents.map((agent) => (
          <article key={agent.name}>
            <p className="path-tag">{agent.badge} — {agent.name}</p>
            <p>{agent.note}</p>
          </article>
        ))}
      </div>
      <div className="path-band single">
        <div>
          <h3>Trusted, and yours</h3>
          <p>Only major-vendor, client-owned agents are offered. You own your agent account. Passwords never pass through Micro Titan, and an agent asks for your approval before sending, buying, or acting on your behalf. We do not offer self-hosted or open-source agents.</p>
        </div>
      </div>
      <VisionFlowBand />
      <AgentFlowVisuals />
      <AgentInquiry />
    </section>
  );
}
