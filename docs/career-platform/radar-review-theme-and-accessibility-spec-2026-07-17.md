# Radar And Review Theme, Responsive, And Accessibility Specification

Date: 2026-07-17

Status: design-authority candidate; implementation not authorized

## Product Family

The product should feel like one calm decision system across four connected depths:

1. **Radar Setup:** defines what should be monitored and when the user should be interrupted.
2. **Radar Brief:** reports whether anything deserves attention and why.
3. **Opportunity Review:** shows what the role requires, what the user can prove, what is missing, and what should happen next.
4. **Pursuit Application:** prepares the exact package and keeps external approval separate and visible.

The compact Decision Receipt appears in both depths. It always contains:

- system recommendation,
- user decision when one exists,
- strongest reason,
- main invalidating risk,
- current-career-baseline comparison,
- one next action,
- external-action status.

Do not merge Radar Setup, Radar Brief, full proof review, and application approval into one overloaded screen.

## Existing Visual Language To Preserve

This specification reconciles two existing Job Filter systems instead of inventing a third:

- the black-glass, mineral, restrained-mint system in Foundation Chapter 03,
- the quiet executive workspace, warm-neutral, forest-accent system in the existing light design guide and current CSS.

Plus Jakarta Sans remains the core in-product typeface. Existing spacing, state, and component grammar remain the starting point. Theme changes must not alter content order, control dimensions, evidence meaning, or available functions.

## Semantic Theme Map

| Semantic role | Dark source token | Light source token | Rule |
| --- | --- | --- | --- |
| Page canvas | `canvas-obsidian` `#05070a` | Canvas `#FCFDFB` | Quiet background, never used to signal evidence state |
| Deeper plane | `canvas-depth` `#0a0f14` | App shell `#F5F8F6` | Separates navigation and working area |
| Main shell | `glass-panel` `rgba(16, 22, 30, 0.78)` | Paper `#FFFFFF` | Primary task containment |
| Elevated decision card | `glass-elevated` `rgba(22, 30, 40, 0.84)` | Primary card tint `#EEF5F1` | Reserved for the ranked opportunity and Decision Receipt |
| Secondary group | `glass-muted` `rgba(11, 16, 22, 0.72)` | Secondary soft surface `#F7FAF8` | Alternatives, suppression, and supporting context |
| Primary text | `ink-primary` `#F3F6FA` | Primary ink `#18211D` | Headings, decisions, critical values |
| Secondary text | `ink-secondary` `#C6D0DB` | Secondary ink `#44544B` | Explanation and requirements |
| Muted text | `ink-muted` `#90A0B2` | Muted ink `#6B7C73` | Metadata only, never the sole presentation of material facts |
| Primary action | `accent-mint` `#79D6B4` | Accent forest `#1F5A43` | One primary action per section |
| Provenance link | `accent-mineral` `#8FB1D9` | Existing branded link treatment using the forest family | Always visibly linked and underlined where ambiguity is possible |
| Border | `line-subtle` / `line-strong` | `#D7E1DB` / `#BFCDC4` | Strength indicates hierarchy or selection, not proof quality |
| Warning | `state-missing` | `#FAEEDC` with `#A56522` | Missing or unresolved; include text and icon |
| Risk or exclusion | `state-excluded` / `state-error` | `#F8E8E8` with `#A33A33` | Distinguish excluded from error in text |

Exact foreground/background pairs require automated and manual contrast checks before approval. The token map is direction, not a claim that every combination already passes.

## Settings Contract

Place theme selection in `Settings -> Appearance` as a labeled radio group:

- `Use device setting` or `System`, selected for new accounts,
- `Light`,
- `Dark`.

Requirements:

- honor `prefers-color-scheme` when `System` is selected,
- persist the explicit choice locally and across signed-in devices when the product supports account preferences,
- update without a page reload,
- expose the selected option and group label to assistive technology,
- avoid a hidden keyboard shortcut or icon-only toggle as the only path,
- do not animate a full-screen color wipe,
- never change evidence meaning when the theme changes.

## Radar Setup Information Hierarchy

### Desktop and wide tablet

1. Radar status and one-sentence explanation.
2. Approved Role Lanes and seniority.
3. Career Baseline and material-upside threshold.
4. Compensation, location, travel, employment, company, and mandate preferences.
5. Freshness, source, duplicate, and hard-gate rules.
6. Cadence, notification channels, and current source health.
7. One primary action: `Save and run Radar` or `Save changes`.

### Narrow screen

Use progressive sections in the same order. Keep one save action sticky, show validation at the affected field and in a concise summary, and never hide paused, notification-off, or limited-source status.

For MVP, configure one Radar per user. Do not introduce a multiple-Radar manager until user behavior supports it.

## Radar Brief Information Hierarchy

### Desktop and wide tablet

1. Global navigation and current Career Baseline identity.
2. Radar status: material opportunity, no action needed, active-search priority, or source problem.
3. Review accounting: reviewed, surfaced, suppressed, and unresolved.
4. Ranked opportunity with material difference from the Career Baseline.
5. Compact Decision Receipt.
6. Suppressed and alternative opportunities, collapsed by default.
7. Learning and source-status detail.

