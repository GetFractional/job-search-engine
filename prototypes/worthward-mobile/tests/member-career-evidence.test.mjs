import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const read = (relativePath) =>
  readFileSync(path.join(appRoot, relativePath), "utf8");

function loadCareerEvidenceTypes() {
  const source = read("app/career-evidence-types.ts");
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

function extractedStringConstant(name) {
  const relativePath = "app/career-evidence-repository.ts";
  const source = read(relativePath);
  const ast = ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let value = null;
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      (ts.isStringLiteral(node.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(node.initializer))
    ) {
      value = node.initializer.text;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(value, `expected SQL constant ${name}`);
  return value;
}

function quoteSql(value) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function bindSql(sql, values) {
  let index = 0;
  const bound = sql.replaceAll("?", () => {
    assert.ok(index < values.length, "not enough SQL values");
    return quoteSql(values[index++]);
  });
  assert.equal(index, values.length, "unused SQL values");
  return bound;
}

const migrationSql = readdirSync(path.join(appRoot, "drizzle"))
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) =>
    read(path.join("drizzle", name)).replaceAll(
      "--> statement-breakpoint",
      "",
    ),
  )
  .join("\n");
const runtimeIntegritySql = JSON.parse(
  read("db/integrity-triggers.json"),
)
  .map(({ sql }) => sql)
  .join("\n");

function runSql(sql) {
  return spawnSync("/usr/bin/sqlite3", [":memory:"], {
    input: [
      ".bail on",
      "PRAGMA foreign_keys=ON;",
      migrationSql,
      runtimeIntegritySql,
      sql,
    ].join("\n"),
    encoding: "utf8",
  });
}

test("normalizes two structured roles and enforces month/current-role logic", () => {
  const {
    normalizeCareerEvidenceMutation,
    normalizeCareerEvidenceRole,
  } = loadCareerEvidenceTypes();
  const current = normalizeCareerEvidenceRole({
    employer: " Northstar Labs ",
    title: " QA Systems Lead ",
    startDate: "2021-01",
    endDate: "2026-07",
    isCurrent: true,
    location: "Remote",
    summary: "Built the quality operating system.",
  });
  const previous = normalizeCareerEvidenceRole({
    employer: "Earlier Company",
    title: "Operations Director",
    startDate: "2017-03",
    endDate: "2020-12",
    isCurrent: false,
    location: "",
    summary: "",
  });

  assert.equal(current.endDate, null);
  assert.equal(current.employer, "Northstar Labs");
  assert.equal(previous.endDate, "2020-12");
  assert.equal(previous.location, null);
  assert.notDeepEqual(current, previous);
  assert.throws(
    () =>
      normalizeCareerEvidenceRole({
        ...previous,
        startDate: "2026-13",
      }),
    /valid year and month/,
  );
  assert.throws(
    () =>
      normalizeCareerEvidenceRole({
        ...previous,
        startDate: "2021-01",
        endDate: "2020-12",
      }),
    /cannot be before/,
  );
  assert.throws(
    () =>
      normalizeCareerEvidenceRole({
        ...current,
        startDate: "9999-01",
      }),
    /has not happened yet/,
  );
  assert.throws(
    () =>
      normalizeCareerEvidenceMutation({
        action: "upsert",
        role: current,
        confirmed: false,
      }),
    /confirm.*accurate/i,
  );
});

test("the member route and Profile UI preserve auth, source, and interaction boundaries", () => {
  const route = read("app/api/career-evidence/route.ts");
  const repository = read("app/career-evidence-repository.ts");
  const manager = read("app/CareerEvidenceManager.tsx");
  const workspace = read("app/workspace-repository.ts");
  const app = read("app/WayAheadApp.tsx");

  assert.match(route, /requireUserRequest/);
  assert.match(route, /requireSameOrigin/);
  assert.match(route, /readBoundedJson\(request, 16_000\)/);
  assert.doesNotMatch(route, /requireFounderRequest/);
  assert.match(repository, /WHERE er\.id = \? AND er\.user_id = \?/);
  assert.match(
    repository,
    /WHERE id = \? AND user_id = \? AND review_state <> 'removed'/,
  );
  assert.match(repository, /review_state = 'removed'/);
  assert.match(repository, /career_evidence_role_restored/);
  assert.doesNotMatch(repository, /DELETE FROM experience_roles/);
  assert.match(repository, /externalActionAuthorized: false/);
  assert.match(workspace, /provenance_method/);
  assert.match(workspace, /removedExperiences/);
  assert.match(
    workspace,
    /Boolean\(sourceFact\) \|\| hasStructuredRoleDates\(role\)/,
  );
  assert.match(
    workspace,
    /experience_roles WHERE user_id = \? AND review_state <> 'removed'/,
  );
  assert.match(manager, /type="month"/);
  assert.match(manager, /min=\{draft\.startDate \|\| undefined\}/);
  assert.match(
    manager,
    /endDate: event\.target\.checked \? "" : current\.endDate/,
  );
  assert.match(manager, /I confirm these role details are accurate/);
  assert.match(manager, /Recently removed roles/);
  assert.match(app, /<CareerEvidenceManager/);
  assert.match(app, /viewPath\("profile"\)|"\/app\/profile"/);
});

