# Way Ahead Private Mobile QA Access Packet

**Status:** Board decision packet only
**Prepared:** 2026-07-21
**Authority:** No software installation, account creation, vendor-term acceptance, tunnel, spend, public endpoint, production connection, or external-user access has been authorized or performed.

## Decision

Use ChatGPT Remote immediately for no-incremental-cost host-browser review. For actual native iPhone Safari QA away from home, test **Microsoft Dev Tunnels first**, creator-private and authenticated, at $0. Keep **NetBird Cloud Free** as the private-mesh alternative. Use **Tailscale Standard** only if the two free routes are unreliable or too cumbersome.

The original Tailscale recommendation was security-first, not cost-first. Tailscale Serve can proxy a loopback-only app to an identity-bound tailnet without enabling its public Funnel feature. That is a clean operational design, but Tailscale's current Personal plan is non-commercial and Standard is $8 per user per month. It is therefore the paid fallback, not the first pilot.

The local-link failure is expected: `localhost` or `127.0.0.1` on an iPhone means the iPhone, not Matt's Mac. ChatGPT Remote loads the connected host's live state through OpenAI's relay; it does not make the Mac's loopback URL a native Safari address.

## Route comparison

| Route | Away from home | Native iPhone Safari | Access boundary | Cost and recommendation |
|---|---:|---:|---|---|
| ChatGPT Remote | Yes | No | Authenticated Remote session controls and observes the Mac host/browser; Mac must remain reachable and Codex must remain running | $0 incremental on an eligible existing ChatGPT plan; use now for founder review |
| Same trusted Wi-Fi LAN | No | Yes | Mac must listen on a restricted LAN interface; reachable by permitted devices on that local network while enabled | $0; useful only when both devices share the trusted network |
| Microsoft Dev Tunnels | Yes | Yes | Persistent HTTPS forwarding; creator-private by default and authenticated by the same Microsoft or GitHub identity; no anonymous access | $0 published service limit; **recommended native-Safari pilot**; public preview, 5 GB per user-month, no SLA |
| NetBird Cloud Free | Yes | Yes | Encrypted peer-to-peer private mesh with identity, access controls, and private DNS; requires a proxy bound only to the NetBird interface because the app stays on loopback | $0 for up to 5 users and 100 machines; best explicit-$0 private mesh, but more setup than Dev Tunnels |
| Tailscale Serve, Standard | Yes | Yes | Tailnet-only HTTPS proxy; backend stays on loopback; Funnel prohibited | $8 per user per month; best paid fallback |
| Cloudflare Tunnel plus Access | Yes | Yes | Public hostname must be correctly protected by Access; controlled domain and policy ordering required | Can be $0, but domain control is unproven and misconfiguration risk is unnecessary for this pilot |
| Cloudflare Quick Tunnel | Yes | Yes | Random Internet hostname; testing-only service with no SLA | $0 but rejected because it is not the required private identity boundary |
| Direct WireGuard | Yes | Yes | Fully private when configured correctly | Software is $0, but router, firewall, keys, DNS, CGNAT, and mobile-network handling create avoidable founder burden |

## Current official evidence

