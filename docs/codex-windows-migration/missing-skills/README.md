# Missing Codex Skills Export

This folder contains the requested Codex skill directories copied from the Mac setup for Windows Codex setup.

The export excludes auth files, token/secret/session-named files, logs, sqlite/database files, plugin caches, and `.sandbox-secrets`.

## Found Skills

| Skill | Source on Mac |
|---|---|
| `alen-sultanic` | `/Users/mattdimock/.codex/skills/alen-sultanic` |
| `build-from-packet` | `/Users/mattdimock/.codex/skills/build-from-packet` |
| `doc` | `/Users/mattdimock/.codex/skills/doc` |
| `evidence-qa` | `/Users/mattdimock/.codex/skills/evidence-qa` |
| `expert-orchestrator` | `/Users/mattdimock/.codex/skills/expert-orchestrator` |
| `mvp-packetizer` | `/Users/mattdimock/.codex/skills/mvp-packetizer` |
| `product-delivery-os` | `/Users/mattdimock/.codex/skills/product-delivery-os` |
| `project-memory` | `/Users/mattdimock/.codex/skills/project-memory` |
| `skill-maintenance` | `/Users/mattdimock/.codex/skills/skill-maintenance` |
| `startup-mvp-orchestrator` | `/Users/mattdimock/.codex/skills/startup-mvp-orchestrator` |
| `playwright-interactive` | `/Users/mattdimock/.codex/skills/playwright-interactive` |
| `sora` | `/Users/mattdimock/.codex/skills/sora` |
| `screenshot` | `/Users/mattdimock/.codex/skills/screenshot` |

## Missing Skills

None. All requested skill folders were present under `/Users/mattdimock/.codex/skills`.

## Windows Setup Note

Copy these folders into the Windows Codex skills directory that your Codex install uses, then restart Codex if the skills do not appear immediately.

Some scripts are platform-specific. For example, `screenshot` includes both macOS and Windows helper scripts, while browser or Playwright-related skills may still require local Windows dependency setup.
