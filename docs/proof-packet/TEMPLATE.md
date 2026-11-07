# Proof of work: <REFERENCE>. This record shows what we set up, what we checked, and the evidence for each. Anything without evidence isn't claimed here, and anything we couldn't check yet is listed as not run.

> One packet per client job. It covers the **Prove** step of Start → Set up → Prove → Operate. The heading and intro above are the approved text. Fill `<REFERENCE>` with `intakes.reference` and do not paraphrase the rest.
> **Evidence rule:** every claim row has an `Evidence` cell. If the cell is empty, delete the claim. Evidence is one of:
> `ERM:<table>.<id>` (Neon shy-cake-63714658), `COMMIT:<sha>`, `PR:#<n>`, `LOG:<source>@<timestamp CT>`, `SHOT:<file>`, `STRIPE:<id>`, `TWILIO:<call/msg SID>`.
> No earnings claims. No owner last name or personal contacts. Client-facing wording is copied verbatim from the site (see §9); don't paraphrase it.
> Times are America/Chicago (CT).

## 0. Packet header
| Field | Value | Guidance |
|---|---|---|
| Reference | | `intakes.reference`, e.g. MT-YYYYMMDD-XXXX |
| Client (display name) | | `clients.name`. Test jobs start with `TEST`. |
| Lane | | `Family` / `Solo entrepreneur` / `Business` (`intakes.lane`) |
| Agent | | One of: Muse, Grok Bot, Claude, Gemini. Nothing else. |
| Agent account owner | | Must be the client (client-owned account). |
| Test job? | yes / no | Test packets never count as prospects or proof of client work. |
| Packet version / date | | |

## 1. Authorship (three separate facts per item)
| Item | Written by | Merged/applied by | Verified by | Evidence |
|---|---|---|---|---|
| | | | | |
> "Written" is the agent/person who wrote it, "Merged/applied" is who shipped it (usually the owner), and "Verified" is who checked it live and how. Never collapse them into one.

## 2. Timeline (ERM trail)
| Stage (`intakes.status`) | When (CT) | Actor | Evidence |
|---|---|---|---|
| received | | | ERM:intakes.<id> |
| completeness_check | | | ERM:audit_log.<id> |
| pitch_sent | | | ERM:pitch_sheets.<id> (sent_at) |
| agreed | | | ERM:agreements.<id> (method, accepted_at) |
| discovery_paid | | | ERM:payments.<id> kind=discovery + STRIPE: |
| discovery_booked | | | ERM:bookings.<id> / discovery_calls.<id> |
| setup → integration → switchover | | | ERM:audit_log / change_log |
| first_project | | | ERM:jobs.<id> |
| proof_and_handoff | | | this packet |
| operate (optional) | | | ERM:monthly_subscriptions.<id> |

## 3. Money (numbers only from ERM rows, never typed by hand)
| Line | Amount | Status | Evidence |
|---|---|---|---|
| Discovery fee (credited) | | | ERM:payments kind=discovery |
| Program total | | | ERM:agreements.total_cents |
| Balance after credit | | | ERM:agreements.after_credit_cents / payments kind=balance |
| Monthly (optional) | | | ERM:agreements.monthly_cents / monthly_subscriptions |

## 4. Discovery
| Field | Value | Evidence |
|---|---|---|
| Channel / format | | ERM:discovery_calls.channel, format_choice |
| Consent given (time) | | ERM:discovery_calls.consent_at |
| Duration | | ERM:discovery_calls.duration_seconds / TWILIO: |
| Recommendation + reason | | ERM:discovery_calls.recommendation(_reason) |
| Presentation | | ERM:presentations.<id> (status) |

## 5. What was set up (one row per change)
| Change | Kind (`change_log.action`) | Actor | From → To | Evidence |
|---|---|---|---|---|

## 6. Access (who can touch what)
| System | Granted to | Granted/revoked | Evidence (`change_log` kind=access) |
|---|---|---|---|

## 7. Acceptance checks (agreed with the client before the work)
| # | Check (client's words) | Method | Result PASS/FAIL/NOT RUN | Evidence | Reason (NOT RUN only) | Target date (NOT RUN only) |
|---|---|---|---|---|---|---|
> Report FAILs and NOT RUNs; don't hide them. A NOT RUN row still needs non-empty evidence, a reason, and a target date. A passing software check alone is not proof of a business outcome.

## 8. Follow-ups (logged by hand, nothing auto-sent)
| Step | Channel | Actor | When | Evidence |
|---|---|---|---|---|
| day1 / day3 / day7 / day14 | | | | ERM:followups.<id> |

## 9. Client-facing wording used (verbatim, with source)
| Text | Source file/line |
|---|---|

## 10. Open items and what's NOT proven
- 

## 11. Sign-off
| Role | Name | Date | Evidence |
|---|---|---|---|
| Packet prepared by | | | |
| Reviewed and approved by (owner) | | | |
| Shared with client? | no | | Release requires both a client request and owner approval. This template does not send or share. |
