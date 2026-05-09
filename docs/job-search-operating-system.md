# Job Search Operating System

## Mission
Optimize for interview conversion and fit quality, not application volume.

Codex handles structured thinking, research, scoring, asset drafting, QA, and interview preparation. TealHQ holds the pipeline, saved jobs, job descriptions, contacts, notes, statuses, and follow-up rhythm.

## Easy User Triggers
Use these simple requests:

| User request | Default workflow |
|---|---|
| "Find jobs for me today" | Quick batch search and shortlist |
| "Find remote RevOps jobs" | Quick lane-specific search |
| "Triage these jobs" | Quick score each role and recommend next action |
| "What should I apply to next?" | Open Teal, identify the best viable non-applied role after live logistics verification, then run the Standard application workflow |
| "Apply to this job" | Standard application workflow |
| "Build the application pack for this Teal job" | Standard application workflow from Teal/JD |
| "Keep going" | Continue the highest-leverage unblocked step on the active role |
| "Prep me for this interview" | Deep interview workflow |
| "Help me negotiate this offer" | Deep compensation workflow |

Use one ongoing project chat for searches and operating cadence. Use a new chat for a high-fit individual application when the role needs deep research, multiple assets, interview prep, or repeated revisions. The user should not need to remember rigid prompts, the system should infer the likely workflow from normal language and Teal state.

## Workflow
1. Source roles through Teal saved searches, alerts, Chrome extension bookmarking, company career pages, referrals, and targeted research.
2. Complete role intake with title, company, JD, compensation, logistics, application URL, known contacts, and Teal status.
3. Classify the role by mandate into one primary lane and optional secondary lane.
4. Run a quick fit score before spending time on research or assets.
5. For viable roles, inspect the live application early to determine required assets, useful optional assets, and screening questions before deep drafting begins.
6. Create a company and market research brief.
7. Create the final fit scorecard and pursue recommendation.
8. Build resume strategy before drafting the tailored resume.
9. Draft role-specific assets only after research and scoring justify the effort.
10. For viable roles, create an optional cover letter by default when the form accepts one, unless the user explicitly skips it or the asset would clearly add more risk than value.
11. QA every asset for claim safety, recruiter comprehension, ATS clarity, tone, and fit.
12. Rename assets to the strict naming standard before upload or delivery.
13. Submit, message, or update externally only after explicit user approval.
14. Track every next action and follow-up in Teal.
15. Prepare interview packs only after the role is active or clearly worth pursuing.
16. Preserve compensation leverage through research, careful language, and staged disclosure.
17. Close stale browser tabs and duplicate source paths continuously to reduce system drag and operator confusion.
18. Review pipeline weekly and adjust searches, lanes, proof themes, and asset strategy.
19. End each run with token estimate, main cost drivers, new learnings, protocol fixes, and the cheapest reliable next step.

## Find Jobs Workflow
Default to Quick mode.

1. Use saved role lanes, compensation rules, and logistics preferences.
2. Search by title families and keyword clusters, not only exact titles.
3. Prioritize fresh postings and remote-friendly roles.
4. Return a shortlist, not a large dump.
5. For each role, include company, title, URL/source, lane, quick score, comp/logistics, why it fits, risks, and next action.
6. Recommend which roles to bookmark in Teal with the Chrome extension.
7. Stop before applications or outreach.

## Apply To Job Workflow
Default to Standard mode.

1. Require the full JD, Teal record, or application URL.
2. Complete intake and lane classification.
3. Run fit scoring before asset work.
4. If score is below 65, recommend pass or low-effort path unless the user overrides.
5. Before the role is treated as viable, inspect the live posting or live application for hard logistics blockers such as hidden hybrid requirements, hub-limited remote rules, relocation demands, and geography-based remote constraints.
6. If a hard blocker appears, downgrade the role and move to the next viable option instead of building assets.
7. If viable, inspect the live application first, then create research brief, fit scorecard, resume strategy, tailored resume, cover letter, outreach, and application answers in the order the form actually demands.
8. In the resume, make role fit clear, name relevant industries when helpful, build broad truthful skill coverage, include relevant AI/workflow and tool-fluency signals when source-backed, and maximize two pages without exceeding them.
9. QA every external asset against claim-safety rules, ATS clarity, and redundancy control before asking for approval to submit.
10. Stop for explicit approval before submitting, messaging, or changing external records.

## Role Decision Gate
Use this effort ladder:

| Fit Result | Action |
|---|---|
| 85 to 100, Pursue aggressively | Research deeply, tailor resume, draft outreach, prepare fast |
| 75 to 84, Pursue | Research and create assets if comp/logistics are viable |
| 65 to 74, Selective/opportunistic | Light research, save or pursue only if low friction or strategic |
| 50 to 64, Low fit | Usually archive unless new information improves score |
| Below 50, Pass | Do not spend asset time |

## Asset Creation Order
1. Research brief
2. Fit scorecard
3. Resume strategy
4. Tailored two-page resume
5. Cover letter
6. Outreach pack
7. Application answers
8. Interview pack
9. Follow-up notes
10. Compensation strategy

## Daily Cadence
- Review Teal alerts and saved searches.
- Triage fresh postings.
- Bookmark promising roles with full JD text.
- Score roles quickly.
- Pick the top 1 to 3 for deeper research.
- Prepare assets only for high-fit roles.
- Send only approved outreach and follow-ups.
- Update Teal statuses, notes, and next actions.

## Weekly Cadence
- Review pipeline by stage.
- Identify which lanes are producing responses.
- Analyze response rates and interviews per application.
- Refine saved searches and keywords.
- Update target companies.
- Improve resume variants and proof routing.
- Review compensation positioning.
- Identify networking targets.
- Archive weak-fit roles.

## Metrics
Track:
- jobs reviewed
- jobs saved
- fit score distribution
- applications submitted
- outreach sent
- response rate
- recruiter screens
- interviews
- offers
- time spent per role
- interviews per application
- strongest lanes by conversion
- common objections
- compensation ranges

## Approval Gates
The user must approve:
- applications
- outreach messages
- emails
- bulk Teal changes
- use of references
- reference contact sharing
- interview acceptance or decline
- external compensation negotiation
- deletion or overwrite of source-of-truth files

## Token Efficiency
Default to the smallest mode that can produce a reliable decision.

| Mode | Use For | Approximate Token Cost |
|---|---|---:|
| Quick | Search, batch triage, shortlist, pass/pursue decision | 3k to 8k per role, or 15k to 60k for 10 to 20 roles |
| Standard | One role application pack with research, scoring, strategy, drafts, QA | 40k to 100k |
| Deep | Interview prep, offer strategy, high-stakes role, complex company research | 100k to 220k |

Codex cannot always see live remaining rate-limit quota. If quota matters, ask the user for the visible remaining limit and model/reasoning level, then estimate how many Quick, Standard, or Deep workflows remain.
