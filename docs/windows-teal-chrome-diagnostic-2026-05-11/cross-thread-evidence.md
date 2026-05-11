# Cross-Thread Evidence Summary

## Purpose
This file summarizes relevant evidence from prior local Codex Job Search chats so another Codex instance can debug the Windows setup without Matt manually transferring context.

It intentionally does not copy raw JSONL session logs. Raw logs are large and may include sensitive account, browser, or application context. This summary preserves the operational signal while keeping storage small.

## Evidence Sources
Local sources inspected on 2026-05-11:

- `C:\Users\matth\.codex\session_index.jsonl`
- `C:\Users\matth\.codex\sessions\2026\05\10\*.jsonl`
- `docs/chrome-bridge-recovery.md`
- `docs/windows-teal-chrome-diagnostic-2026-05-11/*`
- Relevant memory registry lines in `C:\Users\matth\.codex\memories\MEMORY.md`

No secrets, cookies, OAuth files, auth files, or reference-contact files were opened for this summary.

## Sessions Found
The session index shows a cluster of related Job Search threads created on 2026-05-10 and 2026-05-11:

| Thread | Session ID | Diagnostic relevance |
|---|---:|---|
| Clone Codex to Windows | `019e125c-e067-7b11-b380-9780aab6b1ab` | Initial Windows setup and environment migration context. |
| Verify job search setup | `019e134e-1bdd-7a13-82dd-fb2ad08c072b` | Early setup validation, Teal/Chrome references, and fallback risk. |
| Apply to next best job | `019e1359-9f2a-79b1-9205-b39c8344d0d2` | First application workflow failures and Teal usage. |
| Fix Chrome access on Windows | `019e135d-47c4-7fb2-b302-5e79aa7a3c72` | Direct Chrome access repair attempt. |
| Investigate Chrome access issue | `019e135e-cbb2-7c43-9946-09bc5d964c00` | Chrome/Teal access debugging. |
| Inspect Chrome and Teal tools | `019e135e-e960-7500-80cf-f967f05eb6e8` | Browser tool availability and Teal access inspection. |
| Apply to next best Teal job | `019e136d-b64f-7b32-b45b-5e028c84cfc9` | Teal-native application workflow under browser instability. |
| Inspect browser bridge config | `019e13cc-95ea-7343-87b9-eace3b01b98a` | Native host and bridge configuration inspection. |
| Investigate Chrome backend loss | `019e13cc-acad-76d1-8fc9-2c7366ac34b3` | Backend disappearance and extension-host behavior. |
| Optimize Teal apply workflow | `019e1415-dea8-7162-a6a0-7dd7a8aeb5dd` | Attempted workflow-level improvements. |
| Audit Teal apply workflow logs | `019e1418-24e4-7603-baaa-e9f3a02383b8` | Review of workflow failures. |
| Audit workflow guidance | `019e1418-4aad-7801-ae38-30cdcdbb7078` | Rule and skill guidance update context. |
| Apply to next best job | `019e1446-649a-78d2-89af-70618aca5e63` | Continued application attempt after prior fixes. |
| Apply to next best job | `019e1469-70cc-7322-8df4-f1fbb47974ce` | Additional apply workflow recurrence. |
| List TealHQ open tabs | `019e1472-da68-7e33-b74f-cefabede8159` | Open-tab recovery and `Tabs_*` evidence. |
| Fix Chrome access for Codex | `019e1477-dfe8-7913-8d52-039e7582d0b9` | Later repair attempt, backend and bridge checks. |
| Investigate Chrome access issue | `019e1479-0663-7221-84f3-496554125fd7` | Continued Chrome access debugging. |
| Inspect browser tool availability | `019e1479-21c9-7911-b316-3d41502d6bd1` | Tool availability and backend exposure check. |
| Apply to best job | `019e1484-bc9e-70a0-86fa-5fcf3dd59b12` | Latest HackerOne Teal resume failure, including skills, export, and timeout symptoms. |

## Pattern Counts
Approximate raw string counts across 22 local session JSONL files:

| Signal | Sessions with signal | Raw matches | Interpretation |
|---|---:|---:|---|
| `Teal` | 21 | 13,118 | Teal is the repeated operating surface. |
| `Chrome` | 21 | 12,553 | Chrome access is central across threads. |
| `Playwright` | 22 | 4,307 | Fallback or tool confusion is pervasive. |
| `Cloudflare` | 21 | 1,738 | Isolated browser access repeatedly hit Teal protection. |
| `timeout` | 20 | 2,731 | Slowness is systemic, not isolated. |
| `bridge` | 19 | 1,606 | Bridge health and recovery have been repeatedly addressed. |
| `about:blank` | 11 | 93 | Current-thread backend exposure often collapses to a blank or isolated view. |
| `Chrome backend` | 9 | 107 | Backend enumeration is a repeated debugging topic. |
| `openTabs` | 9 | 136 | User-tab discovery became a known required path. |
| `claimTab` | 6 | 50 | Claiming live user tabs became part of the repair pattern. |
| `Export PDF` | 9 | 196 | Teal export/download failures recur. |
| `Timed out` | 7 | 95 | Tool-level timeout failures recur. |
| `Tabs_` | 5 | 46 | Chrome session snapshot recovery was needed. |
| `EBUSY` | 2 | 11 | Active Chrome session files can be locked. |
| `Grammarly` | 2 | 44 | Extension interference is plausible but not proven. |
| `uncategorized` | 1 | 8 | Latest resume-quality failure, narrower than the browser issue. |

