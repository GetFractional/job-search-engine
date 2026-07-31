import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
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

function runSql(sql, { integrityTriggers = true } = {}) {
  return spawnSync("/usr/bin/sqlite3", [":memory:"], {
    input: [
      ".bail on",
      "PRAGMA foreign_keys=ON;",
      migrationSql,
      integrityTriggers ? runtimeIntegritySql : "",
      sql,
    ].join("\n"),
    encoding: "utf8",
  });
}

function expectSqlPass(sql, expectedOutput, options) {
  const result = runSql(sql, options);
  assert.equal(
    result.status,
    0,
    `SQLite contract unexpectedly failed:\n${result.stderr}`,
  );
  assert.equal(result.stdout.trim(), expectedOutput);
}

function expectSqlReject(sql, pattern, options) {
  const result = runSql(sql, options);
  assert.notEqual(result.status, 0, "expected SQLite to reject the IDOR/integrity breach");
  assert.match(result.stderr, pattern);
}

function quoteSql(value) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function bindAnonymousSql(sql, values) {
  let index = 0;
  const bound = sql.replaceAll("?", () => {
    assert.ok(index < values.length, "not enough values for extracted SQL");
    return quoteSql(values[index++]);
  });
  assert.equal(index, values.length, "unused values for extracted SQL");
  return bound;
}

function sourceFile(relativePath) {
  const source = read(relativePath);
  return {
    source,
    ast: ts.createSourceFile(
      relativePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      relativePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    ),
  };
}

function findFunction(relativePath, name) {
  const { ast } = sourceFile(relativePath);
  let found = null;
  const visit = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) {
      found = node;
      return;
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) ||
        ts.isFunctionExpression(node.initializer))
    ) {
      found = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(found, `expected ${name} in ${relativePath}`);
  return { ast, node: found };
}

function literalStrings(node) {
  const values = [];
  const visit = (child) => {
    if (
      ts.isStringLiteral(child) ||
      ts.isNoSubstitutionTemplateLiteral(child)
    ) {
      values.push(child.text);
    }
    ts.forEachChild(child, visit);
  };
  visit(node);
  return values;
}

function extractedString(relativePath, startsWith) {
  const { ast } = sourceFile(relativePath);
  let value = null;
  const visit = (node) => {
    if (
      value === null &&
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node)) &&
      node.text.startsWith(startsWith)
    ) {
      value = node.text;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(value, `expected SQL beginning ${startsWith}`);
  return value;
}

function evaluateFunctions(relativePath, names, dependencyNames, dependencies) {
  const { ast } = sourceFile(relativePath);
  const functions = new Map();
  const visit = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      functions.set(node.name.text, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  const source = names
    .map((name) => {
      const node = functions.get(name);
      assert.ok(node, `expected ${name} in ${relativePath}`);
      return node.getText(ast).replace(/^export\s+/, "");
    })
    .join("\n");
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return new Function(
    ...dependencyNames,
    `${javascript}\nreturn { ${names.join(", ")} };`,
  )(...dependencies);
}

function walkFiles(root) {
  const files = [];
  if (!statSync(root).isDirectory()) return [root];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(target));
    if (entry.isFile()) files.push(target);
  }
  return files;
}

const tenantUsersSql = `
  INSERT INTO users (id, auth_subject, email) VALUES
    ('user-a', 'auth-a', 'a@example.test'),
    ('user-b', 'auth-b', 'b@example.test');
`;

const threePursuitsSql = `
  ${tenantUsersSql}
  INSERT INTO job_sources (id, name, kind, rights_state)
  VALUES ('source-live', 'Employer careers', 'employer_ats', 'approved');
  INSERT INTO job_postings
    (id, source_id, external_id, canonical_url, employer, title,
     description_checksum, freshness_state)
  VALUES
    ('job-a1', 'source-live', 'a1', 'https://employer.test/a1',
     'Employer A1', 'Director A1', 'hash-a1', 'fresh'),
    ('job-a2', 'source-live', 'a2', 'https://employer.test/a2',
     'Employer A2', 'Director A2', 'hash-a2', 'fresh'),
    ('job-b1', 'source-live', 'b1', 'https://employer.test/b1',
     'Employer B1', 'Director B1', 'hash-b1', 'fresh');
  INSERT INTO job_posting_versions
    (id, job_posting_id, source_checked_at, source_url,
     description_checksum, source_facts_json, source_conflicts_json,
     capture_state)
  VALUES
    ('version-a1', 'job-a1', 100, 'https://employer.test/a1',
     'hash-a1', '{"questionSetChecksum":"form-a1"}', '[]', 'verified'),
    ('version-a2', 'job-a2', 100, 'https://employer.test/a2',
     'hash-a2', '{"questionSetChecksum":"form-a2"}', '[]', 'verified'),
    ('version-b1', 'job-b1', 100, 'https://employer.test/b1',
     'hash-b1', '{"questionSetChecksum":"form-b1"}', '[]', 'verified');
  INSERT INTO pursuits
    (id, user_id, job_posting_id, state)
  VALUES
    ('pursuit-a1', 'user-a', 'job-a1', 'preparing'),
    ('pursuit-a2', 'user-a', 'job-a2', 'preparing'),
    ('pursuit-b1', 'user-b', 'job-b1', 'preparing');
`;

