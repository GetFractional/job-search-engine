import { env } from "cloudflare:workers";
import type { FounderActor } from "./production-types";
import {
  defaultDocumentDesign,
  emptyCoverLetterContent,
  emptyResumeContent,
  type CoverLetterContent,
  type CoverLetterStudioRecord,
  type DocumentAccent,
  type DocumentDensity,
  type DocumentPursuitOption,
  type DocumentTemplateKey,
  type ResumeCareerPathOption,
  type ResumeContent,
  type ResumeJobOption,
  type ResumeStudioRecord,
} from "./document-types";
import { canonicalJson, ensureUser, sha256Hex } from "./workspace-repository";

type RuntimeEnv = { DB?: D1Database };

type ResumeRow = {
  id: string;
  name: string;
  kind: ResumeStudioRecord["kind"];
  version: number;
  content_json: string;
  template_key: string;
  review_state: ResumeStudioRecord["reviewState"];
  updated_at: number;
  assignment_scope: "default" | "path" | "job" | null;
  career_path_id: string | null;
  job_posting_id: string | null;
};

type CoverLetterRow = {
  id: string;
  pursuit_id: string;
  version: number;
  filename: string | null;
  content_json: string | null;
  review_state: CoverLetterStudioRecord["reviewState"];
  updated_at: number;
  employer: string;
  role_title: string;
};

type AssignmentInput = {
  scope: "default" | "path" | "job";
  careerPathId?: string | null;
  jobPostingId?: string | null;
};

