---
name: job-search-scenarios
description: Route Matt's recurring job-search starting scenarios through the correct Teal-centered workflow. Use when the user asks Codex to find jobs, score jobs, triage saved Teal jobs, apply to a specific job, prepare a resume or cover letter through Teal, update Teal job records, use the Teal Chrome extension, or operate Google Chrome for job-search work.
---

# Job Search Scenarios

## Purpose
Use this as the first skill for job-search execution. It routes the request, enforces Chrome + Teal workflow discipline, and calls the narrower skills only after the scenario is clear.

## Required Sources
1. `AGENTS.md`
2. `docs/teal-workflow.md`
3. `docs/job-search-continuous-improvement.md`
4. `references/scenario-workflows.md`
5. Task-specific skills named by the scenario

## Browser Rule
Use Matt's logged-in Google Chrome browser for Teal, LinkedIn, job boards, company career sites, and applications. Prefer visible UI interaction through Chrome over in-app browser automation when login, Cloudflare, bot checks, or Teal extension behavior matter.

On Windows, use the Codex Chrome plugin path for job-search browser work. Do not use isolated/headless Playwright for Teal, LinkedIn, job boards, or application forms that depend on Matt's logged-in profile, Cloudflare trust, or the Teal Chrome extension. If Chrome plugin communication fails, diagnose Chrome, the Codex Chrome Extension, and the native host before proceeding; stop rather than switching to an isolated browser.

Before declaring live Chrome unavailable, use `job-search-chrome-teal-recovery`. A green bridge script is not sufficient; the thread must attempt the Chrome extension runtime probe with `agent.browsers.get("extension")`, `browser.user.openTabs()`, and `browser.user.claimTab(...)`.

If the runtime probe can list `Chrome` as an extension backend and `browser.user.openTabs()` returns visible tabs, do not report "Chrome unavailable." Classify later failures as one of: stale/locked Teal tab, wrong browser surface, Teal UI readability/navigation failure, text-entry failure, upload failure, login/security challenge, or application-site failure.

If an existing Teal tab cannot be claimed because it belongs to another browser session, open a fresh Chrome-extension-backed Teal tab and continue from a direct route. If Chrome-backed Teal loads but the tracker or resume pages are unreadable after slow scoped navigation and one fresh tab attempt, stop with the exact blocker and ask for a screenshot, direct Teal record URL, or pasted JD. Do not rerun repair loops or guess from memory.

Use `docs/teal-ui-navigation.md` for the current Teal route map and slow-mode guidance. The map applies to both Mac and Windows Chrome sessions unless a section explicitly says Windows.

Use `mattdim805@gmail.com` as the job-search Google identity for Gmail, Google Calendar, and Google Drive tasks. Do not use work/client Google accounts for personal job-search operations unless Matt explicitly instructs it.

Act like a careful human operator:
- open direct, relevant pages only
- avoid rapid repeated clicks, reload loops, scraping loops, or guessed URL grids
- do not solve CAPTCHA or challenge prompts
- stop before submitting applications, outreach, references, or sensitive data

## Posting Freshness Gate
- Treat posting age as a gating signal during search, scoring, and apply workflows.
- Prefer roles posted within the last 30 days.
- If a role is older than 30 days, mark it stale-risk unless there is strong evidence of recent hiring activity.
- If a role is older than 60 days, default to pass, archive, or low-priority save unless the user explicitly wants a strategic exception.
- A listing still being visible does not by itself prove the role is actively hiring.
- Include posting age, freshness evidence, and stale-risk in the recommendation.

## Resume Guardrails
For resume and cover-letter work:
- keep company-specific metrics attached to the correct brand or employer context
- do not place detached performance bullets under unrelated entities such as `Get Fractional` when the proof belongs to another brand
- if cross-client consulting proof is used, either name the brand when appropriate or rewrite the bullet at the consulting-layer outcome without borrowing isolated client metrics out of context
- remove redundant lines that restate the same positioning, especially repeated consulting-summary lines or overlapping summary bullets
- when tenure is mentioned, calculate professional marketing experience from Matt's National Positions start year in 2007; as of 2026 use `19 years of professional marketing experience` when a calendar-year count is acceptable, or `18+ years` if exact start-month precision is required
- do not default external resume summaries to `in marketing since 2007` when the target asset expects a years-of-experience claim
- never use em dashes in final assets
- avoid AI-sounding phrasing, hype, or theatrical self-branding

