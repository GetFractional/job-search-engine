# Phase 2 Governance, Promotion, And FS8 Reset Packet

Last updated: 2026-07-17
Status: documentation-ready, implementation-blocked
Primary owner: permanent Job Filter lead thread
Coding owner: none until the gates in this packet clear

## 1. Decision

Phase 2 strategy and validation artifacts are ready for review and controlled promotion. Runtime implementation is not authorized.

The screen system is now defined: Option 1 is a component source, Option 2 provides the dated Radar Brief, Option 3 provides Opportunity Review, and new Radar Setup and Pursuit Application screens remain to be designed. Four independent implementation gates remain:

1. Candidate Chapter 05 material exists only on the quarantined branch. It is absent from the canonical and staging packages and has not been reconciled with Phase 2.
2. Chapters 01 through 05 do not have verified approval receipts.
3. `FS8` has not refreshed the implementation scope for `868huafcx`.
4. ClickUp packets have not been read, mutated, and read back in this run.

The Phase 2 authority packet's implementation phase must therefore be read as: implement after a promoted and approved Chapter 05, chapter approvals, `FS8`, and verified tracker refresh. The completed visual selection removes one decision gate but does not authorize implementation.

## 2. Controlling Evidence

### 2.1 Current governing rule

`docs/product/job-filter-foundation-series-governing-packet-v7.md` states:

- `868hukucf` owns Chapters 01, 02, 03, and 05 plus design governance,
- `868hunzqm` owns Chapter 04 and the public funnel,
- `868huafcx` remains blocked until Chapters 01 through 05 are approved,
- `FS8` must exist,
- the ClickUp packet for `868huafcx` must be refreshed to match `FS8`.

The same packet requires one permanent lead thread, one active coding thread, no build without a packet, and one writer per packet.

### 2.2 Current repo reality

Read-only inspection on 2026-07-16 found:

| Item | Current evidence | Implication |
| --- | --- | --- |
| Canonical remote main | `git fetch --prune origin` completed on 2026-07-17; `origin/main` remained `2a1b2b4f5ee808cb17def805a02516b29271d868` | New promotion work must start from this commit or a later freshly verified `origin/main`. |
| Current checkout | `codex/skill-sync-job-filter-20260513` at `706afbf7dcf9087f5ae5b471e67d6d3ac27a1a50` | Do not use as the promotion base. |
| Divergence | current checkout is 3 commits ahead and 11 behind `origin/main` | It is both stale and divergent. |
| Local work | `.codex/bootstrap.md` modified, 5 insertions and 4 deletions | Preserve as user work; do not reset, overwrite, or mix into Phase 2. |
| Staging package | `/private/tmp/job-filter-authority-stage` is not a git worktree | It is a review bundle, not a mergeable branch. |
| Reference commit | `27580ba` exists on a separate readiness-reset line | Reference only. Never merge or cherry-pick automatically. |

### 2.3 Current artifact reality

Present in staging:

- Foundation Chapters 01 through 04,
- governing packet v7,
- task packets for `868hukucf`, `868hunzqm`, and blocked `868huafcx`,
- Phase 2 authority, business, discovery, data/telemetry/test, and case-study artifacts,
- three current primary-screen visual options.

Present in the user-viewable working hub:

- the selected hybrid visual specification,
- light/dark parity and no-fixed-duration rules,
- the Going proof-validation prefill,
- the repository cleanup and salvage decision.

Missing or unverified:

- a promoted, Phase-2-reconciled Chapter 05,
- verified chapter approval receipts,
- `FS8`,
- live ClickUp state and read-after-write receipts,
- a clean promotion branch,
- a current implementation packet and coding owner.

## 3. Authority Reconciliation

### 3.1 What the Phase 2 packets may supersede

After explicit review and promotion, Phase 2 may refine:

- the public explanation of the product from a generic job-search workspace toward an always-on career decision platform,
- the recurring `Jobs` and `Review` loop,
- the Decision Receipt,
- the economic beachhead and paid offers,
- the canonical-job, freshness, proof, and current-career-baseline wedge,
- the Matt case-study validation path.

