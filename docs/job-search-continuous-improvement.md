# Job Search Continuous Improvement Loop

Use this loop to make the job-search system faster and more effective over time. The goal is not more activity. The goal is faster qualification, better-fit applications, safer Teal operations, and higher interview conversion.

## Default Improvement Mandate

During every job-search workflow, Codex should look for small durable improvements in:

- saved searches and source quality
- role qualification speed
- Teal navigation and browser reliability
- reusable Teal bullets and skills
- resume and cover-letter proof routing
- application answer reuse
- export and upload verification
- canonical asset naming
- follow-up and status hygiene

Only make changes that are low-risk and clearly within the current workflow. Ask before changing source-of-truth files, deleting Teal library content, bulk-updating records, or changing final external assets.

## Fast Qualification Improvements

Improve speed by tightening the first-pass triage:

1. Capture title, company, source URL, posting date, compensation, location, status, and full JD.
2. Apply hard gates first: freshness, compensation, remote/hybrid logistics, mandate fit, and obvious disqualifiers.
3. Use quick lane classification before company research.
4. Score only enough to decide pass, save, or research deeper.
5. Record why a role was passed so the same weak pattern is not reconsidered repeatedly.

Useful recurring filters:

- RevOps, Growth Ops, Lifecycle, CRM, Retention, Ecommerce Growth, selective VP/Head of Marketing.
- Remote or strong local hybrid.
- Fresh within 30 days unless there is strong active-hiring evidence.
- Base or likely total package near Matt's thresholds.
- Clear ownership of systems, analytics, lifecycle, GTM operations, or measurable growth infrastructure.

## Faster Job Adding

When adding jobs to Teal:

1. Prefer the Teal Chrome extension on the live posting page.
2. Confirm title, company, location, source URL, posting date, compensation, and full JD.
3. If auto-capture misses the JD, paste the JD manually.
4. Add a compact note with lane, quick score, freshness, compensation/logistics, risk, and next action.
5. Set Excitement from the quick score.

Do not spend research time on weak roles just because they were easy to save.

## Faster Application Workflow

Before drafting assets:

1. Verify live Chrome-backed Teal with the runtime probe, not only the bridge script. Passing means Chrome appears as an extension backend, live user tabs are visible, and Teal can be claimed or opened without Cloudflare/login.
2. Refresh the Teal page once after claim/open and before trusting any visible tracker rows, status, notes, applied date, or resume state. If another machine may have changed the same account, treat pre-refresh state as stale-risk.
3. If Chrome is proven but the workflow still fails, classify the blocker before continuing: stale/locked tab, stale page data, wrong browser surface, Teal readability/navigation, text entry, upload, login/security, or application-site failure.
4. If a Teal tab is locked by another session, open a fresh Chrome-extension-backed Teal tab. If tracker or resume content is unreadable after slow scoped navigation and one fresh-tab attempt, stop and request the minimum handoff artifact instead of guessing.
5. Verify the role is not already applied, not in another terminal stage, and not a duplicate wrapper of an already-submitted canonical role.
6. Verify the source posting is active and fresh enough.
7. Resolve the canonical employer before asset work. If the Teal company, JD employer, and source employer disagree, stop and resolve the mismatch instead of pushing forward.
8. Inspect the live application flow early.
9. Identify required uploads and questions.
10. If uploads are required, preflight the upload path before long final form entry:
   - confirm the exact approved file path
   - confirm the application destination
   - confirm the Codex Chrome extension has `Allow access to file URLs` on when a prior upload failed with `Not allowed`
   - use the visible upload control rather than direct backend POSTs
11. If a cover-letter slot exists, create a tailored one-page cover letter unless Matt explicitly opts out.
12. Build the required assets, application answers, and interview pack before submission readiness.
13. Verify canonical file names before upload. Never upload a file with `Teal`, `final`, `draft`, `v2`, a date, or any tool/source label in the filename.
14. When Teal export is the failing step, keep one active resume tab per route, avoid duplicate-tab buildup, retry export after one Chrome bridge repair, and verify the filesystem before declaring export blocked.
15. If Teal export, Analyzer, Job Matcher, or Teal Cover Letter is blocked during a live application, stop and report the blocker. Do not create a substitute local submission resume or cover letter unless Matt explicitly instructs a non-Teal fallback for that exact role.
16. When another Codex agent thread is active in Chrome, isolate Teal apply work in a separate Chrome-backed window or tab group to reduce session collisions and wrong-tab edits.
17. Keep one persistent Teal `Job Tracker` tab open as the anchor tab for the next role, but close no-longer-needed role-specific Teal and application tabs after submission and post-submit hygiene.
18. On shared-profile multi-machine use, only clean up the visible tabs on the current machine. Do not assume hidden tab groups on the other machine are safe to inspect or close.
19. In Teal `Skills & Interests`, never fake a category by creating a flat uncategorized skill with a category label prefix such as `Analytics Systems: ...`. Create the actual category first so the heading is bolded correctly, then add child skills inside it.

