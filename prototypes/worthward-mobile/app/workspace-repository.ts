import { env } from "cloudflare:workers";
import {
  assessDeterministically,
  CURRENT_DETERMINISTIC_ASSESSMENT_POLICY,
} from "./deterministic-assessment";
import {
  applicationQuestionFields,
  invalidApplicationAnswers,
  isQuestionSetChecksum,
  requiredApplicationGaps,
  sourceAcceptsAsset,
  sourceRequiresAsset,
} from "./application-package";
import type {
  AssetRecord,
  CareerPathRecord,
  FounderActor,
  FounderBootstrapPayload,
  JobStandardRecord,
  JsonRecord,
  OpportunityRecord,
  PursuitEventType,
  WorkspaceRecord,
} from "./production-types";
import type {
  OnboardingState,
  OnboardingStep,
  OnboardingStepPayload,
} from "./onboarding-types";

type RuntimeEnv = {
  DB?: D1Database;
  WAY_AHEAD_OWNER_EMAIL?: string;
};

export type UserRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: "owner" | "member";
  lifecycle_state: string;
};

function database(): D1Database {
  const db = (env as unknown as RuntimeEnv).DB;
  if (!db) throw new Error("Way Ahead storage is unavailable.");
  return db;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T | null) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function valueFromFact(value: unknown): string | null {
  const parsed = parseJson<JsonRecord>(value, {});
  return typeof parsed.value === "string" ? parsed.value : null;
}

function toBool(value: unknown): boolean {
  return value === true || value === 1;
}

function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value ?? null;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function positiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function isSha256Hex(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function jobPostingVersionId(
  postingId: string,
  descriptionChecksum: string,
): Promise<string> {
  const identityChecksum = await sha256Hex(
    canonicalJson({ postingId, descriptionChecksum }),
  );
  return `jobver_${identityChecksum.slice(0, 24)}`;
}

export async function deletedIdentityWorkloadRef(
  actor: FounderActor,
): Promise<string> {
  const email = actor.email.trim().toLowerCase();
  return `deleted_identity:${await sha256Hex(`chatgpt:${email}`)}`;
}

export async function deletedAccountNeedsRestart(
  actor: FounderActor,
): Promise<boolean> {
  const email = actor.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return false;
  const db = database();
  const receipt = await db
    .prepare(
      "SELECT id FROM usage_events WHERE user_id IS NULL AND action = 'account_deleted' AND workload_ref = ? LIMIT 1",
    )
    .bind(await deletedIdentityWorkloadRef(actor))
    .first<{ id: string }>();
  return Boolean(receipt);
}

function configuredOwnerEmail(): string | null {
  const value = (env as unknown as RuntimeEnv).WAY_AHEAD_OWNER_EMAIL?.trim().toLowerCase();
  return value && value.includes("@") ? value : null;
}

export async function ensureUser(actor: FounderActor): Promise<UserRow> {
  const db = database();
  const email = actor.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("The signed-in account has no usable email address.");
  }
  const authSubject = `chatgpt:${email}`;
  const role: UserRow["role"] = configuredOwnerEmail() === email ? "owner" : "member";
  const existing = await db
    .prepare("SELECT id, email, display_name, role, lifecycle_state FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first<UserRow>();
  if (existing) {
    await db
      .prepare(
        "UPDATE users SET auth_subject = ?, display_name = ?, identity_provider = 'chatgpt', role = ?, updated_at = unixepoch() * 1000 WHERE id = ?",
      )
      .bind(authSubject, actor.displayName, role, existing.id)
      .run();
    return { ...existing, display_name: actor.displayName, role };
  }
  if (await deletedAccountNeedsRestart(actor)) {
    throw new Error(
      "This Way Ahead account was deleted. Choose Start a new empty account before continuing.",
    );
  }

  const digest = await sha256Hex(authSubject);
  const id = `${role === "owner" ? "owner" : "user"}_${digest.slice(0, 24)}`;
  const lifecycleState = "onboarding";
  await db
    .prepare(
      "INSERT INTO users (id, auth_subject, identity_provider, role, email, display_name, lifecycle_state) VALUES (?, ?, 'chatgpt', ?, ?, ?, ?)",
    )
    .bind(id, authSubject, role, email, actor.displayName, lifecycleState)
    .run();
  return {
    id,
    email,
    display_name: actor.displayName,
    role,
    lifecycle_state: lifecycleState,
  };
}

/**
 * Owner bootstrap compatibility boundary. Calling this helper never promotes
 * an account: ensureUser derives the role only from WAY_AHEAD_OWNER_EMAIL.
 */
export async function ensureFounder(actor: FounderActor): Promise<UserRow> {
  const user = await ensureUser(actor);
  if (user.role !== "owner") {
    throw new Error("This action is reserved for the configured Way Ahead owner.");
  }
  return user;
}

type RawExperience = {
  id: string;
  employer: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: number;
  location: string | null;
  summary: string | null;
  review_state: "draft" | "confirmed" | "conflict" | "removed";
  updated_at?: number;
  provenance_method?: string | null;
  provenance_fact_state?: string | null;
  provenance_source_import_type?: string | null;
  provenance_policy_version?: string | null;
};

type RawStandard = {
  id: string;
  version: number;
  pay_basis: JobStandardRecord["payBasis"];
  minimum_pay_cents: number | null;
  target_pay_cents: number | null;
  currency: string;
  work_arrangements_json: string;
  commute_miles: number | null;
  locations_json: string;
  travel_maximum_percent: number | null;
  schedule_requirements: string | null;
  benefits_json: string;
  growth_priorities_json: string;
  exclusions_json: string;
};

type RawCareerPath = {
  id: string;
  label: string;
  primary_lane: string;
  secondary_lanes_json: string;
  fit_score: number | null;
  opportunity_score: number | null;
  rationale_json: string | null;
  gaps_json: string | null;
  state: CareerPathRecord["state"];
  is_primary: number;
};

type RawPosting = {
  id: string;
  employer: string;
  title: string;
  canonical_url: string;
  locations_json: string | null;
  compensation_json: string | null;
  freshness_state: OpportunityRecord["freshnessState"];
  posted_at: number | null;
  last_checked_at: number;
  source_name: string;
  source_rights_state: OpportunityRecord["sourceRightsState"];
};

export async function readWorkspace(actor: FounderActor): Promise<WorkspaceRecord> {
  const founder = await ensureUser(actor);
  const db = database();
  const [factRows, experienceRows, skillRows, standard, pathRows, postingRows] = await Promise.all([
    db
      .prepare(
        "SELECT fact_type, value_json, state FROM profile_facts WHERE user_id = ? AND invalidated_at IS NULL ORDER BY created_at",
      )
      .bind(founder.id)
      .all<{ fact_type: string; value_json: string; state: string }>(),
    db
      .prepare(
        "SELECT er.id, er.employer, er.title, er.start_date, er.end_date, er.is_current, er.location, er.summary, er.review_state, er.updated_at, (SELECT pf.extraction_method FROM experience_role_facts erf JOIN profile_facts pf ON pf.id = erf.profile_fact_id AND pf.user_id = erf.user_id WHERE erf.user_id = er.user_id AND erf.experience_role_id = er.id AND pf.invalidated_at IS NULL ORDER BY pf.updated_at DESC, pf.created_at DESC LIMIT 1) AS provenance_method, (SELECT pf.state FROM experience_role_facts erf JOIN profile_facts pf ON pf.id = erf.profile_fact_id AND pf.user_id = erf.user_id WHERE erf.user_id = er.user_id AND erf.experience_role_id = er.id AND pf.invalidated_at IS NULL ORDER BY pf.updated_at DESC, pf.created_at DESC LIMIT 1) AS provenance_fact_state, (SELECT si.type FROM experience_role_facts erf JOIN profile_facts pf ON pf.id = erf.profile_fact_id AND pf.user_id = erf.user_id LEFT JOIN source_imports si ON si.id = pf.source_import_id AND si.user_id = pf.user_id WHERE erf.user_id = er.user_id AND erf.experience_role_id = er.id AND pf.invalidated_at IS NULL ORDER BY pf.updated_at DESC, pf.created_at DESC LIMIT 1) AS provenance_source_import_type, (SELECT pf.extraction_policy_version FROM experience_role_facts erf JOIN profile_facts pf ON pf.id = erf.profile_fact_id AND pf.user_id = erf.user_id WHERE erf.user_id = er.user_id AND erf.experience_role_id = er.id AND pf.invalidated_at IS NULL ORDER BY pf.updated_at DESC, pf.created_at DESC LIMIT 1) AS provenance_policy_version FROM experience_roles er WHERE er.user_id = ? ORDER BY CASE WHEN er.review_state = 'removed' THEN 1 ELSE 0 END, er.is_current DESC, er.start_date DESC, er.updated_at DESC",
      )
      .bind(founder.id)
      .all<RawExperience>(),
    db
      .prepare(
        "SELECT s.id, s.canonical_name, s.category, ps.level, ps.review_state FROM profile_skills ps JOIN skills s ON s.id = ps.skill_id WHERE ps.user_id = ? ORDER BY s.category, s.canonical_name",
      )
      .bind(founder.id)
      .all<{
        id: string;
        canonical_name: string;
        category: string;
        level: string | null;
        review_state: "draft" | "confirmed" | "rejected";
      }>(),
    db
      .prepare(
        "SELECT id, version, pay_basis, minimum_pay_cents, target_pay_cents, currency, work_arrangements_json, commute_miles, locations_json, travel_maximum_percent, schedule_requirements, benefits_json, growth_priorities_json, exclusions_json FROM job_standards WHERE user_id = ? AND is_current = 1 LIMIT 1",
      )
      .bind(founder.id)
      .first<RawStandard>(),
    db
      .prepare(
        "SELECT id, label, primary_lane, secondary_lanes_json, fit_score, opportunity_score, rationale_json, gaps_json, state, is_primary FROM career_paths WHERE user_id = ? ORDER BY is_primary DESC, fit_score DESC, label",
      )
      .bind(founder.id)
      .all<RawCareerPath>(),
    db
      .prepare(
        "SELECT jp.id, jp.employer, jp.title, jp.canonical_url, jp.locations_json, jp.compensation_json, jp.freshness_state, jp.posted_at, jp.last_checked_at, js.name AS source_name, js.rights_state AS source_rights_state FROM job_postings jp JOIN job_sources js ON js.id = jp.source_id WHERE jp.removed_at IS NULL AND (EXISTS (SELECT 1 FROM user_job_links ujl WHERE ujl.user_id = ? AND ujl.job_posting_id = jp.id AND ujl.state = 'active') OR EXISTS (SELECT 1 FROM job_analyses ja WHERE ja.user_id = ? AND ja.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM pursuits p WHERE p.user_id = ? AND p.job_posting_id = jp.id) OR EXISTS (SELECT 1 FROM resume_assignments ra WHERE ra.user_id = ? AND ra.job_posting_id = jp.id)) ORDER BY jp.last_checked_at DESC LIMIT 30",
      )
      .bind(founder.id, founder.id, founder.id, founder.id)
      .all<RawPosting>(),
  ]);

  const opportunities = await Promise.all(
    postingRows.results.map((posting) => readOpportunity(db, founder.id, posting)),
  );
  const facts = factRows.results;
  const headlineFact = facts.find((fact) => fact.fact_type === "headline");
  const summaryFact = facts.find((fact) => fact.fact_type === "professional_summary");
  const experienceRecord = (
    role: RawExperience,
  ): WorkspaceRecord["profile"]["experiences"][number] => {
    const method =
      role.provenance_method === "manual_entry" ||
      role.provenance_method === "client_side_file_extraction"
        ? role.provenance_method
        : role.provenance_source_import_type
          ? "imported_text"
          : role.provenance_method
            ? "unknown"
            : "manual_entry";
    const label =
      method === "client_side_file_extraction"
        ? "Résumé file text, reviewed by you"
        : method === "imported_text"
          ? "Imported career text, reviewed by you"
          : method === "manual_entry"
            ? "Manual entry, confirmed by you"
            : "Source needs review";
    const factState = [
      "user_confirmed",
      "user_corrected",
      "suggested",
      "missing",
    ].includes(role.provenance_fact_state ?? "")
      ? (role.provenance_fact_state as
          | "user_confirmed"
          | "user_corrected"
          | "suggested"
          | "missing")
      : role.review_state === "confirmed"
        ? "user_confirmed"
        : "unknown";
    return {
      id: role.id,
      employer: role.employer,
      title: role.title,
      startDate: role.start_date,
      endDate: role.end_date,
      isCurrent: toBool(role.is_current),
      location: role.location,
      summary: role.summary,
      reviewState: role.review_state,
      provenance: {
        method,
        label,
        factState,
        sourceImportType: role.provenance_source_import_type ?? null,
        policyVersion: role.provenance_policy_version ?? null,
      },
      updatedAt: role.updated_at ?? 0,
    };
  };
  const activeExperiences = experienceRows.results.filter(
    (role) => role.review_state !== "removed",
  );
  const removedExperiences = experienceRows.results.filter(
    (role) => role.review_state === "removed",
  );

  return {
    actor,
    profile: {
      displayName: founder.display_name ?? actor.displayName,
      headline: valueFromFact(headlineFact?.value_json),
      summary: valueFromFact(summaryFact?.value_json),
      confirmedFactCount: facts.filter((fact) =>
        fact.state === "user_confirmed" || fact.state === "user_corrected",
      ).length,
      unresolvedFactCount: facts.filter((fact) =>
        fact.state === "missing" || fact.state === "suggested" || fact.state === "inferred",
      ).length,
      experiences: activeExperiences.map(experienceRecord),
      removedExperiences: removedExperiences.map(experienceRecord),
      skills: skillRows.results.map((skill) => ({
        id: skill.id,
        name: skill.canonical_name,
        category: skill.category,
        level: skill.level,
        reviewState: skill.review_state,
      })),
    },
    jobStandard: standard
      ? {
          id: standard.id,
          version: standard.version,
          payBasis: standard.pay_basis,
          minimumPayCents: standard.minimum_pay_cents,
          targetPayCents: standard.target_pay_cents,
          currency: standard.currency,
          workArrangements: parseJson(standard.work_arrangements_json, []),
          commuteMiles: standard.commute_miles,
          locations: parseJson(standard.locations_json, []),
          travelMaximumPercent: standard.travel_maximum_percent,
          scheduleRequirements: standard.schedule_requirements,
          benefits: parseJson(standard.benefits_json, []),
          growthPriorities: parseJson(standard.growth_priorities_json, []),
          exclusions: parseJson(standard.exclusions_json, []),
        }
      : null,
    careerPaths: pathRows.results.map((path) => ({
      id: path.id,
      label: path.label,
      primaryLane: path.primary_lane,
      secondaryLanes: parseJson(path.secondary_lanes_json, []),
      fitScore: path.fit_score,
      opportunityScore: path.opportunity_score,
      rationale: parseJson<JsonRecord | null>(path.rationale_json, null),
      gaps: parseJson(path.gaps_json, []),
      state: path.state,
      isPrimary: toBool(path.is_primary),
    })),
    opportunities,
    system: {
      environment: "founder_production",
      operatorAssisted: true,
      canRecordOperatorAnalysis: founder.role === "owner",
      billingEnabled: false,
      submissionEnabled: false,
      refreshedAt: Date.now(),
    },
  };
}

type OwnerOpportunityAnalysisInput = {
  jobPostingId: unknown;
  sourceVersionId: unknown;
  careerPathId: unknown;
  fitScore: unknown;
  moveValueScore: unknown;
  pursuitReadinessScore: unknown;
  recommendation: unknown;
  unknowns: unknown;
  evidenceNote: unknown;
  sourceArtifact: unknown;
  nextAction: unknown;
  confirmation: unknown;
};

type MemberOpportunityAssessmentInput = {
  jobPostingId: unknown;
  careerPathId: unknown;
};

function optionalScore(value: unknown, label: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(`${label} must be a whole number from 0 to 100 or left open.`);
  }
  return value;
}

function boundedOperatorText(
  value: unknown,
  label: string,
  maximum: number,
  required = false,
): string {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const normalized = value.trim();
  if (required && !normalized) throw new Error(`${label} is required.`);
  if (normalized.length > maximum) {
    throw new Error(`${label} must be ${maximum} characters or fewer.`);
  }
  return normalized;
}

