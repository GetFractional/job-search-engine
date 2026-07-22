[Open the laptop-local prototype when the detached QA service is running](http://localhost:3011/#/)

`localhost` is not a durable or mobile-accessible handoff. Start or verify the detached laptop service with `npm run qa:laptop` from `prototypes/worthward-mobile`. Use [QA access instructions](../../../../prototypes/worthward-mobile/QA_ACCESS.md) for Remote, same-Wi-Fi, and on-the-go boundaries.

# My Way Ahead Board Packet

Date: 2026-07-20
Decision state: two initiatives in review
Public release state: not authorized
External job action state: not authorized

## CEO Recommendation

1. Accept the current local build as the **private-alpha candidate for founder review**, not as shipped. Independent Quality passed the corrected current build, and all local verification passes.
2. Advance **Seso, Director of Revenue Operations** as Matt's next-best pursuit, scored 84/100 and classified Pursue. Approve only Seso Gate 1 if the Board wants work to continue: Teal preparation and export of the exact two PDFs, followed by another Board review.
3. Do not approve public hosting, external users, production data, billing, application submission, outreach, references, legal commitments, or any price claim.

## Initiative 1: Private-Alpha Readiness

### Result

- Current source served on fresh local port 3011.
- Terminal Playwright cache permission was repaired, but Chrome still aborted at process launch due the environment. The Codex in-app browser provided a safe, current-build workaround.
- Final evidence exists at 320, 390, 768, and 1280 widths; Light, Dark, and System; core interaction and failure states; exact approval and revocation states; and available accessibility checks.
- Matched visual review preserves the selected Executive Evidence direction. V2 intentionally gives more first-use explanation before the connected timeline, so fidelity is directional rather than pixel-identical.
- Defects corrected:
  - mobile menu now closes on Escape and restores focus;
  - arbitrary URLs now remain explicitly not checked, while only the included sample may show reviewed checks.
- Independent Quality: **PASS for in review; not shipped**.

### Verification

- TypeScript: PASS
- Production build: PASS
- Truth, state, and regression tests: 13 of 13 PASS
- Lint: PASS
- Horizontal overflow: none at the four required widths
- Minimum visible control height: 44 px

### Evidence

- [Evidence register](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/README.md)
- [Matched reference comparison](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/comparisons/reference-vs-current-390x844.jpg)
- [Current 390 x 844 home](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/current-build/home-system-dark-390x844.jpg)
- [Connected timeline start](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/current-build/home-integrity-timeline-system-dark-390x844.jpg)
- [Connected timeline continuation](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/current-build/home-integrity-timeline-tail-system-dark-390x844.jpg)
- [Arbitrary-input truth boundary](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/state-evidence/integrity-arbitrary-url-boundary-390x844.jpg)
- [Sample reviewed boundary](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/state-evidence/integrity-sample-ready-390x844.jpg)
- [Independent verdict](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/independent-verdict.md)
- [Source and test receipt](../../../../prototypes/worthward-mobile/qa/private-alpha-readiness-2026-07-20/provenance/source-and-test-receipt.md)

## Initiative 2: Matt Case Study Zero

### Integrated Recommendation

**Seso, Director of Revenue Operations: 84/100, Pursue, 4-star Teal mapping.** The [canonical Seso Greenhouse requisition](https://job-boards.greenhouse.io/sesolabor/jobs/4700419005) was live with an application form on July 20. It is Remote US and lists $150,000 to $200,000 cash plus equity. Secondary metadata reports a May 30 posting and July 29 deadline, creating a medium-risk 51-day freshness exception rather than a normal fresh-role pass.

Why Seso wins: it has the best combined fit across Revenue and Growth Operations, GTM systems, lifecycle infrastructure, reporting, adoption, practical AI workflows, remote logistics, and target compensation.

What remains disconfirming: Matt's record does not prove Salesforce administration or configuration, direct ARR reconciliation or SaaS forecasting, GTM cost modeling, territory or quota design, compensation-plan ownership, or management of a dedicated RevOps team with the same specialist composition.

### Source-Verified Shortlist

| Rank | Role | Score | Freshness decision | Compensation and logistics | Decision |
|---:|---|---:|---|---|---|
| 1 | [Seso, Director of Revenue Operations](https://job-boards.greenhouse.io/sesolabor/jobs/4700419005) | 84 | About 51 days, live form and stated July 29 deadline support a strategic exception | $150K to $200K cash plus equity; Remote US | Pursue; Gate 1 only |
| 2 | [Happy Money, Head of Lifecycle Marketing](https://job-boards.greenhouse.io/happymoney/jobs/4278658009) | 82 | Direct form live with current hiring activity; exact original date unknown | $155K to $220K base; Remote US | First fallback; larger lending and LTV gaps |
| 3 | [Splitero, Director of Lifecycle Marketing](https://job-boards.greenhouse.io/splitero/jobs/5356775008) | 80 | Direct form live; exact original date not disclosed | $210K to $235K OTE; Remote | Conditional fallback; deep SFMC gap |
| 4 | [Momentus, Senior Director of Revenue Operations](https://recruiting.paylocity.com/recruiting/jobs/Details/4070190/Momentus/Senior-Director-of-Revenue-Operations) | 79 | Direct form live and employer repost about one week ago; 200-plus displayed applicants signals competition | Undisclosed; fully remote | Pursue, but verify pay and scope before assets |
| 5 | [GoCanvas, Director, Marketing Operations](https://gocanvas.applytojob.com/apply/8aP6wYtvEP/Director-Marketing-Operations) | 77 | Direct ATS live with a recent repost signal | $129.4K to $161.8K; Remote; TN eligible | Keep watch; pay and platform gaps |
| 6 | [Built, Director, Revenue Operations](https://job-boards.greenhouse.io/getbuilt/jobs/4709325005) | 76 | Canonical form live; June 25 is secondary metadata; employer repost within about one day | $220K to $240K plus equity; Nashville hybrid | Reach bet only; multiple mastery-level gaps |

### Claim-Safe Package

- [Research and decision receipt](../../../../applications/professional-lanes/seso-director-revenue-operations/research-and-decision-receipt.md)
- [Resume strategy and copy-ready draft](../../../../applications/professional-lanes/seso-director-revenue-operations/resume-strategy-and-copy-ready-draft.md)
- [Cover-letter draft](../../../../applications/professional-lanes/seso-director-revenue-operations/cover-letter-draft.md)
- [Application answers and exact-action packet](../../../../applications/professional-lanes/seso-director-revenue-operations/application-answer-and-exact-action-packet.md)
- [Interview pack](../../../../applications/professional-lanes/seso-director-revenue-operations/interview-pack.md)

Independent package QA returned PASS after one revision that separated Teal preparation, Greenhouse staging, and submission into three distinct approval gates. The Markdown drafts are not Teal-optimized or uploadable PDFs. No Teal, Greenhouse, outreach, reference, or application mutation occurred.

## Economics

No demand, conversion, acquisition-cost, retention, fulfillment-cost, or contribution result has been observed. Every offer and unit target remains a private hypothesis.

### Software Hypotheses

| Offer | Price hypothesis | Billing boundary | Economic guardrail |
|---|---:|---|---|
| Try It Free | $0 | No card | Acquisition cost target below $2 |
| Active Search | $99 | 30 days, no automatic renewal | Variable cost at or below $19.80 |
| Keep Watch | $24 monthly or $59 for three months | Recurring only if explicitly selected | Variable cost at or below 20 percent of revenue |

### Human-Service Hypotheses

| Offer | Price hypothesis | Fulfillment boundary | Economic guardrail |
|---|---:|---|---|
| Expert Decision Review | $199 | Contextual human review, separate from software | Direct contribution at or above 40 percent |
| Guided Help | $499 bounded beta; $699 fuller hypothesis | Tightly bounded scope with no hidden labor | Direct contribution at or above 40 percent |

Software and human-service demand and economics must remain separately measured. No public price, charge, purchase, payment flow, or spending decision is approved.

## ClickUp Readback Receipt

Read before write, write, and read after write were completed in the isolated My Way Ahead lists.

- [Private-Alpha Readiness task](https://app.clickup.com/t/868ke7y0a): `in review`; evidence comment content read back; write receipt `90110253420842`.
- [Matt Case Study Zero task](https://app.clickup.com/t/868ke7y7a): `in review`; decision comment content read back; write receipt `90110253420843`.
- The other five tasks in the three isolated lists remain `backlog`.
- Active WIP count: exactly 2.
- No legacy Job Filter list was mutated.

## Unresolved Risks

1. Physical iPhone Safari, native full Tab order, actual 200 percent zoom, runtime reduced-motion, VoiceOver or other screen-reader use, safe-area behavior, and real network behavior are not proven.
2. The prototype is synthetic and local. It does not validate live job ingestion, model quality, application execution, payment, privacy operations, or customer demand.
3. My Way Ahead remains provisional. Domain control and legal clearance are unproven.
4. The prototype and current evidence are hash-addressed but untracked in Git. The active worktree is dirty with unrelated user work, so no clean commit, push, or PR was attempted.
5. Seso may close before the three approval gates finish. The July 29 deadline is secondary metadata and must be refreshed.
6. Seso may treat Salesforce, Finance, and sales-planning gaps as hard gates rather than delegable specialist work.
7. All economics are hypotheses. Software and human-service economics cannot be blended to hide labor or model cost.

Rollback is straightforward: stop the local server, restore the two ClickUp statuses if the Board rejects the review state, retain the two comments as an audit log, make no employer or Teal mutation, and revert only the two scoped source corrections if the Board rejects the candidate.

## Exact Board Approvals Requested

### Approval A: Temporary Same-LAN iPhone Checkpoint Only

**Approve starting a temporary local-network server from the current hash-addressed source with `npm run qa:lan`, exposing port 3013 at the Mac's current address from `ipconfig getifaddr en0` only to devices on the same trusted local network, using synthetic data only, at $0 cost, solely for Matt's physical iPhone Safari, safe-area, touch, native zoom, reduced-motion, and VoiceOver review. Stop the foreground server after the checkpoint. Do not deploy publicly, recruit users, connect production data, enable billing, or publish a price. If the host IP, source hash, visibility, or cost changes, return to the Board before starting.**

### Approval B: Seso Gate 1 Only

**Approve Seso-specific Teal preparation and PDF export only: refresh or create the canonical Seso record, confirm it is not already applied or duplicated, move it to Applying, create or open the role-specific resume in Teal, review Job Matcher and Analyzer, optimize only truthful content with global-update controls off, generate and export `Seso - Director of Revenue Operations - Matt Dimock - Resume.pdf` and `Seso - Director of Revenue Operations - Matt Dimock - Cover Letter.pdf`, run claim-safety and file QA, then stop and return the exact two PDFs, proposed answers, and canonical destination for Board review. Do not open, populate, upload to, or submit the Greenhouse form.**

### Approval C: Clean Code Provenance Only

**Approve isolating the current My Way Ahead source, fresh evidence, and Board packet from unrelated work on a clean branch based on current `origin/main`, then creating a draft pull request for provenance review only. Exclude all unrelated workspace changes. Do not merge, deploy, publish, or change production.**

Approvals may be granted separately. Silence or a general `continue` does not authorize any reserved action.
