# Accessibility Runtime Receipt

Run date: 2026-07-21
Surface: exact final local production build at `http://127.0.0.1:3011/`
Browser: Headless Chrome 150.0.0.0
Viewport: 390 x 844, DPR 1
Media: System resolved Dark; `prefers-reduced-motion: reduce`
Engine: axe-core 4.11.4
Tags: WCAG 2 A/AA, WCAG 2.1 A/AA, and WCAG 2.2 AA

Each route was scanned after hydration and theme settlement: `data-theme-choice="system"`, `data-theme="dark"`, followed by a 600-millisecond repaint window. Immediate pre-settlement capture is not accepted as evidence because it can observe transient Light-to-Dark paint colors.

## Final automated result

| Route and state | Violations | Incomplete checks | Passing rules |
|---|---:|---:|---:|
| Home, `#/` | 0 | 0 | 23 |
| Settings, `#/settings/appearance` | 0 | 0 | 21 |
| Validation recovery, `#/jobs/opportunities` | 0 | 0 | 21 |
| Loading, `#/jobs/radar` | 0 | 0 | 17 |
| Application review, `#/pursuits/demo/application` | 0 | 0 | 24 |

The first scan found one serious incomplete check: `aria-label="My Way Ahead"` on a roleless brand `div`. The icon was already hidden and the visible text already supplied the accessible name, so the redundant prohibited ARIA attribute was removed. A regression test now protects the visible brand text and rejects the old pattern. The final scan above ran only after the current production build was restarted.

## Manual runtime proof

- Skip-link focus settles at 8 CSS pixels from the viewport top with a 3-pixel outline.
- Enter on the skip link moves focus to `MAIN#main-content` without scrolling away from the top.
- Keyboard Enter opens the mobile menu and changes the trigger accessible name from `Open menu` to `Close menu`.
- Escape closes the menu and restores focus to `Open menu`.
- The 390-pixel keyboard-menu trace has `scrollX = 0` and document width equal to viewport width.
- The smallest visible link or button target in the measured menu state is 44 CSS pixels high.
- System resolved Dark under a dark OS preference, and reduced-motion media evaluated true.

## Exact final source

| File | SHA-256 |
|---|---|
| `app/MyWayAheadPrototype.tsx` | `04762a0b10e74c9387a2766a725ec45f30f26e9d1986f773dbf716406bd684ae` |
| `app/MyWayAheadFunnel.tsx` | `74ac9a3824826a2277911eb8e2a7ffe6585891c1f312b5a24be140c79f70fbc6` |
| `app/globals.css` | `826f2f27957bd0f45619888bc7ff51bb0959e100f9ceaf0002e6382b7a5b7d79` |
| `tests/rendered-html.test.mjs` | `840d16d988552358112e5ea6f9748ee3c16ad525cb8e8a94f71f125b98ed91d1` |

Automated axe results cannot replace physical iPhone Safari, VoiceOver, full screen-reader reading order, native touch and safe-area behavior, actual browser zoom, cognitive-usability review, or cross-browser release testing. Those remain explicit blocks for the Board-selected rebuild and physical-device gate.
