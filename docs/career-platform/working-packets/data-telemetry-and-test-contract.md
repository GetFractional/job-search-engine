# Phase 2 Decision Receipt Data, Telemetry, And Test Contract

Last updated: 2026-07-16
Status: proposed implementation contract, not yet promoted
Primary owner: Phase 2 product lead
Implementation owner: one coding thread after Foundation and `FS8` gates clear

## 1. Outcome

Define the smallest data, state, event, metric, and regression-test contract that can support Job Filter's differentiated loop:

`verified Profile -> approved Role Lanes -> trustworthy job capture -> opportunity integrity -> requirements assessment -> Decision Receipt -> user decision -> approval-gated handoff -> outcome learning`

This packet is intentionally implementation-ready but not implementation-authorizing. It does not approve a visual direction, create Chapter 05, refresh `868huafcx`, or permit an application, outreach, tracker, or other external mutation.

## 2. Controlling Inputs

Use these sources in order for this contract:

1. verified ClickUp task packets and read-after-write receipts, when available,
2. current `origin/main` repo reality,
3. `docs/product/job-filter-foundation-series-governing-packet-v7.md`,
4. `docs/product/packets/phase2-career-opportunity-platform-authority-2026-07-16.md`,
5. `docs/product/foundation-series/03-product-system.md`,
6. `docs/product/packets/phase2-business-launch-and-validation-plan-2026-07-16.md`,
7. current code only as salvageable reference, not as approved Phase 2 behavior.

If this packet conflicts with a verified higher-authority source, the higher source wins and this packet must be revised before implementation.

## 3. Contract Impact

### 3.1 What stays useful in the scaffold

- Imported proof already retains source-line indexes, snippets, import-session ID, and parse mode.
- `needs_review` and `conflict` proof is excluded from the current auto-use selector.
- New assets and application answers start unapproved.
- Asset records retain proof IDs used and unresolved proof IDs.
- Regeneration can remove old proof backlinks when the caller supplies the previous IDs.
- The local-first IndexedDB architecture supports a low-cost, single-user validation phase.

### 3.2 What must not be promoted unchanged

| Severity | Current behavior | Evidence | Required Phase 2 behavior |
| --- | --- | --- | --- |
| P0 | Missing or unknown proof status becomes `active`, then auto-use can default to true. | `src/lib/proofLibrary.ts:77-93`, `src/store/useStore.ts:476-490` | Unknown and imported material fail closed. Only an explicit verified fact version may be reused. |
| P0 | Imported numeric outcomes are `verified: false`, but an active parent claim can still feed generators. | `src/lib/proofLibrary.ts:51-60`, `src/lib/proofLibrary.ts:146-180` | Every external metric requires a verified fact version, source, ownership, confidence, and safe phrasing. |
| P0 | No-proof generation is a warning, and generic fallback claims may still be generated. | `src/lib/assets.ts:62-83` | Zero approved proof yields `unsupported`; no unsupported professional assertion may be approved, copied, or exported. |
| P0 | Copy is available before approval, and an approved asset can be edited without clearing approval. | `src/components/assets/AssetsTab.tsx:279-336`, `src/components/assets/AssetsTab.tsx:540-562` | Copy/export requires an immutable approved version. Edit or regenerate creates a new draft version. |
| P0 | A job can be scored without canonical employer, duplicate, source activity, freshness, or already-applied gates. | `src/types/index.ts:91-123`, `src/store/useStore.ts:147-215` | Opportunity integrity and hard gates execute before a Pursue recommendation. |
| P1 | Requirements have only `Met`, `Partial`, and `Missing`, with prose evidence. | `src/types/index.ts:134-145` | Automated matching may suggest `plausible`; only a verified proof version can establish `proven`. |
| P1 | Assets store opaque used and unresolved IDs, not semantic `used`, `missing`, and `excluded` rationale. | `src/types/index.ts:206-220` | Rationale collections must be disjoint, semantic, recoverable, and visible. |
| P1 | Funnel numerators are not always restricted to their denominator cohorts. | `src/lib/metrics.ts:43-72`, `src/lib/metrics.ts:170-205` | Every metric has an explicit eligible cohort, intersection numerator, time window, and bounded result. |

### 3.3 Release posture

The scaffold is a useful prototype and migration source. It is not Phase 2 truth-safe until the P0 paths above are replaced and their migration tests pass.

## 4. Cross-Cutting Data Rules

Every durable record must include, directly or through a common envelope:

| Field | Rule |
| --- | --- |
| `id` | Stable UUID or ULID for the logical object. |
| `versionId` | Stable UUID or ULID for this immutable version. |
| `version` | Positive integer, increasing within the logical object. |
| `workspaceId` | Required even in local mode. Use a local sentinel until accounts exist. |
| `userId` | Required owner. Use a local sentinel until accounts exist. |
| `createdAt` | ISO 8601 UTC timestamp. |
| `createdBy` | `user`, `operator`, `system`, or named integration surface. |
| `supersedesVersionId` | Previous version when a correction or revision exists. |
| `sourceRefs` | Structured source and source-fragment IDs, never only prose. |
| `confidence` | `high`, `medium`, `low`, or `unknown`. Confidence never grants approval. |
| `algorithmVersion` | Required for extracted, scored, classified, or generated material. |
| `correlationId` | Connects one capture, analysis, receipt, asset, or external-action flow. |

