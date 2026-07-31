# Exact-Build Evidence Manifest

Date: 2026-07-21
Candidate: Way Ahead private alpha
Scope: local synthetic founder QA
Capture surface: Codex in-app Browser
Current handoff service: `http://localhost:3011/#/`

## Build identity

The accepted screenshots were captured from the corrected product source. After independent review found three mobile controls below the 44 px target contract, those controls were repaired, regression coverage was tightened, the production bundle was rebuilt, and the affected current-build evidence was recaptured through the Codex in-app Browser on port 3011.

Core source SHA-256:

```text
b8bfb21a1a0a38608a9dc2d3b70c6ddb2bc042a3da2efca27ef71b40bda2ba47  app/MyWayAheadPrototype.tsx
d3f4578babd9ffdeaff8b3a3214b77e24ad0727456c6e84561dd89557ff30e5d  app/MyWayAheadFunnel.tsx
8195810afd635bb8390cebbe15767043ca2f718bbaa6fe276f8921ae2ea00927  app/globals.css
3c9b3ebb28fbd09b96cbc405fa1c5e965162b81a02075714ea03aeb200728dd9  app/way-ahead-v3.css
3634c45621bf295ad2d0d0a0ceac0db72e6c1816546fb3a2bf905da95c849807  tests/rendered-html.test.mjs
f20e75c0f1973b9a4ee650dd5dfde9cd07ae17bbaf0f3470a4ef8f7a4e5c0e2a  tests/qa-service-contract.test.mjs
```

Final browser bundle SHA-256:

```text
435a194f4580f28170f9b44f34d51d3bcd1f2868a5e113b436b1b809aefcedb4  dist/client/assets/MyWayAheadPrototype-lDLfnbwl.js
9d0482c79bfb5878db793ffba60e6b63bde82d8bce67d8cbc011f3bf6c303feb  dist/client/assets/index-C42XTzS-.css
```

## Runtime and automated gates

- `npm test`: passed, 40 of 40 tests, 0 failed, 0 skipped.
- TypeScript: passed.
- Production build: passed.
- `npm run lint`: passed.
- `npm run qa:remote:status`: healthy, with the temporary keep-awake guard active.
- `GET http://127.0.0.1:3011/`: `HTTP/1.1 200 OK`.
- Rendered HTML contained `Way Ahead`, `provisional`, and `Find the work that moves your life forward`.
- `npm run db:generate`: passed; 30 tables read and no migration drift found.

## Accepted screenshot set

- Responsive home: 320 x 700; 390 x 844; 768 x 900; 1280 x 900; 1440 x 900.
- Theme matrix: Light and Dark at phone, tablet, and desktop; System at 320, 390, 768, and 1280, resolving to the host's Dark preference.
- Journey: intent, local account boundary, experience import, Job Standard, compact and selected Career Paths, path-based plan, Find Jobs, sample job review, and job-check input/loading/ready.
- Navigation and focus: public mobile account menu and full-row Settings theme focus.
- Recovery: direct-route setup boundary plus empty/no-action, loading, offline, capacity, budget, partial, conflict, validation, and general error.
- Approval: exact unapproved boundary, approved-not-handed-off, and revoked-after-package-change.
- Accessibility: corrected 44 px Career Path controls, fresh 320 px reflow, and the browser/source receipt in `accessibility-evidence-receipt.md`.
- Matched comparison: the complete selected Executive Evidence timeline beside the current independent-check cards at 390 x 844 per side.

Every accepted image is listed with its SHA-256 in `artifact-sha256.txt`. Files under `excluded-viewport-race/` and `excluded-capture-artifacts/` are rejected and cannot support an acceptance claim.

## Evidence boundary

Fresh physical iPhone Safari, native safe-area, cellular touch, VoiceOver, actual 200 percent zoom, device reduced motion, and axe execution remain unproven. They are recorded as pre-external-alpha device-validation risks; no artifact overclaims them.
