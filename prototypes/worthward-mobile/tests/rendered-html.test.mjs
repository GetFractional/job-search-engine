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

test("compiles the owner-only production shell and sign-in boundary", async () => {
  const [bundle, page, auth, layout] = await Promise.all([
    productionBundleText(),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/server-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /requireFounderPage\("\/"\)/);
  assert.match(auth, /redirect\(chatGPTSignInPath\(returnTo\)\)/);
  assert.match(auth, /This founder environment is not shared with this account/);
  assert.match(layout, /Way Ahead \| Your next job, pursued with evidence/);
  assert.match(bundle, /Loading the evidence behind your next move/);
  assert.match(bundle, /Primary navigation/);
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

test("keeps the production UI data-backed, responsive, and approval-bound", async () => {
  const [page, app, repository, auth, apiUtils, css, globals, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WayAheadApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/workspace-repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/server-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api-utils.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/production.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /requireFounderPage/);
  assert.match(auth, /oai-authenticated-user-email/);
  assert.match(auth, /WAY_AHEAD_OWNER_EMAIL/);
  assert.match(repository, /WHERE user_id = \?/);
  assert.match(repository, /validation_state = 'invalidated'/);
  assert.match(repository, /readiness_state = 'superseded'/);
  assert.match(repository, /Greenhouse public Job Board GET API/);
  assert.match(repository, /founder workspace is already initialized/i);
  assert.match(repository, /ON CONFLICT\(id\) DO NOTHING/);
  assert.match(repository, /WHERE profile_facts\.user_id = excluded\.user_id/);
  assert.match(apiUtils, /origin !== target\.origin/);
  assert.match(apiUtils, /maximumBytes/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": null/);
  assert.match(app, /Nothing is submitted, messaged, billed, or shared/);
  assert.match(app, /Way Ahead has no employer-form population, upload, outreach, or submission capability/);
  assert.match(app, /Maximum commute \(miles\)/);
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
  assert.match(app, /have not previously applied to this exact/);
  assert.match(app, /without the current Zaytinya bridge role/);
  assert.match(app, /packageRecord\.approvalState === "approved"/);
  assert.match(app, /key=\{`\$\{pursuedJob\?\.id[\s\S]*pursuedJob\?\.pursuit\?\.package\?\.payloadSha256/);
  assert.match(app, /\/founder-assets\/\$\{encodeURIComponent\(asset\.filename\)\}/);
  assert.doesNotMatch(app, /confirmation: "submit_application"/);
  assert.match(css, /\.wa-package-review-block/);
  assert.match(css, /\.wa-hash-code/);
});

test("derives package fingerprints server-side and versions employer content with its exact form", async () => {
  const repository = await readFile(new URL("../app/workspace-repository.ts", import.meta.url), "utf8");

  assert.match(repository, /export function canonicalJson/);
  assert.match(repository, /sha256Hex\(canonicalJson\(asset\.content\)\)/);
  assert.match(repository, /normalizedOpportunities = await Promise\.all\(payload\.opportunities\.map\(normalizeBootstrapOpportunity\)\)/);
  assert.match(repository, /payloadSha256 = await sha256Hex\(canonicalJson\(packageCore\)\)/);
  assert.match(repository, /\?content=true/);
  assert.match(repository, /\?questions=true/);
  assert.match(repository, /job\.updated_at !== questionJob\.updated_at/);
  assert.match(repository, /ON CONFLICT\(job_posting_id, description_checksum\) DO NOTHING/);
  assert.doesNotMatch(repository, /ON CONFLICT\(job_posting_id, description_checksum\) DO UPDATE/);
});

test("keeps mobile trust, account focus, and form feedback behavior explicit", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("../app/WayAheadApp.tsx", import.meta.url), "utf8"),
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
  assert.match(app, /Conflict recorded/);
  assert.match(app, /wa-score-card-warning/);
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
  assert.ok(paths.includes("/jobs/greenhouse/route.ts"));
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
