# Job Search Operating System

## Mission
Optimize for interview conversion and fit quality, not application volume.

Codex handles structured thinking, research, scoring, asset drafting, QA, and interview preparation. TealHQ holds the pipeline, saved jobs, job descriptions, contacts, notes, statuses, and follow-up rhythm.

Use `docs/job-search-continuous-improvement.md` as the operating loop for making searches, qualification, Teal usage, assets, and applications faster over time.

## Workspace Readiness

Before non-trivial job-search work in this repo, prepare the workspace so both machines are using the same tracked rules and mirrored skills.

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-job-search-workspace.ps1 -SyncGitIfClean
```

macOS/Linux:

```bash
./scripts/prepare-job-search-workspace.sh --sync-git-if-clean
```

This repo treats `.agents/skills/` as the managed source of truth. The local `~/.codex/skills/` and `~/.agents/skills/` copies are mirrors. Repo-managed git hooks in `.githooks/` automatically re-sync those mirrored skill directories after checkout, merge, and rewrite events.

## Easy User Triggers
Use these simple requests:

| User request | Default workflow |
|---|---|
| "Find jobs for me today" | Quick batch search and shortlist |
| "Find remote RevOps jobs" | Quick lane-specific search |
| "Triage these jobs" | Quick score each role and recommend next action |
| "Apply to this job" | Standard application workflow |
| "Build the application pack for this Teal job" | Standard application workflow from Teal/JD |
| "Prep me for this interview" | Deep interview workflow |
| "Help me negotiate this offer" | Deep compensation workflow |

Use one ongoing project chat for searches and operating cadence. Use a new chat for a high-fit individual application when the role needs deep research, multiple assets, interview prep, or repeated revisions.

## Workflow
1. Source roles through Teal saved searches, alerts, Chrome extension bookmarking, company career pages, referrals, and targeted research.
2. Complete role intake with title, company, JD, compensation, logistics, application URL, known contacts, and Teal status.
3. Verify the correct browser surface before role selection, scoring, resume edits, or Teal status changes. Use live Chrome-backed Teal, not isolated Playwright or the in-app browser. On Windows, this requires the `job-search-chrome-teal-recovery` runtime probe: Chrome extension backend listed, live user tabs visible, and Teal claimed or opened without Cloudflare/login.
4. Refresh the Teal page once after claim/open and before trusting any visible tracker rows, status, notes, applied dates, or resume state. If another machine may have changed the same account, treat pre-refresh state as stale-risk.
5. Classify the role by mandate into one primary lane and optional secondary lane.
6. Run a quick fit score before spending time on research or assets.
7. For viable roles, create a company and market research brief.
8. Create the final fit scorecard and pursue recommendation.
9. Build resume strategy before drafting the tailored resume.
10. Draft role-specific assets only after research and scoring justify the effort.
11. QA every asset for claim safety, recruiter comprehension, ATS clarity, tone, and fit.
12. Submit, message, or update externally only after explicit user approval.
13. Track every next action and follow-up in Teal.
14. Prepare interview packs only after the role is active or clearly worth pursuing.
15. Preserve compensation leverage through research, careful language, and staged disclosure.
16. Review pipeline weekly and adjust searches, lanes, proof themes, and asset strategy.
17. After substantial workflows, capture one improvement note: bottleneck, reusable Teal item, search rule, reusable answer/asset, or proposed docs/skills update.

## Find Jobs Workflow
Default to Quick mode.

1. Use saved role lanes, compensation rules, and logistics preferences.
2. Search by title families and keyword clusters, not only exact titles.
3. Prioritize fresh postings and remote-friendly roles.
4. Treat roles older than 30 days as stale-risk unless there is strong evidence of active hiring.
5. Treat roles older than 60 days as default pass or archive candidates unless the user explicitly wants a strategic exception.
6. Public visibility alone does not prove that a role is still actively being staffed.
7. Return a shortlist, not a large dump.
8. For each role, include company, title, URL/source, posting age if known, lane, quick score, comp/logistics, why it fits, risks, and next action.
9. Recommend which roles to bookmark in Teal with the Chrome extension.
10. Stop before applications or outreach.

## Apply To Job Workflow
Default to Standard mode.

1. Require the full JD, Teal record, or application URL.
2. Verify live Chrome-backed Teal access before selecting or mutating a Teal record. If Chrome is proven but an existing Teal tab is locked, open a fresh Chrome-extension-backed Teal tab. If Chrome-backed Teal loads but the target Teal page is unreadable after slow scoped navigation and one fresh-tab attempt, stop and request a screenshot, direct Teal record URL, or pasted JD instead of guessing.
3. Refresh Job Tracker or Job Detail once before trusting visible status, notes, applied date, or source state.
4. Complete intake and lane classification.
5. Check posting age and freshness risk before asset work.
6. Run fit scoring before asset work.
7. If the role is older than 60 days and freshness evidence is weak, recommend pass or archive unless the user overrides.
8. If score is below 65, recommend pass or low-effort path unless the user overrides.
9. If viable, create research brief, fit scorecard, resume strategy, tailored resume, application answers, interview pack, and any required or strategically useful cover letter. If the live application has a cover-letter upload or text slot, create a one-page tailored cover letter through Teal Cover Letter with a custom prompt unless Matt explicitly opts out.
10. Use Teal Resume Builder, Job Matcher, Analyzer, and preview/export checks before final resume export unless Teal is blocked. Refresh Resume Builder once before trusting attached-job state or optimizer state. If Teal is blocked, stop with the blocker instead of silently replacing Teal with a local-only workflow.
11. Enforce canonical filenames before upload: `{Company} - {Role} - Matt Dimock - Resume.pdf` and `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`. Do not upload filenames with `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels.
12. QA every external asset against claim-safety rules.
13. Stop for explicit approval of the final assets, application answers, upload destination, and submit action before submitting, messaging, or changing external records.
14. Move Teal status to Applied only after the approved live submission is completed and confirmed.

