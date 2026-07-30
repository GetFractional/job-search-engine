# Way Ahead Current-Build QA Receipt

Run date: 2026-07-30
Build: final local source on `codex/way-ahead-p1-career-os`
Maker evidence: clean production suite plus current in-app browser evidence
Release scope: bounded, non-indexed, authenticated alpha
Production deployment: not yet performed in this receipt

## Maker result

The current branch is a reviewable hosted-alpha candidate. The implemented
public-to-member path now includes a public website, six-step onboarding,
multi-role Career Evidence, a populated multi-path Home scoreboard, direct
Greenhouse/Lever/Ashby intake, a source-bound preliminary assessment, a private
pursuit, editable Resume and Cover Letter Studios, and exact approval
boundaries.

Founder dogfooding exercised the same member journey with the live Going
`Director, Lifecycle Marketing` requisition. It surfaced and corrected:

1. an edge-runtime redirect incompatibility that blocked live Ashby intake;
2. a dashboard state that called an existing semantic resume `missing`;
3. duplicate and grammatically unsafe deterministic cover-letter copy;
4. a blank `New letter` path that bypassed the grounded-outline choice;
5. an approval heading that claimed readiness before a package existed; and
6. a visible `criteriona` pluralization error.

The current product still does not claim requirement-level role fit, automated
job discovery, employer-form capture for every ATS, autonomous AI generation,
outreach, upload, or application submission.

## Fresh visual evidence

| Surface | Viewport / state | Evidence |
| --- | --- | --- |
| Selected Executive Evidence reference beside current public page | Same 853-pixel viewport, top 1,395 pixels | [23-reference-vs-current-public-853x1395.png](23-reference-vs-current-public-853x1395.png) |
| Public Home | 390 × 844, Light | [24-public-home-390-light-final.png](24-public-home-390-light-final.png) |
| Public mobile menu | 390 × 844, Light, open/focused | [25-public-menu-390-light-final.png](25-public-menu-390-light-final.png) |
| Populated member Home | 390 × 844, Dark | [26-member-home-390-dark-final.png](26-member-home-390-dark-final.png) |
| Populated member Home | 390 × 844, Light | [27-member-home-390-light-final.png](27-member-home-390-light-final.png) |
| Populated member Home | 768 × 1024, Light | [28-member-home-768-light-final.png](28-member-home-768-light-final.png) |
| Populated member Home | 1440 × 900, Light | [29-member-home-1440-light-final.png](29-member-home-1440-light-final.png) |
| Going job assessment | 1440 × 900, Light | Screenshot 30 excluded because it captured the page-entry transition; settled replacement required after deployment |
| Going pursuit and exact-action gate | 390 × 844, Light | [31-going-pursuit-390-light-final.png](31-going-pursuit-390-light-final.png) |
| Corrected Cover Letter Studio | 390 × 844, Light | [32-cover-letter-studio-390-light-final.png](32-cover-letter-studio-390-light-final.png) |
| Fresh isolated second member | 390 × 844, Light, onboarding step 1 | [33-second-member-onboarding-390-light-final.png](33-second-member-onboarding-390-light-final.png) |
| Career Profile with two structured roles | 320 × 800, Light | [16-career-profile-two-roles-320-light-current.png](16-career-profile-two-roles-320-light-current.png) |

The selected reference remains the visual-quality benchmark, not a copy
requirement. The current page deliberately applies Matt's later decisions:
literal `job` language, Light as the default, no paste-a-job primary action,
clearer next-job value, a card-based three-part journey instead of the rejected
timeline, and an onboarding-first call to action.

## Confirmed interaction and state checks

- Public mobile navigation opens, shows real routes, closes with `Escape`, and
  returns focus to the menu control.
- The public page has no horizontal overflow at 390 pixels.
- A fresh member is redirected from `/app/home` and `/app/jobs` to
  `/app/onboarding?step=1`.
- Matt's completed member reaches the populated Home scoreboard.
- Direct routes and refreshes preserve Home, Jobs, job detail, Pursuits,
  pursuit detail, both Studios, Plan, Profile, and Privacy.
- Light and Dark are the only appearance choices; Light remains the default.
- Going intake returns the exact canonical Ashby requisition, title,
  publication date, remote status, and $175,000 to $190,000 range.
