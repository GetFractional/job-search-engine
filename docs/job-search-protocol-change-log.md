# Job Search Protocol Change Log

Use this file to keep a durable record of protocol changes that future chats can reference quickly.

## Entry Format
- `date`
- `change`
- `why`
- `expected impact`
- `where implemented`
- `first role tested`
- `keep, revise, or revert`

## Entries
### 2026-05-10
- Change: Added a canonical Teal UI feature map and controlled batch cleanup checklist with a 5-record default batch cap, Tracker table versus detail-screen routing, Intercom obstruction handling, Compensation analysis reconciliation, and stronger rollback logging.
- Why: The latest Teal maintenance work showed that Tracker inline edits are fast for salary, location, status, follow-up, deadline, and Excitement, but Date Posted, source URL, full JD, rich notes, and shared resume content need safer one-record-at-a-time handling. Compensation analysis can also show stale or derived salary values, so it cannot be treated as record truth without reconciliation.
- Expected impact: Faster Teal cleanup with fewer corrupt fields, less Chrome bloat, clearer stop conditions, and more reliable record evidence before applications.
- Where implemented:
  - `docs/job-search-protocol-index.md`
  - `docs/teal-workflow.md`
  - `docs/job-search-protocol-benchmark.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
- First role tested: Controlled batch covering CaptivateIQ, Propelis, Housecall Pro, Lumeris, and Athennian
- Keep, revise, or revert: Keep under test for the next 3 Teal cleanup or find-jobs runs; revise if the batch cap is too slow or if any table field proves unstable

### 2026-05-10
- Change: Added safe Teal acceleration rules, Tracker table inline edit routing, Date Posted caution, salary-visible role prioritization, and family-supportive benefits capture.
- Why: A recent Teal update run showed that inline table edits can speed up salary and Excitement updates, but the Date Posted picker was brittle and private backend routes were not a safe path. The user also clarified that posted salary ranges and family benefits should be prioritized in search and scoring.
- Expected impact: Faster Teal maintenance, fewer browser stalls, cleaner salary data, better family-benefit prioritization, and less risk of account or data integrity problems.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/teal-workflow.md`
  - `docs/token-efficiency.md`
  - `docs/job-search-protocol-benchmark.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
- First role tested: CaptivateIQ, Director Marketing Operations, salary fields and Excitement updated through Teal Tracker table; Date Posted held because the inline date picker was unreliable
- Keep, revise, or revert: Keep under test for the next 3 Teal maintenance or job-search runs; revise if inline updates create incorrect dates or incomplete record evidence

### 2026-05-10
- Change: Tightened Manual Add Job rules so Teal-native Save/Bookmark and the Teal Chrome extension must be tried first, and any manual record must have a full source JD captured, pasted, reopened, and verified before the next manual add.
- Why: A recent automation follow-up used Manual Add Job for CaptivateIQ, NerdWallet, and Pearl Health after Teal access recovered, which created bare Bookmarked records showing missing job descriptions before they were repaired later.
- Expected impact: Fewer low-information Teal records, less rework, better application-readiness, and fewer false confirmed saves from records that lack JD evidence.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-operating-system.md`
  - `docs/job-search-protocol-benchmark.md`
  - `docs/teal-workflow.md`
  - `docs/token-efficiency.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `.agents/skills/token-budgeting/SKILL.md`
  - `templates/job-search-request.md`
- First role tested: Pending
- Keep, revise, or revert: Test on the next Teal add run; keep only if no manual record is created without a verified full JD

### 2026-05-10
- Change: Added strict one-job-tab search discipline, pre-bookmark scoring and notes, full-JD save confirmation, and a ban on using Latest Saved Jobs as proof of new saves.
- Why: A recent Teal search saved Dscout before rating and notes were complete, while other runs showed Chrome memory bloat from multi-tab search behavior and bare saved records without full JDs.
- Expected impact: Lower Chrome instability, fewer ambiguous Teal saves, cleaner Tracker records, faster continuation after browser failures, and less rework before applications.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-operating-system.md`
  - `docs/job-search-protocol-benchmark.md`
  - `docs/teal-workflow.md`
  - `docs/token-efficiency.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `.agents/skills/token-budgeting/SKILL.md`
  - `templates/job-search-request.md`
- First role tested: Pending
- Keep, revise, or revert: Test on the next `find 10 qualified jobs` run; keep only if saves are confirmed with one source tab, full JD, salary fields when visible, Excitement, and notes

### 2026-05-10
- Change: Added a browser-loop fail-safe for Teal job search, Chrome tab and side-panel hygiene, structured Minimum Salary and Maximum Salary field handling, and benchmark dimensions for Tracker data quality and runtime stability.
- Why: The latest find-jobs run ended with no final agent message after heavy Chrome/Computer Use output while mid-save. It also captured visible compensation in notes rather than Teal's structured salary fields.
- Expected impact: Fewer silent or null closeouts, lower browser-token waste, cleaner continuation after partial batches, and better Teal Compensation Analysis data because visible annual base salary is stored in structured fields.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-operating-system.md`
  - `docs/job-search-protocol-benchmark.md`
  - `docs/teal-workflow.md`
  - `docs/token-efficiency.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `.agents/skills/token-budgeting/SKILL.md`
  - `templates/job-search-request.md`
  - `templates/apply-to-job-request.md`
- First role tested: SOCi, Senior Director, GTM Strategy and Marketing Operations, partial run failed before final confirmation
- Keep, revise, or revert: Keep if the next Teal search closes with a compact ledger and no null final state

### 2026-05-09
- Change: Corrected the model policy after a stalled find-jobs run. Teal job search now defaults to `gpt-5.4-mini` with medium reasoning, while application packs, final QA, interviews, compensation, and protocol repair use `GPT-5.5` with medium reasoning. Reframed checkpoints as non-blocking progress updates that must not wait for user response unless there is a real external blocker.
- Why: A find-jobs run appeared to get stuck waiting for a response after a checkpoint-style pause, and the protocol had overcorrected by recommending `GPT-5.5 medium` for all Teal work.
- Expected impact: Lower-cost job search, fewer stalled runs, clearer progress behavior, and cleaner escalation to stronger models only when work becomes application or strategy heavy.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-operating-system.md`
  - `docs/teal-workflow.md`
  - `docs/token-efficiency.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `.agents/skills/token-budgeting/SKILL.md`
  - `templates/job-search-request.md`
- First role tested: Pending
- Keep, revise, or revert: Test on the next concise `find 10 qualified jobs` run

### 2026-05-09
- Change: Superseded by the later stalled-run correction above for job-search model routing. This entry originally set `GPT-5.5` with medium reasoning as the default for Teal job search, saved-job scoring, application execution, and protocol improvement. The durable parts are automatic inference from concise prompts plus Teal baseline, save ledger, save-confirmation labels, early geo rejection, and pivot thresholds.
- Why: The user does not want to use `GPT-5.5 high`, and recent Teal search failures showed that short prompts must trigger the full corrected workflow automatically.
- Expected impact: Less prompt burden for the user, fewer model-selection mistakes, more reliable Teal saves, faster rejection of geography-blocked roles, and earlier pivots away from noisy title families.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-operating-system.md`
  - `docs/teal-workflow.md`
  - `docs/token-efficiency.md`
  - `docs/job-search-protocol-master-prompt.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `.agents/skills/token-budgeting/SKILL.md`
  - `templates/job-search-request.md`
  - `templates/apply-to-job-request.md`
- First role tested: Pending
- Keep, revise, or revert: Test on the next concise `find 10 qualified jobs` run

### 2026-05-09
- Change: Clarified that requested search counts mean qualified saved jobs, not candidates reviewed, and added required search expansion across title families, adjacent lanes, saved searches, job boards, and company career pages before returning fewer than the target.
- Why: A recent find-jobs run reviewed 10 jobs but saved only 2 qualified roles. The protocol needed to continue searching for 10 qualified jobs and prioritize the strongest roles across multiple names and lanes.
- Expected impact: More complete Teal pipeline building, fewer underfilled search runs, and better coverage across RevOps, Growth Ops, Lifecycle, CRM, Growth Marketing, Revenue Marketing, Demand Generation, Ecommerce Growth, CRO, and selective Head/VP Marketing.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-operating-system.md`
  - `docs/teal-workflow.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/job-search-scenarios/references/scenario-workflows.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `templates/job-search-request.md`
- First role tested: Pending
- Keep, revise, or revert: Test on the next find-10-qualified-jobs run

### 2026-05-09
- Change: Added active-posting verification before saving jobs, extension-first Teal bookmarking, batch progress reporting, and Tracker hygiene rules for archiving inactive saved roles during next-best application workflows.
- Why: A stale DroneDeploy role was reportedly saved or left in Teal as viable even though the posting was no longer active, and a top-10 search run stalled without using the Teal Chrome extension or reporting a blocker.
- Expected impact: Fewer inactive roles in Teal, faster search execution, clearer progress reporting, and cleaner next-best application selection from Trackers.
- Where implemented:
  - `AGENTS.md`
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-operating-system.md`
  - `docs/teal-workflow.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `templates/job-search-request.md`
  - `templates/apply-to-job-request.md`
- First role tested: Pending
- Keep, revise, or revert: Test on the next find-jobs run and next-best Teal application run

### 2026-05-09
- Change: Added `2026-05-09-protocol-redesign`, including a protocol index, compressed application protocol, expanded benchmark rubric, run-log template, trendline method, and versioned Quick, Standard, and Deep prompts.
- Why: The workflow had strong rules but repeated them across too many docs and skills, which increased token use, drift risk, and inconsistent measurement.
- Expected impact: Faster cross-chat startup, cleaner routing, stronger benchmark evidence, and better separation between ATS prose placement, skills taxonomy, claim safety, page discipline, Teal efficiency, and outcome signals.
- Where implemented:
  - `docs/job-search-protocol-index.md`
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-protocol-benchmark.md`
  - `docs/token-efficiency.md`
  - `docs/teal-workflow.md`
  - `.agents/skills/job-search-scenarios/SKILL.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `.agents/skills/resume-strategy/SKILL.md`
  - `.agents/skills/resume-drafting/SKILL.md`
  - `.agents/skills/qa-fact-check/SKILL.md`
  - `.agents/skills/token-budgeting/SKILL.md`
- First role tested: Pending
- Keep, revise, or revert: Test across 3 meaningful Standard or Deep runs

### 2026-05-09
- Change: Added a missing-term coverage map workflow that groups JD and Job Matcher gaps into hard skills, soft skills, business terms, and platforms/tools, then assigns each term one best landing zone.
- Why: Prior runs were good at removing weak filler but inconsistent at systematically harvesting truthful missing skill language into the strongest resume slots.
- Expected impact: Better ATS alignment, higher Match Scores, and fewer random skill-chip additions.
- Where implemented:
  - `.agents/skills/resume-strategy/SKILL.md`
  - `.agents/skills/resume-drafting/SKILL.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `docs/teal-workflow.md`
