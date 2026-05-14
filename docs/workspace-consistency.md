# Workspace Consistency

The real requirement is not "stay on one branch forever." The real requirement is "start every serious job-search session from the same validated repo state, with the same managed skills mirrored into Codex on both machines."

## Source Of Truth

- The tracked repo is the source of truth for workflows, docs, scripts, and safeguards.
- `.agents/skills/` is the source of truth for this repo's managed skills.
- `~/.codex/skills/` and `~/.agents/skills/` are mirrors for execution, not authoring surfaces for this repo.

Do not hand-edit the mirrored skill copies when the intent is to improve the shared job-search system. Edit `.agents/skills/` in the repo, then sync.

## Automatic Guardrails

This repo now provides two layers of consistency protection:

1. `scripts/prepare-job-search-workspace.ps1` and `scripts/prepare-job-search-workspace.sh`
   - install the repo-managed git hooks
   - sync repo-managed skills into the local Codex skill directories
   - verify the mirrored skills match the repo
   - verify every repo-managed skill has a valid `SKILL.md` with required metadata
   - verify branch and upstream state for cross-machine parity
2. `.githooks/`
   - after checkout, merge, or rewrite, the repo automatically re-syncs the managed skills

## Recommended Commands

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-job-search-workspace.ps1 -SyncGitIfClean
```

macOS/Linux:

```bash
./scripts/prepare-job-search-workspace.sh --sync-git-if-clean
```

If the repo has tracked local changes that should not be pulled over, run the same command without the git-sync flag so the script still installs hooks, syncs skills, and verifies the mirrors.

For read-only checks that must not install hooks or sync skill files, use verify-only mode:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-job-search-workspace.ps1 -VerifyOnly
```

```bash
./scripts/prepare-job-search-workspace.sh --verify-only
```

## Readiness Standard

The workspace is considered ready for shared Mac/Windows work when all of these are true:

- the current branch has an upstream
- the current branch is not ahead of or behind upstream
- there are no tracked local changes
- `core.hooksPath` is set to `.githooks`
- every repo-managed skill has valid metadata
- the mirrored skills in `~/.codex/skills` and `~/.agents/skills` match `.agents/skills`

Untracked local artifacts can still exist. They do not stop skill sync, but they can still matter if they collide with future tracked files.

## Why This Fix Is Better

This avoids three failure modes that caused repeat drift:

1. Skills changed in `.agents/skills/`, but the home skill mirrors were never refreshed.
2. A branch switch or pull updated repo instructions, but the active local Codex skill copies still reflected older content.
3. Stale files remained inside mirrored skill directories because the sync process only copied forward and never cleaned removed files.

The sync scripts now replace each managed mirrored skill directory and remove managed stale skill directories that no longer exist in the repo source.