### 3.2 What the Phase 2 packets do not supersede by themselves

- Foundation ownership and task gates,
- the `Free tier` program lock,
- auto-apply as future-state only,
- Chapter 04 ownership under `868hunzqm`,
- Chapter 05 approval responsibility under `868hukucf`,
- the `FS8` requirement,
- exact user approval before external action,
- one implementation writer,
- current user changes in the dirty checkout.

### 3.3 Known wording drift to resolve during promotion

| Drift | Current sources | Resolution |
| --- | --- | --- |
| Category language | Chapter 02 says truth-first job-search workspace; Phase 2 uses internal Career Opportunity Intelligence and public always-on career decision platform. | Preserve Chapter 02 trust language. Add the Phase 2 public explanation as a reviewed refinement, not an untracked replacement. |
| Product object | Older PRD centers on Claim ledger and assets; Phase 2 centers on baseline, canonical job, requirements, and Decision Receipt. | Chapter 05 and `FS8` must name the new differentiated vertical slice and explicitly de-prioritize the full asset/tracker workspace. |
| Implementation timing | Phase 2 sequence says implement after visual selection; governing packet also requires chapter approval and `FS8`. | The stricter governing sequence wins. Add the full gate chain to the promoted Phase 2 packet. |
| Telemetry | `docs/COMPLIANCE.md` prohibits third-party telemetry in v1; Phase 2 requires learning instrumentation. | Use a local business-event ledger by default. Any later first-party analytics sync is opt-in, minimized, and disclosed. |
| Timestamp format | Current code uses ISO strings; older schema prose describes Unix timestamps. | Standardize new Phase 2 records on ISO 8601 UTC and repair the schema documentation during `FS8`. |
| Score authority | Current deterministic score has five factors; Phase 2 requires broader inspectable dimensions and gates. | Label the current result `legacy_scoring_v2`; do not silently treat it as the Phase 2 score. |

## 4. Planning Lanes Pending Tracker Verification

WIP cap remains two material streams, but current ClickUp WIP and ownership could not be verified. The rows below are local planning lanes, not claims about tracker truth.

| WIP | Owner | State | Scope | Exit |
| --- | --- | --- | --- | --- |
| WIP 1 | permanent lead thread | active locally | Phase 2 authority, commercial plan, data contract, governance reconciliation, brand screen, and selected visual specification | Phase 2 packets are reviewed for promotion and tracker ownership is verified |
| WIP 2 | job-search lead with Matt | active | Going proof interview and case-study validation | proof interview complete and local pursuit package is approval-ready |
| Code WIP | none | zero | No runtime or schema implementation | Open only after Chapter 05, approvals, `FS8`, tracker refresh, and a clean branch |

Do not open code WIP until the tracker confirms available capacity and ownership. Naming research remains part of the authority stream, not a third implementation stream.

## 5. Exact Missing Decisions And Artifacts

### 5.1 Visual selection record

- Radar Setup: new screen required.
- Dated Radar Brief: Option 2 foundation.
- Opportunity Review: Option 3 foundation.
- Ranked-row and compact Decision Receipt components: Option 1; not a whole screen.
- Pursuit Application and exact approval: new screen required.
- Themes: `System`, `Light`, and `Dark`, with `System` as the default.
- Public copy: no fixed review-duration promise without current, user-specific evidence.

This selection chooses the information hierarchy and interaction model. It is not code approval or Chapter 05 approval.

### 5.2 Chapter 05

Reconcile and promote `docs/product/foundation-series/05-activation-and-core-app.md` under `868hukucf`. A candidate file with this governing name exists on the quarantined branch, but it is not canonical and must not be promoted unchanged.

It must define:

- the passive and active `Profile -> Jobs -> Review -> Pursuit` entry paths,
- where Role Lanes and Career Baseline are created and approved,
- manual job URL capture and monitored-source ingestion,
- canonical employer, source, duplicate, integrity, and freshness states,
- the requirements matrix,
- the selected Decision Receipt hierarchy,
- recommended decision, user override, and one next action,
- loading, empty, error, conflict, stale, unsupported, success, and no-action states,
- desktop, tablet, mobile, keyboard, focus, and responsive behavior,
- exact boundary between native decision and Pursuit work and the approved employer-site handoff,
- no-auto-apply and external-approval boundaries,
- acceptance criteria tied to the selected screenshot and realistic Matt fixtures.