export async function recordMemberOpportunityAssessment(
  actor: FounderActor,
  input: MemberOpportunityAssessmentInput,
): Promise<{
  analysisId: string;
  jobPostingId: string;
  recommendation: "pursue" | "watch" | "pass" | "needs_evidence";
}> {
  const user = await ensureUser(actor);
  const jobPostingId = boundedOperatorText(
    input.jobPostingId,
    "Job",
    120,
    true,
  );
  const careerPathId = boundedOperatorText(
    input.careerPathId,
    "Job Path",
    120,
    true,
  );
  const db = database();
  const [posting, sourceVersion, careerPath, standard, roles, factCount, skillCount] =
    await Promise.all([
      db
        .prepare(
          "SELECT jp.id, jp.employer, jp.title, jp.locations_json, jp.compensation_json, jp.freshness_state, jp.last_checked_at, js.rights_state FROM job_postings jp JOIN job_sources js ON js.id = jp.source_id WHERE jp.id = ? AND jp.removed_at IS NULL AND EXISTS (SELECT 1 FROM user_job_links ujl WHERE ujl.user_id = ? AND ujl.job_posting_id = jp.id AND ujl.state = 'active') LIMIT 1",
        )
        .bind(jobPostingId, user.id)
        .first<{
          id: string;
          employer: string;
          title: string;
          locations_json: string | null;
          compensation_json: string | null;
          freshness_state: OpportunityRecord["freshnessState"];
          last_checked_at: number;
          rights_state: OpportunityRecord["sourceRightsState"];
        }>(),
      db
        .prepare(
          "SELECT version.id, version.source_checked_at, version.description_checksum, version.source_facts_json, version.source_conflicts_json, version.capture_state FROM job_posting_versions version JOIN job_postings posting ON posting.id = version.job_posting_id AND posting.description_checksum = version.description_checksum WHERE version.job_posting_id = ? LIMIT 1",
        )
        .bind(jobPostingId)
        .first<{
          id: string;
          source_checked_at: number;
          description_checksum: string;
          source_facts_json: string;
          source_conflicts_json: string;
          capture_state: "verified" | "partial" | "conflict" | "unavailable";
        }>(),
      db
        .prepare(
          "SELECT id, label, primary_lane, secondary_lanes_json FROM career_paths WHERE id = ? AND user_id = ? AND state = 'active' LIMIT 1",
        )
        .bind(careerPathId, user.id)
        .first<{
          id: string;
          label: string;
          primary_lane: string;
          secondary_lanes_json: string;
        }>(),
      db
        .prepare(
          "SELECT id, version, minimum_pay_cents, target_pay_cents, currency, work_arrangements_json, travel_maximum_percent, benefits_json FROM job_standards WHERE user_id = ? AND is_current = 1 LIMIT 1",
        )
        .bind(user.id)
        .first<{
          id: string;
          version: number;
          minimum_pay_cents: number | null;
          target_pay_cents: number | null;
          currency: string;
          work_arrangements_json: string;
          travel_maximum_percent: number | null;
          benefits_json: string;
        }>(),
      db
        .prepare(
          "SELECT id, title, start_date, end_date, is_current, summary FROM experience_roles WHERE user_id = ? AND review_state = 'confirmed' ORDER BY is_current DESC, start_date DESC",
        )
        .bind(user.id)
        .all<{
          id: string;
          title: string;
          start_date: string | null;
          end_date: string | null;
          is_current: number;
          summary: string | null;
        }>(),
      db
        .prepare(
          "SELECT count(*) AS count FROM profile_facts WHERE user_id = ? AND state IN ('user_confirmed', 'user_corrected') AND invalidated_at IS NULL",
        )
        .bind(user.id)
        .first<{ count: number }>(),
      db
        .prepare(
          "SELECT count(*) AS count FROM profile_skills WHERE user_id = ? AND review_state = 'confirmed'",
        )
        .bind(user.id)
        .first<{ count: number }>(),
    ]);

  if (!posting) {
    throw new Error(
      "Add this direct employer job to your workspace before assessing it.",
    );
  }
  if (!sourceVersion) {
    throw new Error("The employer source has no reviewable version.");
  }
  if (posting.rights_state !== "approved") {
    throw new Error("This employer source is not approved for assessment.");
  }
  if (
    sourceVersion.capture_state !== "verified" &&
    sourceVersion.capture_state !== "partial"
  ) {
    throw new Error(
      "Resolve the employer-source conflict before assessing this job.",
    );
  }
  if (Date.now() - sourceVersion.source_checked_at > 24 * 60 * 60 * 1000) {
    throw new Error(
      "Refresh this employer job from its direct URL before assessing it.",
    );
  }
  if (!careerPath) throw new Error("Choose one of your active Job Paths.");
  if (!standard) throw new Error("Finish your Job Standard before assessment.");
  if (!roles.results.length) {
    throw new Error(
      "Confirm at least one structured experience role before assessment.",
    );
  }

  const sourceFacts = parseJson<JsonRecord>(
    sourceVersion.source_facts_json,
    {},
  );
  const assessment = assessDeterministically({
    source: {
      versionId: sourceVersion.id,
      descriptionChecksum: sourceVersion.description_checksum,
      captureState: sourceVersion.capture_state,
      rightsState: posting.rights_state,
      freshnessState: posting.freshness_state,
      title: posting.title,
      locations: parseJson(posting.locations_json, []),
      compensation: parseJson<JsonRecord | null>(
        posting.compensation_json,
        null,
      ),
      facts: sourceFacts,
    },
    standard: {
      minimumPayCents: standard.minimum_pay_cents,
      targetPayCents: standard.target_pay_cents,
      currency: standard.currency,
      workArrangements: parseJson(standard.work_arrangements_json, []),
      travelMaximumPercent: standard.travel_maximum_percent,
      benefits: parseJson(standard.benefits_json, []),
    },
    path: {
      id: careerPath.id,
      label: careerPath.label,
      primaryLane: careerPath.primary_lane,
      secondaryLanes: parseJson(careerPath.secondary_lanes_json, []),
    },
    profile: {
      confirmedFactCount: factCount?.count ?? 0,
      confirmedSkillCount: skillCount?.count ?? 0,
      confirmedRoles: roles.results.map((role) => ({
        title: role.title,
        startDate: role.start_date,
        endDate: role.end_date,
        isCurrent: toBool(role.is_current),
        summary: role.summary,
      })),
    },
  });
  const profileEvidence = {
    roles: roles.results.map((role) => ({
      id: role.id,
      title: role.title,
      startDate: role.start_date,
      endDate: role.end_date,
      isCurrent: toBool(role.is_current),
      summaryPresent: Boolean(role.summary?.trim()),
    })),
    confirmedFactCount: factCount?.count ?? 0,
    confirmedSkillCount: skillCount?.count ?? 0,
  };
  const profileEvidenceVersion = `profile_${(
    await sha256Hex(canonicalJson(profileEvidence))
  ).slice(0, 24)}`;
  const analysisCore = {
    policyVersion: assessment.policyVersion,
    userId: user.id,
    jobPostingId,
    jobVersionId: sourceVersion.id,
    careerPathId,
    jobStandardId: standard.id,
    jobStandardVersion: standard.version,
    profileEvidenceVersion,
    fitScore: assessment.fitScore,
    jobValueScore: assessment.jobValueScore,
    pursuitReadinessScore: assessment.pursuitReadinessScore,
    recommendation: assessment.recommendation,
    unknowns: assessment.unknowns,
  };
  const analysisId = `analysis_${(
    await sha256Hex(canonicalJson(analysisCore))
  ).slice(0, 24)}`;
  const nextAction =
    assessment.recommendation === "pursue"
      ? "Review the evidence below and start a pursuit if the remaining facts look right."
      : assessment.recommendation === "pass"
        ? "Resolve the recorded conflict before spending more pursuit effort."
        : assessment.recommendation === "watch"
          ? "Keep this job visible and strengthen the evidence that would change the decision."
          : "Resolve the highest-impact open fact before treating this as a priority pursuit.";
  const integrityGates = {
    jobVersionId: sourceVersion.id,
    jobDescriptionChecksum: sourceVersion.description_checksum,
    sourceCheckedAt: sourceVersion.source_checked_at,
    sourceCaptureState: sourceVersion.capture_state,
    sourceRightsState: posting.rights_state,
    jobStandardId: standard.id,
    jobStandardVersion: standard.version,
    careerPathId,
    profileEvidenceVersion,
    policyVersion: assessment.policyVersion,
    verifiedCriterionCount: assessment.verifiedCriterionCount,
    totalCriterionCount: assessment.totalCriterionCount,
    blockingUnknownCount: assessment.unknowns.length,
    hardConflictCount: assessment.hardConflicts.length,
    deterministic: true,
    modelUsed: false,
    externalActionAuthorized: false,
  };
  const fit = {
    fitScore: assessment.fitScore,
    scoreKind: assessment.scoreKind,
    criteria: assessment.criteria,
    verifiedCriterionCount: assessment.verifiedCriterionCount,
    totalCriterionCount: assessment.totalCriterionCount,
    scoreMeaning: assessment.scoreMeaning,
    recommendationReason: assessment.recommendationReason,
    hardConflicts: assessment.hardConflicts,
    nextAction,
    careerPathLabel: careerPath.label,
    scoringMethod: "deterministic structured criteria",
  };

  await db.batch([
    db
      .prepare(
        "UPDATE job_analyses SET validation_state = 'invalidated', invalidated_at = unixepoch() * 1000 WHERE user_id = ? AND job_posting_id = ? AND id <> ? AND validation_state <> 'invalidated'",
      )
      .bind(user.id, jobPostingId, analysisId),
    db
      .prepare(
        "INSERT INTO job_analyses (id, user_id, job_posting_id, career_path_id, job_standard_id, policy_version, evidence_version, integrity_gates_json, move_value_score, pursuit_readiness_score, fit_json, unknowns_json, recommendation, validation_state, invalidated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'trusted', NULL) ON CONFLICT(id) DO UPDATE SET career_path_id = excluded.career_path_id, job_standard_id = excluded.job_standard_id, policy_version = excluded.policy_version, evidence_version = excluded.evidence_version, integrity_gates_json = excluded.integrity_gates_json, move_value_score = excluded.move_value_score, pursuit_readiness_score = excluded.pursuit_readiness_score, fit_json = excluded.fit_json, unknowns_json = excluded.unknowns_json, recommendation = excluded.recommendation, validation_state = 'trusted', invalidated_at = NULL WHERE job_analyses.user_id = excluded.user_id",
      )
      .bind(
        analysisId,
        user.id,
        jobPostingId,
        careerPathId,
        standard.id,
        assessment.policyVersion,
        profileEvidenceVersion,
        json(integrityGates),
        assessment.jobValueScore,
        assessment.pursuitReadinessScore,
        json(fit),
        json(assessment.unknowns),
        assessment.recommendation,
      ),
    db
      .prepare(
        "UPDATE pursuits SET current_analysis_id = ?, next_action = ?, updated_at = unixepoch() * 1000 WHERE user_id = ? AND job_posting_id = ?",
      )
      .bind(analysisId, nextAction, user.id, jobPostingId),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'member_deterministic_assessment_recorded', 'job_analysis', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        analysisId,
        json({
          jobPostingId,
          jobVersionId: sourceVersion.id,
          careerPathId,
          jobStandardId: standard.id,
          profileEvidenceVersion,
          policyVersion: assessment.policyVersion,
          recommendation: assessment.recommendation,
          externalActionAuthorized: false,
          modelUsed: false,
        }),
      ),
  ]);
  return {
    analysisId,
    jobPostingId,
    recommendation: assessment.recommendation,
  };
}

export async function recordOwnerOpportunityAnalysis(
  actor: FounderActor,
  input: OwnerOpportunityAnalysisInput,
): Promise<{ analysisId: string; jobPostingId: string }> {
  const owner = await ensureFounder(actor);
  const jobPostingId = boundedOperatorText(
    input.jobPostingId,
    "Job",
    120,
    true,
  );
  const sourceVersionId = boundedOperatorText(
    input.sourceVersionId,
    "Source version",
    120,
    true,
  );
  const careerPathId = boundedOperatorText(
    input.careerPathId,
    "Career path",
    120,
    true,
  );
  const fitScore = optionalScore(input.fitScore, "Fit score");
  const moveValueScore = optionalScore(input.moveValueScore, "Move Value");
  const pursuitReadinessScore = optionalScore(
    input.pursuitReadinessScore,
    "Pursuit Readiness",
  );
  const allowedRecommendations = new Set([
    "pursue",
    "watch",
    "pass",
    "needs_evidence",
  ]);
  if (
    typeof input.recommendation !== "string" ||
    !allowedRecommendations.has(input.recommendation)
  ) {
    throw new Error("Choose a supported recommendation.");
  }
  const recommendation = input.recommendation as
    | "pursue"
    | "watch"
    | "pass"
    | "needs_evidence";
  if (!Array.isArray(input.unknowns) || input.unknowns.length > 20) {
    throw new Error("Record no more than 20 evidence unknowns.");
  }
  const unknowns = input.unknowns
    .map((value, index) =>
      boundedOperatorText(value, `Unknown ${index + 1}`, 500),
    )
    .filter(Boolean);
  const evidenceNote = boundedOperatorText(
    input.evidenceNote,
    "Evidence note",
    4_000,
    true,
  );
  const sourceArtifact = boundedOperatorText(
    input.sourceArtifact,
    "Source artifact",
    500,
    true,
  );
  const nextAction = boundedOperatorText(
    input.nextAction,
    "Next action",
    1_000,
    true,
  );
  if (input.confirmation !== "record_reviewed_analysis") {
    throw new Error(
      "Confirm that the source, claim safety, and unresolved facts were reviewed.",
    );
  }

  const db = database();
  const [posting, sourceVersion, careerPath, standard] = await Promise.all([
    db
      .prepare(
        "SELECT jp.id, jp.employer, jp.title, jp.freshness_state, js.rights_state FROM job_postings jp JOIN job_sources js ON js.id = jp.source_id WHERE jp.id = ? AND jp.removed_at IS NULL LIMIT 1",
      )
      .bind(jobPostingId)
      .first<{
        id: string;
        employer: string;
        title: string;
        freshness_state: string;
        rights_state: string;
      }>(),
    db
      .prepare(
        "SELECT version.id, version.capture_state, version.description_checksum FROM job_posting_versions version JOIN job_postings posting ON posting.id = version.job_posting_id AND posting.description_checksum = version.description_checksum WHERE version.job_posting_id = ? LIMIT 1",
      )
      .bind(jobPostingId)
      .first<{
        id: string;
        capture_state: string;
        description_checksum: string;
      }>(),
    db
      .prepare(
        "SELECT id, label FROM career_paths WHERE id = ? AND user_id = ? AND state = 'active' LIMIT 1",
      )
      .bind(careerPathId, owner.id)
      .first<{ id: string; label: string }>(),
    db
      .prepare(
        "SELECT id, version FROM job_standards WHERE user_id = ? AND is_current = 1 LIMIT 1",
      )
      .bind(owner.id)
      .first<{ id: string; version: number }>(),
  ]);
  if (!posting) throw new Error("The verified job is not available.");
  if (!sourceVersion || sourceVersion.id !== sourceVersionId) {
    throw new Error(
      "The employer source changed. Refresh the job before recording analysis.",
    );
  }
  if (posting.rights_state !== "approved") {
    throw new Error("The job source is not approved for analysis.");
  }
  if (
    sourceVersion.capture_state !== "verified" &&
    sourceVersion.capture_state !== "partial"
  ) {
    throw new Error("Resolve the source capture before recording analysis.");
  }
  if (!careerPath) throw new Error("Choose one of your active Job Paths.");
  if (!standard) throw new Error("Finish your Job Standard before analysis.");

  const analysisCore = {
    policyVersion: "way-ahead-operator-analysis-v1.1",
    userId: owner.id,
    jobPostingId,
    sourceVersionId,
    careerPathId,
    fitScore,
    jobStandardId: standard.id,
    jobStandardVersion: standard.version,
    moveValueScore,
    pursuitReadinessScore,
    recommendation,
    unknowns,
    evidenceNote,
    sourceArtifact,
    nextAction,
  };
  const analysisId = `analysis_${(
    await sha256Hex(canonicalJson(analysisCore))
  ).slice(0, 24)}`;
  const integrityGates = {
    jobVersionId: sourceVersion.id,
    jobDescriptionChecksum: sourceVersion.description_checksum,
    sourceCaptureState: sourceVersion.capture_state,
    sourceRightsState: posting.rights_state,
    jobStandardId: standard.id,
    jobStandardVersion: standard.version,
    careerPathId,
    blockingUnknownCount: unknowns.length,
    operatorReviewed: true,
    externalActionAuthorized: false,
  };
  const fit = {
    fitScore,
    evidenceNote,
    sourceArtifact,
    nextAction,
    careerPathLabel: careerPath.label,
    scoringMethod: "operator-reviewed case-study evidence",
  };

  await db.batch([
    db
      .prepare(
        "INSERT INTO job_analyses (id, user_id, job_posting_id, career_path_id, job_standard_id, policy_version, evidence_version, integrity_gates_json, move_value_score, pursuit_readiness_score, fit_json, unknowns_json, recommendation, validation_state) VALUES (?, ?, ?, ?, ?, 'way-ahead-operator-analysis-v1.1', ?, ?, ?, ?, ?, ?, ?, 'trusted') ON CONFLICT(id) DO NOTHING",
      )
      .bind(
        analysisId,
        owner.id,
        jobPostingId,
        careerPathId,
        standard.id,
        sourceArtifact,
        json(integrityGates),
        moveValueScore,
        pursuitReadinessScore,
        json(fit),
        json(unknowns),
        recommendation,
      ),
    db
      .prepare(
        "UPDATE pursuits SET current_analysis_id = ?, next_action = ?, updated_at = unixepoch() * 1000 WHERE user_id = ? AND job_posting_id = ?",
      )
      .bind(analysisId, nextAction, owner.id, jobPostingId),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'owner_opportunity_analysis_recorded', 'job_analysis', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        owner.id,
        `chatgpt:${owner.email}`,
        analysisId,
        json({
          jobPostingId,
          sourceVersionId,
          careerPathId,
          recommendation,
          blockingUnknownCount: unknowns.length,
          sourceArtifact,
          externalActionAuthorized: false,
        }),
      ),
  ]);
  return { analysisId, jobPostingId };
}

async function readOpportunity(
  db: D1Database,
  userId: string,
  posting: RawPosting,
): Promise<OpportunityRecord> {
  const [version, analysis, pursuit] = await Promise.all([
    db
      .prepare(
        "SELECT version.id, version.source_checked_at, version.description_checksum, version.source_facts_json, version.source_conflicts_json, version.capture_state FROM job_posting_versions version JOIN job_postings posting ON posting.id = version.job_posting_id AND posting.description_checksum = version.description_checksum WHERE version.job_posting_id = ? LIMIT 1",
      )
      .bind(posting.id)
      .first<{
        id: string;
        source_checked_at: number;
        description_checksum: string;
        source_facts_json: string;
        source_conflicts_json: string;
        capture_state: "verified" | "partial" | "conflict" | "unavailable";
      }>(),
    db
      .prepare(
        "SELECT id, move_value_score, pursuit_readiness_score, fit_json, integrity_gates_json, unknowns_json, recommendation, validation_state FROM job_analyses WHERE user_id = ? AND job_posting_id = ? ORDER BY created_at DESC LIMIT 1",
      )
      .bind(userId, posting.id)
      .first<{
        id: string;
        move_value_score: number | null;
        pursuit_readiness_score: number | null;
        fit_json: string;
        integrity_gates_json: string;
        unknowns_json: string;
        recommendation: "pursue" | "watch" | "pass" | "needs_evidence";
        validation_state: "pending" | "trusted" | "blocked" | "invalidated";
      }>(),
    db
      .prepare(
        "SELECT id, revision, state, next_action, external_approval_state FROM pursuits WHERE user_id = ? AND job_posting_id = ? LIMIT 1",
      )
      .bind(userId, posting.id)
      .first<{
        id: string;
        revision: number;
        state: NonNullable<OpportunityRecord["pursuit"]>["state"];
        next_action: string | null;
        external_approval_state: NonNullable<OpportunityRecord["pursuit"]>["externalApprovalState"];
      }>(),
  ]);

  let pursuitRecord: OpportunityRecord["pursuit"] = null;
  if (pursuit) {
    const [assetRows, packageRow, resumeStarter, coverLetterStarter, eventRows] = await Promise.all([
      db
        .prepare(
          "SELECT id, type, version, filename, content_sha256, page_count, review_state, content_json, invalidated_at, updated_at FROM generated_assets WHERE user_id = ? AND pursuit_id = ? ORDER BY type, version DESC",
        )
        .bind(userId, pursuit.id)
        .all<{
          id: string;
          type: AssetRecord["type"];
          version: number;
          filename: string | null;
          content_sha256: string | null;
          page_count: number | null;
          review_state: AssetRecord["reviewState"];
          content_json: string | null;
          invalidated_at: number | null;
          updated_at: number;
        }>(),
      db
        .prepare(
          "SELECT pp.id, pp.version, pp.destination_url, pp.job_posting_version_id, pp.payload_sha256, pp.blockers_json, pp.readiness_state, pp.asset_manifest_json, pp.answers_json, pp.created_at, CASE WHEN EXISTS (SELECT 1 FROM external_action_approvals approval WHERE approval.user_id = pp.user_id AND approval.pursuit_package_id = pp.id AND approval.action = 'approve_application_package' AND approval.payload_sha256 = pp.payload_sha256 AND approval.state = 'approved') THEN 'approved' WHEN EXISTS (SELECT 1 FROM external_action_approvals approval WHERE approval.user_id = pp.user_id AND approval.pursuit_package_id = pp.id AND approval.action = 'approve_application_package' AND approval.payload_sha256 = pp.payload_sha256 AND approval.state = 'completed') THEN 'completed' ELSE 'not_approved' END AS approval_state, (SELECT approval.approved_at FROM external_action_approvals approval WHERE approval.user_id = pp.user_id AND approval.pursuit_package_id = pp.id AND approval.action = 'approve_application_package' AND approval.payload_sha256 = pp.payload_sha256 AND approval.state IN ('approved','completed') ORDER BY approval.approved_at DESC LIMIT 1) AS approved_at, (SELECT approval.completed_at FROM external_action_approvals approval WHERE approval.user_id = pp.user_id AND approval.pursuit_package_id = pp.id AND approval.action = 'approve_application_package' AND approval.payload_sha256 = pp.payload_sha256 AND approval.state = 'completed' ORDER BY approval.completed_at DESC LIMIT 1) AS completed_at FROM pursuit_packages pp WHERE pp.user_id = ? AND pp.pursuit_id = ? ORDER BY pp.version DESC LIMIT 1",
        )
        .bind(userId, pursuit.id)
        .first<{
          id: string;
          version: number;
          destination_url: string;
          job_posting_version_id: string;
          payload_sha256: string;
          approval_state: "approved" | "completed" | "not_approved";
          approved_at: number | null;
          completed_at: number | null;
          blockers_json: string;
          readiness_state: "blocked" | "ready_for_review" | "superseded";
          asset_manifest_json: string;
          answers_json: string;
          created_at: number;
        }>(),
      db
        .prepare(
          "SELECT r.id, r.name, r.version, r.review_state FROM resumes r JOIN resume_assignments ra ON ra.resume_id = r.id AND ra.user_id = r.user_id WHERE r.user_id = ? AND ra.scope = 'job' AND ra.job_posting_id = ? AND r.review_state <> 'superseded' ORDER BY r.updated_at DESC, r.version DESC LIMIT 1",
        )
        .bind(userId, posting.id)
        .first<{
          id: string;
          name: string;
          version: number;
          review_state: "draft" | "approved" | "superseded";
        }>(),
      db
        .prepare(
          "SELECT id, version, review_state FROM generated_assets WHERE user_id = ? AND pursuit_id = ? AND type = 'cover_letter' AND generation_policy_version <> 'client-render-receipt-v1' AND invalidated_at IS NULL ORDER BY updated_at DESC, version DESC LIMIT 1",
        )
        .bind(userId, pursuit.id)
        .first<{
          id: string;
          version: number;
          review_state: "draft" | "claim_safe" | "approved" | "superseded";
        }>(),
      db
        .prepare(
          "SELECT id, event_type, occurred_at, note, metadata_json, created_at FROM pursuit_events WHERE user_id = ? AND pursuit_id = ? ORDER BY occurred_at DESC, created_at DESC, id DESC",
        )
        .bind(userId, pursuit.id)
        .all<{
          id: string;
          event_type: PursuitEventType;
          occurred_at: number;
          note: string | null;
          metadata_json: string;
          created_at: number;
        }>(),
    ]);
    pursuitRecord = {
      id: pursuit.id,
      revision: pursuit.revision,
      state: pursuit.state,
      nextAction: pursuit.next_action,
      externalApprovalState: pursuit.external_approval_state,
      starters: {
        resume: resumeStarter
          ? {
              id: resumeStarter.id,
              name: resumeStarter.name,
              version: resumeStarter.version,
              reviewState: resumeStarter.review_state,
            }
          : null,
        coverLetter: coverLetterStarter
          ? {
              id: coverLetterStarter.id,
              version: coverLetterStarter.version,
              reviewState: coverLetterStarter.review_state,
            }
          : null,
      },
      assets: assetRows.results.map((asset) => ({
        id: asset.id,
        type: asset.type,
        version: asset.version,
        filename: asset.filename,
        contentSha256: asset.content_sha256,
        pageCount: asset.page_count,
        reviewState: asset.review_state,
        content: parseJson<JsonRecord | null>(asset.content_json, null),
        invalidatedAt: asset.invalidated_at,
        updatedAt: asset.updated_at,
      })),
      events: eventRows.results.map((event) => ({
        id: event.id,
        type: event.event_type,
        occurredAt: event.occurred_at,
        note: event.note,
        metadata: parseJson(event.metadata_json, {}),
        createdAt: event.created_at,
      })),
      package: packageRow
        ? {
            id: packageRow.id,
            version: packageRow.version,
            destinationUrl: packageRow.destination_url,
            jobPostingVersionId: packageRow.job_posting_version_id,
            payloadSha256: packageRow.payload_sha256,
            approvalState: packageRow.approval_state,
            approvedAt: packageRow.approved_at,
            completedAt: packageRow.completed_at,
            blockers: parseJson(packageRow.blockers_json, []),
            readinessState: packageRow.readiness_state,
            assetManifest: parseJson(packageRow.asset_manifest_json, {}),
            answers: parseJson(packageRow.answers_json, {}),
            createdAt: packageRow.created_at,
          }
        : null,
    };
  }

  return {
    id: posting.id,
    employer: posting.employer,
    title: posting.title,
    canonicalUrl: posting.canonical_url,
    locations: parseJson(posting.locations_json, []),
    compensation: parseJson<JsonRecord | null>(posting.compensation_json, null),
    freshnessState: posting.freshness_state,
    postedAt: posting.posted_at,
    lastCheckedAt: posting.last_checked_at,
    sourceName: posting.source_name,
    sourceRightsState: posting.source_rights_state,
    sourceVersion: version
      ? {
          id: version.id,
          checksum: version.description_checksum,
          captureState: version.capture_state,
          conflicts: parseJson(version.source_conflicts_json, []),
          facts: parseJson(version.source_facts_json, {}),
          checkedAt: version.source_checked_at,
        }
      : null,
    analysis: analysis
      ? {
          id: analysis.id,
          moveValueScore: analysis.move_value_score,
          pursuitReadinessScore: analysis.pursuit_readiness_score,
          fit: parseJson(analysis.fit_json, {}),
          integrityGates: parseJson(analysis.integrity_gates_json, {}),
          unknowns: parseJson(analysis.unknowns_json, []),
          recommendation: analysis.recommendation,
          validationState: analysis.validation_state,
        }
      : null,
    pursuit: pursuitRecord,
  };
}

