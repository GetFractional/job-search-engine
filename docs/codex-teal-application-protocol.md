# Codex Teal Application Protocol

## Purpose
Make the job-search system more consistent, higher quality, easier to automate, and less dependent on ad hoc prompting.

Optimize for:
- fastest path to a strong application
- truthful ATS optimization
- consistent asset quality
- low avoidable token burn
- automation readiness

## Working Goal
Get Matt to a role paying at least `$120,000` to `$150,000` as quickly as possible, while continuously prioritizing stronger upside opportunities when the comp package, fit, and logistics justify the extra effort.

## Core Rule
The live application page determines the asset plan.

Do not start with resume tinkering in isolation when the application flow can answer these questions first:
- Is a resume required?
- Is a cover letter accepted?
- Are there screening questions that need research support?
- Are there extra fields that change strategy, such as referrals, compensation, work authorization, or portfolio links?

## Live Viability Gate
Before a role can become "next best" or enter deep application work, the live posting or live application page must clear the logistics gate.

Check for:
- actual remote versus hybrid status
- hub-radius or metro-limited remote requirements
- office attendance expectations
- relocation or geography constraints
- work authorization or sponsorship blockers
- compensation details that materially change viability

If any of those create a hard mismatch, stop. Do not build assets just because Teal excitement, LinkedIn labels, or stale tracker metadata made the role look strong.

## Default Application Algorithm
1. Open the Teal job record and confirm the saved source is still live.
2. Open the live posting or live application page immediately after fit clears the basic effort gate.
3. Run the live viability gate before any deep work.
4. Record:
   - required assets
   - useful optional assets
   - screening questions
   - blocking unknowns
5. Run role research only deep enough to support those assets and questions.
6. Build or refine the Teal resume.
7. Build the cover letter when the form accepts one and the role is viable.
8. Prepare application answers.
9. Run final QA across the full package.
10. Fill the form.
11. Hold submission for approval, unless the operating policy is later changed.

## Continuous Improvement Loop
Every run should improve the protocol, not just execute it.

Before closing a job-search turn:
- estimate tokens used in the turn
- name the main token drivers
- record the most important new learnings from the run
- state what will change in the protocol because of those learnings
- make the change immediately when it is a safe workflow, skill, or doc update

When updating docs or skills:
- replace superseded guidance instead of stacking duplicate rules
- remove or rewrite stale guidance when current evidence invalidates it
- prefer fewer clearer rules over additive clutter

## Effort Gates
Use this ladder before doing expensive work:

| Fit band | Action |
|---|---|
| 85 to 100 | Full application pack, fast priority |
| 75 to 84 | Full application pack |
| 65 to 74 | Selective, usually still worth a lean pack if comp and logistics work |
| 50 to 64 | Low-effort path or archive |
| Under 50 | Pass |

## Asset Rules
### Resume
- Use Job Matcher and Analyzer as gap tools, not as the goal.
- Put the most important truthful JD terms into the title, summary, and selected recent bullets first.
- Use Skills & Interests to broaden reflected coverage, not to hide a weak summary.
- Treat redundancy as failure. If two bullets say nearly the same thing, keep the stronger one and reclaim the slot.
- If categorized skills are active, the resume must not also ship with an uncategorized top skill row.
- Use one canonical term per concept within a resume, for example `GA4` or `Google Analytics 4`, not both.
- Keep skill categories mutually exclusive where practical so the taxonomy reads cleanly and does not repeat the same concept in two places.

### Cover Letter
- If the live form supports a cover letter and the role is viable, create one by default.
- Keep it short, specific, calm, and role-diagnostic.
- Use 1 to 2 source-backed proof points only.
- Do not force a referral or name-drop a weak connection.

### Application Answers
- Prepare answers after the live form is known.
- Keep a reusable answer library, but always adapt to the role.
- Prefer manual, source-backed contact entry over browser autofill when autofill suggests stale addresses, outdated profiles, or mismatched location history.
- When compensation is not listed, use `$150,000`.
- If the posted range does not reach `$120,000`, keep the minimum at `$150,000`.
- Fill safe pre-submit application questions by default when the user has provided standing facts, including sponsorship, veteran status, ethnicity, race, disability, and government-clearance questions. Stop only at submission.

