---
name: tealhq-workflow
description: Decide how to use TealHQ for job search stages, including saved searches, Chrome extension bookmarking, Job Tracker fields, Resume Builder, Job Matcher, Contacts Tracker, notes, status, and follow-up workflow. Trigger when organizing or updating the job pipeline in Teal.
---

# TealHQ Workflow Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- On Windows, route Teal work through the Codex Chrome plugin and Matt's logged-in Chrome profile. Do not use isolated/headless Playwright for Teal workflows because it drops session state and can trigger Cloudflare blocking.
- If live Chrome access is uncertain, use `job-search-chrome-teal-recovery` before any Teal workflow step. Do not stop after the bridge repair script alone; prove the thread can claim or open a Chrome extension-backed Teal tab.
- If the runtime probe lists `Chrome` as an extension backend and `browser.user.openTabs()` returns visible tabs, Chrome is available. Classify any later problem as stale-tab, Teal navigation/readability, text-entry, upload, login/security, or application-site failure instead of rerunning Chrome repair or saying Chrome cannot be seen.
- Use `docs/teal-ui-navigation.md` as the route and UI map for Teal. It applies to Mac and Windows Chrome sessions unless a section explicitly says Windows.
- Keep one persistent `Job Tracker` tab open as the default Teal anchor tab for this workspace.
- Keep one active Teal work tab set per role when possible. Reuse the same visible working window or tab group for that role instead of opening duplicate `preview`, `matching`, `analysis`, `cover-letter`, or application tabs.
- When another active Codex agent or thread is already using Teal in Chrome, open a separate Chrome-backed Teal window or tab group for the current role rather than sharing the same active Teal window.
- On concurrent multi-machine use of the same Chrome profile, manage only the tabs visible in the current machine's active session. Do not assume hidden tab groups on the other machine can be safely inspected or cleaned up.
- Use Teal slow mode: direct route, 5 to 8 second wait after route/tab changes, confirm title and URL, then use targeted role/name locators. Retry one targeted action once; after a second failure, reduce scope or report the blocker.
- For text entry in Windows Chrome-backed Teal, avoid `locator.fill()` when the session shows `Browser Use virtual clipboard is not installed` or CDP timeouts. Prefer Chrome tab clipboard paste: `tab.clipboard.writeText(text)`, focus the field, then `tab.dom_cua.keypress({ keys: ["CTRL", "V"] })`. Use `scripts/paste-into-focused-window.ps1` as the OS clipboard fallback only after visibly focusing the target field; include `-WindowTitle "Teal"` when Chrome may not be foreground.
- Treat Cloudflare, login prompts, CAPTCHA, `about:blank`, or missing live tabs as wrong-surface evidence for Teal, not as permission to switch to isolated Playwright.
- If an existing Teal tab is locked by another browser session, open a fresh Chrome-extension-backed Teal tab and continue from the direct route. Do not treat a stale tab claim as a bridge failure.
- Before trusting any Teal page, refresh that `app.tealhq.com` tab once and wait 5 to 8 seconds for the page to settle. Treat pre-refresh Teal state as stale-risk whenever another machine may have changed the same account.
- If the refreshed Teal state differs from what was visible before refresh, discard the old read and continue only from the refreshed state.
- If Chrome-backed Teal loads but the tracker, Resume Builder, Job Matcher, or Analyzer is unreadable after slow scoped navigation and one fresh extension-backed tab attempt, stop with a precise blocker and ask for a screenshot, direct Teal record URL, or pasted JD rather than guessing.
- Use `mattdim805@gmail.com` for Gmail, Google Calendar, and Google Drive job-search workflows. Do not use work/client Google accounts for personal job-search work unless Matt explicitly approves it.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves the exact final assets, copy, destination, and external action.
- Treat Teal Resume Builder as a shared bullet and summary library. Assume edits to bullets or summaries can affect multiple resumes until the UI proves otherwise.
- Treat Teal bullets and Skills & Interests as reusable library items with per-resume inclusion controlled by checkboxes.
- Prefer toggling existing truthful bullets and skills before editing or adding.
- Keep Skills & Interests category-led. Prefer existing bold/category-style groups over loose flat keywords.
- Before adding skills, expand Skills & Interests and check for existing categorized entries and uncategorized duplicates.
- Do not add a flat skill when the same or clearer skill already exists inside a category.
- Never create a pseudo-category as a flat uncategorized skill by prefixing the skill text with a category name, for example `Analytics Systems: GA4 / GTM / dashboards`. If a needed category does not exist, create the actual category first so Teal renders the category name as a bold heading, then add the child skills inside that category.
- Never leave uncategorized top-level skills checked above category groups; they display as a malformed comma-list before the preferred category sections.
- Treat exact and near-duplicate skills as duplicates. Examples: `GA4`, `Google Analytics`, and `Google Analytics 4`; `GTM` and `Google Tag Manager`; capitalization-only variants; singular/plural variants; and repeated entries like `Targeting` / `targeting`.
- Do not rename an existing shared category for a different role lane. Create a new category when a new lane needs skills. Keep professional tools in `Platforms & Execution Stack`; keep hospitality skills in a separate category such as `Hospitality Operations & Bar Support`.
- Do not use Skills & Interests as a keyword dump to chase Job Matcher. Use target title, summary, and real proof bullets first.
- For Red Ventures, Allconnect, MyMove, telecom/connectivity, home-services marketplace, or similar roles, reference the actual industry context in the resume summary and category-style skills. Prosper Wireless is telecom experience, not telecom-adjacent. Do not let the summary or Skills & Interests collapse into generic lifecycle marketing keywords.
- Add new durable reusable bullets or skills when a role reveals a real, source-backed gap.
- Leave `update in all resumes` or other global-update options unchecked unless Matt explicitly approves a global library change.
- Do not delete skills, delete bullets, or run shared-library cleanup during application work unless Matt explicitly asks for shared-library cleanup.
- If Matt explicitly asks for shared skill cleanup, delete exact and near-duplicate skills from the Teal library and keep one canonical original skill. Do not merely uncheck duplicates if the goal is library cleanup.
- If score improvement requires editing shared Teal bullets or summaries, present the proposed changes for approval before mutating shared content unless the user explicitly asked for direct mutation.
- Confirm the live application form requirements early so optional work such as cover-letter drafting only happens when the target flow supports or needs it.
- If the application has a cover-letter upload or text slot, create a tailored one-page cover letter in Teal Cover Letter with a custom prompt unless Matt explicitly opts out.
- Before upload, enforce canonical filenames: `{Company} - {Role} - Matt Dimock - Resume.pdf` and `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`. Do not upload files with `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels.
- If an application provides file upload, do not paste a resume or cover letter into a manual text field as an automation fallback. If upload fails with `fileChooser.setFiles failed` and `Not allowed`, first verify the Codex Chrome extension's `Allow access to file URLs` toggle at `chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg`, restart Chrome or start the Chrome task again, and retry the visible upload control. Stop and report the upload/file-picker blocker unless Matt explicitly approves manual text entry or a narrow manual file-picker step for that application.
- When editing a Teal summary, use a current year-derived professional marketing experience count from the 2007 National Positions start year when the asset expects experience length. As of 2026, use `19 years of professional marketing experience` for calendar-year counts, or conservative `18+ years` language when exact month precision matters and the start month is unavailable. Do not default external summaries to `in marketing since 2007` when a years-of-experience claim is expected, and avoid stale shorthand like `15+ years`.
- In `Skills & Interests`, use the section `...` actions menu for bulk toggles. `Deactivate All` quickly unchecks all skills, and when all skills are inactive the same menu changes to `Activate All`.
- Do not use `Delete Inactive Skills` unless the user explicitly approves destructive cleanup, because it can remove stored skills rather than simply hiding them from the current resume.
- Treat every Teal skill as claim-bearing. Only add or keep a skill if Matt has actually done it.
- For hospitality and bridge-role resumes, prefer building the Teal skill library slowly from confirmed experience rather than keyword stuffing for score.
- When a skill is retained for future reuse, note the company or companies that support it, for example `Inventory Counts -> Lowe's Home Improvement`, so the claim can be defended later.
- If a skill is plausible but unconfirmed, ask Matt to confirm it before leaving it active or documenting it as reusable.
- Once a live role is being finalized in Teal, use only Teal-exported resume files for employer uploads. Do not upload older local DOCX or Canva variants after the Teal version becomes the approved source of truth.
- If Teal exports a generic filename, rename the local file to `{Company} - {Role} - Matt Dimock - Resume` before any upload or delivery. Do not upload a generic export name when the role-specific filename is required.
- Do not create a substitute local resume or cover letter for a live application just because Teal editing, preview, Analyzer, Job Matcher, or export is blocked. Default action is to stop, classify the blocker, and report what Teal step failed.
- A non-Teal resume or cover letter may be used only when Matt explicitly instructs a non-Teal fallback for that exact role after the Teal blocker is made visible.
- Treat posting age as a gating factor. Roles older than 30 days require stronger freshness evidence. Roles older than 60 days default to stale-risk and should usually not receive asset effort unless the user explicitly wants an exception.
- Treat Teal Home `Priorities` and dashboard cards as orientation only. Do not choose the next-best application target from Home alone. Final selection must be re-confirmed in Job Tracker Table view with visible status and date fields.
- For post-submit hygiene, prefer Job Tracker Table view for any field Teal exposes as an inline edit, especially status and Excitement. Use the detail page for notes and longer text, but use the table as the default audit and mutation surface when possible.
- After confirmed submission and post-submit hygiene, close the role-specific Teal and application tabs that are no longer needed. Leave the persistent `Job Tracker` tab open for the next role.
- For next-best application selection, exclude any role already in `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, `Closed`, or with a visible applied date. Do not reopen already-submitted roles through duplicate wrapper records.
- Treat aggregator wrappers as suspect until proven clean. If the Teal company name, live source employer, and JD employer disagree, stop and resolve the canonical employer before any resume, cover-letter, or application work.
- If a wrapper such as `Jobgether` points to an underlying employer such as `Housecall Pro`, do not proceed unless the canonical employer role is confirmed live, not already applied, and not duplicated elsewhere in Teal.

## Purpose
Determine how to use Teal features for each job-search stage.

## Required Sources
1. `docs/teal-workflow.md`
2. `docs/teal-ui-navigation.md`
3. `docs/job-search-continuous-improvement.md`
4. `docs/job-search-operating-system.md`
5. `templates/role-intake.md`

## Inputs
- Current job-search stage
- Role or saved search
- Teal status
- User goal

## Process
1. Choose the relevant Teal feature: Job Search, saved alerts, Chrome extension, Job Tracker, Resume Builder, Job Matcher, Contacts Tracker, notes, interview tracking, or interview practice.
2. Use Chrome and visible Teal UI for job search, scoring, records, resumes, cover letters, downloads, and application forms.
3. Prove the browser surface before selection, scoring, asset editing, upload, or status mutation. Passing means Chrome extension backend is listed, user tabs are visible, and Teal can be claimed or opened without Cloudflare/login.
4. Refresh the claimed or newly opened Teal tab once, wait 5 to 8 seconds, and only then trust the visible page state. If returning to a Teal tab after work on another machine, refresh again before using it.
5. Navigate by direct route when possible: `/job-tracker`, `/job-search`, `/resume-builder/resumes`, `/preview`, `/analysis`, `/matching`, or `/design/presentation`.
6. For Job Tracker work, refresh Table view before selecting the next-best role. Use status filters, visible posting dates, compensation, location, status, applied date, and Excitement before opening a role. Exclude `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, and `Closed` from the candidate set.
7. For Job Detail work, refresh the detail page before trusting the heading, source link, status radios, notes, applied date, detail tabs, or Job Description sections. Avoid repeated whole-page snapshots because tracker rows and keyword chips remain in the DOM.
8. If a Teal page is unreadable after slow scoped navigation and one fresh Chrome-backed tab, classify the blocker precisely and request the minimum handoff artifact instead of continuing blind.
9. Check posting date, freshness evidence, and whether the role appears meaningfully active, not merely still visible.
10. Confirm the canonical employer before asset work. If the saved company, source domain, or JD employer disagree, treat the record as unresolved and stop until the real employer and real opening are identified.
11. As soon as the role clears the pursue bar and active asset work begins, move the Teal record to `Applying`. Do this before resume edits, cover-letter work, application-answer drafting, or live form work continue. Treat this as mandatory WIP hygiene, not an optional cleanup step.
12. For live applications, inspect the actual application flow as early as possible to confirm what uploads or questions are present.
13. For attachment-based applications, preflight upload before long final form entry. Confirm the exact approved file path, confirm the destination URL, verify `Allow access to file URLs` if a prior upload failed with `Not allowed`, and use the visible upload control. Do not rely on direct backend POSTs because CAPTCHA-protected final submits must stay in the browser flow.
14. Define the minimum asset set required for the current flow.
15. Use Job Matcher and Analyzer to gather truthful gap terms before editing shared resume content.
16. When gap terms suggest shared-bullet edits, produce a concise proposed-change list grouped into hard skills, soft skills, business terms, and platforms/tools.
17. Prefer checkbox toggles for role-specific bullet and skill display. Add durable reusable items only when existing library items cannot truthfully cover the gap.
18. Reduce resume length in this order: exclude older low-relevance roles, trim redundant bullets, clean duplicate skills, then adjust Designer layout.
19. In Designer/settings, add enough spacing between company headings and previous bullets for scannability, and prefer simple bullet glyphs over double-angle symbols when Teal supports it.
20. Define what Codex should prepare before Teal entry.
21. Define what must be manually confirmed in Teal.
22. Identify approval gates, including explicit user approval before any live submission.
23. Require Teal Resume Builder, Job Matcher, Analyzer, and preview/export checks before final resume export. If Teal is unavailable or blocked, stop with the blocker. Do not create a local substitute unless Matt explicitly instructs a non-Teal fallback for that exact role.
24. Identify one workflow improvement if the current run reveals repeated friction, reusable Teal content, reusable application answers, or a better qualification/search rule.
25. Create a concise Teal update checklist.
26. After editing notes in the detail pane, click outside the note field and visually confirm the final text still renders before leaving the record. Do not assume notes saved just because the field accepted input.
27. After post-submit hygiene, run tab cleanup for the current machine's active Chrome session: keep `Job Tracker`, close duplicate role-working tabs, and close no-longer-needed application tabs for the submitted role.

## Output
- Teal workflow recommendation
- Tracker fields to update
- Notes to paste
- Approval checklist
- Required assets versus optional assets
- Application gate status: active role, research, Teal optimizer, filename, cover letter, application answers, interview pack, QA, approval
- Proposed shared-bullet or summary edits, if score improvement is blocked by missing truthful terms
- Bullet/skill library actions: toggled, added, edited, or blocked
- Freshness assessment, including posting age, evidence, and stale-risk
- Teal optimizer status, including Job Matcher, Analyzer, and two-page preview/export result
- Post-submission status instruction: move to Applying as soon as active asset work starts, keep Applying during the full prep/application workflow, move to Applied only after approved submission is completed
- Workflow improvement note, if the run revealed a reusable speed or quality improvement
- Post-submit hygiene status: Applied status, applied date, Teal Excitement from fit score, submitted salary/comp answer, submitted asset filenames, follow-up target, and application ledger entry

## Safety
Do not invent a Teal API. Do not bypass Teal permissions or submit actions without approval.
