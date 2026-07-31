# Founder Feedback Reset Evidence

**Capture date:** 2026-07-21
**Source:** exact current local build served at `http://localhost:3011/#/`
**Browser:** Codex in-app browser
**Status:** Founder-feedback audit and P0 correction evidence; not a new private-alpha release verdict

## Audit walkthrough

| File | State | Material finding |
|---|---|---|
| `01-mobile-current-landing.png` | Mobile public home | Paste-a-job hierarchy is emotionally weak and strategically secondary to the intended product |
| `02-mobile-current-intent-choice.png` | Mobile need selection | Full-row selection is the strongest existing focus pattern and should replace the timeline interaction |
| `03-mobile-current-job-standard.png` | Premature route | Account gate interrupts value before a clear plan is visible |
| `04-mobile-current-profile-start.png` | Profile intake | Current import is a synthetic resume selector, not a real resume, LinkedIn, manual, or voice intake |
| `05-mobile-current-job-standard.png` | Job standard | Screen needs live verification summary and clearer use of every field |
| `06-mobile-current-career-paths.png` | Career paths | Purpose is unclear and the visible path set is artificially narrow |
| `07-mobile-current-plan.png` | Plan | Plan hierarchy is useful, but its call to action starts a duplicate confirmation |
| `08-mobile-current-plan-after-use.png` | Second plan click | Reproduces the unnecessary second action |
| `09-mobile-current-post-plan.png` | Post-plan destination | Routing to a single saved opportunity is confusing after selecting multiple career paths |
| `10-mobile-current-settings.png` | Settings before correction | Internal prototype controls, a duplicate selected-theme mark, and unstable shell are visible |
| `11-mobile-current-menu.png` | Mobile menu | Navigation lacks the complete logged-in information architecture and visual focus expected from the product |
| `12-tablet-current-home.png` | Tablet public home | Layout scales, but the promise and hierarchy remain wrong |
| `13-desktop-current-home.png` | Desktop public home | Layout scales, but desktop density and product promise remain unresolved |
| `14-mobile-corrected-settings.png` | Settings after P0 correction | Internal scenario controls and duplicate selected-theme mark are gone |
| `15-mobile-corrected-job-standard.png` | Job-standard top | Current page title and step label are visible in the exact current bundle |
| `16-mobile-corrected-commute-miles.png` | Work preference section | Field is now labeled maximum commute distance; schedule is explicitly optional |
| `17-mobile-corrected-commute-options.png` | Commute field focused | Focus is visible. DOM inspection confirms values: Not applicable, 5 miles, 10 miles, 25 miles, 50 miles, Flexible |
| `18-mobile-corrected-plan-action.png` | Corrected plan action | One primary action says `See jobs for this plan`; the duplicate confirmation is gone |
| `19-mobile-corrected-direct-jobs.png` | Direct post-plan destination | The single plan action lands directly on `#/jobs/opportunities` |
| `20-visual-direction-1-warm-editorial-guide.png` | Founder option 1 | Emotional editorial homepage direction with one dominant action and a unified outcome section |
| `21-visual-direction-2-focused-career-workspace.png` | Founder option 2 | Minimum-click homepage direction with full-row need selection and a visibly focused active choice |
| `22-visual-direction-3-career-portfolio-reveal.png` | Founder option 3 | Path-first homepage direction that reveals several credible futures in one grouped surface |
| `23-mobile-fresh-current-build-light.png` | Fresh mobile Light exact-build recheck | Current homepage hierarchy remains the rejected job-checker-first experience |
| `24-mobile-fresh-menu-focus.png` | Superseded mobile menu interaction | Retained for history only; screenshot 34 is the controlling keyboard, overflow, target-size, Escape, and focus-restoration proof |
| `25-mobile-fresh-dark-theme-state.png` | Fresh mobile Dark state | Dark selection renders and announces its state without the duplicate checkmark |
| `26-mobile-fresh-system-theme-state.png` | Fresh mobile System state | System selection renders and announces its state |
| `27-tablet-fresh-current-build-system.png` | Fresh tablet System exact-build recheck | Responsive rendering works; promise and shell remain unaccepted |
| `28-desktop-fresh-current-build-system.png` | Fresh desktop System exact-build recheck | Responsive rendering works; desktop hierarchy remains unaccepted |
| `29-mobile-320-fresh-current-build-system.png` | Fresh 320-pixel System recheck | No horizontal overflow was observed; broad promise remains rejected |
| `30-desktop-1280-fresh-current-build-system.png` | Fresh 1280-pixel System recheck | Required desktop breakpoint renders; hierarchy remains rejected |
| `31-mobile-system-dark-reduced-motion.png` | System-to-Dark runtime state | System resolved to Dark and reduced-motion preference was active |
| `32-mobile-skip-link-focus.png` | Skip-link keyboard state | Focus ring is visible; Enter moves focus to `MAIN#main-content` |
| `33-mobile-corrected-validation-recovery.png` | Corrected validation recovery banner | Customer language preserves trusted results and directs the user to what still needs verification |
| `34-mobile-keyboard-menu-focus.png` | Keyboard-opened mobile menu | Enter opens, Escape closes, focus returns to the trigger, width remains contained, and visible targets are at least 44 pixels high |
| `35-mobile-state-loading.png` | Loading fixture | Last trusted work remains available while the new check runs |
| `36-mobile-state-partial.png` | Partial fixture | Missing details are explicit and no new score is implied |
| `37-mobile-state-no-action.png` | Empty/no-action fixture | The product does not promote a weak job merely to fill the list |
| `38-mobile-state-offline.png` | Offline fixture | Cached evidence and pending local decisions are distinguished from external approval |
| `39-mobile-state-source-error.png` | Source-error fixture | Last trusted results remain unchanged after a failed refresh |
| `40-mobile-state-capacity.png` | Qualified-capacity fixture | Work waits instead of silently accepting lower-quality analysis |
| `41-mobile-state-budget.png` | Budget fixture | Work waits without hidden model cost or silent integrity downgrade |
| `42-mobile-state-source-conflict.png` | Source-conflict fixture | Conflicting facts hold the recommendation rather than guessing |
| `43-mobile-state-validation.png` | Validation fixture | Failed quality checks preserve the trusted result and offer a safe return path |
| `44-mobile-state-unapproved.png` | Synthetic application state | No external action is approved |
| `45-mobile-state-exact-approval-review.png` | Exact approval dialog | Payload, destination, permitted action, and exclusions are visible before a local simulation |
| `46-mobile-state-approved-not-handed-off.png` | Approved-not-handed-off fixture | Approval and handoff remain separate states |
| `47-mobile-state-revoked-after-package-change.png` | Revocation fixture | A changed payload revokes prior approval |
| `48-reference-vs-rejected-current-390x844.png` | Matched reference diagnostic | Selected reference and rejected current build are shown at the same mobile aspect ratio; this is not release acceptance |
| `49-final-source-system-dark-320.png` through `53-final-source-system-dark-1440.png` | Final-source responsive rebinding | Exact final source at 320, 390, 768, 1280, and 1440 with System resolving Dark and reduced motion active |
| `54-final-source-light-390.png` | Final-source Light | Exact final source in explicit Light |
| `55-final-source-dark-settings-390.png` | Final-source Dark Settings | Exact final source in explicit Dark |
| `56-final-source-system-dark-settings-390.png` | Final-source System Settings | Exact final source with System resolving Dark |
| `57-final-source-validation-390.png` | Final-source validation recovery | Corrected customer-language state on exact final source |
| `58-final-source-keyboard-menu-390.png` | Final-source keyboard menu | Enter open, Escape close, focus restoration, width containment, and 44-pixel target proof |
| `59-final-source-skip-link-focus-390.png` | Final-source skip link | Settled visible focus at 8 pixels and Enter-to-main transfer |

