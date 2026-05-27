# Job Search Protocol Index

Version: `2026-05-10-teal-acceleration`

Use this file as the routing layer for future Codex + TealHQ job-search work. It prevents each doc and skill from restating the whole protocol.

## Authority Map

| Need | Source |
|---|---|
| Global behavior, source hierarchy, compensation, approval gates | `AGENTS.md` |
| End-to-end application sequence and prompt architecture | `docs/codex-teal-application-protocol.md` |
| Teal UI workflow, Chrome handling, Job Tracker, Resume Builder | `docs/teal-workflow.md` |
| Token budgets, model selection, source-loading controls | `docs/token-efficiency.md` |
| Benchmark rubric, run log, trendline method | `docs/job-search-protocol-benchmark.md` |
| Protocol version history | `docs/job-search-protocol-change-log.md` |
| Source file authority and stale-source handling | `docs/source-map.md` |
| Numeric and story claim safety | `docs/claim-safety-rules.md` |
| Task-specific execution | `.agents/skills/*/SKILL.md` |

## Operating Layers

1. Classify the request with `job-search-scenarios`.
2. Pick the smallest workflow mode that can make the decision.
3. Use TealHQ and Google Chrome as the operating surface when live records, saved jobs, matching, exports, or application forms matter.
4. Use the source hierarchy only as deeply as the decision requires.
5. Keep external claims source-backed, readable, and tied to the correct employer or client context.
6. Log every meaningful Standard or Deep run in the benchmark.
7. Record protocol changes in the change log, then test across at least 3 meaningful runs before treating a change as proven.

## Safe Teal Acceleration Rules

Speed up Teal through visible UI operations, not private API mutation.

Allowed:
- use Chrome with Matt's logged-in Teal session
- use the Teal Chrome extension, Teal-native Save or Bookmark, and visible Tracker table controls
- use page-context JavaScript only to inspect visible DOM, count elements, extract visible row text, or identify visible controls
- use Tracker table inline edits for verified salary min, salary max, location, status, follow-up, deadline, and Excitement when visible and low risk
- use the detail screen for source URL, full JD, notes, resumes, contacts, and any field that is brittle in the table

Not allowed:
- bypass Cloudflare, CAPTCHA, login, permissions, rate limits, or paywalls
- extract or print tokens, cookies, localStorage secrets, or account credentials
- mutate Teal records through private backend endpoints or guessed routes
- run unbounded browser loops without ledger checkpoints

Date Posted rule:
- update Date Posted only from source-backed evidence
- treat the inline date picker as brittle until proven stable in the current session
- if the date picker produces an incorrect or uncertain value, stop and report the blocker instead of continuing a bulk edit
- record a before and after value for every Teal field mutation

## Workflow Modes

| Mode | Use For | Default Model | Reasoning | Stop Point |
|---|---|---|---|---|
| Quick | Teal job search, batch triage, saved-job scoring, pass or pursue decisions | `gpt-5.4-mini` | medium | active-only confirmed saves, score, Teal next action |
| Standard | One viable Teal application pack | `GPT-5.5` | medium | filled or ready-to-fill package, stop before submission |
| Deep | Interview, offer, hard positioning, protocol redesign | `GPT-5.5` | medium | decision-ready strategy, assets, QA, benchmark update |

Use `gpt-5.4-mini` with medium reasoning for Teal job search. Use `GPT-5.5` with medium reasoning for application packs, final QA, interviews, compensation, and protocol repair. Do not use or recommend `GPT-5.5 high` for this Job Search protocol.

## Concise Triggers

The user should be able to give a short request and have the protocol infer the full workflow.

| User Says | Infer |
|---|---|
| `Find 10 qualified jobs` | Run the full active-posting, extension-save, baseline, save-ledger, geo-gate, pivot-threshold workflow |
| `Find jobs for me` | Same workflow, default target 10 qualified saved jobs unless the user gives another count |
| `Apply to the next best Teal job` | Rank Teal Trackers best to worst, verify live posting, archive inactive roles, build the first viable application pack |
| `Apply to this job` | Verify live posting and application form, then build the Standard application pack for that specific role |
| `Update Teal job records` | Use Tracker table inline edits for verified low-risk fields, detail screens for evidence fields, and stop on brittle date or auth blockers |
| `Speed up Teal` | Investigate visible UI features and safe DOM inspection only; do not bypass Cloudflare, CAPTCHA, login, or private endpoints |

## Search And Save Gate

Do not save a role to Teal as a strong candidate until the active-posting gate passes.

When the user asks for a count, the count means qualified saved jobs, not candidates reviewed. If the user asks for 10 jobs, continue searching until 10 qualified roles are saved or a clear blocker or search exhaustion point is reached.

Salary and benefits priority:
- prioritize roles with posted annual base salary ranges when fit, mandate, and logistics are otherwise comparable
- prioritize roles with family-supportive benefits such as dependent healthcare, 401(k), bonus, equity, parental leave, PTO, remote flexibility, childcare, or wellness support
- do not save a weak or blocked role just because it posts salary
- capture visible benefits in notes when they affect the fit decision
- if salary is not posted, record `salary not posted` instead of inventing a range