Additional rules:

- Approved and externally used versions are immutable.
- Corrections create a new version and preserve the old version for lineage.
- User correction outranks extraction, inference, scoring, and generated interpretation.
- Raw text, structured facts, recommendations, approvals, and events are separate objects.
- Every derived object stores the exact input version IDs used to create it.
- Deletion, export, tenant isolation, and consent cover every new entity introduced here.
- An object may have high extraction confidence and still remain unverified.

## 5. Canonical Entities

### 5.1 `SourceRecord`

Represents one captured source or observation.

Required fields:

- `id`, `workspaceId`, `userId`, `kind`, `authorityRank`,
- `publisher`, `url`, and `canonicalUrl` when applicable,
- `retrievedAt`, `publishedAt`, `lastVerifiedAt`,
- `captureMethod`: `manual`, `browser_visible`, `upload`, `paste`, `import`, or `operator_review`,
- `contentHash`, `snapshotRef`, and optional `sourceFragmentIds`,
- `observedState`: `active`, `closed`, `missing`, `redirected`, `unreadable`, or `unknown`,
- `consentState` when the source includes user-owned or sensitive content.

Authority rank for job activity:

1. canonical employer ATS or employer careers page,
2. current employer-hosted application page,
3. authorized recruiter or employer communication,
4. reputable job board that links to the canonical employer,
5. aggregator or legacy wrapper.

Lower-ranked visibility cannot overrule a higher-ranked closed, missing, or filled signal without explicit adjudication.

### 5.2 `FactSuggestion`

Represents system- or operator-proposed atomic content before it becomes user truth.

Required fields:

- `suggestionId`, proposed fact type and value,
- source evidence IDs and source fragments,
- extraction confidence and sensitivity class,
- `suggestionState`: `suggested`, `accepted`, `rejected`, or `superseded`,
- model, prompt, parser, and policy versions when applicable,
- created-at, reviewed-at, and reviewer fields.

Acceptance does not mutate the suggestion into truth. It creates a new `ProfileFactVersion` with its own approval event and lineage. Rejected suggestions remain available only as excluded reasoning when material.

### 5.3 `ProfileFactVersion`

The atomic reusable unit of user truth.

Required fields:

- `factId`, `versionId`, `factType`, `value`,
- `truthState`, `confidence`, `sourceRefs`,
- `ownership`: `owned`, `led`, `contributed`, `supported`, or `unknown`,
- `safePhrasing`,
- `approvedAt`, `approvedBy` when verified,
- `correctionReason`, `supersedesVersionId`, and dependent-object references.

`factType` includes identity, role, date, responsibility, tool, skill, credential, outcome, metric, compensation, benefit, location, logistics, constraint, and preference.

Numeric facts also require:

- raw value and unit,
- timeframe and scope,
- attribution boundary,
- source fragment,
- external-use decision.

### 5.4 `ProofEvidenceVersion`

Groups atomic Profile facts into a usable evidence story without erasing item-level state.

Required fields:

- `proofId`, `versionId`, company, role, dates,
- `factVersionIds`,
- `truthSummary`,
- `approvedFactVersionIds`, `unresolvedFactVersionIds`, `excludedFactVersionIds`,
- `safeSummary`,
- `sourceRefs`, `createdBy`, and `supersedesVersionId`.

A proof story is reusable only if every fact actually used is verified. One unresolved item must not silently promote or block unrelated verified items.

Lineage between versions is stored as typed edges. Allowed relations include `extracted_from`, `supports`, `contradicts`, `corrects`, `used_in`, `excluded_from`, and `derived_from`. Every edge includes exact source and target version IDs, actor, timestamp, and transformation or prompt-policy version.

### 5.5 `RoleLaneVersion`

Required fields:

- `laneId`, `versionId`, `name`, `description`,
- `state`: `suggested`, `approved`, `retired`, or `excluded`,
- `targetTitlePatterns`, `mandateSignals`, `antiSignals`,
- `supportingProofVersionIds`, `missingProofQuestions`,
- `compensationTarget`, `logisticsConstraints`,
- `approvedAt`, `approvedBy`, and `supersedesVersionId`.

Multiple approved lanes may coexist. One receipt must identify a primary lane and may include secondary lane tags.

### 5.6 `CareerBaselineVersion`

The comparison point for deciding whether an opportunity is materially better.

Required fields:

- current role, company, and employment state,
- base compensation, variable compensation, equity, benefits, schedule, location, travel, and commute,
- role scope, learning, stability, satisfaction, and career-capital ratings,
- hard constraints, target outcomes, and acceptable tradeoffs,
- a truth state and source reference for each material field,
- `effectiveFrom`, `approvedAt`, and `supersedesVersionId`.

Unknown values remain unknown. They are not converted to neutral scores.

### 5.7 `JobSourceObservation`

Represents what one source said about one possible opening at one time.

Required fields:

- `observationId`, `sourceRecordId`,
- employer as displayed, title, location, requisition ID, and application URL,
- published date, updated date, observed activity state,
- salary lower bound, upper bound, currency, cadence, and equity/bonus flags,
- raw-description hash and snapshot reference,
- `observedAt` and `lastVerifiedAt`.

