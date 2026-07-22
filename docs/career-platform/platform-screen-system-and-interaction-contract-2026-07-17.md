# Platform Screen System And Interaction Contract

Date: 2026-07-17
Status: product and design authority candidate; implementation not yet authorized

## Leader Decision

The three visual concepts do not represent three alternatives for one page. They represent different parts of one connected product:

- **Option 1, Decision Desk:** retire as a whole screen. Reuse only its ranked-row anatomy and compact Decision Receipt components.
- **Option 2, Radar Brief:** use as the foundation for a dated `Jobs -> Radar Brief` results screen. It is not the generic Jobs home and it is not Radar setup.
- **Option 3, Proof Lens:** use as the foundation for one opportunity's `Review` screen. This is the selected individual-job detail direction.
- **New screen required:** design a separate `Radar Setup` screen for alert criteria, cadence, source health, and notifications.
- **New product area required:** replace the premature `Applications` label with `Pursuits`, which begins when a user chooses to pursue and continues through preparation, submission, interviews, and offers.

The core progression is:

`Career Baseline -> Opportunity Radar -> Radar Brief -> Opportunity Review -> Pursuit -> outcome -> updated Career Baseline`

## What Counts As A Screen

A **screen family** is a page template with a distinct user job, information hierarchy, and route responsibility. Light and dark themes, desktop and mobile layouts, and loading, empty, error, stale, conflict, and success states are variants of that family rather than separate screens.

The launch-ready platform contains **21 screen families**:

- 5 public acquisition and entry screens,
- 3 utility screens,
- 4 Profile screens,
- 4 Jobs screens,
- 4 Pursuit screens,
- 1 Settings family.

They share four shells: public, Profile, Jobs, and Pursuits/account. This is a coherent system, not 21 unrelated designs.

## Global Navigation And Route Model

### Public

```text
/
/how-it-works
/pricing
/diagnostic
/auth
/privacy
/terms
/*
```

### Signed in

```text
/profile/baseline
/profile/experience
/profile/evidence
/profile/role-lanes

/jobs/radar/setup
/jobs/radar
/jobs/saved
/jobs/review/:jobId

/pursuits
/pursuits/:pursuitId/overview
/pursuits/:pursuitId/materials
/pursuits/:pursuitId/application

/settings/appearance
/settings/notifications
/settings/privacy-data
/settings/account-billing
```

Primary signed-in navigation is `Profile`, `Jobs`, and `Pursuits`. `Settings` remains in the account menu. Parent routes redirect to the most relevant child state rather than adding generic dashboards.

An existing `/applications` route may redirect to `/pursuits` during migration. Customer-facing copy should use `Pursuit`, because meaningful work begins before an application is submitted.

## Complete Screen Inventory

| # | Area | Screen family | User job | Essential states | Release |
|---:|---|---|---|---|---|
| 1 | Public | Home | Understand who the product helps and why it is different. | anonymous, returning, CTA error | Paid beta |
| 2 | Public | How It Works | Understand the Radar, Review, proof, and Pursuit model. | normal, expanded objection | V1 |
| 3 | Public | Pricing | Compare the Diagnostic, Radar, and Pursuit offers. | beta open, unavailable, checkout success/error | Paid beta |
| 4 | Public | Career Diagnostic | Receive one useful preliminary baseline or Decision Receipt. | blank, partial, processing, insufficient evidence, result, error | Paid beta |
| 5 | Public | Authentication | Sign up, sign in, verify, reset, or resume. | sign-up, sign-in, reset, verify, conflict, error | Paid beta |
| 6 | Utility | Privacy | Understand data use, retention, export, and deletion. | current policy | Before public beta |
| 7 | Utility | Terms | Understand service terms and limits. | current terms | Before public beta |
| 8 | Utility | Not Found | Recover from an invalid or stale route. | signed-out, signed-in | Paid beta |
| 9 | Profile | Career Baseline | Define what a materially better move means. | first run, incomplete, complete, stale, conflict | Core MVP |
| 10 | Profile | Experience | Import and normalize work history. | empty, importing, parsed, conflict, verified, source failure | Core MVP |
| 11 | Profile | Evidence | Approve proof, metrics, safe wording, and exclusions. | suggested, verified, corrected, excluded, conflict, thin proof | Core MVP |
| 12 | Profile | Role Lanes | Choose career directions the evidence and market can support. | none, suggested, saved, thin evidence, comparison | Core MVP |
| 13 | Jobs | Radar Setup | Define what to monitor, what counts as material, and how to alert. | first setup, valid, invalid, scanning, paused, source-limited, alerts off | Core MVP |
| 14 | Jobs | Radar Brief | See what was reviewed, surfaced, suppressed, and why. | material result, no action, scanning, priority, stale, partial, conflict, learning, error | Core MVP |
| 15 | Jobs | Saved Opportunities | Manage manually added, watched, unresolved, and previously passed jobs. | empty, parsing, duplicate, inactive, watched, passed | V1 |
| 16 | Jobs | Opportunity Review | Decide whether one opportunity deserves a Pursuit. | proof states, recalculating, source unavailable, ready, watched, passed | Core MVP |
| 17 | Pursuits | Queue | See committed work and the most important next actions. | empty, preparing, approval-ready, submitted, waiting, interview, offer, rejected, overdue | Paid beta |
| 18 | Pursuits | Overview | Understand strategy, status, blockers, and one next action. | normal, blocked, stale job, changed proof, overdue | Paid beta |
| 19 | Pursuits | Materials | Create and approve truthful resumes, letters, answers, and supporting assets natively. | generating, draft, unsupported, review-needed, approved, exported, superseded, error | Paid beta |
| 20 | Pursuits | Application | Review the exact package, approve the external action, hand off to the employer site, and verify the result. | incomplete, invalid, ready, approval pending, approved, handed off, submitted, confirmation missing | Paid beta |
| 21 | Account | Settings | Control theme, alerts, privacy, data, account, and billing. | saved, unsaved, permission blocked, destructive confirmation, error | Core MVP |

