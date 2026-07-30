import { env } from "cloudflare:workers";
import type { FounderActor } from "./production-types";
import {
  canonicalJson,
  ensureUser,
} from "./workspace-repository";
import {
  CAREER_EVIDENCE_POLICY_VERSION,
  type CareerEvidenceRoleInput,
  normalizeCareerEvidenceRole,
} from "./career-evidence-types";

type RuntimeEnv = {
  DB?: D1Database;
};

type StoredRole = {
  id: string;
  employer: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: number;
  location: string | null;
  summary: string | null;
  review_state: string;
  active_fact_id: string | null;
  latest_fact_id: string | null;
};

export type CareerEvidenceMutationResult = {
  roleId: string;
  changed: boolean;
  dependentStateInvalidated: boolean;
  message: string;
};

export const CAREER_EVIDENCE_ROLE_BY_USER_SQL =
  "SELECT er.id, er.employer, er.title, er.start_date, er.end_date, er.is_current, er.location, er.summary, er.review_state, (SELECT pf.id FROM experience_role_facts erf JOIN profile_facts pf ON pf.id = erf.profile_fact_id AND pf.user_id = erf.user_id WHERE erf.experience_role_id = er.id AND erf.user_id = er.user_id AND pf.invalidated_at IS NULL ORDER BY pf.updated_at DESC, pf.created_at DESC LIMIT 1) AS active_fact_id, (SELECT pf.id FROM experience_role_facts erf JOIN profile_facts pf ON pf.id = erf.profile_fact_id AND pf.user_id = erf.user_id WHERE erf.experience_role_id = er.id AND erf.user_id = er.user_id ORDER BY pf.updated_at DESC, pf.created_at DESC LIMIT 1) AS latest_fact_id FROM experience_roles er WHERE er.id = ? AND er.user_id = ? LIMIT 1";

export const CAREER_EVIDENCE_UPDATE_ROLE_BY_USER_SQL =
  "UPDATE experience_roles SET employer = ?, title = ?, start_date = ?, end_date = ?, is_current = ?, location = ?, summary = ?, review_state = 'confirmed', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ? AND review_state <> 'removed'";

export const CAREER_EVIDENCE_REMOVE_ROLE_BY_USER_SQL =
  "UPDATE experience_roles SET review_state = 'removed', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ? AND review_state <> 'removed'";

export const CAREER_EVIDENCE_RESTORE_ROLE_BY_USER_SQL =
  "UPDATE experience_roles SET review_state = 'confirmed', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ? AND review_state = 'removed'";

export const CAREER_EVIDENCE_INVALIDATE_ANALYSES_SQL =
  "UPDATE job_analyses SET validation_state = 'invalidated', invalidated_at = unixepoch() * 1000 WHERE user_id = ? AND invalidated_at IS NULL";

export const CAREER_EVIDENCE_SUPERSEDE_PROFILE_RESUMES_SQL =
  "UPDATE resumes SET review_state = 'superseded', updated_at = unixepoch() * 1000 WHERE user_id = ? AND review_state <> 'superseded' AND json_valid(content_json) AND json_extract(content_json, '$.provenance.source') = 'approved_profile'";

export const CAREER_EVIDENCE_INVALIDATE_PROFILE_ASSETS_SQL =
  "UPDATE generated_assets SET invalidated_at = unixepoch() * 1000, updated_at = unixepoch() * 1000 WHERE user_id = ? AND invalidated_at IS NULL AND generation_policy_version = 'deterministic-approved-profile-v1'";

export const CAREER_EVIDENCE_INVALIDATE_RENDERED_ASSETS_SQL =
  "UPDATE generated_assets SET invalidated_at = unixepoch() * 1000, updated_at = unixepoch() * 1000 WHERE user_id = ? AND invalidated_at IS NULL AND generation_policy_version = 'client-render-receipt-v1' AND json_valid(source_versions_json) AND (EXISTS (SELECT 1 FROM resumes r WHERE r.user_id = ? AND r.id = json_extract(generated_assets.source_versions_json, '$.semanticResumeId') AND r.review_state = 'superseded' AND json_valid(r.content_json) AND json_extract(r.content_json, '$.provenance.source') = 'approved_profile') OR EXISTS (SELECT 1 FROM generated_assets semantic WHERE semantic.user_id = ? AND semantic.id = json_extract(generated_assets.source_versions_json, '$.semanticCoverLetterId') AND semantic.invalidated_at IS NOT NULL))";

export const CAREER_EVIDENCE_SUPERSEDE_PACKAGES_SQL =
  "UPDATE pursuit_packages SET readiness_state = 'superseded', superseded_at = unixepoch() * 1000 WHERE user_id = ? AND readiness_state <> 'superseded'";

export const CAREER_EVIDENCE_RESET_PURSUITS_SQL =
  "UPDATE pursuits SET current_analysis_id = NULL, external_approval_state = CASE WHEN external_approval_state IN ('requested', 'approved') THEN 'revoked' ELSE external_approval_state END, next_action = CASE WHEN state NOT IN ('applied', 'interviewing', 'closed') THEN 'Your confirmed career evidence changed. Re-run the job decision and rebuild profile-based documents before requesting any external action.' ELSE next_action END, updated_at = unixepoch() * 1000 WHERE user_id = ? AND (current_analysis_id IS NOT NULL OR external_approval_state IN ('requested', 'approved'))";

