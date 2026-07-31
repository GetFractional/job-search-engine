# 15 Prototype V2 Implementation and Quality Review

**Review date:** 2026-07-19
**Accountable owner:** Head of Product, integrated by the CEO
**Independent gate:** Independent Quality Director
**Status:** Code candidate with a blocked current-build browser gate. Local type, build, truth, and lint gates pass. Fresh visual, real-device, assistive-technology, external-user, live-data, and payment gates remain open.

## Executive result

The first full-funnel prototype was rebuilt into a clearer mobile-first decision journey without discarding the selected Executive Evidence identity. The revision fixes the malformed job-entry control, increases reading space, restores the connected Integrity Preview timeline, simplifies the first layer of customer language, makes onboarding choices real and editable within the session, compares the sample job with the priorities the user entered, separates recurring software from a focused search and optional human help, and prevents an unconfirmed plan from appearing active.

This is ready for a fresh browser QA run before a founder walkthrough. It is not yet ready for a private phone-review checkpoint or production beta. The prototype still uses synthetic jobs and profiles, keeps account and onboarding state only in the current session, does not ingest a live job, does not call an AI model, does not charge a card, and does not support full job-review examples for the hourly or career-change samples.

## What changed

| Surface | Prior failure | Implemented correction |
|---|---|---|
| Homepage | Abstract promise, compressed reading rhythm, malformed nested job field | Outcome-led headline, ordinary-language explanation, one resilient job-link-or-description field, visible sample path, more mobile space, and the original connected check timeline |
| Job capture | Arbitrary pasted content eventually looked as though it had been analyzed | Arbitrary content is explicitly marked not analyzed; only a clearly labeled action can replace it with the fictional Going sample |
| Account and repeat use | A returning user had to rebuild setup when checking another job | Account, goal, profile, priorities, and career direction persist while the prototype remains open; a completed user returns directly to the sample review |
| Onboarding | Matt-specific defaults and one senior profile masqueraded as universal behavior | Blank priorities plus three fictional profiles: established salaried, hourly with schedule limits, and career changer; each has distinct career directions and evidence boundaries |
| Career Baseline | Hard-coded salary, remote, benefits, and growth assumptions | Required pay basis, minimum, target, and work arrangement; optional schedule, commute, benefits, and growth; salary and hourly units remain separate |
| Career plan | Claimed personalization without receiving user priorities | The plan shows the chosen search mode, sample experience, selected direction, and a separate summary of the user's job standard |
| Job review | Fixed recommendation competed with dense technical explanation | User priorities now generate match, conflict, and open-question counts; the fixed `85` is labeled sample experience fit; decision, reason, main risk, and what could change the answer lead; evidence detail is expandable |
| Hourly and career-change paths | Incompatible users could be sent into an unrelated senior-role review | Those examples stop at an explicit prototype boundary instead of pretending that the Going role is personal |
| Application materials | The next step did not prove that the user opened each item | The full application review stays disabled until resume, cover letter, and answers have each been opened |
| Application approval | Technical state dominated the customer layer | Plain-language destination, files, answers, approval scope, and external-action boundary lead; technical record is collapsed |
| Pricing | Free, recurring software, a search pass, and human service appeared as peers | Try It Free leads; Keep Watch has monthly and three-month billing terms; Active Search is a non-renewing 30-day product; Guided Help is a separate qualification path |
| Checkout and Settings | Choosing a plan could make it look active before confirmation | A pending checkout choice is separate from the active saved plan; Settings changes only after confirmation and can cancel the test renewal |
| Appearance and notifications | Theme intent existed, while several settings were non-persistent | Light, Dark, and System are explicit; notification choices persist locally |

## Provisional offer architecture

These prices are research hypotheses, not approved public prices.

| Offer | Job it does | Test price | Billing and fulfillment truth |
|---|---|---:|---|
| Try It Free | Let a person experience one complete job decision | $0 | No card and no renewal; the current prototype demonstrates this with a fictional job |
| Keep Watch | Quietly monitor for jobs that clear the user's standard | $24 monthly or $59 for three months | One software offer with two billing terms; the three-month term saves $13 versus three monthly payments |
| Active Search | Support a concentrated search without creating another indefinite subscription | $99 for 30 days | One payment, no renewal, defined job-check and guided application-workspace limits; no implied human concierge |
| Guided Help | Add a person for one difficult, high-stakes, or changing search | $499 tightly bounded founding-beta hypothesis | Separate qualification and service-delivery path; not included in software |
| Contextual Expert Review | Resolve one consequential job decision when self-serve is not enough | $199 hypothesis | Kept out of the public plan grid; show only in an eligible job context after a completed review |

The offers must be tested separately for comprehension, willingness to pay, fulfillment cost, support demand, cancellation expectations, and contribution margin. A lower competitor price does not automatically mean the offer is better. The comparison must include decision quality, effort removed, limits, renewal, source quality, and whether the product actually works on difficult job descriptions.

