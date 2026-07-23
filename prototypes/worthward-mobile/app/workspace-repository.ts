import { env } from "cloudflare:workers";
import type {
  AssetRecord,
  CareerPathRecord,
  FounderActor,
  FounderBootstrapPayload,
  JobStandardRecord,
  JsonRecord,
  OpportunityRecord,
  WorkspaceRecord,
} from "./production-types";

type RuntimeEnv = { DB?: D1Database };

type FounderRow = {
  id: string;
  email: string;
  display_name: string | null;
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

export async function ensureFounder(actor: FounderActor): Promise<FounderRow> {
  const db = database();
  const email = actor.email.trim().toLowerCase();
  const existing = await db
    .prepare("SELECT id, email, display_name FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first<FounderRow>();
  if (existing) {
    await db
      .prepare(
        "UPDATE users SET display_name = ?, identity_provider = 'chatgpt', role = 'owner', updated_at = unixepoch() * 1000 WHERE id = ?",
      )
      .bind(actor.displayName, existing.id)
      .run();
    return { ...existing, display_name: actor.displayName };
  }

  const digest = await sha256Hex(email);
  const id = `owner_${digest.slice(0, 24)}`;
  await db
    .prepare(
      "INSERT INTO users (id, auth_subject, identity_provider, role, email, display_name, lifecycle_state) VALUES (?, ?, 'chatgpt', 'owner', ?, ?, 'founder_production')",
    )
    .bind(id, `chatgpt:${email}`, email, actor.displayName)
    .run();
  return { id, email, display_name: actor.displayName };
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
  review_state: "draft" | "confirmed" | "conflict";
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
  const founder = await ensureFounder(actor);
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
        "SELECT id, employer, title, start_date, end_date, is_current, location, summary, review_state FROM experience_roles WHERE user_id = ? ORDER BY is_current DESC, start_date DESC",
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
        "SELECT jp.id, jp.employer, jp.title, jp.canonical_url, jp.locations_json, jp.compensation_json, jp.freshness_state, jp.posted_at, jp.last_checked_at, js.name AS source_name, js.rights_state AS source_rights_state FROM job_postings jp JOIN job_sources js ON js.id = jp.source_id WHERE jp.removed_at IS NULL ORDER BY jp.last_checked_at DESC LIMIT 30",
      )
      .all<RawPosting>(),
  ]);

  const opportunities = await Promise.all(
    postingRows.results.map((posting) => readOpportunity(db, founder.id, posting)),
  );
  const facts = factRows.results;
  const headlineFact = facts.find((fact) => fact.fact_type === "headline");
  const summaryFact = facts.find((fact) => fact.fact_type === "professional_summary");

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
      experiences: experienceRows.results.map((role) => ({
        id: role.id,
        employer: role.employer,
        title: role.title,
        startDate: role.start_date,
        endDate: role.end_date,
        isCurrent: toBool(role.is_current),
        location: role.location,
        summary: role.summary,
        reviewState: role.review_state,
      })),
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
      billingEnabled: false,
      submissionEnabled: false,
      refreshedAt: Date.now(),
    },
  };
}

