# Source and Test Receipt

Date: 2026-07-21
Working tree: `/private/tmp/way-ahead-private-alpha-20260721`
Branch: `codex/way-ahead-private-alpha`
Prototype: `prototypes/worthward-mobile`

## Exact-build readback

The final handoff service was rebuilt and restarted with:

```text
npm run qa:remote
```

`npm run qa:remote:status` reported the preview healthy at `http://localhost:3011/#/` and the temporary keep-awake guard active. A fresh GET returned `HTTP/1.1 200 OK`. Rendered HTML contained `Way Ahead`, `provisional`, and `Find the work that moves your life forward`.

The source and bundle hashes that bind the accepted evidence are recorded in `final-current-build/manifest.md`; accepted image hashes are in `final-current-build/artifact-sha256.txt`.

## Automated checks

The final maker run executed:

```text
npm test
npm run lint
```

Results:

- typecheck: pass
- production build: pass
- Node truth, state, schema, economics, Remote-access, and regression tests: 40 passed, 0 failed, 0 skipped
- ESLint: pass

The suite includes current protections for Remote-versus-native-mobile truth, source-kind and external-approval boundaries, sample-workspace gating, persistent fixture labeling, arbitrary-job inputs, onboarding persistence, interrupted-route recovery, independent integrity cards, context-specific Career Path controls, full-row focus, customer-facing validation language, commercial hypothesis separation, schema lineage, cross-tenant isolation, economics allocations, one current Job Standard, one primary Career Path, and deterministic resume assignment.

## Provenance boundary

The clean worktree began at commit `cb425a3117dca675bdc100915dba7ba4c4a877b0` on branch `codex/way-ahead-private-alpha`. The existing origin repository is public, so private-alpha product and personal job-search artifacts were not pushed there. Local branch and file hashes are the current provenance evidence pending a Board-approved private remote.
