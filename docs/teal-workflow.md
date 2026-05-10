# TealHQ Workflow

## Protocol Authority

Use this file for Teal UI execution details. Use `docs/job-search-protocol-index.md` for routing, `docs/codex-teal-application-protocol.md` for the full application sequence, and `docs/job-search-protocol-benchmark.md` for run logging.

## Role Of Teal
TealHQ is the job-search command center. Codex supports analysis, drafting, QA, and strategy. Do not invent a Teal API or bypass Teal's UI, permissions, login, CAPTCHA, or platform restrictions.

Use Matt's logged-in Google Chrome browser for Teal, LinkedIn, job boards, company career sites, and application forms. Prefer Chrome over in-app browser automation when login state, Cloudflare, challenge prompts, or the Teal Chrome extension matter.

Default model for Teal job search is `gpt-5.4-mini` with medium reasoning. Use `GPT-5.5` with medium reasoning for application packs, final QA, interviews, compensation, and protocol repair. Do not recommend high reasoning for this Job Search protocol.

Operate like a human: use visible navigation, keep actions paced, avoid repeated reload/click loops, do not brute-force guessed URLs, and stop at CAPTCHA, Cloudflare, security, login, or permission challenges.

## Safe Teal Acceleration

Use speed tactics that preserve account safety and data accuracy.

Preferred acceleration path:
1. Use the logged-in Chrome UI and visible Teal controls.
2. Use Teal Tracker table inline edits for verified, low-risk maintenance fields.
3. Use the detail screen for source URL, full JD, notes, resumes, contacts, and brittle fields.
4. Use page-context JavaScript only to inspect visible DOM, count visible elements, extract visible row text, or identify visible controls for human-paced UI actions.
5. Keep a before and after ledger for every record mutation.

Never use acceleration to:
- bypass Cloudflare, CAPTCHA, login, permissions, rate limits, or paywalls
- extract or print tokens, cookies, localStorage secrets, or account credentials
- mutate Teal through private backend endpoints or guessed routes
- mass-update records without source-backed values and explicit user approval

Playwright and headless browser rule:
- do not treat Playwright blocks or Cloudflare challenges as something to bypass
- use Matt's normal Chrome session through Computer Use when Teal auth, extension behavior, or challenge prompts matter
- pause and report a blocker if Teal challenges, locks, or rate-limits the session

Tracker table rule:
- inline table edits are the first choice for verified salary min, salary max, location, status, follow-up, deadline, and Excitement
- Date Posted is verification-sensitive and can be brittle in the inline picker; update it only one record at a time after source verification
- if a date picker creates an incorrect or uncertain value, stop, revert or clear the bad value when safe, and report the exact blocker

Controlled batch cleanup rule:
- use a controlled batch only for source-backed maintenance fields, not application work
- default maximum batch size is 5 records before a ledger checkpoint
- allowed batch fields are Minimum Salary, Maximum Salary, location, status, follow-up, deadline, and Excitement when visible in the Tracker table
- use the detail screen for source URL, full JD, notes, resumes, contacts, and any field that affects application evidence
- do not batch Date Posted, source URL, full JD, rich notes, shared resume content, or application statuses that imply external progress
- pause after 2 ambiguous edits, any Intercom or UI obstruction, any date-picker uncertainty, any auth or challenge prompt, or 15 minutes without a ledger checkpoint
- record before value, source evidence, edited value, verification method, and rollback note for every changed record

## Saved Searches
Create saved searches by lane and title family.

Suggested naming:
- `L1 RevOps Remote 150k+ Fresh`
- `L1 Growth Ops Remote Hybrid`
- `L2 Lifecycle CRM Remote`
- `L3 Growth Revenue Marketing`
- `L5 Ecommerce DTC Growth`
- `Selective Head VP Marketing`
- `AI Workflow Growth Ops`

Use title and keyword variations, not only obvious titles.

## Salary And Benefits Priority

In search and saved-job triage, prioritize roles that state salary ranges and show family-supportive benefits when fit is otherwise comparable.

Treat posted annual base salary as a speed and confidence signal because it reduces compensation uncertainty and enables structured Teal fields. It does not override fit, geography, mandate, or claim-safe application quality.

Capture visible family-supportive benefits in Teal notes when they affect fit:
- dependent healthcare or strong medical coverage
- 401(k)
- bonus or equity
- parental or family leave
- PTO
- remote flexibility
- childcare or wellness support

If salary is not posted, leave Teal salary fields blank and write `salary not posted` in notes. Do not invent ranges.

