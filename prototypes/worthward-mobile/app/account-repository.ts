import { env } from "cloudflare:workers";
import type { FounderActor, JsonRecord } from "./production-types";
import {
  ACCOUNT_DELETION_CONFIRMATION,
  ACCOUNT_RESTART_CONFIRMATION,
  MAXIMUM_D1_RECOVERY_WINDOW_DAYS,
  PUBLIC_ALPHA_POLICY_VERSION,
} from "./account-policy";
import {
  deletedIdentityWorkloadRef,
  ensureUser,
} from "./workspace-repository";

type RuntimeEnv = {
  DB?: D1Database;
};

type ExportDataset = {
  key: string;
  sql: string;
  userIdBindings: number;
};

type FinancialRow = {
  order_count: number;
  cohort_count: number;
  revenue_count: number;
};

export class AccountDataError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AccountDataError";
    this.status = status;
  }
}

function database(): D1Database {
  const db = (env as unknown as RuntimeEnv).DB;
  if (!db) throw new AccountDataError("Way Ahead storage is unavailable.", 503);
  return db;
}

function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

/**
 * Every account-export query is bound to the authenticated user's derived ID.
 * No route-supplied user, tenant, object, job, pursuit, or asset ID is accepted.
 */
export const ACCOUNT_EXPORT_DATASETS: readonly ExportDataset[] = [
  {
    key: "consents",
    sql: "SELECT id, purpose, policy_version, state, granted_at, revoked_at, source, created_at FROM consents WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "sourceImports",
    sql: "SELECT id, type, original_name, checksum_sha256, content_type, byte_size, parse_state, parser_version, retention_ends_at, deleted_at, created_at, updated_at FROM source_imports WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "profileFacts",
    sql: "SELECT id, source_import_id, fact_type, value_json, source_span, extraction_method, extraction_policy_version, state, confidence, ownership, supersedes_fact_id, invalidated_at, created_at, updated_at FROM profile_facts WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "profileFactDependencies",
    sql: "SELECT dependent_fact_id, source_fact_id, relationship, invalidation_policy, created_at FROM profile_fact_dependencies WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "experienceRoles",
    sql: "SELECT id, employer, title, start_date, end_date, is_current, location, summary, review_state, created_at, updated_at FROM experience_roles WHERE user_id = ? ORDER BY start_date, created_at",
    userIdBindings: 1,
  },
  {
    key: "achievementBullets",
    sql: "SELECT id, experience_role_id, text, categories_json, metrics_state, confidence, approval_state, created_at, updated_at FROM achievement_bullets WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "experienceRoleFacts",
    sql: "SELECT experience_role_id, profile_fact_id, relationship, created_at FROM experience_role_facts WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "achievementBulletFacts",
    sql: "SELECT achievement_bullet_id, profile_fact_id, relationship, created_at FROM achievement_bullet_facts WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "experienceRoleMergeProposals",
    sql: "SELECT id, source_role_id, target_role_id, similarity_score, proposed_resolution_json, conflicts_json, state, decided_by_user_at, decision_note, created_at, updated_at FROM experience_role_merge_proposals WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "profileSkills",
    sql: "SELECT ps.skill_id, s.canonical_name, s.category, ps.level, ps.last_used_year, ps.source_fact_id, ps.confidence, ps.review_state, ps.created_at FROM profile_skills ps JOIN skills s ON s.id = ps.skill_id WHERE ps.user_id = ? ORDER BY s.category, s.canonical_name",
    userIdBindings: 1,
  },
  {
    key: "jobStandards",
    sql: "SELECT id, version, is_current, pay_basis, minimum_pay_cents, target_pay_cents, currency, work_arrangements_json, commute_miles, locations_json, travel_maximum_percent, schedule_requirements, benefits_json, growth_priorities_json, exclusions_json, created_at FROM job_standards WHERE user_id = ? ORDER BY version",
    userIdBindings: 1,
  },
  {
    key: "careerPaths",
    sql: "SELECT id, label, primary_lane, secondary_lanes_json, fit_score, opportunity_score, rationale_json, gaps_json, state, is_primary, created_at, updated_at FROM career_paths WHERE user_id = ? ORDER BY is_primary DESC, label",
    userIdBindings: 1,
  },
  {
    key: "resumes",
    sql: "SELECT id, name, kind, version, content_json, template_key, review_state, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY name, version",
    userIdBindings: 1,
  },
  {
    key: "resumeAssignments",
    sql: "SELECT id, resume_id, scope, career_path_id, job_posting_id, created_at FROM resume_assignments WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "userJobLinks",
    sql: "SELECT id, job_posting_id, source, state, created_at, updated_at FROM user_job_links WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "jobAnalyses",
    sql: "SELECT id, job_posting_id, career_path_id, job_standard_id, policy_version, evidence_version, integrity_gates_json, move_value_score, pursuit_readiness_score, fit_json, unknowns_json, recommendation, validation_state, created_at, invalidated_at FROM job_analyses WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "pursuits",
    sql: "SELECT id, job_posting_id, current_analysis_id, state, next_action, external_approval_state, applied_at, closed_reason, created_at, updated_at FROM pursuits WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "generatedAssets",
    sql: "SELECT id, pursuit_id, type, source_versions_json, generation_policy_version, version, content_json, content_sha256, filename, page_count, supersedes_asset_id, invalidated_at, review_state, created_at, updated_at FROM generated_assets WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "pursuitPackages",
    sql: "SELECT id, pursuit_id, version, destination_url, job_posting_version_id, answers_json, asset_manifest_json, blockers_json, payload_sha256, readiness_state, superseded_at, created_at FROM pursuit_packages WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "externalActionApprovals",
    sql: "SELECT id, pursuit_package_id, action, payload_sha256, state, approved_at, revoked_at, completed_at, created_at FROM external_action_approvals WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "auditEvents",
    sql: "SELECT id, actor_subject, event_type, entity_type, entity_id, metadata_json, created_at FROM audit_events WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "cohortMemberships",
    sql: "SELECT id, offer_version_id, price_test_key, acquisition_source, campaign_key, entered_at, converted_at, converted_offer_version_id, matures_at, observation_window_days, eligibility_state, exclusion_reason, terminal_state, created_at, updated_at FROM cohort_memberships WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "ordersCharges",
    sql: "SELECT id, offer_version_id, cohort_membership_id, acquisition_source, currency, gross_amount_minor, discount_amount_minor, tax_amount_minor, cash_collected_minor, processor_fee_micros, refund_amount_minor, credit_amount_minor, chargeback_amount_minor, processor, provider_reference, service_starts_at, service_ends_at, renewal_state, settlement_state, created_at, updated_at FROM orders_charges WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "revenueSchedule",
    sql: "SELECT rs.* FROM revenue_schedule rs JOIN orders_charges oc ON oc.id = rs.order_id WHERE oc.user_id = ? ORDER BY rs.created_at",
    userIdBindings: 1,
  },
  {
    key: "costEvents",
    sql: "SELECT id, stream, category, unit_name, units_micros, rate_micros_per_unit, amount_micros, estimate_state, cash_state, vendor, rate_card_version, order_id, workload_ref, shared_object_ref, allocation_method, allocation_version, allocation_group_id, allocation_share_bps, shared_total_amount_micros, allocation_remainder_micros, allocated_offer_version_id, cohort_membership_id, incurred_at, metadata_json, created_at FROM cost_events WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "affiliateEvents",
    sql: "SELECT id, partner_key, program_version, referral_reference, event_type, event_at, currency, commission_basis_minor, commission_rate_bps, gross_earned_minor, refund_clawback_minor, net_payable_minor, payout_state, payout_at, disclosure_version, complaint_state, cannibalization_state, metadata_json, created_at FROM affiliate_events WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "subscriptions",
    sql: "SELECT id, offer_version_id, plan_key, state, term_starts_at, term_ends_at, entitlements_json, billing_provider, billing_reference, created_at, updated_at FROM subscriptions WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "usageEvents",
    sql: "SELECT id, action, provider, model, policy_version, latency_ms, variable_cost_micros, result_state, correction_state, cohort, cost_event_id, workload_ref, metadata_json, created_at FROM usage_events WHERE user_id = ? ORDER BY created_at",
    userIdBindings: 1,
  },
  {
    key: "jobPostings",
    sql: "SELECT DISTINCT jp.* FROM job_postings jp WHERE EXISTS (SELECT 1 FROM user_job_links ujl WHERE ujl.user_id = ? AND ujl.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM job_analyses ja WHERE ja.user_id = ? AND ja.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM pursuits p WHERE p.user_id = ? AND p.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM resume_assignments ra WHERE ra.user_id = ? AND ra.job_posting_id = jp.id) ORDER BY jp.last_checked_at DESC",
    userIdBindings: 4,
  },
  {
    key: "jobPostingVersions",
    sql: "SELECT DISTINCT jpv.* FROM job_posting_versions jpv JOIN job_postings jp ON jp.id = jpv.job_posting_id WHERE EXISTS (SELECT 1 FROM user_job_links ujl WHERE ujl.user_id = ? AND ujl.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM job_analyses ja WHERE ja.user_id = ? AND ja.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM pursuits p WHERE p.user_id = ? AND p.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM resume_assignments ra WHERE ra.user_id = ? AND ra.job_posting_id = jp.id) ORDER BY jpv.source_checked_at DESC",
    userIdBindings: 4,
  },
  {
    key: "jobSources",
    sql: "SELECT DISTINCT js.* FROM job_sources js JOIN job_postings jp ON jp.source_id = js.id WHERE EXISTS (SELECT 1 FROM user_job_links ujl WHERE ujl.user_id = ? AND ujl.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM job_analyses ja WHERE ja.user_id = ? AND ja.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM pursuits p WHERE p.user_id = ? AND p.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM resume_assignments ra WHERE ra.user_id = ? AND ra.job_posting_id = jp.id) ORDER BY js.name",
    userIdBindings: 4,
  },
] as const;