- The Going result stays `Needs Evidence`; its 83% score is labeled
  `Preliminary alignment`, not overall fit or hiring probability.
- A pursuit can be created without authorizing employer action.
- Resume and cover-letter starters are editable and versioned.
- `New letter` now returns to `Build evidence-grounded outline`.
- The deterministic outline uses confirmed profile facts without duplicating
  resume-style fragments or claiming current-posting tailoring.
- The exact-action section says `Build and review the exact package before
  approval` when no fingerprinted package exists.

## Two-member isolation proof

The same local D1 database was exercised with two development identities:

| Member | Entry result | Member-owned data visible |
| --- | --- | --- |
| Matt development identity | Completed Home with two confirmed roles, three paths, Going analysis, one pursuit, and document versions | Matt's own workspace |
| Synthetic Terry-like identity | Step 1 of 6 onboarding | No Matt Home, Jobs, profile, pursuit, or document screen |

The second identity was also sent directly to `/app/jobs`; the server redirected
it to `/app/onboarding?step=1`. This is local tenant-isolation evidence, not a
real hosted Terry-account or broad efficacy test.

## Automated verification

| Gate | Result |
| --- | --- |
| Typecheck | PASS |
| Production build | PASS |
| Tests | PASS, 98 of 98 |
| Lint | PASS |
| Production dependency audit | PASS, 0 vulnerabilities |
| Full Way Ahead skill/governance audit | PASS |
| Diff whitespace check | PASS |
| Public and member route compilation | PASS |
| Tenant purge/isolation contracts | PASS |
| Source-version and score-visibility contracts | PASS |
| Ashby bounded-intake and redirect-rejection contracts | PASS |
| Approval and immutable-package contracts | PASS |
| Conflicted-source approval INSERT and UPDATE rejection | PASS |
| Current member approval endpoint | FAIL CLOSED, HTTP 409 with no mutation |

## Accessibility, privacy, and safety boundary

Verified in this slice:

- skip links, semantic headings, landmarks, and labeled native inputs;
- native month fields and explicit current-role state;
- active-route, expanded-menu, and six-step progress semantics;
- keyboard menu close and visible focus;
- 390-, 768-, and 1440-pixel responsive layouts without horizontal overflow;
- Light and Dark evidence;
- consent and Alpha Data Notice before career-data processing;
- account export, deletion, and restart contracts;
- tenant-scoped APIs, provenance, invalidation, and package approval;
- no application-submission endpoint; and
- AI off/synthetic/public-only/minimized-profile safety contracts without a
  connected provider or action tool.

No WCAG conformance claim is made. Physical iPhone Safari, Android Chrome,
VoiceOver, TalkBack, 200% zoom, reduced motion, cellular latency, and broad
browser coverage remain real-device checks.

## Residual scope and release risks

1. The deterministic assessment has not parsed and compared every employer
   requirement with confirmed member evidence; `Needs Evidence` is correct.
2. Members currently add direct employer jobs. Automated monitored job supply,
   ranking email cadences, and broad source rights are not built.
3. Ashby's public feed does not expose application questions. Exact employer
   form capture remains a separate requirement before package approval.
4. Going's final external assets remain blocked on Matt's factual
   confirmations and prior-application attestation.
5. A live AI provider, production email, billing, affiliate enrollment, public
   indexing, outreach, form population, upload, and application submission are
   disabled.
6. Real hosted two-account proof, Terry's consented test, and physical-phone
   QA remain post-deployment gates.
7. `Way Ahead` remains provisional pending formal clearance; current collision
   risk is material.

## Independent verdict

Independent Quality issued a **conditional pass** to deploy commit `3c92e3f`
solely for hosted acceptance testing. The prior approval-integrity blocker is
corrected: conflicted employer-source versions now fail closed at approval
INSERT and UPDATE, member reviewability requires a verified source, and the
unfinished approval workflow is disabled and removed from the current public
promise.

This is not a public-alpha completion verdict. Hosted two-account isolation,
account lifecycle, spoof-header rejection, physical-phone behavior, a settled
job-detail capture, rollback evidence, and a fresh hosted verdict remain open.