const ONBOARDING_POLICY_VERSION = "public-alpha-2026-07-23";

function onboardingStepId(step: OnboardingStep): string {
  return `step-${step}`;
}

async function completedOnboardingSteps(
  db: D1Database,
  userId: string,
): Promise<OnboardingStep[]> {
  const rows = await db
    .prepare(
      "SELECT entity_id FROM audit_events WHERE user_id = ? AND event_type = 'onboarding_step_completed' AND entity_type = 'onboarding_step' ORDER BY created_at",
    )
    .bind(userId)
    .all<{ entity_id: string }>();
  const completed = new Set<OnboardingStep>();
  for (const row of rows.results) {
    const match = row.entity_id.match(/^step-([1-6])$/);
    if (match) completed.add(Number(match[1]) as OnboardingStep);
  }
  return [...completed].sort((left, right) => left - right);
}

function onboardingAuditStatement(
  db: D1Database,
  user: UserRow,
  step: OnboardingStep,
  metadata: JsonRecord,
): D1PreparedStatement {
  return db
    .prepare(
      "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'onboarding_step_completed', 'onboarding_step', ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      user.id,
      `chatgpt:${user.email}`,
      onboardingStepId(step),
      json({ ...metadata, policyVersion: ONBOARDING_POLICY_VERSION }),
    );
}

function hasStructuredRoleDates(
  role: Pick<
    RawExperience,
    "employer" | "title" | "start_date" | "end_date" | "is_current"
  > | null | undefined,
): boolean {
  if (!role?.employer.trim() || !role.title.trim()) return false;
  if (!role.start_date || !/^\d{4}-\d{2}(?:-\d{2})?$/.test(role.start_date)) {
    return false;
  }
  if (toBool(role.is_current)) return true;
  if (!role.end_date || !/^\d{4}-\d{2}(?:-\d{2})?$/.test(role.end_date)) {
    return false;
  }
  return role.end_date >= role.start_date;
}

function isActivationReadyExperience(
  role: RawExperience | null | undefined,
): boolean {
  return hasStructuredRoleDates(role) && role?.review_state === "confirmed";
}

async function readOnboardingStateForUser(user: UserRow): Promise<OnboardingState> {
  const db = database();
  const [completedStepsValue, goalFact, sourceFact, role, standard, pathRows] = await Promise.all([
    completedOnboardingSteps(db, user.id),
    db
      .prepare(
        "SELECT value_json FROM profile_facts WHERE user_id = ? AND fact_type = 'search_goal' AND invalidated_at IS NULL ORDER BY updated_at DESC LIMIT 1",
      )
      .bind(user.id)
      .first<{ value_json: string }>(),
    db
      .prepare(
        "SELECT value_json FROM profile_facts WHERE user_id = ? AND fact_type = 'career_source_text' AND invalidated_at IS NULL ORDER BY updated_at DESC LIMIT 1",
      )
      .bind(user.id)
      .first<{ value_json: string }>(),
    db
      .prepare(
        "SELECT id, employer, title, start_date, end_date, is_current, location, summary, review_state FROM experience_roles WHERE user_id = ? AND review_state <> 'removed' ORDER BY is_current DESC, coalesce(end_date, '9999-12') DESC, start_date DESC, updated_at DESC LIMIT 1",
      )
      .bind(user.id)
      .first<RawExperience>(),
    db
      .prepare(
        "SELECT id, version, pay_basis, minimum_pay_cents, target_pay_cents, currency, work_arrangements_json, commute_miles, locations_json, travel_maximum_percent, schedule_requirements, benefits_json, growth_priorities_json, exclusions_json FROM job_standards WHERE user_id = ? AND is_current = 1 LIMIT 1",
      )
      .bind(user.id)
      .first<RawStandard>(),
    db
      .prepare(
        "SELECT id, label, primary_lane, secondary_lanes_json, fit_score, opportunity_score, rationale_json, gaps_json, state, is_primary FROM career_paths WHERE user_id = ? ORDER BY is_primary DESC, label",
      )
      .bind(user.id)
      .all<RawCareerPath>(),
  ]);

  const underlyingStepReady = [
    Boolean(goalFact),
    Boolean(sourceFact) || hasStructuredRoleDates(role),
    isActivationReadyExperience(role),
    Boolean(standard),
    pathRows.results.some((path) => path.state === "active"),
  ];
  const completedSteps: OnboardingStep[] = [];
  for (const [index, ready] of underlyingStepReady.entries()) {
    if (!ready) break;
    completedSteps.push((index + 1) as OnboardingStep);
  }
  const minimumComplete = completedSteps.length === 5;
  const legacyComplete =
    user.lifecycle_state === "founder_production" && minimumComplete;
  const explicitlyComplete =
    completedStepsValue.includes(6) && minimumComplete;
  const complete = legacyComplete || explicitlyComplete;
  if (complete) completedSteps.push(6);
  const currentStep = ([1, 2, 3, 4, 5, 6] as OnboardingStep[])
    .find((step) => !completedSteps.includes(step)) ?? 6;

  const goalValue = parseJson<{
    priorities?: unknown;
    notes?: unknown;
  }>(goalFact?.value_json, {});
  const priorities = Array.isArray(goalValue.priorities)
    ? goalValue.priorities.filter((item): item is string => typeof item === "string")
    : [];
  const notes = typeof goalValue.notes === "string" ? goalValue.notes : "";

  return {
    account: {
      displayName: user.display_name ?? user.email,
      role: user.role,
    },
    currentStep,
    completedSteps,
    complete,
    goal: goalFact ? { priorities, notes } : null,
    careerInput: {
      sourceText: valueFromFact(sourceFact?.value_json),
      role: role
        ? {
            employer: role.employer,
            title: role.title,
            startDate: role.start_date,
            endDate: role.end_date,
            isCurrent: toBool(role.is_current),
            location: role.location,
            summary: role.summary,
            reviewState:
              role.review_state === "removed"
                ? "draft"
                : role.review_state,
          }
        : null,
    },
    jobStandard: standard
      ? {
          id: standard.id,
          version: standard.version,
          payBasis: standard.pay_basis,
          minimumPayCents: standard.minimum_pay_cents,
          targetPayCents: standard.target_pay_cents,
          currency: standard.currency,
          workArrangements: parseJson(standard.work_arrangements_json, []),
          commuteMiles: standard.commute_miles,
          locations: parseJson(standard.locations_json, []),
          travelMaximumPercent: standard.travel_maximum_percent,
          scheduleRequirements: standard.schedule_requirements,
          benefits: parseJson(standard.benefits_json, []),
          growthPriorities: parseJson(standard.growth_priorities_json, []),
          exclusions: parseJson(standard.exclusions_json, []),
        }
      : null,
    careerPaths: pathRows.results.map((path) => ({
      id: path.id,
      label: path.label,
      primaryLane: path.primary_lane,
      secondaryLanes: parseJson(path.secondary_lanes_json, []),
      fitScore: path.fit_score,
      opportunityScore: path.opportunity_score,
      rationale: parseJson<JsonRecord | null>(path.rationale_json, null),
      gaps: parseJson(path.gaps_json, []),
      state: path.state,
      isPrimary: toBool(path.is_primary),
    })),
  };
}

export async function readOnboardingState(actor: FounderActor): Promise<OnboardingState> {
  const user = await ensureUser(actor);
  return readOnboardingStateForUser(user);
}

async function assertOnboardingStepAvailable(
  user: UserRow,
  requestedStep: OnboardingStep,
): Promise<void> {
  const state = await readOnboardingStateForUser(user);
  if (state.complete) {
    throw new Error("Onboarding is already complete. Use your Career Profile to make changes.");
  }
  if (requestedStep > state.currentStep) {
    throw new Error("Finish the current setup step before moving ahead.");
  }
}

async function saveOnboardingGoal(
  user: UserRow,
  payload: Extract<OnboardingStepPayload, { step: 1 }>["data"],
): Promise<void> {
  const db = database();
  const factId = `fact_${user.id}_search_goal`;
  await db.batch([
    db
      .prepare(
        "INSERT INTO profile_facts (id, user_id, fact_type, value_json, extraction_method, extraction_policy_version, state, ownership) VALUES (?, ?, 'search_goal', ?, 'manual_entry', ?, 'user_confirmed', 'owned') ON CONFLICT(id) DO UPDATE SET value_json = excluded.value_json, extraction_method = excluded.extraction_method, extraction_policy_version = excluded.extraction_policy_version, state = excluded.state, ownership = excluded.ownership, invalidated_at = NULL, updated_at = unixepoch() * 1000 WHERE profile_facts.user_id = excluded.user_id",
      )
      .bind(
        factId,
        user.id,
        json({ priorities: payload.priorities, notes: payload.notes }),
        ONBOARDING_POLICY_VERSION,
      ),
    ...(["alpha_data_use", "profile_processing"] as const).map((purpose) =>
      db
        .prepare(
          "INSERT INTO consents (id, user_id, purpose, policy_version, state, granted_at, source) VALUES (?, ?, ?, ?, 'granted', unixepoch() * 1000, 'onboarding')",
        )
        .bind(
          `consent_${crypto.randomUUID()}`,
          user.id,
          purpose,
          ONBOARDING_POLICY_VERSION,
        ),
    ),
    onboardingAuditStatement(db, user, 1, {
      priorities: payload.priorities,
      hasNotes: Boolean(payload.notes),
      noticeAccepted: true,
      processingAccepted: true,
    }),
  ]);
}

async function saveOnboardingCareerInput(
  user: UserRow,
  payload: Extract<OnboardingStepPayload, { step: 2 }>["data"],
  context: "onboarding" | "profile_update" = "onboarding",
): Promise<void> {
  const db = database();
  const auditStatement = (metadata: JsonRecord) =>
    context === "onboarding"
      ? onboardingAuditStatement(db, user, 2, metadata)
      : db
          .prepare(
            "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'profile_source_updated', 'profile_source', ?, ?)",
          )
          .bind(
            crypto.randomUUID(),
            user.id,
            `chatgpt:${user.email}`,
            `profile-source-${crypto.randomUUID()}`,
            json({
              ...metadata,
              policyVersion: ONBOARDING_POLICY_VERSION,
              userConfirmedUpdate: true,
            }),
          );
  if (payload.method === "paste") {
    const sourceText = payload.careerText.trim();
    const checksum = await sha256Hex(sourceText);
    const importId = `import_${(await sha256Hex(`${user.id}:${checksum}`)).slice(0, 24)}`;
    const factId = `fact_${user.id}_career_source_text`;
    await db.batch([
      db
        .prepare(
          "INSERT INTO source_imports (id, user_id, type, original_name, checksum_sha256, content_type, byte_size, parse_state, parser_version) VALUES (?, ?, 'pasted_text', 'Pasted career history', ?, 'text/plain', ?, 'review_ready', 'manual-review-only-v1') ON CONFLICT(id) DO UPDATE SET parse_state = 'review_ready', parser_version = 'manual-review-only-v1', deleted_at = NULL, updated_at = unixepoch() * 1000 WHERE source_imports.user_id = excluded.user_id",
        )
        .bind(importId, user.id, checksum, new TextEncoder().encode(sourceText).byteLength),
      db
        .prepare(
          "INSERT INTO profile_facts (id, user_id, source_import_id, fact_type, value_json, source_span, extraction_method, extraction_policy_version, state, ownership) VALUES (?, ?, ?, 'career_source_text', ?, 'user-provided full text', 'manual_entry', ?, 'suggested', 'owned') ON CONFLICT(id) DO UPDATE SET source_import_id = excluded.source_import_id, value_json = excluded.value_json, source_span = excluded.source_span, extraction_method = excluded.extraction_method, extraction_policy_version = excluded.extraction_policy_version, state = excluded.state, ownership = excluded.ownership, invalidated_at = NULL, updated_at = unixepoch() * 1000 WHERE profile_facts.user_id = excluded.user_id",
        )
        .bind(
          factId,
          user.id,
          importId,
          json({ value: sourceText }),
          ONBOARDING_POLICY_VERSION,
        ),
      auditStatement({
        method: "paste",
        characterCount: sourceText.length,
        automaticExtraction: false,
      }),
    ]);
    return;
  }
  if (payload.method === "file") {
    const sourceText = payload.extractedText.trim();
    const extractedChecksum = await sha256Hex(sourceText);
    const importId = `import_${(await sha256Hex(`${user.id}:${extractedChecksum}`)).slice(0, 24)}`;
    const factId = `fact_${user.id}_career_source_text`;
    const importType =
      payload.contentType === "application/pdf"
        ? "pdf_extracted_text"
        : payload.contentType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ? "docx_extracted_text"
          : "text_file";
    await db.batch([
      db
        .prepare(
          "INSERT INTO source_imports (id, user_id, type, original_name, checksum_sha256, content_type, byte_size, parse_state, parser_version) VALUES (?, ?, ?, ?, ?, ?, ?, 'review_ready', ?) ON CONFLICT(id) DO UPDATE SET original_name = excluded.original_name, content_type = excluded.content_type, byte_size = excluded.byte_size, parse_state = 'review_ready', parser_version = excluded.parser_version, deleted_at = NULL, updated_at = unixepoch() * 1000 WHERE source_imports.user_id = excluded.user_id",
        )
        .bind(
          importId,
          user.id,
          importType,
          payload.originalName,
          extractedChecksum,
          payload.contentType,
          payload.byteSize,
          payload.parser,
        ),
      db
        .prepare(
          "INSERT INTO profile_facts (id, user_id, source_import_id, fact_type, value_json, source_span, extraction_method, extraction_policy_version, state, ownership) VALUES (?, ?, ?, 'career_source_text', ?, 'client-side extracted text; raw file not uploaded', 'client_side_file_extraction', ?, 'suggested', 'owned') ON CONFLICT(id) DO UPDATE SET source_import_id = excluded.source_import_id, value_json = excluded.value_json, source_span = excluded.source_span, extraction_method = excluded.extraction_method, extraction_policy_version = excluded.extraction_policy_version, state = excluded.state, ownership = excluded.ownership, invalidated_at = NULL, updated_at = unixepoch() * 1000 WHERE profile_facts.user_id = excluded.user_id",
        )
        .bind(
          factId,
          user.id,
          importId,
          json({ value: sourceText }),
          ONBOARDING_POLICY_VERSION,
        ),
      auditStatement({
        method: "file",
        contentType: payload.contentType,
        parser: payload.parser,
        byteSize: payload.byteSize,
        pageCount: payload.pageCount,
        extractedCharacterCount: sourceText.length,
        extractedTextChecksumSha256: extractedChecksum,
        clientFileChecksumSha256: payload.clientFileChecksumSha256,
        rawFileUploaded: false,
        automaticFactExtraction: false,
      }),
    ]);
    return;
  }

  if (
    !payload.role.startDate ||
    (!payload.role.isCurrent && !payload.role.endDate)
  ) {
    throw new Error(
      "Add a start date and either an end date or current-role status.",
    );
  }
  if (
    payload.role.endDate &&
    payload.role.endDate < payload.role.startDate
  ) {
    throw new Error("End date cannot be before start date.");
  }

  const roleIdentity =
    context === "onboarding"
      ? `${user.id}:onboarding-primary-role`
      : [
          user.id,
          payload.role.employer.trim().toLocaleLowerCase(),
          payload.role.title.trim().toLocaleLowerCase(),
          payload.role.startDate ?? "unknown-start",
        ].join(":");
  const roleId = `role_${(await sha256Hex(roleIdentity)).slice(0, 24)}`;
  await db.batch([
    db
      .prepare(
        "INSERT INTO experience_roles (id, user_id, employer, title, start_date, end_date, is_current, location, summary, review_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft') ON CONFLICT(id) DO UPDATE SET employer = excluded.employer, title = excluded.title, start_date = excluded.start_date, end_date = excluded.end_date, is_current = excluded.is_current, location = excluded.location, summary = excluded.summary, review_state = 'draft', updated_at = unixepoch() * 1000 WHERE experience_roles.user_id = excluded.user_id",
      )
      .bind(
        roleId,
        user.id,
        payload.role.employer,
        payload.role.title,
        payload.role.startDate,
        payload.role.endDate,
        payload.role.isCurrent ? 1 : 0,
        payload.role.location,
        payload.role.summary,
      ),
    auditStatement({
      method: "manual",
      roleCount: 1,
      automaticExtraction: false,
    }),
  ]);
}

async function confirmOnboardingProfile(
  user: UserRow,
  context: "onboarding" | "profile_update" = "onboarding",
): Promise<void> {
  const db = database();
  const role = await db
    .prepare(
      "SELECT id, employer, title, start_date, end_date, is_current, location, summary, review_state FROM experience_roles WHERE user_id = ? AND review_state <> 'removed' ORDER BY is_current DESC, coalesce(end_date, '9999-12') DESC, start_date DESC, updated_at DESC LIMIT 1",
    )
    .bind(user.id)
    .first<RawExperience>();
  if (!hasStructuredRoleDates(role)) {
    throw new Error(
      "Add and save your current or most recent role with employer, title, start date, and either an end date or current-role status before confirming.",
    );
  }
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        "UPDATE experience_roles SET review_state = 'confirmed', updated_at = unixepoch() * 1000 WHERE user_id = ? AND id = ? AND review_state IN ('draft', 'confirmed')",
      )
      .bind(user.id, role!.id),
    context === "onboarding"
      ? onboardingAuditStatement(db, user, 3, {
          userConfirmed: true,
          confirmedExperienceRoleId: role!.id,
          sourceFactsPromoted: false,
          automaticExtraction: false,
        })
      : db
          .prepare(
            "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'profile_source_confirmed', 'profile_source', ?, ?)",
          )
          .bind(
            crypto.randomUUID(),
            user.id,
            `chatgpt:${user.email}`,
            `profile-source-confirmation-${crypto.randomUUID()}`,
            json({
              policyVersion: ONBOARDING_POLICY_VERSION,
              userConfirmed: true,
              confirmedExperienceRoleId: role!.id,
              sourceFactsPromoted: false,
              automaticExtraction: false,
            }),
          ),
  ];
  if (context === "profile_update") {
    statements.push(
      db
        .prepare(
          "UPDATE job_analyses SET validation_state = 'invalidated', invalidated_at = unixepoch() * 1000 WHERE user_id = ? AND validation_state <> 'invalidated'",
        )
        .bind(user.id),
      db
        .prepare(
          "UPDATE pursuit_packages SET readiness_state = 'superseded', superseded_at = unixepoch() * 1000 WHERE user_id = ? AND readiness_state <> 'superseded'",
        )
        .bind(user.id),
      db
        .prepare(
          "UPDATE generated_assets SET review_state = 'superseded', invalidated_at = unixepoch() * 1000, updated_at = unixepoch() * 1000 WHERE user_id = ? AND generation_policy_version = 'deterministic-approved-profile-v1' AND invalidated_at IS NULL",
        )
        .bind(user.id),
      db
        .prepare(
          "UPDATE resumes SET review_state = 'superseded', updated_at = unixepoch() * 1000 WHERE user_id = ? AND json_valid(content_json) AND json_extract(content_json, '$.provenance.source') = 'approved_profile' AND review_state <> 'superseded'",
        )
        .bind(user.id),
    );
  }
  await db.batch(statements);
}