- [OpenAI, Work with Codex from anywhere](https://openai.com/index/work-with-codex-from-anywhere/) explains that Remote loads live state from the connected machine while files, credentials, permissions, and local setup remain on that host.
- [Microsoft Dev Tunnels security](https://learn.microsoft.com/en-gb/azure/developer/dev-tunnels/security) states that tunnels are private to the creator by default and use Microsoft, Entra, or GitHub authentication. Anonymous access is an explicit separate setting.
- [Microsoft Dev Tunnels limits](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#dev-tunnels-limits) publishes 5 GB per user-month, 10 tunnels per user, and 10 ports per tunnel.
- [Microsoft Dev Tunnels overview](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/overview) identifies the service as public preview, development/test only, and without an SLA.
- [NetBird pricing](https://netbird.io/pricing) lists a $0 plan for up to 5 users and 100 machines with peer-to-peer encryption, access controls, private DNS, and network routes.
- [NetBird iOS documentation](https://docs.netbird.io/get-started/install/ios) confirms an official iOS client.
- [Tailscale pricing](https://tailscale.com/pricing?plan=business) lists Standard at $8 per user per month and limits the $0 Personal plan to non-commercial use.
- [Cloudflare Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) describes Quick Tunnels as testing/development only and provides no uptime or SLA guarantee.

## Zero-cost-first implementation order

### Route 0: ChatGPT Remote, no installation

1. Keep the Mac awake, online, and running the current Codex task and exact current production build at `http://127.0.0.1:3021/#/`.
2. Update the ChatGPT mobile app and Codex desktop app.
3. In the mobile app, use Remote and select the paired Mac host and this exact task.
4. Review the host browser there. Record this as host-browser founder review, not native Safari evidence.

### Route 1: Microsoft Dev Tunnels, recommended native pilot

If exactly approved:

1. Confirm the production build returns 200 and listens only on `127.0.0.1:3021`.
2. Install the Microsoft Dev Tunnels CLI on the Mac, accept its public-preview terms, and authenticate with one existing Matt-owned GitHub or Microsoft identity.
3. Create one persistent tunnel and one port forwarding only `127.0.0.1:3021`.
4. Keep creator-private access. Do not add anonymous, organization, tenant, or bearer-token access.
5. Read back the tunnel ID, access policy, port, process listener, and absence of anonymous access.
6. Sign into the same identity in native iPhone Safari, open the tunnel URL over cellular, and capture the required touch, safe-area, theme, responsive, reduced-motion, and VoiceOver evidence.
7. Stop and delete or disable the tunnel after evidence capture; verify the URL no longer serves the app.

### Route 2: NetBird Cloud Free, private-mesh alternative

If Dev Tunnels fails its proof contract and this route is exactly approved:

1. Create one Matt-owned NetBird Cloud Free network and enroll only the Mac and iPhone.
2. Keep the app bound to `127.0.0.1:3021`.
3. Add one reversible reverse proxy bound only to the Mac's NetBird IP and forwarding only to `127.0.0.1:3021`.
4. Add a least-privilege access rule that permits only Matt's iPhone peer to that one Mac port.
5. Read back account plan, users, peers, policy, listeners, and effective route.
6. Capture native Safari cellular evidence, then stop the proxy and remove the access rule and peers.

### Route 3: Tailscale Standard, paid fallback

Use only if Routes 1 and 2 cannot meet the reliability and proof bar. The existing paid contract remains one Standard seat, the Mac and iPhone only, tailnet-only Serve to `127.0.0.1:3021`, no Funnel, one billing cycle, immediate renewal cancellation, and explicit teardown proof.

## Universal stop conditions

Stop without widening access if:

- any route asks for anonymous or Internet-public access;
- any tool exposes another service or port;
- more than Matt's Mac and iPhone are required;
- production or personal job-search data would enter the prototype;
- billing, a trial, a credit card, an organization install, or a paid upgrade appears;
- identity, terms, listener, access policy, or teardown cannot be read back exactly;
- the route requires changing firewall, router, DNS, or production security settings beyond the approved contract.

## Exact reserved approval options

Preferred $0 native-Safari gate:

> Approve installation of the Microsoft Dev Tunnels CLI on Matt's Mac, acceptance of Microsoft's public-preview Dev Tunnels terms, authentication with one existing Matt-owned GitHub or Microsoft identity, and one persistent creator-private tunnel forwarding only `127.0.0.1:3021`. Prohibit anonymous, organization, tenant, bearer-token, public-user, production-data, and additional-port access. Require listener and access-policy readback, native iPhone Safari evidence over cellular, then tunnel deletion or disablement with teardown proof. Stop on any charge, trial, upgrade, billing prompt, identity warning, or scope expansion.

Alternate $0 private-mesh gate:

> Approve a NetBird Cloud Free pilot using one Matt-owned account, only Matt's Mac and iPhone, and one reversible proxy bound solely to the Mac's NetBird interface and forwarding only to `127.0.0.1:3021`. Permit only Matt's iPhone peer to that port. Prohibit public exposure, additional peers, production data, paid features, and other services. Require plan, peer, policy, listener, cellular Safari, and teardown readback proof.

Either approval is independent of public hosting, domain choice, brand lock, external recruitment, production identity, production data, billing activation, affiliate signup, or any application action.
