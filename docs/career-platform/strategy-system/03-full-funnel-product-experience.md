# 03 Full-Funnel Product and Experience System

> **Current authority, 2026-07-21:** The journey below preserves useful object and state design, but its live-role-first entry, Free/Pro choice, and optional Expert/Guided gate are superseded. The path-first minimum-click journey, current private offer catalog, and paused human services are governed by [16 Founder Feedback Product Reset](16-founder-feedback-product-reset-2026-07-21.md) and the [Unit Economics Ledger](../company-os/my-way-ahead-unit-economics-ledger-2026-07-21.md).

## Product decision

The future product is one connected journey from public promise to career compounding. The initial beachhead needs one canonical live-role path that proves the decision quality before asking for a subscription, followed by one transparent product gate and a separate optional expert gate:

> **Home -> choose current need -> paste one real role -> free Integrity Preview -> create an account to save -> import minimum evidence -> define the Career Baseline -> receive one complete self-serve Decision Review free -> decide -> choose Free, Pro Monthly, or Pro 3-Month for continued decisions, Radar, and Pursuit -> optionally add Expert Review or Guided help -> prepare and approve -> capture outcomes -> update strategy**

`Explore career direction` remains a secondary branch for people without a live role: choose need -> create account -> import minimum evidence -> define the baseline -> compare Role Lanes -> approve a Career Strategy Brief. Radar and continuous discovery are simulated future capabilities until source coverage and subscription value pass their gates. A free user may keep the first complete self-serve Decision Review and stop. The prototype must never imply that a subscription, human Expert Review, or Guided Career Move has been delivered before its corresponding offer gate.

Every current visual fixture uses the same provisional **My Way Ahead** identity, always shown as three words with the category descriptor `Career decisions for experienced professionals.` Directions may vary information hierarchy, interaction, density, typography, color, and motion; they may not vary the brand name, funnel, price, core claims, fixture truth, or authority boundary.

The previous prototype started in the middle of this journey. It assumed the user understood the product, had a trustworthy profile, and knew what Radar meant. The next prototype must let Matt experience the product as a new visitor and understand every transition without reading supporting documentation.

## Core product objects

| Object | Plain-language meaning | User control |
|---|---|---|
| Career Baseline | Where the person is now and what a better move must improve | User approves facts, constraints, and tradeoffs |
| Experience and Evidence | Work history, achievements, metrics, skills, stories, sources, and exclusions | User verifies, corrects, or excludes each material fact |
| Role Lane | A credible direction defined by actual mandate, level, economics, and proof | User approves, watches, or retires lanes |
| Career Strategy Brief | A versioned synthesis of the career outcome, supported lanes, market thesis, proof capital, gaps, Radar rules, active bets, and learning | Read-only synthesis with links to edit the owning objects |
| Opportunity Radar | A saved monitor for what should be scanned, suppressed, and surfaced | User controls criteria, cadence, sources, and notification rules |
| Radar Brief | A dated result from one Radar run | User can inspect why items surfaced, were suppressed, or remain unresolved |
| Canonical Opportunity | One real employer opening reconciled across sources and duplicates | User can report corrections and inspect source state |
| Opportunity Review | The analysis that supports a Pursue, Watch, or Pass decision | User owns the decision; the system recommendation remains read-only |
| Decision Receipt | The versioned record of evidence, recommendation, risk, decision, and next action | User can export, correct, or supersede it |
| Pursuit | Intentional work on one opportunity from preparation through outcome | User may stop, change priority, or withdraw |
| External Approval | Permission for one exact action, payload, destination, and version | Narrow, explicit, revocable, and invalidated by change |
| Outcome Event | What the market actually did, plus the user's interpretation | User confirms the event and may opt into research learning |

## The four axes that must never be confused

| Axis | Example | What it changes |
|---|---|---|
| System recommendation | Pursue, Investigate, Watch, Pass, Ignore | Advice only |
| User decision | Pursue, Watch, Pass | Saves the person's intent |
| Workflow action | Resolve proof, prepare materials, review package | Advances work inside the product |
| External approval | Approve this application package for this employer destination | Authorizes only the exact displayed external action |

