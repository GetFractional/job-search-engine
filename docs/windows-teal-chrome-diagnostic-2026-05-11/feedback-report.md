# Feedback Report: Windows Codex Chrome/Teal Browser Routing Failure

## Summary

Codex Desktop on Windows intermittently fails to use the real Chrome extension-backed browser session for TealHQ job-application work. Local Chrome plugin diagnostics pass, and the Chrome backend can sometimes be initialized and used successfully, but subsequent job-search chats still fall back to an isolated Playwright/Chrome DevTools profile or otherwise lose the live Chrome tab binding.

This breaks workflows that require Matt's logged-in Chrome profile, especially TealHQ. When Teal is opened through the isolated Playwright MCP/browser instead of the real Chrome profile, Teal returns a Cloudflare 403 block page.

This is not a simple missing-extension or not-logged-in issue. It appears to be a Codex Desktop browser-backend routing/binding instability on Windows, similar to recent public GitHub issues around Chrome plugin setup, native-host checks passing while runtime behavior fails, and fallback to isolated browser profiles.

## Environment

- OS: Windows
- Workspace: `C:\Users\matth\Documents\Jobs\Job Search`
- Codex package: `OpenAI.Codex_26.506.3741.0_x64__2p2nqsd0c76g0`
- Chrome executable: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Chrome version: `148.0.7778.97`
- Codex Chrome extension ID: `hehggadaopoacecdllhhajmbjkdcmajg`
- Codex Chrome extension version: `1.1.4_0`
- Chrome plugin cache: `C:\Users\matth\.codex\plugins\cache\openai-bundled\chrome\0.1.7`
- Chrome plugin symlink: `C:\Users\matth\.codex\plugins\cache\openai-bundled\chrome\latest`
- Native host exe: `C:\Users\matth\.codex\plugins\cache\openai-bundled\chrome\latest\extension-host\windows\x64\extension-host.exe`
- Chrome profile detected by checks: `C:\Users\matth\AppData\Local\Google\Chrome\User Data\Default`
- `~\.codex\config.toml` includes:

```toml
[plugins."chrome@openai-bundled"]
enabled = true

[plugins."browser-use@openai-bundled"]
enabled = true
```

There is also a separate isolated Playwright MCP configured:

```toml
[mcp_servers.playwright]
command = "powershell"
args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '$env:PLAYWRIGHT_BROWSERS_PATH = "$HOME\.cache\ms-playwright"; New-Item -ItemType Directory -Force -Path "$HOME\.playwright-mcp", $env:PLAYWRIGHT_BROWSERS_PATH | Out-Null; npx -y @playwright/mcp@latest --headless --isolated --viewport-size=1366x900 --timeout-navigation=60000 --timeout-action=5000']
```

## Expected Behavior

When a task needs TealHQ, Codex should use the real Chrome extension-backed browser session because Teal depends on logged-in Chrome profile state and should not be accessed through an isolated automation profile.

Expected path:

1. Codex uses `chrome@openai-bundled`.
2. Browser backend list includes `Chrome` with type `extension`.
3. Codex can list open user tabs.
4. Codex can claim an existing `https://app.tealhq.com/...` tab.
5. Teal loads without Cloudflare block or login prompt.
6. Codex does not fall back to isolated Playwright for Teal.

## Actual Behavior

The behavior is inconsistent:

- Local diagnostic scripts report the Chrome bridge is healthy.
- In some turns, `setupAtlasRuntime` succeeds and Codex can list the real Chrome backend and see/claim Teal tabs.
- In other job-search chats, the workflow still uses the isolated Playwright MCP/browser, where Teal returns Cloudflare 403.
- The isolated Playwright MCP current tab is `about:blank`, confirming it is not the logged-in Chrome profile.
- Multiple `.playwright-mcp` artifacts show Teal Cloudflare blocks from isolated browser access.
- The failure recurred after a prior successful Chrome-backed verification, so this is not fully fixed by one bridge repair command.

Recent isolated Playwright evidence:

```text
.playwright-mcp\page-2026-05-11T17-32-58-657Z.yml:
heading "Sorry, you have been blocked"
heading "You are unable to access tealhq.com"
Cloudflare Ray ID: 9fa2ed144978fb10

.playwright-mcp\console-2026-05-11T17-32-58-217Z.log:
[ERROR] Failed to load resource: the server responded with a status of 403 () @ https://app.tealhq.com/:0
```

