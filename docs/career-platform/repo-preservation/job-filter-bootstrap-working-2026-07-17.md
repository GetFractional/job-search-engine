# Preserved Job Filter Bootstrap Change

Captured: 2026-07-17

Source checkout: `/Users/mattdimock/Documents/Jobs/Job Filter/Job-Filter-v2`

Source branch: `codex/skill-sync-job-filter-20260513`

Source HEAD: `706afbf7dcf9087f5ae5b471e67d6d3ac27a1a50`

Working-file SHA-256: `51563a7ab2503ba953ca6dd34533e1d22aba9ff06ee08e5b603e08ebd5e77e40`

HEAD-file SHA-256: `a8d4952534b4719a5d2fd219130f144462307a9b25f0c3045229729354c50a76`

This record preserves the only uncommitted file found during the 2026-07-17 repository audit. It is evidence and recovery material, not approval to promote the change.

## Working File

```markdown
# Job Filter v2 Bootstrap

1. Read the canonical operating system repo:
   - `codex-global-instructions.md`
   - `mcp-setup.md`
   - `project-profiles/job-filter-v2.md`
2. Run `./scripts/sync-codex-skills.sh global` from the canonical repo if repo-specific skills are missing.
3. Confirm required skills are available:
   - `job-filter-activation-design`
   - `job-filter-proof-grounding`
   - `job-filter-delivery-os`
4. Confirm MCP routing:
   - GitHub
   - ClickUp
   - Airtable
   - Playwright
5. Review the active packet and ClickUp task before implementation.
6. If UI work is involved, stop until a screen contract exists.
```

## Exact Diff From HEAD

```diff
diff --git a/.codex/bootstrap.md b/.codex/bootstrap.md
index ec573a4..c70196d 100644
--- a/.codex/bootstrap.md
+++ b/.codex/bootstrap.md
@@ -4,14 +4,15 @@
    - `codex-global-instructions.md`
    - `mcp-setup.md`
    - `project-profiles/job-filter-v2.md`
-2. Confirm required skills are available:
+2. Run `./scripts/sync-codex-skills.sh global` from the canonical repo if repo-specific skills are missing.
+3. Confirm required skills are available:
    - `job-filter-activation-design`
    - `job-filter-proof-grounding`
    - `job-filter-delivery-os`
-3. Confirm MCP routing:
+4. Confirm MCP routing:
    - GitHub
    - ClickUp
    - Airtable
    - Playwright
-4. Review the active packet and ClickUp task before implementation.
-5. If UI work is involved, stop until a screen contract exists.
+5. Review the active packet and ClickUp task before implementation.
+6. If UI work is involved, stop until a screen contract exists.
```

## Recovery Rule

Do not restore this file blindly. First confirm where bootstrap authority now lives, then compare this sync instruction with the canonical operating-system workflow and promote it through a focused governance change if it is still correct.
