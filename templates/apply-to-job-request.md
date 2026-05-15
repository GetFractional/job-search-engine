# Apply To Job Request Template

Use this when asking Codex to prepare an application.

```text
Apply to this job.

Mode: Standard
Teal record or URL: [link]
Full JD: [paste or confirm saved in Teal]
Teal status: [if visible]
Applied date visible: [yes/no/unknown]
Source employer: [if visible]
JD employer: [if visible]
Teal company: [if visible]
Date posted or posting age: [if visible]
Source-active proof: [company career page / job board / recruiter note / unknown]
Duplicate or aggregator wrapper risk: [yes/no/unknown]
Deadline: [if known]
Known contact: [recruiter/hiring manager/referral]
Requested assets: [resume / cover letter / outreach / application answers / all]
Live application flow: [resume upload / cover letter slot / questions / unknown]
Submission: Draft only until I approve
Metrics: include run_id, estimated tokens, elapsed time if known, stage blockers, revision loops, and self-healing candidate
```

## Notes
- Standard mode is the default for one viable role.
- Use Deep mode for high-fit executive roles, interview prep, or compensation work.
- Codex must verify active source, freshness risk, canonical employer alignment, duplicate-wrapper risk, and already-applied status before asset work.
- Codex should inspect the live application flow early so optional cover-letter work happens only when the flow needs it, the user requested it, or a strategic exception is approved.
- Codex must stop before submitting applications or sending messages.
- Codex should record lightweight run metrics and use the full application retrospective for Standard or Deep applications with meaningful friction.
