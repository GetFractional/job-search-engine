---
name: build-from-packet
description: Execute one active packet only, using the packet plus repo reality as the default context. Use when a decision-complete packet exists and code or repo docs should be changed. Add product-delivery-os when branch, PR, WIP, or tracker discipline is in play. Do not use when the packet is missing, contradictory, or still making product decisions.
---

# Build From Packet

Use this skill to keep implementation narrow, reviewable, and packet-bound.

## Workflow

1. Read the project profile.
2. Read the active packet.
3. If the packet references a prior handoff or failed QA pass, use `project-memory` to recall only the last relevant handoff or verdict.
4. Inspect only the touched code, tests, and one extra reference if the packet explicitly requires it.
5. Restate:
   - current behavior
   - desired behavior
   - exact scope boundaries
   - tests to run
6. Implement only the active packet.
7. Return:
   - diff summary
   - tests run
   - failures or blockers
   - unresolved risks
   - QA handoff note

## Guardrails

- No build without a packet.
- Do not load the full canon by default.
- No opportunistic refactors outside packet scope.
- If packet, tracker, and repo disagree, stop and route through `product-delivery-os`.
- If scope is still fuzzy, return control to `startup-mvp-orchestrator` or `mvp-packetizer`.

## References

Load only what is needed:

- `references/handoff-template.md`

## Output Pattern

Return:

1. Baseline summary
2. Implementation plan
3. Diff summary
4. Test results
5. QA handoff