function database(): D1Database {
  const db = (env as unknown as RuntimeEnv).DB;
  if (!db) throw new Error("Way Ahead storage is unavailable.");
  return db;
}

function sameRole(
  stored: StoredRole,
  role: CareerEvidenceRoleInput,
): boolean {
  return (
    stored.employer === role.employer &&
    stored.title === role.title &&
    stored.start_date === role.startDate &&
    stored.end_date === role.endDate &&
    Boolean(stored.is_current) === role.isCurrent &&
    stored.location === role.location &&
    stored.summary === role.summary &&
    stored.review_state === "confirmed" &&
    Boolean(stored.active_fact_id)
  );
}

function dependentInvalidationStatements(
  db: D1Database,
  userId: string,
): D1PreparedStatement[] {
  return [
    db
      .prepare(CAREER_EVIDENCE_INVALIDATE_ANALYSES_SQL)
      .bind(userId),
    db
      .prepare(CAREER_EVIDENCE_INVALIDATE_PROFILE_ASSETS_SQL)
      .bind(userId),
    db
      .prepare(CAREER_EVIDENCE_SUPERSEDE_PROFILE_RESUMES_SQL)
      .bind(userId),
    db
      .prepare(CAREER_EVIDENCE_INVALIDATE_RENDERED_ASSETS_SQL)
      .bind(userId, userId, userId),
    db
      .prepare(CAREER_EVIDENCE_SUPERSEDE_PACKAGES_SQL)
      .bind(userId),
    db
      .prepare(CAREER_EVIDENCE_RESET_PURSUITS_SQL)
      .bind(userId),
  ];
}

function roleFactValue(role: CareerEvidenceRoleInput): string {
  return canonicalJson({
    employer: role.employer,
    title: role.title,
    startDate: role.startDate,
    endDate: role.endDate,
    isCurrent: role.isCurrent,
    location: role.location,
    summary: role.summary,
  });
}

function roleFactStatements(
  db: D1Database,
  userId: string,
  roleId: string,
  role: CareerEvidenceRoleInput,
  supersedesFactId: string | null,
  sourceSpan: string,
): D1PreparedStatement[] {
  const factId = `fact_role_${crypto.randomUUID()}`;
  return [
    db
      .prepare(
        "UPDATE profile_facts SET invalidated_at = unixepoch() * 1000, updated_at = unixepoch() * 1000 WHERE user_id = ? AND invalidated_at IS NULL AND id IN (SELECT profile_fact_id FROM experience_role_facts WHERE user_id = ? AND experience_role_id = ?)",
      )
      .bind(userId, userId, roleId),
    db
      .prepare(
        "INSERT INTO profile_facts (id, user_id, fact_type, value_json, source_span, extraction_method, extraction_policy_version, state, ownership, supersedes_fact_id) VALUES (?, ?, 'experience_role', ?, ?, 'manual_entry', ?, 'user_confirmed', 'owned', ?)",
      )
      .bind(
        factId,
        userId,
        roleFactValue(role),
        sourceSpan,
        CAREER_EVIDENCE_POLICY_VERSION,
        supersedesFactId,
      ),
    db
      .prepare(
        "INSERT INTO experience_role_facts (user_id, experience_role_id, profile_fact_id, relationship) VALUES (?, ?, ?, 'primary_source')",
      )
      .bind(userId, roleId, factId),
  ];
}

function auditStatement(
  db: D1Database,
  userId: string,
  email: string,
  eventType: string,
  roleId: string,
  metadata: Record<string, unknown>,
): D1PreparedStatement {
  return db
    .prepare(
      "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, 'experience_role', ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      userId,
      `chatgpt:${email}`,
      eventType,
      roleId,
      canonicalJson({
        ...metadata,
        policyVersion: CAREER_EVIDENCE_POLICY_VERSION,
        externalActionAuthorized: false,
      }),
    );
}

