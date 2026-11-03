/**
 * Micro Titan pitch-sheet generation — pure, deterministic, no I/O.
 *
 * Adopted intake flow (Bubba, 2026-11-03):
 *   intake -> pitch sheet generated from VERBATIM intake answers
 *   -> client explicitly agrees (recorded) -> discovery fee secured
 *   -> discovery booked (paid/confirmed) -> setup -> job(s) -> proof.
 *
 * Rules this module enforces by construction:
 * - Deterministic: the same intake in always produces the same sheet
 *   structure out. No randomness, no dates, no model paraphrase.
 * - Verbatim: the client's "what they want off their plate" text and
 *   discovery answers are quoted exactly as supplied, never rewritten
 *   into new claims. A blank or missing answer is reported as
 *   "not stated in intake" — never invented.
 * - Examples only: the example cards are drawn ONLY from the existing
 *   /use-cases library (app/use-cases/use-cases.ts, 14 cases) for the
 *   client's lane. No new workflow type is ever invented here. Every
 *   card is labelled EXAMPLE / POSSIBILITY; discovery still confirms
 *   the real workflow. Nothing here promises an integration, an
 *   outcome, or a tool.
 * - Draft by default: every generated sheet has status "draft".
 *   Generation never publishes a /pitch page and never sends anything
 *   to a client. A Boone check comes first; only a later, separately
 *   approved step may move a sheet draft -> sent, and only the owner
 *   may approve a public /pitch entry (one new entry in the PR #23
 *   shared template, never a new component).
 * - Pricing comes only from LANE_PRICING in ./types (the approved
 *   tier totals). No other price may appear in a generated sheet.
 * - Template text contains no testimonials, phone numbers, addresses,
 *   owner last name, town / service-area framing, medical / legal /
 *   tax cases, or PHI-handling promise. For regulated operators the
 *   sheet says, in the negative only, that operational messages are
 *   covered and patient health information is not handled.
 * - Contact details belong in the intake's contact fields, not in the
 *   sheet body. The generator quotes plate/answers verbatim, so if a
 *   client pasted a phone number or address into an answer, the Boone
 *   check (which gates every send) must catch it before the sheet
 *   goes anywhere. The generator itself never adds contact details.
 */

import type { Lane, LanePricing } from "./types";
import type { UseCase } from "../../use-cases/use-cases";

/**
 * The generator takes its two catalogues as parameters instead of
 * importing them, for one deliberate reason: this file must stay
 * importable by the plain `node --test` suite (which strips types
 * and requires explicit file extensions), while the Next source
 * files use extensionless imports. The single sources of truth do
 * not move: the route passes LANE_PRICING from ./types and
 * USE_CASES from app/use-cases/use-cases.ts, and the tests pass
 * the same two values. Nothing here duplicates a price or a case.
 */
export interface PitchCatalog {
  pricing: Record<Lane, LanePricing>;
  useCases: UseCase[];
}

export type PitchUseCaseLane = "Family" | "Solo" | "Business";

export function useCaseLaneFor(lane: Lane): PitchUseCaseLane {
  if (lane === "Solo entrepreneur") return "Solo";
  return lane;
}

export interface PitchAnswer {
  question: string;
  answer: string;
}

export interface PitchIntakeInput {
  reference: string;
  name: string;
  lane: Lane;
  agentPreference?: string;
  /** "What they want off their plate", verbatim from the intake. */
  plate: string;
  answers: PitchAnswer[];
}

export interface GeneratedExample {
  slug: string;
  title: string;
  pain: string;
  steps: string[];
  gets: string;
  doesNot?: string;
  label: string;
}