## Role Decision Gate
Use this effort ladder:

| Fit Result | Action |
|---|---|
| 85 to 100, Pursue aggressively | Research deeply, tailor resume, draft outreach, prepare fast |
| 75 to 84, Pursue | Research and create assets if comp/logistics are viable |
| 65 to 74, Selective/opportunistic | Light research, save or pursue only if low friction or strategic |
| 50 to 64, Low fit | Usually archive unless new information improves score |
| Below 50, Pass | Do not spend asset time |

## Asset Creation Order
1. Research brief
2. Fit scorecard
3. Resume strategy
4. Tailored two-page resume
5. Cover letter, required through Teal Cover Letter when the application has a cover-letter slot unless Matt opts out, otherwise only when useful
6. Outreach pack
7. Application answers
8. Interview pack, before submission readiness for roles that clear the pursue bar
9. Follow-up notes
10. Compensation strategy

## Daily Cadence
- Review Teal alerts and saved searches.
- Triage fresh postings.
- Bookmark promising roles with full JD text.
- Score roles quickly.
- Pick the top 1 to 3 for deeper research.
- Prepare assets only for high-fit roles.
- Send only approved outreach and follow-ups.
- Update Teal statuses, notes, and next actions.
- Note any repeated friction that should become a saved-search tweak, Teal library addition, reusable application answer, or workflow rule.

## Weekly Cadence
- Review pipeline by stage.
- Identify which lanes are producing responses.
- Analyze response rates and interviews per application.
- Refine saved searches and keywords.
- Update target companies.
- Improve resume variants and proof routing.
- Review compensation positioning.
- Identify networking targets.
- Archive weak-fit roles.
- Review workflow friction and update docs or skills when a rule would save time across future searches or applications.

## Metrics
Track:
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
- interviews per application
- strongest lanes by conversion
- common objections
- compensation ranges

## Approval Gates
The user must approve:
- applications
- final resume, cover letter if used, application answers, upload destination, and submit action before any live submission
- outreach messages
- emails
- bulk Teal changes
- use of references
- reference contact sharing
- interview acceptance or decline
- external compensation negotiation
- deletion or overwrite of source-of-truth files

## Token Efficiency
Default to the smallest mode that can produce a reliable decision.

| Mode | Use For | Approximate Token Cost |
|---|---|---:|
| Quick | Search, batch triage, shortlist, pass/pursue decision | 3k to 8k per role, or 15k to 60k for 10 to 20 roles |
| Standard | One role application pack with research, scoring, strategy, drafts, QA | 40k to 100k |
| Deep | Interview prep, offer strategy, high-stakes role, complex company research | 100k to 220k |

Codex cannot always see live remaining rate-limit quota. If quota matters, ask the user for the visible remaining limit and model/reasoning level, then estimate how many Quick, Standard, or Deep workflows remain.
