# Way Ahead QA Access

## Use this route now

| Where Matt is reviewing | Working route | What it proves |
|---|---|---|
| Mac laptop | Run `npm run qa:laptop`, then open `http://localhost:3011/#/` | Current production bundle in a laptop browser |
| ChatGPT app away from the Mac | Run `npm run qa:remote`, connect Remote to this exact Mac, and ask the host chat to open `http://localhost:3011/#/` in its built-in browser | Remote host-browser review with a temporary keep-awake guard |
| iPhone on the same trusted Wi-Fi | Run `npm run qa:lan`, then open the Mac's current Wi-Fi address on port 3013 | Native iPhone Safari, touch, safe area, zoom, and VoiceOver on that network |
| Native iPhone Safari away from home | Authenticated Microsoft Dev Tunnel pilot after exact reserved approval | Real on-the-go iPhone QA without a public product deployment; free published quota, public-preview reliability |
| Private-mesh alternative | NetBird Cloud Free after exact reserved approval | Free private network for up to the published free-plan limits; requires an interface-bound proxy because the app remains loopback-only |
| Paid fallback | Tailscale Standard after exact reserved approval | Tailnet-only access with the cleanest loopback proxy path; currently listed at $8 per active user per month |

The detached laptop service was rebuilt and verified healthy on port 3011 on 2026-07-21. The Remote command adds a temporary macOS keep-awake guard for the lifetime of the managed preview. It still depends on the Mac remaining connected, logged in, and physically open; closing a MacBook lid can suspend it.

The managed service now tracks its exact preview process and was verified through two consecutive rebuild/restarts. This repairs the stale-port failure that previously left an orphaned preview process behind.

## Why the old link failed

`http://localhost:3011/#/` is a laptop-local address. It works only while a server is running on the laptop. On an iPhone, `localhost` means the iPhone itself, not the Mac.

The previous preview process belonged to a Codex execution session and ended with that session. It was not a persistent service or a mobile-accessible URL.

## Laptop and ChatGPT Remote host access

For ordinary laptop review, start the detached, loopback-only production preview from the prototype directory:

```bash
npm run qa:laptop
```

Then open:

```text
http://localhost:3011/#/
```

The service survives the initiating Terminal or Codex command. It remains limited to the laptop and is removed at logout or reboot. If the server itself crashes, run `npm run qa:laptop` again.

Check or stop it with:

```bash
npm run qa:laptop:status
npm run qa:laptop:stop
```

For ChatGPT Remote, pair the phone with this exact Mac and use the same ChatGPT account and workspace. Keep the Mac powered, connected, and awake. Ask the Remote chat on this host to open the prototype in the built-in browser. Clicking a `localhost` link in iPhone Safari still targets the iPhone and will not work.

Before leaving the Mac, start the Remote-ready session:

```bash
npm run qa:remote
```

This rebuilds the current bundle, starts the managed loopback preview, and runs `caffeinate` only while that exact preview process is alive. It does not change Energy Saver settings, open a network port beyond loopback, install software, or publish the prototype. Check or stop the full session with:

```bash
npm run qa:remote:status
npm run qa:remote:stop
```

In the ChatGPT desktop app, review **Settings > Connections** for the host's keep-awake option. On a MacBook, keep the lid open and connect power when practical. Logout, reboot, loss of network, closing the desktop app, stopping the QA session, or closing the laptop lid ends Remote availability.

This Remote path supports host-browser review. It is not native iPhone Safari, touch, safe-area, or VoiceOver proof.

## Same trusted Wi-Fi only

This command exposes the preview to every device that can reach the Mac on the current local network:

```bash
npm run qa:lan
```

Determine the Mac's current Wi-Fi address instead of reusing an old address:

```bash
ipconfig getifaddr en0
```

If the command prints `10.0.0.38`, for example, open `http://10.0.0.38:3013/#/` on the iPhone while both devices are on that same trusted Wi-Fi.

Stop the foreground server with `Control-C`. Do not use this mode on hotel, airport, coffee-shop, or other shared networks. It does not provide on-the-go access away from that Wi-Fi.

## On-the-go native iPhone QA

True iPhone Safari QA away from home requires an authenticated route from the iPhone to the Mac. The current zero-incremental-cost order is:

1. Pilot a creator-private Microsoft Dev Tunnel with authenticated access. Microsoft publishes a free quota of 5 GB of transfer per user per month, but Dev Tunnels remains a public-preview service without an SLA.
2. If the tunnel pilot is unreliable, test NetBird Cloud Free on only the Mac and iPhone. NetBird publishes a free tier for up to 5 users and 100 machines and provides an iOS app. Because this prototype stays bound to `127.0.0.1`, the pilot also needs a narrowly scoped proxy bound only to the NetBird interface.
3. Use Tailscale Standard only if its simpler tailnet-only Serve path materially reduces QA friction enough to justify the current $8 per active user monthly business price. Tailscale Personal is published for personal or non-commercial use, so it is not the operating assumption for this company prototype.

Tailscale was recommended first for security and simplicity, not price: Tailscale Serve can proxy a loopback service without rebinding the prototype to every local interface. The free alternatives now rank ahead of it because the current stage optimizes for low cash burn.

Do not enable Tailscale Funnel, another tunnel, a mesh client, Cloudflare Quick Tunnel, ngrok, router port forwarding, or a public deployment without the exact reserved approval recorded in the mobile-access decision packet. Cloudflare Quick Tunnels are rejected for this private-alpha requirement because they create random public URLs and do not provide the required access boundary.

The Mac must remain awake and connected. A closed MacBook without an external display is not a reliable Remote host.

## Fast troubleshooting

From the prototype directory:

```bash
npm run qa:laptop:status
```

If it is not healthy:

```bash
npm run qa:laptop
```

If Remote opens the link on the iPhone itself, return to the host's built-in browser and open the link there. If native Safari is required, use the same-Wi-Fi route or wait for an approved authenticated-tunnel pilot. A ChatGPT Remote screenshot is useful founder feedback, but it is not native Safari evidence.
