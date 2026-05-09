---
name: cover-letter
description: Create concise, credible, role-specific cover letters that connect company needs, role mandate, Matt's proof points, and safe metrics. Trigger when drafting or reviewing cover letters for job applications.
---

# Cover Letter Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.

## Purpose
Create concise, credible, persuasive cover letters that explain the business problem Matt solves, why this company, why this role, and why his proof fits.

## Required Sources
1. `/Users/mattdimock/Downloads/01_matt_dimock_canonical_profile.md`
2. `/Users/mattdimock/Downloads/02_metrics_ledger.md`
3. `/Users/mattdimock/Downloads/04_story_bank.md`
4. `templates/cover-letter-brief.md`

## Inputs
- Research brief
- Fit scorecard
- Resume strategy
- Full JD
- Recipient, if known

## Process
1. Confirm the live application accepts a cover letter, or confirm the user wants one prepared anyway.
2. Identify company-specific reason for interest.
3. Identify the business problem the role likely solves.
4. Select 1 to 2 safe proof points.
5. Explain why Matt fits the stage and mandate.
6. End with a calm CTA.
7. In Teal, use the Cover Letter tab, choose medium for standard roles or long for executive/research-heavy roles, and use a custom prompt grounded in the research brief.
8. Export or copy the finished letter and name it `{Company} - {Role} - Matt Dimock - Cover Letter`.

## Workflow Rule
For viable roles where the live application flow supports an optional cover letter, create one by default unless the user explicitly skips it or the role is too weak to justify the extra work.

## Output
- Cover letter brief
- Cover letter draft
- Claim safety notes

## Safety
Do not sound desperate. Do not use gimmicks. Do not use unsupported metrics.