export interface GeneratedPitchSheet {
  reference: string;
  name: string;
  lane: Lane;
  agentPreference: string;
  /** Always "draft" at generation time. See the header comment. */
  status: "draft";
  pricing: { label: string; value: string }[];
  pricingNote: string;
  /** Verbatim plate text, or "not stated in intake". */
  plate: string;
  plateStated: boolean;
  answers: { question: string; answer: string; stated: boolean }[];
  /** Example cards, drawn only from the /use-cases library. */
  examples: GeneratedExample[];
  examplesNote: string;
  /** What was thin or missing in the intake, stated plainly. */
  missing: string[];
  trustNote: string;
  nextSteps: string[];
  /** Generation never publishes and never sends. */
  published: false;
  sent: false;
}

export const NOT_STATED = "not stated in intake";

export const EXAMPLES_NOTICE =
  "Examples / possibilities only: these are jobs to react to in discovery, not promised integrations, outcomes, or tools. Discovery confirms the real workflow for each client. Delivery is remote, anywhere.";

export const TRUST_NOTE =
  "You own your own major-vendor agent account (Muse, Grok Bot, Claude, or Gemini — your choice in discovery). Passwords never pass through Micro Titan. Nothing is sent, booked, or changed without your OK where it matters. Every finished job ends in a checkable record. The intake itself charges nothing.";

const FIRST_PROJECT_LABEL: Record<Lane, string> = {
  Family: "First household project",
  "Solo entrepreneur": "First workflow",
  Business: "First job-flow project",
};

const MONTHLY_LABEL: Record<Lane, string> = {
  Family: "Monthly tune-up (optional)",
  "Solo entrepreneur": "Monthly operate plan (optional)",
  Business: "Monthly operate plan (optional)",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

export function lanePricingRows(
  lane: Lane,
  pricing: Record<Lane, LanePricing>,
): GeneratedPitchSheet["pricing"] {
  const p = pricing[lane];
  return [
    { label: "Discovery", value: `${formatCents(p.discoveryCents)} (credited)` },
    { label: "Setup", value: formatCents(p.setupCents) },
    { label: FIRST_PROJECT_LABEL[lane], value: formatCents(p.firstCents) },
    { label: "Program total", value: formatCents(p.totalCents) },
    { label: "Total after credit", value: formatCents(p.afterCreditCents) },
    { label: MONTHLY_LABEL[lane], value: `${formatCents(p.monthlyCents)}/mo` },
  ];
}

/**
 * Keyword map for deterministic example selection. Keywords are matched
 * against the client's own words (plate + answers, lowercased). A case
 * is selected only if the client actually mentioned something it covers;
 * the matcher never invents a need the client did not state.
 */
const KEYWORDS: Record<string, string[]> = {
  "morning-brief": ["morning", "brief", "loose ends", "start of the day", "evening", "weekend"],
  "kids-schedule-hub": ["kids", "kid", "school", "practice", "pickup", "children", "game", "clash"],
  "inbox-triage": ["inbox", "email", "buried", "messages"],
  "meeting-prep-follow-up": ["meeting", "follow-up", "followup", "prep", "client"],
  "game-day-event-day": ["game day", "event day", "event", "trip"],
  "morning-triage-brief": ["morning", "email", "text", "call", "buried", "brief"],
  "staffing-call-out-chase": ["staffing", "call-out", "callout", "cover", "shift", "staff"],
  "follow-through-tracking": ["follow-through", "follow through", "forgotten", "promised", "vendor", "chase"],
  "invoicing-estimating-follow-up": ["invoice", "invoicing", "estimate", "estimating", "payment", "owed"],
  "multi-location-roll-up": ["location", "facility", "facilities", "multiple", "sites"],
  "job-intake-without-retyping": ["job", "order", "retype", "retyping", "intake", "lost"],
  "proofs-approvals": ["proof", "approval", "approve", "approved"],
  "floor-in-step": ["floor", "machine", "stage", "production", "shop"],
  "delivery-confirmed": ["delivery", "out the door", "shipped", "left the building"],
};

function scoreCase(useCase: UseCase, text: string): number {
  const keywords = KEYWORDS[useCase.slug] ?? [];
  let score = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) score += 1;
  }
  return score;
}

