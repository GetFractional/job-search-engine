# Phase 2 Career Opportunity Platform Authority Packet

> **Current authority amendment, 2026-07-29:** This unpromoted packet remains useful design history but does not control the current portfolio. The [Way Ahead company operating system](../company-os/my-way-ahead-company-operating-system-2026-07-20.md) and Strategy Chapters 16 through 19 now govern. Way Ahead is an owned multi-user SaaS, Matt founder-dogfoods the same member contract rather than a separate `Case Study Zero`, Terry is one consented independent early tester, and work in progress is adaptive and evidence-based rather than permanently capped. Current truth, tests, source-bound product state, and reserved Board gates supersede the historical prototype and concierge assumptions below.

Status: decision-complete staging packet, not yet merged authority
Date: 2026-07-16
Canonical base: `origin/main@2a1b2b4f5ee808cb17def805a02516b29271d868`
Product owner: Matt Dimock
Delivery owner: one implementation writer after visual selection and packet approval

## 1. Objective

Extend the existing proof-first Job Filter foundation into a resource-conscious, recurring career-opportunity product that helps a user:

1. understand which role directions are credibly available,
2. continuously find materially better opportunities,
3. decide which opportunities deserve effort and why,
4. prepare truthful, reviewable application work,
5. learn from market outcomes over time.

Matt Dimock is the first measurable customer. His immediate search must generate the evidence used to validate the product, not run as a separate side project.

## 2. Authority And Reconciliation Rules

### 2.1 Controlling order

1. User corrections and current live evidence.
2. Canonical Job Filter `origin/main@2a1b2b4` Foundation Series chapters 01 through 04.
3. This packet once reviewed and intentionally promoted.
4. Candidate strategy from `27580ba`, used only where this packet adopts it explicitly.
5. Candidate D2 HTML repair from `4765398`, used as a design reference only until re-rendered and visually verified.
6. Older implementation, research, prototypes, and stashes as non-authoritative evidence.

### 2.2 Prohibited integration moves

- Do not merge or cherry-pick `27580ba`.
- Do not import its `src/**`, root extension bundle, package manifests, runtime configuration, or generated evidence as implementation authority.
- Do not overwrite current-main governance or Foundation Series files wholesale.
- Do not treat the historical D2 PNG as proof of the latest D2 HTML.
- Do not resume UI implementation before three current visual directions are shown and Matt selects one.
- Do not treat any competitor product as an assumed API, stable integration, or customer-product dependency.

### 2.3 Reference-only whitelist

From `27580ba`:

- `docs/product/PRD_V3.md`
- `docs/product/product-os/**`
- `docs/product/foundation-series/05-activation-and-core-app.md`
- `docs/product/foundation-series/05-activation-architecture-spec.md`
- `docs/product/packets/868hukucf-fs5s3c1-activation-copy-system.md`
- `docs/product/packets/868hukucf-fs5s6-user-system-definition.md`
- `docs/product/packets/868hukucf-fs5s7-desktop-screen-contract.md`
- relevant FS6 implementation packets after a separate file-level audit

From `4765398`:

- `artifacts/figma/redesign-lock/10-activation-desktop.html`

Supporting evidence only:

- `docs/product/foundation-series/research/**`
- `artifacts/competitive-intel/2026-04-23/**`
- `docs/strategy/alen-sultanic/**`

## 3. Reconciled Product Thesis

### 3.1 Category

Internal category: **Career Opportunity Intelligence**.

Plain-language public category: **an always-on career decision platform**.

Customer-facing explanation:

> Compare real opportunities against your current role, earning goals, evidence, and constraints. Know what to pursue, pass, or watch before you spend hours applying.

Job Filter is not positioned as another AI career copilot, resume builder, job tracker, job board, or auto-apply product. It owns the decision layer between a person's verified experience and the effort of pursuing a job.

Continuous monitoring, match scores, and `why this job` explanations are now category table stakes. Job Filter must differentiate through the combination of proof lineage, opportunity integrity, current-career economics, transparent uncertainty, and user-controlled decisions.

### 3.2 Core promise

> Find the next move worth making.

The promise extends, but does not replace, the current-main truth-first foundation. It preserves fewer better-fit roles, reusable Profile truth, inspectable reasoning, and review before send.

Trust contract: `Verified sources. No invented claims. No mass apply. You approve every external action.`

### 3.3 Primary economic beachhead

Primary first customer: **Ambitious Pathfinder**.

Characteristics:

