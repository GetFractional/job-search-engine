# Job Search Process Optimization

## Purpose
Make the Job Search OS faster, easier to run, easier to measure, and easier to clone without turning it into a fragile mass-apply machine.

The system should optimize for decision quality per hour, interview conversion, claim safety, and repeatability.

## Core Job To Be Done
When a serious candidate needs a better role, help them find the right opportunities, prove fit truthfully, produce tailored application assets, and keep follow-up moving without forcing them to become a job-search operator.

## Product Thesis
The durable offer is not "AI applies to hundreds of jobs."

The durable offer is a proof-safe job-search command center:

- It finds better-fit roles.
- It decides what deserves effort before assets are created.
- It creates tailored, truthful application packages.
- It tracks follow-up and outcomes.
- It improves its own workflow from measured bottlenecks.

## Simplified Operating Model

| Loop | User trigger | Default mode | Output | Stop condition |
|---|---|---|---|---|
| Find jobs | "Find jobs for me" | Quick | Shortlist with score, risk, freshness, and Teal action | Stop before applying or outreach |
| Score saved jobs | "Triage these jobs" | Quick | Updated score, Excitement, notes, next action | Stop before assets unless threshold clears |
| Apply to next best job | "Apply to a job for me" or "Apply to the next best job" | Standard | Best eligible Teal target, research, scorecard, Teal resume, required cover letter, answers, interview pack, approval packet | Stop before submission until explicit approval |
| Apply to specific job | "Apply to [job URL] for me" or "Apply to this Teal job" | Standard | Verified target, research, scorecard, Teal resume, required cover letter, answers, interview pack, approval packet | Stop before submission until explicit approval |
| Interview or offer | "Prep me" or "Help me negotiate" | Deep | Interview pack or compensation strategy | Stop before external messages or negotiation |
| Improve system | End of substantial run | Quick | Metrics, bottleneck, reusable item, proposed docs or skill update | Implement only if low-risk and reusable |

## Simple Prompt Contract

Users should be able to use short natural prompts. Codex owns the routing.

| User says | Codex should infer |
|---|---|
| "Find jobs for me" | Run Quick search and shortlist only. Do not apply or message. |
| "Apply to a job for me" | Select the next best eligible Teal job from refreshed Job Tracker evidence, then run Standard application workflow. |
| "Apply to the next best job for me" | Same as above, with explicit next-best target selection from Job Tracker Table view. |
| "Apply to this job" plus a URL, Teal record, or JD | Treat it as a specific-job application. Verify source, freshness, canonical employer, and duplicate status before assets. |
| "Apply to [job URL] for me" | Add or locate the Teal record if needed, verify the live posting, then run the specific-job workflow. |
| "Prep me for this interview" | Run Deep interview prep. |

The user should not have to mention branches, sync, skills, browser backend, freshness gates, canonical employer checks, or run metrics. Those are concierge responsibilities.

## Canonical Execution Order

### 1. Prepare
- Confirm workspace readiness for repo work.
- Treat branch state as an invisible concierge preflight: the current branch must contain latest `origin/main`, have clean tracked workflow files, and have mirrored skills. Do not make users reason about branch names.
- For Teal, LinkedIn, job boards, or applications, use Chrome-backed Teal, not isolated Playwright or the in-app browser.
- Refresh Teal once before trusting tracker rows, status, notes, applied dates, source state, or Resume Builder state.

### 2. Intake
- Capture title, company, source URL, posting age, compensation, location, status, and full JD.
- Resolve canonical employer before asset work.
- Exclude terminal statuses, already-applied roles, and duplicate wrappers.
- Check freshness, compensation, logistics, and mandate fit before research.

### 3. Decide Effort
- Classify lane before researching.
- Score quickly before creating assets.
- Keep weak roles to pass/save/research recommendations.
- Use Standard or Deep only after the role clears the pursue bar.

### Next-Best Target Selection
When the user says "Apply to a job for me" or "Apply to the next best job for me," Codex owns target selection.

