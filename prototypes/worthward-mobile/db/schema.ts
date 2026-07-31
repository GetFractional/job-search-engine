import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Way Ahead production data contract.
 *
 * Every user-owned record is tenant scoped. External actions remain separately
 * approval-gated even when the product is running in the founder environment.
 */

export type ConsentPurpose =
  | "terms"
  | "privacy"
  | "alpha_data_use"
  | "profile_processing"
  | "voice_transcription"
  | "job_alerts"
  | "marketing";
export type FactState =
  | "extracted"
  | "inferred"
  | "suggested"
  | "user_confirmed"
  | "user_corrected"
  | "rejected"
  | "missing";
export type ExtractionMethod =
  | "deterministic_parser"
  | "model_extraction"
  | "manual_entry"
  | "voice_transcript"
  | "user_correction"
  | "merge_resolution";
export type SourceImportType =
  | "resume_pdf"
  | "resume_docx"
  | "linkedin_pdf"
  | "linkedin_export"
  | "pasted_text"
  | "manual"
  | "voice";
export type CareerPathState = "suggested" | "active" | "paused" | "rejected";
export type PursuitState =
  | "saved"
  | "researching"
  | "preparing"
  | "ready_for_approval"
  | "applying"
  | "applied"
  | "interviewing"
  | "offered"
  | "accepted"
  | "closed";
export type PursuitEventType =
  | "application_submitted"
  | "interview_scheduled"
  | "interview_completed"
  | "follow_up_scheduled"
  | "offer_received"
  | "offer_accepted"
  | "offer_declined"
  | "rejected"
  | "withdrawn"
  | "closed_no_response"
  | "learning_recorded";
export type RevenueStream = "software" | "affiliate" | "human_service";
export type OfferBillingType =
  | "free"
  | "monthly"
  | "prepaid_term"
  | "one_time"
  | "commission";
export type CostCategory =
  | "source_data"
  | "rendering"
  | "model_stage_a"
  | "model_stage_b"
  | "adjudication"
  | "retry_validation"
  | "storage"
  | "egress"
  | "queue"
  | "email"
  | "push"
  | "sms"
  | "processor"
  | "dispute"
  | "support"
  | "correction_rework"
  | "trust_recovery"
  | "human_fulfillment"
  | "acquisition"
  | "other";

type JsonObject = Record<string, unknown>;
type StringList = string[];

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    authSubject: text("auth_subject").notNull(),
    identityProvider: text("identity_provider").notNull().default("chatgpt"),
    role: text("role").$type<"owner" | "member">().notNull().default("member"),
    email: text("email").notNull(),
    displayName: text("display_name"),
    locale: text("locale").notNull().default("en-US"),
    timezone: text("timezone").notNull().default("America/Chicago"),
    lifecycleState: text("lifecycle_state").notNull().default("private_alpha"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("users_auth_subject_unique").on(table.authSubject),
    uniqueIndex("users_email_unique").on(table.email),
  ],
);

export const consents = sqliteTable(
  "consents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purpose: text("purpose").$type<ConsentPurpose>().notNull(),
    policyVersion: text("policy_version").notNull(),
    state: text("state").$type<"granted" | "revoked">().notNull(),
    grantedAt: integer("granted_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    source: text("source").notNull(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    index("consents_user_purpose_idx").on(table.userId, table.purpose),
  ],
);

export const sourceImports = sqliteTable(
  "source_imports",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<SourceImportType>().notNull(),
    originalName: text("original_name"),
    objectKey: text("object_key"),
    checksumSha256: text("checksum_sha256").notNull(),
    contentType: text("content_type"),
    byteSize: integer("byte_size"),
    parseState: text("parse_state")
      .$type<"received" | "processing" | "review_ready" | "failed" | "deleted">()
      .notNull()
      .default("received"),
    parserVersion: text("parser_version"),
    retentionEndsAt: integer("retention_ends_at", { mode: "timestamp_ms" }),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("source_imports_user_id_unique").on(table.userId, table.id),
    index("source_imports_user_state_idx").on(table.userId, table.parseState),
    uniqueIndex("source_imports_user_checksum_unique").on(
      table.userId,
      table.checksumSha256,
    ),
  ],
);

export const profileFacts = sqliteTable(
  "profile_facts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceImportId: text("source_import_id"),
    factType: text("fact_type").notNull(),
    valueJson: text("value_json", { mode: "json" }).$type<JsonObject>().notNull(),
    sourceSpan: text("source_span"),
    extractionMethod: text("extraction_method")
      .$type<ExtractionMethod>()
      .notNull()
      .default("manual_entry"),
    extractionPolicyVersion: text("extraction_policy_version")
      .notNull()
      .default("local-v1"),
    state: text("state").$type<FactState>().notNull(),
    confidence: integer("confidence"),
    ownership: text("ownership")
      .$type<"owned" | "shared" | "supported" | "unknown">()
      .notNull()
      .default("unknown"),
    supersedesFactId: text("supersedes_fact_id"),
    invalidatedAt: integer("invalidated_at", { mode: "timestamp_ms" }),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("profile_facts_user_id_unique").on(table.userId, table.id),
    index("profile_facts_user_type_state_idx").on(
      table.userId,
      table.factType,
      table.state,
    ),
    foreignKey({
      columns: [table.userId, table.sourceImportId],
      foreignColumns: [sourceImports.userId, sourceImports.id],
      name: "profile_facts_source_import_tenant_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.userId, table.supersedesFactId],
      foreignColumns: [table.userId, table.id],
      name: "profile_facts_supersedes_fact_tenant_fk",
    }).onDelete("restrict"),
  ],
);

export const profileFactDependencies = sqliteTable(
  "profile_fact_dependencies",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dependentFactId: text("dependent_fact_id").notNull(),
    sourceFactId: text("source_fact_id").notNull(),
    relationship: text("relationship")
      .$type<"derived_from" | "supports" | "conflicts_with">()
      .notNull(),
    invalidationPolicy: text("invalidation_policy")
      .$type<"invalidate" | "review" | "none">()
      .notNull()
      .default("review"),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    primaryKey({ columns: [table.dependentFactId, table.sourceFactId] }),
    check(
      "profile_fact_dependencies_no_self_check",
      sql`${table.dependentFactId} <> ${table.sourceFactId}`,
    ),
    foreignKey({
      columns: [table.userId, table.dependentFactId],
      foreignColumns: [profileFacts.userId, profileFacts.id],
      name: "profile_fact_dependencies_dependent_tenant_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId, table.sourceFactId],
      foreignColumns: [profileFacts.userId, profileFacts.id],
      name: "profile_fact_dependencies_source_tenant_fk",
    }).onDelete("cascade"),
  ],
);

