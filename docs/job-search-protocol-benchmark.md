# Job Search Protocol Benchmark

Use this file to measure whether Codex + TealHQ protocol changes improve application quality, efficiency, and outcomes over time.

## How To Use

- Add one row for every meaningful Standard or Deep role run.
- Add a row for a meaningful dry run only if it tests a protocol change.
- Use visible Teal data when available. If evidence is missing, write `not visible` or `not measured`.
- Keep scores consistent. Do not inflate precision from weak evidence.
- Review trendlines after at least 3 meaningful runs before locking in a major protocol rule.

## Scoring Dimensions

Scores use a 1 to 5 scale.

| Dimension | What It Measures |
|---|---|
| Fit decision quality | Role lane, mandate, compensation, logistics, and pursue decision accuracy |
| ATS prose placement | High-value terms in title, summary, and selected bullets, not only skills |
| Skills taxonomy quality | Categorized, deduped, canonical, role-specific, no weak filler |
| Claim safety | Metrics, ownership, source context, and no unsupported AI or revenue claims |
| Page discipline | Two pages maximum, second page used well, no spill |
| Teal execution efficiency | Export loops, shared-content risk, UI blockers, save sequence integrity, avoidable rework |
| Tracker data quality | Salary min/max fields, source URL, full JD, status, Excitement, notes, next action completeness, and no unverified manual-add records |
| Salary and benefits signal | Salary range visibility, family-supportive benefits evidence, structured salary capture, and compensation uncertainty |
| Safe Teal acceleration | Correct use of inline table edits, detail-screen fallback, visible DOM inspection, no private endpoint mutation, no challenge bypass |
| Runtime stability | Browser-loop closeout, token control, one-job-tab discipline, tab hygiene, blocker reporting, and no null final state |
| Submission readiness | Resume, cover letter if used, answers, filenames, QA, approval stop |
| Outcome signal | Interview, recruiter reply, rejection, no response, pending, or not yet known |

## Composite Scoring

Use the first 11 numeric dimensions for the protocol health score.

```text
Protocol health score = (fit decision quality + ATS prose placement + skills taxonomy quality + claim safety + page discipline + Teal execution efficiency + tracker data quality + salary and benefits signal + safe Teal acceleration + runtime stability + submission readiness) / 55 * 100
```

Outcome signal is tracked separately because it arrives later and is affected by market conditions, timing, network strength, and applicant volume.

## Application Run Log Template

Use this compact note below the benchmark table when details matter.

```text
### YYYY-MM-DD, Company, Role
- Mode:
- Protocol version or change tested:
- Source status:
- Live viability gate:
- Match Score before / after:
- Resume Analyzer before / after:
- Page count before / after:
- Export loops:
- Browser-loop closeout:
- Source-tab discipline:
- Save sequence:
- Save path used:
- Tracker salary fields:
- Salary visibility:
- Benefits evidence:
- Full JD captured:
- Manual-add verification:
- Teal update method:
- Inline edit success:
- Date picker blocker:
- UI feature map version:
- Controlled batch scope:
- Records reviewed / changed / skipped:
- Compensation analysis reconciled:
- Rollback notes:
- Safe automation notes:
- Gap labels:
- Shared-content risk:
- Token estimate:
- Main token drivers:
- Outcome signal:
- Keep, revise, or revert:
```

Gap labels:

- `covered in prose`
- `covered in skills`
- `external asset only`
- `unsupported`
- `noise`

## Benchmark Table

| Date | Role | Mode | Protocol version or change tested | Fit decision quality 1-5 | ATS prose placement 1-5 | Skills taxonomy quality 1-5 | Claim safety 1-5 | Page discipline 1-5 | Teal execution efficiency 1-5 | Tracker data quality 1-5 | Salary and benefits signal 1-5 | Safe Teal acceleration 1-5 | Runtime stability 1-5 | Submission readiness 1-5 | Match Score before | Match Score after | Analyzer before | Analyzer after | Page count before | Page count after | Token estimate | Outcome signal | Notes |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| 2026-05-09 | Alex and Ani, Growth Marketing Director (Retention Focus) | Deep, estimated | Added missing-term coverage map, stronger soft-skill harvesting rules, page-budget discipline | 4 | 3 | 4 | 4 | 4 | 3 | not measured | not measured | not measured | not measured | 5 | 29% | 38% | not measured | not measured | not measured | 2 | Deep, estimated | Submitted through Gem after final two-page export and QA | User-added term changes improved score. Extra lifecycle skills were added through categorized Teal skills. Final export was verified back to two pages before submission. |

## Trendline Method

- Evaluate protocol changes after at least 3 meaningful Standard or Deep runs.
- Keep changes that improve at least 2 of ATS prose placement, claim safety, page discipline, Teal execution efficiency, submission readiness, or outcome signal without hurting another category.
- Revise changes that improve Match Score but add filler, duplicate proof, weak skills, or page spill.
- Revert changes that create shared-content risk, unsupported claims, or repeated export loops.
- Compare similar role lanes together when possible, because RevOps, Lifecycle, Growth Marketing, and Ecommerce roles reward different proof.

## Trendline Questions

- Are Match Score gains coming from stronger prose placement or just more skills?
- Are Job Matcher gaps being labeled once and reused, or rediscovered every run?
- Are score gains preserving claim safety and recruiter readability?
- Are job-search runs setting Excitement and notes before save when possible, and completing those fields before counting a save when not possible?
- Are search runs using one source posting tab at a time instead of turning the browser into the candidate queue?
- Are roles inside Teal saved with Teal-native Save/Bookmark and source-page roles saved with the Chrome extension before Manual Add Job is considered?
- If Manual Add Job was used, was the full source JD captured before manual entry and verified after save before any second manual record was created?
- Are we reducing export loops and shared-content mistakes?
- Are saved jobs carrying structured salary data when salary is visible?
- Are salary-visible roles and family-supportive benefits being prioritized without allowing weak roles through?
- Are Teal table inline edits speeding up low-risk updates without corrupting dates or record evidence?
- Are page-context JavaScript tactics limited to visible DOM inspection and targeting rather than private API mutation?
- Are controlled Teal cleanup batches capped, ledgered, source-backed, and reconciled against the Tracker rather than Compensation analysis alone?
- Are Date Posted and evidence-bearing fields handled one record at a time instead of batched through brittle controls?
- Are browser-driven runs closing with a real ledger instead of null or silent completion?
- Which role lanes convert with lower Match Scores because the mandate fit is still strong?
- Which protocol changes should be kept, revised, or reverted after 3 runs?
