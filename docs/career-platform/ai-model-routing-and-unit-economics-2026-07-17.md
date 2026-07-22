# AI Model Routing And Unit Economics

Date checked: 2026-07-17
Status: current planning evidence; prices, limits, model availability, and terms must be rechecked before integration

> **Economics supersession, 2026-07-21:** Provider-routing and evaluation principles in this artifact remain useful. The earlier $24 Radar, $6 delivery ceiling, and illustrative allocations are historical fixtures, not current price or margin authority. The [Unit Economics Ledger](company-os/my-way-ahead-unit-economics-ledger-2026-07-21.md) now governs offer versions, all-in cost caps, support, revenue recognition, and contribution.

## Leader Decision

Do not select one permanent model and do not make `free user = cheap inaccurate AI` and `paid user = accurate AI` the product architecture.

Build a provider-neutral, evaluation-gated router:

1. deterministic code captures sources, normalizes exact fields, computes dates and arithmetic, enforces gates, and validates outputs,
2. the cheapest model that passes the current gold suite performs candidate-independent structured JD extraction,
3. disagreement, ambiguity, user corrections, high-value opportunities, and decision-critical unknowns escalate selectively,
4. scoring remains deterministic and inspectable,
5. no qualified model or exhausted capacity yields `Analysis delayed`, `Unknown`, or `Investigate`, never a fabricated conclusion,
6. every user receives the same truth, provenance, and safety floor.

Hosted inference is the best initial operating choice. Local open-weight models are a later privacy, offline, portability, or sustained-volume option, not automatically free production capacity.

## Four Inference Cost Categories That Must Stay Separate

### 1. Deterministic work

Use code, not a model, for:

- URL normalization, content hashes, source authority, and duplicate keys,
- exact currency, cadence, percentage, and date calculations,
- schema and span validation,
- canonical source and freshness policies,
- hard gates, scoring arithmetic, and policy thresholds,
- cache decisions and invalidation,
- approval and external-action state transitions.

### 2. Open weights and local compute

Weights may be free to download while inference still costs hardware, memory, electricity, engineering, monitoring, latency, and upgrades.

| Candidate | Current official facts | Initial role |
| --- | --- | --- |
| OpenAI `gpt-oss-20b` | Apache 2.0; OpenAI states it can run in about 16 GB of memory. The 120B model needs about 80 GB. The weights are not served by OpenAI's API. | First local/privacy candidate to benchmark. |
| Google Gemma family | Open-weight models with multiple sizes and local deployment paths; model-specific terms still apply. | Secondary local family for quality and hardware comparison. |
| Other open models | Availability and license terms change quickly. | Admit only through the same gold-suite and license review. |