export const experienceRoles = sqliteTable(
  "experience_roles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    employer: text("employer").notNull(),
    title: text("title").notNull(),
    startDate: text("start_date"),
    endDate: text("end_date"),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
    location: text("location"),
    summary: text("summary"),
    reviewState: text("review_state")
      .$type<"draft" | "confirmed" | "conflict">()
      .notNull()
      .default("draft"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("experience_roles_user_id_unique").on(table.userId, table.id),
    index("experience_roles_user_dates_idx").on(table.userId, table.startDate),
  ],
);

export const achievementBullets = sqliteTable(
  "achievement_bullets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    experienceRoleId: text("experience_role_id"),
    text: text("text").notNull(),
    categoriesJson: text("categories_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    metricsState: text("metrics_state")
      .$type<"validated" | "estimated" | "missing" | "do_not_use">()
      .notNull()
      .default("missing"),
    confidence: integer("confidence"),
    approvalState: text("approval_state")
      .$type<"draft" | "approved" | "rejected">()
      .notNull()
      .default("draft"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("achievement_bullets_user_id_unique").on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.experienceRoleId],
      foreignColumns: [experienceRoles.userId, experienceRoles.id],
      name: "achievement_bullets_role_tenant_fk",
    }).onDelete("restrict"),
    index("achievement_bullets_user_role_idx").on(table.userId, table.experienceRoleId),
  ],
);

export const experienceRoleFacts = sqliteTable(
  "experience_role_facts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    experienceRoleId: text("experience_role_id").notNull(),
    profileFactId: text("profile_fact_id").notNull(),
    relationship: text("relationship")
      .$type<"primary_source" | "supporting" | "conflicting">()
      .notNull(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    primaryKey({ columns: [table.experienceRoleId, table.profileFactId] }),
    foreignKey({
      columns: [table.userId, table.experienceRoleId],
      foreignColumns: [experienceRoles.userId, experienceRoles.id],
      name: "experience_role_facts_role_tenant_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId, table.profileFactId],
      foreignColumns: [profileFacts.userId, profileFacts.id],
      name: "experience_role_facts_fact_tenant_fk",
    }).onDelete("cascade"),
  ],
);

export const achievementBulletFacts = sqliteTable(
  "achievement_bullet_facts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementBulletId: text("achievement_bullet_id").notNull(),
    profileFactId: text("profile_fact_id").notNull(),
    relationship: text("relationship")
      .$type<"primary_source" | "supporting" | "conflicting">()
      .notNull(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    primaryKey({ columns: [table.achievementBulletId, table.profileFactId] }),
    foreignKey({
      columns: [table.userId, table.achievementBulletId],
      foreignColumns: [achievementBullets.userId, achievementBullets.id],
      name: "achievement_bullet_facts_bullet_tenant_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId, table.profileFactId],
      foreignColumns: [profileFacts.userId, profileFacts.id],
      name: "achievement_bullet_facts_fact_tenant_fk",
    }).onDelete("cascade"),
  ],
);

export const experienceRoleMergeProposals = sqliteTable(
  "experience_role_merge_proposals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceRoleId: text("source_role_id").notNull(),
    targetRoleId: text("target_role_id").notNull(),
    similarityScore: integer("similarity_score"),
    proposedResolutionJson: text("proposed_resolution_json", { mode: "json" })
      .$type<JsonObject>()
      .notNull(),
    conflictsJson: text("conflicts_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    state: text("state")
      .$type<"proposed" | "accepted" | "rejected" | "superseded">()
      .notNull()
      .default("proposed"),
    decidedByUserAt: integer("decided_by_user_at", { mode: "timestamp_ms" }),
    decisionNote: text("decision_note"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("experience_role_merge_pair_unique").on(
      table.userId,
      table.sourceRoleId,
      table.targetRoleId,
    ),
    check(
      "experience_role_merge_no_self_check",
      sql`${table.sourceRoleId} <> ${table.targetRoleId}`,
    ),
    check(
      "experience_role_merge_user_decision_check",
      sql`(${table.state} = 'proposed' AND ${table.decidedByUserAt} IS NULL) OR (${table.state} <> 'proposed' AND ${table.decidedByUserAt} IS NOT NULL)`,
    ),
    foreignKey({
      columns: [table.userId, table.sourceRoleId],
      foreignColumns: [experienceRoles.userId, experienceRoles.id],
      name: "experience_role_merge_source_tenant_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId, table.targetRoleId],
      foreignColumns: [experienceRoles.userId, experienceRoles.id],
      name: "experience_role_merge_target_tenant_fk",
    }).onDelete("cascade"),
  ],
);

export const skills = sqliteTable(
  "skills",
  {
    id: text("id").primaryKey(),
    canonicalName: text("canonical_name").notNull(),
    category: text("category").notNull(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [uniqueIndex("skills_name_category_unique").on(table.canonicalName, table.category)],
);

export const profileSkills = sqliteTable(
  "profile_skills",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: text("level").$type<"foundational" | "working" | "advanced" | "expert">(),
    lastUsedYear: integer("last_used_year"),
    sourceFactId: text("source_fact_id"),
    confidence: integer("confidence"),
    reviewState: text("review_state")
      .$type<"draft" | "confirmed" | "rejected">()
      .notNull()
      .default("draft"),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.skillId] }),
    foreignKey({
      columns: [table.userId, table.sourceFactId],
      foreignColumns: [profileFacts.userId, profileFacts.id],
      name: "profile_skills_source_fact_tenant_fk",
    }).onDelete("restrict"),
  ],
);

