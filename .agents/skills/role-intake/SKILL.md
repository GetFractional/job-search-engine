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
- Teal tracker status

## Process
1. Capture the exact job title and company.
2. Verify the full JD is available, not just the URL.
3. Capture compensation, benefits, remote/hybrid, travel, relocation, and deadline.
4. Capture recruiter, hiring manager, and contacts if known.
5. Assign a provisional lane by mandate, not title alone.
6. Note missing information and immediate next action.

## Output
- Completed role intake
- Provisional lane
- Quick missing-info list
- Recommended next action

## Safety
Do not apply, message, or change Teal records in bulk without approval.
