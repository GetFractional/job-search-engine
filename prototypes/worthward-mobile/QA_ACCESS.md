# Way Ahead QA Access

## Live founder workspace

The production URL will be recorded here immediately after the first owner-only deployment succeeds.

The same HTTPS URL is the supported route on Matt's iPhone, laptop, and ChatGPT remote browser. Sign in with the ChatGPT account for `mattdim805@gmail.com`. Hosting access and the application allowlist both reject other accounts.

Unlike a localhost preview, the hosted workspace does not depend on the Mac staying awake, being on the same Wi-Fi, or running a tunnel. Tailscale, NetBird, Dev Tunnels, and router changes are not required.

## Cross-device proof checklist

1. Open the live URL on the laptop and sign in.
2. Confirm Today shows the current Seso pursuit and its source conflict.
3. Change appearance to Light, Dark, and System.
4. Open the same URL on the phone and sign in with the same account.
5. Confirm the profile, Job Standard, career paths, job, pursuit, assets, package fingerprint, and blockers match.
6. Confirm the bottom navigation remains reachable and no page scrolls sideways.
7. Confirm Approval remains unavailable while the listed blockers exist.

The founder environment must not show sample records, local source paths, a fake checkout, a submission control, or a Teal workflow.

## Local engineering route

For implementation work only:

```bash
npm run dev -- --host 127.0.0.1 --port 3015
```

Open `http://127.0.0.1:3015/` on the same Mac. On an iPhone, `localhost` means the iPhone itself and cannot reach the Mac. Local access is not a substitute for hosted cross-device proof.

## Troubleshooting

- **Sign-in loop:** verify the live Sites URL is being used and the browser is signed into the expected ChatGPT account.
- **Access denied:** the authenticated email does not match the configured owner email, or the Sites access policy drifted from owner-only.
- **Empty workspace:** the authenticated owner bootstrap has not been completed for that deployment's D1 database.
- **Old data:** reload once, then compare the source-check timestamp and package fingerprint. Do not re-bootstrap over unexpected records until the database state has been inspected.
- **Phone layout issue:** record the phone model, browser, orientation, theme, screen, and a screenshot. Do not switch to an unauthenticated public tunnel.

## Security boundary

This is a private founder environment, not a public launch. Do not add users, groups, billing, production uploads, model credentials, external application actions, or public sharing without the exact reserved approval and a new verification receipt.
