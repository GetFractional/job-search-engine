import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const migrationNames = readdirSync(new URL("../drizzle/", import.meta.url))
  .filter((name) => name.endsWith(".sql"))
  .sort();

assert.ok(migrationNames.length > 0, "expected at least one generated SQL migration");

const rawMigrationSqlByName = new Map(
  migrationNames.map((migrationName) => [
    migrationName,
    readFileSync(new URL(`../drizzle/${migrationName}`, import.meta.url), "utf8"),
  ]),
);

const integrityTriggerDefinitions = JSON.parse(
  readFileSync(new URL("../db/integrity-triggers.json", import.meta.url), "utf8"),
);
const sitesV1StaleTriggerDefinitions = JSON.parse(
  readFileSync(
    new URL("./sites-v1-stale-integrity-triggers.json", import.meta.url),
    "utf8",
  ),
);

assert.equal(
  integrityTriggerDefinitions.length,
  56,
  "expected the complete production integrity-trigger set",
);

const runtimeIntegritySql = integrityTriggerDefinitions
  .map(({ sql }) => sql)
  .join("\n");

const migrationSqlByName = new Map(
  [...rawMigrationSqlByName].map(([migrationName, migrationSqlText]) => [
    migrationName,
    migrationSqlText.replaceAll("--> statement-breakpoint", ""),
  ]),
);

const migrationSql = [
  ...migrationSqlByName.values(),
  runtimeIntegritySql,
].join("\n");

const runSql = (sql, { includeMigration = true } = {}) =>
  spawnSync("/usr/bin/sqlite3", [":memory:"], {
    input: [
      ".bail on",
      "PRAGMA foreign_keys=ON;",
      includeMigration ? migrationSql : "",
      sql,
    ].join("\n"),
    encoding: "utf8",
  });

const expectSqlPass = (sql, expectedOutput = "") => {
  const result = runSql(sql);
  assert.equal(
    result.status,
    0,
    `SQLite contract unexpectedly failed:\n${result.stderr}`,
  );
  assert.equal(result.stdout.trim(), expectedOutput);
};

const expectSqlReject = (sql, pattern) => {
  const result = runSql(sql);
  assert.notEqual(result.status, 0, "expected SQLite to reject the invariant breach");
  assert.match(result.stderr, pattern);
};

const usersSql = `
  INSERT INTO users (id, auth_subject, email) VALUES
    ('user-a', 'auth-a', 'a@example.test'),
    ('user-b', 'auth-b', 'b@example.test');
`;

const sourceAndFactSql = `
  ${usersSql}
  INSERT INTO source_imports
    (id, user_id, type, checksum_sha256)
  VALUES
    ('import-a', 'user-a', 'resume_pdf', 'hash-a'),
    ('import-b', 'user-b', 'resume_pdf', 'hash-b');
  INSERT INTO profile_facts
    (id, user_id, source_import_id, fact_type, value_json, source_span,
     extraction_method, extraction_policy_version, state)
  VALUES
    ('fact-a1', 'user-a', 'import-a', 'role_title', '{"value":"Director"}', 'p1:l2',
     'deterministic_parser', 'parser-1', 'extracted'),
    ('fact-a2', 'user-a', 'import-a', 'role_employer', '{"value":"Acme"}', 'p1:l1',
     'model_extraction', 'extractor-2', 'suggested'),
    ('fact-b1', 'user-b', 'import-b', 'role_title', '{"value":"Manager"}', 'p1:l2',
     'deterministic_parser', 'parser-1', 'extracted');
`;

const rolesSql = `
  ${sourceAndFactSql}
  INSERT INTO experience_roles (id, user_id, employer, title) VALUES
    ('role-a1', 'user-a', 'Acme', 'Director'),
    ('role-a2', 'user-a', 'Acme', 'Head of Growth'),
    ('role-b1', 'user-b', 'Beta', 'Manager');
`;

const resumeFixtureSql = `
  ${usersSql}
  INSERT INTO career_paths
    (id, user_id, label, primary_lane, state, is_primary)
  VALUES
    ('path-a', 'user-a', 'Revenue Operations', 'revenue_operations', 'active', 1);
  INSERT INTO resumes
    (id, user_id, name, kind, version, content_json, template_key)
  VALUES
    ('resume-default', 'user-a', 'Master', 'master', 1, '{}', 'ats-basic'),
    ('resume-path', 'user-a', 'Revenue Operations', 'path', 1, '{}', 'ats-basic'),
    ('resume-job', 'user-a', 'Acme Director', 'job', 1, '{}', 'ats-basic'),
    ('resume-b', 'user-b', 'Master', 'master', 1, '{}', 'ats-basic');
  INSERT INTO job_sources (id, name, kind, rights_state)
    VALUES ('source-1', 'Acme ATS', 'employer_ats', 'approved');
  INSERT INTO job_postings
    (id, source_id, external_id, canonical_url, employer, title, description_checksum)
  VALUES
    ('job-1', 'source-1', 'ext-1', 'https://example.test/job-1', 'Acme', 'Director', 'jd-hash');
`;

test("applies the 36-table migration with foreign keys intact", () => {
  expectSqlPass(
    `
      SELECT count(*) FROM sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
      SELECT count(*) FROM pragma_foreign_key_check;
      SELECT count(*) || ':' || count(DISTINCT id) || ':' || min(on_delete)
        FROM pragma_foreign_key_list('usage_events')
       WHERE "table" = 'cost_events';
      SELECT on_delete
        FROM pragma_foreign_key_list('cost_events')
       WHERE "table" = 'cost_allocation_groups'
         AND "from" = 'allocation_group_id';
    `,
    "36\n0\n2:1:SET NULL\nRESTRICT",
  );
});

test("applies every migration statement across fresh SQLite connections", () => {
  const migrationDirectory = mkdtempSync(join(tmpdir(), "way-ahead-d1-migrations-"));
  const databasePath = join(migrationDirectory, "sequential.sqlite");

  try {
    for (const migrationName of migrationNames) {
      const statements = rawMigrationSqlByName
        .get(migrationName)
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const [statementIndex, statement] of statements.entries()) {
        const result = spawnSync("/usr/bin/sqlite3", [databasePath], {
          input: [".bail on", "PRAGMA foreign_keys=ON;", statement].join("\n"),
          encoding: "utf8",
        });

        assert.equal(
          result.status,
          0,
          `${migrationName} statement ${statementIndex + 1} failed after a schema reload:\n${result.stderr}`,
        );
      }
    }

    for (const { name, sql } of integrityTriggerDefinitions) {
      const result = spawnSync("/usr/bin/sqlite3", [databasePath], {
        input: [".bail on", "PRAGMA foreign_keys=ON;", sql].join("\n"),
        encoding: "utf8",
      });

      assert.equal(
        result.status,
        0,
        `${name} failed as a complete runtime D1 statement:\n${result.stderr}`,
      );
    }

    const verification = spawnSync("/usr/bin/sqlite3", [databasePath], {
      input: [
        ".bail on",
        "PRAGMA foreign_keys=ON;",
        "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';",
        "SELECT count(*) FROM pragma_foreign_key_check;",
        "SELECT count(*) FROM sqlite_master WHERE type = 'trigger';",
      ].join("\n"),
      encoding: "utf8",
    });

    assert.equal(verification.status, 0, verification.stderr);
    assert.equal(verification.stdout.trim(), "36\n0\n56");
  } finally {
    rmSync(migrationDirectory, { recursive: true, force: true });
  }
});