function database(): D1Database {
  const db = (env as unknown as RuntimeEnv).DB;
  if (!db) throw new Error("Way Ahead storage is unavailable.");
  return db;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function boundedString(
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

function isTemplate(value: unknown): value is DocumentTemplateKey {
  return value === "executive" || value === "classic" || value === "modern";
}

function isDensity(value: unknown): value is DocumentDensity {
  return value === "comfortable" || value === "compact";
}

function isAccent(value: unknown): value is DocumentAccent {
  return value === "forest" || value === "navy" || value === "charcoal";
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function renderReceipt(
  value: {
    format: unknown;
    filename: unknown;
    fileSha256: unknown;
    pageCount: unknown;
    rendererVersion: unknown;
  },
): {
  format: "pdf" | "docx";
  filename: string;
  fileSha256: string;
  pageCount: number | null;
  rendererVersion: "way-ahead-pdf-v1" | "way-ahead-docx-v1";
} {
  const format = value.format;
  if (format !== "pdf" && format !== "docx") {
    throw new Error("Choose PDF or DOCX.");
  }
  const rendererVersion = value.rendererVersion;
  if (
    rendererVersion !== "way-ahead-pdf-v1" &&
    rendererVersion !== "way-ahead-docx-v1"
  ) {
    throw new Error("The document renderer is not supported.");
  }
  if (!isSha256(value.fileSha256)) {
    throw new Error("The rendered file receipt is incomplete.");
  }
  const filename = boundedString(value.filename, "Filename", 200, true);
  if (!filename.toLowerCase().endsWith(`.${format}`)) {
    throw new Error("The filename does not match the rendered format.");
  }
  const pageCount =
    value.pageCount === null || value.pageCount === undefined
      ? null
      : typeof value.pageCount === "number" &&
          Number.isInteger(value.pageCount) &&
          value.pageCount > 0 &&
          value.pageCount <= 12
        ? value.pageCount
        : (() => {
            throw new Error("The rendered page count is not valid.");
          })();
  if (format === "pdf" && pageCount === null) {
    throw new Error("A PDF page count is required.");
  }
  return {
    format,
    filename,
    fileSha256: value.fileSha256.toLowerCase(),
    pageCount,
    rendererVersion,
  };
}

function normalizeDesign(value: unknown) {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    templateKey: isTemplate(input.templateKey)
      ? input.templateKey
      : defaultDocumentDesign.templateKey,
    density: isDensity(input.density)
      ? input.density
      : defaultDocumentDesign.density,
    accent: isAccent(input.accent)
      ? input.accent
      : defaultDocumentDesign.accent,
    fontScale:
      input.fontScale === 95 || input.fontScale === 100 || input.fontScale === 105
        ? input.fontScale
        : defaultDocumentDesign.fontScale,
  } as const;
}

export function normalizeResumeContent(
  value: unknown,
  trustStoredProvenance = false,
): ResumeContent {
  if (!value || typeof value !== "object") {
    throw new Error("Resume content is required.");
  }
  const input = value as Record<string, unknown>;
  const rawExperiences = Array.isArray(input.experiences)
    ? input.experiences
    : [];
  if (rawExperiences.length > 30) {
    throw new Error("A resume can contain at most 30 roles.");
  }
  const experiences = rawExperiences.map((raw, roleIndex) => {
    if (!raw || typeof raw !== "object") {
      throw new Error(`Role ${roleIndex + 1} is not valid.`);
    }
    const role = raw as Record<string, unknown>;
    const rawBullets = Array.isArray(role.bullets) ? role.bullets : [];
    if (rawBullets.length > 30) {
      throw new Error(`Role ${roleIndex + 1} has too many bullets.`);
    }
    return {
      id:
        typeof role.id === "string" && role.id
          ? role.id.slice(0, 100)
          : crypto.randomUUID(),
      employer: boundedString(
        role.employer ?? "",
        `Role ${roleIndex + 1} employer`,
        160,
      ),
      title: boundedString(
        role.title ?? "",
        `Role ${roleIndex + 1} title`,
        160,
      ),
      startDate: boundedString(
        role.startDate ?? "",
        `Role ${roleIndex + 1} start date`,
        40,
      ),
      endDate: boundedString(
        role.endDate ?? "",
        `Role ${roleIndex + 1} end date`,
        40,
      ),
      location: boundedString(
        role.location ?? "",
        `Role ${roleIndex + 1} location`,
        160,
      ),
      summary: boundedString(
        role.summary ?? "",
        `Role ${roleIndex + 1} summary`,
        2_000,
      ),
      bullets: rawBullets
        .map((bullet, bulletIndex) =>
          boundedString(
            bullet,
            `Role ${roleIndex + 1} bullet ${bulletIndex + 1}`,
            700,
          ),
        )
        .filter(Boolean),
    };
  });
  const rawGroups = Array.isArray(input.skillGroups) ? input.skillGroups : [];
  if (rawGroups.length > 20) throw new Error("Too many skill groups.");
  const skillGroups = rawGroups.map((raw, groupIndex) => {
    if (!raw || typeof raw !== "object") {
      throw new Error(`Skill group ${groupIndex + 1} is not valid.`);
    }
    const group = raw as Record<string, unknown>;
    const rawSkills = Array.isArray(group.skills) ? group.skills : [];
    if (rawSkills.length > 100) {
      throw new Error(`Skill group ${groupIndex + 1} has too many skills.`);
    }
    return {
      id:
        typeof group.id === "string" && group.id
          ? group.id.slice(0, 100)
          : crypto.randomUUID(),
      label: boundedString(
        group.label ?? "",
        `Skill group ${groupIndex + 1} label`,
        100,
      ),
      skills: rawSkills
        .map((skill, skillIndex) =>
          boundedString(
            skill,
            `Skill group ${groupIndex + 1} item ${skillIndex + 1}`,
            100,
          ),
        )
        .filter(Boolean),
    };
  });
  return {
    schemaVersion: 1,
    targetTitle: boundedString(
      input.targetTitle ?? "",
      "Target title",
      160,
    ),
    summary: boundedString(input.summary ?? "", "Professional summary", 4_000),
    location: boundedString(input.location ?? "", "Location", 160),
    experiences,
    skillGroups,
    design: normalizeDesign(input.design),
    provenance: {
      source:
        trustStoredProvenance &&
        (input.provenance as { source?: unknown } | undefined)?.source ===
        "approved_profile"
          ? "approved_profile"
          : "user_authored",
      unresolvedItems: trustStoredProvenance &&
        Array.isArray(
          (input.provenance as { unresolvedItems?: unknown } | undefined)
            ?.unresolvedItems,
        )
        ? (
            (input.provenance as { unresolvedItems: unknown[] })
              .unresolvedItems
          )
            .filter((item): item is string => typeof item === "string")
            .slice(0, 20)
        : [
            "User-edited content must be reviewed before this version can be used in an application package.",
          ],
    },
  };
}

export function normalizeCoverLetterContent(
  value: unknown,
  trustStoredProvenance = false,
): CoverLetterContent {
  if (!value || typeof value !== "object") {
    throw new Error("Cover letter content is required.");
  }
  const input = value as Record<string, unknown>;
  const rawParagraphs = Array.isArray(input.paragraphs)
    ? input.paragraphs
    : [];
  if (rawParagraphs.length < 1 || rawParagraphs.length > 8) {
    throw new Error("Use between one and eight cover-letter paragraphs.");
  }
  return {
    schemaVersion: 1,
    employer: boundedString(input.employer ?? "", "Employer", 160, true),
    roleTitle: boundedString(input.roleTitle ?? "", "Role title", 160, true),
    salutation: boundedString(
      input.salutation ?? "",
      "Salutation",
      160,
      true,
    ),
    paragraphs: rawParagraphs.map((paragraph, index) =>
      boundedString(paragraph, `Paragraph ${index + 1}`, 2_500),
    ),
    closing: boundedString(input.closing ?? "", "Closing", 400, true),
    signoff: boundedString(input.signoff ?? "", "Signoff", 160, true),
    design: normalizeDesign(input.design),
    provenance: {
      source: trustStoredProvenance &&
        (
          (input.provenance as { source?: unknown } | undefined)?.source ===
            "approved_profile" ||
          (input.provenance as { source?: unknown } | undefined)?.source ===
            "approved_profile_and_posting"
        )
        ? (
            input.provenance as {
              source: "approved_profile" | "approved_profile_and_posting";
            }
          ).source
        : "user_authored",
      unresolvedItems: trustStoredProvenance && Array.isArray(
        (input.provenance as { unresolvedItems?: unknown } | undefined)
          ?.unresolvedItems,
      )
        ? (
            (input.provenance as { unresolvedItems: unknown[] })
              .unresolvedItems
          )
            .filter((item): item is string => typeof item === "string")
            .slice(0, 20)
        : [
            "User-edited content must be reviewed before this version can be used in an application package.",
          ],
    },
  };
}

function toResumeRecord(row: ResumeRow): ResumeStudioRecord {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    version: row.version,
    content: normalizeResumeContent(
      parseJson(row.content_json, emptyResumeContent()),
      true,
    ),
    templateKey: isTemplate(row.template_key)
      ? row.template_key
      : "executive",
    reviewState: row.review_state,
    assignment: row.assignment_scope
      ? {
          scope: row.assignment_scope,
          careerPathId: row.career_path_id,
          jobPostingId: row.job_posting_id,
        }
      : null,
    updatedAt: row.updated_at,
  };
}

function toCoverLetterRecord(row: CoverLetterRow): CoverLetterStudioRecord {
  const raw = parseJson<Record<string, unknown>>(row.content_json, {});
  let content: CoverLetterContent;
  try {
    content = normalizeCoverLetterContent(raw, true);
  } catch {
    const legacyBody = [raw.body, raw.text, raw.letter, raw.content].find(
      (value): value is string => typeof value === "string" && Boolean(value.trim()),
    );
    content = {
      ...emptyCoverLetterContent(),
      employer: row.employer,
      roleTitle: row.role_title,
      paragraphs: legacyBody
        ? legacyBody
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
        : [""],
      provenance: {
        source: "user_authored",
        unresolvedItems: [
          "This earlier asset needs review in the structured editor before approval.",
        ],
      },
    };
  }
  return {
    id: row.id,
    pursuitId: row.pursuit_id,
    version: row.version,
    filename: row.filename,
    content,
    reviewState: row.review_state,
    updatedAt: row.updated_at,
  };
}

export async function listResumeStudio(actor: FounderActor): Promise<{
  displayName: string;
  resumes: ResumeStudioRecord[];
  careerPaths: ResumeCareerPathOption[];
  jobs: ResumeJobOption[];
}> {
  const user = await ensureUser(actor);
  const db = database();
  const [resumeRows, pathRows, jobRows] = await Promise.all([
    db
      .prepare(
        "SELECT r.id, r.name, r.kind, r.version, r.content_json, r.template_key, r.review_state, r.updated_at, ra.scope AS assignment_scope, ra.career_path_id, ra.job_posting_id FROM resumes r LEFT JOIN resume_assignments ra ON ra.resume_id = r.id AND ra.user_id = r.user_id WHERE r.user_id = ? ORDER BY r.updated_at DESC, r.version DESC",
      )
      .bind(user.id)
      .all<ResumeRow>(),
    db
      .prepare(
        "SELECT id, label, state FROM career_paths WHERE user_id = ? AND state <> 'rejected' ORDER BY is_primary DESC, label",
      )
      .bind(user.id)
      .all<ResumeCareerPathOption>(),
    db
      .prepare(
        "SELECT DISTINCT jp.id, jp.employer, jp.title, jp.freshness_state FROM pursuits p JOIN job_postings jp ON jp.id = p.job_posting_id WHERE p.user_id = ? AND p.state <> 'closed' AND jp.removed_at IS NULL ORDER BY p.updated_at DESC",
      )
      .bind(user.id)
      .all<{
        id: string;
        employer: string;
        title: string;
        freshness_state: ResumeJobOption["freshnessState"];
      }>(),
  ]);
  return {
    displayName: user.display_name ?? actor.displayName,
    resumes: resumeRows.results.map(toResumeRecord),
    careerPaths: pathRows.results,
    jobs: jobRows.results.map((job) => ({
      id: job.id,
      employer: job.employer,
      title: job.title,
      freshnessState: job.freshness_state,
    })),
  };
}

async function nextResumeVersion(
  db: D1Database,
  userId: string,
  name: string,
): Promise<number> {
  const row = await db
    .prepare(
      "SELECT coalesce(max(version), 0) AS version FROM resumes WHERE user_id = ? AND name = ?",
    )
    .bind(userId, name)
    .first<{ version: number }>();
  return (row?.version ?? 0) + 1;
}

async function validateAssignment(
  db: D1Database,
  userId: string,
  assignment: AssignmentInput,
) {
  if (assignment.scope === "path") {
    if (!assignment.careerPathId) {
      throw new Error("Choose a Job Path for this resume.");
    }
    const owned = await db
      .prepare("SELECT id FROM career_paths WHERE id = ? AND user_id = ?")
      .bind(assignment.careerPathId, userId)
      .first();
    if (!owned) throw new Error("That Job Path is not available.");
  }
  if (assignment.scope === "job") {
    if (!assignment.jobPostingId) {
      throw new Error("Choose a pursuit for this resume.");
    }
    const owned = await db
      .prepare(
        "SELECT p.id FROM pursuits p WHERE p.user_id = ? AND p.job_posting_id = ? AND p.state <> 'closed'",
      )
      .bind(userId, assignment.jobPostingId)
      .first();
    if (!owned) throw new Error("That pursuit is not available.");
  }
}

async function assignmentStatementForResume(
  db: D1Database,
  userId: string,
  resumeId: string,
  assignment: AssignmentInput,
): Promise<D1PreparedStatement> {
  await validateAssignment(db, userId, assignment);
  const careerPathId =
    assignment.scope === "path" ? assignment.careerPathId ?? null : null;
  const jobPostingId =
    assignment.scope === "job" ? assignment.jobPostingId ?? null : null;
  const existing = await db
    .prepare(
      "SELECT id FROM resume_assignments WHERE user_id = ? AND scope = ? AND coalesce(career_path_id, '') = coalesce(?, '') AND coalesce(job_posting_id, '') = coalesce(?, '') LIMIT 1",
    )
    .bind(userId, assignment.scope, careerPathId, jobPostingId)
    .first<{ id: string }>();
  if (existing) {
    return db
      .prepare(
        "UPDATE resume_assignments SET resume_id = ? WHERE id = ? AND user_id = ?",
      )
      .bind(resumeId, existing.id, userId);
  }
  return db
    .prepare(
      "INSERT INTO resume_assignments (id, user_id, resume_id, scope, career_path_id, job_posting_id) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      userId,
      resumeId,
      assignment.scope,
      careerPathId,
      jobPostingId,
    );
}

export async function createBlankResume(
  actor: FounderActor,
): Promise<ResumeStudioRecord> {
  return saveResumeVersion(actor, {
    sourceResumeId: null,
    name: "Master Resume",
    kind: "master",
    content: emptyResumeContent(),
    assignment: { scope: "default" },
  });
}

async function resumeContentFromConfirmedProfile(
  db: D1Database,
  userId: string,
): Promise<ResumeContent> {
  const [facts, roles, bullets, profileSkills] = await Promise.all([
    db
      .prepare(
        "SELECT fact_type, value_json FROM profile_facts WHERE user_id = ? AND state IN ('user_confirmed', 'user_corrected') AND invalidated_at IS NULL",
      )
      .bind(userId)
      .all<{ fact_type: string; value_json: string }>(),
    db
      .prepare(
        "SELECT id, employer, title, start_date, end_date, location, summary FROM experience_roles WHERE user_id = ? AND review_state = 'confirmed' ORDER BY is_current DESC, start_date DESC",
      )
      .bind(userId)
      .all<{
        id: string;
        employer: string;
        title: string;
        start_date: string | null;
        end_date: string | null;
        location: string | null;
        summary: string | null;
      }>(),
    db
      .prepare(
        "SELECT experience_role_id, text FROM achievement_bullets WHERE user_id = ? AND approval_state = 'approved' AND metrics_state <> 'do_not_use' ORDER BY created_at",
      )
      .bind(userId)
      .all<{ experience_role_id: string | null; text: string }>(),
    db
      .prepare(
        "SELECT s.canonical_name, s.category FROM profile_skills ps JOIN skills s ON s.id = ps.skill_id WHERE ps.user_id = ? AND ps.review_state = 'confirmed' ORDER BY s.category, s.canonical_name",
      )
      .bind(userId)
      .all<{ canonical_name: string; category: string }>(),
  ]);
  if (!roles.results.length) {
    throw new Error(
      "Confirm at least one experience role in Career Profile before building a resume.",
    );
  }
  const factValue = (type: string) => {
    const fact = facts.results.find((item) => item.fact_type === type);
    const parsed = parseJson<{ value?: unknown }>(fact?.value_json, {});
    return typeof parsed.value === "string" ? parsed.value : "";
  };
  const groupedSkills = new Map<string, string[]>();
  for (const skill of profileSkills.results) {
    const group = groupedSkills.get(skill.category) ?? [];
    group.push(skill.canonical_name);
    groupedSkills.set(skill.category, group);
  }
  return {
    ...emptyResumeContent(),
    targetTitle: factValue("headline"),
    summary: factValue("professional_summary"),
    location: factValue("location"),
    experiences: roles.results.map((role) => ({
      id: role.id,
      employer: role.employer,
      title: role.title,
      startDate: role.start_date ?? "",
      endDate: role.end_date ?? "",
      location: role.location ?? "",
      summary: role.summary ?? "",
      bullets: bullets.results
        .filter((bullet) => bullet.experience_role_id === role.id)
        .map((bullet) => bullet.text),
    })),
    skillGroups: [...groupedSkills].map(([label, skills]) => ({
      id: crypto.randomUUID(),
      label,
      skills,
    })),
    provenance: { source: "approved_profile", unresolvedItems: [] },
  };
}

export async function createResumeFromProfile(
  actor: FounderActor,
): Promise<ResumeStudioRecord> {
  const user = await ensureUser(actor);
  const content = await resumeContentFromConfirmedProfile(database(), user.id);
  return saveResumeVersion(actor, {
    sourceResumeId: null,
    name: "Master Resume",
    kind: "master",
    content,
    assignment: { scope: "default" },
    trustedStarterSource: "approved_profile",
  });
}

export async function createJobResumeFromProfile(
  actor: FounderActor,
  jobPostingId: string,
): Promise<ResumeStudioRecord> {
  const user = await ensureUser(actor);
  const db = database();
  const pursuit = await db
    .prepare(
      "SELECT p.id, jp.id AS job_posting_id, jp.employer, jp.title FROM pursuits p JOIN job_postings jp ON jp.id = p.job_posting_id WHERE p.user_id = ? AND p.job_posting_id = ? AND p.state <> 'closed' AND jp.removed_at IS NULL LIMIT 1",
    )
    .bind(user.id, jobPostingId)
    .first<{
      id: string;
      job_posting_id: string;
      employer: string;
      title: string;
    }>();
  if (!pursuit) throw new Error("Choose an active pursuit.");
  const existing = await db
    .prepare(
      "SELECT r.id FROM resumes r JOIN resume_assignments ra ON ra.resume_id = r.id AND ra.user_id = r.user_id WHERE r.user_id = ? AND ra.scope = 'job' AND ra.job_posting_id = ? AND r.review_state <> 'superseded' ORDER BY r.updated_at DESC, r.version DESC LIMIT 1",
    )
    .bind(user.id, pursuit.job_posting_id)
    .first<{ id: string }>();
  if (existing) {
    const studio = await listResumeStudio(actor);
    const record = studio.resumes.find((resume) => resume.id === existing.id);
    if (record) return record;
  }

  const content = await resumeContentFromConfirmedProfile(db, user.id);
  content.targetTitle = pursuit.title;
  const unresolvedItems = [
    "The target title comes from the current employer posting. Posting requirements have not been used to rewrite, select, or add career evidence.",
  ];
  content.provenance = {
    source: "approved_profile",
    unresolvedItems,
  };
  return saveResumeVersion(actor, {
    sourceResumeId: null,
    name: `${pursuit.employer} - ${pursuit.title} Resume`,
    kind: "job",
    content,
    assignment: {
      scope: "job",
      jobPostingId: pursuit.job_posting_id,
    },
    trustedStarterSource: "approved_profile",
    trustedStarterUnresolvedItems: unresolvedItems,
  });
}

export async function saveResumeVersion(
  actor: FounderActor,
  input: {
    sourceResumeId: string | null;
    name: string;
    kind: ResumeStudioRecord["kind"];
    content: unknown;
    assignment: AssignmentInput;
    trustedStarterSource?: "approved_profile";
    trustedStarterUnresolvedItems?: string[];
  },
): Promise<ResumeStudioRecord> {
  const user = await ensureUser(actor);
  const db = database();
  const name = boundedString(input.name, "Resume name", 120, true);
  if (!["master", "path", "job"].includes(input.kind)) {
    throw new Error("Choose a valid resume use.");
  }
  const content = normalizeResumeContent(input.content);
  if (input.trustedStarterSource === "approved_profile") {
    content.provenance = {
      source: "approved_profile",
      unresolvedItems: (input.trustedStarterUnresolvedItems ?? [])
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim())
        .slice(0, 20),
    };
  }
  await validateAssignment(db, user.id, input.assignment);
  if (input.sourceResumeId) {
    const source = await db
      .prepare(
        "SELECT r.id, r.name, r.kind, ra.scope, ra.career_path_id, ra.job_posting_id FROM resumes r LEFT JOIN resume_assignments ra ON ra.resume_id = r.id AND ra.user_id = r.user_id WHERE r.id = ? AND r.user_id = ?",
      )
      .bind(input.sourceResumeId, user.id)
      .first<{
        id: string;
        name: string;
        kind: ResumeStudioRecord["kind"];
        scope: AssignmentInput["scope"] | null;
        career_path_id: string | null;
        job_posting_id: string | null;
      }>();
    if (!source) throw new Error("That resume version is not available.");
    if (
      source.name !== name ||
      source.kind !== input.kind ||
      source.scope !== input.assignment.scope ||
      (source.career_path_id ?? null) !==
        (input.assignment.careerPathId ?? null) ||
      (source.job_posting_id ?? null) !==
        (input.assignment.jobPostingId ?? null)
    ) {
      throw new Error(
        "Save as a new resume to change its name, Job Path, or job assignment.",
      );
    }
  }
  const version = await nextResumeVersion(db, user.id, name);
  const id = `resume_${crypto.randomUUID()}`;
  const assignmentStatement = await assignmentStatementForResume(
    db,
    user.id,
    id,
    input.assignment,
  );
  const finalStatements: D1PreparedStatement[] = [
    db
      .prepare(
        "INSERT INTO resumes (id, user_id, name, kind, version, content_json, template_key, review_state) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')",
      )
      .bind(
        id,
        user.id,
        name,
        input.kind,
        version,
        JSON.stringify(content),
        content.design.templateKey,
      ),
    assignmentStatement,
  ];
  if (input.sourceResumeId) {
    finalStatements.push(
      db
        .prepare(
          "UPDATE resumes SET review_state = 'superseded', updated_at = unixepoch() * 1000 WHERE id = ? AND user_id = ?",
        )
        .bind(input.sourceResumeId, user.id),
      db
        .prepare(
          "UPDATE pursuit_packages SET readiness_state = 'superseded', superseded_at = unixepoch() * 1000 WHERE user_id = ? AND readiness_state <> 'superseded' AND EXISTS (SELECT 1 FROM json_each(pursuit_packages.asset_manifest_json, '$.assets') manifest JOIN generated_assets asset ON asset.id = json_extract(manifest.value, '$.id') AND asset.user_id = pursuit_packages.user_id WHERE json_valid(asset.source_versions_json) AND json_extract(asset.source_versions_json, '$.semanticResumeId') = ?)",
        )
        .bind(user.id, input.sourceResumeId),
      db
        .prepare(
          "UPDATE generated_assets SET review_state = 'superseded', invalidated_at = unixepoch() * 1000, updated_at = unixepoch() * 1000 WHERE user_id = ? AND generation_policy_version = 'client-render-receipt-v1' AND invalidated_at IS NULL AND json_valid(source_versions_json) AND json_extract(source_versions_json, '$.semanticResumeId') = ?",
        )
        .bind(user.id, input.sourceResumeId),
    );
  }
  finalStatements.push(
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'resume_version_saved', 'resume', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        id,
        JSON.stringify({
          version,
          kind: input.kind,
          scope: input.assignment.scope,
        }),
      ),
  );
  await db.batch(finalStatements);
  const studio = await listResumeStudio(actor);
  const record = studio.resumes.find((resume) => resume.id === id);
  if (!record) throw new Error("The saved resume could not be read back.");
  return record;
}

