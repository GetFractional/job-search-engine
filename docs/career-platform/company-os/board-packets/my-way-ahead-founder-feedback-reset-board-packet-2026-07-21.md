[Open the current laptop or Remote-host prototype](http://localhost:3011/#/)

The link above is the corrected local P0 test harness. It is healthy on port 3011, but it is not the founder-accepted redesign. The Mac host side is independently ready for ChatGPT Remote; Matt still needs to complete one physical phone-to-host readback. Tapping a `localhost` link in iPhone Safari points back to the phone and will fail. See the [QA access runbook](../../../../prototypes/worthward-mobile/QA_ACCESS.md).

# My Way Ahead Founder Feedback Reset Board Packet

Date: 2026-07-21
Company WIP: exactly two active initiatives
Product state: visual-direction decision required; broad redesign not accepted
Public release, production data, billing, partnership, and external-user state: not authorized
External job action state: not authorized

## CEO decision

Reset My Way Ahead from a job-checker-first prototype to a **path-first, software-first career decision and pursuit system**.

The product should help a person understand where their evidence can credibly take them, find the few jobs capable of improving pay, time, growth, or stability, and build the strongest honest case for the jobs they choose. Checking a known job remains useful, but it becomes the secondary entry path.

The current prototype is not emotionally or structurally accepted. The founder's critique is correct: the promise is too transactional, the timeline does not compartmentalize decisions well, the route after plan selection is confusing, the shell is inconsistent, several controls repeat intent, the commercial model assumes human fulfillment the company cannot provide, and the prior passive-monitoring price was not grounded strongly enough.

## Initiative 1: Private-Alpha Reset

### Governing promise

- Kicker: **You are more than your last job title.**
- Headline: **Find the work that moves your life forward.**
- Explanation: My Way Ahead reveals credible career paths, finds and verifies better-fit jobs, and helps the user make the strongest honest case.
- Primary action: **Find better-fit jobs for me.**
- Secondary action: **Check a job I found.**
- Trust line: **Private by default. No invented experience. Nothing is sent without your approval.**

The governing product, journey, schema, offer, acquisition, and approval contract is the [Founder Feedback Product Reset](../../strategy-system/16-founder-feedback-product-reset-2026-07-21.md).

### Minimum-click journey

1. Choose the desired change: work soon, a meaningfully better job, a career change, or quiet readiness.
2. Import or enter experience through resume, LinkedIn PDF or export, manual entry, or consented voice transcription.
3. Review only uncertain, conflicting, or inferred facts and confirm the Job Standard.
4. See every evidence-supported career path, scored as ready now, credible with a bridge, or not yet supported.
5. Choose a primary path and any additional watched paths.
6. Land directly on Way Ahead Home with matching jobs, gaps, the current plan, and one recommended next action.
7. Assign master, path-specific, or job-specific resumes; reuse evidence bullets and skills; prepare claim-safe pursuit materials under explicit approval.

There is no second confirmation for a decision the user already made. The stable logged-in shell keeps Home, Jobs, Paths, Pursuits, Profile, and Settings available in one predictable menu.

### P0 corrections already made

- Removed the persisted validation-failure fixture and customer-facing scenario controls that produced Matt's screenshot.
- Removed customer-visible local source-file and repository paths and added a production-bundle leakage test.
- Removed the duplicate selected-theme checkmark.
- Changed commute preference from minutes to miles; schedule is optional and purpose-specific.
- Removed the duplicate plan confirmation and routed the chosen plan directly to jobs.
- Made unknown routes return to Home instead of an unrelated sample opportunity.
- Preserved QA scenarios only through temporary non-persisted query state.

The attached screenshot therefore showed a **QA fixture**, not a new current employer-analysis failure. The last trusted result behavior was correct; exposing the fixture in customer Settings was not. The banner now says the latest job check could not finish, preserves the last trusted scores and recommendations, and tells the user to open a job to review what still needs verification.

### Current visual evidence

- [Founder reset evidence register](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/README.md)
- [Current mobile landing](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/01-mobile-current-landing.png)
- [Strongest current full-row choice pattern](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/02-mobile-current-intent-choice.png)
- [Current career-path screen](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/06-mobile-current-career-paths.png)
- [Corrected Settings](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/14-mobile-corrected-settings.png)
- [Corrected Job Standard and page context](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/15-mobile-corrected-job-standard.png)
- [Corrected commute section](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/16-mobile-corrected-commute-miles.png)
- [Commute choices and visible focus](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/17-mobile-corrected-commute-options.png)
- [Final-source mobile Light evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/54-final-source-light-390.png)
- [Final-source keyboard menu, overflow, target-size, Escape, and focus-restoration evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/58-final-source-keyboard-menu-390.png)
- [Final-source mobile Dark state](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/55-final-source-dark-settings-390.png)
- [Final-source mobile System state](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/56-final-source-system-dark-settings-390.png)
- [Final-source 320-pixel System evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/49-final-source-system-dark-320.png)
- [Final-source tablet System evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/51-final-source-system-dark-768.png)
- [Final-source 1280-pixel desktop System evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/52-final-source-system-dark-1280.png)
- [Final-source 1440-pixel desktop System evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/53-final-source-system-dark-1440.png)
- [Final-source System-to-Dark and reduced-motion evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/50-final-source-system-dark-390.png)
- [Final-source skip-link keyboard evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/59-final-source-skip-link-focus-390.png)
- [Final-source corrected validation-recovery evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/57-final-source-validation-390.png)
- [Loading, partial, empty, offline, error, capacity, budget, conflict, approval, and revocation register](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/README.md)
- [Matched selected-reference versus rejected-current diagnostic](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/48-reference-vs-rejected-current-390x844.png)
- [Source-bound capture manifest](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/capture-manifest.md)
- [Accessibility runtime receipt](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/accessibility-runtime-receipt.md)
- [Visual direction 1: Warm Editorial Guide](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/20-visual-direction-1-warm-editorial-guide.png)
- [Visual direction 2: Focused Career Workspace](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/21-visual-direction-2-focused-career-workspace.png)
- [Visual direction 3: Career Portfolio Reveal](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/22-visual-direction-3-career-portfolio-reveal.png)
- [Source and test receipt](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/source-and-test-receipt.md)

**CEO recommendation:** use direction 3 as the structural base, direction 1 for the emotionally resonant opening, and direction 2 for full-row decision controls. This combination best supports the path-first promise without reviving the rejected timeline.

The three directions are Board decision artifacts only. They are not implemented-build evidence and do not satisfy the remaining responsive, theme, interaction, state, accessibility, or physical-iPhone acceptance gates.

### Local platform contract

A local D1-compatible schema and migrations now define 30 bounded tables for identity, consent, imports, extraction policy, provenance-preserving profile facts and dependencies, normalized roles and source lineage, user-controlled merge decisions, reusable achievements and skills, versioned Job Standards, multiple career paths, deterministic master/path/job resume assignment, canonical job sources and postings, analyses, pursuits, generated assets, versioned offers, subscriptions, charges, deferred and recognized revenue, normalized costs and allocation groups, affiliates, cohorts, and quality telemetry.

This is a local contract only. Production D1 and R2 bindings remain null. No account, real user data, vendor, email, CRM, model, transcription, job feed, authentication, or billing service was connected.

The economics integrity slice now rejects aggregate over-recognition, appends after a reconciled schedule, cross-stream and cross-tenant links, duplicate processor events, post-reference economics drift, shared-source allocation groups above 100 percent, incomplete or rounded-short group totals, and multiple current allocation versions. A valid replacement must explicitly supersede the prior current group. Its stored Board reference and effective-time gate is syntactic only; it cannot authenticate an approval. The exact Board record and ClickUp remain authoritative.

- [Schema](../../../../prototypes/worthward-mobile/db/schema.ts)
- [Base migration](../../../../prototypes/worthward-mobile/drizzle/0000_tricky_jack_murdock.sql)
- [Economics migration](../../../../prototypes/worthward-mobile/drizzle/0001_supreme_sir_ram.sql)
- [Integrity migration](../../../../prototypes/worthward-mobile/drizzle/0002_clever_xorn.sql)
- [Shared-allocation migration](../../../../prototypes/worthward-mobile/drizzle/0003_rainy_nightmare.sql)
- [Allocation-group reconciliation migration](../../../../prototypes/worthward-mobile/drizzle/0004_famous_puppet_master.sql)

The provisional architecture is Cloudflare for the customer product and Zoho One only for consented downstream company operations. A LinkedIn URL is not scraping permission. A consumer ChatGPT subscription is not a transferable API entitlement. Provider-neutral adapters and versioned analysis contracts are the future-proofing mechanism.

### Verification

| Check | Result |
|---|---|
| TypeScript | PASS |
| Production build | PASS |
| Lint | PASS |
| Rendered truth, state, leakage, and regression tests | 16 of 16 PASS |
| Schema, tenant, provenance, populated-upgrade, rollback, deletion, assignment, Board-reference/effective-time, stream-isolation, aggregate-reconciliation, post-reference immutability, processor-deduplication, and exact shared-allocation reconciliation tests | 19 of 19 PASS |
| QA-service exact-build, lock, process-identity, and access-boundary tests | 4 of 4 PASS |
| Total automated tests | 39 of 39 PASS |
| Drizzle generation | PASS; 30 tables; no pending schema delta |
| Detached laptop QA service | Healthy; HTTP 200; loopback-only on `127.0.0.1:3011`; no LAN listener |
| Managed Remote behavior | PASS; every start rebuilds, cleanly replaces the preview, serializes lifecycle actions, and binds keep-awake to the exact preview PID |
| Settled axe-core runtime scans: Home, Settings, validation, loading, and application | 0 violations and 0 incomplete checks on every route |
| Independent Quality | Bounded current-harness, repaired economics/schema, and Mac host-side Remote evidence PASS; broad private-alpha release BLOCK pending the selected-direction rebuild and remaining physical-device and browser proof |

### Mobile and on-the-go access

The Mac side of the immediate route is operational:

1. Keep this Mac powered, connected, awake, signed in, and running the ChatGPT desktop app.
2. In the ChatGPT mobile app, open **Remote** and select this exact Mac, using the same account and workspace.
3. Continue this project task or ask the host to open `http://localhost:3011/#/` in its built-in browser.
4. Do not tap the localhost link into native iPhone Safari. On the phone, `localhost` means the phone.

The service forces a fresh production build before each Remote start, survives Terminal or Codex command completion, and keeps this Mac from idle sleeping only while that managed preview remains alive. It does not survive logout, reboot, a closed MacBook lid, loss of network, or the desktop app closing. The remaining acceptance check is one successful phone-to-host Remote session. Native iPhone Safari on the same Wi-Fi can use the temporary LAN route after the exact checkpoint gate. Native iPhone Safari away from home still requires a commercially permitted private route; no public tunnel or deployment has been enabled. The completed [Private Mobile QA Access Packet](../reviews/my-way-ahead-private-mobile-access-packet-2026-07-21.md) recommends a one-seat, one-cycle Tailscale Standard pilot with tailnet-only Serve and an $8-plus-tax ceiling, subject to Gate D.

## Commercial reset

### Market-grounded offer ladder

Free or low-cost resume generation, matching, and tracking are already available from [EarnBetter](https://earnbetter.com/), [Teal](https://www.tealhq.com/pricing), [Huntr](https://huntr.co/pricing), [Careerflow](https://www.careerflow.ai/premium), [Rezi](https://www.rezi.ai/pricing), and [Jobscan](https://www.jobscan.co/blog/jobscan-vs-teal/). My Way Ahead cannot win by being another resume tool or by charging a premium for passive alerts. It must win on credible paths, restrained current-job discovery, mutual-fit investigation, evidence continuity, and approval-controlled pursuit execution.

All figures below are private hypotheses, not approved public prices.

| Offer | Price hypothesis | Role in the ladder | Variable-cost stop rule |
|---|---:|---|---:|
| Try It Free | $0 | One useful path or job decision; no unbounded AI | Shares one nonstackable $0.25 subsidy with Preview across 30 days |
| Keep Watch Preview | $0, capped | Loss-leading proof of one-path monitoring | Shares the same nonstackable $0.25 subsidy |
| Keep Watch | $9 monthly or $24 for three months | Monitor one path | $1.80 monthly; $4.80 per prepaid term, or $1.60 per service month |
| Multi-Path Watch | $19 monthly or $49 for three months | Monitor up to three paths | $3.80 monthly; $9.80 per prepaid term, or about $3.27 per service month |
| Active Search | $99 for 30 days, no renewal | Focused search and pursuit workflow | At or below $19.80 per term |
| Multi-Path Active | $149 for 30 days, no renewal | Parallel path search and pursuit | At or below $29.80 per term |
| Role Decision + Application Pack | $39 contextual cross-sell | Research, decision, and claim-safe preparation | All-in variable cost no more than $7.80 for 80 percent CM2 |
| Interview + 90-Day Plan | $49 contextual cross-sell | Win the role and start well | All-in variable cost no more than $9.80 for 80 percent CM2 |

The [Unit Economics Ledger](../my-way-ahead-unit-economics-ledger-2026-07-21.md) now defines gross billings, cash, deferred and recognized revenue, software MRR, CM1, CM2, acquisition contribution, component rate cards, offer-version budgets, free subsidy, cohort maturity, and the 30-table local contract. At the $90-per-hour labor shadow rate, Watch can support only fractions of a human minute, not 15 minutes. Stop an offer version after two consecutive mature cohorts exceed its CM2 ceiling or conversion remains below 5 percent; stop immediately for quality, privacy, security, misleading scope, or billing failure. Software, affiliate, and any later human-service revenue remain separate ledgers.

The former $199 Expert Review and $499 Guided Help offers are paused. The company has neither the staff nor proven expertise to fulfill them responsibly.

### Affiliate posture

[MentorCruise](https://mentorcruise.com/partners/) remains the conditional first choice, not an approval-ready partner. It is the best current complement to the no-staff constraint and the least likely of the three reviewed programs to cannibalize the software core. Its public formula implies an unguaranteed $16 to $22 gross monthly planning range per active qualifying mentee, but no public partner agreement establishes cookie, attribution, payout, reversal, termination, trademark, traffic, geography, or data-sharing terms. Even the program page's customer-count copy appears stale.

Guardrails: direct link only, no profile or behavioral-data transfer, visible commission disclosure, nonexclusive placement, commission-neutral ranking, and separate tracking of starts, refunds, complaints, cannibalization, and net contribution. ResumeSpice is a narrow fallback only: its public Awin pages conflict on 10 percent/15-day versus case-specific/60-day terms, joining requires a $5 Board-gated deposit, and its product overlap and career-data terms create material trust risk. Let's Eat, Grandma is on hold because its affiliate route is currently broken, economics are undisclosed, and privacy disclosures conflict. TopResume remains screened out.

Full evidence and missing terms: [Affiliate Diligence](../reviews/my-way-ahead-affiliate-diligence-2026-07-21.md).

No program was joined, contacted, promoted, or contractually accepted.

### Acquisition surfaces

The first utility pages should solve distinct jobs rather than mass-produce thin SEO pages:

1. `/job-search-plan`
2. `/jobs-that-match-my-resume`
3. `/job-fit-checker`
4. `/job-posting-checker`

Each page needs real utility, original evidence, inspectable answers, accessible server-rendered content, and one natural next task. SEO, GEO, and AEO do not authorize copied listings, fabricated evidence, or public publication.

## Skill and delivery system

Two repo-managed skills now govern My Way Ahead company integration and the offer/journey system. All 24 repo-managed skills pass the official validator and match both execution mirrors.

The existing skill-drift automation was upgraded in place rather than duplicated:

- Name: **Monthly My Way Ahead Skill Health Audit**
- Status recorded: `ACTIVE`
- Schedule: first Monday of each month at 9:00 AM Central
- Monthly: deep review of the two My Way Ahead skills and every changed skill
- January, April, July, October: full Job Search skill-library review
- Mode: read-only behavioral and source-drift audit

The [skill health audit](../reviews/my-way-ahead-skill-health-audit-2026-07-21.md) documents the structural checks, fresh-context fixtures, repaired gaps, and exact automation record. The local automation file was read back as active, but a future scheduler run is still required to prove the app actually invoked it.

## ClickUp readback

[ClickUp readback evidence](../../../../prototypes/worthward-mobile/qa/founder-feedback-reset-2026-07-21/clickup-readback-receipt.md) proves exactly two active tasks across the isolated My Way Ahead lists:

1. [Private-Alpha Reset](https://app.clickup.com/t/868ke7y0a): `in design`.
2. [Matt Case Study Zero](https://app.clickup.com/t/868ke7y7a): `in review`.

M0 is a shipped bounded child; M1 through M4 remain backlog. No legacy Job Filter list was mutated. The latest product and case-study comments were read back after write.

## Initiative 2: Matt Case Study Zero

**Seso, Director of Revenue Operations remains the integrated next-best pursuit: 84/100, Pursue, 4-star Teal mapping.**

The [canonical Greenhouse requisition](https://job-boards.greenhouse.io/sesolabor/jobs/4700419005) remained live on 2026-07-21 with a Remote US location, $150,000 to $200,000 cash plus equity, the complete job description, and an active application form. The [official Greenhouse API](https://boards-api.greenhouse.io/v1/boards/sesolabor/jobs/4700419005?content=true) reports first publication on May 28 and update on May 29, with no official deadline. This is therefore a medium-high-risk 54-day freshness exception. A July 29 date exists only in unverified third-party metadata and is not an urgency fact.

Seso wins on GTM systems, reporting, automation, lifecycle infrastructure, practical AI adoption, remote logistics, and compensation. Material gaps remain explicit: Salesforce administration and configuration, ARR and forecasting ownership, GTM cost modeling, territory/quota/compensation planning, and management of a dedicated RevOps team with the same specialist composition.

The [local pursuit package](../../../../applications/professional-lanes/seso-director-revenue-operations/research-and-decision-receipt.md) has an [independent claim-safety PASS for the bounded local copy](../../../../applications/professional-lanes/seso-director-revenue-operations/independent-qa-receipt-2026-07-21.md). Final PDFs and live Teal visual QA do not yet exist. The repo-mandated readiness command returned `NOT READY` because the existing branch is ahead with tracked and untracked user work. Nothing was stashed or overwritten. A read-only Teal eligibility and destination preflight is therefore blocked until the clean-provenance gate is executed. No Teal, Greenhouse, outreach, reference, or application mutation occurred.

### Source-verified current shortlist

| Rank | Role | Score and classification | Compensation and logistics | Freshness truth | Main reason it does not replace Seso |
|---:|---|---|---|---|---|
| 1 | [Seso, Director of Revenue Operations](https://job-boards.greenhouse.io/sesolabor/jobs/4700419005) | 84; Pursue | Remote US; $150,000 to $200,000 cash plus equity | Official May 28 publication; 54 days; live form; medium-high stale risk | Integrated strengths still outweigh the explicit Salesforce, forecasting, Finance, and sales-planning gaps |
| 2 | [Happy Money, Head of Lifecycle Marketing](https://job-boards.greenhouse.io/happymoney/jobs/4278658009) | 82; Pursue | Remote US; $155,000 to $220,000 base plus bonus and benefits | Official June 9 publication; 42 days; no official deadline; medium-high stale risk | Deeper lifecycle specialization and financial-services expectations create more proof risk |
| 3 | [Splitero, Director of Lifecycle Marketing](https://job-boards.greenhouse.io/splitero/jobs/5356775008) | 80; conditional Pursue | Remote; $210,000 to $235,000 OTE | Official July 15 publication and July 21 update; 6 days; low stale risk | SFMC, Salesforce, lending, and specialized lifecycle proof gaps are larger |
| 4 | [Momentus Technologies, Senior Director of Revenue Operations](https://recruiting.paylocity.com/recruiting/jobs/Details/4070190/Momentus/Senior-Director-of-Revenue-Operations) | 79; Pursue after compensation screen | Fully remote; Tennessee eligible; pay undisclosed | Official June 2 publication; 49 days. A secondary LinkedIn listing displayed 2 days ago, but that is distribution evidence, not a new canonical date | Compensation is unknown and scaled RevOps, data-layer, and forecasting ownership remains less evidenced; primary-only conservative score is 77 |
| 5 | [Built Technologies, Director, Revenue Operations](https://job-boards.greenhouse.io/getbuilt/jobs/4709325005) | 76; selective reach | Nashville hybrid; $220,000 to $240,000 plus equity | Official June 24 publication and July 1 update; 27 days; low stale risk; June 25 secondary metadata rejected | Freshest and highest-paying, but mastery-level Salesforce, forecast, quota, territory, compensation-design, and scaled-leadership gaps are decisive |

The five canonical employer pages above were live on 2026-07-21. The [Seso package](../../../../applications/professional-lanes/seso-director-revenue-operations/research-and-decision-receipt.md) contains a nine-dimension score decomposition, lane classification, risks, and missing information for every fallback. GoCanvas was removed that day after its canonical ATS returned HTTP 410 on direct recheck. Every remaining role still requires a fresh Teal duplicate, status, applied-date, and canonical-source check before asset work. Happy Money is the first fallback if Seso no longer clears that check.

## Material risks

1. The product's broad experience remains rejected. P0 trust corrections do not validate the new promise, navigation, onboarding, paths, job feed, resume system, or commercial experience.
2. The physical iPhone-to-host ChatGPT Remote connection still needs Matt's readback. Native iPhone Safari, VoiceOver, safe-area, native touch, real reduced motion, and real network behavior remain unproven.
3. The prototype is synthetic and local. It does not prove live ingestion, model quality, demand, retention, billing, privacy operations, or support load.
4. My Way Ahead and Way Ahead remain provisional names. Domain control and legal clearance are unproven.
5. Competitor prices, affiliate terms, and job availability can change and must be refreshed at the exact decision gate.
6. The worktree contains unrelated user changes. The tested source is hash-addressed but not yet isolated in clean Git provenance.
7. Seso is already 54 days old, crosses the default more-than-60-day pass threshold on July 28, and may treat Salesforce, Finance, and sales-planning gaps as hard gates.

## Exact Board approvals requested

### A. Visual direction

**Select visual direction 1, 2, or 3, or specify the parts to combine or change. Selection authorizes only the synthetic local redesign and its full QA loop. It does not authorize hosting, external users, production data, vendor connection, billing, public pricing, affiliate signup, spend, legal commitments, Teal mutation, outreach, or application action.**

### B. Seso Gate 1 only

**Not ready for approval.** Gate C must first produce a workspace that passes the required readiness check. The company will then perform a read-only Teal preflight, identify the exact Seso record URL or identifier and pre-state, verify that the required Teal features carry no incremental cost or stop, and return a destination-bound Gate B request. No Teal mutation is authorized by this packet.

The future Gate B request will authorize only the exact eligible Seso record to move to `Applying`, one Seso-specific resume and cover letter with global-update controls off, the two required PDF exports, readback proof, and a stop for Board review. It will exclude Greenhouse access, population, upload, submission, outreach, references, spend, and shared-library mutation that cannot be isolated.

### C. Clean provenance only

**Approve isolating only the My Way Ahead source, reset documents, fresh evidence, schema, skills, and Board packet from unrelated work on a clean branch based on current `origin/main`, then creating a draft pull request for provenance review. Do not merge, deploy, publish, or change production.**

### D. Native on-the-go QA pilot

**Approve a one-seat, one-billing-cycle Tailscale Standard pilot for internal My Way Ahead QA, including acceptance of Tailscale's self-serve Terms, installation on only Matt's Mac and iPhone, and a maximum charge of $8 plus applicable tax. Authorize only tailnet-only Tailscale Serve for `http://127.0.0.1:3011`, with no Funnel, Internet-public endpoint, additional user or device, tagged resource, production data, or other service exposure. Require readback proof, native-iPhone evidence over cellular, `tailscale serve reset`, and cancellation of renewal after the evidence is captured.**

### E. Affiliate diligence only

**Authorize one narrowly scoped contact to MentorCruise solely to obtain its complete partner agreement and partner data-flow documentation for internal review. Do not accept terms, join the program, publish a link, transfer user data, make a partnership claim, or incur cost.**

Approvals A, C, D, and E may be granted separately. B is a disclosed hold, not an approval request. Silence, a general `continue`, or approval of one gate does not authorize another.