Active-posting gate:
- company-hosted or ATS-hosted posting opens successfully in the browser session that will be used for the workflow
- the browser-rendered page shows real live job content, not a blank shell, challenge page, stale cache snippet, or `Job not found` message
- role is not closed, expired, filled, removed, or redirected to a generic careers page
- title, company, location, and application URL are visible
- a usable apply path or application surface is visible when the workflow requires application work
- remote, hybrid, hub, or relocation requirements do not create an obvious blocker
- compensation is visible or not disqualifying based on current rules
- posting age is acceptable, ideally fresh within the requested window; roles older than 14 days need a stronger fit reason

Browser truth rule:
- when search results, stale snippets, Teal metadata, or cached text disagree with the browser-rendered source page, trust the browser-rendered source page
- if the browser shows `Job not found`, a removed posting, a blank shell, or a broken application surface, treat the role as inactive or blocked even if search snippets still show a full JD
- do not score, save as viable, move to Applying, or create assets until the browser-rendered source page proves the role is live

Save only roles that clear the gate. Use this save-path order:
- Teal Job Search or saved-search Save/Bookmark button when the role is already inside Teal
- Teal Chrome extension from the live source posting when the role is outside Teal
- Manual Add Job only as a last resort after the Teal-native save path and extension path are unavailable or fail

Do not use Manual Add Job just because extension capture is flaky. Manual add is slower and riskier because it can create bare Bookmarked records without job descriptions.

Single-tab search rule:
- keep the candidate queue in the ledger, not as open browser tabs
- evaluate exactly one company-hosted or ATS-hosted posting at a time
- reuse or close the current source posting before opening the next candidate
- keep only Teal Trackers, Teal Job Search or the current search surface, and one current source posting visible when possible
- close extension popups, side panels, and stale tabs when they are not actively needed

Pre-bookmark rule:
- score the role before saving
- assign the Teal Excitement level before saving
- draft notes before saving, including lane, score, compensation/logistics, active-status evidence, risk, and next action
- if the extension exposes Excitement and notes before save, set them first, then click Bookmark or Save
- if the extension cannot set those fields before save, immediately open the Teal Tracker record after saving and complete Excitement, notes, salary fields, and full JD before counting the role
- do not use the Latest Saved Jobs list or Tracker count as proof of new saves; only the run ledger plus matching Teal record confirmation proves a new qualified save

Manual Add Job rule:
- capture the full actual JD from the live source posting before opening Manual Add Job
- paste the full actual JD into the job description field before saving or in the same edit session
- reopen the saved record and verify the Job Description or Original Job Description section contains the full text
- if the JD field is unavailable, the JD cannot be pasted immediately, or Teal shows `This job is missing a description`, mark the save as Failed save or Provisional and stop rather than continuing the batch
- never add multiple manual records before verifying the first one has the full JD

Before search:
- open Teal Trackers
- record the current Bookmarked baseline
- close or avoid stale job tabs and close the Teal side panel when it is not actively needed
- keep a run ledger with `Candidate`, `Source`, `Geo`, `Fit`, `Salary min`, `Salary max`, `JD captured`, `Save attempt`, `Teal confirmed`, and `Decision`

Save confirmation labels:
- `Confirmed saved`: visible in Teal with matching title, company, source URL, Bookmarked status, full JD, Excitement, structured salary fields when salary is visible, and notes
- `Duplicate existing`: already present in Teal before the run
- `Provisional`: extension indicated save but Teal confirmation is not visible yet
- `Delayed confirmed`: extension errored or looked uncertain, but Teal later shows the role saved
- `Failed save`: not visible in Teal after verification
- `Rejected`: failed geo, active, fit, compensation, or mandate gate

Never count `Provisional` as saved. A role only counts toward the target when it is `Confirmed saved` or `Delayed confirmed`.

Structured salary rule:
- if a posting lists an annual base range, populate Teal's Minimum Salary and Maximum Salary fields after saving
- if a posting lists one exact annual base salary, put the same number in both fields
- if a posting says `up to`, fill Maximum Salary only
- if a posting says `from` or `starting at`, fill Minimum Salary only
- if compensation is hourly, OTE, bonus, equity, vague, or not posted, do not invent annual base salary fields; record the visible compensation detail in notes
- a salary-visible role is not fully confirmed until the structured salary fields are populated or a clear UI blocker is reported
- a manual add is not fully confirmed unless the full actual JD was captured before manual entry, added in the same pass, and verified after save; do not create a bare bookmarked record to repair later

For broad searches, work in batches:
- scan candidates quickly
- verify active status before saving
- save only qualified roles
- keep searching after rejected candidates until the qualified saved target is met
- expand across title aliases, adjacent lanes, saved searches, job boards, and company career pages when the first source is weak
- send a non-blocking progress update every 3 confirmed saves or every 10 candidates reviewed, whichever comes first
- stop and report blockers if the extension, Teal, login, or source site stops working

