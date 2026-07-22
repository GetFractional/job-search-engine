# Browser QA Receipt

Date: 2026-07-21
Approved surface: Codex in-app Browser
Current candidate: `http://localhost:3011/#/`

## Responsive and theme checks

The final product source was measured at 320 x 700, 390 x 844, 768 x 900, 1280 x 900, and 1440 x 900. Each evaluated route reported one H1 and no horizontal overflow. Accepted image dimensions were read back from disk; incomplete, letterboxed, duplicated, and viewport-race captures were moved to excluded folders.

Light and Dark were captured at phone, tablet, and desktop sizes. System was selected through the Settings UI and captured at 320, 390, 768, and 1280; the host preference resolved it to Dark.

## Journey checks

- The homepage leads with `Find better-fit jobs for me`; pasted-job checking remains secondary.
- The starting-intent choice advances without a duplicate Continue action.
- The local account simulation uses synthetic data and does not persist a password.
- Resume upload exposes a full-row local file target. LinkedIn, manual history, and voice are marked not connected.
- Job Standard changes update the visible summary and commute uses miles.
- Career Paths render as compact independent cards with Ready now, Credible now, and Build one bridge states; full-row controls expose visible focus.
- One plan action opens the Find Jobs list rather than an arbitrary job detail.
- Fixture jobs remain behind a persistent `Private-alpha sample jobs` notice and cannot be reached as personalized results before setup is complete.
- The public mobile account menu keeps Today, Find Jobs, Pursuits, Career Profile, and Settings together.
- The job review says `Sample posting checked`, keeps the recommendation first, and preserves missing-proof language.
- The independent job check shows separate cards, a truthful loading state, and a ready state with unresolved facts.

## State checks

Fresh files exist for loading, offline, capacity, budget, partial, conflict, validation, and general error. Each route kept the prior trusted state intact in its copy, reported one H1, and had no horizontal overflow. The validation screen now explains that the latest check could not be trusted instead of presenting an unexplained failure.

## Focus and target checks

- A Settings radio received native keyboard focus; the complete row displayed the visible focus treatment.
- Representative 390 px screens were checked for visible interactive dimensions and horizontal containment.
- Native 20 px radio and checkbox inputs sit inside labels measuring 56 to 138 px high and 296 to 342 px wide. The local file input sits inside a 342 x 138 px label. These wrapper labels are the actual hit areas.
- Home, intent, import, Job Standard, Career Paths, and Settings each contained one H1.
- The final in-app Browser log readback contained no warnings or errors.
- Regression tests still cover skip-link focus, modal semantics and Escape handling, menu focus restoration, disabled-action explanation, and approval separation. Those are source/test claims, not substituted fresh screenshots.

## Accessibility boundary

Fresh axe execution was not possible through the approved in-app Browser because its page-evaluation boundary is read-only. Standalone Playwright was not substituted. This receipt records browser semantics, target measurement, focus evidence, JSX lint, and regression tests, not an axe-zero certification.

Still unproven: physical iPhone Safari, native safe-area behavior, touch over cellular, native VoiceOver, actual 200 percent zoom, and device-level reduced motion.
