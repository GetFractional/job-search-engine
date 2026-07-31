# My Way Ahead Private-Alpha Readiness Evidence

Date: 2026-07-20
Candidate: local, synthetic, private prototype
Independent Quality verdict: **PASS for Board review; not shipped**

## Working Candidate

- Local prototype, available only while the laptop QA service is running: [http://localhost:3011/#/](http://localhost:3011/#/)
- Exact source was served from `/Users/mattdimock/Documents/Jobs/Job Search/prototypes/worthward-mobile` on a fresh port.
- Browser surface: Codex in-app browser, used as the safe workaround after terminal Playwright reached Chrome launch and aborted with an environment-level process restriction.
- No public host, external tester, production data, model, analytics, payment, employer action, or application action was connected.

## Board Status

The candidate is ready for founder review because the final local build has current responsive, theme, interaction, state, truth, and accessibility evidence; local verification passes; and Independent Quality returned PASS after the two discovered defects were corrected.

It is not honest to call the candidate shipped or to call the private phone and accessibility gates complete. Physical iPhone Safari, native full Tab order, actual 200 percent browser or OS zoom, runtime reduced-motion, VoiceOver or other screen-reader use, and safe-area or real network behavior remain founder-checkpoint work.

## Controlling Visual Evidence

- [Selected Executive Evidence reference](../../../../output/visuals/my-way-ahead/selected-executive-evidence-timeline.png)
- [Matched 390 x 844 reference comparison](comparisons/reference-vs-current-390x844.jpg)
- [Current 320 x 700 home](current-build/home-system-dark-320x700.jpg)
- [Current 390 x 844 home](current-build/home-system-dark-390x844.jpg)
- [Current 768 x 900 home](current-build/home-system-dark-768x900.jpg)
- [Current 1280 x 900 home](current-build/home-system-dark-1280x900.jpg)
- [Connected timeline start](current-build/home-integrity-timeline-system-dark-390x844.jpg)
- [Connected timeline continuation](current-build/home-integrity-timeline-tail-system-dark-390x844.jpg)
- [Measured responsive receipt](current-build/home-system-metrics.json)

The matched comparison preserves the selected reference's editorial serif display voice, mineral-dark canvas, mint action color, compact navigation, trust boundary, and connected four-step integrity model. The current V2 is an evolved interpretation, not a pixel-identical clone. It gives the first-time explanation, input boundary, sample path, and privacy statement more mobile reading space, so the timeline begins below the first viewport. The two timeline captures prove that the original connected decision model remains present and coherent.

## Responsive Receipt

| Viewport | Body width | Main width | Horizontal overflow | Main scroll height | Minimum visible control |
|---|---:|---:|---|---:|---:|
| 320 x 700 | 320 | 320 | None | 4018 | 44 px |
| 390 x 844 | 390 | 390 | None | 3774 | 44 px |
| 768 x 900 | 768 | 768 | None | 3440 | 44 px |
| 1280 x 900 | 1280 | 1280 | None | 2970 | 44 px |

All four measurements were repeated after the final source correction with `main.scrollTop = 0`. The System setting resolved to Dark. The final captures were taken after the same correction.

## Theme Evidence

- [Home, Light](theme-evidence/home-light-390x844.jpg)
- [Home, Dark](theme-evidence/home-dark-390x844.jpg)
- [Settings, Light](theme-evidence/settings-light-390x844.jpg)
- [Settings, Dark](theme-evidence/settings-dark-390x844.jpg)
- [Settings, System resolving Dark](theme-evidence/settings-system-dark-390x844.jpg)

Light, Dark, and System retain the same routes, controls, labels, boundaries, and decision states.

## Interaction And State Evidence

- [Invalid home input](state-evidence/home-invalid-input-390x844.jpg)
- [Arbitrary input remains unreviewed](state-evidence/integrity-arbitrary-url-boundary-390x844.jpg)
- [Included sample receives reviewed labels](state-evidence/integrity-sample-ready-390x844.jpg)
- [Strategy plan](state-evidence/strategy-plan-390x844.jpg)
- [Score explanation dialog](state-evidence/job-review-score-dialog-390x844.jpg)
- [Application materials](state-evidence/application-materials-390x844.jpg)
- [Exact approval gate](state-evidence/exact-approval-gate-390x844.jpg)
- [Synthetic approval recorded](state-evidence/synthetic-exact-approval-recorded-390x844.jpg)
- [Changed package revokes approval](state-evidence/changed-package-approval-revoked-390x844.jpg)
- [Offline cached brief](state-evidence/radar-offline-cached-390x844.jpg)
- [Qualified-capacity queue](state-evidence/radar-capacity-safe-queue-390x844.jpg)
- [Validation blocks processing](state-evidence/radar-validation-blocked-390x844.jpg)
- [Pricing hypotheses](state-evidence/pricing-hypotheses-390x844.jpg)
- [Active Search checkout with no payment](state-evidence/active-search-checkout-no-payment-390x844.jpg)

The full local journey was exercised from public home through sample onboarding, entered pay and work priorities, role lanes, strategy, opportunity decision, materials, exact payload-bound approval, changed-package revocation, theme settings, safe offline and capacity states, pricing, and no-payment checkout. No external action occurred.

## Defects Corrected

1. **Mobile menu Escape and focus restoration:** `app/MyWayAheadFunnel.tsx:191-204` now closes the public mobile menu on Escape and returns focus to the toggle. Current evidence: [mobile-menu-escape-focus-restored-390x844.jpg](accessibility-evidence/mobile-menu-escape-focus-restored-390x844.jpg).
2. **Arbitrary-input truth boundary:** `app/MyWayAheadFunnel.tsx:256-267,389` now separates reviewed sample checks from arbitrary input. Arbitrary input says `Not checked in this prototype`; only the included sample may say `Checked, details still open`. The regression is locked at `tests/rendered-html.test.mjs:299-307`.

## Accessibility Evidence And Limits

- [Escape closes the mobile menu and restores focus](accessibility-evidence/mobile-menu-escape-focus-restored-390x844.jpg)
- [640 x 450 reflow surrogate](accessibility-evidence/home-200-percent-reflow-surrogate-640x450.jpg)
- Semantic headings, field labels, groups, dialogs, `aria-live`, non-color status text, visible focus styling, reduced-motion CSS, and 44 px minimum controls are present.

The reflow image is a viewport surrogate, not proof of native 200 percent zoom. The environment did not produce reliable native Tab advancement, browser zoom behavior, OS assistive technology, or reduced-motion emulation. Those checks remain explicit founder-review limitations.

## Verification

- `npm test`: PASS
  - TypeScript: PASS
  - Production build: PASS
  - Truth, state, and regression tests: 13 of 13 PASS
- `npm run lint`: PASS
- Browser console after the verified flow: no warnings or errors observed
- Independent Quality: PASS, with the private-phone and native-accessibility limitations above

See [source-and-test-receipt.md](provenance/source-and-test-receipt.md) and [independent-verdict.md](independent-verdict.md).

## Excluded Evidence

- `current-build/rejected-pre-hydration-home-system-390x844.jpg` is retained only as an explicit rejected capture. It was taken before the stored System setting finished resolving to Dark.
- All older screenshot folders tied to the stale port-3004 server bundle are superseded and inadmissible for this gate.

## Provenance Risk

The source and evidence are local and hash-addressed, but the prototype and this evidence set are currently untracked on branch `codex/hospitality-approved-resumes` at repository HEAD `cab77031b5ba5eb5949a91d834808c1cb728d7c9`. That branch contains `origin/main`, but the worktree also contains unrelated user changes. No commit, push, branch switch, stash, or PR was made because mixing this candidate into the unrelated branch would violate clean provenance and user-work preservation.

## Exact Next Gate

Board approval is required before exposing a private phone checkpoint. The proposed zero-cash checkpoint is a temporary same-LAN server started with `npm run qa:lan`, using the Mac's current address from `ipconfig getifaddr en0` and port 3013. Visibility would extend to devices on the same local network, cost is $0, and rollback is stopping the foreground server. This is not an authenticated private host and was not started. The previous `10.0.0.75` address was transient and must not be reused.
