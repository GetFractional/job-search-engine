# 04 Opportunity Intelligence, Trust, AI, and Data

## Decision

The platform may market itself as a rigorous career decision system only after it can reliably distinguish:

1. what the employer actually wrote,
2. what the posting does not establish,
3. what the candidate can prove,
4. what may transfer but is not yet proven,
5. what is unknown or contradictory,
6. whether the opportunity is real, current, and worth acting on,
7. how the move compares with the candidate's baseline and priorities.

It must not claim to predict hiring probability, infer culture fit from brand copy, use protected or proxy traits, or turn model confidence into a displayed probability.

The non-negotiable rule is:

> **Models may suggest and transform. Evidence or an authorized human establishes truth.**

## Scientific and professional governance

The technical council should add several explicit expert roles:

| Expert | Decision authority |
|---|---|
| Industrial-organizational psychologist | Defines valid person-job, demands-abilities, needs-supplies, work-environment, and satisfaction constructs; rejects vague culture-fit proxies |
| Career-development scientist | Defines exploration, transition, advancement, self-management, and longitudinal first-user outcomes |
| Labor economist | Defines compensation, job quality, occupational mobility, opportunity cost, and career-capital comparison |
| Occupational taxonomy specialist | Governs O*NET, ESCO, custom concepts, mappings, drift, attribution, and licensing |
| NLP and information-extraction lead | Owns span-level extraction schema, modality, negation, quantities, relationships, abstention, and benchmark |
| Decision scientist | Owns multi-criteria decision analysis, user tradeoff elicitation, scenario ranges, and sensitivity analysis |
| ML evaluation and calibration lead | Owns golden datasets, slice evaluation, selective risk, provider promotion, drift, and rollback |
| Privacy and security engineer | Owns data classification, tenancy, access control, encryption, deletion, audit, and provider routing |
| Employment and privacy counsel | Can block unsafe use cases or claims after legal review; the strategy itself is not legal advice |
| Recruiter and candidate adjudicators | Label real postings, resolve ambiguity, and expose operational edge cases |
| Human-factors researcher | Tests comprehension of explanations, uncertainty, correction, and approval |
| AI FinOps lead | Owns cost, latency, capacity, retry, and human-review analysis; never truth policy |

## Canonical intelligence flow

```text
Source capture
  -> source authority and completeness
  -> immutable job snapshot
  -> atomic employer statements
  -> normalized requirements, compensation, benefits, logistics, and application questions
  -> canonical employer and requisition reconciliation
  -> candidate facts and proof comparison
  -> hard gates
  -> independent decision constructs
  -> scenario and sensitivity analysis
  -> system recommendation
  -> user decision
  -> grounded preparation
  -> exact external approval
  -> observed outcome and learning
```

Candidate data may not change the interpretation of employer language. A candidate's lack of a skill cannot make `preferred` become `required`. Employer language cannot become proof that the candidate has the skill.

## Source and provenance contract

Every durable object needs a common version envelope:

- logical ID and immutable version ID,
- workspace and user ownership,
- created, observed, effective, and last-verified times,
- source record and exact span where applicable,
- content hash,
- superseded version,
- dependency and invalidation edges,
- authority, review, truth, sensitivity, and retention states,
- parser, schema, taxonomy, prompt, model, and policy versions.

Approved or externally used versions are immutable. A correction creates a new version and invalidates every dependent recommendation, asset, or approval that relied on the old one.

### Source authority for job activity

1. Exact employer ATS or employer careers page.
2. Current employer-hosted application page.
3. Authorized recruiter or employer communication.
4. Reputable job board that links to the employer source.
5. Aggregator or legacy wrapper.

A lower-ranked visible page cannot overrule a higher-ranked closed, missing, or filled signal without explicit adjudication.

### Capture states

- full,
- partial,
- derived,
- translated,
- OCR affected,
- unreadable,
- unknown.

A partial or derived source fails closed for critical fields. `First seen` cannot masquerade as official `published`. A repost date cannot replace the original date unless the source proves it. A visible legacy form does not prove an active opening.

## Employer-meaning ontology

Every meaningful source paragraph or list item becomes a span-addressable statement. Store:

- exact text and offsets,
- section and order,
- statement class,
- actor and polarity,
- modality cue,
- qualifiers,
- quantities, duration, recency, and scope,
- hands-on versus leadership responsibility,
- logical groups and AND/OR operators,
- alternatives, negation, and dependencies,
- normalized concepts with mapping confidence,
- extraction support, materiality, confidence, and review state.

### Statement classes

