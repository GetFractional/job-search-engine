# Windows Teal/Chrome Codex Diagnostic, 2026-05-11

## Purpose
This packet documents the persistent Windows Codex failure mode around Chrome-backed TealHQ work, with the HackerOne `Director, Marketing Operations` resume incident as the clearest end-to-end failure case.

The goal is to let the MacBook Codex inspect the problem without Matt manually transferring prompts, outputs, or context between machines.

## Summary
The Windows Codex setup can sometimes connect to Google Chrome and TealHQ through the Codex Chrome extension, but it does not yet operate Teal efficiently or reliably enough for production resume work.

The issue has appeared across multiple Job Search chats since the Windows setup, not only in the latest Teal resume thread. Cross-thread evidence points to a system problem spanning browser-backend binding, isolated Playwright fallback, session recovery, heavy Teal React UI automation, download/export handling, and missing fast-fail workflow discipline.

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
- `cross-thread-evidence.md`: distilled evidence from the local Codex session index and relevant prior Job Search chats.
- `failure-analysis.md`: likely causes, unsafe paths discovered, and specific Windows Codex behavior that needs debugging.
- `framework-analysis.md`: MECE, JTBD, design thinking, systems thinking, Nielsen heuristics, critical thinking, inversion, deduction, and second-order analysis.
- `macbook-analysis-prompt.md`: a ready-to-use prompt for the MacBook Codex.
- `macbook-findings-and-windows-handoff.md`: MacBook review findings, ranked root-cause hypotheses, and exact Windows Codex operating guidance.
- `recommended-rebuild-plan.md`: proposed changes to make Windows Codex work more like the MacBook workflow.

Related lightweight operating memory:

- `../operational-incident-log/README.md`
- `../operational-incident-log/schema.md`
- `../operational-incident-log/incidents/2026-05-11-windows-teal-chrome.md`

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

Start by reading `macbook-analysis-prompt.md`, then inspect `cross-thread-evidence.md` and `framework-analysis.md` before proposing fixes.

MacBook review output is now captured in `macbook-findings-and-windows-handoff.md`.