async function readOpportunity(
  db: D1Database,
  userId: string,
  posting: RawPosting,
): Promise<OpportunityRecord> {
  const [version, analysis, pursuit] = await Promise.all([
    db
      .prepare(
        "SELECT id, source_checked_at, description_checksum, source_facts_json, source_conflicts_json, capture_state FROM job_posting_versions WHERE job_posting_id = ? ORDER BY source_checked_at DESC LIMIT 1",
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
        "SELECT id, state, next_action, external_approval_state FROM pursuits WHERE user_id = ? AND job_posting_id = ? LIMIT 1",
      )
      .bind(userId, posting.id)
      .first<{
        id: string;
        state: NonNullable<OpportunityRecord["pursuit"]>["state"];
        next_action: string | null;
        external_approval_state: NonNullable<OpportunityRecord["pursuit"]>["externalApprovalState"];
      }>(),
  ]);

  let pursuitRecord: OpportunityRecord["pursuit"] = null;
  if (pursuit) {
    const [assetRows, packageRow] = await Promise.all([
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
          "SELECT pp.id, pp.version, pp.destination_url, pp.job_posting_version_id, pp.payload_sha256, pp.blockers_json, pp.readiness_state, pp.asset_manifest_json, pp.answers_json, pp.created_at, CASE WHEN EXISTS (SELECT 1 FROM external_action_approvals approval WHERE approval.user_id = pp.user_id AND approval.pursuit_package_id = pp.id AND approval.action = 'approve_application_package' AND approval.payload_sha256 = pp.payload_sha256 AND approval.state = 'approved') THEN 'approved' ELSE 'not_approved' END AS approval_state FROM pursuit_packages pp WHERE pp.user_id = ? AND pp.pursuit_id = ? ORDER BY pp.version DESC LIMIT 1",
        )
        .bind(userId, pursuit.id)
        .first<{
          id: string;
          version: number;
          destination_url: string;
          job_posting_version_id: string;
          payload_sha256: string;
          approval_state: "approved" | "not_approved";
          blockers_json: string;
          readiness_state: "blocked" | "ready_for_review" | "superseded";
          asset_manifest_json: string;
          answers_json: string;
          created_at: number;
        }>(),
    ]);
    pursuitRecord = {
      id: pursuit.id,
      state: pursuit.state,
      nextAction: pursuit.next_action,
      externalApprovalState: pursuit.external_approval_state,
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
      package: packageRow
        ? {
            id: packageRow.id,
            version: packageRow.version,
            destinationUrl: packageRow.destination_url,
            jobPostingVersionId: packageRow.job_posting_version_id,
            payloadSha256: packageRow.payload_sha256,
            approvalState: packageRow.approval_state,
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
  if (!opportunity.pursuit) return opportunity;

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
): Promise<{ imported: true; counts: Record<string, number> }> {
  assertBootstrapPayload(payloadValue);
  const payload = payloadValue;
  const founder = await ensureFounder(actor);
  const db = database();
  const existingWorkspace = await db
    .prepare(
      "SELECT (SELECT count(*) FROM profile_facts WHERE user_id = ?) + (SELECT count(*) FROM experience_roles WHERE user_id = ?) + (SELECT count(*) FROM profile_skills WHERE user_id = ?) + (SELECT count(*) FROM job_standards WHERE user_id = ?) + (SELECT count(*) FROM career_paths WHERE user_id = ?) + (SELECT count(*) FROM job_analyses WHERE user_id = ?) + (SELECT count(*) FROM pursuits WHERE user_id = ?) + (SELECT count(*) FROM audit_events WHERE user_id = ? AND event_type = 'founder_workspace_imported') AS count",
    )
    .bind(founder.id, founder.id, founder.id, founder.id, founder.id, founder.id, founder.id, founder.id)
    .first<{ count: number }>();
  if ((existingWorkspace?.count ?? 0) > 0) {
    throw new Error("The founder workspace is already initialized. Use versioned product workflows for corrections.");
  }
  const normalizedOpportunities = await Promise.all(payload.opportunities.map(normalizeBootstrapOpportunity));
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
          "INSERT INTO profile_facts (id, user_id, fact_type, value_json, source_span, extraction_method, extraction_policy_version, state, confidence, ownership) VALUES (?, ?, ?, ?, ?, 'manual_entry', 'founder-import-v1', ?, ?, ?) ON CONFLICT(id) DO UPDATE SET value_json = excluded.value_json, source_span = excluded.source_span, state = excluded.state, confidence = excluded.confidence, ownership = excluded.ownership, updated_at = unixepoch() * 1000 WHERE profile_facts.user_id = excluded.user_id",
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
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'founder_workspace_imported', 'workspace', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        founder.id,
        `chatgpt:${founder.email}`,
        founder.id,
        json({
          profileFacts: payload.profile.facts.length,
          careerPaths: payload.careerPaths.length,
          opportunities: payload.opportunities.length,
        }),
      ),
  );
  await db.batch(statements);

  return {
    imported: true,
    counts: {
      profileFacts: payload.profile.facts.length,
      experiences: payload.profile.experiences.length,
      skills: payload.profile.skills.length,
      careerPaths: payload.careerPaths.length,
      opportunities: payload.opportunities.length,
    },
  };
}

