# Job Search Codex Instructions

## Objective
Build and operate Way Ahead as a trustworthy multi-user Career OS that helps each member find, evaluate, pursue, and win a better job with less wasted effort. Use Matt's real search as founder dogfooding of the same member journey, while preserving exact approval gates for every external action.

## Way Ahead Operating Override (updated 2026-07-29)

- Way Ahead is the multi-user Career OS. Matt's real search is founder dogfooding of the same member product, not a separate customer type, owner-only workflow, or evidence of general efficacy.
- Use adaptive, evidence-based work in progress. Activate the smallest set of result-changing workstreams justified by delivery readiness, bounded dependencies, non-overlapping write scopes, review capacity, authority, cost, rollback, and stop conditions. Do not impose a permanent numeric initiative cap.
- Keep one accountable integrator, one DRI per workstream, and one writer per overlapping surface. Independent reviewers stay read-only critics.
- Terry is the authorized independent early tester, not staff, an operator, or efficacy proof. His test requires self-registration, explicit consent, isolated tenant data, bounded tasks, and independent usability and trust feedback. This does not authorize broader recruitment.
- Do not read, write, bookmark, score, stage, or otherwise operate Matt's job search in TealHQ. Teal may be inspected only as a competitor for product research, with no account mutation.
- Store current roles, sources, analysis, profile evidence, application assets, exact form answers, approval state, and receipts in Way Ahead or its repository-backed evidence until Way Ahead exposes the corresponding production surface.
- Use canonical employer sources and Matt's approved source hierarchy directly. Do not make Way Ahead dependent on Teal exports, scores, records, or workflow availability.
- Stop before outreach, form population, file upload, or submission unless Matt approves that exact external action. Package approval and application submission are separate gates.
- This section supersedes every lower Teal-operational instruction in this file and in repo skills. Retain those older sections only as historical competitor and migration context until the next full workflow rewrite.

## Account Scope
- Use `mattdim805@gmail.com` as Matt's legitimate job-search Google identity for Gmail, Google Calendar, and Google Drive work tied to applications, recruiters, interviews, and job-search documents.
- Use the logged-in personal Chrome profile for LinkedIn, Gmail/Google, job boards, company career sites, and application forms when authenticated access is needed.
- Do not use `matt@getfractional.co` or any client/work Google account for personal job-search workflows unless Matt explicitly directs it for a specific task.
- TealHQ is competitor research only. Do not use Matt's Teal account as an operating surface.

## Workspace Consistency
- Before non-trivial repo work in this workspace, run the repo-local workspace prep command:
  - Windows: `powershell -ExecutionPolicy Bypass -File .\scripts\prepare-job-search-workspace.ps1 -SyncGitIfClean`
  - macOS/Linux: `./scripts/prepare-job-search-workspace.sh --sync-git-if-clean`
- If tracked local changes should not be pulled over, run the same command without the git-sync flag. It must still install hooks, sync skills, and verify mirrors.
- Treat the tracked repo as the source of truth for workflow rules, docs, and safeguards.
- Treat `.agents/skills/` as the source of truth for this repo's managed skills.
- Treat `~/.codex/skills/` and `~/.agents/skills/` as mirrored execution directories, not authoring surfaces for this repo.
- Repo-managed git hooks in `.githooks/` must remain enabled through `core.hooksPath = .githooks` so checkout, merge, and rewrite events automatically re-sync managed skills.
- For live product or founder-dogfooding execution, do not equate "not on main" with stale by default. Run the readiness/prep gate and verify the current branch contains latest `origin/main`, preserves unrelated work, and has mirrored skills. If it fails, repair or stop before production or external work. If it passes, the branch is operationally current even when its name is not `main`.

## Required Source Hierarchy
Use these sources in this order:

1. `source-files/01_matt_dimock_canonical_profile.md`
2. `source-files/02_metrics_ledger.md`
3. `source-files/03_role_lane_glossary.md`
4. `source-files/04_story_bank.md`
5. `source-files/05_outreach_templates.md`
6. `source-files/06_interview_pack_template.md`
7. `source-files/07_linked_in_optimization_brief.md`
8. `source-files/08_reference_sheet.md`, restricted, references only
9. Supporting materials only when useful:
   - `source-files/Wealth Dynamics Report - Matt Dimock - 2025.pdf`
   - older LinkedIn PDF/DOCX snapshots only for historical comparison, not current optimization
   - HawkScout outreach DOCX files only if the user explicitly asks about acquisition/founder outreach

