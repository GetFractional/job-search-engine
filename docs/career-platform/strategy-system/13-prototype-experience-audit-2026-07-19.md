# 13 Prototype Experience Audit

## Decision

Freeze the first full-funnel prototype as the comparison baseline. It is visually promising and functionally coherent enough to support research, but it is not ready for beta or another founder-quality handoff.

The prior visual QA answered a narrower question: whether the implemented Home screen resembled the selected Executive Evidence reference at matched viewports. It did not establish that the full 20-step customer and commercial journey was easy to understand, use, or buy. Both findings can be true. Visual fidelity passed its targeted checks; whole-journey experience quality did not.

The complete screenshot-led audit is stored at:

- [`prototypes/worthward-mobile/qa/ux-audit-2026-07-19/audit.md`](../../../prototypes/worthward-mobile/qa/ux-audit-2026-07-19/audit.md)

## Release-blocking findings

1. The job-entry field has a confirmed nested-border CSS defect caused by selector specificity.
2. Mobile spacing and type were compressed to preserve an above-the-fold reference composition.
3. The homepage does not plainly explain that the product finds jobs, compares them, explains fit, and helps with the next step.
4. Consumer copy exposes internal AI, policy, and evidence vocabulary too early.
5. The Home job-review CTA routes to Choose Mode instead of the promised Integrity Preview.
6. Onboarding lacks progress, consistent Back and Edit control, and generalizable user-created inputs.
7. Baseline and role-direction data are hard-coded around Matt instead of template-driven for multiple personas.
8. Free, recurring software, one-time review, and guided service are mixed into one pricing and fulfillment flow.
9. Opportunity Review exposes too many technical layers before the primary decision.

## What still works

- The selected editorial visual direction is worth preserving.
- The connected Integrity Preview timeline is distinctive and understandable when written plainly.
- The separation of recommendation, user decision, workflow work, and exact external approval remains a strong safety model.
- Opportunity Review contains the right raw ingredients for a differentiated decision product.
- Light, Dark, and System theme intent is correct.
- The local prototype truth boundaries, synthetic fixtures, reset behavior, source-kind controls, and exact approval binding remain useful foundations.

## Technical verification

- Full customer and commercial route sweep captured at 390 by 844.
- `npm test` passed typecheck, production build, and all 8 rendered-HTML tests.
- `npm run lint` passed.
- One browser console error was observed for a missing favicon.

The passing tests do not cover copy comprehension, mobile reading rhythm, pricing comprehension, route-promise alignment, assistive-technology performance, or moderated-user behavior. The next acceptance system must add those gates instead of weakening the existing truth and approval tests.

## Governing correction

The next build is the **Prototype Comprehension and Experience Reset** defined in Chapter 14. It preserves the selected visual identity and rebuilds journey order, plain language, mobile spacing, progressive disclosure, persona-aware inputs, offer architecture, fulfillment paths, and release QA.
