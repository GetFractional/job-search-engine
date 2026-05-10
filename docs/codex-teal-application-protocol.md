# Codex Teal Application Protocol

Version: `2026-05-10-teal-acceleration`

## Purpose

Make Codex + TealHQ application work faster, safer, more measurable, and easier to repeat across chats.

Use this file for the end-to-end operating sequence. Use `docs/job-search-protocol-index.md` for routing across docs and skills.

## Core Principles

- The live posting and live application page determine the asset plan.
- Fit, compensation, logistics, and claim safety come before resume tuning.
- ATS alignment is a placement problem, not only a skills-list problem.
- Teal Resume Builder is a shared content library until the UI proves an edit is local.
- Every meaningful Standard or Deep run should create benchmark evidence.
- Protocol changes should replace stale guidance, not stack more rules.

## Workflow Modes

| Mode | Use For | Default Model | Reasoning | Token Posture |
|---|---|---|---|---|
| Quick | Active Teal job search, batch triage, saved-job scoring, pass or pursue decisions | `gpt-5.4-mini` | medium | fast active-search execution with strict gates |
| Standard | One viable Teal application pack | `GPT-5.5` | medium | enough research and QA to submit confidently |
| Deep | Interview, offer, hard positioning, protocol redesign | `GPT-5.5` | medium | use only when scope or stakes justify it |

Use `gpt-5.4-mini` with medium reasoning for Teal job search and routine Tracker maintenance after the update pattern is known. Use `GPT-5.5` with medium reasoning for application packs, final QA, interviews, compensation, Teal UI repair, repeated browser failure diagnosis, and protocol repair. Do not use or recommend `GPT-5.5 high` for this Job Search protocol.

## Safe Teal Acceleration

Speed up Teal only through visible, account-safe workflows:
- use logged-in Chrome, Teal-native controls, the Teal Chrome extension, and Tracker table inline edits
- use page-context JavaScript only to inspect visible DOM, extract visible row text, count elements, or identify visible controls
- use inline edits for verified salary min, salary max, location, status, follow-up, deadline, and Excitement
- use the detail screen for source URL, full JD, notes, resumes, contacts, and Date Posted when the table control is brittle
- do not bypass Cloudflare, CAPTCHA, login, permissions, rate limits, or paywalls
- do not extract tokens, print localStorage secrets, or mutate private Teal backend endpoints

## Find Jobs Sequence

1. Use Quick mode unless the user explicitly asks for deeper research.
2. Open Teal Trackers and record the current Bookmarked baseline.
3. Start a run ledger with `Candidate`, `Source`, `Geo`, `Fit`, `Salary min`, `Salary max`, `Benefits evidence`, `JD captured`, `Save attempt`, `Teal confirmed`, and `Decision`.
4. Search Teal saved searches, job boards, company career pages, and relevant sources in Google Chrome.
5. Build a candidate queue in the ledger, but do not save yet and do not open a batch of job tabs.
6. For each candidate, open or reuse exactly one company-hosted or ATS-hosted posting tab.
7. Confirm the active-posting gate:
   - posting opens directly in the browser session that will be used for the workflow
   - the browser-rendered page shows real live job content, not a stale cache snippet, blank shell, challenge-only page, or `Job not found` message
   - role is not closed, expired, filled, removed, or a generic redirect
   - title, company, location, and application URL are visible
   - a usable apply path or application surface is visible when the workflow is an application run
   - logistics and compensation do not create an obvious blocker
   - posting freshness matches the user's requested window or has a strong exception reason
