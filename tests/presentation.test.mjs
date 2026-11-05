// node --test tests/presentation.test.mjs — presentation generator slice.
// Pure-logic tests only: no database, no network, no credentials, no
// prospect data. Sample intakes and transcripts are invented test
// fixtures, not clients. The gated store returns "not_configured"
// when ERM_DATABASE_URL is absent — that is tested, not worked around.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  APPROVED_APPROVAL_GATE,
  APPROVED_DISCLOSURE,
  generatePresentation,
} from "../app/lib/erm/presentation.ts";
import {
  NOT_STATED,
  TRUST_NOTE,
  lanePricingRows,
  selectExamples,
} from "../app/lib/erm/pitch.ts";
import { recordPresentation } from "../app/lib/erm/presentation-store.ts";
import { USE_CASES } from "../app/use-cases/use-cases.ts";
import { LANE_PRICING } from "../app/lib/erm/types.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const presentationSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "presentation.ts"),
  "utf8",
);
const storeSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "presentation-store.ts"),
  "utf8",
);
const schemaSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "schema.sql"),
  "utf8",
);
const migrationSource = fs.readFileSync(
  path.join(root, "app", "lib", "erm", "migrations", "004-presentations.sql"),
  "utf8",
);

const CATALOG = { pricing: LANE_PRICING, useCases: USE_CASES };
const librarySlugs = new Set(USE_CASES.map((c) => c.slug));

const familyIntake = {
  reference: "MT-20261105-TEST",
  name: "Sample Family",
  lane: "Family",
  agentPreference: "Muse by Meta",
  plate:
    "Schedule conflicts. Organizing daily tasks, staying motivated to work out, keeping up with daily steps and calories.",
  answers: [
    {
      question: "What household jobs eat up your evenings or weekends right now?",
      answer: "Cleaning, laundry, cooking",
    },
    {
      question: "How do you handle bills, appointments, and school or family dates today?",
      answer: "I pay them when they are due. We use TimeTree or I just try and remember.",
    },
    {
      question: "What calendar, inbox, or apps do you already use?",
      answer: "TimeTree and Apple Calendar",
    },
    {
      question: "Is there a trip, move, or property task coming up we should know about?",
      answer: "Moving houses in next couple months",
    },
    {
      question: "What should an agent never do without your approval first?",
      answer: "Spend my money, send texts, or make calls",
    },
    { question: "Anything else we should know before discovery?", answer: "No" },
  ],
};

const discovery = {
  channel: "text",
  formatChoice: "text",
  transcript: [
    {
      speaker: "agent",
      text: "Before we start: I'm Micro Titan's agent, not a person.",
      at: "2026-11-05T10:00:00Z",
    },
    {
      speaker: "client",
      text: "Evenings are the problem — by 7pm I have no hours left and the house is still chaos.",
      at: "2026-11-05T10:01:00Z",
    },
    {
      speaker: "client",
      text: "Done would look like the week sorted before it starts, and nobody asking me what the plan is.",
      at: "2026-11-05T10:02:00Z",
    },
    {
      speaker: "agent",
      text: "Got it — and is there anything an agent should never do without your approval?",
      at: "2026-11-05T10:03:00Z",
    },
    {
      speaker: "client",
      text: "Never spend my money without asking first.",
      at: "2026-11-05T10:04:00Z",
    },
  ],
  recommendation: "approve",
  recommendationReason: "Clear plate, clear hard nos, first job is a schedule hub.",
};

const HELPERS = {
  notStated: NOT_STATED,
  trustNote: TRUST_NOTE,
  lanePricingRows,
  selectExamples,
};
const generate = (input = { intake: familyIntake, discovery }) =>
  generatePresentation(input, CATALOG, HELPERS);

test("presentation is always a draft, never published or sent", () => {
  const p = generate();
  assert.equal(p.status, "draft");
  assert.equal(p.published, false);
  assert.equal(p.sent, false);
});

test("plate and intake answers are quoted verbatim, traced to intake", () => {
  const p = generate();
  assert.equal(p.whatYouToldUs.plate.text, familyIntake.plate);
  assert.equal(p.whatYouToldUs.plate.source, "intake");
  for (const [i, a] of p.whatYouToldUs.answers.entries()) {
    assert.equal(a.question, familyIntake.answers[i].question);
    assert.equal(a.text, familyIntake.answers[i].answer);
    assert.equal(a.source, "intake");
    assert.equal(a.stated, true);
  }
});

test("only client transcript turns are quoted; agent turns never appear as client words", () => {
  const p = generate();
  const json = JSON.stringify(p);
  const clientTurns = discovery.transcript.filter((t) => t.speaker === "client");
  assert.equal(p.whatYouToldUs.discoverySaid.length, clientTurns.length);
  for (const t of clientTurns) {
    assert.ok(
      p.whatYouToldUs.discoverySaid.some((q) => q.text === t.text && q.source === "discovery"),
      `client turn missing: ${t.text}`,
    );
  }
  // The agent's question is not quoted anywhere as a client statement.
  assert.ok(
    !p.whatYouToldUs.discoverySaid.some((q) =>
      q.text.includes("is there anything an agent should never do"),
    ),
  );
  // The agent disclosure line appears only as the approved disclosure quote.
  assert.equal(p.disclosure, "I'm Micro Titan's agent, not a person.");
  assert.ok(!json.includes("Bubba"));
});