test("converges a partially migrated Sites v1 database to the exact trigger set", () => {
  const migrationDirectory = mkdtempSync(join(tmpdir(), "way-ahead-sites-v1-repair-"));
  const databasePath = join(migrationDirectory, "repair.sqlite");
  const staleByName = new Map(
    sitesV1StaleTriggerDefinitions.map((definition) => [definition.name, definition]),
  );
  const v1MissingNames = new Set([
    "external_action_approvals_analysis_source_binding_insert",
    "external_action_approvals_analysis_source_binding_update",
    "external_action_approvals_asset_source_binding_insert",
    "external_action_approvals_asset_source_binding_update",
    "external_action_approvals_identity_payload_immutable",
    "external_action_approvals_semantic_asset_binding_insert",
    "external_action_approvals_semantic_asset_binding_update",
    "external_action_approvals_source_recheck_insert",
    "external_action_approvals_source_recheck_update",
    "external_action_approvals_unsupported_required_field_insert",
    "external_action_approvals_unsupported_required_field_update",
    "generated_assets_review_state_transition_gate",
    "job_posting_versions_new_snapshot_invalidates_analyses",
    "job_posting_versions_new_snapshot_supersedes_packages",
    "job_postings_current_version_reversion_invalidates_dependents",
    "pursuit_events_delete_immutable",
    "pursuit_events_occurred_at_guard",
    "pursuit_events_update_immutable",
    "pursuit_events_validate_insert",
    "pursuit_packages_sync_pursuit_after_invalidation",
    "pursuit_packages_new_version_supersedes_previous",
    "pursuit_packages_version_monotonic",
    "pursuits_analysis_change_supersedes_packages",
    "pursuits_state_validate_insert",
    "pursuits_state_validate_update",
    "resumes_payload_immutable",
    "resumes_supersession_invalidates_rendered_assets",
  ]);
  const sitesV1Definitions = integrityTriggerDefinitions
    .filter(({ name }) => !v1MissingNames.has(name))
    .map((definition) => staleByName.get(definition.name) ?? definition);
  const normalizeSql = (sql) =>
    sql
      .replace(/CREATE TRIGGER IF NOT EXISTS/i, "CREATE TRIGGER")
      .replace(/\s+/g, " ")
      .replace(/;$/, "")
      .trim();

  assert.equal(sitesV1Definitions.length, 29);
  assert.equal(staleByName.size, 5);

  try {
    const schemaBeforeRepair = migrationNames
      .filter((name) => name !== "0008_sites_trigger_convergence.sql")
      .map((name) => migrationSqlByName.get(name))
      .join("\n");
    const seeded = spawnSync("/usr/bin/sqlite3", [databasePath], {
      input: [
        ".bail on",
        "PRAGMA foreign_keys=ON;",
        schemaBeforeRepair,
        ...sitesV1Definitions.map(({ sql }) => sql),
        "SELECT count(*) FROM sqlite_master WHERE type = 'trigger';",
      ].join("\n"),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr);
    assert.equal(seeded.stdout.trim(), "29");

    const repaired = spawnSync("/usr/bin/sqlite3", [databasePath], {
      input: [
        ".bail on",
        "PRAGMA foreign_keys=ON;",
        migrationSqlByName.get("0008_sites_trigger_convergence.sql"),
        ...integrityTriggerDefinitions.map(({ sql }) => sql),
      ].join("\n"),
      encoding: "utf8",
    });
    assert.equal(repaired.status, 0, repaired.stderr);

    const rows = JSON.parse(
      spawnSync(
        "/usr/bin/sqlite3",
        [
          "-json",
          databasePath,
          "SELECT name, sql FROM sqlite_master WHERE type = 'trigger' ORDER BY name;",
        ],
        { encoding: "utf8" },
      ).stdout,
    );
    assert.equal(rows.length, 56);
    assert.deepEqual(
      rows.map(({ name, sql }) => [name, normalizeSql(sql)]),
      [...integrityTriggerDefinitions]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map(({ name, sql }) => [name, normalizeSql(sql)]),
    );
  } finally {
    rmSync(migrationDirectory, { recursive: true, force: true });
  }
});

test("supports transactional migration rollback", () => {
  const result = runSql(
    `
      BEGIN;
      ${migrationSql}
      ROLLBACK;
      SELECT count(*) FROM sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
    `,
    { includeMigration: false },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "0");
});

test("upgrades a populated 23-table database without losing subscriptions", () => {
  const result = spawnSync("/usr/bin/sqlite3", [":memory:"], {
    input: [
      ".bail on",
      "PRAGMA foreign_keys=ON;",
      migrationSqlByName.get("0000_tricky_jack_murdock.sql"),
      `
        INSERT INTO users (id, auth_subject, email)
          VALUES ('user-a', 'auth-a', 'a@example.test');
        INSERT INTO subscriptions
          (id, user_id, plan_key, state, entitlements_json)
        VALUES
          ('legacy-subscription', 'user-a', 'legacy-watch', 'paused', '{}');
      `,
      ...migrationNames.slice(1).map((name) => migrationSqlByName.get(name)),
      runtimeIntegritySql,
      `
        SELECT (s.offer_version_id IS NOT NULL) || ':' || ov.approval_state
          FROM subscriptions s
          JOIN offer_versions ov ON ov.id = s.offer_version_id
         WHERE s.id = 'legacy-subscription';
        SELECT "notnull" FROM pragma_table_info('subscriptions')
         WHERE name = 'offer_version_id';
        SELECT count(*) FROM pragma_foreign_key_check;
      `,
    ].join("\n"),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "1:retired\n1\n0");
});

test("preserves extraction policy, lineage, dependency, and user merge decisions", () => {
  expectSqlPass(
    `
      ${rolesSql}
      INSERT INTO profile_fact_dependencies
        (user_id, dependent_fact_id, source_fact_id, relationship, invalidation_policy)
      VALUES ('user-a', 'fact-a2', 'fact-a1', 'derived_from', 'invalidate');
      INSERT INTO experience_role_facts
        (user_id, experience_role_id, profile_fact_id, relationship)
      VALUES ('user-a', 'role-a1', 'fact-a1', 'primary_source');
      INSERT INTO experience_role_merge_proposals
        (id, user_id, source_role_id, target_role_id, proposed_resolution_json)
      VALUES ('merge-a', 'user-a', 'role-a1', 'role-a2', '{}');
      UPDATE experience_role_merge_proposals
        SET state = 'accepted', decided_by_user_at = 1
        WHERE id = 'merge-a';
      SELECT extraction_method || ':' || extraction_policy_version
        FROM profile_facts WHERE id = 'fact-a1';
      SELECT state FROM experience_role_merge_proposals WHERE id = 'merge-a';
    `,
    "deterministic_parser:parser-1\naccepted",
  );
});

test("rejects cross-tenant profile and normalized-entity lineage", () => {
  expectSqlReject(
    `
      ${rolesSql}
      INSERT INTO profile_facts
        (id, user_id, source_import_id, fact_type, value_json, state)
      VALUES ('fact-cross', 'user-a', 'import-b', 'role_title', '{}', 'extracted');
    `,
    /FOREIGN KEY constraint failed/,
  );

  expectSqlReject(
    `
      ${rolesSql}
      INSERT INTO experience_role_facts
        (user_id, experience_role_id, profile_fact_id, relationship)
      VALUES ('user-a', 'role-b1', 'fact-a1', 'primary_source');
    `,
    /FOREIGN KEY constraint failed/,
  );
});

test("requires a Board reference and effective time for offer activation", () => {
  expectSqlReject(
    `
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type,
         approval_state)
      VALUES
        ('offer-bad-state', 'software', 'bad_state', 1, 'Bad state', 900,
         'monthly', 'publicly_live');
    `,
    /invalid offer approval state/,
  );

  expectSqlReject(
    `
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type,
         approval_state)
      VALUES
        ('offer-no-board-ref', 'software', 'no_board_ref', 1, 'No ref', 900,
         'monthly', 'board_approved_private_test');
    `,
    /board decision reference required/,
  );

  expectSqlReject(
    `
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type,
         approval_state, board_decision_ref)
      VALUES
        ('offer-no-effective-at', 'software', 'no_effective_at', 1,
         'No effective time', 900, 'monthly', 'active_private_test', 'board-1');
    `,
    /active offer effective time required/,
  );

  expectSqlPass(`
    INSERT INTO offer_versions
      (id, stream, offer_key, version, label, price_minor, billing_type,
       approval_state, board_decision_ref, effective_at)
    VALUES
      ('offer-authorized', 'software', 'authorized', 1, 'Authorized', 900,
       'monthly', 'active_private_test', 'board-1', 1);
    SELECT approval_state FROM offer_versions WHERE id = 'offer-authorized';
  `, "active_private_test");

  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type,
         approval_state, board_decision_ref, effective_at)
      VALUES ('offer-authorized', 'software', 'authorized', 1, 'Authorized',
        900, 'monthly', 'active_private_test', 'board-1', 1);
      INSERT INTO orders_charges
        (id, user_id, offer_version_id, acquisition_source, gross_amount_minor,
         cash_collected_minor, service_starts_at, service_ends_at)
      VALUES ('order-a', 'user-a', 'offer-authorized', 'organic', 900, 900, 1, 2);
      UPDATE offer_versions
         SET approval_state = 'hypothesis', board_decision_ref = NULL,
             effective_at = NULL
       WHERE id = 'offer-authorized';
    `,
    /offer approval history is immutable/,
  );
});

test("rejects aggregate over-recognition and broken revenue continuity", () => {
  const fixture = `
    ${usersSql}
    INSERT INTO offer_versions
      (id, stream, offer_key, version, label, price_minor, billing_type)
    VALUES ('offer-watch-v1', 'software', 'watch', 1, 'Watch', 900, 'monthly');
    INSERT INTO cohort_memberships
      (id, user_id, offer_version_id, acquisition_source, entered_at,
       matures_at, observation_window_days)
    VALUES ('cohort-a', 'user-a', 'offer-watch-v1', 'organic', 1, 2, 30);
    INSERT INTO orders_charges
      (id, user_id, offer_version_id, cohort_membership_id, acquisition_source,
       gross_amount_minor, cash_collected_minor, service_starts_at,
       service_ends_at, settlement_state)
    VALUES ('order-a', 'user-a', 'offer-watch-v1', 'cohort-a', 'organic',
      900, 900, 1, 2, 'paid');
  `;

  expectSqlReject(
    `
      ${fixture}
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, cash_collected_minor,
         recognized_revenue_minor, closing_deferred_minor, close_state)
      VALUES ('revenue-a', 'order-a', 'software', '2026-07', 900, 900, 0,
        'reconciled');
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, cash_collected_minor,
         recognized_revenue_minor, closing_deferred_minor)
      VALUES ('revenue-b', 'order-a', 'software', '2026-08', 0, 0, 0);
    `,
    /reconciled revenue schedule is closed/,
  );

  expectSqlReject(
    `
      ${fixture}
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, opening_deferred_minor,
         cash_collected_minor, recognized_revenue_minor, closing_deferred_minor)
      VALUES ('revenue-a', 'order-a', 'software', '2026-07', 0, 900, 300, 600);
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, opening_deferred_minor,
         recognized_revenue_minor, closing_deferred_minor)
      VALUES ('revenue-b', 'order-a', 'software', '2026-08', 500, 300, 200);
    `,
    /revenue period opening balance mismatch/,
  );
});

test("keeps software, affiliate, and human-service ledgers isolated", () => {
  const offers = `
    ${usersSql}
    INSERT INTO offer_versions
      (id, stream, offer_key, version, label, price_minor, billing_type)
    VALUES
      ('offer-software', 'software', 'watch', 1, 'Watch', 900, 'monthly'),
      ('offer-affiliate', 'affiliate', 'mentor', 1, 'Mentor', 0, 'commission');
  `;

  expectSqlReject(
    `
      ${offers}
      INSERT INTO cohort_memberships
        (id, user_id, offer_version_id, acquisition_source, entered_at,
         matures_at, observation_window_days)
      VALUES ('cohort-affiliate', 'user-a', 'offer-affiliate', 'organic', 1, 2, 30);
    `,
    /cohort offer must be software/,
  );

  expectSqlReject(
    `
      ${offers}
      INSERT INTO orders_charges
        (id, user_id, offer_version_id, acquisition_source,
         gross_amount_minor, service_starts_at, service_ends_at)
      VALUES ('order-affiliate', 'user-a', 'offer-affiliate', 'organic', 0, 1, 2);
    `,
    /affiliate revenue belongs in affiliate_events/,
  );

  expectSqlReject(
    `
      ${offers}
      INSERT INTO orders_charges
        (id, user_id, offer_version_id, acquisition_source, gross_amount_minor,
         cash_collected_minor, service_starts_at, service_ends_at)
      VALUES ('order-a', 'user-a', 'offer-software', 'organic', 900, 900, 1, 2);
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, cash_collected_minor,
         recognized_revenue_minor, closing_deferred_minor)
      VALUES ('revenue-a', 'order-a', 'affiliate', '2026-07', 900, 900, 0);
    `,
    /revenue stream mismatch/,
  );
});

test("rejects cross-tenant usage-to-cost links", () => {
  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type)
      VALUES ('offer-watch', 'software', 'watch', 1, 'Watch', 900, 'monthly');
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version, user_id,
         allocated_offer_version_id, incurred_at)
      VALUES ('cost-a', 'software', 'support', 'minute', 1000000, 1500000,
        1500000, 'actual', 'noncash', 'labor-v1', 'user-a', 'offer-watch', 1);
      INSERT INTO usage_events
        (id, user_id, action, result_state, cost_event_id)
      VALUES ('usage-cross', 'user-b', 'analysis', 'passed', 'cost-a');
    `,
    /usage cost event tenant mismatch|FOREIGN KEY constraint failed/,
  );
});