8. Reject hidden geography blockers early, especially UK-only, London, EMEA-only, Europe-only, country-limited, state-limited, hub-limited, commuting-radius, hybrid, or relocation-required roles Matt does not clearly fit.
9. Score only roles that pass the active-posting and geo gates.
10. Prioritize roles with posted annual base salary ranges and family-supportive benefits when fit, mandate, and logistics are otherwise comparable.
11. Score the role, assign Teal Excitement, and draft notes before saving.
12. Save qualified roles using the safest available path: Teal Job Search or saved-search Save/Bookmark button when the role is already inside Teal, then the Teal Chrome extension from the live source posting, then Manual Add Job only as a last resort.
13. If the extension exposes Excitement and notes before save, set Excitement first, add notes second, then click Bookmark or Save third.
14. If the extension cannot set those fields before save, treat the save as provisional and immediately open the Teal Tracker record to finish Excitement, notes, salary fields, and full JD before counting the role.
15. Treat extension results as provisional until the role appears in Teal with matching title, company, source URL, Bookmarked status, full JD, Excitement, structured salary fields when salary is visible, and notes.
16. When a posting includes annual base salary, populate Teal's structured Minimum Salary and Maximum Salary fields after saving. Put ranges into min and max, exact annual salary into both fields, `up to` into max only, and `from` or `starting at` into min only.
17. Do not invent salary fields. Put hourly, OTE, bonus, equity, vague, missing compensation, and benefits in notes unless annual base salary is explicit.
18. Manual Add Job is allowed only when Teal-native Save/Bookmark and the Chrome extension are unavailable or fail, and only after the full actual JD has been captured from the live source posting. Do not use Manual Add Job just because extension capture is flaky.
19. If using Manual Add Job, paste the full actual JD into the job description field before saving or in the same edit session, then reopen the record and verify the Job Description or Original Job Description section contains the full text. If the JD field is unavailable or the JD cannot be pasted immediately, stop and report the blocker instead of creating a bare bookmarked record.
20. Do not add multiple manual records before verifying the first one has the full JD.
21. Do not use the Latest Saved Jobs list or Tracker count as proof of new saves. Only the run ledger plus matching Teal record confirmation proves a new qualified save.
22. Use save labels: `Confirmed saved`, `Duplicate existing`, `Provisional`, `Delayed confirmed`, `Failed save`, and `Rejected`.
23. Count only `Confirmed saved` or `Delayed confirmed` roles toward the target.
24. Treat the requested count as qualified confirmed saves, not candidates reviewed. If the user asks for 10 jobs, keep going until 10 qualified roles are confirmed saved or a real blocker/search exhaustion point is reached.
25. Do not save weak, stale, inactive, or blocked roles just to hit the target.
26. Search across multiple title families and adjacent lanes before accepting a weak batch.
27. Prioritize the best jobs by fit, compensation, logistics, recency, company quality, mandate quality, benefits, and application leverage.
28. Pivot after 5 candidates in one title family with 0 qualified saves, 2 repeated geo blockers from one surface, 10 minutes without a qualified save, 2 ambiguous extension events, or results skewing international, junior, low-comp, or channel-mismatched.
29. Work in batches and send a non-blocking progress update every 3 confirmed saves or every 10 candidates reviewed.
30. Do not wait for the user after routine progress updates. Continue unless there is a real external blocker.
31. Use a browser-loop fail-safe: after 2 confirmed saves, 12 candidates reviewed, 8 minutes of active browser work, or 40 browser actions, provide a compact ledger update before continuing. If the runtime cannot continue safely, stop with a partial ledger and exact continuation step rather than ending silently.
32. Keep Chrome lean during search. Close stale job tabs, duplicate source tabs, extension popups, and the Teal side panel when they are not needed, because large browser states waste tokens and raise the chance of runtime failure.
33. If Teal, the extension, login, CAPTCHA, or a source site stops working, stop and report the blocker instead of silently continuing or abandoning the task.

## Application Sequence

1. Classify the user request with `job-search-scenarios`.
2. Open or create the Teal role record only when the task needs Teal state.
3. Verify the saved source and inspect the live posting.
4. Run the live viability gate before deep work. Browser-rendered source truth wins over cached search snippets, stale index text, Teal metadata, or other indirect signals.
5. Inspect the live application flow early enough to identify required assets, useful optional assets, screening questions, blocker fields, and whether the apply path is actually usable.
6. Complete role intake, lane classification, quick fit score, and Teal Excitement.
7. Research only what the asset plan and application questions require.
8. Create the research brief and final scorecard.
9. Build resume strategy, including proof hierarchy, missing-term coverage map, redundancy map, and page-budget plan.
10. Optimize the Teal resume through target title, summary, selected bullets, categorized skills, Job Matcher, and Analyzer.
11. Build a cover letter when the live form accepts one and the role is viable.
12. Prepare application answers and compensation language.
13. Export or prepare assets with strict filenames.
14. Run QA across resume, cover letter when used, and application answers.
15. Fill the form only when useful and safe.
16. Stop before submission, outreach, references, or external negotiation unless the user explicitly approves the exact action.
17. Log benchmark data for Standard and Deep runs.

