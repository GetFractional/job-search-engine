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

## Purpose
Audit every asset before use for accuracy, claim safety, tone, ATS clarity, role fit, and overstatement.

## Required Sources
1. `/Users/mattdimock/Downloads/01_matt_dimock_canonical_profile.md`
2. `/Users/mattdimock/Downloads/02_metrics_ledger.md`
3. `/Users/mattdimock/Downloads/03_role_lane_glossary.md`
4. `/Users/mattdimock/Downloads/04_story_bank.md`
5. `docs/claim-safety-rules.md`

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
7. Check recruiter comprehension and ATS clarity.
8. Check tone: human, calm, specific, commercially intelligent.
9. Remove em dashes and AI-sounding phrasing.
10. Flag anything requiring user confirmation.

## Output
- QA verdict
- Required fixes
- Optional improvements
- Claim safety table
- Approval readiness

## Safety
Do not mark an asset ready if any required claim is unsupported.
Do not mark an asset ready if a strong metric is technically true but contextually misleading.
