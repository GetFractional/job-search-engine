# Apply To Job Request Template

Use this when asking Codex to prepare an application.

```text
Apply to this job.

Mode: Standard
Model: GPT-5.5
Reasoning: medium
Teal record or URL: [link]
Full JD: [paste or confirm saved in Teal]
Deadline: [if known]
Known contact: [recruiter/hiring manager/referral]
Requested assets: [resume / cover letter / outreach / application answers / all]
Salary: If the posting has annual base salary, make sure Teal Minimum Salary and Maximum Salary fields are populated before asset work.
Benefits: If family-supportive benefits are visible, include them in the fit decision and Teal notes.
Teal record quality: Confirm the record has full JD, source URL, Excitement, notes, and salary fields when visible before deep work.
Submission: Draft only until I approve
```

## Notes
- Standard mode is the default for one viable role.
- Use GPT-5.5 medium for high-fit executive roles, interview prep, or compensation work.
- Use Teal's structured salary fields for visible annual base compensation, not notes alone.
- Do not proceed from a bare bookmarked role unless the full actual JD is captured first.
- Codex must stop before submitting applications or sending messages.

## Apply From Teal Trackers Template

Use this when asking Codex to apply to jobs from best to worst in Teal.

```text
Apply to the next best job in Teal.

Model: GPT-5.5
Reasoning: medium
Mode: inferred Standard
Surface: Teal Trackers in Google Chrome
Order: Best to worst by Excitement, fit score, recency, compensation, logistics, and application effort
Live gate: Verify the live posting before asset work
Salary fields: If the posting has annual base salary, populate Teal Minimum Salary and Maximum Salary fields before ranking or asset work
Benefits: Prioritize family-supportive benefits when fit is otherwise comparable
Record quality: Require full JD, source URL, Excitement, notes, and salary fields when visible before treating a role as application-ready
Cleanup: Archive inactive roles with a note and date. Downgrade active but blocked or low-fit roles with a note.
Application: Move only the first viable role to Applying after the live form is inspected
Submission: Draft and fill only what is safe, then stop before I approve final submission
```

Expected behavior:
- Do not build assets for inactive, closed, expired, removed, or no-longer-accepting roles.
- Do not leave failed roles as viable Bookmarked candidates.
- Continue down the ranked list until the first viable role is found.
