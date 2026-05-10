---
name: job-search-scenarios
description: Route Matt's recurring job-search starting scenarios through the correct Teal-centered workflow. Use when the user asks Codex to find jobs, score jobs, triage saved Teal jobs, apply to a specific job, prepare a resume or cover letter through Teal, update Teal job records, use the Teal Chrome extension, or operate Google Chrome for job-search work.
---

# Job Search Scenarios

## Purpose
Use this as the first skill for job-search execution. It routes the request from normal language, enforces Chrome + Teal workflow discipline, and calls the narrower skills only after the scenario is clear.

Treat the named downstream skills as required operating steps, not optional suggestions, whenever the scenario calls for them. If stronger results require more than one relevant skill, use the smallest complete stack rather than stopping at the first plausible tool.

## Required Sources
1. `AGENTS.md`
2. `docs/job-search-protocol-index.md`
3. `docs/codex-teal-application-protocol.md`
4. `docs/teal-workflow.md`
5. `docs/job-search-protocol-benchmark.md`
6. `references/scenario-workflows.md`
7. Task-specific skills named by the scenario

## Protocol Routing Rule
Use `docs/job-search-protocol-index.md` as the compact routing layer. Do not restate the full protocol in each response. Pull narrow skills only when the scenario requires them, and use the benchmark only for meaningful Standard or Deep runs.

Default to `gpt-5.4-mini` with medium reasoning for Teal job search and first-pass saved-job scoring. Use `GPT-5.5` with medium reasoning for application packs, final QA, interviews, compensation, and protocol repair. Do not recommend high reasoning for this Job Search protocol.

Use `GPT-5.5` with medium reasoning for Teal UI repair, protocol redesign, safe acceleration research, or diagnosing repeated browser failures. Routine search and routine Tracker maintenance should stay on `gpt-5.4-mini` with medium reasoning after the protocol is clear.

## Browser Rule
Use Matt's logged-in Google Chrome browser for Teal, LinkedIn, job boards, company career sites, and applications. Prefer visible UI interaction through Chrome over in-app browser automation when login, Cloudflare, bot checks, or Teal extension behavior matter.

Act like a careful human operator:
- open direct, relevant pages only
- avoid rapid repeated clicks, reload loops, scraping loops, or guessed URL grids
- do not solve CAPTCHA or challenge prompts
- stop before submitting applications, outreach, references, or sensitive data

## Resume Guardrails
For resume and cover-letter work:
- keep company-specific metrics attached to the correct brand or employer context
- do not place detached performance bullets under unrelated entities such as `Get Fractional` when the proof belongs to another brand
- if cross-client consulting proof is used, either name the brand when appropriate or rewrite the bullet at the consulting-layer outcome without borrowing isolated client metrics out of context
- remove redundant lines that restate the same positioning, especially repeated consulting-summary lines or overlapping summary bullets
- when tenure is mentioned, calculate from the Sep 2007 National Positions start date and use the current exact count, currently `18 years in marketing` as of May 7, 2026, never stale shorthand like `15+ years`
- make the summary explain role fit quickly and name relevant industries or business contexts when that helps the target reader decide fit
- do not use cryptic shorthand or low-context metrics such as `lifted H2 monthly revenue 39%`; rewrite in plain English with business context or leave it out
- never use em dashes in final assets
- avoid AI-sounding phrasing, hype, or theatrical self-branding

## Scenario Router
For every request, classify it first. The user should not need exact trigger wording.

