# Incident Schema

Use this structure for operational incidents.

```markdown
# Incident: <short title>

## Status
- State: Open | Monitoring | Resolved | Superseded
- Last updated: YYYY-MM-DD
- Owner surface: Windows Codex | MacBook Codex | Shared

## User Impact
What task failed, what Matt experienced, and why it matters.

## Symptoms
- Symptom 1
- Symptom 2

## Scope
- Affected workflows
- Unaffected workflows
- Machines or environments

## Evidence
- Session IDs, files, commands, or artifacts
- No raw secrets or raw logs

## Root-Cause Hypotheses
1. Hypothesis, confidence, evidence
2. Hypothesis, confidence, evidence

## Proven Fixes
- Fix that worked
- Verification that proved it worked

## Failed Or Partial Fixes
- Attempt that did not work
- Why it failed or why status is uncertain

## Stop Rules
- Conditions that should halt the workflow
- When to escalate to Matt or MacBook Codex

## Verification Checklist
- Check 1
- Check 2

## Follow-Up
- Repo docs, scripts, or skills to update
- Open questions
```
