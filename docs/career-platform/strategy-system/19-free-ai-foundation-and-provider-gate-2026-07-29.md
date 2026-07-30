# Free AI Foundation and Provider Gate

Date: 2026-07-29
Status: architecture implemented; live provider not approved or connected

## Decision

Way Ahead now has a provider-neutral, fail-closed AI foundation for controlled development and benchmarking. No live model, API key, network call, personal profile data, or production binding is connected.

Kimi is not the default zero-spend choice. Cloudflare's Kimi models currently require Workers Paid, whose published minimum is $5 per month. That can be reconsidered after revenue or if an already-paid account has unused capacity.

The first native benchmark candidate is Cloudflare Workers AI `@cf/openai/gpt-oss-120b`, compared with `gpt-oss-20b`, Gemma 4, and GLM 4.7 Flash. Groq Free with GPT-OSS and zero-data-retention configuration is the fallback benchmark. Gemini Free is limited to synthetic or public text because its unpaid-service terms permit submitted content to be used for service improvement and human review.

## Implemented controls

- modes: `off`, `synthetic`, `public_only`, and `minimized_profile`
- exact consented fact selection
- PII and secret redaction before adapter access
- per-tenant and global hard quotas
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
6. production secret and binding configuration;
7. tenant-safe atomic quota implementation;
8. member consent language;
9. failure and fallback behavior.

No provider may be connected merely because it offers a free tier.

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
- [Cloudflare model limits](https://developers.cloudflare.com/workers-ai/platform/limits/)
- [Cloudflare data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/)
- [Groq models](https://console.groq.com/docs/models)
- [Groq data controls](https://console.groq.com/docs/your-data)
- [Gemini API terms](https://ai.google.dev/gemini-api/terms)
