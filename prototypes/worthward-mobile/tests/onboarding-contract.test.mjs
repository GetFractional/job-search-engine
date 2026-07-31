import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const publicPage = read("app/page.tsx");
const publicSite = read("app/PublicSite.tsx");
const publicNavigation = read("app/PublicNavigation.tsx");
const productPage = read("app/app/page.tsx");
const productRoute = read("app/app/ProductRoutePage.tsx");
const onboardingPage = read("app/app/onboarding/page.tsx");
const experiencePage = read("app/app/onboarding/experience/page.tsx");
const onboarding = read("app/OnboardingFlow.tsx");
const onboardingCss = read("app/onboarding.module.css");
const resumeImport = read("app/resume-import.ts");
const onboardingApi = read("app/api/onboarding/route.ts");
const repository = read("app/workspace-repository.ts");
const today = read("app/today-repository.ts");
const auth = read("app/server-auth.ts");

test("keeps the website public and protects only product routes", () => {
  assert.match(publicPage, /getChatGPTUser/);
  assert.doesNotMatch(publicPage, /requireUserPage|requireFounderPage/);
  assert.match(publicSite, /Stop wasting your best effort/);
  assert.match(publicNavigation, /aria-expanded=\{menuOpen\}/);
  assert.match(publicNavigation, /id="public-mobile-menu"/);
  assert.match(productPage, /redirect\("\/app\/home"\)/);
  assert.match(productRoute, /requireUserPage\(returnPath\)/);
  assert.match(productRoute, /redirect\(`\/app\/onboarding\?step=/);
  assert.match(productRoute, /deletedAccountNeedsRestart/);
  assert.match(onboardingPage, /requireUserPage\("\/app\/onboarding"\)/);
  assert.match(onboardingPage, /deletedAccountNeedsRestart/);
  assert.match(onboardingPage, /if \(state\.complete\) redirect\("\/app\/home"\)/);
  assert.match(
    experiencePage,
    /requireUserPage\("\/app\/onboarding\/experience"\)/,
  );
  assert.match(experiencePage, /editMode="experience"/);
});

test("creates self-service members without an email allowlist or automatic owner promotion", () => {
  assert.match(auth, /export function requireUserRequest/);
  assert.match(auth, /export \{ FounderAccessError as UserAccessError \}/);
  assert.doesNotMatch(auth, /not shared with this account/);
  assert.match(repository, /export async function ensureUser/);
  assert.match(
    repository,
    /configuredOwnerEmail\(\) === email \? "owner" : "member"/,
  );
  assert.match(repository, /lifecycleState = "onboarding"/);
  assert.match(repository, /if \(user\.role !== "owner"\)/);
  assert.doesNotMatch(
    repository,
    /UPDATE users SET[^"]*role = 'owner'/,
  );
});

test("persists a resumable six-step setup with user-scoped records", () => {
  assert.match(
    onboarding,
    /`Step \$\{state\.currentStep\} of \$\{ONBOARDING_STEPS\.length\}`/,
  );
  for (const title of [
    "What should your next job change?",
    "Bring in your experience",
    "Make your profile accurate",
    "What would make the next job worth it?",
    "Choose the paths worth exploring",
    "Your search has a direction now.",
  ]) {
    assert.match(onboarding, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(repository, /event_type = 'onboarding_step_completed'/);
  assert.match(repository, /WHERE user_id = \?/);
  assert.match(repository, /lifecycle_state = 'alpha_active'/);
  assert.match(repository, /const minimumComplete =/);
  assert.match(
    repository,
    /completedStepsValue\.includes\(6\) && minimumComplete/,
  );
  assert.doesNotMatch(
    repository,
    /user\.lifecycle_state === "alpha_active" \|\| completedStepsValue\.includes\(6\)/,
  );
  assert.match(repository, /automaticExtraction:\s*false/);
  assert.match(repository, /automaticScoring:\s*false/);
  assert.match(repository, /isActivationReadyExperience\(role\)/);
  assert.match(
    onboarding,
    /Imported source text · not confirmed career facts/,
  );
  assert.match(onboarding, /Save structured role/);
  assert.match(
    onboarding,
    /I confirm this one structured role as accurate career evidence/,
  );
  assert.match(onboarding, /required=\{!role\.isCurrent\}/);
  assert.match(onboardingApi, /requireUserRequest/);
  assert.match(onboardingApi, /requireSameOrigin/);
  assert.match(onboardingApi, /readBoundedJson\(request, 100_000\)/);
  assert.match(onboardingApi, /noticeAccepted/);
  assert.match(onboardingApi, /processingAccepted/);
  assert.match(onboarding, /Alpha Data Notice/);
  assert.match(onboarding, /Data &amp; privacy/);
});

test("qualifies discovery and monitoring copy until automated job supply exists", () => {
  assert.match(publicSite, /current employer jobs you add/i);
  assert.match(publicSite, /Build my job-search workspace/);
  assert.doesNotMatch(
    publicSite,
    /finds current jobs|automatically finds|automatically monitors/i,
  );
  assert.doesNotMatch(onboarding, /directions you want to monitor/i);
  assert.doesNotMatch(
    today,
    /active paths continue to be checked/i,
  );
});

test("parses bounded resume files locally and saves only reviewable extracted text", () => {
  assert.match(resumeImport, /export async function parseResumeFile/);
  assert.match(
    resumeImport,
    /MAX_RESUME_FILE_BYTES = 5 \* 1024 \* 1024/,
  );
  assert.match(resumeImport, /MAX_PDF_PAGES = 12/);
  assert.match(resumeImport, /pdfjs-dist/);
  assert.match(resumeImport, /mammoth/);
  assert.match(resumeImport, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(onboarding, /accept="\.pdf,\.docx,\.txt/);
  assert.match(onboarding, /read in your browser/);
  assert.match(onboarding, /raw PDF or DOCX is not uploaded/);
  assert.match(onboarding, /only the extracted text you review is saved/);
  assert.match(onboardingApi, /clientFileChecksumSha256/);
  assert.match(onboardingApi, /extractedText/);
  assert.doesNotMatch(
    `${onboarding}\n${onboardingApi}`,
    /upload complete|AI analyzed|automatically understood/i,
  );
});

test("keeps authenticated setup navigation stable on mobile", () => {
  assert.match(onboarding, /aria-label="Account navigation"/);
  assert.match(onboarding, /href="\/"/);
  assert.match(onboarding, /href="\/app\/onboarding"/);
  assert.match(onboarding, /signOutHref/);
  assert.match(onboarding, /aria-current="page"/);
  assert.match(
    onboarding,
    /shellRef\.current\?\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/,
  );
  assert.match(onboarding, /\.focus\(\{ preventScroll: true \}\)/);
  assert.match(onboardingCss, /grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(onboardingCss, /min-width:\s*510px/);
});
