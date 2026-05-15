# Token Efficiency And Model Selection

## Purpose
Keep the Job Search OS useful without burning rate limits on low-fit roles.

## Core Rule
Spend tokens in proportion to opportunity quality.

Use Quick mode to decide whether a role deserves time. Use Standard mode only for viable roles. Use Deep mode only for high-fit or high-stakes situations.

## Modes
| Mode | Best For | Typical Output | Approximate Tokens |
|---|---|---|---:|
| Quick | Search, batch triage, role intake, quick score | Shortlist and next actions | 3k to 8k per role, 15k to 60k per 10 to 20 role batch |
| Standard | Applying to one viable role | Research brief, scorecard, resume strategy, drafts, QA | 40k to 100k |
| Deep | High-fit application, interview, offer, hard positioning problem | Full research, assets, interview/offer strategy | 100k to 220k |

Token use rises when Codex reads long JDs, source files, web pages, screenshots, PDFs, resumes, or repeated revisions.

## Budget Formula
If the user provides visible remaining quota:

```text
Estimated workflows remaining = remaining token budget / expected workflow cost
```

Use conservative estimates:
- Quick role triage: 8k
- Quick 15-role search batch: 60k
- Standard application: 100k
- Deep application/interview: 220k

Example:

```text
500k remaining tokens / 100k standard application = about 5 standard application workflows
```

## Token-Saving Defaults
- Do not reload every source file for every role.
- Use the source map and only open the specific source needed.
- Summarize long JDs before deep analysis.
- Batch triage roles before researching companies.
- Keep low-fit roles to scorecard-only output.
- Reuse prior research when a company or role family repeats.
- Put role context in a compact intake block when starting a new chat.
- Use Teal as the persistent record so Codex does not need to reconstruct history.

## Model And Reasoning Defaults
Use these defaults unless the user asks otherwise:

| Task | Model | Reasoning |
|---|---|---|
| Broad job search, saved-search planning, first-pass triage | `gpt-5.4-mini` | low or medium |
| Shortlist evaluation, company research, standard application pack | `gpt-5.4` | medium |
| Final resume strategy, hard positioning, interview prep, compensation negotiation | `GPT-5.5` | medium or high |

Use high reasoning only when ambiguity, stakes, or synthesis quality justify the cost. Do not use high reasoning for broad batch search.

## What Codex Cannot Know Reliably
Codex may not see the live remaining rate-limit quota for the current account/session. If the user needs live budgeting, ask for:
- current model
- reasoning level
- visible remaining token or usage limit
- reset time, if shown

Then estimate how many Quick, Standard, or Deep workflows remain.

## Measurement

Report token usage as estimates unless exact usage is visible in the session.

For substantial job-search work, include:

- estimated tokens used in the current response
- estimated run-to-date tokens
- main token drivers, such as web research, long JDs, source files, screenshots, PDF reads, resume revisions, or repeated browser retries
- cheapest reliable next step
- variance note when the estimate is weak

Use these conservative run-to-date estimates when exact usage is unavailable:

| Workflow | Conservative run-to-date estimate |
|---|---:|
| Quick single-role triage | 8k |
| Quick 15-role search batch | 60k |
| Standard application | 100k |
| Deep application, interview, or offer work | 220k |

Do not treat token counts as performance by themselves. Pair token estimates with elapsed time, roles reviewed, applications submitted, response outcomes, and bottlenecks in `templates/job-search-run-metrics.md`.
