# TealHQ Workflow

## Role Of Teal
TealHQ is the job-search command center. Codex supports analysis, drafting, QA, and strategy. Do not invent a Teal API or bypass Teal's UI, permissions, login, CAPTCHA, or platform restrictions.

Use Matt's logged-in Google Chrome browser for Teal, LinkedIn, job boards, company career sites, and application forms. Prefer Chrome over in-app browser automation when login state, Cloudflare, challenge prompts, or the Teal Chrome extension matter.

On Windows, route Teal/browser work through the Codex Chrome plugin and the already logged-in Chrome profile. Do not use isolated or headless Playwright for Teal, because it loses Matt's session, disables the Teal extension path, and can trigger Cloudflare blocking. If Chrome control is unavailable, first diagnose the Codex Chrome Extension and native host, then stop with the blocker instead of continuing in an isolated browser.

Use `docs/teal-ui-navigation.md` as the current Teal route and UI map. It applies to both Mac and Windows Chrome sessions unless a section explicitly says Windows.

Before calling Chrome unavailable, run the Chrome runtime probe from `job-search-chrome-teal-recovery`: `agent.browsers.get("extension")`, `agent.browsers.list()`, `browser.user.openTabs()`, and a Teal claim/open check. If that passes, classify later failures as Teal navigation, stale-tab, or UI-readability problems, not Chrome-access failures.

Use `mattdim805@gmail.com` as the job-search Google account for Gmail, Google Calendar, and Google Drive work related to applications, recruiter messages, interview scheduling, follow-up reminders, and job-search documents. Do not use `matt@getfractional.co` for personal job-search workflows unless Matt explicitly approves it for a specific task.

Operate like a human: use visible navigation, keep actions paced, avoid repeated reload/click loops, do not brute-force guessed URLs, and stop at CAPTCHA, Cloudflare, security, login, or permission challenges.

## Teal UI Navigation
Prefer direct routes for execution:

- Job Tracker: `/job-tracker`
- Job Detail: `/job-tracker/{job_id}`
- Job Search: `/job-search`
- Resume List: `/resume-builder/resumes`
- Content Editor: `/resume-builder/resumes/{resume_id}/preview`
- Analyzer: `/resume-builder/resumes/{resume_id}/analysis`
- Job Matcher: `/resume-builder/resumes/{resume_id}/matching`
- Designer: `/resume-builder/resumes/{resume_id}/design/presentation`

Use slow, scoped interaction in Teal:
1. Navigate directly to the route.
2. Wait 5 to 8 seconds after route or tab changes.
3. Confirm title and URL.
4. Use targeted role/name locators.
5. Avoid repeated all-page snapshots on heavy pages such as Job Detail and Content Editor.
6. Retry one targeted action once after a wait, then reduce scope or stop with the blocker.

For text entry in Windows Chrome-backed Teal, avoid `locator.fill()` when the current session has shown `Browser Use virtual clipboard is not installed` or CDP timeouts. Prefer:

1. Chrome tab clipboard paste: write with `tab.clipboard.writeText(text)`, focus the target field, then send `tab.dom_cua.keypress({ keys: ["CTRL", "V"] })`.
2. OS clipboard fallback: focus the target field visibly, then run `scripts/paste-into-focused-window.ps1` with `-Text` or `-TextFile`. On Windows, include `-WindowTitle "Teal"` or another visible Chrome title when Chrome may not be the foreground window.
3. Slow typed input only for short fields or when paste is blocked.

Always verify the visible field content before saving.

The Job Tracker and Job Detail pages can keep the job list and selected job record in the DOM at the same time. Keyword chips can create hundreds of button entries. Query the specific role row, source link, status radio group, detail tabs, headings, and Job Description sections instead of reading the entire page repeatedly.

## Saved Searches
Create saved searches by lane and title family.

Suggested naming:
- `L1 RevOps Remote 150k+ Fresh`
- `L1 Growth Ops Remote Hybrid`
- `L2 Lifecycle CRM Remote`
- `L3 Growth Revenue Marketing`
- `L5 Ecommerce DTC Growth`
- `Selective Head VP Marketing`
- `AI Workflow Growth Ops`

Use title and keyword variations, not only obvious titles.