export async function listCoverLetterStudio(actor: FounderActor): Promise<{
  displayName: string;
  letters: CoverLetterStudioRecord[];
  pursuits: DocumentPursuitOption[];
}> {
  const user = await ensureUser(actor);
  const db = database();
  const [letterRows, pursuitRows] = await Promise.all([
    db
      .prepare(
        "SELECT ga.id, ga.pursuit_id, ga.version, ga.filename, ga.content_json, ga.review_state, ga.updated_at, jp.employer, jp.title AS role_title FROM generated_assets ga JOIN pursuits p ON p.id = ga.pursuit_id AND p.user_id = ga.user_id JOIN job_postings jp ON jp.id = p.job_posting_id WHERE ga.user_id = ? AND ga.type = 'cover_letter' AND ga.pursuit_id IS NOT NULL AND ga.generation_policy_version <> 'client-render-receipt-v1' ORDER BY ga.updated_at DESC, ga.version DESC",
      )
      .bind(user.id)
      .all<CoverLetterRow>(),
    db
      .prepare(
        "SELECT p.id, p.state, jp.employer, jp.title AS role_title FROM pursuits p JOIN job_postings jp ON jp.id = p.job_posting_id WHERE p.user_id = ? AND p.state <> 'closed' AND jp.removed_at IS NULL ORDER BY p.updated_at DESC",
      )
      .bind(user.id)
      .all<{
        id: string;
        state: string;
        employer: string;
        role_title: string;
      }>(),
  ]);
  return {
    displayName: user.display_name ?? actor.displayName,
    letters: letterRows.results.map(toCoverLetterRecord),
    pursuits: pursuitRows.results.map((pursuit) => ({
      id: pursuit.id,
      employer: pursuit.employer,
      roleTitle: pursuit.role_title,
      state: pursuit.state,
    })),
  };
}

