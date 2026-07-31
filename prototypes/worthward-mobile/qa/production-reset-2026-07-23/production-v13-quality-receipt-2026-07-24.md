# Production version 13 quality receipt

Evidence date: 2026-07-24
Release posture: conditional P0 public-alpha foundation
Product commit: `005fde2ddfcbff79149ccefbfeae91450143790e`
Deployed Sites source: `1ad0b4243dae53640060be143db088f05392a3f3`

## Release identity

- Sites version:
  `appgprj_6a6163a6252c8191a7854638ab082d5e~appgver_7698bfb937ec8191b85657c4611a36b1`
- Deployment:
  `appgdep_6a637754384481919f5e3653e226a9d1`
- Primary:
  [https://wayahead.getfractional.co](https://wayahead.getfractional.co)
- Fallback:
  [https://career-evidence-founder-2026.mattdimock.chatgpt.site](https://career-evidence-founder-2026.mattdimock.chatgpt.site)

The Sites deployment reached `succeeded`. Both endpoints returned HTTPS 200
after deployment with HSTS, same-origin opener/resource policies, no-referrer,
nosniff, frame denial, a restricted permissions policy, and a Content Security
Policy that denies framing and object sources.

## Maker verification

| Check | Result |
| --- | --- |
| Typecheck and production build | PASS |
| Full automated suite | PASS, 72 of 72 |
| Lint | PASS |
| Production dependency audit | PASS, 0 vulnerabilities |
| Final lifecycle and rendered regression slice | PASS, 15 of 15 |
| Diff whitespace check | PASS |
| Automated tenant isolation and one-tenant purge | PASS |

## Corrected independent-review findings

1. Setup completion no longer trusts `alpha_active`. Explicit completion
   requires the minimum source, role, Job Standard, and active Job Path records
   plus completed setup step 6. The legacy founder path also requires the
   minimum underlying records.
2. Only an analysis with `validationState === "trusted"` can supply current
   decision scores. Invalidated, pending, and blocked analyses show
   **Recheck this job**, hide Fit, Job Value, and Pursuit Readiness as **Open**,
   change the recommendation to **Recheck needed**, and withhold historical
   open questions.
3. Production version 13 visibly demonstrated the corrected Wpromote state.

Independent Quality rechecked commit `005fde2` and the version-13 production
captures. Verdict: **PASS for both correctness fixes; CONDITIONAL PASS for the
limited P0 checkpoint.** This is not a full Career OS release.

## Current browser evidence

Fresh version-13 Chrome captures:

- [Public mobile](browser-evidence/hosted-production-v13-mobile-public-site.jpg),
  390×844, Light
- [Public mobile menu](browser-evidence/hosted-production-v13-mobile-menu-open.jpg),
  390×844
- [Home](browser-evidence/hosted-production-v13-mobile-home.jpg), 390×844
- [Wpromote recheck state](browser-evidence/hosted-production-v13-mobile-wpromote-recheck.jpg),
  390×844
- [Dark account and appearance](browser-evidence/hosted-production-v13-mobile-dark-account-menu.jpg),
  390×844

The version-13 mobile viewport reported a 390-pixel layout width and 390-pixel
document scroll width. The menu opened with named destinations, closed with
Escape, and returned focus to **Open menu**. Dark resolved to an explicit dark
theme; Light was restored before handoff. One Chrome tab was left at the
primary production URL.

The unchanged responsive and reference slice remains bound to the immediately
preceding version-12 build:

- [Public tablet](browser-evidence/hosted-production-v12-tablet-public-site.jpg),
  768×1024
- [Public desktop](browser-evidence/hosted-production-v12-desktop-public-site.jpg),
  1440×1000
- [Public reference viewport](browser-evidence/hosted-production-v12-reference-viewport-public-site.jpg),
  853×1844
- [Reference and production together](browser-evidence/reference-vs-production-v12-853x1844.png),
  1706×1844
- [Setup step](browser-evidence/local-current-v12-mobile-onboarding-step-1.jpg),
  390×844
- [Resume Studio](browser-evidence/hosted-production-v12-mobile-resume-studio.jpg),
  390×844
- [Cover Letter Studio](browser-evidence/hosted-production-v12-mobile-cover-letter-studio.jpg),
  390×844
- [Data and privacy](browser-evidence/hosted-production-v12-mobile-data-privacy.jpg),
  390×844

Version 13 changed lifecycle and stale-analysis gating only; it did not change
the public responsive layout, Studios, privacy surface, or selected-reference
styling. The red Acrobat bubble visible on some captures is a Chrome extension
overlay, not Way Ahead UI.

## Accessibility and state judgment

The tested slice has semantic headings and regions, labeled controls, explicit
status text, mobile focus restoration, no tested horizontal overflow, and
Light/Dark parity. This is a bounded accessibility check, not a WCAG
conformance claim.

Fresh version-13 evidence covers public, authenticated Home, invalidated
analysis, mobile-menu interaction, focus restoration, and theme change. The
broader version-12 evidence covers setup, Studios, privacy, tablet, desktop, and
reference comparison. Physical iPhone Safari, touch, safe areas, VoiceOver,
actual 200% zoom, popular-browser coverage, and a real second-account production
journey remain unproven.

## Release limits

- Terry may self-register only for a non-sensitive smoke test. Real career data
  remains **NO-GO** until a genuine non-owner account proves setup, tenant
  isolation, export, deletion, and readback.
- Structured multi-role Career Profile review, Career Evidence Library,
  editable setup values, system-suggested Job Paths, stable routes, complete
  pursuit/interview/offer states, and real public Tools/How It Works pages
  remain P1.
- No model, production email, billing, paid data, indexing, broad promotion,
  employer-form action, outreach, reference sharing, submission, or legal
  commitment is enabled or approved.
- Wpromote is on hold. Its prior 84% result is historical and invalidated.

## Rollback

Sites version 12 is the immediate saved rollback candidate. Rollback requires
exact production approval plus migration, deletion-state, and tenant-safety
checks. Production restore can resurrect deleted member data and therefore does
not inherit approval from this release.
