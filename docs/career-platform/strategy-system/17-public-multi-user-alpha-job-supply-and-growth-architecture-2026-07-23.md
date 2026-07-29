# Public Multi-User Alpha, Job Supply, and Growth Architecture

**Decision date:** 2026-07-23  
**Authority:** Matt Dimock, Board  
**Integrator:** Codex root  
**Status:** Governing architecture and delivery correction; public release remains gated

## Board direction accepted

Way Ahead is intended to become a public, multi-user SaaS. The current Matt-only Sites deployment is a staging checkpoint and rollback surface, not the target identity, tenancy, or distribution architecture.

The next product slice must prove that two people can use separate private workspaces, on mobile and desktop, without sharing career data. It must then prove that the same owned platform can find and rank current jobs across multiple career paths, prepare versioned pursuit assets, and preserve exact approval before any employer-facing action.

The target customer movement remains:

> **Exhausted, overlooked, and unsure where to spend effort -> understood, selective, prepared, and in control.**

The working acquisition line is:

> **Stop wasting time on jobs that are not worth the effort.**

This is internal test copy until founder comprehension review. It does not guarantee interviews, offers, placement, salary, or superiority.

## CEO decision

Use a staged, low-cash architecture:

1. Preserve the current saved Sites version as Matt's rollback baseline while correcting the same owned codebase.
2. Use the current Sites project, public access capability, ChatGPT SSO, and D1 for the fastest zero-incremental-spend public alpha. The root becomes a signed-out website; authenticated product routes create or resume one isolated personal workspace per account.
3. Add provider-neutral account records now, but defer an independent Google OAuth app and Better Auth migration until the Sites alpha proves the journey or Sites becomes a measured constraint. Add LinkedIn only after the brand, LinkedIn Page, app, privacy, recovery-email, and account-linking gates are ready.
4. Give every person a separate tenant-bound workspace. Founder or platform administration may never imply routine access to customer career records.
5. Build a demand-indexed job source graph, not a warehouse of every job.
6. Rank and notify from current source evidence, user-approved paths, and the user's Job Standard.
7. Separate semantic resume and cover-letter content from presentation so one trusted career record can resolve into master, career-path, and job-specific assets.
8. Learn from exact asset versions and observed outcomes before running any application-level A/B test.
9. Build a few useful, evidence-rich job-title pages before considering programmatic scale.
10. Stop broad implementation after every user-visible vertical slice or two business days for a founder checkpoint.

Matt's 2026-07-23 direction authorizes the non-indexed public alpha, self-service ChatGPT SSO, Terry's self-registration without a pre-supplied email, a separate personal workspace for every account, the Sites-native `wayahead.getfractional.co` binding, and the exact DNS records Sites returns for that hostname. It does not authorize a public marketing announcement, search indexing, domain purchase, paid infrastructure, independent Google or LinkedIn OAuth apps, production email, source contract, paid plan, billing, model spend, partner enrollment, legal commitment, application form population or upload, outreach, references, or submission.

## Current access and domain truth

### Confirmed

- The current production foundation remains live at `https://career-evidence-founder-2026.mattdimock.chatgpt.site` and is retained as a versioned rollback surface.
- The Sites project can be public, but application code currently redirects `/` to ChatGPT sign-in and rejects every account except `mattdim805@gmail.com`. This is the reason no signed-out website appears and Terry cannot create a workspace today.
- ChatGPT SSO is the recommended alpha identity path because it supports self-registration at zero incremental cash. It is a reversible bridge, not the final Google and LinkedIn identity decision.
- GoDaddy's authenticated Domain Portfolio showed exactly two active domains on 2026-07-23: `getfractional.co` and `incrediblehabits.com`.
- No domain, DNS, cart, renewal, or account setting was changed during that inspection.
- Matt authorized temporary use of `wayahead.getfractional.co`. Sites must claim the hostname first and return the authoritative CNAME and validation records; a direct CNAME to the current `chatgpt.site` hostname is not valid custom-domain or TLS configuration.
- `incrediblehabits.com` does not communicate the product category and should not be used for Way Ahead.
- Way Ahead remains a provisional name with substantial collision and branded-search risk. No domain purchase should occur before the brand gate.

### Required before Terry enters career data

- the owner-only email check is removed from the generalized account path;
- self-registration creates a separate empty personal workspace with the member role;
- onboarding shows the alpha data-use, retention, correction, export, and deletion contract before import;
- tenant-isolation and direct-object-reference tests pass for every customer route;
- the résumé import route rejects unsupported or unsafe files and never exposes founder PDFs publicly;
- the feedback and stop route is visible; and
- the corrected signed-out, new-user, returning-user, owner, and mobile journeys pass.

