# Recall Workflows

## Session Start

Recall in this order:

1. `type=entity` with tags `project:job-filter` and `artifact:profile`
2. `type=fact` with tags `artifact:packet` or `artifact:handoff`
3. `type=fact` with tag `artifact:qa-verdict`
4. `type=fact` with tag `artifact:risk`

Stop once you have enough to start work.

## Packet Refresh

Before refreshing a stale packet:

1. recall the latest `fact` tagged `artifact:packet`
2. recall the latest `fact` tagged `artifact:decision`
3. recall any open `fact` tagged `artifact:risk`

Do not let memory replace current ClickUp or repo inspection.

## Builder Handoff

Before building:

1. recall the latest `fact` tagged `artifact:handoff` for the task
2. recall the latest `fact` tagged `artifact:qa-verdict` if the task previously failed QA

Use memory only to restore context quickly. The packet still governs scope.

## Website and Pricing Work

For marketing website or pricing work:

1. recall the project `entity` tagged `artifact:profile`
2. recall relevant `fact` memories tagged `artifact:decision` for offer, website IA, or pricing
3. if needed, add `alen-sultanic` after recall

## After QA

Store a `fact` tagged `artifact:qa-verdict` when the outcome is durable enough to matter next session.

Include:

- pass or fail
- failed criteria or proven criteria
- source references
- next required action

## Query Pattern

The recall tool is query-sensitive. Prefer:

- the exact ClickUp task ID
- the exact artifact label, such as `packet`, `handoff`, or `QA verdict`
- the exact surface name, such as `/profile` or `pricing page`
- a narrow query plus filters, instead of a broad natural-language paragraph