Null salary bounds stay null. A lower bound does not authorize synthesizing an upper bound.

### 5.8 `CanonicalJobVersion`

Reconciles one or more source observations into the opening the user is actually considering.

Required fields:

- `jobId`, `versionId`, canonical employer ID and display name,
- canonical title, location, requisition ID, and application URL,
- `sourceObservationIds`, `canonicalSourceObservationId`,
- `availabilityState`, `freshnessState`, `canonicalState`, `duplicateState`, and `integrityFlags`,
- `publishedAt`, `lastVerifiedAt`, and the verification policy version,
- `duplicateOfJobId`, `wrapperJobIds`, `employerMismatchDetails`,
- terminal and already-applied states,
- compensation and logistics fields with source references,
- description hash, correction history, and downstream invalidation list.

Do not collapse opportunity integrity into one enum. The following state families can coexist:

| Family | Values |
| --- | --- |
| `availabilityState` | `active_verified`, `inactive`, `unknown` |
| `freshnessState` | `fresh_0_30`, `stale_risk_31_60`, `stale_over_60`, `unknown` |
| `canonicalState` | `confirmed`, `candidate`, `canonical_board_absent`, `employer_mismatch`, `unknown` |
| `duplicateState` | `unique`, `canonical_duplicate`, `duplicate_wrapper`, `submitted_duplicate`, `unknown` |
| `integrityFlags` | `orphaned_legacy`, `filled_or_closed`, `ats_migration`, `legacy_form_visible`, `requisition_mismatch` |

`active_verified` requires current evidence for the exact requisition from a canonical source. A visible legacy form does not qualify. A repost with a new requisition ID becomes a new canonical job unless human adjudication proves continuity.

Freshness rules:

- `fresh_0_30`: official published date is 0 to 30 days old,
- `stale_risk_31_60`: 31 to 60 days old unless active-hiring evidence is attached,
- `stale_over_60`: more than 60 days old and default pass/archive,
- `unknown`: no trustworthy publication date. `firstSeenAt` must not masquerade as `publishedAt`.

Default verification time-to-live is a policy hypothesis, not a staffing guarantee:

- Radar review may use a canonical check up to seven days old while showing its age,
- a Pursuit Sprint handoff or external-action request requires a new canonical check within 24 hours,
- an unreadable source degrades to `availabilityState: unknown`; it never inherits a prior active state silently.

### 5.9 `RequirementAssessmentVersion`

Required fields:

- `assessmentId`, `versionId`, `jobVersionId`,
- requirement text, source fragment, type, and priority,
- `assessmentState`,
- `proofVersionIds`, `profileFactVersionIds`,
- system rationale, confidence, user override, and override reason,
- `createdBy`, `algorithmVersion`, and `supersedesVersionId`.

`assessmentState` values:

- `proven`,
- `plausible`,
- `missing`,
- `risky`,
- `disqualifying`,
- `excluded`.

Automated keyword, semantic, or model matching may produce only `plausible`, `missing`, or `risky`. `proven` requires at least one directly linked verified fact version that substantively addresses the requirement.

### 5.10 `FitDimensionVersion`

One inspectable factor in the opportunity recommendation.

Required fields:

- `dimensionId`, `receiptVersionId`, `dimensionType`,
- `rating`: `strong`, `mixed`, `weak`, `blocked`, or `unknown`,
- optional normalized score and contribution,
- evidence confidence,
- source, fact, proof, and requirement version IDs used,
- rationale, uncertainty, and material tradeoff,
- `isHardGate` and `gateReasonCode`.

Phase 2 dimension types:

- material upside over current baseline,
- mandate fit,
- evidence confidence,
- hiring plausibility,
- opportunity integrity,
- freshness,
- compensation and logistics,
- career capital and future optionality,
- pursuit effort and risk.

The scoring formula may evolve, but a receipt must preserve the formula version, factor values, and factor contributions that produced its summary.

### 5.11 `DecisionReceiptVersion`

The sourced one-page case for a recommendation.

Required fields:

- `receiptId`, `versionId`, `version`, `jobVersionId`, `baselineVersionId`,
- primary `roleLaneVersionId` and secondary lane IDs,
- `recommendedDecision`: `pursue`, `watch`, `pass`, `investigate`, or `ignore`,
- nullable fit score and fit-score policy version,
- `fitDimensionIds`, `requirementAssessmentIds`,
- `usedEvidence`, `missingEvidence`, and `excludedEvidence`,
- strategic upside, career economics, career capital, and optionality,
- compensation, logistics, source/freshness confidence, canonical employer, availability, freshness, canonical, duplicate, and integrity-flag states,
- uncertainty and unresolved unknowns,
- expected pursuit effort,
- one recommended next action,
- `receiptState`, `generatedAt`, `reviewedAt`, and input-version fingerprint.

`receiptState` values:

- `draft`,
- `needs_review`,
- `approved`,
- `stale`,
- `superseded`,
- `unsupported`.

The receipt stores the system recommendation. The user's eventual choice is a separate `DecisionEvent`, preserving disagreement and correction value.

### 5.12 `DecisionEvent`

Required fields:

