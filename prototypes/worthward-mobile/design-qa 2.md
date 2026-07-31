# My Way Ahead Prototype Design QA

> **SUPERSEDED 2026-07-21:** Matt's founder review rejected the broad promise, hierarchy, timeline interaction, shell, onboarding, and commercial assumptions. This historical PASS must not be used as current release evidence. Current controlling evidence is `qa/founder-feedback-reset-2026-07-21/README.md` and its independent verdict.

Date: 2026-07-19
Scope: selected public-home visual direction plus the working mobile-first prototype journey
Release boundary: local, synthetic, private prototype only

## Comparison Target

- Source visual truth: `/Users/mattdimock/Documents/Jobs/Job Search/output/visuals/my-way-ahead/selected-executive-evidence-timeline.png`
- Browser-rendered implementation: `/Users/mattdimock/Documents/Jobs/Job Search/prototypes/worthward-mobile/qa/screenshots/home-dark-390x844-final-v7.png`
- Full-view combined evidence, source left and implementation right: `/Users/mattdimock/Documents/Jobs/Job Search/prototypes/worthward-mobile/qa/screenshots/home-source-vs-build-390x844-passed.png`
- Viewport: `390 × 844`
- Route and state: `#/`, dark theme resolved from the system setting, no submitted URL, neutral pre-review Integrity Preview timeline
- Focused-region evidence: not required. The combined artifact preserves each complete `390 × 844` frame at one CSS-pixel scale, and the typography, controls, trust line, timeline nodes, labels, and supporting copy remain readable at original size.

## Findings

No actionable P0, P1, or P2 visual differences remain.

- Fonts and typography: Source Serif 4 provides the editorial display voice and Plus Jakarta Sans provides the compact interface voice. The final three-line headline wrap, hierarchy, weight contrast, line height, letter spacing, and small-label treatment closely match the selected reference. Small timeline copy remains at a readable `12px` equivalent rather than being compressed to the reference's smallest apparent text.
- Spacing and layout rhythm: Header, kicker, headline, description, capture control, primary action, secondary action, privacy statement, section divider, and four-step timeline preserve the reference order and near-equivalent above-the-fold proportions. Touch controls remain at least `44px` high, so minor control-height differences are intentional accessibility constraints.
- Colors and tokens: The mineral-black canvas, warm white type, muted gray support text, restrained mint accent, low-contrast borders, and neutral timeline nodes match the visual direction without gradients, glow, or decorative effects. The light theme preserves the same information order and semantics on a warm-neutral canvas.
- Image and asset fidelity: The source contains no photographic or illustrative raster asset. Visible interface symbols use the Phosphor icon family; no emoji, CSS art, handcrafted SVG, or placeholder imagery replaces a target asset.
- Copy and content: The final screen uses `My Way Ahead`, preserves the decision-first promise, keeps the original timeline concept, and removes customer-facing Teal references and brittle time estimates. Timeline copy was shortened on the public home screen for scanability; the detailed Integrity Preview retains the fuller verification language.
- Interaction and state fidelity: The reference's green first node is treated as a concept-state cue. The implementation intentionally keeps all home nodes neutral until a user starts a review, then completes only the two Integrity Preview steps. Career Baseline and decision steps cannot appear completed before the baseline exists.
- Responsiveness: Browser measurements at `320`, `390`, `768`, and `1280` pixels showed document and main-content scroll widths equal to the viewport, with no horizontal clipping. The `390px` headline matches the source wrap; the `768px` treatment expands to a tablet-appropriate single line rather than inheriting the phone constraint.
- Accessibility: Semantic headings, field labels, radio groups, buttons, skip link, focus styles, non-color state labels, reduced-motion handling, and practical tap targets are present. A separate production screen-reader and 200% zoom certification remains outside this prototype gate.

## Comparison History

### Iteration 1: blocked

- Earlier evidence: `/Users/mattdimock/Documents/Jobs/Job Search/prototypes/worthward-mobile/qa/screenshots/home-source-vs-build-390x844.png`
- [P2] The implementation's hero and trust block were materially taller than the source, pushing the timeline's useful structure below the first viewport.
- [P2] The ready preview visually completed downstream Career Baseline steps that the product could not yet know.
- Fixes: compacted mobile header-to-timeline rhythm while preserving `44px` controls; separated concise public timeline copy from detailed preview copy; made home nodes neutral; limited ready-state completion to the two source-integrity steps.

### Iteration 2: blocked

- Earlier evidence: `/Users/mattdimock/Documents/Jobs/Job Search/prototypes/worthward-mobile/qa/screenshots/home-source-vs-build-390x844-final-v2.png`
- [P2] The headline's second-line wrap and the timeline's vertical density still differed enough to change the selected composition.
- Fixes: applied a phone-only `240px` headline measure, preserved wider tablet behavior, reduced non-interactive mobile gaps, and introduced a compact four-step home timeline with the detailed version retained after submission.

### Iteration 3: passed

- Post-fix implementation: `/Users/mattdimock/Documents/Jobs/Job Search/prototypes/worthward-mobile/qa/screenshots/home-dark-390x844-final-v7.png`
- Post-fix combined evidence: `/Users/mattdimock/Documents/Jobs/Job Search/prototypes/worthward-mobile/qa/screenshots/home-source-vs-build-390x844-passed.png`
- Result: headline wrapping, major-region proportions, control hierarchy, trust treatment, timeline position, typography, palette, icons, and all four timeline steps now preserve the approved direction. Remaining differences are intentional semantic and accessibility constraints, not actionable fidelity defects.

## Browser and Functional Verification

- Browser-rendered screenshot captured from `http://localhost:3002/#/` at `390 × 844`.
- Primary journey exercised: Home → Choose Mode → Integrity Preview → local account simulation → synthetic experience import → Career Baseline → Role Lanes → Strategy Brief → Opportunity Review → Pursue → Pursuit Queue → Materials → exact Application Review → exact approval → Plans → simulated Checkout → Confirmation → Opportunity Radar setup.
- Additional interactions exercised: valid public-link capture, strategy approval gate, return to Strategy Brief from Opportunity Review, dark/light/system theme controls, and neutral-versus-completed timeline states.
- All 20 route states rendered with a non-empty primary heading, no broken images, and no horizontal overflow at `390px`.
- Browser console errors and warnings checked after the final build: none.
- Static verification: ESLint passed; TypeScript/build passed; `8/8` contract tests passed; production dependency audit returned `0` vulnerabilities.

## Follow-up Polish

- [P3] Validate optical sizing and touch comfort on Matt's actual iPhone in a private hosted checkpoint.
- [P3] Run VoiceOver, TalkBack, and 200% zoom checks before any public beta.
- [P3] Replace provisional brand qualifiers only after the Board approves the final name and trademark/domain review.

## Implementation Checklist

- [x] Selected reference resolved and copied into the workspace.
- [x] Reference and final render compared in one normalized artifact.
- [x] P2 composition and semantic-state defects fixed and re-captured.
- [x] Mobile, tablet, desktop, light, and dark behavior verified.
- [x] Main synthetic conversion and decision journey exercised.
- [x] Lint, typecheck, build, contract tests, console, and production dependency audit passed.
- [ ] Private hosted checkpoint and real-iPhone review, pending Board approval.

final result: passed