## Scenario Router
For every request, classify it first:

1. **Find jobs**: Use Teal Job Search, saved searches, Google Chrome, and the Teal Chrome extension. Shortlist roles, bookmark strong roles, and set Excitement from fit score.
2. **Score saved jobs**: Open Teal Job Tracker, find jobs with missing Excitement, read the JD, score each role, update Excitement, and add concise notes.
3. **Apply to a specific job**: Open the Teal job record, verify the saved source is active, research the company and role, create or optimize a Teal resume, inspect the live application flow early, prepare only the assets that flow actually needs, prepare application answers, download named files, present final assets/copy/destination for approval, and stop before final submission unless the user explicitly approves that exact submission.
4. **Prepare assets only**: Use the same research, resume, cover-letter, and QA path, but do not change Teal unless the user asked for it.
5. **Pipeline governance**: Update statuses, notes, next actions, follow-up dates, and contacts without drafting assets unless needed.

For "apply to the next best Teal job", own target selection only after the Job Tracker is readable in live Chrome. Use Table view and status filters to build the candidate set. Exclude `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, `Closed`, and any role already showing a submitted application date. Treat Home `Priorities` as suggestion-only, not as the final source of truth for target selection. If the tracker is blocked, ask for a tracker screenshot, direct Teal record URL, or pasted JD instead of guessing.

For next-best target selection, reject wrapper or aggregator ambiguity before asset work:
- if the Teal company name, JD employer, and source employer do not clearly match, stop and resolve the canonical employer first
- if the record is an aggregator wrapper such as `Jobgether` and the underlying employer is someone else such as `Housecall Pro`, the canonical employer record wins
- if the wrapper source is dead, redirected, duplicated, or no longer maps cleanly to a live canonical opening, do not continue asset work on that record
- do not reopen or continue any role that has already been applied to, even if another wrapper record for the same underlying job still appears in Teal

## Skill Order
Use the smallest complete chain for the scenario.

Find jobs:
1. `job-search-chrome-teal-recovery`
2. `tealhq-workflow`
3. `role-lane-classification`
4. `fit-scoring`
5. `company-research` only for high-fit finalists or ambiguous companies

Score saved jobs:
1. `job-search-chrome-teal-recovery`
2. `tealhq-workflow`
3. `role-intake`
4. `role-lane-classification`
5. `fit-scoring`

Apply to a job:
1. `job-search-chrome-teal-recovery`
2. `tealhq-workflow`
3. `role-intake`
4. `role-lane-classification`
5. `company-research`
6. `hiring-manager-recruiter-research`
7. `market-competition`
8. `fit-scoring`
9. `resume-strategy`
10. `resume-drafting`
11. `qa-fact-check`
12. `cover-letter`
13. `application-answer`
14. `compensation-offer-strategy` when compensation questions appear

## Teal Execution Gates
For application work, do not finish until these are handled or explicitly blocked:
- Teal job record opened in Chrome
- correct browser surface verified before role selection or mutation with the Chrome extension backend, live user tabs, and a Teal claim/open check
- Chrome/Teal failure classified before stopping: local bridge failure, thread binding failure, wrong browser surface, stale/locked tab, Teal readability/navigation failure, text-entry failure, upload failure, login/security challenge, or application-site failure
- stale/locked Teal tabs handled by opening a fresh Chrome-extension-backed Teal tab before declaring a blocker
- Teal tracker/readability blockers handled with slow scoped navigation plus one fresh-tab attempt, then a screenshot/direct-record/JD fallback
- next-best target selected from readable tracker evidence, not memory
- next-best target confirmed not already applied, not in another terminal stage, and not a duplicate wrapper of an already-applied canonical role
- Home `Priorities` used only as a lead list; final selection confirmed in Job Tracker Table view with visible status and date fields
- Teal company, source employer, and JD employer aligned to one canonical target before resume or application work begins
- job source verified active
- Excitement score set from fit score
- job moved to Applying only after active asset work begins and the role still clears the pursue bar
- research brief completed before final assets
- live application flow inspected before optional asset work such as cover-letter drafting
- Teal Resumes tab used
- resume opened in Resume Builder
- Job Matcher reviewed for missing hard and soft skills
- Analyzer reviewed when visible, with a best-effort plan to improve truthful Match and Analyzer scores before final export
- if Job Matcher, Analyzer, or Teal Resume Builder cannot be reached, stop with the blocker unless the user explicitly approves a local-only fallback
- existing Teal bullets and summary lines reused first
- bullet and skill checkboxes used for per-job inclusion before editing shared library content
- durable reusable bullets or skills added when a truthful gap is missing from the library
- `update in all resumes` or global-update options left unchecked unless Matt explicitly approves a global library change
- proposed shared-bullet or summary edits surfaced for approval before mutating shared library content unless direct mutation was explicitly requested
- Content Editor updated naturally, without stuffing
- missing truthful keywords grouped into hard skills, soft skills, business terms, and platform/tool terms before editing
- duplicate or near-duplicate bullets removed before final export
- brand-specific metrics checked for context fit before final export
- Skills & Interests toggled per role and updated only with high-value truthful skills
- no `Delete Skill`, bullet deletion, or shared-library cleanup unless Matt explicitly approves it
- cover letter created through Teal Cover Letter with a custom prompt when the application flow supports it, requires it, or the user explicitly wants it prepared anyway
- final resume length checked in Teal preview/export, targeting strong two-page use without spilling to page 3
- any local reformatting checked to remove file path footers, browser print headers/footers, timestamps, and URLs
- resume and cover letter exported or blocked by Teal limitations
- files named `{Company} - {Role} - Matt Dimock - Resume/Cover Letter`
- if Teal exports a generic filename, the local file is renamed to the required format before upload or delivery
- filenames checked before upload: no `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels
- if the application has a cover-letter slot, a tailored one-page Teal-designed cover letter is created and named canonically unless Matt explicitly opts out
- interview pack created before submission readiness for roles that clear the pursue bar
- attachment upload preflight completed when the application requires files; if Chrome reports `Not allowed`, verify `Allow access to file URLs` for the Codex extension and restart/retry before using any fallback
- application answers prepared
- final submission held for explicit user approval
- Teal status moved to Applied only after user-approved submission is completed and confirmation is visible
- after submission, Teal post-submit hygiene completed: Applied status, applied date, Excitement from fit score, submitted salary/comp answer, exact submitted asset filenames, follow-up target, and application ledger entry

