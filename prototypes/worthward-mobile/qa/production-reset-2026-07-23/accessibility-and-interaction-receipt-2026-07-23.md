# Accessibility and interaction receipt

Date: 2026-07-23  
Surface: exact current local build, verified in Matt's selected Chrome browser  
Scope: public site, authenticated Today, experience onboarding, account/theme controls, mobile navigation, and authenticated Studio

## Verdict

Pass for the tested private-alpha slice. This is a targeted browser and code-contract check, not a claim of full WCAG conformance.

## Responsive and structural checks

| Surface | Viewport | Result |
| --- | ---: | --- |
| Public website | 390 x 844 | One `main`, one visible `h1`, no duplicate IDs, no unlabeled controls, no missing image alt text, no horizontal body overflow |
| Today | 390 x 844 | One `main`, one visible `h1`, no duplicate IDs, no unlabeled controls, no missing image alt text, no horizontal body overflow |
| Experience onboarding | 390 x 844 | One visible `h1`, all form controls have associated labels, no duplicate IDs, no missing image alt text, no horizontal body overflow |
| Today | 768 x 1024 | No horizontal body overflow; career-path overflow has a visible swipe affordance; first opportunity score is visible in the initial viewport |
| Resume Studio | 1280 x 900 | No horizontal body overflow; authenticated navigation and Studio controls render without collision |

## Keyboard and focus

- Public skip link is the first keyboard stop, has a visible 3 px focus outline, and moves focus to `#public-main`.
- Authenticated skip link is the first keyboard stop, has a visible 3 px focus outline, and moves focus to `#main-content`.
- Public mobile menu exposes `aria-expanded`, opens five named destinations, closes with Escape, and returns focus to the menu button.
- Account and appearance menu opens as a named dialog, moves focus to the selected theme radio, closes with Escape, and returns focus to the account button.
- Browser Back and Forward preserve the query-driven authenticated view.

## Touch targets

- The icon-only mobile account control is 46 x 46 px.
- The onboarding file-picker label is 127 x 48 px.
- Experience method labels are 362 x 76 px.
- Theme labels are 90 x 62 px.
- No undersized public navigation or authenticated bottom-navigation target was found in the tested mobile states.

## Sampled text contrast

The checks below use computed foreground and effective solid ancestor background colors.

| Theme and element | Ratio | Required | Result |
| --- | ---: | ---: | --- |
| Public light, primary heading | 16.49:1 | 3:1 | Pass |
| Public light, eyebrow | 7.91:1 | 4.5:1 | Pass |
| Public light, primary CTA | 7.93:1 | 4.5:1 | Pass |
| Authenticated light, primary heading | 16.49:1 | 3:1 | Pass |
| Authenticated light, career-path control | 7.08:1 | 4.5:1 | Pass |
| Authenticated dark, primary heading | 18.62:1 | 3:1 | Pass |
| Authenticated dark, eyebrow | 11.61:1 | 4.5:1 | Pass |
| Authenticated dark, career-path control | 8.79:1 | 4.5:1 | Pass |
| Onboarding light, primary CTA | 7.93:1 | 4.5:1 | Pass |

Light, Dark, and System selections were exercised. System resolved to the browser's dark preference in this run.

## Corrections made during this pass

1. Made the public `main` programmatically focusable so the skip link moves keyboard focus, not only the URL fragment.
2. Increased the icon-only mobile account control to a minimum 46 px width.
3. Removed the out-of-order onboarding sidebar heading while preserving its visual treatment.
4. Increased the file-picker target from 42 px to 48 px high.

## Evidence

- `browser-evidence/public-mobile-light-390x844.png`
- `browser-evidence/public-mobile-menu-open-390x844.png`
- `browser-evidence/app-today-wpromote-mobile-system-390x844-corrected.png`
- `browser-evidence/app-today-tablet-system-768x1024-corrected.png`
- `browser-evidence/app-studio-resume-desktop-system-1280x900.png`
- `browser-evidence/app-onboarding-experience-mobile-light-390x844-corrected.png`

The Acrobat bubble visible in some authenticated screenshots is a Chrome extension overlay, not Way Ahead UI. Chrome also logged five identical extension message-channel errors on the public page; no error from an application source module was observed. Recheck production after deployment.
