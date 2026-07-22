# Phase 2 Business Launch And Validation Plan

Status: decision-ready staging plan; not yet merged authority
Date: 2026-07-16
Canonical product base: `origin/main@2a1b2b4f5ee808cb17def805a02516b29271d868`
Product owner: Matt Dimock
Working product name: Job Filter
Case-study zero: Matt Dimock

## 1. Executive Decision

Launch first as a concierge-assisted career-decision service backed by a narrow proof-first product, not as a broad job-search suite.

The sellable outcome is:

> Bring one real opportunity. Leave knowing whether it deserves your time, why, what verified evidence supports you, what remains risky, and the one next action to take.

The enduring product is a native Career Opportunity Intelligence system spanning career direction, opportunity discovery, defensible decisions, pursuit preparation, exact external approval, and outcome learning.

It should own five jobs:

1. compare credible career directions,
2. verify that an opportunity is real, current, and canonical,
3. judge whether it is materially better than the user's current baseline,
4. map requirements to evidence the user can defend,
5. produce a Decision Receipt and safe next action,
6. manage an evidence-grounded Pursuit through employer-site handoff and verified outcome.

It should not initially build a proprietary high-volume marketplace, broad resume-template engine, enterprise-scale CRM, autonomous browser agent, interview chatbot, or auto-apply. A minimal native Pursuit queue, grounded materials, application-package review, and outcome record are required because the customer product may not depend on a competitor tool.

### Commercial sequence

1. Use an urgent, high-touch Pursuit Sprint to create revenue and learn quickly.
2. Retain users with a low-noise Opportunity Radar after the active search.
3. Automate only workflow steps repeated successfully across at least five users.
4. Expand beyond the decision layer only when measured customer behavior proves the need.

### Immediate case-study decision

- TextNow is the negative control: a live legacy application form was correctly rejected after canonical-board and hire evidence showed the role was filled.
- Going is the first active target: current canonical evidence supports a conditional pursue decision at 85/100.
- Going's public salary statement is `starts at $175,000 + equity`; no public upper bound is proven.
- The next job-search action is a focused proof interview covering Braze mechanics, push and in-app ownership, cohort/LTV depth, and lifecycle-specific AI work.
- No Teal mutation, application submission, outreach, references, or external action is authorized by this plan.

## 2. Expert Council And Operating Roles

The work should be run by one accountable product leader using specialist lenses, not by independent teams producing incompatible plans.

| Expert role | Current responsibility | Required output | Decision owner |
|---|---|---|---|
| Product and category strategist | Define the category, wedge, scope, and sequencing | Authority packet and product thesis | Matt |
| Career strategist and executive recruiter | Judge role lanes, market credibility, and pursuit value | Role Lane model and Decision Receipt | Matt for final pursuit |
| Market and competitive analyst | Verify current category table stakes, pricing, threats, and whitespace | Dated competitor matrix with primary sources | Product lead |
| Customer research and JTBD lead | Separate behavioral overlays from economic personas | Persona model, interview guide, journey map | Product lead |
| Offer and conversion strategist | Apply Sultanic simplification and Hormozi value, pricing, and retention logic | Offer ladder, pricing tests, risk reversal | Matt |
| Proof, safety, and QA lead | Protect claim lineage, freshness, approval, privacy, and rollback | State contracts, test fixtures, release gates | Product lead |
| UX research and product design lead | Turn the decision model into a calm, inspectable interface | Three visual directions, selected build, visual QA | Matt selects direction |
| AI and data architect | Separate suggestions from truth and define a safe data boundary | Object model, storage path, model routing | Technical lead |
| Growth and beta lead | Recruit design partners and measure willingness to pay | Interview cohort, concierge alpha, paid beta | Matt |
| Delivery lead | Keep one writer, small WIP, clean authority, and verified handoffs | Branch, packet, test, and release receipts | Product lead |
| Privacy and employment-law reviewer | Review consent, data handling, claims, and employment-risk boundaries before public beta | Short written risk review | External specialist later |

### Council decisions already reached

- Continuous alerts and AI match explanations are table stakes.
- Resume generation, tracking, and autofill are commoditized.
- Proof lineage, opportunity integrity, career economics, and decision transparency are the defensible combination.
- The first revenue customer and the long-term subscription customer are related but not identical.
- The interface build remains gated by Matt's selection among the three generated directions.

## 3. Market Reality

### 3.1 Underlying demand

The addressable career-mobility market is large, but the launch plan should use a narrow serviceable beachhead rather than an inflated top-down TAM claim.

Current U.S. labor signals:

- The Bureau of Labor Statistics reported 7.6 million job openings, 5.2 million hires, and 3.1 million quits in May 2026. [BLS JOLTS](https://www.bls.gov/news.release/jolts.nr0.htm)
- Management, professional, and related occupations represented about 71.3 million employed workers in 2025. [BLS occupation table](https://www.bls.gov/cps/cpsaat11.htm)
- Median employee tenure was 3.9 years in January 2024, the lowest reported since January 2002. [BLS employee tenure](https://www.bls.gov/news.release/tenure.htm)

These figures show persistent career movement and a large professional labor pool. They do not prove demand for this product, subscription retention, or a specific revenue forecast.

### 3.2 Market pressures

| Pressure | Implication |
|---|---|
| Job supply is abundant but fragmented | Supply alone is not valuable; normalization and decision quality matter. |
| Alerts are noisy and stale states persist | Low-noise interruption and source integrity can create value. |
| Free tools cover resumes, matching, tracking, and alerts | Commodity features cannot carry premium pricing. |
| AI drafting is easy to access | Trust, proof lineage, correction, and decision policy matter more than generation. |
| Employed professionals have limited time | Avoided effort is a primary value metric. |
| One strong move can change years of earnings | Career economics justify a higher-value decision layer. |
| Placement creates natural product churn | Post-hire Radar must redefine "better" against the user's new baseline. |

### 3.3 Beachhead

The first paid market is not all job seekers.

Prioritize U.S.-based professionals who:

- have 7 to 20 years of experience,
- earn or target roughly $90,000 to $250,000,
- can credibly pursue more than one adjacent lane or a meaningful level-up,
- have enough proof to support a useful review,
- place high economic value on their time and career optionality,
- reject mass apply and unsupported claims.

This is a launch targeting decision, not a permanent exclusion from the product mission.

## 4. Competitive Reality

Facts below are current official product claims reviewed on 2026-07-16. They are not independent efficacy validation.

| Benchmark | Current strength | Current pricing signal | What it means for Job Filter |
|---|---|---|---|
| [Teal](https://www.tealhq.com/pricing) | Broad suite with ATS-sourced search, alerts, tracker, resume matching, interview, compensation, and offer tools | Free plus $13/7 days, $29/30 days, or $79/90 days | Use Teal as the breadth and execution benchmark, not the decision authority. |
| [Huntr](https://help.huntr.co/en/articles/12241684-job-match-score) | Inspectable must-have/nice-to-have matching with covered/not-covered explanations | Free; Pro $40/month, $90/quarter, $160/6 months | A basic requirements matrix is no longer enough. Add source lineage, economics, integrity, and uncertainty. |
| [Simplify](https://help.simplify.jobs/articles/2166608-using-your-job-matches) | Daily matches, why-this-job explanation, feedback learning, autofill, and tracking | Free; Plus $19.99/week, $39.99/month, or $89.99/3 months | Generic Radar, explanations, and feedback learning are occupied. |
| [Jobright](https://jobright.ai/ai-agent) | Always-on agent spanning diagnosis, scanning, scoring, tailoring, applying, tracking, and learning | Free tier; current paid price not reliably public | Do not claim unique agentic monitoring. Win through auditable decisions and restrained automation. |
| [Jobscan](https://www.jobscan.co/) | ATS-specific diagnostics, resume coaching, matching, and application optimization | Premium market anchor around $50/month | ATS confidence is reassurance, not the product center. |
| [Rezi](https://www.rezi.ai/pricing) | Resume generation, scoring, targeting, export, interview tools, and human review | Free, $29/month, $149 lifetime | Resume creation is deeply commoditized. |
| [EarnBetter](https://earnbetter.com/) | Free matches, alerts, documents, tailoring, tracking, and next actions | Free | Generic matching and documents are difficult to monetize directly. |
| [Careerflow](https://www.careerflow.ai/features) | Broad career suite plus institution and coach distribution | Free; Premium begins around $8.99/week | B2B2C distribution may matter later, but not before direct-product proof. |
| [Scale.jobs](https://scale.jobs/pricing) | Human application execution at volume | One-time packages from about $199 to $1,099 | High-touch willingness to pay exists, but volume conflicts with the product's quality thesis. |
| [LinkedIn Premium Career](https://www.linkedin.com/help/linkedin/answer/a7468583) | Job supply, network, recruiter access, alerts, applicant intelligence, and post-hire habit | Dynamic premium pricing | Treat LinkedIn as distribution and source infrastructure, not a product to replace. |
| [Levels.fyi](https://www.levels.fyi/about/) | Compensation, leveling, verified salary evidence, and high-ticket negotiation | Public data plus $1,250 to $5,000 services | Proof-backed career economics can support recurring and premium value. |
| [Welcome to the Jungle](https://help.welcometothejungle.com/en/how-do-i-monitor-trends-using-your-new-tool) | Company following and explicit passive monitoring direction | Candidate product is free | Passive monitoring alone is not a differentiated subscription. |
| [WhyBrilliant](https://whybrilliant.com/) | Active and passive career modes, daily DACH scanning, low-noise interruption, and hiring-manager introductions | Free to candidates; companies pay on hires | A generic paid Radar cannot beat free. Differentiate through independent decision authority, proof, integrity, economics, and portability. |
| [Sintovia](https://www.sintovia.com/) | Daily AI Job Radar, scored and explained matches, alerts, CV tailoring, and cover letters | $19.90 monthly; lower effective price on longer plans | Validates a low recurring price while commoditizing scanning, scoring, alerts, and assets. |
| [RiseIQ](https://riseiq.ai/) | Early-access Career Intelligence with a living evidence graph, always-on agents, fit/gap analysis, next actions, and weekly priorities | Early access; public professional pricing not confirmed | Strongest narrative and architecture overlap. Win through a narrower consumer wedge and measurable economic decision value. |
| [Lorkie](https://lorkie.com/) | Continuous opportunity discovery, eligibility, ranking, alerts, and application preparation | Beta; public pricing not confirmed | Continuous discovery and `act only when it matters` are occupied language, not a moat. |

A dated emerging-threat analysis is maintained in [Market and competition delta, 2026-07-17](../market-competition-delta-2026-07-17.md).

### 4.1 Table stakes

- reusable profile,
- browser or URL capture,
- personalized recommendations,
- daily or instant alerts,
- compensation and logistics filters,
- explanation of why a job matched,
- resume and JD matching,
- editable AI-assisted documents,
- tracker, reminders, and next actions,
- interview support,
- useful free entry.

### 4.2 Defensible combination

No reviewed public product currently demonstrates the full combination below in one consumer decision workflow. RiseIQ materially narrows this claim, so the beta must prove the difference rather than rely on feature-list positioning:

1. user-approved multi-lane career direction,
2. a durable proof and correction graph,
3. canonical employer and requisition integrity,
4. freshness, duplicate, wrapper, ATS migration, and filled-role detection,
5. expected career and compensation upside against the current baseline,
6. explicit uncertainty and pursuit effort,
7. provenance-aware approval before any external claim or action,
8. visible longitudinal calibration from real outcomes.

### 4.3 Revised category and promise

Internal category:

> Career Opportunity Intelligence

Plain-language public category:

> An always-on career decision platform

Primary short promise:

> Find the next move worth making.

Expanded promise:

> Compare real opportunities against your current role, earning goals, evidence, and constraints. Know what to pursue, pass, or watch before you spend hours applying.

Mechanism:

> Compare the opportunity with your current career baseline, verify that the job is real and current, map requirements to approved evidence, and act only when the decision holds up.

Trust line:

> Verified sources. No invented claims. No mass apply. You approve every external action.

## 5. Persona Model

The prior persona set mixed psychological states with economic segments. Use a 2x2 segmentation for acquisition and onboarding, then apply behavioral overlays.

| Search state | More than one plausible lane | Target lane is clear |
|---|---|---|
| Passive or monitoring | Ambitious Pathfinder | Focused Climber |
| Active search | Career Reframer | Active Optimizer |

Behavioral overlays:

- Burnt-Out: unusually sensitive to setup and duplicate work.
- Sophisticated Skeptic: unusually sensitive to proof, control, and reversibility.
- Signal Builder: has a thinner proof base and belongs in a later capability segment.

### 5.1 Ambitious Pathfinder

- Trigger: compensation stagnation, reorganization, leadership change, recruiter contact, or concern about missing upside.
- Failed alternatives: job alerts, newsletters, saved searches, recruiters, and spreadsheets.
- Unmet need: know whether anything is materially better without running a full-time search.
- Core anxiety: `What if the right opportunity passes while I am busy, or I waste time on something that is not actually better?`
- Desired progress: a calm weekly answer to `Is anything worth my attention, and why?`
- Primary offer: Opportunity Radar.
- Pricing hypothesis: $19 to $29 monthly only after precision is proven.

### 5.2 Active Optimizer

- Trigger: layoff, likely transition, active dissatisfaction, or a role already found.
- Failed alternatives: Teal, ChatGPT, resume builders, ATS scanners, spreadsheets, and browser tabs used separately.
- Unmet need: join source integrity, strategic fit, verified proof, decision, and next action.
- Core anxiety: `I am moving fast, but I cannot tell whether I am improving my odds or just producing more work.`
- Desired progress: a defensible shortlist and approval-ready pursuit.
- Primary offer: Pursuit Sprint or Guided Pursuit Sprint.
- Pricing hypothesis: $99 for 30 days or $399 to $599 guided.

### 5.3 Focused Climber

- Trigger: title ceiling, under-market compensation, a known role, or a target employer.
- Failed alternatives: resume scanners, salary sites, networking, and generic coaching.
- Unmet need: know whether real evidence supports the level-up.
- Core anxiety: `Am I genuinely ready, and will a hiring team believe the case?`
- Desired progress: identify the strongest attainable roles and smallest proof gaps.
- Primary offer: targeted Radar plus occasional Sprint.

### 5.4 Career Reframer

- Trigger: industry disruption, burnout, return to work, broad consulting history, or desired adjacency.
- Failed alternatives: assessments, generic coaching, broad searches, and multiple disconnected resumes.
- Unmet need: compare live market belief across a small set of credible paths.
- Core anxiety: `Which version of my background is credible rather than merely possible?`
- Desired progress: choose a defensible lane from evidence, demand, economics, and switching cost.
- Primary offer: Role Discovery plus guided Sprint, then Radar.

### 5.5 Explicit launch non-targets

- mass-apply and auto-submit buyers,
- resume-template-only or keyword-score-only buyers,
- users unwilling to verify evidence or approve external actions,
- hourly, gig, or shift-market discovery,
- employer, recruiter, coach, or enterprise workflows,
- legal, immigration, and credential adjudication,
- users whose immediate need is maximum application volume,
- users with too little current proof for a useful first decision.

The free diagnostic may still help these people understand the boundary without pretending the initial product serves them fully.

## 6. Customer Journey

| Stage | User belief | Product experience | Success event |
|---|---|---|---|
| Trigger | I may be underpaid, exposed, stalled, or missing something better. | Referral, content, market event, or job URL routes to Diagnostic. | User recognizes decision quality as the problem. |
| Consideration | Why not Teal, LinkedIn, ChatGPT, or a spreadsheet? | Show one real Decision Receipt and opportunity-integrity check. | User understands the upstream decision layer. |
| Diagnostic | Will this understand me? | Verify minimum history, approve one lane, set hard constraints, review one live job. | First Decision Receipt exists. |
| Activation | Was setup worth it? | Separate the read-only system recommendation from one `Pursue`, `Watch`, or `Pass` decision, with visible evidence and uncertainty. | User accepts or corrects one decision. |
| Radar | Tell me only when something matters. | One saved Radar produces a dated 0 to 3 item Brief and material-opportunity alerts. | Brief saves time, confirms no action, or surfaces one valuable role. |
| Sprint | This may deserve effort. | Deep role/company review, proof matrix, economics, effort, and next action. | User intentionally promotes the role. |
| Prepare | Help me make the strongest truthful case. | Native grounded resume, answers, supporting materials, and employer-site handoff. | Approval-ready materials exist. |
| Approve | I remain responsible for what leaves the product. | Used, missing, excluded, risky, and unsupported states remain visible. | Exact external action is approved. |
| Outcome | What happened and what changed? | Capture screen, interview, objection, rejection, offer, compensation, and correction. | Outcome recalibrates the lane and policy. |
| Career compounding | My new role changes the standard. | Reset current baseline, proof, preferred lanes, and material-upside threshold. | User returns to Radar after placement. |

## 7. Offer And Monetization Architecture

All prices are test hypotheses, not validated demand.

| Offer | Customer job | Initial test | Boundary |
|---|---|---:|---|
| Career Opportunity Diagnostic | Prove the mechanism with one lane and one live opportunity | Free, no card | Includes user-owned export and one Decision Receipt |
| Opportunity Radar | Maintain selective career awareness | $24/month | Weekly Opportunity Brief with 0 to 3 items, meaningful alerts, correction, learning |
| Pursuit Sprint | Decide and pursue active opportunities for 30 days | $99 | Multiple deep reviews and approval-ready Pursuits |
| Guided Pursuit Sprint | Human-assisted decision and approval-ready pursuit | First five at $399; next five at $499 | Three Decision Receipts, one approval-ready path, four Radar briefs |

Defer annual Radar until at least eight weeks of retention evidence. If supported, test approximately $199 to $240 per year.

### 7.1 Value equation

- Dream outcome: greater career and earning potential with control.
- Perceived likelihood: real Decision Receipts, visible evidence, freshness checks, corrections, and case outcomes.
- Time delay: one useful decision in the first session.
- Effort and sacrifice: minimum viable Profile, one URL, reuse of evidence, one next action.

### 7.2 Risk reversal

Do not guarantee interviews, offers, compensation, or time to hire.

Use controllable protections:

- free first Diagnostic without a card,
- in-product cancellation without friction,
- export and deletion of user-owned data,
- no external action without explicit approval,
- refund the first paid month if minimum inputs and one live job cannot produce a reviewable Decision Receipt,
- extend or refund the unfulfilled portion of a guided service when agreed deliverables are not completed after required user inputs.

### 7.3 Unit-economics hypotheses

| Offer | Revenue | Direct-cost ceiling | Contribution target |
|---|---:|---:|---:|
| Free Diagnostic | $0 | $8 plus no more than 20 operator minutes | Acquisition investment |
| Radar | $24/month | $6/month | $18, or 75% |
| Pursuit Sprint | $99 | $30 | $69, or about 70% |
| Guided Sprint | $499 | Three hours at $75 plus $35 tools/payment | $239, or about 48% |

Radar contribution-LTV sensitivity at $18 monthly contribution:

- 8% monthly churn: about $225,
- 12% monthly churn: about $150,
- 20% monthly churn: about $90.

Economic gates:

- keep Radar blended CAC below about $54, or three months of contribution,
- keep Guided Sprint CAC below $100,
- if Guided delivery remains above three hours after ten cases, narrow scope, automate the bottleneck, or raise price,
- if Radar direct cost exceeds $6, reduce source breadth before reducing proof quality.

## 8. Ruthlessly Scoped MVP

### 8.1 Primary JTBD

When an ambitious professional finds or is shown a potentially valuable role, help them decide whether it deserves pursuit, using evidence they can verify, before they invest in application work.

### 8.2 Software slice

1. Minimum Profile verification for one or two Role Lanes.
2. Compensation, logistics, current baseline, and hard constraints.
3. Manual job URL or pasted JD.
4. One monitored-source ingestion path.
5. Canonical employer, duplicate, active-state, and freshness verification.
6. Requirements matrix.
7. Radar Setup and a dated ranked Radar Brief.
8. Decision Receipt.
9. Separate system recommendation and `Pursue`, `Watch`, or `Pass` user-decision event.
10. One next-action log.
11. Minimal native Pursuit queue and workspace.
12. Native grounded materials and exact application-package review.
13. Employer-site handoff and confirmation state.
14. Outcome capture.
15. Weekly Radar Brief, manually curated at first.
16. Export and deletion.
17. Core telemetry and audit timestamps.

### 8.3 Explicit non-goals

- broad resume-template marketplace or advanced design engine,
- enterprise-scale application CRM, contact database, or collaboration suite,
- browser extension,
- autofill or auto-apply,
- broad ATS integration layer,
- proprietary high-volume job marketplace,
- generic AI chat interface,
- keyword score as the center of confidence,
- paid media before conversion is proven,
- final company rename,
- outcome guarantees.

### 8.4 Concierge operating model

| Stage | Start manually | First safe automation | Human judgment retained |
|---|---|---|---|
| Profile proof | Guided intake and source review | Extraction suggestions and conflicts | Approval, corrections, risky metrics |
| Role Lane | Structured conversation | Lane candidates and proof coverage | Final lane ownership |
| Finding | Selected source searches | One monitored path and deduplication | Source expansion and exceptions |
| Job verification | Canonical board and ATS checks | Active/freshness state checks | Migrations and suspicious legacy forms |
| Requirement mapping | AI-assisted extraction | Requirement-to-proof suggestions | Proven, risky, and disqualifying judgment |
| Ranking | Structured model | Dimension calculation and order | Overrides and opportunity-cost judgment |
| Decision Receipt | Operator template | Structured assembly | Final recommendation review |
| External execution | Human-readable package | Copy/download/upload bundle and guided employer-site handoff | Exact approval, submission, outreach, references, and verification |
| Outcome | Guided follow-up | Reminder and event capture | Interpretation until samples exist |

### 8.5 Data boundary

`Profile -> Role Lane -> Current Baseline -> Job Source -> Requirements -> Evidence Links -> Fit Assessment -> Decision Receipt -> Next Action -> Outcome`

Before unsupervised multi-user storage:

- Worker API becomes the network boundary,
- D1 becomes canonical truth,
- local IndexedDB remains a cache or draft buffer,
- tenant isolation, consent, export, deletion, and audit timestamps are verified,
- billing may remain manual until paid demand is proven.

## 9. 90-Day Delivery Roadmap

Numerical targets are validation gates, not forecasts.

### Days 0 to 30: prove the decision

| Workstream | Owner | Acceptance criteria |
|---|---|---|
| Authority and design | Product lead | Packet intentionally promoted; visual direction selected; clean feature branch from canonical main; WIP no greater than 2 |
| Matt case study | Job-search lead | Going proof interview complete; role reverified; approval-ready package produced; no external action without approval |
| Negative control | Proof lead | TextNow orphaned-form failure encoded as a fixture and QA test |
| Concierge alpha | Matt | Five qualified users each bring one role; four reach a defensible decision; zero unsupported external claims; median delivery under 120 minutes |
| Thin product slice | One writer | Minimum Profile, lane, job capture, integrity check, requirements matrix, Decision Receipt, decision event, export/delete, and telemetry pass targeted QA |
| Paid demand | Matt | Ten qualified prospects identified; at least three make a real paid commitment or deposit at $399 or more after seeing value |

### Days 31 to 60: prove willingness to pay and repeat use

| Workstream | Owner | Acceptance criteria |
|---|---|---|
| Paid beta | Matt | Offer 15 qualified prospects; at least five buy; cumulative beta revenue at least $2,000 |
| Safe automation | Product lead | Automate high-frequency extraction, integrity, and assembly steps; keep final recommendation reviewed |
| Radar | Beta operator | Four weekly briefs delivered; at least 60% review a surfaced opportunity; fewer than 10% of surfaced roles are clearly irrelevant |
| Efficiency | Beta operator | Median Decision Receipt time at or below 60 minutes; weekly active-user work at or below 30 minutes |
| Trust | QA lead | 100% source/freshness coverage; zero unsupported-claim exports; zero unapproved actions |
| Data safety | Technical lead | Canonical storage, isolation, consent, export, and deletion verified before asynchronous accounts |

### Days 61 to 90: prove a repeatable business

| Workstream | Owner | Acceptance criteria |
|---|---|---|
| Self-serve beta | Product lead | User can reach a first Decision Receipt without operator assembly; operator handles exceptions |
| Pricing | Matt | Test $24 Radar, $99 Sprint, and $499 Guided Sprint |
| Acquisition | Growth lead | Three repeatable channels produce qualified Diagnostics; no paid scale before CAC gates |
| Retention | Product lead | At least 40% of activated users take a meaningful opportunity action in three of four weeks |
| Revenue | Matt | Target 25 cumulative paying customers, including 10 recurring Radar customers |
| Quality | QA lead | Freshness false-positive rate below 5%; unsupported and unapproved incidents remain zero |

One hundred paying users is the next scale gate, not a day-90 promise.

## 10. Go-To-Market

### 10.1 First 10 to 20 paying users

Channels:

1. Matt's network of senior operators, fractional leaders, former colleagues, and broad-history professionals.
2. Founder-led invitations to people actively considering one role.
3. Two professional communities containing the beachhead persona.
4. Two independent coaches or outplacement practitioners willing to refer the Diagnostic.

Offer message:

> Bring one real job. Leave knowing whether it is worth your time, what proof supports you, and what gaps must be resolved.

Conversion flow:

1. ten-minute qualification,
2. free Diagnostic,
3. visible Decision Receipt,
4. Guided Sprint offer only after value is visible,
5. separate permission for anonymized case-study use,
6. one referral request only after a useful decision.

No invitation, email, post, or referral request is sent without Matt's approval of the exact message and recipients.

### 10.2 Path to 100 paying users

Directional channel mix:

- 15 from Matt's network,
- 25 from customer referrals,
- 35 from coaches, outplacement partners, alumni, or professional communities,
- 25 from proof-led content and inbound Diagnostics.

At a hypothetical 30% Diagnostic-to-paid conversion, 100 payers would require about 334 completed Diagnostics. This is a planning sensitivity, not a forecast.

Paid acquisition starts only after:

- at least 20 people have paid,
- Diagnostic-to-paid conversion is stable,
- four-week retention supports recurring value,
- cash CAC stays below the relevant payback threshold.

### 10.3 Proof-led content themes

- orphaned job forms and false freshness,
- Decision Receipt teardowns,
- why a visible role is not worth pursuing,
- proof-gap examples,
- compensation and pursuit-effort tradeoffs,
- quiet weekly opportunity briefs for defined Role Lanes.

## 11. Measurement And Stop Criteria

### 11.1 North Star

`qualified interviews per active search cycle`

### 11.2 Primary value metric

`evidence-backed opportunity decisions per activated user per week`

### 11.3 Measurement tree

| Layer | Metrics |
|---|---|
| Acquisition | Qualified visitor, Diagnostic start/completion, source, cash CAC, time CAC |
| Activation | Minimum Profile, approved lane, constraints, first deep review, first decision, time to first decision |
| Decision quality | Relevance, correction rate, source/freshness coverage, false positive, false negative |
| Trust | Unsupported-claim incidents, proof overrides, source conflicts, unapproved actions |
| Execution | Time to approval-ready assets, qualified applications, pursuit effort |
| Outcome | Screens, interviews, offers, compensation and benefits improvement, objection themes |
| Retention | Weekly brief reviewed, meaningful decisions, week-1/week-4 use, post-placement return |
| Economics | Operator minutes, model/data cost, support cost, contribution, CAC payback, refund rate |

### 11.4 Stop or pivot criteria

- If fewer than four of five alpha users reach a defensible decision, repair activation before building more.
- If fewer than five of 15 qualified prospects pay at least $399, change persona, offer, or value demonstration before adding features.
- If fewer than 30% of activated users act on Radar in three of four weeks, stop leading with subscription and sell episodic Sprints.
- If Guided delivery stays above three hours after ten cases, automate, narrow, or reprice.
- Any unsupported external claim or unapproved action pauses acquisition until repaired.
- Freshness false positives above 5% pause automated recommendations.
- Paid acquisition stops when CAC exceeds three months of gross contribution.
- Do not judge interview effectiveness until at least 20 qualified applications exist.
- If users value rejection and clarification but not monitoring, pivot to decision-and-pursuit rather than forcing Radar retention.

## 12. Matt Case-Study Zero

### 12.1 Baseline

Matt's current environment includes broad plausible role lanes, fragmented saved jobs, repeated manual reconciliation, inconsistent freshness and compensation data, and a need to balance speed with proof safety.

Track from this point forward:

- roles reviewed,
- canonical and freshness failures caught,
- weak pursuits avoided,
- minutes to decision,
- proof gaps surfaced,
- user corrections,
- approval-ready applications,
- qualified applications,
- screens and interviews,
- offers,
- compensation and family-benefit improvement,
- unsupported-claim incidents.

### 12.2 TextNow negative control

Product proof available now:

- a legacy Lever job and application still rendered,
- the role was absent from the current Greenhouse board,
- the retired Lever board showed no openings,
- public hire evidence indicated the role had been filled,
- the correct user decision was `Pass`; the product then archived it before asset work.

This should become a product fixture for `orphaned_legacy`, `canonical_board_absent`, `filled_or_closed`, and `pass_archived` states.

### 12.3 Going active case

Verified on 2026-07-16:

- exact role: Director, Lifecycle Marketing,
- canonical Going careers page and Ashby board both list it,
- published 2026-07-10,
- remote in U.S. time zones,
- salary starts at $175,000 plus equity,
- Going states it covers 90% of employee and 80% of dependent health care,
- 5% 401(k) match with immediate vesting,
- up to 12 weeks paid family leave,
- current fit decision: 85/100, pursue after proof validation.

Current proof gaps:

1. Braze Canvas, Liquid, trigger, integration, and reporting depth.
2. Direct push and in-app ownership.
3. Cohort, retention, LTV, and SQL depth.
4. Lifecycle-specific AI personalization, segmentation, content, or optimization.
5. Exact years and scope of end-to-end lifecycle ownership.

Case sequence:

1. record Matt's starting confidence and expected effort,
2. conduct the focused proof interview,
3. update evidence states and the Decision Receipt,
4. reverify the live role,
5. prepare the grounded resume and exact narrative answers, using Matt's temporary Teal workflow only for his case study until the native replacement exists,
6. stop for Matt's approval,
7. submit only after explicit approval,
8. capture every downstream outcome and correction,
9. update thresholds and product logic.

Claims available now:

- the system prevented effort on a technically accessible but filled role,
- it elevated a fresh, high-value active opportunity,
- it exposed the exact proof gaps that must be resolved before drafting.

Claims not available:

- improved interview probability,
- accelerated hiring,
- increased compensation,
- produced an offer.

## 13. Naming Strategy

Do not select a final name until the beta wedge, free boundary, and launch experience have been tested.

### 13.1 Naming criteria

A viable name must:

- communicate direction, signal, trust, or career movement,
- support passive monitoring and active pursuit,
- feel credible to a $90,000 to $250,000 professional,
- avoid resume-builder, job-board, auto-apply, hustle, surveillance, and guarantee associations,
- work above Opportunity Radar, Pursuit Sprint, Career Baseline, and Decision Receipt,
- be easy to pronounce, spell, remember, and use in UI,
- pass trademark, company-name, domain, handle, and search-result checks,
- create the correct five-second category expectation.

### 13.2 Preliminary collision screen

The first 20 territory starters were useful for learning, but the live web screen on 2026-07-16 found that the category is much more crowded than the original list implied.

Immediate eliminations because active adjacent products already use the name or a near-identical form:

- [Bearing](https://joinbearing.com/), which already markets AI career intelligence for senior professionals,
- [CareerVector](https://www.careervectorhq.com/),
- [CareerSignal](https://careersignalhq.com/),
- [RoleSignal](https://rolesignal.app/),
- [CareerPulse](https://careerpulse.macneilmediagroup.com/),
- [RoleRadar](https://www.roleradar.net/),
- [CareerScope](https://www.careerscope.me/),
- [CareerLift](https://careerlift.ai/),
- [Rolewise](https://rolewiseapp.com/),
- [CareerProof](https://careerproof.ai/),
- [ProofPath](https://proofpath.com/),
- [Proofline](https://proofline.ai/),
- [NextArc](https://nextarc.io/),
- [Opportunity Lens](https://opportunitylens.vercel.app/).

High-caution names because current companies already use them in other software or service categories include FitSignal, SignalPath, ClearLane, FitLedger, and BetterMove. Workward did not show an obvious adjacent product in the preliminary web search, but it has not passed a trademark, company-name, domain, pronunciation, or customer-comprehension test and is not a recommended finalist.

Decision: none of the original 20 candidates is ready to advance. Keep `Job Filter` as the working name while a fresh round is tested against real customer language. This screen is not legal clearance.

### 13.3 Next creative territories

The next round should generate new coined or suggestive names from three territories:

1. career direction without generic `career` naming,
2. high-signal decisions without generic `signal` naming,
3. durable upward optionality without promising outcomes.

Do not force proof into the company name. Keep `Decision Receipt`, `Opportunity Radar`, `Weekly Opportunity Brief`, and `Pursuit Sprint` available as public product language. Keep `Career Graph` as internal architecture; use `Career Baseline` for the user-facing object.

### 13.4 Expert-screened shortlist

Additional linguistic, conversion, association, and preliminary collision work narrowed the decision to one advancing candidate and two backups:

| Rank | Candidate | Status | Why | Primary risk |
|---:|---|---|---|---|
| 1 | Worthward | Advance to validation and clearance | Distinctive, relevant, and best observed collision profile | May be heard as `Worthword`; `ward` and self-worth associations require testing |
| 2 | ConsiderNext | Functional backup | Clear deliberate-decision mechanism and easy pronunciation | Generic career language, unfinished-CTA feel, and weak ownability |
| 3 | Nextworthy | Emotional-safety backup | Coined and close to the opportunity-selection job | Can imply that the person, rather than the opportunity, is being judged worthy |

Worthward is not legally cleared. UpsideMap, WorthNext, BetterAhead, BetterArc, SteadyNext, OnlyWhen, EverNext, WorkAhead, NextStandard, and Moveframe were removed after current exact, near-exact, category, or association checks.

The full evidence, rejected-name rationale, audio test, comprehension test, emotional-safety test, and formal-clearance ladder are in [Brand name shortlist, 2026-07-17](../brand-name-shortlist-2026-07-17.md).

Keep Job Filter as the repository and working product name until Worthward passes the user and formal-clearance gates. If it fails, run another creative round rather than forcing a backup into the market.

### 13.5 Name test

Test each finalist inside real product language:

- `[Name] found one opportunity worth reviewing.`
- `Your [Name] Radar is ready.`
- `Review the Decision Receipt in [Name].`
- `[Name] helps you find the next move worth making.`

Measure hear-once spelling, comprehension, emotional safety, trust, delayed recall, expected category, and willingness to open. Do not use a preference-only poll. For Worthward, require at least 80 percent correct unaided spelling and no more than 10 percent `word` variants before formal clearance work.

## 14. UX And UI Status

Three screenshot-grounded 1440 by 1024 directions now exist:

1. `artifacts/product-audit/2026-07-16/phase2-primary-screen-option-1-decision-desk.png`
2. `artifacts/product-audit/2026-07-16/phase2-primary-screen-option-2-radar-brief.png`
3. `artifacts/product-audit/2026-07-16/phase2-primary-screen-option-3-proof-lens.png`

Selected screen mapping:

- Option 1 is retired as a whole screen and supplies ranked-row and compact Decision Receipt components only.
- Option 2 supplies the dated Radar Brief, not the generic Jobs home or Radar Setup.
- Option 3 supplies the individual Opportunity Review and requirement-lineage detail.
- Radar Setup and Pursuit Application require new designs.
- Light and dark themes must have feature parity, with `System` as the default setting.
- Public UI must not make fixed review-duration promises without current, user-specific evidence.

Remaining build gate: do not begin runtime UI implementation until the selected direction is reconciled into Chapter 05, Chapters 01 through 05 have approval receipts, `FS8` exists, the ClickUp packet is refreshed, WIP is verified, and one implementation owner is assigned.
- After approval, one implementation writer builds the smallest complete Profile -> Jobs -> Review -> Pursuit slice.
- The build must use real case-study data, then verify desktop, mobile, keyboard, loading, empty, error, conflict, and success states.
- Final visual QA compares the implementation and selected design at the same viewport.

## 15. Exact Next Seven Days

### Day 1

- Confirm the four-screen system and action vocabulary.
- Conduct the Going proof interview.
- Reconfirm the current role immediately before asset work.

### Days 2 to 3

- Produce Going's proof-updated Decision Receipt.
- Prepare the grounded resume strategy and exact narrative application answers. Matt's personal Teal use remains a temporary case-study operation, not product architecture.
- Stop for approval before any tracker mutation or live form action.
- Encode TextNow as the first opportunity-integrity fixture.

### Days 3 to 5

- Intentionally promote the authority and launch packets into a clean Job Filter branch after reviewing the dirty/stale checkout state.
- Refine the four-screen core product family without beginning production runtime implementation.
- Create the concierge Diagnostic template and operator checklist.

### Days 5 to 7

- Identify five alpha users and ten paid-beta prospects.
- Review the companion customer-discovery and paid-beta script, including the unsent founder invitation, for Matt's approval.
- Run the first concierge Diagnostic only after recipient and message approval.
- Instrument operator time, correction rate, decision confidence, and source/freshness coverage.

## 16. Authority, Risks, And Rollback

### Current authority facts

- This packet is staged under `/private/tmp/job-filter-authority-stage`.
- Canonical Job Filter is `origin/main@2a1b2b4`.
- Candidate Product OS and implementation work on `27580ba` is reference-only.
- The current Job Filter checkout is on `codex/skill-sync-job-filter-20260513`, with a modified `.codex/bootstrap.md`; do not edit through that checkout.
- The Job Search checkout failed readiness because it is ahead with untracked work; do not mutate any live tracker from it.
- Teal remains a temporary tool in Matt's personal job-search workflow and dated competitor intelligence only. It is not a customer-product dependency.
- The Decision Receipt data, telemetry, metric, migration, and test contract is staged at `docs/product/packets/phase2-decision-receipt-data-telemetry-and-test-contract-2026-07-16.md`.
- The promotion and `FS8` gate sequence is staged at `docs/product/packets/phase2-governance-promotion-and-fs8-reset-packet-2026-07-16.md`.
- Chapter 05, explicit Chapters 01 through 05 approvals, `FS8`, ClickUp read-after-write refresh, and Matt's visual selection remain open; implementation is blocked.

### Material risks

| Risk | Control | Rollback |
|---|---|---|
| Category claims are already occupied | Compete on proof, integrity, economics, and transparency | Narrow the promise further |
| Profile setup creates fatigue | Minimum viable proof and first decision quickly | Return to concierge intake |
| Radar is noisy | Material-upside threshold and 0 to 3 item brief | Revert to manual curation or episodic Sprint |
| AI invents proof | Suggested states, lineage, review, export block | Disable generation and retain manual matrix |
| Job integrity fails | Canonical board, ATS, duplicate, and freshness checks | Mark unknown and suppress |
| Employer ATS or browser handoff becomes unreadable | Human-readable export package and explicit unknown state | Continue without claiming submission |
| Subscription churn after placement | New-role baseline and low-effort market-position brief | Sell episodic Sprint |
| Scraping or platform risk | User-initiated URLs and permitted sources | Disable the monitored source |
| Sensitive career data | Minimize data, consent, isolation, export, deletion | Delete beta data and return to local-only |
| Delivery drift | One writer, WIP limit, small commits, acceptance checks | Revert feature branch |

### Rollback

- The staging packet and copied artifacts are additive.
- No current-main runtime behavior has changed.
- Removing the staging tree restores the pre-Phase-2 product state.
- Every later promoted change must be small, reviewable, and reversible.

## 17. Research Sources

Primary local authority and evidence:

- `docs/product/foundation-series/01-market-intelligence.md`
- `docs/product/foundation-series/02-brand-strategy.md`
- `docs/product/foundation-series/03-product-system.md`
- `docs/product/foundation-series/04-website-public-funnel.md`
- `docs/product/packets/phase2-career-opportunity-platform-authority-2026-07-16.md`
- `docs/product/packets/phase2-customer-discovery-and-paid-beta-script-2026-07-16.md`
- reference-only `27580ba:docs/product/PRD_V3.md`
- reference-only `27580ba:docs/product/product-os/**`
- `source-files/01_matt_dimock_canonical_profile.md`
- `source-files/02_metrics_ledger.md`
- `source-files/03_role_lane_glossary.md`
- `source-files/04_story_bank.md`
- `source-files/05_outreach_templates.md`
- `/Users/mattdimock/Documents/Strategies/Alen Sultanic/Alen Sultanic Strategies & Tactics - Catalog.md`
- `/Users/mattdimock/Documents/Strategies/Alex Hormozi/$100M Offers Book.pdf`
- `/Users/mattdimock/Documents/Strategies/Alex Hormozi/$100M Pricing Playbook.pdf`
- `/Users/mattdimock/Documents/Strategies/Alex Hormozi/$100M Retention Playbook.pdf`

External sources are linked beside the claims they support. Pricing, product claims, labor data, and job facts should be refreshed before public use.