- employed or underemployed,
- usually 7 to 20 years of experience,
- roughly $90,000 to $250,000 current or target compensation,
- more than one plausible role lane,
- high opportunity cost from pursuing the wrong job,
- wants to stay aware of the market without running a full-time search,
- skeptical of generic AI, keyword scores, and mass application tactics.

Secondary launch customers:

- Active Optimizer: searching now and overwhelmed by fragmented tools.
- Focused Climber: knows the target lane and wants a better employer or package.
- Career Reframer: needs a defensible adjacent move from broad experience.

Later audience:

- Signal Builder: needs to build evidence before becoming competitive.

The brand may remain broad, but beta recruitment and activation must optimize for the Ambitious Pathfinder and Active Optimizer first.

## 4. Product Modes And Recurring Loop

### 4.1 Opportunity Radar

Purpose: maintain career readiness while the user is employed or not actively applying.

Required behaviors:

- monitor credible opportunities against verified role lanes and constraints,
- benchmark opportunities against the user's current compensation, logistics, career capital, and future optionality,
- normalize canonical employer, source, freshness, compensation, and logistics,
- suppress duplicates and low-confidence noise,
- alert only when the opportunity is materially better or strategically informative,
- produce a short weekly opportunity brief,
- produce a useful no-action brief when nothing clears the material-upside threshold,
- show why each surfaced job is relevant,
- learn from `Pursue`, `Watch`, `Pass`, correction, and observed outcome signals.

Opportunity Radar is a saved monitor, not a vague page or a new top-level navigation item. `Radar Setup` defines Role Lanes, Career Baseline thresholds, compensation, logistics, company preferences, sources, freshness rules, hard gates, cadence, and notifications. Each run produces a dated `Radar Brief`. Both live inside `Jobs`.

### 4.2 Pursuit Sprint

Purpose: convert an active opportunity into a safe, high-quality pursuit.

Required behaviors:

- deepen the role and company research,
- produce a Decision Receipt,
- preserve the read-only system recommendation separately from the user's `Pursue`, `Watch`, or `Pass` decision,
- prepare reviewable assets from approved Profile proof,
- manage the Pursuit natively through exact package review and employer-site handoff,
- stop before external submission until the user approves the exact action,
- capture screens, interviews, objections, rejections, offers, and corrections.

Sprint is a paid mode spanning the existing `Review` surface and the native `Pursuits` area. It is not a competitor-tool workflow.

### 4.3 Recurring loop

`Verify Profile -> define Role Lanes -> monitor -> normalize -> rank -> explain -> decide -> prepare -> pursue -> observe outcomes -> improve Profile and thresholds`

The loop must remain useful after a user gets a job. A new role changes compensation, skills, evidence, preferred lanes, and future opportunity thresholds; it does not end the product relationship.

## 5. Signed-In Information Architecture

### 5.1 Top-level IA

- `Profile`
- `Jobs`
- `Pursuits`

This preserves the candidate Chapter 05 decision and current visual/product-system expectations.

### 5.2 Route responsibilities

| Surface | Canonical user job | Phase 2 addition |
|---|---|---|
| `Profile` | Verify reusable work history, proof, constraints, and Role Lanes. | Add career thresholds and opportunity preferences without turning Profile into a long form. |
| `Jobs` | Discover, capture, normalize, compare, watch, and pass on opportunities. | Radar Setup, Radar Brief, Opportunities, and individual Review are separate surfaces. |
| `Review` | Decide whether one opportunity deserves active work. | Show a complete Decision Receipt. |
| `Pursuits` | Manage opportunities the user intentionally chooses to pursue, before and after submission. | Prioritize next action and outcome learning over stage counts. |
| `Pursuit Workspace` | Execute one active pursuit with grounded context and native assets. | Keep strategy, materials, exact approval, employer-site handoff, interview, follow-up, and outcome evidence connected. |

### 5.3 Returning-user routing

- Incomplete Profile: return to the next unresolved verification state.
- Verified Profile but no Role Lane: return to Role Discovery.
- Activated Radar with no urgent work: return to the latest useful `Radar Brief`.
- Saved job awaiting a decision: return to its `Review` surface.
- Active Pursuit with a due next action: return to `Pursuits` with that item selected.

Do not route an activated user to a generic dashboard of counts.

## 6. Activation Contract

### 6.1 Activation event

A user is activated when all of the following are true:

