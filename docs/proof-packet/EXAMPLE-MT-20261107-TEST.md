# Proof of work: MT-20261107-TEST. This record shows what we set up, what we checked, and the evidence for each. Anything without evidence isn't claimed here, and anything we couldn't check yet is listed as not run.

> ⚠️ **Fully fictional TEST job.** No ERM rows exist for this reference, and no DB writes were made. IDs below are placeholders shaped like real evidence pointers (`…-TEST`) to show the format. This is not a prospect and not proof of client work. Do not treat the dollar figures as charges or as earnings.

## 0. Packet header
| Field | Value |
|---|---|
| Reference | MT-20261107-TEST |
| Client | TEST Solo Example Co |
| Contact | test-client@example.invalid |
| Lane | Solo entrepreneur |
| Agent | Grok Bot |
| Agent account owner | Client (TEST Solo Example Co) |
| Test job? | **yes** |
| Packet version / date | v0 draft · Nov 7, 2026 |

## 1. Authorship
| Item | Written by | Merged/applied by | Verified by | Evidence |
|---|---|---|---|---|
| Intake reminder routine config | Grok Bot (client's agent) | Owner (Bubba) | Grok Bot (Micro Titan ops), live check | COMMIT:0000test · LOG:routine-run@2026-11-07 10:02 CT |
| This packet | Grok Bot (Micro Titan ops) | — | Owner review pending | this file |

## 2. Timeline
| Stage | When (CT) | Actor | Evidence |
|---|---|---|---|
| received | Nov 7, 9:00 AM | site intake form | ERM:intakes.TEST-0001 |
| completeness_check | Nov 7, 9:20 AM | owner | ERM:audit_log.TEST-0002 |
| pitch_sent | Nov 7, 9:40 AM | owner | ERM:pitch_sheets.TEST-0003 (sent_at) |
| agreed | Nov 7, 10:05 AM | client, method=site | ERM:agreements.TEST-0004 |
| discovery_paid | — | — | ERM:agreements.TEST-0004 (test job; discovery fee not charged) |
| discovery_booked | Nov 7, 10:30 AM | owner | ERM:discovery_calls.TEST-0005 |
| setup → switchover | Nov 7, 1:00–3:00 PM | Grok Bot / owner | ERM:change_log.TEST-0006..0008 |
| first_project | Nov 7, 3:15 PM | Grok Bot | ERM:jobs.TEST-0009 |
| proof_and_handoff | Nov 7, 4:00 PM | this packet | this packet |

## 3. Money (from the agreement row; the Solo lane matches the live /pricing page)
| Line | Amount | Status | Evidence |
|---|---|---|---|
| Discovery fee (credited) | $500 | not charged (test) | ERM:agreements.TEST-0004.discovery_cents |
| Program total | $5,500 | — | ERM:agreements.TEST-0004.total_cents |
| Balance after credit | $5,000 | not charged (test) | ERM:agreements.TEST-0004.after_credit_cents |
| Monthly operate plan (optional) | $350/month | not started | ERM:agreements.TEST-0004.monthly_cents |

## 4. Discovery
| Field | Value | Evidence |
|---|---|---|
| Channel / format | voice / call | ERM:discovery_calls.TEST-0005 |
| Consent | given, Nov 7, 10:31 AM | ERM:discovery_calls.TEST-0005.consent_at |
| Duration | 14 min | ERM:discovery_calls.TEST-0005.duration_seconds |
| Recommendation | approve: "single repeatable intake-reminder task" | ERM:discovery_calls.TEST-0005.recommendation_reason |
| Presentation | reviewed → shown | ERM:presentations.TEST-0010 |

## 5. What was set up
| Change | Kind | Actor | From → To | Evidence |
|---|---|---|---|---|
| Weekday 10 AM reminder routine | config_changed | owner | none → enabled | ERM:change_log.TEST-0006 |
| Calendar read connected | integration_added | owner | — → read-only | ERM:change_log.TEST-0007 |

## 6. Access
| System | Granted to | Granted/revoked | Evidence |
|---|---|---|---|
| Client calendar (read-only) | client's Grok Bot | granted Nov 7, 1:10 PM | ERM:change_log.TEST-0008 (kind=access) |
| Micro Titan setup access | Micro Titan ops | **revoked** at handoff, 4:05 PM | ERM:change_log.TEST-0011 |

## 7. Acceptance checks
| # | Check | Method | Result | Evidence | Reason (NOT RUN only) | Target date (NOT RUN only) |
|---|---|---|---|---|---|---|
| 1 | "Remind me each weekday at 10 of tomorrow's appointments" | Watched 1 live run | PASS | LOG:routine-run@2026-11-07 10:02 CT · SHOT:test-run.png | | |
| 2 | "Nothing goes out to my customers without my OK" | Reviewed the routine config | PASS | SHOT:test-config.png | | |
| 3 | Runs 5 days in a row | Needs 5 days | NOT RUN | LOG:routine-schedule@2026-11-07 16:00 CT | Needs 5 weekday runs; this test job has one watched run. | 2026-11-12 |

## 8. Follow-ups
| Step | Channel | Actor | When | Evidence |
|---|---|---|---|---|
| day1 | manual_note | owner | Nov 7 | ERM:followups.TEST-0012 |

## 9. Client-facing wording used (verbatim)
| Text | Source |
|---|---|
| "We don't sell you an agent, and we don't just build you software. We wire the agent into your real work, prove each job with a record, and keep operating it — so the work stops depending on you being available." | app/components/AgentSetup.tsx TYING_LINE |
| "The discovery fee is credited toward the program total. There is no time limit on that credit." | app/components/AgentSetup.tsx ~L98 |
| "A passing software check alone is not proof of a business outcome." | app/studio/page.tsx FAQ |

## 10. Open items and what's NOT proven
- The discovery payment and balance were not charged (test). Payment rows are absent by design.
- Check 3 (5-day run) is not yet proven.
- This packet says nothing about business results for the client.

## 11. Sign-off
| Role | Name | Date | Evidence |
|---|---|---|---|
| Prepared by | Grok Bot (Micro Titan ops) | Nov 6, 2026 | this file |
| Approved by owner | — pending — | | |
| Shared with client | **no** | | Release requires both a client request and owner approval. This fictional packet was not released. |
