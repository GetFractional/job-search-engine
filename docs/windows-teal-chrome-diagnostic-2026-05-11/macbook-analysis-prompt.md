# Prompt For MacBook Codex

Use this prompt in the MacBook Codex thread.

```text
You are helping debug the Windows Codex TealHQ/Chrome workflow for Matt's job-search system.

Please inspect the repo folder:

docs/windows-teal-chrome-diagnostic-2026-05-11/

Start with README.md, then read timeline.md, environment-and-evidence.md, failure-analysis.md, and recommended-rebuild-plan.md.

Goal:
1. Diagnose why Windows Codex is much slower and less reliable than the MacBook workflow when operating Google Chrome and TealHQ.
2. Identify whether this is a Chrome extension/native host issue, Teal React UI automation issue, extension conflict such as Grammarly, Codex tool usage issue, or process/design issue.
3. Provide a step-by-step rebuild plan for Windows Codex so it can reliably:
   - use exactly one Chrome/Teal tab
   - inspect Teal resume state quickly
   - clean or categorize Skills & Interests safely
   - maximize native Teal two-page resumes
   - export PDFs or escalate to manual export quickly
   - verify page count and visual fill
4. Tell Windows Codex what to change in scripts, local skills, workflow docs, or operating procedure.

Constraints:
- Keep using native TealHQ resume builder until the process is reliable.
- Do not create custom designed resumes yet.
- Do not submit applications or send outreach.
- Do not delete shared Teal skills unless Matt explicitly approves that shared-library cleanup.
- Do not include or expose secrets.

Please produce:
- Root-cause hypothesis ranked by likelihood.
- Diagnostic commands or browser checks Windows Codex should run.
- A corrected Teal-native resume workflow.
- Any changes to commit back to the job-search repo.
- A short handoff message that Windows Codex can follow exactly.
```