test("rejects malformed and duplicate shared-cost allocations", () => {
  const fixture = `
    ${usersSql}
    INSERT INTO offer_versions
      (id, stream, offer_key, version, label, price_minor, billing_type)
    VALUES ('offer-watch', 'software', 'watch', 1, 'Watch', 900, 'monthly');
  `;

  expectSqlReject(
    `
      ${fixture}
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         allocated_offer_version_id, incurred_at)
      VALUES ('cost-bad-math', 'software', 'support', 'minute', 1000000,
        1500000, 1, 'actual', 'noncash', 'labor-v1', 'offer-watch', 1);
    `,
    /cost amount does not match units and rate/,
  );

  expectSqlReject(
    `
      ${fixture}
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros)
      VALUES ('allocation-group-1', 'job-1', 'allocation-v1', 'equal',
        'software', 'source_data', 50000);
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros,
         allocated_offer_version_id, incurred_at)
      VALUES
        ('cost-shared-a', 'software', 'source_data', 'job', 1000000, 25000,
         25000, 'actual', 'cash', 'source-v1', 'job-1', 'equal', 'allocation-v1',
         'allocation-group-1', 5000, 50000, 0, 'offer-watch', 1),
        ('cost-shared-b', 'software', 'source_data', 'job', 1000000, 25000,
         25000, 'actual', 'cash', 'source-v1', 'job-1', 'equal', 'allocation-v1',
         'allocation-group-1', 5000, 50000, 0, 'offer-watch', 1);
    `,
    /UNIQUE constraint failed/,
  );
});

test("prevents processor duplication, cost-link drift, and shared over-allocation", () => {
  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type)
      VALUES ('offer-watch', 'software', 'watch', 1, 'Watch', 900, 'monthly');
      INSERT INTO orders_charges
        (id, user_id, offer_version_id, acquisition_source, gross_amount_minor,
         cash_collected_minor, processor_fee_micros, service_starts_at,
         service_ends_at, settlement_state)
      VALUES ('order-a', 'user-a', 'offer-watch', 'organic', 900, 900, 30000,
        1, 2, 'paid');
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version, user_id,
         order_id, allocated_offer_version_id, incurred_at)
      VALUES
        ('processor-a', 'software', 'processor', 'transaction', 1000000, 30000,
         30000, 'actual', 'cash', 'processor-v1', 'user-a', 'order-a',
         'offer-watch', 1),
        ('processor-b', 'software', 'processor', 'transaction', 1000000, 30000,
         30000, 'actual', 'cash', 'processor-v1', 'user-a', 'order-a',
         'offer-watch', 1);
    `,
    /UNIQUE constraint failed/,
  );

  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type)
      VALUES ('offer-watch', 'software', 'watch', 1, 'Watch', 900, 'monthly');
      INSERT INTO cohort_memberships
        (id, user_id, offer_version_id, acquisition_source, entered_at,
         matures_at, observation_window_days)
      VALUES
        ('cohort-a', 'user-a', 'offer-watch', 'organic', 1, 2, 30),
        ('cohort-b', 'user-a', 'offer-watch', 'organic', 1, 2, 30);
      INSERT INTO orders_charges
        (id, user_id, offer_version_id, cohort_membership_id,
         acquisition_source, gross_amount_minor, cash_collected_minor,
         service_starts_at, service_ends_at, settlement_state)
      VALUES ('order-a', 'user-a', 'offer-watch', 'cohort-a', 'organic', 900,
        900, 1, 2, 'paid');
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version, user_id,
         order_id, cohort_membership_id, allocated_offer_version_id, incurred_at)
      VALUES ('cost-a', 'software', 'support', 'minute', 1000000, 10000, 10000,
        'actual', 'noncash', 'labor-v1', 'user-a', 'order-a', 'cohort-a',
        'offer-watch', 1);
      UPDATE cost_events SET cohort_membership_id = 'cohort-b'
       WHERE id = 'cost-a';
    `,
    /cost order cohort mismatch/,
  );

  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type)
      VALUES
        ('offer-a', 'software', 'watch_a', 1, 'Watch A', 900, 'monthly'),
        ('offer-b', 'software', 'watch_b', 1, 'Watch B', 900, 'monthly');
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros)
      VALUES ('allocation-group-1', 'batch-1', 'allocation-v1', 'weighted',
        'software', 'source_data', 100000);
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros,
         allocated_offer_version_id, incurred_at)
      VALUES
        ('shared-a', 'software', 'source_data', 'batch', 1000000, 100000,
         100000, 'actual', 'cash', 'source-v1', 'batch-1', 'weighted',
         'allocation-v1', 'allocation-group-1', 10000, 100000, 0, 'offer-a', 1),
        ('shared-b', 'software', 'source_data', 'batch', 1000000, 100000,
         100000, 'actual', 'cash', 'source-v1', 'batch-1', 'weighted',
         'allocation-v1', 'allocation-group-1', 10000, 100000, 0, 'offer-b', 1);
    `,
    /shared allocation exceeds source total/,
  );
});

test("reconciles exactly one current shared-allocation version with rounding", () => {
  const allocationFixture = `
    ${usersSql}
    INSERT INTO offer_versions
      (id, stream, offer_key, version, label, price_minor, billing_type)
    VALUES
      ('offer-a', 'software', 'watch_a', 1, 'Watch A', 900, 'monthly'),
      ('offer-b', 'software', 'watch_b', 1, 'Watch B', 900, 'monthly');
  `;

  expectSqlReject(
    `
      ${allocationFixture}
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros)
      VALUES ('group-a', 'batch-1', 'v1', 'equal', 'software', 'source_data',
        100000);
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros, allocated_offer_version_id, incurred_at)
      VALUES ('cost-a', 'software', 'source_data', 'batch', 1000000, 100000,
        100000, 'actual', 'cash', 'source-v1', 'batch-1', 'usage_weighted', 'v1',
        'group-a', 10000, 100000, 0, 'offer-a', 1);
    `,
    /cost allocation group mismatch|shared allocation method mismatch/,
  );

  expectSqlPass(
    `
      ${allocationFixture}
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros)
      VALUES ('group-v1', 'batch-1', 'v1', 'weighted', 'software',
        'source_data', 100001);
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros, allocated_offer_version_id, incurred_at)
      VALUES
        ('cost-a', 'software', 'source_data', 'batch', 1000000, 50000, 50000,
         'actual', 'cash', 'source-v1', 'batch-1', 'weighted', 'v1', 'group-v1',
         5000, 100001, 0, 'offer-a', 1),
        ('cost-b', 'software', 'source_data', 'batch', 1000000, 50001, 50001,
         'actual', 'cash', 'source-v1', 'batch-1', 'weighted', 'v1', 'group-v1',
         5000, 100001, 1, 'offer-b', 1);
      UPDATE cost_allocation_groups
         SET state = 'reconciled', is_current = 1, reconciled_at = 2
       WHERE id = 'group-v1';
      SELECT g.state || ':' || SUM(c.allocation_share_bps) || ':' ||
             SUM(c.amount_micros)
        FROM cost_allocation_groups g
        JOIN cost_events c ON c.allocation_group_id = g.id
       WHERE g.id = 'group-v1'
       GROUP BY g.state;
    `,
    "reconciled:10000:100001",
  );

  expectSqlReject(
    `
      ${allocationFixture}
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros)
      VALUES ('group-v1', 'batch-1', 'v1', 'weighted', 'software',
        'source_data', 100000);
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros, allocated_offer_version_id, incurred_at)
      VALUES ('cost-v1', 'software', 'source_data', 'batch', 1000000, 100000,
        100000, 'actual', 'cash', 'source-v1', 'batch-1', 'weighted', 'v1',
        'group-v1', 10000, 100000, 0, 'offer-a', 1);
      UPDATE cost_allocation_groups
         SET state = 'reconciled', is_current = 1, reconciled_at = 2
       WHERE id = 'group-v1';
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros, supersedes_group_id)
      VALUES ('group-v2', 'batch-1', 'v2', 'weighted', 'software',
        'source_data', 100000, 'group-v1');
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros, allocated_offer_version_id, incurred_at)
      VALUES ('cost-v2', 'software', 'source_data', 'batch', 1000000, 100000,
        100000, 'actual', 'cash', 'source-v2', 'batch-1', 'weighted', 'v2',
        'group-v2', 10000, 100000, 0, 'offer-b', 3);
      UPDATE cost_allocation_groups
         SET state = 'reconciled', is_current = 1, reconciled_at = 4
       WHERE id = 'group-v2';
    `,
    /new allocation version must supersede the prior source version|UNIQUE constraint failed/,
  );

  expectSqlPass(
    `
      ${allocationFixture}
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros)
      VALUES ('group-v1', 'batch-1', 'v1', 'weighted', 'software',
        'source_data', 100000);
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros, allocated_offer_version_id, incurred_at)
      VALUES ('cost-v1', 'software', 'source_data', 'batch', 1000000, 100000,
        100000, 'actual', 'cash', 'source-v1', 'batch-1', 'weighted', 'v1',
        'group-v1', 10000, 100000, 0, 'offer-a', 1);
      UPDATE cost_allocation_groups
         SET state = 'reconciled', is_current = 1, reconciled_at = 2
       WHERE id = 'group-v1';
      INSERT INTO cost_allocation_groups
        (id, shared_object_ref, allocation_version, allocation_method, stream,
         category, source_total_amount_micros, supersedes_group_id)
      VALUES ('group-v2', 'batch-1', 'v2', 'weighted', 'software',
        'source_data', 100000, 'group-v1');
      UPDATE cost_allocation_groups
         SET state = 'superseded', is_current = 0
       WHERE id = 'group-v1';
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocation_method, allocation_version,
         allocation_group_id, allocation_share_bps, shared_total_amount_micros,
         allocation_remainder_micros, allocated_offer_version_id, incurred_at)
      VALUES ('cost-v2', 'software', 'source_data', 'batch', 1000000, 100000,
        100000, 'actual', 'cash', 'source-v2', 'batch-1', 'weighted', 'v2',
        'group-v2', 10000, 100000, 0, 'offer-b', 3);
      UPDATE cost_allocation_groups
         SET state = 'reconciled', is_current = 1, reconciled_at = 4
       WHERE id = 'group-v2';
      SELECT group_concat(id || ':' || state || ':' || is_current, '|')
        FROM (
          SELECT id, state, is_current
            FROM cost_allocation_groups
           WHERE shared_object_ref = 'batch-1'
           ORDER BY allocation_version
        );
    `,
    "group-v1:superseded:0|group-v2:reconciled:1",
  );
});

test("prevents post-reference economics and tenant drift", () => {
  const orderFixture = `
    ${usersSql}
    INSERT INTO offer_versions
      (id, stream, offer_key, version, label, price_minor, billing_type)
    VALUES ('offer-watch', 'software', 'watch', 1, 'Watch', 900, 'monthly');
    INSERT INTO orders_charges
      (id, user_id, offer_version_id, acquisition_source, gross_amount_minor,
       cash_collected_minor, service_starts_at, service_ends_at, settlement_state)
    VALUES ('order-a', 'user-a', 'offer-watch', 'organic', 900, 900, 1, 2, 'paid');
  `;

  expectSqlReject(
    `
      ${orderFixture}
      UPDATE offer_versions SET stream = 'affiliate' WHERE id = 'offer-watch';
    `,
    /referenced offer economics are immutable/,
  );

  expectSqlReject(
    `
      ${orderFixture}
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, cash_collected_minor,
         recognized_revenue_minor, closing_deferred_minor, close_state)
      VALUES ('revenue-a', 'order-a', 'software', '2026-07', 900, 900, 0,
        'reconciled');
      UPDATE orders_charges SET gross_amount_minor = 1800 WHERE id = 'order-a';
    `,
    /scheduled order economics are immutable/,
  );

  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type)
      VALUES ('offer-watch', 'software', 'watch', 1, 'Watch', 900, 'monthly');
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version, user_id,
         allocated_offer_version_id, incurred_at)
      VALUES ('cost-a', 'software', 'support', 'minute', 1000000, 1500000,
        1500000, 'actual', 'noncash', 'labor-v1', 'user-a', 'offer-watch', 1);
      INSERT INTO usage_events
        (id, user_id, action, result_state, cost_event_id)
      VALUES ('usage-a', 'user-a', 'analysis', 'passed', 'cost-a');
      UPDATE cost_events SET user_id = 'user-b' WHERE id = 'cost-a';
    `,
    /referenced cost-event identity is immutable/,
  );
});