test("role mutations reject another tenant even when the role ID is known", () => {
  const selectRole = extractedStringConstant(
    "CAREER_EVIDENCE_ROLE_BY_USER_SQL",
  );
  const updateRole = extractedStringConstant(
    "CAREER_EVIDENCE_UPDATE_ROLE_BY_USER_SQL",
  );
  const removeRole = extractedStringConstant(
    "CAREER_EVIDENCE_REMOVE_ROLE_BY_USER_SQL",
  );
  const restoreRole = extractedStringConstant(
    "CAREER_EVIDENCE_RESTORE_ROLE_BY_USER_SQL",
  );
  const result = runSql(`
    INSERT INTO users (id, auth_subject, email) VALUES
      ('user-a', 'auth-a', 'a@example.test'),
      ('user-b', 'auth-b', 'b@example.test');
    INSERT INTO experience_roles
      (id, user_id, employer, title, start_date, end_date, is_current,
       review_state)
    VALUES
      ('role-a', 'user-a', 'Employer A', 'Title A', '2022-01', NULL, 1,
       'confirmed'),
      ('role-b', 'user-b', 'Employer B', 'Title B', '2020-01', '2021-12', 0,
       'confirmed');
    ${bindSql(selectRole, ["role-b", "user-a"])};
    ${bindSql(updateRole, [
      "Attacker Employer",
      "Attacker Title",
      "2024-01",
      null,
      1,
      null,
      null,
      "role-b",
      "user-a",
    ])};
    ${bindSql(removeRole, ["role-b", "user-a"])};
    ${bindSql(restoreRole, ["role-b", "user-a"])};
    SELECT employer || '|' || title || '|' || review_state
      FROM experience_roles WHERE id = 'role-b';
  `);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout.trim(),
    "Employer B|Title B|confirmed",
  );
});

