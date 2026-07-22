# Exact-Build Evidence Manifest

Date: 2026-07-21
Candidate: Way Ahead private alpha
Scope: local synthetic founder QA
Capture surface: Codex in-app Browser
Current handoff service: `http://localhost:3011/#/`

## Build identity

The accepted screenshots were captured from the final product source after the four independent-review defects were repaired. The capture session used loopback port 3021. The same source was then rebuilt through `npm run qa:remote` and restarted as the detached handoff service on port 3011. Changes between capture and handoff were limited to QA documentation, service labels, a stylesheet comment, and the QA-access contract; rendered product code did not change.

Core source SHA-256:

```text
b8bfb21a1a0a38608a9dc2d3b70c6ddb2bc042a3da2efca27ef71b40bda2ba47  app/MyWayAheadPrototype.tsx
d3f4578babd9ffdeaff8b3a3214b77e24ad0727456c6e84561dd89557ff30e5d  app/MyWayAheadFunnel.tsx
8195810afd635bb8390cebbe15767043ca2f718bbaa6fe276f8921ae2ea00927  app/globals.css
5932e49a3eb2443c59df7964c03a972357e67035f3519be3767218d287483f3a  app/way-ahead-v3.css
21cfc8390dbc51d97a7af0135d0cfcac00670d11b83e36118a9aa5eef8212f37  tests/rendered-html.test.mjs
f20e75c0f1973b9a4ee650dd5dfde9cd07ae17bbaf0f3470a4ef8f7a4e5c0e2a  tests/qa-service-contract.test.mjs
```

Final browser bundle SHA-256:

```text
435a194f4580f28170f9b44f34d51d3bcd1f2868a5e113b436b1b809aefcedb4  dist/client/assets/MyWayAheadPrototype-lDLfnbwl.js
18ae7bf1960666531d1148dfa06c6f36aaf797bb1b0cc080fdd01234abf09169  dist/client/assets/index-eFgVY35_.css
```

## Runtime and automated gates

- `npm test`: passed, 40 of 40 tests, 0 failed, 0 skipped.
- TypeScript: passed.
- Production build: passed.
- `npm run lint`: passed.
- `npm run qa:remote:status`: healthy, with the temporary keep-awake guard active.
- `GET http://127.0.0.1:3011/`: `HTTP/1.1 200 OK`.
- Rendered HTML contained `Way Ahead`, `provisional`, and `Find the work that moves your life forward`.

## Accepted screenshot set

- Responsive home: 320 x 700; 390 x 844; 768 x 900; 1280 x 900; 1440 x 900.
- Theme matrix: Light and Dark at phone, tablet, and desktop; System at 320, 390, 768, and 1280, resolving to the host's Dark preference.
- Journey: intent, local account boundary, experience import, Job Standard, compact and selected Career Paths, path-based plan, Find Jobs, sample job review, and job-check input/loading/ready.
- Navigation and focus: public mobile account menu and full-row Settings theme focus.
- Recovery: direct-route setup boundary plus loading, offline, capacity, budget, partial, conflict, validation, and general error.
- Matched comparisons: selected Executive Evidence reference beside the current home and beside the independent-check cards at 390 x 844 per side.

Every accepted image is listed with its SHA-256 in `artifact-sha256.txt`. Files under `excluded-viewport-race/` and `excluded-capture-artifacts/` are rejected and cannot support an acceptance claim.

## Evidence boundary

Fresh physical iPhone Safari, native safe-area, cellular touch, VoiceOver, actual 200 percent zoom, device reduced motion, and fresh axe execution remain unproven. No screenshot changes that boundary.
