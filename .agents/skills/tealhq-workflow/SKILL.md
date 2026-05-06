---
name: tealhq-workflow
description: Decide how to use TealHQ for job search stages, including saved searches, Chrome extension bookmarking, Job Tracker fields, Resume Builder, Job Matcher, Contacts Tracker, notes, status, and follow-up workflow. Trigger when organizing or updating the job pipeline in Teal.
---

# TealHQ Workflow Skill

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
2. Define what Codex should prepare before Teal entry.
3. Define what must be manually confirmed in Teal.
4. Identify approval gates.
5. Create a concise Teal update checklist.

## Output
- Teal workflow recommendation
- Tracker fields to update
- Notes to paste
- Approval checklist

## Safety
Do not invent a Teal API. Do not bypass Teal permissions or submit actions without approval.
