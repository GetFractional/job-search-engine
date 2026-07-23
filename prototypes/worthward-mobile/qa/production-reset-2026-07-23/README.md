# Way Ahead Public-Product Reset Audit

**Captured:** 2026-07-23  
**Surface:** current authenticated Sites deployment  
**Viewport evidence:** default desktop and 390 x 844 mobile  
**Verdict:** Failed founder product checkpoint. The deployment proves account persistence and a responsive visual shell, but it does not provide a coherent first-user journey or the core product work Matt needs to perform.

## Numbered flow

| Step | What the current user sees | Health | Evidence |
|---:|---|---|---|
| 1 | A ChatGPT account chooser appears before any public Way Ahead explanation | Failed | [01-auth-wall.png](01-auth-wall.png) |
| 2 | After sign-in, the user lands directly on a Seso-specific Today screen | Failed | [02-direct-to-dashboard-desktop.png](02-direct-to-dashboard-desktop.png), [03-direct-to-dashboard-mobile.png](03-direct-to-dashboard-mobile.png) |
| 3 | Jobs contains a direct Greenhouse URL field and one Seso record, with no discovery feed or career-path segmentation | Failed | [04-jobs-mobile.png](04-jobs-mobile.png) |
| 4 | Profile reports zero confirmed facts and zero roles but offers no upload, import, manual-entry, correction, or onboarding action | Critical failure | [05-profile-no-onboarding.png](05-profile-no-onboarding.png) |
| 5 | Account opens and theme controls work, but the menu contains only appearance and sign-out | Partial | [06-account-menu-mobile.png](06-account-menu-mobile.png) |
| 6 | Pursuit reports zero assets and a locked package without résumé or cover-letter creation and editing | Critical failure | [07-pursuit-no-editors.png](07-pursuit-no-editors.png) |
| 7 | Direction reports no stored Job Standard and no career paths, but provides no creation controls | Critical failure | [08-direction-no-setup.png](08-direction-no-setup.png) |

## Highest-impact findings

1. **The entry contract is reversed.** Way Ahead asks for identity before explaining the problem, outcome, privacy posture, or value. A public homepage must precede authentication.
2. **The product assumes a finished founder record.** A new account is dropped into a preselected job workflow even when the career record, Job Standard, career paths, and assets are empty.
3. **Empty states are dead ends.** Profile and Direction accurately report missing data but provide no next action. Each empty state must begin or resume the appropriate onboarding step.
4. **Today is a single-job billboard, not a decision dashboard.** It needs setup progress, ranked jobs by career path, urgent actions, freshness, evidence gaps, pursuit progress, digest status, and a clear next-best action.
5. **Job monitoring is not multi-path.** The current Jobs surface has no path tabs, saved views, filters, ranked queues, source coverage, or notification preferences.
6. **The value-delivery tools are absent.** A user cannot create, generate, compare, edit, assign, preview, or approve a résumé or cover letter.
7. **Navigation is incomplete.** The bottom bar changes the five current views in Chrome, but it hides onboarding, documents, monitoring preferences, settings, help, privacy, export, and deletion. Its functionality cannot compensate for an incomplete information architecture.
8. **Founder data creates a false first-user state.** The authenticated home speaks as though Seso is already the user's strongest pursuit even though the same account shows zero profile facts and no Job Standard.
9. **The copy overstates certainty.** Phrases such as “strongest current pursuit” and “the evidence is ready” conflict with Open scores and empty profile data.

## Accessibility risks visible from the capture

- The fixed mobile navigation obscures lower-page content without an obvious end-of-content buffer in several full-page captures.
- Small all-caps labels and secondary text may fall below comfortable mobile reading sizes even when contrast passes.
- The visual account control is icon-led on mobile and does not communicate that broader settings should live there.
- Screen-reader names and keyboard behavior were present for the tested controls, but this audit does not establish VoiceOver, TalkBack, zoom, reflow, reduced motion, touch-target, or cross-browser compliance.

## Corrected journey contract

```text
public promise and proof
  -> self-serve sign-in or account creation
  -> privacy and data-control explanation
  -> résumé upload, LinkedIn import, voice, or manual career entry
  -> AI extraction with user confirmation
  -> Job Standard
  -> one or more career paths and path-specific evidence
  -> first ranked jobs by career path
  -> Today scoreboard
  -> job decision
  -> AI-first résumé and cover-letter studios
  -> exact package approval
  -> external action remains separately gated
```

## Evidence limits

- The audit used the authenticated Chrome session and current hosted deployment. It did not inspect Terry's account because open multi-user signup and tenant isolation are not yet implemented.
- The captured mobile controls changed screens in Chrome. Matt's report that the menu failed on his phone remains controlling user evidence until the physical-device flow is retested.
- Screenshots support visual and journey findings; they do not prove native assistive-technology, security, privacy, or data-isolation quality.
