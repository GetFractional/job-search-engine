# Codex Mac to Windows Migration Notes

Generated: 2026-05-10T17:49:35.374272+00:00

## What This Bundle Contains

- `config.toml`, copied as the local Mac source config. It may contain local secret values because the user explicitly requested the original config in the local zip. Do not upload it to GitHub or paste it into chat.
- `AGENTS.md`, if present.
- `rules/default.rules`, if present.
- `inventories/plugins_inventory.md`, generated from `~/.codex/plugins/cache`.
- `inventories/skills_inventory.md`, generated from `~/.codex/skills`.
- `summaries/global_state_safe_summary.md`, filtered to UI, preference, and project-hint style data only.

## What This Bundle Excludes

- `auth.json`
- tokens and raw connector credentials outside the copied local `config.toml`
- sessions
- sqlite databases
- logs
- `.sandbox-secrets`
- raw connector credential stores

## Enabled Plugins

- `browser-use@openai-bundled`: `true`
- `build-web-apps@openai-curated`: `true`
- `canva@openai-curated`: `true`
- `chrome@openai-bundled`: `true`
- `clickup@openai-curated`: `true`
- `cloudflare@openai-curated`: `true`
- `computer-use@openai-bundled`: `true`
- `documents@openai-primary-runtime`: `true`
- `figma@openai-curated`: `true`
- `github@openai-curated`: `true`
- `gmail@openai-curated`: `true`
- `google-calendar@openai-curated`: `true`
- `google-drive@openai-curated`: `true`
- `presentations@openai-primary-runtime`: `true`
- `spreadsheets@openai-primary-runtime`: `true`

## MCP / Server Config

- `airtable`: command/url `"npx"`, args `["-y", "airtable-mcp-server"]`, env keys `AIRTABLE_API_KEY`, headers none, approval-gated tools none
- `clickup`: command/url `"npx"`, args `["-y", "@hauptsache.net/clickup-mcp@latest"]`, env keys `CLICKUP_API_KEY`, `CLICKUP_MCP_MODE`, `CLICKUP_TEAM_ID`, `MAX_IMAGES`, `MAX_RESPONSE_SIZE_MB`, headers none, approval-gated tools `addComment`, `createTask`, `updateTask`
- `figma`: command/url `"https://mcp.figma.com/mcp"`, args `not found`, env keys none, headers `Authentication`, approval-gated tools none
- `memory`: command/url `"node"`, args `["/Users/mattdimock/.codex/vendor/memory-mcp/node_modules/@whenmoon-afk/memory-mcp/dist/index.js"]`, env keys `DEFAULT_TTL_DAYS`, `MEMORY_DB_PATH`, headers none, approval-gated tools none
- `playwright`: command/url `"/bin/zsh"`, args `["-lc", "export HOME=\"$HOME\"; export PLAYWRIGHT_BROWSERS_PATH=\"$HOME/.cache/ms-playwright\"; mkdir -p \"$HOME/.playwright-mcp\" \"$PLAYWRIGHT_BROWSERS_PATH\"; exec npx -y @playwright/mcp@latest --headless --isolated --viewport-size=1366x900 --timeout-navigation=60000 --timeout-action=5000"]`, env keys none, headers none, approval-gated tools `browser_click`, `browser_evaluate`, `browser_navigate`, `browser_resize`, `browser_run_code_unsafe`, `browser_tabs`

Windows rewrite guidance:
- Recreate API keys and connector credentials manually on Windows. Do not transfer old token stores.
- Rewrite Mac shell commands such as `/bin/zsh -lc ...` to Windows-compatible PowerShell, Git Bash, WSL, or Node commands depending on the Windows Codex runtime.
- Rewrite `/Users/mattdimock/...` paths to the actual Windows user path, for example `C:\Users\<you>\...` or the WSL home path if using WSL.
- Reinstall Node-based MCP packages through `npx` on Windows instead of copying `node_modules` or runtime cache directories.

## Personalization Settings

- Model: `gpt-5.5`
- Reasoning effort: `high`
- Personality: `pragmatic`
- Startup timeout seconds: `30`
- Tool timeout seconds: `120`
- Notify command: `["/Users/mattdimock/.codex/computer-use/Codex Computer Use.app/Contents/SharedSupport/SkyComputerUseClient.app/Contents/MacOS/SkyComputerUseClient", "turn-ended"]`
- Global operating preference from user-provided personalization: high-agency build partner, direct execution, small reversible steps, clean diffs, explicit objective/assumptions/plan, and structured closeout.
- Safety preference: do not print secrets, do not push private bundles, and ask before destructive or externally visible actions.

## Model / Reasoning Defaults

- Current Mac default in config: `gpt-5.5` with `high` reasoning.
- Job Search workflow guidance from project instructions: use `gpt-5.4-mini` low/medium for broad search and triage, `gpt-5.4` medium for standard application drafting, and `GPT-5.5` medium/high for high-stakes final resume, interview, compensation, or ambiguous strategy work.