async function pursuitContext(
  db: D1Database,
  userId: string,
  pursuitId: string,
) {
  const row = await db
    .prepare(
      "SELECT p.id, p.job_posting_id, jp.employer, jp.title FROM pursuits p JOIN job_postings jp ON jp.id = p.job_posting_id WHERE p.id = ? AND p.user_id = ? AND p.state <> 'closed' AND jp.removed_at IS NULL LIMIT 1",
    )
    .bind(pursuitId, userId)
    .first<{
      id: string;
      job_posting_id: string;
      employer: string;
      title: string;
    }>();
  if (!row) throw new Error("Choose an active pursuit.");
  return row;
}

export async function createCoverLetterFromProfile(
  actor: FounderActor,
  pursuitId: string,
): Promise<CoverLetterStudioRecord> {
  const user = await ensureUser(actor);
  const db = database();
  const pursuit = await pursuitContext(db, user.id, pursuitId);
  const [summaryFact, role] = await Promise.all([
    db
      .prepare(
        "SELECT value_json FROM profile_facts WHERE user_id = ? AND fact_type = 'professional_summary' AND state IN ('user_confirmed', 'user_corrected') AND invalidated_at IS NULL ORDER BY updated_at DESC LIMIT 1",
      )
      .bind(user.id)
      .first<{ value_json: string }>(),
    db
      .prepare(
        "SELECT title, employer, summary FROM experience_roles WHERE user_id = ? AND review_state = 'confirmed' ORDER BY is_current DESC, start_date DESC LIMIT 1",
      )
      .bind(user.id)
      .first<{ title: string; employer: string; summary: string | null }>(),
  ]);
  const parsedSummary = parseJson<{ value?: unknown }>(
    summaryFact?.value_json,
    {},
  );
  const summary =
    typeof parsedSummary.value === "string" ? parsedSummary.value.trim() : "";
  if (!role) {
    throw new Error(
      "Confirm at least one experience role before building a cover letter.",
    );
  }
  const paragraphs = [
    summary
      ? `I am interested in the ${pursuit.title} role at ${pursuit.employer}. ${summary}`
      : `I am interested in the ${pursuit.title} role at ${pursuit.employer}.`,
  ];
  paragraphs.push(
    `My confirmed profile includes work as ${role.title} at ${role.employer}. I would tailor the relevant responsibilities and results to this role only after comparing the current posting with my verified evidence.`,
  );
  paragraphs.push(
    "I would welcome the opportunity to discuss how this experience could support the role’s current priorities.",
  );
  const content: CoverLetterContent = {
    ...emptyCoverLetterContent(),
    employer: pursuit.employer,
    roleTitle: pursuit.title,
    paragraphs,
    provenance: {
      source: "approved_profile",
      unresolvedItems: [
        "Only the selected employer and role title were used. The current posting requirements have not been used to tailor this outline.",
      ],
    },
  };
  return saveCoverLetterVersion(actor, {
    sourceLetterId: null,
    pursuitId,
    content,
    trustedStarterSource: "approved_profile",
  });
}

