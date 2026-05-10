---
name: evidence-qa
description: Validate a completed change against the active packet instead of chat memory. Use when a diff, branch, or completion claim needs a PASS or FAIL verdict with criterion-mapped evidence, retry instructions, and escalation after repeated failures. Do not use for broad product critique before a packet exists.
---

# Evidence QA

Use this skill to decide whether the packet actually passed.

## Workflow

1. Read the project profile.
2. Read the active packet.
3. Read the diff summary, test output, and any manual smoke evidence.
4. Check every acceptance criterion and every verification line.
5. Produce one verdict:
   - `PASS`
   - `FAIL`
6. For any failure, include:
   - failed criterion
   - evidence
   - likely file or behavior
   - retry instruction
7. If the same packet has failed twice in a row, recommend escalation before more implementation.
8. If the verdict will matter in a later session, recommend storing a compact `fact` memory tagged `artifact:qa-verdict` through `project-memory`.

## Guardrails

- Do not grade against chat history.
- Do not call something passed without evidence.
- No vague QA. Every finding must map to a packet criterion, test, or explicit missing proof.
- If the packet is stale or contradictory, fail fast and send it back to packet refresh.

## References

Load only what is needed:

- `references/verdict-template.md`

## Output Pattern

Return:

1. Verdict
2. Criteria check table
3. Findings
4. Retry instructions
5. Escalation note, if needed