Primary source: [OpenAI gpt-oss announcement](https://openai.com/index/introducing-gpt-oss/).

### 3. Free hosted allowance

A free allowance is a changing quota, not an uptime commitment.

| Provider | Verified allowance | Product implication |
| --- | --- | --- |
| Groq Free | For `openai/gpt-oss-20b`, current public limits show 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute, and 200,000 tokens/day. | Useful for evaluation and a small beta. At the illustrative workload below, daily tokens allow roughly 29 cheap-path jobs before escalation and retry overhead, and fewer in practice. Queue on exhaustion. |
| Cloudflare Workers AI | 10,000 Neurons/day free; current 8B fast pricing is extremely low above the allowance. | Strong public-JD extraction candidate if it passes the gold suite. |
| Google Gemini API Free | Eligible models show free input/output, but exact rate limits vary by model, project, and account. | Potential public-JD evaluation route only. Unpaid-service terms make it unsuitable for identifiable candidate data. |
| Hugging Face Inference Providers | Free users currently receive `$0.10/month`, subject to change. | Smoke-test credit, not a production tier. |
| OpenAI API | Current GPT API model pages show no general free hosted tier for models such as GPT-5.4 nano. | Budget explicitly; do not assume a ChatGPT subscription includes API usage. |

Primary sources:

- [Groq rate limits](https://console.groq.com/docs/rate-limits)
- [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Hugging Face Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing)
- [OpenAI GPT-5.4 nano model page](https://developers.openai.com/api/docs/models/gpt-5.4-nano)

### 4. Paid inference

Standard text prices per million tokens checked 2026-07-17:

| Candidate | Input | Output | Why evaluate |
| --- | ---: | ---: | --- |
| Cloudflare Llama 3.1 8B fast | `$0.045` | `$0.384` | Cheapest candidate; quality must earn use. |
| Groq `gpt-oss-20b` | `$0.075` | `$0.30` | Low price, prompt caching, strict structured-output path, and local-model portability. |
| OpenAI GPT-5.4 nano | `$0.20` | `$1.25` | Officially positioned for high-volume classification, extraction, and ranking. |
| Gemini 3.1 Flash-Lite | `$0.25` | `$1.50` | Google's current cost-efficient model for high-volume and simple data processing. |
| OpenAI GPT-5.4 mini | `$0.75` | `$4.50` | Cost-conscious adjudicator candidate. |
| OpenAI GPT-5.6 Terra | `$2.50` | `$15.00` | Sparse, consequential adjudication candidate; not a routine parser. |

These prices are not quality claims. Every candidate must pass the same fixtures and semantic validators before use.

Primary sources:

- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [OpenAI GPT-5.4 nano](https://developers.openai.com/api/docs/models/gpt-5.4-nano)
- [Groq pricing](https://groq.com/pricing)
- [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Structured Output Is Necessary, Not Sufficient

Schema adherence does not prove semantic correctness.

- OpenAI states that Structured Outputs enforce schema adherence, unlike basic JSON mode.
- Groq supports JSON Schema structured outputs on supported models.
- Cloudflare supports JSON-schema response formats on supported text models.
- Local runners such as Ollama can constrain outputs to JSON Schema.

The application must still reject or escalate when:

- a cited span is absent,
- a required field has no source span,
- deterministic parsing and model output conflict,
- critical alternatives or modality are lost,
- a pay bound, benefit, date, or equity value is invented,
- a material field is unknown,
- two qualified cheap routes disagree on a gate,
- the source is incomplete, stale, noncanonical, or conflicting.

Primary sources:

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Groq Structured Outputs](https://console.groq.com/docs/structured-outputs)
- [Cloudflare JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Ollama Structured Outputs](https://docs.ollama.com/capabilities/structured-outputs)

## Evaluation-Gated Routing

### Stage A: shared public-job interpretation

1. Capture and hash the canonical public source.
2. Run deterministic field candidates and segmentation.
3. Send only the source text needed for candidate-independent interpretation.
4. Require schema output plus exact span IDs.
5. Validate spans, completeness, numbers, and policy invariants.
6. Cache the accepted interpretation by content hash, parser version, prompt version, schema version, and model snapshot.

This result can be reused across users because it contains employer truth, not candidate data.

### Stage B: user-specific comparison

1. Retrieve only the approved Profile Facts required for the material requirements.
2. Match and explain provisionally.
3. Apply deterministic proof rules: automated matching may produce `plausible`, `missing`, or `risky`; never `proven`.
4. Apply deterministic gates and weighted dimensions.
5. Escalate only the unresolved decision-changing items.

### Escalation triggers

- unresolved hard gate,
- low extraction coverage or confidence,
- source conflict or partial capture,
- cross-model disagreement,
- score interval crossing a recommendation threshold,
- high-compensation or top-ranked opportunity,
- user correction,
- externally visible claim or asset,
- new provider, model snapshot, prompt, parser, or scoring policy.

### Capacity behavior

When a provider is at capacity or over quota:

1. keep the job and workflow state,
2. retry with bounded backoff,
3. use another provider only when that route is quality-qualified for the exact task, privacy-compatible with the data class, and budget-eligible for the workload and plan,
4. otherwise queue the analysis and show what remains safe,
5. never silently switch to an unqualified model or convert uncertainty into a decision.

Quality qualification alone is not permission to use a route. Admission order is:

`data classification and privacy eligibility -> task-quality qualification -> plan and workload budget -> live capacity -> execution`

Free provider allowance is a shared platform resource, not a customer entitlement and not a production uptime promise. Maintain separate counters for:

- provider quota,
- the product's free-acquisition budget,
- each free user's review allowance and concurrency,
- each paid user's routine model budget,
- higher-tier or credit-funded burst capacity,
- internal evaluation traffic.

Free traffic may spill into a paid provider only while an explicit product-level free-acquisition budget has headroom. When that budget or the shared free allowance is exhausted, queue work rather than silently create unbounded paid COGS. Paid traffic may spill to another qualified paid route only within the user's plan budget and product circuit breakers. Work beyond the routine paid budget requires a higher tier, credits, an explicitly approved beta subsidy, or a queue. Retries and escalations count against the applicable budget.

Apply fair scheduling and per-user concurrency limits so one heavy user cannot consume the shared free pool or displace already-admitted work. Preserve idempotency across retries so the same content hash is not charged repeatedly because a provider failed.

### Required capacity-delayed product states

The product must implement and test distinct states for:

- `Analysis queued`: accepted but not yet started,
- `Analysis delayed - capacity`: every safe qualified route is temporarily unavailable,
- `Analysis delayed - budget`: the applicable workload or plan budget is exhausted,
- `Analysis blocked - validation`: a result failed schema, span, semantic, or policy validation.

Each state must:

1. preserve the job, source, content hash, user decision, and workflow history,
2. show the last verified source facts and deterministic gates that remain safe,
3. identify what analysis remains unresolved and suppress any dependent score or recommendation,
4. state that no weaker or unqualified model was substituted,
5. offer an honest retry, notification, or plan-choice path without promising a completion time the system cannot support,
6. prevent external-action readiness when the missing analysis could change a claim, gate, package, or destination,
7. resume idempotently and announce whether the completed analysis changed the recommendation.

If a last verified Brief is available, show it with its verification time and a stale or cached label. Never relabel it as current merely because new work is queued.

## Universal Truth And Safety Floor

Never paywall:

- canonical source, availability, duplicate, and freshness checks,
- visible provenance and exact source spans,
- required/preferred/bonus/anti-fit distinctions,
- `unknown`, missing, risky, conflict, and excluded states,
- schema and semantic validation,
- claim-safety and external-action gates,
- correction history and invalidation,
- separation of recommendation, user decision, workflow action, and external approval,
- fail-closed behavior when quality or capacity is insufficient.

### Free product may limit

- review count,
- monitored sources,
- refresh cadence,
- notifications,
- history depth,
- number of Radars,
- advanced career economics and optionality analysis,
- Pursuit preparation and exports.

### Paid product may add

- broader source coverage and more frequent integrity refresh,
- more job reviews and multiple Radars,
- stronger-model adjudication on more ambiguous opportunities,
- longitudinal calibration and outcome learning,
- deeper career-economics, benefits, and optionality analysis,
- Pursuit preparation, truthful assets, and priority queues,
- convenience, continuity, and team or coach workflows.

Do not market paid as accurate and free as less accurate. Free uncertainty should produce fewer conclusions, not weaker standards.

## Privacy Routing

Career history, compensation targets, job-search state, and application materials are sensitive even when they are not regulated health or financial records.

| Route | Current official posture | Planning rule |
| --- | --- | --- |
| OpenAI API | API data is not used to train by default; abuse-monitoring logs may be retained up to 30 days; eligible customers may obtain additional controls. | Candidate data requires minimization, documented retention posture, and a vendor review. |
| Groq | Inference data is not retained by default except limited reliability or abuse cases; Zero Data Retention can be enabled. | Promising beta route after settings and contractual posture are verified. |
| Cloudflare Workers AI | Cloudflare states it does not use customer content to train models or improve services without explicit consent. | Promising public-JD and possibly minimized candidate-data route after model-license review. |
| Gemini unpaid quota | Google states unpaid-service inputs and outputs may be used to improve products and may be reviewed by humans. | Do not send personal, confidential, or identifiable candidate data. Limit evaluation to public, candidate-independent job text or do not use it. |
| Local model | No third-party inference call, but device, logging, update, and access controls remain. | Later privacy/offline route after measured quality and total cost justify it. |

Primary sources:

- [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)
- [Groq data controls](https://console.groq.com/docs/your-data)
- [Cloudflare Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/)
- [Gemini API terms](https://ai.google.dev/gemini-api/terms)

### Privacy UI gate before candidate-data transmission

Before the first transmission of candidate-specific data to any hosted inference provider, the product must show a just-in-time notice and make the same controls available under Privacy and Data settings. The notice must explain:

- which data categories will leave the product,
- the purpose of the processing,
- the provider or provider class and current retention or training posture, with the current subprocessor list available from the same surface,
- what is stored by the product and for how long,
- which processing is required for the requested feature and which is optional,
- how to export, correct, or delete the user's data,
- what happens if the user declines the hosted route.

Record the notice version, user choice, time, data class, and permitted route class. Enforce the choice server-side; UI copy is not a privacy control by itself. A decline may reduce breadth, convenience, or speed, or may queue the work, but it must not lower the truth and safety standard.

Never send identifiable candidate data, career history, compensation targets, application answers, or generated materials through Gemini unpaid quota. Public job text may use that route only when it is candidate-independent and the current terms and project settings have been reverified. Do not expose provider selection as a misleading quality picker; describe user-relevant privacy behavior and let the qualified router choose within those constraints.

## Product Cost Architecture

Inference price is only one cost center. Maintain both a platform cash-cost view and an attributed per-user contribution-margin view. Do not divide a shared cost across customers until the allocation method is named and versioned.

| Cost center | Unit of work | Shared or user-specific | Initial control |
| --- | --- | --- | --- |
| Source discovery and acquisition | Search result, canonical page, rendered capture, or licensed-feed record | Shared when the same source can serve many users | Measure cost per usable canonical job and reject duplicate or unusable acquisition before model work. |
| Deterministic capture and normalization | Source snapshot and content hash | Shared by canonical source version | Cache by hash; cap render, storage, and retry work; invalidate only affected dependents. |
| Candidate-independent JD extraction | Accepted interpretation of one unique content hash | Shared | Run the cheapest qualified route, validate exact spans, and cache the accepted version. |
| User-specific comparison | One job interpretation compared with one approved Profile version | User-specific | Retrieve only material approved facts; meter calls, tokens, retries, and explanation work per user. |
| Shared adjudication | One ambiguous source, extraction, or canonical-job conflict resolved for all users | Shared | Escalate once when the resolution is reusable; version and cache it. |
| User-specific adjudication | One unresolved proof, gate, score interval, or externally visible claim | User-specific | Escalate only when decision-changing and charge it to the applicable plan or beta budget. |
| Notifications | Email, push, SMS, or another delivered alert | User-specific | Meter by channel and suppress duplicate or nonmaterial alerts. |
| Storage, security, and variable infrastructure | Stored versions, queue work, logs, egress, and usage-scaled compute | Mixed | Track usage-scaled costs separately from baseline fixed infrastructure. |
| Support and human review | Support contact, correction review, concierge minute, or manual adjudication | User-specific or account-specific | Track time and labor explicitly; do not hide concierge work inside software margin. |
| Payment operations | Successful charge, refund, dispute, or tax-handling event | Paid account-specific | Include processing fees, refunds, disputes, and taxes where applicable in contribution margin. |
| Baseline product infrastructure | Hosting, database, observability, security, and operational tooling | Shared fixed or step-fixed | Allocate separately for runway and break-even analysis; do not call it zero because it is not per token. |

The operating equation is:

`monthly contribution = recognized revenue - source acquisition - shared extraction allocation - user comparison - adjudication - notifications - usage-scaled infrastructure - payment operations - support and human review`

Track baseline fixed infrastructure below contribution margin as a separate runway and break-even layer. The current `$6` Radar variable-cost ceiling means service-delivery COGS: allocated source acquisition, model inference, notifications, and usage-scaled infrastructure. Payment operations and human support remain separately visible because their scaling behavior differs; they still reduce contribution and cannot be omitted from pricing decisions.

### Required cost ledger

For every admitted work unit, log:

- workload and user or shared-object ID,
- plan and budget class,
- source, snapshot, and content-hash IDs,
- cache hit, miss, and invalidation reason,
- provider, model snapshot, task type, tokens, latency, retry, and escalation,
- privacy route class and privacy-notice or user-choice version when candidate data is involved,
- estimated and later reconciled model cost,
- source-acquisition, notification, and usage-scaled infrastructure cost when available,
- support or human-review time when involved,
- completion, delayed, validation-failed, and cancellation state.

This ledger must support two reports without double counting: actual platform cash spend and attributed per-plan or per-user contribution margin.

## Illustrative Inference Economics

Assumptions, not observed production usage:

- one unique JD call uses 6,000 input and 800 output tokens,
- no cache discount,
- standard synchronous prices,
- public-JD extraction is shared across users when the content hash matches,
- a routed example uses Groq `gpt-oss-20b` for the cheap path,
- the free diagnostic is costed at the same published paid-route price instead of assuming zero cost; free allowance reduces actual spend only while available,
- the limited-free illustration escalates 10% of accepted unique JDs and the paid illustrations escalate 15% to GPT-5.6 Terra,
- escalation is additive: the cheap extraction attempt is still incurred before adjudication,
- 5% retry overhead,
- user-specific comparison calls and user-specific adjudication are not yet priced because their measured prompts, outputs, and rates do not exist,
- source acquisition, notifications, storage, search, hosting, payment operations, support, and human work are excluded.

### Approximate cost per call

| Model | Cost |
| --- | ---: |
| Cloudflare Llama 3.1 8B fast | `$0.00058` |
| Groq `gpt-oss-20b` | `$0.00069` |
| OpenAI GPT-5.4 nano | `$0.00220` |
| Gemini 3.1 Flash-Lite | `$0.00270` |
| OpenAI GPT-5.4 mini | `$0.00810` |
| OpenAI GPT-5.6 Terra | `$0.02700` |

### Uncached per-active-user routed scenarios

This first table attributes every uncached call to one active user's workload. It is a conservative per-user calculation, not the platform's global unique-JD count; shared-cache behavior appears in the cohort fixtures below.

| Scenario | Uncached JDs attributed to one active user | Escalation | Model inference only |
| --- | ---: | ---: | ---: |
| Limited free diagnostic user | 30 | 10% | about `$0.11` |
| Lean paid Radar user | 300 | 15% | about `$1.49` |
| Heavy paid Radar user | 1,000 | 15% | about `$4.98` |

The routed calculation is `(cheap extraction + escalation rate x adjudicator) x 1.05 retry overhead`. At an illustrative `$24/month`, the 300-unique-JD case leaves roughly `$22.51` before user-specific comparison and every other cost center. That is not a margin claim and must not be used as one. It shows only that this narrow shared inference stage may be inexpensive.

### Synthetic P50 and P95 beta planning fixtures

These are calculation fixtures, not observed percentiles, a demand forecast, or a launch commitment. `P50` means a median-like planning case chosen to exercise the ledger. `P95` means a cost-stress case chosen to expose failure before launch. Replace every assumption with measured beta distributions.

Assumptions used only for this fixture:

- P50: 500 active free users reviewing 30 jobs each and 100 active paid users reviewing 300 jobs each,
- P95: 2,000 active free users reviewing 30 jobs each and 250 active paid users reviewing 1,000 jobs each,
- P50 shared content-hash cache hit is 60%; P95 cost-stress cache hit is 20%,
- cache misses are allocated proportionally between free and paid reviews for illustration only,
- free-route misses use the 10% escalation assumption; paid-route misses use 15%,
- the same 6,000-input, 800-output, synchronous-price, and 5% retry assumptions above apply,
- source acquisition and every user-specific or nonmodel cost remain excluded.

| Fixture | Active users | Reviews | Shared cache hit | New shared extraction calls | Shared extraction and adjudication model cost | Illustrative paid-user allocation of that shared stage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| P50 planning placeholder | 500 free + 100 paid | 45,000 | 60% | 18,000 | about `$81` | about `$0.60` per paid active user |
| P95 cost-stress placeholder | 2,000 free + 250 paid | 310,000 | 20% | 248,000 | about `$1,166` | about `$3.98` per paid active user |

The allocation column is not an invoice or an accounting policy. Actual shared costs must be allocated through the versioned cost ledger without double counting. It exists to show the budget consequence: in the P95 fixture, the shared model stage alone exceeds the current `$2` routine paid-user model ceiling before any user-specific comparison occurs.

Therefore:

- the `$2` routine paid-user model ceiling includes allocated shared extraction, user-specific comparison, shared and user-specific adjudication, retries, and validation-related reruns,
- the 1,000-unique-JD no-cache case at about `$4.98` and the P95 cached allocation at about `$3.98` are not routine standard-plan usage,
- that usage requires a higher tier, credits, a documented beta subsidy, or queued work; it must not be absorbed silently by an unlimited standard plan,
- free-provider savings are cost variance, not product entitlement; budget either a qualified paid fallback within the explicit free-acquisition budget or a queue,
- the existing `$24` price remains a hypothesis until source, comparison, support, payment, and infrastructure costs plus conversion and retention are measured.

Nonurgent Radar analysis should be batchable. OpenAI's current Batch API offers 50% lower model cost with completion within 24 hours, which fits recurring monitoring but not a user waiting on a pasted job. Primary source: [OpenAI Batch API](https://developers.openai.com/api/docs/guides/batch).

## Cost Guardrails

- Cache candidate-independent interpretation by canonical source content hash.
- Keep user-specific comparison separate so public extraction is reusable.
- Target cheap extraction below `$0.005` per unique JD.
- Target escalated adjudication below `$0.05` per escalated JD.
- Keep all routine paid-user model inference below `$2` per active user-month, including allocated shared work, per-user comparison, adjudication, retries, and validation reruns.
- Keep source acquisition, model inference, notifications, and usage-scaled infrastructure together below the current `$6` Radar service-delivery variable-cost ceiling; track payment operations and human support separately in contribution margin.
- Treat the 1,000-unique-JD heavy case as higher-tier, credit-funded, explicitly subsidized, or over-budget rather than routine standard-plan usage.
- Give free traffic an explicit global acquisition budget and per-user admission limits. Do not let exhaustion trigger uncontrolled paid-provider spillover.
- Cap source size, input tokens, output tokens, retries, and escalation count.
- Configure provider and product monthly ceilings plus 50%, 75%, and 90% alerts.
- Add circuit breakers for retry storms and capacity errors.
- Require every fallback to be quality-qualified, privacy-compatible, and budget-eligible for the exact workload.
- Log provider, model snapshot, tokens, estimated cost, latency, cache result, validator result, retry, escalation reason, plan budget, and privacy route without raw career text in analytics.
- Compare local total cost only after measured volume, privacy demand, and latency justify hardware and operations.
- Recheck prices, limits, terms, and model availability before any production key is activated.

## Variables That Require Real Beta Data

Do not call the unit economics validated until the beta measures:

- active-user jobs reviewed per month at P25, P50, P75, P90, P95, and maximum,
- content-hash cache hit by source, role family, geography, and time since capture,
- canonical-page change and invalidation rates,
- source-discovery and acquisition cost per usable, unique, current job,
- Stage A and Stage B input/output tokens, latency, retries, and validation failures,
- shared-source versus user-specific escalation rates and whether escalations are additive,
- correction rate, recommendation-change rate, and human adjudication minutes,
- provider capacity, quota exhaustion, error, and recovery behavior by workload class,
- notification volume, channel cost, deliverability, and duplicate suppression,
- storage, queue, rendering, egress, observability, and security costs that scale with usage,
- support minutes, concierge minutes, refunds, disputes, and payment-processing costs per paid account,
- privacy-notice acceptance, hosted-route decline, deletion, and export rates,
- free-to-paid conversion, paid retention, plan mix, credit use, and heavy-user concentration,
- observed contribution margin and service quality at both routine and stress percentiles.

Replace the synthetic P50/P95 fixtures and current ceilings only through a versioned decision that names the observed data, margin target, user-quality guardrail, and rollback trigger.

## Initial Evaluation Matrix

Evaluate, do not yet purchase or integrate:

1. local `gpt-oss-20b`,
2. Groq `gpt-oss-20b`,
3. Cloudflare Llama 3.1 8B fast,
4. OpenAI GPT-5.4 nano,
5. Gemini 3.1 Flash-Lite on public JD text only,
6. OpenAI GPT-5.4 mini and GPT-5.6 Terra as alternative adjudicators.

Promote no provider until it passes the same locked extraction suite, privacy review, capacity behavior, and measured cost gate.
