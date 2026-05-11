# MacBook Findings And Windows Codex Handoff

## Executive Finding
Windows Codex is not underperforming because it lacks job-search context. It is underperforming because browser control is unreliable at the exact layer where TealHQ requires a logged-in, visible, Chrome-backed workflow.

The likely failure chain is:

1. Chrome bridge/native-host checks pass locally.
2. The active Codex thread still sometimes fails to expose or bind to the live Chrome backend.
3. Windows Codex falls back to isolated Playwright or in-app browser access.
4. Teal either blocks that surface with Cloudflare or becomes slow and ambiguous.
5. The agent keeps retrying broad DOM reads, screenshots, scrolls, and export clicks.
6. Resume QA is treated as attempted, not verified.

This means the fix is not one script. The fix is a layered operating gate: prove the right browser surface, prove Teal responsiveness, keep the workflow narrow, verify output through the file system and visual PDF review, then record any repeat failure as a compact incident.

## Ranked Root-Cause Hypotheses

| Rank | Hypothesis | Confidence | Why |
|---:|---|---|---|
| 1 | Current-thread Chrome backend binding is unstable. | High | The diagnostic shows healthy local bridge checks while Codex still loses live Chrome tabs or sees `about:blank`. |
| 2 | Wrong-surface fallback is poisoning Teal work. | High | Isolated Playwright or in-app browser access can hit Cloudflare and does not represent Matt's logged-in Chrome profile. |
| 3 | Teal resume builder is too heavy for broad Windows automation loops. | High | Timeouts appear across DOM reads, screenshots, scroll gestures, JS evaluation, and download waiting. |
| 4 | Workflow stop rules are too weak. | High | Windows Codex kept retrying export and DOM inspection instead of stopping, escalating, or switching to manual export. |
| 5 | Teal shared-skill semantics make cleanup risky. | High | `Delete Skill` affects all resumes, so destructive cleanup cannot be automated without approval. |
| 6 | Grammarly or another extension interferes with text editing. | Medium | A Grammarly overlay appeared in the DOM, but evidence does not prove it is the primary cause. |
| 7 | Teal export requires a physical user gesture or focused foreground state. | Medium | Multiple automation click paths failed to create a fresh download, but manual export has not yet been isolated as the discriminating test. |

## What Windows Codex Should Do Next

Do not start another real Teal-native application workflow until this passes.

### 1. Reset To A Single Teal Surface

1. Close duplicate Teal resume tabs.
2. Leave only one Teal resume builder tab.
3. Leave the live application tab closed unless it is needed for final application prep.
4. Temporarily disable Grammarly and other writing-overlay extensions for `app.tealhq.com`.
5. Run the bridge repair from the Job Search repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ensure-codex-chrome-bridge.ps1 -Repair -OpenTeal
```

If not in the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\matth\Documents\Jobs\Job Search\scripts\ensure-codex-chrome-bridge.ps1" -Repair -OpenTeal
```

### 2. Prove The Correct Browser Surface

Windows Codex must prove all of these before touching Teal resume content:

- The available browser backend includes `Chrome`.
- The current tab is claimed from Matt's visible Chrome profile, not recreated in isolated Playwright.
- Teal opens without Cloudflare.
- The claimed tab URL is under `https://app.tealhq.com/`.
- One title or URL read succeeds quickly.
- One screenshot succeeds quickly.
- One narrow section inspection succeeds without a broad page dump.

If any of these fail, stop. The remaining issue is Codex desktop/plugin binding, not resume strategy.

### 3. Use A Teal Probe, Not A Resume Task

Run this controlled probe before the next real application:

1. List browser backends.
2. Use the Chrome extension backend.
3. List visible user tabs.
4. Claim the existing Teal tab.
5. Read title and URL.
6. Take one screenshot.
7. Inspect one small section only.
8. Click one harmless section/navigation control.
9. Stop and record pass/fail in the incident log.

Do not edit skills, export PDFs, or change application state during this probe unless Matt explicitly approves the export test.

## Corrected Teal-Native Resume Workflow

Use this only after the probe passes.

1. **Preflight**
   - Confirm Chrome-backed Teal tab.
   - Confirm one Teal resume tab.
   - Confirm no Cloudflare or isolated browser fallback.
   - Check `docs/operational-incident-log/` for known stop rules.