If sources conflict on currency, country, or range, do not silently normalize the value. Prefer the employer or ATS source for application readiness, record the conflict in the ledger, and mark the role for manual re-verification before applying.

## Codex Search Trigger
When the user says "find jobs":
1. Infer `gpt-5.4-mini` with medium reasoning from concise find-jobs requests.
2. Open Google Chrome and Teal Trackers, then record the current Bookmarked baseline.
3. Keep Chrome lean: close stale job tabs, close the Teal side panel when it is not actively needed, and avoid repeatedly reading giant browser states when a compact ledger can carry the run state.
4. Evaluate one job posting tab at a time. Keep the candidate queue in the ledger, reuse or close the source tab between candidates, and do not leave a batch of job tabs open.
5. Keep a save ledger with Candidate, Source, Geo, Fit, Salary min, Salary max, JD captured, Save attempt, Teal confirmed, and Decision.
6. Use Teal Job Search, saved searches, relevant job boards, or company career pages.
7. Build a candidate queue first. Do not save roles immediately from search-result snippets.
8. Open the company-hosted or ATS-hosted posting for each candidate and verify it is active before saving.
9. Reject candidates that are closed, expired, filled, removed, redirected to a generic careers page, outside the requested freshness window without a strong reason, or blocked by obvious logistics or compensation issues.
10. Reject hidden geography blockers early, especially UK-only, London, EMEA-only, Europe-only, country-limited, state-limited, hub-limited, commuting-radius, hybrid, or relocation-required roles Matt does not clearly fit.
11. Score the role, set the intended Teal Excitement, and draft notes before clicking Bookmark or Save.
12. Save qualified roles using the safest available path: Teal Job Search or saved-search Save/Bookmark button when the role is already inside Teal, then the Teal Chrome extension from the live source posting, then Manual Add Job only as a last resort.
13. If the extension exposes Excitement and notes before save, set Excitement first, add notes second, then click Bookmark or Save third.
14. If the extension cannot set those fields before save, treat the save as provisional and immediately open the Teal Tracker record to finish Excitement, notes, salary fields, and full JD before counting the role.
15. Treat extension feedback as provisional until the job appears in Teal.
16. Confirm each bookmarked role appears in Teal as Bookmarked and includes matching title, company, location, URL, full JD, Excitement, structured salary fields when annual base salary is visible, and notes.
17. Populate Teal's official Minimum Salary and Maximum Salary fields when the posting shows annual base compensation. Put ranges into min and max, exact salaries into both, `up to` into max only, and `from` or `starting at` into min only. Do not annualize hourly, OTE, bonus, equity, or vague ranges unless the annual base is explicit.
18. Manual Add Job is allowed only when Teal-native Save/Bookmark and the Chrome extension are unavailable or fail, and only after the full actual JD has been captured from the live source posting. Do not use Manual Add Job just because extension capture is flaky.
19. If using Manual Add Job, paste the full actual JD into the job description field before saving or in the same edit session, then reopen the record and verify the Job Description or Original Job Description section contains the full text. If the JD field is unavailable or the JD cannot be pasted immediately, stop and report the blocker instead of creating a bare bookmarked record.
20. Do not add multiple manual records before verifying the first one has the full JD.
21. Do not use the Latest Saved Jobs list or Tracker count as proof of new saves. Only the run ledger plus matching Teal record confirmation proves a new qualified save.
22. Use save labels: Confirmed saved, Duplicate existing, Provisional, Delayed confirmed, Failed save, and Rejected.
23. If auto-capture fails, paste the full JD manually into the same record or mark the save as blocked. Do not leave a low-information role in Teal as a viable candidate.
24. Triage Teal-saved roles by lane, score, risks, and next action.
25. Treat the requested count as qualified confirmed saves. If the user asks for 10 jobs, continue until 10 qualified roles are confirmed saved or a real blocker or search exhaustion point is reached.
26. Search across multiple title families and adjacent lanes before accepting a weak batch.
27. Pivot after 5 candidates in one title family with 0 qualified saves, 2 repeated geo blockers from one surface, 10 minutes without a qualified save, 2 ambiguous extension events, or results skewing international, junior, low-comp, or channel-mismatched.
28. Send a non-blocking progress update every 3 confirmed saves or every 10 candidates reviewed.
29. Do not wait for the user after routine progress updates. Continue unless there is a real external blocker.
30. Use a browser-loop fail-safe: after 2 confirmed saves, 12 candidates reviewed, 8 minutes of active browser work, or 40 browser actions, provide a compact ledger update before continuing. If the runtime cannot continue safely, stop with saved count, ledger, blocker, and exact continuation step.
31. If Teal, the extension, login, CAPTCHA, or source sites stop working, stop and report the blocker.