## Apply Next Best Sequence

Use this when the user asks what to apply to next, asks to apply from the Trackers screen, or asks to work jobs best-to-worst.

1. Open Teal Trackers in Google Chrome.
2. Filter to roles that are not already applied, archived, rejected, or clearly closed.
3. Rank candidates by Excitement, fit score, role lane, compensation, logistics, recency, and application effort.
4. Open the top candidate's Teal record and source URL.
5. Verify the live posting before any asset work.
6. If the posting is inactive, removed, `Job not found`, or the source page cannot prove a usable apply path, archive the role with a concise note and verification date, then continue.
7. If the posting is active but blocked by logistics, compensation, mandate, or low fit, downgrade or note it, then continue.
8. Only move a role to Applying after it passes live viability and the live application flow is inspected.
9. Build the application pack for the first viable top-ranked role.
10. Stop before final submission unless the user approves the exact submission.

## Live Viability Gate

Stop before deep asset work if the live posting or application shows a hard mismatch:

- required hybrid or in-office schedule outside Matt's target footprint
- remote limited to specific hubs, metros, or commuting radius
- relocation requirement that conflicts with the current search posture
- work authorization or sponsorship mismatch
- compensation below the acceptable floor without exceptional strategic value
- application requirement that needs user approval, references, or sensitive disclosure

If a role fails the gate, downgrade or note it in Teal when authorized, then move to the next viable role.

Inactive postings are not just low fit. If a saved Teal role is closed, expired, filled, removed, or no longer accepting applications, archive it and record the reason before moving on.

## Resume Optimization Standard

Use Job Matcher and Analyzer as diagnostic tools, not as the goal.

For every role-specific resume:

- Map missing JD and Job Matcher terms into hard skills, soft skills, business terms, platforms/tools, and noise.
- Assign each kept term one best destination: target title, summary, selected recent bullet, categorized skills, cover letter, or application answer.
- Put mandate-defining truthful terms into recruiter-readable prose before relying on skills categories.
- Keep skill categories clean, deduped, canonical, and role-specific.
- Do not ship categorized skills with an active uncategorized top-skill row.
- Treat 24 to 28 reflected skills as a coverage target, not a quota.
- Remove weak standalone skills and vague filler before cutting differentiated proof.
- Keep brand-specific metrics tied to the correct employer, client, or brand context.
- Keep the final resume to two pages maximum and use the second page well.

## Shared Teal Content Gate

Safe local actions:

- toggling selected content for a role resume
- adding role-specific categorized skills when they do not delete history-level skills
- renaming role resumes and local exports
- recording notes and benchmark data

Needs explicit approval:

- saving a bullet or summary edit to all resumes
- deleting a skill from work history
- bulk-changing Teal records
- changing source-of-truth files
- submitting applications, outreach, references, or compensation negotiation

## QA Gate

Do not call a package ready until these checks pass:

- claims trace to the Canonical Profile, Metrics Ledger, Role Lane Glossary, or Story Bank
- numbers use safe phrasing and correct ownership
- role fit is obvious in the first screen
- high-value ATS terms appear in prose when supportable
- no keyword stuffing, duplicate proof, weak filler, or cryptic metrics
- no em dashes or AI-sounding phrasing
- resume stays at two pages maximum
- filenames match `{Company} - {Role} - Matt Dimock - Resume` and `{Company} - {Role} - Matt Dimock - Cover Letter`
- remaining gaps are labeled as unsupported, noise, covered in prose, covered in skills, or external asset only

## Measurement Loop

Use `docs/job-search-protocol-benchmark.md` for every meaningful Standard or Deep run.

Log:

- before and after Match Score
- before and after Resume Analyzer score when visible
- page count before and after export
- export loops
- shared-content risks
- remaining gap labels
- token estimate and main token drivers
- outcome signal when available

Use `docs/job-search-protocol-change-log.md` for protocol edits. Do not treat a new rule as proven until it has been tested across at least 3 meaningful Standard or Deep runs without creating claim safety, page discipline, or Teal efficiency regressions.