test("rejects self-dependencies and non-user merge decisions", () => {
  expectSqlReject(
    `
      ${rolesSql}
      INSERT INTO profile_fact_dependencies
        (user_id, dependent_fact_id, source_fact_id, relationship)
      VALUES ('user-a', 'fact-a1', 'fact-a1', 'derived_from');
    `,
    /CHECK constraint failed/,
  );

  expectSqlReject(
    `
      ${rolesSql}
      INSERT INTO experience_role_merge_proposals
        (id, user_id, source_role_id, target_role_id, proposed_resolution_json,
         state)
      VALUES ('merge-a', 'user-a', 'role-a1', 'role-a2', '{}', 'accepted');
    `,
    /CHECK constraint failed/,
  );
});

test("protects tenant-scoped provenance references from physical deletion", () => {
  expectSqlReject(
    `
      ${sourceAndFactSql}
      DELETE FROM source_imports WHERE id = 'import-a';
    `,
    /FOREIGN KEY constraint failed/,
  );

  expectSqlReject(
    `
      ${sourceAndFactSql}
      INSERT INTO profile_facts
        (id, user_id, fact_type, value_json, state, supersedes_fact_id)
      VALUES ('fact-a3', 'user-a', 'role_title', '{}', 'user_corrected', 'fact-a1');
      DELETE FROM profile_facts WHERE id = 'fact-a1';
    `,
    /FOREIGN KEY constraint failed/,
  );

  expectSqlReject(
    `
      ${rolesSql}
      INSERT INTO achievement_bullets
        (id, user_id, experience_role_id, text)
      VALUES ('bullet-a', 'user-a', 'role-a1', 'Built the operating system.');
      DELETE FROM experience_roles WHERE id = 'role-a1';
    `,
    /FOREIGN KEY constraint failed/,
  );

  expectSqlReject(
    `
      ${sourceAndFactSql}
      INSERT INTO skills (id, canonical_name, category)
        VALUES ('skill-1', 'Revenue Operations', 'function');
      INSERT INTO profile_skills (user_id, skill_id, source_fact_id)
        VALUES ('user-a', 'skill-1', 'fact-a1');
      DELETE FROM profile_facts WHERE id = 'fact-a1';
    `,
    /FOREIGN KEY constraint failed/,
  );

  const analysisFixtureSql = `
    ${usersSql}
    INSERT INTO career_paths
      (id, user_id, label, primary_lane, state, is_primary)
    VALUES ('path-a', 'user-a', 'Revenue Operations', 'revenue_operations', 'active', 1);
    INSERT INTO job_standards (id, user_id, version, is_current)
      VALUES ('standard-a', 'user-a', 1, 1);
    INSERT INTO job_sources (id, name, kind, rights_state)
      VALUES ('source-1', 'Acme ATS', 'employer_ats', 'approved');
    INSERT INTO job_postings
      (id, source_id, external_id, canonical_url, employer, title, description_checksum)
    VALUES
      ('job-1', 'source-1', 'ext-1', 'https://example.test/job-1', 'Acme', 'Director', 'jd-hash');
    INSERT INTO job_analyses
      (id, user_id, job_posting_id, career_path_id, job_standard_id,
       policy_version, evidence_version, integrity_gates_json, fit_json, recommendation)
    VALUES
      ('analysis-a', 'user-a', 'job-1', 'path-a', 'standard-a',
       'policy-1', 'evidence-1', '{}', '{}', 'pursue');
  `;

  expectSqlReject(
    `
      ${analysisFixtureSql}
      DELETE FROM career_paths WHERE id = 'path-a';
    `,
    /FOREIGN KEY constraint failed/,
  );

  expectSqlReject(
    `
      ${analysisFixtureSql}
      INSERT INTO pursuits
        (id, user_id, job_posting_id, current_analysis_id)
      VALUES ('pursuit-a', 'user-a', 'job-1', 'analysis-a');
      DELETE FROM job_analyses WHERE id = 'analysis-a';
    `,
    /FOREIGN KEY constraint failed/,
  );
});

