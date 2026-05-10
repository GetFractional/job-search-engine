# Job Search Request Template

Use this when asking Codex to find jobs.

```text
Find jobs for me.

Model: gpt-5.4-mini
Reasoning: medium
Mode: inferred Quick
Lanes: [RevOps / Growth Ops / Lifecycle / Growth Marketing / Ecommerce / selective Head or VP Marketing]
Location: [remote preferred / local hybrid okay / other]
Comp: [$150k+ preferred, $120k strategic floor only if strong]
Freshness: [last 24h / last 7d / any]
Count: [10 to 20 roles]
Must include: [optional keywords]
Avoid: [optional exclusions]
Priority: Favor roles with posted annual base salary ranges and family-supportive benefits when fit is otherwise comparable
Save path order: Use Teal's native Save/Bookmark button for roles already inside Teal, then the Teal Chrome extension from live source pages, then Manual Add Job only as a last resort
Active gate: Do not save a role until the company or ATS posting opens and appears active
Count rule: Count means qualified confirmed saves, not reviewed candidates
Search expansion: Use multiple title families and adjacent lanes so the best jobs win
Baseline: Record Teal Bookmarked baseline before saving
Browser hygiene: Keep Chrome lean. Close stale job tabs and close the Teal side panel when it is not actively needed.
Source-tab rule: Evaluate one source posting tab at a time. Keep the candidate queue in the ledger, not as open tabs.
Save ledger: Track Candidate, Source, Geo, Fit, Salary min, Salary max, JD captured, Save attempt, Teal confirmed, Decision
Save sequence: Score the role first, set intended Excitement second, draft notes third, then click Bookmark or Save only after the role is qualified.
Confirmation: If the extension cannot set Excitement and notes before save, immediately open the Teal Tracker record and complete Excitement, notes, salary fields, and full JD before counting it.
Salary fields: If annual base salary is visible, populate Teal Minimum Salary and Maximum Salary fields after saving. Do not bury salary only in notes.
Benefits: If family-supportive benefits are visible, capture them in Teal notes when they affect fit.
Full JD: Do not count or leave bare bookmarked records. If Manual Add Job is unavoidable, capture the full source JD first, add it before or during the same save, then verify it after save.
Safe acceleration: Use only visible UI, the Teal extension, Tracker inline edits for verified low-risk fields, and visible DOM inspection. Do not bypass Cloudflare, CAPTCHA, login, permissions, or private endpoints.
Manual add rule: Capture the full source JD before manual entry, paste it into Teal before or during the same save, reopen the record, and verify the Job Description or Original Job Description text before continuing. If that cannot be done, stop instead of bulk-adding manual records.
Geo gate: Reject UK-only, London, EMEA-only, Europe-only, country/state/hub-limited, commuting-radius, hybrid, or relocation-required roles I do not clearly fit
Pivot rule: Pivot after 5 candidates with 0 saves, 2 repeated geo blockers, 10 minutes without a save, or 2 ambiguous extension events
Progress: Send a non-blocking progress update every 3 confirmed saves or every 10 candidates reviewed. Do not wait for my response unless there is a real external blocker.
Fail-safe: After 2 confirmed saves, 12 candidates reviewed, 8 minutes of browser work, or 40 browser actions, return a compact ledger before continuing. If the runtime cannot safely continue, stop with saved count, blocker, and exact continuation step.
Output: active-only shortlist with score, active-status evidence, risks, next action, and Teal save status
```

## Notes
- Use Quick mode for broad search.
- Use Teal's native Save/Bookmark for roles already in Teal and the Teal Chrome extension to bookmark promising source-page roles after active-posting verification, scoring, intended Excitement, and notes are prepared.
- Do not save roles from search snippets, stale aggregator cards, generic redirects, or inactive postings.
- Do not use Latest Saved Jobs or Tracker counts as proof of new saves without ledger and record confirmation.
- Do not use Manual Add Job as a convenience fallback when extension capture is flaky.
- Keep searching after rejected candidates until the qualified saved target is met or a real blocker/search exhaustion point is reached.
- Search across multiple names for Matt's lanes, including RevOps, Growth Ops, GTM Ops, Lifecycle, CRM, Retention, Growth Marketing, Revenue Marketing, Demand Generation, Ecommerce Growth, CRO, and selective Head/VP Marketing.
- Prioritize salary-visible roles and family-supportive benefits without letting weak or blocked roles through.
- Future chats should infer the full workflow from concise prompts like `Find 10 qualified jobs`.
- Do not request full application assets until a role scores well enough.
