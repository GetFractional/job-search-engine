# Going Independent-Style Claim Audit

Audit date: 2026-07-30
Audit posture: adversarial second pass, separate from drafting
Overall verdict: **BLOCK**
Resume-content verdict: **PASS WITH CONDITIONS**
Package-approval readiness: **No**

## Decision

The local resume content is claim-safe enough to preserve as a working
two-page draft. The application package is not ready for Matt's approval or
external use.

Two required narratives remain factually incomplete:

1. end-to-end lifecycle/CRM ownership, including exact channels, team, and
   business metrics owned; and
2. Braze duration and hands-on depth.

The AI-in-lifecycle narrative is transparent and source-safe as a transferable
answer, but it still requires Matt to confirm that no direct lifecycle example
exists and to supply defensible human-review and privacy controls. The resume
also lacks rendered two-page proof, source-version binding, a final PDF, and a
binary hash. Prior-application state is unknown.

No external action is justified by this packet.

## Audit scope

Files reviewed:

| File | SHA-256 at audit |
|---|---|
| `01-current-source-and-fit-receipt.md` | `00315fb5d106d854ec921ba3341355cc553d8e5495bac0381512b0463757a365` |
| `02-resume-strategy-and-copy-ready-draft.md` | `c7985e11df6525e3ed1dbc3e2bc61c0bc1ad1d584e3553c86da10ed9884e55b8` |
| `03-application-answers-and-exact-action-approval-packet.md` | `e9813b75d0e9cf8c5175ab70ecfb78031aa08606979304377f5aff9602b2ccec` |

Controlling evidence:

- `source-files/01_matt_dimock_canonical_profile.md`
- `source-files/02_metrics_ledger.md`
- `source-files/03_role_lane_glossary.md`
- `source-files/04_story_bank.md`
- `docs/claim-safety-rules.md`
- current Going role page
- current Ashby posting object
- current Ashby application and optional-survey schema

Historical Going packet files were treated as hypotheses only.

## Source and form audit

| Check | Result | Evidence |
|---|---|---|
| Canonical employer resolved | Pass | Going role page, careers index, and Ashby requisition agree |
| Exact requisition resolved | Pass | `0095e055-2b79-4dab-878b-4b723b873b8f` |
| Current listed state | Pass | Ashby public feed returned `isListed: true` |
| Publication date | Pass | 2026-07-10T19:03:55.757Z |
| Posting age | Pass | 20 days on 2026-07-30 |
| Compensation | Pass | Ashby tier states $175K to $190K plus equity; employer page states starting at $175K plus equity |
| Deadline | Pass | No current deadline; Ashby value is `null` |
| Exact question set | Pass | Read-only application-form schema captured and normalized |
| Form checksum | Pass | `997a1598267c0b8a42e817b924724912e592f89f26d260184bcb927cee4fa8ba` |
| Cover-letter requirement | Pass | No cover-letter field exists in current schema |
| Prior application | **Block** | Not checked or proven |

## Resume claim audit

### Numeric claims

| Resume claim | Ledger status | Ownership wording | Verdict |
|---|---|---|---|
| 18+ years of professional marketing experience | Derived conservatively from 2007 start year | Does not assign 18+ years to lifecycle alone | Pass |
| Bob's revenue from $20.5M to $45M in 24 months | High | `helped grow` | Pass |
| Bob's email list up 225% to 250K+ | High | Direct/shared wording | Pass |
| Bob's email-driven sessions up 66% | Medium | Result stated without sole attribution | Pass |
| Bob's orders up 32% and AOV up 7% | Medium | Shared commercial context | Pass |
| Bob's nine-person team and 15+ vendors | Canonical Profile | Leadership scope, not outcome causality | Pass |
| Prosper 600K+ activations/customers | Medium | Systems supported the base | Pass |
| Prosper onboarding burden down about 50% | Medium | Training and enablement context retained | Pass |
| HireHawk 60+ days to under 21 days | High | Direct systems ownership | Pass |
| Affordable about $290K to $2M in 18 months | High | `helped grow` | Pass |
| Affordable 30K+ leads | High | Direct leadership, no sole-company causality | Pass |
| Affordable one to 16 states | Medium | `helped expand` | Pass |
| Breakthrough webinar conversion 30%+ | Medium | Direct/shared context | Pass |
| Breakthrough membership about 200 to 500+ | Medium | `helped grow` | Pass |
| ContractorEvolution 2K+ community | High | `helped build` | Pass |
| OC Ramps H2 versus H1 revenue lift of 39% | High | Campaign re-engagement and shared context retained | Pass |

### Capability and platform claims

