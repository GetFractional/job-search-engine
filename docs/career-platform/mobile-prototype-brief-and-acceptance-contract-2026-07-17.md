# Mobile Prototype Brief And Acceptance Contract

Date: 2026-07-17
Status: working prototype built; private phone-accessible publishing awaits share-target confirmation

## Outcome

The prototype proves the smallest trustworthy customer loop:

`Career Baseline -> Opportunity Radar -> Radar Brief -> Opportunity Review -> proof correction -> user decision -> Pursuit -> exact external approval`

It is mobile-first because recurring monitoring and triage should work comfortably on a phone. It is not mobile-only. Dense comparison and future long-form asset editing may use more desktop space without changing the underlying information or safety contract.

Working code: [`prototypes/worthward-mobile`](../../prototypes/worthward-mobile/)

## What Is Implemented

### Core task routes

| Route | Job to be done | Key behavior |
| --- | --- | --- |
| `#/profile/baseline` | Define what a better move must improve | Shows economics, role lanes, logistics, optionality, and source health. |
| `#/jobs/radar/setup` | Define what deserves recurring attention | Saves lanes, economic preferences, logistics, freshness, cadence, and notification behavior. |
| `#/jobs/radar` | Decide whether anything deserves attention now | Supports material-opportunity, honest no-action, source-conflict, loading, partial, capacity, error, and offline/cached states. |
| `#/jobs/opportunities` | Triage every reviewed job | Filters a seven-job collection without duplicating detail-screen decisions. |
| `#/jobs/review/:job` | Understand one opportunity and decide | Leads with recommendation, reason, risk, baseline change, and next action; score stays in details. |
| `#/pursuits` | See work the user intentionally started | Separates a Pursue decision from an application or message. |
| `#/pursuits/demo/application` | Review one exact outgoing payload | Uses a synthetic employer and invalid domain so approval behavior can be tested without external action. |
| `#/settings/appearance` | Choose appearance and inspect the local data/AI contract | Preserves identical evidence, meaning, order, and controls across themes; explains what stays local today and what future provider calls must disclose. |

### Interactive states

- light, dark, and system appearance with persisted preference,
- Radar setup with staged drafts, focused validation, save, local persistence, and return-to-brief behavior,
- material, no-action, conflict, loading, partial, capacity, budget, validation-failure, error, and offline Radar Brief states,
- opportunity filters,
- multiple job reviews,
- source and interpretation inspection,
- requirement-level source inspection and correction reporting,
- gate-linked proof-question review with explicit local-draft restoration,
- correction-driven invalidation of affected proof, score, recommendation, Radar placement, and preparation,
- inspectable legacy assessment status, with dimensions withheld until independently adjudicated,
- user decisions: Pursue, Watch, Pass,
- inactive-opening Pursue block,
- Pursuit queue,
- package previews,
- exact synthetic approval with explicit scope, payload-bound authorization, approval revocation on package change, handoff confirmation, payload-bound receipt, and an honest unconfirmed outcome,
- live-region and toast feedback,
- modal focus trap, Escape close, and trigger-focus restoration.

## Fixture Matrix In The Prototype

| Job | Product challenge exercised | Expected behavior |
| --- | --- | --- |
| Going | `Starts at` salary, unvalued equity, derived benefits receipt, candidate proof questions | Investigate; lower salary only; upper null; equity offered and value separate; four gate-linked proof questions. |
| Tebra | Posting/body title conflict, geographic pay zone, variable pay, five application gates | Conflict stays visible; Tennessee pay is unresolved; salary, variable pay, equity, and application prompts remain separate. |
| THNKS | Required versus `ideally` versus bonus, tool alternatives, hybrid anti-fit | Correct modality and OR-group language; material hands-on and schedule risks stay visible. |
| Lumeris | Tool-specific knockout and incentive/equity eligibility | No substitution of generic CRM experience for SFMC; eligibility does not become value. |
| Babylist | Strong title/economics but specialized ad-revenue mandate | Pass despite attractive economics; mandate outranks title matching. |
| TextNow | Legacy form while canonical opening is inactive | Score suppressed; Pursue disabled; return-to-collection action. |
| Finite State | Relevant mandate with absent compensation and benefits | Economics remain unknown; Watch instead of fabricated certainty. |
| Cedarfield | Synthetic approval-ready application | Demonstrates package, destination, approval, and receipt boundaries without a live employer. |

Only THNKS is currently ready for span-level extraction benchmarking from a complete local JD. The other real-role fixtures are policy and interaction fixtures until official raw source snapshots are frozen and hashed.

## Truth And Trust Decisions