1. **Find jobs**: Infer the full Teal search workflow from short prompts like `find 10 qualified jobs`. Use Teal Trackers baseline, save ledger, Teal Job Search, saved searches, Google Chrome, and the Teal Chrome extension. Keep Chrome lean by closing stale job tabs, duplicate source tabs, extension popups, and side panels that are not actively needed. Build the candidate queue in the ledger, evaluate one source posting tab at a time, verify active company or ATS postings before saving, reject hidden geo blockers early, score the role and prepare intended Excitement and notes before saving, save via Teal-native Save/Bookmark first when the role is inside Teal, use the extension for source-page roles, use Manual Add Job only as a last resort with full source JD captured first, confirm saves in Teal with full JD, populate structured salary fields when annual base salary is visible, and never count Latest Saved Jobs without ledger and record confirmation.
2. **Score saved jobs**: Open Teal Job Tracker, find jobs with missing Excitement, read the JD, check the live posting for hard logistics blockers when feasible, score each role, update Excitement, and add concise notes.
3. **Next best Teal job**: If the user asks what to apply to next or says similar natural language, open Teal Trackers, rank non-applied roles best to worst, verify each live posting before asset work, archive inactive roles, downgrade blocked roles, and only then continue into the application workflow for the first viable role.
4. **Apply to a specific job**: Open the Teal job record, verify the saved source is active, inspect the live application flow early, determine required assets, useful optional assets, and screening questions, then research the company and role, create or optimize a Teal resume, prepare the cover letter when the flow supports it and the role justifies it, prepare application answers, download named files, and stop before final submission unless the user explicitly approves that exact submission.
5. **Prepare assets only**: Use the same research, resume, cover-letter, and QA path, but do not change Teal unless the user asked for it.
6. **Pipeline governance**: Update statuses, notes, next actions, follow-up dates, and contacts without drafting assets unless needed.
7. **Update Teal records**: Use the canonical UI map and controlled-batch checklist in `docs/teal-workflow.md`. Use Tracker table inline edits for verified salary min, salary max, location, status, follow-up, deadline, and Excitement. Use the detail screen for source URL, full JD, notes, resumes, contacts, and brittle fields. Cap the first cleanup pass at 5 records, checkpoint the ledger, and update Date Posted only one record at a time after source verification.
8. **Speed up Teal**: Investigate visible UI features, extension behavior, and safe page-context DOM inspection. Do not bypass Cloudflare, CAPTCHA, login, permissions, rate limits, or private Teal endpoints.

## Skill Order
Use the smallest complete chain for the scenario.

Find jobs:
1. `tealhq-workflow`
2. `role-lane-classification`
3. `fit-scoring`
4. `company-research` only for high-fit finalists or ambiguous companies

Score saved jobs:
1. `tealhq-workflow`
2. `role-intake`
3. `role-lane-classification`
4. `fit-scoring`

Apply to a job:
1. `tealhq-workflow`
2. `role-intake`
3. `role-lane-classification`
4. `company-research`
5. `hiring-manager-recruiter-research`
6. `market-competition`
7. `fit-scoring`
8. `resume-strategy`
9. `/Users/mattdimock/.codex/skills/alen-sultanic/SKILL.md` when proof-backed positioning or conversion-oriented messaging will improve the summary, cover letter, or application answers
10. `resume-drafting`
11. `qa-fact-check`
12. `cover-letter`
13. `application-answer`
14. `compensation-offer-strategy` when compensation questions appear
15. `expert-team-orchestration` when the role spans multiple lenses such as lifecycle, CRM, customer journey, partnerships, operations, analytics, or leadership

## Mode Prompts
Use the versioned Quick, Standard, and Deep prompt templates in `docs/job-search-protocol-index.md` unless the user gives a more specific instruction.

