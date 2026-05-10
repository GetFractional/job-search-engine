# Scenario Workflows

## Find Jobs
1. Use `gpt-5.4-mini` with medium reasoning.
2. Open Google Chrome and Teal Trackers.
3. Record the current Bookmarked baseline.
4. Keep Chrome lean by closing stale job tabs, duplicate source tabs, extension popups, and the Teal side panel when they are not actively needed.
5. Keep a save ledger with Candidate, Source, Geo, Fit, Salary min, Salary max, JD captured, Save attempt, Teal confirmed, and Decision.
6. Use Teal Job Search, saved searches, or relevant job boards.
7. Build a candidate queue in the ledger, but do not save roles from search-result snippets and do not open a batch of job tabs.
8. Evaluate one source posting tab at a time. Reuse or close the current company-hosted or ATS-hosted posting before opening the next candidate.
9. Open the company-hosted or ATS-hosted posting and verify it is active before saving.
10. Prefer roles with posted annual base salary ranges and family-supportive benefits when fit, mandate, and logistics are otherwise comparable.
11. Reject inactive, closed, expired, filled, removed, generic-redirect, stale, geo-blocked, or obviously blocked roles before they reach Teal.
12. Reject UK-only, London, EMEA-only, Europe-only, country-limited, state-limited, hub-limited, commuting-radius, hybrid, or relocation-required roles Matt does not clearly fit.
13. Run quick lane and fit scoring before saving.
14. Set the intended Teal Excitement from score before saving.
15. Draft notes with lane, score, compensation/logistics, benefits evidence, active-status evidence, risk, and next action before saving.
16. Save only active, qualified roles using the safest available path: Teal Job Search or saved-search Save/Bookmark when the role is already inside Teal, then the Teal Chrome extension from the live source posting, then Manual Add Job only as a last resort.
17. If the extension exposes Excitement and notes before save, set Excitement first, add notes second, then click Bookmark or Save third.
18. If the extension cannot set those fields before save, treat the save as Provisional and immediately open the Teal Tracker record to finish Excitement, notes, salary fields, and full JD before counting the role.
19. Treat extension saves as Provisional until confirmed in Teal.
20. Confirm each saved job appears as Bookmarked and has title, company, location, URL, structured salary fields when annual base salary is visible, full JD, Excitement, and notes.
21. Manual Add Job is allowed only when Teal-native Save/Bookmark and the Chrome extension are unavailable or fail, and only after the full actual JD has been captured from the live source posting.
22. If using Manual Add Job, paste the full actual JD into the job description field before saving or in the same edit session, then reopen the record and verify the Job Description or Original Job Description section contains the full text.
23. If the JD field is unavailable or the JD cannot be pasted immediately, stop and report the blocker instead of creating a bare bookmarked record.
24. Do not add multiple manual records before verifying the first one has the full JD.
25. Do not use Latest Saved Jobs or Tracker counts as proof of new saves without ledger and record confirmation.
26. Populate Teal Minimum Salary and Maximum Salary fields when annual base salary is visible. Put ranges into min and max, exact salaries into both, `up to` into max only, and `from` or `starting at` into min only.
27. Use save labels: Confirmed saved, Duplicate existing, Provisional, Delayed confirmed, Failed save, Rejected.
28. Treat the requested count as qualified confirmed saves. If the user asks for 10 jobs, keep searching until 10 qualified roles are confirmed saved or a real blocker/search exhaustion point is reached.
29. Expand across title aliases and adjacent lanes before accepting fewer than the target.
30. Pivot after 5 candidates in one title family with 0 qualified saves, 2 repeated geo blockers, 10 minutes without a qualified save, 2 ambiguous extension events, or poor-quality result skew.
31. Send a non-blocking progress update every 3 confirmed saves or every 10 candidates reviewed.
32. Use the browser-loop fail-safe after 2 confirmed saves, 12 candidates reviewed, 8 minutes of browser work, or 40 browser actions.
33. Do not wait for the user after routine progress updates.
34. Return an active-only shortlist with which roles deserve deeper research.

