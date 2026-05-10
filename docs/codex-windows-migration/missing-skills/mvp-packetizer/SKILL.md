---
name: mvp-packetizer
description: Convert a ClickUp task, feature request, or implementation idea into a decision-complete packet for packet-first delivery. Use when a task is scoped enough to define but not yet ready for build execution, or when a stale packet needs to be refreshed against current repo reality. Add product-delivery-os when tracker or WIP state matters. Do not use for direct implementation.
---

# MVP Packetizer

Use this skill to make the next build or QA session decision-complete.

## Workflow

1. Confirm the task source:
   - ClickUp task
   - repo issue or doc
   - user request without a task yet
2. Read the repo-local project profile and current repo reality.
3. If this packet is a refresh or continuation, use `project-memory` to recall the last packet summary, relevant decisions, and open risks before reading broader docs.
4. Pull only the exact supporting references needed to define the packet.
5. Write or refresh the packet with:
   - objective
   - current state
   - target state
   - scope in
   - scope out
   - acceptance criteria
   - verification
   - file shortlist
   - dependencies
   - risks and rollback
6. If tracker state is missing or the task packet in ClickUp is incomplete, call out the gap and route through `product-delivery-os`.

## Guardrails

- Do not invent shipped behavior.
- Keep the packet specific enough that the builder does not need extra product decisions.
- Prefer the packet plus project profile over broad canon loading.
- If a task is still strategically ambiguous, hand back to `startup-mvp-orchestrator` plus `expert-orchestrator`.

## References

Load only what is needed:

- `references/packet-template.md`

## Output Pattern

Return:

1. Packet readiness
2. Missing facts or contradictions
3. Packet content or packet refresh
4. Verification plan
5. Build handoff note