/**
 * User-owned rows are removed in dependency order. Shared job postings and
 * skill taxonomy rows intentionally remain without a personal association.
 */
export const ACCOUNT_PURGE_SQL: readonly string[] = [
  "DELETE FROM external_action_approvals WHERE user_id = ?",
  "DELETE FROM pursuit_packages WHERE user_id = ?",
  "DELETE FROM generated_assets WHERE user_id = ?",
  "DELETE FROM resume_assignments WHERE user_id = ?",
  "DELETE FROM resumes WHERE user_id = ?",
  "DELETE FROM pursuits WHERE user_id = ?",
  "DELETE FROM job_analyses WHERE user_id = ?",
  "DELETE FROM user_job_links WHERE user_id = ?",
  "DELETE FROM career_paths WHERE user_id = ?",
  "DELETE FROM job_standards WHERE user_id = ?",
  "DELETE FROM profile_skills WHERE user_id = ?",
  "DELETE FROM achievement_bullet_facts WHERE user_id = ?",
  "DELETE FROM experience_role_facts WHERE user_id = ?",
  "DELETE FROM profile_fact_dependencies WHERE user_id = ?",
  "DELETE FROM experience_role_merge_proposals WHERE user_id = ?",
  "DELETE FROM achievement_bullets WHERE user_id = ?",
  "DELETE FROM experience_roles WHERE user_id = ?",
  "UPDATE profile_facts SET supersedes_fact_id = NULL WHERE user_id = ?",
  "DELETE FROM profile_facts WHERE user_id = ?",
  "DELETE FROM source_imports WHERE user_id = ?",
  "DELETE FROM audit_events WHERE user_id = ?",
  "DELETE FROM consents WHERE user_id = ?",
  "DELETE FROM subscriptions WHERE user_id = ?",
  "DELETE FROM affiliate_events WHERE user_id = ?",
  "DELETE FROM usage_events WHERE user_id = ?",
  "DELETE FROM cost_events WHERE user_id = ?",
] as const;

