---
name: job-search-chrome-teal-recovery
description: Diagnose and recover Windows Codex access to Matt's real Chrome-backed TealHQ session before job-search browser work. Use when Teal, Chrome, @Chrome, live Chrome tabs, or browser binding is unavailable or uncertain.
---

# Job Search Chrome/Teal Recovery

## Purpose
Prove Codex is controlling Matt's logged-in Google Chrome profile before any TealHQ, LinkedIn, job-board, or application-form work.

This skill exists because the local bridge health script can pass while a Codex thread still fails to bind to live Chrome. Do not stop after the bridge script alone.

## Required Sources
1. `docs/chrome-bridge-recovery.md`
2. `docs/teal-workflow.md`
3. `AGENTS.md`

## Hard Rules
- Use the Chrome extension backend for Teal: `agent.browsers.get("extension")`.
- Do not use the in-app browser for Teal.
- Do not use standalone or isolated Playwright for Teal.
- Do not treat a green bridge script as proof of usable browser control.
- Do not declare Chrome unavailable until the runtime probe below has been attempted or the required `node_repl` tool is genuinely unavailable after tool discovery.
- Do not describe a Teal navigation, readability, stale-tab, or timeout problem as "cannot see Chrome" if the runtime probe can list the `Chrome` extension backend and visible user tabs.

## Runtime Probe
When a thread needs Chrome/Teal access, do this before role selection or Teal mutation:

1. If the `node_repl` JavaScript tool is not already callable, use tool discovery for `node_repl js`.
2. Import the Chrome plugin browser client from the absolute path:

```js
const chromeModule = await import("file:///C:/Users/matth/.codex/plugins/cache/openai-bundled/chrome/latest/scripts/browser-client.mjs");
await chromeModule.setupAtlasRuntime({ globals: globalThis });
```

3. Select the Chrome extension backend:

```js
const browser = await agent.browsers.get("extension");
await browser.nameSession("Job Search Chrome/Teal");
```

4. Confirm available browser backends:

```js
const browsers = await agent.browsers.list();
```

Pass condition: the list includes `Chrome` with type `extension`.

5. List visible user tabs:

```js
const openTabs = await browser.user.openTabs();
```

6. Claim an existing Teal tab when present:

```js
const tealInfo = openTabs.find(t => (t.url || "").startsWith("https://app.tealhq.com"));
const tealTab = tealInfo ? await browser.user.claimTab(tealInfo) : await browser.tabs.new();
if (!tealInfo) await tealTab.goto("https://app.tealhq.com/home");
```

If claiming an existing Teal tab fails with a stale session, locked wrapper, timeout, or other already-claimed-tab error, do not classify that as a Chrome outage. Open a fresh Chrome-extension-backed tab, navigate to the needed Teal route, and verify it with the same checks below.

7. Verify the claimed/new tab:

```js
const title = await tealTab.title();
const url = await tealTab.url();
const snap = await tealTab.playwright.domSnapshot();
const hasCloudflareBlock = snap.includes("Sorry, you have been blocked") || snap.includes("Cloudflare Ray ID");
const hasSignInPrompt = snap.includes("Sign in") || snap.includes("Log in");
```

Pass condition:
- URL starts with `https://app.tealhq.com/`
- no Cloudflare block
- no sign-in prompt
- title or visible state confirms Teal loaded

8. Keep the Teal tab for handoff if stopping:

```js
await browser.tabs.finalize({ keep: [{ status: "handoff", tab: tealTab }] });
```

## Bridge Repair
If the runtime probe cannot list or claim Chrome tabs, run:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\matth\Documents\Jobs\Job Search\scripts\ensure-codex-chrome-bridge.ps1" -Repair -OpenTeal
```

Then retry the runtime probe once.

## Failure Classification
Classify the failure before stopping:

- **Local bridge failure:** native host, extension install, extension enabled state, Chrome running state, or profile is wrong. Fix with the bridge repair script and rerun the runtime probe.
- **Thread binding failure:** local bridge checks are green, but `agent.browsers.get("extension")` fails or the backend list lacks `Chrome`. Stop same-thread retries after one repair and route to Codex Desktop Chrome plugin reset/rebind/restart or support escalation.
- **Wrong browser surface:** Teal is opened in isolated Playwright or the in-app browser, often with Cloudflare. Stop that path and switch to the Chrome extension backend.
- **Stale tab claim:** `Chrome` backend and `browser.user.openTabs()` work, but an existing Teal tab cannot be claimed. Open a fresh extension-backed Teal tab instead of rerunning bridge repair.
- **Teal UI readability/navigation failure:** Chrome works and Teal loads, but the tracker, table, Resume Builder, or Job Matcher cannot be read or acted on reliably. Do not call this a Chrome failure. Use slow scoped Teal navigation, a direct Teal record URL, or a screenshot/pasted JD fallback.

## Stop Conditions
Stop and report a real blocker only when one of these is true:
- `node_repl` JavaScript execution is not callable after tool discovery.
- `agent.browsers.get("extension")` fails after bridge repair.
- Chrome backend does not appear after bridge repair and one runtime retry.
- Teal loads with Cloudflare in the Chrome extension backend.
- Teal requires login or a security challenge in the Chrome extension backend.
- Chrome works, but Teal tracker or resume pages remain unreadable after slow scoped navigation and one fresh extension-backed tab attempt; in that case ask for a screenshot, direct Teal record URL, or pasted JD instead of guessing.

Do not stop merely because:
- `@Chrome` is not directly listed as a visible tool name.
- the bridge script only reports local health.
- `browser.tabs.list()` is empty before claiming user tabs.
- existing user tabs are visible only through `browser.user.openTabs()`.
- an existing Teal tab cannot be claimed, if a fresh Chrome-extension-backed tab can still load Teal.

## Output
Report:
- whether `node_repl` was available
- browser backends found
- whether a Teal tab was claimed or opened
- Teal title and URL
- Cloudflare/sign-in status
- next safe action
