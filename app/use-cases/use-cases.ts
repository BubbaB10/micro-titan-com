// Use-case library content for micro-titan.com/use-cases.
//
// HOW TO ADD A FUTURE USE CASE (no new component, no new page):
//   1. Add one entry to USE_CASES below, with a lane of "Family",
//      "Solo" or "Business".
//   2. The route app/use-cases/page.tsx picks it up automatically
//      via the filter — no new page file needed.
//
// RULES FOR EVERY USE CASE (do not relax these for a new entry):
//   - Use cases are EXAMPLES / POSSIBILITIES for discovery to confirm,
//     never promised integrations, outcomes, or tools. Discovery still
//     confirms the real workflow for each client.
//   - No testimonials, prices, phone numbers, or addresses.
//   - No owner last name.
//   - No town / local service-area framing. Delivery is remote,
//     anywhere — a use case never says where Micro Titan is based.
//   - For regulated operators, keep wording to operational messages
//     only — never promise handling of patient health information.
//   - No billing, filing, or advice use cases from regulated professions.
//   - Every card links to the live intake page only. The intake form
//     does not accept a lane query parameter, so never invent one.

export type Lane = "Family" | "Solo" | "Business";

export type UseCase = {
  slug: string;
  lane: Lane;
  title: string;
  pain: string;
  steps: string[];
  gets: string;
  doesNot?: string;
};

