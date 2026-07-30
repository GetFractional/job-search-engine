# Way Ahead Current-Build Independent Quality Verdict

Review dates: 2026-07-29 and 2026-07-30
Reviewer: Independent Quality, read-only
External mutations: None

## Current verdict

**PASS for Matt-only hosted laptop and mobile QA handoff on Sites production
version 14.**

This is a technical hosted checkpoint, not a public-alpha completion verdict.
Terry, real career-data entry, broad promotion, billing, model-powered
generation, package approval, employer action, outreach, and application
submission remain gated.

Immutable deployment provenance:

- reviewed GitHub candidate: `2925c9c7ee4731d9c8922dc71d66898658247a86`;
- Sites source mirror with the same app tree:
  `c0b5dc5bbe028599bccbc908619a708da20830d1`;
- active Sites production version: 14; and
- saved rollback candidate: version 13.

## Corrected release blocker

Independent review found that the database approval triggers allowed
`capture_state = 'conflict'` even though assessment and Home treated unresolved
source conflict as blocking. That mismatch could have allowed an exact-package
approval against an unresolved employer-source conflict.

The corrected source now:

- requires `capture_state = 'verified'` at approval INSERT and UPDATE;
- applies the same verified-only rule in member reviewability;
- adds adversarial rejection coverage for both approval paths;
- makes `/api/approvals` fail closed with HTTP 409 and no mutation;
- tells members and public visitors that this alpha stops at editable drafts
  and does not yet construct or approve a claim-safe package; and
- passes typecheck, build, lint, dependency audit, governance audit, diff check,
  and all 98 tests.

Files 24 through 33 were also converted from JPEG payloads with PNG names to
valid PNG files. Screenshot 30 is excluded because it captured the 240 ms
page-entry transition and is unreadable.

## Prior verdict and corrections

The July 29 verdict was **FAIL** against the pre-correction source. Its five
named UX defects are superseded:

1. Jobs history now returns to the list correctly.
2. Invalid job and pursuit IDs fail explicitly without substituting another
   record.
3. Cover Letter provenance copy matches the profile-only starter.
4. How It Works and Career Tools are real routes.
5. Zero-job Home copy and its next action are truthful.

The full member-owned multi-role evidence, supported-source assessment,
pursuit, and editable Resume and Cover Letter draft slice is now present. The
current release deliberately does not claim package approval, application
submission, automated discovery, or model-powered generation.

## Hosted readback

The bounded production readback passed:

1. custom-domain and fallback URL health;
2. SSL, public routes, security headers, and `noindex`;
3. exact immutable candidate-to-Sites provenance;
4. rejection with HTTP 401 of a client-supplied
   `oai-authenticated-user-email` header on `/api/workspace` and
   `POST /api/approvals`; and
5. preservation of Sites version 13 as the immediate rollback candidate.

## Remaining release gates

1. Real owner SSO, onboarding, export, deletion, and restart.
2. Real second-account tenant isolation across profile, jobs, pursuits,
   documents, and account lifecycle.
3. Authenticated `/api/approvals` must return HTTP 409, followed by D1 readback
   proving no mutation.
4. Physical-phone touch targets, safe areas, responsiveness, cellular behavior,
   zoom, reduced motion, and accessibility.
5. A settled replacement for excluded screenshot 30.
6. Version 13 code rollback and D1 recovery drill with readback.
7. A fresh independent final verdict after those checks.

Do not invite Terry or enter real career data before the real-account isolation
and account-lifecycle gates pass.
