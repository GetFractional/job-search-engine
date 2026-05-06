---
name: token-budgeting
description: Estimate and control token usage for job-search workflows, including quick triage, batch search, standard application packages, deep interview prep, model choice, reasoning level, and source-loading strategy. Trigger when planning workload size, mode, or quota use.
---

# Token Budgeting Skill

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

## Output
- Recommended mode
- Estimated token cost
- Model/reasoning recommendation
- Workflows remaining, if quota is known
- Token-saving steps

## Safety
Do not claim live remaining quota unless it is visible in the session or provided by the user. Treat all token counts as estimates.
