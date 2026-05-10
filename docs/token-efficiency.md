# Token Efficiency And Model Selection

## Purpose

Keep the Job Search OS useful without burning rate limits on low-fit roles or repeated source loading.

## Core Rule

Spend tokens in proportion to opportunity quality.

Use Quick mode to decide whether a role deserves time. Use Standard mode only for viable roles. Use Deep mode only for high-fit, high-stakes, or ambiguous work.

## Modes

| Mode | Best For | Typical Output | Approximate Tokens | Default Model | Reasoning |
|---|---|---|---:|---|---|
| Quick | Teal search, routine Tracker maintenance, batch triage, saved-job scoring, pass or pursue decisions | Confirmed saves, shortlist, score, next action, verified Tracker updates | 40k to 120k per 10 qualified saved roles when browser automation is used carefully | `gpt-5.4-mini` | medium |
| Standard | Applying to one viable role | Research brief, scorecard, resume strategy, drafts, QA, benchmark row | 40k to 100k | `GPT-5.5` | medium |
| Deep | High-fit application, interview, offer, hard positioning, protocol redesign | Full synthesis, assets, strategy, evaluation criteria | 100k to 220k | `GPT-5.5` | medium |

Use `gpt-5.4-mini medium` for Teal job search and routine Tracker maintenance after the update pattern is known. Use `GPT-5.5 medium` for application packs, final QA, interviews, compensation, Teal UI repair, repeated browser failure diagnosis, and protocol repair. Do not recommend `GPT-5.5 high` for this Job Search protocol.

## Prompt Cost Controls

- Use direct, sectioned prompts with clear constraints and desired outputs.
- Use delimiters for long JD text, source snippets, application questions, and benchmark notes.
- Do not ask for hidden chain-of-thought. Ask for the decision, evidence, rubric, and next action.
- Prefer compact role intake blocks over reloading broad sources.
- Load the source map first, then only the specific source files needed.
- Inspect the live application flow before deep drafting so optional assets are chosen intentionally.
- Batch triage before company research.
- Keep low-fit roles to scorecard-only output.
- Reuse prior research when a company, role family, or JD pattern repeats.
- Record Job Matcher gaps once using benchmark gap labels so future chats do not rediscover the same safe terms.
- For Teal search, record the Bookmarked baseline and use a save ledger so existing bookmarks do not obscure newly saved jobs.
- Treat extension saves as provisional until confirmed in Teal.
- Keep Chrome lean during Teal search. Close stale job tabs, duplicate source tabs, extension popups, and the Teal side panel when they are not actively needed, and avoid repeatedly reading huge browser states.
- Evaluate one source posting tab at a time. Keep the candidate queue in the ledger, not in browser tabs.
- Use a browser-loop fail-safe after 2 confirmed saves, 12 candidates reviewed, 8 minutes of active browser work, or 40 browser actions. Return a compact ledger and continuation step if the runtime cannot safely continue.
- Set intended Excitement and draft notes before saving. If the extension cannot set them pre-save, immediately complete them in the Tracker record before counting the role.
- Populate Teal Minimum Salary and Maximum Salary fields when annual base salary is visible so compensation data is structured instead of hidden in notes.
- Prioritize salary-visible roles and family-supportive benefits when fit is otherwise comparable because they reduce uncertainty and improve Teal data quality.
- Use Tracker table inline edits for verified salary, location, status, follow-up, deadline, and Excitement updates instead of opening full detail screens for every low-risk field.
- Use the detail screen for source URL, full JD, notes, resumes, contacts, and Date Posted when the table control is brittle.
- Use page-context JavaScript only for visible DOM inspection or control targeting. Do not extract tokens, print localStorage secrets, bypass Cloudflare or CAPTCHA, or mutate private Teal endpoints.
- Require full JD capture before a saved role counts. Do not create bare bookmarked records to repair later.
- Prefer Teal-native Save/Bookmark for roles already inside Teal and the Teal Chrome extension for source postings. Manual Add Job is a last resort and costs more tokens because the JD must be captured, pasted, reopened, and verified.
- Stop instead of bulk-adding manual records if the first manual record cannot be verified with a full Job Description or Original Job Description.
- Pivot after 5 candidates in one title family with 0 qualified saves, 2 repeated geo blockers, 10 minutes without a qualified save, or 2 ambiguous extension events.
- Treat progress updates as non-blocking. Do not wait for the user unless there is a real external blocker such as login, CAPTCHA, extension failure, or site access failure.

## Budget Formula

If the user provides visible remaining quota:

```text
Estimated workflows remaining = remaining token budget / expected workflow cost
```

Use conservative estimates:

- Quick role triage: 8k
- Quick 10-qualified-save search batch: 120k if using Chrome automation, lower if mostly Teal-visible text and compact ledgers are enough
- Standard application: 100k
- Deep application or interview prep: 220k

Example:

```text
500k remaining tokens / 100k standard application = about 5 standard application workflows
```

## Source Loading Policy

Default to the smallest source set that can support the decision:

| Need | Source Strategy |
|---|---|
| Role fit or lane | Read `docs/source-map.md`, then targeted sections from `03_role_lane_glossary.md` |
| Numeric claim | Read the relevant row in `02_metrics_ledger.md` |
| Story proof | Read the matching story in `04_story_bank.md` |
| Resume positioning | Read role lane, relevant canonical profile section, and metrics only |
| Outreach | Read the relevant template section, not the full outreach file |
| Interview prep | Use Deep mode and load the relevant story and interview sections |
| References | Do not load `08_reference_sheet.md` unless references are explicitly in scope |

## What Codex Cannot Know Reliably

Codex may not see the live remaining rate-limit quota for the current account or session. If live budgeting matters, ask for:

- current model
- reasoning level
- visible remaining token or usage limit
- reset time, if shown

Then estimate how many Quick, Standard, or Deep workflows remain.

## Closeout Requirement

Every job-search run should end with:

- estimated tokens used in the turn
- main token drivers
- cheapest reliable next step
- new learnings
- protocol fixes applied or recommended
