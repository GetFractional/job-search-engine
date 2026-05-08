---
name: tealhq-workflow
description: Decide how to use TealHQ for job search stages, including saved searches, Chrome extension bookmarking, Job Tracker fields, Resume Builder, Job Matcher, Contacts Tracker, notes, status, and follow-up workflow. Trigger when organizing or updating the job pipeline in Teal.
---

# TealHQ Workflow Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.
- Treat Teal Resume Builder as a shared bullet and summary library. Assume edits to bullets or summaries can affect multiple resumes until the UI proves otherwise.
- Prefer reusing existing Teal bullets, summaries, and selected content before drafting new copy.
- If score improvement requires editing shared Teal bullets or summaries, present the proposed changes for approval before mutating shared content unless the user explicitly asked for direct mutation.
- Confirm the live application form requirements early so optional work such as cover-letter drafting only happens when the target flow supports or needs it.
- When editing a Teal summary, calculate tenure from the Sep 2007 National Positions start date and use the current exact count, currently `18 years in marketing` as of May 7, 2026. Do not use stale shorthand like `15+ years`.

## Purpose
Determine how to use Teal features for each job-search stage.

## Required Sources
1. `docs/teal-workflow.md`
2. `docs/job-search-operating-system.md`
3. `templates/role-intake.md`

## Inputs
- Current job-search stage
- Role or saved search
- Teal status
- User goal

## Process
1. Choose the relevant Teal feature: Job Search, saved alerts, Chrome extension, Job Tracker, Resume Builder, Job Matcher, Contacts Tracker, notes, interview tracking, or interview practice.
2. Use Chrome and visible Teal UI for job search, scoring, records, resumes, cover letters, downloads, and application forms.
3. For live applications, inspect the actual application flow as early as possible to confirm what uploads or questions are present.
4. Define the minimum asset set required for the current flow.
5. Use Job Matcher and Analyzer to gather truthful gap terms before editing shared resume content.
6. When gap terms suggest shared-bullet edits, produce a concise proposed-change list grouped into hard skills, soft skills, business terms, and platforms/tools.
7. Update `Skills & Interests` into role-specific categories that reflect the resume's actual mandate and highest-value truthful terms.
8. Re-run Job Matcher and Analyzer after each meaningful skills/category update before escalating to summary or bullet edits.
9. Define what Codex should prepare before Teal entry.
10. Define what must be manually confirmed in Teal.
11. Identify approval gates, including explicit user approval before any live submission.
12. Create a concise Teal update checklist.

## Output
- Teal workflow recommendation
- Tracker fields to update
- Notes to paste
- Approval checklist
- Required assets versus optional assets
- Role-specific `Skills & Interests` category plan
- Proposed shared-bullet or summary edits, if score improvement is blocked by missing truthful terms

## Safety
Do not invent a Teal API. Do not bypass Teal permissions or submit actions without approval.