During Teal resume work:

1. Use Job Matcher to identify truthful gaps.
2. Toggle existing bullets and skills first.
3. Add durable reusable bullets or skills only when needed.
4. Leave global update options unchecked unless Matt approves a global update.
5. Use Analyzer and preview/export only after content is stable.
6. Verify the exported PDF through the filesystem.
7. For medium or long Teal text entry on Windows, use the verified Chrome tab clipboard paste path before slow typing. Keep `scripts/paste-into-focused-window.ps1` as the visible-focus OS clipboard fallback.

## Teal Library Improvement Rules

Teal bullets and skills are reusable library items. The best library gets better with each application, but only if edits are deliberate.

Allowed by default:

- Toggle bullets and skills on or off for a role.
- Add a reusable, truthful skill that is likely to recur.
- Add a reusable, truthful bullet when no existing bullet covers an important proof angle.
- Leave global update options unchecked.

Approval required:

- Delete a skill.
- Delete a bullet.
- Bulk-clean duplicate skills.
- Overwrite a shared summary.
- Check an `update in all resumes` option.
- Change source-of-truth claims or metrics.

When a useful new reusable item is discovered, prefer a clean library item over a one-off hack. Example: add `Lifecycle CRM: segmentation / journeys / retention` only if it reflects real experience and will likely be useful across future lifecycle roles.

## Run Retrospective

At the end of substantial search, scoring, or application work, include a compact improvement note:

- What slowed the workflow down?
- What reusable Teal item was added, toggled, edited, or blocked?
- What search or qualification rule should be tightened?
- What asset or answer can be reused next time?
- What documentation or skill update is warranted?

Only update docs or skills immediately when the improvement is broadly useful and low-risk. Otherwise, list it as a proposed improvement.

## Post-Submit Hygiene

After every confirmed application submission, update Teal and the local application ledger before moving to the next role.

Required Teal checks:

1. Status is `Applied`.
2. Applied date is set.
3. Teal Excitement matches the final fit score mapping.
4. Notes include submitted date, salary or compensation answer, exact asset filenames, positioning theme, relocation/remote note when relevant, and follow-up target.
5. Follow-up date is recorded or noted if Teal date entry is blocked.

Required local checks:

1. Update the application packet from approval-ready to submitted.
2. Update `docs/application-performance-ledger.md`.
3. Add or update a role-specific workflow diagnostic only when the run surfaced a meaningful blocker or reusable learning.
4. Preserve actual submitted answers, even when they differ from earlier recommendations.

Use `templates/application-retrospective.md` for substantial applications or any application with repeated friction.

## Improvement Threshold

Implement a workflow change immediately when it is likely to save at least 15 minutes per future application, prevent a recurring quality failure, or improve interview conversion without adding meaningful complexity.

Do not implement a change just because it explains a one-off problem. Record one-off issues in the diagnostic or ledger instead.

## Speed Guardrails

Do not sacrifice:

- posting freshness checks
- already-applied and terminal-status exclusion
- canonical employer resolution for wrapper or aggregator records
- compensation/logistics fit
- claim safety
- role mandate fit
- explicit approval before submission
- final PDF verification
- canonical filenames before upload
- cover letter creation when the application provides a cover-letter slot and Matt has not opted out
- Chrome/Teal failure classification before rerunning repair loops or asking Matt for help
- Teal status accuracy

Fast means fewer wasted roles and fewer repeated UI mistakes, not skipping safety gates.

## File Upload Learning

When Codex can fill ordinary application fields but cannot attach a local PDF, separate the failure modes:

- Normal fields and dropdowns prove Chrome control is working for page interaction.
- `fileChooser.setFiles failed` plus `Not allowed` points to Chrome extension file-access permission, not to the job site form.
- The first fix is the Codex extension setting `Allow access to file URLs`, followed by a Chrome/task restart.
- If upload still fails after that, use a narrow user-approved manual file-picker step, then resume automation for the remaining visible form work.
- Never downgrade to pasted resume text when a file upload exists unless Matt explicitly approves that lower-fidelity path.