async function saveOnboardingCareerPaths(
  user: UserRow,
  paths: string[],
  primaryIndex: number,
): Promise<void> {
  const db = database();
  const statements: D1PreparedStatement[] = [
    db
      .prepare(
        "UPDATE career_paths SET state = 'paused', is_primary = 0, updated_at = unixepoch() * 1000 WHERE user_id = ?",
      )
      .bind(user.id),
  ];
  for (const [index, label] of paths.entries()) {
    const normalizedLane = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const id = `path_${(await sha256Hex(`${user.id}:${label.toLowerCase()}`)).slice(0, 24)}`;
    statements.push(
      db
        .prepare(
          "INSERT INTO career_paths (id, user_id, label, primary_lane, secondary_lanes_json, fit_score, opportunity_score, rationale_json, gaps_json, state, is_primary) VALUES (?, ?, ?, ?, '[]', NULL, NULL, ?, '[]', 'active', ?) ON CONFLICT(id) DO UPDATE SET label = excluded.label, primary_lane = excluded.primary_lane, secondary_lanes_json = '[]', fit_score = NULL, opportunity_score = NULL, rationale_json = excluded.rationale_json, gaps_json = '[]', state = 'active', is_primary = excluded.is_primary, updated_at = unixepoch() * 1000 WHERE career_paths.user_id = excluded.user_id",
        )
        .bind(
          id,
          user.id,
          label,
          normalizedLane || "user_selected",
          json({
            source: "user_selected",
            scoreState: "not_scored",
            note: "Way Ahead has not run an automated fit analysis.",
          }),
          index === primaryIndex ? 1 : 0,
        ),
    );
  }
  statements.push(
    onboardingAuditStatement(db, user, 5, {
      pathCount: paths.length,
      primaryIndex,
      automaticScoring: false,
    }),
  );
  await db.batch(statements);
}

export async function saveOnboardingStep(
  actor: FounderActor,
  payload: OnboardingStepPayload,
): Promise<OnboardingState> {
  const user = await ensureUser(actor);
  const existingState = await readOnboardingStateForUser(user);
  if (existingState.complete) {
    if (payload.step !== 2) {
      throw new Error(
        "Onboarding is complete. Use the corresponding workspace editor to make changes.",
      );
    }
    await saveOnboardingCareerInput(user, payload.data, "profile_update");
    await confirmOnboardingProfile(user, "profile_update");
    return readOnboardingStateForUser(user);
  }
  await assertOnboardingStepAvailable(user, payload.step);

  if (payload.step === 1) {
    await saveOnboardingGoal(user, payload.data);
  } else if (payload.step === 2) {
    await saveOnboardingCareerInput(user, payload.data);
  } else if (payload.step === 3) {
    await confirmOnboardingProfile(user);
  } else if (payload.step === 4) {
    await saveJobStandard(actor, payload.data);
    const db = database();
    await onboardingAuditStatement(db, user, 4, {
      jobStandardVersionCreated: true,
    }).run();
  } else if (payload.step === 5) {
    await saveOnboardingCareerPaths(user, payload.data.paths, payload.data.primaryIndex);
  } else {
    const completed = await completedOnboardingSteps(database(), user.id);
    if (![1, 2, 3, 4, 5].every((step) => completed.includes(step as OnboardingStep))) {
      throw new Error("Finish every setup step before activating your workspace.");
    }
    const db = database();
    const activationRole = await db
      .prepare(
        "SELECT id, employer, title, start_date, end_date, is_current, location, summary, review_state FROM experience_roles WHERE user_id = ? AND review_state <> 'removed' ORDER BY is_current DESC, coalesce(end_date, '9999-12') DESC, start_date DESC, updated_at DESC LIMIT 1",
      )
      .bind(user.id)
      .first<RawExperience>();
    if (!isActivationReadyExperience(activationRole)) {
      throw new Error(
        "Confirm a structured current or most recent role with dates before activating your workspace.",
      );
    }
    await db.batch([
      db
        .prepare(
          "UPDATE users SET lifecycle_state = 'alpha_active', updated_at = unixepoch() * 1000 WHERE id = ?",
        )
        .bind(user.id),
      onboardingAuditStatement(db, user, 6, {
        userConfirmed: true,
        externalActionsAuthorized: false,
      }),
    ]);
    user.lifecycle_state = "alpha_active";
  }

  return readOnboardingStateForUser(user);
}

function assertBootstrapPayload(payload: unknown): asserts payload is FounderBootstrapPayload {
  if (!payload || typeof payload !== "object") throw new Error("A structured founder import is required.");
  const candidate = payload as Partial<FounderBootstrapPayload>;
  if (!candidate.profile || !candidate.jobStandard || !Array.isArray(candidate.careerPaths)) {
    throw new Error("The founder import is missing profile, job standard, or career paths.");
  }
  if (!Array.isArray(candidate.opportunities)) {
    throw new Error("The founder import must include a verified opportunity list, even when empty.");
  }
  if (!Array.isArray(candidate.profile.facts) || candidate.profile.facts.length === 0) {
    throw new Error("The founder import must contain at least one provenance-backed profile fact.");
  }
  if (candidate.opportunities.length > 25 || candidate.careerPaths.length > 20) {
    throw new Error("The founder import exceeds the bounded production intake.");
  }
}

type BootstrapOpportunity = FounderBootstrapPayload["opportunities"][number];

async function normalizeBootstrapOpportunity(
  opportunity: BootstrapOpportunity,
): Promise<BootstrapOpportunity> {
  const analysis = {
    ...opportunity.analysis,
    integrityGates: {
      ...opportunity.analysis.integrityGates,
      jobVersionId: opportunity.version.id,
    },
  };
  if (!opportunity.pursuit) return { ...opportunity, analysis };

  const assets = await Promise.all(opportunity.pursuit.assets.map(async (asset) => {
    const contentSha256 = await sha256Hex(canonicalJson(asset.content));
    const filename = nonEmptyString(asset.content.filename) ?? nonEmptyString(asset.filename) ?? undefined;
    const pageCount = positiveInteger(asset.content.pageCount) ?? positiveInteger(asset.pageCount) ?? undefined;
    return { ...asset, contentSha256, filename, pageCount };
  }));

  if (!opportunity.pursuit.package) {
    return { ...opportunity, pursuit: { ...opportunity.pursuit, assets } };
  }

  const packageValue = opportunity.pursuit.package;
  const outboundAssets = assets.filter((asset) => asset.type === "resume" || asset.type === "cover_letter");
  const outboundTypes = new Set(outboundAssets.map((asset) => asset.type));
  const assetManifest = {
    assets: outboundAssets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      version: asset.version,
      contentSha256: asset.contentSha256,
      filename: asset.filename ?? "",
      pageCount: asset.pageCount ?? null,
      fileSha256: nonEmptyString(asset.content.fileSha256) ?? "",
      reviewState: asset.reviewState,
    })),
  };
  const exactOutboundFiles = outboundAssets.length === 2
    && outboundTypes.has("resume")
    && outboundTypes.has("cover_letter")
    && outboundTypes.size === 2
    && new Set(outboundAssets.map((asset) => asset.id)).size === 2
    && assetManifest.assets.every((asset) =>
      asset.filename
      && positiveInteger(asset.version)
      && positiveInteger(asset.pageCount)
      && isSha256Hex(asset.fileSha256)
      && isSha256Hex(asset.contentSha256)
      && asset.reviewState === "claim_safe",
    );
  const sourceQuestionSetChecksum = nonEmptyString(opportunity.version.sourceFacts.questionSetChecksum);
  const packageQuestionSetChecksum = nonEmptyString(packageValue.answers.questionSetChecksum);
  const exactFormReceipt = Boolean(
    isSha256Hex(sourceQuestionSetChecksum)
      && packageQuestionSetChecksum === sourceQuestionSetChecksum,
  );
  if (packageValue.readinessState === "ready_for_review" && (!exactOutboundFiles || !exactFormReceipt)) {
    throw new Error("A review-ready package requires a source-matched employer form receipt and one claim-safe resume and cover letter with exact file receipts.");
  }

  const packageCore = {
    destinationUrl: packageValue.destinationUrl,
    jobVersionId: opportunity.version.id,
    answers: packageValue.answers,
    assetManifest,
    blockers: packageValue.blockers,
  };
  const payloadSha256 = await sha256Hex(canonicalJson(packageCore));
  return {
    ...opportunity,
    analysis,
    pursuit: {
      ...opportunity.pursuit,
      assets,
      package: { ...packageValue, assetManifest, payloadSha256 },
    },
  };
}

export async function bootstrapFounderWorkspace(
  actor: FounderActor,
  payloadValue: unknown,
): Promise<{
  imported: true;
  mode:
    | "initial_import"
    | "empty_workspace_repair"
    | "matching_partial_workspace_repair"
    | "profile_surface_repair";
  counts: Record<string, number>;
}> {
  assertBootstrapPayload(payloadValue);
  const payload = payloadValue;
  const founder = await ensureFounder(actor);
  const db = database();
  const existingWorkspace = await db
    .prepare(
      "SELECT ((SELECT count(*) FROM profile_facts WHERE user_id = ?) + (SELECT count(*) FROM experience_roles WHERE user_id = ?) + (SELECT count(*) FROM profile_skills WHERE user_id = ?) + (SELECT count(*) FROM job_standards WHERE user_id = ?) + (SELECT count(*) FROM career_paths WHERE user_id = ?) + (SELECT count(*) FROM job_analyses WHERE user_id = ?) + (SELECT count(*) FROM pursuits WHERE user_id = ?) + (SELECT count(*) FROM audit_events WHERE user_id = ? AND event_type IN ('founder_workspace_imported', 'founder_workspace_repaired'))) AS count, (SELECT count(*) FROM profile_facts WHERE user_id = ? AND invalidated_at IS NULL) AS preserved_profile_fact_count, ((SELECT count(*) FROM experience_roles WHERE user_id = ?) + (SELECT count(*) FROM profile_skills WHERE user_id = ?) + (SELECT count(*) FROM job_standards WHERE user_id = ? AND is_current = 1) + (SELECT count(*) FROM career_paths WHERE user_id = ? AND state = 'active') + (SELECT count(*) FROM job_analyses WHERE user_id = ?) + (SELECT count(*) FROM pursuits WHERE user_id = ?)) AS active_count",
    )
    .bind(
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
      founder.id,
    )
    .first<{
      count: number;
      active_count: number;
      preserved_profile_fact_count: number;
    }>();
  const hasPriorWorkspaceState = (existingWorkspace?.count ?? 0) > 0;
  const canRepairEmptyWorkspace =
    hasPriorWorkspaceState && (existingWorkspace?.active_count ?? 0) === 0;
  const [existingAnalyses, existingPursuits] = hasPriorWorkspaceState
    ? await Promise.all([
        db
          .prepare("SELECT id FROM job_analyses WHERE user_id = ?")
          .bind(founder.id)
          .all<{ id: string }>(),
        db
          .prepare("SELECT id FROM pursuits WHERE user_id = ?")
          .bind(founder.id)
          .all<{ id: string }>(),
      ])
    : [{ results: [] }, { results: [] }];
  const payloadAnalysisIds = new Set(
    payload.opportunities.map((opportunity) => opportunity.analysis.id),
  );
  const payloadPursuitIds = new Set(
    payload.opportunities.flatMap((opportunity) =>
      opportunity.pursuit ? [opportunity.pursuit.id] : [],
    ),
  );
  const existingMatchingRecordCount =
    existingAnalyses.results.length + existingPursuits.results.length;
  const canRepairMatchingPartialWorkspace =
    hasPriorWorkspaceState &&
    existingMatchingRecordCount > 0 &&
    (existingWorkspace?.active_count ?? 0) === existingMatchingRecordCount &&
    existingAnalyses.results.every((row) => payloadAnalysisIds.has(row.id)) &&
    existingPursuits.results.every((row) => payloadPursuitIds.has(row.id));
  const canRepairProfileSurfacesOnly =
    hasPriorWorkspaceState &&
    existingMatchingRecordCount > 0 &&
    (existingWorkspace?.active_count ?? 0) === existingMatchingRecordCount;
  const repairMode = canRepairEmptyWorkspace
    ? "empty_workspace_repair"
    : canRepairMatchingPartialWorkspace
      ? "matching_partial_workspace_repair"
      : canRepairProfileSurfacesOnly
        ? "profile_surface_repair"
      : null;
  if (hasPriorWorkspaceState && !repairMode) {
    throw new Error("The founder workspace is already initialized. Use versioned product workflows for corrections.");
  }
  const opportunitiesForImport =
    repairMode === "profile_surface_repair" ? [] : payload.opportunities;
  const normalizedOpportunities = await Promise.all(
    opportunitiesForImport.map(normalizeBootstrapOpportunity),
  );
  const jobStandardId = `standard_${founder.id}_v1`;
  const statements: D1PreparedStatement[] = [
    db
      .prepare("UPDATE users SET display_name = ?, lifecycle_state = 'founder_production', updated_at = unixepoch() * 1000 WHERE id = ?")
      .bind(payload.profile.displayName, founder.id),
    db
      .prepare("UPDATE job_standards SET is_current = 0 WHERE user_id = ?")
      .bind(founder.id),
    db
      .prepare(
        "INSERT INTO job_standards (id, user_id, version, is_current, pay_basis, minimum_pay_cents, target_pay_cents, currency, work_arrangements_json, commute_miles, locations_json, travel_maximum_percent, schedule_requirements, benefits_json, growth_priorities_json, exclusions_json) VALUES (?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET is_current = 1, pay_basis = excluded.pay_basis, minimum_pay_cents = excluded.minimum_pay_cents, target_pay_cents = excluded.target_pay_cents, currency = excluded.currency, work_arrangements_json = excluded.work_arrangements_json, commute_miles = excluded.commute_miles, locations_json = excluded.locations_json, travel_maximum_percent = excluded.travel_maximum_percent, schedule_requirements = excluded.schedule_requirements, benefits_json = excluded.benefits_json, growth_priorities_json = excluded.growth_priorities_json, exclusions_json = excluded.exclusions_json WHERE job_standards.user_id = excluded.user_id",
      )
      .bind(
        jobStandardId,
        founder.id,
        payload.jobStandard.payBasis,
        payload.jobStandard.minimumPayCents,
        payload.jobStandard.targetPayCents,
        payload.jobStandard.currency,
        json(payload.jobStandard.workArrangements),
        payload.jobStandard.commuteMiles,
        json(payload.jobStandard.locations),
        payload.jobStandard.travelMaximumPercent,
        payload.jobStandard.scheduleRequirements,
        json(payload.jobStandard.benefits),
        json(payload.jobStandard.growthPriorities),
        json(payload.jobStandard.exclusions),
      ),
  ];

  for (const fact of payload.profile.facts) {
    statements.push(
      db
        .prepare(
          "INSERT INTO profile_facts (id, user_id, fact_type, value_json, source_span, extraction_method, extraction_policy_version, state, confidence, ownership) VALUES (?, ?, ?, ?, ?, 'manual_entry', 'founder-import-v1', ?, ?, ?) ON CONFLICT(id) DO UPDATE SET value_json = excluded.value_json, source_span = excluded.source_span, state = excluded.state, confidence = excluded.confidence, ownership = excluded.ownership, invalidated_at = NULL, updated_at = unixepoch() * 1000 WHERE profile_facts.user_id = excluded.user_id",
        )
        .bind(
          fact.id,
          founder.id,
          fact.factType,
          json(fact.value),
          fact.sourceSpan ?? null,
          fact.state,
          fact.confidence ?? null,
          fact.ownership ?? "unknown",
        ),
    );
  }

  for (const role of payload.profile.experiences) {
    statements.push(
      db
        .prepare(
          "INSERT INTO experience_roles (id, user_id, employer, title, start_date, end_date, is_current, location, summary, review_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET employer = excluded.employer, title = excluded.title, start_date = excluded.start_date, end_date = excluded.end_date, is_current = excluded.is_current, location = excluded.location, summary = excluded.summary, review_state = excluded.review_state, updated_at = unixepoch() * 1000 WHERE experience_roles.user_id = excluded.user_id",
        )
        .bind(
          role.id,
          founder.id,
          role.employer,
          role.title,
          role.startDate ?? null,
          role.endDate ?? null,
          role.isCurrent ? 1 : 0,
          role.location ?? null,
          role.summary ?? null,
          role.reviewState,
        ),
    );
  }

  for (const skill of payload.profile.skills) {
    statements.push(
      db
        .prepare(
          "INSERT INTO skills (id, canonical_name, category) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET canonical_name = excluded.canonical_name, category = excluded.category",
        )
        .bind(skill.id, skill.name, skill.category),
      db
        .prepare(
          "INSERT INTO profile_skills (user_id, skill_id, level, review_state) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, skill_id) DO UPDATE SET level = excluded.level, review_state = excluded.review_state",
        )
        .bind(founder.id, skill.id, skill.level ?? null, skill.reviewState),
    );
  }

  statements.push(
    db.prepare("UPDATE career_paths SET is_primary = 0 WHERE user_id = ?").bind(founder.id),
  );
  for (const path of payload.careerPaths) {
    statements.push(
      db
        .prepare(
          "INSERT INTO career_paths (id, user_id, label, primary_lane, secondary_lanes_json, fit_score, opportunity_score, rationale_json, gaps_json, state, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label = excluded.label, primary_lane = excluded.primary_lane, secondary_lanes_json = excluded.secondary_lanes_json, fit_score = excluded.fit_score, opportunity_score = excluded.opportunity_score, rationale_json = excluded.rationale_json, gaps_json = excluded.gaps_json, state = excluded.state, is_primary = excluded.is_primary, updated_at = unixepoch() * 1000 WHERE career_paths.user_id = excluded.user_id",
        )
        .bind(
          path.id,
          founder.id,
          path.label,
          path.primaryLane,
          json(path.secondaryLanes),
          path.fitScore,
          path.opportunityScore,
          json(path.rationale),
          json(path.gaps),
          path.state,
          path.isPrimary ? 1 : 0,
        ),
    );
  }

  for (const opportunity of normalizedOpportunities) {
    const { source, posting, version, analysis, pursuit } = opportunity;
    const userJobLinkId = `joblink_${(
      await sha256Hex(`${founder.id}:${posting.id}`)
    ).slice(0, 24)}`;
    statements.push(
      db
        .prepare(
          "INSERT INTO job_sources (id, name, kind, rights_state, terms_version) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, kind = excluded.kind, rights_state = excluded.rights_state, terms_version = excluded.terms_version",
        )
        .bind(source.id, source.name, source.kind, source.rightsState, source.termsVersion ?? null),
      db
        .prepare(
          "INSERT INTO job_postings (id, source_id, external_id, canonical_url, employer, title, mandate, locations_json, compensation_json, description_checksum, first_seen_at, last_checked_at, posted_at, freshness_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET canonical_url = excluded.canonical_url, employer = excluded.employer, title = excluded.title, mandate = excluded.mandate, locations_json = excluded.locations_json, compensation_json = excluded.compensation_json, description_checksum = excluded.description_checksum, last_checked_at = excluded.last_checked_at, posted_at = excluded.posted_at, freshness_state = excluded.freshness_state",
        )
        .bind(
          posting.id,
          source.id,
          posting.externalId,
          posting.canonicalUrl,
          posting.employer,
          posting.title,
          posting.mandate ?? null,
          json(posting.locations),
          json(posting.compensation),
          posting.descriptionChecksum,
          posting.firstSeenAt,
          posting.lastCheckedAt,
          posting.postedAt ?? null,
          posting.freshnessState,
        ),
      db
        .prepare(
          "INSERT INTO job_posting_versions (id, job_posting_id, source_checked_at, source_url, description_checksum, source_facts_json, source_conflicts_json, capture_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
        )
        .bind(
          version.id,
          posting.id,
          version.sourceCheckedAt,
          version.sourceUrl,
          version.descriptionChecksum,
          json(version.sourceFacts),
          json(version.sourceConflicts),
          version.captureState,
        ),
      db
        .prepare(
          "INSERT INTO user_job_links (id, user_id, job_posting_id, source, state) VALUES (?, ?, ?, 'import', 'active') ON CONFLICT(user_id, job_posting_id) DO UPDATE SET state = 'active', updated_at = unixepoch() * 1000",
        )
        .bind(userJobLinkId, founder.id, posting.id),
      db
        .prepare(
          "INSERT INTO job_analyses (id, user_id, job_posting_id, career_path_id, job_standard_id, policy_version, evidence_version, integrity_gates_json, move_value_score, pursuit_readiness_score, fit_json, unknowns_json, recommendation, validation_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET career_path_id = excluded.career_path_id, job_standard_id = excluded.job_standard_id, policy_version = excluded.policy_version, evidence_version = excluded.evidence_version, integrity_gates_json = excluded.integrity_gates_json, move_value_score = excluded.move_value_score, pursuit_readiness_score = excluded.pursuit_readiness_score, fit_json = excluded.fit_json, unknowns_json = excluded.unknowns_json, recommendation = excluded.recommendation, validation_state = excluded.validation_state WHERE job_analyses.user_id = excluded.user_id",
        )
        .bind(
          analysis.id,
          founder.id,
          posting.id,
          analysis.careerPathId ?? null,
          jobStandardId,
          analysis.policyVersion,
          analysis.evidenceVersion,
          json(analysis.integrityGates),
          analysis.moveValueScore ?? null,
          analysis.pursuitReadinessScore ?? null,
          json(analysis.fit),
          json(analysis.unknowns),
          analysis.recommendation,
          analysis.validationState,
        ),
    );

    if (!pursuit) continue;
    statements.push(
      db
        .prepare(
          "INSERT INTO pursuits (id, user_id, job_posting_id, current_analysis_id, state, next_action, external_approval_state) VALUES (?, ?, ?, ?, ?, ?, 'not_requested') ON CONFLICT(id) DO UPDATE SET current_analysis_id = excluded.current_analysis_id, state = excluded.state, next_action = excluded.next_action, external_approval_state = CASE WHEN pursuits.external_approval_state = 'completed' THEN 'completed' ELSE pursuits.external_approval_state END, updated_at = unixepoch() * 1000 WHERE pursuits.user_id = excluded.user_id",
        )
        .bind(pursuit.id, founder.id, posting.id, analysis.id, pursuit.state, pursuit.nextAction),
    );
    for (const asset of pursuit.assets) {
      statements.push(
        db
          .prepare(
            "INSERT INTO generated_assets (id, user_id, pursuit_id, type, source_versions_json, generation_policy_version, version, content_json, content_sha256, filename, page_count, review_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
          )
          .bind(
            asset.id,
            founder.id,
            pursuit.id,
            asset.type,
            json(asset.sourceVersions),
            asset.generationPolicyVersion,
            asset.version,
            json(asset.content),
            asset.contentSha256,
            asset.filename ?? null,
            asset.pageCount ?? null,
            asset.reviewState,
          ),
      );
    }
    if (pursuit.package) {
      const packageValue = pursuit.package;
      statements.push(
        db
          .prepare(
            "INSERT INTO pursuit_packages (id, user_id, pursuit_id, version, destination_url, job_posting_version_id, answers_json, asset_manifest_json, blockers_json, payload_sha256, readiness_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
          )
          .bind(
            packageValue.id,
            founder.id,
            pursuit.id,
            packageValue.version,
            packageValue.destinationUrl,
            version.id,
            json(packageValue.answers),
            json(packageValue.assetManifest),
            json(packageValue.blockers),
            packageValue.payloadSha256,
            packageValue.readinessState,
          ),
      );
    }
  }

  statements.push(
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, 'workspace', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        founder.id,
        `chatgpt:${founder.email}`,
        repairMode
          ? "founder_workspace_repaired"
          : "founder_workspace_imported",
        founder.id,
        json({
          mode: repairMode ?? "initial_import",
          preservedProfileFacts: repairMode
            ? existingWorkspace?.preserved_profile_fact_count ?? 0
            : 0,
          matchedExistingAnalyses: repairMode
            ? existingAnalyses.results.length
            : 0,
          matchedExistingPursuits: repairMode
            ? existingPursuits.results.length
            : 0,
          profileFacts: payload.profile.facts.length,
          careerPaths: payload.careerPaths.length,
          opportunities: opportunitiesForImport.length,
        }),
      ),
  );
  await db.batch(statements);

  return {
    imported: true,
    mode: repairMode ?? "initial_import",
    counts: {
      profileFacts: payload.profile.facts.length,
      experiences: payload.profile.experiences.length,
      skills: payload.profile.skills.length,
      careerPaths: payload.careerPaths.length,
      opportunities: opportunitiesForImport.length,
    },
  };
}

