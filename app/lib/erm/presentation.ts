/**
 * Micro Titan presentation generation — pure, deterministic, no I/O.
 *
 * Design: micro-titan-agent-led-discovery-design-2026-11-05.md (§8).
 * The presentation is the pitch sheet, upgraded: after agent-led
 * discovery, the agent takes the intake + the discovery transcript
 * and builds a presentation from the client's verbatim answers, in
 * their words. The owner reviews it with the transcript before any
 * client sees it, and sells from it on a closing call only if one
 * is needed.
 *
 * Rules this module enforces by construction:
 * - Deterministic: the same intake + transcript in always produces
 *   the same presentation out. No randomness, no dates, no model
 *   paraphrase.
 * - Verbatim: the client's plate, intake answers, and discovery
 *   turns are quoted exactly as supplied, never rewritten into new
 *   claims. A blank or missing answer is reported as "not stated
 *   in intake" / "not stated in discovery" — never invented.
 * - Only the CLIENT's words become claims. Agent turns from the
 *   transcript are never quoted as if the client said them; they
 *   are not included in the presentation at all.
 * - Every claim traces to a source: each quoted item carries
 *   source "intake" or "discovery", and the `claims` list records
 *   every claim with its source. If a claim cannot be traced to
 *   an intake answer or a transcript turn, it does not go in.
 * - First job is a POSSIBILITY, not a promise: the one example is
 *   drawn ONLY from the existing /use-cases library for the
 *   client's lane (same selection as the pitch sheet), labelled
 *   EXAMPLE / POSSIBILITY. Nothing here promises an integration,
 *   an outcome, a tool, or a timeline.
 * - Draft by default: every generated presentation has status
 *   "draft", published false, sent false. Generation never
 *   publishes and never sends anything to a client. The owner
 *   reviews first; only a later, separately approved step may
 *   move a draft forward.
 * - Pricing comes only from LANE_PRICING in ./types (the approved
 *   tier totals). No other price may appear.
 * - Approved verbatim wording: the next-steps section uses the
 *   owner-approved discovery wording exactly as approved
 *   (2026-11-05, source micro-titan-g7-discovery-wording-DRAFT-
 *   2026-11-05.md): "Nothing moves to setup until you've seen
 *   your presentation and said go." The disclosure line quoted
 *   in the presentation is likewise the approved verbatim line:
 *   "I'm Micro Titan's agent, not a person." Neither line is
 *   paraphrased anywhere in this module.
 * - Privacy: template text contains no owner name, personal phone,
 *   or personal email. The offering speaks as Micro Titan only;
 *   the only contact shown is the business address
 *   hello@micro-titan.com. No testimonials, no other client's data.
 * - Contact details belong in the intake's contact fields, not in
 *   the presentation body. The generator quotes plate/answers/
 *   transcript verbatim, so if a client pasted a phone number or
 *   address into an answer, the owner check (which gates every
 *   show/send) must catch it before the presentation goes
 *   anywhere. The generator itself never adds contact details.
 */

import type {
  DiscoveryChannel,
  DiscoveryRecommendation,
  DiscoveryTranscriptTurn,
  Lane,
  LanePricing,
} from "./types";
import type { UseCase } from "../../use-cases/use-cases";
import type { GeneratedExample, PitchAnswer } from "./pitch";

export interface PresentationCatalog {
  pricing: Record<Lane, LanePricing>;
  useCases: UseCase[];
}

/**
 * The generator takes its helpers as parameters instead of importing
 * them, for one deliberate reason: this file must stay importable by
 * the plain `node --test` suite (which strips types and requires
 * explicit file extensions), while the Next source files use
 * extensionless imports. The single sources of truth do not move:
 * the caller passes lanePricingRows and selectExamples from
 * ./pitch, and the tests pass the same two values. Nothing here
 * duplicates a price or an example-selection rule.
 */
export interface PresentationHelpers {
  /** Shared constants from ./pitch — passed in, never duplicated. */
  notStated: string;
  trustNote: string;
  lanePricingRows: (
    lane: Lane,
    pricing: Record<Lane, LanePricing>,
  ) => { label: string; value: string }[];
  selectExamples: (
    lane: Lane,
    plate: string,
    answers: PitchAnswer[],
    useCases: UseCase[],
  ) => { examples: GeneratedExample[]; matched: boolean };
}

