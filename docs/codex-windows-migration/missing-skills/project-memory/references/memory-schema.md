# Memory Schema

## What To Store

- durable project facts
- stable packet summaries
- handoff notes worth restoring later
- QA verdicts and unresolved risks
- product, design, pricing, or website decisions
- explicit user workflow preferences

## What Not To Store

- secrets or credential values
- mutable tracker state without source reference
- full chat transcripts
- full PRDs or long docs
- raw diff output
- rollback state for code changes

## Accepted MCP Types

| MCP type | Use for | Job Filter examples | Typical TTL | Typical importance |
| --- | --- | --- | --- | --- |
| `fact` | durable outcomes, summaries, and decisions | packet, handoff, decision, qa-verdict, risk, research-note | 30-365 days | 7-10 |
| `entity` | durable identity records | project profile, product surface definition, ICP record | 180-365 days | 8-10 |
| `relationship` | association or dependency memory | blocker-to-task, task-to-surface, owner-to-handoff | 30-180 days | 6-8 |
| `self` | user or operator preferences | Matt workflow preference, approval preference, lane preference | 180-365 days | 7-9 |

## Job Filter Artifact Classes

Use tags, not MCP `type`, for these domain classes:

- `artifact:profile`
- `artifact:packet`
- `artifact:handoff`
- `artifact:decision`
- `artifact:qa-verdict`
- `artifact:risk`
- `artifact:research-note`
- `artifact:preference`

## Recommended Tags

Use tags for the structured filters you will want during recall:

- `project:job-filter`
- `surface:app`
- `surface:web`
- `lane:router`
- `lane:packetizer`
- `lane:builder`
- `lane:qa`
- `task:868huafcx`
- `status:active`
- `status:failed`
- `status:passed`
- `status:shipped`

## Recommended Entities

Use `entities` for the real nouns you expect to search later:

- `Job Filter`
- `Matt Dimock`
- `/profile`
- `pricing page`
- `Proof Library`
- `ClickUp 868huafcx`
- `packet`
- `QA verdict`

## Content Pattern

Keep content short and source-aware.

Suggested structure:

```text
Title: <short durable fact or outcome>
Source: <ClickUp URL, file path, commit SHA, or PR URL>
Summary: <2-4 sentence durable summary>
Next relevance: <why future sessions should care>
```

Repeat the likely recall phrase in the title or summary. The live recall tool is query-sensitive, so exact wording helps.

## Provenance

If the memory tool exposes a `provenance` field, include the source URL, file path, task ID, and creation timestamp when practical.
