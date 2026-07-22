# Founder Feedback Product Reset

**Decision date:** 2026-07-21
**Authority:** Matt Dimock, Board
**Integrator:** Codex root
**Status:** Governing product reset for the next design and architecture phase
**Public release:** Not authorized

## Executive decision

Way Ahead will not lead as a job-posting checker. It will become a user-controlled job-search operating system that understands the person once, finds and verifies worthwhile work, explains mutual fit, and prepares the strongest honest pursuit package for each selected opportunity.

The job-posting investigation remains valuable, but it is trust infrastructure and an acquisition tool. It is not the primary promise.

The governing customer transformation is:

> **From exhausted, overlooked, and unsure where to spend effort to understood, selective, prepared, and in control.**

The working homepage promise is:

> **You are more than your last job title.**
>
> **Find the work that moves your life forward.**

Supporting explanation:

> Way Ahead reveals the credible career paths your experience can open, finds the few current jobs that could improve your pay, time, growth, or stability, and helps build the job-specific resume, letter, research, and plan that give you the strongest honest chance.

Primary action: **Find better-fit jobs for me**
Secondary action: **Check a job I found**
Trust line: **No mass applying. No invented experience. Nothing sent without your approval.**

Matt selected **Way Ahead** as the provisional internal private-alpha name because it both shows a credible way forward and supports durable career advantage. The product must not turn that meaning into a guarantee or superiority claim. Public use still requires collision, domain-control, spoken-recall, and legal-clearance evidence.

## Founder feedback accepted

The following corrections now govern the product:

1. Replace the timeline-led experience with task-focused cards and workspaces that make each decision easy to compartmentalize.
2. Keep one stable shell. Logged-out and logged-in navigation can differ in content, but the menu location and interaction model must remain consistent.
3. Minimize clicks. A primary action should complete the promised state change or take the user directly to the next useful result.
4. Remove duplicate labels, internal controls, source-file paths, and fixture states from customer surfaces.
5. Give each onboarding screen a visible name, purpose, progress state, and immediate reason the requested information improves results.
6. Use miles, not minutes, for commute preference.
7. Treat schedule requirements as optional and explain when they affect filtering or verification.
8. Support multiple career paths, with one primary path and additional active paths. Limits may become a paid entitlement only after value and economics are validated.
9. Support a master career record plus path-specific and job-specific resumes, reusable bullets, categorized skills, inline editing, and recruiter/ATS-safe presentation choices.
10. Build the user profile from complementary sources: resume, LinkedIn PDF or user-provided export, structured manual entry, and voice. Do not scrape LinkedIn without permitted access.
11. Make the job standard update live as preferences change so the person sees the exact search and comparison contract being created.
12. Build a direct-source job feed so pasting a job is an option, not the homepage's main job.
13. Treat deeper company, hiring-team, role, interview, and 90-day research as product value, not an afterthought.
14. Use product-led search pages to acquire users through real jobs to be done, not generic content volume.
15. Separate software economics from human services. Do not sell human guidance that the company cannot reliably fulfill.

## Important challenge to the feedback

Removing every prototype or synthetic-data disclosure before the underlying capability is real would make the experience more polished but less truthful. The correct implementation is:

- remove sample copy and internal fixture controls from the normal customer path;
- isolate test fixtures behind temporary QA-only inputs;
- keep one clear private-alpha disclosure until live ingestion, analysis, storage, and fulfillment are proven;
- never present generated or synthetic results as current employer or customer facts.

Likewise, permission to begin database and authentication work authorizes local, reversible architecture and schema work. It does not authorize a production vendor connection, customer-data collection, paid service, public deployment, or acceptance of vendor terms without the reserved Board gate.

## Product job and value loop

The customer hires Way Ahead to reduce five kinds of work:

1. **Self-understanding:** turn scattered career evidence into an accurate, editable career record.
2. **Search:** find current, legitimate opportunities across every credible career path.
3. **Decision:** show whether the person fits the work and whether the work fits the person's life and goals.
4. **Pursuit:** assemble job-specific proof, resume, cover letter when useful, research, answers, interview preparation, and a first-90-day plan.
5. **Learning:** preserve corrections, outcomes, reusable achievements, and changing priorities so the next pursuit gets easier.

The governing loop is:

> Understand once -> Find continuously -> Verify before effort -> Prepare specifically -> Approve exactly -> Learn from outcomes

