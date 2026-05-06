---
name: qa-fact-check
description: Audit job-search assets for factual accuracy, claim safety, tone, ATS clarity, role fit, overstatement, metric support, and source alignment before use. Trigger when reviewing resumes, cover letters, outreach, application answers, interview materials, or profile updates.
---

# QA And Fact-Check Skill

## Purpose
Audit every asset before use for accuracy, claim safety, tone, ATS clarity, role fit, and overstatement.

## Required Sources
1. `/Users/mattdimock/Downloads/01_matt_dimock_canonical_profile.md`
2. `/Users/mattdimock/Downloads/02_metrics_ledger.md`
3. `/Users/mattdimock/Downloads/03_role_lane_glossary.md`
4. `/Users/mattdimock/Downloads/04_story_bank.md`
5. `docs/claim-safety-rules.md`

## Inputs
- Asset draft
- Role
- JD
- Research brief
- Fit scorecard

## Process
1. Check every number against the Metrics Ledger.
2. Check every story against the Story Bank or Canonical Profile.
3. Check role lane alignment.
4. Remove overclaiming and unsupported ownership.
5. Check recruiter comprehension and ATS clarity.
6. Check tone: human, calm, specific, commercially intelligent.
7. Flag anything requiring user confirmation.

## Output
- QA verdict
- Required fixes
- Optional improvements
- Claim safety table
- Approval readiness

## Safety
Do not mark an asset ready if any required claim is unsupported.