2. **Resume edits**
   - Use section-level visible controls.
   - Avoid full-page DOM snapshots after initial load.
   - Make one small edit group at a time.
   - Verify each edit visually before moving on.
   - Do not use `Delete Skill` unless Matt approves shared-library cleanup.
   - Do not dump Job Matcher keywords into skills.

3. **Skills policy**
   - If Teal categories visibly export as headings, use compact categories.
   - If categories do not export cleanly, use a short native list of highest-signal skills.
   - Prefer recruiter-readable group labels over long keyword rows.
   - Treat duplicate or uncategorized skill blocks as not ready.

4. **Two-page fill**
   - Export or manually export a Teal-native PDF.
   - Verify it is two pages.
   - Visually inspect page 2.
   - If page 2 is underfilled, add a relevant proof block before adding more skills.
   - If page 3 appears, trim skills first.

5. **Export**
   - Try automated export once.
   - Wait up to 15 seconds for a new file.
   - If no file appears, stop and ask Matt for manual export.
   - Do not click export repeatedly.
   - The file system is the source of truth, not the visible button click.

6. **Completion**
   - Report verified state only.
   - Name the exported file.
   - Report page count and page-fill status.
   - Stop before application submission, outreach, references, or sensitive voluntary self-ID.

## Diagnostic Commands And Checks

Use these from Windows PowerShell when validating export state:

```powershell
Get-ChildItem "$HOME\Downloads" -Filter "*.pdf" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 10 Name,Length,LastWriteTime
```

For the HackerOne resume specifically:

```powershell
Get-ChildItem "$HOME\Downloads" -Filter "Director, Marketing Operations at HackerOne*.pdf" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 10 Name,Length,LastWriteTime
```

After copying the intended export into `artifacts/`, verify page markers:

```powershell
$p = '.\artifacts\HackerOne - Director, Marketing Operations - Matt Dimock - Resume.pdf'
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $p))
$text = [System.Text.Encoding]::ASCII.GetString($bytes)
$matches = [regex]::Matches($text, '/Type\s*/Page(?!s)')
$count = ([regex]::Match($text, '/Count\s+(\d+)')).Groups[1].Value
[pscustomobject]@{
  Path=(Resolve-Path -LiteralPath $p).Path
  Length=(Get-Item -LiteralPath $p).Length
  PageMarkers=$matches.Count
  PageCountValue=$count
} | Format-List
```

## What To Change In The Repo

Commit now:

- Keep this MacBook handoff document in the diagnostic packet.
- Keep the operational incident log. It is the right size and structure for cross-instance learning.

Change only after Windows validates the controlled probe:

- Add the Chrome-backed Teal probe to `scripts/ensure-codex-chrome-bridge.ps1` or a separate `scripts/test-teal-chrome-probe.ps1`.
- Update `.agents/skills/tealhq-workflow/SKILL.md` with the one-tab rule, wrong-surface stop rule, and one-export-attempt rule.
- Update `.agents/skills/resume-drafting/SKILL.md` with the Teal shared-skill warning.
- Update `.agents/skills/qa-fact-check/SKILL.md` with the page-count and page-fill gate.
- Update `docs/teal-workflow.md` with the incident-log preflight.

Do not promote untested fixes into skills. Keep the probe result in the incident record first, then promote proven behavior.

## Incident Log Verdict

The new incident-log approach is sufficient and worth keeping.

It solves the right problem: future Codex instances need compact, high-signal operational memory, not raw session logs. The schema should remain small. Add one optional section only if needed:

```markdown
## Reproduction Probe
- Preconditions:
- Steps:
- Expected result:
- Actual result:
- Pass/fail:
```

Do not commit raw JSONL logs, browser profile files, cookies, OAuth files, reference data, screenshots, or PDFs unless the artifact is essential to understand the incident.

## Short Handoff For Windows Codex

Use this exact operating rule:

```text
Before any Teal resume or application work, I must prove I am controlling Matt's logged-in Chrome tab, not isolated Playwright or the in-app browser. I will keep one Teal tab, run the Chrome-backed Teal probe, and stop if Chrome cannot be listed, the Teal tab cannot be claimed, Cloudflare appears, or the same Teal action times out twice. I will not delete Teal skills without Matt's approval. I will try automated PDF export once, verify a new file in Downloads within 15 seconds, and ask for manual export if it fails. I will not call a resume ready until page count, page 2 fill, and skills readability are visually verified.
```
