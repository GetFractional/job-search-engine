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

Current behavior note:
- `-Repair` now forces the repair path even when the local bridge checks are already green.
- This matters for the stale `extension-host.exe` failure mode, where manifest, extension, and Chrome checks all pass but the active Codex thread still is not bound to live Chrome.

If PowerShell is currently in another folder such as `C:\WINDOWS\system32`, use the absolute path:

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Jobs\Job Search\scripts\ensure-codex-chrome-bridge.ps1" -Repair -OpenTeal
```

From the Job Search repo root, the shorter launcher also works:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\open-teal-chrome.ps1
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

## Diagnostic Split

Do not collapse every Teal failure into "Chrome is unavailable." Use this split:

- **Chrome unavailable:** the thread cannot load the Chrome browser client, cannot get `agent.browsers.get("extension")`, or the browser list lacks `Chrome` after one forced repair.
- **Chrome available, stale tab:** the thread can list live Chrome tabs through `browser.user.openTabs()`, but an old Teal tab cannot be claimed. Open a fresh Chrome-extension-backed Teal tab and continue from the direct route.
- **Chrome available, Teal blocked:** the thread can claim or open Teal, but Teal shows Cloudflare, login, CAPTCHA, or a security prompt. Stop and report the visible blocker.
- **Chrome available, Teal unreadable:** the thread can claim or open Teal with no Cloudflare or login prompt, but Job Tracker, Resume Builder, Job Matcher, or another heavy Teal page cannot be read reliably. Switch to slow scoped navigation and direct routes. If still blocked, ask for a screenshot, direct Teal record URL, or pasted JD instead of rerunning bridge repair or guessing.

On 2026-05-14, the repair script stopped one stale Codex Chrome host process and reopened Teal. The follow-up runtime probe succeeded in the same thread: `Chrome` appeared as an `extension` backend, `Codex In-app Browser` appeared as `iab`, seven live user tabs were visible, `https://app.tealhq.com/home` was claimed, and Teal loaded without Cloudflare or a sign-in prompt. That means the active local bridge was healthy after repair; any remaining issue in a later apply flow should be classified against the split above.

## Verification Notes

A healthy recovery should prove all three things. The scripts prove the first item; the active Codex thread must prove the second and third items through the Chrome runtime probe before Teal work resumes:

- the local bridge checks pass
- Codex can list the `Chrome` extension backend
- Codex can claim or create a Chrome-backed tab and reach `https://app.tealhq.com/home` without a Cloudflare block

## External Guidance Checked

- Official OpenAI docs: https://developers.openai.com/codex/app/chrome-extension
  - Use Chrome when Codex needs signed-in browser state.
  - Confirm the Codex Chrome extension shows Connected.
  - Confirm the Chrome plugin is on in Codex.
  - Use the same Chrome profile where the extension is installed.
  - Start a new Codex thread, then restart Chrome and Codex if needed.
  - If the extension still cannot connect, remove and re-add the Chrome plugin from Codex Plugins.
- Relevant open GitHub issue: https://github.com/openai/codex/issues/21878
  - Windows reports show Chrome, extension, and native host checks can all pass while `setupAtlasRuntime` still times out.
  - If that happens, it is likely a Codex Desktop Chrome bridge/runtime issue, not a Teal issue.
- Adjacent but not the same issue: https://github.com/openai/codex/issues/18456
  - This tracks OpenAI/Statsig backend Cloudflare 403s from Codex Desktop HTTP clients.
  - It can explain plugin or feature data starvation, but it is not the same as Teal returning Cloudflare 403 to isolated Playwright.

## Local Mitigation Applied

On 2026-05-12, the standalone isolated Playwright MCP block in `C:\Users\matth\.codex\config.toml` was commented out to prevent authenticated Chrome tasks from silently falling back to a clean automation browser.

Backup:

```text
C:\Users\matth\.codex\config.toml.pre-disable-playwright-mcp-20260512
```

Reason:

- Official Codex docs say the in-app browser is for local/public pages and does not support signed-in pages, regular Chrome profile state, cookies, extensions, or existing tabs.
- Official Chrome extension docs say to use the Codex Chrome extension when Codex needs signed-in browser state.
- TealHQ returns Cloudflare 403 from isolated Playwright, so keeping a standalone isolated Playwright browser available in the same task environment creates a wrong-surface failure path.

This mitigation requires restarting Codex or opening a fresh session before the tool list changes. It does not fix the underlying Chrome extension/backend bug if the Chrome backend itself hangs or disappears.
