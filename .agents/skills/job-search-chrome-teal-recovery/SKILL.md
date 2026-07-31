---
name: job-search-chrome-teal-recovery
description: Diagnose Chrome access only for an explicitly requested, bounded, read-only Teal competitor-research session. Never use this skill to operate Matt's job search, mutate Teal, or replace Way Ahead.
---

# Teal Competitor Browser Recovery

## Purpose
Recover a Chrome-backed Teal view only when Matt explicitly asks to inspect Teal as a competitor. The output is product-research evidence, never Matt's job-search operating state.

For Way Ahead QA, canonical employer research, LinkedIn, job boards, or application forms, use the applicable product or job-search browser workflow instead.

## Required Sources
1. `docs/chrome-bridge-recovery.md`
2. `AGENTS.md`
3. `tealhq-workflow`

## Hard Rules
- Invoke this skill only after Matt explicitly requests bounded Teal competitor research.
- Define the exact feature, screen, or interaction to observe before opening Teal.
- Use the Chrome extension backend because competitor research may depend on Matt's existing login.
- Read only. Do not click controls that save, create, edit, delete, rate, stage, bookmark, export, generate, upload, message, apply, or change account settings.
- Do not read Matt's saved jobs, resumes, cover letters, contacts, application history, notes, or other personal content unless the exact competitor question makes that specific surface necessary and Matt explicitly approves viewing it.
- Do not copy personal content into Way Ahead. Record only generalized interface facts and redacted screenshots.
- Do not use Teal to find, score, prepare, stage, submit, or track Matt's pursuits.
- Way Ahead remains the source of member profile, job, analysis, pursuit, asset, approval, event, and outcome state.
- Do not treat a green bridge script as proof of usable browser control.
- Do not declare Chrome unavailable until the runtime probe below has been attempted or the required `node_repl` tool is genuinely unavailable after tool discovery.
- Stop on CAPTCHA, Cloudflare, login, permission, security, or unexpected account warnings. Do not bypass them.

## Runtime Probe
Run this probe only after the competitor-research scope and exact Teal surface are approved:

1. If the `node_repl` JavaScript tool is not already callable, use tool discovery for `node_repl js`.
2. Import the Chrome plugin browser client from the current Windows user profile:

```js
const { pathToFileURL } = await import("node:url");
const chromeClientPath = `${process.env.USERPROFILE}\\.codex\\plugins\\cache\\openai-bundled\\chrome\\latest\\scripts\\browser-client.mjs`;
const chromeModule = await import(pathToFileURL(chromeClientPath).href);
await chromeModule.setupAtlasRuntime({ globals: globalThis });
```

3. Select the Chrome extension backend:

```js
const browser = await agent.browsers.get("extension");
await browser.nameSession("Read-only Teal competitor research");
```

4. Confirm available browser backends:

```js
const browsers = await agent.browsers.list();
```

Pass condition: the list includes `Chrome` with type `extension`.

5. List visible user tabs only to prove the browser bridge:

```js
const openTabs = await browser.user.openTabs();
```

Do not inspect, claim, or summarize unrelated tabs.

6. Open a fresh Chrome-extension-backed tab at the exact approved competitor-research URL:

```js
const competitorTab = await browser.tabs.new();
await competitorTab.goto(approvedCompetitorUrl);
```

`approvedCompetitorUrl` must be the Teal URL or route Matt authorized for the named research question. Do not guess or crawl nearby routes.

7. Verify the new tab without interacting with product controls:

```js
const title = await competitorTab.title();
const url = await competitorTab.url();
const snap = await competitorTab.playwright.domSnapshot();
const hasCloudflareBlock = snap.includes("Sorry, you have been blocked") || snap.includes("Cloudflare Ray ID");
const hasSignInPrompt = snap.includes("Sign in") || snap.includes("Log in");
```

Pass condition:
- URL starts with `https://app.tealhq.com/`
- no Cloudflare block
- no sign-in prompt
- title or visible state confirms Teal loaded

8. Capture only the minimum redacted evidence needed for the approved comparison. Do not capture personal job, resume, contact, note, or application data.

9. Close the competitor tab after evidence capture unless Matt explicitly asks to keep that exact tab for a continued read-only comparison.

## Bridge Repair
If the runtime probe cannot list Chrome tabs, and Matt has approved the competitor session, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ensure-codex-chrome-bridge.ps1 -Repair -OpenTeal
```

Run that from the Job Search repo root. If PowerShell is in another folder, use `$env:USERPROFILE` instead of a hardcoded username:

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\Jobs\Job Search\scripts\ensure-codex-chrome-bridge.ps1" -Repair -OpenTeal
```

Then retry the runtime probe once. The repair is not authorization to inspect Teal broadly or perform any member workflow.

## Failure Classification
Classify the failure before stopping:

- **Local bridge failure:** native host, extension install, extension enabled state, Chrome running state, or profile is wrong. Fix with the bridge repair script and rerun the runtime probe.
- **Thread binding failure:** local bridge checks are green, but `agent.browsers.get("extension")` fails or the backend list lacks `Chrome`. Stop same-thread retries after one repair and route to Codex Desktop Chrome plugin reset/rebind/restart or support escalation.
- **Wrong browser surface:** the approved Teal route is opened in isolated Playwright or the in-app browser and cannot use Matt's existing session. Stop that path and switch to the Chrome extension backend.
- **Scope failure:** the screen exposes personal data not needed for the approved comparison, or the answer would require a mutation. Stop and report that the research cannot be completed within the read-only boundary.
- **Competitor UI readability failure:** the exact approved surface loads but cannot be read reliably. Do not expand navigation or inspect personal records to compensate; report the bounded blocker.

## Stop Conditions
Stop and report a real blocker only when one of these is true:
- `node_repl` JavaScript execution is not callable after tool discovery.
- `agent.browsers.get("extension")` fails after bridge repair.
- Chrome backend does not appear after bridge repair and one runtime retry.
- Teal loads with Cloudflare in the Chrome extension backend.
- Teal requires login or a security challenge in the Chrome extension backend.
- The exact approved competitor surface remains unreadable after one fresh extension-backed tab attempt.
- The observation would expose unnecessary personal data or require any account, content, job, asset, or workflow mutation.

Do not stop merely because:
- `@Chrome` is not directly listed as a visible tool name.
- the bridge script only reports local health.
- `browser.tabs.list()` is empty before opening the fresh competitor tab.
- existing user tabs are visible only through `browser.user.openTabs()`.

## Output
Report:
- the approved competitor question and exact surface observed
- whether `node_repl` was available
- browser backends found
- whether a fresh Teal competitor tab opened
- Teal title and URL
- Cloudflare/sign-in status
- redacted interface facts relevant to the approved question
- explicit confirmation that no Teal data or workflow was mutated
- any personal-data exposure avoided or redacted
- next safe Way Ahead product implication