## Score Saved Jobs
1. Open Teal Job Tracker in Chrome.
2. Find jobs with no Excitement score or stale notes.
3. Read the JD and source URL.
4. Verify the posting is active when feasible.
5. Score using the role-fit rubric.
6. Set Excitement and add notes.
7. Do not draft assets unless a role clears the pursue threshold or the user asks.

## Apply To A Specific Job
1. Open the Teal job record in Chrome.
2. Verify source link is active. If source redirects or blocks, find the company-hosted posting once.
3. Move the job to Applying when asset work starts.
4. Research company, role, hiring manager/recruiter, market, competition, likely KPIs, and why the role exists.
5. Finalize fit score and Excitement.
6. Open Resumes from the Teal job record.
7. Create a new tailored resume or open the attached role resume.
8. Use Default to all content on when creating from the master profile.
9. In Resume Builder, use Job Matcher to identify missing truthful hard skills, soft skills, and role terms.
10. In Content Editor, update target title, professional summary, bullets, and Skills & Interests.
11. Keep the resume readable and two pages unless the role justifies otherwise.
12. Use Analyzer and Job Matcher until issues and match gaps are addressed without keyword stuffing.
13. Open Cover Letter, select medium or long based on role complexity, and use a custom prompt grounded in research.
14. Export resume and cover letter as separate files.
15. Prepare application answers from the exact form questions.
16. Stop before submission and ask for approval with the exact destination and data involved.

## Apply From Trackers, Best To Worst
1. Open Teal Trackers in Chrome.
2. Review non-applied Bookmarked or Saved roles by Excitement, fit score, recency, compensation, logistics, and effort.
3. Open the highest-ranked candidate's source URL and verify the live posting.
4. If inactive, archive it with a note and verification date, then continue.
5. If active but blocked or low fit, downgrade or note it, then continue.
6. Move only the first viable role to Applying after live application flow inspection.
7. Build the application pack and stop before submission.

## Update Teal Records
1. Use `gpt-5.4-mini` with medium reasoning for routine record maintenance after the update pattern is known.
2. Use `GPT-5.5` with medium reasoning for UI repair, protocol redesign, or repeated failure diagnosis.
3. Use `docs/teal-workflow.md` as the canonical UI feature map and controlled-batch checklist.
4. Open Teal Tracker in Chrome and create a compact ledger of records to update.
5. Cap the first cleanup pass at 5 records, then checkpoint the ledger before continuing.
6. Use table inline edits for verified salary min, salary max, location, status, follow-up, deadline, and Excitement.
7. Use the detail screen for source URL, full JD, notes, resumes, contacts, and any field that proves brittle or evidence-bearing.
8. Do not batch Date Posted, source URL, full JD, rich notes, shared resume content, or application statuses that imply external progress.
9. Update Date Posted only from source-backed evidence, one record at a time.
10. If the inline date picker creates an incorrect or uncertain value, stop rather than continuing a bulk edit.
11. If Intercom or another floating widget blocks table controls, scroll the row above the widget or close the widget. Do not guess through the obstruction.
12. Use Compensation analysis only after reconciling with the Tracker row and live source evidence.
13. If salary evidence conflicts across source, currency, country, or range, mark the role for manual re-verification before application work.
14. Use page-context JavaScript only for visible DOM inspection, visible row extraction, or identifying controls.
15. Do not extract tokens, print secrets, bypass Cloudflare or CAPTCHA, or mutate private Teal endpoints.
16. Record before value, source evidence, after value, verification method, rollback note, and decision for every field mutation.

## Teal UI Signals Observed
Saved job records expose:
- job list
- salary range
- Excitement star rating
- inline salary and rating controls from the Tracker table
- stage controls
- source link
- Job Info
- Notes
- Resumes
- Contacts
- Email Templates
- Check List
- Practice Interview
- Compensation analysis and Offer Analysis as separate beta surfaces, useful for comparison but not record truth unless reconciled
- People and Company trackers with filter, grouping, columns, menu, manual add, and extension entry points

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
- cover letter length, tone, job, custom prompt, model, write with AI, copy text