## Codex Search Trigger
When the user says "find jobs":
1. Open Google Chrome and use Teal Job Search, saved searches, relevant job boards, or company career pages.
2. Bookmark promising roles with the Teal Chrome extension when Codex is operating the browser with approval.
3. Confirm each bookmarked role includes title, company, location, URL, compensation if available, posting date if visible, and full JD.
4. Triage Teal-saved roles by lane, posting freshness, score, risks, and next action.
5. Set Teal Excitement from score.

## Posting Freshness Gate
- Treat posting freshness as a first-pass filter during search and saved-job triage.
- Prefer roles posted within the last 30 days.
- If a role is older than 30 days, mark it stale-risk unless there is concrete evidence that hiring is still active.
- If a role is older than 60 days, default to pass, archive, or low-priority save unless the user explicitly wants a strategic exception.
- Public visibility alone is not enough to prove freshness.
- Examples of stronger freshness evidence include a recent repost date, recent recruiter activity, a recently updated careers page, or another direct signal that the opening is still being staffed.

## Excitement Mapping
Use this default mapping:
- 90-100: 5 stars
- 75-89: 4 stars
- 60-74: 3 stars
- 45-59: 2 stars
- 0-44: 1 star

If strategic value warrants an exception, record the reason in Teal notes.

## Job Bookmarking
Use the Teal Chrome extension for job boards and company career pages.

After bookmarking:
- confirm title, company, location, and URL
- confirm the full JD is saved
- paste the full JD manually if auto-capture fails
- add compensation if available
- add role lane and quick fit score in notes

## Codex Application Trigger
When the user says "apply to this job":
1. Open the Teal job record in Google Chrome.
2. Verify the role is not already applied, not in another terminal stage, and not a duplicate wrapper of an already-submitted canonical role.
3. Verify the source link is still active and assess posting age plus freshness evidence. If the saved source blocks or redirects, try one direct company-hosted posting path, then stop with uncertainty if needed.
4. If the Teal company name, source employer, and JD employer do not clearly match, stop and resolve the canonical employer before asset work.
5. Complete intake, lane classification, fit scoring, and Excitement update.
6. Research the JD, application questions, company, hiring manager/recruiter, target role, market, competition, likely KPIs, and why the role exists.
7. Move the role to Applying when asset work begins.
8. Create or open the Teal role resume from the Resumes tab.
9. Use Resume Builder, Job Matcher, Analyzer, and Skills & Interests to optimize the resume. This is mandatory before export unless Teal is unavailable or blocked; if blocked, stop and report the blocker before creating a local-only substitute.
10. If the application exposes a cover-letter upload or text slot, create a tailored cover letter unless Matt explicitly opts out for that application. Keep it to one page.
11. Use Teal Cover Letter with a custom prompt as the default path so the exported header and design match the Teal resume. If Teal Cover Letter is blocked, stop and record the blocker unless Matt explicitly approves a local-only fallback.
12. Export the resume and Teal-designed cover letter as separate files.
13. Run the file naming gate before upload:
   - resume: `{Company} - {Role} - Matt Dimock - Resume.pdf`
   - cover letter: `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`
   - do not upload files with suffixes such as `Teal`, `final`, `v2`, `draft`, dates, source labels, or tool labels
   - if Teal exports a generic or suffixed filename, rename or copy it to the canonical filename before upload
14. Before final form entry, run the upload preflight if the application requires attachments:
   - confirm the exact approved local file path and target application URL
   - confirm Chrome is using the logged-in profile with the Codex extension connected
   - open `chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg` and verify `Allow access to file URLs` is on when uploads have failed with `Not allowed`
   - restart Chrome or start the Chrome task again after changing that setting
   - use the visible page `Attach` or upload control, wait for the file chooser, then set the approved file path
15. Prepare application answers from the exact form fields.
16. Create an interview pack after the role clears the pursue bar and before submission readiness, so compensation strategy and interview positioning are ready if the application converts.
17. Present the final resume, cover letter if used, application answers, upload destination, and submit action for review.
18. Stop before final submission until the user approves the exact assets, copy, action, and destination.
19. After approved submission is completed and confirmation is visible, move the Teal job status to Applied, add the application date, and note which assets were submitted.
20. Run post-submit hygiene before moving on: verify Applied status, applied date, Teal Excitement from fit score, submitted salary/comp answer, exact asset filenames, follow-up target, and application ledger entry.

## Application Package Gates
Do not move to live upload or submission until each gate is passed or explicitly blocked:

