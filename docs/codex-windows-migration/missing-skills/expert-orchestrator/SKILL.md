---
name: expert-orchestrator
description: Determine the best expert roles, frameworks, mentor lenses, and workflows for a task, then orchestrate them into a concise working plan. Use when the user asks who should be involved, what frameworks should guide the work, how to approach an ambiguous problem, or wants structured strategic guidance before or during execution. Supports product, growth, strategy, execution, design, risk, research, creative, and AI-assisted work. Do not use for trivial deterministic tasks.
---

# Expert Orchestrator

Use this skill to choose the smallest useful set of roles and frameworks, not to simulate a crowded room.
Default to a tight coalition. Expand only when the task is broad, multi-stage, high-stakes, or the user explicitly asks for a wider set of lenses.

## Workflow

1. Restate the objective, stage, constraints, stakes, and unknowns.
2. Read these references:
   - `references/role-router.md`
   - `references/framework-router.md`
   - `references/mentor-router.md` only if a mentor lens would materially improve the output
3. Choose an orchestration mode:
   - `tight` for most work:
     - 1 lead role
     - 1 to 3 support roles
     - 1 primary framework
     - up to 2 supporting frameworks
     - 0 mentor lenses by default, 1 if useful, 2 only when clearly justified
   - `expanded` only when the task is broad, cross-functional, multi-stage, high-stakes, or the user explicitly asks for wider coverage:
     - 1 lead role
     - up to 10 supporting lenses total across support roles and mentor lenses
     - 1 primary framework
     - up to 10 frameworks total
4. Apply a relevance test before adding any supporting role, mentor, or framework:
   - It addresses a distinct bottleneck, decision, stage, or failure mode.
   - It reduces rework, risk, or blind spots in a way the current set does not.
   - It is concrete enough to affect the plan, not just make the output look comprehensive.
5. Rank selections in priority order and tag each one:
   - `active now` for items that should shape the immediate plan
   - `reference if needed` for items that are useful but not central
6. Explain why each selected role, mentor lens, or framework was chosen in one short line.
7. Produce a working plan with assumptions, verification needs, risks, and next actions.

## Guardrails

- Roles are functional lenses, not personalities.
- Default to the smallest coalition that can materially improve the work.
- Treat mentor lenses as optional support lenses, not separate authorities.
- If the set grows beyond 3 support lenses or 3 frameworks, group items by purpose and keep the narrative compressed.
- Do not use the full cap unless each added item clearly maps to a different need.
- Do not load more than 3 reference files unless the task is broad and high stakes.
- Prefer general frameworks before mentor lenses.
- If facts are unstable or evidence is weak, tag assumptions and add verification steps.
- For low-stakes deterministic tasks, skip this skill and just execute.

## Output Pattern

Return:
1. Orchestration mode: `tight` or `expanded`
2. Recommended roles
3. Recommended mentor lenses, if any
4. Recommended frameworks
5. Why this set fits the task
6. Execution sequence
7. Risks, assumptions, and what would change your mind

When using expanded mode:
- Split roles and mentor lenses into `active now` and `reference if needed`.
- Split frameworks into `core stack` and `extended stack`.
- Keep the plan concise. More items should increase coverage, not length for its own sake.
