# Recommended Windows Rebuild Plan

## Goal
Make Windows Codex operate TealHQ closer to the MacBook workflow: faster, more visual, less fragile, and safer around Teal's shared resume library.

## Phase 1: Stabilize Chrome Session
Gate: do not start Teal resume work until this phase passes.

1. Close all duplicate Teal resume tabs.
2. Keep only:
   - one Teal resume builder tab
   - one live application tab, only if needed
3. Disable or test without browser extensions that can interfere with text fields:
   - Grammarly
   - other writing assistants
   - any extension injecting overlays into contenteditable fields
4. Run the bridge health script:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ensure-codex-chrome-bridge.ps1 -Repair
```

5. Add a performance probe that measures:
   - `browser.tabs.list()`
   - tab title/url read
   - one narrow DOM read
   - one screenshot
   - one click on a harmless element

The current health script does not measure these.

Pass condition:

- Chrome backend is visible to Codex.
- A live Teal user tab can be listed and claimed.
- The Teal URL/title can be read from the claimed tab.
- A narrow DOM or visual probe completes without timeout.

Fail condition:

- If the current thread still exposes only isolated Playwright, in-app browser, or `about:blank`, stop and escalate to Codex desktop/plugin reset or MacBook-guided repair.

## Phase 2: Change Browser Automation Discipline
Use this operating rule:

- If a Teal browser action times out once, reduce scope.
- If the same Teal action times out twice, stop and ask for a manual handoff or restart browser state.
- Do not spend multiple minutes retrying the same failing click or snapshot.
- Treat Playwright-to-Teal Cloudflare as wrong-surface evidence, not a Teal login failure.

Preferred pattern:

1. Navigate to one exact Teal resume URL.
2. Wait for visible title only.
3. Use section header clicks, not scrolling, when possible.
4. Take small DOM excerpts around the current section.
5. Avoid whole-page snapshots in Teal after the page is loaded.
6. Export once through automation.
7. If no download appears within 15 seconds, ask Matt to click export manually.

## Phase 2.5: Controlled Teal Probe
Before another real application workflow, run a controlled probe against one non-destructive Teal resume tab:

1. List available browser backends.
2. Confirm `Chrome`, not only the in-app browser.
3. Use the extension backend to list open user tabs.
4. Claim the existing Teal tab.
5. Read title and URL.
6. Take one screenshot.
7. Inspect one narrow section only.
8. Click one harmless navigation or section control.
9. Export once only if the user has already approved an export test.
10. Verify whether a new file appears.

Record the result in `docs/operational-incident-log/incidents/2026-05-11-windows-teal-chrome.md`.

## Phase 3: Teal Skills Policy
Important: Teal skills are shared resume-library objects.

Rules:

- Do not use `Delete Skill` unless Matt approves global shared-library cleanup.
- Do not add a large comma-separated keyword list.
- Do not treat Job Matcher terms as a dump list.
- Use Teal categories only if the current template visibly supports them in export.
- If categories do not export as visible headings, use concise grouped skill labels.

Recommended HackerOne skill structure if Teal supports categories:

### Revenue And GTM Operations
- Revenue operations
- Pipeline and revenue
- Lead routing
- Lead scoring
- SLA management
- Campaign taxonomy

### Marketing Systems And Automation
- Marketing operations
- Marketing technologies
- CRM integration
- Workflow automation
- Data enrichment
- Performance data

### Lifecycle And Growth
- Lifecycle marketing
- Segmentation
- Customer journey
- Personalization
- Product-led growth
- Demand generation

### Analytics And Reporting
- GA4
- GTM
- Dashboards
- KPI reporting
- Attribution
- Forecasting

### Platforms
- Braze
- Klaviyo
- Zoho
- Shopify

If Teal does not support categories, use a compact native Teal list with the highest-signal skills only:

```text
Revenue operations, Marketing operations, Pipeline and revenue, Lead routing, Lead scoring, SLA management, Campaign taxonomy, CRM integration, Marketing automation, Workflow automation, Segmentation, Customer journey, Attribution, Forecasting, Dashboards, Performance data, GA4, GTM, Braze, Klaviyo, Zoho, Shopify
```

## Phase 4: Two-Page Resume Utilization
The Windows workflow needs a stronger visual page-fill loop.

Required loop:

1. Export the Teal-native PDF.
2. Verify it is 2 pages.
3. Visually inspect page 2.
4. If page 2 is underfilled:
   - add or activate one high-value proof block
   - prefer a complete relevant role over low-value skill stuffing
   - export again
5. If page 3 appears:
   - trim skills first
   - then trim lower-value old roles or weaker bullets

For HackerOne, prioritize page fill with:

- Prosper Wireless marketing operations/revenue-growth systems proof
- Affordable Insurance Quotes GTM/revenue operations proof
- Breakthrough Academy marketing operations and webinar/funnel operations proof
- Bob's Watches multi-channel marketing and reporting proof

Avoid overemphasizing:

- Old SEO-only roles
- Unselected roles with no bullets
- Generic skill piles that do not improve recruiter comprehension

## Phase 5: Export Verification
Use the file system as the source of truth after export:

```powershell
Get-ChildItem "$HOME\Downloads" -Filter "Director, Marketing Operations at HackerOne*.pdf" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 10 Name,Length,LastWriteTime
```

Then copy the newest export into `artifacts/` and check page count:

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

## Phase 6: Documentation/Skill Updates To Consider
The MacBook should decide whether to update these local workflow docs:

- `.agents/skills/tealhq-workflow/SKILL.md`
- `.agents/skills/resume-drafting/SKILL.md`
- `.agents/skills/qa-fact-check/SKILL.md`
- `docs/teal-workflow.md`

Suggested additions:

- Explicit one-Teal-tab rule.
- Fast fail rule for export/download.
- Teal shared skill-library warning.
- Manual export escalation after one failed automated export.
- Visual second-page fill gate before calling resume ready.
- Requirement to check `docs/operational-incident-log/` before Teal/Chrome recovery work.

## Phase 7: Lightweight Self-Healing Loop
Use `docs/operational-incident-log/` as the shared reliability memory.

Rules:

- Do not commit raw Codex session logs.
- Do not commit browser profile data, auth files, or cookies.
- Add or update one concise incident record when a failure repeats or a proven fix changes.
- Record session IDs and commands, not full transcripts.
- Keep incident records short enough for future Codex instances to read quickly.
- Promote only proven fixes into skills/scripts.

## Success Criteria
Windows Codex is fixed only when it can:

- cleanly operate one Teal resume tab
- avoid duplicate skill pollution
- produce a native Teal PDF download
- verify two pages
- confirm page 2 is well utilized
- stop before live application submission
- complete the workflow in minutes, not hours