export const jobStandards = sqliteTable(
  "job_standards",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
    payBasis: text("pay_basis").$type<"salary" | "hourly" | "either">(),
    minimumPayCents: integer("minimum_pay_cents"),
    targetPayCents: integer("target_pay_cents"),
    currency: text("currency").notNull().default("USD"),
    workArrangementsJson: text("work_arrangements_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    commuteMiles: integer("commute_miles"),
    locationsJson: text("locations_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    travelMaximumPercent: integer("travel_maximum_percent"),
    scheduleRequirements: text("schedule_requirements"),
    benefitsJson: text("benefits_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    growthPrioritiesJson: text("growth_priorities_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    exclusionsJson: text("exclusions_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    uniqueIndex("job_standards_user_id_unique").on(table.userId, table.id),
    uniqueIndex("job_standards_user_version_unique").on(table.userId, table.version),
    uniqueIndex("job_standards_one_current_per_user_unique")
      .on(table.userId)
      .where(sql`${table.isCurrent} = 1`),
    index("job_standards_user_current_idx").on(table.userId, table.isCurrent),
  ],
);

export const careerPaths = sqliteTable(
  "career_paths",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    primaryLane: text("primary_lane").notNull(),
    secondaryLanesJson: text("secondary_lanes_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    fitScore: integer("fit_score"),
    opportunityScore: integer("opportunity_score"),
    rationaleJson: text("rationale_json", { mode: "json" }).$type<JsonObject>(),
    gapsJson: text("gaps_json", { mode: "json" }).$type<StringList>(),
    state: text("state").$type<CareerPathState>().notNull().default("suggested"),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("career_paths_user_id_unique").on(table.userId, table.id),
    uniqueIndex("career_paths_one_primary_per_user_unique")
      .on(table.userId)
      .where(sql`${table.isPrimary} = 1`),
    check(
      "career_paths_primary_must_be_active_check",
      sql`${table.isPrimary} = 0 OR ${table.state} = 'active'`,
    ),
    index("career_paths_user_state_idx").on(table.userId, table.state),
  ],
);

export const resumes = sqliteTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").$type<"master" | "path" | "job">().notNull(),
    version: integer("version").notNull(),
    contentJson: text("content_json", { mode: "json" }).$type<JsonObject>().notNull(),
    templateKey: text("template_key").notNull(),
    reviewState: text("review_state")
      .$type<"draft" | "approved" | "superseded">()
      .notNull()
      .default("draft"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("resumes_user_id_unique").on(table.userId, table.id),
    uniqueIndex("resumes_user_name_version_unique").on(table.userId, table.name, table.version),
  ],
);

export const jobSources = sqliteTable(
  "job_sources",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    kind: text("kind")
      .$type<"employer_ats" | "employer_page" | "government" | "user_added" | "partner">()
      .notNull(),
    rightsState: text("rights_state")
      .$type<"approved" | "restricted" | "unknown" | "rejected">()
      .notNull()
      .default("unknown"),
    termsVersion: text("terms_version"),
    createdAt: timestampMs("created_at"),
  },
  (table) => [uniqueIndex("job_sources_name_kind_unique").on(table.name, table.kind)],
);

export const jobPostings = sqliteTable(
  "job_postings",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => jobSources.id, { onDelete: "restrict" }),
    externalId: text("external_id").notNull(),
    canonicalUrl: text("canonical_url").notNull(),
    employer: text("employer").notNull(),
    title: text("title").notNull(),
    mandate: text("mandate"),
    locationsJson: text("locations_json", { mode: "json" }).$type<StringList>(),
    compensationJson: text("compensation_json", { mode: "json" }).$type<JsonObject>(),
    descriptionChecksum: text("description_checksum").notNull(),
    firstSeenAt: timestampMs("first_seen_at"),
    lastCheckedAt: timestampMs("last_checked_at"),
    postedAt: integer("posted_at", { mode: "timestamp_ms" }),
    removedAt: integer("removed_at", { mode: "timestamp_ms" }),
    duplicateGroupKey: text("duplicate_group_key"),
    freshnessState: text("freshness_state")
      .$type<"fresh" | "stale_risk" | "stale" | "removed" | "unknown">()
      .notNull()
      .default("unknown"),
    rawObjectKey: text("raw_object_key"),
  },
  (table) => [
    uniqueIndex("job_postings_source_external_unique").on(table.sourceId, table.externalId),
    index("job_postings_employer_title_idx").on(table.employer, table.title),
    index("job_postings_freshness_idx").on(table.freshnessState, table.lastCheckedAt),
  ],
);

export const userJobLinks = sqliteTable(
  "user_job_links",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobPostingId: text("job_posting_id")
      .notNull()
      .references(() => jobPostings.id, { onDelete: "cascade" }),
    source: text("source")
      .$type<"user_added" | "operator" | "monitoring" | "import">()
      .notNull(),
    state: text("state")
      .$type<"active" | "archived">()
      .notNull()
      .default("active"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("user_job_links_user_job_unique").on(
      table.userId,
      table.jobPostingId,
    ),
    index("user_job_links_user_state_idx").on(table.userId, table.state),
  ],
);