1. Refresh Chrome-backed Teal and use Job Tracker Table view as the source of truth.
2. Use Home `Priorities` only as a lead list.
3. Exclude `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, `Closed`, and any role with a visible applied date.
4. Exclude duplicate wrappers of already-submitted canonical roles.
5. Rank eligible roles by Excitement, fit score, role lane, compensation, logistics, posting freshness, and expected application effort.
6. Open the strongest candidate and verify the live source and application path before asset work.
7. Prefer browser-rendered source evidence over cached Teal details, snippets, or old notes when they conflict.
8. Resolve canonical employer mismatches before resume, cover-letter, or application-answer work.
9. If the role is inactive, unavailable, dead-ended, duplicated, below floor, stale without strong evidence, or logistically incompatible, note the reason and continue to the next candidate.
10. Move the selected Teal record to `Applying` only after live viability is confirmed and active asset work is beginning.

### 4. Build Only What The Flow Needs
- Research brief and final scorecard come before final assets.
- Inspect the live application flow before cover-letter work.
- Use Teal Resume Builder, Job Matcher, Analyzer, and preview/export when the workflow requires a resume.
- Toggle existing Teal bullets and skills before adding or editing shared library content.
- Create a cover letter only when the flow has a slot, the user asks, or a strategic exception is approved.

### 5. Approve Before External Action
- Present final assets, application answers, upload destination, and submit action.
- Do not submit applications, send outreach, share references, answer sensitive voluntary self-ID, or negotiate externally without explicit approval.

### 6. Close The Loop
- After approved submission, update Teal status, applied date, Excitement, notes, submitted assets, compensation answer, and follow-up target.
- Update the application ledger for serious applications or substantial attempts.
- Capture run metrics, bottleneck, and one self-healing candidate.

## Bottleneck Routing

| Bottleneck | Default response | Do not do |
|---|---|---|
| Wrong browser surface | Switch to Chrome-backed Teal and verify live tabs | Continue in isolated Playwright for logged-in Teal work |
| Stale Teal state | Refresh once, then trust only refreshed data | Use pre-refresh tracker rows or notes |
| Locked or stale Teal tab | Open a fresh Chrome-backed Teal tab | Rerun repair loops when Chrome is already proven |
| Unreadable Teal page | Slow scoped navigation, one fresh tab attempt, then ask for screenshot, direct record, or pasted JD | Guess from memory or tab titles |
| Aggregator wrapper mismatch | Resolve canonical employer and active source before assets | Build assets for the wrapper if the real employer is unclear |
| Teal shared-library risk | Toggle existing items first, ask before global edits or deletes | Delete or globally update during live application work |
| Keyword chasing | Use Job Matcher only for truthful gaps, then check Analyzer and structure | Stuff flat skills or detach metrics from proof context |
| Upload blocked | Check extension file URL access and visible upload control | Paste resume text when a file upload exists without approval |
| Token bloat | Batch triage, avoid deep reads for low-fit roles, use the cheapest reliable mode | Use high reasoning or full source reloads for broad search |

## Run Metrics

Every substantial search, scoring batch, or application should receive a `run_id` and a compact metric summary.

Minimum fields:

- `run_id`
- scenario: `find_jobs`, `score_saved_jobs`, `apply_to_job`, `interview_prep`, `offer_strategy`, or `workflow_improvement`
- mode: `Quick`, `Standard`, or `Deep`
- model and reasoning level
- estimated tokens for current response and run-to-date
- elapsed wall minutes, active Codex minutes, and blocked wait minutes when known
- roles reviewed, saved, researched, applied, or passed
- stage timing for major phases
- blocker type and rework count
- outcome or current status
- self-healing candidate, if any

Use `templates/job-search-run-metrics.md` for search, scoring, and general workflow runs. Use `templates/application-retrospective.md` for Standard or Deep applications, failed submissions, or repeated friction.

## Stage Taxonomy

Use these stage names consistently so weekly rollups can compare similar work:

- `workspace_preflight`
- `browser_teal_preflight`
- `role_intake`
- `source_freshness_check`
- `lane_fit_scoring`
- `research_brief`
- `resume_strategy`
- `teal_resume_builder`
- `cover_letter`
- `application_answers`
- `interview_pack`
- `qa_approval_packet`
- `live_form_entry`
- `submission`
- `post_submit_hygiene`
- `retrospective`

## Self-Healing Rule

Create or patch durable docs, templates, or skills when a change is likely to:

- save at least 15 minutes per future comparable run
- prevent a recurring quality or safety failure
- improve conversion quality without adding meaningful complexity
- make the workflow easier for a cloned operator or normal user to run

Do not add process for one-off noise. Record one-off issues in the run metrics or role packet.

Self-healing statuses:

- `none`: no useful improvement found
- `proposed`: useful but not yet approved or implemented
- `approved`: approved but not implemented
- `implemented`: docs, template, skill, saved-search, or Teal library update completed
- `validated`: improvement worked in at least 3 comparable future runs or solved a repeated blocker
- `reverted`: change created friction, risk, or poor output and was rolled back

## Productized Offer Blueprint

### Ideal Customer
Mid-career to senior professionals with real proof, high opportunity cost, weak job-search operations, and a need for better-fit applications rather than more applications.

Strong first segments:

- RevOps, GTM, growth, lifecycle, ecommerce, marketing, and operator profiles
- laid-off or urgent-search professionals who need speed without spray-and-pray
- high-income candidates where each good application has high upside
- career pivoters who need adjacent proof translated without exaggeration

Avoid:

- users who want spam applications
- candidates unwilling to provide source material
- candidates who will not review or approve external actions
- low-context entry-level searches where the economics do not support high-touch work

### Offer Modules

| Module | Outcome |
|---|---|
| Career Proof Vault | Canonical profile, metrics ledger, story bank, target lanes, references, and claim boundaries |
| Role Targeting Engine | Saved searches, freshness rules, compensation and logistics gates, title and keyword clusters |
| Fit Decision System | Role intake, lane classification, fit score, pursue/pass decision, and next action |
| Application Pack Factory | Research, resume strategy, tailored resume, required cover letter, answers, and QA |
| Pipeline Command Center | Tracker setup, notes, statuses, follow-ups, weekly review, and application ledger |
| Interview And Offer Desk | Interview prep, objections, story selection, compensation strategy, and negotiation support |
| Continuous Improvement Loop | Metrics, bottlenecks, reusable assets, saved-search refinements, and skill/doc updates |

### Normal-User Onboarding

1. Collect resume, LinkedIn, target roles, compensation floor, location constraints, work authorization, sample roles, and "do not say" boundaries.
2. Build the proof vault with approved claims, metrics confidence, story bank, tools, industries, and sensitive restrictions.
3. Calibrate 3 to 5 target lanes and reject lanes using sample roles.
4. Set up the tracker, saved searches, stages, note schema, follow-up rules, and freshness gates.
5. Deliver a first shortlist of 10 to 20 roles.
6. Build one high-fit application package end to end.
7. Run a weekly pipeline review using outcomes, bottlenecks, and next 1 to 3 priority roles.

### Product Constraints

- Keep Teal as an MVP pipeline layer, but design the schema so another tracker can replace it later.
- Hide Chrome, Teal, and repo diagnostics from normal users behind operator health checks.
- Treat claim safety, approval gates, and source lineage as product primitives, not optional QA.
- Do not clone Matt-specific assets, account identifiers, reference data, or application artifacts into any demo or customer version.
- Price and scope around Quick gating, because Standard and Deep workflows are expensive.

## What To Standardize Next

1. Keep `scenario-workflows.md` as the canonical executable checklist and reduce duplicate long checklists elsewhere over time.
2. Make every substantial final response include a Workflow Metrics Summary.
3. Add run metrics to every submitted or serious attempted application.
4. Build a sanitized fake-customer demo that proves onboarding, shortlist, application pack, approval, and weekly digest without using private data.
