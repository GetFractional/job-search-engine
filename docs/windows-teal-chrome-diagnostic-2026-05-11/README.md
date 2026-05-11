# Windows Teal/Chrome Codex Diagnostic, 2026-05-11

## Purpose
This packet documents the Windows Codex failure mode during TealHQ resume optimization for Matt Dimock's HackerOne `Director, Marketing Operations` application.

The goal is to let the MacBook Codex inspect the problem without Matt manually transferring prompts, outputs, or context between machines.

## Summary
The Windows Codex session can connect to Google Chrome and TealHQ through the Codex Chrome extension, but it is not operating Teal efficiently or reliably enough for production resume work.

The biggest observed problems:

- Teal DOM reads and screenshots intermittently time out.
- Chrome bridge health checks pass even when Teal interactions are slow or stuck.
- Teal's `Export PDF` button is visible and clickable, but no new PDF download is produced through automation.
- Teal's skills editor is hard to manipulate safely because `Delete Skill` applies globally to all resumes.
- Category creation did not persist as expected in the current Teal builder view.
- The assistant made the process worse by partially editing skills into grouped lines without reaching a clean final state or export verification.
- The process was too slow because it relied on repeated heavy DOM snapshots and broad UI probing.

## Files In This Packet
- `timeline.md`: chronological record of the user goal, actions taken, failures, partial fixes, and current state.
- `environment-and-evidence.md`: local environment, bridge health output, repo state, artifact/download evidence, and observed Teal/Chrome behavior.
- `failure-analysis.md`: likely causes, unsafe paths discovered, and specific Windows Codex behavior that needs debugging.
- `macbook-analysis-prompt.md`: a ready-to-use prompt for the MacBook Codex.
- `recommended-rebuild-plan.md`: proposed changes to make Windows Codex work more like the MacBook workflow.

## Important Safety Notes
- No secrets, cookies, OAuth tokens, or reference contacts are included.
- The diagnostic intentionally does not include `source-files/08_reference_sheet.md`.
- The live application was not submitted.
- The current Teal resume may contain partially edited skills from the failed Windows session. Treat it as needing cleanup before use.

## Current Application Context
- Company: HackerOne
- Role: Director, Marketing Operations
- Teal resume URL observed in Chrome:
  `https://app.tealhq.com/resume-builder/resumes/b1e28eea-c4e5-4136-af4f-c62062f537f3/preview`
- Ashby application URL observed in Chrome:
  `https://jobs.ashbyhq.com/hackerone/3ce7fd51-2a15-4a1a-98cc-65abfe09fb13/application`
- Verified old artifact:
  `artifacts/HackerOne - Director, Marketing Operations - Matt Dimock - Resume.pdf`
- Verified old artifact page count: 2 pages

## Immediate Ask For MacBook Codex
Diagnose why Windows Codex Chrome control is much slower and less reliable than the MacBook workflow, then guide the Windows setup toward a reliable Teal-native resume workflow.

Start by reading `macbook-analysis-prompt.md`.
