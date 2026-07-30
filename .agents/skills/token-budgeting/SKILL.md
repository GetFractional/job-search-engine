---
name: token-budgeting
description: Estimate and control token usage for job-search workflows, including quick triage, batch search, standard application packages, deep interview prep, model choice, reasoning level, and source-loading strategy. Trigger when planning workload size, mode, or quota use.
---

# Token Budgeting Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find, score, prepare, approve, or later submit a job pursuit through Way Ahead.
- Use Google Chrome for signed-in employer, LinkedIn, or job-board work when login state, Cloudflare, challenge prompts, or extension behavior matter. Observe Teal only when Matt explicitly requests bounded, read-only competitor research; never mutate it or use it for Matt's operating state.
- Keep Way Ahead as the operating system for jobs, analyses, pursuits, assets, approvals, outcomes, and follow-ups. Teal is competitor research only and may not hold or mutate Matt's current job-search state.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, or external compensation negotiation unless the user explicitly approves. Voluntary self-ID, race, gender, veteran, disability, and clearance fields may be answered from standing defaults when no contradictory instruction exists.
- Report an estimated token budget in every job-search response by default, even when the user did not explicitly ask for token guidance.
- Keep token reporting concise: current-response estimate, run-to-date estimate for substantial work, main cost drivers, and the cheapest reliable next step.
- Do not create optional assets until the live application flow, JD, or user instruction shows they are actually needed. A cover-letter upload or text slot means a one-page tailored letter should be prepared in Way Ahead unless Matt explicitly opts out.

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
7. For application work, call out any avoidable work before doing it, especially optional cover letters, duplicate research passes, or score tuning that will not change the submission package.
8. Provide a per-response estimate, not only a workflow-total estimate.
9. For substantial runs, include a run-to-date estimate and the top token drivers. If exact usage is not visible, label the number as estimated.
10. Pair token estimates with elapsed time, roles reviewed, stage blockers, and outcome metrics when using `templates/job-search-run-metrics.md`.

## Output
- Recommended mode
- Estimated token cost
- Estimated tokens used in the current response
- Estimated tokens used run-to-date for substantial work
- Model/reasoning recommendation
- Workflows remaining, if quota is known
- Token-saving steps
- Main token drivers

## Safety
Do not claim live remaining quota unless it is visible in the session or provided by the user. Treat all token counts as estimates.