export const jobPostingVersions = sqliteTable(
  "job_posting_versions",
  {
    id: text("id").primaryKey(),
    jobPostingId: text("job_posting_id")
      .notNull()
      .references(() => jobPostings.id, { onDelete: "cascade" }),
    sourceCheckedAt: integer("source_checked_at", { mode: "timestamp_ms" }).notNull(),
    sourceUrl: text("source_url").notNull(),
    descriptionChecksum: text("description_checksum").notNull(),
    sourceFactsJson: text("source_facts_json", { mode: "json" }).$type<JsonObject>().notNull(),
    sourceConflictsJson: text("source_conflicts_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    captureState: text("capture_state")
      .$type<"verified" | "partial" | "conflict" | "unavailable">()
      .notNull(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    uniqueIndex("job_posting_versions_job_checksum_unique").on(
      table.jobPostingId,
      table.descriptionChecksum,
    ),
    index("job_posting_versions_job_checked_idx").on(
      table.jobPostingId,
      table.sourceCheckedAt,
    ),
  ],
);

export const resumeAssignments = sqliteTable(
  "resume_assignments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resumeId: text("resume_id")
      .notNull(),
    scope: text("scope")
      .$type<"default" | "path" | "job">()
      .notNull()
      .default("default"),
    careerPathId: text("career_path_id"),
    jobPostingId: text("job_posting_id").references(() => jobPostings.id, {
      onDelete: "cascade",
    }),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    check(
      "resume_assignments_exact_scope_check",
      sql`(${table.scope} = 'default' AND ${table.careerPathId} IS NULL AND ${table.jobPostingId} IS NULL) OR (${table.scope} = 'path' AND ${table.careerPathId} IS NOT NULL AND ${table.jobPostingId} IS NULL) OR (${table.scope} = 'job' AND ${table.careerPathId} IS NULL AND ${table.jobPostingId} IS NOT NULL)`,
    ),
    uniqueIndex("resume_assignments_one_default_unique")
      .on(table.userId)
      .where(sql`${table.scope} = 'default'`),
    uniqueIndex("resume_assignments_one_path_unique")
      .on(table.userId, table.careerPathId)
      .where(sql`${table.scope} = 'path'`),
    uniqueIndex("resume_assignments_one_job_unique")
      .on(table.userId, table.jobPostingId)
      .where(sql`${table.scope} = 'job'`),
    foreignKey({
      columns: [table.userId, table.resumeId],
      foreignColumns: [resumes.userId, resumes.id],
      name: "resume_assignments_resume_tenant_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId, table.careerPathId],
      foreignColumns: [careerPaths.userId, careerPaths.id],
      name: "resume_assignments_path_tenant_fk",
    }).onDelete("cascade"),
    index("resume_assignments_scope_idx").on(
      table.userId,
      table.scope,
      table.careerPathId,
      table.jobPostingId,
    ),
  ],
);

export const jobAnalyses = sqliteTable(
  "job_analyses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobPostingId: text("job_posting_id")
      .notNull()
      .references(() => jobPostings.id, { onDelete: "cascade" }),
    careerPathId: text("career_path_id"),
    jobStandardId: text("job_standard_id").notNull(),
    policyVersion: text("policy_version").notNull(),
    evidenceVersion: text("evidence_version").notNull(),
    integrityGatesJson: text("integrity_gates_json", { mode: "json" }).$type<JsonObject>().notNull(),
    moveValueScore: integer("move_value_score"),
    pursuitReadinessScore: integer("pursuit_readiness_score"),
    fitJson: text("fit_json", { mode: "json" }).$type<JsonObject>().notNull(),
    unknownsJson: text("unknowns_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    recommendation: text("recommendation")
      .$type<"pursue" | "watch" | "pass" | "needs_evidence">()
      .notNull(),
    validationState: text("validation_state")
      .$type<"pending" | "trusted" | "blocked" | "invalidated">()
      .notNull()
      .default("pending"),
    createdAt: timestampMs("created_at"),
    invalidatedAt: integer("invalidated_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("job_analyses_user_id_unique").on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.careerPathId],
      foreignColumns: [careerPaths.userId, careerPaths.id],
      name: "job_analyses_career_path_tenant_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.userId, table.jobStandardId],
      foreignColumns: [jobStandards.userId, jobStandards.id],
      name: "job_analyses_job_standard_tenant_fk",
    }).onDelete("restrict"),
    index("job_analyses_user_job_state_idx").on(
      table.userId,
      table.jobPostingId,
      table.validationState,
    ),
  ],
);

export const pursuits = sqliteTable(
  "pursuits",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobPostingId: text("job_posting_id")
      .notNull()
      .references(() => jobPostings.id, { onDelete: "restrict" }),
    currentAnalysisId: text("current_analysis_id"),
    state: text("state").$type<PursuitState>().notNull().default("saved"),
    revision: integer("revision").notNull().default(1),
    nextAction: text("next_action"),
    externalApprovalState: text("external_approval_state")
      .$type<"not_requested" | "requested" | "approved" | "revoked" | "completed">()
      .notNull()
      .default("not_requested"),
    appliedAt: integer("applied_at", { mode: "timestamp_ms" }),
    closedReason: text("closed_reason"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("pursuits_user_id_unique").on(table.userId, table.id),
    uniqueIndex("pursuits_user_job_unique").on(table.userId, table.jobPostingId),
    foreignKey({
      columns: [table.userId, table.currentAnalysisId],
      foreignColumns: [jobAnalyses.userId, jobAnalyses.id],
      name: "pursuits_current_analysis_tenant_fk",
    }).onDelete("restrict"),
    index("pursuits_user_state_idx").on(table.userId, table.state),
  ],
);

export const pursuitEvents = sqliteTable(
  "pursuit_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pursuitId: text("pursuit_id").notNull(),
    eventType: text("event_type").$type<PursuitEventType>().notNull(),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(),
    note: text("note"),
    metadataJson: text("metadata_json", { mode: "json" })
      .$type<JsonObject>()
      .notNull()
      .default(sql`'{}'`),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    uniqueIndex("pursuit_events_user_id_unique").on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.pursuitId],
      foreignColumns: [pursuits.userId, pursuits.id],
      name: "pursuit_events_pursuit_tenant_fk",
    }).onDelete("cascade"),
    index("pursuit_events_pursuit_occurred_idx").on(
      table.userId,
      table.pursuitId,
      table.occurredAt,
    ),
  ],
);

export const generatedAssets = sqliteTable(
  "generated_assets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pursuitId: text("pursuit_id"),
    type: text("type")
      .$type<"resume" | "cover_letter" | "research" | "application_answers" | "interview" | "ninety_day_plan">()
      .notNull(),
    sourceVersionsJson: text("source_versions_json", { mode: "json" }).$type<JsonObject>().notNull(),
    generationPolicyVersion: text("generation_policy_version").notNull(),
    version: integer("version").notNull().default(1),
    contentJson: text("content_json", { mode: "json" }).$type<JsonObject>(),
    contentSha256: text("content_sha256"),
    filename: text("filename"),
    pageCount: integer("page_count"),
    supersedesAssetId: text("supersedes_asset_id"),
    invalidatedAt: integer("invalidated_at", { mode: "timestamp_ms" }),
    reviewState: text("review_state")
      .$type<"draft" | "claim_safe" | "approved" | "superseded">()
      .notNull()
      .default("draft"),
    objectKey: text("object_key"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("generated_assets_user_id_unique").on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.pursuitId],
      foreignColumns: [pursuits.userId, pursuits.id],
      name: "generated_assets_pursuit_tenant_fk",
    }).onDelete("cascade"),
    uniqueIndex("generated_assets_pursuit_type_version_unique").on(
      table.pursuitId,
      table.type,
      table.version,
    ),
    index("generated_assets_pursuit_type_idx").on(table.pursuitId, table.type),
  ],
);

