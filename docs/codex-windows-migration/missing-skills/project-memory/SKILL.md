---
name: project-memory
description: Manage local MCP-backed project memory for stable cross-session recall, packet handoffs, QA verdicts, decisions, and open risks. Use when Codex should remember durable project context across sessions, especially at session start, after packet updates, after QA verdicts, after product or website decisions, or when restoring the last known handoff without reloading full chat history. Do not use for secrets, raw chat dumps, mutable tracker state as source of truth, or code rollback.
---

# Project Memory

Use this skill to make memory useful without letting it overrule ClickUp, Git, or repo-local docs.

## Workflow

1. Decide whether the information is durable enough to store.
2. At session start, recall only the smallest set needed:
   - project profile or durable project facts
   - latest active packet or handoff
   - latest QA verdict
   - open risks or blockers
3. During work, store only stable artifacts:
   - project profile changes
   - packet summaries and handoffs
   - QA verdicts
   - design or strategy decisions
   - user workflow preferences
4. When storing, use:
   - a compact title line
   - short factual body
   - explicit source references in the content
   - a server-supported `type`: `fact`, `entity`, `relationship`, or `self`
   - structured `tags` for artifact class, lane, project, task, and status
   - concrete `entities` for the real people, tasks, surfaces, or artifacts involved
   - TTL and importance appropriate to the memory class
5. When recalling, start narrow:
   - query by task ID, artifact name, or exact surface wording
   - filter by `type` and `entities` when possible
   - prefer a literal query plus filters because free-text recall is query-sensitive
   - load only the memories needed for the current step
6. When something is obsolete, forget it or store a superseding memory with explicit provenance.

## Guardrails

- Do not store secrets, tokens, passwords, or raw config values.
- Do not dump whole chats, full docs, or raw command logs into memory.
- Do not treat memory as the source of truth for task status, repo state, or shipped behavior.
- Do not use memory for code rollback.
- Prefer one memory per durable artifact, not giant summary blobs.
- If packet, ClickUp, repo, and memory disagree, memory loses.

## Troubleshooting

- The skill can be present even when the MCP tools are not yet loaded.
- The memory MCP server exposes tools, not MCP resources, so it will not appear in resource-only checks.
- After changing the memory MCP config or install path, fully quit and reopen Codex.
- If the skill is available but memory tools are still missing in a new session, verify the server path in `/Users/mattdimock/.codex/config.toml` and confirm the local install exists under `/Users/mattdimock/.codex/vendor/memory-mcp/`.

## Live MCP Type Mapping

Use Job Filter memory classes as tags, not as MCP `type` values.

- `fact`
  - use for packet summaries, handoffs, phase decisions, QA verdicts, risks, and research notes
- `entity`
  - use for durable project or product identity records, such as the Job Filter profile or a stable surface definition
- `relationship`
  - use when the memory is mainly about a dependency or association, such as task-to-surface, blocker-to-task, or handoff ownership
- `self`
  - use for your durable workflow preferences, review preferences, and operating constraints

For subtypes, use tags such as:

- `artifact:profile`
- `artifact:packet`
- `artifact:handoff`
- `artifact:decision`
- `artifact:qa-verdict`
- `artifact:risk`
- `artifact:research-note`
- `artifact:preference`

## Write Pattern

Default write recipe:

1. Choose the live MCP `type`
2. Add 3-8 structured `tags`
3. Add 2-6 concrete `entities`
4. Write a compact source-aware summary that repeats the most likely future recall phrases

Good recall phrases include:

- `Job Filter`
- the ClickUp task ID
- the surface name such as `/profile` or `pricing page`
- the artifact name such as `packet`, `handoff`, or `QA verdict`
- the decision label such as `phase decision` or `offer decision`

## References

Load only what is needed:

- `references/memory-schema.md`
- `references/recall-workflows.md`

## Output Pattern

Return:

1. Whether memory should be used
2. Recall plan or write plan
3. MCP type, tags, and entities
4. Proposed content summary
5. Follow-on action after recall or write