The system must never promise a job, interview, offer, or salary. The defensible promise is better evidence, less wasted effort, stronger honest presentation, and greater control.

## Journey and route contract

### Public journey

1. Understand the promise.
2. Choose the help needed now.
3. Receive one useful result with no card.
4. Create an account only when needed to save, personalize, or continue.

Public routes:

- `/`
- `/how-it-works`
- `/find-jobs`
- `/free-tools`
- `/resources`
- `/pricing`
- `/sign-in`

### Onboarding journey

1. State the current goal and urgency.
2. Import a resume and optionally a LinkedIn PDF or data export.
3. Add missing experience manually or by voice.
4. Review the normalized career record, provenance, duplicates, and uncertain items.
5. Define the next-job standard: compensation, location, work arrangement, commute miles, benefits, schedule requirements, travel, stability, growth, responsibilities, values, and exclusions.
6. Review scored career-path possibilities with reasons, evidence gaps, and market opportunity.
7. Select one primary path and any additional active paths.
8. Assign a master resume or path-specific resume foundation.
9. Preview the exact search and job-comparison contract.
10. Approve the plan once and go directly to the personalized job feed.

Onboarding routes:

- `/start`
- `/profile/import`
- `/profile/review`
- `/job-standard`
- `/career-paths`
- `/resume-foundations`
- `/plan-review`

### Logged-in product journey

Persistent navigation:

- **Today:** highest-value next action and changes since the last visit.
- **Find Jobs:** personalized feed plus add-by-URL.
- **Pursuits:** saved, researching, preparing, ready for approval, applied, interviewing, and closed opportunities.
- **Career Profile:** experience, proof, preferences, paths, resumes, bullets, and skills.
- **Account menu:** notifications, appearance, data and privacy, integrations, billing when approved, and support.

Product routes:

- `/app/today`
- `/app/jobs`
- `/app/jobs/:jobId`
- `/app/pursuits`
- `/app/pursuits/:pursuitId`
- `/app/profile`
- `/app/profile/paths`
- `/app/profile/resumes`
- `/app/profile/library`
- `/app/settings`

Do not replace the primary menu with Settings. Do not expose internal scenario selectors, repository references, or local file URLs.

## Screen and interaction rules

1. One main task per screen.
2. One visually dominant action per decision state.
3. Full-row selection cards with generous spacing, visible focus, and a selected background state. Do not rely on a small radio circle alone.
4. A visible page title and a one-sentence explanation of how the answer will be used.
5. A live summary of the resulting job standard and search plan.
6. Inline editing for facts, bullets, skills, preferences, and resume assignments.
7. No confirmation click after an action that already expressed the same decision.
8. Minimum 44 by 44 CSS-pixel touch targets, keyboard support, visible focus, semantic controls, sufficient contrast, 200 percent zoom support, reduced-motion support, and no horizontal overflow.
9. Test at 320, 390, 768, and 1280 CSS pixels in Light, Dark, and System themes, plus Safari, Chrome, Edge, and Firefox at release-candidate level.
10. Use the selected Executive Evidence type, color, and trust language as inputs, not as a requirement to retain the rejected timeline layout.

## Profile and career-record contract

### Input methods

| Method | Authorized private-alpha behavior | Important boundary |
|---|---|---|
| Resume upload | Parse PDF or DOCX into a reviewable draft | The user confirms facts before they become trusted |
| LinkedIn | Accept LinkedIn PDF, pasted text, or user-provided data export | A URL alone is not scraping permission |
| Manual entry | Structured roles, projects, education, credentials, skills, and preferences | Preserve partial progress |
| Voice | Record or upload audio, transcribe, then show extracted claims for confirmation | Do not retain raw audio longer than needed without consent |

### Provenance states

Every material fact must preserve:

- source type and source version;
- exact source span or user statement when available;
- extraction method and policy version;
- `extracted`, `inferred`, `suggested`, `user_confirmed`, `user_corrected`, `rejected`, or `missing` state;
- confidence and ownership level;
- correction history and dependent artifacts that must be invalidated.

### Deduplication

Resume, LinkedIn export, manual input, and voice may describe the same role differently. The system must propose merges using employer, dates, title, location, and semantic similarity, but the user decides any material merge. Conflicts remain visible until resolved.

## Minimum useful data model

