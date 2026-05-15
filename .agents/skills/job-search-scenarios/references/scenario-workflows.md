# Scenario Workflows

## Find Jobs
1. Prove the browser surface with `job-search-chrome-teal-recovery` before Teal or logged-in job-board work.
2. Refresh the Teal page once after claim/open and before trusting any visible Teal data.
3. Open Google Chrome and use Teal Job Search, saved searches, or relevant job boards.
4. Use the Teal Chrome extension to bookmark strong roles.
5. Confirm each saved job has title, company, location, URL, compensation if listed, and full JD.
6. Run quick lane and fit scoring.
7. Set Excitement from score.
8. Add notes with lane, score, compensation/logistics, risk, and next action.
9. Return a shortlist with which roles deserve deeper research.
10. Record run metrics: roles reviewed, roles saved, estimated tokens, elapsed time if known, main bottleneck, and one self-healing candidate.

## Score Saved Jobs
1. Prove the browser surface with `job-search-chrome-teal-recovery`.
2. Open Teal Job Tracker in Chrome.
3. Refresh Job Tracker before reading rows or trusting visible status, notes, or applied dates.
4. Find jobs with no Excitement score or stale notes.
5. Read the JD and source URL.
6. Verify the posting is active when feasible.
7. Score using the role-fit rubric.
8. Set Excitement and add notes.
9. Do not draft assets unless a role clears the pursue threshold or the user asks.
10. Record run metrics: roles scored, roles advanced, stale or duplicate records found, estimated tokens, elapsed time if known, and one self-healing candidate.

## Apply To A Specific Job
1. Prove the browser surface with `job-search-chrome-teal-recovery`: Chrome extension backend listed, live user tabs visible, and Teal claimed or opened without Cloudflare/login.
2. Refresh the Teal tab once after claim/open and before trusting any visible Teal data.
3. If Chrome is proven but an existing Teal tab is locked, open a fresh Chrome-extension-backed Teal tab. If a Teal page is unreadable after slow scoped navigation and one fresh-tab attempt, stop and request a screenshot, direct Teal record URL, or pasted JD instead of guessing.
4. Open the Teal job record in Chrome.
5. Refresh the job detail page before trusting status, notes, applied date, or source data.
6. Verify the role is not already applied, not in another terminal stage, and not a duplicate wrapper of an already-submitted canonical role.
7. Verify source link is active. If source redirects or blocks, find the company-hosted posting once.
8. If the Teal company, JD employer, and source employer do not clearly match, stop and resolve the canonical employer before asset work.
9. Move the job to Applying when asset work starts.
10. Research company, role, hiring manager/recruiter, market, competition, likely KPIs, and why the role exists.
11. Finalize fit score and Excitement.
12. Open Resumes from the Teal job record.
13. Create a new tailored resume or open the attached role resume.
14. Use Default to all content on when creating from the master profile.
15. In Resume Builder, refresh once before trusting attached-job state, selected content, or analyzer/matcher state.
16. In Resume Builder, use Job Matcher to identify missing truthful hard skills, soft skills, and role terms.
17. In Content Editor, use checkboxes to include or exclude existing bullets and Skills & Interests for the current role resume.
    - Keep Skills & Interests category-led and readable.
    - Do not add duplicate flat skills when a categorized equivalent already exists.
    - Never leave uncategorized top-level skills checked above category groups.
    - Do not rename an existing shared skill category for an unrelated role lane; create a new role-specific category when a new lane needs one.
18. Add a durable reusable bullet or skill only when the library is missing a truthful, role-relevant item.
19. Leave `update in all resumes` or global-update options unchecked unless Matt explicitly approves a global library change.
20. Do not delete skills, delete bullets, or clean the shared library during application work unless Matt explicitly asks for that cleanup.
21. Update target title, professional summary, bullets, and Skills & Interests only as needed and without keyword stuffing.
22. Keep the resume readable and two pages unless the role justifies otherwise. Use Teal preview/export to avoid page 3 and avoid leaving obvious high-value whitespace on page 2.
23. Use Analyzer and Job Matcher until issues and match gaps are addressed without keyword stuffing. If these Teal tools are blocked, stop and report the blocker unless the user approves a local-only fallback.
24. If the live application has a cover-letter upload or text slot, create a tailored one-page cover letter unless Matt explicitly opts out.
25. Open Cover Letter, select medium or long based on role complexity, and use a custom prompt grounded in research. Use Teal Cover Letter as the default path when the application has a cover-letter slot. If Teal Cover Letter is blocked, stop and document the blocker unless Matt explicitly approves a local-only fallback.
26. Export resume and cover letter as separate files.
27. Enforce canonical filenames before upload: `{Company} - {Role} - Matt Dimock - Resume.pdf` and `{Company} - {Role} - Matt Dimock - Cover Letter.pdf`. Do not upload files containing `Teal`, `final`, `draft`, `v2`, dates, source labels, or tool labels.
28. If the application requires attachment upload, preflight the upload path before long final form entry. If `fileChooser.setFiles` fails with `Not allowed`, turn on `Allow access to file URLs` for the Codex Chrome extension at `chrome://extensions/?id=hehggadaopoacecdllhhajmbjkdcmajg`, restart Chrome or start the Chrome task again, and retry the visible upload control.
29. Prepare application answers from the exact form questions.
30. Create an interview pack for the role after it clears the pursue bar and before submission readiness.
31. Present final assets, application answers, upload destination, and submit action for approval.
32. Stop before submission and ask for approval with the exact destination and data involved.
33. After approved submission is completed and confirmation is visible, update Teal status to Applied and add the application date plus submitted assets.
34. Run post-submit hygiene: verify Teal Excitement from fit score, record submitted salary/comp answer, exact filenames, follow-up target, and update `docs/application-performance-ledger.md`.
35. Complete run metrics or an application retrospective with estimated tokens, elapsed time, stage blockers, revision loops, and self-healing status.

## Chrome/Teal Failure Routing
- Local bridge failure: run the forced repair script and retry the runtime probe once.
- Thread binding failure: if local bridge checks are green but the thread lacks the Chrome extension backend, stop same-thread retries and route to Codex Desktop Chrome plugin reset/rebind/restart or support escalation.
- Wrong browser surface: if Teal is in isolated Playwright or the in-app browser, stop and switch to Chrome extension backend.
- Stale tab claim: if `browser.user.openTabs()` works but an old Teal tab cannot be claimed, open a fresh Chrome-extension-backed Teal tab.
- Stale page data: if the page loads but visible status, notes, or applied state may be old, refresh the Teal tab once before trusting the page.
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