### Overlays, Not Separate Routes

Use drawers, sheets, or dialogs for:

- add a job by URL or pasted description,
- resolve one proof gap,
- inspect a source,
- preview a correction and its downstream effects,
- choose a pass or watch reason,
- confirm deletion or another destructive action,
- review the exact external-action approval payload.

Do not create a new page merely because a workflow has an intermediate state.

## Opportunity Radar Object Model

**Opportunity Radar** is a saved recurring monitor configured from the user's approved:

- Role Lanes and seniority,
- Career Baseline and material-upside threshold,
- compensation and benefits goals,
- remote, location, travel, and employment preferences,
- company, industry, stage, and mandate preferences,
- freshness, canonical-employer, duplicate, and hard-gate rules,
- source coverage,
- cadence and notification preferences.

For MVP, support **one configurable Radar per user**. Multiple named Radars by lane are a later hypothesis, not launch scope.

Each Radar run produces a **Radar Brief**:

- zero to three opportunities worth attention,
- an honest no-action result when none clear the threshold,
- reviewed, surfaced, suppressed, unresolved, and source-health accounting,
- the reason each opportunity was surfaced,
- the reason material alternatives were not surfaced,
- a dated, versioned record so later learning does not rewrite history.

`Opportunities` is the canonical collection of surfaced, manually added, watched, and resolved jobs. `Radar` is the monitor. `Radar Brief` is one result from that monitor. `Review` is the analysis of one opportunity.

## Jobs Subnavigation

Use:

- `Brief`
- `Opportunities`
- `Radar settings`

The default Jobs destination is contextual:

- new or incomplete user -> `Radar settings`,
- active Radar with a new brief -> `Brief`,
- deep link or unresolved job -> that `Review`,
- no new brief -> latest useful `Brief` with current scan status.

## Exact Role Of The Three Existing Concepts

### Option 1: component source

Keep:

- ranked opportunity-row anatomy,
- compact recommendation and main-risk summary,
- concise alternatives,
- clear visual treatment for the one user-decision group.

Remove:

- the overloaded whole-screen layout,
- decision controls from collection rows,
- repeated `Hold` and `Reject` controls,
- any candidate-proof claim sourced only to an employer's job post.

### Option 2: Radar Brief

Keep:

- dated brief header,
- review accounting,
- ranked results list,
- suppression explanation,
- lightweight selected-opportunity preview on wide screens.

The preview is not the full proof matrix. A row exposes one primary navigation action, `Review opportunity`. On mobile, the preview disappears and selecting the linked title opens the separate Review route. Returning restores list position and focus.

### Option 3: Opportunity Review

Keep:

- opportunity identity and read-only system recommendation,
- requirement-to-proof mapping,
- source lineage,
- main risk,
- career economics and expected effort,
- correction controls,
- evidence sources.

Recommended internal sections are:

- `Summary`
- `Requirements & Proof`
- `Economics & Effort`
- `Company Context`

On narrow screens, requirement rows become expandable cards. The recommendation, main risk, one workflow action, and one user-decision group appear before the evidence detail.

## Interaction Semantics

Four concepts must never be styled or described as interchangeable:

| Concept | Meaning | Example | Side effect |
|---|---|---|---|
| System recommendation | Read-only advice calculated from current evidence and gates. | `Investigate` | None |
| User decision | The user's recorded intent for the opportunity. | `Pursue`, `Watch`, `Pass` | Saves intent only |
| Workflow action | Work performed inside the product to improve or advance the decision. | `Review 4 proof questions`, `Prepare pursuit` | Advances product state only |
| External-action approval | Narrow authorization for an exact action outside the product. | `Approve and submit application to Going` | May act only on the exact displayed payload and destination |

### Recommendation Vocabulary

System recommendations are read-only:

- `Pursue`
- `Investigate`
- `Watch`
- `Pass`
- `Ignore`, reserved for duplicate wrappers, irrelevant noise, or already-resolved items

User decisions are:

- `Pursue`
- `Watch`
- `Pass`

`Investigate` is not a user decision. `Hold`, `Reject`, `Ignore`, and `Defer` do not appear in the primary decision group.

### Opportunity List Row

- Read-only badge: `Investigate`
- Job title link: `Review opportunity`
- Overflow actions: `Watch this opportunity`, `Pass on this opportunity`, `Report incorrect job details`

Do not make both the entire row and nested controls clickable. The title is the link; any trailing chevron is decorative.

### Opportunity Review

- Read-only label: `System recommendation`
- Read-only value: `Investigate`
- Primary workflow action: `Review 4 proof questions`
- One user-decision group, shown once: `Pursue`, `Watch`, `Pass`
- Evidence action: `Report incorrect evidence`

Helper copy:

> Choosing Pursue starts preparation only. Nothing will be submitted or sent without your separate approval.

If the user selects `Pursue` while proof gates remain, save the intent but keep `Review 4 proof questions` as the next action. Confirm:

> Decision saved. No application or message was sent.

### Proof Review

- Primary action: `Save answers and update recommendation`
- Per-gap actions: `Add evidence`, `I don't have this evidence`, `Correct this requirement`
- Tertiary action: `Return without saving`

Do not repeat `Pursue`, `Watch`, or `Pass` on this surface. Show an existing decision read-only. After recalculation, return to Review, preserve focus, and announce what changed.

### Decision Receipt

The Decision Receipt is a versioned record, not another decision console. It shows:

- system recommendation,
- user decision,
- strongest reason,
- main risk,
- proof used, missing, risky, and excluded,
- external-action status,
- the one current next action.

| Current state | Primary action |
|---|---|
| No user decision | The single `Pursue / Watch / Pass` group |
| Pursue with blockers | `Resolve remaining blockers` |
| Pursue and gates clear | `Prepare pursuit` |
| Materials prepared | `Review application package` |
| Package approval-ready | `Review submission` |
| Exact approval screen | `Approve and submit application to {Company}` |
| Watch | `Edit monitoring conditions` |
| Pass | `Return to Opportunities` |

Secondary receipt actions are `Change decision` and `Export receipt`. Never repeat decision controls under the current next action.

## State Separation

Recommendation, user decision, workflow, and external-action state are orthogonal. A change on one axis must not silently rewrite another.

| Axis | Example progression |
|---|---|
| Recommendation | `Investigate -> Pursue` after evidence resolves, with the prior version preserved |
| User decision | `Not decided -> Pursue`, or a later explicit `Change decision` event |
| Workflow | `Unreviewed -> In review -> Proof needed -> Ready to decide -> Preparing pursuit -> Approval ready` |
| External action | `No external action -> Approval required -> Approved for exact action -> Submitted awaiting verification -> Verified or Failed` |

Any change to the external payload or destination revokes the prior approval.

## Native Pursuit And External Boundary

Teal has no role in the customer product, product domain model, runtime, MVP dependency chain, or customer-facing copy. It remains only:

- a named competitor and source of dated competitive observations,
- a temporary tool in Matt's personal job-search case-study workflow,
- an example of an alternative that users may already have tried.

The product owns natively:

- Profile, Career Baseline, Role Lanes, and proof,
- opportunities, Radars, Briefs, Reviews, and decisions,
- Pursuit queue, strategy, status, next actions, and outcome history,
- grounded resume, letter, and application-answer materials,
- exact package review and approval state,
- proof lineage and change invalidation,
- submission handoff and verification state.