export async function saveJobStandard(
  actor: FounderActor,
  input: Omit<JobStandardRecord, "id" | "version">,
): Promise<void> {
  const founder = await ensureUser(actor);
  const db = database();
  const maxRow = await db
    .prepare("SELECT coalesce(max(version), 0) AS version FROM job_standards WHERE user_id = ?")
    .bind(founder.id)
    .first<{ version: number }>();
  const version = (maxRow?.version ?? 0) + 1;
  const id = `standard_${founder.id}_v${version}`;
  await db.batch([
    db.prepare("UPDATE job_standards SET is_current = 0 WHERE user_id = ?").bind(founder.id),
    db
      .prepare(
        "INSERT INTO job_standards (id, user_id, version, is_current, pay_basis, minimum_pay_cents, target_pay_cents, currency, work_arrangements_json, commute_miles, locations_json, travel_maximum_percent, schedule_requirements, benefits_json, growth_priorities_json, exclusions_json) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        id,
        founder.id,
        version,
        input.payBasis,
        input.minimumPayCents,
        input.targetPayCents,
        input.currency,
        json(input.workArrangements),
        input.commuteMiles,
        json(input.locations),
        input.travelMaximumPercent,
        input.scheduleRequirements,
        json(input.benefits),
        json(input.growthPriorities),
        json(input.exclusions),
      ),
    db
      .prepare(
        "UPDATE job_analyses SET validation_state = 'invalidated', invalidated_at = unixepoch() * 1000 WHERE user_id = ? AND validation_state <> 'invalidated'",
      )
      .bind(founder.id),
    db
      .prepare(
        "UPDATE pursuit_packages SET readiness_state = 'superseded', superseded_at = unixepoch() * 1000 WHERE user_id = ? AND readiness_state <> 'superseded'",
      )
      .bind(founder.id),
  ]);
}

export async function setPrimaryCareerPath(actor: FounderActor, pathId: string): Promise<void> {
  const founder = await ensureUser(actor);
  const db = database();
  const owned = await db
    .prepare("SELECT id FROM career_paths WHERE id = ? AND user_id = ? LIMIT 1")
    .bind(pathId, founder.id)
    .first<{ id: string }>();
  if (!owned) throw new Error("That Job Path is not available in this workspace.");
  await db.batch([
    db.prepare("UPDATE career_paths SET is_primary = 0 WHERE user_id = ?").bind(founder.id),
    db
      .prepare("UPDATE career_paths SET state = 'active', is_primary = 1, updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ?")
      .bind(pathId, founder.id),
  ]);
}

export async function createPursuit(actor: FounderActor, jobPostingId: string): Promise<string> {
  const founder = await ensureUser(actor);
  const db = database();
  const job = await db
    .prepare(
      "SELECT jp.id, (SELECT jpv.id FROM job_posting_versions jpv WHERE jpv.job_posting_id = jp.id AND jpv.description_checksum = jp.description_checksum LIMIT 1) AS latest_version_id FROM job_postings jp WHERE jp.id = ? AND jp.removed_at IS NULL AND EXISTS (SELECT 1 FROM user_job_links ujl WHERE ujl.user_id = ? AND ujl.job_posting_id = jp.id AND ujl.state = 'active') LIMIT 1",
    )
    .bind(jobPostingId, founder.id)
    .first<{ id: string; latest_version_id: string | null }>();
  if (!job) throw new Error("That job is no longer available.");
  const analysis = await db
    .prepare(
      "SELECT id, integrity_gates_json, validation_state FROM job_analyses WHERE user_id = ? AND job_posting_id = ? AND invalidated_at IS NULL ORDER BY created_at DESC LIMIT 1",
    )
    .bind(founder.id, jobPostingId)
    .first<{
      id: string;
      integrity_gates_json: string;
      validation_state: "pending" | "trusted" | "blocked" | "invalidated";
    }>();
  const analysisGates = parseJson<{
    deterministic?: unknown;
    jobVersionId?: unknown;
    policyVersion?: unknown;
  }>(
    analysis?.integrity_gates_json,
    {},
  );
  const boundVersionId = analysisGates.jobVersionId;
  const deterministicPolicyIsCurrent =
    analysisGates.deterministic !== true ||
    analysisGates.policyVersion === CURRENT_DETERMINISTIC_ASSESSMENT_POLICY;
  if (
    !analysis ||
    analysis.validation_state !== "trusted" ||
    !job.latest_version_id ||
    boundVersionId !== job.latest_version_id ||
    !deterministicPolicyIsCurrent
  ) {
    throw new Error(
      "Assess this exact employer-source version before starting a pursuit.",
    );
  }
  const existing = await db
    .prepare("SELECT id, current_analysis_id FROM pursuits WHERE user_id = ? AND job_posting_id = ? LIMIT 1")
    .bind(founder.id, jobPostingId)
    .first<{ id: string; current_analysis_id: string | null }>();
  const linkId = `joblink_${(
    await sha256Hex(`${founder.id}:${jobPostingId}`)
  ).slice(0, 24)}`;
  if (existing) {
    await db.batch([
      db
        .prepare(
          "INSERT INTO user_job_links (id, user_id, job_posting_id, source, state) VALUES (?, ?, ?, 'user_added', 'active') ON CONFLICT(user_id, job_posting_id) DO UPDATE SET state = 'active', updated_at = unixepoch() * 1000",
        )
        .bind(linkId, founder.id, jobPostingId),
      ...(existing.current_analysis_id === analysis.id
        ? []
        : [
            db
              .prepare(
                "UPDATE pursuits SET current_analysis_id = ?, next_action = 'The current trusted analysis is selected. Build fresh job-specific assets before package review.', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ?",
              )
              .bind(analysis.id, existing.id, founder.id),
          ]),
    ]);
    return existing.id;
  }
  const id = `pursuit_${crypto.randomUUID()}`;
  await db.batch([
    db
      .prepare(
        "INSERT INTO user_job_links (id, user_id, job_posting_id, source, state) VALUES (?, ?, ?, 'user_added', 'active') ON CONFLICT(user_id, job_posting_id) DO UPDATE SET state = 'active', updated_at = unixepoch() * 1000",
      )
      .bind(linkId, founder.id, jobPostingId),
    db
      .prepare(
        "INSERT INTO pursuits (id, user_id, job_posting_id, current_analysis_id, state, next_action, external_approval_state) VALUES (?, ?, ?, ?, 'researching', 'Complete evidence review before generating application assets.', 'not_requested')",
      )
      .bind(id, founder.id, jobPostingId, analysis.id),
  ]);
  return id;
}

function boundedApplicationAnswerValue(value: unknown, key: string): unknown {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim();
    if (normalized.length > 12_000) {
      throw new Error(`${key} is too long for an employer-form answer.`);
    }
    return normalized;
  }
  if (Array.isArray(value)) {
    if (value.length > 100) throw new Error(`${key} has too many selected values.`);
    return value.map((entry) => {
      if (
        typeof entry !== "string" &&
        typeof entry !== "number" &&
        typeof entry !== "boolean"
      ) {
        throw new Error(`${key} contains an unsupported answer value.`);
      }
      return boundedApplicationAnswerValue(entry, key);
    });
  }
  if (value === null) return null;
  throw new Error(`${key} contains an unsupported employer-form answer.`);
}

function normalizeApplicationAnswers(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Review the exact employer-form answers before building a package.");
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 150) {
    throw new Error("The employer form exceeds this alpha's bounded answer set.");
  }
  return Object.fromEntries(
    entries.map(([key, answer]) => {
      const normalizedKey = key.trim();
      if (!normalizedKey || normalizedKey.length > 160) {
        throw new Error("An employer-form answer has an invalid field name.");
      }
      return [normalizedKey, boundedApplicationAnswerValue(answer, normalizedKey)];
    }),
  );
}

function safeApplicationDestination(sourceFacts: JsonRecord, canonicalUrl: string): string {
  const candidate =
    nonEmptyString(sourceFacts.applyUrl) ??
    nonEmptyString(sourceFacts.canonicalUrl) ??
    canonicalUrl;
  let destination: URL;
  try {
    destination = new URL(candidate);
  } catch {
    throw new Error("The employer application destination is not reviewable.");
  }
  if (destination.protocol !== "https:") {
    throw new Error("The employer application destination must use HTTPS.");
  }
  return destination.toString();
}

type ReviewableOutboundAsset = {
  id: string;
  type: "resume" | "cover_letter";
  version: number;
  filename: string;
  content_sha256: string;
  page_count: number;
  content_json: string;
  source_versions_json: string;
};

function outboundManifestEntry(asset: ReviewableOutboundAsset): JsonRecord {
  const content = parseJson<JsonRecord>(asset.content_json, {});
  return {
    id: asset.id,
    type: asset.type,
    version: asset.version,
    filename: asset.filename,
    pageCount: asset.page_count,
    reviewState: "claim_safe",
    contentSha256: asset.content_sha256,
    fileSha256: nonEmptyString(content.fileSha256) ?? "",
  };
}

export async function markPursuitAssetClaimSafe(
  actor: FounderActor,
  assetId: string,
  confirmation: string,
): Promise<{ assetId: string; reviewState: "claim_safe" }> {
  if (confirmation !== "confirm_claim_safe_file") {
    throw new Error("Confirm that you reviewed this exact rendered file before marking it claim-safe.");
  }
  const user = await ensureUser(actor);
  const db = database();
  const asset = await db
    .prepare(
      "SELECT ga.id, ga.pursuit_id, ga.type, ga.version, ga.filename, ga.page_count, ga.content_sha256, ga.content_json, ga.source_versions_json, ga.generation_policy_version, ga.review_state, ga.invalidated_at, p.job_posting_id, p.current_analysis_id, (SELECT current_version.id FROM job_posting_versions current_version JOIN job_postings current_posting ON current_posting.id = current_version.job_posting_id AND current_posting.description_checksum = current_version.description_checksum WHERE current_version.job_posting_id = p.job_posting_id LIMIT 1) AS latest_job_posting_version_id, (SELECT current_version.description_checksum FROM job_posting_versions current_version JOIN job_postings current_posting ON current_posting.id = current_version.job_posting_id AND current_posting.description_checksum = current_version.description_checksum WHERE current_version.job_posting_id = p.job_posting_id LIMIT 1) AS latest_job_description_checksum, (SELECT ja.integrity_gates_json FROM job_analyses ja WHERE ja.id = p.current_analysis_id AND ja.user_id = p.user_id AND ja.validation_state = 'trusted' LIMIT 1) AS current_analysis_gates_json FROM generated_assets ga JOIN pursuits p ON p.id = ga.pursuit_id AND p.user_id = ga.user_id WHERE ga.id = ? AND ga.user_id = ? AND ga.type IN ('resume','cover_letter') LIMIT 1",
    )
    .bind(assetId, user.id)
    .first<{
      id: string;
      pursuit_id: string;
      type: "resume" | "cover_letter";
      version: number;
      filename: string | null;
      page_count: number | null;
      content_sha256: string | null;
      content_json: string | null;
      source_versions_json: string;
      generation_policy_version: string;
      review_state: "draft" | "claim_safe" | "approved" | "superseded";
      invalidated_at: number | null;
      job_posting_id: string;
      current_analysis_id: string | null;
      latest_job_posting_version_id: string | null;
      latest_job_description_checksum: string | null;
      current_analysis_gates_json: string | null;
  }>();
  if (!asset) throw new Error("That application file is not available.");
  const alreadyClaimSafe = asset.review_state === "claim_safe";
  if (
    (!alreadyClaimSafe && asset.review_state !== "draft") ||
    asset.invalidated_at !== null ||
    asset.generation_policy_version !== "client-render-receipt-v1"
  ) {
    throw new Error("Review the current rendered application file instead.");
  }
  if (
    !asset.filename?.toLowerCase().endsWith(".pdf") ||
    !positiveInteger(asset.page_count) ||
    !isSha256Hex(asset.content_sha256)
  ) {
    throw new Error("A claim-safe application file requires a current PDF, page count, and exact fingerprint.");
  }
  const content = parseJson<JsonRecord>(asset.content_json, {});
  const sourceVersions = parseJson<JsonRecord>(asset.source_versions_json, {});
  const analysisGates = parseJson<JsonRecord>(
    asset.current_analysis_gates_json,
    {},
  );
  if (
    !isSha256Hex(content.fileSha256) ||
    !isSha256Hex(content.semanticContentSha256) ||
    sourceVersions.jobPostingVersionId !== asset.latest_job_posting_version_id ||
    sourceVersions.analysisId !== asset.current_analysis_id ||
    analysisGates.jobVersionId !== asset.latest_job_posting_version_id ||
    analysisGates.jobDescriptionChecksum !==
      asset.latest_job_description_checksum
  ) {
    throw new Error("The rendered file is not bound to the current employer source and analysis.");
  }

  let semanticReviewStatement: D1PreparedStatement;
  if (asset.type === "resume") {
    const semanticResumeId = nonEmptyString(sourceVersions.semanticResumeId);
    const semanticResume = semanticResumeId
      ? await db
          .prepare(
            "SELECT id, content_json, review_state FROM resumes WHERE id = ? AND user_id = ? LIMIT 1",
          )
          .bind(semanticResumeId, user.id)
          .first<{ id: string; content_json: string; review_state: string }>()
      : null;
    if (
      !semanticResume ||
      semanticResume.review_state === "superseded" ||
      (await sha256Hex(canonicalJson(parseJson(semanticResume.content_json, {})))) !==
        content.semanticContentSha256
    ) {
      throw new Error("The rendered resume no longer matches the current saved resume.");
    }
    semanticReviewStatement = db
      .prepare(
        "UPDATE resumes SET review_state = 'approved', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ?",
      )
      .bind(semanticResume.id, user.id);
  } else {
    const semanticLetterId = nonEmptyString(sourceVersions.semanticCoverLetterId);
    const semanticLetter = semanticLetterId
      ? await db
          .prepare(
            "SELECT id, content_sha256, review_state, generation_policy_version FROM generated_assets WHERE id = ? AND user_id = ? AND pursuit_id = ? AND type = 'cover_letter' LIMIT 1",
          )
          .bind(semanticLetterId, user.id, asset.pursuit_id)
          .first<{
            id: string;
            content_sha256: string | null;
            review_state: string;
            generation_policy_version: string;
          }>()
      : null;
    if (
      !semanticLetter ||
      semanticLetter.review_state === "superseded" ||
      semanticLetter.generation_policy_version === "client-render-receipt-v1" ||
      semanticLetter.content_sha256 !== content.semanticContentSha256
    ) {
      throw new Error("The rendered cover letter no longer matches the current saved letter.");
    }
    semanticReviewStatement = db
      .prepare(
        "UPDATE generated_assets SET review_state = 'claim_safe', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ?",
      )
      .bind(semanticLetter.id, user.id);
  }
  if (alreadyClaimSafe) {
    return { assetId: asset.id, reviewState: "claim_safe" };
  }

  await db.batch([
    db
      .prepare(
        "UPDATE generated_assets SET review_state = 'claim_safe', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ? AND review_state = 'draft' AND invalidated_at IS NULL",
      )
      .bind(asset.id, user.id),
    semanticReviewStatement,
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'application_file_claim_safe_confirmed', 'generated_asset', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        asset.id,
        canonicalJson({
          pursuitId: asset.pursuit_id,
          type: asset.type,
          version: asset.version,
          filename: asset.filename,
          pageCount: asset.page_count,
          contentSha256: asset.content_sha256,
          fileSha256: content.fileSha256,
          userReviewedExactFile: true,
          externalActionAuthorized: false,
        }),
      ),
  ]);
  return { assetId: asset.id, reviewState: "claim_safe" };
}

