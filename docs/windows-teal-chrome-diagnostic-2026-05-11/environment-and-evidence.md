# Environment And Evidence

## Machine And Workspace
- Machine: Windows
- Workspace: `C:\Users\matth\Documents\Jobs\Job Search`
- Current task date: 2026-05-11
- Timezone: America/Chicago
- Repo remote:
  `https://github.com/GetFractional/job-search-engine.git`

## Branch/Repo State Before Diagnostic Work
At the start of diagnostic creation, `main` had many pre-existing uncommitted changes. They were not created by this diagnostic task and should not be treated as part of this packet.

Relevant output:

```text
## main...origin/main
 M .agents/skills/alen-sultanic-persuasion/SKILL.md
 M .agents/skills/application-answer/SKILL.md
 M .agents/skills/company-research/SKILL.md
 M .agents/skills/cover-letter/SKILL.md
 M .agents/skills/fit-scoring/SKILL.md
 M .agents/skills/hiring-manager-recruiter-research/SKILL.md
 M .agents/skills/interview-pack/SKILL.md
 M .agents/skills/job-search-scenarios/SKILL.md
 M .agents/skills/job-search-scenarios/references/scenario-workflows.md
 M .agents/skills/market-competition/SKILL.md
 M .agents/skills/outreach/SKILL.md
 M .agents/skills/profile-understanding/SKILL.md
 M .agents/skills/qa-fact-check/SKILL.md
 M .agents/skills/resume-drafting/SKILL.md
 M .agents/skills/resume-strategy/SKILL.md
 M .agents/skills/role-intake/SKILL.md
 M .agents/skills/role-lane-classification/SKILL.md
 M .agents/skills/tealhq-workflow/SKILL.md
 M AGENTS.md
 M docs/job-search-operating-system.md
 M docs/role-fit-scorecard.md
 M docs/teal-workflow.md
 M templates/tailored-resume-brief.md
?? artifacts/
?? docs/chrome-bridge-recovery.md
?? open-teal-chrome.ps1
?? scripts/ensure-codex-chrome-bridge.ps1
?? scripts/open-teal-chrome.ps1
?? scripts/repair-codex-chrome-bridge.ps1
?? teal-cloudflare.png
```

The diagnostic work was done on branch:

`codex/windows-teal-chrome-diagnostic-2026-05-11`

## Chrome Bridge Health
The Windows Chrome bridge health script passes:

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

This indicates the native host and extension are installed and Chrome is running, but it does not prove Teal UI automation is healthy.

## Relevant Chrome Tabs Observed
At different points, the browser showed these tabs:

```text
https://app.tealhq.com/resume-builder/resumes/b1e28eea-c4e5-4136-af4f-c62062f537f3/preview
https://app.tealhq.com/resume-builder/resumes/b1e28eea-c4e5-4136-af4f-c62062f537f3/matching
https://jobs.ashbyhq.com/hackerone/3ce7fd51-2a15-4a1a-98cc-65abfe09fb13/application
```

Multiple Teal resume tabs were open during troubleshooting. That likely made the Teal app slower and the automation less predictable.

## Download Evidence
Downloads check after attempted exports showed only the older PDF:

```text
Name                                            Length LastWriteTime
----                                            ------ -------------
Director, Marketing Operations at HackerOne.pdf  90124 5/10/2026 8:29:02 PM
```

No new PDF appeared after multiple export clicks on 2026-05-11.

## Verified Local Artifact
The only verified Teal-native resume artifact is:

`artifacts/HackerOne - Director, Marketing Operations - Matt Dimock - Resume.pdf`

PowerShell check:

```text
Path           : C:\Users\matth\Documents\Jobs\Job Search\artifacts\HackerOne - Director, Marketing Operations - Matt Dimock - Resume.pdf
Length         : 90124
PageMarkers    : 2
PageCountValue : 2
```

Important: this artifact predates the later skills edits and should not be treated as the final corrected resume.

## Browser Automation Failures Observed
Representative failures:

```text
js execution timed out; kernel reset, rerun your request
```

```text
tool call error: tool call failed for `node_repl/js`
Caused by:
    timed out awaiting tools/call after 120s
```

```text
Timed out after 3000ms waiting for CDP command Runtime.evaluate.
```

```text
Timed out after 10000ms waiting for CDP command Page.captureScreenshot.
```

```text
Timed out after 10000ms waiting for CDP command Input.synthesizeScrollGesture.
```

```text
Timed out after 90000ms waiting for download.
```

## Teal Skills Editor Findings
Teal's skills section behavior observed:

- `Add Skills & Interests` can add multiple comma-separated terms.
- Adding many terms produced duplicate skill rows.
- Selecting a skill row exposes `Edit Skill` and `Delete Skill`.
- `Delete Skill` opens a global warning:

```text
Are you sure you want to delete this skill? Deleting this skill from your work history will also remove it from all resumes.
```

Therefore, deleting skills was considered unsafe without explicit approval.

Teal section actions showed:

```text
Activate All
Delete Inactive Skills
Section Settings
Sort By Alphabetically
Layout Comma Separated
Go to Design Mode
```

Layout options observed:

```text
Comma Separated
Comma Separated List
Columns
```

Category creation was attempted, but category names did not persist as expected in the active builder view. A category label such as `Demand Generation & Pipeline` appeared later, but the visible skills still remained mostly in one large block.

## Grammarly Overlay
At least once, after saving a skill edit, the visible DOM collapsed to:

```text
<div node_id=19522 aria-label="grammarly-integration" role="group" />
```

Reload recovered the Teal builder. This may be relevant if Grammarly or another extension is interfering with reliable DOM capture/editing in Chrome.