Earlier isolated Playwright artifacts show the same pattern:

```text
.playwright-mcp\page-2026-05-10T19-14-11-607Z.yml
.playwright-mcp\page-2026-05-10T19-26-11-998Z.yml
.playwright-mcp\page-2026-05-10T19-47-57-702Z.yml
.playwright-mcp\page-2026-05-11T00-22-47-786Z.yml
```

All contain the same Teal Cloudflare block state.

## Local Checks That Pass

Running:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\matth\Documents\Jobs\Job Search\scripts\ensure-codex-chrome-bridge.ps1"
```

returns:

```text
NativeHostCorrect  : True
NativeHostManifest : C:\Users\matth\AppData\Local\OpenAI\extension\com.openai.codexextension.json
ExtensionInstalled : True
ExtensionEnabled   : True
ChromeRunning      : True
ChromeProfile      : C:\Users\matth\AppData\Local\Google\Chrome\User Data\Default

Codex Chrome bridge local checks are healthy.
If a Codex thread still exposes only Playwright after this, the remaining fix is a Codex app/plugin rebind or reinstall, not a repo script issue.
```

Plugin-provided extension check:

```json
{
  "extensionId": "hehggadaopoacecdllhhajmbjkdcmajg",
  "profilePath": "C:\\Users\\matth\\AppData\\Local\\Google\\Chrome\\User Data\\Default",
  "installed": true,
  "registered": true,
  "enabled": true,
  "disabled": false,
  "versions": ["1.1.4_0"]
}
```

Plugin-provided native host check:

```json
{
  "manifestPath": "C:\\Users\\matth\\AppData\\Local\\OpenAI\\extension\\com.openai.codexextension.json",
  "registryKey": "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.openai.codexextension",
  "expectedHostName": "com.openai.codexextension",
  "actualHostName": "com.openai.codexextension",
  "expectedExtensionId": "hehggadaopoacecdllhhajmbjkdcmajg",
  "expectedOrigin": "chrome-extension://hehggadaopoacecdllhhajmbjkdcmajg/",
  "allowedOrigins": ["chrome-extension://hehggadaopoacecdllhhajmbjkdcmajg/"],
  "exists": true,
  "nameMatches": true,
  "hasExpectedOrigin": true,
  "registryMatchesManifestPath": true,
  "correct": true,
  "problem": null
}
```

## Current Browser State Captured In This Thread

The Chrome backend can initialize in this thread right now:

```json
{
  "setupOk": true,
  "setupMs": 1344,
  "browsers": [
    {
      "name": "Chrome",
      "type": "extension"
    },
    {
      "name": "Codex In-app Browser",
      "type": "iab"
    }
  ],
  "tealTabs": [
    {
      "title": "Teal - Home",
      "url": "https://app.tealhq.com/home"
    }
  ],
  "tealTabCount": 1
}
```

The separate Playwright MCP tab list at the same time is:

```text
- 0: (current) [](about:blank)
```

This shows two distinct browser surfaces are available:

- Correct surface: Chrome extension backend, real user profile, Teal tab visible.
- Wrong surface: isolated Playwright MCP, about:blank, no user session, Teal Cloudflare block when used.

## Cross-Thread Evidence

A local diagnostic packet was created from available Job Search project artifacts and local session indices:

`C:\Users\matth\Documents\Jobs\Job Search\docs\windows-teal-chrome-diagnostic-2026-05-11`

It summarizes a cluster of related Job Search threads created on 2026-05-10 and 2026-05-11. The important recurrence signals across local session summaries are:

- `Chrome` and `Teal` appear in nearly all relevant sessions.
- `Playwright`, `Cloudflare`, `timeout`, and `bridge` recur heavily.
- Multiple sessions discuss Chrome backend disappearance, open-tab recovery, `openTabs`, and `claimTab`.
- Teal Cloudflare blocks appear when isolated Playwright is used.
- Teal UI automation also suffers from timeouts even after Chrome access is partially restored.

No raw session JSONL files are being attached because they may include sensitive application/browser context.

## Related Public Documentation And Issues

Official docs:

- https://developers.openai.com/codex/app/chrome-extension
  - The docs state the Chrome extension is intended for tasks needing signed-in browser state.
  - Troubleshooting says to confirm extension Connected, plugin enabled, same Chrome profile, try a new thread, restart Chrome/Codex, reinstall/re-add the plugin if needed, and use `/feedback` if the extension is Connected but Codex still cannot use Chrome.

Relevant GitHub issues:

- https://github.com/openai/codex/issues/21868
  - Very similar runtime routing issue on Windows: Chrome extension Connected, checks pass, but browser tasks fall back to an isolated Chrome DevTools MCP profile instead of the real Chrome profile.
- https://github.com/openai/codex/issues/21878
  - Similar Windows issue: Chrome, extension, and native-host checks pass, but `setupAtlasRuntime` can time out.
- https://github.com/openai/codex/issues/21670
  - Windows issue: browser-use/Chrome setup hangs, plugin uninstall/access-denied issues, and app-server/IPC instability.
- https://github.com/openai/codex/issues/21672
  - Similar class of discovery bug: Chrome setup can hang when unrelated browser-use sockets exist. The proposed fix is better backend filtering or bounded per-candidate timeouts.
- https://github.com/openai/codex/issues/18456
  - Adjacent but not identical: backend OpenAI/Statsig requests can hit Cloudflare because Rust HTTP clients use a `reqwest/*` user agent. This could contribute to plugin/feature data issues, but it does not directly explain Teal's Cloudflare block from isolated Playwright.

## My Current Diagnosis

There are two problems that are getting mixed together:

1. **Codex Desktop browser routing/binding issue on Windows**
   - The correct Chrome extension backend exists and sometimes works.
   - The current or subsequent chat can still use the wrong browser surface.
   - This matches issue #21868 most closely.

2. **Teal rejects isolated automation browser access**
   - When Codex uses the isolated Playwright MCP browser, Teal returns Cloudflare 403.
   - This is expected for Teal and should be treated as wrong-surface evidence, not as a Teal login problem.

The desired product behavior is either:

- always use the real `Chrome` extension backend for `@Chrome` / signed-in browser tasks, or
- fail fast with a clear message when only isolated Playwright/IAB is available, instead of silently using the wrong surface.

## Requested Help From OpenAI

Please investigate why Codex Desktop on Windows can have all Chrome extension/native-host checks pass while job-search chats still route browser tasks to isolated Playwright/Chrome DevTools instead of the real Chrome extension backend.

Specific asks:

1. Confirm whether this is the same class of bug as #21868, #21878, #21670, or #21672.
2. Provide a supported way to force a task/thread to use the real Chrome extension backend and not the isolated Playwright MCP.
3. Add clearer diagnostics when a task is about to use isolated Playwright for a site requiring signed-in Chrome state.
4. Add bounded backend discovery/handshake timeouts so stale/unrelated browser-use pipes or backend candidates do not hang or misroute the task.
5. Clarify whether users should disable separate Playwright MCP servers when using the Chrome extension for authenticated websites.
6. Clarify whether plugin uninstall/reinstall is expected to help when local checks pass but routing still falls back to isolated browser profiles.

## Minimal Reproduction Shape

1. Windows Codex Desktop with Chrome plugin enabled.
2. Chrome extension installed/enabled in `Default` profile and showing Connected.
3. Run official checks: extension and native host pass.
4. Open/log into `https://app.tealhq.com/home` in real Chrome.
5. Ask Codex to use Chrome/Teal for a job-search browser task.
6. Observe one of:
   - correct: Chrome extension backend can claim `Teal - Home`
   - failure: task uses isolated Playwright MCP, current tab `about:blank`, and Teal returns Cloudflare 403
   - intermittent: bridge works in one thread/turn and fails or falls back in another

## Why This Matters

Job applications require authenticated browser state, the Teal Chrome extension path, file downloads/uploads, and careful human-approval gates. The isolated Playwright MCP cannot safely substitute for this because it lacks the logged-in Chrome session and triggers Cloudflare.

The current failure makes Codex unreliable for the exact class of Chrome tasks the official Chrome extension docs say it should support.