The user decision appears once per decision context. A recommendation is never styled like a button. `Investigate` is not a user decision. Pursue begins preparation and never implies submission.

## Complete platform screen inventory

A screen family is a template with a distinct user job and route responsibility. Mobile, desktop, light, dark, loading, empty, stale, conflict, and error variants are states, not separate screens.

The durable platform currently contains **34 screen families** across customer, commercial, and operator surfaces. The first prototype should bring the **19 starred customer and commercial families** to life as one coherent full-funnel flow. This is a concept-validation prototype, not authorization to build all 19 as production software before paid validation.

### Public acquisition and trust

| # | Screen family | User job | Release |
|---:|---|---|---|
| 1 | **Home*** | Understand the outcome, audience, difference, and first action | Prototype |
| 2 | How It Works | Understand Baseline, Strategy, Radar, Review, and Pursuit | Paid beta |
| 3 | **Pricing*** | Understand My Way Ahead Free, Pro Monthly at $49, Pro 3-Month at $119 with a $28 or 19.0% saving, and the separately priced $199 Expert Review or $699 founding Guided Career Move without hidden limits or renewal ambiguity | Prototype |
| 4 | **Opportunity Integrity Preview*** | Paste one role and see employer, source, liveness, duplicate, compensation-availability, and uncertainty checks before exhaustive setup | Prototype |
| 5 | **Authentication*** | Sign up, sign in, verify, reset, or resume | Prototype simulation, real in beta |
| 6 | Privacy | Understand data use, AI providers, retention, export, deletion, and controls | Before paid beta |
| 7 | Terms | Understand limits, billing, acceptable use, and no-guarantee boundary | Before paid beta |
| 8 | Not Found and Recovery | Recover from stale links or removed opportunities | Paid beta |

### Onboarding, profile, and career strategy

| # | Screen family | User job | Release |
|---:|---|---|---|
| 9 | **Choose Your Mode*** | Select urgent search, better-job search, career change, or passive monitoring before role capture; edit later without repeating onboarding | Prototype |
| 10 | **Experience Import*** | Import resume or profile, inspect extraction, and continue manually if needed | Prototype |
| 11 | **Career Baseline*** | Define what materially better means across economics, work, risk, and constraints | Prototype |
| 12 | Evidence | Approve facts, metrics, stories, safe wording, and exclusions | Paid beta |
| 13 | **Role Lanes*** | Compare credible directions, transferability, gaps, demand, and upside | Prototype |
| 14 | **Career Strategy Brief*** | See the current career strategy, why it exists, what changed, and one next action | Prototype |
| 15 | **Radar Setup*** | Define what to monitor, suppress, and alert on | Prototype |

### Opportunity discovery and decision

| # | Screen family | User job | Release |
|---:|---|---|---|
| 16 | **Radar Brief*** | See whether anything deserves attention, including an honest no-action result | Prototype |
| 17 | Opportunities | Manage surfaced, added, watched, passed, unresolved, duplicate, and inactive jobs | Paid beta |
| 18 | **Opportunity Review*** | Understand Integrity, Move Value, Readiness, evidence, economics, risks, and effort | Prototype |
| 19 | Add or Capture Opportunity | Paste a URL or description, resolve duplicates, and inspect capture quality | Paid beta; use a sheet in prototype |

### Pursuit and outcome

| # | Screen family | User job | Release |
|---:|---|---|---|
| 20 | **Pursuit Queue*** | See committed work, blockers, priority, and one next action per pursuit | Prototype |
| 21 | Pursuit Overview | Understand strategy, current state, risks, contacts, and next action | Paid beta |
| 22 | **Materials*** | Create and approve truthful resume, letter, answers, and supporting proof | Prototype focused state |
| 23 | **Application Review*** | Inspect the exact package, destination, action, approval, and handoff status | Prototype |
| 24 | Interview Center | Prepare stories, likely objections, research, questions, and follow-up | V1 |
| 25 | Offer and Decision | Compare compensation, benefits, risk, growth, and negotiation choices with the baseline | V1 |
| 26 | Outcome and Learning | Record stage, response, feedback, compensation, corrections, and strategy impact | Paid beta |

