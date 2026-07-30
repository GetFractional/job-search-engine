import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function loadDeterministicAssessment() {
  const source = read("app/deterministic-assessment.ts");
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const compiledModule = { exports: {} };
  new Function("exports", "module", javascript)(
    compiledModule.exports,
    compiledModule,
  );
  return compiledModule.exports;
}

function assessmentInput(overrides = {}) {
  return {
    source: {
      versionId: "jobver-current",
      descriptionChecksum: "checksum-current",
      captureState: "verified",
      rightsState: "approved",
      freshnessState: "fresh",
      title: "Director, Revenue Operations",
      locations: ["Remote, United States"],
      compensation: {
        sourceRange: {
          min: 200_000,
          max: 228_000,
          currency: "USD",
          interval: "year",
        },
      },
      facts: { workplaceType: "remote" },
      ...overrides.source,
    },
    standard: {
      minimumPayCents: 15_000_000,
      targetPayCents: 18_000_000,
      currency: "USD",
      workArrangements: ["remote"],
      travelMaximumPercent: null,
      benefits: [],
      ...overrides.standard,
    },
    path: {
      id: "path-revops",
      label: "Revenue Operations",
      primaryLane: "Revenue Operations",
      secondaryLanes: ["GTM Operations"],
      ...overrides.path,
    },
    profile: {
      confirmedFactCount: 4,
      confirmedSkillCount: 8,
      confirmedRoles: [
        {
          title: "Director, Revenue Operations",
          startDate: "2021-01",
          endDate: null,
          isCurrent: true,
          summary: "Built the operating systems behind measurable growth.",
        },
      ],
      ...overrides.profile,
    },
  };
}

test("deterministic assessment keeps structured alignment separate from requirement-level fit", () => {
  const { assessDeterministically } = loadDeterministicAssessment();
  const result = assessDeterministically(assessmentInput());

  assert.equal(result.policyVersion, "way-ahead-deterministic-assessment-v2");
  assert.equal(result.scoreKind, "preliminary_alignment");
  assert.equal(result.fitScore, 100);
  assert.equal(result.jobValueScore, 100);
  assert.equal(result.pursuitReadinessScore, 100);
  assert.equal(result.recommendation, "needs_evidence");
  assert.match(result.scoreMeaning, /not overall role fit/i);
  assert.match(result.scoreMeaning, /not.*hiring probability/i);
  assert.match(result.scoreMeaning, /interview or offer/i);
  assert.ok(
    result.unknowns.some((item) =>
      /responsibilities and requirements have not been compared/i.test(item),
    ),
  );
  assert.equal(
    result.criteria.find(
      (criterion) => criterion.id === "requirements-evidence-match",
    )?.state,
    "unknown",
  );
  assert.equal(result.criteria.length, result.totalCriterionCount);
  assert.ok(result.criteria.every((criterion) => criterion.evidence));
  assert.deepEqual(result.hardConflicts, []);
});

test("deterministic assessment preserves missing value and freshness facts as unknown", () => {
  const { assessDeterministically } = loadDeterministicAssessment();
  const result = assessDeterministically(
    assessmentInput({
      source: {
        freshnessState: "unknown",
        locations: ["United States"],
        compensation: null,
        facts: {},
      },
    }),
  );

  assert.equal(result.jobValueScore, null);
  assert.equal(result.recommendation, "needs_evidence");
  assert.ok(result.unknowns.some((item) => /posting date/i.test(item)));
  assert.ok(result.unknowns.some((item) => /compensation/i.test(item)));
  assert.ok(result.unknowns.some((item) => /work arrangement/i.test(item)));
  assert.equal(
    result.criteria.find((criterion) => criterion.id === "compensation")?.score,
    null,
  );
});

