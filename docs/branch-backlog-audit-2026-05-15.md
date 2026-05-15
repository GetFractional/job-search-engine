# Job Search Branch Backlog Audit - 2026-05-15

## Purpose
Classify old Job Search branches before merging anything into `main`, so stale workflow history does not overwrite current skills, readiness checks, or Teal rules.

## Current Baseline
- `main` is the release branch for live job-search execution.
- PR #2 was merged into `main` on 2026-05-15, bringing in the process metrics, short-prompt routing, branch-readiness guard, and workspace consistency updates.
- Local `main` was fast-forwarded to the merged `origin/main` and passed `./scripts/prepare-job-search-workspace.sh --verify-only`.
- Untracked local application artifacts existed during the audit. They were intentionally left out of this workflow audit.

## Branch Classification

| Branch | Classification | Evidence | Resolution |
|---|---|---|---|
| `codex/job-search-process-optimization` | `merged` | The PR was merged into `main`; current `main` contains the workflow changes via merge commit. | No new PR needed. Safe to delete later after confirmation if desired. |
| `codex/next-best-job-apply` | `salvage-only` | The branch forked from older May 7 history and had useful next-best-job protocol text, but it lacked current readiness and skill-sync work. | Do not merge directly. Reapply only useful target-selection and live-viability rules onto a fresh branch from current `main`. |
| `codex/crescendo-application-prep` | `salvage-only` | The branch forked from older May 7 history and diverged before the current workflow hardening. | Do not merge directly. Inspect only if Crescendo-specific application evidence or reusable protocol content is needed. |
| `codex/windows-codex-migration-bundle` | `artifact-only` | The branch contains migration or handoff artifacts rather than normal workflow source changes. | Merge only if the repo should intentionally carry those artifacts. Otherwise leave as a historical handoff branch. |
| `codex/windows-missing-skills-export` | `artifact-only` | The branch contains missing-skills export material from the Windows migration flow. | Merge only after confirming the artifacts are still needed and do not duplicate managed `.agents/skills`. |
| `codex/job-search-hardening-20260514` | `merged` | Already included in `origin/main`. | No PR needed. |
| `codex/job-search-unified-teal-chrome-sync` | `merged` | Already included in `origin/main`. | No PR needed. |
| `codex/macbook-windows-teal-guidance` | `merged` | Already included in `origin/main`. | No PR needed. |
| `codex/skill-sync-job-search-20260513` | `merged` | Already included in `origin/main`. | No PR needed. |
| `codex/windows-codex-preuninstall-backup` | `merged` | Already included in `origin/main`. | No PR needed. |
| `codex/windows-teal-chrome-diagnostic-2026-05-11` | `merged` | Already included in `origin/main`. | No PR needed. |

## Decision
Do not open PRs for every old branch.

The safe workflow is:

1. Keep `main` as the normal live-job-search release branch.
2. Run the readiness gate before serious job-search work.
3. Classify old branches before merging.
4. Treat old divergent protocol branches as `salvage-only`.
5. Reapply still-useful logic onto a fresh branch from current `main`.
6. Merge only clean, current branches that pass readiness validation.

## Why Direct Old-Branch Merges Are Risky
Directly merging stale branches can:

- revive older Teal rules that predate Chrome/Teal recovery hardening
- remove or conflict with current skill-sync behavior
- create duplicate protocol docs with unclear authority
- make future chats load different guidance depending on branch state
- force the user to understand branch history, which violates the concierge workflow goal

## Salvaged From `codex/next-best-job-apply`
Useful protocol ideas to retain on current `main`:

- Use refreshed Teal Job Tracker Table view as the source of truth for next-best selection.
- Treat Home `Priorities` as a lead list only.
- Rank eligible jobs by Excitement, fit score, role lane, compensation, logistics, freshness, and application effort.
- Verify the live source and application path before asset work.
- Treat browser-rendered source evidence as stronger than cached Teal or search snippets.
- Exclude terminal statuses, visible applied dates, and duplicate wrapper records.
- Resolve canonical employer mismatches before resume or cover-letter work.
- Stop or move to the next candidate when a role is inactive, unavailable, blocked, stale, below floor, or logistically incompatible.
- Move Teal status to `Applying` only after the role clears live viability and active asset work is actually beginning.

## Not Salvaged
The older `docs/job-search-protocol-master-prompt.md` style content should not be revived as-is because it depends on long prompts and older source paths. The current product direction is short user prompts plus operator-owned routing.
