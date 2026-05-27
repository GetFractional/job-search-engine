# Job Search Protocol Optimizer Master Prompt

Use this prompt in a fresh `GPT-5.5` chat with `medium` reasoning and `Plan` mode when the goal is to improve the full Job Search protocol, not just work one role.

## Recommended Settings
- Model: `GPT-5.5`
- Reasoning: `medium`
- Mode: `Plan`

## Prompt
```text
You are operating inside Matt Dimock's Job Search workspace. Your job is to research, audit, redesign, and strengthen the full Job Search protocol so future application work becomes more effective, more consistent, and less wasteful.

Work in Plan mode first. Do not jump into edits immediately.

Primary objective:
Build the best possible Codex + TealHQ job-application operating system for Matt, then implement the approved plan.

Optimization goals:
- increase truthful ATS alignment
- improve resume and asset quality
- preserve a strict two-page resume maximum
- reduce redundant edits and wasted token usage
- improve repeatability across future chats
- improve speed from role selection to ready-to-submit application
- create a measurable benchmark system so changes can be tracked over time

Core constraints:
- All resume and application claims must stay source-backed and claim-safe.
- No keyword stuffing.
- No em dashes.
- Resume content must sound human, grounded, and commercially intelligent.
- Teal Resume Builder content may be shared across resumes, so edit carefully.
- Skills must be categorized cleanly. No uncategorized top-skill row if categorized skills are used.
- Canonicalize duplicate concepts such as `GA4` vs `Google Analytics 4`.
- Weak standalone skills and vague filler should be removed.
- Differentiated proof is more valuable than filler skill accumulation.
- Keep the resume at two pages maximum.
- Do not submit live applications unless explicitly instructed later.

Required source hierarchy:
1. /Users/mattdimock/Downloads/01_matt_dimock_canonical_profile.md
2. /Users/mattdimock/Downloads/02_metrics_ledger.md
3. /Users/mattdimock/Downloads/03_role_lane_glossary.md
4. /Users/mattdimock/Downloads/04_story_bank.md
5. /Users/mattdimock/Downloads/05_outreach_templates.md
6. /Users/mattdimock/Downloads/06_interview_pack_template.md
7. /Users/mattdimock/Downloads/07_linked_in_optimization_brief.md
8. /Users/mattdimock/Downloads/08_reference_sheet.md

Required repo guidance:
- /Users/mattdimock/Documents/Jobs/Job Search/AGENTS.md
- /Users/mattdimock/Documents/Jobs/Job Search/docs/codex-teal-application-protocol.md
- /Users/mattdimock/Documents/Jobs/Job Search/docs/teal-workflow.md
- /Users/mattdimock/Documents/Jobs/Job Search/docs/job-search-operating-system.md
- /Users/mattdimock/Documents/Jobs/Job Search/docs/token-efficiency.md
- /Users/mattdimock/Documents/Jobs/Job Search/docs/job-search-protocol-benchmark.md
- /Users/mattdimock/Documents/Jobs/Job Search/docs/job-search-protocol-change-log.md
- relevant skills under /Users/mattdimock/Documents/Jobs/Job Search/.agents/skills/

Required research:
- Use official OpenAI documentation as a primary source for prompt design, reasoning workflow, evaluation design, and model usage guidance.
- Use current TealHQ documentation or official guidance where useful for Teal workflows and resume optimization behavior.
- Clearly separate source-backed findings from inference.

Frameworks to use:
- Systems Thinking
- JTBD
- Design Thinking
- MECE
- Inversion
- Second-Order Thinking
- Critical Thinking
- Deductive Reasoning
- First Principles

Expert lenses to use:
- Operations lead
- ATS resume architect
- Lifecycle / CRM strategist
- Ecommerce growth operator
- QA / risk lead
- AI workflow architect

Plan mode deliverables:
1. Current-state diagnosis:
   - top workflow failures
   - top quality failures
   - top token-waste failures
   - top automation blockers
2. Gap analysis between current protocol and best-practice workflow
3. Proposed improvement roadmap ranked by impact and effort
4. Measurement design:
   - benchmark dimensions
   - scoring rubric
   - logging method
   - trendline method
5. Prompt architecture:
   - best prompts for Quick, Standard, and Deep job-search workflows
   - when to use each model and reasoning level
6. Approval plan:
   - what should be patched immediately
   - what should wait for explicit approval

Execution requirements after plan approval:
- Patch only the files that need to change.
- Replace stale or superseded rules instead of stacking clutter.
- Keep reusable protocol changes in versioned docs and skills.
- Keep private application artifacts out of commits unless explicitly requested.
- Add or update the benchmark and change-log system when the protocol changes.
- End with verification, risks, rollback, token estimate, learnings, and protocol fixes applied.

Resume optimization rule:
When improving a role-specific resume, harvest truthful JD and Job Matcher gaps into:
- hard skills
- soft skills
- business terms
- platforms/tools
- noise

For each kept term, assign one best destination:
- target title
- summary
- selected recent bullet
- categorized skills
- cover letter or application answer only

Use prose first for the highest-signal role terms. Use categories to broaden safe coverage, not to hide a generic summary.

Page-budget rule:
If a useful new term causes page spill, shorten or replace weaker copy before removing differentiated proof.

Your first response must stay in Plan mode and include:
- Objective
- Assumptions with confidence labels
- Plan
- Recommended expert coalition
- Recommended frameworks
- Research plan
- Risks and what would change your mind

Do not execute changes until the plan is approved.
```

## Why This Prompt Exists
- It separates protocol optimization from normal application execution.
- It forces source-backed research before rule changes.
- It creates a repeatable way to improve the system with `GPT-5.5 medium`, then use the leaner protocol later through concise trigger prompts.
