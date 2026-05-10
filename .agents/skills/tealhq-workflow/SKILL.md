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
- Prioritize roles with posted salary ranges and family-supportive benefits when fit is otherwise comparable. Capture visible dependent healthcare, 401(k), bonus, equity, parental leave, PTO, remote flexibility, childcare, and wellness support in notes when they affect fit.
- If salary sources conflict on currency, country, or range, prefer the employer or ATS source for application readiness, record the conflict in the ledger, and mark the role for manual re-verification before applying.
- Speed up Teal through visible UI only. Use inline table edits for verified low-risk Tracker fields, the detail screen for full JD/source/notes, and page-context JavaScript only for visible DOM inspection or targeting.
- Use `docs/teal-workflow.md` as the canonical Teal UI feature map. Do not duplicate the full map in this skill.
- For controlled Teal cleanup, cap the first pass at 5 records, keep a before/after ledger, and checkpoint before continuing.
- Do not bypass Cloudflare, CAPTCHA, login, permissions, rate limits, or paywalls. Do not extract tokens, print localStorage secrets, or mutate private Teal backend endpoints.
- When editing a Teal summary, calculate tenure from the Sep 2007 National Positions start date and use the current exact count, currently `18 years in marketing` as of May 7, 2026. Do not use stale shorthand like `15+ years`.
- Use `/Users/mattdimock/.codex/skills/alen-sultanic/SKILL.md` selectively when summary structure, cover-letter direction, or application messaging can benefit from stronger proof-backed positioning.
- Treat Teal Match Score as a practical optimization target. If the first draft lands well below the visible recommendation, improve truthful keyword coverage in the summary and selected bullets before relying on `Skills & Interests` alone.
- When the JD contains important hard or soft skills that Matt can support truthfully, weave those terms into recruiter-readable prose where they fit naturally, especially the target title, summary, recent bullets, and role-specific highlights.
- When application work needs broader reasoning than Teal mechanics alone, pull in the relevant local skills rather than improvising from one playbook. Typical stack: `role-intake`, `role-lane-classification`, `company-research`, `resume-strategy`, `resume-drafting`, `qa-fact-check`, and `application-answer`.

## Purpose
Determine how to use Teal features for each job-search stage.

## Required Sources
1. `docs/teal-workflow.md`
2. `docs/job-search-protocol-index.md`
3. `docs/codex-teal-application-protocol.md`
4. `docs/job-search-protocol-benchmark.md`
5. `docs/job-search-operating-system.md`
6. `templates/role-intake.md`

## Protocol Routing Rule
Use `docs/job-search-protocol-index.md` for mode selection, prompt templates, shared-content gates, and canonical skill naming. Use this skill for Teal-specific execution details only.

Default to `gpt-5.4-mini` with medium reasoning for Teal job search. Use `GPT-5.5` with medium reasoning for application packs, final QA, interviews, compensation, and protocol repair. Do not recommend high reasoning for this Job Search protocol.

## Inputs
- Current job-search stage
- Role or saved search
- Teal status
- User goal