1. minimum Profile history is verified for reuse,
2. at least one Role Lane is approved,
3. compensation, location, travel, employment type, and hard constraints are captured,
4. three credible opportunities are visible or one high-confidence opportunity is deeply reviewed,
5. the user completes one `Pursue`, `Watch`, or `Pass` decision,
6. the system explains the decision using visible evidence and uncertainty.

### 6.2 First-session win

The first session should eliminate weak pursuits and surface at least one defensible next action. It should not require a perfect career archive.

### 6.3 First-week win

At least one of the following:

- a stronger application becomes approval-ready,
- an irrelevant role is rejected before wasted asset work,
- a credible new lane or employer is discovered,
- a compensation or evidence gap is clarified,
- the user receives a useful market response.

## 7. Truth And Proof Contract

### 7.1 Required state families

Do not collapse different proof objects into one generic confidence field.

Truth state for imported or user-authored facts:

- imported,
- conflict,
- verified,
- excluded,
- unsupported,
- corrected.

Requirement assessment for one job:

- proven,
- plausible,
- missing,
- risky,
- disqualifying,
- excluded.

Output rationale:

- used,
- missing,
- excluded.

Asset state:

- draft,
- needs review,
- approved,
- exported,
- superseded,
- unsupported.

Suggested or inferred material may exist as working analysis, but it may not enter approved truth or external assets without an explicit transition and lineage record.

### 7.2 Lineage

- Approved Profile proof may feed opportunity analysis and assets.
- Suggested or inferred content may not silently become approved truth.
- Every externally usable metric must retain its source, confidence, ownership, and safe phrasing.
- User corrections outrank generated interpretation.
- Job-source corrections must update canonical employer, duplicate state, freshness, and downstream reasoning.

### 7.3 Decision Receipt

Every reviewed job must show:

- recommended decision,
- primary Role Lane and secondary tags,
- current-career baseline and the opportunity's material improvement over it,
- strategic upside,
- career economics, career capital, and future optionality,
- mandate fit,
- compensation and logistics,
- source and freshness confidence,
- canonical employer and duplicate status,
- opportunity-integrity state,
- requirements proven,
- requirements plausible but not proven,
- missing evidence,
- risky or disqualifying requirements,
- proof used and excluded,
- material uncertainty and unresolved unknowns,
- expected pursuit effort,
- one recommended next action,
- user correction and override affordance.

An overall fit score may summarize the analysis, but it may never replace the component evidence.

## 8. Opportunity Ranking Contract

Conceptual model:

`material upside over the current baseline x evidence confidence x hiring plausibility x opportunity integrity x freshness x compensation/logistics fit x career capital and optionality / pursuit effort and risk`

The implementation must expose the underlying dimensions rather than pretending the result is objective precision.

Hard gates:

- terminal or already-applied state,
- unresolved canonical-employer mismatch,
- duplicate wrapper of a submitted role,
- inactive source,
- compensation below the user's hard floor unless intentionally overridden,
- incompatible location, authorization, or travel constraint,
- older than 60 days without unusually strong active-hiring evidence.

Freshness handling:

- 0 to 30 days: preferred,
- 31 to 60 days: stale-risk unless active-hiring evidence exists,
- over 60 days: default pass or archive,
- public visibility alone is not proof of active staffing.

## 9. Native Product And External-Action Boundary

### 9.1 Product-owned capability

The customer product owns:

- verified Career Baseline, Profile proof, and Role Lanes,
- canonical job identity, integrity, freshness, and source health,
- Opportunity Radar configuration and dated Radar Briefs,
- explainable opportunity ranking, Reviews, Decision Receipts, and user decisions,
- proof lineage, corrections, and change invalidation,
- native Pursuit queue, strategy, materials, exact package review, and outcome history,
- quality-weighted learning from observed outcomes.

### 9.2 External execution

- A user decision never authorizes an external action.
- An external action requires a separate, exact, revocable approval naming the payload and destination.
- The MVP may use copy, download, upload, or a guided employer-site handoff after approval.
- Submission remains `awaiting verification` until a visible confirmation or equivalent receipt is captured.
- Any payload or destination change revokes the prior approval.
- Unreadable external state remains `unknown`; it is never inferred as success.

### 9.3 Teal scope

Teal is a named competitor, a source of dated competitive intelligence, and a temporary tool in Matt's personal case-study workflow. It is not part of the customer product, domain model, runtime, MVP dependency chain, or customer-facing copy. The product must work when Teal and every other competitor tool are unavailable.

## 10. MVP Scope

### 10.1 Must ship