/**
 * Select up to 5 examples for the lane, in deterministic order:
 * highest keyword score first, library order breaking ties. If nothing
 * the client said matches any case, fall back to the first 3 cases of
 * the lane, in library order, so the sheet still shows starting
 * examples rather than inventing a fit.
 */
export function selectExamples(
  lane: Lane,
  plate: string,
  answers: PitchAnswer[],
  useCases: UseCase[],
): { examples: GeneratedExample[]; matched: boolean } {
  const useCaseLane = useCaseLaneFor(lane);
  const text = [plate, ...answers.map((a) => `${a.question} ${a.answer}`)]
    .join(" ")
    .toLowerCase();
  const laneCases = useCases.map((useCase, index) => ({ useCase, index })).filter(
    ({ useCase }) => useCase.lane === useCaseLane,
  );
  const scored = laneCases
    .map(({ useCase, index }) => ({ useCase, index, score: scoreCase(useCase, text) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const matched = scored.filter((s) => s.score > 0);
  const chosen = (matched.length > 0 ? matched : scored).slice(0, matched.length > 0 ? 5 : 3);
  return {
    matched: matched.length > 0,
    examples: chosen.map(({ useCase }) => ({
      slug: useCase.slug,
      title: useCase.title,
      pain: useCase.pain,
      steps: [...useCase.steps],
      gets: useCase.gets,
      doesNot: useCase.doesNot,
      label: "EXAMPLE / POSSIBILITY",
    })),
  };
}

export function generatePitchSheet(
  input: PitchIntakeInput,
  catalog: PitchCatalog,
): GeneratedPitchSheet {
  const plate = input.plate.trim();
  const plateStated = plate.length > 0;
  const answers = input.answers.map((a) => {
    const answer = a.answer.trim();
    return {
      question: a.question,
      answer: answer.length > 0 ? answer : NOT_STATED,
      stated: answer.length > 0,
    };
  });
  const { examples, matched } = selectExamples(
    input.lane,
    plate,
    input.answers,
    catalog.useCases,
  );
  const missing: string[] = [];
  if (!plateStated) missing.push("What they want off their plate: not stated in intake.");
  for (const a of answers) {
    if (!a.stated) missing.push(`Discovery answer not stated in intake: ${a.question}`);
  }
  if (!matched) {
    missing.push(
      "No example in the library matched the intake wording directly, so the sheet shows the lane's first examples as starting points for discovery — not as a claim about this client's needs.",
    );
  }
  const regulated =
    input.lane === "Solo entrepreneur" &&
    /facility|facilities|nursing|patient|care home/i.test(
      [plate, ...input.answers.map((a) => a.answer)].join(" "),
    );
  return {
    reference: input.reference,
    name: input.name,
    lane: input.lane,
    agentPreference: (input.agentPreference ?? "").trim() || "Help me choose in discovery",
    status: "draft",
    pricing: lanePricingRows(input.lane, catalog.pricing),
    pricingNote:
      "Discovery is credited toward the program total if you proceed within 30 days. Additional projects or workflows are scoped separately. The intake itself charges nothing.",
    plate: plateStated ? plate : NOT_STATED,
    plateStated,
    answers,
    examples,
    examplesNote: EXAMPLES_NOTICE,
    missing,
    trustNote:
      TRUST_NOTE +
      (regulated
        ? " Operational messages only: this setup covers staffing, vendors, and follow-ups. It does not handle patient health information."
        : ""),
    nextSteps: [
      "Boone reviews this draft sheet before it goes anywhere.",
      "The client explicitly agrees to the sheet (recorded with intake reference, name, and lane).",
      "The discovery fee is then secured, credited toward the program total.",
      "The discovery conversation is booked (paid and confirmed).",
    ],
    published: false,
    sent: false,
  };
}