The local schema should begin with the following bounded entities. Fields that do not change search, decision, pursuit, compliance, measurement, or support should not be collected.

| Entity | Purpose | Core fields |
|---|---|---|
| `users` | Stable account identity | id, auth subject, email, locale, timezone, lifecycle state |
| `consents` | Versioned permission record | user, purpose, policy version, state, granted/revoked time |
| `source_imports` | Uploaded or pasted source | user, type, object key, checksum, state, retention date |
| `profile_facts` | Versioned claims with provenance | user, fact type, value, source, source span, state, confidence, owner |
| `experience_roles` | Normalized work history | employer, title, dates, location, description, current flag |
| `achievement_bullets` | Reusable evidence library | text, role, categories, metrics state, confidence, approval state |
| `skills` and `profile_skills` | Categorized skills and proof | skill, category, level, recency, source, confidence |
| `job_standards` | Versioned definition of a better job | pay, arrangement, commute miles, travel, schedule, benefits, growth, exclusions |
| `career_paths` | Candidate and active directions | title/mandate, lane, score, rationale, gaps, primary/active state |
| `resumes` and `resume_assignments` | Master, path, and job-specific foundations | type, version, path/job assignment, content, ATS-safe template |
| `job_sources` and `job_postings` | Canonical current opportunity records | source, source id, employer, mandate, freshness, location, pay, raw version |
| `job_analyses` | Versioned fit and value decision | policy version, evidence version, gates, scores, unknowns, recommendation |
| `pursuits` | User-controlled workflow | job, state, next action, approval state, applied/closed outcome |
| `generated_assets` | Resume, letter, research, answers, interview, and 90-day plan | type, source versions, generation policy, review state, file key |
| `offer_versions`, `subscriptions`, and entitlements | Versioned commercial access when approved | stream, price, currency, term, renewal, limits, contribution and support caps, state, Board reference |
| `orders_charges` and `revenue_schedule` | Cash, deferred revenue, recognized revenue, refund, and MRR reconciliation | offer version, gross, discount, tax, cash, fees, credits, service period, recognition period, deferred balance |
| `cost_events` | Normalized CM1 and CM2 control | stream, category, units, rate, actual/estimate, cash/noncash, allocation version, offer, cohort, workload |
| `affiliate_events` | Separate partner economics and trust control | program version, event, attribution, commission, clawback, payout, disclosure, complaint, cannibalization |
| `cohort_memberships` | Comparable conversion, retention, refund, and cost windows | offer version, source, entry, conversion, maturity, eligibility, terminal state |
| `usage_events` | Product quality and workload control | action, provider, model, latency, result, correction, cohort, normalized cost-event link |

Do not store references, protected identity data, precise home address, or unrelated personal history merely because a platform could collect it.

## Platform recommendation

Use Cloudflare as the provisional product platform and Zoho One only for downstream company operations when useful.

### Private-alpha architecture

- React/Vite customer application.
- One TypeScript Worker API.
- D1 for versioned structured records.
- Private R2 for temporary source files and generated documents only when the account and data gate is approved.
- Queues for bounded parsing, analysis, and research work.
- Turnstile for abuse protection when public entry is approved.
- Cloudflare Access for a Board-only hosted checkpoint if approved.
- Provider-neutral model and transcription adapters with task-level cost and quality telemetry.

Zoho Creator should not become the customer product database or authentication layer. Zoho CRM or Campaigns may later receive consented lead and lifecycle events, but only after field mapping, consent, deletion, security, and vendor gates are approved.

Bring-your-own ChatGPT is not an MVP dependency. A consumer ChatGPT subscription is not a transferable API entitlement. Future-proof by keeping provider adapters and versioned analysis contracts, not by binding the customer experience to one vendor account.

## Job supply strategy

The product should own a normalized feed assembled from permitted direct sources, starting narrowly:

1. direct employer ATS feeds or public endpoints where terms permit;
2. canonical employer pages and user-added URLs;
3. government and other explicitly licensed sources;
4. partner or paid feeds only after source rights, coverage, economics, and dependency risk are accepted.

Every job record must retain canonical employer, source URL, source type, first seen, last checked, freshness, removed state, duplicate group, location, compensation components, and uncertainty. A visible page is not sufficient evidence that a job is fresh.

## Current market benchmark

