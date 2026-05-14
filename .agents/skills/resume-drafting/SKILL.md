---
name: resume-drafting
description: Draft tailored two-page resumes using the selected role lane, job-title language, validated metrics, story proof, and claim-safe phrasing. Trigger after resume strategy is complete and a role is worth pursuing.
---

# Resume Drafting Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Use `docs/teal-ui-navigation.md` when working in Teal Resume Builder. It maps Content Editor, Analyzer, Job Matcher, Designer, Cover Letter, and export verification.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.
- When the summary references tenure, calculate professional marketing experience from Matt's National Positions start year in 2007. As of 2026, use `19 years of professional marketing experience` when a calendar-year count is acceptable, or `18+ years` if exact start-month precision is required. Do not use stale shorthand like `15+ years`.

## Purpose
Create a tailored two-page resume using the correct lane, job-title language, validated metrics, and clean professional formatting.

## Required Sources
1. Resume strategy brief
2. `source-files/01_matt_dimock_canonical_profile.md`
3. `source-files/02_metrics_ledger.md`
4. `source-files/04_story_bank.md`

## Inputs
- Resume strategy brief
- Full JD
- Research brief
- Claim safety table

## Process
1. Use the required header:
   - Matt Dimock
   - Mount Juliet, TN
   - 805-620-2826 | mattdim805@gmail.com | linkedin.com/in/mattdimock/
   - Target Title: `[Exact Role Title]`
2. Write a concise 2-line summary.
   - If tenure is mentioned, use a correctly calculated professional marketing count from the 2007 National Positions start year.
   - Reference the target industry when it strengthens relevance. For Red Ventures Home Services, include telecom/connectivity, home services, marketplace growth, lifecycle CRM, ecommerce conversion, or revenue systems where truthful.
   - Treat Prosper Wireless as telecom experience, not telecom-adjacent. Use Xfinity/Comcast partnership or contract context only when useful and do not invent unrecalled partner names.
3. Add core strengths and selected highlights.
4. Use reverse-chronological experience.
5. Categorize tools and systems.
6. Include education/certifications only if strategically useful.
7. Keep to two pages or less unless explicitly required otherwise. In Teal, use preview/export to maximize useful two-page fit without spilling to page 3.
8. When using Teal, update Content Editor fields directly: target title, summary, bullets, selected content, and Skills & Interests.
9. Before editing, build a concise gap list from Job Matcher: hard skills, soft skills, business terms, platforms/tools, and terms to ignore as noise.
10. Use Job Matcher and Analyzer to improve truthful keyword coverage, especially hard skills, soft skills, platforms, tools, and role-specific terms.
   - If Job Matcher, Analyzer, or Teal Resume Builder cannot be reached, stop with the blocker unless the user explicitly approves a local-only fallback.
11. Prefer existing Teal bullets and summary lines first. Treat Teal as a reusable content library, not as isolated per-resume text.
12. Use checkboxes to include or exclude existing bullets and skills for the current role resume.
13. If a truthful gap is missing from the library, add one durable reusable bullet or skill rather than forcing a one-off keyword pile.
14. If score improvement requires editing shared bullets or summaries, propose the exact edits first and get approval before saving them unless Matt explicitly asked for direct mutation.
15. Leave `update in all resumes` or similar global-update options unchecked unless Matt explicitly approves that global change.
16. Prefer adding missing role language through real bullets and summary lines before adding Skills & Interests terms.
17. In Skills & Interests, add only high-value truthful terms. Do not use skill entries as a keyword dump.
18. Use the preferred category-style Skills & Interests format. Keep the resume skills section category-led and readable.
19. Before adding a skill, expand Skills & Interests and check for existing category entries and uncategorized duplicates. Do not add flat duplicate skills when a categorized equivalent already exists.
   - Do not rename an existing shared category for a different role lane. Create a new category when a new lane needs skills.
   - Keep professional tools in `Platforms & Execution Stack`; keep hospitality skills in a separate category such as `Hospitality Operations & Bar Support`.
20. If duplicate or badly formatted skills exist, first uncheck them for the current resume. Do not delete shared skills unless Matt explicitly asks for shared-library cleanup.
   - When Matt does ask for shared skill cleanup, delete exact and near duplicates and keep one canonical original skill. Treat `GA4`, `Google Analytics`, and `Google Analytics 4` as one concept; likewise `GTM` / `Google Tag Manager`, capitalization-only variants, singular/plural variants, and repeated entries such as `Targeting` / `targeting`.
   - Never leave uncategorized top-level skills checked above category groups.
21. Do not click `Delete Skill`, delete bullets, or restructure shared sections without explicit approval. Checkboxes include or exclude content from the current resume and should be changed deliberately.
22. Keep brand-specific metrics under the correct employer or clearly named client context.
23. Remove duplicate or near-duplicate lines across headline, summary, highlights, and experience.
24. Keep tone human and direct. No em dashes. No AI-sounding phrasing.
25. For Get Fractional/OC Ramps bullets, prefer sharper systems-and-outcome framing over weak baseline-comparison-only language. Stronger default angle: connect full Shopify store ownership, store strategy, design, copy, development coordination or implementation, product and collection page improvements, onsite CRO, SEO, email, GA4/GTM instrumentation, Shopify performance reporting, campaign planning, and agency accountability into a measurable ecommerce operating system; use the 39% H2 vs H1 lift or record December month when role-relevant.
26. Use Designer only after content is stable, and only for layout, margins, template, and two-page fit.
   - Add enough spacing between company headings and prior bullets for readability.
   - Prefer simple bullet glyphs over double-angle symbols when Teal supports it.
27. If an application accepts file upload, never paste the resume into a manual text field as an automation shortcut. If upload fails with `fileChooser.setFiles failed` and `Not allowed`, verify the Codex Chrome extension's `Allow access to file URLs` toggle at `chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg`, restart Chrome or start the Chrome task again, then retry the visible upload control. Stop and report the upload blocker unless Matt explicitly approves manual entry or a narrow manual file-picker step.
28. If reformatting outside Teal, remove local file path footers, browser print headers/footers, timestamps, URLs, and any machine-generated footer text before delivery or upload.
29. Export the final resume as `{Company} - {Role} - Matt Dimock - Resume.pdf`.
30. If Teal exports a generic or suffixed filename, rename or copy the local file to the required format before upload or delivery. Never upload filenames containing `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels.
31. Verify the export through the filesystem, not just by clicking `Export PDF`.

## Output
- Tailored resume draft
- Claim safety notes
- Teal Job Matcher follow-up items
- Teal Analyzer status and two-page preview/export status
- Bullet and skill library actions: toggled, added, edited, or blocked
- Proposed shared-bullet or summary edits, if needed for score improvement

## Safety
No keyword stuffing. No random bolding. No unsupported metrics. No over-attribution.
No detached client proof. No repeated positioning lines. No contextless wins that make the resume read like assembled fragments.