If a file conflicts with the Canonical Profile or Metrics Ledger, use the safer source and flag the conflict.

## Default Positioning
Matt is a systems-driven growth and revenue operator who builds the infrastructure behind measurable growth.
When a summary or headline references tenure, calculate professional marketing experience from Matt's National Positions start year in 2007. As of 2026, use `19 years of professional marketing experience` only when a calendar-year count is acceptable; if exact month precision matters and the National Positions start month is not available, use `18+ years of professional marketing experience`. Do not use stale shorthand like `15+ years`, and do not default external assets to `in marketing since 2007` when a years-of-experience claim is expected.

Default fit emphasis:
- Revenue Operations
- Growth Operations
- GTM Operations
- Lifecycle, CRM, and retention
- Ecommerce and DTC growth
- Growth and revenue marketing
- Analytics, reporting, funnel visibility, CRO, SEO, owned-channel growth
- AI-assisted workflow design, automation, operating cadence, and cross-functional execution

Avoid over-positioning Matt for pure brand, PR, awareness-only leadership, pure product marketing, highly political environments, chaotic pre-PMF startups, merchandising-heavy ecommerce without growth systems ownership, or paid-media-only channel roles.

## Compensation Rules
- Ideal target: `$180k+` base or strong total package.
- Preferred minimum: `$150k+` with family benefits.
- Fastest acceptable floor: `$120k` base or total comp only if the role is strategically strong, low-friction, or a compelling bridge.
- Below `$120k`: usually pass unless there is exceptional short-term bridge value, equity upside, or unusually strong strategic value.
- Family benefits matter. Bonus, equity, 401(k), healthcare, and childcare support improve fit.
- Remote is preferred. Local hybrid is acceptable. Limited travel is acceptable. Paid relocation only if clearly worth it.

## Posting Freshness Rules
- Freshness is a first-order decision gate, not a minor note.
- Default to pursuing recently posted roles first.
- If a job was posted more than 30 days ago, treat it as stale-risk and lower confidence unless there is strong evidence the opening is still active and meaningfully staffed against.
- If a job was posted more than 60 days ago, default to pass or archive unless the user explicitly wants a strategic exception and there is unusually strong evidence of active hiring.
- Strong evidence of freshness can include a recent repost date, recent recruiter activity, a recently updated company careers page, or another concrete signal that the role is still actively being worked.
- A role being publicly visible is not enough by itself to treat it as fresh.
- Include posting age and freshness risk explicitly in role analysis, fit scoring, and shortlist recommendations.

## Role Lanes
Classify every role by mandate before drafting assets.

1. Revenue / Growth Operations, strongest default lane.
2. Lifecycle / CRM / Retention.
3. Growth / Revenue Marketing.
4. Head / VP of Marketing, selective only.
5. Ecommerce / DTC Growth.

Each role analysis must include:
- primary lane
- secondary lane, if relevant
- fit score `/100`
- pursue classification
- title fit
- lane fit
- company stage fit
- mandate fit
- evidence match
- compensation fit
- logistics fit
- risks
- missing information
- recommendation

## Claim Safety
Never invent metrics.
Do not round or understate tenure in summaries. If years of experience are mentioned, calculate from the National Positions start year in 2007 and the current date. Use a current count or conservative `18+ years` language when the exact start month is unavailable.

Before using any number:
1. Check the Metrics Ledger.
2. Confirm confidence level.
3. Confirm ownership level.
4. Use safe phrasing.
5. Avoid over-attribution.

Use these labels in analysis:
- Validated
- Estimated
- Inferred
- Weak
- Missing
- Risky
- Do not use externally

Preferred verbs:
- helped grow
- supported scale
- contributed to
- built systems that enabled
- architected infrastructure behind
- improved
- increased
- reduced
- established
- implemented

Do not use externally unless validated:
- `$170M` aggregate revenue growth
- precise CAC claims
- exact churn or LTV claims
- unsupported paid-media ROAS
- exaggerated AI claims
- claims implying Matt alone drove sales-led outcomes

## Workflow Order
For any job-search request, first classify the starting scenario with `$job-search-scenarios`.