export async function ensurePursuitDocumentStarters(
  actor: FounderActor,
  input: {
    pursuitId: string;
    jobPostingId: string;
  },
): Promise<{
  resumeId: string;
  coverLetterId: string;
}> {
  const user = await ensureUser(actor);
  const db = database();
  const pursuit = await db
    .prepare(
      "SELECT id, job_posting_id FROM pursuits WHERE id = ? AND user_id = ? AND state <> 'closed' LIMIT 1",
    )
    .bind(input.pursuitId, user.id)
    .first<{ id: string; job_posting_id: string }>();
  if (!pursuit || pursuit.job_posting_id !== input.jobPostingId) {
    throw new Error("That pursuit is not available in your workspace.");
  }

  const [existingResume, existingLetter] = await Promise.all([
    db
      .prepare(
        "SELECT r.id FROM resumes r JOIN resume_assignments ra ON ra.resume_id = r.id AND ra.user_id = r.user_id WHERE r.user_id = ? AND ra.scope = 'job' AND ra.job_posting_id = ? AND r.review_state <> 'superseded' ORDER BY r.updated_at DESC, r.version DESC LIMIT 1",
      )
      .bind(user.id, input.jobPostingId)
      .first<{ id: string }>(),
    db
      .prepare(
        "SELECT id FROM generated_assets WHERE user_id = ? AND pursuit_id = ? AND type = 'cover_letter' AND generation_policy_version <> 'client-render-receipt-v1' AND invalidated_at IS NULL AND review_state <> 'superseded' ORDER BY updated_at DESC, version DESC LIMIT 1",
      )
      .bind(user.id, input.pursuitId)
      .first<{ id: string }>(),
  ]);
  const resume = existingResume
    ? (await listResumeStudio(actor)).resumes.find(
        (record) => record.id === existingResume.id,
      ) ?? (await createJobResumeFromProfile(actor, input.jobPostingId))
    : await createJobResumeFromProfile(actor, input.jobPostingId);
  const letter = existingLetter
    ? (await listCoverLetterStudio(actor)).letters.find(
        (record) => record.id === existingLetter.id,
      ) ?? (await createCoverLetterFromProfile(actor, input.pursuitId))
    : await createCoverLetterFromProfile(actor, input.pursuitId);
  return {
    resumeId: resume.id,
    coverLetterId: letter.id,
  };
}

