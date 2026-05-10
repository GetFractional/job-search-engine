# Route Table

## Primary Routes

| Situation | Primary lane | Add |
| --- | --- | --- |
| Ambiguous or cross-functional request | router | `expert-orchestrator` |
| Clear task but no packet | packetizer | `product-delivery-os` |
| Packet exists and implementation should start | builder | `product-delivery-os` if tracker or branch state matters |
| Diff exists and needs verification | QA | none by default |
| Funnel, pricing, or CTA work | router | `alen-sultanic` |
| Claims, research truth, or trust-sensitive output | router | future `truth-and-evidence` |

## Required Inputs By Lane

- Router:
  - repo path
  - user goal
  - project profile
- Packetizer:
  - task URL or task truth
  - project profile
  - current repo reality
- Builder:
  - active packet
  - project profile
  - touched code and tests
- QA:
  - active packet
  - diff summary
  - test output