export interface PresentationIntakeInput {
  reference: string;
  name: string;
  lane: Lane;
  agentPreference?: string;
  /** "What they want off their plate", verbatim from the intake. */
  plate: string;
  answers: PitchAnswer[];
}

export interface PresentationDiscoveryInput {
  channel: DiscoveryChannel;
  /** What the client picked: "text" or "call". Recorded, not assumed. */
  formatChoice: "text" | "call";
  /** Full transcript, every turn in order. Client turns only are quoted. */
  transcript: DiscoveryTranscriptTurn[];
  recommendation: DiscoveryRecommendation;
  recommendationReason: string;
}

export interface PresentationInput {
  intake: PresentationIntakeInput;
  discovery: PresentationDiscoveryInput;
}

export interface TracedQuote {
  text: string;
  source: "intake" | "discovery";
}

export interface PresentationClaim {
  section: string;
  text: string;
  source: "intake" | "discovery" | "approved lane pricing";
}

export interface GeneratedPresentation {
  reference: string;
  name: string;
  lane: Lane;
  agentPreference: string;
  /** Always "draft" at generation time. See the header comment. */
  status: "draft";
  discoveryChannel: DiscoveryChannel;
  formatChoice: "text" | "call";
  recommendation: DiscoveryRecommendation;
  recommendationReason: string;
  /** The approved verbatim disclosure line, quoted — not paraphrased. */
  disclosure: string;
  /** 1. What you told us — verbatim, traced. */
  whatYouToldUs: {
    plate: TracedQuote;
    answers: (TracedQuote & { question: string; stated: boolean })[];
    discoverySaid: TracedQuote[];
  };
  /** 2. What that costs you today — the client's own words only. */
  whatItCostsYou: {
    items: TracedQuote[];
    stated: boolean;
    note: string;
  };
  /** 3. What the first job would be — one example, a possibility only. */
  firstJob: {
    possibility: GeneratedExample | null;
    label: string;
    doneLooksLike: TracedQuote[];
    doneStated: boolean;
  };
  /** 4. What it costs — approved lane pricing only. */
  pricing: { label: string; value: string }[];
  pricingNote: string;
  /** 5. What happens next — approved verbatim wording, process only. */
  whatHappensNext: {
    steps: string[];
    /** Approved verbatim: the approval gate, in the client's language. */
    approvalGate: string;
  };
  trustNote: string;
  contact: string;
  /** What was thin or missing, stated plainly. */
  missing: string[];
  /** Every claim in this presentation, with its source. */
  claims: PresentationClaim[];
  /** Generation never publishes and never sends. */
  published: false;
  sent: false;
}

export const NOT_STATED_IN_DISCOVERY = "not stated in discovery";

/** Approved verbatim (2026-11-05) — use exactly, never paraphrase. */
export const APPROVED_APPROVAL_GATE =
  "Nothing moves to setup until you've seen your presentation and said go.";
export const APPROVED_DISCLOSURE = "I'm Micro Titan's agent, not a person.";

export const FIRST_JOB_LABEL =
  "Example / possibility only: a first job to consider, not a promised integration, outcome, or tool. Discovery confirms the real workflow for each client.";

const COST_KEYWORDS = [
  "hour",
  "hours",
  "evening",
  "weekend",
  "time",
  "lost",
  "lose",
  "behind",
  "late",
  "cost",
  "costs",
  "money",
  "expensive",
  "overwhelm",
  "drowning",
  "tired",
  "stress",
  "chaos",
  "chasing",
];

const DONE_KEYWORDS = [
  "done",
  "looks like",
  "would mean",
  "success",
  "finished",
  "sorted",
  "off my plate",
  "back",
];

function matchesAny(text: string, keywords: string[]): boolean {
  // Word-token match, not substring: "time" must not match
  // "TimeTree", and "evening" must match "evenings". A keyword
  // matches a token, or a token that is the keyword + "s".
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
  return keywords.some((k) =>
    tokens.some((token) => token === k || token === `${k}s`),
  );
}

function stated(text: string): boolean {
  return text.trim().length > 0;
}

/**
 * Generate a presentation draft from an intake + a discovery
 * transcript. Pure: no I/O, no randomness, no dates. The same
 * inputs always produce the same presentation.
 */