1. Profile D2 verification vertical slice.
2. Role Discovery and Role Lanes.
3. Compensation, logistics, and hard-constraint thresholds.
4. Manual job URL capture and at least one monitored-source ingestion path.
5. Canonical employer, duplicate, active-state, and freshness controls.
6. Requirements matrix with proven, plausible, missing, risky, disqualifying, and excluded states.
7. Ranked `Jobs` brief with explainable reasoning.
8. Mandatory `Review` and Decision Receipt.
9. Separate read-only recommendation, user-decision, workflow-action, and external-approval states.
10. Minimal native Pursuit queue, strategy, next-action, and outcome log.
11. Native grounded materials and exact application-package review.
12. Provider-neutral employer-site handoff and submission verification state.
13. Decision and outcome capture.
14. Weekly Radar Brief for activated users.

### 10.2 Explicitly excluded from MVP

- proprietary high-volume job marketplace,
- broad resume-template marketplace or advanced design engine,
- hidden or automatic application submission,
- mass application automation,
- dozens of ATS integrations,
- generic chatbot as the primary interface,
- enterprise-scale application CRM, contact database, or collaboration suite,
- final brand rename before naming gates are satisfied,
- unsupported salary, response, interview, or placement guarantees.

## 11. Monetization Hypotheses

These are test ranges, not locked pricing:

| Offer | Intended value | Test range |
|---|---|---:|
| Career Opportunity Diagnostic | Verified lanes, gaps, first credible opportunities. | Free |
| Opportunity Radar | Ongoing monitoring, weekly ranked brief, meaningful alerts. | Test $24 per month first; retain $19 to $29 as the learning band |
| Pursuit Sprint | Deep decisions, grounded pursuit workflow, outcome tracking. | Test $99 for 30 days first; retain $79 to $149 as the learning band |
| Guided Pursuit Sprint | Concierge research and approval-ready preparation. | First five at $399, then test $499; retain $299 to $599 as the learning band |

Rules:

- Test demand before automating the full workflow.
- Do not paywall export of the user's own verified data.
- Do not use fake scarcity, guarantees, shame, or cancellation friction.
- Recurring pricing is valid only if Radar continues producing useful decisions after the first search.

## 12. Metrics And Case Study Zero

### 12.1 North Star

`qualified interviews per active search cycle`

Quality must remain more important than application volume.

### 12.2 Activation metric

`verified Profile + approved Role Lane + first evidence-backed opportunity decision`

### 12.3 Radar leading indicators

- percentage of surfaced opportunities reviewed,
- percentage of recommendations corrected,
- weekly high-confidence decisions,
- number of materially better opportunities found,
- false-positive and false-negative rate,
- time saved per decision,
- return rate after the first application cycle.

### 12.4 Pursuit Sprint measures

- time from discovery to decision,
- time from decision to approval-ready assets,
- source and freshness coverage,
- application-to-screen rate,
- screen-to-interview rate,
- interview-to-offer rate,
- compensation and benefits improvement,
- objection and rejection themes,
- unsupported-claim incidents,
- user confidence in the explanation.

### 12.5 Matt baseline

The first case study starts from a fragmented, high-volume environment: many bookmarked jobs, inconsistent freshness and compensation data, broad role-lane possibilities, and repeated manual reconciliation across Teal, employer ATS pages, Gmail, Calendar, and local source files.

Initial Decision Receipt validation:

- TextNow, Head of Lifecycle Marketing: **Pass and archive as filled**. The legacy Lever job and application still render, but the role is absent from TextNow's new canonical Greenhouse board, the old Lever board is retired, and the selected hire publicly announced starting. This is a freshness and canonical-source test case, not an application target.
- Going, Director, Lifecycle Marketing: **first active pursuit candidate at 85/100**. The role remained present on Going's official role page and careers index on July 17, 2026, and the prior Ashby feed receipt records a July 10, 2026 publication date. Its public salary statement starts at $175,000 plus equity; no public upper bound is proven.

The second active pursuit candidate must be re-verified after Going rather than inherited from an older shortlist.

No application or Teal mutation is authorized by this packet.

## 13. Brand And Naming Status

### 13.1 Working status

Keep `Job Filter` as the repository and working product name until the product promise, beta wedge, free boundary, and launch experience are stable.

### 13.2 Naming criteria

A future name must score well on:

- clarity,
- trusted guidance,
- upward-mobility association,
- differentiation from Teal, Huntr, Rezi, Simplify, Jobright, and Careerflow,
- extensibility beyond active job search,
- memorability and pronunciation,
- trademark and company-name risk,
- domain practicality,
- avoidance of auto-apply, hustle, surveillance, or guaranteed-outcome associations.

