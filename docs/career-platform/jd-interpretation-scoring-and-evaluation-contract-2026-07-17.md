# Job Description Interpretation, Scoring, And Evaluation Contract

Date: 2026-07-17
Status: prototype authority; production thresholds require a larger adjudicated corpus

## Leader Decision

The platform must interpret the employer's posting before it compares the job with a person.

The controlling sequence is:

`source capture -> immutable JD interpretation -> canonical-job adjudication -> candidate proof comparison -> gates -> assessment -> recommendation`

This separation fixes the failure pattern Matt experienced. A posting can prove what the employer wrote. It cannot prove what a candidate has done. Candidate history must never alter whether the employer said `required`, `preferred`, `bonus`, or `not stated`.

## Why The Current Contract Needs One More Layer

The existing `RequirementAssessmentVersion` combines the employer requirement with candidate evidence. That is too late to establish a stable reading of the posting. It makes it easy to:

- turn `preferred`, `ideally`, or `bonus` into a hard requirement,
- merge several atomic requirements into one incomplete item,
- collapse alternatives such as `GA4, Mixpanel, or Amplitude` into three mandatory tools,
- treat a responsibility or success outcome as a qualification,
- invent an upper salary bound from `starts at`,
- treat equity eligibility as a granted or valued award,
- confuse the word `equity` in equal-opportunity language with compensation,
- treat benefits omitted from a posting as benefits the employer does not offer,
- use employer language as candidate proof,
- silently resolve source, title, compensation, or availability conflicts.

## Canonical Data Flow

```text
SourceRecord
  -> JobDescriptionSnapshotVersion
      -> JobStatementVersion
          -> JobRequirementVersion
          -> SkillMentionVersion
          -> CompensationPackageVersion
          -> BenefitObservationVersion
          -> LogisticsObservationVersion
          -> ApplicationInstructionVersion
  -> JobSourceObservation
      -> SourceConflictVersion
      -> CanonicalJobVersion

JobRequirementVersion
  -> RequirementAssessmentVersion
      -> ProfileFactVersion
      -> ProofEvidenceVersion
  -> FitDimensionVersion
  -> DecisionReceiptVersion
```

### `JobDescriptionSnapshotVersion`

Required fields:

- snapshot, source-record, and job-observation IDs,
- raw text reference and optional raw HTML reference,
- content hash, language, capture time, observation time, and parser version,
- `captureCompleteness`: `full`, `partial`, `derived`, or `unknown`,
- ordered section spans,
- untrusted-instruction flags.

A partial or derived capture cannot be scored as if it were a complete official posting.

### `JobStatementVersion`

Every meaningful source paragraph or list item becomes a span-addressable statement with:

- exact text, offsets, ordinal, and section heading,
- `statementClass`: `qualification`, `responsibility`, `success_outcome`, `compensation`, `benefit`, `logistics`, `company_context`, `application_instruction`, `anti_fit`, or `noise`,
- actor, polarity, modality, qualifiers, extraction confidence, and review state.

Coverage accounting must reveal unclassified material text instead of silently dropping it.

### `JobRequirementVersion`

Required fields:

- exact source statement and span,
- normalized requirement kind,
- `priority`: `mandatory`, `preferred`, `bonus`, `contextual`, `anti_fit`, or `ambiguous`,
- modality and any minimum, maximum, exact quantity, unit, recency, or scope,
- hands-on versus leadership scope,
- logical group ID and `AND` or `OR` operator,
- alternatives and negation,
- normalized concept IDs,
- extraction confidence and review state.

### `SkillMentionVersion`

Store the raw mention separately from a normalized skill or tool concept. Preserve:

- explicit versus inferred,
- alias and category,
- requirement priority,
- hands-on, proficiency, duration, and recency qualifiers,
- alternative group,
- exact source span.

Inferred skills do not count toward explicit-source recall and cannot become candidate proof.

### `ApplicationQuestionVersion`

Live screening questions are separately sourced requirements. Store exact prompt, response type, required state, options, linked requirements, possible gate effect, and answer state. Do not silently fold Tebra-style yes/no application gates into the JD.

### `CompensationPackageVersion`

Store these components independently:

- base,
- variable compensation,
- bonus,
- commission,
- equity,
- sign-on compensation,
- other compensation.

For each component preserve:

- lower and upper values,
- currency and cadence,
- `disclosureSemantics`: `exact_range`, `starting_at`, `up_to`, `lower_only`, `upper_only`, or `not_disclosed`,
- guaranteed, target, eligible, or unknown state,
- geography and level applicability,
- equity type, amount, vesting, valuation, and explicit unknowns,
- exact source span.

Rules:

1. Null bounds stay null.
2. `Starts at $175,000` yields lower `$175,000` and upper `null`.
3. `Equity eligible` does not prove an award, amount, vesting schedule, or value.
4. `Equity and inclusion`, `health equity`, and equal-opportunity language are not compensation.
5. A percentage bonus is separate from base and remains target or eligibility language unless guaranteed explicitly.
6. A location zone is not applied to the user until their geography is mapped to that zone.

### `BenefitObservationVersion`

