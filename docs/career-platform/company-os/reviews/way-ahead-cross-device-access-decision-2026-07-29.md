# Way Ahead Cross-Device Access Decision

Decision date: 2026-07-29
Decision: Use the hosted HTTPS application for laptop and phone review. Do not
use a local-development URL or Tailscale as the normal founder route.

## What caused the access failure

`localhost`, `127.0.0.1`, and a Codex/ChatGPT local preview refer to the machine
or remote execution environment that started the server. A phone is a different
device and cannot reach that loopback service. A temporary ChatGPT Remote
session is also not a durable product URL and may not carry the same session
state between the phone app and laptop.

This was an access-architecture mismatch, not evidence that the responsive
website itself failed on mobile.

## Durable route

- Current approved hosted-acceptance checkpoint:
  [https://wayahead.getfractional.co](https://wayahead.getfractional.co)
- Sites fallback:
  [https://career-evidence-founder-2026.mattdimock.chatgpt.site](https://career-evidence-founder-2026.mattdimock.chatgpt.site)

Both resolve to production version 14 as of 2026-07-30. The custom URL returned
HTTPS 200 for the public site; protected member routes redirect to the ChatGPT
sign-in flow. The custom domain, provider routing, and SSL report active.

The exact corrected candidate is now deployed through the same URLs. They work
independently of the device that started Codex, so Matt can open the custom URL
directly from a laptop or phone without a tunnel. Saved production version 13
remains the immediate rollback candidate.

## Why Tailscale is no longer recommended

Tailscale was considered as a private path to a loopback-only development
server before hosted authentication and a custom subdomain existed. It adds
client installation, account/session management, device enrollment, and a
network dependency. The current hosted Sites route already provides the
cross-device result at zero incremental spend.

Tailscale's current Personal plan is free, but Tailscale describes it as
suitable for non-commercial use. Its Standard plan is currently $8 per user per
month. Way Ahead is a commercial product, so the Personal plan is not a sound
production dependency even if it works technically.

Keep a private tunnel only as an emergency engineering diagnostic. It is not
the product access model.

## Free tunnel alternatives

- [Cloudflare Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)
  can expose localhost at a free random `trycloudflare.com` URL for temporary
  browser testing. Cloudflare explicitly limits them to testing and development
  and provides no SLA or uptime guarantee.
- A remotely managed
  [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
  can publish a custom hostname without a paid Cloudflare Access plan. It still
  depends on a running local origin and adds another operational path.
- The current Sites deployment is preferable because it is already hosted,
  authenticated, domain-bound, and independent of Matt's laptop being awake.

## Founder and Terry check

After the corrected immutable build is deployed:

1. Open the custom URL directly in Safari or Chrome, not through a local-preview
   link embedded in a prior chat.
2. Sign in with the intended account.
3. Verify the public page, onboarding, mobile menu, Home, Jobs, Pursuits,
   Studio, Profile, Privacy, export, sign-out, and return sign-in.
4. Repeat once on cellular with Wi-Fi disabled.
5. Terry self-registers only after hosted two-account isolation, export,
   deletion, support, and rollback gates pass.

No broader recruitment is authorized.