export const pursuitPackages = sqliteTable(
  "pursuit_packages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pursuitId: text("pursuit_id").notNull(),
    version: integer("version").notNull(),
    destinationUrl: text("destination_url").notNull(),
    jobPostingVersionId: text("job_posting_version_id")
      .notNull()
      .references(() => jobPostingVersions.id, { onDelete: "restrict" }),
    answersJson: text("answers_json", { mode: "json" }).$type<JsonObject>().notNull(),
    assetManifestJson: text("asset_manifest_json", { mode: "json" }).$type<JsonObject>().notNull(),
    blockersJson: text("blockers_json", { mode: "json" })
      .$type<StringList>()
      .notNull()
      .default(sql`'[]'`),
    payloadSha256: text("payload_sha256").notNull(),
    readinessState: text("readiness_state")
      .$type<"blocked" | "ready_for_review" | "superseded">()
      .notNull(),
    supersededAt: integer("superseded_at", { mode: "timestamp_ms" }),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    uniqueIndex("pursuit_packages_user_id_unique").on(table.userId, table.id),
    uniqueIndex("pursuit_packages_pursuit_version_unique").on(
      table.pursuitId,
      table.version,
    ),
    foreignKey({
      columns: [table.userId, table.pursuitId],
      foreignColumns: [pursuits.userId, pursuits.id],
      name: "pursuit_packages_pursuit_tenant_fk",
    }).onDelete("cascade"),
    index("pursuit_packages_pursuit_state_idx").on(
      table.pursuitId,
      table.readinessState,
    ),
  ],
);

export const externalActionApprovals = sqliteTable(
  "external_action_approvals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pursuitPackageId: text("pursuit_package_id").notNull(),
    action: text("action").$type<"approve_application_package" | "submit_application">().notNull(),
    payloadSha256: text("payload_sha256").notNull(),
    approvedPursuitRevision: integer("approved_pursuit_revision"),
    attestationVersion: text("attestation_version"),
    attestationSha256: text("attestation_sha256"),
    state: text("state")
      .$type<"requested" | "approved" | "revoked" | "completed">()
      .notNull()
      .default("requested"),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    uniqueIndex("external_action_approvals_user_id_unique").on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.pursuitPackageId],
      foreignColumns: [pursuitPackages.userId, pursuitPackages.id],
      name: "external_action_approvals_package_tenant_fk",
    }).onDelete("restrict"),
    index("external_action_approvals_package_state_idx").on(
      table.pursuitPackageId,
      table.state,
    ),
  ],
);