export async function buildApplicationPackage(
  actor: FounderActor,
  input: {
    pursuitId: string;
    answers: unknown;
    includeCoverLetter: boolean;
  },
): Promise<{
  packageId: string;
  payloadSha256: string;
  readinessState: "blocked" | "ready_for_review";
  blockers: string[];
}> {
  const user = await ensureUser(actor);
  const db = database();
  const pursuitId = input.pursuitId.trim();
  const context = await db
    .prepare(
      "SELECT p.id, p.revision, p.current_analysis_id, jp.id AS job_posting_id, jp.canonical_url, jpv.id AS job_posting_version_id, jpv.source_checked_at, jpv.description_checksum, jpv.source_facts_json, jpv.source_conflicts_json, jpv.capture_state, ja.validation_state, ja.integrity_gates_json, (SELECT audit.id FROM audit_events audit WHERE audit.user_id = p.user_id AND audit.entity_type = 'job_posting' AND audit.entity_id = jp.id AND audit.event_type IN ('greenhouse_job_ingested','lever_job_ingested','ashby_job_ingested') AND json_valid(audit.metadata_json) AND json_extract(audit.metadata_json, '$.descriptionChecksum') = jpv.description_checksum ORDER BY audit.created_at DESC, audit.id DESC LIMIT 1) AS source_recheck_audit_id, (SELECT audit.created_at FROM audit_events audit WHERE audit.user_id = p.user_id AND audit.entity_type = 'job_posting' AND audit.entity_id = jp.id AND audit.event_type IN ('greenhouse_job_ingested','lever_job_ingested','ashby_job_ingested') AND json_valid(audit.metadata_json) AND json_extract(audit.metadata_json, '$.descriptionChecksum') = jpv.description_checksum ORDER BY audit.created_at DESC, audit.id DESC LIMIT 1) AS source_recheck_verified_at FROM pursuits p JOIN job_postings jp ON jp.id = p.job_posting_id LEFT JOIN job_posting_versions jpv ON jpv.job_posting_id = jp.id AND jpv.description_checksum = jp.description_checksum LEFT JOIN job_analyses ja ON ja.id = p.current_analysis_id AND ja.user_id = p.user_id WHERE p.id = ? AND p.user_id = ? AND p.state NOT IN ('applied','interviewing','offered','accepted','closed') AND jp.removed_at IS NULL LIMIT 1",
    )
    .bind(pursuitId, user.id)
    .first<{
      id: string;
      revision: number;
      current_analysis_id: string | null;
      job_posting_id: string;
      canonical_url: string;
      job_posting_version_id: string | null;
      source_checked_at: number | null;
      description_checksum: string | null;
      source_facts_json: string | null;
      source_conflicts_json: string | null;
      capture_state: "verified" | "partial" | "conflict" | "unavailable" | null;
      validation_state: "pending" | "trusted" | "blocked" | "invalidated" | null;
      integrity_gates_json: string | null;
      source_recheck_audit_id: string | null;
      source_recheck_verified_at: number | null;
    }>();
  if (!context) throw new Error("That active pursuit is not available.");

  const sourceFacts = parseJson<JsonRecord>(context.source_facts_json, {});
  const sourceConflicts = parseJson<string[]>(context.source_conflicts_json, []);
  const analysisGates = parseJson<JsonRecord>(
    context.integrity_gates_json,
    {},
  );
  const analysisIsCurrent =
    Boolean(context.current_analysis_id) &&
    analysisGates.jobVersionId === context.job_posting_version_id &&
    analysisGates.jobDescriptionChecksum === context.description_checksum;
  const packageBuiltAt = Date.now();
  const sourceRecheckIsCurrent =
    Boolean(context.source_recheck_audit_id) &&
    positiveInteger(context.source_recheck_verified_at) &&
    context.source_recheck_verified_at! >= packageBuiltAt - 24 * 60 * 60 * 1000 &&
    context.source_recheck_verified_at! <= packageBuiltAt + 5 * 60 * 1000;
  const sourceChecksum = sourceFacts.questionSetChecksum;
  const normalizedAnswers = normalizeApplicationAnswers(input.answers);
  const answerKeys = new Set(
    applicationQuestionFields(sourceFacts)
      .filter((field) => !field.isFileUpload && !field.unsupportedReason)
      .map((field) => field.key),
  );
  const unsupportedAnswerKeys = Object.keys(normalizedAnswers).filter(
    (key) => key !== "questionSetChecksum" && !answerKeys.has(key),
  );
  if (unsupportedAnswerKeys.length) {
    throw new Error(
      "The employer form changed. Refresh before reviewing its exact answers.",
    );
  }
  const answers = Object.fromEntries(
    Object.entries(normalizedAnswers).filter(([key]) => answerKeys.has(key)),
  );
  if (isQuestionSetChecksum(sourceChecksum)) {
    answers.questionSetChecksum = sourceChecksum.toLowerCase();
  }

  const assetRows = await db
    .prepare(
      "SELECT candidate.id, candidate.type, candidate.version, candidate.filename, candidate.content_sha256, candidate.page_count, candidate.content_json, candidate.source_versions_json FROM generated_assets candidate WHERE candidate.user_id = ? AND candidate.pursuit_id = ? AND candidate.type IN ('resume','cover_letter') AND candidate.generation_policy_version = 'client-render-receipt-v1' AND candidate.review_state = 'claim_safe' AND candidate.invalidated_at IS NULL AND json_valid(candidate.source_versions_json) AND json_extract(candidate.source_versions_json, '$.jobPostingVersionId') = ? AND json_extract(candidate.source_versions_json, '$.analysisId') = ? AND NOT EXISTS (SELECT 1 FROM generated_assets newer WHERE newer.user_id = candidate.user_id AND newer.pursuit_id = candidate.pursuit_id AND newer.type = candidate.type AND newer.version > candidate.version AND newer.invalidated_at IS NULL) ORDER BY candidate.type, candidate.version DESC, candidate.updated_at DESC",
    )
    .bind(
      user.id,
      pursuitId,
      context.job_posting_version_id,
      context.current_analysis_id,
    )
    .all<ReviewableOutboundAsset>();
  const semanticCurrentAssets = (
    await Promise.all(
      assetRows.results.map(async (asset) => {
        const sourceVersions = parseJson<JsonRecord>(
          asset.source_versions_json,
          {},
        );
        const content = parseJson<JsonRecord>(asset.content_json, {});
        if (asset.type === "resume") {
          const semanticResumeId = nonEmptyString(
            sourceVersions.semanticResumeId,
          );
          const semanticResume = semanticResumeId
            ? await db
                .prepare(
                  "SELECT content_json, review_state FROM resumes WHERE id = ? AND user_id = ? LIMIT 1",
                )
                .bind(semanticResumeId, user.id)
                .first<{ content_json: string; review_state: string }>()
            : null;
          return semanticResume &&
            semanticResume.review_state !== "superseded" &&
            isSha256Hex(content.semanticContentSha256) &&
            (await sha256Hex(
              canonicalJson(parseJson(semanticResume.content_json, {})),
            )) === content.semanticContentSha256
            ? asset
            : null;
        }
        const semanticLetterId = nonEmptyString(
          sourceVersions.semanticCoverLetterId,
        );
        const semanticLetter = semanticLetterId
          ? await db
              .prepare(
                "SELECT content_sha256, review_state, generation_policy_version FROM generated_assets WHERE id = ? AND user_id = ? AND pursuit_id = ? AND type = 'cover_letter' LIMIT 1",
              )
              .bind(semanticLetterId, user.id, pursuitId)
              .first<{
                content_sha256: string | null;
                review_state: string;
                generation_policy_version: string;
              }>()
          : null;
        return semanticLetter &&
          semanticLetter.review_state !== "superseded" &&
          semanticLetter.generation_policy_version !==
            "client-render-receipt-v1" &&
          semanticLetter.content_sha256 === content.semanticContentSha256
          ? asset
          : null;
      }),
    )
  ).filter((asset): asset is ReviewableOutboundAsset => Boolean(asset));
  const resume =
    semanticCurrentAssets.find((asset) => asset.type === "resume") ?? null;
  const coverLetter =
    semanticCurrentAssets.find((asset) => asset.type === "cover_letter") ??
    null;
  const acceptsResume = sourceAcceptsAsset(sourceFacts, "resume");
  const acceptsCoverLetter = sourceAcceptsAsset(sourceFacts, "cover_letter");
  const requiresCoverLetter = sourceRequiresAsset(sourceFacts, "cover_letter");
  const shouldIncludeCoverLetter =
    acceptsCoverLetter && (requiresCoverLetter || input.includeCoverLetter);
  const selectedAssets = [
    resume,
    shouldIncludeCoverLetter ? coverLetter : null,
  ].filter((asset): asset is ReviewableOutboundAsset => Boolean(asset));
  const manifestAssets = selectedAssets.map(outboundManifestEntry);
  const assetTypes = new Set(
    manifestAssets.flatMap((asset) =>
      typeof asset.type === "string" ? [asset.type] : [],
    ),
  );

  const blockers = [
    context.capture_state !== "verified"
      ? "The current employer source is not verified."
      : null,
    !isSha256Hex(context.description_checksum)
      ? "The current job description fingerprint is invalid."
      : null,
    !sourceRecheckIsCurrent
      ? "Refresh the canonical employer job within 24 hours of package review."
      : null,
    context.validation_state !== "trusted"
      ? "The current job analysis is not trusted."
      : null,
    !analysisIsCurrent
      ? "Reassess this exact employer-source version before package review."
      : null,
    sourceConflicts.length
      ? "Resolve the recorded employer-source conflict before package review."
      : null,
    !isQuestionSetChecksum(sourceChecksum)
      ? "The employer form-version receipt is unavailable."
      : null,
    !acceptsResume
      ? "The verified employer form does not expose a resume upload field."
      : null,
    !resume
      ? "Download and review a current job-specific resume PDF."
      : null,
    input.includeCoverLetter && !acceptsCoverLetter
      ? "The verified employer form does not accept a cover letter."
      : null,
    shouldIncludeCoverLetter && !coverLetter
      ? "Download and review a current cover-letter PDF for this employer form."
      : null,
    ...requiredApplicationGaps(sourceFacts, answers, assetTypes).map(
      (label) => `Required employer-form item missing: ${label}`,
    ),
    ...invalidApplicationAnswers(sourceFacts, answers),
    ...manifestAssets.flatMap((asset) =>
      isSha256Hex(asset.contentSha256) &&
      isSha256Hex(asset.fileSha256) &&
      positiveInteger(asset.pageCount) &&
      nonEmptyString(asset.filename)
        ? []
        : [`The ${String(asset.type).replace("_", " ")} file receipt is incomplete.`],
    ),
  ].filter((value): value is string => Boolean(value));
  const uniqueBlockers = [...new Set(blockers)];
  const destinationUrl = safeApplicationDestination(
    sourceFacts,
    context.canonical_url,
  );
  const versionRow = await db
    .prepare(
      "SELECT coalesce(max(version), 0) AS version FROM pursuit_packages WHERE user_id = ? AND pursuit_id = ?",
    )
    .bind(user.id, pursuitId)
    .first<{ version: number }>();
  const version = (versionRow?.version ?? 0) + 1;
  const readinessState =
    uniqueBlockers.length === 0 ? "ready_for_review" : "blocked";
  const assetManifest = {
    assets: manifestAssets,
    sourceRecheck: {
      auditEventId: context.source_recheck_audit_id,
      postingLastCheckedAt: context.source_recheck_verified_at,
      verifiedAt: context.source_recheck_verified_at,
      descriptionChecksum: context.description_checksum,
    },
  };
  const packageCore = {
    destinationUrl,
    jobVersionId: context.job_posting_version_id,
    answers,
    assetManifest,
    blockers: uniqueBlockers,
  };
  const payloadSha256 = await sha256Hex(canonicalJson(packageCore));
  const packageId = `package_${crypto.randomUUID()}`;
  if (!context.job_posting_version_id) {
    throw new Error("The current employer source version is unavailable.");
  }

  await db.batch([
    db
      .prepare(
        "INSERT INTO pursuit_packages (id, user_id, pursuit_id, version, destination_url, job_posting_version_id, answers_json, asset_manifest_json, blockers_json, payload_sha256, readiness_state) VALUES (?, (SELECT current_pursuit.user_id FROM pursuits current_pursuit WHERE current_pursuit.id = ? AND current_pursuit.user_id = ? AND current_pursuit.revision = ? AND current_pursuit.state NOT IN ('applied','interviewing','offered','accepted','closed')), ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        packageId,
        pursuitId,
        user.id,
        context.revision,
        pursuitId,
        version,
        destinationUrl,
        context.job_posting_version_id,
        canonicalJson(answers),
        canonicalJson(assetManifest),
        canonicalJson(uniqueBlockers),
        payloadSha256,
        readinessState,
      ),
    db
      .prepare(
        "UPDATE pursuits SET state = ?, revision = revision + 1, external_approval_state = ?, next_action = ?, updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ? AND revision = ? AND state NOT IN ('applied','interviewing','offered','accepted','closed')",
      )
      .bind(
        readinessState === "ready_for_review" ? "ready_for_approval" : "preparing",
        readinessState === "ready_for_review" ? "requested" : "not_requested",
        readinessState === "ready_for_review"
          ? "Review this exact employer destination, form version, answers, and outbound files before approving form staging."
          : "Resolve every package blocker, then build a new immutable package version.",
        pursuitId,
        user.id,
        context.revision,
      ),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'application_package_built', 'pursuit_package', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        packageId,
        canonicalJson({
          pursuitId,
          version,
          payloadSha256,
          readinessState,
          blockerCount: uniqueBlockers.length,
          outboundAssetIds: manifestAssets.map((asset) => asset.id),
          sourceRecheckAuditEventId: context.source_recheck_audit_id,
          employerFormPopulated: false,
          fileUploaded: false,
          applicationSubmitted: false,
        }),
      ),
  ]);
  return {
    packageId,
    payloadSha256,
    readinessState,
    blockers: uniqueBlockers,
  };
}

const PURSUIT_EVENT_TYPES = new Set<PursuitEventType>([
  "application_submitted",
  "interview_scheduled",
  "interview_completed",
  "follow_up_scheduled",
  "offer_received",
  "offer_accepted",
  "offer_declined",
  "rejected",
  "withdrawn",
  "closed_no_response",
  "learning_recorded",
]);

function normalizedPursuitEventMetadata(value: unknown): JsonRecord {
  if (value === undefined || value === null) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The pursuit update details must be structured.");
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 30) throw new Error("The pursuit update has too many details.");
  return Object.fromEntries(
    entries.map(([key, entry]) => [
      key.slice(0, 120),
      boundedApplicationAnswerValue(entry, key),
    ]),
  );
}

export async function recordPursuitEvent(
  actor: FounderActor,
  input: {
    pursuitId: string;
    type: unknown;
    occurredAt: unknown;
    note: unknown;
    metadata: unknown;
    confirmation: unknown;
  },
): Promise<{ eventId: string; pursuitState: NonNullable<OpportunityRecord["pursuit"]>["state"] }> {
  if (input.confirmation !== "record_member_reported_event") {
    throw new Error("Confirm that this is a member-reported pursuit update.");
  }
  if (typeof input.type !== "string" || !PURSUIT_EVENT_TYPES.has(input.type as PursuitEventType)) {
    throw new Error("Choose a supported pursuit update.");
  }
  const type = input.type as PursuitEventType;
  const now = Date.now();
  const futureScheduledEvent =
    type === "interview_scheduled" || type === "follow_up_scheduled";
  const latestAllowedAt = futureScheduledEvent
    ? now + 2 * 365 * 24 * 60 * 60 * 1000
    : now + 5 * 60 * 1000;
  const occurredAt =
    typeof input.occurredAt === "number" &&
    Number.isInteger(input.occurredAt) &&
    input.occurredAt > now - 10 * 365 * 24 * 60 * 60 * 1000 &&
    input.occurredAt <= latestAllowedAt
      ? input.occurredAt
      : (() => {
          throw new Error(
            futureScheduledEvent
              ? "Choose a valid scheduled date within the next two years."
              : "Outcome updates cannot be dated in the future.",
          );
        })();
  const note =
    input.note === null || input.note === undefined
      ? null
      : nonEmptyString(input.note);
  if (note && note.length > 4_000) {
    throw new Error("Keep the pursuit note to 4,000 characters or fewer.");
  }
  const metadata = normalizedPursuitEventMetadata(input.metadata);
  const user = await ensureUser(actor);
  const db = database();
  const pursuit = await db
    .prepare(
      "SELECT id, revision, state, external_approval_state FROM pursuits WHERE id = ? AND user_id = ? LIMIT 1",
    )
    .bind(input.pursuitId.trim(), user.id)
    .first<{
      id: string;
      revision: number;
      state: NonNullable<OpportunityRecord["pursuit"]>["state"];
      external_approval_state: NonNullable<
        OpportunityRecord["pursuit"]
      >["externalApprovalState"];
    }>();
  if (!pursuit) throw new Error("That pursuit is not available.");

  const allowedStates: Record<PursuitEventType, Set<typeof pursuit.state>> = {
    application_submitted: new Set([
      "saved",
      "researching",
      "preparing",
      "ready_for_approval",
      "applying",
    ]),
    interview_scheduled: new Set(["applied", "interviewing"]),
    interview_completed: new Set(["interviewing"]),
    follow_up_scheduled: new Set(["applied", "interviewing", "offered"]),
    offer_received: new Set(["applied", "interviewing"]),
    offer_accepted: new Set(["offered"]),
    offer_declined: new Set(["offered"]),
    rejected: new Set(["applied", "interviewing", "offered"]),
    withdrawn: new Set([
      "saved",
      "researching",
      "preparing",
      "ready_for_approval",
      "applying",
      "applied",
      "interviewing",
      "offered",
    ]),
    closed_no_response: new Set(["applied", "interviewing"]),
    learning_recorded: new Set([
      "saved",
      "researching",
      "preparing",
      "ready_for_approval",
      "applying",
      "applied",
      "interviewing",
      "offered",
      "accepted",
      "closed",
    ]),
  };
  if (!allowedStates[type].has(pursuit.state)) {
    throw new Error(
      `Record the preceding pursuit stage before ${type.replaceAll("_", " ")}.`,
    );
  }

  let consumedApproval: {
    id: string;
    packageId: string;
    approvedAt: number;
  } | null = null;
  let verifiedMetadata = metadata;
  if (type === "application_submitted") {
    const packageId = nonEmptyString(metadata.packageId);
    const reportedOutsideWayAhead =
      metadata.reportedOutsideWayAhead === true;
    if (Boolean(packageId) === reportedOutsideWayAhead) {
      throw new Error(
        "Choose exactly one submission source: this approved package, or a different or no Way Ahead package.",
      );
    }
    const approvedPackage = packageId
          ? await db
          .prepare(
            "SELECT pp.id AS package_id, approval.id AS approval_id, approval.approved_at FROM pursuit_packages pp JOIN external_action_approvals approval ON approval.pursuit_package_id = pp.id AND approval.user_id = pp.user_id JOIN job_posting_versions version ON version.id = pp.job_posting_version_id JOIN job_postings current_posting ON current_posting.id = version.job_posting_id AND current_posting.description_checksum = version.description_checksum JOIN audit_events source_recheck ON source_recheck.id = json_extract(pp.asset_manifest_json, '$.sourceRecheck.auditEventId') AND source_recheck.user_id = pp.user_id AND source_recheck.entity_type = 'job_posting' AND source_recheck.entity_id = version.job_posting_id AND source_recheck.event_type IN ('greenhouse_job_ingested','lever_job_ingested','ashby_job_ingested') WHERE pp.id = ? AND pp.user_id = ? AND pp.pursuit_id = ? AND pp.readiness_state = 'ready_for_review' AND pp.blockers_json = '[]' AND approval.action = 'approve_application_package' AND approval.payload_sha256 = pp.payload_sha256 AND approval.state = 'approved' AND approval.approved_at IS NOT NULL AND approval.approved_at <= ? AND approval.revoked_at IS NULL AND approval.completed_at IS NULL AND json_valid(pp.asset_manifest_json) AND json_valid(source_recheck.metadata_json) AND json_extract(source_recheck.metadata_json, '$.descriptionChecksum') IS version.description_checksum AND json_extract(pp.asset_manifest_json, '$.sourceRecheck.descriptionChecksum') IS version.description_checksum AND json_extract(pp.asset_manifest_json, '$.sourceRecheck.verifiedAt') IS source_recheck.created_at AND json_extract(pp.asset_manifest_json, '$.sourceRecheck.postingLastCheckedAt') IS source_recheck.created_at AND json_extract(pp.asset_manifest_json, '$.sourceRecheck.postingLastCheckedAt') >= (? - 86400000) AND json_extract(pp.asset_manifest_json, '$.sourceRecheck.postingLastCheckedAt') <= (? + 300000) LIMIT 1",
          )
          .bind(
            packageId,
            user.id,
            pursuit.id,
            occurredAt,
            occurredAt,
            occurredAt,
          )
          .first<{
            package_id: string;
            approval_id: string;
            approved_at: number;
          }>()
      : null;
    if (packageId && !approvedPackage) {
      throw new Error(
        "The selected package was not approved at the recorded submission time. Review the exact approval receipt or choose the outside Way Ahead option.",
      );
    }
    if (approvedPackage) {
      consumedApproval = {
        id: approvedPackage.approval_id,
        packageId: approvedPackage.package_id,
        approvedAt: approvedPackage.approved_at,
      };
      verifiedMetadata = {
        packageId: approvedPackage.package_id,
        approvalId: approvedPackage.approval_id,
        submissionSource: "approved_package",
      };
    } else {
      verifiedMetadata = {
        reportedOutsideWayAhead: true,
        submissionSource: "outside_way_ahead",
      };
    }
  }
  if (
    type === "offer_received" &&
    !(
      typeof metadata.baseCompensation === "number" &&
      metadata.baseCompensation >= 0 &&
      nonEmptyString(metadata.currency)
    )
  ) {
    throw new Error("Record the offer's base compensation and currency.");
  }
  if (
    (type === "offer_accepted" || type === "offer_declined") &&
    !note
  ) {
    throw new Error("Record the reason behind this offer decision.");
  }

  const transition: Record<
    PursuitEventType,
    {
      state: NonNullable<OpportunityRecord["pursuit"]>["state"] | null;
      nextAction: string;
    }
  > = {
    application_submitted: {
      state: "applied",
      nextAction: "Track the employer response and prepare for the first interview.",
    },
    interview_scheduled: {
      state: "interviewing",
      nextAction: "Prepare evidence-backed stories and questions for the scheduled interview.",
    },
    interview_completed: {
      state: "interviewing",
      nextAction: "Record the interview outcome and schedule a truthful follow-up.",
    },
    follow_up_scheduled: {
      state: null,
      nextAction: "Complete the scheduled follow-up without overstating the relationship.",
    },
    offer_received: {
      state: "offered",
      nextAction: "Compare the complete offer with your Job Standard before deciding.",
    },
    offer_accepted: {
      state: "accepted",
      nextAction: "Record the final terms and the search lessons worth carrying forward.",
    },
    offer_declined: {
      state: "closed",
      nextAction: "Record what this pursuit taught you before closing it.",
    },
    rejected: {
      state: "closed",
      nextAction: "Separate sourced feedback from inference and record one useful learning.",
    },
    withdrawn: {
      state: "closed",
      nextAction: "Record why this job stopped being worth the effort.",
    },
    closed_no_response: {
      state: "closed",
      nextAction: "Record the elapsed time and one improvement hypothesis.",
    },
    learning_recorded: {
      state: null,
      nextAction: "Apply only the learning supported by this pursuit's evidence.",
    },
  };
  const next = transition[type];
  const nextState = next.state ?? pursuit.state;
  const eventId = `pursuit_event_${crypto.randomUUID()}`;
  const outsideSubmissionRevokesApproval =
    type === "application_submitted" &&
    !consumedApproval &&
    pursuit.external_approval_state === "approved";
  const nextExternalApprovalState = consumedApproval
    ? "completed"
    : outsideSubmissionRevokesApproval
      ? "revoked"
      : pursuit.external_approval_state;
  const statements = [];

  if (consumedApproval) {
    statements.push(
      db
        .prepare(
          "UPDATE external_action_approvals SET state = 'completed', completed_at = ? WHERE id = ? AND user_id = ? AND pursuit_package_id = ? AND action = 'approve_application_package' AND state = 'approved' AND approved_at = ? AND approved_at <= ? AND revoked_at IS NULL AND completed_at IS NULL",
        )
        .bind(
          occurredAt,
          consumedApproval.id,
          user.id,
          consumedApproval.packageId,
          consumedApproval.approvedAt,
          occurredAt,
        ),
    );
  } else if (outsideSubmissionRevokesApproval) {
    statements.push(
      db
        .prepare(
          "UPDATE external_action_approvals SET state = 'revoked', revoked_at = ? WHERE user_id = ? AND action = 'approve_application_package' AND state = 'approved' AND pursuit_package_id IN (SELECT package.id FROM pursuit_packages package WHERE package.user_id = ? AND package.pursuit_id = ?)",
        )
        .bind(now, user.id, user.id, pursuit.id),
    );
  }

  const eventMetadataJson = canonicalJson({
    ...verifiedMetadata,
    provenance: "member_reported",
    platformExecutedExternalAction: false,
  });
  statements.push(
    consumedApproval
      ? db
          .prepare(
            "INSERT INTO pursuit_events (id, user_id, pursuit_id, event_type, occurred_at, note, metadata_json) VALUES (?, (SELECT current_pursuit.user_id FROM pursuits current_pursuit JOIN external_action_approvals consumed ON consumed.id = ? AND consumed.user_id = current_pursuit.user_id WHERE current_pursuit.id = ? AND current_pursuit.user_id = ? AND current_pursuit.revision = ? AND consumed.pursuit_package_id = ? AND consumed.state = 'completed' AND consumed.completed_at = ?), ?, ?, ?, ?, ?)",
          )
          .bind(
            eventId,
            consumedApproval.id,
            pursuit.id,
            user.id,
            pursuit.revision,
            consumedApproval.packageId,
            occurredAt,
            pursuit.id,
            type,
            occurredAt,
            note,
            eventMetadataJson,
          )
      : db
          .prepare(
            "INSERT INTO pursuit_events (id, user_id, pursuit_id, event_type, occurred_at, note, metadata_json) VALUES (?, (SELECT current_pursuit.user_id FROM pursuits current_pursuit WHERE current_pursuit.id = ? AND current_pursuit.user_id = ? AND current_pursuit.revision = ?), ?, ?, ?, ?, ?)",
          )
          .bind(
            eventId,
            pursuit.id,
            user.id,
            pursuit.revision,
            pursuit.id,
            type,
            occurredAt,
            note,
            eventMetadataJson,
          ),
    db
      .prepare(
        "UPDATE pursuits SET state = ?, revision = revision + 1, external_approval_state = ?, next_action = ?, applied_at = CASE WHEN ? = 'application_submitted' AND applied_at IS NULL THEN ? ELSE applied_at END, closed_reason = CASE WHEN ? IN ('offer_declined','rejected','withdrawn','closed_no_response') THEN ? ELSE closed_reason END, updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ? AND revision = ? AND (? IS NULL OR EXISTS (SELECT 1 FROM external_action_approvals consumed WHERE consumed.id = ? AND consumed.user_id = ? AND consumed.pursuit_package_id = ? AND consumed.state = 'completed' AND consumed.completed_at = ?)) AND (? = 0 OR NOT EXISTS (SELECT 1 FROM external_action_approvals approval JOIN pursuit_packages package ON package.id = approval.pursuit_package_id AND package.user_id = approval.user_id WHERE approval.user_id = ? AND package.pursuit_id = ? AND approval.action = 'approve_application_package' AND approval.state = 'approved'))",
      )
      .bind(
        nextState,
        nextExternalApprovalState,
        next.nextAction,
        type,
        occurredAt,
        type,
        type,
        pursuit.id,
        user.id,
        pursuit.revision,
        consumedApproval?.id ?? null,
        consumedApproval?.id ?? null,
        user.id,
        consumedApproval?.packageId ?? null,
        occurredAt,
        outsideSubmissionRevokesApproval ? 1 : 0,
        user.id,
        pursuit.id,
      ),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, (SELECT current_pursuit.user_id FROM pursuits current_pursuit WHERE current_pursuit.id = ? AND current_pursuit.user_id = ? AND current_pursuit.revision = ? AND current_pursuit.state = ? AND current_pursuit.external_approval_state = ?), ?, 'pursuit_event_recorded', 'pursuit_event', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        pursuit.id,
        user.id,
        pursuit.revision + 1,
        nextState,
        nextExternalApprovalState,
        `chatgpt:${user.email}`,
        eventId,
        canonicalJson({
          pursuitId: pursuit.id,
          type,
          occurredAt,
          previousState: pursuit.state,
          nextState,
          submissionSource:
            type === "application_submitted"
              ? consumedApproval
                ? "approved_package"
                : "outside_way_ahead"
              : null,
          consumedApprovalId: consumedApproval?.id ?? null,
          platformExecutedExternalAction: false,
        }),
      ),
  );
  await db.batch(statements);
  return { eventId, pursuitState: nextState };
}

