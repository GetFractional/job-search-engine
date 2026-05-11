# Framework Analysis

## Purpose
This document applies the requested frameworks to turn the Windows Codex/Teal problem into a clear diagnostic and rebuild plan.

Requested frameworks used:

- MECE
- JTBD
- Design thinking
- Systems thinking
- Nielsen heuristics
- Critical thinking
- Inversion thinking
- Deductive reasoning
- Second-order thinking

The expert-orchestrator playbook was used in expanded mode with these lenses:

- Reliability engineering lead
- Browser automation/debugging lead
- Teal workflow owner
- UX/service design lead
- Knowledge-system maintainer

## Executive Diagnosis
Windows Codex is failing the job-to-be-done because it cannot reliably translate Matt's intent into verified Teal-native outputs.

The failure is not just slow browser control. It is a compounded workflow reliability issue:

1. Windows Codex sometimes loses or cannot bind to the live Chrome backend.
2. It falls back to isolated Playwright or in-app browser surfaces that are wrong for Teal.
3. When Chrome access works, Teal's heavy React builder still creates timeouts and ambiguous state.
4. The workflow lacks fast-fail rules, visual QA gates, and reliable export verification.
5. Learnings were scattered across chats instead of captured as a compact incident system.

## JTBD

### Functional Job
When Matt asks Codex to apply to a job through Teal, he needs Codex to research, optimize, export, and prepare application materials inside the same Teal-native workflow he would use manually.

### Emotional Job
Matt needs confidence that Codex is reducing the burden, not adding rework, uncertainty, or the need to babysit basic browser operations.

### Social/Professional Job
Matt needs application materials that are credible, polished, role-specific, and safe to submit. A visibly underfilled second page or messy uncategorized skills block harms trust.

### Success Criteria
The workflow succeeds only when:

- Chrome-backed Teal access is confirmed.
- The role is worth pursuing.
- Teal-native resume edits are completed safely.
- Skills are clean and recruiter-readable.
- Two pages are used intentionally.
- A fresh PDF is exported and verified.
- The application is prepared but not submitted without explicit approval.

## MECE Root-Cause Map

| Category | Failure mode | Evidence | Owner |
|---|---|---|---|
| Environment | Chrome backend not exposed to current Codex thread | `about:blank`, backend-loss threads, Cloudflare fallback | Codex desktop/browser plugin |
| Bridge | Native host and extension state can drift | repeated bridge repair threads, `extension-host.exe` references | Windows setup scripts |
| Tooling | Isolated Playwright is the wrong surface for Teal | Cloudflare 403 and in-app/Playwright fallback | Agent routing |
| App complexity | Teal React UI is heavy and mutable | DOM/screenshot/JS timeout patterns | Teal workflow design |
| Data safety | Teal skills are shared across resumes | `Delete Skill` warning, duplicate skill rows | Resume workflow owner |
| Verification | PDF export and page fill were not proven | old PDF remained latest verified artifact | QA gate |
| Process | Agent retried too much and escalated too late | repeated broad snapshots, slow loops | Operating discipline |
| Knowledge | Fixes were distributed across chats | many related sessions with repeated symptoms | Incident log |

## Design Thinking

### Empathize
Matt's pain is not "I need a diagnostic document." The real pain is that the Windows Codex setup creates avoidable operational drag compared with the MacBook. He needs a system that can self-correct quickly and preserve learnings.

### Define
Problem statement:

Windows Codex needs a reliable, low-friction operating model for Chrome-backed Teal workflows that can detect the wrong browser surface, recover or stop quickly, perform Teal edits safely, and verify outputs before claiming completion.

### Ideate
Candidate interventions:

- One-tab Teal rule.
- Browser-backend preflight before every Teal workflow.
- Teal interaction latency probe, not just bridge health.
- Fast-fail export rule.
- Visual second-page fill gate.
- Shared-skill warning and cleanup policy.
- Lightweight incident log and proven-fix registry.
- MacBook diagnostic prompt for independent review.

### Prototype
This packet prototypes the knowledge system:

- Cross-thread evidence summary.
- Framework analysis.
- Rebuild plan.
- Incident log schema.
- First incident record.

### Test
The next test is not another resume attempt. It is a controlled Teal probe:

1. Bind to live Chrome.
2. Claim one Teal tab.
3. Measure narrow Teal interactions.
4. Export once.
5. Verify file creation.
6. Stop if any step fails.

## Systems Thinking

### System Components
- Codex Desktop
- Chrome plugin/backend
- Native host manifest
- `extension-host.exe`
- Matt's logged-in Chrome profile
- TealHQ web app
- Teal Chrome extension
- Browser extensions such as Grammarly
- Local scripts and workflow skills
- Artifact/download verification
- GitHub-backed docs and incident logs

### Feedback Loops
Bad loop:

