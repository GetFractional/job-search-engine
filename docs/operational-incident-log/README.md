# Operational Incident Log

## Purpose
This folder is a lightweight reliability memory for Job Search Codex operations.

Use it to record recurring operational failures, proven fixes, and diagnostic commands so Windows Codex, MacBook Codex, and future Codex instances can self-heal without loading raw chat logs.

## What Belongs Here
Add an incident when:

- the same failure happens more than once
- a failure blocks job-search execution
- a new proven fix is discovered
- a workflow rule needs to be enforced across future agents
- MacBook and Windows Codex need a shared diagnostic handoff

## What Does Not Belong Here
Do not store:

- raw Codex session JSONL files
- screenshots unless they are essential
- cookies, OAuth tokens, API keys, auth files, or browser profile dumps
- reference contact details
- full resumes or application answers unless the incident requires them
- large PDFs unless they are the only useful evidence

## Storage Discipline
Keep each incident small:

- target 2 KB to 8 KB for normal incidents
- link to session IDs instead of copying session logs
- include only the minimal commands needed to reproduce or verify
- move old or superseded fixes into a short "superseded" note instead of deleting history

## File Naming
Use:

```text
incidents/YYYY-MM-DD-short-slug.md
```

Example:

```text
incidents/2026-05-11-windows-teal-chrome.md
```

## Operating Rule
Before starting Teal, Chrome, job application, resume export, or browser recovery work:

1. Check whether a matching incident exists.
2. Apply the proven fix or stop rule first.
3. If a new failure appears, update or add one concise incident record.
4. Do not let future agents rediscover the same failure from scratch.
