# Failure Analysis

## What The Assistant Did Wrong
The Windows Codex workflow failed operationally in several ways:

1. It treated a verified two-page PDF as sufficient even though the second page was visibly underfilled.
2. It did not correctly inspect the final visual resume output after Teal edits.
3. It tried to solve a Teal skills organization issue by adding keyword rows, which worsened the visible skills block.
4. It did not recognize fast enough that Teal skill deletion is global and unsafe.
5. It spent too much time on heavy DOM snapshots and repeated retry loops.
6. It did not stop early enough when export/download verification became unreliable.
7. It did not create a clean, repeatable Teal-native resume process.

## Symptoms
The main symptoms are not a single failure. They are a system-level mismatch between the Windows Codex browser control method and Teal's heavy React UI.

Observed symptoms:

- Slow DOM snapshots.
- Browser JS kernel timeouts.
- CDP command timeouts.
- Screenshot failures.
- Scroll gesture failures.
- Export button click has no download effect.
- Multiple Teal tabs degrade reliability.
- Skills editor state is hard to reason about from DOM snapshots.
- Teal native UI actions that work visually for a human do not reliably complete through automation.

## Working Hypotheses
These hypotheses need MacBook Codex analysis.

### 1. Extension Backend Is Healthy But Too Slow For Teal's Current App State
The health script only proves native host and extension availability. It does not measure:

- CDP round-trip latency
- Teal React render stability
- tab memory pressure
- extension conflicts
- download event propagation
- whether the selected tab is foreground/focused enough for download

### 2. Multiple Teal Tabs And Heavy DOM Reads Made The App Worse
During troubleshooting, multiple Teal resume tabs were open:

- `/preview`
- `/matching`
- another `/preview`

This likely increased memory, React state contention, and CDP latency.

### 3. Grammarly May Interfere With Text Editing And DOM Capture
The DOM collapsed to a Grammarly integration overlay after a Teal skill save. This suggests Grammarly or another extension can temporarily dominate the visible DOM tree or interfere with contenteditable fields.

### 4. Teal's Resume Builder Is Not Safe For Bulk Skill Editing Through DOM Automation
The skills section is shared across resumes. `Delete Skill` is global. That means cleanup cannot use destructive skill deletion unless Matt approves a shared-library cleanup.

Also, adding comma-separated skill lists creates separate rows, and Teal may duplicate rows if a skill already exists in the library.

### 5. Teal Export May Require A Browser/User Gesture That The Extension Click Is Not Satisfying
The export button was visible and clicked several ways:

- DOM click
- DOM double click
- Playwright force click
- after reload

But no PDF download occurred. Possible causes:

- click not reaching the correct UI layer
- export blocked by hidden state or unsaved edits
- popup/download blocked
- Teal needs focus or a true user gesture
- the button is visible but disabled by async state
- browser extension backend does not surface the download event for this action

### 6. Current Windows Workflow Lacks A Fast Visual QA Loop
The MacBook workflow appears to work because it likely combines faster direct browser use, visual confirmation, and fewer heavy snapshots. Windows Codex needs a faster QA pattern:

- one Chrome tab only
- focused visible UI actions
- minimal DOM excerpts
- manual confirmation when Teal export/download is unreliable
- no repeated snapshot loops

## Unsafe Paths Discovered
Do not do these without explicit approval:

- Do not use `Delete Skill` in Teal unless Matt approves a shared Teal library cleanup.
- Do not submit the application.
- Do not upload final resume to Ashby until Matt approves the exact final file.
- Do not answer voluntary self-ID fields.
- Do not keep adding keyword rows as a substitute for a clean skills structure.

## Current Teal Resume Risk
The current Teal resume may contain partially edited grouped skills and duplicate skill rows. It should be treated as contaminated until the MacBook or Windows Codex performs a clean visual review.

Recommended cleanup approach:

1. Open the Teal resume manually in Chrome.
2. Inspect the Skills & Interests section visually.
3. Decide whether Teal supports true categories for this template.
4. If categories are not supported, use the most compact native layout and a short, recruiter-readable skill list.
5. Avoid global skill deletion unless intentionally cleaning the shared library.
6. Export manually if automation cannot trigger export.
7. Verify page count and visual page fill.

## Speed Problems
The Windows assistant was too slow because it:

- repeatedly used broad `dom_cua.get_visible_dom()` calls
- kept parsing long DOM strings
- kept retrying failing selectors
- opened/kept multiple Teal tabs
- attempted batch edits in a heavy React UI
- waited on downloads after clicks that did not trigger downloads

Recommended speed changes:

- Use one browser tab per Teal resume.
- Close duplicate Teal tabs before work.
- Use narrow, visible UI steps.
- Avoid full DOM snapshots except at section boundaries.
- Prefer Teal's visible UI and manual user handoff for export if automation fails once.
- Keep a local checklist of exact Teal UI actions instead of repeatedly rediscovering controls.
