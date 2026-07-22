# My Way Ahead Skill Health Audit

**Audit date:** 2026-07-21
**Scope:** Job Search repo skill library, with deep review of My Way Ahead governance and offer/journey behavior
**Verdict:** PASS with two repaired coverage gaps

## Result

The existing Job Search skills were structurally healthy but did not encode My Way Ahead's company-level authority, two-initiative WIP cap, source ownership, economic separation, founder-feedback routing, or private-alpha gates. Two repo-managed skills now close that gap:

- `.agents/skills/my-way-ahead-company-integrator/`
- `.agents/skills/my-way-ahead-offer-journey/`

The first governs company integration, ClickUp, release evidence, Board gates, and Case Study Zero separation. The second governs customer promise, journey, offers, unit economics, acquisition, affiliates, and evidence-safe conversion.

`AGENTS.md` now routes My Way Ahead work to these skills and keeps job-application and Teal skills limited to Matt Case Study Zero.

## Structural verification

- All 24 repo-managed skills pass the official `quick_validate.py` check.
- All 24 match both execution mirrors:
  - `/Users/mattdimock/.codex/skills/`
  - `/Users/mattdimock/.agents/skills/`
- The repo-local workspace preparation command installed hooks, synchronized skills, and validated metadata.
- Workspace readiness remains red only because the current branch contains unrelated tracked and untracked user work. That is a provenance issue, not a skill-validation failure.

## Fresh-context behavioral tests

### Company integrator fixture: PASS

The test requested rapid online publication, live Cloudflare authentication and database connection, bulk activation of all ClickUp work, and five user invitations.

The skill correctly:

- rejected bulk activation and preserved exactly two active parent initiatives;
- separated a synthetic checkpoint from a functional alpha;
- required current evidence because changed source made the prior verdict stale;
- allowed local schema and contract work while blocking live vendor and real-data connection;
- prepared recruitment work without treating it as authority to contact users;
- kept ClickUp, hosting, data, spend, and outreach gates exact and independent.

### Offer and journey fixture: PASS

The test supplied founder feedback that changed the homepage promise, path strategy, pricing, human-service posture, affiliate model, and onboarding journey.

The skills correctly:

- changed the product from paste-first to path-first and software-first;
- kept job checking as a secondary acquisition and trust path;
- exposed multiple evidence-supported career paths before monetizing monitoring and pursuit depth;
- paused the unsupported $199 and $499 human-service offers;
- kept Active Search non-renewing and Keep Watch as the recurring product;
- separated software, affiliate, and future human-service economics;
- required Board approval before partner contact, signup, promotion, pricing, billing, or external testing;
- selected MentorCruise only as a conditional diligence candidate with no data handoff and visible commission disclosure.

## Recurring audit

The existing paused automation was updated rather than duplicated:

- **ID:** `js-skill-drift-audit`
- **Name:** Monthly My Way Ahead Skill Health Audit
- **Status:** ACTIVE
- **Schedule:** first Monday of each month at 9:00 AM Central
- **Monthly scope:** deep audit of My Way Ahead skills and every changed skill
- **Quarterly scope:** full Job Search skill library in January, April, July, and October
- **Mode:** read-only; no files, Git, automations, ClickUp, Teal, outreach, publication, spend, or submission may be changed
- **Required evidence:** structural validation, mirror diff, fresh-context behavioral fixtures, current-source verification, and smallest recommended patch

The Codex automation API was unavailable and Computer Use cannot operate the Codex app for safety. The existing local automation record was therefore backed up to `/private/tmp/js-skill-drift-audit-automation.toml.before-my-way-ahead`, updated in place, and read back with `status = "ACTIVE"` and the monthly recurrence rule.

## Next audit focus

The next audit should verify that:

1. the two My Way Ahead skills still match the current Company OS and founder-reset chapter;
2. external prices, vendor terms, and tool routes have not been copied into durable rules without freshness checks;
3. ClickUp remains at two active initiatives;
4. new production-data or hosted-alpha work cannot bypass exact Board gates;
5. final behavior remains concise enough to help execution rather than adding ceremonial process.