## Company evaluation system

The evaluation is run like a company, not a collection of interchangeable agents.

| Sequence | Accountable role | Required partners | Decision produced |
|---|---|---|---|
| 1. Customer task and journey | Head of Product | Service Design, Customer Insights, Career Intelligence | One user job, promise, route, primary action, back/edit behavior, and stop condition for every screen |
| 2. Comprehension and language | Content Design and Plain-Language Lead | Product Marketing, Customer Research, Trust | First-layer copy that target users can explain without facilitator translation |
| 3. Mobile interaction and visual system | Principal Mobile Product Designer | Design Systems, Accessibility, Product Engineer | Spacing, hierarchy, components, responsive behavior, theme parity, and progressive disclosure |
| 4. Career meaning | Head of Career Intelligence | Decision Scientist, Recruiter, Compensation, Pursuit Strategist | Requirements, preferences, economics, benefits, risks, and recommendations that remain decision-useful when simplified |
| 5. Job interpretation and AI quality | Applied AI and Evaluation Lead | Ontology, Source Operations, Career Intelligence, Trust | Adverse fixture suite for missing, contradictory, stale, ambiguous, and malformed job information, with explicit unknowns and no fabricated facts |
| 6. Offer and economics | Head of Growth and Revenue | Pricing Research, Finance, Product, Customer Success | Comprehensible offers, correct fulfillment, cost ceilings, renewal rules, and stop conditions |
| 7. Trust and consequential action | Head of Trust and Risk | Privacy, Claims, Security, Career Intelligence | Accurate privacy, AI, source, billing, no-guarantee, and exact-approval boundaries |
| 8. Independent release review | Independent Quality Director | Product QA, Visual and Accessibility QA, Career-Fact QA, AI/Data QA, Security QA | Pass or block verdict; the creators cannot self-approve their own work |
| 9. Reserved decision | Matt, Board | CEO recommendation and evidence packet | Approve another local iteration, a private hosted checkpoint, external alpha recruiting, real pricing test, or production work |

## Verification completed

The local automated gate passed on the implementation candidate:

- TypeScript typecheck: pass.
- Production build: pass.
- Rendered truth, state, funnel, offer, plain-language, and regression checks: 12 of 12 pass.
- ESLint: pass with no warning output.
- Existing local fixtures preserve source-kind, correction-invalidation, plan-state, and exact-approval boundaries.

An earlier browser walkthrough and pre-final reference screenshot set are stored in:

- `prototypes/worthward-mobile/qa/ux-audit-2026-07-19/v2-final/`

Those images were captured from a stale server bundle on port 3004 and must not be treated as evidence for the current implementation. The exact current build is served locally at `http://localhost:3010/#/`. A fresh 390-pixel customer journey, 320-pixel narrow mobile, 768-pixel tablet, 1280-pixel desktop, Light and Dark theme, interaction, and state walkthrough remains blocked because the local browser verification runtime aborts at launch. This is an environment blocker, not a visual pass.

## What this verification does not prove

- It is not a real iPhone Safari, keyboard, safe-area, or network-condition test.
- It is not VoiceOver, TalkBack, Switch Control, or a complete WCAG audit.
- It does not show that a first-time person understands the homepage or prices without help.
- It does not validate willingness to pay, retention, job outcomes, or unit economics.
- It does not validate live job extraction, canonical-source resolution, model quality, cost routing, or payment behavior.
- It does not establish legal clearance for My Way Ahead, mywayahead.com, source collection, pricing claims, privacy terms, or consumer terms.

## Remaining release gates

1. Restore the browser verification runtime in a clean task or environment, capture the exact current build on port 3010, compare it with the selected visual reference, and correct visible defects.
2. Matt completes the founder walkthrough only after the fresh responsive, theme, interaction, and state evidence is available.
3. Publish one private checkpoint only after Matt approves the visual and journey direction, then test on an actual iPhone.
4. Run VoiceOver, keyboard, 200-percent zoom, reduced-motion, Light, Dark, and System checks.
5. Run five-second homepage comprehension and pricing-card sorting with no more than five approved target participants.
6. Connect one live-job capture path only after the job-extraction benchmark and privacy route pass.
7. Keep prices non-binding until offer comprehension, fulfillment cost, willingness to pay, refunds, renewal expectations, and contribution margin are measured.
8. Resume Matt's founder-dogfooding job search through the same member product; product work must not become a reason to delay his next credible application, and his result must not be presented as efficacy proof.

## Board decision requested next

Start the next execution task from the transfer package, restore fresh current-build browser evidence, and return with the corrected visual set and one founder-review link. The subsequent Board decision will be whether to approve a private hosted checkpoint for iPhone testing. It will not authorize a public launch, external participant outreach, payment activation, live AI or job-source connections, or a job application.
