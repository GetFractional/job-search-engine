# Teal UI Navigation Map

Last inspected from Matt's live Chrome-backed Teal session on 2026-05-12.

Use this as the practical route map for Codex job-search work in Teal. It describes the current UI shape and the safest automation approach. It is browser-agnostic unless a section explicitly says Windows.

## Browser Surface

Use Matt's logged-in Google Chrome profile for Teal. On Windows, prove Chrome extension access with `job-search-chrome-teal-recovery` before role selection, scoring, asset editing, or status changes. On Mac, use the live Chrome-backed surface available in that session.

Do not use isolated Playwright or the Codex in-app browser for Teal application work. Cloudflare blocks, login prompts, or `about:blank` visibility usually mean the thread is on the wrong browser surface.

Separate Chrome access from Teal usability. If the runtime probe can list the `Chrome` extension backend, show live user tabs through `browser.user.openTabs()`, and claim or open `https://app.tealhq.com/` without Cloudflare or login, Chrome is working. After that point, diagnose failures as stale-tab, Teal route, Teal readability, text-entry, or file-upload issues instead of rerunning Chrome bridge repair.

## Core Routes

| Teal area | Route | Use for | Safe first action |
|---|---|---|---|
| Home | `/home` | Dashboard, recent jobs, pipeline summary | Use only for orientation. Prefer direct routes below for execution. |
| Job Tracker | `/job-tracker` | Saved jobs, status filters, table/board view, role selection | Switch to or keep Table view, then use status filters and row buttons. |
| Job Detail | `/job-tracker/{job_id}` | JD, source link, status, notes, resumes, contacts, checklist | Anchor on `Back to job tracker`, the job heading, source link, and selected detail tab. |
| Job Search | `/job-search` | Teal job search, saved search access, filters | Use title/location fields and filters. Do not click `Select Job` unless saving or reviewing that job is intended. |
| AI Job Search | `/ai-job-search` | Teal AI search | Use only when explicitly helpful. Prefer standard Job Search for predictable triage. |
| Resume List | `/resume-builder/resumes` | Open, search, or create resumes and cover letters | Use `Search resumes`, resume cards, `Match a job`, and `New Resume` deliberately. |
| Content Editor | `/resume-builder/resumes/{resume_id}/preview` | Resume content selection and editing | Treat checkboxes, bullets, sections, and Skills as live resume mutations. |
| Analyzer | `/resume-builder/resumes/{resume_id}/analysis` | Resume issue count and QA prompts | Use for issues and readiness checks, not as an automatic truth source. |
| Job Matcher | `/resume-builder/resumes/{resume_id}/matching` | Match score, job attachment, keyword gaps | Extract truthful gap terms, then edit naturally. Reject noise. |
| Designer | `/resume-builder/resumes/{resume_id}/design/presentation` | Template, layout, margins, page setup | Use for two-page fit and layout only after content is stable. |
| Cover Letter | Resume Builder `Cover Letter` tab | Cover letter generation and editing | Use when the application has a cover-letter slot, requires one, the role is strategically important, or the user requested it. |

## Job Tracker

The tracker table exposes these useful controls:

- Tabs: `Jobs`, `People`, `Companies`, `Compensation`, `Offer Analysis`.
- Status filters: `filter by bookmarked`, `filter by applying`, `filter by applied`.
- View toggle: `Table` and `Board`.
- Table columns: Job Position, Company, Min Salary, Max Salary, Location, Status, Date Posted, Date Saved, Application Deadline, Date Applied, Follow Up, Excitement.
- Row buttons open job details. The role button is safest for opening a job record.