| Claim | Source state | Verdict |
|---|---|---|
| Lifecycle and retention systems | Canonical Prosper and Bob's scope | Pass |
| Email and SMS strategy | Bob's and OC Ramps sources | Pass |
| Campaign planning and governance | Bob's, Breakthrough, and OC Ramps | Pass |
| Team leadership and coaching | Bob's and Breakthrough | Pass |
| Braze listed as a platform | Canonical Prosper stack | Pass narrowly |
| Microsoft Dynamics 365 implementation | Canonical Bob's scope | Pass |
| Keap/Infusionsoft-to-Zoho migration | Canonical Breakthrough scope | Pass |
| AI-assisted recruiting workflow design | Canonical Profile, Metrics Ledger, Story Bank | Pass |

The resume does not claim:

- Braze duration or proficiency;
- Canvas or Liquid;
- push or in-app ownership;
- cohort analysis;
- LTV modeling;
- churn modeling;
- SQL query language;
- predictive segmentation;
- send-time optimization;
- AI lifecycle personalization; or
- a direct mobile-subscription lifecycle result.

### Attribution and context

- Bob's metrics remain under Bob's Watches.
- Prosper scale remains in a sales-led context and is not described as a
  lifecycle-caused revenue result.
- The 50% Prosper improvement is correctly described as agent onboarding
  burden, not customer onboarding.
- Breakthrough member and webinar outcomes use shared-leadership language.
- HireHawk's AI work remains recruiting workflow evidence.
- OC Ramps' 39% comparison remains tied to campaign re-engagement.

Verdict: **Pass.**

## Narrative-answer audit

| Answer | Factual accuracy | Completeness | External-use verdict |
|---|---|---|---|
| End-to-end lifecycle/CRM | Source-backed partial draft with explicit bracketed gaps | Missing exact program, channels, direct reports, metrics owned, and outcome | **Block** |
| Braze or comparable CRM | Source-backed platform and comparable-system draft with explicit bracketed gaps | Missing personal duration, access, features, and one journey | **Block** |
| AI in lifecycle | Accurately distinguishes recruiting workflow evidence from lifecycle evidence | Needs Matt to confirm no direct example and provide review/privacy controls | **Pass with condition** |
| Reason for considering a move | Matches Canonical Profile's part-time consulting and full-time search context | Needs Matt to approve the role-specific motivation and transition facts | **Pass with condition** |

The bracketed prompts are visible blockers. None can be silently removed or
converted into polished claims.

## ATS and recruiter-comprehension audit

Pass:

- exact target title is present;
- primary lane is legible immediately;
- Bob's, Prosper, and Breakthrough proof appears early;
- platform and tool categories are readable;
- chronology is preserved;
- unsupported keywords are not used;
- no local path, internal source label, demo copy, reference contact, or tool
  provenance appears in the copy-ready resume;
- no em dash appears in the generated resume or answer copy. The em dash in
  the packet is retained only where the employer's exact question is quoted;
- no cover letter was invented.

Conditions:

- the Markdown content may exceed two rendered pages depending on typography,
  margins, and spacing;
- the additional-leadership section needs visual review to ensure dates remain
  easy to parse;
- no PDF or ATS text extraction exists yet;
- no final filename or binary hash exists.

## Material findings

### Required before final package approval

1. Obtain Matt's four factual responses.
2. Reconcile the three role-specific narratives.
3. Re-run this claim audit against the revised answers and resume.
4. Check prior-application and duplicate state.
5. Refresh the canonical role and form; require the same requisition and a
   current checksum.
6. Bind the final resume to the source version and selected evidence.
7. Render the resume, prove two pages, inspect every page, and extract text.
8. Create and verify
   `Going - Director, Lifecycle Marketing - Matt Dimock - Resume.pdf`.
9. Record final content and binary hashes.
10. Present every answer and the exact PDF bytes to Matt before any staging
    approval.

### Optional improvements

- If Matt confirms stronger direct lifecycle evidence, replace the
  multi-company end-to-end answer with one complete program.
- If Matt has no direct push or in-app experience, address that gap plainly in
  interview preparation instead of trying to obscure it in the resume.
- If the direct Braze example remains weak, decide whether the one-to-four-hour
  assessment is worth the pursuit cost before investing heavily.

## Approval integrity

Current allowed state:

- local facts may be supplied;
- local drafts may be revised and audited.

Current prohibited state:

- no package approval can truthfully be recorded;
- no employer form may be opened for staging, populated, or uploaded to;
- no application may be submitted;
- no outreach may be sent;
- no references may be shared;
- no optional diversity data may be populated without Matt's exact choice.

## Final verdict

**BLOCK**

The role is worth pursuing, and the local resume content is a strong,
claim-safe starting point. The package is not approval-ready until Matt
answers the four minimum factual questions and the exact final resume and
answers pass refreshed source, claim, rendering, filename, hash, and
prior-application checks.