These are not proof by themselves because the logs include instructions and repeated context. They are useful as recurrence indicators.

## MECE Failure Categories

### 1. Browser Backend Binding
Observed pattern:

- Chrome bridge scripts can report healthy local state.
- The current Codex thread can still expose only an isolated browser, `about:blank`, or Playwright-style access.
- Cloudflare 403 appears when Teal is reached through isolated Playwright instead of Matt's logged-in Chrome profile.
- `browser.user.openTabs()` and `browser.user.claimTab(...)` are required for existing user tabs; direct controllable-tab lookup can be empty.

Current status:

- Partially mitigated by bridge scripts and documented recovery.
- Not proven fixed because later sessions still show backend loss and fallback symptoms.

### 2. Chrome Session Recovery
Observed pattern:

- Chrome tabs may be visible to Matt but unavailable to the current Codex thread.
- Chrome session snapshots under `User Data\Default\Sessions` can recover useful tab destinations.
- Active `Tabs_*` files can be locked with `EBUSY`, requiring an older readable snapshot.

Current status:

- Recovery approach exists.
- It is still a workaround, not a reliable operating loop.

### 3. Teal React UI Automation
Observed pattern:

- Teal resume builder is a heavy React UI.
- Broad DOM snapshots, screenshots, scrolling, and JS interactions can time out.
- Multiple Teal tabs appear to increase confusion and latency.
- Skills editor state is difficult to infer from DOM alone.

Current status:

- Needs a new fast visual QA loop and a one-tab rule.
- Existing bridge health checks do not measure Teal interaction latency.

### 4. Teal Resume Data Safety
Observed pattern:

- Teal `Delete Skill` affects shared skills across resumes.
- Adding comma-separated skills can create duplicate or ugly rows.
- Category behavior is not reliable unless confirmed in the exported template.
- The latest visible outcome still had an uncategorized block and underused second page.

Current status:

- Shared-library danger is now known.
- The affected resume should be treated as needing visual cleanup.

### 5. Export And Download Verification
Observed pattern:

- The `Export PDF` button can be visible and clicked without producing a download.
- The latest verified HackerOne PDF remained an older export.
- Automation did not reliably detect or produce a new file.

Current status:

- Need a strict fast-fail rule: one automated export attempt, then manual export handoff if no file appears.
- File-system verification should be the source of truth.

### 6. Operating Discipline
Observed pattern:

- Windows Codex repeatedly spent time retrying broad snapshots, selectors, and export clicks.
- It reported progress before visual page-fill and final export were actually verified.
- It did not keep enough short-lived, reusable incident knowledge until this diagnostic.

Current status:

- The new incident-log design addresses future self-healing.
- The Teal workflow still needs enforcement in skills/docs and active behavior.

## Deductive Chain
Known facts:

1. Matt can use Teal in logged-in Chrome.
2. Isolated Playwright access to Teal can produce Cloudflare 403.
3. Local bridge checks can pass while the current Codex thread still cannot reliably operate live Chrome tabs.
4. Teal UI operations time out even after Chrome access is partially restored.
5. The latest Teal resume edits were not visually or export verified.

Therefore:

- The problem is not simply "Teal is unavailable" or "Chrome is not installed."
- The likely system failure is a chain: Chrome backend binding instability plus Teal UI automation fragility plus weak workflow stop rules.
- Fixing only the native host or only the resume workflow will not be sufficient.

## What MacBook Codex Should Test Next
Run these as discriminating tests:

1. Can Windows Codex list `Chrome` as a backend in the current thread after bridge repair?
2. Can it run `browser.user.openTabs()` and claim the visible Teal tab?
3. Can it complete a 30-second Teal probe on one tab: title/url read, narrow section inspection, screenshot, harmless click?
4. Does disabling Grammarly or other content-editing extensions improve Teal editor stability?
5. Does one Teal tab perform materially better than multiple Teal tabs?
6. Does a manual click on `Export PDF` create a file when automation clicks do not?
7. Can Windows Codex verify a newly exported PDF page count and visual fill without reopening Teal repeatedly?

## Evidence Handling Recommendation
Do not commit raw session JSONL files. Instead:

- Keep a lightweight incident index in `docs/operational-incident-log/`.
- Add one incident record only when a failure repeats or creates a new proven fix.
- Link to local session IDs, not full raw logs.
- Include commands, symptoms, hypotheses, and proven fixes.
- Keep screenshots/PDFs only when they are essential evidence.