For next-best-job selection, use Table view and collect the visible rows first. Rank using posting date, compensation, lane fit, role mandate, status, applied date, and any existing Excitement. Exclude rows already in `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, or `Closed`, plus any row with a visible applied date. If the tracker cannot be read, do not guess. Ask for a tracker screenshot, direct Teal record URL, or pasted JD.

Treat Home `Priorities` as a lead list only. Do not choose the final application target from Home alone. Re-confirm the target in Job Tracker Table view before resume or application work begins.

## Job Detail

Opening a row loads `/job-tracker/{job_id}` while the tracker table can remain in the DOM. This makes snapshots noisy because Teal includes both the job list and job detail.

Reliable anchors:

- `Back to job tracker`
- job heading
- source link domain
- status radio buttons such as `Bookmarked`, `Applying`, `Interviewing`
- `Close Job`
- detail tabs: `Job Info`, `Notes`, `Resumes`, `Contacts`, `Email Templates`, `Check List`, `Practice Interview`
- `Job Description & Keywords`
- `Job listing menu`

Avoid broad all-page snapshots on job detail pages unless mapping the UI. Keyword chips can create hundreds of button entries. Instead, query specific headings, tabs, the source link, the status radio group, and JD section headings.

Canonical-employer rule:

- If the company shown in Teal does not match the employer shown in the JD or live source, treat the record as unresolved.
- Aggregator wrappers such as `Jobgether` are not sufficient proof of the real target employer.
- If a wrapper points to an underlying employer that already has an `Applied` record or no longer has a live opening, do not continue application work on the wrapper record.

Do not change status to `Applying`, `Applied`, or `Close Job` until the workflow gate allows it. Do not bulk-edit notes or fields without approval.

## Resume Builder

The resume list route shows:

- `New Resume`
- `Start from job description`
- `Start from template`
- `New Cover Letter`
- `Search resumes`
- resume cards with `Resume Menu`
- `Match a job` or `Match: XX%` links

The resume editor uses tab routes:

- Content Editor: `/preview`
- Analyzer: `/analysis`
- Job Matcher: `/matching`
- Designer: `/design/presentation`

The top-level `Export PDF` button is visible across editor tabs. Before export, verify the target title, selected sections, selected bullets, Skills & Interests, Analyzer status, and two-page preview/layout.

## Skills And Shared Content Safety

Treat Resume Builder content as a shared library unless the UI proves a field is local to only the current resume. The working model is:

- Bullets are saved as reusable library items.
- Skills are saved as reusable library items.
- Checkboxes include or exclude library items from the current role resume.
- Editing library text can affect the reusable item.
- Some edit flows may offer an `update in all resumes` style option. Leave it unchecked by default.
- `Add`, `Delete`, global-update checkboxes, and section action menus are mutation controls.

Default behavior:

- Toggle bullets and skills on or off per job using checkboxes.
- Add a new durable skill or bullet when a truthful, reusable item is missing.
- Leave global update options unchecked unless Matt explicitly approves updating every resume that uses that item.
- Do not click `Delete Skill`, delete bullets, overwrite shared summaries, or restructure sections without explicit approval.
- Do not clean up the shared library during a live application unless Matt explicitly asks for shared-library cleanup.
- When Matt explicitly approves shared skill cleanup, delete exact and near-duplicate skills instead of merely unchecking them. Keep one canonical original skill and remove duplicate variants that would clutter future resumes.

The fastest safe path is: reuse existing library items first, add missing truthful reusable items second, then toggle the final visible set for the current job.

Preferred Skills & Interests format:

- Use category-style skill groups, for example `Lifecycle, CRM & Retention`, `Growth Systems & Analytics`, and `Platforms & Execution Stack`.
- Keep the visible resume skills category-led and readable, not a flat keyword pile.
- Do not add duplicate flat skills when a categorized version already exists.
- Before adding skills, expand `Skills & Interests` and check for existing category entries and uncategorized duplicates.
- Never leave uncategorized top-level skills checked above category groups. If top-level skills exist, either assign them to a category or uncheck/delete duplicates so they do not display as an uncategorized comma-list before the preferred category sections.
- Treat near-duplicates as duplicates for library cleanup. Examples: `GA4`, `Google Analytics`, and `Google Analytics 4`; `Google Tag Manager` and `GTM`; `Targeting` and `targeting`; singular/plural variants; capitalization-only variants.
- For a role-specific resume, uncheck uncategorized duplicate skills first. Keep category entries when they are relevant and truthful.
- Do not use Skills & Interests as the primary way to raise Job Matcher. Prefer target title, summary, and real bullets first.
- If Teal automation cannot reliably uncheck a skill, stop and record the exact blocker rather than compensating by adding more skills.
- Do not repurpose an existing shared category for an unrelated role lane. Create a new category for new lanes. Keep `Platforms & Execution Stack` for tools such as ClickUp, Figma, GitHub, Google Workspace, Shopify, and Zoho One. Keep hospitality terms in a separate category such as `Hospitality Operations & Bar Support`.
- For Red Ventures, Allconnect, MyMove, or similar roles, keep category labels and summary language tied to the real industry context: telecom/connectivity, home services, marketplace growth, lifecycle CRM, ecommerce conversion, and revenue systems. Prosper Wireless is direct telecom experience, not telecom-adjacent. Where relevant, mention telecom partnerships/contracts without inventing the third partner name if it is not recalled; Xfinity and Comcast are safe examples from Matt's instruction.

Resume length rule:

- Start by excluding low-value older companies or roles before touching layout.
- Then trim redundant bullets within retained roles.
- Only after content is stable, use Designer margins, line height, template, and skills layout for two-page fit.
- In Designer/settings, add enough spacing between company headings and prior bullets for scannability. Avoid cramped transitions even when targeting two pages.
- Prefer simple bullet glyphs over double-angle symbols when Teal supports the option; verify the exported PDF, not just the preview.
- Do not upload or submit a resume until the exported or previewed asset is confirmed as two pages.

## Job Matcher

Use Job Matcher for gap analysis, not keyword dumping.

Capture terms in four groups:

- Hard skills
- Soft skills
- Business terms
- Platforms and tools

Reject generic fragments, malformed tokens, duplicate one-word terms, and keywords that would create unsupported claims. Add missing terms through real bullets, summary language, target title, or Skills & Interests only when truthful and readable.

## Analyzer

Use Analyzer as a readiness check:

- record visible issue count
- inspect only relevant issues
- fix truthful, high-impact issues
- document unresolved issues when Teal is slow or when a recommendation would weaken the resume

Do not blindly follow Analyzer if it conflicts with claim safety, role strategy, or readable two-page formatting.

## Cover Letter

The Cover Letter tab exposes:

- `Switch Job`
- `Write with AI`
- AI settings tabs: `Length`, `Tone`, `Job`, `Custom Prompt`, `Model`
- `Apply`
- `History`
- `Copy Text`

Use it after the correct job is attached to the resume. If the live application exposes a cover-letter upload or text slot, create a tailored one-page cover letter unless Matt explicitly opts out. Choose medium length for straightforward roles and long only for executive or research-heavy roles. Use Custom Prompt when available, grounded in the research brief and safe proof.

## Slow Mode

Teal is a heavy single-page app. Default to slow, scoped interaction:

1. Navigate directly to the route.
2. Wait 5 to 8 seconds after route changes or tab changes.
3. Confirm the page title and URL.
4. Use role/name locators for specific controls.
5. Take scoped snapshots or targeted text reads.
6. If a click times out, wait once and retry the same targeted control.
7. After two failed attempts on the same control, reduce scope or stop with the exact blocker.

Avoid repeated broad DOM snapshots on pages over roughly 800 lines. Avoid opening multiple Teal tabs unless needed, because it increases confusion and slows later recovery.

## Fast Text Entry On Windows

Chrome-backed Teal editing can fail when Browser Use tries to use Playwright-style `fill()` or paste-backed actions and the page reports `Browser Use virtual clipboard is not installed`. Treat this as a browser-client runtime issue, not as evidence that Teal is unavailable.

Use this order for text entry:

1. For short fields, focus the field and use normal typed input when reliable.
2. For medium or long fields, use the Chrome tab clipboard path:

```js
await tab.clipboard.writeText(text);
await focusedField.click({ timeoutMs: 15000 });
await tab.dom_cua.keypress({ keys: ["CTRL", "V"] });
```

3. If the Chrome tab clipboard path fails but the field is visibly focused in Chrome, use the OS clipboard fallback:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\paste-into-focused-window.ps1" -Text "Text to paste"
```