The three visual directions are decision artifacts, not implemented-build evidence. They establish the founder gate for the next local synthetic rebuild and must not be counted as responsive, theme, interaction, state, accessibility, or release proof.

## Attached founder screenshot diagnosis

Matt's screenshot showed `New analysis failed validation` above a trusted Going recommendation. Source and runtime inspection confirmed that this was a persisted QA scenario exposed through Settings, not a new live employer-analysis failure.

The fixture now:

- can be invoked only with a temporary `qaScenario` query for intentional QA;
- is not persisted in local storage;
- is not selectable from customer Settings;
- is cleared by reset;
- cannot change the normal customer route.

The validation and source-refresh copy now uses customer language, preserves the last trusted result, and directs the user to inspect what still needs verification. The broader error and recovery design remains part of the Board-selected rebuild.

## P0 source corrections

- Removed customer-visible repository and local-file paths.
- Added a production client-bundle private-path leakage test.
- Removed internal Settings scenario controls.
- Removed the duplicate selected-theme checkmark.
- Changed commute from minutes to miles.
- Changed schedule to an optional, purpose-specific requirement.
- Replaced the two-click plan transition with one direct jobs action.
- Changed unknown hash-route fallback from an unrelated opportunity to Home.

## Verification receipt

Commands run from `prototypes/worthward-mobile`:

- `npm test`: PASS
  - TypeScript: PASS
  - Production build: PASS
  - Rendered truth/state/leakage/regression tests: 16 of 16 PASS
  - Schema, tenant, provenance, rollback, populated-upgrade, deletion, assignment, Board-reference/effective-time, stream-isolation, aggregate-reconciliation, post-reference immutability, processor-deduplication, and exact allocation-reconciliation tests: 19 of 19 PASS
  - QA-service exact-build, lifecycle-lock, guard-identity, and access-boundary tests: 4 of 4 PASS
  - Total: 39 of 39 PASS
- `npm run lint`: PASS
- `npm run db:generate`: PASS, 30 tables and no pending schema delta
- shell syntax: PASS for the preview, service, and Remote guard scripts
- detached Remote QA status: healthy on loopback-only `127.0.0.1:3011`; no LAN listener on port 3013
- managed Remote QA: forced current build, clean stop/restart, serialized lifecycle, exact preview-bound keep-awake guard, and independent host-side PASS
- browser DOM: commute values are in miles; unknown route returns Home
- browser route: `See jobs for this plan` goes directly to `#/jobs/opportunities`
- evidence provenance: [capture manifest](capture-manifest.md) binds the fresh screenshots to source hashes, routes, viewports, theme resolution, browser, and artifact hashes
- axe-core 4.11.4: 0 violations and 0 incomplete checks on Home, Settings, validation, loading, and application-review routes after the redundant prohibited ARIA attribute was removed; see the [accessibility runtime receipt](accessibility-runtime-receipt.md)

## Current verdict

P0 trust and flow hardening: **PASS for the corrected slice**.

Local synthetic product schema and migration contract: **maker and independent implementation PASS**. It preserves extraction policy, source lineage, user-controlled merge decisions, same-tenant relationships, deterministic job-to-path-to-default resume resolution, one current Job Standard, one active primary Career Path, transactional rollback, and deliberate soft-delete or restricted-delete behavior. The additive economics slice covers versioned offers, same-tenant charges and costs, prepaid revenue reconciliation, exact shared-cost allocation-group reconciliation, deterministic remainder assignment, one-current-version supersession, affiliate events, and cohort maturity. Independent review passed 27 adversarial scenarios; pricing, billing, production, authentic Board approval, and real-economics validation remain blocked.

Mac host-side ChatGPT Remote readiness: **PASS after independent review**. A physical iPhone-to-host connection remains Matt's end-to-end readback. Native iPhone Safari remains separate and unpassed.

Broad experience: **NOT ACCEPTED**. The founder rejected the current emotional promise, job-checker-first hierarchy, timeline, navigation shell, onboarding clarity, repeated labels, and commercial assumptions. The July 20 independent release verdict is stale for the changed source.

Exactly three grounded visual directions must be selected or refined before broad UI implementation. A new independent verdict is required after that implementation and its complete responsive, theme, interaction, state, accessibility, physical-iPhone, and matched-reference evidence.

See the [independent verdict](independent-verdict.md) for the scoped pass and the remaining release block.
