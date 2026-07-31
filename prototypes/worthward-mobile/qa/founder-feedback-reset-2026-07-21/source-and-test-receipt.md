# Founder Feedback Reset Source and Test Receipt

Receipt date: 2026-07-21
Scope: P0 trust and flow corrections, the 30-table local private-alpha and economics data contract, and Mac host-side Remote QA access
Release meaning: corrected slice only; this is not acceptance of the rejected broad customer experience

## Exact verification

Commands were run from `prototypes/worthward-mobile` after the final scoped source changes.

| Check | Result |
|---|---|
| `npm test` | PASS: typecheck, production build, 16 rendered truth/state/leakage tests, 19 schema/invariant and adversarial economics tests, and 4 QA-service contract tests; 39 of 39 total |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS with no reported errors or warnings |
| `npm run db:generate` | PASS: 30 tables; no pending schema delta and no production connection |
| `zsh -n scripts/qa-service.sh scripts/run-qa-loopback.sh scripts/run-qa-remote-guard.sh` | PASS |
| `npm run qa:remote` | PASS: forced a current production build, cleanly replaced the managed preview, and started the scoped keep-awake guard |
| `npm run qa:remote:status` | PASS: detached QA service healthy at `http://localhost:3011/#/`; guard active |
| Remote stop/restart lifecycle | PASS: explicit stop and rebuild/restart released and reacquired port 3011 without an orphaned process |
| listener inspection | PASS: preview listened only on `127.0.0.1:3011`; no listener existed on LAN port 3013 |
| process inspection | PASS: the guard command was exactly `caffeinate -is -w <current-preview-pid>` |
| host HTTP check | PASS: HTTP 200 with branded My Way Ahead HTML |
| fresh browser verification | PASS for the scoped current-build recheck: 320, 390, 768, 1280, and 1440 widths; Light, Dark, System-to-Light, System-to-Dark, reduced motion, skip-link focus, keyboard menu and focus restoration, validation recovery, loading, partial, no-action, offline, source-error, capacity, budget, conflict, exact approval, approved-not-handed-off, and revocation states; broad experience remains blocked |

The production build completed all five vinext build stages. The route classifier continued to report the framework's existing dynamic-route classification notice; it did not fail the build.

The Remote service now rebuilds before every Remote start, serializes lifecycle commands, verifies process ownership before reporting or stopping the keep-awake guard, and exits on interruption before releasing its lock. Independent review passed the Mac host-side host-browser path. A physical iPhone-to-Mac Remote connection is still a founder readback, and native iPhone Safari remains a separate unpassed surface.

## Source hashes

SHA-256 values were captured after verification.

| File | SHA-256 |
|---|---|
| `app/MyWayAheadPrototype.tsx` | `04762a0b10e74c9387a2766a725ec45f30f26e9d1986f773dbf716406bd684ae` |
| `app/MyWayAheadFunnel.tsx` | `74ac9a3824826a2277911eb8e2a7ffe6585891c1f312b5a24be140c79f70fbc6` |
| `app/prototype-data.ts` | `e9b0932943cb0253da2d9b223842c2f45806e9cf0a91805a18b9ae77054ef1cc` |
| `app/globals.css` | `826f2f27957bd0f45619888bc7ff51bb0959e100f9ceaf0002e6382b7a5b7d79` |
| `db/schema.ts` | `2bc21768a2f9ba44bd488c7cc5ac067b03b4789f5fd0ad64705db78574b89769` |
| `tests/rendered-html.test.mjs` | `840d16d988552358112e5ea6f9748ee3c16ad525cb8e8a94f71f125b98ed91d1` |
| `tests/schema-contract.test.mjs` | `a997fd9ffe0b346db4311114eff8f7030d49fcfcb5d6956e28d0fb47afdfd9c6` |
| `tests/qa-service-contract.test.mjs` | `04cf40640d834d708cd9c0764430d4839b42bb484e88f9dc59140da6a6b03060` |
| `scripts/qa-service.sh` | `229c1554f45fe62f9b407cf88043c56ae6d958a6e4a576c8c74e53dca494c38f` |
| `scripts/run-qa-loopback.sh` | `587a8fc14c03818bd15e5d21a71858124bf0deb9e5d1a6f20626495882a27db2` |
| `scripts/run-qa-remote-guard.sh` | `d4b711b0866928c3236ea64734497c8180f9ea6a4249a525a697e49661438ad8` |
| `QA_ACCESS.md` | `531b42ac6587294db6385427d06d91d82f9534bb2cbca8b68117c8c7fce2eac3` |
| `drizzle/0000_tricky_jack_murdock.sql` | `c841d013b08ef6a3aa415315e34b4919ac079e2ae3e6026d4c4410be37c5bc25` |
| `drizzle/0001_supreme_sir_ram.sql` | `8c83bf7641c7b7e017eb364589b41c4232d6e76518a91656885be6768e8561c8` |
| `drizzle/0002_clever_xorn.sql` | `01bface1a3232a1aacd6d890ec302e28c33493735435c05659a5ecb534c17d6c` |
| `drizzle/0003_rainy_nightmare.sql` | `0c8051550363234bea207b268ae31100f731d5c2c7893ddfbb5ec79453cdfd22` |
| `drizzle/0004_famous_puppet_master.sql` | `fa915dc8f5c5f172a7951d11683899cd3c3773b7759790623662a72129e64c0e` |
| `package.json` | `62cc4bd6598f80623b57bf4595bf4d44e0079c5c8032587f72aa0e22cd527e99` |

## Provenance boundary

The [capture manifest](capture-manifest.md) binds fresh current-harness screenshots to exact source hashes, routes, viewports, browser, theme resolution, and artifact hashes. It also records which remaining surfaces require a physical device or the Board-selected rebuild.

The workspace contains unrelated user changes and untracked work. No commit, push, pull request, deployment, or destructive cleanup was attempted. These hashes identify the tested local source but do not substitute for clean Git provenance. A clean branch and draft pull request remain a separate Board gate.