export async function saveCoverLetterVersion(
  actor: FounderActor,
  input: {
    sourceLetterId: string | null;
    pursuitId: string;
    content: unknown;
    trustedStarterSource?: "approved_profile";
  },
): Promise<CoverLetterStudioRecord> {
  const user = await ensureUser(actor);
  const db = database();
  const pursuit = await pursuitContext(db, user.id, input.pursuitId);
  const content = normalizeCoverLetterContent(input.content);
  if (input.trustedStarterSource === "approved_profile") {
    content.provenance = {
      source: "approved_profile",
      unresolvedItems: [
        "This outline has not yet been tailored to the current posting requirements.",
      ],
    };
  }
  if (
    content.employer.toLowerCase() !== pursuit.employer.toLowerCase() ||
    content.roleTitle.toLowerCase() !== pursuit.title.toLowerCase()
  ) {
    content.provenance.unresolvedItems = [
      ...content.provenance.unresolvedItems,
      "The edited employer or role title differs from the selected current posting.",
    ];
  }
  if (input.sourceLetterId) {
    const source = await db
      .prepare(
        "SELECT id FROM generated_assets WHERE id = ? AND user_id = ? AND pursuit_id = ? AND type = 'cover_letter'",
      )
      .bind(input.sourceLetterId, user.id, pursuit.id)
      .first();
    if (!source) throw new Error("That cover-letter version is not available.");
  }
  const versionRow = await db
    .prepare(
      "SELECT coalesce(max(version), 0) AS version FROM generated_assets WHERE user_id = ? AND pursuit_id = ? AND type = 'cover_letter'",
    )
    .bind(user.id, pursuit.id)
    .first<{ version: number }>();
  const version = (versionRow?.version ?? 0) + 1;
  const id = `cover_${crypto.randomUUID()}`;
  const contentJson = canonicalJson(content);
  const contentSha = await sha256Hex(contentJson);
  const filename = `${pursuit.employer} - ${pursuit.title} - Cover Letter`;
  await db.batch([
    db
      .prepare(
        "INSERT INTO generated_assets (id, user_id, pursuit_id, type, source_versions_json, generation_policy_version, version, content_json, content_sha256, filename, supersedes_asset_id, review_state) VALUES (?, ?, ?, 'cover_letter', ?, 'deterministic-approved-profile-v1', ?, ?, ?, ?, ?, 'draft')",
      )
      .bind(
        id,
        user.id,
        pursuit.id,
        JSON.stringify({
          jobPostingId: pursuit.job_posting_id,
          profileState: content.provenance.source,
          postingFactsUsed: false,
        }),
        version,
        contentJson,
        contentSha,
        filename,
        input.sourceLetterId,
      ),
    db
      .prepare(
        "UPDATE pursuit_packages SET readiness_state = 'superseded', superseded_at = unixepoch() * 1000 WHERE user_id = ? AND pursuit_id = ? AND readiness_state <> 'superseded'",
      )
      .bind(user.id, pursuit.id),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'cover_letter_version_saved', 'generated_asset', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        id,
        JSON.stringify({ pursuitId: pursuit.id, version }),
      ),
  ]);
  const studio = await listCoverLetterStudio(actor);
  const record = studio.letters.find((letter) => letter.id === id);
  if (!record) throw new Error("The saved cover letter could not be read back.");
  return record;
}