The primary ranked opportunity and compact receipt may sit side by side on wide screens. They become a single ordered column before either panel becomes too narrow to read.

### Narrow screen

1. Status and source freshness.
2. Ranked opportunity and why it matters.
3. Main risk.
4. One next action.
5. Career Baseline comparison.
6. Expandable evidence preview.
7. Alternatives and suppression explanation.

Do not lead with a score, table, or metric strip on narrow screens. A score can support the explanation but cannot replace it.

## Opportunity Review Information Hierarchy

### Desktop and wide tablet

1. Sticky opportunity identity and external-action status.
2. Read-only system recommendation, user decision when one exists, main risk, and one workflow action.
3. Requirement matrix with proven, plausible, missing, risky, and excluded states.
4. Source lineage and approved Profile Fact version for each proven item.
5. Career economics, strategic upside, career capital, future optionality, and pursuit effort.
6. Correction history and recommendation changes.

### Narrow screen

Replace the wide requirement matrix with expandable requirement cards. Each card includes:

- exact requirement,
- evidence state in text and icon,
- short rationale,
- source count and source link,
- correction control,
- effect on the recommendation.

Keep the recommendation summary before the evidence cards. Put alternatives after the decision content.

## Required Radar Setup And Brief States

### Material opportunity

Show the opportunity, why it clears the baseline, the main invalidating risk, and one next action.

### No opportunity worth attention

Use calm, explicit language such as `Nothing currently clears your career standard.` Show what was reviewed, when sources were last checked, what would trigger an alert, and the next scheduled check. Do not manufacture urgency or weaken thresholds to avoid an empty state.

### Active-search priority

Emphasize freshness, deadlines, current pursuit stage, and blocking proof work without hiding baseline or integrity checks.

### Partial, stale, or conflicting source

Identify which source failed or disagreed, what conclusions remain safe, and the exact retry or correction action. Do not show a normal recommendation as if evidence were complete.

### Learning after a correction or decision

State what changed, what did not change, and whether ranking or recommendation moved. Never imply that the system learned from an external outcome it did not observe.

## Required Review States

- proven with exact source lineage,
- plausible but not yet externally claim-safe,
- missing,
- risky or conflicting,
- explicitly excluded,
- source unavailable,
- user correction pending,
- recommendation recalculated,
- no external action taken,
- approval-ready pursuit,
- user-declined pursuit.

Every state needs text, an icon from the existing icon library, and a shape or border treatment. Color alone is insufficient.

## Interaction Contract

- One primary action per view.
- Radar Setup changes monitoring criteria; Radar Brief reports one dated run. They are separate screens.
- Radar Brief defaults to progressive disclosure, not full evidence density.
- Opening Review preserves the selected job and scroll/focus context.
- Returning to the Radar Brief restores the user's position.
- Corrections show a preview of the affected facts and decision before commit.
- System recommendation is read-only; user decisions, workflow actions, and external approvals are separate controls.
- User decisions are `Pursue`, `Watch`, and `Pass`, shown once per decision context.
- `Investigate` is a system recommendation or workflow state, not a user decision.
- Choosing `Pursue` saves intent and creates or prepares a native Pursuit; it does not submit or send anything.
- No application, message, employer-site action, or other external action occurs implicitly.
- Every blocking error states what happened, what remains safe, and the next action.
- Public copy does not promise a fixed review duration.

## Accessibility Acceptance Criteria

- full keyboard operation in a logical order,
- clearly visible focus in both themes,
- no focus loss after expanding evidence or applying a correction,
- WCAG AA contrast for normal text, large text, controls, and meaningful graphical objects,
- minimum practical touch target of 44 by 44 CSS pixels for primary mobile controls,
- heading, landmark, table or list, radio-group, status, and dialog semantics,
- programmatic association between each requirement, state, rationale, and source,
- state and recommendation changes announced through an appropriate live region without over-announcing,
- reduced-motion support,
- zoom and text reflow at 200 percent without loss of function,
- expandable mobile cards that retain an understandable reading order,
- plain-language alternatives for score and chart information.

## Visual QA Contract

Static screenshots are targets, not proof of implementation quality. For each theme and breakpoint:

1. render the same realistic data and state as the approved reference,
2. compare reference and implementation at the same viewport,
3. inspect hierarchy, spacing, type, borders, radii, clipping, truncation, and state meaning,
4. test interaction and keyboard behavior separately,
5. run automated accessibility checks,
6. inspect screen-reader output and contrast manually,
7. fix visible and behavioral mismatches,
8. compare again before approval.

Minimum comparison set:

- Radar Setup: light and dark, desktop and narrow,
- Radar Brief material-opportunity: light and dark, desktop and narrow,
- Radar Brief no-opportunity: light and dark, desktop and narrow,
- Opportunity Review: light and dark, desktop and narrow,
- Pursuit Application exact-approval state: light and dark, desktop and narrow,
- partial-source conflict and blocking error,
- theme change from Settings.

## Open Evidence Limits

No current artifact proves:

- final contrast ratios,
- real responsive reflow,
- complete keyboard and screen-reader behavior,
- theme persistence,
- state announcements,
- performance under realistic data volume,
- user comprehension or paid retention.

Those remain prototype and implementation tests. They must not be represented as complete because the screens look polished.