### 13.3 Product language available now

- `Opportunity Radar`
- `Weekly Opportunity Brief`
- `Pursuit Sprint`
- `Decision Receipt`

These are functional labels, not approved company names. Keep `Career Graph` as internal architecture; call the user-facing comparison object the `Career Baseline`.

Current competitors now use `job radar`, `career intelligence`, `always-on`, evidence graphs, passive monitoring, and next-best-action language. These labels may explain the product but must not be claimed as unique. The differentiated object is the auditable Decision Receipt and the decision contract behind it.

### 13.4 Preliminary collision result

A live web screen on 2026-07-16 and 2026-07-17 found active adjacent products using or closely approximating most of the first territory names, including Bearing, CareerVector, CareerSignal, RoleSignal, CareerPulse, RoleRadar, CareerScope, CareerLift, Rolewise, CareerProof, ProofPath, Proofline, NextArc, and Opportunity Lens.

None of the first 20 candidates advances as a finalist. Keep `Job Filter` as the working repository name. The preliminary screen is not legal clearance.

A second expert round produced one candidate strong enough to advance: `Worthward`. Its pronunciation and spelling risk is material, so it must pass an audio-only spelling test, category-comprehension test, emotional-safety test, and delayed-recall test before formal clearance. `ConsiderNext` and `Nextworthy` are backups, not equal finalists. If Worthward fails, run another creative round rather than forcing a backup. None has completed USPTO, company-name, domain, app-store, social-handle, or legal review.

## 14. UX And Visual Direction

### 14.1 Governance reset

Current main and the later D2 work use materially different visual systems. Current main favors a warm-neutral, forest-accent editorial workspace; the later D2 direction uses a dark mineral / black-glass shell. The later direction has stronger implementation evidence but was never merged and also drifted from its own typography and glow restrictions.

Treat dark mineral / black-glass as the leading dark-theme baseline, not as the only theme or silently approved authority. The product must also support a light theme using the current warm-neutral and forest-accent language. Both themes must carry forward calmness, restraint, scanability, and proof-first behavior. The selected direction becomes the explicit visual-system reset only after responsive and accessibility review.

### 14.2 Preserve

- the established calm, premium, dark mineral workspace direction,
- current typography and token principles until a later design-system decision explicitly changes them,
- restrained use of mint/green for verified and positive states,
- coral/red only for conflicts, risks, and blockers,
- row-first density for comparable work,
- visible provenance and approval states,
- desktop depth with mobile triage support.
- `System`, `Light`, and `Dark` theme choices in Settings, with `System` as the new-account default,
- semantic and interaction parity across light and dark themes.

### 14.3 Reject

- generic metric dashboards as the first activated screen,
- an empty tracker as the first payoff,
- card grids used only to advertise features,
- generic AI chat as the hero workflow,
- black-box match gauges,
- keyword clouds without decision context,
- visual novelty that weakens trust or scanability.

### 14.4 Primary-screen design brief

Target user: an employed, ambitious mid-career professional deciding whether any current opportunity is worth attention.

Primary outcome: understand the single best current opportunity, the evidence behind it, the main risk, and the one next action quickly and confidently without decoding the interface.

Required content:

- top recommendation,
- compensation, logistics, source, and freshness,
- concise explanation of why it is ranked first,
- proven, plausible, missing, and risky evidence,
- read-only system recommendation plus one clear `Pursue`, `Watch`, or `Pass` user-decision group,
- one primary next action,
- access to alternatives without turning the screen into a generic dashboard.

Three visual directions were generated and audited on 2026-07-17. Option 1 is a component source rather than a whole screen. Option 2 is the dated Radar Brief. Option 3 is the individual Opportunity Review. Radar Setup and Pursuit Application require new screens. The next design deliverable must show these four core surfaces, light and dark themes, material-opportunity and honest no-opportunity states, and responsive behavior before implementation.

Do not publish fixed-duration promises such as `8-minute review` or `Start 8-minute proof check`. A duration estimate may appear only when it is based on recent measured behavior for the same workflow, is labeled as an estimate, and is designed to recalibrate as capabilities change.

## 15. Delivery Sequence

### Phase A: authority reconciliation

- review this packet,
- promote it intentionally into the canonical Job Filter branch,
- update only the Foundation/PRD sections this packet explicitly supersedes,
- keep skill sync separate,
- preserve uncommitted user work.

### Phase B: case study zero

