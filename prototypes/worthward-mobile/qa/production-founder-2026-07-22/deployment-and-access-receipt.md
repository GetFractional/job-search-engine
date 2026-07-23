# Way Ahead Production Deployment And Access Receipt

Date: 2026-07-22

## Live workspace

- URL: `https://career-evidence-founder-2026.mattdimock.chatgpt.site`
- Sites project: `appgprj_6a6163a6252c8191a7854638ab082d5e`
- Saved version: `appgprj_6a6163a6252c8191a7854638ab082d5e~appgver_924ea52acd5c8191a427a344bd5e0eb1`
- Deployment: `appgdep_6a6264cfa9a08191816618e1703bffaf`
- Provider deployment: `mattdimock--career-evidence-founder-2026`
- Deployment status: `succeeded`
- Environment revision: `1`
- Recent error-level worker events at final deployment readback: `0`

## Access readback

- Project status: `active`
- Access mode: `custom`
- Allowed account: `mattdim805@gmail.com`
- Allowed account count: `1`
- Allowed groups: `0`
- Access-policy revision: `2`
- Unauthenticated in-app browser result: Sites sign-in screen with `Continue with ChatGPT`
- Identity-less Sites bypass request to `/api/workspace`: HTTP `401`, `Sign in with ChatGPT to continue.`
- The same request with a client-supplied unauthorized identity header: HTTP `401`; Sites stripped or ignored the spoofed identity.
- Sites deployment-screenshot agent after the outer gate: application-level `This account does not have access.` denial.

[Hosted unauthorized-account denial](../../../../output/visuals/way-ahead/production-founder/hosted-unauthorized-account-denial.jpg)

No public access, external account, workspace group, billing, or custom domain was enabled.

## Source provenance

- Local branch: `codex/production-saas-foundation`
- Local deployment commit: `605fe2c2fcaccf21939483b0d207ae117c942172`
- Private GitHub mirror commit: `ee546e4e218efb5824bc34180999b874c2055dbf`
- Shared tree: `67636ca96cfa271d2a41fc170194524df99321f6`

The local and GitHub commit identifiers differ because the Sites source repository and private GitHub mirror were updated through separate authorized repository surfaces. The identical tree binds the deployed source content.

## Evidence boundary

The identity-less request reached the deployed Worker with outcome `ok` and HTTP 401. Because the Worker awaits the D1 integrity-trigger installer before routing any request, this also proves that the hosted runtime completed its trigger-installation gate without returning the fail-closed HTTP 503 response.

This receipt proves successful production publication, custom one-owner access policy, outer sign-in enforcement, application-level unauthorized-account denial, rejection of a client-spoofed identity, source provenance, hosted D1 trigger-installation execution, and the absence of recent error-level worker events. It does not by itself prove owner bootstrap persistence, responsive authenticated hosted states, or physical iPhone behavior. Those require the hosted QA receipt.