Store category, exact text, source span, coverage or match percentages, vesting, leave duration and type, waiting period, employee and dependent applicability, and geography qualifiers.

`offerState` is one of:

- `explicitly_offered`,
- `eligibility_only`,
- `explicitly_absent`,
- `unknown`.

Omitted benefit text maps to `unknown`, never `explicitly_absent`.

### `SourceConflictVersion`

Store field path, conflicting observation IDs, source authority, conflict type and materiality, resolution state, chosen value if adjudicated, rationale, resolver, and dependent invalidations. Material conflicts cannot be resolved silently.

## Assessment And Scoring Contract

### Gates Come Before The Score

A score is diagnostic. It cannot overrule:

- inactive or filled status,
- canonical-employer mismatch,
- duplicate or already-submitted state,
- unavailable or unverified exact requisition,
- legal or authorization incompatibility,
- location, travel, schedule, or employment-type conflict,
- compensation below a hard floor without an explicit exception,
- a decision-critical mandatory requirement that is unresolved,
- an external claim that lacks approved proof.

The user sees the gate and its recovery path before any numeric assessment.

### Version 0.1 Dimensions

The internal assessment uses nine inspectable dimensions totaling 100 points:

| Dimension | Weight | Question |
| --- | ---: | --- |
| Candidate evidence confidence | 20 | Can the user substantively prove the material requirements? |
| Mandate and role-lane fit | 15 | Does the actual work match a defensible career direction? |
| Material upside over Career Baseline | 15 | Is this a meaningfully better move, not merely another job? |
| Compensation and benefits | 10 | Does the applicable, not merely advertised, package meet the user's standard? |
| Hiring plausibility | 10 | Is the user's evidence credible for this employer, level, and mandate? |
| Opportunity integrity | 10 | Is the exact opening canonical, unique, and safely actionable? |
| Career capital and future optionality | 10 | Will this improve skills, scope, signal, network, or later choices? |
| Logistics | 5 | Do location, schedule, travel, work authorization, and employment type fit? |
| Freshness and pursuit effort | 5 | Is the role timely enough and the expected work proportionate to the upside? |

Each dimension keeps its evidence, policy version, rationale, uncertainty, and contribution. The model may classify or explain evidence, but deterministic code applies gates, weights, thresholds, age calculations, arithmetic, and policy overrides.

### Uncertainty Is A Range, Not Fake Precision

Unknown material inputs produce a score interval. They do not receive a neutral midpoint silently.

The default mobile presentation is:

1. plain-language recommendation,
2. strongest reason,
3. main invalidating risk,
4. Career Baseline difference,
5. one next action,
6. numeric score and dimensions inside `Assessment details`.

Show a single score prominently only when evidence coverage is high, no material hard-gate input is unknown, and the confidence policy permits it. Otherwise show language such as `Strong alignment, proof still needed`, plus the provisional range and coverage in details.

### Recommendation Policy

| Recommendation | Policy |
| --- | --- |
| `Pursue` | All non-overridable gates clear, likely score at least 80, evidence coverage at least 85%, and no decision-critical unknown. |
| `Investigate` | A correctable material unknown or conflict remains, a score interval crosses the Pursue threshold, or the likely score is 65-79 with meaningful upside. |
| `Watch` | The role is credible but not currently urgent, sufficiently superior, fresh, or resolved. |
| `Pass` | A disqualifying gate applies, the role is inactive or materially below the career standard, or the likely score is below 60. |
| `Ignore` | Duplicate wrapper, already-resolved noise, or another non-opportunity record. |

These are system recommendations. The user's saved decision remains `Pursue`, `Watch`, or `Pass` and never changes implicitly.

## Prototype Fixture Matrix

| Fixture | Current evidence tier | Adversarial surface | Expected product behavior |
| --- | --- | --- | --- |
| THNKS, Growth Marketer | Extraction gold: full local JD | Required vs `ideally` vs `Bonus Points`; tool alternatives; base plus 10% bonus; hybrid anti-fit; detailed benefits | Complete atomic extraction, correct modality, OR groups, separated compensation components, explicit benefits, and hard logistics. |
| Going, Director, Lifecycle Marketing | Adjudication gold; freeze official raw page before extraction benchmark | `Starts at` pay, unvalued equity, rich benefits, tool/channel depth, employer requirement vs candidate proof | Lower `$175K`, upper null, equity value unknown, score 85 conditional, Investigate until proof gaps resolve. |
| Tebra, Director, GTM Technology | Adjudication gold | Posting/body title conflict, zone pay, variable pay, exact yes/no application gates, category equivalents | Preserve one job with conflict, keep Tennessee pay unresolved, store live questions separately, and never promote adjacent tools to proven. |
| TextNow, Head of Lifecycle Marketing | Negative control | Legacy JD and application render while canonical board omits the role and filled evidence exists | Inactive and canonical-board-absent; Pass/Archive; block Pursuit and assets despite visible legacy form. |
| Lumeris, Director, Lifecycle Marketing & Martech | Provisional until raw official snapshot is frozen | Deep SFMC requirement, regulated-domain experience, broad range, incentive/equity eligibility | Keep SFMC specific, do not treat eligibility as award/value, and keep exact freshness unresolved. |
| Babylist, Director, Revenue Operations | Provisional until raw official snapshot is frozen | Strong title and economics hide a media/ad-revenue mandate; repost date ambiguity | Classify by mandate, separate base/22.5% bonus/equity, keep original date unknown, and recommend Pass despite attractive economics. |
| Finite State, Director, GTM Operations | Provisional until raw official snapshot is frozen | Compensation and benefits absent; weaker publication evidence | Preserve missing economics as unknown and prevent a confident Pursue recommendation. |

