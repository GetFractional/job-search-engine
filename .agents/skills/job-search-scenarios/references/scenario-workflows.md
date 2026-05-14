# Scenario Workflows

## Find Jobs
1. Prove the browser surface with `job-search-chrome-teal-recovery` before Teal or logged-in job-board work.
2. Open Google Chrome and use Teal Job Search, saved searches, or relevant job boards.
3. Use the Teal Chrome extension to bookmark strong roles.
4. Confirm each saved job has title, company, location, URL, compensation if listed, and full JD.
5. Run quick lane and fit scoring.
6. Set Excitement from score.
7. Add notes with lane, score, compensation/logistics, risk, and next action.
8. Return a shortlist with which roles deserve deeper research.

## Score Saved Jobs
1. Prove the browser surface with `job-search-chrome-teal-recovery`.
2. Open Teal Job Tracker in Chrome.
3. Find jobs with no Excitement score or stale notes.
4. Read the JD and source URL.
5. Verify the posting is active when feasible.
6. Score using the role-fit rubric.
7. Set Excitement and add notes.
8. Do not draft assets unless a role clears the pursue threshold or the user asks.

## Apply To A Specific Job
1. Prove the browser surface with `job-search-chrome-teal-recovery`: Chrome extension backend listed, live user tabs visible, and Teal claimed or opened without Cloudflare/login.
2. If Chrome is proven but an existing Teal tab is locked, open a fresh Chrome-extension-backed Teal tab. If a Teal page is unreadable after slow scoped navigation and one fresh-tab attempt, stop and request a screenshot, direct Teal record URL, or pasted JD instead of guessing.
3. Open the Teal job record in Chrome.
4. Verify the role is not already applied, not in another terminal stage, and not a duplicate wrapper of an already-submitted canonical role.
5. Verify source link is active. If source redirects or blocks, find the company-hosted posting once.
6. If the Teal company, JD employer, and source employer do not clearly match, stop and resolve the canonical employer before asset work.
7. Move the job to Applying when asset work starts.
8. Research company, role, hiring manager/recruiter, market, competition, likely KPIs, and why the role exists.
9. Finalize fit score and Excitement.
10. Open Resumes from the Teal job record.
11. Create a new tailored resume or open the attached role resume.
12. Use Default to all content on when creating from the master profile.
13. In Resume Builder, use Job Matcher to identify missing truthful hard skills, soft skills, and role terms.
14. In Content Editor, use checkboxes to include or exclude existing bullets and Skills & Interests for the current role resume.
    - Keep Skills & Interests category-led and readable.
    - Do not add duplicate flat skills when a categorized equivalent already exists.
    - Never leave uncategorized top-level skills checked above category groups.
    - Do not rename an existing shared skill category for an unrelated role lane; create a new role-specific category when a new lane needs one.
15. Add a durable reusable bullet or skill only when the library is missing a truthful, role-relevant item.
16. Leave `update in all resumes` or global-update options unchecked unless Matt explicitly approves a global library change.
17. Do not delete skills, delete bullets, or clean the shared library during application work unless Matt explicitly asks for that cleanup.
18. Update target title, professional summary, bullets, and Skills & Interests only as needed and without keyword stuffing.
19. Keep the resume readable and two pages unless the role justifies otherwise. Use Teal preview/export to avoid page 3 and avoid leaving obvious high-value whitespace on page 2.
20. Use Analyzer and Job Matcher until issues and match gaps are addressed without keyword stuffing. If these Teal tools are blocked, stop and report the blocker unless the user approves a local-only fallback.
21. If the live application has a cover-letter upload or text slot, create a tailored one-page cover letter unless Matt explicitly opts out.
22. Open Cover Letter, select medium or long based on role complexity, and use a custom prompt grounded in research. Use Teal Cover Letter as the default path when the application has a cover-letter slot. If Teal Cover Letter is blocked, stop and document the blocker unless Matt explicitly approves a local-only fallback.
23. Export resume and cover letter as separate files.
24. Enforce canonical filenames before upload: `{Company} - {Role} - Matt Dimock - Resume.pdf` and `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`. Do not upload files containing `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels.
25. If the application requires attachment upload, preflight the upload path before long final form entry. If `fileChooser.setFiles` fails with `Not allowed`, turn on `Allow access to file URLs` for the Codex Chrome extension at `chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg`, restart Chrome or start the Chrome task again, and retry the visible upload control.
26. Prepare application answers from the exact form questions.
27. Create an interview pack for the role after it clears the pursue bar and before submission readiness.
28. Present final assets, application answers, upload destination, and submit action for approval.
29. Stop before submission and ask for approval with the exact destination and data involved.
30. After approved submission is completed and confirmation is visible, update Teal status to Applied and add the application date plus submitted assets.
31. Run post-submit hygiene: verify Teal Excitement from fit score, record submitted salary/comp answer, exact filenames, follow-up target, and update `docs/application-performance-ledger.md`.

## Chrome/Teal Failure Routing
- Local bridge failure: run the forced repair script and retry the runtime probe once.
- Thread binding failure: if local bridge checks are green but the thread lacks the Chrome extension backend, stop same-thread retries and route to Codex Desktop Chrome plugin reset/rebind/restart or support escalation.
- Wrong browser surface: if Teal is in isolated Playwright or the in-app browser, stop and switch to Chrome extension backend.
- Stale tab claim: if `browser.user.openTabs()` works but an old Teal tab cannot be claimed, open a fresh Chrome-extension-backed Teal tab.
- Teal readability/navigation failure: if Chrome-backed Teal loads but tracker/resume content is unreadable after slow scoped navigation and one fresh-tab attempt, ask for screenshot/direct record/JD rather than guessing.

## Teal UI Signals Observed
Saved job records expose:
- job list
- salary range
- Excitement star rating
- stage controls
- source link
- Job Info
- Notes
- Resumes
- Contacts
- Email Templates
- Check List
- Practice Interview

Resume Builder exposes:
- resume title
- Export PDF
- Content Editor
- Designer
- Analyzer
- Job Matcher
- Cover Letter
- missing hard skills and soft skills
- existing bullets with inclusion checkboxes
- Skills & Interests
- skill inclusion checkboxes for per-job display
- global update options that should stay unchecked unless approved
- cover letter length, tone, job, custom prompt, model, write with AI, copy text