export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorSubject: text("actor_subject").notNull(),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadataJson: text("metadata_json", { mode: "json" }).$type<JsonObject>().notNull(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    index("audit_events_user_created_idx").on(table.userId, table.createdAt),
    index("audit_events_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const offerVersions = sqliteTable(
  "offer_versions",
  {
    id: text("id").primaryKey(),
    stream: text("stream").$type<RevenueStream>().notNull(),
    offerKey: text("offer_key").notNull(),
    version: integer("version").notNull(),
    label: text("label").notNull(),
    currency: text("currency").notNull().default("USD"),
    priceMinor: integer("price_minor").notNull(),
    billingType: text("billing_type").$type<OfferBillingType>().notNull(),
    termDays: integer("term_days"),
    renewalBehavior: text("renewal_behavior")
      .$type<"none" | "explicit_opt_in" | "automatic">()
      .notNull()
      .default("none"),
    entitlementsJson: text("entitlements_json", { mode: "json" })
      .$type<JsonObject>()
      .notNull()
      .default(sql`'{}'`),
    refundPolicyVersion: text("refund_policy_version"),
    variableCostCapBps: integer("variable_cost_cap_bps"),
    supportCapSeconds: integer("support_cap_seconds"),
    targetCm1Bps: integer("target_cm1_bps"),
    targetCm2Bps: integer("target_cm2_bps"),
    approvalState: text("approval_state")
      .$type<
        | "hypothesis"
        | "board_approved_private_test"
        | "active_private_test"
        | "paused"
        | "retired"
      >()
      .notNull()
      .default("hypothesis"),
    boardDecisionRef: text("board_decision_ref"),
    effectiveAt: integer("effective_at", { mode: "timestamp_ms" }),
    retiredAt: integer("retired_at", { mode: "timestamp_ms" }),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("offer_versions_key_version_unique").on(table.offerKey, table.version),
    index("offer_versions_stream_state_idx").on(table.stream, table.approvalState),
    check(
      "offer_versions_stream_check",
      sql`${table.stream} IN ('software', 'affiliate', 'human_service')`,
    ),
    check(
      "offer_versions_billing_type_check",
      sql`${table.billingType} IN ('free', 'monthly', 'prepaid_term', 'one_time', 'commission')`,
    ),
    check(
      "offer_versions_approval_state_check",
      sql`${table.approvalState} IN ('hypothesis', 'board_approved_private_test', 'active_private_test', 'paused', 'retired')`,
    ),
    check(
      "offer_versions_board_authority_check",
      sql`(${table.approvalState} NOT IN ('board_approved_private_test', 'active_private_test') OR (${table.boardDecisionRef} IS NOT NULL AND length(trim(${table.boardDecisionRef})) > 0)) AND (${table.approvalState} <> 'active_private_test' OR ${table.effectiveAt} IS NOT NULL)`,
    ),
    check("offer_versions_price_nonnegative_check", sql`${table.priceMinor} >= 0`),
    check(
      "offer_versions_term_positive_check",
      sql`${table.termDays} IS NULL OR ${table.termDays} > 0`,
    ),
    check(
      "offer_versions_variable_cap_check",
      sql`${table.variableCostCapBps} IS NULL OR (${table.variableCostCapBps} >= 0 AND ${table.variableCostCapBps} <= 10000)`,
    ),
    check(
      "offer_versions_support_cap_check",
      sql`${table.supportCapSeconds} IS NULL OR ${table.supportCapSeconds} >= 0`,
    ),
    check(
      "offer_versions_cm_targets_check",
      sql`(${table.targetCm1Bps} IS NULL OR (${table.targetCm1Bps} >= 0 AND ${table.targetCm1Bps} <= 10000)) AND (${table.targetCm2Bps} IS NULL OR (${table.targetCm2Bps} >= 0 AND ${table.targetCm2Bps} <= 10000))`,
    ),
  ],
);

export const cohortMemberships = sqliteTable(
  "cohort_memberships",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    offerVersionId: text("offer_version_id")
      .notNull()
      .references(() => offerVersions.id, { onDelete: "restrict" }),
    priceTestKey: text("price_test_key"),
    acquisitionSource: text("acquisition_source").notNull(),
    campaignKey: text("campaign_key"),
    enteredAt: integer("entered_at", { mode: "timestamp_ms" }).notNull(),
    convertedAt: integer("converted_at", { mode: "timestamp_ms" }),
    convertedOfferVersionId: text("converted_offer_version_id").references(
      () => offerVersions.id,
      { onDelete: "restrict" },
    ),
    maturesAt: integer("matures_at", { mode: "timestamp_ms" }).notNull(),
    observationWindowDays: integer("observation_window_days").notNull(),
    eligibilityState: text("eligibility_state")
      .$type<"eligible" | "excluded">()
      .notNull()
      .default("eligible"),
    exclusionReason: text("exclusion_reason"),
    terminalState: text("terminal_state")
      .$type<"open" | "converted" | "matured_unconverted" | "cancelled" | "refunded">()
      .notNull()
      .default("open"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("cohort_memberships_user_id_unique").on(table.userId, table.id),
    index("cohort_memberships_offer_maturity_idx").on(
      table.offerVersionId,
      table.maturesAt,
      table.terminalState,
    ),
    check(
      "cohort_memberships_window_positive_check",
      sql`${table.observationWindowDays} > 0`,
    ),
    check(
      "cohort_memberships_exclusion_reason_check",
      sql`(${table.eligibilityState} = 'eligible' AND ${table.exclusionReason} IS NULL) OR (${table.eligibilityState} = 'excluded' AND ${table.exclusionReason} IS NOT NULL)`,
    ),
    check(
      "cohort_memberships_state_check",
      sql`${table.eligibilityState} IN ('eligible', 'excluded') AND ${table.terminalState} IN ('open', 'converted', 'matured_unconverted', 'cancelled', 'refunded')`,
    ),
  ],
);

export const ordersCharges = sqliteTable(
  "orders_charges",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    offerVersionId: text("offer_version_id")
      .notNull()
      .references(() => offerVersions.id, { onDelete: "restrict" }),
    cohortMembershipId: text("cohort_membership_id"),
    acquisitionSource: text("acquisition_source").notNull(),
    currency: text("currency").notNull().default("USD"),
    grossAmountMinor: integer("gross_amount_minor").notNull(),
    discountAmountMinor: integer("discount_amount_minor").notNull().default(0),
    taxAmountMinor: integer("tax_amount_minor").notNull().default(0),
    cashCollectedMinor: integer("cash_collected_minor").notNull().default(0),
    processorFeeMicros: integer("processor_fee_micros").notNull().default(0),
    refundAmountMinor: integer("refund_amount_minor").notNull().default(0),
    creditAmountMinor: integer("credit_amount_minor").notNull().default(0),
    chargebackAmountMinor: integer("chargeback_amount_minor").notNull().default(0),
    processor: text("processor"),
    providerReference: text("provider_reference"),
    serviceStartsAt: integer("service_starts_at", { mode: "timestamp_ms" }).notNull(),
    serviceEndsAt: integer("service_ends_at", { mode: "timestamp_ms" }).notNull(),
    renewalState: text("renewal_state")
      .$type<"none" | "opted_in" | "automatic" | "cancelled">()
      .notNull()
      .default("none"),
    settlementState: text("settlement_state")
      .$type<
        | "pending"
        | "authorized"
        | "paid"
        | "partially_refunded"
        | "refunded"
        | "disputed"
        | "failed"
      >()
      .notNull()
      .default("pending"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("orders_charges_user_id_unique").on(table.userId, table.id),
    uniqueIndex("orders_charges_provider_reference_unique")
      .on(table.processor, table.providerReference)
      .where(sql`${table.providerReference} IS NOT NULL`),
    foreignKey({
      columns: [table.userId, table.cohortMembershipId],
      foreignColumns: [cohortMemberships.userId, cohortMemberships.id],
      name: "orders_charges_cohort_tenant_fk",
    }).onDelete("restrict"),
    index("orders_charges_offer_settlement_idx").on(
      table.offerVersionId,
      table.settlementState,
      table.createdAt,
    ),
    check(
      "orders_charges_nonnegative_amounts_check",
      sql`${table.grossAmountMinor} >= 0 AND ${table.discountAmountMinor} >= 0 AND ${table.taxAmountMinor} >= 0 AND ${table.cashCollectedMinor} >= 0 AND ${table.processorFeeMicros} >= 0 AND ${table.refundAmountMinor} >= 0 AND ${table.creditAmountMinor} >= 0 AND ${table.chargebackAmountMinor} >= 0`,
    ),
    check(
      "orders_charges_service_window_check",
      sql`${table.serviceEndsAt} > ${table.serviceStartsAt}`,
    ),
    check(
      "orders_charges_amount_reconciliation_check",
      sql`${table.discountAmountMinor} <= ${table.grossAmountMinor} AND ${table.cashCollectedMinor} <= (${table.grossAmountMinor} - ${table.discountAmountMinor} + ${table.taxAmountMinor}) AND (${table.refundAmountMinor} + ${table.creditAmountMinor} + ${table.chargebackAmountMinor}) <= ${table.cashCollectedMinor}`,
    ),
    check(
      "orders_charges_state_check",
      sql`${table.renewalState} IN ('none', 'opted_in', 'automatic', 'cancelled') AND ${table.settlementState} IN ('pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'disputed', 'failed')`,
    ),
  ],
);

export const revenueSchedule = sqliteTable(
  "revenue_schedule",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => ordersCharges.id, { onDelete: "restrict" }),
    stream: text("stream").$type<RevenueStream>().notNull(),
    recognitionPeriod: text("recognition_period").notNull(),
    openingDeferredMinor: integer("opening_deferred_minor").notNull().default(0),
    cashCollectedMinor: integer("cash_collected_minor").notNull().default(0),
    recognizedRevenueMinor: integer("recognized_revenue_minor").notNull().default(0),
    refundReversalMinor: integer("refund_reversal_minor").notNull().default(0),
    closingDeferredMinor: integer("closing_deferred_minor").notNull().default(0),
    closeState: text("close_state")
      .$type<"open" | "closed" | "reconciled">()
      .notNull()
      .default("open"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("revenue_schedule_order_period_unique").on(
      table.orderId,
      table.recognitionPeriod,
    ),
    index("revenue_schedule_period_stream_idx").on(
      table.recognitionPeriod,
      table.stream,
      table.closeState,
    ),
    check(
      "revenue_schedule_nonnegative_check",
      sql`${table.openingDeferredMinor} >= 0 AND ${table.cashCollectedMinor} >= 0 AND ${table.recognizedRevenueMinor} >= 0 AND ${table.refundReversalMinor} >= 0 AND ${table.closingDeferredMinor} >= 0`,
    ),
    check(
      "revenue_schedule_reconciliation_check",
      sql`${table.openingDeferredMinor} + ${table.cashCollectedMinor} - ${table.recognizedRevenueMinor} - ${table.refundReversalMinor} = ${table.closingDeferredMinor}`,
    ),
    check(
      "revenue_schedule_state_check",
      sql`${table.stream} IN ('software', 'affiliate', 'human_service') AND ${table.closeState} IN ('open', 'closed', 'reconciled')`,
    ),
  ],
);