1. Active role gate: official source is live, posting age/freshness is recorded, and stale-risk is assessed.
   - the selected role is not already in `Applied`, `Interviewing`, `Negotiating`, `Accepted`, `Archived`, or `Closed`
   - no visible applied date is present
   - the record is not a duplicate wrapper of an already-submitted canonical role
   - the Teal company, JD employer, and source employer align to one canonical employer before resume or application work begins
2. Research gate: company, market, role mandate, likely KPIs, compensation, and why the role exists are summarized.
3. Teal resume gate: Job Matcher gaps reviewed, Analyzer reviewed when available, hard and soft skills incorporated naturally through summary, bullets, and categorized Skills & Interests, no duplicate or malformed skills, and export is two pages or less.
4. Filename gate: exported assets use only the canonical names. No tool/source suffixes.
5. Cover-letter gate: if the application has a cover-letter slot, a one-page tailored cover letter is created in Teal with a custom prompt and named canonically unless Matt opts out. A local/manual cover letter is only allowed after a recorded Teal blocker and Matt's approval.
6. Application-answer gate: all form answers are drafted, claim-safe, and compensation/location answers preserve leverage.
7. Interview-pack gate: a role-specific pack exists for likely screens, objections, stories, questions to ask, and compensation framing.
8. QA gate: facts, metrics, company context, resume length, cover-letter length, filenames, upload targets, and no-submit approval state are verified.
9. External-action gate: submission, outreach, references, sensitive self-ID, or negotiation happens only after explicit approval of the exact action.

## Chrome Upload Repair
Official Codex Chrome guidance requires enabling `Allow access to file URLs` on the Codex extension before Chrome tasks can upload local files. In this Windows profile, the Codex extension ID has been observed as `hehggadaopoacecdllhhajmbjkdcmajg`.

Use this repair path when a file chooser appears but setting the file fails with `Not allowed`:

1. Open `chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg` in the same Chrome profile used for Teal and applications.
2. Turn on `Allow access to file URLs`.
3. Restart Chrome or start the Chrome task again.
4. Retry the normal visible upload flow.

Do not treat a successful presigned storage upload as a completed application. Greenhouse and similar systems may accept the file upload but still reject the final application without a valid browser CAPTCHA token or page session. If CAPTCHA, Cloudflare, login, or security checks appear, stop in the visible browser flow.

## Job Tracker Fields
Maintain:
- status
- role lane
- fit score
- pursue classification
- compensation range
- remote/hybrid/location
- deadline if known
- source
- company stage
- recruiter
- hiring manager
- notes
- next action
- follow-up date
- asset status
- interview status

## Resume Builder
Use one comprehensive master resume in Teal as the profile library. Do not submit the master directly.

Treat Teal bullets and Skills & Interests as reusable library items:
- Use checkboxes to include or exclude bullets and skills for the current job resume.
- Prefer toggling existing truthful items before editing or adding.
- Add durable, reusable bullets or skills when a role reveals a real gap.
- Leave any `update in all resumes` or global-update option unchecked unless Matt explicitly approves a global library change.
- Do not delete skills, delete bullets, or run shared-library cleanup during application work unless Matt explicitly asks for it.
- If Matt explicitly approves shared skill cleanup, remove exact and near-duplicate skills from the Teal library, not just from the current resume. Keep one canonical original skill and delete duplicate variants such as `GA4` / `Google Analytics` / `Google Analytics 4`, capitalization-only duplicates, singular/plural variants, and repeated entries like `Targeting` / `targeting`.
- Do not rename an existing shared category for a different role lane. If a new lane needs skills, create a new category for that lane and add or move only the relevant skills.
- Keep professional tool categories separate from hospitality/service categories. Use `Platforms & Execution Stack` for tools such as ClickUp, Figma, GitHub, Google Workspace, Shopify, and Zoho One. Use a separate hospitality category such as `Hospitality Operations & Bar Support` for barback terms such as restocking, opening duties, closing duties, garnish prep, stocking, and heavy lifting.

