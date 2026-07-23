# Way Ahead Founder Production

Way Ahead is an owner-only production SaaS for finding work worth pursuing, testing the real fit, and preparing a stronger application without overstating the candidate's record. The product name remains provisional and legally uncleared.

This release uses Matt Dimock's real career record and one canonical employer opportunity. It does not import customer fixtures into the production application. Teal is not an operating dependency; it may be studied only as competitor evidence.

## What works

- Sign in with ChatGPT, enforced at the hosting boundary and again by an owner-email allowlist.
- Durable D1 storage for the career profile, Job Standard, career paths, source-versioned jobs, analyses, pursuits, assets, exact packages, approvals, and audit receipts.
- Direct intake of canonical Greenhouse employer URLs through its public read endpoint.
- A five-surface responsive workspace: Today, Jobs, Pursuit, Direction, and Profile.
- Light, Dark, and System appearance choices.
- Fingerprinted application-review packages whose approval is invalidated when the package changes.

## Deliberate boundaries

This founder release cannot submit an application, upload files to an employer, send outreach, recruit external users, collect payment, or enable billing. It stores approval records only after every package blocker has been cleared; submission remains a separately reserved external action. R2, public sharing, and production model execution are off.

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

OpenAI Sites owns the private HTTPS deployment, Sign in with ChatGPT boundary, and D1 binding. `.openai/hosting.json` stores only the opaque Sites project ID and resource bindings. Production environment values are configured in Sites, never committed.

Deploy only an exact pushed commit and packaged build. Verify owner-only access, environment readback, source commit SHA, authenticated page access, and D1 persistence after deployment. Roll back by redeploying the prior verified Sites version; do not rewrite or delete D1 during a code rollback.

## Data truth

Every candidate fact, employer source version, generated asset, and approval package preserves review state and provenance. Missing dates, conflicting compensation, stale-source risk, and unverified asset hashes remain visible instead of being smoothed over. Founder bootstrap data is loaded through the authenticated product and is never committed to Git.