- `eventId`, `receiptVersionId`, `jobVersionId`,
- system recommendation,
- `userDecision`: `pursue`, `watch`, or `pass`,
- `decisionReasonCodes`, optional note, and material correction IDs,
- actor, timestamp, and correlation ID.

An override never overwrites the original recommendation.

### 5.13 `NextActionVersion`

Required fields:

- `actionId`, `versionId`, `jobVersionId`, `receiptVersionId`,
- `actionType`, owner, due date, expected effort, and blocker,
- `state`: `proposed`, `approved`, `in_progress`, `blocked`, `completed`, or `cancelled`,
- `isExternal`, approval requirement, and completion evidence.

Initial action types include verify source, resolve employer, answer proof question, compare baseline, monitor, prepare assets, prepare external package, review submission, archive, and record outcome.

### 5.14 `AssetVersion`

Required fields:

- `assetId`, `versionId`, `version`, `jobVersionId`, `receiptVersionId`,
- asset type, content reference, content hash,
- `assetState`,
- used fact/proof/source version IDs,
- semantic `used`, `missing`, and `excluded` rationale,
- unsupported and conflict flags,
- generation provider, model, prompt-policy version, tokens, and cost,
- approved-at and exported-at timestamps,
- supersedes and superseded-by version IDs.

`assetState` values are locked to:

- `draft`,
- `needs_review`,
- `approved`,
- `exported`,
- `superseded`,
- `unsupported`.

### 5.15 `ExternalActionApproval`

Required fields:

- `approvalId`, user, actor, and timestamp,
- exact action type, target employer, target role, destination, and job version,
- exact asset version IDs and application-answer version IDs,
- payload fingerprint,
- `state`: `requested`, `approved`, `consumed`, `expired`, `revoked`, or `cancelled`,
- optional expiry and consumption evidence.

Approval is narrow. Approval of a draft does not authorize a changed asset, a different job, a different destination, or a later outreach action.

### 5.16 `ExternalExecutionPackageVersion`

Required fields:

- job, receipt, asset, and answer version IDs,
- `surfaceClass`: `employer_ats`, `employer_email`, `employer_portal`, `download_only`, or `other`,
- optional external provider identifier for diagnostics, never as a core dependency,
- `readabilityState`: `readable`, `unreadable`, `unknown`, or `not_opened`,
- `verificationState`: `not_attempted`, `awaiting_confirmation`, `verified`, or `failed`,
- intended upload destinations and filenames,
- `state`: `draft`, `approval_ready`, `exported`, `consumed`, or `superseded`,
- missing items, blockers, export timestamp, and completion evidence.

An external execution package is not proof that an application or message was submitted.

### 5.17 `OutcomeEvent`

Required fields:

- `eventId`, `jobVersionId`, `searchCycleId`,
- `outcomeType`, occurred-at and recorded-at timestamps,
- evidence source, confirmation type, and actor,
- related action, application, interview, offer, and experiment IDs,
- compensation fields only when user-confirmed,
- correction and supersession fields.

Outcome types include application submitted, recruiter response, recruiter screen completed, hiring-manager interview completed, panel interview completed, rejection, withdrawal, offer received, offer accepted, offer declined, role closed, and no response at a defined window.

### 5.18 `SearchCycle`

Required fields:

- `searchCycleId`, user, approved lane IDs, start and end timestamps,
- state: `planned`, `active`, `paused`, `completed`, or `cancelled`,
- goal, compensation target, geography, and constraints snapshot,
- activation event ID and close reason.

A cycle starts only through an explicit user or operator action. It must not be inferred from page views.

### 5.19 `ProductEvent`

An append-only, idempotent business-event ledger, not a raw clickstream.

Required fields:

- `eventId`, `eventName`, `eventVersion`,
- user/workspace ID, session ID, correlation ID,
- actor type, surface, occurred-at and recorded-at timestamps,
- primary object type, object ID, and object version ID,
- algorithm or model version when applicable,
- enumerated properties only.

Raw resume text, job descriptions, asset text, source snippets, names, email addresses, phone numbers, free-form notes, and compensation details must not appear in an analytics payload.

## 6. Legal State Transitions

### 6.1 Truth

| From | Allowed next state | Rule |
| --- | --- | --- |
| new | `imported` or `unsupported` | Extraction and inference never create verified truth. |
| `imported` | `verified`, `excluded`, or `conflict` | `verified` requires explicit user approval and source lineage. |
| `unsupported` | `imported` or `excluded` | Add a source or user-attested evidence before review. |
| `conflict` | `corrected` or `excluded` | Preserve both conflicting sources and the adjudication. |
| `verified` | `corrected` or `excluded` | Never edit an approved version in place. |
| `corrected` | terminal old version | Create a new version with its own review state. |
| `excluded` | terminal old version | Recovery creates a new imported version. |

Unknown state values fail closed as `unsupported` and emit a local `invalid_state_blocked` event.

### 6.2 Requirement assessment

- Extraction creates `plausible`, `missing`, or `risky`.
- Direct linkage to verified proof plus human review may create `proven`.
- A hard incompatibility creates `disqualifying`.
- User or policy exclusion creates `excluded` with a reason.
- Any source, job, or proof correction makes the dependent assessment stale and requires a new version.

### 6.3 Decision Receipt

