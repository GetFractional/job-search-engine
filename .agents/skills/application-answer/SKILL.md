---
name: application-answer
description: Draft concise, accurate, claim-safe answers to job application questions, including compensation, location, eligibility, motivation, experience, and role-fit prompts. Trigger when preparing application form answers or screening questionnaire responses.
---

# Application Answer Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.

## Purpose
Answer application questions concisely and safely, including compensation and location questions.

## Required Sources
1. `source-files/01_matt_dimock_canonical_profile.md`
2. `source-files/02_metrics_ledger.md`
3. `source-files/04_story_bank.md`
4. `templates/application-answers.md`

## Inputs
- Exact application question
- Role
- Company
- Full JD
- Research brief
- Compensation context, if relevant

## Process
1. Identify question intent and risk.
2. Choose concise or expanded answer format.
3. Use safe proof and phrasing.
4. Preserve compensation leverage.
5. Flag sensitive or risky answers before submission.

## Output
- Concise answer
- Expanded answer, if useful
- Risk notes
- User confirmation items
- Any live-form approval gate that still blocks submission

## Safety
Do not submit. Do not hard-anchor low compensation unless required and approved.

## Standing Application Facts
Use these only when the form asks and no contradictory user instruction exists:
- Authorized to work in the U.S.: yes.
- Sponsorship now or later: no.
- Current state: TN.
- Relocation: open for the right opportunity, paid relocation preferred.
- Family or relatives at employer: no.
- Previously worked at employer: no unless evidence says otherwise.
- Veteran status: not a veteran.
- Pronouns: he/him only when asked.
- Voluntary race/gender fields: answer only when the user has approved that exact field or given standing permission.
