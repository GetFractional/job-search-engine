export type AssessmentCriterion = {
  id: string;
  label: string;
  category: "source" | "path" | "job_value" | "readiness";
  state: "met" | "conflict" | "unknown";
  score: number | null;
  explanation: string;
  evidence: string;
};

export type DeterministicAssessmentInput = {
  source: {
    versionId: string;
    descriptionChecksum: string;
    captureState: "verified" | "partial" | "conflict" | "unavailable";
    rightsState: "approved" | "restricted" | "unknown" | "rejected";
    freshnessState: "fresh" | "stale_risk" | "stale" | "removed" | "unknown";
    title: string;
    locations: string[];
    compensation: Record<string, unknown> | null;
    facts: Record<string, unknown>;
  };
  standard: {
    minimumPayCents: number | null;
    targetPayCents: number | null;
    currency: string;
    workArrangements: string[];
    travelMaximumPercent: number | null;
    benefits: string[];
  };
  path: {
    id: string;
    label: string;
    primaryLane: string;
    secondaryLanes: string[];
  };
  profile: {
    confirmedFactCount: number;
    confirmedSkillCount: number;
    confirmedRoles: Array<{
      title: string;
      startDate: string | null;
      endDate: string | null;
      isCurrent: boolean;
      summary: string | null;
    }>;
  };
};

export type DeterministicAssessment = {
  policyVersion: "way-ahead-deterministic-assessment-v2";
  scoreKind: "preliminary_alignment";
  fitScore: number;
  jobValueScore: number | null;
  pursuitReadinessScore: number;
  recommendation: "pursue" | "watch" | "pass" | "needs_evidence";
  recommendationReason: string;
  unknowns: string[];
  hardConflicts: string[];
  criteria: AssessmentCriterion[];
  verifiedCriterionCount: number;
  totalCriterionCount: number;
  scoreMeaning: string;
};

type AnnualCompensation = {
  minimum: number;
  maximum: number;
  currency: string;
  evidence: string;
};

export const CURRENT_DETERMINISTIC_ASSESSMENT_POLICY =
  "way-ahead-deterministic-assessment-v2" as const;
const POLICY_VERSION = CURRENT_DETERMINISTIC_ASSESSMENT_POLICY;
const SCORE_MEANING =
  "Preliminary alignment across the verified title, Job Path, Job Standard, source, and profile-readiness fields below. The role's responsibilities and requirements have not yet been compared with your confirmed evidence. This is not overall role fit, hiring probability, or a prediction of an interview or offer.";

const TITLE_STOP_WORDS = new Set([
  "and",
  "of",
  "the",
  "for",
  "a",
  "an",
  "lead",
  "senior",
  "sr",
  "director",
  "head",
  "manager",
  "principal",
]);

function normalizedText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleTokens(value: string): Set<string> {
  return new Set(
    normalizedText(value)
      .split(/\s+/)
      .filter((token) => token.length > 1 && !TITLE_STOP_WORDS.has(token)),
  );
}