`draft -> needs_review -> approved`

Additional transitions:

- any dependency correction: `draft | needs_review | approved -> stale`,
- a replacement receipt: previous version -> `superseded`,
- missing critical source or contradictory inputs: `draft -> unsupported`,
- `stale` and `unsupported` may not feed approval-ready handoff.

### 6.4 Asset

`draft -> needs_review -> approved -> exported`

Rules:

- edit or regenerate always creates version N+1 in `draft`,
- version N remains immutable,
- approving N+1 may mark N `superseded`,
- missing verified proof or unresolved conflict creates `unsupported`,
- only `approved` may be copied or exported,
- only an approved exact version may enter an external-action approval.

### 6.5 External action

`prepared -> approval_requested -> approved_for_action -> executed_pending_verification -> verified`

Failure paths:

- approval refused or changed: `cancelled`,
- exact payload changes after approval: approval becomes `revoked`,
- external action fails: `failed`,
- external destination state cannot be read after action: remain `executed_pending_verification`, never `verified`.

## 7. Opportunity Integrity And Decision Gates

Evaluate gates before a Pursue recommendation or asset work.

| Gate | Required result |
| --- | --- |
| Already applied or terminal | Block Pursue and duplicate application work. |
| Canonical employer mismatch | System recommendation becomes `investigate`; no asset or external package. |
| Duplicate wrapper of submitted role | System recommendation becomes `ignore` or `pass`; link canonical record. |
| Inactive, filled, or closed source | Decision becomes `pass`; archive candidate. |
| Canonical activity unknown | System recommendation may be `investigate` or `watch`, not `pursue`. |
| Compensation below hard floor | Block unless the user records an intentional exception. |
| Location, authorization, employment, or travel conflict | `disqualifying` unless explicitly overridden where legally and practically valid. |
| More than 60 days old | Default `pass` unless unusually strong active-hiring evidence is linked. |

An overall score may still be stored for diagnostic analysis, but the user-facing recommendation must reflect the gate and show why it overruled the score.

Scoped overrides are allowed for compensation floor, logistics, and the over-60-day policy when the user records the exact tradeoff and the opportunity is still active. Inactive source, submitted duplicate, unresolved employer mismatch, missing approval, unsupported external claim, and unreadable post-action verification remain non-overridable product gates.

## 8. Lineage And Rationale Invariants

1. `used`, `missing`, and `excluded` collections are pairwise disjoint.
2. Every `used` item points to an exact immutable source, fact, proof, job, or research-fact version.
3. Every excluded item includes a reason and a recovery path when recovery is possible.
4. Every missing item describes why it matters and the smallest next evidence action.
5. Rejected or excluded evidence never appears in `used`.
6. A source correction invalidates canonical job, requirement, score, receipt, and draft-asset versions that depend on it.
7. A proof correction invalidates requirement, receipt, and draft-asset versions that depend on it.
8. Backlinks are transactionally symmetric.
9. External metrics have item-level verification, ownership, safe phrasing, and source fragments.
10. Research hypotheses stay hypotheses until a source-backed fact version is reviewed.

## 9. Product Event Dictionary

### 9.1 Required local business events

| Event | Emit when | Minimum properties |
| --- | --- | --- |
| `diagnostic_started` | A qualified participant starts the first-use decision path. | entry source, search-state segment, experiment variant |
| `profile_fact_imported` | A candidate fact is created. | fact type, source kind, extraction method |
| `profile_fact_verified` | User approves an exact fact version. | fact type, prior state, confidence |
| `profile_fact_corrected` | User supersedes a fact version. | fact type, correction reason code |
| `role_lane_suggested` | System or operator proposes a lane. | lane category, evidence coverage band |
| `role_lane_approved` | User approves a lane. | lane category, prior state |
| `career_baseline_approved` | User approves a baseline version. | comparison basis, compensation band, constraint count |
| `search_cycle_started` | User explicitly starts a search cycle. | lane count, target band, cycle type |
| `job_source_captured` | A source observation is stored. | source kind, capture method, observed state |
| `job_integrity_checked` | Canonical job state is adjudicated. | availability, freshness, canonical, and duplicate states; integrity-flag count; source count |
| `job_duplicate_linked` | Wrapper or duplicate is linked. | duplicate type, canonical-known flag |
| `decision_receipt_generated` | A new receipt version exists. | recommendation, availability, freshness, canonical, and duplicate states; hard-gate flag |
| `decision_receipt_reviewed` | User completes required review. | recommendation, review duration band, unknown count |
| `decision_recommendation_corrected` | User or adjudicator corrects a material recommendation input or outcome. | correction class, before/after recommendation |
| `decision_committed` | User records a decision. | system recommendation, user decision, override flag |
| `unsupported_claim_blocked` | Approval, copy, export, or action is blocked. | object type, blocker reason code |
| `external_action_blocked` | A gate prevents an external action. | action type, blocker reason code |
| `external_package_approval_ready` | Exact assets and answers pass internal gates. | asset count, answer count, surface class, readability state |
| `external_package_exported` | User exports an approved package. | surface class, asset count |
| `external_action_approved` | User approves an exact external payload. | action type, destination class |
| `external_action_verified` | Read-after-write or confirmation proves the action. | action type, verification method |
| `outcome_recorded` | A job-search outcome is confirmed. | outcome type, confirmation type, stage |
| `radar_brief_delivered` | A weekly brief is made available. | opportunity count, no-action flag, coverage band |
| `radar_brief_reviewed` | User reviews a weekly brief. | opportunities surfaced, decisions committed |
| `operator_work_logged` | Concierge work on a defined workflow finishes. | workflow, minute band, revision count |
| `data_exported` | User exports all data. | schema version, entity count band |
| `data_deleted` | Deletion completes. | deletion scope, verification result |
| `model_invocation_logged` | A model or template generation runs. | provider, model tier, task type, tokens, cost band |