export async function exportAccountData(actor: FounderActor): Promise<JsonRecord> {
  const user = await ensureUser(actor);
  const db = database();
  const statements = ACCOUNT_EXPORT_DATASETS.map((dataset) =>
    db
      .prepare(dataset.sql)
      .bind(...Array.from({ length: dataset.userIdBindings }, () => user.id)),
  );
  const results = await db.batch(statements);
  const datasets = Object.fromEntries(
    ACCOUNT_EXPORT_DATASETS.map((dataset, index) => [
      dataset.key,
      results[index]?.results ?? [],
    ]),
  );

  return {
    exportVersion: "way-ahead-account-export-v1",
    policyVersion: PUBLIC_ALPHA_POLICY_VERSION,
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      lifecycleState: user.lifecycle_state,
      identityProvider: "chatgpt",
    },
    storageBoundary: {
      rawResumeBytesStored: false,
      privateObjectStorageConnected: false,
      modelProviderConnected: false,
      emailProviderConnected: false,
      billingProviderConnected: false,
    },
    retention: {
      liveAccountData: "Kept until the member deletes the account.",
      providerRecoveryHistoryMaximumDays:
        MAXIMUM_D1_RECOVERY_WINDOW_DAYS,
      recoveryUse:
        "Disaster recovery only. A deleted account is not recreated for ordinary product use.",
    },
    datasets,
  };
}

