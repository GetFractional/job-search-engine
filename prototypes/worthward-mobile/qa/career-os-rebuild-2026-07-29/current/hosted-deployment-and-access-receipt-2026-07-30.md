# Way Ahead Hosted Deployment and Access Receipt

Run date: 2026-07-30
Custom URL: [https://wayahead.getfractional.co](https://wayahead.getfractional.co)
Sites fallback: [https://career-evidence-founder-2026.mattdimock.chatgpt.site](https://career-evidence-founder-2026.mattdimock.chatgpt.site)
Current Sites version: 14
GitHub source candidate: `2925c9c7ee4731d9c8922dc71d66898658247a86`
Sites source-mirror commit: `c0b5dc5bbe028599bccbc908619a708da20830d1`
Prior saved rollback version: 13

## Result

Production version 14 was saved from the exact candidate app tree and deployed
successfully. The custom domain, provider routing, and SSL all report `active`.
The custom URL is now the durable phone and laptop review route; no local
server, ChatGPT Remote session, Tailscale client, or same-device assumption is
required.

## Exact provenance

- The app subtree at GitHub commit `2925c9c` has tree
  `11483c0c12941870cdf865a0e6e4c61982ecb925`.
- The Sites source mirror commit `c0b5dc5` has that same root tree and follows
  the prior Sites source commit, so the push was fast-forward and no
  force-push was used.
- Sites saved version 14 from source commit `c0b5dc5`.
- The saved archive contains 120 files and reports content hash
  `sha256:7fc5513a8b9310437e5acaaf3b9dfe87523e4d2eb586d2c99a788e48eaa0d90e`.
- Saved version 13 remains available with source commit `1ad0b424` and archive
  hash
  `sha256:f6a247ff42b81a380676821f579402810411e7b574e127d72ea2a22a9ee4ca9a`.

## Hosted readback

| Check | Result |
| --- | --- |
| `/` | HTTPS 200 |
| Sites fallback `/` | HTTPS 200 with Way Ahead content and `noindex` |
| `/how-it-works` | HTTPS 200 |
| `/tools` | HTTPS 200 |
| `/app/home` while signed out | HTTPS 307 to the Sites ChatGPT sign-in route |
| Sign-in route | Reached the official OpenAI login page |
| Client-supplied `oai-authenticated-user-email` against `/api/workspace` | HTTPS 401 with `Sign in with ChatGPT to continue.` |
| Client-supplied `oai-authenticated-user-email` in `POST /api/approvals` | HTTPS 401 with `Sign in with ChatGPT to continue.` before any approval logic |
| Root robots policy | `noindex` present in rendered metadata |
| Local-machine path leakage on the public page | None detected |
| HSTS | Present |
| CSP | `base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'` |
| Clickjacking and MIME protections | `X-Frame-Options: DENY`; `X-Content-Type-Options: nosniff` |
| Privacy headers | `Referrer-Policy: no-referrer`; camera, location, microphone, payment, and USB disabled |
| Recent worker outcomes for deliberate 401/405 probes | Worker outcome `ok`; no runtime exception |

The hosted DOM exposes the complete public navigation, public value
proposition, real `/how-it-works` and `/tools` routes, sign-in calls to action,
and the explicit boundary that model generation, outreach, and application
submission are not enabled.

## What this proves

- The exact corrected candidate is live at a durable HTTPS URL.
- The public product is no longer coupled to the device or process running a
  local server; physical-phone acceptance remains open.
- The current deployment fails closed against the exercised client-supplied
  application-authentication header on both tested paths.
- Version 13 remains saved as the immediate rollback candidate.

## What remains open

- Matt must complete the real signed-in owner path on the live version.
- A distinct second account must prove onboarding, tenant isolation, export,
  deletion, restart, and return sign-in.
- Matt must perform the physical-phone menu, safe-area, touch-target, cellular,
  and assistive-technology smoke checks.
- The excluded local Going screenshot still needs a settled hosted replacement
  after authenticated access.
- A rollback selection exists, but a destructive rollback drill was not run
  against production.
- Terry remains gated until the real two-account, lifecycle, support, and
  rollback prerequisites pass.

The in-app browser's raw screenshot stream applied device-pixel scaling and
cropped the right and lower portions of the viewport. That capture was
excluded rather than represented as visual acceptance. The current local
responsive evidence remains the visual baseline until the physical-phone and
signed-in hosted captures are recorded.