## Teal Execution Gates
For application work, do not finish until these are handled or explicitly blocked:
- Teal job record opened in Chrome
- job source verified active from the browser-rendered source page, not a cached snippet or Teal metadata alone
- live viability gate passed before deep asset work
- browser-rendered source page showed real live job content and a usable apply path before status changes or asset work
- Excitement score set from fit score
- job moved to the correct stage, usually Applying once active asset work begins
- research brief completed before final assets
- live application flow inspected before deep asset work
- required assets, useful optional assets, and screening questions identified from the real form
- Teal Resumes tab used
- resume opened in Resume Builder
- Job Matcher reviewed for missing hard and soft skills
- Analyzer reviewed when visible, with a best-effort plan to improve truthful Match and Analyzer scores before final export
- summary updated to make mandate fit obvious and mention relevant industries or business contexts when useful
- `Skills & Interests` reorganized into role-specific categories, not left as a flat generic list
- existing Teal bullets and summary lines reused first
- proposed shared-bullet or summary edits surfaced for approval before mutating shared library content
- Content Editor updated naturally, without stuffing
- missing truthful keywords grouped into hard skills, soft skills, business terms, and platform/tool terms before editing
- reflected skills updated to showcase the highest-value truthful terms for that role before final export
- at least 24 truthful reflected skills selected across 5 to 6 categories, with a preferred target around 28 when the proof and layout support it
- adjacent strengths preserved when they reinforce Matt's real lane, especially reporting, workflow automation, operating cadence, AI-assisted execution, and tool fluency
- if the target company uses tools Matt has actually used, those tools are reflected naturally where they improve fit
- before saving any new bullet or summary line, compare it against nearby content and replace the weaker overlapping line instead of stacking two versions of the same idea
- duplicate or near-duplicate bullets removed before final export
- brand-specific metrics checked for context fit before final export
- Skills & Interests updated with high-value truthful skills
- two-page limit respected, while still using as much of the second page as the proof supports
- cover letter created by default for viable roles when the application flow supports it, unless the user explicitly skips it or the role is too weak to justify the extra work
- resume and cover letter exported or blocked by Teal limitations
- files named `{Company} - {Role} - Matt Dimock - Resume/Cover Letter`
- if Teal exports a generic filename, the local file is renamed to the required format before upload or delivery
- application answers prepared
- final resume, cover letter, and application answers QA pass completed before submission approval is requested
- final submission held for explicit user approval

## Find Jobs Gates
For search work, do not finish until these are handled or explicitly blocked:
- `gpt-5.4-mini` with medium reasoning used or recommended for Teal job search
- Teal Trackers opened and Bookmarked baseline recorded
- save ledger maintained with Candidate, Source, Geo, Fit, Salary min, Salary max, JD captured, Save attempt, Teal confirmed, and Decision
- candidate queue reviewed from fresh and relevant sources
- candidate queue kept in the ledger, not as a batch of open browser tabs
- exactly one source posting tab evaluated at a time, with the tab reused or closed before the next candidate
- each saved role verified on the company-hosted or ATS-hosted posting
- inactive, closed, expired, removed, generic-redirect, stale, or blocked roles rejected before save
- UK-only, London, EMEA-only, Europe-only, country-limited, state-limited, hub-limited, commuting-radius, hybrid, or relocation-required roles rejected early when Matt does not clearly fit
- quick lane and fit scoring completed before saving
- intended Teal Excitement and notes drafted before clicking Bookmark or Save
- save-path order followed: Teal Job Search or saved-search Save/Bookmark when the role is already inside Teal, then Teal Chrome extension from the live source posting, then Manual Add Job only as a last resort
- if extension fields are available before save, Excitement is set first, notes second, and Bookmark or Save third
- if extension fields are unavailable before save, the Teal Tracker record is opened immediately after save to complete Excitement, notes, salary fields, and full JD before counting
- Manual Add Job not used just because extension capture is flaky
- Manual Add Job used only after the full actual JD is captured from the live source posting
- no second manual record created until the first manual record is reopened and verified to contain the full Job Description or Original Job Description text
- each saved role confirmed as Bookmarked in Teal
- extension saves treated as Provisional until confirmed in Teal
- save labels used: Confirmed saved, Duplicate existing, Provisional, Delayed confirmed, Failed save, Rejected
- structured Minimum Salary and Maximum Salary fields populated when annual base salary is visible
- roles with posted salary ranges and family-supportive benefits prioritized when fit, mandate, and logistics are otherwise comparable
- visible benefits captured in notes when they affect the fit decision
- Excitement and notes updated for each saved role
- full actual JD captured for each counted role
- Latest Saved Jobs or Tracker counts not used as proof of new saves without ledger and record confirmation
- active-status evidence included in notes or output
- requested count treated as qualified confirmed saves, not reviewed candidates
- search expanded across title aliases, adjacent lanes, saved searches, job boards, and company career pages before returning fewer than the target
- pivot thresholds used after 5 candidates in one title family with 0 qualified saves, 2 repeated geo blockers, 10 minutes without a qualified save, 2 ambiguous extension events, or poor-quality result skew
- non-blocking progress update sent every 3 confirmed saves or every 10 candidates reviewed
- browser-loop fail-safe used after 2 confirmed saves, 12 candidates reviewed, 8 minutes of browser work, or 40 browser actions
- user not asked to respond after routine progress updates
- Teal, extension, login, or source-site blockers reported immediately