If the user says something vaguer such as "help me with job search," infer the most likely workflow from the current Teal state and recent context instead of forcing a rigid prompt ritual.

## Excitement Mapping
Use this default mapping:
- 90-100: 5 stars
- 75-89: 4 stars
- 60-74: 3 stars
- 45-59: 2 stars
- 0-44: 1 star

If strategic value warrants an exception, record the reason in Teal notes.

## Job Bookmarking
Use the Teal Chrome extension for job boards and company career pages.

Do not bookmark from a search result alone. Open the real posting first and verify active status.

If the role is already inside Teal Job Search or a saved search, use Teal's native Save or Bookmark control instead of Manual Add Job.

Before bookmarking:
- run quick lane and fit scoring
- set the intended Teal Excitement from score
- draft notes with lane, score, compensation/logistics, active-status evidence, risk, and next action
- set Excitement and notes in the extension first when the extension supports it

After bookmarking:
- confirm title, company, location, and URL
- confirm the full JD is saved
- paste the full JD manually if auto-capture fails
- add compensation to Teal's structured Minimum Salary and Maximum Salary fields if annual base salary is available
- add role lane and quick fit score in notes
- add active-status evidence, such as active ATS page verified and date checked

Manual Add Job:
- use only after Teal-native Save/Bookmark and the Chrome extension are unavailable or fail
- capture the full actual JD before opening Manual Add Job
- paste the full actual JD before saving or in the same edit session
- verify the saved record shows the full Job Description or Original Job Description before continuing to the next role

Do not save a role just to reach the requested count. The count means qualified confirmed saves, so keep searching rather than filling the target with stale or weak jobs.

Never count a Provisional save toward the target. Count only Confirmed saved or Delayed confirmed roles.

## Best-Job Search Expansion

Always prioritize finding the strongest jobs for Matt, not just jobs that match the first title phrase tried.

Use multiple title families across the saved lanes:
- Revenue Operations: revenue operations, growth operations, GTM operations, RevOps, sales operations, revenue enablement with systems ownership
- Lifecycle / CRM / Retention: lifecycle marketing, CRM, retention, customer journey, engagement, nurture, marketing automation
- Growth / Revenue Marketing: growth marketing, revenue marketing, demand generation with lifecycle or operations depth, funnel optimization
- Ecommerce / DTC Growth: ecommerce growth, DTC growth, retention, CRO, owned-channel growth, conversion optimization
- Selective Head / VP Marketing: only when performance, lifecycle, RevOps, analytics, ecommerce, or systems ownership is central

Search balance:
- start with the strongest lanes, but rotate through adjacent lanes before declaring the market weak
- do not force equal counts by lane
- do not let one title label crowd out stronger adjacent roles
- prefer higher-fit roles with different names over lower-fit roles with perfect title matches

## Codex Application Trigger
When the user says "apply to this job":
1. Open the Teal job record in Google Chrome.
2. Verify the source link is still active. If the saved source blocks or redirects, try one direct company-hosted posting path, then stop with uncertainty if needed.
3. Before deep research or asset work, run a live viability check against the company-hosted posting or application page. Confirm that the browser-rendered page shows real live job content and a usable apply path, not a stale cache snippet, blank shell, `Job not found` page, or broken application surface. Then confirm actual remote versus hybrid status, hub-radius restrictions, office attendance expectations, relocation requirements, sponsorship constraints, and any other hard logistics blockers.
4. If the role fails the live viability check, do not continue into resume or cover-letter work. Downgrade or archive the role in Teal and route to the next viable role.
5. Complete intake, lane classification, fit scoring, and Excitement update.
6. Inspect the live application flow early and record:
   - required assets
   - optional assets the form supports
   - screening questions or fields that require research support
