# Proof packet — source notes and open questions

## Where each part came from
- Start/Set up/Prove/Operate framing and the tying line: app/components/AgentSetup.tsx (live /pricing agent-setup section, PR #46 wording).
- Lane prices ($150/$500/$1,000 discovery credit; $1,650/$5,500/$10,000 totals; $95/$350/$950 monthly): AgentSetup.tsx tiers.
- "A passing software check alone is not proof of a business outcome" and acceptance checks agreed with the client: app/studio/page.tsx FAQ.
- Approved agents and client-owned accounts: /pricing FAQ ("Muse, Grok Bot, Claude, or Gemini… You own your agent account").
- Timeline stages: INTAKE_TRANSITIONS in app/lib/erm/types.ts (ends in proof_and_handoff → operate).
- Evidence pointers: tables in app/lib/erm/schema.sql: intakes, audit_log, pitch_sheets, agreements, payments, bookings, discovery_calls, presentations, jobs (status includes 'proof'), change_log (change/access), followups (manual log, no auto-sends), monthly_subscriptions.
- Honest framing (report FAIL/NOT RUN, nothing hidden): /receipts "Gate Ledger" page copy (app/receipts/page.tsx) and the GATE_CHECKS rule in app/proof/page.tsx ("every entry must name a check that exists").

## Source limits
- The rundown transcripts were not available when these notes were first written. DECISIONS.md is the authority for the packet record.
- /receipts, /pricing, and /studio were read from the repo source, not by fetching the live pages.

## Settled decisions

The questions below were open while the template was drafted. They are settled in DECISIONS.md. They are not open questions.

1. Audience is internal. Release to a client requires both a client request and owner approval. This repo does not send or share a packet.
2. Packets do not feed the public /receipts page.
3. Sign-off is the owner alone. There is no client counter-signature. Signing uses `OWNER_SIGNING_TOKEN`, which is separate from the ops token.
4. A packet lives as an ERM record (`proof_packets`), not as a public page.
5. A NOT RUN check may be included. It must list the reason and a target date, and it still needs evidence.
6. Heading and intro, verbatim: "Proof of work: <REFERENCE>. This record shows what we set up, what we checked, and the evidence for each. Anything without evidence isn't claimed here, and anything we couldn't check yet is listed as not run."
