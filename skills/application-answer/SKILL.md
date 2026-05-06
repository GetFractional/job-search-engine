---
name: application-answer
description: Draft concise, accurate, claim-safe answers to job application questions, including compensation, location, eligibility, motivation, experience, and role-fit prompts. Trigger when preparing application form answers or screening questionnaire responses.
---

# Application Answer Skill

## Purpose
Answer application questions concisely and safely, including compensation and location questions.

## Required Sources
1. `/Users/mattdimock/Downloads/01_matt_dimock_canonical_profile.md`
2. `/Users/mattdimock/Downloads/02_metrics_ledger.md`
3. `/Users/mattdimock/Downloads/04_story_bank.md`
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

## Safety
Do not submit. Do not hard-anchor low compensation unless required and approved.