test("what it costs you today uses only the client's own words", () => {
  const p = generate();
  assert.equal(p.whatItCostsYou.stated, true);
  assert.ok(p.whatItCostsYou.items.length > 0);
  for (const item of p.whatItCostsYou.items) {
    const lower = item.text.toLowerCase();
    assert.ok(
      lower.includes("hours") || lower.includes("evenings") || lower.includes("money"),
      `cost item not from a cost statement: ${item.text}`,
    );
    assert.ok(["intake", "discovery"].includes(item.source));
  }
  // "Done would look like the week sorted" is a done-looks-like quote, not a cost claim.
  assert.ok(
    !p.whatItCostsYou.items.some((i) => i.text.includes("Done would look like")),
  );
});

test("first job is a library example only, labelled a possibility, never a promise", () => {
  const p = generate();
  assert.ok(p.firstJob.possibility !== null);
  assert.ok(librarySlugs.has(p.firstJob.possibility.slug));
  assert.ok(p.firstJob.label.includes("possibility"));
  assert.ok(p.firstJob.label.includes("not a promised"));
  assert.equal(p.firstJob.doneStated, true);
  assert.ok(
    p.firstJob.doneLooksLike.some((q) => q.text.includes("Done would look like")),
  );
  const json = JSON.stringify(p);
  for (const banned of [
    "guaranteed",
    "we promise",
    "testimonial",
    "will integrate",
    "within 30 days",
    "definitely",
  ]) {
    assert.ok(!json.toLowerCase().includes(banned), `banned phrase present: ${banned}`);
  }
});

test("pricing is approved lane pricing only", () => {
  const p = generate();
  const rows = Object.fromEntries(p.pricing.map((r) => [r.label, r.value]));
  assert.equal(rows["Discovery"], "$150 (credited)");
  assert.equal(rows["Setup"], "$750");
  assert.equal(rows["Program total"], "$1,650");
  assert.equal(rows["Total after credit"], "$1,500");
  assert.equal(rows["Monthly tune-up (optional)"], "$95/mo");
  assert.equal(p.pricingNote.includes("credited"), true);
});

test("next steps use the approved verbatim wording, exactly", () => {
  const p = generate();
  assert.equal(
    p.whatHappensNext.approvalGate,
    "Nothing moves to setup until you've seen your presentation and said go.",
  );
  assert.equal(APPROVED_APPROVAL_GATE, p.whatHappensNext.approvalGate);
  assert.equal(APPROVED_DISCLOSURE, "I'm Micro Titan's agent, not a person.");
  // Approved wording appears verbatim in the source, not paraphrased.
  assert.ok(presentationSource.includes(APPROVED_APPROVAL_GATE));
  assert.ok(presentationSource.includes(APPROVED_DISCLOSURE));
  // The presentation speaks as Micro Titan only; the only contact is the business address.
  assert.equal(p.contact, "hello@micro-titan.com");
  assert.ok(p.whatHappensNext.steps.some((s) => s.includes("Cockpit")));
});

test("every claim traces to intake, discovery, or approved lane pricing", () => {
  const p = generate();
  assert.ok(p.claims.length > 0);
  for (const claim of p.claims) {
    assert.ok(
      ["intake", "discovery", "approved lane pricing"].includes(claim.source),
      `untraced claim: ${claim.text}`,
    );
  }
});

test("generation is deterministic", () => {
  assert.deepEqual(generate(), generate());
});

test("thin intake + empty transcript is reported as not stated, never invented", () => {
  const p = generate({
    intake: { ...familyIntake, plate: "   ", answers: [] },
    discovery: { ...discovery, transcript: [] },
  });
  assert.equal(p.whatYouToldUs.plate.text, "not stated in intake");
  assert.equal(p.whatItCostsYou.stated, false);
  assert.equal(p.firstJob.doneStated, false);
  assert.ok(p.missing.length >= 3);
  assert.ok(p.missing.some((m) => m.includes("not stated")));
});

test("store is gated: no database URL means not_configured, never a throw", async () => {
  delete process.env.ERM_DATABASE_URL;
  delete process.env.ERM_DATABASE_DATABASE_URL;
  const result = await recordPresentation("MT-20261105-TEST", "sess-1", generate());
  assert.equal(result.status, "not_configured");
});

test("store never publishes, never sends, never advances an intake", () => {
  assert.ok(storeSource.includes('status: "draft"'));
  assert.ok(storeSource.includes("published: false"));
  assert.ok(storeSource.includes("sent: false"));
  assert.ok(!storeSource.includes("UPDATE intakes"));
  assert.ok(!storeSource.includes("UPDATE discovery_calls"));
  assert.ok(storeSource.includes("intake_not_found"));
  assert.ok(storeSource.includes("already_exists"));
});

test("schema and migration carry the presentations table, draft-only", () => {
  assert.ok(schemaSource.includes("CREATE TABLE IF NOT EXISTS presentations"));
  assert.ok(schemaSource.includes("status IN ('draft', 'reviewed', 'shown', 'declined')"));
  assert.ok(migrationSource.includes("CREATE TABLE IF NOT EXISTS presentations"));
  assert.ok(migrationSource.includes("idx_presentations_intake"));
});