- complete TextNow and Going Decision Receipts,
- establish Matt's baseline,
- choose the first active pursuit,
- prepare local research and strategy without Teal mutation,
- request approval before any tracker mutation or live application work.

### Phase C: screen-system validation

- the three screenshot-grounded concepts have been assigned to distinct screen jobs,
- design Radar Setup, Radar Brief, Opportunity Review, and Pursuit Application as one coherent family,
- validate the action semantics, theme parity, responsive behavior, and no-opportunity state,
- treat the approved screen system as an input to Chapter 05, not as code approval.

### Phase C.5: Foundation and implementation reset

- create and approve Chapter 05 under `868hukucf`,
- record explicit approval receipts for Chapters 01 through 05,
- create the real `FS8` implementation-reset packet,
- refresh `868huafcx` and verify the ClickUp task after write,
- create a clean implementation worktree from then-current `origin/main`,
- preserve the existing dirty, divergent checkout.

### Phase D: implementation

- begin only after Phase C.5 is complete,
- build only the approved screen system,
- start with the smallest complete Profile -> Jobs -> Review -> Pursuit slice,
- use realistic Matt case-study data,
- verify desktop, mobile, keyboard, loading, empty, error, conflict, and success states,
- compare the implementation directly against the selected visual target.

### Phase E: concierge beta

- recruit 10 to 20 employed design partners,
- deliver the workflow manually where automation is not yet proven,
- test activation, explanation usefulness, recurring Radar use, and willingness to pay,
- automate only validated recurring work.

## 16. Acceptance Criteria

This packet is ready for promotion only when:

1. current-main Foundation Series decisions remain intact unless supersession is explicit,
2. Radar Setup and each Radar Brief are separate surfaces integrated into `Jobs`,
3. Sprint uses `Review` and native `Pursuits`,
4. the activation event includes a real opportunity decision,
5. the Decision Receipt exposes evidence and uncertainty,
6. proof lineage and human approval remain mandatory,
7. the customer product has no Teal or competitor-product dependency,
8. MVP exclusions remain explicit,
9. pricing remains a test hypothesis,
10. naming remains gated,
11. Matt's case study is part of product validation,
12. no visual implementation begins before the four-screen core system is approved,
13. no code from `27580ba` is imported automatically,
14. visual selection alone does not bypass Chapter 05, Chapters 01 through 05 approvals, `FS8`, or verified tracker refresh,
15. rollback remains possible by removing this staging packet and its new evidence artifacts without changing current-main behavior.

## 17. Evidence Artifacts

Current visual evidence copied into this staging package:

- `artifacts/product-audit/2026-07-16/02-job-search.png`
- `artifacts/product-audit/2026-07-16/05-match-analysis.png`
- `artifacts/product-audit/2026-07-16/07-home.png`
- `artifacts/product-audit/2026-07-16/05-jobs-surface.png`
- `artifacts/product-audit/2026-07-16/historical-d2-activation-reference.png`
- `artifacts/product-audit/2026-07-16/phase2-primary-screen-option-1-decision-desk.png`
- `artifacts/product-audit/2026-07-16/phase2-primary-screen-option-2-radar-brief.png`
- `artifacts/product-audit/2026-07-16/phase2-primary-screen-option-3-proof-lens.png`

Companion commercial and validation packet:

- `docs/product/packets/phase2-business-launch-and-validation-plan-2026-07-16.md`
- `docs/product/packets/phase2-customer-discovery-and-paid-beta-script-2026-07-16.md`
- `docs/product/packets/phase2-decision-receipt-data-telemetry-and-test-contract-2026-07-16.md`
- `docs/product/packets/phase2-governance-promotion-and-fs8-reset-packet-2026-07-16.md`

The historical D2 image is reference-only until the latest HTML is rendered again at matching dimensions and visually compared.

## 18. Risks And Rollback

### Risks

- Strategy drift if passive monitoring expands MVP beyond the decision loop.
- Trust drift if scoring hides uncertainty or proof states.
- Delivery drift if mixed April code is mistaken for approved implementation.
- Retention risk if Radar becomes a noisy job alert feed.
- External-surface risk if an employer site, ATS, or browser handoff becomes unreadable or changes behavior.
- Legal/privacy risk if sensitive career inferences or user data are reused without transparent consent and deletion controls.

### Rollback

- This is an additive staging packet.
- No current-main file or runtime behavior is replaced.
- The packet and copied evidence can be removed without affecting the product.
- Any later promoted change must remain a small, reviewable commit with file-level rollback.
