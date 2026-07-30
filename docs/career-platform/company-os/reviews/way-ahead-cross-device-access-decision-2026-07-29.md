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

- Current approved production checkpoint:
  [https://wayahead.getfractional.co](https://wayahead.getfractional.co)
- Sites fallback:
  [https://career-evidence-founder-2026.mattdimock.chatgpt.site](https://career-evidence-founder-2026.mattdimock.chatgpt.site)

Both returned HTTPS 200 on 2026-07-29. They currently serve production version
13, not the un-deployed branch reviewed in the current build receipt.

The next branch must not replace version 13 until its independent release gates
pass. When a reviewed version is deployed, the same URLs will work from the
laptop and phone without a tunnel.

## Why Tailscale is no longer recommended

Tailscale was considered as a private path to a loopback-only development
server before hosted authentication and a custom subdomain existed. It adds
client installation, account/session management, device enrollment, and a
network dependency. The current hosted Sites route already provides the
cross-device result at zero incremental spend.

Keep a private tunnel only as an emergency engineering diagnostic. It is not
the product access model.

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