### 9.2 Idempotency

- Producers supply an `eventId` and idempotency key.
- Retried writes cannot duplicate a business event.
- Derived metrics de-duplicate by event ID and logical object version.
- Corrections append a new event and reference the superseded event; they do not mutate history.

### 9.3 Privacy boundary

- Default validation mode stores events locally in IndexedDB.
- No third-party analytics, pixels, session replay, or background telemetry ships in the local MVP.
- Any later product-analytics sync is first-party, opt-in, clearly disclosed, and limited to enumerated properties.
- Participant identity for concierge research is stored separately from analysis IDs.

## 10. Metric Dictionary

Every rate must be between 0 and 1. Every conversion numerator is an intersection of its denominator cohort.

| Metric | Numerator | Denominator | Window and exclusions |
| --- | --- | --- | --- |
| Activation rate | Eligible new users with at least one verified Profile fact set meeting minimum Profile readiness, one approved Role Lane, and one reviewed evidence-backed Decision Receipt | Eligible new users who started Profile | Within 7 days; exclude test, operator, and duplicate accounts |
| Qualified interviews per active search cycle | Distinct `(search cycle, canonical job)` pairs with a confirmed hiring-manager or panel interview completed | Activated cycles that are closed or at least 28 days old | Report immature active cycles separately; exclude recruiter-only, automated assessment, and informational calls |
| Evidence-backed decisions per activated user-week | Distinct canonical jobs with a committed decision on the latest reviewable receipt and no unresolved integrity gate | Activated users eligible for at least four days in the week | System recommendations without user review do not count |
| Surfaced-opportunity review rate | Unique eligible surfaced job versions with a completed receipt review | Unique nonduplicate job versions surfaced in a Radar brief | Weekly cohort; exclude technical duplicates and already-terminal records at ingestion |
| Decision completion rate | Reviewed receipts with a committed user decision | Reviewed receipts | Weekly or per cycle |
| Recommendation correction rate | Reviewed receipts with a material factual correction or user override coded as system error or missing constraint | Reviewed receipts | Separate preference overrides from system errors |
| High-confidence decision count | Reviewed receipts with canonical source, assessed freshness, no unresolved hard gate, and no critical unknown | Active user or cycle | Weekly; do not infer high confidence from score alone |
| Materially better opportunity count | User-approved Pursue decisions that improve at least one user-designated material baseline dimension without violating a hard constraint | Active search cycle | Report dimension improved; do not count vague interest |
| Freshness assessed coverage | Reviewed jobs with a canonical source and a recorded freshness state, including explicit unknown | Reviewed jobs | Distinct from freshness known coverage |
| Freshness known coverage | Reviewed jobs with trustworthy published or active-hiring evidence | Reviewed jobs | Unknown does not count as known |
| Freshness false-positive rate | Jobs marked `active_verified` that authoritative adjudication shows were inactive at the decision time | `active_verified` jobs later adjudicated by an authoritative source | Report sample size; target below 5 percent after sufficient observations |
| Recommendation false-positive rate | System Pursue decisions adjudicated as Pass because of a factual, gate, or modeled-fit error | System Pursue decisions with completed human adjudication | Preference changes reported separately |
| Recommendation false-negative rate | System Pass or Watch decisions adjudicated as Pursue because of a factual, gate, or modeled-fit error | Audited system Pass or Watch decisions | Requires sampled audits; absence of pursuit is not proof of a false negative |
| Median time to decision | Median of committed-decision time minus first trustworthy source capture time | Jobs with a committed decision | Exclude paused intervals when measurable |
| Time saved per decision | User baseline minutes minus measured active review minutes | Decisions with both values | Never claim without a pre-product baseline and active-time definition |
| Time to approval-ready | Handoff approval-ready time minus Pursue decision time | Pursue decisions that reach approval-ready | Exclude user-paused time when measurable |
| Application-to-screen rate | Unique submitted jobs with confirmed recruiter screen or later | Unique submitted jobs in the same cohort | Cohort by submission week or month |
| Screen-to-qualified-interview rate | Unique screened jobs with confirmed hiring-manager or panel interview | Unique screened jobs in the same cohort | Recruiter screen is denominator entry, not qualified-interview numerator by itself |
| Qualified-interview-to-offer rate | Unique jobs with confirmed offer | Unique jobs with confirmed qualified interview | Same cohort, maturity-lag noted |
| Unsupported-claim incidents | Exported or externally used payloads containing material without verified lineage | External payloads | Target zero; any incident pauses acquisition and triggers audit |
| Unapproved-action incidents | External actions executed without a matching valid approval record | External actions | Target zero; any incident pauses acquisition and triggers audit |
| Radar week-4 return rate | Activated users who review at least one useful Radar brief in week 4 | Activated users eligible for a week-4 brief | Exclude users who explicitly ended the search cycle |
| No-action brief usefulness | Zero-opportunity briefs explicitly confirmed useful | Zero-opportunity briefs reviewed | Tracks whether restraint itself creates subscription value |
| Direct cost per reviewable receipt | Model, data, and attributable operator-variable cost | Reviewable Decision Receipts | Show operator minutes separately and combined |
| Radar direct cost per active month | Model, source, and attributable operator-variable cost for Radar | Active Radar user-months | Compare with the $24 initial price hypothesis and the commercial cost ceiling |
| Contribution margin | Collected revenue minus payment, model, source, and attributable operator-variable cost | Collected revenue | Report by offer and cohort; do not hide founder labor during concierge validation |