test("public files and production source contain no founder payload or local machine path", () => {
  const publicFiles = walkFiles(path.join(appRoot, "public"));
  assert.equal(
    publicFiles.some((file) =>
      /(?:founder|matt[ _-]*dimock|seso|application[ _-]*package|\.(?:pdf|docx?))$/i.test(
        file,
      ),
    ),
    false,
  );

  const roots = [
    path.join(appRoot, "app"),
    path.join(appRoot, "worker"),
    path.join(appRoot, "public"),
  ].filter((root) => {
    try {
      return statSync(root).isDirectory();
    } catch {
      return false;
    }
  });
  const productionText = roots
    .flatMap(walkFiles)
    .filter((file) => /\.(?:js|jsx|ts|tsx|css|html|json|svg)$/.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  for (const forbidden of [
    /\/founder-assets\//,
    /\/Users\/mattdimock\//,
    /\/private\/tmp\/way-ahead/i,
    /Documents\/Jobs\/Job Search/i,
    /file:\/\/\/Users\//i,
  ]) {
    assert.doesNotMatch(productionText, forbidden);
  }
});

test("the product shell exposes stable, refresh-safe section routes", () => {
  const appRouteFiles = walkFiles(path.join(appRoot, "app", "app"))
    .map((file) => path.relative(path.join(appRoot, "app", "app"), file))
    .sort();
  for (const route of [
    "ProductRoutePage.tsx",
    "documents/cover-letters/[letterId]/page.tsx",
    "documents/cover-letters/page.tsx",
    "documents/resumes/[resumeId]/page.tsx",
    "documents/resumes/page.tsx",
    "home/page.tsx",
    "jobs/[jobId]/page.tsx",
    "jobs/page.tsx",
    "onboarding/experience/page.tsx",
    "onboarding/page.tsx",
    "page.tsx",
    "plan/page.tsx",
    "profile/page.tsx",
    "pursuits/[pursuitId]/page.tsx",
    "pursuits/page.tsx",
    "settings/privacy/page.tsx",
  ]) {
    assert.ok(appRouteFiles.includes(route), `missing stable product route: ${route}`);
  }

  const productSource = walkFiles(path.join(appRoot, "app"))
    .filter((file) => /\.(?:ts|tsx)$/.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  assert.match(productSource, /\/app\/home/);
  assert.match(productSource, /\/app\/jobs\/\$\{encodeURIComponent\(jobId\)\}/);
  assert.match(productSource, /\/app\/pursuits\/\$\{encodeURIComponent\(jobId\)\}/);
  assert.match(productSource, /\/app\/documents\/resumes/);
  assert.match(productSource, /\/app\/documents\/cover-letters/);
  assert.match(productSource, /\/app\/settings\/privacy/);
  assert.match(read("app/WayAheadApp.tsx"), /history\.pushState\(\{\}, "", viewPath\(/);
  assert.match(read("app/today-repository.ts"), /href: `\/app\/jobs\/\$\{encodeURIComponent/);
  assert.doesNotMatch(productSource, /href=["'`]\/app\?view=/);
});

test("Today evaluates exact current canonical job-version binding and executes only active-path rows", () => {
  const { isAnalysisCurrent, scoresAreVisible } = evaluateFunctions(
    "app/today-repository.ts",
    ["isAnalysisCurrent", "scoresAreVisible"],
    ["parseJson"],
    [
      (value, fallback) => {
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      },
    ],
  );

  assert.equal(
    isAnalysisCurrent({
      job_posting_version_id: "version-current",
      integrity_gates_json: '{"jobVersionId":"version-current"}',
    }),
    true,
  );
  assert.equal(
    isAnalysisCurrent({
      job_posting_version_id: "version-current",
      integrity_gates_json: '{"jobVersionId":"version-previous"}',
    }),
    false,
  );
  assert.match(
    read("app/today-repository.ts"),
    /const analysisCurrent = isAnalysisCurrent\(row\)/,
  );
  assert.equal(
    isAnalysisCurrent({
      job_posting_version_id: null,
      integrity_gates_json: '{"jobVersionId":"version-previous"}',
    }),
    false,
  );
  assert.equal(
    scoresAreVisible({ validation_state: "trusted" }, true),
    true,
  );
  assert.equal(
    scoresAreVisible({ validation_state: "pending" }, true),
    false,
  );
  assert.equal(
    scoresAreVisible({ validation_state: "trusted" }, false),
    false,
  );
  assert.match(
    read("app/today-repository.ts"),
    /fitScore: showScores \? fitScore : null/,
  );
  assert.match(
    read("app/today-repository.ts"),
    /moveValue: showScores \? row\.move_value_score : null/,
  );

  const todayQuery = extractedString(
    "app/today-repository.ts",
    "SELECT ja.job_posting_id",
  );
  assert.match(
    todayQuery,
    /jpv\.job_posting_id = jp\.id AND jpv\.description_checksum = jp\.description_checksum/,
  );
  assert.doesNotMatch(todayQuery, /ORDER BY candidate\.source_checked_at/);
  const boundTodayQuery = bindAnonymousSql(todayQuery, ["user-a"]);
  expectSqlPass(
    `
      ${tenantUsersSql}
      INSERT INTO career_paths
        (id, user_id, label, primary_lane, state, is_primary)
      VALUES
        ('path-active', 'user-a', 'Revenue Operations', 'revenue_operations',
         'active', 1),
        ('path-paused', 'user-a', 'Lifecycle', 'lifecycle', 'paused', 0),
        ('path-b', 'user-b', 'Growth', 'growth', 'active', 1);
      INSERT INTO job_standards (id, user_id, version, is_current) VALUES
        ('standard-a', 'user-a', 1, 1),
        ('standard-b', 'user-b', 1, 1);
      INSERT INTO job_sources (id, name, kind, rights_state)
      VALUES ('source-today', 'Today employer sources', 'employer_ats', 'approved');
      INSERT INTO job_postings
        (id, source_id, external_id, canonical_url, employer, title,
         description_checksum, freshness_state)
      VALUES
        ('job-active', 'source-today', 'active', 'https://example.test/active',
         'Active Employer', 'Active Role', 'active-hash', 'fresh'),
        ('job-paused', 'source-today', 'paused', 'https://example.test/paused',
         'Paused Employer', 'Paused Role', 'paused-hash', 'fresh'),
        ('job-other-user', 'source-today', 'other', 'https://example.test/other',
         'Other Employer', 'Other Role', 'other-hash', 'fresh');
      INSERT INTO job_posting_versions
        (id, job_posting_id, source_checked_at, source_url,
         description_checksum, source_facts_json, source_conflicts_json,
         capture_state)
      VALUES
        ('version-active', 'job-active', 100, 'https://example.test/active',
         'active-hash', '{}', '[]', 'verified'),
        ('version-paused', 'job-paused', 100, 'https://example.test/paused',
         'paused-hash', '{}', '[]', 'verified'),
        ('version-other', 'job-other-user', 100, 'https://example.test/other',
         'other-hash', '{}', '[]', 'verified');
      INSERT INTO job_analyses
        (id, user_id, job_posting_id, career_path_id, job_standard_id,
         policy_version, evidence_version, integrity_gates_json, fit_json,
         recommendation, validation_state)
      VALUES
        ('analysis-active', 'user-a', 'job-active', 'path-active', 'standard-a',
         'policy', 'evidence', '{"jobVersionId":"version-active"}', '{}',
         'pursue', 'trusted'),
        ('analysis-paused', 'user-a', 'job-paused', 'path-paused', 'standard-a',
         'policy', 'evidence', '{"jobVersionId":"version-paused"}', '{}',
         'pursue', 'trusted'),
        ('analysis-other', 'user-b', 'job-other-user', 'path-b', 'standard-b',
         'policy', 'evidence', '{"jobVersionId":"version-other"}', '{}',
         'pursue', 'trusted');
      SELECT group_concat(job_posting_id || ':' || career_path_id, ',')
        FROM (${boundTodayQuery});
    `,
    "job-active:path-active",
  );

  expectSqlPass(
    `
      ${tenantUsersSql}
      INSERT INTO career_paths
        (id, user_id, label, primary_lane, state, is_primary)
      VALUES
        ('path-reversion', 'user-a', 'Revenue Operations',
         'revenue_operations', 'active', 1);
      INSERT INTO job_standards
        (id, user_id, version, is_current)
      VALUES
        ('standard-reversion', 'user-a', 1, 1);
      INSERT INTO job_sources (id, name, kind, rights_state)
      VALUES
        ('source-reversion', 'Employer careers', 'employer_ats', 'approved');
      INSERT INTO job_postings
        (id, source_id, external_id, canonical_url, employer, title,
         description_checksum, freshness_state)
      VALUES
        ('job-reversion', 'source-reversion', 'reversion',
         'https://example.test/reversion', 'Reversion Employer',
         'Revenue Operations Director', 'hash-a', 'fresh');
      INSERT INTO job_posting_versions
        (id, job_posting_id, source_checked_at, source_url,
         description_checksum, source_facts_json, source_conflicts_json,
         capture_state)
      VALUES
        ('version-a', 'job-reversion', 100,
         'https://example.test/reversion', 'hash-a', '{}', '[]', 'verified');
      UPDATE job_postings
         SET description_checksum = 'hash-b'
       WHERE id = 'job-reversion';
      INSERT INTO job_posting_versions
        (id, job_posting_id, source_checked_at, source_url,
         description_checksum, source_facts_json, source_conflicts_json,
         capture_state)
      VALUES
        ('version-b', 'job-reversion', 200,
         'https://example.test/reversion', 'hash-b', '{}', '[]', 'verified');
      UPDATE job_postings
         SET description_checksum = 'hash-a'
       WHERE id = 'job-reversion';
      INSERT INTO job_analyses
        (id, user_id, job_posting_id, career_path_id, job_standard_id,
         policy_version, evidence_version, integrity_gates_json, fit_json,
         recommendation, validation_state)
      VALUES
        ('analysis-rechecked-a', 'user-a', 'job-reversion',
         'path-reversion', 'standard-reversion', 'policy', 'evidence',
         '{"jobVersionId":"version-a"}', '{}', 'pursue', 'trusted');
      SELECT job_posting_id || ':' || job_posting_version_id
        FROM (${boundTodayQuery});
    `,
    "job-reversion:version-a",
  );
});

test("Jobs exposes scores only for trusted analysis bound to the current source version", () => {
  const { currentTrustedAnalysis } = evaluateFunctions(
    "app/WayAheadApp.tsx",
    ["currentTrustedAnalysis"],
    [],
    [],
  );
  const analysis = {
    validationState: "trusted",
    integrityGates: { jobVersionId: "version-current" },
    moveValueScore: 84,
  };
  assert.equal(
    currentTrustedAnalysis({
      analysis,
      sourceVersion: { id: "version-current" },
    }),
    analysis,
  );
  assert.equal(
    currentTrustedAnalysis({
      analysis,
      sourceVersion: { id: "version-new" },
    }),
    null,
  );
  assert.equal(
    currentTrustedAnalysis({
      analysis: { ...analysis, validationState: "pending" },
      sourceVersion: { id: "version-current" },
    }),
    null,
  );
  const app = read("app/WayAheadApp.tsx");
  const workspaceRepository = read("app/workspace-repository.ts");
  assert.match(app, /const visibleAnalysis = currentTrustedAnalysis\(job\)/);
  assert.match(app, /visibleAnalysis\?\.moveValueScore/);
  assert.match(
    workspaceRepository,
    /posting\.description_checksum = version\.description_checksum/,
  );
  assert.doesNotMatch(
    findFunction("app/WayAheadApp.tsx", "JobsView").node.getText(
      findFunction("app/WayAheadApp.tsx", "JobsView").ast,
    ),
    /job\.analysis\.moveValueScore/,
  );
});

test("activation requires one exact confirmed structured role and never bulk-promotes source facts", () => {
  const {
    toBool,
    hasStructuredRoleDates,
    isActivationReadyExperience,
  } = evaluateFunctions(
    "app/workspace-repository.ts",
    ["toBool", "hasStructuredRoleDates", "isActivationReadyExperience"],
    [],
    [],
  );
  const currentRole = {
    employer: "Current Employer",
    title: "Director",
    start_date: "2024-02",
    end_date: null,
    is_current: 1,
    review_state: "confirmed",
  };
  assert.equal(toBool(currentRole.is_current), true);
  assert.equal(hasStructuredRoleDates(currentRole), true);
  assert.equal(isActivationReadyExperience(currentRole), true);
  assert.equal(
    isActivationReadyExperience({
      ...currentRole,
      review_state: "draft",
    }),
    false,
  );
  assert.equal(
    hasStructuredRoleDates({ ...currentRole, start_date: null }),
    false,
  );
  assert.equal(
    hasStructuredRoleDates({
      ...currentRole,
      is_current: 0,
      start_date: "2024-02",
      end_date: "2023-12",
    }),
    false,
  );
  const repository = read("app/workspace-repository.ts");
  assert.doesNotMatch(
    repository,
    /UPDATE profile_facts SET state = 'user_confirmed'[\s\S]*state IN \('extracted', 'inferred', 'suggested'\)/,
  );
  assert.match(
    repository,
    /UPDATE experience_roles SET review_state = 'confirmed'[\s\S]*WHERE user_id = \? AND id = \?/,
  );
  assert.match(repository, /sourceFactsPromoted: false/);
});

test("client-authored document provenance cannot self-promote to approved profile evidence", () => {
  const {
    normalizeResumeContent,
    normalizeCoverLetterContent,
  } = evaluateFunctions(
    "app/document-repository.ts",
    [
      "boundedString",
      "isTemplate",
      "isDensity",
      "isAccent",
      "normalizeDesign",
      "normalizeResumeContent",
      "normalizeCoverLetterContent",
    ],
    ["defaultDocumentDesign"],
    [
      {
        templateKey: "executive",
        density: "comfortable",
        accent: "forest",
        fontScale: 100,
      },
    ],
  );

  const resume = normalizeResumeContent({
    targetTitle: "Director",
    summary: "Truthful summary",
    location: "Remote",
    experiences: [],
    skillGroups: [],
    design: {},
    provenance: {
      source: "approved_profile",
      unresolvedItems: [],
    },
  });
  assert.equal(resume.provenance.source, "user_authored");
  assert.ok(resume.provenance.unresolvedItems.length > 0);

  const cover = normalizeCoverLetterContent({
    employer: "Employer",
    roleTitle: "Director",
    salutation: "Hiring team,",
    paragraphs: ["Truthful paragraph."],
    closing: "Thank you.",
    signoff: "Candidate",
    design: {},
    provenance: {
      source: "approved_profile_and_posting",
      unresolvedItems: [],
    },
  });
  assert.equal(cover.provenance.source, "user_authored");
  assert.ok(cover.provenance.unresolvedItems.length > 0);

  assert.equal(
    normalizeResumeContent(
      {
        targetTitle: "Director",
        summary: "",
        location: "",
        experiences: [],
        skillGroups: [],
        design: {},
        provenance: {
          source: "approved_profile",
          unresolvedItems: [],
        },
      },
      true,
    ).provenance.source,
    "approved_profile",
    "only the explicit trusted-storage read path may preserve server provenance",
  );

  const { ast: resumeSaveAst, node: resumeSave } = findFunction(
    "app/document-repository.ts",
    "saveResumeVersion",
  );
  const { ast: coverSaveAst, node: coverSave } = findFunction(
    "app/document-repository.ts",
    "saveCoverLetterVersion",
  );
  assert.match(
    resumeSave.getText(resumeSaveAst),
    /normalizeResumeContent\(input\.content\)/,
  );
  assert.doesNotMatch(
    resumeSave.getText(resumeSaveAst),
    /normalizeResumeContent\(input\.content,\s*true\)/,
  );
  assert.match(
    coverSave.getText(coverSaveAst),
    /normalizeCoverLetterContent\(input\.content\)/,
  );
  assert.doesNotMatch(
    coverSave.getText(coverSaveAst),
    /normalizeCoverLetterContent\(input\.content,\s*true\)/,
  );
});

test("saving one semantic resume supersedes only packages that cite that resume", () => {
  const scopedInvalidation = extractedString(
    "app/document-repository.ts",
    "UPDATE pursuit_packages SET readiness_state = 'superseded'",
  );
  const boundInvalidation = bindAnonymousSql(scopedInvalidation, [
    "user-a",
    "resume-one",
  ]);
  expectSqlPass(
    `
      ${threePursuitsSql}
      INSERT INTO generated_assets
        (id, user_id, pursuit_id, type, source_versions_json,
         generation_policy_version, version, content_json, content_sha256,
         filename, page_count, review_state)
      VALUES
        ('asset-a1', 'user-a', 'pursuit-a1', 'resume',
         '{"semanticResumeId":"resume-one"}', 'renderer', 1,
         '{"fileSha256":"file-a1"}', 'content-a1', 'A1 Resume.pdf', 2,
         'claim_safe'),
        ('asset-a2', 'user-a', 'pursuit-a2', 'resume',
         '{"semanticResumeId":"resume-two"}', 'renderer', 1,
         '{"fileSha256":"file-a2"}', 'content-a2', 'A2 Resume.pdf', 2,
         'claim_safe'),
        ('asset-b1', 'user-b', 'pursuit-b1', 'resume',
         '{"semanticResumeId":"resume-one"}', 'renderer', 1,
         '{"fileSha256":"file-b1"}', 'content-b1', 'B1 Resume.pdf', 2,
         'claim_safe');
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a1', 'user-a', 'pursuit-a1', 1,
         'https://employer.test/a1/apply', 'version-a1', '{}',
         '{"assets":[{"id":"asset-a1"}]}', '[]', 'payload-a1',
         'ready_for_review'),
        ('package-a2', 'user-a', 'pursuit-a2', 1,
         'https://employer.test/a2/apply', 'version-a2', '{}',
         '{"assets":[{"id":"asset-a2"}]}', '[]', 'payload-a2',
         'ready_for_review'),
        ('package-b1', 'user-b', 'pursuit-b1', 1,
         'https://employer.test/b1/apply', 'version-b1', '{}',
         '{"assets":[{"id":"asset-b1"}]}', '[]', 'payload-b1',
         'ready_for_review');
      ${boundInvalidation};
      SELECT id || ':' || readiness_state
        FROM pursuit_packages
       ORDER BY id;
    `,
    [
      "package-a1:superseded",
      "package-a2:ready_for_review",
      "package-b1:ready_for_review",
    ].join("\n"),
  );
});

test("render receipts stay draft, reject cross-tenant IDs, and cannot authorize a package", () => {
  for (const functionName of [
    "recordResumeRender",
    "recordCoverLetterRender",
  ]) {
    const { node } = findFunction("app/document-repository.ts", functionName);
    const strings = literalStrings(node);
    const insert = strings.find(
      (value) =>
        value.startsWith("INSERT INTO generated_assets") &&
        value.includes("client-render-receipt-v1"),
    );
    assert.ok(insert, `${functionName} must persist a render receipt`);
    assert.match(insert, /'client-render-receipt-v1'[\s\S]*'draft'\)/);
    assert.doesNotMatch(insert, /'claim_safe'/);
  }

  const resumeLookup = extractedString(
    "app/document-repository.ts",
    "SELECT r.id, r.version, r.content_json",
  );
  const coverLookup = extractedString(
    "app/document-repository.ts",
    "SELECT ga.id, ga.pursuit_id, ga.version, ga.content_json",
  );
  for (const lookup of [resumeLookup, coverLookup]) {
    assert.match(
      lookup,
      /jpv\.job_posting_id = jp\.id AND jpv\.description_checksum = jp\.description_checksum/,
    );
    assert.doesNotMatch(lookup, /ORDER BY latest\.source_checked_at/);
  }
  expectSqlPass(
    `
      ${threePursuitsSql}
      INSERT INTO resumes
        (id, user_id, name, kind, version, content_json, template_key)
      VALUES
        ('resume-a', 'user-a', 'A Resume', 'job', 1, '{}', 'executive'),
        ('resume-b', 'user-b', 'B Resume', 'job', 1, '{}', 'executive');
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope, job_posting_id)
      VALUES
        ('assignment-a', 'user-a', 'resume-a', 'job', 'job-a1'),
        ('assignment-b', 'user-b', 'resume-b', 'job', 'job-b1');
      INSERT INTO generated_assets
        (id, user_id, pursuit_id, type, source_versions_json,
         generation_policy_version, version, content_json, content_sha256,
         filename, page_count, review_state)
      VALUES
        ('cover-a', 'user-a', 'pursuit-a1', 'cover_letter', '{}',
         'semantic', 1, '{}', 'cover-a-hash', 'A Cover.pdf', 1, 'draft'),
        ('cover-b', 'user-b', 'pursuit-b1', 'cover_letter', '{}',
         'semantic', 1, '{}', 'cover-b-hash', 'B Cover.pdf', 1, 'draft');
      SELECT
        (SELECT count(*) FROM (${bindAnonymousSql(resumeLookup, ["resume-b", "user-a"])})) || ':' ||
        (SELECT count(*) FROM (${bindAnonymousSql(resumeLookup, ["resume-b", "user-b"])})) || ':' ||
        (SELECT count(*) FROM (${bindAnonymousSql(coverLookup, ["cover-b", "user-a"])})) || ':' ||
        (SELECT count(*) FROM (${bindAnonymousSql(coverLookup, ["cover-b", "user-b"])}));
    `,
    "0:1:0:1",
  );

  expectSqlPass(
    `
      ${threePursuitsSql}
      UPDATE job_postings
         SET description_checksum = 'hash-a1-b'
       WHERE id = 'job-a1';
      INSERT INTO job_posting_versions
        (id, job_posting_id, source_checked_at, source_url,
         description_checksum, source_facts_json, source_conflicts_json,
         capture_state)
      VALUES
        ('version-a1-b', 'job-a1', 200, 'https://employer.test/a1',
         'hash-a1-b', '{}', '[]', 'verified');
      UPDATE job_postings
         SET description_checksum = 'hash-a1'
       WHERE id = 'job-a1';
      INSERT INTO resumes
        (id, user_id, name, kind, version, content_json, template_key)
      VALUES
        ('resume-a-reversion', 'user-a', 'A Resume', 'job', 1, '{}',
         'executive');
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope, job_posting_id)
      VALUES
        ('assignment-a-reversion', 'user-a', 'resume-a-reversion', 'job',
         'job-a1');
      INSERT INTO generated_assets
        (id, user_id, pursuit_id, type, source_versions_json,
         generation_policy_version, version, content_json, content_sha256,
         filename, page_count, review_state)
      VALUES
        ('cover-a-reversion', 'user-a', 'pursuit-a1', 'cover_letter', '{}',
         'semantic', 1, '{}', 'cover-a-reversion-hash', 'A Cover.pdf', 1,
         'draft');
      SELECT
        (SELECT job_posting_version_id
           FROM (${bindAnonymousSql(resumeLookup, ["resume-a-reversion", "user-a"])})) ||
        ':' ||
        (SELECT job_posting_version_id
           FROM (${bindAnonymousSql(coverLookup, ["cover-a-reversion", "user-a"])}));
    `,
    "version-a1:version-a1",
  );

  expectSqlReject(
    `
      ${threePursuitsSql}
      INSERT INTO generated_assets
        (id, user_id, pursuit_id, type, source_versions_json,
         generation_policy_version, version, content_json, content_sha256,
         filename, page_count, review_state)
      VALUES
        ('cross-tenant-render', 'user-a', 'pursuit-b1', 'resume', '{}',
         'client-render-receipt-v1', 1, '{}', 'hash', 'Resume.pdf', 2,
         'draft');
    `,
    /FOREIGN KEY constraint failed/,
  );

  const draftManifest = JSON.stringify({
    assets: [
      {
        id: "resume-draft",
        type: "resume",
        version: 1,
        contentSha256: "resume-content",
        fileSha256: "resume-file",
        filename: "Employer A1 - Director A1 - Candidate - Resume.pdf",
        pageCount: 2,
        reviewState: "draft",
      },
      {
        id: "cover-safe",
        type: "cover_letter",
        version: 1,
        contentSha256: "cover-content",
        fileSha256: "cover-file",
        filename: "Employer A1 - Director A1 - Candidate - Cover Letter.pdf",
        pageCount: 1,
        reviewState: "claim_safe",
      },
    ],
  });
  expectSqlReject(
    `
      ${threePursuitsSql}
      INSERT INTO generated_assets
        (id, user_id, pursuit_id, type, source_versions_json,
         generation_policy_version, version, content_json, content_sha256,
         filename, page_count, review_state)
      VALUES
        ('resume-draft', 'user-a', 'pursuit-a1', 'resume',
         '{"jobPostingVersionId":"version-a1","analysisId":null}',
         'client-render-receipt-v1', 1, '{"fileSha256":"resume-file"}',
         'resume-content',
         'Employer A1 - Director A1 - Candidate - Resume.pdf', 2, 'draft'),
        ('cover-safe', 'user-a', 'pursuit-a1', 'cover_letter',
         '{"jobPostingVersionId":"version-a1","analysisId":null}',
         'semantic', 1, '{"fileSha256":"cover-file"}', 'cover-content',
         'Employer A1 - Director A1 - Candidate - Cover Letter.pdf', 1,
         'claim_safe');
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-draft', 'user-a', 'pursuit-a1', 1,
         'https://employer.test/a1/apply', 'version-a1',
         '{"questionSetChecksum":"form-a1"}',
         '${draftManifest}', '[]', 'payload-draft', 'ready_for_review');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state)
      VALUES
        ('approval-draft', 'user-a', 'package-draft',
         'approve_application_package', 'payload-draft', 'approved');
    `,
    /approval (?:package, source version, form answers, or outbound assets are not exact and current|outbound file no longer matches the current semantic document)/,
  );
});

test("resume import keeps raw bytes on-device and sends only the extracted receipt fields", () => {
  const { ast, node: experienceStep } = findFunction(
    "app/OnboardingFlow.tsx",
    "ExperienceStep",
  );
  let filePayload = null;
  const propertyName = (property) => {
    if (
      ts.isIdentifier(property.name) ||
      ts.isStringLiteral(property.name)
    ) {
      return property.name.text;
    }
    return null;
  };
  const visit = (node) => {
    if (
      ts.isObjectLiteralExpression(node) &&
      node.properties.some(
        (property) =>
          ts.isPropertyAssignment(property) &&
          propertyName(property) === "method" &&
          ts.isStringLiteral(property.initializer) &&
          property.initializer.text === "file",
      )
    ) {
      filePayload = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(experienceStep);
  assert.ok(filePayload, "expected the locally parsed file receipt payload");
  assert.deepEqual(
    filePayload.properties
      .map(propertyName)
      .filter(Boolean)
      .sort(),
    [
      "byteSize",
      "clientFileChecksumSha256",
      "contentType",
      "extractedText",
      "method",
      "originalName",
      "pageCount",
      "parser",
    ].sort(),
  );

  const { node: postStep } = findFunction(
    "app/OnboardingFlow.tsx",
    "postStep",
  );
  const postText = postStep.getText(ast);
  assert.match(postText, /body:\s*JSON\.stringify\(payload\)/);
  assert.doesNotMatch(postText, /FormData|Blob|FileReader|arrayBuffer|base64/i);
  assert.match(read("app/resume-import.ts"), /await file\.arrayBuffer\(\)/);
  assert.doesNotMatch(
    read("app/onboarding-types.ts"),
    /\b(?:rawFile|fileBytes|arrayBuffer|base64|blob)\b/i,
  );
});

test("employer ATS versions bind every decision snapshot to one posting identity", async () => {
  const sha256Hex = async (value) => {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value),
    );
    return Buffer.from(digest).toString("hex");
  };
  const {
    canonicalJson,
    jobPostingVersionId,
    greenhouseDecisionSnapshot,
  } = evaluateFunctions(
    "app/workspace-repository.ts",
    [
      "canonicalize",
      "canonicalJson",
      "jobPostingVersionId",
      "greenhouseDecisionSnapshot",
    ],
    ["sha256Hex"],
    [sha256Hex],
  );

  const baseJob = {
    id: 123,
    title: "Director, Lifecycle Marketing",
    updated_at: "2026-07-30T12:00:00Z",
    absolute_url: "https://job-boards.greenhouse.io/acme/jobs/123",
    content: "<p>Own lifecycle strategy and execution.</p>",
    company_name: "Acme",
    location: { name: "Remote" },
    departments: [{ id: 1, name: "Marketing" }],
    offices: [{ id: 2, name: "Remote" }],
    metadata: [{ id: 3, name: "Employment Type", value: "Full-time" }],
    pay_input_ranges: [
      {
        min_cents: 17_500_000,
        max_cents: 19_000_000,
        currency_type: "USD",
      },
    ],
    first_published: "2026-07-10T00:00:00Z",
    application_deadline: "2026-08-15",
  };
  const questionSet = [
    {
      label: "First name",
      required: true,
      fields: [{ name: "first_name", type: "input_text", values: [] }],
    },
  ];
  const questionSetChecksum = "f".repeat(64);
  const snapshotFor = (job) =>
    greenhouseDecisionSnapshot(
      job,
      questionSet,
      questionSetChecksum,
      job.company_name,
      job.absolute_url,
    );
  const checksumFor = (job) => sha256Hex(canonicalJson(snapshotFor(job)));
  const baseChecksum = await checksumFor(baseJob);

  const metadataOnly = {
    ...baseJob,
    metadata: [
      { id: 3, name: "Employment Type", value: "Contract" },
    ],
  };
  const titleOnly = {
    ...baseJob,
    title: "Senior Director, Lifecycle Marketing",
  };
  const urlOnly = {
    ...baseJob,
    absolute_url: "https://job-boards.greenhouse.io/acme/jobs/123-new",
  };
  assert.notEqual(await checksumFor(metadataOnly), baseChecksum);
  assert.notEqual(await checksumFor(titleOnly), baseChecksum);
  assert.notEqual(await checksumFor(urlOnly), baseChecksum);

  const firstVersionId = await jobPostingVersionId("job_first", baseChecksum);
  const secondVersionId = await jobPostingVersionId("job_second", baseChecksum);
  assert.notEqual(firstVersionId, secondVersionId);
  assert.match(firstVersionId, /^jobver_[a-f0-9]{24}$/);
  assert.match(secondVersionId, /^jobver_[a-f0-9]{24}$/);

  const { ast } = sourceFile("app/workspace-repository.ts");
  const greenhouseSource = findFunction(
    "app/workspace-repository.ts",
    "ingestGreenhouseJob",
  ).node.getText(ast);
  const leverSource = findFunction(
    "app/workspace-repository.ts",
    "ingestLeverJob",
  ).node.getText(ast);
  const ashbySource = findFunction(
    "app/workspace-repository.ts",
    "ingestAshbyJob",
  ).node.getText(ast);
  for (const source of [greenhouseSource, leverSource, ashbySource]) {
    assert.match(
      source,
      /jobPostingVersionId\(postingId, descriptionChecksum\)/,
    );
  }
  assert.match(
    greenhouseSource,
    /sha256Hex\(canonicalJson\(sourceSnapshot\)\)/,
  );
  const ashbyReceipt = ashbySource.slice(
    ashbySource.indexOf("const sourceReceipt"),
    ashbySource.indexOf("const sourceFacts"),
  );
  assert.doesNotMatch(ashbyReceipt, /checkedAt/);
});

test("Lever intake accepts only canonical employer URLs and records freshness with an atomic audit trail", () => {
  const { parseLeverUrl, employerFromLeverSite, freshnessFromPostedAt } =
    evaluateFunctions(
      "app/workspace-repository.ts",
      ["parseLeverUrl", "employerFromLeverSite", "freshnessFromPostedAt"],
      [],
      [],
    );

  assert.deepEqual(
    parseLeverUrl(
      "https://jobs.lever.co/wpromote/482ab269-e946-4b91-ae0d-ea49d681d60e",
    ),
    {
      site: "wpromote",
      jobId: "482ab269-e946-4b91-ae0d-ea49d681d60e",
    },
  );
  assert.equal(employerFromLeverSite("way-ahead"), "Way Ahead");
  assert.throws(
    () =>
      parseLeverUrl(
        "https://example.test/wpromote/482ab269-e946-4b91-ae0d-ea49d681d60e",
      ),
    /direct jobs\.lever\.co/,
  );
  assert.throws(
    () => parseLeverUrl("http://jobs.lever.co/wpromote/not-a-job"),
    /direct jobs\.lever\.co/,
  );

  const day = 24 * 60 * 60 * 1000;
  const now = 100 * day;
  assert.equal(freshnessFromPostedAt(now - 5 * day, now), "fresh");
  assert.equal(freshnessFromPostedAt(now - 31 * day, now), "stale_risk");
  assert.equal(freshnessFromPostedAt(now - 61 * day, now), "stale");
  assert.equal(freshnessFromPostedAt(null, now), "unknown");

  const repository = read("app/workspace-repository.ts");
  assert.match(
    repository,
    /https:\/\/api\.lever\.co\/v0\/postings\/\$\{encodeURIComponent\(site\)\}\/\$\{encodeURIComponent\(jobId\)\}\?mode=json/,
  );
  assert.match(repository, /contentLength > 1_000_000/);
  assert.match(repository, /await db\.batch\(\[[\s\S]*'lever_job_ingested'/);
  assert.match(repository, /'lever-public-postings-api-2026-07'/);

  const route = read("app/api/jobs/intake/route.ts");
  assert.match(route, /requireUserRequest\(request\)/);
  assert.match(route, /requireSameOrigin\(request\)/);
  assert.match(route, /readBoundedJson\(request, 15_000\)/);
  assert.match(route, /ingestEmployerJob\(actor, payload\.url\)/);

  const app = read("app/WayAheadApp.tsx");
  assert.match(app, /fetch\("\/api\/jobs\/intake"/);
  assert.match(app, /direct Greenhouse, Lever, or Ashby job URL/);
  assert.doesNotMatch(app, /fetch\("\/api\/jobs\/greenhouse"/);
});

test("Ashby intake verifies one listed canonical requisition from a bounded mocked board feed", async () => {
  const {
    parseAshbyUrl,
    readBoundedAshbyFeed,
    fetchAshbyJob,
    employerFromAshbyBoard,
  } = evaluateFunctions(
    "app/workspace-repository.ts",
    [
      "parseAshbyUrl",
      "readBoundedAshbyFeed",
      "selectListedAshbyJob",
      "fetchAshbyJob",
      "employerFromAshbyBoard",
    ],
    [],
    [],
  );
  const jobId = "0095e055-2b79-4dab-878b-4b723b873b8f";
  const canonicalJobUrl = `https://jobs.ashbyhq.com/going/${jobId}`;
  const canonicalApplyUrl = `${canonicalJobUrl}/application`;
  const listedJob = {
    id: jobId,
    title: "Director, Lifecycle Marketing",
    location: "Remote",
    secondaryLocations: [],
    department: "Marketing",
    team: "Marketing",
    isListed: true,
    isRemote: true,
    workplaceType: "Remote",
    descriptionPlain: "Own lifecycle strategy and execution.",
    publishedAt: "2026-07-10T19:03:55.757+00:00",
    employmentType: "FullTime",
    jobUrl: canonicalJobUrl,
    applyUrl: canonicalApplyUrl,
    compensation: {
      summaryComponents: [
        {
          compensationType: "Salary",
          interval: "1 YEAR",
          currencyCode: "USD",
          minValue: 175000,
          maxValue: 190000,
        },
      ],
    },
  };
  const responseFor = (jobs, status = 200, headers = {}) =>
    new Response(JSON.stringify({ apiVersion: "1", jobs }), {
      status,
      headers: { "content-type": "application/json", ...headers },
    });

  assert.deepEqual(parseAshbyUrl(canonicalJobUrl), {
    board: "going",
    jobId,
    kind: "job",
  });
  assert.deepEqual(parseAshbyUrl(canonicalApplyUrl), {
    board: "going",
    jobId,
    kind: "application",
  });
  assert.deepEqual(
    parseAshbyUrl(
      `https://jobs.ashbyhq.com/Jasper%20AI/${jobId.toUpperCase()}`,
    ),
    {
      board: "Jasper AI",
      jobId,
      kind: "job",
    },
  );
  assert.equal(employerFromAshbyBoard("going"), "Going");
  assert.equal(employerFromAshbyBoard("jasper-ai"), "Jasper Ai");
  assert.throws(
    () => parseAshbyUrl(`http://jobs.ashbyhq.com/going/${jobId}`),
    /canonical HTTPS jobs\.ashbyhq\.com/,
  );
  assert.throws(
    () => parseAshbyUrl(`${canonicalJobUrl}?utm_source=wrapper`),
    /canonical HTTPS jobs\.ashbyhq\.com/,
  );
  assert.throws(
    () => parseAshbyUrl(`https://example.test/going/${jobId}`),
    /canonical HTTPS jobs\.ashbyhq\.com/,
  );

  const requests = [];
  const result = await fetchAshbyJob("going", jobId, async (url, init) => {
    requests.push({ url, init });
    return responseFor([listedJob]);
  });
  assert.equal(
    requests[0].url,
    "https://api.ashbyhq.com/posting-api/job-board/going?includeCompensation=true",
  );
  assert.equal(requests[0].init.redirect, "manual");
  assert.equal(requests[0].init.signal instanceof AbortSignal, true);
  assert.equal(result.job.id, jobId);
  assert.equal(result.job.title, "Director, Lifecycle Marketing");
  assert.equal(result.job.isListed, true);

  await assert.rejects(
    fetchAshbyJob("going", jobId, async () =>
      new Response(null, {
        status: 302,
        headers: { location: "https://example.test/untrusted-wrapper" },
      })),
    /redirected unexpectedly/,
  );
  await assert.rejects(
    fetchAshbyJob("going", jobId, async () => responseFor([])),
    /no longer lists this Ashby job/,
  );
  await assert.rejects(
    fetchAshbyJob("going", jobId, async () =>
      responseFor([{ ...listedJob, isListed: false }]),
    ),
    /unlisted and cannot be added/,
  );
  await assert.rejects(
    fetchAshbyJob("going", jobId, async () =>
      responseFor([
        {
          ...listedJob,
          id: "11111111-2222-4333-8444-555555555555",
        },
      ]),
    ),
    /no longer lists this Ashby job/,
  );
  await assert.rejects(
    fetchAshbyJob("going", jobId, async () =>
      responseFor([
        {
          ...listedJob,
          jobUrl: `https://jobs.ashbyhq.com/wrong-board/${jobId}`,
          applyUrl: `https://jobs.ashbyhq.com/wrong-board/${jobId}/application`,
        },
      ]),
    ),
    /do not match this Ashby board and requisition/,
  );
  await assert.rejects(
    fetchAshbyJob("going", jobId, async () =>
      responseFor([{ ...listedJob, title: " " }]),
    ),
    /incomplete job record/,
  );
  await assert.rejects(
    readBoundedAshbyFeed(
      responseFor([listedJob], 200, { "content-length": "2000001" }),
    ),
    /larger than this alpha accepts/,
  );

  const repository = read("app/workspace-repository.ts");
  assert.match(
    repository,
    /https:\/\/api\.ashbyhq\.com\/posting-api\/job-board\/\$\{encodeURIComponent\(board\)\}\?includeCompensation=true/,
  );
  assert.match(repository, /descriptionPlain: job\.descriptionPlain/);
  assert.match(repository, /board_slug_fallback/);
  assert.match(repository, /verifiedEmployerName: false/);
  assert.match(repository, /not_exposed_by_ashby_public_job_postings_api/);
  assert.match(repository, /approved_for_private_user_requested_analysis_only/);
  assert.match(repository, /'ashby_job_ingested'/);
  assert.match(repository, /const user = await ensureUser\(actor\)/);
  assert.match(
    repository,
    /sha256Hex\(`\$\{user\.id\}:\$\{postingId\}`\)/,
  );

  expectSqlPass(
    `
      ${tenantUsersSql}
      INSERT INTO job_sources
        (id, name, kind, rights_state, terms_version)
      VALUES
        ('ashby-going', 'going Ashby board (employer name unverified)', 'employer_ats', 'approved', 'ashby-public-job-postings-api-2026-07');
      INSERT INTO job_postings
        (id, source_id, external_id, canonical_url, employer, title, description_checksum)
      VALUES
        ('going-role', 'ashby-going', '${jobId}', '${canonicalJobUrl}', 'going', 'Director, Lifecycle Marketing', 'checksum');
      INSERT INTO user_job_links
        (id, user_id, job_posting_id, source, state)
      VALUES
        ('link-a', 'user-a', 'going-role', 'user_added', 'active');
      SELECT
        (SELECT count(*) FROM job_postings jp
          WHERE EXISTS (
            SELECT 1 FROM user_job_links ujl
            WHERE ujl.user_id = 'user-a'
              AND ujl.job_posting_id = jp.id
              AND ujl.state = 'active'
          ))
        || '|'
        || (SELECT count(*) FROM job_postings jp
          WHERE EXISTS (
            SELECT 1 FROM user_job_links ujl
            WHERE ujl.user_id = 'user-b'
              AND ujl.job_posting_id = jp.id
              AND ujl.state = 'active'
          ));
    `,
    "1|0",
  );
});

test("operator analysis is exact-version bound, deliberate, auditable, and absent from customer job screens", () => {
  const { ast, node } = findFunction(
    "app/workspace-repository.ts",
    "recordOwnerOpportunityAnalysis",
  );
  const source = node.getText(ast);

  assert.match(source, /const owner = await ensureFounder\(actor\)/);
  assert.match(source, /input\.confirmation !== "record_reviewed_analysis"/);
  assert.match(
    source,
    /sourceVersion\.id !== sourceVersionId[\s\S]*employer source changed/,
  );
  assert.match(source, /posting\.rights_state !== "approved"/);
  assert.match(source, /career_paths WHERE id = \? AND user_id = \?/);
  assert.match(source, /job_standards WHERE user_id = \?/);
  assert.match(source, /jobVersionId: sourceVersion\.id/);
  assert.match(source, /externalActionAuthorized: false/);
  assert.match(source, /await db\.batch\(\[[\s\S]*owner_opportunity_analysis_recorded/);
  assert.doesNotMatch(source, /submissionEnabled:\s*true|externalActionAuthorized:\s*true/);

  const route = read("app/api/operator-analysis/route.ts");
  assert.match(route, /requireUserRequest\(request\)/);
  assert.match(route, /requireSameOrigin\(request\)/);
  assert.match(route, /readBoundedJson\(request, 30_000\)/);

  const app = read("app/WayAheadApp.tsx");
  assert.match(app, /canRecordOperatorAnalysis/);
  assert.match(app, /This changes the account&apos;s private scoreboard only/);
  assert.match(app, /record_reviewed_analysis/);
  assert.match(app, /does not generate,[\s\S]*populate, upload, send, or submit/);
  assert.doesNotMatch(app, /<OwnerAnalysisPanel/);
  assert.doesNotMatch(app, /Owner analysis receipt/);
});

test("account export, deletion, and restart stay same-origin and authenticated-account scoped", () => {
  const repository = read("app/account-repository.ts");
  const datasetsBlock = repository.match(
    /export const ACCOUNT_EXPORT_DATASETS:[\s\S]*?=\s*\[([\s\S]*?)\]\s*as const;/,
  );
  assert.ok(datasetsBlock, "expected the account export dataset contract");
  const datasets = [
    ...datasetsBlock[1].matchAll(
      /key:\s*"([^"]+)",\s*sql:\s*"([^"]+)",\s*userIdBindings:\s*(\d+)/g,
    ),
  ].map((match) => ({
    key: match[1],
    sql: match[2],
    bindings: Number(match[3]),
  }));
  assert.ok(datasets.length >= 30, "expected a comprehensive account export");
  for (const dataset of datasets) {
    assert.ok(dataset.bindings >= 1, `${dataset.key} must be account scoped`);
    assert.equal(
      (dataset.sql.match(/\?/g) ?? []).length,
      dataset.bindings,
      `${dataset.key} binding count must match its SQL`,
    );
  }
  const compiled = runSql(
    datasets
      .map((dataset) =>
        `${bindAnonymousSql(
          dataset.sql,
          Array.from({ length: dataset.bindings }, () => "user-a"),
        )};`,
      )
      .join("\n"),
    { integrityTriggers: false },
  );
  assert.equal(
    compiled.status,
    0,
    `Every export query must compile against the current schema:\n${compiled.stderr}`,
  );

  const routes = [
    "app/api/account/route.ts",
    "app/api/account/export/route.ts",
    "app/api/account/restart/route.ts",
  ].map(read);
  for (const route of routes) {
    assert.match(route, /requireUserRequest\(request\)/);
    assert.match(route, /requireSameOrigin\(request\)/);
    assert.match(route, /readBoundedJson\(request, 2_000\)/);
    assert.doesNotMatch(route, /payload\.(?:userId|email|tenantId)/);
  }

  assert.match(repository, /ACCOUNT_DELETION_CONFIRMATION/);
  assert.match(repository, /user\.role !== "member"/);
  assert.match(repository, /action = 'account_deleted'/);
  assert.match(repository, /user_id IS NULL/);
  assert.match(repository, /ACCOUNT_RESTART_CONFIRMATION/);
});

test("explicit account purge removes one tenant while preserving another and shared jobs", () => {
  const repository = read("app/account-repository.ts");
  const purgeBlock = repository.match(
    /export const ACCOUNT_PURGE_SQL:[\s\S]*?=\s*\[([\s\S]*?)\]\s*as const;/,
  );
  assert.ok(purgeBlock, "expected an explicit dependency-ordered purge");
  const purgeStatements = [
    ...purgeBlock[1].matchAll(/"([^"]+)"/g),
  ].map((match) => match[1]);
  assert.ok(purgeStatements.length >= 20);
  assert.ok(
    purgeStatements.some((sql) => sql.includes("DELETE FROM user_job_links")),
  );
  assert.ok(
    purgeStatements.some((sql) => sql.includes("DELETE FROM cost_events")),
  );

  const fixture = `
    INSERT INTO users
      (id, auth_subject, identity_provider, role, email, display_name, lifecycle_state)
    VALUES
      ('user-a', 'chatgpt:a@example.com', 'chatgpt', 'member', 'a@example.com', 'A', 'alpha_active'),
      ('user-b', 'chatgpt:b@example.com', 'chatgpt', 'member', 'b@example.com', 'B', 'alpha_active');
    INSERT INTO source_imports
      (id, user_id, type, checksum_sha256, parse_state)
    VALUES
      ('import-a', 'user-a', 'pasted_text', 'hash-a', 'review_ready'),
      ('import-b', 'user-b', 'pasted_text', 'hash-b', 'review_ready');
    INSERT INTO profile_facts
      (id, user_id, source_import_id, fact_type, value_json, state)
    VALUES
      ('fact-a', 'user-a', 'import-a', 'headline', '{"value":"A"}', 'user_confirmed'),
      ('fact-b', 'user-b', 'import-b', 'headline', '{"value":"B"}', 'user_confirmed');
    INSERT INTO job_sources
      (id, name, kind, rights_state)
    VALUES ('source-shared', 'Shared Employer ATS', 'employer_ats', 'approved');
    INSERT INTO job_postings
      (id, source_id, external_id, canonical_url, employer, title, description_checksum)
    VALUES
      ('job-shared', 'source-shared', 'external-1', 'https://example.com/job', 'Example', 'Director', 'job-hash');
    INSERT INTO user_job_links
      (id, user_id, job_posting_id, source, state)
    VALUES
      ('link-a', 'user-a', 'job-shared', 'user_added', 'active'),
      ('link-b', 'user-b', 'job-shared', 'user_added', 'active');
    INSERT INTO cost_events
      (id, stream, category, unit_name, units_micros, rate_micros_per_unit, amount_micros, estimate_state, cash_state, rate_card_version, user_id, incurred_at)
    VALUES
      ('cost-a', 'software', 'other', 'request', 1000000, 1, 1, 'estimated', 'cash', 'test-v1', 'user-a', 1);
  `;

  const directDelete = runSql(
    `${fixture}\nDELETE FROM users WHERE id = 'user-a';`,
    { integrityTriggers: false },
  );
  assert.notEqual(
    directDelete.status,
    0,
    "a direct user delete must not bypass retained dependency rows",
  );
  assert.match(directDelete.stderr, /FOREIGN KEY constraint failed/);

  const purgeSql = purgeStatements
    .map((sql) => `${bindAnonymousSql(sql, ["user-a"])};`)
    .join("\n");
  const explicitDelete = runSql(
    `
      ${fixture}
      ${purgeSql}
      INSERT INTO usage_events
        (id, user_id, action, policy_version, result_state, workload_ref, metadata_json)
      VALUES
        ('deletion-a', 'user-a', 'account_deleted', 'public-alpha-2026-07-23', 'completed', 'deleted_identity:a', '{}');
      DELETE FROM users WHERE id = 'user-a' AND role = 'member';
      SELECT count(*) FROM users WHERE id = 'user-a';
      SELECT count(*) FROM source_imports WHERE user_id = 'user-a';
      SELECT count(*) FROM profile_facts WHERE user_id = 'user-a';
      SELECT count(*) FROM users WHERE id = 'user-b';
      SELECT count(*) FROM profile_facts WHERE user_id = 'user-b';
      SELECT count(*) FROM user_job_links WHERE user_id = 'user-b';
      SELECT count(*) FROM job_postings WHERE id = 'job-shared';
      SELECT count(*) FROM usage_events
        WHERE id = 'deletion-a' AND user_id IS NULL;
    `,
    { integrityTriggers: false },
  );
  assert.equal(
    explicitDelete.status,
    0,
    `the explicit purge must satisfy the current FK graph:\n${explicitDelete.stderr}`,
  );
  assert.equal(explicitDelete.stdout.trim(), "0\n0\n0\n1\n1\n1\n1\n1");
});

test("member job visibility is explicitly linked and ingestion creates only the current user's link", () => {
  const repository = read("app/workspace-repository.ts");
  assert.match(
    repository,
    /EXISTS \(SELECT 1 FROM user_job_links ujl WHERE ujl\.user_id = \? AND ujl\.job_posting_id = jp\.id AND ujl\.state = 'active'\)/,
  );
  assert.match(
    repository,
    /\.bind\(founder\.id, founder\.id, founder\.id, founder\.id\)/,
  );
  assert.ok(
    (repository.match(/INSERT INTO user_job_links/g) ?? []).length >= 4,
    "bootstrap, intake, and pursuit creation must preserve user-job ownership",
  );
  assert.match(
    repository,
    /ON CONFLICT\(user_id, job_posting_id\) DO UPDATE SET state = 'active'/,
  );
});
