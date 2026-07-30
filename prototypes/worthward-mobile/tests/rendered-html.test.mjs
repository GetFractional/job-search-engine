import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

async function productionBundleText() {
  const roots = [new URL("../dist/client/", import.meta.url), new URL("../dist/server/", import.meta.url)];
  const files = [];
  async function walk(url) {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      const next = new URL(entry.name, url);
      if (entry.isDirectory()) await walk(new URL(`${entry.name}/`, url));
      if (entry.isFile() && /\.(?:js|css|html)$/.test(entry.name)) files.push(next);
    }
  }
  for (const root of roots) await walk(root);
  return (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
}

test("compiles the public website and account-level sign-in boundary", async () => {
  const [bundle, page, appPage, productRoute, auth, layout] = await Promise.all([
    productionBundleText(),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/app/ProductRoutePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/server-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /getChatGPTUser/);
  assert.doesNotMatch(page, /requireFounderPage|redirect\(/);
  assert.match(appPage, /redirect\("\/app\/home"\)/);
  assert.match(productRoute, /requireUserPage\(returnPath\)/);
  assert.match(productRoute, /readOnboardingState/);
  assert.match(auth, /redirect\(chatGPTSignInPath\(returnTo\)\)/);
  assert.match(auth, /export function requireUserRequest/);
  assert.doesNotMatch(auth, /not shared with this account/);
  assert.match(layout, /Way Ahead \| Your next job, pursued with evidence/);
  assert.match(bundle, /Loading the evidence behind your next job/);
  assert.match(bundle, /Stop wasting your best effort on jobs that are not worth it/);
  assert.match(bundle, /add current employer jobs/);
  assert.doesNotMatch(bundle, /finds current jobs worth pursuing/);
  assert.doesNotMatch(bundle, /Your next move|better move|real move value/);
  assert.doesNotMatch(bundle, /Worthward|Cedarfield|Tebra|THNKS|Lumeris|Babylist|TextNow|Finite State/i);
});

test("keeps legacy placeholder content out of the production bundle", async () => {
  const bundle = await productionBundleText();
  for (const forbidden of [
    /\bCedarfield\b/i,
    /sample:going/i,
    /qaScenario/i,
    /\.invalid\b/i,
    /Synthetic classifier control/i,
    /Use private-alpha example/i,
    /reset demo data/i,
    /Preview synthetic resume/i,
    /\bTealHQ?\b/i,
  ]) {
    assert.doesNotMatch(bundle, forbidden);
  }
});

test("allows founder recovery only when every decision and pursuit surface is empty", async () => {
  const repository = await readFile(
    new URL("../app/workspace-repository.ts", import.meta.url),
    "utf8",
  );

  assert.match(repository, /active_count/);
  assert.match(repository, /preserved_profile_fact_count/);
  assert.match(repository, /preservedProfileFacts/);
  assert.match(repository, /matching_partial_workspace_repair/);
  assert.match(repository, /profile_surface_repair/);
  assert.match(repository, /payloadAnalysisIds\.has\(row\.id\)/);
  assert.match(repository, /payloadPursuitIds\.has\(row\.id\)/);
  assert.match(repository, /active_count \?\? 0\) === existingMatchingRecordCount/);
  assert.match(repository, /profile_surface_repair" \? \[\] : payload\.opportunities/);
  assert.match(repository, /job_standards WHERE user_id = \? AND is_current = 1/);
  assert.match(repository, /career_paths WHERE user_id = \? AND state = 'active'/);
  assert.match(repository, /hasPriorWorkspaceState && \(existingWorkspace\?\.active_count \?\? 0\) === 0/);
  assert.match(repository, /founder_workspace_repaired/);
  assert.match(repository, /empty_workspace_repair/);
  assert.match(repository, /founder workspace is already initialized/i);
});

test("keeps founder files and local machine paths out of the production bundle", async () => {
  const bundle = await productionBundleText();
  for (const forbidden of [
    /\/founder-assets\//,
    /\/Users\/mattdimock\//,
    /\/private\/tmp\/way-ahead/i,
    /Documents\/Jobs\/Job Search/i,
    /file:\/\/\/Users\//i,
  ]) {
    assert.doesNotMatch(bundle, forbidden);
  }
});

test("keeps the production UI data-backed, responsive, and approval-bound", async () => {
  const [page, app, publicSite, repository, auth, apiUtils, css, globals, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WayAheadApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PublicSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/workspace-repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/server-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api-utils.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/production.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getChatGPTUser/);
  assert.match(auth, /oai-authenticated-user-email/);
  assert.match(repository, /WAY_AHEAD_OWNER_EMAIL/);
  assert.match(repository, /role:\s*UserRow\["role"\]\s*=\s*configuredOwnerEmail\(\) === email \? "owner" : "member"/);
  assert.match(repository, /WHERE user_id = \?/);
  assert.match(repository, /validation_state = 'invalidated'/);
  assert.match(app, /function currentTrustedAnalysis/);
  assert.match(app, /analysis\?\.validationState === "trusted"/);
  assert.match(app, /boundVersionId === currentVersionId/);
  assert.match(app, /const visibleAnalysis = currentTrustedAnalysis\(job\)/);
  assert.match(app, /Recheck this job/);
  assert.match(app, /analysis is preserved as history/i);
  assert.match(app, /Recheck needed/);
  assert.match(repository, /readiness_state = 'superseded'/);
  assert.match(repository, /Greenhouse public Job Board GET API/);
  assert.match(repository, /founder workspace is already initialized/i);
  assert.match(repository, /ON CONFLICT\(id\) DO NOTHING/);
  assert.match(repository, /WHERE profile_facts\.user_id = excluded\.user_id/);
  assert.match(apiUtils, /origin !== target\.origin/);
  assert.match(apiUtils, /maximumBytes/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": null/);
  assert.match(publicSite, /Nothing sent without[\s\S]*your approval/);
  assert.match(app, /Way Ahead has no employer-form population, upload, outreach, or submission capability/);
  assert.match(app, /Maximum commute \(miles\)/);
  assert.match(app, /type ThemeChoice = "light" \| "dark"/);
  assert.doesNotMatch(app, /label: "System"/);
  assert.match(app, /Data &amp; privacy/);
  assert.match(app, /role="radiogroup"/);
  assert.match(app, /aria-current/);
  assert.match(css, /height:\s*100dvh/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(globals, /\.prototype-|\.screen\b|\.sample-/);
  assert.doesNotMatch(app, /\b(?:sample|demo|fixture|synthetic)\b|\bprototype\b(?!\.)/i);
});

test("makes package approval visibly exact and separate from submission", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("../app/WayAheadApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/production.css", import.meta.url), "utf8"),
  ]);

  assert.match(app, /Employer source receipt/);
  assert.match(app, /Exact employer-form answers/);
  assert.match(app, /Employer form-version receipt/);
  assert.match(app, /Exact outbound files/);
  assert.match(app, /Content hash/);
  assert.match(app, /File hash/);
  assert.match(app, /Package-bound version/);
  assert.match(app, /Current source version/);
  assert.match(app, /Recorded fit and freshness risks/);
  assert.match(app, /requiredFormAnswerGaps/);
  assert.match(app, /SHA256_PATTERN/);
  assert.match(app, /packageRecord\.jobPostingVersionId === sourceVersion\.id/);
  assert.match(app, /approve_application_package/);
  assert.match(app, /Approve exact package for form staging/);
  assert.match(app, /This is not submission authorization/);
  assert.match(app, /application history and included career evidence shown here are accurate/);
  assert.doesNotMatch(app, /Matt|Zaytinya|Owner analysis receipt/);
  assert.match(app, /packageRecord\.approvalState === "approved"/);
  assert.match(app, /key=\{`\$\{pursuedJob\?\.id[\s\S]*pursuedJob\?\.pursuit\?\.package\?\.payloadSha256/);
  assert.doesNotMatch(app, /\/founder-assets\//);
  assert.match(app, /Re-render it from Studio/);
  assert.doesNotMatch(app, /confirmation: "submit_application"/);
  assert.match(css, /\.wa-package-review-block/);
  assert.match(css, /\.wa-hash-code/);
});

test("derives package fingerprints server-side and versions employer content with its exact form", async () => {
  const repository = await readFile(new URL("../app/workspace-repository.ts", import.meta.url), "utf8");

  assert.match(repository, /export function canonicalJson/);
  assert.match(repository, /sha256Hex\(canonicalJson\(asset\.content\)\)/);
  assert.match(repository, /normalizedOpportunities = await Promise\.all\([\s\S]*opportunitiesForImport\.map\(normalizeBootstrapOpportunity\)/);
  assert.match(repository, /payloadSha256 = await sha256Hex\(canonicalJson\(packageCore\)\)/);
  assert.match(repository, /\?content=true/);
  assert.match(repository, /\?questions=true/);
  assert.match(repository, /job\.updated_at !== questionJob\.updated_at/);
  assert.match(repository, /ON CONFLICT\(job_posting_id, description_checksum\) DO NOTHING/);
  assert.doesNotMatch(repository, /ON CONFLICT\(job_posting_id, description_checksum\) DO UPDATE/);
});

test("keeps mobile trust, account focus, and form feedback behavior explicit", async () => {
  const [app, today, todayRepository, css] = await Promise.all([
    readFile(new URL("../app/WayAheadApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TodayDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/today-repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/production.css", import.meta.url), "utf8"),
  ]);

  assert.match(app, /if \(!accountRootRef\.current\?\.contains\(event\.target as Node\)\) setSettingsOpen\(false\)/);
  assert.match(app, /event\.key === "Escape"[\s\S]*closeAndRestoreFocus\(\)/);
  assert.match(app, /hasLoadedWorkspaceRef/);
  assert.match(app, /if \(isInitialLoad\) setLoading\(true\)/);
  assert.match(app, /if \(main\) main\.scrollTop = 0/);
  assert.match(app, /wa-pursuit-switcher/);
  assert.match(app, /standardMessage/);
  assert.match(app, /pathMessage/);
  assert.match(app, /id="job-standard-feedback"/);
  assert.match(app, /id="career-path-feedback"/);
  assert.match(today, /data-state=\{job\.sourceStatus\}/);
  assert.match(todayRepository, /row\.capture_state === "conflict"\) return "Conflict"/);
  assert.match(css, /\.wa-today-page \.wa-hero-brief \.wa-hero-privacy[\s\S]*order:\s*-1/);
  assert.match(css, /padding:\s*88px 16px 132px/);
});

test("exposes no application-submission endpoint", async () => {
  const apiRoot = new URL("../app/api/", import.meta.url);
  const paths = [];
  async function walk(url, prefix = "") {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      if (entry.isDirectory()) await walk(new URL(`${entry.name}/`, url), `${prefix}/${entry.name}`);
      if (entry.isFile()) paths.push(`${prefix}/${entry.name}`);
    }
  }
  await walk(apiRoot);
  assert.ok(paths.includes("/workspace/route.ts"));
  assert.ok(paths.includes("/jobs/intake/route.ts"));
  assert.ok(paths.includes("/jobs/greenhouse/route.ts"));
  assert.ok(paths.includes("/operator-analysis/route.ts"));
  assert.ok(paths.includes("/owner-bootstrap/route.ts"));
  assert.equal(paths.some((path) => /submit|apply|outreach|message/i.test(path)), false);
});

test("hardens every worker response and exposes no image transformation surface", async () => {
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(worker, /Content-Security-Policy/);
  assert.match(worker, /Strict-Transport-Security/);
  assert.match(worker, /X-Content-Type-Options/);
  assert.match(worker, /Permissions-Policy/);
  assert.match(worker, /private, no-store/);
  assert.match(
    worker,
    /await ensureRuntimeIntegrityTriggers\(env\.DB\);[\s\S]*handler\.fetch/,
    "the request handler must wait for all database integrity guards",
  );
  assert.match(worker, /storage integrity is not ready yet[\s\S]*status: 503/);
  assert.doesNotMatch(worker, /handleImageOptimization|IMAGES|_vinext\/image/);
});