export function generatePresentation(
  input: PresentationInput,
  catalog: PresentationCatalog,
  helpers: PresentationHelpers,
): GeneratedPresentation {
  const { intake, discovery } = input;
  const NOT_STATED = helpers.notStated;
  const plateStated = stated(intake.plate);
  const plate: TracedQuote = {
    text: plateStated ? intake.plate : NOT_STATED,
    source: "intake",
  };
  const answers = intake.answers.map((a) => ({
    question: a.question,
    text: stated(a.answer) ? a.answer : NOT_STATED,
    stated: stated(a.answer),
    source: "intake" as const,
  }));
  // Only the client's turns are quoted. Agent turns are never
  // presented as if the client said them.
  const discoverySaid: TracedQuote[] = discovery.transcript
    .filter((t) => t.speaker === "client" && stated(t.text))
    .map((t) => ({ text: t.text, source: "discovery" as const }));

  const costItems: TracedQuote[] = [
    ...answers
      .filter((a) => a.stated && matchesAny(a.text, COST_KEYWORDS))
      .map((a) => ({ text: a.text, source: "intake" as const })),
    ...discoverySaid.filter((q) => matchesAny(q.text, COST_KEYWORDS)),
  ];
  const doneLooksLike = discoverySaid.filter((q) =>
    matchesAny(q.text, DONE_KEYWORDS),
  );

  // First job: one example from the /use-cases library only, chosen
  // by the same keyword match the pitch sheet uses — a possibility,
  // never a promise. Reuse the pitch generator's selection so the
  // two documents cannot disagree about what fits.
  const { examples } = helpers.selectExamples(
    intake.lane,
    intake.plate,
    intake.answers,
    catalog.useCases,
  );
  const possibility = examples[0] ?? null;

  const pricing = helpers.lanePricingRows(intake.lane, catalog.pricing);

  const missing: string[] = [];
  if (!plateStated) missing.push("What they want off their plate: not stated in intake.");
  if (costItems.length === 0)
    missing.push("What it costs them today: not stated in intake or discovery.");
  if (doneLooksLike.length === 0)
    missing.push("What 'done' looks like: not stated in discovery.");
  if (discoverySaid.length === 0)
    missing.push("Discovery transcript: no client turns recorded.");

  const claims: PresentationClaim[] = [
    { section: "what you told us", text: plate.text, source: "intake" },
    ...answers.map((a) => ({
      section: "what you told us",
      text: a.text,
      source: "intake" as const,
    })),
    ...discoverySaid.map((q) => ({
      section: "what you told us",
      text: q.text,
      source: "discovery" as const,
    })),
    ...costItems.map((q) => ({
      section: "what it costs you today",
      text: q.text,
      source: q.source,
    })),
    ...pricing.map((row) => ({
      section: "what it costs",
      text: `${row.label}: ${row.value}`,
      source: "approved lane pricing" as const,
    })),
  ];

  return {
    reference: intake.reference,
    name: intake.name,
    lane: intake.lane,
    agentPreference: intake.agentPreference ?? "Help me choose in discovery",
    status: "draft",
    discoveryChannel: discovery.channel,
    formatChoice: discovery.formatChoice,
    recommendation: discovery.recommendation,
    recommendationReason: discovery.recommendationReason,
    disclosure: APPROVED_DISCLOSURE,
    whatYouToldUs: { plate, answers, discoverySaid },
    whatItCostsYou: {
      items: costItems,
      stated: costItems.length > 0,
      note:
        costItems.length > 0
          ? "In the client's own words, from the intake and the discovery transcript."
          : NOT_STATED_IN_DISCOVERY,
    },
    firstJob: {
      possibility,
      label: FIRST_JOB_LABEL,
      doneLooksLike,
      doneStated: doneLooksLike.length > 0,
    },
    pricing,
    pricingNote:
      "Approved lane pricing only. The discovery fee is credited toward the program total. The monthly plan is optional.",
    whatHappensNext: {
      steps: [
        "The owner reviews this presentation with the full discovery transcript and the agent's recommendation.",
        "If the owner approves, this presentation may be shown to the client and setup may start.",
        "If a closing call is needed, the owner sells from this presentation — the client has already been through intake, agreement, payment, and discovery.",
        "Setup starts only after approval. The first job ends in a proof packet, with a checkable record at each step.",
        "Everything is sorted in one app — the Cockpit — as part of the operate plan: status, records, proof, and next steps.",
      ],
      approvalGate: APPROVED_APPROVAL_GATE,
    },
    trustNote: helpers.trustNote,
    contact: "hello@micro-titan.com",
    missing,
    claims,
    published: false,
    sent: false,
  };
}

export type { GeneratedExample };