### Account and control

| # | Screen family | User job | Release |
|---:|---|---|---|
| 27 | **Settings*** | Control appearance, notifications, privacy, data rights, AI processing choices and disclosures, account, and billing | Prototype appearance and privacy; complete in beta |

Safety policy, benchmark qualification, and data class still govern provider routing. A user preference may choose a safer option or opt out; it may never force confidential data through an unsafe route.

### Commercial conversion and service delivery

| # | Screen family | User job | Release |
|---:|---|---|---|
| 28 | **Service or Plan Selection*** | After the free first decision, compare My Way Ahead Free, Pro Monthly at $49, and Pro 3-Month at $119; after a Pursue decision, compare self-guided product access with the clearly separate $199 Expert Review or $699 founding Guided Career Move | Prototype simulation; real in paid beta |
| 29 | **Checkout and Booking*** | Review the exact selected price, scope, three-month saving when applicable, renewal date, cancellation, consent, and scheduling before any paid work or charge | Prototype simulation; secure hosted checkout in beta |
| 30 | **Confirmation and Receipt*** | Understand what was purchased, what happens next, how to get help, and how to cancel or request a refund | Prototype simulation; real in paid beta |

### Founder and operator control

| # | Screen family | User job | Release |
|---:|---|---|---|
| 31 | Founder Strategy Center | See current decisions, experiments, economics, WIP, risks, approvals, and the next founder decision | Before functional alpha |
| 32 | Case Workbench and Adjudication | Deliver one case, resolve source or evidence ambiguity, record corrections, and preserve versions | Before functional alpha |
| 33 | Source, Model, and Cost Health | Monitor source failures, provider qualification, capacity, latency, review burden, and spend | Before any production automation |
| 34 | Trust Incident and Approval Queue | Contain incidents, inspect affected versions, record exact approvals, and verify rollback | Before paid beta |

Intermediate proof review, source inspection, correction impact, pass reason, destructive confirmation, and exact approval use sheets or dialogs. They should not become routes unless user testing proves a distinct navigation job.

## Public website strategy

### Homepage job

The homepage should move a qualified visitor from `this search is noisy` to `this can improve a consequential decision` and then into a low-friction first result.

Recommended module order:

1. **Hero:** specific outcome, who it helps, one primary action.
2. **Current pain:** too many roles, weak legitimacy, unclear fit, fragmented tools, little feedback.
3. **Mechanism preview:** Career Baseline -> Opportunity Integrity -> Decision Receipt -> guided pursuit. Show Radar later as a future monitoring capability, not the launch mechanism.
4. **Decision example:** show one realistic opportunity with a positive reason, invalidating risk, uncertainty, and next action.
5. **Why existing tools are insufficient:** respectful contrast with boards, trackers, resume scanners, and volume agents.
6. **Trust behavior:** source freshness, corrections, no invented claims, private monitoring, exact external approval.
7. **Persona paths:** active search, passive monitor, level-up, career change.
8. **Offer and pricing preview:** clear free value, paid boundaries, no surprise renewal language.
9. **Proof:** begin with transparent founder case-study methods; add outcome claims only after evidence exists.
10. **Objections:** setup burden, AI quality, privacy, free alternatives, what happens after hiring.
11. **Final action:** check one real opportunity or join the guided beta.

Do not lead with a dashboard screenshot, feature grid, AI model name, fixed completion time, unsupported user count, salary claim, or guaranteed outcome.

### Website conversion job by page

| Page | Primary belief shift | Primary action |
|---|---|---|
| Home | A consequential career move should be compared with the person's real baseline, not only scored as a posting | Check one opportunity |
| How It Works | The product can be rigorous without being exhausting | See an example or start |
| Pricing | The free and paid contrast is fair and understandable | Choose mode or join beta |
| Integrity Preview | The system can establish opportunity integrity and ask only for baseline facts that can change the decision | Save the result and unlock the first complete decision by creating an account |
| Privacy | The user remains in control of sensitive career data | Continue with informed consent |