test("deterministic assessment passes when verified compensation cannot clear the minimum", () => {
  const { assessDeterministically } = loadDeterministicAssessment();
  const result = assessDeterministically(
    assessmentInput({
      source: {
        compensation: {
          sourceRange: {
            min: 80_000,
            max: 100_000,
            currency: "USD",
            interval: "annual",
          },
        },
      },
    }),
  );

  assert.equal(result.recommendation, "pass");
  assert.equal(result.jobValueScore, 50);
  assert.ok(result.hardConflicts.some((item) => /below your minimum/i.test(item)));
  assert.equal(
    result.criteria.find((criterion) => criterion.id === "compensation")?.state,
    "conflict",
  );
});

test("member assessment and pursuit routes are same-origin and normal-user accessible", () => {
  const assessmentRoute = read("app/api/jobs/assessment/route.ts");
  const pursuitRoute = read("app/api/pursuits/route.ts");

  for (const route of [assessmentRoute, pursuitRoute]) {
    assert.match(route, /requireUserRequest/);
    assert.match(route, /requireSameOrigin/);
    assert.match(route, /readBoundedJson/);
    assert.doesNotMatch(route, /requireFounderRequest/);
  }
  assert.match(assessmentRoute, /recordMemberOpportunityAssessment/);
  assert.match(pursuitRoute, /ensurePursuitDocumentStarters/);
});

test("assessment, pursuit, and starter storage preserve tenant, source, and approval boundaries", () => {
  const workspace = read("app/workspace-repository.ts");
  const documents = read("app/document-repository.ts");
  const assessment = workspace.slice(
    workspace.indexOf("export async function recordMemberOpportunityAssessment"),
    workspace.indexOf("export async function recordOwnerOpportunityAnalysis"),
  );
  const pursuit = workspace.slice(
    workspace.indexOf("export async function createPursuit"),
    workspace.indexOf("export async function buildFounderApplicationPackage"),
  );
  const starters = documents.slice(
    documents.indexOf("export async function createJobResumeFromProfile"),
    documents.indexOf("export async function saveCoverLetterVersion"),
  );

  assert.match(assessment, /user_job_links ujl WHERE ujl\.user_id = \?/);
  assert.match(assessment, /career_paths WHERE id = \? AND user_id = \?/);
  assert.match(assessment, /job_standards WHERE user_id = \?/);
  assert.match(assessment, /profileEvidenceVersion/);
  assert.match(assessment, /jobVersionId: sourceVersion\.id/);
  assert.match(assessment, /externalActionAuthorized: false/);
  assert.match(assessment, /modelUsed: false/);
  assert.match(pursuit, /boundVersionId !== job\.latest_version_id/);
  assert.match(pursuit, /validation_state !== "trusted"/);
  assert.match(starters, /p\.user_id = \?/);
  assert.match(starters, /ra\.scope = 'job'/);
  assert.match(starters, /posting requirements have not been used/i);
  assert.match(documents, /postingFactsUsed: false/);
});

test("member UI has honest navigation, invalid-ID failures, explainable scores, and editable starters", () => {
  const app = read("app/WayAheadApp.tsx");
  const coverStudio = read("app/CoverLetterStudio.tsx");
  const todayRepository = read("app/today-repository.ts");
  const todayUi = read("app/TodayDashboard.tsx");

  assert.match(app, /window\.history\.pushState\(\{\}, "", viewPath\("jobs", jobId\)\)/);
  assert.match(app, /No other job was substituted/);
  assert.match(app, /No different pursuit was substituted/);
  assert.match(app, /Preliminary alignment/);
  assert.match(app, /Job value/);
  assert.match(app, /Pursuit readiness/);
  assert.match(app, /not hiring probability/i);
  assert.match(app, /Build editable starters/);
  assert.match(app, /Edit resume/);
  assert.match(app, /Edit cover letter/);
  assert.match(app, /does not populate an employer form, upload a file, or submit an application/i);
  assert.match(coverStudio, /selected employer\s+and title/i);
  assert.doesNotMatch(coverStudio, /built from the current posting/i);
  assert.match(todayRepository, /Add and assess a current job/);
  assert.match(todayRepository, /Continue to Jobs/);
  assert.match(todayUi, /No jobs have been assessed in this view yet/);
  assert.match(todayUi, /Go to Jobs/);
});