## Prompt Architecture

### Quick

```text
Use gpt-5.4-mini with medium reasoning. Find 10 qualified active jobs against Matt's saved role lanes, compensation rules, family-benefits preferences, and logistics preferences. Infer the full Teal search workflow from this request. The target is 10 qualified confirmed saves, not 10 reviewed candidates. Prioritize roles with posted salary ranges and family-supportive benefits when fit is otherwise comparable. Open Teal Trackers first, record the Bookmarked baseline, and use a save ledger with JD captured, salary min, salary max, benefits evidence, save attempt, and Teal confirmed fields. Use Google Chrome. Use Teal-native Save/Bookmark for roles already inside Teal, then the Teal Chrome extension from live source postings, then Manual Add Job only as a last resort. Keep the candidate queue in the ledger, evaluate one source posting tab at a time, and close or reuse the source tab before the next candidate. Verify active employer or ATS postings before saving, reject hidden geo blockers early, search across multiple title families and adjacent lanes, and use pivot thresholds when a surface is weak. Before saving, score the role, set intended Excitement, and draft notes. If the extension supports it, set Excitement first, add notes second, then use the save control third. If not, immediately open the Tracker record after saving and complete Excitement, notes, salary fields, and full JD before counting the role. Do not use Manual Add Job just because extension capture is flaky. If Manual Add Job is unavoidable, capture the full source JD first, paste it before or during the same save, reopen the record, and verify Job Description or Original Job Description before continuing to the next role. Do not use Latest Saved Jobs or Tracker counts as proof of new saves. Populate Teal Minimum Salary and Maximum Salary fields when annual base salary is visible. Keep expanding sources until 10 qualified roles are confirmed saved or a clear blocker/search exhaustion point is reached. Keep Chrome lean by closing stale tabs, duplicate source tabs, extension popups, and side panels when possible. Use only safe UI acceleration: visible controls, inline Tracker edits for verified low-risk fields, and visible DOM inspection. Do not bypass Cloudflare, CAPTCHA, login, permissions, or private endpoints. Progress updates are non-blocking. Do not wait for the user unless there is a real external blocker such as login, CAPTCHA, extension failure, or site access failure. Use a browser-loop fail-safe so the run returns a compact ledger rather than ending without a final status.
```

### Standard

```text
Use GPT-5.5 with medium reasoning. Build one viable application pack through Teal. Infer Standard mode. First run role intake, lane classification, fit score, source verification, and live application inspection. Then create the research brief, resume strategy, missing-term coverage map, Teal resume plan, cover letter if the form supports it, application answers, QA verdict, benchmark row, and stop before submission.
```

### Apply Next Best

```text
Use GPT-5.5 with medium reasoning. Apply to jobs in Teal from best to worst. Infer Standard mode. Open the Trackers screen in Google Chrome, review non-applied Bookmarked or Saved roles by Excitement, fit score, recency, compensation, and logistics. For each candidate, verify the live posting first. If inactive, archive it with a note and continue. If active but blocked or low fit, downgrade or note it and continue. Only move a role to Applying after it passes live viability and the application flow is inspected. Build the full application pack for the first viable top-ranked role, fill what is safe, and stop before submission.
```

### Deep

```text
Use GPT-5.5 with medium reasoning. For a high-stakes role or protocol redesign, synthesize the role, company, market, hiring logic, Matt's proof, claim risks, ATS alignment, compensation leverage, and QA constraints. Produce decision-ready strategy, assets, evaluation criteria, and protocol improvements. Separate source-backed facts from inference.
```

## Prompt Rules

- Use clear sections and delimiters for source material, JD text, role intake, application questions, and output requirements.
- Ask for the deliverable, criteria, evidence, and decision. Do not ask for hidden chain-of-thought.
- Use the smallest source set that can support the decision.
- Use `gpt-5.4-mini medium` by default for Teal job search and routine Tracker maintenance. Use `GPT-5.5 medium` for application packs, final QA, interviews, compensation, Teal UI repair, repeated browser failure diagnosis, and protocol repair. Do not recommend high reasoning for this Job Search protocol.
- Record benchmark data after Standard and Deep runs so prompt changes are measured, not guessed.