Terry selects his own account and explicitly consents inside the product. He is an independent early tester using a tenant-isolated member workspace for bounded tasks and usability and trust feedback. He is not staff, an operator, or efficacy proof, and his access does not authorize broader recruitment. Matt does not need to disclose Terry's email to create an allowlist.

## Multi-user platform contract

### Staged environments

| Stage | Surface | Purpose | Cash posture | Exit evidence |
|---|---|---|---:|---|
| Rollback baseline | Current saved Sites version | Preserve the owner-only checkpoint while the correction is tested locally | $0 incremental | Exact version and D1 backup/readback remain recoverable |
| Public technical alpha | Corrected Sites version on `chatgpt.site`, then `wayahead.getfractional.co` | Prove signed-out marketing, ChatGPT SSO self-registration, personal workspaces, onboarding, multi-path Today, documents, export, and deletion | Target $0 incremental | Matt founder-dogfoods the same member product and Terry independently completes bounded mobile, desktop, consent, and isolation checks; neither result is efficacy proof |
| Private product alpha | Same custom-domain Sites app, shared only by direct link and `noindex` | Prove fresh jobs, multiple paths, pursuits, feedback, and support with no more than five active testers | Target $0 to $5 monthly | Zero tenant leaks; usable first decisions; source and cost gates pass |
| Public beta | Custom domain, reviewed auth, abuse, email, privacy, and source controls | Open customer signup and measure demand | Expected infrastructure floor about $5 monthly plus domain | Independent security and privacy pass; observed economics and support burden |

Use Sites' native custom-domain binding. Sites must return the exact `cname_target` and validation records before GoDaddy changes. Do not use masked forwarding, a direct CNAME to the current `chatgpt.site` hostname, or a CNAME to `workers.dev`. Keep the last accepted Sites version and a D1 export as rollback until the corrected path passes.

### Authentication

Use ChatGPT SSO for the public technical alpha. It already returns the current account identity to Sites and allows a visitor to create or select their own account. The application must treat the identity as a member by default and reserve the owner role only for the configured Board account.

Retain Better Auth as the provisional independent-auth adapter because it supports Cloudflare D1 and first-party Google and LinkedIn providers without adding a second customer database. Its installation and Google or LinkedIn provider connections remain later Board gates.

Authentication objects must be additive:

- `users`: stable Way Ahead person identity;
- `auth_accounts`: provider, provider subject or current Sites identity binding, user, timestamps, and verified-email state;
- `sessions`: opaque server session, expiry, revocation, device metadata band, and last activity;
- `access_grants`: optional hashed alpha-link or future invitation, tenant or product scope, role, expiry, acceptance time, creator, and consent version; open self-registration does not require an email allowlist;
- `tenants`: one private personal workspace per user during alpha;
- `tenant_memberships`: tenant, user, platform role, data role, state, and effective time.

Do not keep a single `auth_subject` as the long-term account model. Do not link ChatGPT, Google, and LinkedIn accounts only because returned emails match. Require a signed-in linking flow and reauthentication. Request only `openid`, `email`, and `profile` from Google. LinkedIn email may be absent and LinkedIn explicitly does not verify identity; require a verified recovery email before notifications.

Start without passwords and magic links. This removes password-reset and email-auth infrastructure from the first slice.

### Tenant and privacy controls

- Every product query must scope by the authenticated user and tenant.
- D1 does not provide a PostgreSQL-style row-level-security safety net; retain compound tenant foreign keys, integrity triggers, and adversarial route tests.
- Add direct-object-reference tests for workspace, profile, source, job, analysis, pursuit, asset, approval, export, and deletion routes.
- Matt's founder role is a platform role, not automatic permission to browse user career records.
- Raw resumes, LinkedIn exports, and audio remain disabled until explicit consent, private storage, deletion, retention, malware, and incident controls pass.
- Queue payloads carry IDs and version hashes, never raw resumes, job descriptions, or contact data.
- Export and deletion must reconcile D1 rows, future private objects, sessions, OAuth accounts, email suppression, and backup-purge timing.
- Identity, consent, correction, deletion, and authorization events remain auditable without placing raw career content in analytics.

## Demand-indexed fresh-job architecture

The product will not purchase or maintain a massive general job database during alpha.

### Governing flow