Do not compare conversion rates until cohorts are mature enough to receive the downstream outcome. Always show numerator and denominator beside the rate.

## 11. Storage, Privacy, And Account Boundary

### 11.1 Concierge alpha and Matt case study

- Keep canonical user data and business events local in IndexedDB.
- Include every new entity and event in full export, re-import, and deletion verification.
- Treat local browser storage as recoverable working storage, not durable backup.
- Do not claim app-level encryption that is not implemented.
- Keep any participant identity mapping outside de-identified research analysis.

### 11.2 Before unsupervised multi-user accounts

The business plan's network boundary remains binding:

- authenticated Worker API is the network boundary,
- D1 is canonical truth,
- local IndexedDB becomes an offline cache or draft buffer,
- every table includes tenant/workspace ownership,
- authorization is checked on every object read and write,
- consent, first-party analytics preference, export, deletion, and audit timestamps are verified,
- source snapshots and sensitive career data receive explicit retention rules,
- raw uploaded documents are processed transiently and not retained server-side by default unless a reviewed encrypted-retention design and explicit consent exist,
- background jobs are idempotent and tenant-scoped.

No multi-user beta may launch with only client-supplied tenant IDs or browser-only authorization.

## 12. Model Routing And Cost Controls

| Tier | Allowed work | Prohibited authority |
| --- | --- | --- |
| Tier 0, deterministic/manual | URL normalization, hashes, age calculation, hard gates, exact field validation, local templates | Cannot infer missing facts |
| Tier 1, low cost | Structured extraction, requirement candidate detection, provisional lane/job classification | Cannot create verified truth, proven requirements, approved receipts, or approved assets |
| Tier 2, premium and explicit | Difficult synthesis, ambiguity review, high-value receipt or asset assistance | Cannot bypass lineage, human review, or exact external-action approval |

Controls:

- cache by source content hash and algorithm version,
- do not rerun analysis when inputs are unchanged,
- log provider, model, input/output tokens, estimated cost, object IDs, and correlation ID,
- extend generation logs with operation, receipt version, cache hit, latency, retry count, and result,
- enforce a configurable daily ceiling,
- require explicit user selection for premium models,
- fall back to deterministic or clipboard/manual workflow when the ceiling is reached,
- never send more Profile, source, or job data to a model than the task requires.

Commercial guardrails remain: Free Diagnostic direct cost at or below `$8` plus 20 operator minutes, Radar at or below `$6` per active month, Pursuit Sprint at or below `$30`, and Guided Sprint at or below three operator hours plus `$35` in tools and payment cost. Reduce source breadth, cache more work, or change model tier before weakening proof or approval gates.

## 13. Migration Rules From The Current Scaffold

1. Preserve current records and create a read-only pre-migration export.
2. Migrate legacy `rejected` proof to `excluded`.
3. Migrate legacy `needs_review` and `conflict` directly to their fail-closed equivalents.
4. Migrate legacy `active`, missing, or unrecognized proof to `imported`, not `verified`, unless a separate explicit approval record exists. The current boolean does not prove that record.
5. Migrate every numeric outcome to a fact-level review queue. `verified: true` without source, ownership, and safe phrasing is insufficient for automatic external reuse.
6. Migrate existing approved assets to `needs_review` when approval actor, timestamp, exact input versions, and payload fingerprint are absent.
7. Preserve legacy asset content and proof references for audit; do not make it copy/export eligible until reviewed.
8. Mark every migrated job with `availabilityState`, `freshnessState`, `canonicalState`, and `duplicateState` all `unknown` until each check completes.
9. Mark legacy fit scores provisional/stale and preserve their algorithm version.
10. Convert stage timestamps to self-reported outcome events. Do not infer an application was externally submitted from stage alone.
11. Rebuild backlinks transactionally and verify referential integrity.
12. Increment the IndexedDB schema only after export/import, rollback, and fixture tests pass.

## 14. Required Regression Tests

### 14.1 Truth and proof

1. Undefined and unknown proof statuses fail closed.
2. High extraction confidence never equals verified truth.
3. An unverified numeric outcome cannot be used, approved, copied, exported, or submitted.
4. Mixed item states remain item-level; role aggregation cannot hide excluded or unresolved evidence.
5. User correction creates a new immutable version and invalidates dependents.
6. `used`, `missing`, and `excluded` are pairwise disjoint and materially exhaustive.
7. Rejected or excluded items never appear in `used`.