test("enforces one current Job Standard and one active primary Career Path", () => {
  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO job_standards (id, user_id, version, is_current)
        VALUES ('standard-1', 'user-a', 1, 1);
      INSERT INTO job_standards (id, user_id, version, is_current)
        VALUES ('standard-2', 'user-a', 2, 1);
    `,
    /UNIQUE constraint failed/,
  );

  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO career_paths
        (id, user_id, label, primary_lane, state, is_primary)
      VALUES ('path-a', 'user-a', 'Revenue Operations', 'revenue_operations',
        'suggested', 1);
    `,
    /CHECK constraint failed/,
  );

  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO career_paths
        (id, user_id, label, primary_lane, state, is_primary)
      VALUES
        ('path-a', 'user-a', 'Revenue Operations', 'revenue_operations', 'active', 1),
        ('path-b', 'user-a', 'Lifecycle', 'lifecycle', 'active', 1);
    `,
    /UNIQUE constraint failed/,
  );
});

test("enforces deterministic job-to-path-to-default resume assignment", () => {
  expectSqlPass(
    `
      ${resumeFixtureSql}
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope)
      VALUES ('assignment-default', 'user-a', 'resume-default', 'default');
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope, career_path_id)
      VALUES ('assignment-path', 'user-a', 'resume-path', 'path', 'path-a');
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope, job_posting_id)
      VALUES ('assignment-job', 'user-a', 'resume-job', 'job', 'job-1');
      SELECT resume_id
        FROM resume_assignments
       WHERE user_id = 'user-a'
         AND (
           (scope = 'job' AND job_posting_id = 'job-1') OR
           (scope = 'path' AND career_path_id = 'path-a') OR
           scope = 'default'
         )
       ORDER BY CASE scope WHEN 'job' THEN 3 WHEN 'path' THEN 2 ELSE 1 END DESC
       LIMIT 1;
    `,
    "resume-job",
  );

  expectSqlReject(
    `
      ${resumeFixtureSql}
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope)
      VALUES ('assignment-bad', 'user-a', 'resume-default', 'path');
    `,
    /CHECK constraint failed/,
  );

  expectSqlReject(
    `
      ${resumeFixtureSql}
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope)
      VALUES
        ('assignment-1', 'user-a', 'resume-default', 'default'),
        ('assignment-2', 'user-a', 'resume-path', 'default');
    `,
    /UNIQUE constraint failed/,
  );

  expectSqlReject(
    `
      ${resumeFixtureSql}
      INSERT INTO resume_assignments
        (id, user_id, resume_id, scope)
      VALUES ('assignment-cross', 'user-a', 'resume-b', 'default');
    `,
    /FOREIGN KEY constraint failed/,
  );
});

test("preserves offer-versioned cash, deferred revenue, costs, and cohort provenance", () => {
  expectSqlPass(
    `
      ${usersSql}
      INSERT INTO offer_versions
        (id, stream, offer_key, version, label, price_minor, billing_type,
         term_days, variable_cost_cap_bps, support_cap_seconds, target_cm2_bps)
      VALUES
        ('offer-watch-3m-v1', 'software', 'keep_watch_3m', 1,
         'Keep Watch three-month', 2400, 'prepaid_term', 90, 2000, 30, 8000);
      INSERT INTO cohort_memberships
        (id, user_id, offer_version_id, acquisition_source, entered_at,
         matures_at, observation_window_days)
      VALUES
        ('cohort-a', 'user-a', 'offer-watch-3m-v1', 'organic', 1, 7776000001, 90);
      INSERT INTO orders_charges
        (id, user_id, offer_version_id, cohort_membership_id,
         acquisition_source, gross_amount_minor, cash_collected_minor,
         processor_fee_micros, service_starts_at, service_ends_at,
         settlement_state)
      VALUES
        ('order-a', 'user-a', 'offer-watch-3m-v1', 'cohort-a', 'organic',
         2400, 2400, 996000, 1, 7776000001, 'paid');
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, opening_deferred_minor,
         cash_collected_minor, recognized_revenue_minor, closing_deferred_minor,
         close_state)
      VALUES
        ('revenue-a-1', 'order-a', 'software', '2026-07', 0, 2400, 800, 1600, 'closed'),
        ('revenue-a-2', 'order-a', 'software', '2026-08', 1600, 0, 800, 800, 'closed'),
        ('revenue-a-3', 'order-a', 'software', '2026-09', 800, 0, 800, 0, 'reconciled');
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         user_id, order_id, allocated_offer_version_id, cohort_membership_id,
         incurred_at)
      VALUES
        ('cost-a', 'software', 'processor', 'transaction', 1000000, 996000,
         996000, 'actual', 'cash', 'stripe-public-2026-07-21',
         'user-a', 'order-a', 'offer-watch-3m-v1', 'cohort-a', 2);
      INSERT INTO subscriptions
        (id, user_id, offer_version_id, plan_key, state, entitlements_json)
      VALUES
        ('subscription-a', 'user-a', 'offer-watch-3m-v1', 'keep_watch_3m',
         'active', '{}');
      SELECT sum(recognized_revenue_minor) || ':' || max(closing_deferred_minor)
        FROM revenue_schedule WHERE order_id = 'order-a';
      SELECT amount_micros || ':' || support_cap_seconds
        FROM cost_events, offer_versions
       WHERE cost_events.id = 'cost-a'
         AND offer_versions.id = cost_events.allocated_offer_version_id;
    `,
    "2400:1600\n996000:30",
  );
});

test("rejects malformed economics records and cross-tenant allocations", () => {
  const economicsFixtureSql = `
    ${usersSql}
    INSERT INTO offer_versions
      (id, stream, offer_key, version, label, price_minor, billing_type,
       term_days, variable_cost_cap_bps)
    VALUES
      ('offer-watch-v1', 'software', 'keep_watch', 1, 'Keep Watch',
       900, 'monthly', 30, 2000);
    INSERT INTO cohort_memberships
      (id, user_id, offer_version_id, acquisition_source, entered_at,
       matures_at, observation_window_days)
    VALUES
      ('cohort-a', 'user-a', 'offer-watch-v1', 'organic', 1, 2592000001, 30);
    INSERT INTO orders_charges
      (id, user_id, offer_version_id, cohort_membership_id,
       acquisition_source, gross_amount_minor, cash_collected_minor,
       service_starts_at, service_ends_at, settlement_state)
    VALUES
      ('order-a', 'user-a', 'offer-watch-v1', 'cohort-a', 'organic',
       900, 900, 1, 2592000001, 'paid');
  `;

  expectSqlReject(
    `
      ${economicsFixtureSql}
      INSERT INTO revenue_schedule
        (id, order_id, stream, recognition_period, opening_deferred_minor,
         cash_collected_minor, recognized_revenue_minor, closing_deferred_minor)
      VALUES ('bad-revenue', 'order-a', 'software', '2026-07', 0, 900, 500, 500);
    `,
    /CHECK constraint failed/,
  );

  expectSqlReject(
    `
      ${economicsFixtureSql}
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         user_id, order_id, allocated_offer_version_id, incurred_at)
      VALUES
        ('cross-cost', 'software', 'support', 'minute', 1000000, 1500000,
         1500000, 'actual', 'noncash', 'labor-2026-07-21',
         'user-b', 'order-a', 'offer-watch-v1', 2);
    `,
    /FOREIGN KEY constraint failed|cost order tenant or stream mismatch/,
  );

  expectSqlReject(
    `
      ${economicsFixtureSql}
      INSERT INTO cost_events
        (id, stream, category, unit_name, units_micros, rate_micros_per_unit,
         amount_micros, estimate_state, cash_state, rate_card_version,
         shared_object_ref, allocated_offer_version_id, incurred_at)
      VALUES
        ('unallocated-shared-cost', 'software', 'source_data', 'job', 1000000,
         50000, 50000, 'estimated', 'cash', 'source-2026-07-21',
         'canonical-job-1', 'offer-watch-v1', 2);
    `,
    /CHECK constraint failed|shared cost allocation is incomplete|shared allocation amount or share is invalid|cost allocation group mismatch/,
  );
});

const sourceRecheckAt = Date.now();
const sourceRecheckAuditId = "audit-source-recheck";
const resumeSemanticSha256 = "r".repeat(64);
const coverLetterSemanticSha256 = "c".repeat(64);
const approvalAssetManifestObject = {
  assets: [
    {
      id: "asset-a",
      type: "resume",
      version: 1,
      contentSha256: "asset-hash-a",
      fileSha256: "resume-file-hash",
      filename: "Employer - Director Revenue Operations - Matt Dimock - Resume.pdf",
      pageCount: 2,
      reviewState: "claim_safe",
    },
    {
      id: "asset-cover-a",
      type: "cover_letter",
      version: 2,
      contentSha256: "asset-hash-cover-a",
      fileSha256: "cover-file-hash",
      filename: "Employer - Director Revenue Operations - Matt Dimock - Cover Letter.pdf",
      pageCount: 1,
      reviewState: "claim_safe",
    },
  ],
  sourceRecheck: {
    auditEventId: sourceRecheckAuditId,
    postingLastCheckedAt: sourceRecheckAt,
    verifiedAt: sourceRecheckAt,
    descriptionChecksum: "job-hash",
  },
};
const approvalAssetManifest = JSON.stringify(approvalAssetManifestObject);

const employerFormChecksum = "f".repeat(64);
const changedEmployerFormChecksum = "c".repeat(64);
const wrongEmployerFormChecksum = "w".repeat(64);
const packageAttestationSha256 = "a".repeat(64);
const employerFormSourceFacts = JSON.stringify({
  questionSetChecksum: employerFormChecksum,
  applyUrl: "https://employer.example/jobs/123/apply",
  questionSet: [
    {
      id: "first-name",
      key: "firstName",
      label: "First name",
      type: "text",
      required: true,
    },
    {
      id: "resume",
      key: "resume",
      label: "Resume",
      type: "file",
      required: true,
    },
    {
      id: "cover-letter",
      key: "coverLetter",
      label: "Cover letter",
      type: "file",
      required: false,
    },
  ],
});
const employerFormAnswers = JSON.stringify({
  questionSetChecksum: employerFormChecksum,
  firstName: "Matt",
});
const employerFormAnswersWithLastName = JSON.stringify({
  questionSetChecksum: employerFormChecksum,
  firstName: "Matt",
  lastName: "Dimock",
});
const changedEmployerFormSourceFacts = JSON.stringify({
  questionSetChecksum: changedEmployerFormChecksum,
  applyUrl: "https://employer.example/jobs/123/apply",
  questionSet: [],
});
const wrongEmployerFormAnswers = JSON.stringify({
  questionSetChecksum: wrongEmployerFormChecksum,
  firstName: "Matt",
});

const productionPursuitSql = `
  ${usersSql}
  INSERT INTO job_standards
    (id, user_id, version, is_current, pay_basis, minimum_pay_cents,
     target_pay_cents)
  VALUES
    ('standard-a', 'user-a', 1, 1, 'salary', 12000000, 18000000),
    ('standard-b', 'user-b', 1, 1, 'salary', 12000000, 18000000);
  INSERT INTO career_paths
    (id, user_id, label, primary_lane, state, is_primary)
  VALUES
    ('path-a', 'user-a', 'Revenue Operations', 'revenue_operations', 'active', 1),
    ('path-b', 'user-b', 'Revenue Operations', 'revenue_operations', 'active', 1);
  INSERT INTO job_sources (id, name, kind, rights_state)
  VALUES ('source-live', 'Employer careers', 'employer_ats', 'approved');
  INSERT INTO job_postings
    (id, source_id, external_id, canonical_url, employer, title,
     description_checksum, freshness_state, last_checked_at)
  VALUES
    ('job-live', 'source-live', '123', 'https://employer.example/jobs/123',
     'Employer', 'Director, Revenue Operations', 'job-hash', 'fresh',
     ${sourceRecheckAt});
  INSERT INTO job_posting_versions
    (id, job_posting_id, source_checked_at, source_url,
     description_checksum, source_facts_json, source_conflicts_json,
     capture_state)
  VALUES
    ('job-version-live', 'job-live', 1,
     'https://employer.example/jobs/123', 'job-hash',
     '${employerFormSourceFacts}', '[]', 'verified');
  INSERT INTO job_analyses
    (id, user_id, job_posting_id, career_path_id, job_standard_id,
     policy_version, evidence_version, integrity_gates_json, fit_json,
     unknowns_json, recommendation, validation_state)
  VALUES
    ('analysis-a', 'user-a', 'job-live', 'path-a', 'standard-a', 'policy-1',
     'evidence-1',
     '{"jobVersionId":"job-version-live","jobDescriptionChecksum":"job-hash"}',
     '{}', '[]', 'pursue', 'trusted'),
    ('analysis-b', 'user-b', 'job-live', 'path-b', 'standard-b', 'policy-1',
     'evidence-1',
     '{"jobVersionId":"job-version-live","jobDescriptionChecksum":"job-hash"}',
     '{}', '[]', 'pursue', 'trusted');
  INSERT INTO pursuits
    (id, user_id, job_posting_id, current_analysis_id, state)
  VALUES
    ('pursuit-a', 'user-a', 'job-live', 'analysis-a', 'ready_for_approval'),
    ('pursuit-b', 'user-b', 'job-live', 'analysis-b', 'ready_for_approval');
  INSERT INTO resumes
    (id, user_id, name, kind, version, content_json, template_key, review_state)
  VALUES
    ('resume-semantic-a', 'user-a', 'Employer Director Resume', 'job', 1,
     '{"summary":"Current semantic resume"}', 'ats-basic', 'approved');
  INSERT INTO generated_assets
    (id, user_id, pursuit_id, type, source_versions_json,
     generation_policy_version, version, content_json, content_sha256,
     review_state)
  VALUES
    ('cover-semantic-a', 'user-a', 'pursuit-a', 'cover_letter',
     '{"jobPostingVersionId":"job-version-live","analysisId":"analysis-a"}',
     'semantic-cover-v1', 1, '{"body":"Current semantic cover letter"}',
     '${coverLetterSemanticSha256}', 'claim_safe');
  INSERT INTO generated_assets
    (id, user_id, pursuit_id, type, source_versions_json,
     generation_policy_version, version, content_json, content_sha256,
     filename, page_count, review_state)
  VALUES
    ('asset-a', 'user-a', 'pursuit-a', 'resume',
     '{"jobPostingVersionId":"job-version-live","analysisId":"analysis-a","semanticResumeId":"resume-semantic-a","semanticResumeVersion":1}',
     'client-render-receipt-v1', 1,
     '{"fileSha256":"resume-file-hash","semanticResumeId":"resume-semantic-a","semanticResumeVersion":1,"semanticContentSha256":"${resumeSemanticSha256}"}',
     'asset-hash-a',
     'Employer - Director Revenue Operations - Matt Dimock - Resume.pdf',
     2, 'claim_safe'),
    ('asset-cover-a', 'user-a', 'pursuit-a', 'cover_letter',
     '{"jobPostingVersionId":"job-version-live","analysisId":"analysis-a","semanticCoverLetterId":"cover-semantic-a","semanticCoverLetterVersion":1}',
     'client-render-receipt-v1', 2,
     '{"fileSha256":"cover-file-hash","semanticContentSha256":"${coverLetterSemanticSha256}"}',
     'asset-hash-cover-a',
     'Employer - Director Revenue Operations - Matt Dimock - Cover Letter.pdf',
     1, 'claim_safe'),
    ('asset-b', 'user-b', 'pursuit-b', 'resume',
     '{"jobPostingVersionId":"job-version-live","analysisId":"analysis-b"}',
     'policy-1', 1, '{}',
     'asset-hash-b',
     'Employer - Director Revenue Operations - Other Candidate - Resume.pdf',
     2, 'claim_safe');
  UPDATE pursuits
     SET state = 'ready_for_approval'
   WHERE id IN ('pursuit-a', 'pursuit-b');
  INSERT INTO audit_events
    (id, user_id, actor_subject, event_type, entity_type, entity_id,
     metadata_json, created_at)
  VALUES
    ('${sourceRecheckAuditId}', 'user-a', 'test:source-recheck',
     'greenhouse_job_ingested', 'job_posting', 'job-live',
     '{"descriptionChecksum":"job-hash"}', ${sourceRecheckAt});