```text
approved employer source registry
  -> due-source scheduler
  -> one board-list fetch for all users
  -> stable metadata fingerprint
  -> no change: verification receipt only
  -> changed: fetch and normalize only added or changed jobs
  -> canonicalize and deduplicate
  -> source-integrity and hard-constraint gates
  -> coarse career-path match
  -> deep analysis only for the strongest surviving candidates
  -> reverify before alert, digest, decision, or application package
```

One source fetch serves every tenant. The system must not materialize a user-by-job Cartesian product.

### Alpha source boundary

Start with 10 to 25 manually approved employer boards tied to Matt's and Terry's consented active paths. Add a board only when an active user watches the employer, a current path repeatedly points to it, or a user provides a canonical role.

Greenhouse, Lever, and Ashby expose official job-board endpoints, but public technical access is not blanket authority to republish commercial job inventory. Maintain `rights_state`, permitted fields, attribution, polling ceiling, retention, and review date for each source family. Until broader rights are proven, use full descriptions only for private user-requested analysis and link to the canonical employer page.

Do not scrape Google Search, LinkedIn, job aggregators, or private and unlisted postings. Do not call application submission endpoints.

### Polling and freshness

| Tier | Alpha interval | Use |
|---|---:|---|
| Hot | 30 minutes | Active-search sources and approval-ready pursuits |
| Warm | 4 hours | Sources supporting active career paths |
| Cold | 24 hours | Low-demand target employers |
| On demand | At decision or package review | Reverify when the last success is older than 15 minutes |
| Backoff | 1 to 24 hours | Rate limit, access failure, repeated server error, or schema drift |

Do not promise real time. The claim-safe promise is: new jobs are detected within the source's polling window after they become publicly visible.

A missing listing becomes `removal_pending` after one successful board diff and `removed` only after a second successful check or an authoritative closure. A source error produces `verification delayed`, never `no jobs` or `closed`.

### Retention

- Keep current normalized job facts while active and for 60 days after removal.
- Keep changed normalized facts for 90 days.
- Keep a lightweight tombstone for 12 months to prevent resurfacing.
- Keep detailed fetch receipts for 30 days, then aggregate source health.
- Discard raw ATS responses after parsing unless a short private debug retention is explicitly approved.
- Preserve employer publication time, employer update time, first seen, last checked, last successful verification, and removal time as different fields.

## Ranked feed and notifications

### Ranking contract

1. Canonical source, active state, completeness, and freshness.
2. Work authorization, geography, work model, compensation floor, schedule, travel, and other hard constraints.
3. Career-path mandate and level.
4. Move Value against the user's approved baseline.
5. Pursuit Readiness from approved evidence, transferable proof, and explicit gaps.
6. Freshness, opportunity cost, and application effort.
7. Diversity controls so one company, duplicate group, or career path does not dominate the feed.

Show Integrity, Move Value, and Readiness separately. Do not replace them with one opaque match score.

### Notification choices

- `Priority alerts`: rare, newly verified jobs above a user-approved threshold;
- `Digest`: daily, weekly, monthly, or off;
- active search default hypothesis: daily digest;
- quiet watch default hypothesis: weekly;
- passive monitoring default hypothesis: monthly.

Each digest contains at most five jobs and no more than three per path. It shows canonical employer, title, location, sourced compensation, first-seen and last-verified times, why it surfaced, main risk or unknown, and a secure deep link. Do not email resume facts, sensitive gaps, or application answers.

Use one hourly dispatcher keyed by each user's `next_due_at`, timezone, local delivery time, weekly day, consent version, and preference version. Every send is idempotent. Unsubscribe acts immediately. Security, billing, and approval notices remain separate from job marketing or digest email.

No production email is authorized until an approved sender domain, provider, postal-address disclosure when required, consent copy, one-click unsubscribe, sender authentication, bounce suppression, deletion, and cost gate pass.

## Resume and cover-letter system

Separate trusted meaning from presentation:

```text
approved career facts and bullet library
  -> master semantic document
  -> career-path overlay
  -> job-specific overlay
  -> immutable resolved content snapshot
  -> approved template version and user design tokens
  -> renderer version
  -> PDF and DOCX plus extracted-text QA
```

Resolution precedence is `job > career path > master`. An inline edit must ask whether it applies only to this job, to the career path, or to the master record. Preview affected assets before changing an upstream object.

Add independent identities for:

- `document_templates`;
- `render_profiles`;
- semantic asset version;
- template version;
- renderer version;
- resolved-input hash;
- exact pursuit use;
- observed outcome event.