- qualification,
- responsibility,
- success outcome,
- compensation,
- benefit,
- logistics,
- work environment,
- company claim,
- application instruction,
- anti-fit signal,
- legal or authorization condition,
- noise.

### Requirement priority

- mandatory,
- preferred,
- bonus,
- contextual,
- anti-fit,
- ambiguous.

The exact source language remains visible. Research shows that optional or superfluous qualifications can discourage applications, which makes preference-to-requirement inversion materially harmful. See the [field experiment in Journal of Economic Behavior and Organization](https://www.sciencedirect.com/science/article/abs/pii/S0167268124002312).

### Skills and tools

Store raw mention separately from the normalized concept. Preserve whether it is explicit or inferred, its priority, hands-on scope, proficiency, duration, recency, logical group, and source span.

Taxonomy similarity does not prove:

- that the employer explicitly required the related concept,
- that related tools are interchangeable,
- that the candidate possesses the skill,
- that a newer taxonomy version should silently change an old decision.

O*NET should anchor U.S. occupations, tasks, abilities, education, work context, and software. ESCO can provide multilingual linked occupation and skill concepts. Use a governed custom layer for emerging concepts. Prefer the downloadable O*NET database when its license and operational fit are clearer than paid-product web-service constraints. Sources: [O*NET database](https://www.onetcenter.org/database.html), [O*NET web-service license](https://services.onetcenter.org/help/license_data), [ESCO reuse](https://esco.ec.europa.eu/en/use-esco).

## Compensation ontology

Store each component independently:

- base,
- variable compensation,
- target bonus,
- guaranteed bonus,
- commission and OTE,
- sign-on,
- equity,
- other compensation.

For each component preserve:

- lower and upper bound,
- currency and cadence,
- disclosure semantics such as exact range, starting at, up to, lower only, upper only, or not disclosed,
- guaranteed, target, eligible, offered, or unknown state,
- geography, level, and employment-type applicability,
- exact source span.

Equity separately records award type, quantity, strike price when relevant, vesting, liquidity, valuation date, and explicit unknowns.

Rules:

1. Null bounds remain null.
2. `Starts at $175,000` creates a lower bound and no upper bound.
3. `Up to $180,000` creates an upper bound and no lower bound.
4. Equity eligibility is not an award, value, cash, or guarantee.
5. Health equity, racial equity, and equity and inclusion are not compensation.
6. Target bonus is not guaranteed.
7. A geographic range is not applied until the candidate's applicable zone is resolved.
8. Hourly pay is not annualized without explicit hours and assumption disclosure.

Stock options are conditional rights, not cash compensation. See the [SEC glossary](https://www.sec.gov/resources-small-businesses/glossary) and [IRS stock-option guidance](https://www.irs.gov/taxtopics/tc427).

## Benefits ontology

Benefits require exact text, source, category, applicability, qualifiers, and state. Distinguish:

- mentioned,
- offered,
- eligible,
- accessible,
- enrolled,
- employer funded,
- explicitly unavailable,
- not mentioned or unknown.

Store employee versus dependent coverage, contribution or match formula, vesting, waiting period, leave duration and qualifier, geography, and employment-type restrictions.

Omission means unknown, never absent. A 401(k) mention does not prove an employer match. BLS distinguishes access, participation, and take-up, while IRS guidance distinguishes employee deferral, employer contribution, match, and vesting. Sources: [BLS benefit terms](https://www.bls.gov/ebs/publications/national-compensation-survey-glossary-of-employee-benefit-terms.htm), [IRS 401(k)](https://www.irs.gov/retirement-plans/plan-sponsor/401k-plan-overview), [IRS vesting](https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-vesting).

## Candidate truth and proof

The candidate side contains:

- source records and imports,
- fact suggestions,
- approved profile facts,
- proof artifacts and stories,
- metrics with ownership and safe phrasing,
- preferences and hard constraints,
- Career Baseline,
- Role Lanes,
- user corrections and exclusions.

Each externally usable fact requires:

- source,
- ownership such as owned, led, contributed, or supported,
- confidence,
- approved safe phrasing,
- approval actor and time,
- current version.

Automated matching may propose `plausible`. Only approved evidence establishes `proven`.

### Evidence states

- Proven
- Plausible or transferable
- Missing
- Risky or contradictory
- Disqualifying
- Excluded
- Cannot determine

Used, missing, risky, and excluded collections are disjoint and visible. An excluded claim must never leak into generated material.

## Decision method

### Integrity Gates come first

Block or degrade the recommendation when any controlling issue is unresolved:

- canonical employer or exact requisition,
- source completeness or material corruption,
- inactive, closed, stale, or duplicate state,
- legal or work-authorization incompatibility,
- user-approved compensation or logistics hard floor,
- a decision-critical mandatory requirement,
- candidate evidence conflict,
- unapproved fact required for an external asset,
- unresolved application question with a blocking effect.

A blocked gate never receives an attractive midpoint score.

### Separate the three user-facing judgments

1. **Integrity:** Is this exact opportunity real, current, canonical, complete enough, and safe to act on?
2. **Move Value:** Is the job worth wanting compared with the Career Baseline?
3. **Pursuit Readiness:** Can the user credibly compete now, and what effort or gap remains?

These judgments may use several independent constructs:

- source quality and completeness,
- employer-meaning confidence,
- demands-abilities evidence fit,
- needs and preferences,
- compensation, benefits, and job quality,
- career capital and optionality,
- logistics and work environment,
- pursuit feasibility and effort.

Rename `hiring plausibility` to `pursuit feasibility`. The system may assess evidence-backed gaps and process burden. It must not predict employer behavior from age, disability, race, gender, names, schools as prestige proxies, inferred personality, or historical selection patterns.

Person-job, person-organization, group, and supervisor fit are related but distinct. Avoid a vague culture-fit score. See the [Kristof-Brown meta-analysis](https://doi.org/10.1111/J.1744-6570.2005.00672.X). Job quality should extend beyond salary to earnings quality, labor-market security, and working environment. See the [OECD job-quality framework](https://www.oecd.org/en/topics/job-quality.html).

### Multi-criteria decision analysis

Do not launch one universal weighted average. Default priorities are hypotheses. The user approves hard constraints and tradeoffs through simple preference exercises, then the system runs sensitivity analysis.

Show:

- strongest positive reason,
- main invalidating or unresolved risk,
- evidence used, missing, risky, and excluded,
- best and worst plausible scenarios,
- which unknown could change the answer,
- user priorities and hard constraints,
- source, taxonomy, policy, and model versions,
- any override and reason.

Scenario intervals are bounded decision ranges, not probabilities. Government MCDA guidance warns that importance alone is not a sound basis for weighting. Sources: [UK MCDA guidance](https://www.gov.uk/government/publications/green-book-supplementary-guidance-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases), [introductory MCDA guide](https://analysisfunction.civilservice.gov.uk/policy-store/an-introductory-guide-to-mcda/).

### Coverage measures

Keep source and candidate coverage separate:

```text
source coverage =
  material weight of interpreted eligible statements
  ---------------------------------------------------
  material weight of expected statements in the complete source

candidate evidence coverage =
  material weight of assessed candidate-relevant requirements
  -------------------------------------------------------------
  material weight of all candidate-relevant atomic requirements
```

A complete extraction with weak candidate evidence is not the same as an incomplete extraction.

### Recommendation vocabulary

- Pursue
- Investigate
- Watch
- Pass
- Ignore, limited to duplicate or already-resolved noise

Numeric thresholds remain provisional until benchmarked and tested with users. The recommendation is advice, not a hiring forecast or a user decision.

## Golden data and evaluation

Seven adversarial jobs are useful interaction fixtures. They are not enough to validate generalized fit quality.

### Dataset stages

The counts below are planning floors for corpus construction, not universal proof. Release eligibility depends on predeclared critical-field error budgets, zero-tolerance invariant checks, confidence bounds, and sufficient worst-slice evidence. Increase the corpus whenever a material slice is too small to support the decision.

| Stage | Minimum purpose |
|---|---|
| Alpha | Begin with at least 200 complete, diverse JDs, double annotated, to stabilize ontology, instructions, and failure codes; expand until critical fields and slices are decision-usable |
| Beta | Begin with at least 1,000 complete, stratified, version-frozen JDs as a practical provider-promotion floor; do not promote on headline count alone |
| Holdout | At least 20%, split by employer and source family to prevent near-duplicate leakage |
| Temporal and out-of-distribution | At least 10%, refreshed with later postings, new terminology, new formats, and taxonomy changes |
| Candidate comparison | Separately consented, de-identified profiles with contradictions, transferability, and missing information |

Stratify by occupation, function, seniority, industry, company stage, ATS, employer site, PDF, OCR, paste, aggregator, language, source completeness, work model, geography, compensation structure, benefits, and adversarial formatting.

### Annotation protocol

- Two independent annotators blinded to candidate and model output.
- Third-person adjudication for critical disagreement.
- Explicit uncertain and cannot-determine labels.
- Field-level agreement, exact and relaxed span agreement, and adjudication logs.
- Frozen handbook, training examples, dataset datasheet, and change history.

### Required metrics

- capture and section coverage,
- exact and overlap span precision, recall, and F1,
- atomic statement macro-F1,
- priority and statement-class macro-F1,
- modality inversion count,
- AND/OR exact match,
- compensation semantic exact match,
- benefit state macro-F1,
- taxonomy link metrics,
- hallucination and unsupported-field rates,
- hard-gate false negative and false positive rates,
- correction and invalidation integrity,
- human-review change rate,
- selective-risk and abstention curves,
- latency, retries, capacity, inference cost, and reviewer minutes,
- worst-slice performance.

Each release needs a model card and dataset datasheet. NIST recommends context-specific, continuous evaluation rather than treating one benchmark as universal accuracy. Sources: [NIST TEVV](https://www.nist.gov/ai-test-evaluation-validation-and-verification-tevv), [NIST Measure playbook](https://airc.nist.gov/airmf-resources/playbook/measure/), [Model Cards](https://doi.org/10.1145/3287560.3287596), [Datasheets for Datasets](https://arxiv.org/abs/1803.09010).

### Zero-tolerance release-set failures

Report sample size and confidence bounds for every zero observed. Zero observed is not zero possible.

- unsupported external candidate claim,
- invented salary, equity value, benefit, date, or location,
- prompt-injection obedience,
- external action using stale dependencies,
- protected self-identification data entering ranking or recommendation,
- correction that fails to invalidate dependent assets or approval.

## Human-in-the-loop contract

| Actor | Owns |
|---|---|
| Candidate | Profile facts, preferences, weights, corrections, decisions, and external approval |
| Domain adjudicator | Ambiguous employer meaning and material source conflicts |
| Policy owner | Gates, prohibited uses, thresholds, and policy versions |
| Counsel | Regulated-use and jurisdiction review |
| Model | Suggestions, extraction candidates, normalization candidates, drafts, and explanations within policy |

Overrides need reason, actor, timestamp, affected version, and invalidation propagation. Human reviewers need enough context, competence, authority, and time to stop the system. The product should remain candidate-controlled unless any future employer-side product receives separate legal, bias, and high-risk-system design. Relevant current sources include the [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) and [New York City AEDT guidance](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page).

## Model-routing architecture

```text
Deterministic capture and source checks
  -> task-qualified low-cost schema extraction
  -> deterministic validators
  -> second qualified model for critical conflicts
  -> premium adjudicator only when decision-changing
  -> human review when policy requires
  -> deterministic gates, calculations, and Decision Receipt
```

Admission order:

1. Data and privacy class.
2. Task benchmark eligibility.
3. Quality and abstention threshold.
4. Budget.
5. Capacity and latency.

If no safe qualified route is available, queue the work, preserve known values, show the degraded state, or request human input. Never route sensitive data to an unsafe provider because it is free or available.

### Cost strategy

The lowest sustainable path is:

1. extract each canonical public job once,
2. cache it by source, content, schema, and policy version,
3. reuse deterministic facts across candidates,
4. perform most candidate comparison through typed rules and retrieval,
5. use models for ambiguity, explanation, and high-value generation only,
6. batch nonurgent Radar work where quality and source freshness allow it.

Illustrative raw inference cost for a roughly 6,000-input and 800-output-token call can vary from well below one cent on a qualified small route to several cents on a stronger route. These are configuration signals, not provider recommendations or complete COGS. They exclude source acquisition, storage, retrieval, observability, support, payment processing, retries, human review, and incident handling. Verify current pricing at [OpenAI](https://developers.openai.com/api/docs/pricing), [Gemini](https://ai.google.dev/gemini-api/docs/pricing), [Groq](https://groq.com/pricing), and [Cloudflare](https://developers.cloudflare.com/workers-ai/platform/pricing/) before any budget decision.

Free capacity is not a product entitlement. A provider's free rate limits, terms, quality, or availability can change. The product needs per-user budgets, spend limits, queue states, provider health, and a paid fallback that remains within the current plan's economics.

## Privacy and retention

### Recommended data classes

| Class | Starting policy, subject to counsel and source terms |
|---|---|
| Public job source | Retain snapshot only as permitted; preserve derived facts, hashes, citations, and verification history for audit |
| Candidate raw upload | Process transiently and delete after successful extraction unless the user explicitly enables an encrypted vault |
| Approved profile and proof | Retain while account is active; support export, correction, deletion, and documented backup purge |
| Model payload | Avoid raw product-side logging; verify provider retention for every route |
| Voluntary self-identification | Isolate from ranking, recommendation, analytics, and prompts; use only for user-directed application completion |
| Pseudonymized research outcome | Retain only with explicit research consent and documented evaluation purpose |
| Security and billing | Retain the minimum required under a separate schedule |

When a raw candidate upload is deleted, the system may retain only user-approved structured facts, permitted derived assertions, source metadata and hash, extraction and policy versions, and the approval or deletion record. Raw text and unapproved extracted spans do not survive unless the user explicitly enabled an encrypted vault. The consequence must be visible: deleted raw material cannot be reparsed or independently re-audited later, so any dependent fact that lacks sufficient surviving evidence returns to review when challenged.

Current provider terms materially affect routing:

- OpenAI states API data is not used for model training by default, while abuse-monitoring logs may retain content for up to 30 days unless eligible controls apply.
- Gemini unpaid services may use submitted content and responses to improve products and may involve human review. The terms explicitly warn not to submit sensitive, confidential, or personal information to unpaid services. Paid-service treatment differs.
- Groq states inference data is not retained by default, with limited reliability and abuse exceptions, and provides Zero Data Retention controls.
- Cloudflare states Workers AI customer content is not used to train models or improve services without explicit consent, although storage services and model licenses require separate review.

Sources: [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data), [Gemini API terms](https://ai.google.dev/gemini-api/terms), [Groq data controls](https://console.groq.com/docs/your-data), [Cloudflare data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/).

**Initial routing rule:** unpaid providers may process public job text only after task and terms qualification. Confidential resumes, compensation history, contact details, or proof artifacts require a safe paid route, approved local inference, or explicit human handling.

## Capacity and graceful degradation

A premium model capacity alert must never corrupt truth or strand the user. The system should:

- preserve the exact source and completed deterministic work,
- queue nonurgent analysis,
- retry through a task-qualified alternate provider,
- expose provider or queue state in plain language,
- allow user correction or manual continuation,
- avoid manufacturing a lower-confidence score,
- separate `not processed` from `not found`,
- notify only when the work is ready or a user decision is needed.

## Mandatory red-team suite

The release suite must include at least these failure classes:

1. Preferred experience converted to mandatory.
2. OR tools converted to AND.
3. Leadership treated as hands-on administration.
4. `Starts at` given an invented ceiling.
5. `Up to` given an invented floor.
6. Equity eligibility valued as compensation.
7. Health equity classified as stock.
8. Target bonus treated as guaranteed.
9. Salary applied to the wrong geography or currency.
10. Hourly pay annualized without assumptions.
11. 401(k) mention converted to employer match.
12. Omitted insurance treated as unavailable.
13. Dependent coverage confused with employee coverage.
14. Live application gate omitted from the analysis.
15. Aggregator wrapper mistaken for employer.
16. Repost or first-seen date shown as official publication date.
17. Candidate data changes employer modality.
18. Taxonomy similarity becomes an explicit requirement or proven skill.
19. Tenure becomes exact tool proficiency.
20. Protected or proxy trait influences fit.
21. Employer values copy treated as observed work environment.
22. Job-text prompt injection changes policy.
23. Partial or OCR-damaged source scored as complete.
24. Cross-posts become separate opportunities.
25. Correction fails to invalidate receipts or materials.
26. Free-quota exhaustion routes private data to an unsafe provider.
27. Schema-valid hallucination passes validation.
28. Model self-confidence is shown as a probability.
29. Provider, policy, or taxonomy drift changes a decision silently.
30. Historical outcomes reproduce employer selection bias.
31. Remote ignores country, time zone, or office requirements.
32. Employee versus contractor status is missed.
33. Work authorization, sponsorship, or clearance question is missed.
34. Default weights override user priorities.
35. Missing data produces a midpoint score and Pursue.
36. Licensed source content is retained indefinitely.
37. Names or emails enter an unpaid-model route.
38. An edited approved fact preserves dependent approvals.

## Technical build order

1. Lock the ontology, authority states, data classes, and critical invariants.
2. Replace hiring-plausibility language with pursuit feasibility.
3. Separate source coverage, candidate evidence coverage, Integrity, Move Value, and Pursuit Readiness.
4. Build deterministic validators and correction invalidation before provider selection.
5. Create the 200-JD alpha corpus and annotation handbook.
6. Benchmark low-cost routes by field and slice.
7. Add visible corrections, uncertainty, and approval UX.
8. Run Matt's real search as the longitudinal first-user study.
9. Expand toward 1,000 frozen examples before public fit-quality claims.
10. Add outcome-driven learning only after enough consented data exists to address selection bias and confounding.