`;

const readyPackageSql = ({
  id = "package-a",
  jobVersionId = "job-version-live",
  answersJson = employerFormAnswers,
  manifest = approvalAssetManifest,
  blockersJson = "[]",
  payloadSha256 = "payload-a",
  readinessState = "ready_for_review",
} = {}) => `
  INSERT INTO pursuit_packages
    (id, user_id, pursuit_id, version, destination_url,
     job_posting_version_id, answers_json, asset_manifest_json,
     blockers_json, payload_sha256, readiness_state)
  VALUES
    ('${id}', 'user-a', 'pursuit-a', 1,
     'https://employer.example/jobs/123/apply', '${jobVersionId}',
     '${answersJson}', '${manifest}', '${blockersJson}', '${payloadSha256}',
     '${readinessState}');
`;

const packageApprovalSql = ({
  id = "approval-a",
  action = "approve_application_package",
  payloadSha256 = "payload-a",
  state = "approved",
} = {}) => `
  INSERT INTO external_action_approvals
    (id, user_id, pursuit_package_id, action, payload_sha256, state,
     approved_pursuit_revision, attestation_version, attestation_sha256,
     approved_at)
  VALUES
    ('${id}', 'user-a', 'package-a', '${action}', '${payloadSha256}',
     '${state}', 1, 'application-package-staging-v1',
     '${packageAttestationSha256}', 2);
`;

test("binds external approval to one tenant's immutable ready package", () => {
  expectSqlPass(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '[]', 'payload-a', 'ready_for_review');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256,
         approved_at)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'payload-a', 'approved', 1, 'application-package-staging-v1',
         '${packageAttestationSha256}', 2);
      SELECT state || ':' || payload_sha256
        FROM external_action_approvals WHERE id = 'approval-a';
    `,
    "approved:payload-a",
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '[]', 'payload-a', 'ready_for_review');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state)
      VALUES
        ('approval-cross', 'user-b', 'package-a', 'approve_application_package',
         'payload-a', 'approved');
    `,
    /FOREIGN KEY constraint failed|approval package, source version, form answers, or outbound assets are not exact and current|approval source recheck receipt is missing or older than 24 hours/,
  );
});

test("consumes one exact approved package once and preserves completion evidence", () => {
  const completionAt = sourceRecheckAt + 1;
  expectSqlPass(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE pursuits
         SET state = 'applying',
             revision = 2,
             external_approval_state = 'approved'
       WHERE id = 'pursuit-a';
      UPDATE external_action_approvals
         SET state = 'completed',
             completed_at = ${completionAt}
       WHERE id = 'approval-a';
      UPDATE pursuits
         SET state = 'applied',
             revision = 3,
             external_approval_state = 'completed'
       WHERE id = 'pursuit-a';
      SELECT approval.state || ':' || approval.approved_at || ':' ||
             approval.completed_at || ':' || pursuit.state || ':' ||
             pursuit.external_approval_state
        FROM external_action_approvals approval
        JOIN pursuit_packages package
          ON package.id = approval.pursuit_package_id
        JOIN pursuits pursuit
          ON pursuit.id = package.pursuit_id
       WHERE approval.id = 'approval-a';
    `,
    `completed:2:${completionAt}:applied:completed`,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE pursuits
         SET state = 'applying',
             revision = 2,
             external_approval_state = 'approved'
       WHERE id = 'pursuit-a';
      UPDATE external_action_approvals
         SET state = 'completed',
             completed_at = 1
       WHERE id = 'approval-a';
    `,
    /approval lifecycle, evidence, package, source version, form answers, or outbound assets are invalid|approval source recheck receipt is missing or older than 24 hours/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state)
      VALUES
        ('approval-requested', 'user-a', 'package-a',
         'approve_application_package', 'payload-a', 'requested');
      UPDATE external_action_approvals
         SET state = 'completed',
             completed_at = ${completionAt}
       WHERE id = 'approval-requested';
    `,
    /approval lifecycle, evidence, package, source version, form answers, or outbound assets are invalid|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE external_action_approvals
         SET state = 'completed',
             completed_at = ${completionAt}
       WHERE id = 'approval-a';
    `,
    /approval lifecycle, evidence, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE pursuits
         SET state = 'applying',
             revision = 3,
             external_approval_state = 'approved'
       WHERE id = 'pursuit-a';
      UPDATE external_action_approvals
         SET state = 'completed',
             completed_at = ${completionAt}
       WHERE id = 'approval-a';
    `,
    /approval lifecycle, evidence, package, source version, form answers, or outbound assets are invalid/,
  );
});

test("rejects direct completion and malformed approval timestamp shapes", () => {
  const completionAt = sourceRecheckAt + 1;
  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256,
         approved_at, completed_at)
      VALUES
        ('approval-direct-completed', 'user-a', 'package-a',
         'approve_application_package', 'payload-a', 'completed', 1,
         'application-package-staging-v1', '${packageAttestationSha256}',
         ${sourceRecheckAt}, ${completionAt});
    `,
    /approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_at)
      VALUES
        ('approval-requested-with-evidence', 'user-a', 'package-a',
         'approve_application_package', 'payload-a', 'requested',
         ${sourceRecheckAt});
    `,
    /approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256)
      VALUES
        ('approval-missing-approved-at', 'user-a', 'package-a',
         'approve_application_package', 'payload-a', 'approved', 1,
         'application-package-staging-v1', '${packageAttestationSha256}');
    `,
    /approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256,
         approved_at, completed_at)
      VALUES
        ('approval-approved-with-completion', 'user-a', 'package-a',
         'approve_application_package', 'payload-a', 'approved', 1,
         'application-package-staging-v1', '${packageAttestationSha256}',
         ${sourceRecheckAt}, ${completionAt});
    `,
    /approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );
});

test("rejects blocked or mismatched approval and revokes approval when readiness changes", () => {
  expectSqlReject(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '["proof missing"]', 'payload-a', 'blocked');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'payload-a', 'approved');
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '[]', 'payload-a', 'ready_for_review');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'wrong-payload', 'approved');
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlPass(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '[]', 'payload-a', 'ready_for_review');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256,
         approved_at)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'payload-a', 'approved', 1, 'application-package-staging-v1',
         '${packageAttestationSha256}', 2);
      UPDATE pursuit_packages
         SET readiness_state = 'superseded', superseded_at = 3
       WHERE id = 'package-a';
      SELECT state FROM external_action_approvals WHERE id = 'approval-a';
    `,
    "revoked",
  );
});

test("prevents mutation of a fingerprinted pursuit package payload", () => {
  expectSqlReject(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '[]', 'payload-a', 'ready_for_review');
      UPDATE pursuit_packages SET answers_json = '{"changed":true}'
       WHERE id = 'package-a';
    `,
    /pursuit package identity and payload are immutable/,
  );
});

test("binds approval to immutable asset versions and revokes it when a newer version exists", () => {
  expectSqlReject(
    `
      ${productionPursuitSql}
      UPDATE generated_assets
         SET content_sha256 = 'changed-after-package'
       WHERE id = 'asset-a';
    `,
    /generated asset identity and version payload are immutable/,
  );

  expectSqlPass(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '[]', 'payload-a', 'ready_for_review');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256,
         approved_at)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'payload-a', 'approved', 1, 'application-package-staging-v1',
         '${packageAttestationSha256}', 2);
      INSERT INTO generated_assets
        (id, user_id, pursuit_id, type, source_versions_json,
         generation_policy_version, version, content_json, content_sha256,
         filename, page_count, supersedes_asset_id, review_state)
      VALUES
        ('asset-a-v2', 'user-a', 'pursuit-a', 'resume', '{}', 'policy-2', 2,
         '{"fileSha256":"resume-file-hash-v2"}', 'asset-hash-a-v2',
         'Employer - Director Revenue Operations - Matt Dimock - Resume.pdf',
         2, 'asset-a', 'claim_safe');
      SELECT a.state || ':' || p.readiness_state
        FROM external_action_approvals a
        JOIN pursuit_packages p ON p.id = a.pursuit_package_id
       WHERE a.id = 'approval-a';
    `,
    "revoked:superseded",
  );
});

test("rejects approval when the package manifest does not match stored assets", () => {
  const mismatchedManifest = JSON.stringify({
    ...approvalAssetManifestObject,
    assets: [
      {
        id: "asset-a",
        type: "resume",
        version: 1,
        contentSha256: "wrong-hash",
        fileSha256: "resume-file-hash",
        filename: "Employer - Director Revenue Operations - Matt Dimock - Resume.pdf",
        pageCount: 2,
        reviewState: "claim_safe",
      },
      {
        id: "asset-cover-a",
        type: "cover_letter",
        version: 2,
        contentSha256: "asset-hash-cover-a",
        fileSha256: "cover-file-hash",
        filename: "Employer - Director Revenue Operations - Matt Dimock - Cover Letter.pdf",
        pageCount: 1,
        reviewState: "claim_safe",
      },
    ],
  });
  expectSqlReject(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-a', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${mismatchedManifest}', '[]', 'payload-a', 'ready_for_review');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'payload-a', 'approved');
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );
});

test("rejects package approval when an outbound file is bound to stale source evidence", () => {
  const staleBoundAssetSql = productionPursuitSql.replace(
    '"jobPostingVersionId":"job-version-live","analysisId":"analysis-a","semanticResumeId"',
    '"jobPostingVersionId":"job-version-stale","analysisId":"analysis-a","semanticResumeId"',
  );
  assert.notEqual(staleBoundAssetSql, productionPursuitSql);

  expectSqlReject(
    `
      ${staleBoundAssetSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
    `,
    /approval outbound assets are not bound to the current source and analysis/,
  );

  expectSqlReject(
    `
      ${staleBoundAssetSql}
      ${readyPackageSql()}
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'payload-a', 'requested', 1, 'application-package-staging-v1',
         '${packageAttestationSha256}');
      UPDATE external_action_approvals
         SET state = 'approved', approved_at = 2
       WHERE id = 'approval-a';
    `,
    /approval outbound assets are not bound to the current source and analysis/,
  );
});

test("makes source versions, assets, packages, and approval fingerprints identity-immutable", () => {
  expectSqlReject(
    `
      ${productionPursuitSql}
      UPDATE job_posting_versions SET id = 'job-version-rewritten'
       WHERE id = 'job-version-live';
    `,
    /job posting version identity and payload are immutable/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      UPDATE generated_assets SET user_id = 'user-b' WHERE id = 'asset-a';
    `,
    /generated asset identity and version payload are immutable/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      UPDATE pursuit_packages SET version = 2 WHERE id = 'package-a';
    `,
    /pursuit package identity and payload are immutable/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE external_action_approvals
         SET action = 'submit_application'
       WHERE id = 'approval-a';
    `,
    /external approval identity and payload are immutable|approval lifecycle, evidence, package, source version, form answers, or outbound assets are invalid/,
  );
});

