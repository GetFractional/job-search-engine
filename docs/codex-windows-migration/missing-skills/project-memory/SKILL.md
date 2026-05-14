---
name: project-memory
description: Manage local MCP-backed project memory for stable cross-session recall, packet handoffs, QA verdicts, decisions, and open risks. Use when Codex should remember durable project context across sessions. Do not use for secrets, raw chat dumps, mutable tracker state as source of truth, or code rollback.
---

# Project Memory

Use this skill to make memory useful without letting it overrule ClickUp, GitHub, Airtable, or repo-local docs.

## Workflow

1. Decide whether the information is durable enough to store.
2. Recall only the smallest memory set needed at session start.
3. Store only stable artifacts:
   - project profile changes
   - packet summaries and handoffs
   - QA verdicts
   - stable decisions
   - user workflow preferences
4. Use compact, source-aware summaries.
5. Query narrowly by task ID, artifact name, or surface wording.

## Guardrails

- Do not store secrets or raw config values.
- Do not use memory as the source of truth for task status.
- Do not dump whole chats into memory.
- If GitHub docs, ClickUp, Airtable, and memory disagree, memory loses.

## Output Pattern

Return:

1. Whether memory should be used
2. Recall or write plan
3. Suggested tags or entities
4. Proposed content summary
5. Follow-on action
