---
name: role-intake
description: Normalize a new job opportunity into structured intake fields for title, company, JD, compensation, logistics, contacts, source URL, Way Ahead status, missing information, provisional lane, and next action. Trigger when a user provides a job URL, JD, saved Way Ahead record, or role to evaluate.
---

# Role Intake Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find, score, prepare, approve, or later submit a job pursuit through Way Ahead.
- Use the in-app Browser for public canonical sources and Way Ahead product QA. Use Google Chrome only when a source requires Matt's signed-in profile, Cloudflare, a challenge prompt, or extension behavior.
- Keep Way Ahead as the operating system for jobs, analyses, pursuits, assets, approvals, outcomes, and follow-ups. Teal is competitor research only and may not hold or mutate Matt's current job-search state.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, or external compensation negotiation unless the user explicitly approves. Voluntary self-ID, race, gender, veteran, disability, and clearance fields may be answered from standing defaults when no contradictory instruction exists.

## Purpose
Normalize incoming job information so the role can be scored, researched, saved
in Way Ahead, and turned into assets only when worthwhile.

## Required Sources
1. `source-files/03_role_lane_glossary.md`
2. `templates/role-intake.md`
3. Current Way Ahead source-version and pursuit contract

## Inputs
- Job title
- Company
- Full JD
- Compensation
- Location/logistics
- Recruiter or hiring manager
- Application URL
- Posting date, posting age, and freshness evidence
- Source employer, JD employer, and stored Way Ahead employer name
- Way Ahead pursuit status
- Visible applied date or terminal-stage status

## Process
1. Capture the exact job title and company.
2. Verify the full JD is available, not just the URL.
3. Verify the source link is active when feasible and record any blocker, redirect, or source uncertainty.
4. Capture posting date, posting age, freshness evidence, and freshness risk. Treat roles older than 30 days as stale-risk unless there is concrete active-hiring evidence, and roles older than 60 days as default pass/archive candidates unless Matt explicitly wants an exception.
5. Resolve the canonical employer by comparing the stored Way Ahead employer, source employer, and JD employer. Stop before asset work if they do not align.
6. Check Way Ahead status and applied date. Do not continue application work for `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, `Closed`, or any role with a visible applied date.
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
Do not apply, message, populate an employer form, or mutate Teal. Keep every
later external action behind its exact approval gate.
