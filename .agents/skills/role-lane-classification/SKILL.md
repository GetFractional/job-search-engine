---
name: role-lane-classification
description: Classify a job by actual mandate into Matt's role lanes, including Revenue/Growth Operations, Lifecycle/CRM/Retention, Growth/Revenue Marketing, selective Head/VP Marketing, and Ecommerce/DTC Growth. Trigger before fit scoring, research, or asset drafting.
---

# Role Lane Classification Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.

## Purpose
Assign each role to the right lane by mandate, not title alone.

## Required Sources
1. `source-files/03_role_lane_glossary.md`
2. `source-files/01_matt_dimock_canonical_profile.md`

## Inputs
- Role title
- Full JD
- Company context
- Compensation and logistics, if available

## Process
1. Identify the role's actual mandate from responsibilities, KPIs, reporting line, and required skills.
2. Match the mandate to one primary lane.
3. Add one secondary lane only if it materially changes proof selection.
4. Flag misleading titles, such as broad marketing titles that are really ops/growth systems roles.
5. Flag poor-fit variants, such as brand-only, paid-media-only, merchandising-heavy, or highly political roles.

## Output
- Primary lane
- Secondary lane, if relevant
- Lane rationale
- Proof themes to prioritize
- Risks and objections

## Safety
Do not force a role into a better lane if the mandate does not support it.
