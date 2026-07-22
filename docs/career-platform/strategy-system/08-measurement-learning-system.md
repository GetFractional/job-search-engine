# 08 Measurement and Learning System

> **Current authority, 2026-07-21:** The measurement hierarchy remains controlling. Any Pro, Expert Review, Guided, or earlier Radar cohort labels below are historical aliases only. Current offer versions, CM1/CM2 definitions, cohort maturity, MRR treatment, refund controls, and separate software, affiliate, and human-service ledgers are governed by the [Unit Economics Ledger](../company-os/my-way-ahead-unit-economics-ledger-2026-07-21.md).

## Measurement decision

The company outcome is a materially better career move. That outcome is slow, confounded, and impossible to attribute honestly in an early cohort. The operating North Star is therefore:

> **Trusted career decisions that change, confirm, or prevent a consequential user action.**

This is not a vanity count. A trusted decision requires a complete eligible source, the minimum approved Career Baseline, a reviewed Decision Receipt, visible uncertainty, and a user-confirmed decision or meaningful correction. A generated score does not count.

The measurement hierarchy is:

| Layer | Question | Governing measure |
|---|---|---|
| User outcome | Did the person make a materially better move? | Observed move, compensation, job quality, trajectory, and user-reported outcome, with no causal overclaim |
| Operating North Star | Did the system improve a consequential decision? | Trusted decisions that changed, confirmed, or prevented action |
| Commercial | Will qualified customers subscribe or buy expert help, and can the company deliver profitably? | Collected revenue, monthly and three-month conversion, renewal, direct contribution, refund, operator burden |
| Product | Can a user reach value with acceptable effort and correction? | First-decision completion, setup burden, correction, comprehension, support |
| Intelligence | Are source, extraction, gates, and uncertainty reliable? | Source coverage, critical-field error, false-active, abstention, human-review change |
| Retention | Does value recur without manufacturing activity? | Repeat decisions, monthly renewal, three-month activation and renewal, reactivation, no-action usefulness |
| Guardrails | Did the system preserve truth, privacy, control, and billing fairness? | Unsupported claims, unapproved actions, privacy incidents, source false-active, billing complaints |

Qualified interviews, offers, accepted compensation, and time to hire remain lagging observed outcomes. They do not replace the operating North Star and are not attributed to the product without an appropriate research design.

## Measurement principles

1. Every rate has an eligible cohort, intersection numerator, observation window, exclusions, owner, and source.
2. Every dashboard shows numerator and denominator beside a percentage.
3. Immature cohorts remain separate from mature cohorts.
4. Corrections append events and supersede interpretations; they do not rewrite history.
5. Small cohorts are reported as counts with material exceptions, not as false statistical certainty.
6. No-action value counts only when the user explicitly confirms that restraint saved effort or improved confidence.
7. Founder labor is an economic cost even when no cash leaves the company.
8. Local prototype interaction is not customer behavior, demand, or retention evidence.

## Canonical cohort definitions

| Cohort | Entry | Maturity | Exclusions |
|---|---|---|---|
| Qualified prospect | Fits the current functional, experience, compensation, urgency, and live-opportunity criteria | At offer decision | Duplicate, unqualified, free-advice-only, or no real decision |
| New decision user | Starts an Integrity Preview on one canonical opportunity | After the defined first-decision window closes | Test, operator, duplicate, and synthetic accounts |
| Activated user | Reviews a decision-complete Receipt and accepts or materially corrects it | At first trusted decision | Generated but unreviewed scores |
| Paid expert add-on | Collected payment for the disclosed Expert Review or Guided scope | After delivery and refund window | Complimentary, barter, hidden discount, or uncollected intent |
| Monthly subscription cohort | Pays the full monthly product price and is eligible for repeated decisions and at least one complete monitoring cycle | After month two can be observed | Paused, failed delivery, complimentary extension, or refunded billing failure |
| Three-month subscription cohort | Pays the full three-month product price and is eligible for the same product entitlement | After the term and any renewal window mature | Complimentary, hidden discount, failed delivery, or refunded billing failure |
| Mature pursuit | Reaches the minimum elapsed stage window or a terminal confirmed outcome | Defined per stage before analysis | In-progress cases too young to receive the outcome |

## Event contract

Prototype events remain local and contain no raw resume, job description, contact, compensation narrative, or free-form career content. Production events require first-party, opt-in collection, enumerated properties, tenant isolation, idempotency, export, and deletion.

