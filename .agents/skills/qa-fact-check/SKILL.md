---
name: qa-fact-check
description: Audit Matt's job-search assets and Way Ahead application packages for factual accuracy, claim safety, ATS clarity, role fit, overstatement, source alignment, and approval integrity before any external use.
---

# QA And Fact Check

## Required sources

1. `source-files/01_matt_dimock_canonical_profile.md`
2. `source-files/02_metrics_ledger.md`
3. `source-files/03_role_lane_glossary.md`
4. `source-files/04_story_bank.md`
5. `docs/claim-safety-rules.md`
6. Current canonical job posting and exact employer form
7. Current Way Ahead source version, analysis, assets, and package

Teal is competitor research only and is never part of Matt's asset or approval workflow.

## Process

1. Check every number against the Metrics Ledger.
2. Check every story against the Story Bank or Canonical Profile.
3. Check role-lane and mandate alignment.
4. Remove unsupported ownership, overstatement, and implied expertise.
5. Keep employer and client metrics attached to the correct context.
6. Remove duplicate positioning across the summary, highlights, and experience.
7. Check recruiter comprehension, ATS clarity, natural tone, and role vocabulary.
8. Remove em dashes, hype, theatrical language, and machine-sounding phrasing.
9. Verify every required employer-form answer against trusted facts.
10. Confirm the question-set checksum represents the exact current form.
11. Verify resume and cover-letter filenames, file types, page counts, binary hashes, content hashes, and claim-safe review states.
12. Render every PDF page and block blank, clipped, overlapping, broken, or third-page output.
13. Block local paths, internal source labels, demo text, unsupported metrics, and tool labels.
14. Confirm the Way Ahead outbound manifest contains only the files intended for the employer.
15. Confirm the package binds the exact destination, newest job source version, answers, outbound files, and zero unresolved blockers.
16. Confirm package approval is described as review or form-staging approval, never submission authorization.
17. Revoke or block approval when the source, form, answers, or any file changes.
18. Flag every fact or external action that still needs Matt's decision.

## Verdict

Return:

- `PASS`, `PASS WITH CONDITIONS`, or `BLOCK`
- required fixes
- optional improvements
- claim-safety table
- exact files and hashes checked
- source and form versions checked
- package-approval readiness
- remaining external-action gates

Do not mark an asset or package ready when a required claim is unsupported, a metric is contextually misleading, the exact form is unknown, an outbound file is not reviewable, or any blocker remains. This skill never authorizes form population, upload, outreach, reference sharing, negotiation, or submission.
