/**
 * Micro Titan own CRM/ERM — data model, first slice.
 *
 * This module is pure: no I/O, no secrets, no database connection.
 * It is the single definition of entities, statuses, pricing, queue
 * position, and audit entries, so the database store, the intake
 * route, and the tests all agree on the same shapes.
 *
 * Rules carried from the adopted operating model:
 * - Client + Boone only. A step that touches anyone else is a flaw.
 * - Every client step leaves a checkable audit record (who, what,
 *   when, reference, payment, approval). Audit rows are insert-only
 *   by design: this code never builds an UPDATE or DELETE for them.
 * - Tenant separation per client from day one: every record carries
 *   a client_id, and no query in the store may return rows for more
 *   than one client without an explicit client_id filter, except the
 *   owner summary, which returns counts and money totals only.
 * - No client passwords are stored, ever. No PHI is promised or
 *   stored. Agents are the four approved major-vendor, client-owned
 *   agents only (Muse, Grok Bot, Claude, Gemini).
 * - Jobs are the bookable unit. A client is the foundation (intake,
 *   pitch, agreement, discovery, setup); jobs are repeatable work
 *   on top. "3 workflows" was never a bundle size: a job count is
 *   any number, and job shape is either a-la-carte (ongoing help,
 *   e.g. scheduling) or fully scoped end-to-end specialty work.
 */

export type Lane = "Family" | "Solo entrepreneur" | "Business";

export type JobShape = "a_la_carte" | "scoped";

export type IntakeStatus =
  | "received"
  | "completeness_check"
  | "pitch_sent"
  | "agreed"
  | "discovery_paid"
  | "discovery_booked"
  | "setup"
  | "integration"
  | "switchover"
  | "first_project"
  | "proof_and_handoff"
  | "operate"
  | "closed";

export type JobStatus =
  | "queued"
  | "in_progress"
  | "delivered"
  | "proof"
  | "closed";

export type PaymentKind = "discovery" | "balance" | "monthly";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type BookingStatus = "requested" | "confirmed" | "cancelled";
export type PitchStatus = "draft" | "sent" | "agreed";
export type AgreementMethod = "email" | "site";
export type DeadlineStatus = "open" | "done" | "overdue";

/** Agent-led discovery (design: micro-titan-agent-led-discovery-design-2026-11-05.md). */
export type DiscoveryChannel = "text" | "voice" | "in_app_voice";
export type DiscoveryStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "no_answer"
  | "awaiting_client"
  | "escalated"
  | "cancelled";
export type DiscoveryRecommendation =
  | "approve"
  | "join_to_close"
  | "decline"
  | "needs_human";
/** One turn of a discovery transcript, in order. The transcript is the record — a summary is never a substitute. */
export interface DiscoveryTranscriptTurn {
  speaker: "agent" | "client";
  text: string;
  at: string;
}

/** Presentation (design §8): generated from intake + discovery, draft-only, owner-reviewed. */
export type PresentationStatus = "draft" | "reviewed" | "shown" | "declined";

/** Follow-up audit trail (Gap 6): logging only, no auto-sends. */
export type FollowUpStep = "day1" | "day3" | "day7" | "day14";
export type FollowUpChannel = "email" | "text" | "call" | "manual_note";

/** Change + access log (Gap 10): logging only, no auto-sends. */
export type ChangeLogKind = "change" | "access";
export type ChangeLogAction =
  | "config_changed"
  | "integration_added"
  | "integration_removed"
  | "integration_rewired"
  | "price_changed"
  | "route_added"
  | "route_changed"
  | "env_updated"
  | "migration_applied"
  | "deployment_made"
  | "other_change"
  | "access_granted"
  | "access_revoked"
  | "access_reviewed"
  | "access_changed";

/** Monthly billing tracking (Gap 9): the optional operate plan. */
export type MonthlySubscriptionStatus = "active" | "cancelled";

/**
 * Proof packet (internal ERM record). One packet per intake.
 * Sign-off is the owner role only. Nothing here is a public receipt.
 */
export type ProofPacketStatus = "draft" | "signed";
export type ProofCheckResult = "PASS" | "FAIL" | "NOT_RUN";
export type ApprovedAgent = "Muse" | "Grok Bot" | "Claude" | "Gemini";

export interface ProofPacketHeader {
  clientDisplayName: string;
  lane: Lane;
  agent: ApprovedAgent;
  /** Must name the client as the account owner. */
  agentAccountOwner: string;
  preparedBy: string;
  version: string;
}

export interface ProofAuthorshipClaim {
  item: string;
  writtenBy: string;
  mergedBy: string;
  verifiedBy: string;
  evidence: string;
}

export interface ProofTimelineClaim {
  stage: string;
  when: string;
  actor: string;
  evidence: string;
}

export interface ProofMoneyClaim {
  line: string;
  amount: string;
  /** Agreement line status (for example "not charged (test)"), not the packet status. */
  status: string;
  evidence: string;
}