Start with three finished, tested templates rather than an unrestricted document designer. Allow bounded choices for approved font families, size, spacing, margins, section order, and accent color. Preserve one semantic reading order, selectable text, conventional headings, plain-text extraction, overflow checks, and no critical content in images, icons, headers, footers, or layout-only columns.

`ATS-safe` means regression-tested against representative parsing behavior. It is not a universal guarantee.

Cover-letter variables must be typed and source-bound. Any unresolved or unverified company, role, evidence, or role-interest variable blocks approval.

## Asset and pursuit analytics

Bind every actual use to the exact semantic, template, renderer, and file version. Record the pursuit lane, fit, freshness, source, stage, correction, invalidation, parse result, and user-confirmed outcome. Do not put document text, job descriptions, contact data, or recruiter messages in analytics events.

Use observational learning first. Differences in role quality, freshness, channel, user, lane, and template selection confound response rates. Founder or self-selected results cannot support a causal resume-performance claim.

Application-level A/B testing remains later and opt-in. It requires two independently claim-safe, accessible, parse-safe variants; exact approval; predeclared assignment and metric; comparable roles; sufficient sample; and a rule that no high-value opportunity is sacrificed for experimentation. Never experiment on truthfulness, qualifications, compensation answers, protected traits, privacy, or approval.

The first safe experiment should test whether constrained layout controls reduce time to approval without harming extraction or accessibility.

## Product-led job-title acquisition

Do not build hundreds of title pages. Start with three non-indexed working pages:

1. Director of Revenue Operations;
2. Head or Director of Lifecycle Marketing;
3. Director of Growth or GTM Operations.

Each page must answer what the mandate owns, adjacent-title differences, proof of readiness, transferable evidence, hard gaps, current compensation and work-pattern evidence, current canonical jobs, and the next useful personalized action. Include methodology, sources, limitations, reviewer, correction route, and last substantive update.

A page fails if changing only the title leaves most of the page intact, if it republishes employer text, if it lacks current sources, or if it provides no useful value before signup. Keep it `noindex` until it passes founder comprehension, source-rights, accessibility, security, and public-copy gates.

Use `JobPosting` structured data only on one real, current job-detail page with complete visible facts and a working application route. Do not use it on title guides or result lists.

## Economics and capacity

Current official planning inputs, refreshed 2026-07-23:

- Cloudflare Workers Free: 100,000 requests per day and 10 milliseconds CPU per invocation.
- Workers Paid: $5 monthly account minimum, 10 million requests and 30 million CPU milliseconds included monthly.
- Static asset requests are free and unlimited when they do not invoke the Worker.
- D1 Free: 5 million rows read per day, 100,000 written per day, 5 GB account storage, and 500 MB per database.
- Queues Free: 10,000 operations per day; a typical write, read, and delete cycle uses roughly three operations.
- R2 Free: 10 GB-month plus bounded request allowances; do not enable until the upload gate.
- Cloudflare outbound Email Service requires Workers Paid for arbitrary recipients, includes 3,000 messages monthly, and is currently beta.
- Resend is a fallback with a current free tier of 3,000 messages monthly and 100 daily.

The founder and one-tester alpha should remain at $0 incremental cash. Plan for a $5 monthly infrastructure floor before public beta, excluding domain, model, source, support, correction, payment, and legal cost.

Keep source, ranking, and digest infrastructure within an internal planning ceiling of $0.45 per Watch user-month, 25 percent of the current $1.80 Watch all-in variable-cost ceiling. At ten $9 Watch customers, a $5 platform floor alone consumes $0.50 per customer before all other variable cost. This makes ten users too small to claim the current margin target.

At 70 percent of any free-tier hard limit for seven days, slow or queue nonurgent work and return a Board cost packet. Never auto-upgrade or silently reduce verification quality.

## Organization and accountabilities

Use adaptive, evidence-based work in progress rather than a permanent numeric initiative cap. Activate a workstream only when it can change the result and has one measurable outcome, one DRI, one writer per overlapping surface, bounded dependencies, tenant data, and write scope, acceptance evidence, available review capacity, cost and rollback boundaries, and a stop condition. One integrator owns sequencing and synthesis; task count is observed portfolio state, not policy.

| Initiative | DRI | Single writer | Activated specialists | Current deliverable |
|---|---|---|---|---|
| Private-Alpha Readiness | Head of Product | Founding Product Engineer | Identity and Security; Source Operations; Product Design; Lifecycle; Finance; Independent Quality | Multi-user architecture, hosted founder evidence, invited-alpha gate, fresh-job and asset vertical slice |
| Founder dogfooding: Matt's real multi-path search | Head of Career Intelligence | Pursuit and Application Strategist | Labor-Market Intelligence; Recruiter; Resume Architect; Claims QA; Independent Career QA | The same member contract produces multiple current roles across at least two paths, one next-best approval-ready pursuit, and generalized product learning without an efficacy claim |

