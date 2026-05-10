---
name: qa-fact-check
description: Audit job-search assets for factual accuracy, claim safety, tone, ATS clarity, role fit, overstatement, metric support, and source alignment before use. Trigger when reviewing resumes, cover letters, outreach, application answers, interview materials, or profile updates.
---

# QA And Fact-Check Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.
- Treat redundancy as a QA failure. If two lines materially repeat the same claim, the asset is not ready until the overlap is removed or rewritten.

## Purpose
Audit every asset before use for accuracy, claim safety, tone, ATS clarity, role fit, and overstatement.

## Required Sources
1. `docs/job-search-protocol-index.md`
2. `docs/codex-teal-application-protocol.md`
3. `docs/job-search-protocol-benchmark.md`
4. `/Users/mattdimock/Downloads/01_matt_dimock_canonical_profile.md`
5. `/Users/mattdimock/Downloads/02_metrics_ledger.md`
6. `/Users/mattdimock/Downloads/03_role_lane_glossary.md`
7. `/Users/mattdimock/Downloads/04_story_bank.md`
8. `docs/claim-safety-rules.md`

## Protocol Routing Rule
Use `docs/job-search-protocol-index.md` for canonical skill naming and approval gates. Use `docs/job-search-protocol-benchmark.md` to record QA evidence for meaningful Standard and Deep runs.

## Inputs
- Asset draft
- Role
- JD
- Research brief
- Fit scorecard

## Process
1. Check every number against the Metrics Ledger.
2. Check every story against the Story Bank or Canonical Profile.
3. Check role lane alignment.
4. Remove overclaiming and unsupported ownership.
5. Check brand and employer context so client-specific metrics are not floating under unrelated entities.
6. Check for duplicate or near-duplicate positioning across summary, highlights, and experience.
7. Check whether any newly added bullet only restates an existing bullet with slightly different wording. If so, keep the stronger line and flag the weaker one for replacement.
8. For every newly added JD or Job Matcher term, verify evidence source, best placement, and non-duplication.
9. Label remaining JD or Job Matcher gaps as `covered in prose`, `covered in skills`, `external asset only`, `unsupported`, or `noise`.
10. Flag soft skills that are unsupported by a bullet, story, scope signal, or clearly implied cross-functional behavior.
11. Run a two-page tradeoff check. If the resume is dense or spills, cut low-signal skills, duplicated concepts, or weak category items before cutting differentiated proof.
12. Check recruiter comprehension and ATS clarity.
13. Check tone: human, calm, specific, commercially intelligent.
14. Remove em dashes and AI-sounding phrasing.
15. Check asset naming before upload or delivery. Generic export names fail QA.
16. Capture final benchmark values or explain why they are not visible: Match Score, Analyzer score, page count, export loops, remaining gaps, and shared-content risk.
17. Flag anything requiring user confirmation.

## Output
- QA verdict
- Required fixes
- Optional improvements
- Claim safety table
- Approval readiness
- Redundancy findings, including exact lines that should be merged, replaced, or removed
- Benchmark-ready QA evidence for Standard and Deep runs

## Safety
Do not mark an asset ready if any required claim is unsupported.
Do not mark an asset ready if a strong metric is technically true but contextually misleading.
