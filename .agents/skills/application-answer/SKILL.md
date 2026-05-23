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
- Stop before application submission, outreach, references, or external compensation negotiation unless the user explicitly approves. Voluntary self-ID, race, gender, veteran, disability, and clearance fields may be answered from standing defaults when no contradictory instruction exists.

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
5. Use standing defaults for self-ID and eligibility fields when available, and flag only fields that lack a safe default.
6. For hospitality and Harri-style forms, explicitly classify each answer as one of: standing default, user-provided fact, safe free-text fallback, or blocker.
7. Re-check answers that commonly drift in hospitality forms: hourly pay, shift and weekend availability, start date, prior employer, referral, transportation, commute, and conflicting-employment language.

## Output
- Concise answer
- Expanded answer, if useful
- Risk notes
- User confirmation items
- Any live-form approval gate that still blocks submission

## Safety
Do not submit. Do not hard-anchor low compensation unless required and approved.
For compensation fields:
- Never guess an hourly or salary number just to get through a form.
- If the field allows free text, prefer `Negotiable` unless Matt has given a specific target for that exact role.
- If the field requires a numeric value and no approved number exists, stop and ask Matt what to use rather than inventing one.
- Treat low-anchor guesses such as `18` for hospitality support roles as incorrect unless Matt explicitly instructed that number.
For hospitality support roles:
- Treat free-text hourly-pay prompts as `Negotiable` by default unless Matt has approved a specific number for that role.
- Treat availability as a truth-sensitive live-form answer, not a convenience field. Do not broaden or narrow it at the last minute without checking the user's stated intent.
- Treat immediate-start claims, transportation claims, and conflicting-employment acknowledgements as user-specific facts that must match current instructions.

## Standing Application Facts
Use these only when the form asks and no contradictory user instruction exists:
- Authorized to work in the U.S.: yes.
- Sponsorship now or later: no.
- Current state: TN.
- Relocation: open for the right opportunity, paid relocation preferred.
- SMS consent for employer follow-up about the job application: yes.
- Valid passport: yes.
- Canada travel for work: yes, with prior business-travel history to Canada.
- Family or relatives at employer: no.
- Previously worked at employer: no unless evidence says otherwise.
- Race/Ethnicity: White / Not Hispanic or Latino.
- Gender: male.
- Veteran status: not a protected veteran / not a veteran.
- Disability status: no disability / no history or record of disability.
- Security clearance: no active clearance unless Matt provides one for the exact application.
- Pronouns: he/him only when asked.
- Voluntary self-ID fields: fill using these standing defaults without pausing only when the labels map cleanly. If the form offers only decline-to-answer choices or wording does not map cleanly to these defaults, stop before submit and surface the exact field as a blocker instead of guessing.