export async function recordResumeRender(
  actor: FounderActor,
  input: {
    resumeId: string;
    format: unknown;
    filename: unknown;
    fileSha256: unknown;
    pageCount: unknown;
    rendererVersion: unknown;
  },
): Promise<{ assetId: string; reviewState: "draft" }> {
  const user = await ensureUser(actor);
  const db = database();
  const receipt = renderReceipt(input);
  const resume = await db
    .prepare(
      "SELECT r.id, r.version, r.content_json, r.template_key, r.review_state, ra.job_posting_id, p.id AS pursuit_id, p.current_analysis_id, jpv.id AS job_posting_version_id FROM resumes r JOIN resume_assignments ra ON ra.resume_id = r.id AND ra.user_id = r.user_id JOIN pursuits p ON p.user_id = r.user_id AND p.job_posting_id = ra.job_posting_id AND p.state <> 'closed' JOIN job_postings jp ON jp.id = ra.job_posting_id LEFT JOIN job_posting_versions jpv ON jpv.job_posting_id = jp.id AND jpv.description_checksum = jp.description_checksum WHERE r.id = ? AND r.user_id = ? AND r.kind = 'job' AND ra.scope = 'job' LIMIT 1",
    )
    .bind(input.resumeId, user.id)
    .first<{
      id: string;
      version: number;
      content_json: string;
      template_key: string;
      review_state: string;
      job_posting_id: string;
      pursuit_id: string;
      current_analysis_id: string | null;
      job_posting_version_id: string | null;
    }>();
  if (!resume) {
    throw new Error(
      "Assign this resume to an active pursuit before recording an application file.",
    );
  }
  if (resume.review_state === "superseded") {
    throw new Error("Render the current resume version instead.");
  }
  const semanticContent = parseJson<Record<string, unknown>>(
    resume.content_json,
    {},
  );
  const semanticContentSha256 = await sha256Hex(
    canonicalJson(semanticContent),
  );
  const content = {
    semanticResumeId: resume.id,
    semanticResumeVersion: resume.version,
    semanticContent,
    semanticContentSha256,
    templateKey: resume.template_key,
    templateVersion: `${resume.template_key}-v1`,
    rendererVersion: receipt.rendererVersion,
    format: receipt.format,
    fileSha256: receipt.fileSha256,
    receiptState: "client_rendered_unverified",
  };
  const contentJson = canonicalJson(content);
  const contentSha256 = await sha256Hex(contentJson);
  const versionRow = await db
    .prepare(
      "SELECT coalesce(max(version), 0) AS version FROM generated_assets WHERE user_id = ? AND pursuit_id = ? AND type = 'resume'",
    )
    .bind(user.id, resume.pursuit_id)
    .first<{ version: number }>();
  const version = (versionRow?.version ?? 0) + 1;
  const id = `asset_resume_${crypto.randomUUID()}`;
  await db.batch([
    db
      .prepare(
        "INSERT INTO generated_assets (id, user_id, pursuit_id, type, source_versions_json, generation_policy_version, version, content_json, content_sha256, filename, page_count, review_state) VALUES (?, ?, ?, 'resume', ?, 'client-render-receipt-v1', ?, ?, ?, ?, ?, 'draft')",
      )
      .bind(
        id,
        user.id,
        resume.pursuit_id,
        canonicalJson({
          semanticResumeId: resume.id,
          semanticResumeVersion: resume.version,
          jobPostingId: resume.job_posting_id,
          jobPostingVersionId: resume.job_posting_version_id,
          analysisId: resume.current_analysis_id,
        }),
        version,
        contentJson,
        contentSha256,
        receipt.filename,
        receipt.pageCount,
      ),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'resume_render_recorded', 'generated_asset', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        id,
        canonicalJson({
          format: receipt.format,
          rendererVersion: receipt.rendererVersion,
          reviewState: "draft",
        }),
      ),
  ]);
  return { assetId: id, reviewState: "draft" };
}