type GreenhouseJobResponse = {
  id: number;
  title: string;
  updated_at?: string;
  absolute_url?: string;
  content?: string;
  company_name?: string;
  location?: { name?: string };
  departments?: Array<{ id?: number; name?: string }>;
  offices?: Array<{ id?: number; name?: string; location?: string }>;
  metadata?: Array<{ id?: number; name?: string; value?: unknown }> | null;
  pay_input_ranges?: Array<Record<string, unknown>>;
  first_published?: string;
  application_deadline?: string | null;
  questions?: Array<{
    label?: string;
    required?: boolean;
    fields?: Array<{
      name?: string;
      type?: string;
      values?: unknown[];
    }>;
  }>;
};

function greenhouseDecisionSnapshot(
  job: GreenhouseJobResponse,
  questionSet: Array<{
    label: string;
    required: boolean;
    fields: Array<{ name: string; type: string; values: unknown[] }>;
  }>,
  questionSetChecksum: string,
  employer: string,
  canonicalUrl: string,
) {
  const descriptionHtml = job.content ?? "";
  return {
    employer: employer.trim(),
    title: job.title.trim(),
    location: job.location?.name?.trim() || null,
    departments: (job.departments ?? [])
      .map((department) => department.name?.trim())
      .filter((name): name is string => Boolean(name)),
    offices: (job.offices ?? [])
      .map((office) => office.name?.trim())
      .filter((name): name is string => Boolean(name)),
    updatedAt: job.updated_at ?? null,
    firstPublished: job.first_published ?? null,
    applicationDeadline: job.application_deadline ?? null,
    metadata: job.metadata ?? [],
    compensationRanges: job.pay_input_ranges ?? [],
    questionSet,
    questionSetChecksum,
    descriptionHtml,
    descriptionCharacterCount: descriptionHtml.length,
    canonicalUrl,
  };
}

function parseGreenhouseUrl(input: string): { board: string; jobId: string } {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a complete Greenhouse employer job URL.");
  }
  if (url.protocol !== "https:") throw new Error("The job URL must use HTTPS.");
  const host = url.hostname.toLowerCase();
  if (host !== "job-boards.greenhouse.io" && host !== "boards.greenhouse.io") {
    throw new Error("This intake currently supports direct Greenhouse employer URLs.");
  }
  const pathMatch = url.pathname.match(/^\/([^/]+)\/jobs\/(\d+)/);
  if (pathMatch) return { board: pathMatch[1], jobId: pathMatch[2] };
  const board = url.searchParams.get("for");
  const jobId = url.searchParams.get("token");
  if (board && jobId && /^\d+$/.test(jobId)) return { board, jobId };
  throw new Error("The Greenhouse URL does not identify a canonical employer job.");
}

export async function ingestGreenhouseJob(
  actor: FounderActor,
  sourceUrl: string,
): Promise<{ jobPostingId: string; title: string; employer: string }> {
  const founder = await ensureUser(actor);
  const { board, jobId } = parseGreenhouseUrl(sourceUrl.trim());
  const endpoint = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs/${encodeURIComponent(jobId)}`;
  const requestHeaders = { Accept: "application/json", "User-Agent": "WayAheadFounder/1.0" };
  const [contentResponse, questionResponse] = await Promise.all([
    fetch(`${endpoint}?content=true`, { headers: requestHeaders }),
    fetch(`${endpoint}?questions=true`, { headers: requestHeaders }),
  ]);
  if (contentResponse.status === 404 || questionResponse.status === 404) {
    throw new Error("The employer no longer returns this job.");
  }
  if (!contentResponse.ok || !questionResponse.ok) {
    throw new Error("The employer job source is temporarily unavailable.");
  }
  const [job, questionJob] = await Promise.all([
    contentResponse.json() as Promise<GreenhouseJobResponse>,
    questionResponse.json() as Promise<GreenhouseJobResponse>,
  ]);
  if (!job.title || String(job.id) !== jobId) {
    throw new Error("The employer source returned an unexpected job record.");
  }
  if (!questionJob.title || String(questionJob.id) !== jobId || questionJob.title !== job.title) {
    throw new Error("The employer form does not match the verified job record.");
  }
  if (job.updated_at && questionJob.updated_at && job.updated_at !== questionJob.updated_at) {
    throw new Error("The employer description and form changed during verification. Try the source again.");
  }

  const checkedAt = Date.now();
  const parsedPublishedAt =
    typeof job.first_published === "string"
      ? Date.parse(job.first_published)
      : Number.NaN;
  const postedAt = Number.isFinite(parsedPublishedAt)
    ? parsedPublishedAt
    : null;
  const sourceId = `greenhouse_${(await sha256Hex(board)).slice(0, 20)}`;
  const postingId = `job_${(await sha256Hex(`${board}:${jobId}`)).slice(0, 24)}`;
  const questionSet = (questionJob.questions ?? []).map((question) => ({
    label: question.label ?? "",
    required: question.required === true,
    fields: (question.fields ?? []).map((field) => ({
      name: field.name ?? "",
      type: field.type ?? "",
      values: field.values ?? [],
    })),
  }));
  const questionSetChecksum = await sha256Hex(canonicalJson(questionSet));
  const employer = job.company_name?.trim() || board;
  const canonicalUrl = job.absolute_url?.startsWith("https://") ? job.absolute_url : sourceUrl;
  const sourceSnapshot = greenhouseDecisionSnapshot(
    job,
    questionSet,
    questionSetChecksum,
    employer,
    canonicalUrl,
  );
  const descriptionChecksum = await sha256Hex(canonicalJson(sourceSnapshot));
  const versionId = await jobPostingVersionId(postingId, descriptionChecksum);
  const linkId = `joblink_${(
    await sha256Hex(`${founder.id}:${postingId}`)
  ).slice(0, 24)}`;
  const sourceFacts: JsonRecord = Object.fromEntries(
    Object.entries(sourceSnapshot).filter(([key]) => key !== "descriptionHtml"),
  );
  sourceFacts.retrieval = "Greenhouse public Job Board GET API";
  const db = database();
  await db.batch([
    db
      .prepare(
        "INSERT INTO job_sources (id, name, kind, rights_state, terms_version) VALUES (?, ?, 'employer_ats', 'approved', 'greenhouse-job-board-api-2026-07') ON CONFLICT(id) DO UPDATE SET name = excluded.name, rights_state = excluded.rights_state, terms_version = excluded.terms_version",
      )
      .bind(sourceId, `${employer} careers`),
    db
      .prepare(
        "INSERT INTO job_postings (id, source_id, external_id, canonical_url, employer, title, locations_json, compensation_json, description_checksum, first_seen_at, last_checked_at, posted_at, freshness_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(source_id, external_id) DO UPDATE SET canonical_url = excluded.canonical_url, employer = excluded.employer, title = excluded.title, locations_json = excluded.locations_json, compensation_json = excluded.compensation_json, description_checksum = excluded.description_checksum, last_checked_at = excluded.last_checked_at, posted_at = excluded.posted_at, removed_at = NULL, freshness_state = excluded.freshness_state",
      )
      .bind(
        postingId,
        sourceId,
        jobId,
        canonicalUrl,
        employer,
        sourceSnapshot.title,
        json(sourceSnapshot.location ? [sourceSnapshot.location] : []),
        json({ sourceRanges: job.pay_input_ranges ?? [], state: "source_reported" }),
        descriptionChecksum,
        checkedAt,
        checkedAt,
        postedAt,
        freshnessFromPostedAt(postedAt, checkedAt),
      ),
    db
      .prepare(
        "INSERT INTO job_posting_versions (id, job_posting_id, source_checked_at, source_url, description_checksum, source_facts_json, source_conflicts_json, capture_state) VALUES (?, ?, ?, ?, ?, ?, '[]', 'verified') ON CONFLICT(job_posting_id, description_checksum) DO NOTHING",
      )
      .bind(versionId, postingId, checkedAt, canonicalUrl, descriptionChecksum, json(sourceFacts)),
    db
      .prepare(
        "INSERT INTO user_job_links (id, user_id, job_posting_id, source, state) VALUES (?, ?, ?, 'user_added', 'active') ON CONFLICT(user_id, job_posting_id) DO UPDATE SET state = 'active', updated_at = unixepoch() * 1000",
      )
      .bind(linkId, founder.id, postingId),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'greenhouse_job_ingested', 'job_posting', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        founder.id,
        `chatgpt:${founder.email}`,
        postingId,
        json({ board, externalId: jobId, descriptionChecksum, questionSetChecksum }),
      ),
  ]);
  return { jobPostingId: postingId, title: job.title, employer };
}

type LeverJobResponse = {
  id?: string;
  text?: string;
  createdAt?: number;
  hostedUrl?: string;
  applyUrl?: string;
  workplaceType?: string;
  descriptionPlain?: string;
  additionalPlain?: string;
  categories?: {
    commitment?: string;
    department?: string;
    level?: string;
    location?: string;
    allLocations?: string[];
    team?: string;
  };
  lists?: Array<{ text?: string; content?: string }>;
  salaryRange?: {
    currency?: string;
    interval?: string;
    min?: number;
    max?: number;
  };
};

function parseLeverUrl(input: string): { site: string; jobId: string } {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a complete Lever employer job URL.");
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "jobs.lever.co") {
    throw new Error("Enter a direct jobs.lever.co employer URL.");
  }
  const match = url.pathname.match(/^\/([^/]+)\/([a-f0-9-]{20,})\/?$/i);
  if (!match) throw new Error("The Lever URL does not identify a canonical employer job.");
  return { site: decodeURIComponent(match[1]), jobId: match[2] };
}

function employerFromLeverSite(site: string): string {
  return site
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function freshnessFromPostedAt(postedAt: number | null, now: number) {
  if (!postedAt) return "unknown" as const;
  const ageDays = Math.max(0, (now - postedAt) / (24 * 60 * 60 * 1000));
  if (ageDays > 60) return "stale" as const;
  if (ageDays > 30) return "stale_risk" as const;
  return "fresh" as const;
}

async function ingestLeverJob(
  actor: FounderActor,
  sourceUrl: string,
): Promise<{ jobPostingId: string; title: string; employer: string }> {
  const user = await ensureUser(actor);
  const { site, jobId } = parseLeverUrl(sourceUrl.trim());
  const endpoint = `https://api.lever.co/v0/postings/${encodeURIComponent(site)}/${encodeURIComponent(jobId)}?mode=json`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent": "WayAhead/1.0",
    },
  });
  if (response.status === 404) {
    throw new Error("The employer no longer returns this job.");
  }
  if (!response.ok) {
    throw new Error("The employer job source is temporarily unavailable.");
  }
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) {
    throw new Error("The employer job record is larger than this alpha accepts.");
  }
  const job = (await response.json()) as LeverJobResponse;
  if (job.id !== jobId || !job.text?.trim()) {
    throw new Error("The employer source returned an unexpected job record.");
  }
  const checkedAt = Date.now();
  const postedAt =
    typeof job.createdAt === "number" && Number.isFinite(job.createdAt)
      ? job.createdAt
      : null;
  const locations = Array.isArray(job.categories?.allLocations)
    ? job.categories.allLocations
        .filter((location): location is string => typeof location === "string")
        .map((location) => location.trim())
        .filter(Boolean)
        .slice(0, 20)
    : job.categories?.location?.trim()
      ? [job.categories.location.trim()]
      : [];
  const sourceSnapshot = {
    id: job.id,
    title: job.text.trim(),
    createdAt: postedAt,
    hostedUrl: job.hostedUrl ?? null,
    applyUrl: job.applyUrl ?? null,
    workplaceType: job.workplaceType ?? null,
    descriptionPlain: job.descriptionPlain ?? "",
    additionalPlain: job.additionalPlain ?? "",
    categories: job.categories ?? {},
    lists: (job.lists ?? []).slice(0, 30).map((item) => ({
      text: typeof item.text === "string" ? item.text : "",
      content: typeof item.content === "string" ? item.content : "",
    })),
    salaryRange: job.salaryRange ?? null,
  };
  const descriptionChecksum = await sha256Hex(canonicalJson(sourceSnapshot));
  const sourceId = `lever_${(await sha256Hex(site)).slice(0, 20)}`;
  const postingId = `job_${(await sha256Hex(`lever:${site}:${jobId}`)).slice(0, 24)}`;
  const versionId = await jobPostingVersionId(postingId, descriptionChecksum);
  const linkId = `joblink_${(
    await sha256Hex(`${user.id}:${postingId}`)
  ).slice(0, 24)}`;
  const employer = employerFromLeverSite(site);
  const hostedUrl =
    typeof job.hostedUrl === "string" &&
    job.hostedUrl.startsWith(`https://jobs.lever.co/${site}/${jobId}`)
      ? job.hostedUrl
      : sourceUrl;
  const sourceFacts: JsonRecord = {
    employer,
    title: job.text.trim(),
    locations,
    createdAt: postedAt,
    workplaceType: job.workplaceType ?? null,
    commitment: job.categories?.commitment ?? null,
    department: job.categories?.department ?? null,
    level: job.categories?.level ?? null,
    team: job.categories?.team ?? null,
    salaryRange: job.salaryRange ?? null,
    hostedUrl,
    applyUrl: job.applyUrl ?? null,
    descriptionCharacterCount: job.descriptionPlain?.length ?? 0,
    questionSetCapture: "not_exposed_by_public_postings_get",
    retrieval: "Lever public Postings GET API",
  };
  const db = database();
  await db.batch([
    db
      .prepare(
        "INSERT INTO job_sources (id, name, kind, rights_state, terms_version) VALUES (?, ?, 'employer_ats', 'approved', 'lever-public-postings-api-2026-07') ON CONFLICT(id) DO UPDATE SET name = excluded.name, rights_state = excluded.rights_state, terms_version = excluded.terms_version",
      )
      .bind(sourceId, `${employer} careers`),
    db
      .prepare(
        "INSERT INTO job_postings (id, source_id, external_id, canonical_url, employer, title, locations_json, compensation_json, description_checksum, first_seen_at, last_checked_at, posted_at, freshness_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(source_id, external_id) DO UPDATE SET canonical_url = excluded.canonical_url, employer = excluded.employer, title = excluded.title, locations_json = excluded.locations_json, compensation_json = excluded.compensation_json, description_checksum = excluded.description_checksum, last_checked_at = excluded.last_checked_at, posted_at = excluded.posted_at, removed_at = NULL, freshness_state = excluded.freshness_state",
      )
      .bind(
        postingId,
        sourceId,
        jobId,
        hostedUrl,
        employer,
        job.text.trim(),
        json(locations),
        json({ sourceRange: job.salaryRange ?? null, state: "source_reported" }),
        descriptionChecksum,
        checkedAt,
        checkedAt,
        postedAt,
        freshnessFromPostedAt(postedAt, checkedAt),
      ),
    db
      .prepare(
        "INSERT INTO job_posting_versions (id, job_posting_id, source_checked_at, source_url, description_checksum, source_facts_json, source_conflicts_json, capture_state) VALUES (?, ?, ?, ?, ?, ?, '[]', 'verified') ON CONFLICT(job_posting_id, description_checksum) DO NOTHING",
      )
      .bind(
        versionId,
        postingId,
        checkedAt,
        hostedUrl,
        descriptionChecksum,
        json(sourceFacts),
      ),
    db
      .prepare(
        "INSERT INTO user_job_links (id, user_id, job_posting_id, source, state) VALUES (?, ?, ?, 'user_added', 'active') ON CONFLICT(user_id, job_posting_id) DO UPDATE SET state = 'active', updated_at = unixepoch() * 1000",
      )
      .bind(linkId, user.id, postingId),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'lever_job_ingested', 'job_posting', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        postingId,
        json({ site, externalId: jobId, descriptionChecksum }),
      ),
  ]);
  return { jobPostingId: postingId, title: job.text.trim(), employer };
}

