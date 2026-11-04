// Pitch-sheet content for micro-titan.com/pitch/*.
//
// HOW TO ADD A FUTURE SHEET (no new template, no new component):
//   1. Add one entry to PITCH_SHEETS below, keyed by the URL slug
//      (e.g. "jane-smith"), with the client's lane, story, use cases,
//      pricing, and calls to action.
//   2. The dynamic route app/pitch/[slug]/page.tsx picks it up
//      automatically via generateStaticParams — no new page file needed.
//   3. Preview the branch, check phone width, then merge only on the
//      owner's explicit go. A merged sheet is a public page.
//
// RULES FOR EVERY SHEET (do not relax these for a new entry):
//   - Use cases are examples / possibilities for discovery to confirm,
//     never promised integrations, outcomes, or problems the client stated.
//   - The client owns their own major-vendor agent and approves actions.
//     Never hand a client Boone, and never offer OpenClaw, self-hosted,
//     open-source, or shared agents.
//   - Delivery is remote, anywhere in the US — no local / town framing.
//   - No testimonials, phone numbers, or addresses. No owner last name.
//   - For regulated operators (e.g. skilled nursing), keep wording to
//     operational messages only — never promise handling of patient
//     health information. Label every example message "illustrative".

export type PricingRow = { label: string; value: string };

export type UseCase = {
  title: string;
  body: string;
  steps?: string[];
};

export type BriefMessage = {
  from: string;
  subject: string;
  urgent: boolean;
};

export type PitchSheet = {
  slug: string;
  clientName: string;
  lane: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  sub: string;
  floatingCards: { label: string; text: string }[];
  intro: string;
  useCases: UseCase[];
  flowTitle: string;
  flowSteps: { title: string; body: string }[];
  firstProjects?: string[];
  discoveryQuestions?: string[];
  timeline?: { time: string; text: string }[];
  briefDemo?: {
    title: string;
    note: string;
    messages: BriefMessage[];
    approveLabel: string;
    approvedLabel: string;
    proofTitle: string;
    proofBody: string;
  };
  status?: { heading: string; lines: string[] };
  pricing: PricingRow[];
  pricingNote: string;
  ctaMailto: boolean;
  accentCrimson?: boolean;
};

export const TRUST_TRIO = [
  { title: "You own the agent", body: "It is set up on your own major-vendor agent account, not a shared agent." },
  { title: "You approve the actions", body: "Nothing is sent, booked, or changed without your OK where it matters." },
  { title: "Proof at every step", body: "Every finished job ends in a checkable record you can look at." },
];