export async function recordCoverLetterRender(
  actor: FounderActor,
  input: {
    letterId: string;
    format: unknown;
    filename: unknown;
    fileSha256: unknown;
    pageCount: unknown;
    rendererVersion: unknown;
  },
): Promise<{ assetId: string; reviewState: "draft" }> {
  const user = await ensureUser(actor);
  const db = database();
  const receipt = renderReceipt(input);
  const letter = await db
    .prepare(
      "SELECT ga.id, ga.pursuit_id, ga.version, ga.content_json, ga.review_state, p.job_posting_id, p.current_analysis_id, jpv.id AS job_posting_version_id FROM generated_assets ga JOIN pursuits p ON p.id = ga.pursuit_id AND p.user_id = ga.user_id JOIN job_postings jp ON jp.id = p.job_posting_id LEFT JOIN job_posting_versions jpv ON jpv.job_posting_id = jp.id AND jpv.description_checksum = jp.description_checksum WHERE ga.id = ? AND ga.user_id = ? AND ga.type = 'cover_letter' AND ga.invalidated_at IS NULL LIMIT 1",
    )
    .bind(input.letterId, user.id)
    .first<{
      id: string;
      pursuit_id: string;
      version: number;
      content_json: string;
      review_state: string;
      job_posting_id: string;
      current_analysis_id: string | null;
      job_posting_version_id: string | null;
    }>();
  if (!letter || letter.review_state === "superseded") {
    throw new Error("Render the current cover-letter version.");
  }
  const semanticContent = parseJson<Record<string, unknown>>(
    letter.content_json,
    {},
  );
  const semanticContentSha256 = await sha256Hex(
    canonicalJson(semanticContent),
  );
  const content = {
    semanticCoverLetterId: letter.id,
    semanticCoverLetterVersion: letter.version,
    semanticContent,
    semanticContentSha256,
    templateVersion: `${
      typeof semanticContent.design === "object" &&
      semanticContent.design &&
      "templateKey" in semanticContent.design
        ? String(
            (semanticContent.design as Record<string, unknown>).templateKey,
          )
        : "executive"
    }-v1`,
    rendererVersion: receipt.rendererVersion,
    format: receipt.format,
    fileSha256: receipt.fileSha256,
    receiptState: "client_rendered_unverified",
  };
  const contentJson = canonicalJson(content);
  const contentSha256 = await sha256Hex(contentJson);
  const versionRow = await db
    .prepare(
      "SELECT coalesce(max(version), 0) AS version FROM generated_assets WHERE user_id = ? AND pursuit_id = ? AND type = 'cover_letter'",
    )
    .bind(user.id, letter.pursuit_id)
    .first<{ version: number }>();
  const version = (versionRow?.version ?? 0) + 1;
  const id = `asset_cover_${crypto.randomUUID()}`;
  await db.batch([
    db
      .prepare(
        "INSERT INTO generated_assets (id, user_id, pursuit_id, type, source_versions_json, generation_policy_version, version, content_json, content_sha256, filename, page_count, supersedes_asset_id, review_state) VALUES (?, ?, ?, 'cover_letter', ?, 'client-render-receipt-v1', ?, ?, ?, ?, ?, ?, 'draft')",
      )
      .bind(
        id,
        user.id,
        letter.pursuit_id,
        canonicalJson({
          semanticCoverLetterId: letter.id,
          semanticCoverLetterVersion: letter.version,
          jobPostingId: letter.job_posting_id,
          jobPostingVersionId: letter.job_posting_version_id,
          analysisId: letter.current_analysis_id,
        }),
        version,
        contentJson,
        contentSha256,
        receipt.filename,
        receipt.pageCount,
        letter.id,
      ),
    db
      .prepare(
        "INSERT INTO audit_events (id, user_id, actor_subject, event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, 'cover_letter_render_recorded', 'generated_asset', ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        `chatgpt:${user.email}`,
        id,
        canonicalJson({
          format: receipt.format,
          rendererVersion: receipt.rendererVersion,
          reviewState: "draft",
        }),
      ),
  ]);
  return { assetId: id, reviewState: "draft" };
}
