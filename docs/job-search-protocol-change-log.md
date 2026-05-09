# Job Search Protocol Change Log

Use this file to keep a durable record of protocol changes that future chats can reference quickly.

## Entry Format
- `date`
- `change`
- `why`
- `expected impact`
- `where implemented`
- `first role tested`
- `keep, revise, or revert`

## Entries
### 2026-05-09
- Change: Added a missing-term coverage map workflow that groups JD and Job Matcher gaps into hard skills, soft skills, business terms, and platforms/tools, then assigns each term one best landing zone.
- Why: Prior runs were good at removing weak filler but inconsistent at systematically harvesting truthful missing skill language into the strongest resume slots.
- Expected impact: Better ATS alignment, higher Match Scores, and fewer random skill-chip additions.
- Where implemented:
  - `.agents/skills/resume-strategy/SKILL.md`
  - `.agents/skills/resume-drafting/SKILL.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `docs/teal-workflow.md`
- First role tested: Alex and Ani, Growth Marketing Director (Retention Focus)
- Keep, revise, or revert: Keep under test

### 2026-05-09
- Change: Added page-budget discipline as an explicit resume optimization rule.
- Why: Small ATS-oriented phrase additions can improve Match Score while silently pushing a resume onto a third page.
- Expected impact: Fewer late-stage export loops and cleaner two-page control.
- Where implemented:
  - `.agents/skills/resume-strategy/SKILL.md`
  - `.agents/skills/resume-drafting/SKILL.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
  - `docs/teal-workflow.md`
- First role tested: Alex and Ani, Growth Marketing Director (Retention Focus)
- Keep, revise, or revert: Keep under test

### 2026-05-09
- Change: Added a benchmark file, change-log file, and measurement rule so protocol edits are scored against actual application outcomes instead of judged informally.
- Why: The workflow needed a durable way to compare whether new prompt and resume rules improve ATS fit, asset quality, and submission readiness over time.
- Expected impact: Better cross-chat continuity, less guesswork, and faster identification of protocol changes that should be kept or reverted.
- Where implemented:
  - `docs/codex-teal-application-protocol.md`
  - `docs/job-search-protocol-benchmark.md`
  - `docs/job-search-protocol-change-log.md`
  - `.agents/skills/tealhq-workflow/SKILL.md`
- First role tested: Alex and Ani, Growth Marketing Director (Retention Focus)
- Keep, revise, or revert: Keep under test