export const costAllocationGroups = sqliteTable(
  "cost_allocation_groups",
  {
    id: text("id").primaryKey(),
    sharedObjectRef: text("shared_object_ref").notNull(),
    allocationVersion: text("allocation_version").notNull(),
    allocationMethod: text("allocation_method").notNull(),
    stream: text("stream").$type<RevenueStream>().notNull(),
    category: text("category").$type<CostCategory>().notNull(),
    sourceTotalAmountMicros: integer("source_total_amount_micros").notNull(),
    state: text("state")
      .$type<"draft" | "reconciled" | "superseded">()
      .notNull()
      .default("draft"),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
    supersedesGroupId: text("supersedes_group_id"),
    reconciledAt: integer("reconciled_at", { mode: "timestamp_ms" }),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    uniqueIndex("cost_allocation_groups_source_version_unique").on(
      table.sharedObjectRef,
      table.allocationVersion,
    ),
    uniqueIndex("cost_allocation_groups_one_current_per_source_unique")
      .on(table.sharedObjectRef)
      .where(sql`${table.isCurrent} = 1`),
    index("cost_allocation_groups_state_idx").on(
      table.state,
      table.isCurrent,
      table.updatedAt,
    ),
    foreignKey({
      columns: [table.supersedesGroupId],
      foreignColumns: [table.id],
      name: "cost_allocation_groups_supersedes_fk",
    }).onDelete("restrict"),
    check(
      "cost_allocation_groups_source_total_check",
      sql`${table.sourceTotalAmountMicros} >= 0`,
    ),
    check(
      "cost_allocation_groups_state_check",
      sql`(${table.state} = 'draft' AND ${table.isCurrent} = 0 AND ${table.reconciledAt} IS NULL) OR (${table.state} = 'reconciled' AND ${table.isCurrent} = 1 AND ${table.reconciledAt} IS NOT NULL) OR (${table.state} = 'superseded' AND ${table.isCurrent} = 0 AND ${table.reconciledAt} IS NOT NULL)`,
    ),
    check(
      "cost_allocation_groups_stream_category_check",
      sql`${table.stream} IN ('software', 'affiliate', 'human_service') AND ${table.category} IN ('source_data', 'rendering', 'model_stage_a', 'model_stage_b', 'adjudication', 'retry_validation', 'storage', 'egress', 'queue', 'email', 'push', 'sms', 'processor', 'dispute', 'support', 'correction_rework', 'trust_recovery', 'human_fulfillment', 'acquisition', 'other')`,
    ),
  ],
);

export const costEvents = sqliteTable(
  "cost_events",
  {
    id: text("id").primaryKey(),
    stream: text("stream").$type<RevenueStream>().notNull(),
    category: text("category").$type<CostCategory>().notNull(),
    unitName: text("unit_name").notNull(),
    unitsMicros: integer("units_micros").notNull(),
    rateMicrosPerUnit: integer("rate_micros_per_unit").notNull(),
    amountMicros: integer("amount_micros").notNull(),
    estimateState: text("estimate_state")
      .$type<"estimated" | "actual" | "reconciled">()
      .notNull(),
    cashState: text("cash_state").$type<"cash" | "noncash">().notNull(),
    vendor: text("vendor"),
    rateCardVersion: text("rate_card_version").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "restrict" }),
    orderId: text("order_id"),
    workloadRef: text("workload_ref"),
    sharedObjectRef: text("shared_object_ref"),
    allocationMethod: text("allocation_method"),
    allocationVersion: text("allocation_version"),
    allocationGroupId: text("allocation_group_id").references(
      () => costAllocationGroups.id,
      { onDelete: "restrict" },
    ),
    allocationShareBps: integer("allocation_share_bps"),
    sharedTotalAmountMicros: integer("shared_total_amount_micros"),
    allocationRemainderMicros: integer("allocation_remainder_micros"),
    allocatedOfferVersionId: text("allocated_offer_version_id").references(
      () => offerVersions.id,
      { onDelete: "restrict" },
    ),
    cohortMembershipId: text("cohort_membership_id"),
    incurredAt: integer("incurred_at", { mode: "timestamp_ms" }).notNull(),
    metadataJson: text("metadata_json", { mode: "json" }).$type<JsonObject>(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    uniqueIndex("cost_events_user_id_unique").on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.orderId],
      foreignColumns: [ordersCharges.userId, ordersCharges.id],
      name: "cost_events_order_tenant_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.userId, table.cohortMembershipId],
      foreignColumns: [cohortMemberships.userId, cohortMemberships.id],
      name: "cost_events_cohort_tenant_fk",
    }).onDelete("restrict"),
    index("cost_events_offer_category_incurred_idx").on(
      table.allocatedOfferVersionId,
      table.category,
      table.incurredAt,
    ),
    index("cost_events_allocation_group_idx").on(table.allocationGroupId),
    check(
      "cost_events_nonnegative_check",
      sql`${table.unitsMicros} >= 0 AND ${table.rateMicrosPerUnit} >= 0 AND ${table.amountMicros} >= 0`,
    ),
    check(
      "cost_events_amount_reconciliation_check",
      sql`${table.amountMicros} = CAST((${table.unitsMicros} * ${table.rateMicrosPerUnit}) / 1000000 AS INTEGER)`,
    ),
    check(
      "cost_events_state_check",
      sql`${table.stream} IN ('software', 'affiliate', 'human_service') AND ${table.category} IN ('source_data', 'rendering', 'model_stage_a', 'model_stage_b', 'adjudication', 'retry_validation', 'storage', 'egress', 'queue', 'email', 'push', 'sms', 'processor', 'dispute', 'support', 'correction_rework', 'trust_recovery', 'human_fulfillment', 'acquisition', 'other') AND ${table.estimateState} IN ('estimated', 'actual', 'reconciled') AND ${table.cashState} IN ('cash', 'noncash')`,
    ),
    check(
      "cost_events_shared_allocation_check",
      sql`(${table.sharedObjectRef} IS NULL AND ${table.allocationMethod} IS NULL AND ${table.allocationVersion} IS NULL AND ${table.allocationGroupId} IS NULL AND ${table.allocationShareBps} IS NULL AND ${table.sharedTotalAmountMicros} IS NULL AND ${table.allocationRemainderMicros} IS NULL) OR (${table.sharedObjectRef} IS NOT NULL AND ${table.allocationMethod} IS NOT NULL AND ${table.allocationVersion} IS NOT NULL AND ${table.allocationGroupId} IS NOT NULL AND ${table.allocationShareBps} > 0 AND ${table.allocationShareBps} <= 10000 AND ${table.sharedTotalAmountMicros} >= 0 AND ${table.allocationRemainderMicros} IN (0, 1) AND ${table.amountMicros} = CAST((${table.sharedTotalAmountMicros} * ${table.allocationShareBps}) / 10000 AS INTEGER) + ${table.allocationRemainderMicros})`,
    ),
  ],
);

