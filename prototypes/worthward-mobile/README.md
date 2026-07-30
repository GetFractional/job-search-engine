# Way Ahead Career OS Alpha

Way Ahead is a production-deployed multi-user alpha candidate for finding jobs
worth pursuing, testing the evidence-backed fit, and preparing stronger
truthful application materials. It is designed to give each authenticated
member a separate personal workspace. Local two-member isolation passes; real
hosted owner and second-account isolation remain unverified. The product name
remains provisional and legally uncleared.

Matt founder-dogfoods the same member product and data contract. His account is
not a separate customer-facing mode or efficacy proof. This release does not
import customer fixtures into the production application. Teal is not an
operating dependency; it may be studied only as competitor evidence.

## What works

- Public Home, How It Works, and Career Tools pages before sign-in.
- Self-service ChatGPT sign-in with member-by-default provisioning and a
  tenant-scoped D1 workspace.
- Resumable six-step onboarding, structured multi-role Career Evidence, Job
  Standard, and multiple Job Paths.
- Direct current-source intake for supported Greenhouse, Lever, and Ashby
  employer postings.
- Stable responsive routes for Home, Jobs, Pursuits, Plan, Career Profile,
  Resume Studio, Cover Letter Studio, and Privacy.
- Light and Dark appearance choices, with Light as the default.
- Editable, versioned, exportable profile-grounded résumé and cover-letter
  drafts.
- Account export, deletion, and explicit empty-account restart.

## Deliberate boundaries

This alpha cannot approve an application package, populate or upload to an
employer form, submit an application, send outreach, use references, collect
payment, or enable billing. Production AI generation, recurring monitoring,
production email, broad recruitment, and public indexing are off. The current
member flow stops at editable drafts; employer-facing action remains a
separately reserved external decision.

## Local development

Create `.dev.vars` locally. Never commit it.

```text
WAY_AHEAD_ENVIRONMENT=development
WAY_AHEAD_OWNER_EMAIL=mattdim805@gmail.com
WAY_AHEAD_DEV_EMAIL=mattdim805@gmail.com
```

Then run:

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 3015
```

Localhost is intentionally device-local. Use the authenticated hosted URL in [QA_ACCESS.md](QA_ACCESS.md) for phone and cross-device review.

## Verification

```bash
npm audit --omit=dev
npm test
npm run lint
```

`npm test` runs type checking, the production build, migration replay, schema and ownership contracts, API/production-bundle guards, and truth/state regression tests. A full dependency audit can still report build-tool advisories; the production runtime dependency audit is the release gate.

## Deployment and rollback

OpenAI Sites owns the public HTTPS application, Sign in with ChatGPT boundary,
and D1 binding. `.openai/hosting.json` stores only the opaque Sites project ID
and resource bindings. Production environment values are configured in Sites,
never committed.

Deploy only an exact pushed commit and packaged build. Verify public routes,
member-by-default access, owner-reserved boundaries, tenant isolation,
environment readback, source provenance, authenticated page access, and D1
persistence after deployment. Roll back by redeploying the prior verified Sites
version; do not rewrite or delete D1 during a code rollback.

## Data truth

Every candidate fact, employer source version, generated asset, and future
approval package preserves review state and provenance. Missing dates,
conflicting compensation, stale-source risk, and unverified asset hashes remain
visible instead of being smoothed over. Founder bootstrap data is loaded through
the authenticated product and is never committed to Git.