test("supersedes the exact package and revokes approval when a newer source snapshot arrives", () => {
  expectSqlPass(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE job_postings
         SET description_checksum = 'job-hash-new'
       WHERE id = 'job-live';
      INSERT INTO job_posting_versions
        (id, job_posting_id, source_checked_at, source_url,
         description_checksum, source_facts_json, source_conflicts_json,
         capture_state)
      VALUES
        ('job-version-new', 'job-live', 3,
         'https://employer.example/jobs/123', 'job-hash-new',
         '${changedEmployerFormSourceFacts}', '[]', 'verified');
      SELECT pp.readiness_state || ':' || a.state || ':' || p.state || ':' ||
             p.external_approval_state || ':' || analysis.validation_state ||
             ':' || (p.current_analysis_id IS NULL)
        FROM pursuit_packages pp
        JOIN external_action_approvals a ON a.pursuit_package_id = pp.id
        JOIN pursuits p ON p.id = pp.pursuit_id
        JOIN job_analyses analysis ON analysis.id = 'analysis-a'
       WHERE pp.id = 'package-a';
    `,
    "superseded:revoked:preparing:revoked:invalidated:1",
  );
});

test("treats A to B to A as a new current observation and invalidates B-bound work", () => {
  expectSqlPass(
    `
      ${productionPursuitSql}
      UPDATE job_postings
         SET description_checksum = 'job-hash-b'
       WHERE id = 'job-live';
      INSERT INTO job_posting_versions
        (id, job_posting_id, source_checked_at, source_url,
         description_checksum, source_facts_json, source_conflicts_json,
         capture_state)
      VALUES
        ('job-version-b', 'job-live', 3,
         'https://employer.example/jobs/123', 'job-hash-b',
         '${changedEmployerFormSourceFacts}', '[]', 'verified');
      INSERT INTO job_analyses
        (id, user_id, job_posting_id, career_path_id, job_standard_id,
         policy_version, evidence_version, integrity_gates_json, fit_json,
         unknowns_json, recommendation, validation_state)
      VALUES
        ('analysis-current-b', 'user-a', 'job-live', 'path-a', 'standard-a',
         'policy-b', 'evidence-b',
         '{"jobVersionId":"job-version-b","jobDescriptionChecksum":"job-hash-b"}',
         '{}', '[]', 'pursue', 'trusted');
      UPDATE pursuits
         SET current_analysis_id = 'analysis-current-b',
             state = 'ready_for_approval',
             external_approval_state = 'requested'
       WHERE id = 'pursuit-a';
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-current-b', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-b',
         '{}', '{}', '["awaiting exact files"]', 'payload-b', 'blocked');
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state)
      VALUES
        ('approval-current-b', 'user-a', 'package-current-b',
         'approve_application_package', 'payload-b', 'requested');

      UPDATE job_postings
         SET description_checksum = 'job-hash'
       WHERE id = 'job-live';

      SELECT current_version.id || ':' || package.readiness_state || ':' ||
             approval.state || ':' || analysis.validation_state || ':' ||
             (pursuit.current_analysis_id IS NULL) || ':' || pursuit.state
        FROM job_postings posting
        JOIN job_posting_versions current_version
          ON current_version.job_posting_id = posting.id
         AND current_version.description_checksum = posting.description_checksum
        JOIN pursuit_packages package ON package.id = 'package-current-b'
        JOIN external_action_approvals approval
          ON approval.id = 'approval-current-b'
        JOIN job_analyses analysis ON analysis.id = 'analysis-current-b'
        JOIN pursuits pursuit ON pursuit.id = 'pursuit-a'
       WHERE posting.id = 'job-live';
    `,
    "job-version-live:superseded:revoked:invalidated:1:researching",
  );
});

test("supersedes an approved package and revokes its approval when a newer package version arrives", () => {
  expectSqlPass(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE pursuits
         SET external_approval_state = 'approved'
       WHERE id = 'pursuit-a';
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-b', 'user-a', 'pursuit-a', 2,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswersWithLastName}',
         '${approvalAssetManifest}', '[]', 'payload-b', 'ready_for_review');
      SELECT old_package.readiness_state || ':' || old_approval.state || ':' ||
             pursuit.state || ':' || pursuit.external_approval_state || ':' ||
             new_package.readiness_state
        FROM pursuit_packages old_package
        JOIN external_action_approvals old_approval
          ON old_approval.pursuit_package_id = old_package.id
        JOIN pursuits pursuit ON pursuit.id = old_package.pursuit_id
        JOIN pursuit_packages new_package
          ON new_package.pursuit_id = old_package.pursuit_id
         AND new_package.id = 'package-b'
       WHERE old_package.id = 'package-a';
    `,
    "superseded:revoked:preparing:revoked:ready_for_review",
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql({ id: "package-b", payloadSha256: "payload-b" })}
      INSERT INTO pursuit_packages
        (id, user_id, pursuit_id, version, destination_url,
         job_posting_version_id, answers_json, asset_manifest_json,
         blockers_json, payload_sha256, readiness_state)
      VALUES
        ('package-out-of-order', 'user-a', 'pursuit-a', 1,
         'https://employer.example/jobs/123/apply', 'job-version-live',
         '${employerFormAnswers}',
         '${approvalAssetManifest}', '[]', 'payload-old', 'ready_for_review');
    `,
    /pursuit package version must advance monotonically|UNIQUE constraint failed/,
  );
});

test("keeps runtime integrity triggers outside the Sites migration parser", () => {
  for (const [name, migration] of rawMigrationSqlByName) {
    assert.doesNotMatch(
      migration,
      /CREATE\s+TRIGGER\b/i,
      `${name} must keep compound SQLite trigger programs out of Sites migrations`,
    );
  }

  const triggerNames = new Set(
    integrityTriggerDefinitions.map(({ name }) => name),
  );
  assert.ok(triggerNames.has("external_action_approvals_insert_gate"));
  assert.ok(triggerNames.has("external_action_approvals_update_gate"));
  assert.ok(triggerNames.has("pursuit_packages_new_version_supersedes_previous"));
  for (const name of [
    "external_action_approvals_unsupported_required_field_insert",
    "external_action_approvals_unsupported_required_field_update",
    "external_action_approvals_analysis_source_binding_insert",
    "external_action_approvals_analysis_source_binding_update",
    "pursuits_analysis_change_supersedes_packages",
    "pursuit_packages_sync_pursuit_after_invalidation",
    "job_posting_versions_new_snapshot_invalidates_analyses",
    "job_postings_current_version_reversion_invalidates_dependents",
    "pursuit_events_occurred_at_guard",
    "external_action_approvals_source_recheck_insert",
    "external_action_approvals_source_recheck_update",
    "resumes_payload_immutable",
    "external_action_approvals_semantic_asset_binding_insert",
    "external_action_approvals_semantic_asset_binding_update",
    "resumes_supersession_invalidates_rendered_assets",
  ]) {
    assert.ok(triggerNames.has(name), `missing fail-closed trigger ${name}`);
  }
});

test("rejects approval against a stale source version or mismatched employer form receipt", () => {
  expectSqlReject(
    `
      ${productionPursuitSql}
      UPDATE job_postings
         SET description_checksum = 'job-hash-new'
       WHERE id = 'job-live';
      INSERT INTO job_posting_versions
        (id, job_posting_id, source_checked_at, source_url,
         description_checksum, source_facts_json, source_conflicts_json,
         capture_state)
      VALUES
        ('job-version-new', 'job-live', 3,
         'https://employer.example/jobs/123', 'job-hash-new',
         '${changedEmployerFormSourceFacts}', '[]', 'verified');
      ${readyPackageSql()}
      ${packageApprovalSql()}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval analysis is not bound to the current employer source/,
  );

  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql({
        answersJson: wrongEmployerFormAnswers,
      })}
      ${packageApprovalSql()}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, evidence, package, source version, form answers, or outbound assets are invalid|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );
});