type AshbyCompensation = {
  compensationTierSummary?: string;
  scrapeableCompensationSalarySummary?: string;
  compensationTiers?: unknown[];
  summaryComponents?: Array<{
    compensationType?: string;
    interval?: string;
    currencyCode?: string | null;
    minValue?: number | null;
    maxValue?: number | null;
  }>;
};

type AshbyJobResponse = {
  id?: string;
  title?: string;
  location?: string;
  secondaryLocations?: Array<{
    location?: string;
    address?: Record<string, unknown>;
  }>;
  department?: string;
  team?: string;
  isListed?: boolean;
  isRemote?: boolean;
  workplaceType?: string;
  descriptionPlain?: string;
  publishedAt?: string;
  employmentType?: string;
  address?: Record<string, unknown>;
  jobUrl?: string;
  applyUrl?: string;
  compensation?: AshbyCompensation;
  shouldDisplayCompensationOnJobPostings?: boolean;
};

type AshbyFeedResponse = {
  apiVersion?: string;
  jobs?: AshbyJobResponse[];
};

type AshbyUrlParts = {
  board: string;
  jobId: string;
  kind: "job" | "application";
};

function parseAshbyUrl(input: string): AshbyUrlParts {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a complete Ashby employer job URL.");
  }
  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "jobs.ashbyhq.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("Enter a canonical HTTPS jobs.ashbyhq.com employer URL.");
  }
  const rawSegments = url.pathname.split("/").filter(Boolean);
  if (
    (rawSegments.length !== 2 && rawSegments.length !== 3) ||
    (rawSegments.length === 3 && rawSegments[2] !== "application")
  ) {
    throw new Error(
      "The Ashby URL must identify one canonical employer job or its application page.",
    );
  }
  let board: string;
  try {
    board = decodeURIComponent(rawSegments[0]);
  } catch {
    throw new Error("The Ashby employer board name is invalid.");
  }
  if (
    !/^[\p{L}\p{N}][\p{L}\p{N} ._~&'()-]{0,99}$/u.test(board) ||
    /[/\\]/.test(board)
  ) {
    throw new Error("The Ashby employer board name is invalid.");
  }
  const jobId = rawSegments[1]?.toLowerCase();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      jobId,
    )
  ) {
    throw new Error(
      "The Ashby URL must identify one canonical employer job or its application page.",
    );
  }
  return {
    board,
    jobId,
    kind: rawSegments.length === 3 ? "application" : "job",
  };
}

async function readBoundedAshbyFeed(response: Response): Promise<AshbyFeedResponse> {
  const maximumBytes = 2_000_000;
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new Error("The employer job board is larger than this alpha accepts.");
  }
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > maximumBytes) {
    throw new Error("The employer job board is larger than this alpha accepts.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("The employer job source returned invalid data.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The employer job source returned an unexpected board record.");
  }
  const feed = parsed as AshbyFeedResponse;
  if (feed.apiVersion !== "1" || !Array.isArray(feed.jobs) || feed.jobs.length > 5_000) {
    throw new Error("The employer job source returned an unsupported board record.");
  }
  return feed;
}

function selectListedAshbyJob(
  feed: AshbyFeedResponse,
  board: string,
  jobId: string,
): AshbyJobResponse {
  const matches = (feed.jobs ?? []).filter((job) => job?.id === jobId);
  if (matches.length === 0) {
    throw new Error("The employer no longer lists this Ashby job.");
  }
  if (matches.length !== 1) {
    throw new Error("The employer source returned duplicate records for this job.");
  }
  const job = matches[0];
  if (job.isListed !== true) {
    throw new Error("This Ashby job is unlisted and cannot be added.");
  }
  if (!job.title?.trim() || !job.descriptionPlain?.trim()) {
    throw new Error("The employer source returned an incomplete job record.");
  }
  if (typeof job.jobUrl !== "string" || typeof job.applyUrl !== "string") {
    throw new Error("The employer source omitted its canonical job links.");
  }
  const jobUrl = parseAshbyUrl(job.jobUrl);
  const applyUrl = parseAshbyUrl(job.applyUrl);
  if (
    jobUrl.board !== board ||
    jobUrl.jobId !== jobId ||
    jobUrl.kind !== "job" ||
    applyUrl.board !== board ||
    applyUrl.jobId !== jobId ||
    applyUrl.kind !== "application"
  ) {
    throw new Error(
      "The employer source returned job links that do not match this Ashby board and requisition.",
    );
  }
  return job;
}

async function fetchAshbyJob(
  board: string,
  jobId: string,
  fetcher: typeof fetch = fetch,
): Promise<{ feed: AshbyFeedResponse; job: AshbyJobResponse; endpoint: string }> {
  const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}?includeCompensation=true`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetcher(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "WayAhead/1.0",
      },
      redirect: "manual",
      signal: controller.signal,
    });
  } catch {
    throw new Error("The employer job source is temporarily unavailable.");
  } finally {
    clearTimeout(timeout);
  }
  if (response.status >= 300 && response.status < 400) {
    throw new Error("The employer job source redirected unexpectedly.");
  }
  if (response.status === 404) {
    throw new Error("The employer no longer returns this Ashby job board.");
  }
  if (!response.ok) {
    throw new Error("The employer job source is temporarily unavailable.");
  }
  const feed = await readBoundedAshbyFeed(response);
  return {
    feed,
    job: selectListedAshbyJob(feed, board, jobId),
    endpoint,
  };
}

function ashbyAnnualSalaryRanges(
  compensation: AshbyCompensation | undefined,
): Array<{
  currency: string;
  interval: "year";
  min: number;
  max: number;
}> {
  return (compensation?.summaryComponents ?? [])
    .filter(
      (component) =>
        component.compensationType === "Salary" &&
        component.interval === "1 YEAR" &&
        typeof component.currencyCode === "string" &&
        typeof component.minValue === "number" &&
        Number.isFinite(component.minValue) &&
        typeof component.maxValue === "number" &&
        Number.isFinite(component.maxValue) &&
        component.minValue >= 0 &&
        component.maxValue >= component.minValue,
    )
    .map((component) => ({
      currency: component.currencyCode as string,
      interval: "year" as const,
      min: component.minValue as number,
      max: component.maxValue as number,
    }));
}

function employerFromAshbyBoard(board: string): string {
  return board
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

async function ingestAshbyJob(
  actor: FounderActor,
  sourceUrl: string,
): Promise<{ jobPostingId: string; title: string; employer: string }> {
  const user = await ensureUser(actor);
  const { board, jobId } = parseAshbyUrl(sourceUrl.trim());
  const { feed, job, endpoint } = await fetchAshbyJob(board, jobId);
  const checkedAt = Date.now();
  const parsedPublishedAt =
    typeof job.publishedAt === "string"
      ? Date.parse(job.publishedAt)
      : Number.NaN;
  if (job.publishedAt && !Number.isFinite(parsedPublishedAt)) {
    throw new Error("The employer source returned an invalid publication date.");
  }
  const postedAt = Number.isFinite(parsedPublishedAt)
    ? parsedPublishedAt
    : null;
  const locations = [
    typeof job.location === "string" ? job.location.trim() : "",
    ...(job.secondaryLocations ?? []).map((location) =>
      typeof location.location === "string" ? location.location.trim() : "",
    ),
  ]
    .filter(Boolean)
    .filter((location, index, all) => all.indexOf(location) === index)
    .slice(0, 50);
  const sourceSnapshot = {
    apiVersion: feed.apiVersion,
    id: job.id,
    title: job.title?.trim(),
    location: job.location ?? null,
    secondaryLocations: job.secondaryLocations ?? [],
    department: job.department ?? null,
    team: job.team ?? null,
    isListed: true,
    isRemote: job.isRemote ?? null,
    workplaceType: job.workplaceType ?? null,
    employmentType: job.employmentType ?? null,
    publishedAt: job.publishedAt ?? null,
    address: job.address ?? null,
    jobUrl: job.jobUrl,
    applyUrl: job.applyUrl,
    descriptionPlain: job.descriptionPlain,
    compensation: job.compensation ?? null,
    shouldDisplayCompensationOnJobPostings:
      job.shouldDisplayCompensationOnJobPostings ?? null,
  };
  const descriptionChecksum = await sha256Hex(canonicalJson(sourceSnapshot));
  const sourceId = `ashby_${(await sha256Hex(board)).slice(0, 20)}`;
  const postingId = `job_${(
    await sha256Hex(`ashby:${board}:${jobId}`)
  ).slice(0, 24)}`;
  const versionId = await jobPostingVersionId(postingId, descriptionChecksum);
  const linkId = `joblink_${(
    await sha256Hex(`${user.id}:${postingId}`)
  ).slice(0, 24)}`;
  const employer = employerFromAshbyBoard(board);
  const salaryRanges = ashbyAnnualSalaryRanges(job.compensation);
  const questionSetCapture = {
    state: "unknown",
    reason: "not_exposed_by_ashby_public_job_postings_api",
  };
  const sourceReceipt = {
    sourceFamily: "ashby_public_job_postings_api",
    endpoint,
    apiVersion: feed.apiVersion,
    board,
    externalId: jobId,
    rightsState: "approved_for_private_user_requested_analysis_only",
    redistributionState: "not_authorized",
    termsVersion: "ashby-public-job-postings-api-2026-07",
  };
  const sourceFacts: JsonRecord = {
    employerNameReceipt: {
      value: board,
      state: "board_slug_fallback",
      verifiedEmployerName: false,
    },
    title: job.title?.trim(),
    locations,
    location: job.location ?? null,
    secondaryLocations: job.secondaryLocations ?? [],
    isRemote: job.isRemote ?? null,
    workplaceType: job.workplaceType ?? null,
    employmentType: job.employmentType ?? null,
    team: job.team ?? null,
    department: job.department ?? null,
    publishedAt: job.publishedAt ?? null,
    jobUrl: job.jobUrl,
    applyUrl: job.applyUrl,
    salaryRange: salaryRanges[0] ?? null,
    compensation: job.compensation ?? null,
    descriptionPlain: job.descriptionPlain,
    descriptionCharacterCount: job.descriptionPlain?.length ?? 0,
    questionSetCapture,
    sourceReceipt,
    retrieval: "Ashby public Job Postings API",
  };
  const db = database();
  await db.batch([
    db
      .prepare(
        "INSERT INTO job_sources (id, name, kind, rights_state, terms_version) VALUES (?, ?, 'employer_ats', 'approved', 'ashby-public-job-postings-api-2026-07') ON CONFLICT(id) DO UPDATE SET name = excluded.name, rights_state = excluded.rights_state, terms_version = excluded.terms_version",
      )
      .bind(sourceId, `${board} Ashby board (employer name unverified)`),
    db
      .prepare(
        "INSERT INTO job_postings (id, source_id, external_id, canonical_url, employer, title, locations_json, compensation_json, description_checksum, first_seen_at, last_checked_at, posted_at, freshness_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(source_id, external_id) DO UPDATE SET canonical_url = excluded.canonical_url, employer = excluded.employer, title = excluded.title, locations_json = excluded.locations_json, compensation_json = excluded.compensation_json, description_checksum = excluded.description_checksum, last_checked_at = excluded.last_checked_at, posted_at = excluded.posted_at, removed_at = NULL, freshness_state = excluded.freshness_state",
      )
      .bind(
        postingId,
        sourceId,
        jobId,
        job.jobUrl,
        employer,
        job.title?.trim(),
        json(locations),
        json({
          sourceRange: salaryRanges[0] ?? null,
          sourceRanges: salaryRanges,
          sourceCompensation: job.compensation ?? null,
          state: job.compensation ? "source_reported" : "unknown",
        }),
        descriptionChecksum,
        checkedAt,
        checkedAt,
        postedAt,
        freshnessFromPostedAt(postedAt, checkedAt),
      ),
    db
      .prepare(
        "INSERT INTO job_posting_versions (id, job_posting_id, source_checked_at, source_url, description_checksum, source_facts_json, source_conflicts_json, capture_state) VALUES (?, ?, ?, ?, ?, ?, '[]', 'verified') ON CONFLICT(job_posting_id, description_checksum) DO NOTHING",
      )
      .bind(
        versionId,
        postingId,
        checkedAt,
        job.jobUrl,
        descriptionChecksum,
        json(sourceFacts),
      ),
    db
      .prepare(
        "INSERT INTO user_job_links (id, user_id, job_posting_id, source, state) VALUES (?, ?, ?, 'user_added', 'active') ON CONFLICT(user_id, job_posting_id) DO UPDATE SET state = 'active', updated_at = unixepoch() * 1000",
      )
      .bind(linkId, user.id, postingId),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'ashby_job_ingested', 'job_posting', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        postingId,
        json({
          board,
          externalId: jobId,
          descriptionChecksum,
          employerNameState: "board_slug_fallback",
          questionSetCapture,
          rightsState: sourceReceipt.rightsState,
        }),
      ),
  ]);
  return {
    jobPostingId: postingId,
    title: job.title?.trim() ?? "",
    employer,
  };
}

export async function ingestEmployerJob(
  actor: FounderActor,
  sourceUrl: string,
): Promise<{ jobPostingId: string; title: string; employer: string }> {
  let url: URL;
  try {
    url = new URL(sourceUrl.trim());
  } catch {
    throw new Error("Enter a complete direct employer job URL.");
  }
  const host = url.hostname.toLowerCase();
  if (host === "job-boards.greenhouse.io" || host === "boards.greenhouse.io") {
    return ingestGreenhouseJob(actor, sourceUrl);
  }
  if (host === "jobs.lever.co") {
    return ingestLeverJob(actor, sourceUrl);
  }
  if (host === "jobs.ashbyhq.com") {
    return ingestAshbyJob(actor, sourceUrl);
  }
  throw new Error(
    "This alpha currently verifies direct Greenhouse, Lever, and Ashby employer URLs.",
  );
}

export async function approvePursuitPackage(
  actor: FounderActor,
  packageId: string,
  payloadSha256: string,
  confirmation: string,
  expectedRevision: number,
  attestationVersion: string,
): Promise<{ approvalId: string; approvedAt: number; pursuitRevision: number }> {
  if (confirmation !== "approve_application_package") {
    throw new Error("Confirm the exact application package and employer form version before approval.");
  }
  if (attestationVersion !== "application-package-staging-v1") {
    throw new Error("Review the current package approval attestation.");
  }
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    throw new Error("Refresh the pursuit before recording approval.");
  }
  const founder = await ensureUser(actor);
  const db = database();
  const packageRecord = await db
    .prepare(
      "SELECT pp.id, pp.pursuit_id, pp.payload_sha256, pp.blockers_json, pp.readiness_state, p.external_approval_state, p.state AS pursuit_state, p.revision AS pursuit_revision FROM pursuit_packages pp JOIN pursuits p ON p.id = pp.pursuit_id AND p.user_id = pp.user_id WHERE pp.id = ? AND pp.user_id = ? AND pp.id = (SELECT current_package.id FROM pursuit_packages current_package WHERE current_package.user_id = pp.user_id AND current_package.pursuit_id = pp.pursuit_id ORDER BY current_package.version DESC LIMIT 1) LIMIT 1",
    )
    .bind(packageId, founder.id)
    .first<{
      id: string;
      pursuit_id: string;
      payload_sha256: string;
      blockers_json: string;
      readiness_state: string;
      external_approval_state: string;
      pursuit_state: NonNullable<OpportunityRecord["pursuit"]>["state"];
      pursuit_revision: number;
    }>();
  if (!packageRecord) throw new Error("The application package is not available.");
  if (packageRecord.payload_sha256 !== payloadSha256) {
    throw new Error("The package changed before approval. Review the current version.");
  }
  if (packageRecord.readiness_state !== "ready_for_review" || packageRecord.blockers_json !== "[]") {
    throw new Error("This package still has a blocking evidence or asset issue.");
  }
  const existing = await db
    .prepare(
      "SELECT id, approved_at FROM external_action_approvals WHERE user_id = ? AND pursuit_package_id = ? AND action = 'approve_application_package' AND payload_sha256 = ? AND state = 'approved' ORDER BY approved_at DESC LIMIT 1",
    )
    .bind(founder.id, packageId, payloadSha256)
    .first<{ id: string; approved_at: number }>();
  if (existing) {
    return {
      approvalId: existing.id,
      approvedAt: existing.approved_at,
      pursuitRevision: packageRecord.pursuit_revision,
    };
  }
  if (
    packageRecord.pursuit_state !== "ready_for_approval" ||
    packageRecord.pursuit_revision !== expectedRevision
  ) {
    throw new Error("The pursuit changed before approval. Refresh and review the current package.");
  }

  const approvedAt = Date.now();
  const approvalId = `approval_${crypto.randomUUID()}`;
  const attestationSha256 = await sha256Hex(
    canonicalJson({
      version: attestationVersion,
      packageId,
      payloadSha256,
      pursuitId: packageRecord.pursuit_id,
      pursuitRevision: expectedRevision,
      scope: "form_staging_only",
      formPopulationAuthorized: false,
      fileUploadAuthorized: false,
      submissionAuthorized: false,
    }),
  );
  await db.batch([
    db
      .prepare(
        "INSERT INTO external_action_approvals (id, user_id, pursuit_package_id, action, payload_sha256, approved_pursuit_revision, attestation_version, attestation_sha256, state, approved_at) VALUES (?, ?, ?, 'approve_application_package', ?, ?, ?, ?, 'approved', ?)",
      )
      .bind(
        approvalId,
        founder.id,
        packageId,
        payloadSha256,
        expectedRevision,
        attestationVersion,
        attestationSha256,
        approvedAt,
      ),
    db
      .prepare(
        "UPDATE pursuits SET state = 'applying', revision = revision + 1, external_approval_state = 'approved', next_action = 'This exact package is approved for manual form staging. Way Ahead still cannot populate the form, upload files, or submit the application.', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ? AND revision = ? AND state = 'ready_for_approval'",
      )
      .bind(packageRecord.pursuit_id, founder.id, expectedRevision),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'application_package_approved_for_form_staging', 'pursuit_package', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        founder.id,
        `chatgpt:${founder.email}`,
        packageId,
        json({
          payloadSha256,
          action: "approve_application_package",
          pursuitRevision: expectedRevision,
          attestationVersion,
          attestationSha256,
          formPopulationExecuted: false,
          fileUploadExecuted: false,
          submissionExecuted: false,
        }),
      ),
  ]);
  const readback = await db
    .prepare(
      "SELECT revision, state, external_approval_state FROM pursuits WHERE id = ? AND user_id = ? LIMIT 1",
    )
    .bind(packageRecord.pursuit_id, founder.id)
    .first<{ revision: number; state: string; external_approval_state: string }>();
  if (
    !readback ||
    readback.revision !== expectedRevision + 1 ||
    readback.state !== "applying" ||
    readback.external_approval_state !== "approved"
  ) {
    throw new Error("The approval receipt could not be read back safely.");
  }
  return {
    approvalId,
    approvedAt,
    pursuitRevision: readback.revision,
  };
}