Browser-loop fail-safe:
- do not run an unbounded Chrome loop until the runtime ends
- after 2 confirmed saves, 12 candidates reviewed, 8 minutes of active browser work, or 40 browser actions, emit a compact ledger update before continuing
- if browser output becomes large, reduce the surface by closing stale tabs, side panels, duplicate source tabs, and extension popups before the next action
- if the runtime cannot safely continue, stop with saved count, ledger, blocker, and exact continuation step rather than ending without a final status

Best-job search rule:
- prioritize roles by expected fit, compensation, logistics, recency, mandate quality, company quality, and application leverage
- search across multiple lane names and title families so one label does not dominate results
- do not force equal lane quotas when one lane is clearly stronger, but do not let one search phrase crowd out better roles in adjacent lanes
- continue widening title language before accepting a weak batch

Early geo-rejection heuristics:
- reject UK-only, London, EMEA-only, Europe-only, Canada-only, country-limited, or metro-limited roles unless Matt clearly fits
- reject remote roles limited to states, hubs, or commuting radii Matt does not match
- reject hybrid or office-attendance roles outside the target footprint
- reject relocation-required roles unless compensation and fit justify asking the user

Pivot thresholds:
- pivot after 5 candidates in one title family with 0 qualified saves
- pivot after 2 repeated geo blockers from the same surface
- pivot after 10 minutes without a qualified save
- pivot after 2 ambiguous Teal extension save events
- pivot when results skew international, junior, low-comp, or channel-mismatched

## Tracker Hygiene Gate

For controlled Teal record cleanup:
- use `docs/teal-workflow.md` as the canonical UI feature map and controlled-batch checklist
- default to `gpt-5.4-mini` with medium reasoning after the edit pattern is known
- use `GPT-5.5` with medium reasoning only for UI repair, repeated failure diagnosis, or protocol redesign
- limit the first cleanup pass to 5 records, then report a ledger checkpoint
- use Tracker table inline edits for verified low-risk fields: salary min, salary max, location, status, follow-up, deadline, and Excitement
- use the detail screen for source URL, full JD, notes, resumes, contacts, and brittle or evidence-bearing fields
- do not batch Date Posted, source URLs, full JDs, rich notes, shared resume content, or application statuses that imply external progress
- do not use Compensation analysis as record truth unless reconciled against the Tracker row and live source evidence

When a saved Teal role fails live verification during scoring or next-best application work:
- archive it when the posting is inactive, closed, expired, removed, or clearly no longer accepting applications
- downgrade it when it is active but low fit, blocked by logistics, or below compensation floor
- add a concise note with the reason and verification date
- do not leave it as a viable Bookmarked or Applying candidate
- continue to the next best role after cleanup

Single-role archive or downgrade is normal pipeline hygiene when the user has asked Codex to operate Teal. Bulk cleanup still requires explicit approval.

## Versioned Prompt Templates

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

- Use direct sectioned prompts with clear inputs, constraints, and output criteria.
- Use delimiters for long role data, JD text, source notes, and application questions.
- Do not ask for hidden chain-of-thought. Ask for the decision, evidence, rubric, and next action.
- Use `gpt-5.4-mini medium` by default for Teal job search. Use `GPT-5.5 medium` for application packs, final QA, interviews, compensation, and protocol repair. Do not recommend high reasoning for this Job Search protocol.
- Prefer a compact role intake block over reloading broad sources in every chat.

## Teal Shared-Content Gate

Treat Teal Resume Builder as a shared content library until the UI proves an edit is local.

Safe without extra approval:
- toggling selected content for one role resume
- renaming a role resume or local export
- adding role-specific notes
- adding benchmark data to repo docs

Needs explicit approval:
- saving summary or bullet edits to all resumes
- deleting skills from work history
- changing source-of-truth profile files
- bulk-changing Teal records
- submitting applications or sending outreach

## Canonical Skills Notes

Use one label per concept inside a resume. Prefer the most recruiter-readable version unless the JD strongly favors another wording.

| Concept | Preferred Default | Avoid Mixing With |
|---|---|---|
| Google Analytics | `Google Analytics 4` | `GA4`, `Google Analytics` |
| Systems thinking | `Systems Thinking` | `Systems Thinker` |
| AI workflow work | `AI-assisted workflows` | `AI wizard`, `AI-native visionary` |
| Lifecycle | `Lifecycle Marketing` | vague `Customer Marketing` unless JD uses it |
| CRO | `Conversion Rate Optimization` | orphaned `Landing Pages` |
| Reporting | `Performance Reporting` | vague `Website Optimization` |
| Automation | `Workflow Automation` | generic `Automation` when context is unclear |

Weak standalone skills should be removed or replaced when they do not carry clear role meaning, especially `Landing Pages`, `Website Optimization`, malformed one-word fragments, and generic soft skills without supporting proof.