export const USE_CASES: UseCase[] = [
  // ---- Family ----
  {
    slug: "morning-brief",
    lane: "Family",
    title: "The morning brief",
    pain: "“Every morning starts with ten loose ends — schedules, messages, and things I forgot to check.”",
    steps: [
      "Pull the day's schedules, messages, and reminders into one short brief",
      "Flag conflicts and overlaps before the day starts pulling at you",
      "Surface only the decisions that actually need you, first",
    ],
    gets: "One short brief each morning you can look at and act on — a checkable record of what was due, what clashed, and what still needs a decision.",
    doesNot: "It does not make decisions for you, and it does not send anything without your OK where it matters.",
  },
  {
    slug: "kids-schedule-hub",
    lane: "Family",
    title: "A kids' schedule hub",
    pain: "“School, practices, games, and pickups live in five different places, and I find out about a clash too late.”",
    steps: [
      "Bring school days, practices, games, and pickups into one view",
      "Flag when two things clash, in time to fix it",
      "Keep the week's plan visible to the whole household",
    ],
    gets: "One schedule hub the household can check, with conflicts flagged early — a record you can look at instead of rebuilding the week from messages.",
  },
  {
    slug: "inbox-triage",
    lane: "Family",
    title: "Inbox triage",
    pain: "“My inbox keeps growing, and the important messages get buried under everything else.”",
    steps: [
      "Sort incoming messages into what needs you, what can wait, and what is routine",
      "Draft replies for the messages that need an answer, for your OK",
      "Keep a short list of what is still waiting, so nothing silently slips",
    ],
    gets: "A short triage list and drafts waiting for your approval — nothing is sent without your OK.",
  },
  {
    slug: "meeting-prep-follow-up",
    lane: "Family",
    title: "Meeting prep and follow-up",
    pain: "“I walk into meetings unprepared, and the follow-ups I meant to send never get sent.”",
    steps: [
      "Pull together what you need before a meeting: who, what was last agreed, what is open",
      "Draft the follow-up after the meeting, for your OK",
      "Track what was promised, so it does not depend on memory",
    ],
    gets: "A prep note before the meeting and a follow-up draft after it, with a checkable list of what was agreed and what is still open.",
  },
  {
    slug: "game-day-event-day",
    lane: "Family",
    title: "Game day / event day setup",
    pain: "“On game day or event day, the plan lives in my head — times, places, who is bringing what — and everyone asks me.”",
    steps: [
      "Pull the event details — time, place, and who is involved — into one plan",
      "Flag what is still unconfirmed before the day",
      "Keep the plan in one place the household can check",
    ],
    gets: "One event plan to check on the day, with unconfirmed items flagged ahead of time — not a plan that only exists in one person's head.",
  },

  // ---- Solo ----
  {
    slug: "morning-triage-brief",
    lane: "Solo",
    title: "The morning triage brief",
    pain: "“I start every day buried in emails, texts, and calls, and I don't know where to start.”",
    steps: [
      "Pull overnight emails, texts, and calls into one morning brief",
      "Sort them into what needs you today, what can wait, and what is routine",
      "Surface the urgent items first, with the context to act on them",
    ],
    gets: "One morning brief with the day's priorities in order — a record of what came in, what was urgent, and what still needs you.",
    doesNot: "It does not handle patient health information, and it does not send anything without your OK where it matters.",
  },
  {
    slug: "staffing-call-out-chase",
    lane: "Solo",
    title: "Staffing and call-out chase",
    pain: "“When someone calls out, I spend the morning chasing cover instead of running the business.”",
    steps: [
      "Flag a call-out as soon as it is reported",
      "Work through the cover list in order, with a draft message for your OK",
      "Track who has been asked and who has confirmed, so the chase is visible",
    ],
    gets: "A visible chase list: who was asked, who confirmed, and what is still uncovered — an operational record, not a guess.",
    doesNot: "It covers operational staffing messages only. It does not handle patient health information.",
  },
  {
    slug: "follow-through-tracking",
    lane: "Solo",
    title: "Follow-through tracking",
    pain: "“Things get agreed and then forgotten — by me, by vendors, by everyone.”",
    steps: [
      "Keep a list of what was promised, by whom, and by when",
      "Flag what is overdue or still waiting, before it becomes urgent",
      "Draft the chase message, for your OK",
    ],
    gets: "A follow-through list you can check: what was promised, what is done, and what is still waiting — with nothing depending on memory.",
  },
  {
    slug: "invoicing-estimating-follow-up",
    lane: "Solo",
    title: "Invoicing and estimating follow-up",
    pain: "“Estimates go out, invoices go out, and then I am the one chasing both.”",
    steps: [
      "Track estimates and invoices that are still waiting on a reply or a payment",
      "Flag the ones that have gone quiet, in order of age",
      "Draft the follow-up message, for your OK",
    ],
    gets: "A waiting list for estimates and invoices, with quiet ones flagged — a record of what is owed and what is still open.",
    doesNot: "It does not file taxes or give tax advice, and it does not send a chase without your OK.",
  },
  {
    slug: "multi-location-roll-up",
    lane: "Solo",
    title: "A multi-location roll-up",
    pain: "“I run more than one location, and I only see each one separately — never the whole picture.”",
    steps: [
      "Pull the day's operational updates from each location into one roll-up",
      "Flag what needs you across locations, in one place",
      "Keep the roll-up as a daily record you can look back on",
    ],
    gets: "One daily roll-up across locations, with what needs you flagged — a checkable record, not five separate inboxes.",
    doesNot: "It covers operational messages only. It does not handle patient health information.",
  },

  // ---- Business ----
  {
    slug: "job-intake-without-retyping",
    lane: "Business",
    title: "Job intake without retyping",
    pain: "“Every job comes in by phone or email, and then someone retypes it into another system — and things get lost in between.”",
    steps: [
      "Take a job request once, in the customer's own words",
      "Turn it into a single job record with the details the floor needs",
      "Keep the original request attached to the job, so nothing is retyped away",
    ],
    gets: "One job record per job, with the original request attached — a checkable record from intake to delivery, with no retyping step to lose things in.",
  },
  {
    slug: "proofs-approvals",
    lane: "Business",
    title: "Proofs out, approvals back",
    pain: "“Proofs go out by email, approvals come back by phone, and nobody can say what was actually approved.”",
    steps: [
      "Send the proof with a clear approval step attached",
      "Track whether it is waiting, approved, or needs a change",
      "Keep the approval itself on the job record, with a date",
    ],
    gets: "A job record that shows the proof, the approval, and the date — a record you can point to, instead of a phone call you have to remember.",
  },
  {
    slug: "floor-in-step",
    lane: "Business",
    title: "The floor, in step",
    pain: "“Two kinds of machines, one floor, and no one can see at a glance what is where.”",
    steps: [
      "Show each job's stage on one floor view, across both machine types",
      "Flag jobs that are waiting, stuck, or ready for the next step",
      "Keep the stage history on the job record",
    ],
    gets: "One floor view with every job's stage visible, and a stage history on each job record — a picture of the floor you can check, not ask around for.",
  },
  {
    slug: "delivery-confirmed",
    lane: "Business",
    title: "Delivery confirmed, out the door",
    pain: "“A job leaves the building and then the questions start: did it go, when, and to whom?”",
    steps: [
      "Mark a job ready, then confirm it out the door with a date",
      "Attach the delivery confirmation to the job record",
      "Close the job only when the confirmation is on the record",
    ],
    gets: "A closed job record with the delivery confirmation attached — proof the job went out, not a memory that it did.",
  },
];

export const LANES: ("All" | Lane)[] = ["All", "Family", "Solo", "Business"];

export const EXAMPLES_NOTICE =
  "These are examples of what an agent setup could do — possibilities to react to in discovery, not promised integrations, outcomes, or tools. Discovery confirms the real workflow for each client. Delivery is remote, anywhere.";
