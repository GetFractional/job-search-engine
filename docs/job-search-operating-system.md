# Job Search Operating System

## Mission
Optimize for interview conversion and fit quality, not application volume.

Codex handles structured thinking, research, scoring, asset drafting, QA, and interview preparation. TealHQ holds the pipeline, saved jobs, job descriptions, contacts, notes, statuses, and follow-up rhythm.

Use `docs/job-search-protocol-index.md` as the routing layer for current workflow mode, prompt templates, benchmark logging, and doc authority. This file defines the operating cadence and high-level system shape.

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
| "Update Teal job records" | Quick Tracker maintenance with inline table edits for verified low-risk fields |
| "Speed up Teal" | Teal UI repair and safe acceleration workflow |
| "Keep going" | Continue the highest-leverage unblocked step on the active role |
| "Prep me for this interview" | Deep interview workflow |
| "Help me negotiate this offer" | Deep compensation workflow |

Use one ongoing project chat for searches and operating cadence. Use a new chat for a high-fit individual application when the role needs deep research, multiple assets, interview prep, or repeated revisions. The user should not need to remember rigid prompts, the system should infer the likely workflow from normal language and Teal state.

Default model for Teal job search and routine Tracker maintenance is `gpt-5.4-mini` with medium reasoning. Use `GPT-5.5` with medium reasoning for application packs, final QA, interviews, compensation, Teal UI repair, repeated browser failure diagnosis, and protocol repair. Do not recommend high reasoning for this Job Search protocol.

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

1. Infer `gpt-5.4-mini` with medium reasoning from short requests like `find 10 qualified jobs`.
2. Open Teal Trackers first, record the Bookmarked baseline, and keep a save ledger.
3. Keep Chrome lean by closing stale job tabs, extension popups, duplicate source tabs, and the Teal side panel when they are not actively needed.
4. Use saved role lanes, compensation rules, and logistics preferences.
5. Search by title families and keyword clusters, not only exact titles.
6. Prioritize fresh postings, remote-friendly roles, posted salary ranges, and family-supportive benefits when fit is otherwise comparable.
7. Build a candidate queue in the ledger, but do not save from snippets or open a batch of job tabs.
8. Evaluate one source posting at a time. Open or reuse the current company-hosted or ATS-hosted posting tab, then close or replace it before the next candidate.
9. Open the company-hosted or ATS-hosted posting before saving and reject inactive, expired, filled, removed, generic-redirect, stale, or blocked roles.
10. Reject hidden geography blockers early, especially UK-only, London, EMEA-only, Europe-only, country-limited, state-limited, hub-limited, commuting-radius, hybrid, or relocation-required roles Matt does not clearly fit.
11. Run quick lane and fit scoring before saving.
12. Set the intended Teal Excitement and draft notes before saving.
13. Save only active, qualified roles using the safest available path: Teal Job Search or saved-search Save/Bookmark button when the role is already inside Teal, then the Teal Chrome extension from the live source posting, then Manual Add Job only as a last resort.
14. If the extension exposes Excitement and notes before save, set Excitement first, add notes second, then click Bookmark or Save third.
15. If the extension cannot set those fields before save, treat the save as provisional and immediately open the Teal Tracker record to finish Excitement, notes, salary fields, and full JD before counting the role.
16. Treat extension saves as provisional until confirmed in Teal.
17. When annual base salary is visible, populate Teal's official Minimum Salary and Maximum Salary fields after saving. Do not bury salary only in notes.
18. Manual Add Job is allowed only when Teal-native Save/Bookmark and the Chrome extension are unavailable or fail, and only after the full actual JD has been captured from the live source posting. Do not use Manual Add Job just because extension capture is flaky.
19. If using Manual Add Job, paste the full actual JD into the job description field before saving or in the same edit session, then reopen the record and verify the Job Description or Original Job Description section contains the full text. If the JD field is unavailable or the JD cannot be pasted immediately, stop and report the blocker instead of creating a bare bookmarked record.
20. Do not add multiple manual records before verifying the first one has the full JD.
21. Do not use the Latest Saved Jobs list or Tracker count as proof of new saves. Only the run ledger plus matching Teal record confirmation proves a new qualified save.
22. Count only Confirmed saved or Delayed confirmed roles toward the target.
23. Treat the requested count as qualified confirmed saves, not reviewed candidates. If the user asks for 10 jobs, search until 10 qualified roles are confirmed saved or a clear blocker or search exhaustion point is reached.
24. Expand across adjacent lanes, title aliases, saved searches, job boards, and company career pages before accepting fewer than the target.
25. Pivot after 5 candidates in one title family with 0 qualified saves, 2 repeated geo blockers, 10 minutes without a qualified save, 2 ambiguous extension events, or poor-quality result skew.
26. Return a shortlist, not a large dump.
27. For each role, include company, title, URL/source, lane, quick score, comp/logistics, active-status evidence, why it fits, risks, and next action.
28. Send a non-blocking progress update every 3 confirmed saves or every 10 candidates reviewed.
29. Use a browser-loop fail-safe after 2 confirmed saves, 12 candidates reviewed, 8 minutes of active browser work, or 40 browser actions. Return a compact ledger instead of risking a null closeout.
30. Do not wait for the user after routine progress updates. Continue unless there is a real external blocker.
31. Stop before applications or outreach.

## Teal Maintenance And Acceleration Workflow
1. Use visible Chrome and Teal UI. Do not invent or use private Teal APIs.
2. Use Tracker table inline edits for verified salary min, salary max, location, status, follow-up, deadline, and Excitement.
3. Use the detail screen for source URL, full JD, notes, resumes, contacts, and any field that proves brittle in the table.
4. Update Date Posted only from source-backed evidence, one record at a time.
5. If the inline date picker creates an incorrect or uncertain value, stop and report the blocker instead of continuing a bulk edit.
6. Page-context JavaScript may inspect visible DOM, extract visible row text, count visible elements, or identify visible controls.
7. Page-context JavaScript must not bypass Cloudflare, CAPTCHA, login, permissions, rate limits, or paywalls.
8. Do not extract tokens, print localStorage secrets, or mutate private Teal backend endpoints.
9. Record before and after values for every Teal mutation.

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

## Apply From Trackers Workflow
Default to Standard mode.

1. Open Teal Trackers in Google Chrome.
2. Review non-applied Bookmarked or Saved roles from best to worst using Excitement, fit score, role lane, compensation, logistics, recency, and application effort.
3. Verify the live posting before asset work.
4. Archive inactive, closed, expired, removed, or no-longer-accepting roles with a concise note and verification date.
5. Downgrade active but blocked or low-fit roles with a concise note.
6. Continue until the first viable top-ranked role clears the live viability gate.
7. Move that role to Applying only after the live application flow is inspected.
8. Build the full application pack and stop before submission.

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
| Quick | Teal search, batch triage, shortlist, pass/pursue decision | 15k to 80k for 10 qualified saved roles |
| Standard | One role application pack with research, scoring, strategy, drafts, QA | 40k to 100k |
| Deep | Interview prep, offer strategy, high-stakes role, complex company research | 100k to 220k |

Codex cannot always see live remaining rate-limit quota. If quota matters, ask the user for the visible remaining limit and model/reasoning level, then estimate how many Quick, Standard, or Deep workflows remain.