## Project Trust Entries

- `/Users/mattdimock`: `trusted`. Windows rewrite candidate: `C:\Users\<you>`
- `/Users/mattdimock/Documents/Clients/OC Ramps`: `trusted`. Windows rewrite candidate: `C:\Users\<you>\Documents\Clients\OC Ramps`
- `/Users/mattdimock/Documents/Jobs/Job Filter/Job-Filter-v2`: `trusted`. Windows rewrite candidate: `C:\Users\<you>\Documents\Jobs\Job Filter\Job-Filter-v2`
- `/Users/mattdimock/Documents/Jobs/Job Search`: `trusted`. Windows rewrite candidate: `C:\Users\<you>\Documents\Jobs\Job Search`
- `/Users/mattdimock/Documents/Jobs/Job-Hunter copy`: `trusted`. Windows rewrite candidate: `C:\Users\<you>\Documents\Jobs\Job-Hunter copy`
- `/Users/mattdimock/Documents/New project`: `trusted`. Windows rewrite candidate: `C:\Users\<you>\Documents\New project`

## Feature Flags

- `js_repl`: `true`
- `memories`: `true`
- `multi_agent`: `true`

## Marketplaces / Runtime Cache Notes

- `openai-bundled`: last_updated=2026-05-08T17:21:09Z, source=/Users/mattdimock/.codex/.tmp/bundled-marketplaces/openai-bundled, source_type=local
- `openai-primary-runtime`: last_updated=2026-05-07T15:49:08Z, source=/Users/mattdimock/.cache/codex-runtimes/codex-primary-runtime/plugins/openai-primary-runtime, source_type=local
- Marketplace and runtime cache paths are machine-local. Reinstall or refresh plugins on Windows instead of copying Mac cache directories as source of truth.

## Mac-Only Paths To Rewrite

- `/Users/mattdimock`
- `/Users/mattdimock/.cache/codex-runtimes/codex-primary-runtime/plugins/openai-primary-runtime`
- `/Users/mattdimock/.codex/.tmp/bundled-marketplaces/openai-bundled`
- `/Users/mattdimock/.codex/computer-use/Codex`
- `/Users/mattdimock/.codex/memory/codex-memory.db`
- `/Users/mattdimock/.codex/vendor/memory-mcp/node_modules/@whenmoon-afk/memory-mcp/dist/index.js`
- `/Users/mattdimock/Documents/Clients/OC`
- `/Users/mattdimock/Documents/Jobs/Job`
- `/Users/mattdimock/Documents/Jobs/Job-Hunter`
- `/Users/mattdimock/Documents/New`
- `/bin/zsh`

Especially important rewrites:
- Computer Use notify path points to a `.app` bundle and will not work on Windows as-is.
- Playwright MCP currently launches through `/bin/zsh`; rewrite the launch command for Windows.
- Memory MCP points at a Mac `node_modules` path and a Mac sqlite database path. Reinstall the package and create a Windows-local memory database path instead of transferring the database.

## Items That Must Be Reconnected Manually

- OpenAI/Codex account login and auth state.
- Google Calendar, Gmail, Google Drive, GitHub, Canva, Figma, Cloudflare, ClickUp, Airtable, Browser/Chrome connectors, and any OAuth-backed app sessions.
- MCP API keys for Airtable, ClickUp, Figma, and any other server requiring headers or env credentials.
- Browser profile login state, TealHQ login, LinkedIn login, and Chrome extension state.
- Computer Use on Windows, if supported in your Windows Codex build. The Mac app-bundle notify path cannot transfer. If Windows does not expose Computer Use, Chrome/browser automation and Playwright remain useful, but OS-level app control will be reduced.
- Local runtime caches under `.cache`, plugin marketplaces, `node_modules`, Playwright browsers, and Codex primary runtime paths.

## Job Filter Actions You Mentioned

- `Verify`: `npm run verify`, likely intended as the broad repo confidence gate when the project defines a combined verification command.
- `Lint`: `npm run lint --if-present`, checks style/static issues only when the repo has a lint script.
- `Tests`: `npm test --if-present`, runs the repo test command only when present.
- These actions are convenience commands, not special Codex logic. Use them from the Job Filter project root after dependencies are installed. If `npm run verify` hangs or fails, fall back to narrower lint/test/build commands and capture the blocker.

## Windows Setup Recommendation

1. Install Codex on Windows and sign in fresh.
2. Clone the private Job Search repo on Windows.
3. Run the repo skill sync/bootstrap script from the Windows checkout, adapting shell syntax if needed.
4. Recreate MCP servers with Windows paths and fresh credentials.
5. Re-enable plugins from the plugin inventory through the Codex UI/plugin system.
6. Re-add project trust entries using Windows paths.
7. Test a small job-search workflow, then test Chrome/TealHQ and Playwright separately.
