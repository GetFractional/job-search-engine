# TealHQ Workflow

## Role Of Teal
TealHQ is the job-search command center. Codex supports analysis, drafting, QA, and strategy. Do not invent a Teal API or bypass Teal's UI, permissions, login, CAPTCHA, or platform restrictions.

Use Matt's logged-in Google Chrome browser for Teal, LinkedIn, job boards, company career sites, and application forms. Prefer Chrome over in-app browser automation when login state, Cloudflare, challenge prompts, or the Teal Chrome extension matter.

Operate like a human: use visible navigation, keep actions paced, avoid repeated reload/click loops, do not brute-force guessed URLs, and stop at CAPTCHA, Cloudflare, security, login, or permission challenges.

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

## Codex Search Trigger
When the user says "find jobs":
1. Open Google Chrome and use Teal Job Search, saved searches, relevant job boards, or company career pages.
2. Bookmark promising roles with the Teal Chrome extension when Codex is operating the browser with approval.
3. Confirm each bookmarked role includes title, company, location, URL, compensation if available, and full JD.
4. When the live posting clearly exposes a hard logistics blocker, such as a hidden hybrid requirement or a hub-limited remote requirement, treat that as a priority disqualifier instead of trusting saved metadata.
5. Triage Teal-saved roles by lane, score, risks, and next action.
6. Set Teal Excitement from score.

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

After bookmarking:
- confirm title, company, location, and URL
- confirm the full JD is saved
- paste the full JD manually if auto-capture fails
- add compensation if available
- add role lane and quick fit score in notes

## Codex Application Trigger
When the user says "apply to this job":
1. Open the Teal job record in Google Chrome.
2. Verify the source link is still active. If the saved source blocks or redirects, try one direct company-hosted posting path, then stop with uncertainty if needed.
3. Before deep research or asset work, run a live viability check against the company-hosted posting or application page. Confirm actual remote versus hybrid status, hub-radius restrictions, office attendance expectations, relocation requirements, sponsorship constraints, and any other hard logistics blockers.
4. If the role fails the live viability check, do not continue into resume or cover-letter work. Downgrade the role in Teal notes or scoring and route to the next viable role.
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
18. Use the relevant local skills, not just Teal mechanics, when the workflow calls for them. Minimum application stack usually includes `role-intake`, `role-lane-classification`, `company-research`, `resume-strategy`, `resume-drafting`, `qa-fact-check`, and `application-answer`.
19. Aim to fill two full pages without spilling onto a third.
20. If the live form accepts an optional cover letter and the role is viable, prepare one by default with a custom prompt.
21. Export the resume and cover letter as separate files.
22. Rename exported files to the strict local naming standard before upload: `{Company} - {Role} - Matt Dimock - Resume` and `{Company} - {Role} - Matt Dimock - Cover Letter`.
23. Prepare application answers.
24. Prefer manual, source-backed contact entry on live forms when browser autofill suggests stale addresses, outdated profiles, or mismatched location history.
25. Fill safe pre-submit application questions by default when the user has provided standing facts, including veteran, disability, ethnicity, race, and government-clearance questions.
26. Run one final QA pass across resume, cover letter, and prepared application answers before asking for submission approval.
27. Close stale or no-longer-needed Chrome tabs opened during the workflow.
28. End the run with estimated token usage, main cost drivers, new learnings, and the protocol changes made from those learnings.
29. Stop before final submission until the user approves the exact action and destination.

## Job Tracker Fields
Maintain:
- status
- role lane
- fit score
- pursue classification
- compensation range
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

## Resume Builder
Use one comprehensive master resume in Teal as the profile library. Do not submit the master directly.

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
