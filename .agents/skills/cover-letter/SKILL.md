---
name: cover-letter
description: Create concise, credible, role-specific cover letters that connect company needs, role mandate, Matt's proof points, and safe metrics. Trigger when drafting or reviewing cover letters for job applications.
---

# Cover Letter Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, cover letters, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.

## Purpose
Create concise, credible, persuasive cover letters that explain the business problem Matt solves, why this company, why this role, and why his proof fits.

## Required Sources
1. `source-files/01_matt_dimock_canonical_profile.md`
2. `source-files/02_metrics_ledger.md`
3. `source-files/04_story_bank.md`
4. `templates/cover-letter-brief.md`

## Inputs
- Research brief
- Fit scorecard
- Resume strategy
- Full JD
- Recipient, if known

## Process
1. Identify company-specific reason for interest.
2. Identify the business problem the role likely solves.
3. Select 1 to 2 safe proof points.
4. Explain why Matt fits the stage and mandate.
5. End with a calm CTA.
6. In Teal, use the Cover Letter tab, choose medium for standard roles or long for executive/research-heavy roles, and use a custom prompt grounded in the research brief.
7. If the application has a cover-letter upload or text slot, create the cover letter in Teal unless Matt explicitly opts out.
8. Export the Teal-designed finished letter when possible and name it `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`.
9. Keep the final cover letter to one page.
10. Never upload filenames containing `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels.
11. If Teal Cover Letter cannot be reached, generated, edited, or exported, stop with the blocker unless Matt explicitly approves a local-only fallback.

## Output
- Cover letter brief
- Cover letter draft
- Claim safety notes

## Safety
Do not sound desperate. Do not use gimmicks. Do not use unsupported metrics.
