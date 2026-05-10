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
- Prefer roles with posted salary ranges and family-supportive benefits when fit is otherwise comparable because they reduce search uncertainty and future compensation rework.
- For routine Teal maintenance, use Tracker table inline edits for verified low-risk fields instead of repeatedly opening detail screens.
- Do not use token-saving tactics that bypass Cloudflare, CAPTCHA, login, permissions, rate limits, or private Teal endpoints.
- For viable application targets, default to creating an optional cover letter when the application accepts one, unless the role is low-fit, the user explicitly skips it, or the added asset would create more risk than value.

## Purpose
Estimate and control token usage for job search, application, interview, and offer workflows.

## Required Sources
1. `docs/token-efficiency.md`
2. `docs/job-search-protocol-index.md`
3. `docs/job-search-protocol-benchmark.md`
4. `docs/job-search-operating-system.md`
5. `docs/source-map.md`

## Protocol Routing Rule
Use `docs/job-search-protocol-index.md` for Quick, Standard, and Deep prompt templates. Use `docs/token-efficiency.md` for current model defaults, source-loading policy, and prompt cost controls.

Default to `gpt-5.4-mini` with medium reasoning for Teal job search, routine Tracker maintenance, and first-pass saved-job scoring. Use `GPT-5.5` with medium reasoning for application packs, final QA, interviews, compensation, Teal UI repair, repeated browser failure diagnosis, and protocol repair. Do not recommend high reasoning for this Job Search protocol.

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
9. For Teal search, keep Chrome lean. Close stale job tabs, duplicate source tabs, extension popups, and the Teal side panel when they are not actively needed, because repeated Computer Use snapshots can dominate token usage.
10. Evaluate one source posting tab at a time. Keep the candidate queue in the ledger, not in browser tabs.
11. Use a browser-loop fail-safe after 2 confirmed saves, 12 candidates reviewed, 8 minutes of active browser work, or 40 browser actions. Return a compact ledger and continuation step if the runtime cannot safely continue.
12. For Teal search, set intended Excitement and draft notes before saving. If the extension cannot set them pre-save, immediately complete them in the Tracker record before counting the role.
13. For Teal search, update structured Minimum Salary and Maximum Salary fields when annual base salary is visible, because structured compensation avoids later rework.
14. Capture visible family-supportive benefits in notes only when they affect fit or prioritization.
15. Use page-context JavaScript only for visible DOM inspection, visible row extraction, or control targeting. Do not extract tokens, print secrets, or mutate private endpoints.
16. For Teal search, require full JD capture before a saved role counts, because bare bookmarks create later rework and weak fit evidence.
17. Prefer Teal-native Save/Bookmark for roles already inside Teal and the Teal Chrome extension for source postings. Manual Add Job is a last resort and usually costs more tokens because the JD must be captured, pasted, reopened, and verified.
18. Stop instead of bulk-adding manual records if the first manual record cannot be verified with a full Job Description or Original Job Description.
19. Provide a per-response estimate, not only a workflow-total estimate.
20. Tie the estimate to the actual work done in the turn, such as source reads, live form inspection, Teal edits, and browser operations.
21. For Standard and Deep runs, make the benchmark row the durable memory of token drivers, remaining gaps, and protocol changes so future chats do not rediscover the same facts.

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
- Benchmark logging recommendation for Standard and Deep runs

## Safety
Do not claim live remaining quota unless it is visible in the session or provided by the user. Treat all token counts as estimates.
