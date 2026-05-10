---
name: startup-mvp-orchestrator
description: Route MVP work into the smallest useful lane using a packet-first workflow. Use when a task is ambiguous, cross-functional, missing a build packet, or needs the next skill and prompt chosen before work starts. Pair with expert-orchestrator for ambiguity, product-delivery-os for tracker or PR governance, and alen-sultanic for monetization or funnel work. Do not use for direct implementation when a clean packet already exists.
---

# Startup MVP Orchestrator

Use this skill to decide what should happen next, not to simulate a room full of agents.

## Workflow

1. Restate the goal, current stage, and whether a ClickUp task and packet already exist.
2. Read the repo-local project profile first. If a packet exists, read that before any broader docs.
3. Classify the task into one primary lane:
   - router
   - packetizer
   - builder
   - QA
   - growth or pricing
   - truth and evidence
4. Add support skills only when they solve a distinct need:
   - `expert-orchestrator` for ambiguity, sequencing, or tradeoffs
   - `product-delivery-os` for ClickUp, WIP, branch, PR, or merge discipline
   - `alen-sultanic` for offer, pricing, website, CTA, or activation messaging
   - `project-memory` when the current step depends on prior handoffs, QA verdicts, durable decisions, or user workflow preferences that are not already in the active packet or project profile
5. Return the smallest next step with:
   - chosen phase
   - chosen lane
   - why that lane is correct
   - required inputs
   - next skill to activate
   - exact next prompt
   - quality gate

## Guardrails

- Default to one active build lane and QA only when a real diff exists.
- No build starts without a packet.
- Do not load the full canon by default when the packet and profile are sufficient.
- Memory is a later recall aid, not a source of truth.
- If tracker state is missing or contradictory, route through `product-delivery-os` before coding.

## References

Load only what is needed:

- `references/route-table.md`

## Output Pattern

Return:

1. Phase
2. Lane
3. Required inputs
4. Support skills to add, if any
5. Exact next prompt
6. Quality gate