The MVP may open or guide the user through the employer's application site after exact approval. It must not claim submission until a visible confirmation or equivalent receipt is captured. It must not depend on any competitor product being available.

## Passive And Active Entry Journeys

### Passive or employed

`Home -> Auth -> Career Baseline -> minimum Experience and Evidence -> Role Lanes -> Radar Setup -> Radar Brief -> Opportunity Review -> Watch, Pass, or Pursue -> outcome -> refreshed Career Baseline`

The user is not forced to complete a perfect career archive. Deeper proof is requested only when it could change a real recommendation.

### Active or urgent

`Diagnostic or Add Job -> paste live job -> confirm minimum Career Baseline -> provisional Opportunity Review -> resolve material proof gaps -> Pursue -> Pursuit Overview -> Materials -> Application review -> exact approval -> employer-site handoff -> verified outcome`

A preliminary Decision Receipt may appear before full Profile completion. No externally usable asset may become approved until its evidence gates pass.

## Returning-User Routing Priority

1. explicit deep link,
2. urgent Pursuit action,
3. unresolved Opportunity Review,
4. incomplete activation,
5. latest Radar Brief.

Do not route an activated user to a generic dashboard of counts.

## Responsive And Accessibility Contract

- Recommendation status is text, not a button.
- `Pursue`, `Watch`, and `Pass` form a labeled radio group with button styling and arrow-key operation.
- Screen readers announce recommendation and user decision separately.
- Recalculation changes use a polite live region.
- Focus is preserved after proof expansion, recalculation, menu dismissal, and return from Review.
- Use real links and buttons, never clickable cards or nested interactive rows.
- Primary mobile controls have at least 44 by 44 CSS-pixel targets.
- At 200 percent zoom, decision controls stack without loss of meaning or function.
- On mobile, only the current workflow action may remain sticky; the full decision group does not.
- Color, icons, hover, and tooltips are never the only way to communicate recommendation, decision, proof, or error state.
- Light and dark themes have semantic and functional parity. New accounts default to `System`; explicit preference persists.

Static screenshots cannot prove keyboard behavior, screen-reader semantics, contrast, responsive reflow, focus restoration, or live announcements.

## What To Design Next

The next coherent visual prototype should cover four screen families:

1. `Radar Setup`, new.
2. `Radar Brief`, refined from Option 2 with material-opportunity and honest no-action states.
3. `Opportunity Review`, refined from Option 3 with the corrected action contract.
4. `Pursuit Application`, new, showing the exact approval and employer-site handoff boundary.

For each, create a dark desktop state and a focused light or narrow-screen counterpart. Also include `Settings -> Appearance` as a small supporting interaction rather than using one of the four main concept slots.

Do not begin production implementation until these screens, their interaction states, and the reconciled Chapter 05 / implementation packet are approved.

## Later Screen Families

Defer until the core decision loop earns them:

- multiple-Radar manager,
- scan history and notification inbox,
- dedicated Evidence Library and version history,
- deep company and market research,
- contacts, referrals, and outreach,
- interview preparation and practice,
- offer and compensation comparison,
- career-capital and Signal Builder planning,
- compensation and market-insight center,
- outcome analytics and recommendation calibration,
- browser-assisted application completion,
- coach, collaborator, and concierge-operator access.

## Acceptance Criteria

This contract is satisfied only when:

1. every visible control is identifiable as recommendation, user decision, workflow action, or external approval,
2. `Pursue`, `Watch`, and `Pass` appear once per decision context,
3. Radar Setup and Radar Brief are separate screens,
4. Option 2 is not described as a generic Jobs home,
5. Option 3 is the individual Opportunity Review foundation,
6. Option 1 is described as a component source rather than a whole screen,
7. Teal is absent from customer architecture and customer-facing copy,
8. the product works without any competitor tool,
9. Pursuit materials and approval state are native,
10. every external action remains exact, separate, revocable, and verifiable,
11. light, dark, desktop, narrow-screen, empty, stale, conflict, and error states are specified,
12. no fixed completion-time promise appears without current user-specific evidence.

## Current Evidence Limits

This document settles the route, screen-family, object, and interaction model. It does not prove visual comprehension, usability, accessibility, source coverage, recommendation quality, payment demand, retention, or implementation feasibility. Those require the next prototype, user tests, the paid beta, and technical verification.
