# Hosted production and custom-domain receipt

Evidence refreshed: 2026-07-24
Release: Sites version 13
Product source: `005fde2ddfcbff79149ccefbfeae91450143790e` on `codex/production-saas-foundation`
Sites source: `1ad0b4243dae53640060be143db088f05392a3f3`

## Live endpoints

- Primary: [https://wayahead.getfractional.co](https://wayahead.getfractional.co)
- Fallback: [https://career-evidence-founder-2026.mattdimock.chatgpt.site](https://career-evidence-founder-2026.mattdimock.chatgpt.site)

Sites version:
`appgprj_6a6163a6252c8191a7854638ab082d5e~appgver_7698bfb937ec8191b85657c4611a36b1`

Deployment:
`appgdep_6a637754384481919f5e3653e226a9d1`

Both endpoints returned HTTPS 200 on 2026-07-24. Responses included HSTS,
same-origin opener/resource policies, no-referrer, nosniff, frame denial,
restricted permissions, and a Content Security Policy that denies framing and
object sources.

## Hosted readback

| Surface | Production result |
| --- | --- |
| Public website | Literal job-outcome promise appears before sign-in |
| Responsive public site | No horizontal body overflow at 390×844, 768×1024, 1440×1000, or 853×1844 |
| Mobile menu | Named destinations; open/close; Escape; focus return |
| Authentication | ChatGPT SSO; member by default; owner role remains configured |
| New/incomplete account | Underlying-record completion guard routes to setup before Home |
| Returning owner | Home loads with the confirmed search goal and active Job Paths |
| Home | State-adaptive hierarchy; empty modules withheld; current jobs do not falsely clear the standard |
| Job detail | Invalidated Wpromote analysis shows Recheck; all historical scores and questions are hidden from current use |
| Appearance | Light default; explicit Light and Dark only |
| Resume Studio | Master/Job Path/job-specific scopes; editable content/design/preview/version/download controls |
| Cover Letter Studio | Editable pursuit-bound surface; no upload or submission capability |
| Input contracts | Role dates use month inputs; skills/platforms use discrete removable tokens |
| Data and privacy | Notice, consent, export, member deletion, owner restriction, deleted state, and explicit restart |
| External actions | No employer-form, upload, outreach, reference, negotiation, or submission endpoint |

## Release verification

- `npm test`: PASS, including typecheck, production build, and 72 of 72 tests.
- `npm run lint`: PASS.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `git diff --check`: PASS.
- Final lifecycle and rendered regression slice: 15 of 15 PASS.
- Fresh D1 migrations `0008` and `0009`: applied in the local verification
  environment.
- Automated tenant proof: one member cannot read or mutate another member's
  records; purging one tenant preserves the other tenant and shared jobs.
- Fresh fake-member proof:
  `terry-test-20260723@example.com` reached setup before Home, started empty,
  completed the delete/restart sequence, and returned to setup.
- A real production Terry session has not yet been tested. Real career-data
  entry remains a conditional gate.

## Current evidence

Fresh version-13 state evidence:

- [Public mobile](browser-evidence/hosted-production-v13-mobile-public-site.jpg), 390×844
- [Public mobile menu](browser-evidence/hosted-production-v13-mobile-menu-open.jpg), 390×844
- [Home](browser-evidence/hosted-production-v13-mobile-home.jpg), 390×844
- [Wpromote recheck](browser-evidence/hosted-production-v13-mobile-wpromote-recheck.jpg), 390×844
- [Dark account and appearance](browser-evidence/hosted-production-v13-mobile-dark-account-menu.jpg), 390×844

Unchanged responsive and product surfaces from the immediately preceding
version-12 build:

- [Public tablet](browser-evidence/hosted-production-v12-tablet-public-site.jpg), 768×1024
- [Public desktop](browser-evidence/hosted-production-v12-desktop-public-site.jpg), 1440×1000
- [Public reference viewport](browser-evidence/hosted-production-v12-reference-viewport-public-site.jpg), 853×1844
- [Reference and production together](browser-evidence/reference-vs-production-v12-853x1844.png), 1706×1844
- [Current setup step](browser-evidence/local-current-v12-mobile-onboarding-step-1.jpg), 390×844
- [Resume Studio](browser-evidence/hosted-production-v12-mobile-resume-studio.jpg), 390×844
- [Cover Letter Studio](browser-evidence/hosted-production-v12-mobile-cover-letter-studio.jpg), 390×844
- [Data and privacy](browser-evidence/hosted-production-v12-mobile-data-privacy.jpg), 390×844

The red Acrobat bubble visible in several authenticated captures is a Chrome
extension overlay, not Way Ahead UI.

## Reference judgment

The matching 853×1844 comparison preserves the selected Executive Evidence
reference's editorial serif hierarchy, restrained green action color, thin
borders, explicit privacy language, and deliberate grouping. It intentionally
replaces the rejected dark timeline and job-link-first information architecture
with the founder-approved light, literal, outcome-first Career OS direction.

## Boundaries

This is a limited P0 checkpoint, not the completed Career OS. Structured
multi-role Career Profile review, Career Evidence Library, stable member routes,
complete Pursuit/interview/offer states, real public tool pages, model-powered
generation, recurring job monitoring, production email, independent OAuth,
billing, paid data, public indexing, and broad promotion remain unimplemented
or unapproved.

Physical iPhone Safari, cellular behavior, touch, safe areas, VoiceOver, actual
200% zoom, and a real second non-owner production account remain user/device
checks. Way Ahead is a provisional name without legal clearance.

## Rollback

Sites version 12 remains the immediate saved rollback candidate. Version 13
adds no migration, but rollback must still verify migration compatibility and
deletion state. Production restore requires exact approval because it can
resurrect deleted member data.