| Event | Trigger | Minimum safe properties |
|---|---|---|
| `need_selected` | Visitor chooses the current decision mode | mode, synthetic flag |
| `integrity_preview_started` | One role enters the free check | source class, capture method, synthetic flag |
| `integrity_preview_reviewed` | Visitor reaches the complete free result | canonical state, availability, unknown count |
| `account_save_started` | Visitor chooses to save the result | prior preview state |
| `account_created` | Identity system confirms the account and current consent version | acquisition source, consent version, synthetic flag; no identity value in analytics payload |
| `service_path_selected` | User chooses Free, Pro Monthly, Pro 3-Month, Expert Review, Guided help, or an authorized experiment | offer version, path, price-test identifier |
| `baseline_approved` | Minimum baseline version is approved | completeness band, hard-constraint count |
| `decision_receipt_reviewed` | User finishes required Receipt review | recommendation, unknown count, gate state |
| `decision_corrected` | A material source, baseline, evidence, or recommendation input changes | correction class, affected state, no raw text |
| `decision_committed` | User records Pursue, Watch, or Pass | system recommendation, user decision, override flag |
| `pursuit_started` | User intentionally begins one Pursuit after any required service and payment gate | opportunity state, path, paid entitlement state |
| `action_impact_confirmed` | User says the decision changed, confirmed, or prevented an action | impact type, confidence band |
| `offer_presented` | Qualified prospect receives exact paid scope and price | offer, price test, source |
| `payment_collected` | Payment provider confirms collection | offer, amount band, cohort; no card data |
| `operator_work_logged` | Operator completes a defined delivery stage | stage, minute band, revision count |
| `radar_brief_reviewed` | User reviews a material or no-action Brief | surfaced count, no-action flag, usefulness response |
| `external_action_approved` | User approves one exact payload and destination | action class, payload fingerprint, destination class |
| `outcome_recorded` | User confirms a search-stage outcome | outcome type, stage, confirmation type |
| `trust_incident_opened` | A stop-event or material near miss is found | severity, class, affected-version count |

## Metric dictionary

| Metric | Numerator | Denominator | Window and source | Owner and decision use |
|---|---|---|---|---|
| Integrity Preview completion | Eligible previews reviewed | Eligible previews started | Same session or saved return; local or first-party events | Product; diagnose front-door friction |
| Trusted first-decision rate | New decision users with one reviewed Receipt, committed decision, and accepted or material correction | Eligible new decision users | Predeclared first-decision window; versioned events | Product and customer success; activation gate |
| Consequential action impact | Trusted decisions explicitly confirmed to change, validate, or prevent an action | Trusted decisions reviewed | At decision and follow-up | Product; North Star numerator |
| Decision correction rate | Reviewed Receipts with a material factual or policy correction | Reviewed Receipts | By model, source, field, and cohort | Intelligence lead; separate useful user preference from system error |
| Critical source coverage | Reviews with canonical employer, exact requisition, availability, and explicit freshness state | Reviews eligible for a decision | At Receipt generation | Source lead; no score can hide missing coverage |
| False-active rate | Jobs labeled active-verified that authoritative evidence shows were inactive at decision time | Active-verified jobs later adjudicated | Show count, denominator, and confidence bound | Trust lead; any critical false-active pauses acquisition |
| Unsupported-claim incidents | External payloads containing material without approved evidence lineage | External payloads | Continuous | Trust lead; target zero observed with sample size |
| Unapproved-action incidents | External actions without a matching valid approval record | External actions | Continuous | Trust lead; target zero observed with sample size |
| Paid-offer conversion | Qualified users who pay the exact presented subscription or expert offer | Qualified users presented that offer | Separately by monthly, three-month, Expert Review, Guided, offer version, and acquisition source | Growth; paid-demand and packaging gates |
| Direct contribution | Collected revenue minus payment, model, source, attributable operator, support, and refund cost | Collected revenue | Per case and cohort | Finance; build and pricing decisions |
| Operator burden | Active operator minutes plus revision count | Delivered review or Sprint | By delivery stage | Delivery; automate only stable repeated work |
| Head-to-head preference | Qualified participants choosing this decision output as more useful and trustworthy | Participants completing both blinded or counterbalanced tasks | Same jobs and comparable states | Research; RoleWorth and generic-card differentiation test |
| Monthly subscription renewal | Full-price monthly users who renew month two | Full-price monthly users eligible to renew | Monthly cohort | Retention; compare with three-month activation and later renewal |
| Three-month plan completion | Three-month subscribers who remain active, reach at least one trusted decision, and do not refund | Full-price three-month subscribers whose term matured | Three-month cohort | Commercial and retention; test whether commitment improves activation without increasing regret |
| No-action usefulness | Reviewed zero-opportunity Briefs explicitly confirmed useful | Reviewed zero-opportunity Briefs | Per monitoring cycle | Retention; prevents activity theater |
| Time saved per decision | User's pre-recorded baseline effort minus measured active decision effort | Decisions with both valid measures | Exclude pauses where measurable | Research; never claim without paired baseline |
| Application-to-stage outcomes | Distinct submitted canonical jobs reaching each confirmed stage | Mature submitted canonical jobs in the same cohort | Stage-specific maturity windows | Career outcome; observed association only |

