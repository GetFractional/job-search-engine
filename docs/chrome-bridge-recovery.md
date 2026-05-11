# Codex Chrome Bridge Recovery

## What breaks

On Windows, the Codex Chrome bridge can disappear after sleep, unplugging, or an interrupted Chrome control session.

Typical symptom:
- Codex can still use the in-app browser
- the live Chrome backend disappears
- Teal tabs still exist in Chrome, but Codex no longer sees them
- the thread falls back to isolated Playwright, which then gets a Cloudflare 403 from `app.tealhq.com`

Observed root cause:
- the Chrome extension and native host remain installed
- one or more `extension-host.exe` helper processes stay alive
- Codex no longer re-enumerates the Chrome backend until those helpers are reset

## Repair

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-codex-chrome-bridge.ps1
```

Or use the full preflight plus self-heal:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ensure-codex-chrome-bridge.ps1 -Repair -OpenTeal
```

If PowerShell is currently in another folder such as `C:\WINDOWS\system32`, use the absolute path:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\matth\Documents\Jobs\Job Search\scripts\ensure-codex-chrome-bridge.ps1" -Repair -OpenTeal
```

From the Job Search repo root, the shorter launcher also works:

```powershell
powershell -ExecutionPolicy Bypass -File .\open-teal-chrome.ps1
```

What it does:
- reads the installed native-host manifest
- stops only the matching Codex `extension-host.exe` helper process(es)
- validates the native host manifest, Chrome extension, and Chrome-running state
- opens one fresh Chrome window on the selected Chrome profile used by the bundled Codex checks

What it does not do:
- it does not close existing Chrome tabs
- it does not change the Chrome profile
- it does not touch Teal data
- it does not force the current Codex thread to rebind to the Chrome extension backend if the desktop app already failed to expose it

## Verified behavior

After running the script, Codex was able to enumerate:
- `Chrome`
- `Codex In-app Browser`

It also regained visibility into live Chrome tabs, including Teal and the CaptivateIQ Lever application tab.

## If it happens again

1. Run the repair script.
2. Retry the Chrome-backed Codex task.
3. Verify Codex is using the Chrome extension browser backend, not the in-app browser or standalone Playwright.
4. For already-open Chrome tabs, claim the visible user tab through the Chrome backend before trying to control it. Direct controllable-tab lookup can be empty even when user tabs are visible.
5. If local checks pass but the current Codex thread still exposes only Playwright, the remaining issue is in Codex desktop's browser-backend binding, not in Chrome itself.
6. At that point, use the supported Chrome plugin reinstall/reset path from the Codex UI instead of editing the native host manually.

## Verification Notes

A healthy repair should prove all three things:

- the local bridge checks pass
- Codex can list the `Chrome` extension backend
- Codex can claim or create a Chrome-backed tab and reach `https://app.tealhq.com/home` without a Cloudflare block