export const PITCH_SHEETS: Record<string, PitchSheet> = {
  "scott-moffitt": {
    slug: "scott-moffitt",
    clientName: "Scott Moffitt",
    lane: "Family",
    eyebrow: "Family · For Scott Moffitt",
    headline: "One calm morning,",
    headlineAccent: "instead of ten loose ends.",
    sub: "For a financial advisor, an OU fan, and a parent trying to keep up with his kids' schedules — an agent set up on your own accounts, to take the organizing off your plate.",
    floatingCards: [
      { label: "Morning brief", text: "Today's schedules, meetings, and games — in one place." },
      { label: "Kids' schedules", text: "School, practices, and pickups, with conflicts flagged." },
      { label: "Ready for your OK", text: "Drafts and reminders wait for you. Nothing sends itself." },
    ],
    intro:
      "This is what a Family agent setup could look like for you. These are examples to react to in discovery — not promises about a specific tool, and not a claim about how your household already works. You tell us what actually slips, and the setup is built around that.",
    useCases: [
      {
        title: "The 6:45 AM morning brief",
        body: "One short brief to start the day: what the kids have on, what you have on, and anything that needs a decision — before the day starts pulling at you.",
        steps: ["Kids' schedules pulled into one view", "Conflicts and overlaps flagged early", "Only the decisions that need you, surfaced first"],
      },
      {
        title: "A kids' schedule hub",
        body: "School days, practices, games, and pickups in one place, instead of scattered across messages, emails, and paper. When two things clash, you hear about it in time to fix it.",
      },
      {
        title: "Client meeting prep and follow-up",
        body: "For your advisory practice: a short brief before each client meeting, and follow-ups tracked afterward so nothing a client asked for goes quiet. This is organization only — the agent does not give financial advice and does not decide anything for a client.",
      },
      {
        title: "Inbox triage",
        body: "The daily pile sorted into what needs you, what can wait, and what is just noise — with drafts ready for your approval, so you clear it in minutes instead of losing an evening to it.",
      },
      {
        title: "OU Sooners game day",
        body: "Game days on the same calendar as everything else: kickoff, travel, and tickets in the same view as the kids' schedules, so a Saturday plan does not collide with a game you wanted to see.",
      },
    ],
    timeline: [
      { time: "6:45 AM", text: "Morning brief: kids' schedules, your meetings, and anything needing a decision." },
      { time: "School morning", text: "One view of drop-offs and the day's school items — no hunting through messages." },
      { time: "Workday", text: "Client meeting briefs ready before each meeting; follow-ups tracked after." },
      { time: "Afternoon", text: "Practices and pickups in the same view, with conflicts flagged in time." },
      { time: "Evening", text: "Family time, or an OU game day already fitted around the kids' schedules." },
    ],
    flowTitle: "How the setup works, start to finish",
    flowSteps: [
      { title: "Discovery", body: "We map what you want off your plate and what actually slips today." },
      { title: "Setup", body: "Your own major-vendor agent, set up on your accounts, with approval rules you agree." },
      { title: "First project", body: "Exactly one workflow, built end to end, ending in a checkable record plus your approval." },
      { title: "Proof and handoff", body: "A plain-language runbook, a 30-day check-in, and contact through Micro Titan." },
    ],
    firstProjects: [
      "The morning brief — one daily summary of family and work schedules",
      "The kids' schedule hub — school, practices, and pickups in one place",
      "Inbox triage — the daily pile sorted, with drafts waiting for your OK",
    ],
    pricing: [
      { label: "Discovery", value: "$150 (credited)" },
      { label: "Setup", value: "$750" },
      { label: "First household project", value: "$750" },
      { label: "Program total", value: "$1,650" },
      { label: "Total after credit", value: "$1,500" },
      { label: "Monthly tune-up (optional)", value: "$95/mo" },
    ],
    pricingNote:
      "Discovery is credited toward the program total. Additional household projects are scoped separately. The intake itself charges nothing.",
    ctaMailto: true,
    accentCrimson: true,
  },
  "craig-corriston": {
    slug: "craig-corriston",
    clientName: "Craig Corriston",
    lane: "Solo entrepreneur",
    eyebrow: "Solo entrepreneur · For Craig Corriston",
    headline: "Emails, texts, and calls,",
    headlineAccent: "finally in one morning brief.",
    sub: "For an operator running a few skilled nursing facilities who is overwhelmed by the daily flood — an agent set up on your own accounts, to triage the messages and track the follow-through.",
    floatingCards: [
      { label: "7 AM brief", text: "What needs you today, across every facility." },
      { label: "Needs you", text: "Only the urgent items first — the rest can wait." },
      { label: "Proof record", text: "Every approval leaves a record you can check." },
    ],
    intro:
      "This is what a Solo setup could look like for you. These are examples to react to in discovery — not promises about a specific tool, and not a claim about how your facilities already run. The focus here is operational messages only: staffing, vendors, and follow-ups. This setup does not handle patient health information.",
    useCases: [
      {
        title: "Morning triage brief",
        body: "One brief at 7 AM across your facilities: what needs you, what can wait, and what is already handled. Try the example below — it is illustrative, not your real messages.",
        steps: ["Messages sorted by urgency, not by arrival order", "Draft replies ready for your approval", "Nothing sent without your OK"],
      },
      {
        title: "Staffing and call-out chase",
        body: "When a shift needs cover, the follow-ups are tracked in one place: who was asked, who answered, and what is still open — so a gap does not get lost in a thread you never got back to.",
      },
      {
        title: "Follow-through tracking",
        body: "Every message that needs a reply gets tracked until it is answered or you decide otherwise. The point is simple: fewer dropped threads, fewer surprises the next morning.",
      },
      {
        title: "Multi-facility roll-up",
        body: "One roll-up across all your facilities instead of a separate inbox hunt per site: staffing gaps, vendor items, and open follow-ups, each labelled by facility, in a single view.",
      },
    ],
    briefDemo: {
      title: "Example 7 AM brief — illustrative only",
      note: "These are example messages, not real messages from any facility. Tap “Needs you” to filter to the urgent items, and approve the vendor draft to see the proof record it leaves.",
      messages: [
        { from: "Facility A — staffing (illustrative)", subject: "Call-out for the evening shift — cover still open", urgent: true },
        { from: "Vendor — supplies (illustrative)", subject: "Delivery window confirmation — draft reply ready", urgent: true },
        { from: "Facility B — maintenance (illustrative)", subject: "Routine work order logged for next week", urgent: false },
        { from: "Newsletter (illustrative)", subject: "Industry update — no action needed", urgent: false },
      ],
      approveLabel: "Approve the vendor draft",
      approvedLabel: "✓ Vendor draft approved",
      proofTitle: "Proof record",
      proofBody: "Vendor draft approved by Craig Corriston. Sent to the vendor, logged with the date and time, and filed under Facility A supplies. This is the kind of checkable record every approved action leaves.",
    },
    flowTitle: "One morning, start to finish",
    flowSteps: [
      { title: "7 AM brief", body: "The day's operational messages, triaged by urgency across facilities." },
      { title: "You decide", body: "Approve, change, or skip each draft. Nothing moves without your OK." },
      { title: "Follow-through", body: "Open items are tracked until answered or closed by you." },
      { title: "Proof", body: "Every approved action leaves a checkable record, filed by facility." },
    ],
    pricing: [
      { label: "Discovery", value: "$500 (credited)" },
      { label: "Setup", value: "$1,500" },
      { label: "First workflow", value: "$3,500" },
      { label: "Program total", value: "$5,500" },
      { label: "Total after credit", value: "$5,000" },
      { label: "Monthly operate plan (optional)", value: "$350/mo" },
      { label: "Additional workflows", value: "$1,500–$3,500 each" },
    ],
    pricingNote:
      "Discovery is credited toward the program total. Additional workflows are scoped separately. The intake itself charges nothing.",
    ctaMailto: true,
  },
  "jason-spiegel": {
    slug: "jason-spiegel",
    clientName: "Jason Spiegel",
    lane: "Business",
    eyebrow: "Business · For Jason Spiegel, Giant Pro Graphics",
    headline: "One job,",
    headlineAccent: "no phone tag.",
    sub: "For Giant Pro Graphics in Pembroke, Massachusetts — wide-format retail signage for supermarkets and convenience stores, on EFI roll-to-roll and flatbed machines, in growth mode — and a production flow that should move faster and more seamlessly.",
    floatingCards: [
      { label: "Inbox", text: "A job arrives once, and is never retyped." },
      { label: "Proof", text: "Proofs out, approvals back, in one place." },
      { label: "Ready for your OK", text: "Delivery confirmed, with a record to check." },
    ],
    intro:
      "These use cases are possibilities for discovery to confirm — not problems Jason has stated, and not a claim about how Giant Pro runs today. Discovery comes first: we map one job type end to end, then build the flow around what actually stalls. Giant Pro already runs Nulogy on the floor — Micro Titan builds the connective tissue around it, not a replacement floor system: jobs in without retyping, proofs and approvals kept moving, the floor kept in step, and delivery confirmed, as examples for discovery to confirm.",
    useCases: [
      {
        title: "Job intake without retyping",
        body: "A job enters once and flows to the next step, instead of being retyped at every handoff. Possibility to confirm in discovery: where does retyping actually happen today?",
        steps: ["Job details captured once", "Routed to the right next step", "No second copy to drift out of date"],
      },
      {
        title: "Proofs out, approvals back",
        body: "Proofs go out and approvals come back in one place, with the wait visible — so a job is not quietly stalled waiting on a sign-off nobody chased.",
        steps: ["Proof sent with a clear approval ask", "Approval status visible at a glance", "Chase only the approvals that are actually overdue"],
      },
      {
        title: "The floor staying in step",
        body: "Work stays in step across both machine types — roll-to-roll and flatbed — so capacity is visible and a busy machine does not become a surprise bottleneck.",
      },
      {
        title: "Delivery confirmed out the door",
        body: "A job is confirmed delivered with a checkable record: what went out, when, and to whom — instead of a status that lives in someone's memory or a phone call.",
      },
    ],
    flowTitle: "One job, start to finish",
    flowSteps: [
      { title: "Intake", body: "The job arrives once, with everything the next step needs." },
      { title: "Proof and approval", body: "Proofs out, approvals back, with the wait visible." },
      { title: "Production", body: "The floor stays in step across roll-to-roll and flatbed." },
      { title: "Delivery", body: "Confirmed out the door, with a record you can check." },
    ],
    discoveryQuestions: [
      "How does a job enter the shop today, and what gets retyped along the way?",
      "What does an approval loop look like — who signs proofs, and how long does a job wait?",
      "How do you decide which machine takes which job, and what happens when one is busy?",
      "How do customers get status updates today, and how many calls does that take?",
      "What information has to travel from art to production without being lost?",
      "How do you know a job is truly done and out the door?",
      "Your systems today — Nulogy & CoreBridge: What does Nulogy cover well today, and where does work still fall back to email or spreadsheets?",
      "Where do jobs actually stall today, between intake, proof, production, and delivery?",
      "How do retail buyers send orders and store lists now, and how do they check on a job's status?",
      "What happens when a program changes mid-run — who finds out, and how fast?",
      "In your own words, what did not fit about CoreBridge when you looked into it?",
    ],
    status: {
      heading: "Where this stands now — updated November 3, 2026",
      lines: [
        "One-tap intake is LIVE and proven in production: a visitor sends an intake in one tap at micro-titan.com/intake, and it arrives at hello@micro-titan.com.",
        "One-tap discovery booking is LIVE and proven in production: a booking request sent at micro-titan.com/book-discovery arrives at hello@micro-titan.com. Preferred times are preferences only — they do not book a calendar slot.",
        "Next step is a discovery conversation, using the questions below, before any build or scoped quote.",
      ],
    },
    pricing: [
      { label: "Discovery (proposed)", value: "$1,000 (credited)" },
      { label: "Setup (proposed)", value: "$2,500" },
      { label: "First job-flow project (proposed)", value: "$6,500" },
      { label: "Program total (proposed)", value: "$10,000" },
      { label: "Total after credit (proposed)", value: "$9,000" },
      { label: "Monthly operate plan (optional, proposed)", value: "$950/mo" },
      { label: "Additional job types (proposed)", value: "$3,500–$6,500 each" },
    ],
    pricingNote:
      "All pricing above is proposed, not agreed with Jason. Discovery is credited toward the program total. Travel and on-site work are never included in tier totals and would be separate scope and price, if agreed.",
    ctaMailto: true,
  },
  "gatz-nottingham": {
    slug: "gatz-nottingham",
    clientName: "Gatz Nottingham",
    lane: "Solo entrepreneur",
    eyebrow: "For Gatz Nottingham, Nu-Tek Foundation Solitions",
    headline: "A one-person business,",
    headlineAccent: "without everything depending on you.",
    sub: "For the single owner of Nu-Tek Foundation Solitions in Paris, Texas — a business where everything depends on him, and operating it has become overwhelming.",
    floatingCards: [
      { label: "Calls triaged", text: "Messages sorted so nothing is dropped." },
      { label: "Ready for your OK", text: "Draft replies wait for your approval." },
      { label: "Follow-through", text: "Invoicing and estimates tracked to done." },
    ],
    intro:
      "This is what a setup could look like for a one-person operation. These are examples to react to in discovery — not promises about a specific tool, and not a claim about how Nu-Tek already runs. You tell us where the burden actually lands, and the setup is built around that. Nu-Tek's location in Paris, Texas is a fact about your business, not a limit on Micro Titan's service, which is delivered remotely, anywhere in the US.",
    useCases: [
      {
        title: "Phone calls and messages, triaged",
        body: "Calls and emails sorted into what needs you, what can wait, and what is already handled — so a missed call does not become a lost job. Possibility to confirm in discovery: where do messages actually get dropped today?",
        steps: ["Calls and messages triaged by urgency", "Draft replies ready for your approval", "Nothing sent without your OK"],
      },
      {
        title: "Invoicing follow-through",
        body: "Invoices tracked from sent to paid, with follow-ups that do not depend on your memory — so work you already did does not sit unpaid because the chase slipped.",
      },
      {
        title: "Estimating intake and organization",
        body: "Estimate requests organized in one place, with the details each estimate needs gathered up front — so an estimate does not stall waiting on a fact nobody collected.",
      },
      {
        title: "One owner, one brief",
        body: "A single daily view of what needs you today — calls to return, invoices to chase, estimates to finish — instead of the whole business living in your head and your inbox at once.",
      },
    ],
    flowTitle: "How the setup works, start to finish",
    flowSteps: [
      { title: "Discovery", body: "We map where the burden actually lands — calls, emails, invoicing, estimating." },
      { title: "Setup", body: "Your own major-vendor agent, set up on your accounts, with approval rules you agree." },
      { title: "First workflow", body: "Exactly one workflow, built end to end, ending in a checkable record plus your approval." },
      { title: "Proof and handoff", body: "A plain-language runbook, a 30-day check-in, and contact through Micro Titan." },
    ],
    pricing: [
      { label: "Discovery", value: "$500 (credited)" },
      { label: "Setup", value: "$1,500" },
      { label: "First workflow", value: "$3,500" },
      { label: "Program total", value: "$5,500" },
      { label: "Total after credit", value: "$5,000" },
      { label: "Monthly operate plan (optional)", value: "$350/mo" },
      { label: "Additional workflows", value: "$1,500–$3,500 each" },
    ],
    pricingNote:
      "Solo founder tier pricing. Discovery is credited toward the program total. Additional workflows are scoped separately. The intake itself charges nothing.",
    ctaMailto: true,
  },
};

export const PITCH_SLUGS = Object.keys(PITCH_SHEETS);
