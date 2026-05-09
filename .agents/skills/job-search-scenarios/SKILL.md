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
2. `docs/teal-workflow.md`
3. `references/scenario-workflows.md`
4. Task-specific skills named by the scenario

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

1. **Find jobs**: Use Teal Job Search, saved searches, Google Chrome, and the Teal Chrome extension. Shortlist roles, bookmark strong roles, and set Excitement from fit score.
2. **Score saved jobs**: Open Teal Job Tracker, find jobs with missing Excitement, read the JD, check the live posting for hard logistics blockers when feasible, score each role, update Excitement, and add concise notes.
3. **Next best Teal job**: If the user asks what to apply to next or says similar natural language, open Teal, find the best already-saved role that is not yet applied, run the live viability gate, and only then continue into the application workflow.
4. **Apply to a specific job**: Open the Teal job record, verify the saved source is active, inspect the live application flow early, determine required assets, useful optional assets, and screening questions, then research the company and role, create or optimize a Teal resume, prepare the cover letter when the flow supports it and the role justifies it, prepare application answers, download named files, and stop before final submission unless the user explicitly approves that exact submission.
5. **Prepare assets only**: Use the same research, resume, cover-letter, and QA path, but do not change Teal unless the user asked for it.
6. **Pipeline governance**: Update statuses, notes, next actions, follow-up dates, and contacts without drafting assets unless needed.

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

## Teal Execution Gates
For application work, do not finish until these are handled or explicitly blocked:
- Teal job record opened in Chrome
- job source verified active
- live viability gate passed before deep asset work
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
- downgrade the score or note the blocker in Teal
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

## Output
Always end with:
- what was updated in Teal
- asset status
- downloaded file paths if any
- estimated tokens used in the response
- unanswered questions or approval gates
- how to verify
- risks and rollback

## Safety
Do not submit applications, send messages, share references, answer sensitive voluntary self-ID questions, or accept/decline/negotiate externally without explicit approval.
