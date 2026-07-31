# Free AI Foundation and Provider Gate

Date: 2026-07-29
Status: architecture implemented; live provider not approved or connected

## Decision

Way Ahead has a provider-neutral, fail-closed AI foundation for local development and controlled benchmarking. No live model, provider account, API key, binding, network request, personal profile data, or production route is selected, approved, or connected.

Cloudflare currently marks `@cf/moonshotai/kimi-k2.6` as unavailable on Workers Free and requiring Workers Paid, whose published minimum is $5 per month. Kimi K2.6 is excluded from the zero-incremental-spend benchmark and alpha paths.

Cloudflare-hosted `@cf/openai/gpt-oss-120b`, `@cf/openai/gpt-oss-20b`, `@cf/google/gemma-4-26b-a4b-it`, and `@cf/zai-org/glm-4.7-flash` are unqualified synthetic benchmark candidates. GPT-OSS 120B is only a proposed first comparative quality baseline; no benchmark result, production task qualification, provider route, or live model has been selected or approved. Groq and Gemini remain research-only alternatives, not approved fallbacks, activation routes, or member-data processors.

The current Sites hosting contract has no proven native Workers AI binding. The deployed app contains no AI binding or provider credential. Any future native binding, isolated benchmark REST route, or production REST route requires separate compatibility proof and exact Board approval. Cloudflare's no-training-without-consent statement is not proof of zero retention; retention remains an unresolved approval item.

## Implemented controls

- modes: `off`, `synthetic`, `public_only`, and `minimized_profile`
- exact consented fact selection
- PII and secret redaction before adapter access
- in-memory per-tenant and global development quotas; production tenant-safe atomic quotas remain gated
- strict typed output schemas
- rejection of tool or execution payloads
- deterministic fake and exact-match replay adapters
- provider, model, policy, prompt, output, fact, usage, and latency receipts
- `suggested_not_verified` provenance
- no tools, network callbacks, external actions, or silent fallback

## Required gate before any live provider

Matt must approve the exact:

1. provider and model;
2. free or paid cost ceiling;
3. benchmark result and task scope;
4. data class allowed to leave Way Ahead;
5. retention and training policy;
6. benchmark or production invocation route, Sites compatibility proof, and exact secret or binding configuration;
7. tenant-safe atomic quota implementation;
8. member consent language;
9. failure and fallback behavior.

No external benchmark or provider connection may be activated merely because a provider offers a free tier.

## Verification

- AI safety tests: 8 of 8 passed.
- Complete application suite: 98 of 98 passed.
- Typecheck, lint, and production build passed.
- Production dependency audit found zero vulnerabilities.

## Official evidence

- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Kimi K2.6](https://developers.cloudflare.com/workers-ai/models/kimi-k2.6/)
- [Cloudflare GPT-OSS 120B](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/)
- [Cloudflare GPT-OSS 20B](https://developers.cloudflare.com/workers-ai/models/gpt-oss-20b/)
- [Cloudflare Gemma 4](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/)
- [Cloudflare GLM 4.7 Flash](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/)
- [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)
- [Workers AI REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)
- [Cloudflare model limits](https://developers.cloudflare.com/workers-ai/platform/limits/)
- [Cloudflare data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/)
- [Groq models](https://console.groq.com/docs/models)
- [Groq data controls](https://console.groq.com/docs/your-data)
- [Gemini API terms](https://ai.google.dev/gemini-api/terms)