export async function deleteMemberAccount(
  actor: FounderActor,
  confirmation: unknown,
): Promise<{ receiptId: string; deletedAt: string; recoveryHistoryEndsBy: string }> {
  if (confirmation !== ACCOUNT_DELETION_CONFIRMATION) {
    throw new AccountDataError(`Type ${ACCOUNT_DELETION_CONFIRMATION} to confirm deletion.`);
  }

  const user = await ensureUser(actor);
  if (user.role !== "member") {
    throw new AccountDataError(
      "The configured owner account requires a separate Board-approved recovery plan before deletion.",
      403,
    );
  }

  const db = database();
  const financial = await db
    .prepare(
      "SELECT (SELECT count(*) FROM orders_charges WHERE user_id = ?) AS order_count, (SELECT count(*) FROM cohort_memberships WHERE user_id = ?) AS cohort_count, (SELECT count(*) FROM revenue_schedule rs JOIN orders_charges oc ON oc.id = rs.order_id WHERE oc.user_id = ?) AS revenue_count",
    )
    .bind(user.id, user.id, user.id)
    .first<FinancialRow>();
  if (
    (financial?.order_count ?? 0) > 0 ||
    (financial?.cohort_count ?? 0) > 0 ||
    (financial?.revenue_count ?? 0) > 0
  ) {
    throw new AccountDataError(
      "Self-service deletion stopped because financial records require a separate retention review. Use the visible feedback route.",
      409,
    );
  }

  const receiptId = `deletion_${crypto.randomUUID()}`;
  const deletedAt = new Date();
  const deletedIdentityRef = await deletedIdentityWorkloadRef(actor);
  const recoveryHistoryEndsBy = new Date(
    deletedAt.getTime() +
      MAXIMUM_D1_RECOVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  await db.batch([
    ...ACCOUNT_PURGE_SQL.map((sql) => db.prepare(sql).bind(user.id)),
    db
      .prepare(
        "INSERT INTO usage_events (id, user_id, action, policy_version, result_state, workload_ref, metadata_json) VALUES (?, ?, 'account_deleted', ?, 'completed', ?, ?)",
      )
      .bind(
        receiptId,
        user.id,
        PUBLIC_ALPHA_POLICY_VERSION,
        deletedIdentityRef,
        json({
          receiptId,
          deletedAt: deletedAt.toISOString(),
          liveAccountDataDeleted: true,
          privateObjectsDeleted: 0,
          providerRecoveryHistoryMaximumDays:
            MAXIMUM_D1_RECOVERY_WINDOW_DAYS,
          recoveryHistoryEndsBy,
        }),
      ),
    db
      .prepare("DELETE FROM users WHERE id = ? AND role = 'member'")
      .bind(user.id),
  ]);

  const [remainingUser, deletionReceipt] = await Promise.all([
    db
      .prepare("SELECT id FROM users WHERE id = ? LIMIT 1")
      .bind(user.id)
      .first<{ id: string }>(),
    db
      .prepare(
        "SELECT id FROM usage_events WHERE id = ? AND user_id IS NULL AND action = 'account_deleted' LIMIT 1",
      )
      .bind(receiptId)
      .first<{ id: string }>(),
  ]);
  if (remainingUser || !deletionReceipt) {
    throw new AccountDataError(
      "Way Ahead could not verify the deletion receipt. Stop and report this immediately.",
      500,
    );
  }

  return {
    receiptId,
    deletedAt: deletedAt.toISOString(),
    recoveryHistoryEndsBy,
  };
}

export async function restartDeletedAccount(
  actor: FounderActor,
  confirmation: unknown,
): Promise<{ restarted: true }> {
  if (confirmation !== ACCOUNT_RESTART_CONFIRMATION) {
    throw new AccountDataError(
      `Type ${ACCOUNT_RESTART_CONFIRMATION} to start a new empty account.`,
    );
  }
  const db = database();
  const workloadRef = await deletedIdentityWorkloadRef(actor);
  const receipt = await db
    .prepare(
      "SELECT id FROM usage_events WHERE user_id IS NULL AND action = 'account_deleted' AND workload_ref = ? LIMIT 1",
    )
    .bind(workloadRef)
    .first<{ id: string }>();
  if (!receipt) {
    throw new AccountDataError(
      "No deleted Way Ahead account is waiting to restart.",
      404,
    );
  }

  const restartReceiptId = `restart_${crypto.randomUUID()}`;
  await db.batch([
    db
      .prepare(
        "UPDATE usage_events SET workload_ref = ? WHERE id = ? AND user_id IS NULL AND action = 'account_deleted' AND workload_ref = ?",
      )
      .bind(`prior_${workloadRef}:${receipt.id}`, receipt.id, workloadRef),
    db
      .prepare(
        "INSERT INTO usage_events (id, user_id, action, policy_version, result_state, workload_ref, metadata_json) VALUES (?, NULL, 'account_restarted', ?, 'completed', ?, ?)",
      )
      .bind(
        restartReceiptId,
        PUBLIC_ALPHA_POLICY_VERSION,
        receipt.id,
        json({
          restartReceiptId,
          priorDeletionReceiptId: receipt.id,
          restartedAt: new Date().toISOString(),
          emptyAccountRequired: true,
        }),
      ),
  ]);

  return { restarted: true };
}