7. Research the JD, application questions, company, hiring manager/recruiter, target role, market, competition, likely KPIs, and why the role exists.
8. Move the role to Applying when asset work begins.
9. Create or open the Teal role resume from the Resumes tab.
10. Use Resume Builder, Job Matcher, Analyzer, and Skills & Interests to optimize the resume.
11. Make the summary explain role fit clearly, name relevant industries or business contexts when useful, and avoid cryptic shorthand metrics.
12. Build enough role-specific reflected skills to cover the mandate thoroughly, with a default target of at least 24 truthful skills across 5 to 6 categories and a preferred target around 28 when the proof and layout support it.
13. Use extra second-page capacity for stronger adjacent proof, broader high-value skill coverage, and relevant tool fluency before compressing the layout.
14. When relevant and source-backed, include operator-level AI and workflow-architecture language such as AI-assisted workflows, agentic research, automation systems, and human oversight.
15. When the company uses tools Matt has actually used, reflect those tools naturally where they improve fit.
16. Before saving any new summary line or bullet, compare it against the existing selected content and remove overlap. Replace the weaker line instead of stacking two versions of the same proof.
17. When Teal exposes direct missing-skill actions, such as adding a skill or generating a bullet from Job Matcher, use them only when they produce truthful, non-redundant coverage faster than manual editing.
18. Build a missing-term coverage map from the JD and Job Matcher, grouped into hard skills, soft skills, business terms, and platforms/tools. Mark each term as prose first, skills-category fit, external-asset only, or noise.
19. Use the relevant local skills, not just Teal mechanics, when the workflow calls for them. Minimum application stack usually includes `role-intake`, `role-lane-classification`, `company-research`, `resume-strategy`, `resume-drafting`, `qa-fact-check`, and `application-answer`.
20. Aim to fill two full pages without spilling onto a third.
21. When a useful new term or phrase pushes the resume to three pages, shorten or replace weaker copy before dropping high-value mandate language.
22. If the live form accepts an optional cover letter and the role is viable, prepare one by default with a custom prompt.
23. Export the resume and cover letter as separate files.
24. Rename exported files to the strict local naming standard before upload: `{Company} - {Role} - Matt Dimock - Resume` and `{Company} - {Role} - Matt Dimock - Cover Letter`.
25. Prepare application answers.
26. Prefer manual, source-backed contact entry on live forms when browser autofill suggests stale addresses, outdated profiles, or mismatched location history.
27. Fill safe pre-submit application questions by default when the user has provided standing facts, including veteran, disability, ethnicity, race, and government-clearance questions.
28. Run one final QA pass across resume, cover letter, and prepared application answers before asking for submission approval.
29. If the protocol itself changed during the run, add one benchmark row and one change-log note so later chats can measure whether the change improved outcomes.
30. Close stale or no-longer-needed Chrome tabs opened during the workflow.
31. End the run with estimated token usage, main cost drivers, new learnings, and the protocol changes made from those learnings.
32. Stop before final submission until the user approves the exact action and destination.

## Apply From Trackers, Best To Worst

When the user asks Codex to apply to jobs in order from the Trackers screen:

1. Open Teal Trackers in Google Chrome.
2. Consider only roles that are not already applied, archived, rejected, or known closed.
3. Rank candidates by Excitement, fit score, role lane, compensation, logistics, recency, and application effort.
4. For each candidate, open the Teal record and source URL.
5. Verify the live posting before research, resume work, or status changes to Applying.
6. If inactive, archive the role and add a note: `Archived: browser-rendered source page inactive, removed, or not found, verified YYYY-MM-DD.`
7. If active but blocked, downgrade Excitement, add a note with the blocker, and continue to the next role.
8. Only move the first viable role to Applying after the live application flow is inspected and the browser-rendered source page shows a usable apply path.
9. Build the application pack for that viable role and stop before submission.

Archiving one failed role during a next-best workflow is normal pipeline hygiene. Bulk archive sweeps still require explicit approval.

## Pre-Teal To In-Teal Handoff

Before editing a resume in Teal, prepare a compact handoff:

- role lane and fit score
- live viability verdict
- required assets and useful optional assets
- screening questions and compensation fields
- proof hierarchy
- missing-term coverage map
- shared-content edits that need approval
- page-budget plan
- benchmark fields to capture before editing

Inside Teal, capture:

- Match Score before and after
- Resume Analyzer score before and after when visible
- page count before and after export
- export loop count
- remaining gaps by label: `covered in prose`, `covered in skills`, `external asset only`, `unsupported`, or `noise`
- whether any change risks syncing across resumes

## Job Tracker Fields
Maintain:
- status
- role lane
- fit score
- pursue classification
- compensation range
- minimum salary
- maximum salary
- remote/hybrid/location
- deadline if known
- source
- company stage
- recruiter
- hiring manager
- notes
- next action
- follow-up date
- asset status
- interview status

## Teal UI Feature Map

Use the fastest verified screen for the job. Last verified: `2026-05-10`.

