# Job Filter Repository Source Of Truth And Cleanup Plan

Last verified: 2026-07-17

Status: authority salvage ready; runtime implementation blocked

## Leader Decision

Use freshly fetched `origin/main@2a1b2b4f5ee808cb17def805a02516b29271d868` as the next clean repository base. Keep the current checkout quarantined as reference history. Do not merge, rebase, cherry-pick, reset, clean, or build from it.

The highest-value path is a documentation-first authority promotion from a clean worktree, followed by a reconciled Chapter 05 and a new implementation reset packet. Mixing the current branch into main would import stale governance, generated artifacts, runtime code, and product assumptions in one unreviewable change.

## Verified Current State

| Surface | Evidence | Decision |
| --- | --- | --- |
| Remote baseline | `git fetch --prune origin` completed on 2026-07-17; `origin/main` remained `2a1b2b4` | Valid locally observed base |
| Current checkout | `codex/skill-sync-job-filter-20260513@706afbf7` | Quarantine; not a promotion or build base |
| Divergence | 11 commits behind and 3 ahead of `origin/main` | No direct merge or rebase |
| Dirty state | only `.codex/bootstrap.md` modified | Preserve before any branch cleanup |
| Current branch commit `27580ba` | 165 files; 71,343 insertions and 547 deletions | Never cherry-pick wholesale |
| Current branch commit `4765398` | 9 files, mainly D2 HTML and packet changes | D2 HTML is reference-only pending rerender QA |
| Current branch commit `706afbf` | 18 skill files; deletes 439 lines of richer skill material | Do not salvage |
| Local `main` | `ed48a9b`, one unique commit and 29 commits behind its tracking relationship after fetch | Preserve as history; do not force-move |
| Staging tree | `/private/tmp/job-filter-authority-stage`, not Git | Review bundle only |
| Tests | `npm test` started Vitest but produced no case result and was stopped with exit 130 after an extended no-result wait | Verification unresolved, not passed or failed |

`git diff --check` found no whitespace errors in the current uncommitted bootstrap change.

## Authority Order

1. Verified ClickUp task packets, WIP state, and read-after-write receipts.
2. Freshly fetched `origin/main` repository reality.
3. `docs/product/job-filter-foundation-series-governing-packet-v7.md`.
4. Current task packets for `868hukucf`, `868hunzqm`, and blocked `868huafcx`.
5. Approved Foundation chapters.
6. Reviewed Phase 2 packets after intentional promotion.
7. Quarantined branch commits and generated artifacts as reference evidence only.

ClickUp was not available in this run, so tracker status, WIP count, approvals, and ownership remain unverified. That blocks implementation, but it does not block local strategy, evidence reconciliation, or preparation of a safe promotion packet.

## Salvage Matrix

### Promote after governance review

- career-opportunity product authority packet,
- business launch and validation plan,
- customer discovery and paid-beta script,
- Decision Receipt data, telemetry, and test contract,
- governance and repository reset packet,
- three visual directions plus their selection specification,
- other additive Phase 2 audit images after file-level review.

### Adapt, do not promote unchanged

- candidate `05-activation-and-core-app.md`,
- candidate `05-activation-architecture-spec.md`,
- `docs/product/product-os/**`,
- activation copy, user-system, and screen-contract packets,
- the latest D2 HTML after it is rerendered and compared visually.

These contain useful structure, especially `Profile -> Role Discovery -> Jobs -> Review -> Applications -> Workspace`, but predate the current Opportunity Radar, Career Baseline, canonical-employer, freshness, opportunity-integrity, Decision Receipt, theme-parity, and proof-lineage decisions.

### Quarantine or discard

- all runtime, extension-root, manifest, package, skill, and generated-artifact changes mixed into `27580ba`,
- packet and `.codex` changes from `4765398` unless a file-level review proves a current need,
- the skill deletions in `706afbf`,
- stale pricing, company-name, case-study, or WIP claims that have not been reverified,
- the current screenshots' stale Going score, compensation, and recommendation values.

## Safe Promotion Sequence

1. Restore ClickUp visibility and read `868hukucf`, `868hunzqm`, and `868huafcx` without mutation.
2. Verify WIP is at or below two, identify the authority owner, and capture current approval receipts.
3. Preserve the dirty bootstrap with its full file, diff, and hashes. The durable copy is [here](repo-preservation/job-filter-bootstrap-working-2026-07-17.md).
4. Create a new isolated branch and worktree from the freshly verified `origin/main`.
5. Copy only the reviewed additive Phase 2 documents and evidence.
6. Use the existing governing filename `05-activation-and-core-app.md`; resolve the staging packet's conflicting `05-activation-core-app.md` wording before promotion.
7. Verify the initial diff contains no `src/`, dependency, package, root-extension, skill, or dirty-bootstrap changes.
8. Review and merge the authority-only documentation change.
9. Reconcile Chapter 05 with the selected hybrid visual direction and current proof/data contracts.
10. Record explicit approvals for Chapters 01 through 05.
11. Create the real `FS8` reset, refresh `868huafcx`, assign one implementation writer, and only then open a clean implementation worktree.
12. Implement schema, provenance, approval, migration, and telemetry invariants before visual polish.

## Cleanup Boundaries

Safe now:

- inspect and document,
- fetch remote refs,
- preserve user changes outside the quarantined checkout,
- use `git worktree prune --dry-run --verbose` to identify dead metadata,
- prepare copy-ready ClickUp and PR packets.

Wait for tracker and ownership verification:

- prune worktree metadata,
- move or delete branches,
- stash, restore, or commit the dirty bootstrap,
- create the promotion branch,
- copy artifacts into the repository,
- edit authority links,
- open or merge a PR,
- change application code or dependencies.

Never without separate explicit approval:

- destructive deletion,
- force-push,
- protected-branch merge,
- production mutation,
- external publication.

## Rollback

No tracked Job Filter file was changed by this audit. The fetch only refreshed remote-tracking evidence and confirmed that `origin/main` did not move. The quarantined branch, local main, dirty bootstrap, stash, and all worktrees remain intact. If the proposed promotion direction is rejected, discard the future isolated worktree and leave the existing repository history untouched.

## Implementation Stop Conditions

Stop if any of the following remains true:

- ClickUp or WIP cannot be verified,
- no owner is assigned,
- Chapter 05 or `FS8` is absent,
- Chapters 01 through 05 lack explicit approval receipts,
- the clean diff contains runtime files during authority promotion,
- the visual target lacks matched light/dark, responsive, interaction, and accessibility states,
- the proof, canonical-job, freshness, migration, or approval tests fail,
- the test runner again hangs without a diagnosable result.