export async function upsertCareerEvidenceRole(
  actor: FounderActor,
  roleId: string | null,
  role: CareerEvidenceRoleInput,
): Promise<CareerEvidenceMutationResult> {
  const user = await ensureUser(actor);
  const db = database();
  const existing = roleId
    ? await db
        .prepare(CAREER_EVIDENCE_ROLE_BY_USER_SQL)
        .bind(roleId, user.id)
        .first<StoredRole>()
    : null;
  if (roleId && !existing) {
    throw new Error("This role is not available in your Career Profile.");
  }
  if (existing?.review_state === "removed") {
    throw new Error("Restore this role before editing it.");
  }
  if (existing && sameRole(existing, role)) {
    return {
      roleId: existing.id,
      changed: false,
      dependentStateInvalidated: false,
      message: "No Career Evidence changes were needed.",
    };
  }

  const storedRoleId = existing
    ? existing.id
    : `role_${crypto.randomUUID().replaceAll("-", "")}`;
  const roleWrite = existing
    ? db
        .prepare(CAREER_EVIDENCE_UPDATE_ROLE_BY_USER_SQL)
        .bind(
          role.employer,
          role.title,
          role.startDate,
          role.endDate,
          role.isCurrent ? 1 : 0,
          role.location,
          role.summary,
          storedRoleId,
          user.id,
        )
    : db
        .prepare(
          "INSERT INTO experience_roles (id, user_id, employer, title, start_date, end_date, is_current, location, summary, review_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')",
        )
        .bind(
          storedRoleId,
          user.id,
          role.employer,
          role.title,
          role.startDate,
          role.endDate,
          role.isCurrent ? 1 : 0,
          role.location,
          role.summary,
        );

  await db.batch([
    roleWrite,
    ...roleFactStatements(
      db,
      user.id,
      storedRoleId,
      role,
      existing?.latest_fact_id ?? null,
      existing
        ? "Career Profile member correction"
        : "Career Profile member manual entry",
    ),
    ...dependentInvalidationStatements(db, user.id),
    auditStatement(
      db,
      user.id,
      user.email,
      existing
        ? "career_evidence_role_corrected"
        : "career_evidence_role_added",
      storedRoleId,
      {
        source: "member_manual_entry",
        reviewState: "confirmed",
        dependentStateInvalidated: true,
      },
    ),
  ]);

  return {
    roleId: storedRoleId,
    changed: true,
    dependentStateInvalidated: true,
    message: existing
      ? "Role updated. Dependent decisions and profile-built documents now require review."
      : "Role added. Dependent decisions and profile-built documents now require review.",
  };
}

export async function removeCareerEvidenceRole(
  actor: FounderActor,
  roleId: string,
): Promise<CareerEvidenceMutationResult> {
  const user = await ensureUser(actor);
  const db = database();
  const existing = await db
    .prepare(CAREER_EVIDENCE_ROLE_BY_USER_SQL)
    .bind(roleId, user.id)
    .first<StoredRole>();
  if (!existing || existing.review_state === "removed") {
    throw new Error("This role is not available in your Career Profile.");
  }

  await db.batch([
    db
      .prepare(CAREER_EVIDENCE_REMOVE_ROLE_BY_USER_SQL)
      .bind(roleId, user.id),
    db
      .prepare(
        "UPDATE profile_facts SET invalidated_at = unixepoch() * 1000, updated_at = unixepoch() * 1000 WHERE user_id = ? AND invalidated_at IS NULL AND id IN (SELECT profile_fact_id FROM experience_role_facts WHERE user_id = ? AND experience_role_id = ?)",
      )
      .bind(user.id, user.id, roleId),
    ...dependentInvalidationStatements(db, user.id),
    auditStatement(
      db,
      user.id,
      user.email,
      "career_evidence_role_removed",
      roleId,
      {
        recoverable: true,
        dependentStateInvalidated: true,
      },
    ),
  ]);

  return {
    roleId,
    changed: true,
    dependentStateInvalidated: true,
    message:
      "Role removed from active Career Evidence. You can restore it below.",
  };
}

export async function restoreCareerEvidenceRole(
  actor: FounderActor,
  roleId: string,
): Promise<CareerEvidenceMutationResult> {
  const user = await ensureUser(actor);
  const db = database();
  const existing = await db
    .prepare(CAREER_EVIDENCE_ROLE_BY_USER_SQL)
    .bind(roleId, user.id)
    .first<StoredRole>();
  if (!existing || existing.review_state !== "removed") {
    throw new Error("This removed role is not available to restore.");
  }
  if (!existing.start_date) {
    throw new Error("Add a valid start month before restoring this role.");
  }
  const role = normalizeCareerEvidenceRole({
    employer: existing.employer,
    title: existing.title,
    startDate: existing.start_date.slice(0, 7),
    endDate: existing.end_date?.slice(0, 7) ?? null,
    isCurrent: Boolean(existing.is_current),
    location: existing.location,
    summary: existing.summary,
  });

  await db.batch([
    db
      .prepare(CAREER_EVIDENCE_RESTORE_ROLE_BY_USER_SQL)
      .bind(roleId, user.id),
    db
      .prepare(CAREER_EVIDENCE_UPDATE_ROLE_BY_USER_SQL)
      .bind(
        role.employer,
        role.title,
        role.startDate,
        role.endDate,
        role.isCurrent ? 1 : 0,
        role.location,
        role.summary,
        roleId,
        user.id,
      ),
    ...roleFactStatements(
      db,
      user.id,
      roleId,
      role,
      existing.latest_fact_id,
      "Career Profile member-restored manual entry",
    ),
    ...dependentInvalidationStatements(db, user.id),
    auditStatement(
      db,
      user.id,
      user.email,
      "career_evidence_role_restored",
      roleId,
      {
        source: "member_restored_manual_entry",
        reviewState: "confirmed",
        dependentStateInvalidated: true,
      },
    ),
  ]);

  return {
    roleId,
    changed: true,
    dependentStateInvalidated: true,
    message:
      "Role restored. Dependent decisions and profile-built documents now require review.",
  };
}