Official public pricing and feature pages were refreshed on 2026-07-21. Prices can change and must be rechecked before any public comparison or price decision.

| Product | Current public entry | Relevant capability | Strategic implication |
|---|---:|---|---|
| [EarnBetter](https://earnbetter.com/) | Free | Job matches, alerts, unlimited tailored resumes and cover letters, tracker | Free matching and documents make price alone an insufficient advantage |
| [Teal](https://www.tealhq.com/pricing) | Free; $13 weekly, $29 per 30 days, $79 per 90 days | Multiple resumes, tracking, job matching, bullets, cover letters, and design controls | Users already expect reusable career assets and flexible short terms |
| [Huntr](https://huntr.co/pricing) | Free; $40 monthly, $90 quarterly, $160 for six months | Resume and cover-letter tools, tracking, matching, job insights, and autofill | A broad all-in-one workspace commands a mid-market monthly price |
| [Careerflow](https://www.careerflow.ai/premium) | Free; $23.99 monthly Premium | Resume, ATS, LinkedIn, cover-letter, interview, and search tools | The paid resume-tool band clusters around the mid-$20s monthly |
| [Rezi](https://www.rezi.ai/pricing) | Free; $29 monthly or $149 lifetime | Resume, ATS, cover letter, interview, export, and monthly human review on Pro | Resume generation is crowded and cannot be the category promise |
| [Jobscan](https://www.jobscan.co/blog/jobscan-vs-teal/) | $49.95 monthly or $89.95 quarterly | Resume matching, optimization, LinkedIn, tracker, and beta auto-apply | High willingness to pay exists for active-search urgency, not passive alerts alone |
| [RoleWorth](https://roleworth.com/pricing) | Free preview; current public page shows weekly, monthly, and lifetime tiers | Decision scoring, ranking, proof-backed application kits, alerts, and approval gates | Decision-first proof is now direct table stakes; its own public pricing pages have changed, so recheck before use |

The Keep Watch hypothesis must therefore win on low effort, multiple credible paths, restrained high-quality alerts, useful no-opportunity reporting, and compounding career memory. A low introductory price is an acquisition lever, not the product's defensible advantage.

Dribbble was used as a pattern library, not as proof of usability or permission to copy. Useful themes include [large labels and generous navigation areas](https://dribbble.com/shots/6607370-Mobile-app-dashboard), [engaging question-led recruitment onboarding](https://dribbble.com/shots/2792485-Recruiting-App-Onboarding), and current [job-app onboarding](https://dribbble.com/search/shots/popular/?q=job-app-onboarding) and [career-dashboard](https://dribbble.com/search/career%20dashboard) collections. Way Ahead should adopt the principles of focus, full-row choices, clear hierarchy, and generous spacing while preserving its own Executive Evidence visual language and meeting accessibility and real-task evidence.

## Offer architecture and economics

All prices remain private hypotheses. No public price, charge, subscription, discount, guarantee, or partner claim is authorized.

### Recommended test ladder

| Offer | Private hypothesis | Job to be done | Variable-cost stop rule |
|---|---:|---|---|
| Try It Free | $0 | One useful investigation or plan result | Shares one nonstackable $0.25 subsidy with Preview across 30 days |
| Keep Watch Preview | $0, capped | Prove monitoring value for one path | Shares the same nonstackable $0.25 subsidy |
| Keep Watch | $9 monthly or $24 for three months | Monitor one active path | $1.80 monthly; $4.80 per prepaid term, or $1.60 per service month |
| Multi-Path Watch | $19 monthly or $49 for three months | Monitor up to three active paths | $3.80 monthly; $9.80 per prepaid term, or about $3.27 per service month |
| Active Search | $99 for 30 days, no renewal | Full search, decision, and preparation workflow | At or below $19.80 for the term |
| Multi-Path Active | $149 for 30 days, no renewal | Search and prepare across multiple paths | At or below 20 percent of recognized revenue |
| Role Decision plus Application Pack | $39 contextual cross-sell | Deep decision and claim-safe pursuit assets | All-in variable cost at or below $7.80 for 80 percent CM2 |
| Interview plus 90-Day Plan | $49 contextual cross-sell | Prepare to win and start well | All-in variable cost at or below $9.80 for 80 percent CM2 |

Keep Watch can be a loss-leading acquisition product only if the loss is explicit, capped, and repaid by observed cohort conversion. Watch is near-zero-touch software; support is capped by the remaining offer-version cost budget divided by loaded labor cost, not a 15-minute entitlement. Stop an offer version after two consecutive mature cohorts exceed its CM2 ceiling or free-to-paid conversion remains below 5 percent. Stop immediately for quality, privacy, security, misleading scope, or billing failure. The [Unit Economics Ledger](../company-os/my-way-ahead-unit-economics-ledger-2026-07-21.md) defines the calculations, maturity windows, and separate ledgers.

The former $199 Expert Review and $499 Guided Help hypotheses are paused. The company currently has neither staff nor proven fulfillment expertise. Referring optional human help through a disclosed partner may be safer than pretending to provide it.

### Affiliate and partner posture

The first conditional candidate is **[MentorCruise](https://mentorcruise.com/partners/)**, a mentoring marketplace that is less likely than a resume vendor to cannibalize the software core. Its current vendor-published formula is 50 percent of MentorCruise's take rate, usually about 10 percent of a qualifying mentee transaction over $50. On its stated typical $160 to $220 monthly spend, that implies an unguaranteed $16 to $22 gross monthly planning range per active referred mentee. The public material does not establish cookie, attribution, payout, reversal, termination, trademark, traffic, geography, or partner-data terms; even the page's customer-count copy appears stale against a newer vendor page. This is not approval-ready.

Use a direct link only, transfer no Way Ahead profile or behavioral data, keep placement nonexclusive, disclose the commission beside the recommendation, and make ranking commission-neutral. Refer contextually for interview preparation, career transitions, negotiation, or a human second opinion. Do not claim that a user was "matched" unless Way Ahead later implements and validates matching criteria.

[ResumeSpice](https://resumespice.com/) is a narrow fallback only. Its Awin pages conflict on whether commission is a public 10 percent with a 15-day cookie or case-specific with a 60-day cookie; joining also requires a Board-gated $5 deposit. Its resume, LinkedIn, coaching, and application services directly overlap the product, and its customer terms create material career-data, marketing-tracking, license, and refund concerns. [Let's Eat, Grandma](https://www.letseatgrandma.com/affiliates/) is on hold because its affiliate path currently falls through to a generic Awin page, economics are undisclosed, and its dated privacy disclosures conflict. TopResume remains screened out for the current shortlist. Coursera may be useful only for a verified skill gap. Jobscan or resume-builder affiliates risk direct product cannibalization and should be used only in a narrow context.

Before joining any program, verify current commission, cookie, discount, refund, claim, trademark, data-sharing, geographic, and termination terms. Joining, publishing links, contacting partners, or accepting terms is a reserved Board action.

Report affiliate revenue separately from software revenue and human-service revenue. Recommendations must remain suitable even when no commission exists.

## Acquisition surface

The first product-led pages should each solve one distinct problem:

1. `/job-search-plan`: build a personalized job-search plan.
2. `/jobs-that-match-my-resume`: show credible roles and career paths from imported evidence.
3. `/job-fit-checker`: compare the person and the job in both directions.
4. `/job-posting-checker`: verify freshness, legitimacy, requirements, pay, and missing information.

Each page needs original utility, plain-language answers, inspectable evidence, structured data only when accurate, internal linking to the next useful task, and accessible server-rendered content. SEO, GEO, and AEO do not justify mass-generated pages, copied listings, thin summaries, or claims the product cannot prove.

## Delivery critical path

Only Private-Alpha Readiness and Matt Case Study Zero may be active. The product initiative contains the milestones below; child work remains backlog until it becomes the single current slice.

### M0: Trust and flow hardening

- remove persisted QA fixtures from customer paths;
- remove private repository paths from production client bundles;
- make unknown routes fail safely;
- replace the double plan action with one direct job-feed action;
- change commute preference to miles;
- remove internal settings controls and the duplicate selected-theme mark;
- add regression tests for each defect.

### M1: Promise and visual-direction decision

- approve the promise, homepage hierarchy, stable navigation shell, and no-timeline interaction model;
- compare exactly three grounded visual directions;
- stop broad UI rebuild until Matt selects or refines one direction.

### M2: Career record and platform contract

- implement local versioned schema and migrations;
- implement local auth adapter boundary and consent states, without production connection;
- prototype resume, LinkedIn PDF/export, manual, and voice intake;
- implement provenance, dedupe, conflict review, correction, and retention states.

### M3: Career paths, resumes, jobs, and pursuit

- career-path scoring and active-path selection;
- master, path-specific, and job-specific resume foundations;
- reusable bullet and skills libraries;
- permitted canonical job feed and user-added URL path;
- mutual-fit decision, pursue state, exact approval, and outcome learning.

### M4: Commercial and acquisition validation

- Keep Watch and Active Search entitlements;
- cost and quality telemetry;
- product-led acquisition pages;
- affiliate diligence packet;
- private pricing and offer tests after Board approval;
- complete responsive, accessibility, state, truth, privacy, and security evidence.

## P0 corrections completed in the current prototype

The following smallest safe corrections were implemented before the broad design decision:

- customer-visible source references now use safe evidence labels instead of local file paths;
- the validation failure scenario can be invoked only through a temporary QA query and is not stored or shown in Settings;
- the duplicate selected-theme checkmark and all prototype scenario controls were removed from Settings;
- an unknown hash route returns to Home rather than an unrelated job screen;
- the plan action now goes directly to jobs and no longer asks for the same decision twice;
- commute preference uses miles;
- regression coverage now scans the production client bundle for private-path leakage and verifies QA fixtures cannot persist.

Verification after the P0, schema, and economics-ledger corrections: typecheck PASS, production build PASS, 14 of 14 rendered truth/state/leakage/regression tests PASS, 19 of 19 schema/invariant and adversarial economics tests PASS, 4 of 4 QA-service contract tests PASS, 37 of 37 total tests PASS, lint PASS, and clean 30-table migration generation with no pending schema delta PASS. The repaired contract now covers populated 23-table upgrades, a nonempty Board-reference and effective-time gate, aggregate cash/deferred/revenue reconciliation, closed reconciled schedules, stream and tenant isolation, usage-to-cost tenancy, post-reference identity and economics immutability, one processor event per order, exact shared-source allocation reconciliation including deterministic remainder assignment, and exactly one current allocation version with explicit supersession. The stored Board reference is a syntactic assertion, not proof of authentic approval; ClickUp and the Board record remain authoritative. Independent implementation review passed 27 adversarial scenarios; broad UX and private-alpha release remain blocked pending the selected-direction rebuild and its complete evidence.

## Acceptance for the next founder checkpoint

The next product checkpoint is ready only when:

1. Matt selects or refines one of three visual directions.
2. The selected direction is applied to the public promise, choice screen, onboarding foundation, personalized job feed, opportunity decision, persistent product shell, and Settings.
3. Mobile, tablet, and desktop evidence exists at required viewports in Light, Dark, and System.
4. Core interactions, error recovery, loading, partial, empty, offline, validation, approval, and revocation states are exercised.
5. Accessibility evidence covers keyboard, focus, semantics, contrast, 200 percent zoom, reduced motion, touch targets, and physical iPhone safe-area behavior.
6. The current build is compared beside the selected reference at matching viewports, with visible gaps corrected.
7. Typecheck, lint, build, database generation, truth tests, state tests, and leakage tests pass.
8. Independent Quality records a pass or a specific block and does not rewrite maker work.
9. ClickUp shows exactly two active initiatives and contains read-after-write proof.

## Reserved decisions

Matt's exact approval remains required before:

- selecting the governing visual direction;
- private hosting or sharing outside the laptop;
- production authentication, database, storage, email, CRM, model, transcription, or job-feed connection;
- collecting any external person's data;
- joining or contacting an affiliate or partner program;
- publishing a price, enabling billing, charging, discounting, or spending;
- domain purchase, public name lock, legal terms, privacy policy, trademark work, or any legal commitment;
- recruitment, outreach, Teal mutation, application staging or submission, reference use, or negotiation.

## Supersession

This chapter supersedes any earlier direction that:

- makes job-URL checking the homepage's primary job;
- requires the timeline as the governing interaction pattern;
- treats $24 monthly Keep Watch, $199 human review, or $499 guided help as preferred current offers;
- treats a LinkedIn URL as permission to scrape;
- treats local paths, fixture selectors, or synthetic data as acceptable customer copy;
- treats the current prototype as founder-accepted private alpha.

The existing strategy library remains authoritative where it does not conflict with this reset. The current prototype is a test harness with corrected P0 trust boundaries, not a Board-approved customer experience.