Use `docs/job-search-process-optimization.md` when simplifying the workflow, measuring performance, training another operator, or cloning the system into a productized offer.

For a new role, use this order:

1. Role intake
2. Role lane classification
3. Quick fit score
4. Company, hiring-team, market, and competition research
5. Research brief
6. Explainable final fit score and member validation
7. Pursuit decision and approval state in Way Ahead
8. Resume strategy and editable Way Ahead resume version
9. Tailored resume review/export
10. Cover letter strategy and editable Way Ahead cover-letter version when the live flow or member choice justifies one
11. Exact application-question answers
12. Outreach pack, only if useful and approved before sending
13. Interview pack and interview-event tracking
14. Post-interview follow-up
15. Compensation, offer, and outcome tracking

Do not create final assets until the research brief is complete and the role is worth pursuing.

## Easy Trigger Workflows
When the user asks to find jobs:
1. Use Quick mode by default.
2. Search canonical employer career sites and trustworthy current sources. Do not use Teal as an operating surface.
3. Ask only for blockers; otherwise use the member's approved job paths, Job Standard, compensation rules, location preferences, and verified profile evidence.
4. Produce a shortlist with title, company, source URL, posting age if known, lane, quick score, comp/logistics, why it fits, risks, and next action.
5. Store approved candidates and their source versions in the member's Way Ahead workspace when that surface is available; otherwise use a repository-backed import packet with provenance.
6. Show the score as an explainable percentage with evidence, unknowns, and a member correction path.
7. Do not apply, populate a live form, upload a file, or message anyone.

When the user asks to score saved jobs:
1. Use the member's Way Ahead Jobs workspace and its canonical source link.
2. Re-verify the latest source version before trusting an existing score.
3. Assess posting age and freshness risk, run lane and fit scoring, expose the evidence and unknowns, and save a version-bound result.
4. Do not draft assets unless the user asks or the role clears the pursue threshold.

