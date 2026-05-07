---
name: source-optimization
description: Audit and improve Matt's trusted job-search source files for role targeting, claim safety, token efficiency, LinkedIn alignment, resume quality, and evidence clarity. Trigger only when asked to optimize source materials or evaluate source-of-truth improvements.
---

# Source Optimization Skill

## Project Defaults
- Start with `job-search-scenarios` when the user asks to find jobs, score jobs, apply to a job, work in Teal, use the Teal Chrome extension, or operate Chrome for job-search work.
- Use Google Chrome for Teal, LinkedIn, job boards, company career sites, and application forms when login state, Cloudflare, challenge prompts, or extension behavior matter.
- Keep Teal as the operating system when the scenario requires pipeline, notes, Excitement, assets, contacts, or follow-ups.
- Preserve claim safety with the Canonical Profile and Metrics Ledger before external-facing metrics, bullets, cover letters, application answers, or outreach.
- Stop before application submission, outreach, references, sensitive voluntary self-ID, or external compensation negotiation unless the user explicitly approves.

## Purpose
Analyze and improve the trusted job-search source files so they better support high-fit role targeting, fast application prep, claim safety, and token efficiency.

## Required Sources
1. `docs/source-map.md`
2. `docs/source-optimization-workflow.md`
3. `docs/claim-safety-rules.md`
4. `.agents/skills/expert-team-orchestration/SKILL.md`
5. `.agents/skills/token-budgeting/SKILL.md`

## Inputs
- Source file or source set to audit
- Goal, such as token reduction, LinkedIn alignment, resume quality, role-lane clarity, or claim safety
- Permission status for editing source files

## Process
1. Read only the source files needed for the audit.
2. Classify issues as conflict, stale content, duplication, claim risk, weak positioning, missing evidence, or token bloat.
3. Explicitly flag context-fragile bullets, where a client metric could be copied into an unrelated consulting or umbrella role and become misleading.
4. Use expert lenses to evaluate recruiter clarity, ATS relevance, hiring-manager credibility, and conversion.
5. Propose edits with risk levels.
6. Ask for approval before changing source-of-truth files.
7. Verify Metrics Ledger alignment after any approved edits.

## Output
- Audit summary
- Recommended source edits
- Token-efficiency opportunities
- Claim-safety risks
- Approval-ready implementation plan

## Safety
Do not mutate source-of-truth files without explicit approval. Do not remove context that protects against overclaiming.
Do not preserve wording that is technically true but likely to create false inference when transplanted into another resume context.