## Process
1. Choose the relevant Teal feature: Job Search, saved alerts, Chrome extension, Job Tracker, Resume Builder, Job Matcher, Contacts Tracker, notes, interview tracking, or interview practice.
2. Use Chrome and visible Teal UI for job search, scoring, records, resumes, cover letters, downloads, and application forms.
3. For Tracker maintenance, prefer inline table edits for verified salary min, salary max, location, status, follow-up, deadline, and Excitement. Use the detail screen for source URL, full JD, notes, resumes, contacts, and any field that proves brittle.
4. For controlled Teal cleanup, use the checklist in `docs/teal-workflow.md`: default to 5 records, record before value, source evidence, after value, verification method, and rollback note, then checkpoint before continuing.
5. Do not batch Date Posted, source URL, full JD, rich notes, shared resume content, or application statuses that imply external progress.
6. Treat Date Posted as source-backed and verification-sensitive. Update it one record at a time, and stop if the inline date picker creates an incorrect or uncertain value.
7. If Intercom or another floating widget blocks lower-row table controls, scroll the row above the widget or close the widget before clicking. Do not guess through the obstruction.
8. Use Compensation analysis only for comparison and trend context. Reconcile any salary value against the Tracker row and live source evidence before editing a record.
9. If salary evidence conflicts across sources, stop after the safest visible value is recorded and mark the role for manual re-verification before application work.
10. Use page-context JavaScript only to inspect visible DOM, count elements, extract visible row text, or identify visible controls. Do not use it to bypass auth or mutate private endpoints.
11. For job search, open Teal Trackers first, record the Bookmarked baseline, and keep a save ledger.
12. For job search, keep Chrome lean. Close stale job tabs, duplicate source tabs, extension popups, and the Teal side panel when they are not actively needed, and avoid carrying browser state in the model when a compact ledger is enough.
13. For job search, evaluate one source posting tab at a time. Keep the candidate queue in the ledger, then reuse or close the source tab before opening the next candidate.
14. Prefer roles with posted annual base salary ranges and family-supportive benefits when fit, mandate, and logistics are otherwise comparable.
15. For job search, use this save-path order after the company or ATS posting is verified active, scored, assigned intended Excitement, and prepared with notes: Teal Job Search or saved-search Save/Bookmark when the role is already inside Teal, then Teal Chrome extension from the live source posting, then Manual Add Job only as a last resort.
16. Do not save from snippets, stale aggregator cards, generic redirects, or postings that appear closed, expired, filled, removed, or outside the requested freshness window without a strong reason.
17. Reject hidden geography blockers early, especially UK-only, London, EMEA-only, Europe-only, country-limited, state-limited, hub-limited, commuting-radius, hybrid, or relocation-required roles Matt does not clearly fit.
18. If the extension exposes Excitement and notes before save, set Excitement first, add notes second, then click Bookmark or Save third.
19. If the extension cannot set those fields before save, treat the save as provisional and immediately open the Teal Tracker record to finish Excitement, notes, salary fields, and full JD before counting the role.
20. Treat extension saves as Provisional until confirmed in Teal. Use save labels: Confirmed saved, Duplicate existing, Provisional, Delayed confirmed, Failed save, Rejected.
21. When annual base salary is visible, add it to Teal's structured Minimum Salary and Maximum Salary fields after saving. Put ranges into min and max, exact salary into both, `up to` into max only, and `from` or `starting at` into min only. Do not invent salary fields from hourly, OTE, bonus, equity, vague, or missing compensation.
22. Manual Add Job is allowed only when Teal-native Save/Bookmark and the Chrome extension are unavailable or fail, and only after the full actual JD has been captured from the live source posting. Do not use Manual Add Job just because extension capture is flaky.
23. If using Manual Add Job, paste the full actual JD into the job description field before saving or in the same edit session, then reopen the record and verify the Job Description or Original Job Description section contains the full text. If the JD field is unavailable or the JD cannot be pasted immediately, stop and report the blocker instead of creating a bare bookmarked record.
24. Do not add multiple manual records before verifying the first one has the full JD.
25. Do not use Latest Saved Jobs or Tracker counts as proof of new saves without ledger and record confirmation.
26. Treat the requested count as qualified confirmed saves, not reviewed candidates. Keep searching after rejects until the target is met or a real blocker/search exhaustion point is reached.
27. Expand across title aliases, adjacent lanes, saved searches, job boards, and company career pages before returning fewer than the target.
28. Pivot after 5 candidates in one title family with 0 qualified saves, 2 repeated geo blockers, 10 minutes without a qualified save, 2 ambiguous extension events, or poor-quality result skew.
29. For broad searches, send a non-blocking progress update every 3 confirmed saves or every 10 candidates reviewed.
30. Use the browser-loop fail-safe after 2 confirmed saves, 12 candidates reviewed, 8 minutes of active browser work, or 40 browser actions. Return a compact ledger and continuation step rather than risking a null closeout.
31. Do not wait for the user after routine progress updates. Continue unless there is a real external blocker.
32. Stop with a clear blocker if Teal, the extension, login, CAPTCHA, or source sites stop working.
33. For live applications, inspect the actual application flow as early as possible to confirm what uploads, optional assets, and screening questions are present.
34. Define:
   - the minimum required asset set
   - the highest-value optional asset set
   - the application-specific question set that research must support
35. For viable roles, if the application accepts an optional cover letter, prepare one by default unless the user explicitly skips it or the role is too weak to justify the added asset.
36. Capture the benchmark baseline before meaningful Teal edits: Match Score, Analyzer score when visible, current page count when known, and any shared-content risk.
37. Use Job Matcher and Analyzer to gather truthful gap terms before editing shared resume content.
38. When Teal exposes faster UI actions for a missing term, such as adding the skill directly or creating a bullet from the missing-skill list, prefer the shortest truthful path that improves the resume without adding redundant copy.
39. Build a missing-term coverage map from the JD and Job Matcher, grouped into hard skills, soft skills, business terms, and platforms/tools. Mark each term as:
   - prose first
   - skills category fit
   - external asset only
   - noise to ignore