Temporary mission pods dissolve after their acceptance evidence is captured. Independent Quality reviews and blocks; it does not rewrite maker work.

## Delivery critical path

Child work activates only when it satisfies the adaptive-WIP entry contract and has non-overlapping or explicitly sequenced dependencies, data, authority, write scope, and review capacity. Otherwise it remains `backlog`, queued, paused, or `shipped`; no task count is manufactured as policy.

### Gate A: close the founder foundation

- complete the owner-authenticated hosted workflow and D1 readback;
- capture current hosted mobile and desktop evidence;
- retain the existing Sites deployment as rollback.

### Gate B: multi-user self-service alpha foundation

- generalized ChatGPT SSO account creation with member-by-default authorization;
- additive auth-account, personal-workspace, optional access-grant, onboarding-state, and consent schema;
- Matt migration by stable user ID without promoting other accounts to owner;
- Terry's separate empty workspace created from his own account without an email allowlist;
- IDOR, session, export, deletion, and rollback tests;
- independent security and tenant-isolation verdict.

### Gate C: fresh jobs and multi-path founder dogfooding

- approved source registry and source-rights state;
- Greenhouse first, with other providers only after tests;
- one source poll per employer for all users, change-only normalization, dedupe, and removal confirmation;
- current ranked feed across at least RevOps and lifecycle paths;
- Seso retained as one candidate, not the only journey;
- one current best pursuit and claim-safe package visible inside Way Ahead.

### Gate D: semantic assets and outcome learning

- master-to-path-to-job inheritance;
- three constrained templates;
- PDF and DOCX parsing, overflow, accessibility, and claim QA;
- exact asset-use and outcome events;
- observational dashboard with no causal claim.

### Gate E: digest and acquisition proof

- notification preferences and in-app digest preview;
- email remains disabled until its reserved gate;
- three non-indexed title pages and unique-value review;
- one founder-selected page may later advance to public-copy review.

### Gate F: commercial proof

- pricing remains private;
- no billing until value, privacy, security, email, source, support, refund, and terms gates pass;
- software, affiliate, and any future human-service economics remain separate.

## Founder checkpoint cadence

No broad build proceeds beyond one user-visible vertical slice or two business days without a reviewable checkpoint.

Every checkpoint starts with the working mobile link and shows only:

1. what changed for the user;
2. one workflow to try;
3. no more than three founder decisions;
4. current evidence, cash delta, and material risk;
5. the CEO recommendation: continue, correct the failed slice, or stop.

Checkpoint types are Direction, Working Slice, Evidence, and Reserved Gate. Founder rejection stops broad implementation; only the failed slice is corrected before the next review.

## Exact next Board gates

### Already authorized for this stage

1. **Public alpha correction:** replace the auth-first root with the public website and corrected self-service journey on the existing Sites project.
2. **Self-service identity:** generalize ChatGPT SSO to member accounts and separate personal workspaces; Terry supplies his own identity inside the product.
3. **Temporary address:** add `wayahead.getfractional.co` through Sites and create only the exact CNAME and validation records Sites returns after the corrected deployment passes.

### Still reserved

4. **Independent providers:** Better Auth, a Google OAuth app, LinkedIn Page and app, account linking, and recovery-email operations.
5. **Production communications and intelligence:** email provider and sender domain, permitted source connections beyond current user-requested checks, private R2 uploads, paid model provider, and any paid tier.
6. **Public commercialization:** indexing, broad promotion, prices, billing, refund terms, paid acquisition, partner enrollment, and legal terms.
7. **External job actions:** employer-form population, file upload, submission, outreach, references, and negotiation remain separate exact gates even after a package is approved.

## Primary official references

- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Better Auth Google provider](https://better-auth.com/docs/authentication/google)
- [Better Auth LinkedIn provider](https://better-auth.com/docs/authentication/linkedin)
- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)
- [LinkedIn OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html)
- [Lever Postings API](https://github.com/lever/postings-api)
- [Ashby public Job Postings API](https://developers.ashbyhq.com/docs/public-job-posting-api)
- [Google JobPosting policy](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [FTC CAN-SPAM compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [OpenAI Sites](https://learn.chatgpt.com/docs/sites)
