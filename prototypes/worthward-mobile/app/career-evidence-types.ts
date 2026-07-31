export const CAREER_EVIDENCE_POLICY_VERSION =
  "way-ahead-career-evidence-v1";

export type CareerEvidenceRoleInput = {
  employer: string;
  title: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  location: string | null;
  summary: string | null;
};

export type CareerEvidenceMutation =
  | {
      action: "upsert";
      roleId: string | null;
      role: CareerEvidenceRoleInput;
      confirmed: true;
    }
  | {
      action: "remove" | "restore";
      roleId: string;
    };

function boundedText(
  value: unknown,
  label: string,
  maximumLength: number,
  required = false,
): string | null {
  if (value === null || value === undefined || value === "") {
    if (required) throw new Error(`${label} is required.`);
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${label} must be text.`);
  }
  const normalized = value.trim();
  if (!normalized) {
    if (required) throw new Error(`${label} is required.`);
    return null;
  }
  if (normalized.length > maximumLength) {
    throw new Error(`${label} is longer than this alpha accepts.`);
  }
  return normalized;
}

function roleId(value: unknown, required: boolean): string | null {
  const normalized = boundedText(value, "Role", 120, required);
  if (normalized && !/^[a-zA-Z0-9_-]+$/.test(normalized)) {
    throw new Error("The role identifier is not valid.");
  }
  return normalized;
}

export function isCareerEvidenceMonth(value: string): boolean {
  return /^\d{4}-(?:0[1-9]|1[0-2])$/.test(value);
}

export function normalizeCareerEvidenceRole(
  value: unknown,
  currentMonth = new Date().toISOString().slice(0, 7),
): CareerEvidenceRoleInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Add the structured role details.");
  }
  const candidate = value as Record<string, unknown>;
  const employer = boundedText(
    candidate.employer,
    "Employer",
    160,
    true,
  )!;
  const title = boundedText(candidate.title, "Job title", 160, true)!;
  const startDate = boundedText(
    candidate.startDate,
    "Start month",
    7,
    true,
  )!;
  const isCurrent = candidate.isCurrent === true;
  const endDate = isCurrent
    ? null
    : boundedText(candidate.endDate, "End month", 7, true);

  if (!isCareerEvidenceMonth(startDate)) {
    throw new Error("Start month must use a valid year and month.");
  }
  if (endDate && !isCareerEvidenceMonth(endDate)) {
    throw new Error("End month must use a valid year and month.");
  }
  if (endDate && endDate < startDate) {
    throw new Error("End month cannot be before start month.");
  }
  if (startDate > currentMonth || (endDate && endDate > currentMonth)) {
    throw new Error(
      "Career Evidence cannot include a role month that has not happened yet.",
    );
  }

  return {
    employer,
    title,
    startDate,
    endDate,
    isCurrent,
    location: boundedText(candidate.location, "Location", 160),
    summary: boundedText(
      candidate.summary,
      "What you owned and accomplished",
      4_000,
    ),
  };
}

export function normalizeCareerEvidenceMutation(
  value: unknown,
): CareerEvidenceMutation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Choose a Career Evidence action.");
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.action === "upsert") {
    if (candidate.confirmed !== true) {
      throw new Error(
        "Confirm that the structured role is accurate before saving it as career evidence.",
      );
    }
    return {
      action: "upsert",
      roleId: roleId(candidate.roleId, false),
      role: normalizeCareerEvidenceRole(candidate.role),
      confirmed: true,
    };
  }
  if (candidate.action === "remove" || candidate.action === "restore") {
    return {
      action: candidate.action,
      roleId: roleId(candidate.roleId, true)!,
    };
  }
  throw new Error("Choose a supported Career Evidence action.");
}