When the user asks to apply to a job:
1. Use Standard mode by default.
2. Use Way Ahead as the operating surface. Use the employer's canonical application site only for read-only inspection until the exact action is approved.
3. Require or locate the Way Ahead job record, full JD, and canonical application URL.
4. Verify that the member has not already applied and that the role is not a duplicate of a submitted or closed pursuit.
5. Verify the source is still active, assess posting age and freshness risk, and resolve the canonical employer before asset work. If the listed company, JD employer, and source employer do not clearly match, stop and resolve the mismatch instead of proceeding on an aggregator wrapper.
6. Once the role clears the pursue bar and asset work begins, move the Way Ahead pursuit to `Preparing` or the equivalent internal state. This internal update is not approval to interact with the employer.
7. Research the JD, application questions, company, hiring manager/recruiter, target role, market, competition, likely KPIs, and why the role exists before final asset drafting.
8. Create or open a role-specific resume in Way Ahead from only approved profile evidence, then let AI do the first tailoring pass while preserving member editing and provenance.
9. Optimize the summary, selected evidence, bullets, target title, skills, tools, and role language without inventing facts. Keep master, job-path, and job-specific versions distinct.
10. Inspect the live application flow read-only before deciding whether a cover letter is useful. If the application has a cover-letter slot, create a tailored one-page version unless the member opts out. If there is no slot, create one only when the member requests it or approves a strategic exception.
11. Download or save resume and cover letter as separate files named `{Company} - {Role} - Matt Dimock - Resume.pdf` and `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`. Do not upload files with `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels in the filename.
12. Prepare application answers from the exact live form questions. Use defaults only when the form asks and no contradictory evidence or user instruction exists.
13. Create a role-specific interview pack before submission readiness for roles that clear the pursue bar, so likely screens, objections, story selection, questions to ask, and compensation strategy are ready.
14. Stop for approval after the final resume, cover letter if used, application answers, upload destination, and submit action are visible/reviewable. Do not submit applications, send outreach, share references, or negotiate externally without explicit approval of the exact external action. Voluntary self-ID, race, gender, veteran, disability, and clearance fields may be answered from standing defaults when no contradictory instruction exists.
15. After an approved application is submitted and confirmation is visible, update the Way Ahead pursuit to `Applied`, record the application date, exact submitted assets and answers, follow-up target, and outcome instrumentation. Do not mark `Applied` before live confirmation.

Chat policy:
- Use one ongoing project chat for broad searches, cadence reviews, source optimization, and governance.
- A new chat per job is optional but recommended for high-fit applications that need deep research, resume drafting, interview prep, or long back-and-forth.
- If staying in one chat, start each job request with a compact Way Ahead job-record link, canonical source, or role-intake block to reduce re-reading.

## Token Efficiency
Use the lightest workflow that can make a good decision.

Modes:
- Quick: search, triage, and shortlist only.
- Standard: one role through research, scoring, resume strategy, drafts, and QA.
- Deep: high-stakes role, interview pack, negotiation, or complex company research.

Approximate token budget:
- Quick single-role triage: 3k to 8k tokens.
- Quick batch search, 10 to 20 roles: 15k to 60k tokens, depending on how much web/JD text is loaded.
- Standard application package: 40k to 100k tokens.
- Deep application plus interview prep: 100k to 220k tokens.

Codex may not have access to live remaining rate-limit quota. If live budgeting matters, ask the user for the visible remaining quota and model/reasoning level, then estimate remaining workflows with `docs/token-efficiency.md`.

For substantial searches, scoring batches, applications, or workflow-improvement runs, include a compact Workflow Metrics Summary with `run_id`, mode, estimated current-response tokens, estimated run-to-date tokens, elapsed time if known, main blocker, revision loops, and self-healing status.

Model defaults:
- Broad job finding and first-pass triage: `gpt-5.4-mini`, low or medium reasoning.
- Shortlist evaluation and standard application drafting: `gpt-5.4`, medium reasoning.
- Final high-stakes resume, interview, compensation, or ambiguous strategy: `GPT-5.5`, medium or high reasoning.

## Way Ahead and Browser Rules
Way Ahead is the source of operational job-search state. TealHQ is a competitor that may be observed read-only only when Matt explicitly requests a bounded product comparison. Never make Matt's pursuit, product data, or release readiness depend on Teal access.

Use the appropriate browser surface for canonical employer sites, LinkedIn, Gmail/Google, and application forms. Prefer Matt's logged-in Chrome profile when authentication is required. Use an isolated browser for public, unauthenticated QA when it provides cleaner evidence.

Operate like a careful human:
- use direct visible navigation
- avoid rapid-fire actions, repeated reloads, and guessed URL grids
- do not bypass CAPTCHA, Cloudflare, login, permissions, or paywalls
- pause on challenge prompts or unexpected account/security warnings
- separate browser-runtime failure, authentication failure, source unreadability, and application-site failure before choosing a fallback

Do not:
- invent or assume an employer, job-board, LinkedIn, or Teal API
- bypass login, permissions, CAPTCHA, or website restrictions
- populate employer forms, upload assets, submit applications, or send outreach without exact approval
- import private competitor-account data into Way Ahead

Maintain Way Ahead pursuit records with:
- status
- role lane
- fit score
- source version and checked-at time
- pursue classification
- compensation range
- remote/hybrid/location
- application deadline if known
- source
- company stage
- hiring manager/recruiter
- notes
- next action
- follow-up date
- asset status
- interview status
- approval state and action receipt

Default application answers when the form asks and no contradictory evidence exists:
- authorized to work in the U.S.: yes
- sponsorship now or later: no
- current state: TN
- relocation: open for the right opportunity, paid relocation preferred
- SMS consent for employer follow-up about the job application: yes
- valid passport: yes
- Canada travel for work: yes, has prior business-travel history to Canada
- family or relatives at target employer: no
- previously worked at target employer: no unless evidence says otherwise
- race/ethnicity: White / Not Hispanic or Latino for voluntary self-ID
- gender: male for voluntary self-ID
- pronouns: he/him only when asked
- veteran status: not a veteran
- disability status: no disability / no history or record of disability
- security clearance: no active clearance unless Matt provides one for the exact application

## Human Approval Gates
Ask for explicit approval before:
- submitting an application
- using final resume, cover letter, application answers, or upload destinations in a live submission
- sending LinkedIn outreach
- sending email
- populating a live employer form or uploading a file
- connecting a paid model, job feed, production-data source, or new external provider
- deleting or overwriting files
- changing source-of-truth files
- using references
- providing reference contact info
- accepting or declining interviews
- negotiating compensation externally

Drafting, analysis, scoring, research, recommendations, and QA can proceed without approval.

## Output Scaffold
Unless the user asks for a different format, start task responses with:

### Objective
### Assumptions
### Plan

End task responses with:

### Results
### Verification
### Risks + Rollback
### Next actions

For coding-style implementation threads, also include:
- How to verify
- What to verify
- Test results
- Risks

## Skill Routing
This project includes official local skill playbooks under `.agents/skills`.

Use them as task-specific operating guides:
- my-way-ahead-company-integrator
- my-way-ahead-offer-journey
- job-search-scenarios
- profile-understanding
- role-intake
- role-lane-classification
- fit-scoring
- company-research
- hiring-manager-recruiter-research
- market-competition
- resume-strategy
- resume-drafting
- cover-letter
- outreach
- application-answer
- interview-pack
- compensation-offer-strategy
- tealhq-workflow
- token-budgeting
- source-optimization
- qa-fact-check
- alen-sultanic-persuasion
- expert-team-orchestration

Start every Way Ahead company or product task with `my-way-ahead-company-integrator`. Add `my-way-ahead-offer-journey` for JTBD, messaging, funnel, pricing, partner referrals, acquisition, SEO/GEO/AEO, retention, or unit economics. Use the existing job-search skills only for Matt's founder-dogfooding pursuit inside Way Ahead. Teal is competitor evidence only, never Way Ahead product architecture or Matt's operating surface.

If a global or shared delivery/governance skill such as `product-delivery-os` is available in the active session, use it for tracker, branch, PR, WIP, or delivery-audit governance. If it is unavailable, use this file plus local playbooks as the project-specific fallback.

## Skill + Rule Governance
For non-trivial job-search work, identify the skills and durable rules that should govern the task before execution, especially when the task touches Way Ahead, authenticated browsers, source-of-truth files, resumes, application answers, external submissions, proof-sensitive claims, or reusable workflow changes.

Optimize for behavioral compliance, not just skill invocation. Ask whether the rule actually shaped the work, evidence, artifact, or final decision.

When a rule matters, make it auditable with one of these evidence types:
- file or diff reference
- command result
- browser or visual check
- source citation
- explicit exception
- final response receipt

Use first principles to separate the goal from the mechanism, JTBD to clarify the user/job outcome, MECE to prevent overlapping rule buckets, systems thinking to trace downstream effects, second-order thinking to catch future drift, critical thinking and deductive reasoning to test whether the evidence supports the conclusion, and Nielsen heuristics for usable UI/workflow surfaces.

At the end of substantial work, include a compact `Skill + Rule Receipt` listing skills used, critical rules checked, evidence produced, and exceptions or drift found.

If expected skills or rules were skipped, say why. If the skip exposed a gap in instructions, docs, or skills, patch the smallest durable source when the fix is clear and low risk.

Treat repeated misses, stale skill guidance, or rules that are too vague to verify as drift. Propose or make a durable update instead of relying on memory.

Keep this lightweight for trivial deterministic tasks; do not add process overhead where no durable rule or meaningful risk exists.

## Source Optimization
The current trusted source set is:
- `01_matt_dimock_canonical_profile.md`
- `02_metrics_ledger.md`
- `03_role_lane_glossary.md`
- `04_story_bank.md`
- `05_outreach_templates.md`
- `06_interview_pack_template.md`
- `07_linked_in_optimization_brief.md`
- `08_reference_sheet.md`
- Wealth Dynamics report, internal style only

Do not rewrite source-of-truth files during normal job applications. If the user asks to optimize the source set, use `.agents/skills/source-optimization/SKILL.md`, produce a proposed change plan first, and ask approval before editing source files.

## Operating Cadence
Daily:
- review current canonical sources and approved searches
- triage new roles
- save promising roles in Way Ahead
- score roles
- choose the strongest evidence-backed roles for deeper research according to current capacity
- prepare assets only for high-fit roles
- send approved outreach and follow-ups
- update Way Ahead status, provenance, approvals, and notes

Weekly:
- review pipeline by stage
- identify best-converting lanes
- analyze response rates
- refine searches
- update target companies
- improve resume variants
- review compensation positioning
- identify networking targets
- archive weak-fit roles

Metrics:
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
- estimated tokens per run
- elapsed wall minutes and active Codex minutes
- stage blockers and revision loops
- interviews per application
- strongest lanes by conversion
- common objections
- compensation ranges
