# GitHub Issue Form Draft

## Title

Windows Codex routes authenticated Chrome tasks to isolated Playwright despite healthy Chrome extension checks

## What version of the Codex App are you using?

`26.506.3741.0`

Windows package metadata:

`OpenAI.Codex_26.506.3741.0_x64__2p2nqsd0c76g0`

## What subscription do you have?

`[Select your subscription tier, for example ChatGPT Plus / Pro / Team / Enterprise]`

## What platform is your computer?

```text
Microsoft Windows NT 10.0.26200.0 x64
```

## What issue are you seeing?

Codex Desktop on Windows intermittently fails to use the real Chrome extension-backed browser session for authenticated browser tasks. Local Chrome plugin diagnostics pass, and the Chrome backend can sometimes be initialized and used successfully, but subsequent job-search/browser tasks still route to an isolated Playwright/Chrome DevTools profile or otherwise lose the live Chrome tab binding.

This breaks workflows that require my logged-in Chrome profile. The clearest failing case is TealHQ. When Teal is opened through the isolated Playwright MCP/browser instead of the real Chrome profile, Teal returns a Cloudflare 403 block page.

This does not appear to be a simple missing-extension or not-logged-in issue. It looks like a Codex Desktop browser-backend routing/binding instability on Windows.

Feedback thread reference:

```text
Uploaded thread: 4cba3009-9233-49a3-94e0-e45ae6242020
```

Relevant local checks pass:

```text
NativeHostCorrect  : True
NativeHostManifest : C:\Users\matth\AppData\Local\OpenAI\extension\com.openai.codexextension.json
ExtensionInstalled : True
ExtensionEnabled   : True
ChromeRunning      : True
ChromeProfile      : C:\Users\matth\AppData\Local\Google\Chrome\User Data\Default

Codex Chrome bridge local checks are healthy.
```

The Codex Chrome extension check reports installed/enabled:

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

The native host check reports correct:

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

At the same time, the separate Playwright MCP browser is isolated and shows:

```text
- 0: (current) [](about:blank)
```

Multiple `.playwright-mcp` artifacts show Teal Cloudflare 403 blocks when the isolated browser surface is used:

```text
.playwright-mcp\page-2026-05-11T17-32-58-657Z.yml:
heading "Sorry, you have been blocked"
heading "You are unable to access tealhq.com"
Cloudflare Ray ID: 9fa2ed144978fb10

.playwright-mcp\console-2026-05-11T17-32-58-217Z.log:
[ERROR] Failed to load resource: the server responded with a status of 403 () @ https://app.tealhq.com/:0
```

Earlier isolated Playwright artifacts show the same Teal block state:

```text
.playwright-mcp\page-2026-05-10T19-14-11-607Z.yml
.playwright-mcp\page-2026-05-10T19-26-11-998Z.yml
.playwright-mcp\page-2026-05-10T19-47-57-702Z.yml
.playwright-mcp\page-2026-05-11T00-22-47-786Z.yml
```

I have a separate isolated Playwright MCP configured in `~\.codex\config.toml`:

```toml
[mcp_servers.playwright]
command = "powershell"
args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '$env:PLAYWRIGHT_BROWSERS_PATH = "$HOME\.cache\ms-playwright"; New-Item -ItemType Directory -Force -Path "$HOME\.playwright-mcp", $env:PLAYWRIGHT_BROWSERS_PATH | Out-Null; npx -y @playwright/mcp@latest --headless --isolated --viewport-size=1366x900 --timeout-navigation=60000 --timeout-action=5000']
```

The issue is that Codex sometimes uses or falls back to that isolated browser surface for a task that explicitly requires the real Chrome extension-backed profile.

Update after reviewing the official docs and related issues: I commented out the standalone isolated Playwright MCP block in `C:\Users\matth\.codex\config.toml` as a local mitigation, with a backup at `C:\Users\matth\.codex\config.toml.pre-disable-playwright-mcp-20260512`. This removes one wrong-surface fallback path, but it should not be required for Codex to route `@Chrome` tasks correctly.

## What steps can reproduce the bug?

I do not have a minimal standalone code repro, because the bug appears to be in Codex Desktop browser backend routing/binding. The reproducible shape is:

1. Use Codex Desktop on Windows with the Chrome plugin enabled.
2. Install and enable the Codex Chrome extension in the Chrome `Default` profile.
3. Confirm the extension/native-host checks pass.
4. Open and log into `https://app.tealhq.com/home` in real Chrome.
5. Ask Codex to use Chrome/Teal for a browser task that requires signed-in Chrome state.
6. Observe intermittent behavior:
   - Correct path: Codex lists `Chrome` backend type `extension`, lists open user tabs, and can claim `Teal - Home`.
   - Failure path: Codex uses isolated Playwright/Chrome DevTools surface instead, current tab is `about:blank`, and Teal returns Cloudflare 403.

In one successful diagnostic turn, the Chrome backend state was:

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

The failure recurs in later chats/turns even after a successful Chrome-backed verification, so it is not fully fixed by one local bridge repair command.

Similar public issues that seem related:

- https://github.com/openai/codex/issues/21868
- https://github.com/openai/codex/issues/21878
- https://github.com/openai/codex/issues/21670
- https://github.com/openai/codex/issues/21672

My originally suspected issue, https://github.com/openai/codex/issues/18456, seems adjacent but not identical. That issue is about backend OpenAI/Statsig requests hitting Cloudflare because of a Rust HTTP client user agent. My Teal failure is specifically a wrong browser-surface issue where isolated Playwright hits Teal Cloudflare.

## What is the expected behavior?

For browser tasks that require logged-in Chrome state, Codex should use the real Chrome extension-backed browser session, not isolated Playwright or a clean Chrome DevTools MCP profile.

Expected behavior:

1. Codex uses `chrome@openai-bundled`.
2. Browser backend list includes `Chrome` with type `extension`.
3. Codex can list open user tabs from the real Chrome profile.
4. Codex can claim an existing `https://app.tealhq.com/...` tab.
5. Teal loads without Cloudflare block or login prompt.
6. Codex does not silently fall back to isolated Playwright for authenticated websites.

If the Chrome extension backend is unavailable, Codex should fail fast with a clear diagnostic instead of using the wrong browser surface.

## Additional information

Chrome and plugin environment:

```text
Chrome version: 148.0.7778.97
Codex Chrome extension ID: hehggadaopoacecdllhhajmbjkdcmajg
Codex Chrome extension version: 1.1.4_0
Chrome plugin cache: C:\Users\matth\.codex\plugins\cache\openai-bundled\chrome\0.1.7
Native host exe: C:\Users\matth\.codex\plugins\cache\openai-bundled\chrome\latest\extension-host\windows\x64\extension-host.exe
Chrome profile: C:\Users\matth\AppData\Local\Google\Chrome\User Data\Default
```

Requested help:

1. Confirm whether this is the same class of bug as #21868, #21878, #21670, or #21672.
2. Provide a supported way to force a task/thread to use the real Chrome extension backend and not the isolated Playwright MCP.
3. Add clearer diagnostics when a task is about to use isolated Playwright for a site requiring signed-in Chrome state.
4. Add bounded backend discovery/handshake timeouts so stale/unrelated browser-use pipes or backend candidates do not hang or misroute the task.
5. Clarify whether users should disable separate Playwright MCP servers when using the Chrome extension for authenticated websites.
6. Clarify whether plugin uninstall/reinstall is expected to help when local checks pass but routing still falls back to isolated browser profiles.
