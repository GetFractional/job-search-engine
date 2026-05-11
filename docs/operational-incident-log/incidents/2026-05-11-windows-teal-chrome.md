# Incident: Windows Codex Chrome/Teal Reliability

## Status
- State: Open
- Last updated: 2026-05-11
- Owner surface: Shared between Windows Codex and MacBook Codex

## User Impact
Matt cannot rely on Windows Codex to complete Teal-native job application workflows at MacBook speed or quality.

The latest high-impact failure was the HackerOne `Director, Marketing Operations` resume workflow:

- Skills remained visibly uncategorized.
- The second resume page was underused.
- Windows Codex could not reliably export a fresh Teal PDF.
- Matt had to identify that the resume was not ready.

## Symptoms
- Live Chrome/Teal access works sometimes, then disappears or becomes unavailable to the current Codex thread.
- Isolated Playwright or in-app browser access to Teal can hit Cloudflare 403.
- The bridge can report healthy while Teal actions remain slow or stuck.
- Teal DOM reads, screenshots, scrolls, and JS calls can time out.
- `Export PDF` can be visible and clicked without producing a new download.
- Teal skills edits can create duplicate or uncategorized rows.
- `Delete Skill` is unsafe because Teal warns it will delete the skill from all resumes.

## Scope
Affected workflows:

- TealHQ resume builder
- Teal resume export
- Teal saved-job application prep
- Chrome-backed job board and application workflows
- Existing Chrome tab discovery and recovery

Unaffected or less affected:

- Local file edits
- Repo documentation updates
- Source-file analysis
- Non-browser research using normal web sources or local files

## Evidence
Primary diagnostic packet:

- `docs/windows-teal-chrome-diagnostic-2026-05-11/README.md`
- `docs/windows-teal-chrome-diagnostic-2026-05-11/cross-thread-evidence.md`
- `docs/windows-teal-chrome-diagnostic-2026-05-11/framework-analysis.md`
- `docs/windows-teal-chrome-diagnostic-2026-05-11/failure-analysis.md`
- `docs/windows-teal-chrome-diagnostic-2026-05-11/recommended-rebuild-plan.md`

Relevant session IDs:

- `019e135d-47c4-7fb2-b302-5e79aa7a3c72`, Fix Chrome access on Windows
- `019e13cc-95ea-7343-87b9-eace3b01b98a`, Inspect browser bridge config
- `019e13cc-acad-76d1-8fc9-2c7366ac34b3`, Investigate Chrome backend loss
- `019e1472-da68-7e33-b74f-cefabede8159`, List TealHQ open tabs
- `019e1477-dfe8-7913-8d52-039e7582d0b9`, Fix Chrome access for Codex
- `019e1484-bc9e-70a0-86fa-5fcf3dd59b12`, Apply to best job

Relevant recovery doc:

- `docs/chrome-bridge-recovery.md`

## Root-Cause Hypotheses
1. Chrome backend binding instability, high confidence.
   Evidence: repeated backend-loss, `about:blank`, Cloudflare fallback, and repair-script threads.

2. Wrong browser surface fallback, high confidence.
   Evidence: isolated Playwright access to Teal produces Cloudflare 403 and does not represent Matt's logged-in Chrome session.

3. Teal React UI automation fragility, high confidence.
   Evidence: repeated timeout, screenshot, DOM, export, and skills-editor failures after partial Chrome access.

4. Extension interference, medium confidence.
   Evidence: Grammarly appeared in relevant Teal editing context, but it is not yet proven as primary cause.

5. Workflow QA gap, high confidence.
   Evidence: Windows Codex accepted intermediate state before visually verifying skills, page fill, and fresh export.

## Proven Fixes
- Use Chrome-backed access, not isolated Playwright, for Teal.
- Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ensure-codex-chrome-bridge.ps1 -Repair -OpenTeal
```

- If the shell is not at the repo root, use:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\matth\Documents\Jobs\Job Search\scripts\ensure-codex-chrome-bridge.ps1" -Repair -OpenTeal
```

- Use the extension backend plus `browser.user.openTabs()` and `browser.user.claimTab(...)` for visible user tabs.
- If `Tabs_*` is locked with `EBUSY`, use an older readable Chrome session snapshot.

## Failed Or Partial Fixes
- Repeated Playwright attempts against Teal, partial or wrong surface.
- Repeated broad DOM snapshots in Teal, too slow.
- Multiple retries of `Export PDF`, did not produce a verified new file.
- Skill row deletion, unsafe because Teal skills are shared.
- Grouped skill rows, partial and visually unacceptable.

## Stop Rules
Stop the Teal workflow when:

- Chrome backend cannot be listed or claimed.
- Teal only opens through isolated Playwright or in-app browser.
- Cloudflare appears.
- The same Teal UI action times out twice.
- Export does not create a file within 15 seconds after one automation attempt.
- Skill deletion would affect shared Teal skills.
- Visual page-fill cannot be verified.

## Verification Checklist
- Chrome backend is visible to Codex.
- One Teal tab is open.
- Existing user tab is claimed, not recreated through isolated Playwright.
- Teal title and URL are read successfully.
- One narrow Teal section can be inspected without timeout.
- Screenshot works.
- Export produces a new file in Downloads or manual export is requested quickly.
- PDF page count is verified.
- Page 2 is visually inspected for fill.
- Skills are categorized or compactly grouped in the exported resume, not just in the editor.

## Follow-Up
- MacBook Codex should review the diagnostic packet and identify whether Windows needs Codex desktop/plugin reset, Chrome extension reset, workflow changes, or all of the above.
- Windows Codex should not attempt another Teal-native application workflow until it passes the controlled Teal probe in `recommended-rebuild-plan.md`.
- Update Teal and resume skills only after the MacBook-guided process is confirmed.

## MacBook Review, 2026-05-11
- Primary verdict: this is a layered reliability failure, not a missing-context or single-script issue.
- Highest-probability chain: current-thread Chrome backend binding instability plus wrong-surface fallback plus Teal React UI fragility plus weak stop/QA gates.
- Next required action: Windows Codex must pass the controlled Chrome-backed Teal probe before another real Teal resume or application workflow.
- Operating rule: one Teal tab, no isolated Playwright for Teal, stop after two identical Teal timeouts, one automated export attempt only, then manual export handoff.
- Full handoff: `docs/windows-teal-chrome-diagnostic-2026-05-11/macbook-findings-and-windows-handoff.md`.

## Windows Follow-Up, 2026-05-11
- Local bridge health check passed with `NativeHostCorrect`, `ExtensionInstalled`, `ExtensionEnabled`, and `ChromeRunning` all `True`.
- The repair script opened TealHQ in Google Chrome at `https://app.tealhq.com/`.
- Tool discovery in the active Windows Codex thread exposed Playwright browser tools, but did not expose the required Chrome extension backend functions `browser.user.openTabs()` or `browser.user.claimTab(...)`.
- Controlled Teal probe status: blocked before Teal interaction. Bridge is locally healthy, but this thread cannot prove it is controlling Matt's logged-in Chrome tab.
- Current conclusion: do not resume Teal-native application or resume work from this thread until Codex desktop/plugin rebind or reinstall exposes the Chrome backend to the active thread.
