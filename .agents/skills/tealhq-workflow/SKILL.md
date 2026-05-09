---
name: tealhq-workflow
description: Decide how to use TealHQ for job search stages, including saved searches, Chrome extension bookmarking, Job Tracker fields, Resume Builder, Job Matcher, Contacts Tracker, notes, status, and follow-up workflow. Trigger when organizing or updating the job pipeline in Teal.
---

# TealHQ Workflow Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.
- Treat Teal Resume Builder as a shared bullet and summary library. Assume edits to bullets or summaries can affect multiple resumes until the UI proves otherwise.
- Prefer reusing existing Teal bullets, summaries, and selected content before drafting new copy.
- If score improvement requires editing shared Teal bullets or summaries, present the proposed changes for approval before mutating shared content unless the user explicitly asked for direct mutation.
- Confirm the live application form requirements early so the asset plan is driven by the real form, not assumptions.
- When editing a Teal summary, calculate tenure from the Sep 2007 National Positions start date and use the current exact count, currently `18 years in marketing` as of May 7, 2026. Do not use stale shorthand like `15+ years`.
- Use `/Users/mattdimock/.codex/skills/alen-sultanic/SKILL.md` selectively when summary structure, cover-letter direction, or application messaging can benefit from stronger proof-backed positioning.
- Treat Teal Match Score as a practical optimization target. If the first draft lands well below the visible recommendation, improve truthful keyword coverage in the summary and selected bullets before relying on `Skills & Interests` alone.
- When the JD contains important hard or soft skills that Matt can support truthfully, weave those terms into recruiter-readable prose where they fit naturally, especially the target title, summary, recent bullets, and role-specific highlights.
- When application work needs broader reasoning than Teal mechanics alone, pull in the relevant local skills rather than improvising from one playbook. Typical stack: `role-intake`, `role-lane-classification`, `company-research`, `resume-strategy`, `resume-drafting`, `qa-fact-check`, and `application-answer`.

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
2. Use Chrome and visible Teal UI for job search, scoring, records, resumes, cover letters, downloads, and application forms.
3. For live applications, inspect the actual application flow as early as possible to confirm what uploads, optional assets, and screening questions are present.
4. Define:
   - the minimum required asset set
   - the highest-value optional asset set
   - the application-specific question set that research must support
5. For viable roles, if the application accepts an optional cover letter, prepare one by default unless the user explicitly skips it or the role is too weak to justify the added asset.
6. Use Job Matcher and Analyzer to gather truthful gap terms before editing shared resume content.
7. When Teal exposes faster UI actions for a missing term, such as adding the skill directly or creating a bullet from the missing-skill list, prefer the shortest truthful path that improves the resume without adding redundant copy.
8. When gap terms suggest shared-bullet edits, produce a concise proposed-change list grouped into hard skills, soft skills, business terms, and platforms/tools.
9. Prioritize the highest-signal truthful JD terms that can be reflected in live prose, especially the summary and recent experience bullets, before treating them as skills-only terms.
10. Update the summary so it states mandate fit plainly and names relevant industries or business contexts when that improves relevance.
11. Use selected bullets to surface missing mandate language that is truthful and specific, such as lifecycle, retention, onboarding, segmentation, engagement, automation, reporting, customer-success partnership, channel mix, experimentation, or tool fluency.
12. Before adding a new bullet or summary line, compare it against existing selected content and nearby bullets. If the meaning materially overlaps, replace or rewrite the weaker line instead of keeping both.
13. If the visible Match Score is below the role's recommended floor, keep iterating through summary and bullet wording before assuming the draft is good enough.
14. Ban weak or cryptic shorthand metrics in Teal summaries. If the line needs explanation to land, rewrite it or remove it.
15. Update `Skills & Interests` into role-specific categories that reflect the resume's actual mandate and highest-value truthful terms.
16. Target at least 24 truthful reflected skills across 5 to 6 categories, with a preferred target around 28 when the proof and layout support it cleanly.
17. Use extra second-page capacity for stronger adjacent proof, broader high-value skill coverage, and relevant tool fluency before compressing the layout.
18. When relevant and source-backed, reflect AI-assisted workflows, agentic research, automation systems, and human oversight as part of Matt's operator profile.
19. When the company uses tools Matt has actually used, surface those tools naturally in the Teal resume, skills, or cover letter when they improve fit.
20. Re-run Job Matcher and Analyzer after each meaningful summary, bullet, or skills/category update.
21. Prefer manual, source-backed contact entry on live forms when browser autofill suggests stale addresses, outdated profiles, or mismatched location history.
22. Fill safe pre-submit application questions by default when the user has provided standing facts, including veteran, disability, ethnicity, race, and government-clearance questions.
23. Rename Teal exports to the strict local naming standard before upload or delivery.
24. Close stale or duplicate Chrome tabs opened during the run once they are no longer needed.
25. Run a final external-asset QA pass across resume, cover letter, and prepared application answers before calling the package ready.
26. Define what Codex should prepare before Teal entry.
27. Define what must be manually confirmed in Teal.
28. Identify approval gates, including explicit user approval before any live submission.
29. Create a concise Teal update checklist.

## Output
- Teal workflow recommendation
- Tracker fields to update
- Notes to paste
- Approval checklist
- Required assets versus optional assets
- Preferred summary angle
- Role-specific `Skills & Interests` category plan
- Proposed shared-bullet or summary edits, if score improvement is blocked by missing truthful terms
- Redundancy-replacement plan for any overlapping bullets or summary lines
- Estimated tokens used, main token drivers, new learnings, and fixes applied to the workflow

## Safety
Do not invent a Teal API. Do not bypass Teal permissions or submit actions without approval.