- First role tested: Alex and Ani, Growth Marketing Director (Retention Focus)
- Keep, revise, or revert: Keep under test

### 2026-05-09
- Change: Added page-budget discipline as an explicit resume optimization rule.
- Why: Small ATS-oriented phrase additions can improve Match Score while silently pushing a resume onto a third page.
- Expected impact: Fewer late-stage export loops and cleaner two-page control.
- Where implemented:
  - `.agents/skills/resume-strategy/SKILL.md`
  - `.agents/skills/resume-drafting/SKILL.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `docs/teal-workflow.md`
- First role tested: Alex and Ani, Growth Marketing Director (Retention Focus)
- Keep, revise, or revert: Keep under test

### 2026-05-09
- Change: Added a benchmark file, change-log file, and measurement rule so protocol edits are scored against actual application outcomes instead of judged informally.
- Why: The workflow needed a durable way to compare whether new prompt and resume rules improve ATS fit, asset quality, and submission readiness over time.
- Expected impact: Better cross-chat continuity, less guesswork, and faster identification of protocol changes that should be kept or reverted.
- Where implemented:
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-protocol-benchmark.md`
  - `docs/job-search-protocol-change-log.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
- First role tested: Alex and Ani, Growth Marketing Director (Retention Focus)
- Keep, revise, or revert: Keep under test