## Baseline readiness

Before the system claims improvement for a case, capture:

- the action the user expected to take without the product,
- starting confidence and principal uncertainty,
- expected and then measured active effort,
- current compensation, benefits, job quality, constraints, and target outcome when relevant,
- tools or people the user would otherwise use,
- the exact version of the opportunity and source state.

Missing baseline data does not block useful delivery. It blocks comparative claims.

## Initial experiment portfolio

| Experiment | Primary question | Primary measure | Continue signal | Stop or change signal |
|---|---|---|---|---|
| My Way Ahead brand screen | Does the complete three-word name create personal career-direction meaning without navigation, counseling, wellness, recruiting, or superiority confusion? | Hear-once spelling, retention of `My`, five-second category inference, confusion, emotional safety, 24-hour recall, and domain retrieval | At least 16 of 20 spell it and retain `My`; 12 infer career decisions or better opportunities; no more than four materially misclassify it; no more than three infer superiority; 14 recall it after 24 hours; 16 reach the domain within two attempts | Users regularly drop `My`, misclassify the category, cannot retrieve the domain, or formal clearance identifies material risk |
| RoleWorth head-to-head | Does baseline-relative expert judgment create value beyond current decision-first software? | Decision change, trust, comprehension, setup burden, willingness to pay | A material majority identifies and will pay for the additional job | Outputs are perceived as equivalent or inferior |
| Canonical front door | Does role-first Integrity Preview outperform broad career diagnosis for the beachhead? | Preview completion to saved account and deeper Review intent | Role-first path produces clearer first value with no trust loss | Users need direction before they can supply a role |
| Free first decision | Does one complete self-serve decision prove enough value to earn trust and a paid continuation? | First-decision completion, correction, action impact, and subscription conversion | Users complete and can explain the decision, while a meaningful paid continuation emerges | The decision is not understood, requires hidden human rescue, or does not create paid intent |
| Guided Career Move | Can expert delivery create contribution and repeatable value without hiding weak software? | Action impact, operator burden, contribution, trust defects, and product-rescue rate | Ten paid cases, acceptable burden and contribution, and declining hidden rescue | Negative contribution, non-repeatable judgment, or expert work consistently compensates for product failure |
| Subscription packaging | Does a transparent three-month option improve collected cash and activation without increasing refund or billing distrust? | Plan mix, activation, refund, support, term completion, stated price clarity | Three-month buyers activate at least as well as monthly buyers and billing complaints do not rise | Savings confuse, regret/refund rises, or usage collapses after purchase |
| Monitoring | Does selective recurring value survive no-opportunity periods? | Month-two renewal, three-month term completion, no-action usefulness, irrelevance | Renewal and value remain credible without manufactured activity | Activity must be manufactured or renewal fails |

Every experiment records the question, segment, journey stage, prior belief, source, sample, exact treatment, observation window, primary measure, guardrails, result, limitations, decision, owner, and next test. Choose one primary measure before observing results. Exploratory findings may guide later tests but may not be relabeled as the original success criterion.

## Causal and claims standard

- `Observed after using` is allowed when the event is verified.
- `Associated with` requires a clear cohort and comparison.
- `Improved`, `increased`, `reduced`, `accelerated`, or `caused` requires a design capable of supporting that inference.
- Founder and synthetic cases demonstrate method behavior, not general efficacy.
- Zero observed incidents must always include the number of eligible cases or actions reviewed.

## Data quality and dashboard QA

Before a metric is decision-usable:

1. event producers are versioned and idempotent,
2. test and synthetic records are excluded,
3. numerator is a subset of the eligible denominator,
4. deletion and correction propagate correctly,
5. cohort maturity is visible,
6. counts reconcile to case records,
7. missingness and late events are reported,
8. the metric owner signs off on definition changes.

The Founder Strategy Center shows only a small decision surface:

- qualified prospects, offers, and collected payments,
- trusted decisions and action impact,
- direct contribution and operator burden,
- source and critical-field quality,
- trust incidents,
- one current experiment decision.

## Cadence

- Weekly: review cases, experiments, defects, operator burden, cost, and one next decision.
- Monthly: review mature cohorts, paid conversion, contribution, repeat value, and source or model drift.
- Quarterly: revisit beachhead, category, pricing, buy-versus-build choices for commodity infrastructure, and strategy assumptions.
- Event driven: pause and investigate any unsupported external claim, unapproved action, critical false-active role, privacy or security incident, or misleading billing state.