## Update Teal Records Gates
For controlled Tracker cleanup, do not finish until these are handled or explicitly blocked:
- canonical UI feature map in `docs/teal-workflow.md` used
- cleanup scope limited to source-backed maintenance fields
- first pass capped at 5 records before a ledger checkpoint
- ledger includes record, field, before value, source evidence, after value, verification method, rollback note, and decision
- Tracker table used for verified salary min, salary max, location, status, follow-up, deadline, and Excitement
- detail screen used for source URL, full JD, notes, resumes, contacts, and evidence-bearing or brittle fields
- Date Posted not batched
- Intercom or floating-widget obstructions handled by scrolling or closing the widget, not guessing through it
- Compensation analysis used only after reconciliation with Tracker and live source evidence
- salary conflicts across source, currency, country, or range marked for manual re-verification before application work
- browser or auth blockers reported instead of retried silently

Do not save a weak or inactive role just to reach a requested count. Keep searching instead. If the target cannot be met, explain exactly which sources were searched, how many candidates were reviewed, why roles failed, and what expansion path should be tried next.

## Search Expansion Rule
Find the strongest roles across Matt's full lane map, not only exact title matches.

Use multiple title families:
- Revenue Operations, Growth Operations, GTM Operations, RevOps, Sales Operations, Revenue Enablement with systems ownership
- Lifecycle Marketing, CRM, Retention, Customer Journey, Engagement, Nurture, Marketing Automation
- Growth Marketing, Revenue Marketing, Demand Generation, Funnel Optimization
- Ecommerce Growth, DTC Growth, CRO, Owned-Channel Growth, Conversion Optimization
- Selective Head of Marketing or VP Marketing when performance, lifecycle, RevOps, analytics, ecommerce, or systems ownership is central

Do not force equal lane quotas. Do rotate through adjacent lanes before declaring the market weak, and prefer high-fit roles with different names over lower-fit roles with perfect title matches.

## Live Viability Gate
Before a role can be treated as viable, next best, or application-worthy, check the live posting or live application page for hard disqualifiers that Teal or LinkedIn metadata may hide.

Treat these as hard blockers unless the user explicitly says otherwise:
- required hybrid or in-office schedule outside Matt's target footprint
- remote roles limited to specific hubs, commuting radii, or target metros that Matt does not match
- relocation or office-presence requirements that materially conflict with current search preferences
- sponsorship, work authorization, or geography rules that Matt does not satisfy
- compensation realities that fall below the acceptable floor once the real posting is confirmed

If a role fails this gate:
- do not call it the next best role
- do not start deep research or asset drafting
- archive it if inactive, closed, expired, removed, or no longer accepting applications
- downgrade the score or note the blocker in Teal if active but low fit or blocked
- route immediately to the next viable role

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
- family or relatives at target employer: no
- previous employment at target employer: no unless evidence says otherwise
- gender/race: white male only for voluntary self-ID when the user has approved answering
- pronouns: he/him only when asked
- veteran status: not a veteran
- disability status: no
- ethnicity: not Hispanic or Latino
- race: White
- government clearance: no

## Output
Always end with:
- what was updated in Teal
- asset status
- downloaded file paths if any
- estimated tokens used in the response
- main token drivers
- new learnings and insights
- fixes applied to the protocol from those learnings
- benchmark row or benchmark-blocker note for Standard and Deep runs
- unanswered questions or approval gates
- how to verify
- risks and rollback

## Safety
Do not submit applications, send messages, share references, answer sensitive voluntary self-ID questions, or accept/decline/negotiate externally without explicit approval.