### 14.2 Job integrity and ranking

8. Employer mismatch, inactive source, duplicate submitted wrapper, terminal state, below-floor compensation, incompatible logistics, and over-60-day stale role each hard-gate Pursue.
9. Unknown activity yields Investigate or Watch, never Pursue.
10. A visible legacy URL cannot overrule a missing canonical-board role plus filled evidence.
11. Lower-bound-only compensation preserves a null upper bound.
12. Source correction recomputes canonical job, requirements, ranking, receipt, and dependent drafts.
13. Automated keyword or semantic matching yields at most `plausible`.

### 14.3 Receipt, asset, and action

14. Every Decision Receipt contains all required fields, factor evidence, uncertainty, and one next action.
15. A receipt with a stale dependency cannot be approved or handed off.
16. No-approved-proof generation becomes `unsupported` and contains no unsupported fallback claim.
17. Copy/export is unavailable for draft, needs-review, unsupported, stale, or superseded assets.
18. Editing an approved asset creates version N+1 in draft while N remains immutable.
19. Exact external-action approval fails if destination, job, asset, answer, or payload fingerprint changes.
20. An unreadable external destination remains `unknown`; no success state exists without confirmation evidence.

### 14.4 Data, events, and metrics

21. Asset/proof backlinks are transactionally symmetric after create, regenerate, correction, job deletion, and rollback.
22. Export/re-import round-trips every new entity, version, event, approval, and relationship.
23. Delete removes all owned data and verifies zero remaining records for the workspace.
24. Event retries are idempotent.
25. Conversion rates remain between 0 and 1 with unrelated inbound or later-stage jobs.
26. Each rate uses a cohort-intersection numerator and shows numerator, denominator, and window.
27. Telemetry payloads reject raw PII and free-form career content.

## 15. Case-Study Fixtures

### 15.1 TextNow negative control

Fixture sources:

- legacy Lever job and application still rendering,
- canonical Greenhouse board with the role absent,
- retired legacy board signal,
- public evidence that the selected hire started.

Expected assertions:

- availability is `inactive`, canonical state is `canonical_board_absent`, and integrity flags include `filled_or_closed` and `orphaned_legacy`,
- recommendation is Pass/Archive,
- the legacy visible URL is shown as excluded activity evidence, not used proof of freshness,
- Pursue, asset generation, handoff, and application action are blocked,
- source timestamps and adjudication remain visible.

### 15.2 Going active control

Fixture sources:

- official Going careers page,
- official Ashby application,
- published `2026-07-10`, verified `2026-07-16`.

Expected assertions:

- availability is `active_verified`, canonical state is `confirmed`, duplicate state is `unique`, and freshness is `fresh_0_30`,
- salary lower bound is `$175,000`, equity is present, and upper bound is null,
- case-study input fit is 85/100 with its policy version preserved,
- primary lane is Lifecycle / CRM / Retention,
- deep Braze evidence remains proven, plausible, or missing according to exact approved proof, never inferred from tenure alone,
- unresolved upper compensation and proof questions remain visible,
- next action is the Going proof interview,
- no application submission, outreach, tracker, or other external mutation state is inferred.

## 16. Build Slice And Verification Commands

After Foundation approval and `FS8`, implement in this order:

1. new versioned types and database migration,
2. fail-closed proof and source states,
3. canonical job and integrity adjudication,
4. requirement assessment,
5. Decision Receipt and decision event,
6. immutable asset and approval gates,
7. local event ledger and exact metrics,
8. export, import, deletion, and rollback,
9. TextNow and Going fixtures,
10. selected-screen implementation and visual QA.

Minimum verification from a clean implementation worktree:

```sh
npm ci
npm run typecheck
npm test
npm run lint
npm run build
```

Target the proof, job-integrity, Decision Receipt, asset-state, event, metric, migration, and fixture suites first, then run the full suite.

Static audit note: the staging package has no installed test runner. A targeted attempt stopped with `sh: vitest: command not found`; no existing tests were executed during this contract pass.

## 17. Acceptance Criteria

This contract is ready to enter `FS8` only when:

1. all Foundation chapters 01 through 05 are approved,
2. Matt selects or refines one of the three visual directions,
3. Chapter 05 maps the selected direction to routes, states, and responsive behavior,
4. ClickUp task packets are refreshed and verified after write,
5. P0 scaffold behaviors have explicit replacement tests,
6. the schema and state names are accepted by product, proof, data, and technical leads,
7. local telemetry and later opt-in first-party analytics are not confused,
8. export, import, deletion, migration, and rollback are in the implementation packet,
9. TextNow and Going fixtures are locked,
10. one implementation writer owns the slice.

## 18. Rollback

- This packet is additive and changes no runtime behavior.
- Before any schema migration, export the current local database and verify re-import.
- Keep the old IndexedDB schema readable until the migration completes and the new export verifies.
- If a proof, integrity, approval, or deletion invariant fails, stop the rollout and return to local manual Decision Receipts.
- If networked storage is not tenant-safe, remain local-only and concierge-operated.
- If a selected implementation cannot match the approved visual target and trust states, revert only the implementation branch and retain the validated contracts and case-study evidence.
