# Way Ahead Mobile Career Decision Prototype

`Way Ahead` is a provisional, uncleared name. This responsive private-alpha prototype begins with the public website and first-user activation journey, then continues through a Job Standard, comparative Career Paths, a path-based search plan, clearly labeled sample jobs, a Pursuit queue, grounded materials, exact synthetic approval, and transparent commercial simulation.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown by the development server. The prototype uses hash routes, so refreshing any screen remains safe.

For a detached laptop-only QA service that survives a Codex turn, use:

```bash
npm run qa:laptop
```

See [QA access](QA_ACCESS.md) before trying to open the prototype from another device. A `localhost` link is device-local and is not a phone-accessible URL.

## Verify

```bash
npm test
npm run lint
```

`npm test` runs the TypeScript quality gate, production build, and the complete truth, state, schema, economics, and regression suite. `npm run lint` is a separate required gate. See `design-qa.md` and `qa/way-ahead-v3-private-alpha-2026-07-21/` for the current count and exact-build receipts.

The prototype performs no live model calls, does not access job boards or competitor products, does not upload candidate files, does not persist a password, does not collect payment information, and cannot send or submit anything externally. Every real-job-derived fixture is presented behind a persistent private-alpha sample boundary rather than as a live market or personalized claim. `Cedarfield` and its `.invalid` application URL are deliberately synthetic.

Theme, onboarding choices, Job Standard, job-watch preferences, user decisions, corrections, and proof-review drafts persist only in the browser. Temporary QA scenarios are query-driven and are not stored. Settings provides a full local reset. A pending correction makes dependent evidence, assessment, recommendation, placement, and preparation visibly stale until re-adjudication.

See the [prototype brief and acceptance contract](../../docs/career-platform/mobile-prototype-brief-and-acceptance-contract-2026-07-17.md) for routes, fixtures, evidence boundaries, QA results, and open production gates. The [design QA record](design-qa.md) documents the side-by-side visual review and deliberate departures from the selected concept.