## Progressive onboarding

### Step 1: choose mode before role capture

Ask one high-signal question:

> What do you need help with right now?

- Find a better job now
- Stay open to a better opportunity
- Change direction
- Prepare for the next level

This configures emphasis, not a permanent persona label. It is the same starred Choose Your Mode interaction used in the public route. After account creation, onboarding displays the saved choice for editing rather than asking the question again.

### Step 2A: live-role branch earns the first decision

The user pastes one role and receives the free Integrity Preview before creating an account. After account creation, the user imports only the minimum useful evidence and defines the Baseline needed for one complete self-serve Decision Review. This first decision is free and no-card. Human adjudication is not silently included. Any Expert Review must show its exact scope and price before human work begins.

### Step 2B: direction branch begins with an account

A user without a live role may create an account after selecting `Change direction`, `Prepare for the next level`, or quiet monitoring. This branch does not pretend to deliver a live-opportunity decision and does not expose paid Monitoring until that experiment is authorized.

### Step 3: import the minimum useful history

Offer resume upload, profile import when permitted, or manual entry. Show exactly what was extracted and where confidence is low. Do not ask for a perfect archive.

### Step 4: define better

Collect hard constraints and material improvements:

- compensation floor and target,
- benefits that materially matter,
- location, remote, schedule, travel, and work authorization,
- mandate, level, learning, stability, and career-capital goals,
- acceptable tradeoffs and deal breakers.

### Step 5: reveal the route-appropriate first value

For the live-role branch, deliver one complete self-serve Decision Review after the minimum Baseline and evidence steps. For the direction branch, show a small number of plausible Role Lanes. Explain why, show uncertainty, and ask the user to correct the interpretation. The free value must be useful enough to demonstrate the product's decision quality, while clearly separating any human Expert Review.

### Step 6: approve a first Career Strategy Brief

Summarize the desired outcome, current baseline, supported lanes, important gaps, and recommended next action. The user approves or edits the owning inputs.

### Step 7: configure Radar progressively when eligible

Pre-fill from the approved strategy. Let the user confirm criteria, material-upside threshold, freshness, source policy, cadence, and notifications. Make notification permission a separate choice. In the prototype this is a clearly simulated future capability; in market it remains unavailable until its source and subscription gates pass.

## Career Strategy Brief

The Career Strategy Brief is the missing synthesis layer. It answers:

> What strategy currently governs what the product finds, recommends, and helps me pursue?

It includes:

- desired career and earning outcome,
- what a materially better move must improve,
- approved Role Lanes and confidence,
- current market and opportunity thesis,
- baseline economics and constraints,
- strongest proof capital,
- material proof gaps and skill-building priorities,
- Radar rules and monitored universe,
- active strategic bets across Watch, Pursue, and proof building,
- recent outcome learning and what changed,
- one current strategic next action,
- version history.

It is a read-only synthesis, not another settings dashboard. Each item links to the one surface that owns the edit.

## Opportunity Radar semantics

**Radar** is the saved monitor.
**Radar Brief** is one dated result.
**Opportunities** is the collection.
**Review** is one job's decision analysis.

Each Radar Brief shows:

- reviewed, surfaced, suppressed, unresolved, and source-health counts,
- zero to three opportunities worth attention,
- why each surfaced,
- why the strongest alternatives did not,
- when sources were last verified,
- what is queued, incomplete, or unavailable,
- an honest no-action result when nothing clears the standard.

## Opportunity Review hierarchy

The first screenful should answer:

1. Is the job real, current, and canonical?
2. Is the move worth wanting?
3. Am I ready enough to compete, or what could change that?
4. What is the main invalidating risk?
5. What should I do next?

Recommended sections:

- Summary
- Integrity and freshness
- Move Value
- Pursuit Readiness
- Requirements and evidence
- Economics and effort
- Company and process context
- Decision Receipt and history

On mobile, detailed requirement rows become expandable cards. Recommendation, main reason, main risk, one workflow action, and one user-decision group appear before deep evidence.