1. Browser binding fails.
2. Agent falls back to Playwright.
3. Teal blocks or slows down.
4. Agent retries broad snapshots.
5. Latency worsens.
6. User loses trust.
7. More ad hoc fixes are attempted.

Better loop:

1. Browser binding is tested.
2. Wrong surface is detected quickly.
3. Recovery script runs once.
4. Teal probe measures interaction health.
5. Agent proceeds only if health is proven.
6. Failures become compact incident records.
7. Future agents reuse proven fixes.

### Leverage Points
Highest leverage:

- Detect wrong browser surface before work starts.
- Stop after repeated Teal UI timeouts.
- Verify exports through the file system.
- Store learnings in a compact incident log.
- Keep Teal work to one tab and one narrow task at a time.

## Nielsen Heuristics Applied To The Agent Workflow

| Heuristic | Current failure | Required correction |
|---|---|---|
| Visibility of system status | Agent said work was progressing while final visual/export state was unknown. | Always report verified state vs attempted state. |
| Match between system and real world | Agent treated DOM state as truth when Matt judged the visible resume. | Use visual resume output as truth for resume QA. |
| User control and freedom | Teal skill deletion could have affected all resumes. | Preserve approval gates for shared-library changes. |
| Consistency and standards | Workflow changed across chats. | Encode one Teal operating procedure. |
| Error prevention | It did not detect wrong browser surface early enough. | Preflight Chrome backend before Teal work. |
| Recognition over recall | Each thread rediscovered controls and failure modes. | Incident log and checklists reduce rediscovery. |
| Flexibility and efficiency | Heavy DOM snapshots made routine tasks slow. | Use narrow probes and fast-fail thresholds. |
| Aesthetic and minimalist design | Skills became cluttered and uncategorized. | Use compact recruiter-readable skills. |
| Help users recover from errors | User had to identify the bad output. | Add visual/export QA gates before handoff. |
| Help and documentation | Fixes lived in scattered chats. | Keep recovery docs and incident records in repo. |

## Critical Thinking

### Claims With Strong Support
- Isolated Playwright is not acceptable for Teal when Chrome login state matters.
- Bridge health scripts are necessary but insufficient.
- Export verification must use file-system evidence.
- Teal skill deletion is unsafe without approval because it affects shared skills.

### Claims With Moderate Support
- Multiple Teal tabs degrade performance and state clarity.
- Grammarly can interfere with contenteditable fields or DOM capture.
- MacBook reliability comes from a better browser-control path and less fallback confusion.

### Claims Not Yet Proven
- The native host itself is defective.
- Grammarly is the primary root cause.
- Teal export requires a physical user gesture.
- A full reinstall of Codex Chrome plugin will permanently fix backend loss.

## Inversion Thinking
To make the workflow fail again, do these things:

- Start Teal work without proving live Chrome backend access.
- Accept isolated Playwright as "good enough."
- Open multiple Teal resume tabs.
- Use broad DOM snapshots repeatedly.
- Edit shared Teal skills destructively.
- Dump Job Matcher keywords into skills.
- Click export repeatedly without checking Downloads.
- Call a PDF ready without inspecting page count and page fill.
- Leave failures only in chat history.

Therefore, the rebuilt process should explicitly prevent those behaviors.

## Deductive Reasoning
Premises:

1. Teal must be used through Matt's logged-in Chrome profile.
2. Cloudflare 403 appears when using isolated browser surfaces.
3. Windows Codex repeatedly shows Cloudflare/fallback/backend-loss patterns.
4. Teal UI actions also time out after partial Chrome recovery.
5. The final resume output failed visible quality checks.

Conclusion:

The necessary fix is a layered reliability workflow, not a single script patch. It must address browser binding, Teal UI operation, export verification, and knowledge capture.

## Second-Order Thinking

### If We Only Fix The Bridge
First-order effect:

- Chrome may become visible more often.

Second-order risk:

- Teal work still fails through slow DOM, bad skills handling, and weak export QA.

### If We Only Improve Resume Instructions
First-order effect:

- Better intended copy and skills structure.

Second-order risk:

- Windows Codex still cannot reliably apply those instructions in Teal.

### If We Store Raw Logs
First-order effect:

- More evidence is available.

Second-order risk:

- Repo bloat, privacy risk, slower context loading, and harder review.

### If We Use A Lightweight Incident Log
First-order effect:

- Future Codex instances can learn from failures quickly.

Second-order benefit:

- The system gets better over time without making every thread load raw history.

## Recommended Diagnostic Question
The MacBook should answer:

Is Windows Codex failing primarily because the Codex desktop browser backend is not reliably exposing live Chrome tabs, or because the agent workflow is using Teal inefficiently after Chrome access is available?

The likely answer is both. The rebuild should isolate those layers and prove each independently.
