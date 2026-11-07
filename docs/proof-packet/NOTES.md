# Proof packet — source notes and open questions

## Where each part came from
- Start/Set up/Prove/Operate framing and the tying line: app/components/AgentSetup.tsx (live /pricing agent-setup section, PR #46 wording).
- Lane prices ($150/$500/$1,000 discovery credit; $1,650/$5,500/$10,000 totals; $95/$350/$950 monthly): AgentSetup.tsx tiers.
- "A passing software check alone is not proof of a business outcome" and acceptance checks agreed with the client: app/studio/page.tsx FAQ.
- Approved agents and client-owned accounts: /pricing FAQ ("Muse, Grok Bot, Claude, or Gemini… You own your agent account").
- Timeline stages: INTAKE_TRANSITIONS in app/lib/erm/types.ts (ends in proof_and_handoff → operate).
- Evidence pointers: tables in app/lib/erm/schema.sql: intakes, audit_log, pitch_sheets, agreements, payments, bookings, discovery_calls, presentations, jobs (status includes 'proof'), change_log (change/access), followups (manual log, no auto-sends), monthly_subscriptions.
- Honest framing (report FAIL/NOT RUN, nothing hidden): /receipts "Gate Ledger" page copy (app/receipts/page.tsx) and the GATE_CHECKS rule in app/proof/page.tsx ("every entry must name a check that exists").

## Gaps in this draft
- I couldn't read the rundown transcripts: SearchTranscripts returned "no record" in this subagent. The attachments folder path doesn't exist on the box, so I couldn't read the Muse and Claude PDFs. Check the template against the rundowns' "proof packet" section before treating it as final.
- I read /receipts, /pricing and /studio from the master source in /workspace/mt, not by fetching the live pages.

## Open questions for Bubba
1. Is a proof packet client-facing (sent at handoff), internal only, or both? This decides how much ERM ID detail stays visible.
2. Should packets feed the public /receipts ledger? Today that ledger only covers gate completions across the portfolio.
3. Who signs off: just you, or does the client counter-sign acceptance checks?
4. Where does a packet live: a Cockpit page, a PDF, or an ERM row (jobs.status='proof')?
5. Should a packet ever issue with a NOT RUN check, or wait until every agreed check has run?
6. Is there approved verbatim wording for the packet's own intro/heading that I should use?
