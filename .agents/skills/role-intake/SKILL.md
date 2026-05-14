---
name: role-intake
description: Normalize a new job opportunity into structured intake fields for title, company, JD, compensation, logistics, contacts, source URL, Teal status, missing information, provisional lane, and next action. Trigger when a user provides a job URL, JD, Teal record, or role to evaluate.
---

# Role Intake Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.

## Purpose
Normalize incoming job information so the role can be scored, researched, saved in Teal, and turned into assets only when worthwhile.

## Required Sources
1. `source-files/03_role_lane_glossary.md`
2. `templates/role-intake.md`
3. `docs/teal-workflow.md`

## Inputs
- Job title
- Company
- Full JD
- Compensation
- Location/logistics
- Recruiter or hiring manager
- Application URL
- Posting date, posting age, and freshness evidence
- Source employer, JD employer, and Teal company name
- Teal tracker status
- Visible applied date or terminal-stage status

## Process
1. Capture the exact job title and company.
2. Verify the full JD is available, not just the URL.
3. Verify the source link is active when feasible and record any blocker, redirect, or source uncertainty.
4. Capture posting date, posting age, freshness evidence, and freshness risk. Treat roles older than 30 days as stale-risk unless there is concrete active-hiring evidence, and roles older than 60 days as default pass/archive candidates unless Matt explicitly wants an exception.
5. Resolve the canonical employer by comparing Teal company, source employer, and JD employer. Stop before asset work if they do not align.
6. Check Teal status and applied date. Do not continue application work for `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, `Closed`, or any role with a visible applied date.
7. Check for duplicate wrapper or aggregator risk, especially records where the saved company differs from the real employer.
8. Capture compensation, benefits, remote/hybrid, travel, relocation, and deadline.
9. Capture recruiter, hiring manager, and contacts if known.
10. Assign a provisional lane by mandate, not title alone.
11. Note missing information and immediate next action.

## Output
- Completed role intake
- Provisional lane
- Source-active status, posting age, freshness evidence, and freshness risk
- Canonical employer status
- Duplicate-wrapper and already-applied checks
- Quick missing-info list
- Recommended next action

## Safety
Do not apply, message, or change Teal records in bulk without approval.