For each role:
1. Build resume strategy from the JD and research brief.
2. From the job record's Resumes tab, create a new resume or open the attached role resume.
3. Use Default to all content on when creating from the master profile.
4. Rename the resume `{Company} - {Role} - Matt Dimock - Resume` when possible.
5. Use Teal Job Matcher for hard-skill, soft-skill, tool, and role-term gaps.
6. Update target title, professional summary, selected bullets, and Skills & Interests.
7. Add only truthful, natural, recruiter-readable language.
8. Avoid keyword stuffing and unsupported claims.
9. When editing a library item, keep any global update option unchecked unless Matt approves the global change.
10. Use Analyzer before export. If Analyzer is not visible or fails, stop with the blocker unless Matt explicitly approves a local-only or manual-QA fallback for that application.
11. Use Teal preview/export as the source of truth for length. Target a strong two-page resume: no page 3, no obvious unused second-page whitespace when high-value proof can fit, and no cramped layout that damages readability.
12. Ensure no uncategorized top-level skills remain checked above category groups. Those display as an ugly comma-list before the category sections.
13. Use Designer/settings after content cleanup to improve spacing between companies and bullets, and prefer simple bullet glyphs over double-angle symbols if Teal offers that option.
14. Export PDF and verify the downloaded file name. The submission filename must be `{Company} - {Role} - Matt Dimock - Resume.pdf`; rename or copy the Teal export if needed. Do not upload filenames containing `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels.
15. If a resume is reformatted outside Teal, remove local file path footers, browser print headers/footers, timestamps, URLs, and any other machine-generated footer text before upload or delivery.

## Job Matcher
Use Job Matcher as a gap-analysis tool:
- identify missing truthful keywords
- separate must-have terms from noise
- reject false or inflated keyword additions
- preserve readable resume architecture

Treat generic tokens, malformed strings, and irrelevant one-word fragments as noise. Prioritize role-specific phrases, credible tools, measurable systems work, and keywords that align with source-backed experience.

When the company operates in a specific industry, make the summary and skill grouping reflect that industry instead of staying generic. For Red Ventures Home Services, the relevant context is telecom/connectivity, home services, marketplace growth, lifecycle CRM, ecommerce conversion, and revenue systems. Prosper Wireless is telecom experience, not telecom-adjacent; mention Xfinity/Comcast partnership or contract work only when useful and without inventing unrecalled partner names.

When Job Matcher reveals a real gap:
1. Try toggling an existing bullet or skill that already expresses the term truthfully.
2. If no existing item fits, add one durable reusable bullet or skill.
3. Keep the item recruiter-readable and useful outside the current role when possible.
4. Do not add a pile of one-off terms just to move the match score.

## Cover Letter
Use the Teal Cover Letter tab after the resume is attached to the job. This is the default path for application cover letters because it keeps the cover-letter header, contact block, and visual system aligned with the Teal resume.

For each role:
1. Choose medium for straightforward roles and long for executive, highly strategic, or research-heavy roles.
2. Use Custom Prompt when available.
3. Ground the prompt in the company research brief, role diagnosis, proof hierarchy, and claim-safe metrics.
4. Edit the output so it sounds human, direct, and specific.
5. Export the Teal-designed cover letter when possible, then save or rename it as `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`.
6. Keep the final cover letter to one page.
7. If Teal Cover Letter cannot be reached, generated, edited, or exported, stop with the blocker unless Matt explicitly approves a local-only cover-letter fallback for that application.

## Contacts Tracker
Track:
- recruiters
- hiring managers
- functional leaders
- employees
- warm connectors
- interviewers

For each contact, capture:
- relationship
- associated job
- likely priority
- outreach status
- follow-up date
- notes

## Notes
For each role, store:
- research brief summary
- likely reason role exists
- company pain points
- fit score and decision
- strongest story angles
- concerns
- outreach log
- application date
- follow-up dates
- interview notes
- compensation notes

## Interview Tracking
Use Teal interview tracking for:
- date
- format
- interviewer
- stage
- notes
- follow-up owner

Use Teal interview practice only after creating a role-specific interview pack. Compare any practice output against the Story Bank and claim-safety rules.

## Approval Rules
Ask before:
- submitting applications
- using final assets, application answers, upload destinations, or submit buttons in a live application
- sending outreach
- sending email
- changing records in bulk
- sharing references
- accepting, declining, or negotiating externally
- answering sensitive voluntary self-ID fields unless the user has provided standing permission

## Teal Status Rules
- Use `Applying` only after the role clears the pursue bar and active asset/application work has started.
- Use `Applied` only after the user explicitly approves the final submission and the live application is actually submitted.
- After submission, add the application date, submitted asset names, and any confirmation details visible in the application flow.
- After submission, verify Teal Excitement still matches the fit-score mapping. A role scored 75-89 should show 4 stars, and 90-100 should show 5 stars unless a documented strategic exception exists.
- Add a concise note with submitted salary or compensation answer, submitted assets, positioning theme, logistics/relocation note when relevant, and follow-up target.
