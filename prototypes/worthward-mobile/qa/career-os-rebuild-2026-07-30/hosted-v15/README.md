# Way Ahead hosted v15 receipt

Run date: 2026-07-30

## Release provenance

- Production URL: <https://wayahead.getfractional.co>
- Fallback URL: <https://career-evidence-founder-2026.mattdimock.chatgpt.site>
- Sites version: 15
- Sites deployment: `appgdep_6a6ce7f5b8a881919c962d1eedf17b13`
- Deployment completed: `2026-07-31T18:22:57.678717Z`
- Product source commit: `670d03065e42031be406ce73727f18b704361394`
- Sites source commit: `dedb9f1b24a1c24bba561752d19ff9f893b9894e`
- Archive SHA-256:
  `c942b6ebc80066dc7b25c4210f1a19706276d28109bb46d5ea41ef0ebd2dc9b2`

The Sites source commit contains the exact
`prototypes/worthward-mobile` tree from the product source commit.

## Hosted readback

- Custom domain, provider, and TLS status: active.
- Public homepage: HTTP 200.
- Mobile 390 CSS px: no horizontal overflow, no unlabeled visible controls,
  correct Way Ahead headline, and `noindex, nofollow`.
- Desktop 1280 CSS px: no horizontal overflow, no duplicate IDs, and stable
  public navigation.
- Protected `/app/home`: HTTP 307 to the ChatGPT SSO boundary.
- Unauthenticated `/api/workspace`: HTTP 401 with a sign-in message.
- Browser SSO path reached the OpenAI sign-in screen. No credentials were
  entered.
- Security readback included HSTS, CSP, frame denial, no-sniff, restrictive
  permissions policy, no-referrer, same-origin opener/resource policy, and
  private no-store caching.

Evidence:

- `01-public-home-390-light.png`
- `02-public-home-1280-light.png`
- `03-chatgpt-signin-390.png`

## Honest boundary

This receipt proves the public production route and unauthenticated protection
of v15. It does not prove Matt's signed-in production workspace or real
two-account isolation after this deployment because the QA browser had no
authenticated ChatGPT session. Those checks remain a short Matt-and-Terry
hosted smoke test. Local current-build two-member isolation passed before
release.