40. Label remaining gaps for the benchmark as `covered in prose`, `covered in skills`, `external asset only`, `unsupported`, or `noise`.
41. When gap terms suggest shared-bullet edits, produce a concise proposed-change list grouped into hard skills, soft skills, business terms, and platforms/tools.
42. Prioritize the highest-signal truthful JD terms that can be reflected in live prose, especially the summary and recent experience bullets, before treating them as skills-only terms.
43. Update the summary so it states mandate fit plainly and names relevant industries or business contexts when that improves relevance.
44. Use selected bullets to surface missing mandate language that is truthful and specific, such as lifecycle, retention, onboarding, segmentation, engagement, automation, reporting, customer-success partnership, channel mix, experimentation, ownership, coaching, systems thinking, analytical thinking, or tool fluency.
45. Before adding a new bullet or summary line, compare it against existing selected content and nearby bullets. If the meaning materially overlaps, replace or rewrite the weaker line instead of keeping both.
46. If the visible Match Score is below the role's recommended floor, keep iterating through summary and bullet wording before assuming the draft is good enough.
47. Ban weak or cryptic shorthand metrics in Teal summaries. If the line needs explanation to land, rewrite it or remove it.
48. Update `Skills & Interests` into role-specific categories that reflect the resume's actual mandate and highest-value truthful terms.
49. If categorized skills are active, do not leave an uncategorized top skill row selected. Turn those uncategorized chips off locally on the resume before export.
50. Use one canonical label per concept inside a single resume, for example `GA4` or `Google Analytics 4`, not both; `Systems Thinking`, not `Systems Thinker`, unless there is a deliberate reason.
51. Use checkbox-only toggles when cleaning Teal skill chips. Do not use chip delete actions unless the user explicitly wants the skill removed from work history across all resumes.
52. Category names must match the role's actual mandate. Replace inherited or generic buckets that no longer fit, and do not leave weak categories like `SEO, CRO & Conversion` on lifecycle-first roles unless the JD truly requires them.
53. Remove low-signal standalone skills that do not carry enough meaning by themselves, such as `Landing Pages`, when a stronger role-native term or tool can fill the space more credibly.
54. Remove vague filler skills like `Website Optimization` when a stronger role-native term can carry the same evidence more clearly.
55. Target at least 24 truthful reflected skills across 5 to 6 categories, with a preferred target around 28 when the proof and layout support it cleanly.
56. Use extra second-page capacity for stronger adjacent proof, broader high-value skill coverage, and relevant tool fluency before compressing the layout.
57. Use page-budget discipline inside Teal. When a useful new phrase pushes the draft to three pages, shorten or replace weaker text before dropping high-value mandate language.
58. When relevant and source-backed, reflect AI-assisted workflows, agentic research, automation systems, and human oversight as part of Matt's operator profile.
59. When the company uses tools Matt has actually used, surface those tools naturally in the Teal resume, skills, or cover letter when they improve fit.
60. Re-run Job Matcher and Analyzer after each meaningful summary, bullet, or skills/category update.
61. Prefer manual, source-backed contact entry on live forms when browser autofill suggests stale addresses, outdated profiles, or mismatched location history.
62. Fill safe pre-submit application questions by default when the user has provided standing facts, including veteran, disability, ethnicity, race, and government-clearance questions.
63. Rename Teal exports to the strict local naming standard before upload or delivery.
64. Close stale or duplicate Chrome tabs opened during the run once they are no longer needed.
65. Run a final external-asset QA pass across resume, cover letter, and prepared application answers before calling the package ready.
66. Record one benchmark row and one change-log note when the protocol itself is changed, so future chats can measure whether the new rule improved outcomes.
67. Define what Codex should prepare before Teal entry.
68. Define what must be manually confirmed in Teal.
69. Identify approval gates, including explicit user approval before any live submission.
70. Create a concise Teal update checklist.

## Output
- Teal workflow recommendation
- Tracker fields to update
- Notes to paste
- Approval checklist
- Required assets versus optional assets
- Preferred summary angle
- Role-specific `Skills & Interests` category plan
- Benchmark baseline and final values for Standard and Deep runs
- Proposed shared-bullet or summary edits, if score improvement is blocked by missing truthful terms
- Redundancy-replacement plan for any overlapping bullets or summary lines
- Estimated tokens used, main token drivers, new learnings, and fixes applied to the workflow

## Safety
Do not invent a Teal API. Do not bypass Teal permissions or submit actions without approval.
