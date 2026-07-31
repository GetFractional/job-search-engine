# Way Ahead current-build QA receipt

Date: 2026-07-30
Candidate: v15 current source
Runtime: Worker-native Vite preview on a fresh local port after all D1 migrations
Independent final verdict: PASS; no P0 or P1 findings in the audited scope

## Acceptance result

The current candidate passed the tested public-site, onboarding, authenticated
workspace, responsive, theme, navigation, error, empty, privacy, immutable
package, and tenant-isolation checks below. It remains a private-alpha
candidate, not an authorized public launch or application-submission system.

## Visual evidence

### Public website

- `01-public-home-390-light.png`
- `02-public-menu-390-light.png`
- `03-public-home-768-light.png`
- `04-public-home-1280-light.png`
- `29-reference-vs-current-390.png`

The combined reference comparison preserves the selected reference's strongest
visual grammar: decisive editorial typography, mint trust accents, strong
information hierarchy, and a visible integrity promise. It intentionally does
not reproduce the old name, “move” language, dark-first treatment, paste-a-link
primary action, or timeline because the Board explicitly rejected those product
and messaging choices. The current design uses Way Ahead, literal job language,
light-first readability, onboarding as the primary action, and compartmentalized
cards.

### Returning-member workspace

- `05-app-home-390-light.png`
- `06-app-account-menu-390-light.png`
- `07-app-account-menu-390-dark.png`
- `08-app-home-768-light.png`
- `09-app-home-1280-light.png`
- `10-app-jobs-1280-light.png`
- `11-app-job-detail-1280-light.png`
- `12-app-pursuit-1280-light.png`
- `14-app-package-locked-1280-light.png`
- `15-resume-studio-list-1280-light.png`
- `16-cover-letter-studio-1280-light.png`
- `17-career-profile-1280-light.png`
- `18-experience-import-1280-light.png`
- `30-app-pursuit-390-light.png`
- `31-app-package-locked-390-light.png`
- `32-resume-studio-390-light.png`
- `33-job-intake-error-390-light.png`

### New-member and state coverage

- `19-new-member-onboarding-step1-390-light.png`
- `20-new-member-onboarding-step2-390-light.png`
- `21-new-member-onboarding-step3-390-light.png`
- `22-onboarding-native-month-picker-390-light.png`
- `23-new-member-onboarding-step4-390-light.png`
- `24-new-member-onboarding-step5-390-light.png`
- `25-new-member-onboarding-step6-390-light.png`
- `26-new-member-empty-home-390-light.png`
- `27-data-privacy-390-light.png`
- `28-onboarding-scroll-reset-390-light.png`

## Measured browser checks

- 390 px mobile, 768 px tablet, and 1280 px desktop all reported
  `scrollWidth === innerWidth`.
- Mobile and desktop Home each had one page-level heading, no duplicate element
  IDs, and no unlabeled interactive controls.
- The visible mobile Home and tablet Home controls had no target smaller than
  44 by 44 CSS pixels.
- Mobile account-menu Light and Dark are semantic radio controls. Escape closes
  the dialog, updates `aria-expanded` to false, and returns focus to the account
  trigger.
- Stable routes survived direct navigation for jobs, pursuits, resumes, cover
  letters, profile, privacy, and onboarding.
- Resume and Career Profile employment dates render as native `month` inputs.
- Invalid unsupported job URLs produce an in-context `role="alert"` and do not
  create a job.
- The Going package created an immutable fingerprint but showed no approval
  control because the verified employer-form receipt is unavailable. Population,
  upload, and submission stayed unavailable.

## Defect found and corrected during fresh QA

Before correction, moving from onboarding step 1 to step 2 preserved a 972 px
scroll offset, landing the member in the middle of the next screen. The flow now
resets its actual shell scroller to 0 after every step change and focuses the new
main region without re-scrolling it. Browser readback after correction:

- previous step scroll position: 972 px
- next step scroll position: 0 px
- active element: `#onboarding-main`
- visible next-step heading: “Bring in your experience”

The redundant mobile Home eyebrow and shell title were also removed. The
selected bottom-navigation destination is now the only visible “Home” label on
mobile, and desktop has no duplicate dashboard label.

## Two-member isolation readback

Synthetic second member:

- Job Paths: Quality Assurance Leadership; Product Operations
- opportunities: 0
- profile employer: Synthetic QA Co.

Matt workspace after the second-member run:

- Job Paths: Revenue / Growth Operations; Growth / Revenue Marketing;
  Lifecycle / CRM / Retention
- opportunities: 1
- opportunity employer: Going
- profile employers: Get Fractional; Prosper Wireless

Both workspaces reported billing disabled and submission disabled. The second
member saw none of Matt's Job Paths, opportunities, or employers, and Matt's
workspace retained none of the synthetic member's data.

## Automated verification

- lint: passed
- typecheck: passed
- production build: passed
- full test suite: 125 of 125 passed
- targeted onboarding and rendered-bundle checks: 16 of 16 passed
- independent targeted integrity checks: 77 of 77 passed
- independent QA lifecycle checks: 4 of 4 passed
- production dependency audit: 0 known vulnerabilities

## Remaining release boundaries

- Chromium is the browser used for current visual evidence. Safari and Firefox
  still need release smoke checks on the hosted candidate.
- No paid AI provider, email provider, billing, employer-form population,
  employer upload, outreach, or application submission is connected or
  authorized.
- The Going application cannot become exact-action approval-ready until Matt
  supplies the unresolved lifecycle, Braze, AI-use, and current-role facts
  listed in the founder application packet.