test("a confirmed profile change invalidates only that member's dependent decisions and assets", () => {
  const invalidateAnalyses = extractedStringConstant(
    "CAREER_EVIDENCE_INVALIDATE_ANALYSES_SQL",
  );
  const invalidateProfileAssets = extractedStringConstant(
    "CAREER_EVIDENCE_INVALIDATE_PROFILE_ASSETS_SQL",
  );
  const supersedeResumes = extractedStringConstant(
    "CAREER_EVIDENCE_SUPERSEDE_PROFILE_RESUMES_SQL",
  );
  const invalidateRenderedAssets = extractedStringConstant(
    "CAREER_EVIDENCE_INVALIDATE_RENDERED_ASSETS_SQL",
  );
  const supersedePackages = extractedStringConstant(
    "CAREER_EVIDENCE_SUPERSEDE_PACKAGES_SQL",
  );
  const resetPursuits = extractedStringConstant(
    "CAREER_EVIDENCE_RESET_PURSUITS_SQL",
  );
  const result = runSql(`
    INSERT INTO users (id, auth_subject, email) VALUES
      ('user-a', 'auth-a', 'a@example.test'),
      ('user-b', 'auth-b', 'b@example.test');
    INSERT INTO job_sources (id, name, kind, rights_state)
      VALUES ('source', 'Employer ATS', 'employer_ats', 'approved');
    INSERT INTO job_postings
      (id, source_id, external_id, canonical_url, employer, title,
       description_checksum, freshness_state)
    VALUES
      ('job-a', 'source', 'a', 'https://example.test/a', 'Employer A',
       'Role A', 'hash-a', 'fresh'),
      ('job-b', 'source', 'b', 'https://example.test/b', 'Employer B',
       'Role B', 'hash-b', 'fresh');
    INSERT INTO job_posting_versions
      (id, job_posting_id, source_checked_at, source_url,
       description_checksum, source_facts_json, source_conflicts_json,
       capture_state)
    VALUES
      ('version-a', 'job-a', 1, 'https://example.test/a', 'hash-a', '{}',
       '[]', 'verified'),
      ('version-b', 'job-b', 1, 'https://example.test/b', 'hash-b', '{}',
       '[]', 'verified');
    INSERT INTO job_standards (id, user_id, version, is_current) VALUES
      ('standard-a', 'user-a', 1, 1),
      ('standard-b', 'user-b', 1, 1);
    INSERT INTO job_analyses
      (id, user_id, job_posting_id, job_standard_id, policy_version,
       evidence_version, integrity_gates_json, fit_json, recommendation,
       validation_state)
    VALUES
      ('analysis-a', 'user-a', 'job-a', 'standard-a', 'policy', 'evidence-a',
       '{}', '{}', 'needs_evidence', 'trusted'),
      ('analysis-b', 'user-b', 'job-b', 'standard-b', 'policy', 'evidence-b',
       '{}', '{}', 'needs_evidence', 'trusted');
    INSERT INTO pursuits
      (id, user_id, job_posting_id, current_analysis_id, state,
       external_approval_state)
    VALUES
      ('pursuit-a', 'user-a', 'job-a', 'analysis-a', 'preparing', 'approved'),
      ('pursuit-b', 'user-b', 'job-b', 'analysis-b', 'preparing', 'approved');
    INSERT INTO resumes
      (id, user_id, name, kind, version, content_json, template_key,
       review_state)
    VALUES
      ('resume-a', 'user-a', 'Resume A', 'job', 1,
       '{"provenance":{"source":"approved_profile"}}', 'executive', 'draft'),
      ('resume-b', 'user-b', 'Resume B', 'job', 1,
       '{"provenance":{"source":"approved_profile"}}', 'executive', 'draft');
    INSERT INTO generated_assets
      (id, user_id, pursuit_id, type, source_versions_json,
       generation_policy_version, version, content_json, review_state)
    VALUES
      ('profile-cover-a', 'user-a', 'pursuit-a', 'cover_letter', '{}',
       'deterministic-approved-profile-v1', 1,
       '{"provenance":{"source":"approved_profile"}}', 'draft'),
      ('rendered-resume-a', 'user-a', 'pursuit-a', 'resume',
       '{"semanticResumeId":"resume-a"}', 'client-render-receipt-v1', 1,
       '{}', 'draft'),
      ('profile-cover-b', 'user-b', 'pursuit-b', 'cover_letter', '{}',
       'deterministic-approved-profile-v1', 1,
       '{"provenance":{"source":"approved_profile"}}', 'draft'),
      ('rendered-resume-b', 'user-b', 'pursuit-b', 'resume',
       '{"semanticResumeId":"resume-b"}', 'client-render-receipt-v1', 1,
       '{}', 'draft');
    INSERT INTO pursuit_packages
      (id, user_id, pursuit_id, version, destination_url,
       job_posting_version_id, answers_json, asset_manifest_json,
       blockers_json, payload_sha256, readiness_state)
    VALUES
      ('package-a', 'user-a', 'pursuit-a', 1, 'https://example.test/a/apply',
       'version-a', '{}', '{"assets":[]}', '[]', 'payload-a',
       'ready_for_review'),
      ('package-b', 'user-b', 'pursuit-b', 1, 'https://example.test/b/apply',
       'version-b', '{}', '{"assets":[]}', '[]', 'payload-b',
       'ready_for_review');

    ${bindSql(invalidateAnalyses, ["user-a"])};
    ${bindSql(invalidateProfileAssets, ["user-a"])};
    ${bindSql(supersedeResumes, ["user-a"])};
    ${bindSql(invalidateRenderedAssets, ["user-a", "user-a", "user-a"])};
    ${bindSql(supersedePackages, ["user-a"])};
    ${bindSql(resetPursuits, ["user-a"])};

    SELECT id || '|' || validation_state || '|' ||
      CASE WHEN invalidated_at IS NULL THEN 'current' ELSE 'invalidated' END
      FROM job_analyses ORDER BY id;
    SELECT id || '|' || review_state FROM resumes ORDER BY id;
    SELECT id || '|' ||
      CASE WHEN invalidated_at IS NULL THEN 'current' ELSE 'invalidated' END
      FROM generated_assets ORDER BY id;
    SELECT id || '|' || readiness_state FROM pursuit_packages ORDER BY id;
    SELECT id || '|' || coalesce(current_analysis_id, 'none') || '|' ||
      external_approval_state FROM pursuits ORDER BY id;
  `);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout.trim(),
    [
      "analysis-a|invalidated|invalidated",
      "analysis-b|trusted|current",
      "resume-a|superseded",
      "resume-b|draft",
      "profile-cover-a|invalidated",
      "profile-cover-b|current",
      "rendered-resume-a|invalidated",
      "rendered-resume-b|current",
      "package-a|superseded",
      "package-b|ready_for_review",
      "pursuit-a|none|revoked",
      "pursuit-b|analysis-b|approved",
    ].join("\n"),
  );
});