## Mobile and desktop roles

Mobile is primary for frequency, interruption, and responsiveness. It is not evidence that every dense task should feel identical on a phone.

| Mobile should excel at | Desktop should excel at |
|---|---|
| Public funnel and signup | Bulk experience and evidence review |
| Mode selection and progressive onboarding | Side-by-side source and correction work |
| Alerts and Radar Briefs | Multi-opportunity comparison |
| Opportunity triage and decisions | Resume and long-form material editing |
| Short proof corrections and approvals | Complex application review and research |
| Recruiter response and next actions | Interview and offer workbenches |

Every core task remains possible on mobile through progressive disclosure, autosave, and continue-on-desktop. No core decision may require hover, horizontal data tables, or a desktop-only control.

## Experience principles

1. **Outcome before system.** Tell the user what changed and what to do before exposing internal mechanics.
2. **One primary decision per screen.** Secondary detail supports, not competes with, that job.
3. **Show what is known.** Use clear states for verified, inferred, unknown, missing, conflict, stale, and blocked.
4. **Make correction safe.** Preview what will become stale, preserve history, recalculate dependents, and never silently overwrite approval.
5. **Make restraint visible.** Suppression and no-action results are product value when the standard is clear.
6. **Use plain language first.** `Opportunity Radar` can be explained as `the rules for what we monitor and when we alert you`.
7. **Never manufacture urgency.** Freshness and deadlines may be shown when sourced; pressure language is not a retention tactic.
8. **No fixed time promise.** Effort may be described qualitatively or from observed user-specific data only.

## State and accessibility contract

Every family must specify:

- empty,
- loading and queued,
- partial source,
- capacity or provider unavailable,
- validation error,
- stale,
- conflict,
- no result,
- success,
- offline or cached where relevant.

Accessibility requirements:

- System, Light, and Dark themes with identical meaning and controls.
- New accounts default to System; explicit preference persists.
- Minimum 44 by 44 CSS-pixel touch targets for primary mobile controls.
- Real links and buttons, no nested clickable cards.
- Recommendation and user decision announced separately to assistive technology.
- Text and icons in addition to color for every status.
- Keyboard focus preserved after dialogs, recalculation, corrections, and return navigation.
- 200% zoom without loss of content or function.
- Reduced-motion support and no motion required for comprehension.
- Sticky mobile behavior limited to the current workflow action, not an entire action console.

## Prototype acceptance contract

The next prototype is acceptable only if a new user can, without explanation:

1. understand the promise and target user,
2. choose a current need and paste one synthetic role before creating an account,
3. understand the free Integrity Preview and exactly what it does not decide,
4. simulate account creation to save the result and unlock one free complete decision,
5. import an explicitly synthetic or redacted profile and correct extraction,
6. understand what a better move means,
7. compare and approve plausible Role Lanes,
8. understand the Career Strategy Brief,
9. receive one complete self-serve Decision Review without a card or hidden human work,
10. distinguish Integrity, Move Value, and Pursuit Readiness,
11. record Pursue, Watch, or Pass once,
12. compare Free, Pro Monthly, and Pro 3-Month after first value and complete a clearly simulated product checkout and confirmation without a charge,
13. configure simulated Radar,
14. interpret a material and a no-action simulated Radar Brief,
15. review multiple structurally different jobs,
16. after Pursue, compare self-guided access with Expert Review or Guided help and complete any separate simulated checkout or booking before human work,
17. begin a Pursuit without believing anything was submitted,
18. review a grounded package and exact approval boundary,
19. switch themes with semantic parity,
20. wipe all prototype state through a visible reset control,
21. complete the same core journey on a real iPhone viewport and desktop.

The published prototype must disable real resume uploads, payment, model calls, application actions, and external messaging. It may store synthetic fixture choices locally only when it also provides an obvious reset and wipe. Matt's real profile and live case remain in the controlled operator workflow until secure intake, consent, encryption, retention, deletion, and incident controls exist.

Visual approval also requires matched-viewport comparison between the selected visual reference and implementation, followed by correction and a second comparison. A screenshot alone is not QA.
