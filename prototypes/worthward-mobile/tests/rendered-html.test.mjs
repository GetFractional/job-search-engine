import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import {
  COMPENSATION_AMBIGUITY_OBSERVATIONS,
  JOBS,
  JOB_BY_ID,
  getProofRecoveryRequirements,
  getRequirementViews,
} from "../app/prototype-data.ts";
import {
  approveCurrentPayload,
  classifyFixtureForScenario,
  deriveReviewAction,
  initialApprovalState,
  isApprovalCurrent,
  parseReviewRecords,
  recordVisibleConfirmation,
  simulateHandoff,
  simulatePackageChange,
  upsertReviewRecord,
} from "../app/prototype-state.ts";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the mobile career-decision prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Way Ahead \| Find work that moves your life forward<\/title>/i);
  assert.match(html, /Find the work that moves your life forward\./);
  assert.match(html, /See credible career paths/);
  assert.match(html, /Check a job I found/);
  assert.match(html, /Private by default/);
  assert.match(html, /Start without a card/);
  assert.doesNotMatch(html, /Worthward/i);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working|react-loading-skeleton/i);
});

test("keeps job interpretation, proof, and external approval visibly separate", async () => {
  const [prototype, fixtures] = await Promise.all([
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prototype-data.ts", import.meta.url), "utf8"),
  ]);

  assert.match(prototype, /Our recommendation/);
  assert.match(prototype, /What do you want to do\?/);
  assert.match(prototype, /How we read this job/);
  assert.match(prototype, /The employer statement defines the requirement/);
  assert.match(prototype, /No external action approved/);
  assert.match(prototype, /Synthetic fixture · no network action/);
  assert.match(prototype, /No external action occurred/);

  assert.match(fixtures, /Starts at \$175,000/);
  assert.match(fixtures, /upper bound remains null/i);
  assert.match(fixtures, /Type, amount, vesting, and value are not public/);
  assert.match(fixtures, /excluded_non_compensation/);
  assert.match(fixtures, /Equity used in equal-opportunity, inclusion, or health-outcomes language/);
  assert.match(fixtures, /exactEmployerText: "ideally at a consumption, product-led, or marketplace business"/);
  assert.match(fixtures, /logicalOperator: "OR"/);
  assert.match(fixtures, /alternativeSemantics: "any_of"/);
  assert.match(fixtures, /Inactive exact opening/);
  assert.match(fixtures, /export type EmployerRequirement/);
  assert.match(fixtures, /export type RequirementAssessment/);
  assert.match(fixtures, /export type ApplicationQuestion/);
  assert.match(fixtures, /export function getRequirementViews/);
  assert.match(fixtures, /export function getBlockingGates/);
  assert.match(prototype, /No factor values are reverse-engineered from the total/);
  assert.match(prototype, /Save answers for review/);
  assert.match(prototype, /event\.preventDefault\(\); mainRef\.current\?\.focus/);
  assert.doesNotMatch(prototype, /Math\.(?:max|min)\(.*job\.score/);
});

test("preserves mandatory gates and source-kind boundaries in real-job fixtures", () => {
  const tebra = JOB_BY_ID.tebra;
  assert.equal(tebra.applicationQuestions.length, 5);
  assert.ok(tebra.applicationQuestions.some((question) => question.id === "tebra-question-tenure"));
  assert.equal(getRequirementViews(tebra).filter((requirement) => requirement.employerSourceKind === "job").length, 0);
  assert.equal(getRequirementViews(tebra).filter((requirement) => requirement.employerSourceKind === "application").length, 5);
  assert.match(tebra.workflowAction, /5 application gates/);

  const thnks = JOB_BY_ID.thnks;
  const antiFit = thnks.employerRequirements.filter((requirement) => requirement.priority === "Anti-fit");
  assert.deepEqual(antiFit.map((requirement) => requirement.sourceSpan.startLine), [46, 47, 48]);
  assert.equal(thnks.integrity, "unknown");
  assert.equal(thnks.recommendation, "Watch");
  assert.ok(thnks.gates.some((gate) => gate.id === "thnks-freshness" && gate.blocksPreparation));

  assert.equal(JOB_BY_ID.lumeris.compensationAmbiguityObservations.length, 0);
  assert.equal(COMPENSATION_AMBIGUITY_OBSERVATIONS[0].sourceState, "synthetic_test");

  const proofRecoveryIds = getProofRecoveryRequirements(thnks).map((requirement) => requirement.id);
  assert.ok(proofRecoveryIds.includes("thnks-years"));
  assert.ok(proofRecoveryIds.includes("thnks-manager-antifit"));
  assert.ok(proofRecoveryIds.includes("thnks-tracking"));
  assert.ok(proofRecoveryIds.includes("thnks-work-samples"));
  assert.ok(thnks.gates.find((gate) => gate.id === "thnks-hands-on")?.linkedRequirementIds.includes("thnks-manager-antifit"));
  assert.deepEqual(getProofRecoveryRequirements(JOB_BY_ID.going).map((requirement) => requirement.id), ["going-ownership", "going-liquid", "going-mobile", "going-ltv"]);
  assert.ok(getProofRecoveryRequirements(JOB_BY_ID.lumeris).some((requirement) => requirement.id === "lumeris-regulated"));

  for (const job of JOBS) {
    const requirementIds = new Set(getRequirementViews(job).map((requirement) => requirement.id));
    for (const gate of job.gates) {
      assert.ok(gate.linkedRequirementIds.every((requirementId) => requirementIds.has(requirementId)), `${gate.id} contains an unknown requirement link`);
    }
  }
});

test("accounts for every fixture exactly once and invalidates corrected analysis", () => {
  for (const scenario of ["material", "no-action", "partial"]) {
    const categories = JOBS.map((job) => classifyFixtureForScenario(job, scenario));
    assert.equal(categories.length, JOBS.length);
    assert.ok(categories.every((category) => ["surfaced", "suppressed", "unresolved"].includes(category)));
    assert.equal(
      categories.filter((category) => category === "surfaced").length
        + categories.filter((category) => category === "suppressed").length
        + categories.filter((category) => category === "unresolved").length,
      JOBS.length,
    );
  }

  assert.deepEqual(
    JOBS.filter((job) => classifyFixtureForScenario(job, "material") === "surfaced").map((job) => job.id),
    ["going"],
  );
  assert.equal(classifyFixtureForScenario(JOB_BY_ID.going, "material", true), "unresolved");
  const correctedNoAction = JOBS.map((job) => classifyFixtureForScenario(job, "no-action", job.id === "going"));
  assert.equal(correctedNoAction.filter((category) => category === "suppressed").length, 2);
  assert.equal(correctedNoAction.filter((category) => category === "unresolved").length, 5);

  const actionInput = {
    correctionPending: true,
    inactive: false,
    blockingGateCount: 1,
    hasReviewItems: true,
    workflowAction: "Review 4 proof questions",
  };
  assert.deepEqual(deriveReviewAction({ ...actionInput, decision: "Pass" }), { kind: "return_opportunities", label: "Return to opportunities" });
  assert.deepEqual(deriveReviewAction({ ...actionInput, decision: "Watch" }), { kind: "edit_radar", label: "Edit job watch" });
  assert.deepEqual(deriveReviewAction({ ...actionInput, decision: "Pursue" }), { kind: "review_correction", label: "Review pending correction" });
});

test("binds approval and receipt to the exact payload", () => {
  const approved = approveCurrentPayload(initialApprovalState(), "2026-07-17T20:00:00.000Z");
  assert.equal(approved.phase, "approved");
  assert.equal(isApprovalCurrent(approved), true);
  assert.equal(recordVisibleConfirmation(approved, "2026-07-17T20:00:30.000Z").phase, "revoked");

  const changed = simulatePackageChange(approved);
  assert.equal(changed.phase, "revoked");
  assert.notEqual(changed.payload.fingerprint, approved.payload.fingerprint);
  assert.equal(isApprovalCurrent(changed), false);
  assert.equal(simulateHandoff(changed).phase, "revoked");

  const reapproved = approveCurrentPayload(changed, "2026-07-17T20:01:00.000Z");
  const handedOff = simulateHandoff(reapproved);
  const verified = recordVisibleConfirmation(handedOff, "2026-07-17T20:02:00.000Z");
  assert.equal(verified.phase, "verified");
  assert.equal(verified.receipt?.payloadKey, verified.authorization?.payloadKey);
  assert.equal(verified.receipt?.destination, verified.payload.destination);
});

test("persists and replaces local review records by exact review scope", () => {
  const first = {
    id: "proof-going",
    type: "proof",
    jobId: "going",
    answers: { "going-braze": "evidence" },
    updatedAt: "2026-07-17T20:00:00.000Z",
    syncState: "local_only",
  };
  const second = { ...first, answers: { "going-braze": "none" }, updatedAt: "2026-07-17T20:01:00.000Z" };
  const records = upsertReviewRecord(upsertReviewRecord([], first), second);
  assert.equal(records.length, 1);
  assert.equal(records[0].answers["going-braze"], "none");
  assert.equal(parseReviewRecords(JSON.stringify(records)).length, 1);
  assert.deepEqual(parseReviewRecords("not-json"), []);
});

test("contains no customer-facing Teal dependency or brittle time promise", async () => {
  const [prototype, funnel, fixtures] = await Promise.all([
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prototype-data.ts", import.meta.url), "utf8"),
  ]);
  const customerSurface = `${prototype}\n${funnel}\n${fixtures}`;

  assert.doesNotMatch(customerSurface, /\bTeal(?:HQ)?\b/i);
  assert.doesNotMatch(customerSurface, /\b\d+[- ]minute(?:s)?\s+(?:review|analysis|check|setup)\b/i);
  assert.match(prototype, /capacity limits queue work without weakening analysis/i);
  assert.match(prototype, /aria-label="Preview synthetic resume"/);
  assert.match(prototype, /aria-label="Preview synthetic cover letter"/);
  assert.match(prototype, /aria-label="Review synthetic application answers"/);
});

test("retains responsive and accessible shell safeguards", async () => {
  const [prototype, funnel, css, packageJson] = await Promise.all([
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(prototype, /prototype-shell mobile-prototype/);
  assert.match(prototype, /aria-live="polite"/);
  assert.match(funnel, /aria-label="Independent opportunity checks"/);
  assert.match(funnel, /reviewed \? "Sample check complete, details still open" : notChecked \? "Not checked in this prototype" : active \? "Checking the local boundary" : index < 2 \? "First job check" : "After we know what you want"/);
  assert.match(funnel, /No personal information is used/);
  assert.match(funnel, /Your input stays on this device/);
  assert.match(funnel, /No payment method is collected and no charge occurs/);
  assert.match(prototype, /validationSummary\.current\?\.focus/);
  assert.match(prototype, /errorRef\.current\?\.focus/);
  assert.match(prototype, /reviewReturnFocusId/);
  assert.match(prototype, /id="brief-review-tebra"/);
  assert.match(prototype, /const currentRoute = parseRoute\(\)/);
  assert.match(prototype, /role="dialog" aria-modal="true"/);
  assert.match(prototype, /event\.key === "Escape"/);
  assert.match(css, /height:\s*100dvh/);
  assert.match(css, /@media \(max-width: 799px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(prototype, /Your correction needs review/);
  assert.match(prototype, /Derived source summary/);
  assert.doesNotMatch(prototype, /Two are unresolved|Going is the strongest current match/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("protects the mobile first-use journey from the audited P1 regressions", async () => {
  const [prototype, funnel, css] = await Promise.all([
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(funnel, /className="capture-label" htmlFor="home-job-source">Paste the job link or description/);
  assert.match(funnel, /className="capture-text-input"/);
  assert.match(funnel, /<textarea[^>]*className="capture-text-input"/);
  assert.match(css, /\.capture-input \.capture-text-input\s*\{[^}]*border:\s*0;/s);
  assert.match(css, /\.capture-input \.capture-text-input\s*\{[^}]*box-shadow:\s*none;/s);
  assert.match(prototype, /onReview=\{beginIntegrityPreview\}/);
  assert.doesNotMatch(prototype, /onReview=\{\([^)]*\) => \{[^}]*navigate\(\{ view: "mode" \}\)/s);

  assert.match(funnel, /OnboardingProgress step=\{1\}/);
  assert.match(funnel, /OnboardingProgress step=\{2\}/);
  assert.match(prototype, /OnboardingProgress step=\{3\}/);
  assert.match(funnel, /OnboardingProgress step=\{4\}/);
  assert.match(prototype, /Minimum pay I’d consider/);
  assert.match(prototype, /Pay I’m aiming for/);
  assert.match(prototype, /Maximum commute distance/);
  assert.match(prototype, /25 miles/);
  assert.doesNotMatch(prototype, /15 minutes|30 minutes|45 minutes|60 minutes/);
  assert.match(funnel, /See jobs for this plan/);
  assert.doesNotMatch(funnel, /Use this plan/);
  assert.doesNotMatch(funnel, /strategy-approval/);
  assert.match(funnel, /Make \$\{item\.name\} primary/);
  assert.match(funnel, /included\.includes\(item\.id\) \? "Remove" : "Include"/);
  assert.match(prototype, /my-way-ahead-onboarding/);
  assert.match(prototype, /Your plan needs one missing choice\./);

  assert.match(css, /@media \(max-width: 799px\)[\s\S]*?\.screen,[\s\S]*?\.public-screen\s*\{\s*padding:\s*32px 24px 104px;/);
  assert.match(css, /\.capture-input\s*\{[\s\S]*?min-height:\s*56px;/);
  assert.match(css, /\.home-lede\s*\{[\s\S]*?font-size:\s*1rem;/);
});

test("keeps sample boundaries, saved setup, and entered priorities truthful", async () => {
  const [prototype, funnel] = await Promise.all([
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(funnel, /Live job extraction is not connected in this prototype/);
  assert.match(funnel, /Your job was not analyzed/);
  assert.match(funnel, /Continue with the sample job/);
  assert.match(prototype, /function assessPreferences\(job: JobFixture, preferences: BaselinePreferences\)/);
  assert.match(prototype, /const preferenceAssessment = assessPreferences\(job, baselinePreferences\)/);
  assert.match(prototype, /baselinePreferences=\{baselinePreferences\}/);
  assert.match(funnel, /baselineSummary: string/);
  assert.match(funnel, /Your job standard/);
  assert.match(prototype, /onReview=\{beginIntegrityPreview\}/);
  assert.doesNotMatch(prototype, /onReview=\{[^\n]*setAccountReady\(false\)/);
  assert.match(prototype, /const choosePublicPlan = \(plan: PlanId\)/);
  assert.match(prototype, /setPendingAfterAuth\(\{ view: "checkout" \}\)/);
  assert.match(prototype, /Private-alpha sample jobs/);
  assert.match(prototype, /Every job, score, source check, and recommendation below is a labeled fictionalized test fixture/);
  assert.match(prototype, /Sample posting checked/);
  assert.match(prototype, /const canUseSampleWorkspace = hasCompletePlan && selectedProfile === "established"/);
  assert.match(prototype, /Your sample job workspace needs a complete plan\./);
});

test("keeps arbitrary job inputs unreviewed while preserving sample-job checks", async () => {
  const funnel = await readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8");

  assert.match(funnel, /const reviewed = phase === "ready" && reviewedReadyChecks && index < 2/);
  assert.match(funnel, /const notChecked = phase === "ready" && !reviewedReadyChecks && index < 2/);
  assert.match(funnel, /notChecked \? "Not checked in this prototype"/);
  assert.match(funnel, /<IntegrityChecks phase=\{phase\} reviewedReadyChecks=\{isSampleJob\} \/>/);
  assert.match(funnel, /className=\{`integrity-check-grid checks-\$\{phase\}`\}/);
  assert.doesNotMatch(funnel, /IntegrityTimeline|integrity-timeline/);
  assert.doesNotMatch(funnel, /const reviewed = phase === "ready" && index < 2/);
});

test("gives full-row controls visible keyboard focus and keeps career paths comparable", async () => {
  const [funnel, css] = await Promise.all([
    readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/way-ahead-v3.css", import.meta.url), "utf8"),
  ]);

  assert.match(css, /\.mode-grid > label:has\(input:focus-visible\)/);
  assert.match(css, /label\.input-method\.available:has\(input:focus-visible\)/);
  assert.match(css, /\.lane-controls label:has\(input:focus-visible\)/);
  assert.match(css, /\.decision-options > label:has\(input:focus-visible\)/);
  assert.match(css, /\.appearance-options label:has\(input:focus-visible\)/);
  assert.match(css, /outline:\s*3px solid var\(--accent\)/);
  assert.match(funnel, /className="lane-evidence-details"/);
  assert.match(funnel, /Why it fits and what to strengthen/);
  assert.match(css, /\.career-portfolio \.lane-controls[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});

test("keeps QA fixtures and private provenance out of customer surfaces", async () => {
  const [prototype, fixtures] = await Promise.all([
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/prototype-data.ts", import.meta.url), "utf8"),
  ]);
  const clientAssets = (await readdir(new URL("../dist/client/assets/", import.meta.url)))
    .filter((name) => name.endsWith(".js"));
  const clientBundle = (await Promise.all(clientAssets.map((name) =>
    readFile(new URL(`../dist/client/assets/${name}`, import.meta.url), "utf8")
  ))).join("\n");
  const privatePathPattern = /\/Users\/|source-files\/|applications\/|docs\/career-platform\//;

  assert.match(prototype, /URLSearchParams\(window\.location\.search\)\.get\("qaScenario"\)/);
  assert.doesNotMatch(prototype, /localStorage\.setItem\("my-way-ahead-prototype-scenario"/);
  assert.doesNotMatch(prototype, /Prototype controls|function ScenarioPicker/);
  assert.match(prototype, /: \{ view: "home" \};/);
  assert.doesNotMatch(fixtures, privatePathPattern);
  assert.doesNotMatch(clientBundle, privatePathPattern);
});

test("explains failed checks in customer language and preserves trusted results", async () => {
  const prototype = await readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8");

  assert.match(prototype, /The latest job check could not finish/);
  assert.match(prototype, /Open a job to review what still needs verification/);
  assert.match(prototype, /We could not refresh the job sources/);
  assert.doesNotMatch(prototype, /New analysis failed validation/);
  assert.doesNotMatch(prototype, /Source refresh failed safely/);
});

test("keeps the visible brand name as the accessible name without prohibited ARIA", async () => {
  const funnel = await readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8");

  assert.match(funnel, /<span>Way Ahead<\/span>/);
  assert.doesNotMatch(funnel, /className=\{`mwa-brand[^\n]+aria-label="Way Ahead"/);
});

test("keeps current software hypotheses distinct from paused human services", async () => {
  const [prototype, funnel] = await Promise.all([
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(funnel, /"multi-watch-monthly"/);
  assert.match(funnel, /"multi-watch-three-month"/);
  assert.match(funnel, /"multi-active"/);
  assert.match(funnel, /Keep Watch billing term/);
  assert.match(funnel, /\$9 monthly/);
  assert.match(funnel, /\$24 for 3 months/);
  assert.match(funnel, /\$19 monthly/);
  assert.match(funnel, /\$49 for 3 months/);
  assert.match(funnel, /Multi-Path Active/);
  assert.match(funnel, /Role Decision \+ Application Pack/);
  assert.match(funnel, /Interview \+ 90-Day Plan/);
  assert.doesNotMatch(funnel, /price: "\$499"/);
  assert.match(funnel, /Human services are paused/);
  assert.match(funnel, /function GuidedHelpScreen|export function GuidedHelpScreen/);
  assert.doesNotMatch(funnel, /name:\s*"Expert Review"/);

  assert.match(prototype, /const \[checkoutPlan, setCheckoutPlan\] = useState<PlanId>\(storedPlan\)/);
  assert.match(prototype, /route\.view === "checkout" && checkoutPlan !== "free"/);
  assert.match(prototype, /onConfirm=\{\(\) => \{ setSelectedPlan\(checkoutPlan\); navigate\(\{ view: "receipt" \}\); \}\}/);
  assert.match(prototype, /route\.view === "guided" \? <GuidedHelpScreen/);
  assert.match(funnel, /renews monthly until I cancel/);
  assert.match(funnel, /no-automatic-renewal terms/);
});

test("keeps the acquisition and onboarding funnel in plain language", async () => {
  const [funnel, prototype] = await Promise.all([
    readFile(new URL("../app/MyWayAheadFunnel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MyWayAheadPrototype.tsx", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(funnel, /\b(?:canonical|mandate|thesis|optionality|payload|fixture|adjudicated|suppressed|fingerprint)\b/i);
  assert.match(funnel, /Find the work that moves your life forward\./);
  assert.match(prototype, /What would make your next job better\?/);
  assert.match(funnel, /Start free\. Expand only when the search earns it\./);
});