## Asset Naming
Use one strict local naming standard before upload or delivery:
- Resume: `{Company} - {Role} - Matt Dimock - Resume`
- Cover Letter: `{Company} - {Role} - Matt Dimock - Cover Letter`
- Application brief folder: `{company-slug}-{role-slug}`

Do not upload generic exports such as `{Role} at {Company}.pdf` when a correctly named local file can be produced first.

## Teal UX Heuristics
- In `Skills & Interests`, prefer checkbox toggles over delete actions when cleaning or deduping skills. Delete actions can remove the skill from work history across all resumes.
- If Teal exposes both uncategorized chips and categorized skills, turn the uncategorized chips off locally before export.
- Normalize concept naming before export, including items like `Systems Thinking` versus `Systems Thinker`, so the taxonomy reads like one deliberate system.
- Prefer the fastest truthful action inside Teal.
- Reuse selected existing bullets before drafting new ones.
- When Job Matcher exposes direct actions for missing skills, such as adding the skill or creating a bullet, use those only if they improve truthful coverage without creating redundancy.
- Treat Teal shared content carefully. A summary or bullet edit may affect multiple resumes.
- Keep Chrome tab count lean. Close tabs opened for failed roles, duplicate sources, and finished research paths once they are no longer needed.

## QA Gate
Do not call a package ready until all three assets pass:
- Resume
- Cover letter, when used
- Prepared application answers

Score each asset on:
- claim safety
- ATS clarity
- mandate fit
- relevance of proof
- redundancy control
- tone quality

Minimum standard:
- no unsupported claims
- no duplicate proof lines
- one selected bullet per proof cluster unless the second bullet adds clearly different scope, metric, tool, or business outcome
- no cryptic metrics
- no AI-sounding phrasing
- role fit obvious in the first screen

## Token And Model Policy
### Quick
- Use for batch search, first-pass triage, saved-job scoring.
- Default model: `gpt-5.4-mini`
- Reasoning: low or medium

### Standard
- Use for one viable application.
- Default model: `gpt-5.4`
- Reasoning: medium

### Deep
- Use for final-positioning problems, interview prep, high-stakes roles, or workflow redesign.
- Default model: `GPT-5.5`
- Reasoning: medium or high

### Cost controls
- inspect the live application before deep drafting
- batch triage before company research
- avoid full-source reloads when the source map is enough
- reserve high reasoning for ambiguity, not volume

## Automation Roadmap
### Phase 1, structured semi-automation
- Find and rank top jobs not already in Teal
- Open Teal and bookmark or create records
- Score and prioritize
- Build assets
- Fill forms
- Pause only at submission

### Phase 2, governed submission automation
- Add standing rules for safe defaults
- Add stricter QA scoring
- Auto-submit only when:
  - fit clears threshold
  - comp clears threshold
  - all assets pass QA
  - no sensitive self-ID is required
  - no blocker questions remain

### Phase 3, continuous pipeline engine
- Fresh top-10 target list generated on cadence
- Auto-triage against existing Job Tracker
- Auto-build packs for highest-priority roles
- Auto-fill applications
- Queue only edge cases for review

## Prompt Recipes
### Daily pipeline
`Find the best 10 new jobs for me that are not already in Teal, rank them by priority, exclude roles with obvious live logistics blockers when visible, bookmark the strong ones, and prepare the top 3 for application-pack work. Use Quick mode first, then Standard mode only for the finalists.`

### Next-best role
`Use Teal to identify the next best viable role for me to apply to, run the live viability gate first, inspect the live application, then build the full application pack in the right order.`

### Full application
`Apply to the next best job for me using the Codex Teal Application Protocol. Run the live viability gate first, inspect the live form, create every useful asset it supports, run final QA, fill the application, and stop before submission.`

### Workflow audit
`Audit the current job-search workflow, identify the top 5 quality or efficiency failures, patch the relevant docs and skills, and apply the improved process to the active role.`

## What To Keep Learning
- which Teal UI actions save the most time
- which categories of missing skills are usually noise
- which cover letters actually add value
- which role lanes convert best by interview rate
- where shared-content edits create hidden risk

## Success Metrics
- applications submitted
- interviews per application
- time from role discovery to ready-to-submit pack
- percent of viable applications with full asset pack
- percent of applications passing QA on first pass
- strongest-converting role lanes