test("rejects conflicted or incomplete source capture at approval insert and update", () => {
  const conflictSourceSql = productionPursuitSql.replace(
    `'${employerFormSourceFacts}', '[]', 'verified');`,
    `'${employerFormSourceFacts}', '["salary conflict"]', 'conflict');`,
  );
  assert.notEqual(conflictSourceSql, productionPursuitSql);
  expectSqlReject(
    `
      ${conflictSourceSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlReject(
    `
      ${conflictSourceSql}
      ${readyPackageSql()}
      INSERT INTO external_action_approvals
        (id, user_id, pursuit_package_id, action, payload_sha256, state,
         approved_pursuit_revision, attestation_version, attestation_sha256)
      VALUES
        ('approval-a', 'user-a', 'package-a', 'approve_application_package',
         'payload-a', 'requested', 1, 'application-package-staging-v1',
         '${packageAttestationSha256}');
      UPDATE external_action_approvals
         SET state = 'approved', approved_at = 2
       WHERE id = 'approval-a';
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, evidence, package, source version, form answers, or outbound assets are invalid/,
  );

  const partialSourceSql = productionPursuitSql.replace(
    `'${employerFormSourceFacts}', '[]', 'verified');`,
    `'${employerFormSourceFacts}', '[]', 'partial');`,
  );
  assert.notEqual(partialSourceSql, productionPursuitSql);
  expectSqlReject(
    `
      ${partialSourceSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );
});

test("rejects approval when a required employer file or multi-select cannot be represented exactly", () => {
  const unsupportedFileFacts = JSON.stringify({
    ...JSON.parse(employerFormSourceFacts),
    questionSet: [
      ...JSON.parse(employerFormSourceFacts).questionSet,
      {
        id: "portfolio",
        key: "portfolio",
        label: "Portfolio",
        type: "file",
        required: true,
      },
    ],
  });
  const unsupportedMultiSelectFacts = JSON.stringify({
    ...JSON.parse(employerFormSourceFacts),
    questionSet: [
      ...JSON.parse(employerFormSourceFacts).questionSet,
      {
        id: "certifications",
        key: "certifications",
        label: "Select all relevant certifications",
        type: "multi_select",
        required: true,
        values: ["PMP", "SHRM"],
      },
    ],
  });
  for (const sourceFacts of [
    unsupportedFileFacts,
    unsupportedMultiSelectFacts,
  ]) {
    const unsupportedSourceSql = productionPursuitSql.replace(
      `'${employerFormSourceFacts}', '[]', 'verified');`,
      `'${sourceFacts}', '[]', 'verified');`,
    );
    assert.notEqual(unsupportedSourceSql, productionPursuitSql);
    expectSqlReject(
      `
        ${unsupportedSourceSql}
        ${readyPackageSql()}
        ${packageApprovalSql()}
      `,
      /approval is blocked by an unsupported required employer field/,
    );
  }
});

test("rejects stale source-recheck receipts older than 24 hours", () => {
  const staleSourceRecheckAt = sourceRecheckAt - 86_400_001;
  const staleProductionPursuitSql = productionPursuitSql.replaceAll(
    String(sourceRecheckAt),
    String(staleSourceRecheckAt),
  );
  const staleManifest = JSON.stringify({
    ...approvalAssetManifestObject,
    sourceRecheck: {
      ...approvalAssetManifestObject.sourceRecheck,
      postingLastCheckedAt: staleSourceRecheckAt,
      verifiedAt: staleSourceRecheckAt,
    },
  });

  assert.notEqual(staleProductionPursuitSql, productionPursuitSql);
  expectSqlReject(
    `
      ${staleProductionPursuitSql}
      ${readyPackageSql({ manifest: staleManifest })}
      ${packageApprovalSql()}
    `,
    /approval source recheck receipt is missing or older than 24 hours/,
  );
});

test("does not let another tenant's fresh recheck refresh a stale user receipt", () => {
  const staleSourceRecheckAt = sourceRecheckAt - 86_400_001;
  const staleUserProductionSql = productionPursuitSql.replaceAll(
    String(sourceRecheckAt),
    String(staleSourceRecheckAt),
  );
  const staleUserManifest = JSON.stringify({
    ...approvalAssetManifestObject,
    sourceRecheck: {
      ...approvalAssetManifestObject.sourceRecheck,
      postingLastCheckedAt: staleSourceRecheckAt,
      verifiedAt: staleSourceRecheckAt,
    },
  });

  expectSqlReject(
    `
      ${staleUserProductionSql}
      INSERT INTO audit_events
        (id, user_id, actor_subject, event_type, entity_type, entity_id,
         metadata_json, created_at)
      VALUES
        ('audit-user-b-fresh', 'user-b', 'test:source-recheck',
         'greenhouse_job_ingested', 'job_posting', 'job-live',
         '{"descriptionChecksum":"job-hash"}', ${sourceRecheckAt});
      UPDATE job_postings
         SET last_checked_at = ${sourceRecheckAt}
       WHERE id = 'job-live';
      ${readyPackageSql({ manifest: staleUserManifest })}
      ${packageApprovalSql()}
    `,
    /approval source recheck receipt is missing or older than 24 hours/,
  );
});

test("rejects future outcome dates while allowing bounded future scheduled events", () => {
  const now = Date.now();
  expectSqlReject(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_events
        (id, user_id, pursuit_id, event_type, occurred_at, metadata_json)
      VALUES
        ('future-outcome', 'user-a', 'pursuit-a', 'application_submitted',
         ${now + 10 * 60 * 1000}, '{}');
    `,
    /pursuit event date is outside the allowed window/,
  );

  expectSqlPass(
    `
      ${productionPursuitSql}
      INSERT INTO pursuit_events
        (id, user_id, pursuit_id, event_type, occurred_at, metadata_json)
      VALUES
        ('future-interview', 'user-a', 'pursuit-a', 'interview_scheduled',
         ${now + 365 * 24 * 60 * 60 * 1000}, '{}');
      SELECT event_type FROM pursuit_events WHERE id = 'future-interview';
    `,
    "interview_scheduled",
  );
});

test("changing the current analysis supersedes the package and revokes approval WIP", () => {
  expectSqlPass(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      INSERT INTO job_analyses
        (id, user_id, job_posting_id, career_path_id, job_standard_id,
         policy_version, evidence_version, integrity_gates_json, fit_json,
         unknowns_json, recommendation, validation_state)
      VALUES
        ('analysis-new', 'user-a', 'job-live', 'path-a', 'standard-a',
         'policy-2', 'evidence-2',
         '{"jobVersionId":"job-version-live","jobDescriptionChecksum":"job-hash"}',
         '{}', '[]', 'pursue', 'trusted');
      UPDATE pursuits
         SET current_analysis_id = 'analysis-new',
             external_approval_state = 'approved'
       WHERE id = 'pursuit-a';
      SELECT pp.readiness_state || ':' || approval.state || ':' ||
             pursuit.state || ':' || pursuit.external_approval_state || ':' ||
             (pursuit.revision > 1)
        FROM pursuit_packages pp
        JOIN external_action_approvals approval
          ON approval.pursuit_package_id = pp.id
        JOIN pursuits pursuit ON pursuit.id = pp.pursuit_id
       WHERE pp.id = 'package-a';
    `,
    "superseded:revoked:preparing:revoked:1",
  );
});

test("superseding a semantic resume invalidates its file, package, and approval", () => {
  expectSqlPass(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      UPDATE pursuits
         SET external_approval_state = 'approved'
       WHERE id = 'pursuit-a';
      UPDATE resumes
         SET review_state = 'superseded'
       WHERE id = 'resume-semantic-a';
      SELECT semantic.review_state || ':' || rendered.review_state || ':' ||
             (rendered.invalidated_at IS NOT NULL) || ':' ||
             package.readiness_state || ':' || approval.state || ':' ||
             pursuit.state || ':' || pursuit.external_approval_state
        FROM resumes semantic
        JOIN generated_assets rendered ON rendered.id = 'asset-a'
        JOIN pursuit_packages package ON package.id = 'package-a'
        JOIN external_action_approvals approval
          ON approval.pursuit_package_id = package.id
        JOIN pursuits pursuit ON pursuit.id = package.pursuit_id
       WHERE semantic.id = 'resume-semantic-a';
    `,
    "superseded:superseded:1:superseded:revoked:preparing:revoked",
  );
});

test("rejects draft assets and missing or mismatched binary file fingerprints", () => {
  const draftResumeSql = productionPursuitSql.replace(
    "     2, 'claim_safe'),\n    ('asset-cover-a'",
    "     2, 'draft'),\n    ('asset-cover-a'",
  );
  assert.notEqual(draftResumeSql, productionPursuitSql);
  const draftManifest = JSON.stringify({
    ...approvalAssetManifestObject,
    assets: approvalAssetManifest
      ? JSON.parse(approvalAssetManifest).assets.map((asset) =>
          asset.id === "asset-a" ? { ...asset, reviewState: "draft" } : asset,
        )
      : [],
  });

  expectSqlReject(
    `
      ${draftResumeSql}
      ${readyPackageSql({ manifest: draftManifest })}
      ${packageApprovalSql()}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  const missingFileHashSql = productionPursuitSql.replace(
    '"fileSha256":"resume-file-hash",',
    "",
  );
  assert.notEqual(missingFileHashSql, productionPursuitSql);
  const missingFileHashManifest = JSON.stringify({
    ...approvalAssetManifestObject,
    assets: JSON.parse(approvalAssetManifest).assets.map((asset) => {
      if (asset.id !== "asset-a") return asset;
      const withoutFileSha256 = { ...asset };
      delete withoutFileSha256.fileSha256;
      return withoutFileSha256;
    }),
  });

  expectSqlReject(
    `
      ${missingFileHashSql}
      ${readyPackageSql({ manifest: missingFileHashManifest })}
      ${packageApprovalSql()}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  const wrongFileHashManifest = JSON.stringify({
    ...approvalAssetManifestObject,
    assets: JSON.parse(approvalAssetManifest).assets.map((asset) =>
      asset.id === "asset-a" ? { ...asset, fileSha256: "wrong-file-hash" } : asset,
    ),
  });
  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql({ manifest: wrongFileHashManifest })}
      ${packageApprovalSql()}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );
});

test("keeps future application submission behind a distinct package approval", () => {
  expectSqlReject(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql({ id: "submission-a", action: "submit_application" })}
    `,
    /approval package, source version, form answers, or outbound assets are not exact and current|approval lifecycle, timestamps, package, source version, form answers, or outbound assets are invalid/,
  );

  expectSqlPass(
    `
      ${productionPursuitSql}
      ${readyPackageSql()}
      ${packageApprovalSql()}
      ${packageApprovalSql({ id: "submission-a", action: "submit_application" })}
      SELECT group_concat(action || ':' || state, '|')
        FROM external_action_approvals
       WHERE pursuit_package_id = 'package-a'
       ORDER BY action;
    `,
    "approve_application_package:approved|submit_application:approved",
  );
});

test("accepts only one founder workspace import receipt per user", () => {
  expectSqlReject(
    `
      ${usersSql}
      INSERT INTO audit_events
        (id, user_id, actor_subject, event_type, entity_type, entity_id,
         metadata_json)
      VALUES
        ('audit-import-1', 'user-a', 'auth-a', 'founder_workspace_imported',
         'workspace', 'user-a', '{}'),
        ('audit-import-2', 'user-a', 'auth-a', 'founder_workspace_imported',
         'workspace', 'user-a', '{}');
    `,
    /UNIQUE constraint failed/,
  );
});
