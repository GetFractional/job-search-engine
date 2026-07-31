# Fresh Accessibility Evidence Receipt

Date: 2026-07-21
Candidate: exact corrected production build at `http://localhost:3011/#/`
Primary surface: Codex in-app Browser

## Fresh rendered checks

At 390 x 844, the public home and the application-review route each returned:

- one H1 and one main landmark;
- `lang="en"`;
- no unnamed visible interactive controls;
- no unlabeled visible inputs;
- no visible interactive target below 44 x 44 CSS pixels;
- no missing image alt attributes;
- no duplicate element IDs; and
- no horizontal overflow.

On Career Paths at 390 x 844, the back control, all three evidence disclosures, and all six path controls measured exactly 44 CSS pixels high. The accepted screenshot is `screenshots/career-paths-44px-targets-system-dark-390x844.jpg`.

At 320 x 700, the public home reported a 320 px client width, a 320 px scroll width, and one H1. The accepted screenshot is `screenshots/home-system-resolved-dark-320x700-fresh.jpg`.

Fresh accepted state evidence also covers:

- empty/selective result: `screenshots/state-empty-no-action-system-dark-390x844.jpg`;
- exact approval boundary: `screenshots/state-exact-approval-unapproved-system-dark-390x844.jpg`;
- approved but not handed off: `screenshots/state-approved-not-handed-off-system-dark-390x844.jpg`; and
- approval revoked after a package change: `screenshots/state-revoked-after-package-change-system-dark-390x844.jpg`.

## Source-backed safeguards

The passing regression suite verifies the skip link, dialog semantics, Escape handling, focus restoration, 44 px minimum targets, 320 px media behavior, reduced-motion override, full-row focus treatment, and approval separation. The stylesheet uses `env(safe-area-inset-bottom)` for mobile navigation and action placement.

## Boundary

This is fresh browser, source, and automated accessibility evidence, not an axe-zero or native-device certification. The in-app Browser has a read-only page-evaluation boundary, so axe was not injected and standalone Playwright was not substituted. Physical iPhone Safari, native VoiceOver, actual browser zoom at 200 percent, cellular touch, and device-level reduced-motion behavior remain Board-visible device-validation risks before any external alpha.