export interface ProofDiscoveryClaim {
  field: string;
  value: string;
  evidence: string;
}

export interface ProofSetupClaim {
  change: string;
  kind: string;
  actor: string;
  fromTo: string;
  evidence: string;
}

export interface ProofAccessClaim {
  system: string;
  grantedTo: string;
  grantedOrRevoked: string;
  evidence: string;
}

export interface ProofFollowUpClaim {
  step: "day1" | "day3" | "day7" | "day14";
  channel: "email" | "text" | "call" | "manual_note";
  actor: string;
  when: string;
  evidence: string;
}

export interface ProofWordingClaim {
  text: string;
  source: string;
  evidence: string;
}

export interface ProofCheck {
  check: string;
  method: string;
  result: ProofCheckResult;
  evidence: string;
  notRunReason?: string;
  runByDate?: string;
}

/** Stored document inside proof_packets.sections. */
export interface ProofPacketSections {
  header: ProofPacketHeader;
  authorship: ProofAuthorshipClaim[];
  timeline: ProofTimelineClaim[];
  money: ProofMoneyClaim[];
  discovery: ProofDiscoveryClaim[];
  setup: ProofSetupClaim[];
  access: ProofAccessClaim[];
  checks: ProofCheck[];
  "follow-ups": ProofFollowUpClaim[];
  wording: ProofWordingClaim[];
  "not-proven": string[];
}

/** Allowed intake transitions. Anything else is rejected, not stored. */
export const INTAKE_TRANSITIONS: Record<IntakeStatus, IntakeStatus[]> = {
  received: ["completeness_check", "closed"],
  completeness_check: ["pitch_sent", "closed"],
  pitch_sent: ["agreed", "closed"],
  agreed: ["discovery_paid", "closed"],
  discovery_paid: ["discovery_booked", "closed"],
  discovery_booked: ["setup", "closed"],
  setup: ["integration", "closed"],
  integration: ["switchover", "closed"],
  switchover: ["first_project", "closed"],
  first_project: ["proof_and_handoff", "closed"],
  proof_and_handoff: ["operate", "closed"],
  operate: ["closed"],
  closed: [],
};

export function canTransitionIntake(
  from: IntakeStatus,
  to: IntakeStatus,
): boolean {
  return INTAKE_TRANSITIONS[from].includes(to);
}

/** Allowed job transitions. */
export const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  queued: ["in_progress", "closed"],
  in_progress: ["delivered", "closed"],
  delivered: ["proof", "closed"],
  proof: ["closed"],
  closed: [],
};

export function canTransitionJob(from: JobStatus, to: JobStatus): boolean {
  return JOB_TRANSITIONS[from].includes(to);
};

export interface LanePricing {
  discoveryCents: number;
  setupCents: number;
  firstCents: number;
  totalCents: number;
  afterCreditCents: number;
  monthlyCents: number;
}

export const LANE_PRICING: Record<Lane, LanePricing> = {
  Family: {
    discoveryCents: 15000,
    setupCents: 75000,
    firstCents: 75000,
    totalCents: 165000,
    afterCreditCents: 150000,
    monthlyCents: 9500,
  },
  "Solo entrepreneur": {
    discoveryCents: 50000,
    setupCents: 150000,
    firstCents: 350000,
    totalCents: 550000,
    afterCreditCents: 500000,
    monthlyCents: 35000,
  },
  Business: {
    discoveryCents: 100000,
    setupCents: 250000,
    firstCents: 650000,
    totalCents: 1000000,
    afterCreditCents: 900000,
    monthlyCents: 95000,
  },
};

/** Additional-job price ranges per lane (cents), from approved ranges. */
export const ADDITIONAL_JOB_RANGE_CENTS: Record<Lane, [number, number]> = {
  Family: [35000, 75000],
  "Solo entrepreneur": [150000, 350000],
  Business: [350000, 650000],
};

export interface ClientRow {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  lane: Lane;
  agentPreference: string;
  createdAt: string;
}

export interface IntakeRow {
  id: string;
  clientId: string;
  reference: string;
  lane: Lane;
  plate: string;
  answers: { question: string; answer: string }[];
  status: IntakeStatus;
  nextAction: string;
  source: string;
  createdAt: string;
}

export interface AuditEntry {
  entityType: string;
  entityId: string;
  clientId: string;
  actor: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  reference: string;
}

/** Next queue position for a newly booked job, given existing positions. */
export function nextQueuePosition(existingPositions: number[]): number {
  if (existingPositions.length === 0) return 1;
  return Math.max(...existingPositions) + 1;
}

/**
 * Capacity guard, stated plainly: intake capacity is not delivery
 * capacity. A queue position above CAPACITY_PER_WEEK means the job
 * is queued for a later week, not promised for this week. The
 * number is a planning constant, not a promise to any client.
 */
export const CAPACITY_JOBS_PER_WEEK = 10;

export function queueWeekForPosition(position: number): number {
  return Math.ceil(position / CAPACITY_JOBS_PER_WEEK);
}
