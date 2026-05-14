---
name: product-delivery-os
description: Standardize cross-product delivery governance across task packets, WIP discipline, PR readiness, sync receipts, merge hygiene, and audit output structure. Use when work involves issue tracker alignment, GitHub PR governance, lane or WIP management, merge readiness, roadmap hygiene, or delivery audits. Do not use for direct feature implementation.
---

# Product Delivery OS

Use this skill to keep delivery governance consistent across repos and products.

## Workflow

1. Identify the source-of-truth tracker and active code context.
2. Read the relevant packet, repo docs, or task notes.
3. Check whether the task packet is decision-complete.
4. Check whether proposed repo work matches tracked scope.
5. Check WIP and lane discipline using repo rules if present.
6. Produce the smallest governance action, review, or mutation plan.

## Guardrails

- The active work tracker is the scope gate.
- Keep coding WIP at or below the repo cap. Default to 2 if the repo does not define one.
- Never claim tracker mutation without read-after-write proof.
- Keep PRs coherent and small.
- When repo state, branch state, and PR state disagree, call out the drift explicitly.

## Output Pattern

Return:

1. Governance status
2. Missing packet details
3. Required tracker or PR mutations
4. Merge blockers
5. Sync receipt if the tracker was touched
