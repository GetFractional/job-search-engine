---
name: fit-scoring
description: Score job opportunities out of 100 and classify whether Matt should pursue, save, monitor, or pass based on lane fit, mandate, company stage, evidence match, compensation, logistics, risks, and missing information. Trigger when evaluating a role or shortlist.
---

# Fit Scoring Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.

## Purpose
Score roles out of 100 and classify pursuit effort.

## Required Sources
1. `docs/role-fit-scorecard.md`
2. `source-files/03_role_lane_glossary.md`
3. `source-files/02_metrics_ledger.md`
4. `templates/fit-scorecard.md`

## Inputs
- Completed role intake
- Role lane
- JD
- Company context
- Compensation and logistics
- Hiring access
- Source-active status, posting age, freshness evidence, and freshness risk
- Canonical employer, duplicate-wrapper, and already-applied status

## Process
1. Confirm the role is not already applied, not in a terminal Teal stage, not an unresolved duplicate wrapper, and not blocked by canonical-employer mismatch before recommending asset work.
2. Confirm source-active status, posting age, freshness evidence, and freshness risk before assigning the final score.
3. Score lane fit, mandate fit, evidence match, compensation, logistics, company/stage, hiring access, freshness/source risk, and other risk.
4. Apply compensation rules, including the `$120k` strategic floor only for strong opportunities.
5. Down-rank stale or unresolved roles: older than 30 days requires concrete active-hiring evidence, older than 60 days defaults to pass/archive unless Matt explicitly wants a strategic exception, and public visibility alone is not freshness proof.
6. Classify as Pursue aggressively, Pursue, Selective/opportunistic, Low fit, or Pass.
7. Explain what makes it attractive, what could kill it, and what must be verified.
8. Recommend whether to spend time on research, assets, and outreach.

## Output
- Fit score `/100`
- Pursuit label
- Decision rationale
- Source-active status, posting age, freshness evidence, and freshness risk
- Canonical-employer, duplicate-wrapper, and already-applied gate status
- Missing information
- Next action
- Teal Excitement score using 90-100 = 5 stars, 75-89 = 4, 60-74 = 3, 45-59 = 2, 0-44 = 1

## Safety
Do not let Teal keyword match override strategic fit or claim safety.