| Teal Screen | Verified Controls | Safe Batch Use | Fallback Screen | Evidence Required | Known Brittle Behavior |
|---|---|---|---|---|---|
| Tracker table | Status filters, search, table or board toggle, Job Tracker Menu, Add Job, sortable columns, inline Minimum Salary, Maximum Salary, location, status, Date Posted, Date Saved, deadline, Date Applied, follow-up, and Excitement | Yes, for verified salary min, salary max, location, status, follow-up, deadline, and Excitement | Job detail screen | Source-backed current value and visible after-edit confirmation | Date controls can be brittle. Bottom-right Intercom can cover lower-row Excitement controls. Scroll rows above the widget or close the widget before rating. |
| Job detail screen | Back link, delete, edit, salary range, Excitement, status, source link, Job Info, Guidance, Notes, Resumes, Contacts, Email Templates, Check List, Practice Interview, full job description, AI Assistant | No, use one record at a time | Tracker table for low-risk field edits | Matching title, company, source URL, full JD, current salary or location source, note text | Rich content and evidence fields are slower but safer. Do not use detail-screen edits as a bulk loop without checkpoints. |
| Teal Chrome extension | Source-page save, Bookmark or Save, and sometimes pre-save Excitement and notes | No | Tracker record after save | Live employer or ATS posting, active status, title, company, location, URL, full JD | Extension feedback can be delayed or look like an error while the role is later saved. Treat as Provisional until Teal confirms. |
| Manual Add Job | Manual title, company, URL, location, salary, and JD entry when visible | No | Extension or Teal-native Save/Bookmark | Full actual JD captured before opening Manual Add Job | Can create bare bookmarked records without descriptions. Never add a second manual record until the first has a verified full JD. |
| Compensation analysis | Filters for Job Stage, Lowest Salary, Only jobs with salary, Years of Experience, Show All Jobs, job summary table, cash compensation summary, years-of-experience summary | No | Tracker table for record truth | Tracker salary fields plus live source evidence | May show stale, normalized, or derived compensation values that differ from the Tracker row. Use for analysis only after reconciling with source and Tracker. |
| Offer Analysis | Create Offer, select job from tracker, initial offer terms, PDF upload, offer table | No | Compensation strategy workflow | Real offer letter or user-approved offer terms | Do not create or upload offers without explicit user approval. |
| People tracker | Filter Contacts, Group by, Columns, Menu, Add a New Contact, browser extension link | No | Job detail Contacts tab | Recruiter or hiring-manager source evidence | Empty-state tracker currently visible. Do not send outreach without approval. |
| Companies tracker | Filter Companies, Group by, Columns, Menu, Add a Company, browser extension link | No | Job detail record and company research notes | Company source evidence | Empty-state tracker currently visible. Do not create companies unless needed for pipeline work. |

Controlled batch cleanup checklist:
1. Confirm the user approved batch cleanup or the active task explicitly asks to update Teal records.
2. Create a ledger with `Record`, `Field`, `Before`, `Source evidence`, `After`, `Verified`, `Rollback note`, and `Decision`.
3. Limit the first pass to 5 records, then stop for a ledger checkpoint before continuing.
4. Use Tracker table inline edits only for verified low-risk fields.
5. Use the job detail screen when the field is evidence-bearing, shared, rich text, or not stable in the table.
6. Treat Date Posted as one-by-one only. If the picker behaves unexpectedly, stop instead of batch editing more dates.
7. After each record, verify the visible row or detail screen before moving to the next record.
8. If Teal or Chrome becomes sluggish, close stale source tabs, extension popups, side panels, and unused job tabs before continuing.
9. If a save or edit has delayed confirmation, mark it `Provisional` or `Delayed confirmed` in the ledger and reconcile before counting it complete.
10. Do not use Compensation analysis as the source of truth for record updates unless it matches the Tracker and live source evidence.
11. If salary evidence conflicts across sources, stop after the safest visible value is recorded and mark the role for manual re-verification before application work.

## Resume Builder
Use one comprehensive master resume in Teal as the profile library. Do not submit the master directly.

Treat every bullet, summary, and skill edit as potentially shared until the UI confirms it is local. If Teal offers a sync choice, keep role-specific edits local unless the change is clearly universal and the user approves saving it across resumes.