THNKS is the only current local artifact ready for immediate span-level extraction scoring. The remaining fixtures are valid policy and interaction fixtures, but their raw official sources must be captured, hashed, and frozen before they become extraction gold.

## Gold-Label Protocol

1. Freeze exact official HTML/text, rendered text, URL, requisition ID, retrieval time, content hash, and source authority.
2. Two annotators independently label employer truth without seeing candidate data or model predictions.
3. A third reviewer adjudicates every critical disagreement involving modality, numbers, geography, availability, canonical source, or hard gates.
4. Target inter-annotator agreement of `kappa >= 0.85` before fixture lock.
5. Freeze the candidate Profile and proof versions separately, then link requirements to verified facts.
6. Label every unresolved value `unknown`; never leave blanks for a model to complete.
7. Build minimal pairs that change one controlling phrase: required/preferred, closed range/starts at, equity offered/equity eligible, canonical present/absent, official date/repost date.
8. Add partial capture, reordered sections, duplicated statements, omissions, and untrusted instructions embedded in job text.
9. Version annotation, parser, prompt, model, scoring policy, adjudicators, unresolved disputes, and expected invalidations.
10. Outcomes may calibrate future ranking but never rewrite what the original source said.

## Prototype Release Thresholds

| Evaluation | Threshold |
| --- | ---: |
| Mandatory qualification and hard-gate recall | 100% |
| Atomic requirement recall / precision | >=97% / >=95% |
| Mandatory/preferred/bonus/anti-fit macro-F1 | >=95%, zero critical inversions |
| Qualification/responsibility/outcome macro-F1 | >=95% |
| Explicit skill recall / precision | >=97% / >=97% |
| Skill normalization accuracy | >=95% |
| AND/OR and alternative grouping on locked fixtures | 100% |
| Compensation component, bound, currency, cadence, and geography exactness on critical fixtures | 100% |
| Invented pay bound, equity value, benefit, or date | 0 |
| Explicit benefit recall / precision | >=98% / >=98% |
| Absent-versus-unknown benefit handling | 100% |
| Canonical source, activity, duplicate, date semantics, and gate decisions | 100% |
| Material conflict recall / silent overrides | 100% / 0 |
| Candidate `proven` precision | 100% |
| Source and proof correction invalidation | 100% of dependents |
| Untrusted-JD instruction obedience | 0 incidents |

Seven jobs are useful adversarial prototype fixtures but not a statistically meaningful confidence-calibration set. Do not publish calibration claims until there are at least 200 independently adjudicated atomic statements across varied employers and formats; expand toward roughly 250 full examples before provider promotion or automated production decisions.

## Failure Codes

| Code | Failure |
| --- | --- |
| `SRC-01` | Partial or derived capture treated as a complete official JD. |
| `SEG-01` | Atomic requirements merged or fragmented incorrectly. |
| `MOD-01` | Mandatory, preferred, bonus, contextual, or anti-fit modality inverted. |
| `SKL-01` | Explicit skill omitted, hallucinated, over-normalized, or OR tools collapsed to AND. |
| `CMP-01` | Pay bound invented, components combined, cadence/currency lost, geography misapplied, or eligibility treated as value. |
| `BEN-01` | Missing benefit text treated as absence or a material qualifier discarded. |
| `CAN-01` | Legacy or aggregator visibility overrides canonical source evidence. |
| `FRS-01` | First seen, repost, or verification time becomes an official publication date. |
| `CON-01` | Material source conflict is silently resolved. |
| `UNK-01` | Missing information is guessed, omitted, or treated as neutral. |
| `LEAK-01` | Employer requirements become candidate proof or candidate weakness changes extraction labels. |
| `PRF-01` | Keyword similarity or a category equivalent becomes `proven`. |
| `GATE-01` | Score or compensation bypasses a hard gate. |
| `INV-01` | Correction fails to stale and recompute dependent objects. |
| `INJ-01` | Instructions embedded in job content alter parser policy or tool behavior. |

## Acceptance Criteria

This contract is satisfied when the prototype can demonstrate:

1. immutable employer interpretation before candidate comparison,
2. visible required/preferred/bonus/anti-fit distinctions,
3. complete and span-linked skill extraction with OR groups preserved,
4. compensation and benefits with explicit unknowns and eligibility semantics,
5. source conflicts and partial captures that fail closed,
6. gates before score,
7. a secondary, inspectable score with uncertainty and a policy version,
8. source-linked correction and downstream invalidation,
9. multiple adversarial jobs with different failure modes,
10. no model, price tier, or capacity fallback weakening the truth floor.
