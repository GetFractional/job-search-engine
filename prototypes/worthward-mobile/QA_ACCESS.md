# Way Ahead QA Access

## Live review

[Open Way Ahead](https://wayahead.getfractional.co)

Fallback host: [career-evidence-founder-2026.mattdimock.chatgpt.site](https://career-evidence-founder-2026.mattdimock.chatgpt.site)

The public website is available before sign-in. Selecting **Get started** uses
ChatGPT SSO and creates a private member workspace for a new account. Terry can
register himself; Matt does not need to provide or allowlist Terry's email.
Only `mattdim805@gmail.com` receives the configured owner role.

Version 15 is live. Its public mobile and desktop routes, ChatGPT SSO boundary,
protected app redirect, unauthenticated API rejection, noindex state, and
security headers have current hosted readback proof. Matt's exact signed-in
workspace contents must be read from the live account after sign-in; do not use
an older Wpromote, Seso, or row-count receipt as current truth. A new member
receives the six-step setup journey instead of another member's data.

The same HTTPS URL is the supported route on phone, laptop, and the remote
browser. It does not depend on the Mac staying awake, a shared Wi-Fi network,
or a tunnel. On a phone, `localhost` means the iPhone itself, not Matt's laptop.
Tailscale, NetBird, Dev Tunnels, and router changes are not required.
Do not switch to an unauthenticated public tunnel; use the hosted URL above.

## Founder review checklist

1. Open the live domain while signed out and review the website and mobile
   menu.
2. Select **Get started** and continue with Matt's ChatGPT account.
3. Confirm Home uses the current Job Paths and saved evidence in Matt's live
   workspace. Report any unexpected employer, role, score, or empty state
   instead of assuming an older receipt is current.
4. Open Profile and confirm Matt's visible roles and skills are accurate.
5. Open Plan and confirm the visible compensation standard and Job Paths are
   still correct.
6. Open Resume Studio and Cover Letter Studio. Confirm the content and design
   controls are editable and no employer-facing action exists.
7. Switch between Light and Dark in the account menu; Light is the default.
8. Open **Data & privacy** and confirm export, account deletion, sign-out, and
   recovery-history disclosures are visible. Do not delete the owner account.
9. Repeat the review on the phone. Confirm the bottom navigation is reachable,
   the page does not scroll sideways, and the menu closes with Escape or the
   close control.

## Terry test

Terry opens the same live domain, selects **Get started**, and signs in with his
own ChatGPT account. He should see onboarding and an empty private workspace,
never Matt's profile, jobs, assets, or preferences. Stop and report immediately
if any Matt data appears.

## Troubleshooting

- **Sign-in loop:** reload the custom domain once, confirm ChatGPT sign-in
  completed, and retry **Get started**.
- **Wrong workspace:** sign out from the account menu and sign back in with the
  intended ChatGPT account.
- **Old content:** reload once and compare the visible page with the current
  v15 screenshots linked in the hosted release receipt.
- **Phone layout issue:** record phone model, browser, orientation, theme,
  screen, and a screenshot.
- **Custom-domain issue:** use the fallback host above and report the failing
  URL and timestamp.

## Current boundary

This is a noindex public alpha, not a commercial launch. Billing, paid model
generation, recurring job monitoring, production email, employer-form
population or upload, outreach, references, and application submission are not
enabled. Do not add those capabilities or publish prices or outcome claims
without the reserved approval and a new verification receipt.

Current release receipt:
[hosted v15](qa/career-os-rebuild-2026-07-30/hosted-v15/README.md).