1. Employer interpretation is frozen before candidate comparison.
2. Employer language never becomes candidate proof.
3. `Required`, `preferred`, `bonus`, `anti-fit`, `AND`, and `OR` relationships remain inspectable.
4. Base, variable pay, bonus, commission, and equity are separate components.
5. `Equity` in equal-opportunity or health-equity language is never compensation.
6. Omitted compensation or benefits remain `unknown`, not zero or absent.
7. Recommendation, user decision, workflow action, and external approval are distinct states.
8. A score cannot overrule a gate and is not the leading mobile decision element.
9. Capacity or model failure queues analysis or preserves unknowns; it never lowers the truth standard.
10. The customer product contains no Teal dependency.
11. A pending correction makes every dependent surface visibly stale; it never silently preserves a current-looking score or recommendation.
12. Opportunity integrity and extraction-evidence tier are separate labels. A complete local JD is not proof that an opening is still active.

## Mobile Acceptance Evidence

Verified in the user's Chrome session on 2026-07-17:

- widths `320`, `390`, `768`, and `1280` produced document, body, and main-content widths equal to the viewport,
- no horizontal spill at any tested width,
- visible mobile controls measured at least `44px` high; bottom navigation measured `65px`,
- light and dark modes retained identical route structure, labels, status text, and controls,
- Radar setup saved and returned to a material brief,
- default material mode accounted for all seven fixtures exactly once: `1` Surfaced, `2` Suppressed, `4` Unresolved,
- a pending Going correction changed the same partition to `0` Surfaced, `2` Suppressed, `5` Unresolved without promoting a fallback,
- no-action mode surfaced `0` of `7` and derived its unresolved copy from the same accounting state,
- abandoned Radar edits did not mutate the saved baseline; invalid economics focused and scrolled the validation summary; a valid save persisted,
- Going Pursue saved intent only while its evidence gate continued to block preparation,
- Going Pass and Watch retained their own next actions while a correction remained independently queued,
- Going proof review restored four saved local answers after reload without promoting them to Proven,
- Tebra preserved a source conflict and kept five application prompts outside the job-description requirement list,
- THNKS remained Watch with unverified availability, three atomic anti-fit statements, and a separate office requirement,
- TextNow disabled Pursue while inactive,
- synthetic approval stayed disabled until its exact-scope checkbox was selected,
- approval remained local, a package change revoked it, handoff required visible confirmation, and an unconfirmed outcome never became a submission,
- package Preview and Review controls opened real prototype sheets,
- no product network calls occurred; a Vinext development-overlay `ResizeObserver` notice appeared during hot reload, while the production build and server-render checks remained clean. Chrome-extension UI and message-channel behavior were kept outside product claims.

Automated gates:

- TypeScript type check, including the hosting-worker boundary,
- production build,
- ESLint,
- server-render contract,
- interpretation/proof/approval separation assertions,
- exhaustive fixture accounting and correction invalidation assertions,
- gate-to-requirement linkage and decision-precedence assertions,
- no Teal or fixed-minute customer copy,
- responsive and modal accessibility safeguards.

The automated suite currently passes `8/8` contract tests after typecheck and a production build; ESLint also passes. Independent read-only re-audits passed for interaction semantics, truth/scoring contracts, and mobile accessibility readiness for private testing. A same-canvas, `1440 x 1024` comparison against the preferred Option 3 reference is recorded in [`prototypes/worthward-mobile/design-qa.md`](../../prototypes/worthward-mobile/design-qa.md). The implementation deliberately retains its clear hierarchy while removing unsupported factor bars, the fixed review-time claim, duplicate decisions, an invented compensation ceiling, and product-facing competitor language.

## Deliberately Out Of Scope

- live source ingestion,
- production model or provider calls,
- final ranking calibration,
- real application form automation,
- email or LinkedIn outreach,
- file uploads or downloads,
- interviews, offers, and negotiation workspaces,
- billing,
- public landing page,
- final brand identity,
- all 21 production screen families.

## Next Validation Gates

1. Publish privately to the selected share target so Matt can test on his phone.
2. Run five moderated task tests: Radar setup, no-action comprehension, Going review, correction flow, and approval boundary.
3. Require 100% comprehension that Pursue does not submit and that exact approval applies to one payload and destination.
4. Freeze and double-annotate the remaining official JD sources.
5. Expand beyond the policy fixtures to at least 200 adjudicated atomic statements before promoting an extraction model.
6. Benchmark qualified low-cost and strong-model routes against the same gold suite.
7. Start the concierge first-user workflow with Matt's four Going proof questions as the first auditable case-study input.