function overlapScore(jobTitle: string, pathValues: string[]): {
  score: number;
  explanation: string;
} {
  const normalizedTitle = normalizedText(jobTitle);
  const normalizedPaths = pathValues.map(normalizedText).filter(Boolean);
  if (
    normalizedPaths.some(
      (path) =>
        path.length >= 4 &&
        (normalizedTitle.includes(path) || path.includes(normalizedTitle)),
    )
  ) {
    return {
      score: 100,
      explanation:
        "The employer title directly matches the selected Job Path language.",
    };
  }
  const title = titleTokens(jobTitle);
  const path = new Set(pathValues.flatMap((value) => [...titleTokens(value)]));
  const shared = [...title].filter((token) => path.has(token)).length;
  const denominator = Math.max(1, Math.min(title.size, path.size));
  const ratio = shared / denominator;
  if (ratio >= 0.67) {
    return {
      score: 90,
      explanation:
        "Most meaningful employer-title words overlap the selected Job Path.",
    };
  }
  if (ratio >= 0.4) {
    return {
      score: 75,
      explanation:
        "Some meaningful employer-title words overlap the selected Job Path.",
    };
  }
  if (shared > 0) {
    return {
      score: 55,
      explanation:
        "The title has limited language overlap with the selected Job Path.",
    };
  }
  return {
    score: 30,
    explanation:
      "The employer title does not visibly match this Job Path. The posting may still be relevant, but that has not been proven.",
  };
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function rangeFromRecord(
  value: Record<string, unknown>,
  evidence: string,
): AnnualCompensation | null {
  const currency =
    typeof value.currency === "string" ? value.currency.toUpperCase() : null;
  const intervalValue =
    typeof value.interval === "string"
      ? value.interval
      : typeof value.period === "string"
        ? value.period
        : null;
  const interval = intervalValue?.toLowerCase() ?? null;
  if (
    interval &&
    !["year", "yearly", "annual", "annually"].includes(interval)
  ) {
    return null;
  }
  const minimumDollars =
    finiteNumber(value.min) ??
    finiteNumber(value.minimum) ??
    finiteNumber(value.minValue);
  const maximumDollars =
    finiteNumber(value.max) ??
    finiteNumber(value.maximum) ??
    finiteNumber(value.maxValue);
  const minimumCents = finiteNumber(value.min_cents);
  const maximumCents = finiteNumber(value.max_cents);
  const minimum =
    minimumDollars ?? (minimumCents === null ? null : minimumCents / 100);
  const maximum =
    maximumDollars ?? (maximumCents === null ? null : maximumCents / 100);
  if (
    minimum === null ||
    maximum === null ||
    !currency ||
    maximum < minimum
  ) {
    return null;
  }
  return { minimum, maximum, currency, evidence };
}

export function extractAnnualCompensation(
  compensation: Record<string, unknown> | null,
  facts: Record<string, unknown>,
): AnnualCompensation | null {
  const candidates: Array<{ value: unknown; evidence: string }> = [
    { value: facts.salaryRange, evidence: "Employer ATS salary range" },
    { value: compensation?.sourceRange, evidence: "Employer ATS salary range" },
    {
      value: compensation?.sourceRanges,
      evidence: "Employer ATS compensation range",
    },
  ];
  for (const candidate of candidates) {
    const values = Array.isArray(candidate.value)
      ? candidate.value
      : [candidate.value];
    for (const value of values) {
      const record = objectRecord(value);
      if (!record) continue;
      const range = rangeFromRecord(record, candidate.evidence);
      if (range) return range;
    }
  }
  return null;
}

function sourceWorkArrangement(
  facts: Record<string, unknown>,
  locations: string[],
): string | null {
  const workplaceType =
    typeof facts.workplaceType === "string"
      ? normalizedText(facts.workplaceType)
      : "";
  const locationText = normalizedText(locations.join(" "));
  const combined = `${workplaceType} ${locationText}`;
  if (/\bremote\b/.test(combined)) return "remote";
  if (/\bhybrid\b/.test(combined)) return "hybrid";
  if (
    /\bon site\b/.test(combined) ||
    /\bonsite\b/.test(combined) ||
    /\bin office\b/.test(combined)
  ) {
    return "on-site";
  }
  return null;
}

function normalizedArrangement(value: string): string {
  const normalized = normalizedText(value);
  if (normalized.includes("remote")) return "remote";
  if (normalized.includes("hybrid")) return "hybrid";
  if (
    normalized.includes("on site") ||
    normalized.includes("onsite") ||
    normalized.includes("office")
  ) {
    return "on-site";
  }
  return normalized;
}

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function assessDeterministically(
  input: DeterministicAssessmentInput,
): DeterministicAssessment {
  const criteria: AssessmentCriterion[] = [];
  const unknowns: string[] = [];
  const hardConflicts: string[] = [];

  criteria.push({
    id: "source-verification",
    label: "Canonical employer source",
    category: "source",
    state:
      input.source.rightsState === "approved" &&
      (input.source.captureState === "verified" ||
        input.source.captureState === "partial")
        ? "met"
        : "conflict",
    score:
      input.source.rightsState === "approved" &&
      input.source.captureState === "verified"
        ? 100
        : input.source.rightsState === "approved" &&
            input.source.captureState === "partial"
          ? 70
          : 0,
    explanation:
      input.source.captureState === "verified"
        ? "The job is bound to a verified employer-source version."
        : input.source.captureState === "partial"
          ? "The employer source is current, but the capture is partial."
          : "The source is not safe to use for a decision.",
    evidence: `Source version ${input.source.versionId}`,
  });

  const freshnessState =
    input.source.freshnessState === "fresh"
      ? "met"
      : input.source.freshnessState === "stale" ||
          input.source.freshnessState === "removed"
        ? "conflict"
        : "unknown";
  criteria.push({
    id: "freshness",
    label: "Posting freshness",
    category: "source",
    state: freshnessState,
    score:
      input.source.freshnessState === "fresh"
        ? 100
        : input.source.freshnessState === "stale_risk"
          ? 50
          : input.source.freshnessState === "stale" ||
              input.source.freshnessState === "removed"
            ? 0
            : null,
    explanation:
      input.source.freshnessState === "fresh"
        ? "The employer-reported posting date is within the current freshness window."
        : input.source.freshnessState === "stale_risk"
          ? "The posting is more than 30 days old and needs an active-hiring check."
          : input.source.freshnessState === "stale"
            ? "The posting is more than 60 days old."
            : input.source.freshnessState === "removed"
              ? "The employer no longer exposes this posting."
              : "The employer source did not provide a reliable posting date.",
    evidence: `Freshness state: ${input.source.freshnessState}`,
  });
  if (input.source.freshnessState === "stale_risk") {
    unknowns.push(
      "The posting is more than 30 days old. Verify that the employer is still actively hiring before spending application effort.",
    );
  } else if (input.source.freshnessState === "unknown") {
    unknowns.push(
      "The employer source did not provide a reliable posting date, so freshness is still unknown.",
    );
  } else if (
    input.source.freshnessState === "stale" ||
    input.source.freshnessState === "removed"
  ) {
    hardConflicts.push("The posting does not clear the current freshness gate.");
  }

  const path = overlapScore(input.source.title, [
    input.path.label,
    input.path.primaryLane,
    ...input.path.secondaryLanes,
  ]);
  criteria.push({
    id: "title-path-alignment",
    label: "Title and Job Path",
    category: "path",
    state: path.score >= 55 ? "met" : "unknown",
    score: path.score,
    explanation: path.explanation,
    evidence: `Employer title: ${input.source.title}; Job Path: ${input.path.label}`,
  });
  if (path.score < 55) {
    unknowns.push(
      "The employer title does not clearly map to this Job Path. Review the actual responsibilities before relying on the path score.",
    );
  }
  criteria.push({
    id: "requirements-evidence-match",
    label: "Role requirements and your evidence",
    category: "path",
    state: "unknown",
    score: null,
    explanation:
      "The employer's responsibilities and requirements have not yet been compared with your confirmed experience, skills, or results.",
    evidence:
      "A requirement-level comparison is not available in this deterministic structured-field check.",
  });
  unknowns.push(
    "The role's responsibilities and requirements have not been compared with your confirmed evidence.",
  );

  const annualCompensation = extractAnnualCompensation(
    input.source.compensation,
    input.source.facts,
  );
  let compensationScore: number | null = null;
  if (annualCompensation) {
    const minimum = (input.standard.minimumPayCents ?? 0) / 100;
    const target = (input.standard.targetPayCents ?? 0) / 100;
    const currencyMatches =
      annualCompensation.currency === input.standard.currency.toUpperCase();
    if (!currencyMatches) {
      criteria.push({
        id: "compensation",
        label: "Compensation",
        category: "job_value",
        state: "unknown",
        score: null,
        explanation:
          "The source and Job Standard use different currencies, so Way Ahead did not compare them.",
        evidence: annualCompensation.evidence,
      });
      unknowns.push(
        "The employer compensation range uses a different currency from your Job Standard.",
      );
    } else {
      compensationScore =
        target > 0 && annualCompensation.minimum >= target
          ? 100
          : target > 0 && annualCompensation.maximum >= target
            ? 85
            : minimum > 0 && annualCompensation.minimum >= minimum
              ? 75
              : minimum > 0 && annualCompensation.maximum >= minimum
                ? 60
                : minimum > 0
                  ? 0
                  : 70;
      const compensationConflict =
        minimum > 0 && annualCompensation.maximum < minimum;
      criteria.push({
        id: "compensation",
        label: "Compensation",
        category: "job_value",
        state: compensationConflict ? "conflict" : "met",
        score: compensationScore,
        explanation: compensationConflict
          ? "The top of the employer-reported annual range is below your minimum."
          : "The employer-reported annual range was compared with your current minimum and target.",
        evidence: `${annualCompensation.evidence}: ${annualCompensation.currency} ${annualCompensation.minimum.toLocaleString()}–${annualCompensation.maximum.toLocaleString()}`,
      });
      if (compensationConflict) {
        hardConflicts.push(
          "The employer-reported annual compensation range is below your minimum.",
        );
      }
    }
  } else {
    criteria.push({
      id: "compensation",
      label: "Compensation",
      category: "job_value",
      state: "unknown",
      score: null,
      explanation:
        "No unambiguous annual compensation range was present in the employer-source fields.",
      evidence: "Employer ATS compensation fields",
    });
    if (
      input.standard.minimumPayCents !== null ||
      input.standard.targetPayCents !== null
    ) {
      unknowns.push(
        "Annual compensation is not verified against your Job Standard.",
      );
    }
  }

  const workArrangement = sourceWorkArrangement(
    input.source.facts,
    input.source.locations,
  );
  const allowedArrangements = input.standard.workArrangements
    .map(normalizedArrangement)
    .filter(Boolean);
  let workScore: number | null = null;
  if (workArrangement && allowedArrangements.length) {
    const arrangementMatches = allowedArrangements.includes(workArrangement);
    workScore = arrangementMatches ? 100 : 0;
    criteria.push({
      id: "work-arrangement",
      label: "Work arrangement",
      category: "job_value",
      state: arrangementMatches ? "met" : "conflict",
      score: workScore,
      explanation: arrangementMatches
        ? `The employer reports ${workArrangement}, which is in your Job Standard.`
        : `The employer reports ${workArrangement}, which is outside your selected arrangements.`,
      evidence: `Employer ATS workplace fields and locations: ${input.source.locations.join(", ") || "none"}`,
    });
    if (!arrangementMatches) {
      hardConflicts.push(
        `The reported ${workArrangement} arrangement conflicts with your Job Standard.`,
      );
    }
  } else {
    criteria.push({
      id: "work-arrangement",
      label: "Work arrangement",
      category: "job_value",
      state: "unknown",
      score: null,
      explanation:
        allowedArrangements.length === 0
          ? "Your Job Standard does not constrain the work arrangement."
          : "The employer source does not clearly label this job as remote, hybrid, or on-site.",
      evidence: "Employer ATS workplace fields and locations",
    });
    if (allowedArrangements.length) {
      unknowns.push(
        "The job's work arrangement is not verified against your Job Standard.",
      );
    }
  }

  if (input.standard.travelMaximumPercent !== null) {
    unknowns.push(
      "Travel requirements are not available in the structured employer-source fields.",
    );
  }
  if (input.standard.benefits.length) {
    unknowns.push(
      "Requested benefits are not confirmed by the structured employer-source fields.",
    );
  }

  const confirmedRoles = input.profile.confirmedRoles;
  const rolesWithDates = confirmedRoles.filter(
    (role) =>
      Boolean(role.startDate) &&
      (role.isCurrent || Boolean(role.endDate)),
  ).length;
  const rolesWithSummary = confirmedRoles.filter((role) =>
    Boolean(role.summary?.trim()),
  ).length;
  const readinessParts = [
    {
      id: "confirmed-role",
      label: "Confirmed experience role",
      points: rolesWithDates > 0 ? 45 : 0,
      met: rolesWithDates > 0,
      explanation:
        rolesWithDates > 0
          ? `${rolesWithDates} confirmed role${rolesWithDates === 1 ? "" : "s"} include usable dates.`
          : "No confirmed role with usable dates is available.",
      evidence: "Your confirmed Career Profile",
    },
    {
      id: "role-detail",
      label: "Role detail",
      points: rolesWithSummary > 0 ? 20 : 0,
      met: rolesWithSummary > 0,
      explanation:
        rolesWithSummary > 0
          ? `${rolesWithSummary} confirmed role${rolesWithSummary === 1 ? "" : "s"} include a reviewed responsibility summary.`
          : "Confirmed roles do not yet include reviewed responsibility detail.",
      evidence: "Your confirmed Career Profile",
    },
    {
      id: "confirmed-facts",
      label: "Confirmed career facts",
      points: input.profile.confirmedFactCount > 0 ? 15 : 0,
      met: input.profile.confirmedFactCount > 0,
      explanation:
        input.profile.confirmedFactCount > 0
          ? `${input.profile.confirmedFactCount} additional confirmed career fact${input.profile.confirmedFactCount === 1 ? "" : "s"} are available.`
          : "No additional confirmed career facts are available yet.",
      evidence: "Your Career Evidence Library",
    },
    {
      id: "confirmed-skills",
      label: "Confirmed skills",
      points: input.profile.confirmedSkillCount > 0 ? 20 : 0,
      met: input.profile.confirmedSkillCount > 0,
      explanation:
        input.profile.confirmedSkillCount > 0
          ? `${input.profile.confirmedSkillCount} confirmed skill${input.profile.confirmedSkillCount === 1 ? "" : "s"} are available.`
          : "No confirmed structured skills are available yet.",
      evidence: "Your Career Evidence Library",
    },
  ];
  for (const part of readinessParts) {
    criteria.push({
      id: part.id,
      label: part.label,
      category: "readiness",
      state: part.met ? "met" : "unknown",
      score: part.met ? 100 : null,
      explanation: part.explanation,
      evidence: part.evidence,
    });
    if (!part.met) {
      unknowns.push(`${part.label} needs more evidence before application claims can be considered ready.`);
    }
  }
  const pursuitReadinessScore = readinessParts.reduce(
    (total, part) => total + part.points,
    0,
  );

  const jobValueScore = mean(
    [compensationScore, workScore].filter(
      (score): score is number => score !== null,
    ),
  );
  const weighted = [
    { score: path.score, weight: 40 },
    { score: pursuitReadinessScore, weight: 25 },
    ...(jobValueScore === null
      ? []
      : [{ score: jobValueScore, weight: 35 }]),
  ];
  const fitScore = Math.round(
    weighted.reduce((total, item) => total + item.score * item.weight, 0) /
      weighted.reduce((total, item) => total + item.weight, 0),
  );

  let recommendation: DeterministicAssessment["recommendation"];
  let recommendationReason: string;
  if (hardConflicts.length) {
    recommendation = "pass";
    recommendationReason =
      "A verified source or Job Standard conflict should be resolved before spending pursuit effort.";
  } else {
    recommendation = "needs_evidence";
    recommendationReason =
      "The structured fields can guide the next review, but Way Ahead has not compared the role's responsibilities and requirements with your confirmed evidence. A pursue recommendation would be premature.";
  }

  return {
    policyVersion: POLICY_VERSION,
    scoreKind: "preliminary_alignment",
    fitScore,
    jobValueScore,
    pursuitReadinessScore,
    recommendation,
    recommendationReason,
    unknowns: unique(unknowns),
    hardConflicts: unique(hardConflicts),
    criteria,
    verifiedCriterionCount: criteria.filter(
      (criterion) => criterion.state !== "unknown",
    ).length,
    totalCriterionCount: criteria.length,
    scoreMeaning: SCORE_MEANING,
  };
}
