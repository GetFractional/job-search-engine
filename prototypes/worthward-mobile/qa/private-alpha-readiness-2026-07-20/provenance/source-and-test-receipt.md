# Source And Test Receipt

Date: 2026-07-20
Server: `http://localhost:3011/#/`
Browser: Codex in-app browser
Release boundary: local, synthetic, private prototype

## Source SHA-256

| File | SHA-256 |
|---|---|
| `app/MyWayAheadPrototype.tsx` | `eb614f7513c559edea825d886b9ba843fcf4d285d7fde46d922ff11bbecce13e` |
| `app/MyWayAheadFunnel.tsx` | `d3f6f2e8c10861879a784a33d49bc0281a3c4b62c2eebdb3f84b3f7b6813db18` |
| `app/globals.css` | `826f2f27957bd0f45619888bc7ff51bb0959e100f9ceaf0002e6382b7a5b7d79` |
| `package.json` | `407b1d0a5aa9a6bd53904f5c7af4c4eed0b457bb9ab32a8e1972bd37a26af531` |
| `package-lock.json` | `9f9a2d6fc57d2e4a5cdef6cbf7295b669166409bd83baf807eb3b15fe55f4010` |
| `tests/rendered-html.test.mjs` | `1b3ae36d1fc73f181cda9cb606db1c6ac83f3865023f63cf9d1dac1d13c351db` |

## Key Evidence SHA-256

| Evidence | SHA-256 |
|---|---|
| Selected reference | `0c1c704d347cca7917413b82119fa8f0ade41ca2f63961e5d481a57074da5206` |
| Matched comparison | `eb1d1a4d8e8637135ba2fb338da1b0b250b5027521b6935458545d4fe015822b` |
| Home 320 x 700 | `faa0cff44af8c0d3fd105aa379cb26ea11f7198fcbeea8e4d9e03fac3570518b` |
| Home 390 x 844 | `a48bf7a413350456767b0eafd3b68dc47c5d2b877649f1fbf249f753318a1802` |
| Home 768 x 900 | `351232f6e4fc07a8fbbb66506f8ba85bc3791819439825d41b653d02eeb2b80d` |
| Home 1280 x 900 | `f713b42ab5a75c26f1d3c9a199ca46c880483c719889c07663be660f5184fdba` |
| Timeline start | `ca988830cbce87fbfe445cdae75b95367c486ff4b57bf1844b864650c3f5f56c` |
| Timeline continuation | `a036e772f0c2ac7355dad65c82d4689382f477ea73bcf129fa255fbdf37adff2` |
| Arbitrary-input boundary | `7dba63f5f255b5add559b09ef0dc3470e39915f03e33789ab4287cb8a25f27ec` |
| Sample-ready boundary | `6919bd2379cc3ec84163ac89d85a1fde331db8ad09e2f177cfb1b888c712aaee` |

## Final Commands

### `npm test`

Result: PASS

- `tsc --noEmit`: PASS
- `vinext build`: PASS
- Node rendered truth, state, and regression tests: 13 passed, 0 failed
- New regression: `keeps arbitrary job inputs unreviewed while preserving sample-job checks`

### `npm run lint`

Result: PASS with no reported warning or error.

## Browser Recovery Receipt

Terminal Playwright was retried with its daemon state redirected to `/private/tmp`, which cleared the cache-permission failure. Chrome then aborted at process launch with an environment-level restriction. The safe workaround used the Codex in-app browser against a fresh server on port 3011. The workaround did not bypass login, security, CAPTCHA, production boundaries, or external systems.

## Repository Receipt

- Branch: `codex/hospitality-approved-resumes`
- HEAD: `cab77031b5ba5eb5949a91d834808c1cb728d7c9`
- `origin/main` is an ancestor of HEAD: yes
- Tracked worktree clean: no, due unrelated pre-existing user changes
- Prototype and evidence tracked in Git: no
- Commit, push, stash, merge, rebase, or branch switch performed: no

The SHA-256 values establish local file identity. They do not replace GitHub provenance.
