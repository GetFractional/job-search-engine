---
name: token-budgeting
description: Estimate and control token usage for job-search workflows, including quick triage, batch search, standard application packages, deep interview prep, model choice, reasoning level, and source-loading strategy. Trigger when planning workload size, mode, or quota use.
---

# Token Budgeting Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.
- Report an estimated token budget in every job-search response by default, even when the user did not explicitly ask for token guidance.
- Keep token reporting concise: per-turn estimate, main cost drivers, and the cheapest reliable next step.
- Include a short protocol-optimization note in every closeout: what was learned, what changed, and how that should reduce future token waste or improve outcomes.
- Inspect the live application flow early so optional assets are chosen intentionally, not reflexively.
- For viable application targets, default to creating an optional cover letter when the application accepts one, unless the role is low-fit, the user explicitly skips it, or the added asset would create more risk than value.

## Purpose
Estimate and control token usage for job search, application, interview, and offer workflows.

## Required Sources
1. `docs/token-efficiency.md`
2. `docs/job-search-operating-system.md`
3. `docs/source-map.md`

## Inputs
- User task
- Number of roles
- Workflow mode: Quick, Standard, or Deep
- Model and reasoning level, if known
- Visible remaining quota, if user provides it
- Whether web research or long documents are required

## Process
1. Classify the task as Quick, Standard, or Deep.
2. Estimate token cost using conservative defaults.
3. If remaining quota is known, estimate workflows remaining.
4. Recommend the cheapest reliable model/reasoning level.
5. Identify ways to reduce token use without reducing decision quality.
6. For batches, triage first and reserve deep work for top roles only.
7. For application work, call out any avoidable work before doing it, especially duplicate research passes, redundant score tuning, or low-value edits that will not change the submission package.
8. Treat application-page inspection as a token-saving step. It should determine the minimum required asset set and the highest-value optional asset set before deep drafting begins.
9. Provide a per-response estimate, not only a workflow-total estimate.
10. Tie the estimate to the actual work done in the turn, such as source reads, live form inspection, Teal edits, and browser operations.

## Output
- Recommended mode
- Estimated token cost
- Estimated tokens used in the current response
- Model/reasoning recommendation
- Workflows remaining, if quota is known
- Token-saving steps
- Main token drivers
- New learnings that should change the workflow
- Fixes applied from those learnings

## Safety
Do not claim live remaining quota unless it is visible in the session or provided by the user. Treat all token counts as estimates.