export async function saveJobStandard(
  actor: FounderActor,
  input: Omit<JobStandardRecord, "id" | "version">,
): Promise<void> {
  const founder = await ensureFounder(actor);
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
  const founder = await ensureFounder(actor);
  const db = database();
  const owned = await db
    .prepare("SELECT id FROM career_paths WHERE id = ? AND user_id = ? LIMIT 1")
    .bind(pathId, founder.id)
    .first<{ id: string }>();
  if (!owned) throw new Error("That career path is not available in this workspace.");
  await db.batch([
    db.prepare("UPDATE career_paths SET is_primary = 0 WHERE user_id = ?").bind(founder.id),
    db
      .prepare("UPDATE career_paths SET state = 'active', is_primary = 1, updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ?")
      .bind(pathId, founder.id),
  ]);
}

export async function createPursuit(actor: FounderActor, jobPostingId: string): Promise<string> {
  const founder = await ensureFounder(actor);
  const db = database();
  const job = await db
    .prepare("SELECT id FROM job_postings WHERE id = ? AND removed_at IS NULL LIMIT 1")
    .bind(jobPostingId)
    .first<{ id: string }>();
  if (!job) throw new Error("That job is no longer available.");
  const existing = await db
    .prepare("SELECT id FROM pursuits WHERE user_id = ? AND job_posting_id = ? LIMIT 1")
    .bind(founder.id, jobPostingId)
    .first<{ id: string }>();
  if (existing) return existing.id;
  const analysis = await db
    .prepare("SELECT id FROM job_analyses WHERE user_id = ? AND job_posting_id = ? ORDER BY created_at DESC LIMIT 1")
    .bind(founder.id, jobPostingId)
    .first<{ id: string }>();
  const id = `pursuit_${crypto.randomUUID()}`;
  await db
    .prepare(
      "INSERT INTO pursuits (id, user_id, job_posting_id, current_analysis_id, state, next_action, external_approval_state) VALUES (?, ?, ?, ?, 'researching', 'Complete evidence review before generating application assets.', 'not_requested')",
    )
    .bind(id, founder.id, jobPostingId, analysis?.id ?? null)
    .run();
  return id;
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
  const founder = await ensureFounder(actor);
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
  const descriptionChecksum = await sha256Hex(`${job.content ?? ""}\n${canonicalJson(questionSet)}`);
  const versionId = `jobver_${descriptionChecksum.slice(0, 24)}`;
  const employer = job.company_name?.trim() || board;
  const canonicalUrl = job.absolute_url?.startsWith("https://") ? job.absolute_url : sourceUrl;
  const location = job.location?.name?.trim();
  const sourceFacts: JsonRecord = {
    employer,
    title: job.title,
    location: location ?? null,
    departments: job.departments?.map((department) => department.name).filter(Boolean) ?? [],
    offices: job.offices?.map((office) => office.name).filter(Boolean) ?? [],
    updatedAt: job.updated_at ?? null,
    firstPublished: job.first_published ?? null,
    applicationDeadline: job.application_deadline ?? null,
    metadata: job.metadata ?? [],
    questionSet,
    questionSetChecksum,
    descriptionCharacterCount: job.content?.length ?? 0,
    canonicalUrl,
    retrieval: "Greenhouse public Job Board GET API",
  };
  const db = database();
  await db.batch([
    db
      .prepare(
        "INSERT INTO job_sources (id, name, kind, rights_state, terms_version) VALUES (?, ?, 'employer_ats', 'approved', 'greenhouse-job-board-api-2026-07') ON CONFLICT(id) DO UPDATE SET name = excluded.name, rights_state = excluded.rights_state, terms_version = excluded.terms_version",
      )
      .bind(sourceId, `${employer} careers`),
    db
      .prepare(
        "INSERT INTO job_postings (id, source_id, external_id, canonical_url, employer, title, locations_json, compensation_json, description_checksum, first_seen_at, last_checked_at, freshness_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unknown') ON CONFLICT(source_id, external_id) DO UPDATE SET canonical_url = excluded.canonical_url, employer = excluded.employer, title = excluded.title, locations_json = excluded.locations_json, compensation_json = excluded.compensation_json, description_checksum = excluded.description_checksum, last_checked_at = excluded.last_checked_at, removed_at = NULL, freshness_state = 'unknown'",
      )
      .bind(
        postingId,
        sourceId,
        jobId,
        canonicalUrl,
        employer,
        job.title,
        json(location ? [location] : []),
        json({ sourceRanges: job.pay_input_ranges ?? [], state: "source_reported" }),
        descriptionChecksum,
        checkedAt,
        checkedAt,
      ),
    db
      .prepare(
        "INSERT INTO job_posting_versions (id, job_posting_id, source_checked_at, source_url, description_checksum, source_facts_json, source_conflicts_json, capture_state) VALUES (?, ?, ?, ?, ?, ?, '[]', 'verified') ON CONFLICT(job_posting_id, description_checksum) DO NOTHING",
      )
      .bind(versionId, postingId, checkedAt, canonicalUrl, descriptionChecksum, json(sourceFacts)),
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

export async function approvePursuitPackage(
  actor: FounderActor,
  packageId: string,
  payloadSha256: string,
  confirmation: string,
): Promise<{ approvalId: string; approvedAt: number }> {
  if (confirmation !== "approve_application_package") {
    throw new Error("Confirm the exact application package and employer form version before approval.");
  }
  const founder = await ensureFounder(actor);
  const db = database();
  const packageRecord = await db
    .prepare(
      "SELECT pp.id, pp.pursuit_id, pp.payload_sha256, pp.blockers_json, pp.readiness_state, p.external_approval_state FROM pursuit_packages pp JOIN pursuits p ON p.id = pp.pursuit_id AND p.user_id = pp.user_id WHERE pp.id = ? AND pp.user_id = ? LIMIT 1",
    )
    .bind(packageId, founder.id)
    .first<{
      id: string;
      pursuit_id: string;
      payload_sha256: string;
      blockers_json: string;
      readiness_state: string;
      external_approval_state: string;
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
  if (existing) return { approvalId: existing.id, approvedAt: existing.approved_at };

  const approvedAt = Date.now();
  const approvalId = `approval_${crypto.randomUUID()}`;
  await db.batch([
    db
      .prepare(
        "INSERT INTO external_action_approvals (id, user_id, pursuit_package_id, action, payload_sha256, state, approved_at) VALUES (?, ?, ?, 'approve_application_package', ?, 'approved', ?)",
      )
      .bind(approvalId, founder.id, packageId, payloadSha256, approvedAt),
    db
      .prepare(
        "UPDATE pursuits SET state = 'ready_for_approval', external_approval_state = 'approved', next_action = 'The exact package and employer form version are approved for staging. Form population, file upload, and submission remain separate external actions.', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ?",
      )
      .bind(packageRecord.pursuit_id, founder.id),
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
          formPopulationExecuted: false,
          fileUploadExecuted: false,
          submissionExecuted: false,
        }),
      ),
  ]);
  return { approvalId, approvedAt };
}