For each role:
1. Build resume strategy from the JD and research brief.
2. From the job record's Resumes tab, create a new resume or open the attached role resume.
3. Use Default to all content on when creating from the master profile.
4. Rename the resume `{Company} - {Role} - Matt Dimock - Resume` when possible.
5. Use Teal Job Matcher for hard-skill, soft-skill, tool, and role-term gaps.
6. Update target title, professional summary, selected bullets, and Skills & Interests.
7. In the summary, make the mandate obvious and name relevant industries or business contexts when that increases relevance.
8. Put the highest-value truthful JD terms into recruiter-readable prose first, especially the target title, summary, and recent bullets, before relying on Skills & Interests to carry the load.
9. Add only truthful, natural, recruiter-readable language.
10. Avoid keyword stuffing, unsupported claims, and cryptic shorthand metrics that require translation.
11. Target at least 24 truthful reflected skills across 5 to 6 categories, with a preferred target around 28 when the resume still reads cleanly.
12. If Job Matcher shows the draft is well below the recommended score, keep iterating on summary and bullet language before treating the draft as ready.
13. Before adding a new bullet, check whether an existing bullet already communicates the same proof, channel mix, or business outcome. If yes, replace or rewrite instead of adding a near-duplicate.
14. If categorized `Skills & Interests` are active, turn off any uncategorized top skill row before export.
15. Use one canonical label per concept within the resume, for example `GA4` or `Google Analytics 4`, not both; `Systems Thinking`, not `Systems Thinker`, unless there is a specific reason to preserve the alternate wording.
16. Make category names reflect the role's actual mandate. Do not keep inherited or weak catch-all buckets that no longer fit the job.
17. Remove low-context standalone skills that are not strong enough by themselves, such as `Landing Pages`, unless the role makes them directly relevant.
18. Remove vague filler skills like `Website Optimization` when a stronger role-native term can express the same truth more cleanly.
19. Use Analyzer before export when available.
20. Export PDF, verify the downloaded file name, and rename generic exports before upload.

## Canonical Skills Cleanup

Use `docs/job-search-protocol-index.md` for canonical skill naming. Inside one resume, do not mix duplicate concept labels such as `GA4` and `Google Analytics 4`.

Remove or replace weak standalone skills when they do not carry role-specific meaning. Common examples include orphaned `Landing Pages`, vague `Website Optimization`, malformed one-word fragments, and unsupported soft skills.

## Job Matcher
Use Job Matcher as a gap-analysis tool:
- identify missing truthful keywords
- separate must-have terms from noise
- reject false or inflated keyword additions
- preserve readable resume architecture
- keep the final skill taxonomy deduped, categorized, and canonically named

Treat generic tokens, malformed strings, and irrelevant one-word fragments as noise. Prioritize role-specific phrases, credible tools, measurable systems work, and keywords that align with source-backed experience.
Exploit direct UI actions when helpful, such as hovering a missing skill to add it or turn it into a bullet, but only if the result is truthful and not duplicative.

## Cover Letter
Use the Teal Cover Letter tab after the resume is attached to the job.

For each role:
1. Choose medium for straightforward roles and long for executive, highly strategic, or research-heavy roles.
2. Use Custom Prompt when available.
3. Ground the prompt in the company research brief, role diagnosis, proof hierarchy, and claim-safe metrics.
4. Edit the output so it sounds human, direct, and specific.
5. Export or copy the cover letter and save it as `{Company} - {Role} - Matt Dimock - Cover Letter`.
6. For viable roles, if the live application supports an optional cover letter, prepare one by default unless the user explicitly skips it.

## Salary Default
When a live application asks for desired salary and the posting does not state a range, default to `$150,000` unless the user has set a different target for the current search phase.

## Contacts Tracker
Track:
- recruiters
- hiring managers
- functional leaders
- employees
- warm connectors
- interviewers

For each contact, capture:
- relationship
- associated job
- likely priority
- outreach status
- follow-up date
- notes

## Notes
For each role, store:
- research brief summary
- likely reason role exists
- company pain points
- fit score and decision
- strongest story angles
- concerns
- outreach log
- application date
- follow-up dates
- interview notes
- compensation notes

## Interview Tracking
Use Teal interview tracking for:
- date
- format
- interviewer
- stage
- notes
- follow-up owner

Use Teal interview practice only after creating a role-specific interview pack. Compare any practice output against the Story Bank and claim-safety rules.

## Approval Rules
Ask before:
- submitting applications
- sending outreach
- sending email
- changing records in bulk
- sharing references
- accepting, declining, or negotiating externally
- answering sensitive voluntary self-ID fields unless the user has provided standing permission
- saving Teal summary or bullet edits to all resumes
- deleting skills from work history rather than toggling them off locally