When Chrome may not be foreground, include a visible Chrome title so the helper activates the right window before pasting:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\paste-into-focused-window.ps1" -TextFile ".\artifacts\note.txt" -WindowTitle "Teal"
```

For larger text blocks, write the text to a temporary file and use `-TextFile` instead of inline text. Verify the pasted content in the UI before saving.

Avoid `locator.fill()` in Teal unless it has been verified in the current tab. If text does not persist after Save, distinguish text-entry failure from Teal save/persistence failure by first testing paste in a non-mutating field such as `Search resumes`.

## Export Verification

Do not treat clicking `Export PDF` as proof of export. Verify export by checking the local Downloads folder for a new or updated PDF. Rename generic files to:

- `{Company} - {Role} - Matt Dimock - Resume.pdf`
- `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`

Do not upload files with `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels in the filename. If a Teal export or local fallback produces a suffixed filename, copy or rename it to the canonical filename before upload.

Before upload or delivery, inspect the exported PDF or equivalent text for:

- correct candidate name and contact block
- correct target title
- no page 3
- no missing critical sections
- no browser print headers, local file paths, timestamps, URLs, or machine-generated footer text
- no broken layout from Designer changes
- no unchecked or duplicate top-level skills appearing before category groups
- bullet glyphs and company spacing read cleanly

Application upload fallback rule:

- If an application accepts file upload, do not paste the full resume or cover letter into a manual text field as a convenience fallback.
- If Chrome upload automation fails with `fileChooser.setFiles failed` and `Not allowed`, treat it as a Codex Chrome extension file-access setting problem first. Open `chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg`, confirm `Allow access to file URLs` is on for the Codex extension, restart Chrome or start the Chrome task again, then retry the visible upload flow.
- If file upload still cannot be completed through automation after the file-URL setting is on and the task is restarted, stop and report the file-picker blocker, or use a user-approved manual upload step in the already-focused browser tab.
- Manual resume entry is allowed only when the application offers no file upload or when Matt explicitly approves that lower-fidelity path for that application.
- Do not use direct backend POSTs as a substitute for a real application flow on Greenhouse, Ashby, Workday, Lever, or similar systems. A direct file upload to a presigned storage URL does not prove the application was submitted, and CAPTCHA-protected final submits must stay in the visible browser flow.

## Stop Conditions

Stop and report the blocker when:

- the thread cannot prove live Chrome-backed Teal access
- Teal shows Cloudflare, login, CAPTCHA, or a security challenge
- the tracker cannot be read and no Teal record URL or screenshot is available
- Chrome-backed Teal loads, but a specific page remains unreadable after slow scoped navigation and one fresh extension-backed tab attempt
- Resume Builder, Job Matcher, or Analyzer cannot be reached and the user has not approved a local-only fallback
- Teal cannot persist target title, summary, selected skills, or export state after two careful attempts
- export cannot be verified through the filesystem
- the next action would submit, message, answer sensitive self-ID, delete, bulk-change, or permanently overwrite content without approval