### 5.3 Chapter approval receipts

Each Chapter 01 through 05 requires:

- approving actor,
- approved version or commit,
- approval timestamp,
- accepted open questions or exceptions,
- links to any visual artifacts,
- read-after-write evidence in the owning task.

`active living chapter` is not equivalent to approved.

### 5.4 `FS8`

`FS8` must be a real implementation-reset packet, not a link wrapper. The required contents are in Section 8.

### 5.5 Tracker alignment

ClickUp must be read before mutation, updated only with authorized text, and read back. If the surface remains unavailable, preserve the mutation packet below and report `ClickUp records mutated: No`.

## 6. Proposed ClickUp Mutation Packet

The following is copy-ready intent, not a claim that ClickUp was changed.

### 6.1 Task `868hukucf`

Proposed comment or description update:

> Phase 2 authority and validation work is ready for review. New review artifacts: `phase2-career-opportunity-platform-authority-2026-07-16.md`, `phase2-business-launch-and-validation-plan-2026-07-16.md`, `phase2-customer-discovery-and-paid-beta-script-2026-07-16.md`, and `phase2-decision-receipt-data-telemetry-and-test-contract-2026-07-16.md`. Chapters 01 through 04 are present. A named hybrid visual direction is selected. Candidate Chapter 05 material exists only on a quarantined branch and is not approved. Keep implementation blocked. Next design deliverable: reconcile and promote Chapter 05, record explicit Chapter 01 through 05 approvals, then open FS8.

Proposed checklist:

- [ ] Phase 2 authority reviewed
- [x] hybrid visual direction selected locally; tracker receipt pending
- [ ] Chapter 05 created
- [ ] Chapter 01 approved
- [ ] Chapter 02 approved
- [ ] Chapter 03 approved
- [ ] Chapter 04 approval receipt linked from `868hunzqm`
- [ ] Chapter 05 approved
- [ ] `FS8` opened

Do not mark this task complete merely because the Phase 2 documents exist.

### 6.2 Task `868hunzqm`

Proposed comment or description update:

> Phase 2 commercial strategy introduces an always-on career decision explanation, a free Diagnostic, a $24 Radar test, and a paid Pursuit Sprint. These are proposed inputs to Chapter 04, not an automatic replacement of the approved public-funnel IA. Review the Chapter 04 pricing-entry, proof, CTA, and auth handoff against the Phase 2 packets. Record the accepted refinements and a Chapter 04 approval receipt. Keep implementation downstream blocked until the Foundation gate clears.

Proposed checklist:

- [ ] Phase 2 positioning refinement reviewed
- [ ] free-tier program lock preserved
- [ ] public CTA ladder reviewed
- [ ] pricing remains a test hypothesis
- [ ] Chapter 04 approval receipt recorded

### 6.3 Task `868huafcx`

Proposed comment or description update:

> Keep blocked. Phase 2 has produced strategy, a defined screen system, proof/state audit, data contract, and case-study fixtures, but the implementation reset is not ready. Missing gates: refined Radar Setup, Radar Brief, Opportunity Review, and Pursuit Application concepts; promoted and approved Chapter 05; explicit Chapters 01 through 05 approval receipts; FS8; and a verified task-packet refresh. Do not implement from the current packet or from commit `27580ba`. When FS8 exists, replace this task packet with the approved Profile -> Jobs -> Review -> Pursuit vertical slice, schema migration, exact tests, selected visual targets, and rollback plan.

Proposed dependency state:

- blocked by `868hukucf` Chapter 05 and design approvals,
- blocked by `868hunzqm` Chapter 04 approval receipt,
- blocked by `FS8` packet creation,
- no code owner assigned.

### 6.4 Required mutation receipt

For each task, capture:

- task ID,
- before state,
- fields or comment changed,
- after state from a fresh read,
- timestamp,
- actor,
- links to repo commit or reviewed packet,
- any field that failed to update.

Without this receipt, tracker alignment remains unverified.

## 7. Documentation Promotion Sequence

### Step 1: preserve current work

- Do not edit, reset, stash, or switch the dirty `codex/skill-sync-job-filter-20260513` checkout during Phase 2 promotion.
- Record its branch, HEAD, dirty file, and divergence in the promotion PR.

### Step 2: refresh remote evidence

- Fetch `origin` from the Job Filter repo.
- Reconfirm the current `origin/main` commit.
- Reconfirm that the intended Phase 2 files do not already exist or conflict on main.

### Step 3: create an isolated clean worktree

Use a new worktree and branch from the verified `origin/main`, for example:

```sh
git worktree add ../job-filter-phase2-authority -b codex/phase2-career-opportunity-authority origin/main
```

The exact adjacent path may change. The branch base and isolation rule may not.

### Step 4: promote only reviewed documentation and evidence

Initial documentation PR scope:

- Phase 2 authority packet,
- business launch and validation plan,
- customer discovery and paid-beta script,
- Decision Receipt data, telemetry, and test contract,
- governance and `FS8` reset packet,
- Going and TextNow case-study receipts where they belong,
- selected visual source and the three-option comparison evidence,
- explicit links from the governing or task packets only where approval authorizes them.

Do not include:

- `src/` changes,
- package or dependency changes,
- `.codex/bootstrap.md`,
- skill-sync changes,
- commit `27580ba`,
- unselected visual implementation,
- a brand rename.

### Step 5: review file-by-file

Verify:

- only intended additive files and explicit authority edits are present,
- no stale Going salary maximum appears,
- Going uses 85/100, `$175,000` minimum plus equity, and unknown maximum,
- TextNow is the inactive negative control,
- all Teal and external-action states remain unmutated,
- pricing and names remain hypotheses,
- rollback is file-level.

### Step 6: merge documentation before implementation reset

Merge only after the applicable chapter owners accept the supersession and tracker receipts exist. The documentation PR must not imply that `868huafcx` is unblocked.

## 8. Required `FS8` Implementation Packet

Create `FS8` only after Chapters 01 through 05 are approved.

### 8.1 Objective

Implement the smallest complete `Profile -> Jobs -> Review -> Pursuit` slice that produces an evidence-backed Decision Receipt, separate user decision, native grounded materials, and exact external-action approval without rebuilding an enterprise-scale CRM or the old asset workspace.

### 8.2 Controlling inputs

- then-current `origin/main`,
- governing packet v7,
- approved Chapters 01 through 05,
- selected visual direction and comparison evidence,
- promoted Phase 2 authority,
- promoted data, telemetry, and test contract,
- TextNow and Going fixtures,
- verified ClickUp packets and receipts.

### 8.3 Scope in

1. versioned Profile facts and fail-closed proof states,
2. approved Role Lanes and Career Baseline,
3. manual URL capture,
4. canonical job, duplicate, activity, and freshness adjudication,
5. six-state requirements assessment,
6. inspectable fit dimensions and hard gates,
7. versioned Decision Receipt and separate user Decision Event,
8. one Next Action,
9. local business-event ledger,
10. export, import, deletion, and migration,
11. TextNow and Going fixtures,
12. approved Radar Setup, Radar Brief, Opportunity Review, and Pursuit Application desktop/mobile/keyboard experience,
13. minimal native Pursuit queue and grounded materials,
14. human-readable employer-site execution package only after internal gates.

### 8.4 Scope out

- broad resume-template or advanced design engine,
- enterprise-scale application CRM, contact database, or collaboration suite,
- auto-apply or auto-send,
- broad ATS integrations,
- assumed competitor-product API or runtime dependency,
- production billing,
- unsupervised multi-user storage before tenant and privacy gates,
- final company rename,
- import of `27580ba`.

### 8.5 File shortlist

`FS8` must identify exact files after rebasing on current main. Likely areas include:

- `src/types/index.ts`,
- `src/db/index.ts`,
- versioned migration helpers,
- proof and lineage library,
- canonical-job and integrity library,
- requirements and fit assessment,
- receipt and event store,
- local metric functions,
- Profile, Jobs, and Review routes/components,
- export/import/delete controls,
- targeted fixtures and tests.

The shortlist must be verified against then-current code and not copied blindly from this packet.

### 8.6 Acceptance tests

At minimum:

- unknown proof fails closed,
- unverified numeric proof cannot enter an external asset,
- TextNow cannot receive Pursue or asset work,
- Going preserves 85/100 case input and no invented salary maximum,
- automated requirement matching cannot yield `proven`,
- stale or corrected dependencies invalidate receipts and drafts,
- external copy/export requires an immutable approved version,
- exact action approval is invalidated by any payload or destination change,
- metrics cannot exceed 100 percent,
- export/re-import and complete deletion verify all new entities,
- approved four-screen system comparison passes desktop and mobile QA.

### 8.7 Verification commands

From a clean worktree with dependencies installed:

```sh
npm run typecheck
npm test
npm run lint
npm run build
```

Run targeted P0 and migration tests before the full suite. Capture screenshots only after functionality passes, then compare the selected reference and implementation at the same viewport.

### 8.8 Rollback

- schema migration begins with a verified full export,
- old records remain readable until migration verification succeeds,
- feature flags or route isolation keep the new slice reversible during beta,
- failed proof, integrity, approval, tenant, export, or deletion tests stop promotion,
- local manual Decision Receipts remain the operational fallback.

## 9. Implementation Branch Sequence

After documentation promotion, approvals, `FS8`, and tracker alignment:

1. update local knowledge of `origin/main`,
2. create a new implementation worktree from that exact commit,
3. assign one coding owner,
4. implement schema and state invariants before visual polish,
5. run targeted tests after each coherent slice,
6. build the approved four-screen core system with realistic Going/TextNow data,
7. compare reference and implementation at matched viewports,
8. open one small, coherent PR with no governance or skill-sync drift,
9. merge only after code, visual, proof, accessibility, and rollback checks pass.

Do not code in the dirty checkout, the staging directory, or the reference-only branch.

## 10. Release Gates

| Gate | Owner | Required evidence |
| --- | --- | --- |
| Visual selection | Matt | Option number or explicit hybrid request |
| Chapter 05 | `868hukucf` owner | approved chapter and visual references |
| Chapter 04 | `868hunzqm` owner | approval receipt and accepted Phase 2 refinements |
| Chapters 01 to 05 | chapter owners/Matt | explicit approval receipts |
| Data contract | product, proof, data, technical leads | accepted states, metrics, tests, and migration |
| `FS8` | permanent lead thread | real implementation packet |
| ClickUp | task owners | read-after-write receipts |
| Clean base | technical lead | branch from current `origin/main`, clean status |
| Implementation | one coding owner | targeted and full test evidence |
| Visual QA | design/QA lead | matched reference and implementation comparison |
| External action | Matt | exact approval for the exact job, assets, destination, and submit/send action |

## 11. Current Mutation Receipt

As of this packet:

- Job Filter runtime files changed: No.
- Canonical Job Filter repo files changed: No.
- ClickUp records mutated: No.
- Teal records mutated: No.
- Applications submitted: No.
- Outreach sent: No.
- Branch or worktree created: No.
- Staging documentation added: Yes.

## 12. Risks And Rollback

### Risks

- treating a visual preference as implementation approval,
- promoting strategy without Chapter 05 reconciliation,
- restarting code from the dirty divergent checkout,
- collapsing orthogonal proof or job-integrity states,
- letting local business events become undisclosed third-party telemetry,
- reopening full tracker, asset, or brand scope during the differentiated slice,
- claiming ClickUp, Teal, or application state without read-after-write proof.

### Rollback

- Staging documents and evidence are additive and removable.
- Documentation promotion uses a dedicated branch and file-level commits.
- Runtime implementation stays on a separate later branch.
- The dirty existing checkout remains untouched.
- If a gate fails, close only the attempted WIP and return to the last approved packet; do not discard user work.
