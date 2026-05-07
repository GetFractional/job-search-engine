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
2. `/Users/mattdimock/Downloads/03_role_lane_glossary.md`
3. `/Users/mattdimock/Downloads/02_metrics_ledger.md`
4. `templates/fit-scorecard.md`

## Inputs
- Completed role intake
- Role lane
- JD
- Company context
- Compensation and logistics
- Hiring access

## Process
1. Score lane fit, mandate fit, evidence match, compensation, logistics, company/stage, hiring access, and risk.
2. Apply compensation rules, including the `$120k` strategic floor only for strong opportunities.
3. Classify as Pursue aggressively, Pursue, Selective/opportunistic, Low fit, or Pass.
4. Explain what makes it attractive, what could kill it, and what must be verified.
5. Recommend whether to spend time on research, assets, and outreach.

## Output
- Fit score `/100`
- Pursuit label
- Decision rationale
- Missing information
- Next action
- Teal Excitement score using 90-100 = 5 stars, 75-89 = 4, 60-74 = 3, 45-59 = 2, 0-44 = 1

## Safety
Do not let Teal keyword match override strategic fit or claim safety.
