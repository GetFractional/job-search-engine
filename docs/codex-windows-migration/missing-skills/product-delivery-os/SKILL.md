---
name: product-delivery-os
description: Standardize cross-product delivery governance across task packets, WIP discipline, PR readiness, sync receipts, merge hygiene, and audit output structure. Use when work involves issue tracker alignment, GitHub PR governance, lane or WIP management, merge readiness, roadmap hygiene, or delivery audits. Do not use for direct feature implementation.
---

# Product Delivery OS

Use this skill to keep delivery governance consistent across repos and products.

## Workflow

1. Identify the source-of-truth tracker and active code context.
2. Read the relevant references:
   - `references/task-packet-template.md`
   - `references/sync-receipt-template.md`
   - `references/wip-rules.md`
   - `references/pr-governance.md`
3. Check whether the task packet is decision-complete.
4. Check whether the proposed repo work matches the tracked scope.
5. Check WIP and lane discipline using repo rules if present.
6. Produce the smallest governance action, review, or mutation plan.

## Guardrails

- The active work tracker is the scope gate. Default to repo instructions if they define one.
- Keep coding WIP at or below the repo cap. If the repo does not define one, default to 2 active coding lanes.
- Never claim tracker mutation without read-after-write proof.
- Prefer evidence in comments and stable task descriptions for task packets.
- Keep PRs coherent and small. Flag task, branch, and PR drift explicitly.

## Output Pattern

Return:

1. Governance status
2. Missing packet details
3. Required tracker or PR mutations
4. Merge blockers
5. Sync receipt if the tracker was touched

## Additional Context

- When UI work is involved, require audit thinking.
- When tracker state, branch state, and PR state disagree, call out the drift explicitly.
- When the repo already has a more specific delivery skill, prefer the repo-specific skill over this generic one.
