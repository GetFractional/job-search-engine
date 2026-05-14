---
name: skill-maintenance
description: Capture and repair durable skills after complex work so repeated workflows improve instead of drifting. Use when a task uncovers a reusable process, a tricky fix, or a stale skill that should be corrected immediately.
---

# Skill Maintenance

Use this skill to keep the skill library accurate, narrow, and durable.

## Workflow

1. Decide whether the workflow is durable enough to become a skill.
2. Pick the narrowest home:
   - repo-specific skills under `.agents/skills`
   - cross-project skills under the shared global skill library
3. Capture only the stable steps, decision points, guardrails, and verification path.
4. If an existing skill is stale, patch it in the same run when the fix is clear.
5. Keep the skill concise enough to be reused without re-reading a full rollout.

## Triggers

Create or update a skill after:
- a complex task, typically 5 or more meaningful tool calls
- a tricky bug or environment recovery
- a non-trivial workflow discovery
- a repeated user request that deserves a standard operating path

## Guardrails

- Do not store secrets, raw credentials, or private values.
- Do not turn one-off incidents into reusable skills unless the pattern is stable.
- Do not preserve broken guidance once the correct fix is known.
- Prefer patching an existing skill over creating near-duplicate skills.
- Include verification steps so the next run can prove the workflow still works.

## Output Pattern

Return:

1. Whether a skill should be created or patched
2. Where it should live
3. The minimal workflow to record
4. Verification steps
5. Any follow-on cleanup needed