export const affiliateEvents = sqliteTable(
  "affiliate_events",
  {
    id: text("id").primaryKey(),
    partnerKey: text("partner_key").notNull(),
    programVersion: text("program_version").notNull(),
    referralReference: text("referral_reference"),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    eventType: text("event_type")
      .$type<
        | "click"
        | "qualified_start"
        | "paid"
        | "retained"
        | "refund"
        | "clawback"
        | "payout"
        | "complaint"
      >()
      .notNull(),
    eventAt: integer("event_at", { mode: "timestamp_ms" }).notNull(),
    currency: text("currency").notNull().default("USD"),
    commissionBasisMinor: integer("commission_basis_minor").notNull().default(0),
    commissionRateBps: integer("commission_rate_bps"),
    grossEarnedMinor: integer("gross_earned_minor").notNull().default(0),
    refundClawbackMinor: integer("refund_clawback_minor").notNull().default(0),
    netPayableMinor: integer("net_payable_minor").notNull().default(0),
    payoutState: text("payout_state")
      .$type<"pending" | "earned" | "payable" | "paid" | "reversed">()
      .notNull()
      .default("pending"),
    payoutAt: integer("payout_at", { mode: "timestamp_ms" }),
    disclosureVersion: text("disclosure_version").notNull(),
    complaintState: text("complaint_state")
      .$type<"none" | "open" | "resolved">()
      .notNull()
      .default("none"),
    cannibalizationState: text("cannibalization_state")
      .$type<"unknown" | "no_signal" | "potential" | "confirmed">()
      .notNull()
      .default("unknown"),
    metadataJson: text("metadata_json", { mode: "json" }).$type<JsonObject>(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    index("affiliate_events_partner_event_idx").on(
      table.partnerKey,
      table.eventType,
      table.eventAt,
    ),
    check(
      "affiliate_events_nonnegative_check",
      sql`${table.commissionBasisMinor} >= 0 AND ${table.grossEarnedMinor} >= 0 AND ${table.refundClawbackMinor} >= 0 AND ${table.netPayableMinor} >= 0 AND (${table.commissionRateBps} IS NULL OR (${table.commissionRateBps} >= 0 AND ${table.commissionRateBps} <= 10000))`,
    ),
  ],
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    offerVersionId: text("offer_version_id")
      .notNull()
      .references(() => offerVersions.id, { onDelete: "restrict" }),
    planKey: text("plan_key").notNull(),
    state: text("state")
      .$type<"trial" | "active" | "paused" | "cancelled" | "expired">()
      .notNull(),
    termStartsAt: integer("term_starts_at", { mode: "timestamp_ms" }),
    termEndsAt: integer("term_ends_at", { mode: "timestamp_ms" }),
    entitlementsJson: text("entitlements_json", { mode: "json" }).$type<JsonObject>().notNull(),
    billingProvider: text("billing_provider"),
    billingReference: text("billing_reference"),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (table) => [
    index("subscriptions_user_state_idx").on(table.userId, table.state),
    index("subscriptions_offer_state_idx").on(table.offerVersionId, table.state),
  ],
);

export const usageEvents = sqliteTable(
  "usage_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    provider: text("provider"),
    model: text("model"),
    policyVersion: text("policy_version"),
    latencyMs: integer("latency_ms"),
    variableCostMicros: integer("variable_cost_micros"),
    resultState: text("result_state").notNull(),
    correctionState: text("correction_state"),
    cohort: text("cohort"),
    costEventId: text("cost_event_id"),
    workloadRef: text("workload_ref"),
    metadataJson: text("metadata_json", { mode: "json" }).$type<JsonObject>(),
    createdAt: timestampMs("created_at"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId, table.costEventId],
      foreignColumns: [costEvents.userId, costEvents.id],
      name: "usage_events_cost_event_tenant_fk",
    }).onDelete("set null"),
    check(
      "usage_events_cost_event_user_check",
      sql`${table.costEventId} IS NULL OR ${table.userId} IS NOT NULL`,
    ),
    index("usage_events_action_created_idx").on(table.action, table.createdAt),
    index("usage_events_user_created_idx").on(table.userId, table.createdAt),
  ],
);