## Excitement Mapping
Set Teal Excitement from the final fit score:
- 90-100: 5 stars
- 75-89: 4 stars
- 60-74: 3 stars
- 45-59: 2 stars
- 0-44: 1 star

Use judgment for strategic exceptions, but record the reason in Teal notes.

## Default Candidate Facts
Use these only when the form asks and the user has not overridden them:
- authorized to work in the U.S.: yes
- needs sponsorship now or later: no
- current state: Tennessee
- relocation: open for the right opportunity, paid relocation preferred
- SMS consent for employer follow-up about the application: yes
- valid passport: yes
- Canada travel for work: yes, with prior business-travel history to Canada
- family or relatives at target employer: no
- previous employment at target employer: no unless evidence says otherwise
- gender/race: white male only for voluntary self-ID when the user has approved answering
- pronouns: he/him only when asked
- veteran status: not a veteran

## Output
Always end with:
- what was updated in Teal
- asset status
- Teal optimizer status, including Job Matcher, Analyzer, and two-page preview/export result
- bullet/skill library actions: toggled, added, edited, globally updated with approval, or blocked
- workflow improvement note: bottleneck, reusable item, search rule, reusable answer/asset, or proposed docs/skills update
- post-submit hygiene status when an application was submitted
- downloaded file paths if any
- estimated tokens used in the response
- unanswered questions or approval gates
- how to verify
- risks and rollback

When listing roles or recommendations, also include:
- posting age if known
- freshness evidence or uncertainty
- stale-risk assessment

## Safety
Do not submit applications, send messages, share references, answer sensitive voluntary self-ID questions, or accept/decline/negotiate externally without explicit approval.
