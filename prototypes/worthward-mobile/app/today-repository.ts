import { env } from "cloudflare:workers";
import { CURRENT_DETERMINISTIC_ASSESSMENT_POLICY } from "./deterministic-assessment";
import type { FounderActor } from "./production-types";
import type {
  TodayCareerPath,
  TodayRecord,
  TodayScoreboardItem,
} from "./today-types";
import { ensureUser } from "./workspace-repository";

type RuntimeEnv = { DB?: D1Database };

type AnalysisRow = {
  job_posting_id: string;
  employer: string;
  title: string;
  career_path_id: string | null;
  career_path_label: string | null;
  canonical_url: string;
  locations_json: string | null;
  compensation_json: string | null;
  freshness_state: TodayScoreboardItem["freshnessState"];
  move_value_score: number | null;
  pursuit_readiness_score: number | null;
  fit_json: string;
  unknowns_json: string;
  recommendation: "pursue" | "watch" | "pass" | "needs_evidence";
  validation_state: "pending" | "trusted" | "blocked" | "invalidated";
  integrity_gates_json: string;
  job_posting_version_id: string | null;
  source_checked_at: number | null;
  capture_state: "verified" | "partial" | "conflict" | "unavailable" | null;
  pursuit_id: string | null;
  pursuit_state: string | null;
  next_action: string | null;
};

type PathRow = {
  id: string;
  label: string;
  state: TodayCareerPath["state"];
  is_primary: number;
};

type AssetRow = {
  pursuit_id: string;
  type: "resume" | "cover_letter";
  review_state: "draft" | "claim_safe" | "approved" | "superseded";
};

type SemanticResumeRow = {
  pursuit_id: string;
  review_state: AssetRow["review_state"];
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

function sourceStatus(
  row: AnalysisRow,
  analysisCurrent: boolean,
  verificationCurrent: boolean,
): TodayScoreboardItem["sourceStatus"] {
  if (!analysisCurrent) return "Changed";
  if (!verificationCurrent) return "Needs refresh";
  if (row.capture_state === "verified") return "Verified";
  if (row.capture_state === "partial") return "Partial";
  if (row.capture_state === "conflict") return "Conflict";
  if (row.capture_state === "unavailable") return "Unavailable";
  return "Not checked";
}

function evidenceStrength(
  row: AnalysisRow,
  unknowns: string[],
  analysisCurrent: boolean,
  verificationCurrent: boolean,
): TodayScoreboardItem["evidenceStrength"] {
  if (
    !analysisCurrent ||
    !verificationCurrent ||
    row.freshness_state === "stale" ||
    row.freshness_state === "removed" ||
    row.freshness_state === "unknown" ||
    row.validation_state === "blocked" ||
    row.validation_state === "invalidated" ||
    row.capture_state === "conflict" ||
    row.capture_state === "unavailable"
  ) {
    return "Blocked";
  }
  if (
    row.validation_state === "trusted" &&
    row.capture_state === "verified" &&
    row.freshness_state === "fresh" &&
    unknowns.length === 0
  ) {
    return "Strong";
  }
  if (
    row.validation_state === "trusted" &&
    (row.capture_state === "verified" || row.capture_state === "partial")
  ) {
    return "Moderate";
  }
  return "Needs review";
}

function recommendation(
  row: AnalysisRow,
  analysisCurrent: boolean,
  verificationCurrent: boolean,
): TodayScoreboardItem["recommendation"] {
  if (
    !analysisCurrent ||
    !verificationCurrent ||
    row.freshness_state === "stale" ||
    row.freshness_state === "removed" ||
    row.freshness_state === "unknown" ||
    row.validation_state !== "trusted" ||
    row.capture_state === "conflict" ||
    row.capture_state === "unavailable"
  ) {
    return "On hold";
  }
  if (row.freshness_state === "stale_risk" && row.recommendation === "pursue") {
    return "Review next";
  }
  if (row.recommendation === "pursue") return "Pursue now";
  if (row.recommendation === "needs_evidence") return "Review next";
  if (row.recommendation === "watch") return "Keep watch";
  return "Pass";
}

function priority(
  row: AnalysisRow,
  analysisCurrent: boolean,
  verificationCurrent: boolean,
): number | null {
  if (
    !analysisCurrent ||
    !verificationCurrent ||
    row.freshness_state === "stale" ||
    row.freshness_state === "removed" ||
    row.freshness_state === "unknown" ||
    row.validation_state !== "trusted" ||
    row.move_value_score === null ||
    row.pursuit_readiness_score === null
  ) {
    return null;
  }
  return Math.round(
    row.move_value_score * 0.55 + row.pursuit_readiness_score * 0.45,
  );
}

function isVerificationCurrent(row: AnalysisRow, now: number): boolean {
  return (
    row.source_checked_at !== null &&
    now - row.source_checked_at <= 24 * 60 * 60 * 1000
  );
}

function isAnalysisCurrent(row: AnalysisRow): boolean {
  if (!row.job_posting_version_id) return false;
  const gates = parseJson<Record<string, unknown>>(row.integrity_gates_json, {});
  const boundVersion =
    typeof gates.jobVersionId === "string" ? gates.jobVersionId : null;
  const deterministicPolicyIsCurrent =
    gates.deterministic !== true ||
    gates.policyVersion === CURRENT_DETERMINISTIC_ASSESSMENT_POLICY;
  return (
    boundVersion === row.job_posting_version_id &&
    deterministicPolicyIsCurrent
  );
}

function scoresAreVisible(
  row: Pick<AnalysisRow, "validation_state">,
  analysisCurrent: boolean,
): boolean {
  return analysisCurrent && row.validation_state === "trusted";
}

function documentState(
  assets: Map<string, AssetRow>,
  pursuitId: string | null,
  type: AssetRow["type"],
): "missing" | "draft" | "claim_safe" | "approved" {
  if (!pursuitId) return "missing";
  const asset = assets.get(`${pursuitId}:${type}`);
  if (!asset || asset.review_state === "superseded") return "missing";
  return asset.review_state;
}

export async function readToday(actor: FounderActor): Promise<TodayRecord> {
  const user = await ensureUser(actor);
  const db = database();
  const [pathResult, analysisResult, assetResult, semanticResumeResult] =
    await Promise.all([
    db
      .prepare(
        "SELECT id, label, state, is_primary FROM career_paths WHERE user_id = ? AND state <> 'rejected' ORDER BY is_primary DESC, label",
      )
      .bind(user.id)
      .all<PathRow>(),
    db
      .prepare(
        "SELECT ja.job_posting_id, jp.employer, jp.title, ja.career_path_id, cp.label AS career_path_label, jp.canonical_url, jp.locations_json, jp.compensation_json, jp.freshness_state, ja.move_value_score, ja.pursuit_readiness_score, ja.fit_json, ja.unknowns_json, ja.recommendation, ja.validation_state, ja.integrity_gates_json, jpv.id AS job_posting_version_id, jpv.source_checked_at, jpv.capture_state, p.id AS pursuit_id, p.state AS pursuit_state, p.next_action FROM job_analyses ja JOIN job_postings jp ON jp.id = ja.job_posting_id JOIN career_paths cp ON cp.id = ja.career_path_id AND cp.user_id = ja.user_id AND cp.state = 'active' LEFT JOIN job_posting_versions jpv ON jpv.id = (SELECT candidate.id FROM job_posting_versions candidate WHERE candidate.job_posting_id = jp.id ORDER BY candidate.source_checked_at DESC, candidate.created_at DESC, candidate.id DESC LIMIT 1) LEFT JOIN pursuits p ON p.user_id = ja.user_id AND p.job_posting_id = ja.job_posting_id WHERE ja.user_id = ? AND ja.invalidated_at IS NULL AND jp.removed_at IS NULL AND ja.id = (SELECT latest.id FROM job_analyses latest WHERE latest.user_id = ja.user_id AND latest.job_posting_id = ja.job_posting_id AND coalesce(latest.career_path_id, '') = coalesce(ja.career_path_id, '') AND latest.invalidated_at IS NULL ORDER BY latest.created_at DESC LIMIT 1)",
      )
      .bind(user.id)
      .all<AnalysisRow>(),
    db
      .prepare(
        "SELECT pursuit_id, type, review_state FROM generated_assets WHERE user_id = ? AND pursuit_id IS NOT NULL AND type IN ('resume', 'cover_letter') AND invalidated_at IS NULL ORDER BY updated_at DESC, version DESC",
      )
      .bind(user.id)
      .all<AssetRow>(),
    db
      .prepare(
        "SELECT p.id AS pursuit_id, r.review_state FROM pursuits p JOIN resume_assignments ra ON ra.user_id = p.user_id AND ra.scope = 'job' AND ra.job_posting_id = p.job_posting_id JOIN resumes r ON r.user_id = ra.user_id AND r.id = ra.resume_id WHERE p.user_id = ? AND p.state <> 'closed' ORDER BY r.updated_at DESC, r.version DESC",
      )
      .bind(user.id)
      .all<SemanticResumeRow>(),
    ]);

  const latestAssets = new Map<string, AssetRow>();
  for (const asset of assetResult.results) {
    const key = `${asset.pursuit_id}:${asset.type}`;
    if (!latestAssets.has(key)) latestAssets.set(key, asset);
  }
  for (const resume of semanticResumeResult.results) {
    const key = `${resume.pursuit_id}:resume`;
    if (!latestAssets.has(key)) {
      latestAssets.set(key, {
        pursuit_id: resume.pursuit_id,
        type: "resume",
        review_state: resume.review_state,
      });
    }
  }

  const now = Date.now();
  const scoreboard = analysisResult.results
    .map((row): TodayScoreboardItem => {
      const fit = parseJson<Record<string, unknown>>(row.fit_json, {});
      const rawFitScore =
        typeof fit.fitScore === "number"
          ? fit.fitScore
          : typeof fit.score === "number"
            ? fit.score
            : null;
      const fitScore =
        rawFitScore !== null &&
        Number.isInteger(rawFitScore) &&
        rawFitScore >= 0 &&
        rawFitScore <= 100
          ? rawFitScore
          : null;
      const recordedNextAction =
        typeof fit.nextAction === "string" && fit.nextAction.trim()
          ? fit.nextAction.trim()
          : null;
      const analysisCurrent = isAnalysisCurrent(row);
      const showScores = scoresAreVisible(row, analysisCurrent);
      const verificationCurrent = isVerificationCurrent(row, now);
      const unknowns = [
        ...parseJson<string[]>(row.unknowns_json, []),
        ...(!analysisCurrent
          ? [
              "The employer source changed after this analysis. Re-run the decision before relying on its scores.",
            ]
          : []),
        ...(!verificationCurrent
          ? [
              "The source check is more than 24 hours old. Refresh it before treating this job as current.",
            ]
          : []),
      ];
      const itemRecommendation = recommendation(
        row,
        analysisCurrent,
        verificationCurrent,
      );
      const nextMove =
        (!analysisCurrent || !verificationCurrent
          ? "Re-run source checks and analysis before deciding or preparing documents."
          : row.next_action ?? recordedNextAction) ??
        (itemRecommendation === "Pursue now"
          ? "Review the evidence and start a pursuit."
          : itemRecommendation === "Review next"
            ? "Resolve the highest-impact unknown."
            : itemRecommendation === "Keep watch"
              ? "Wait for a material source or fit change."
              : itemRecommendation === "Pass"
                ? "Spend no more effort on this role."
                : "Keep the last trusted decision until verification recovers.");
      return {
        jobPostingId: row.job_posting_id,
        employer: row.employer,
        title: row.title,
        careerPathId: row.career_path_id,
        careerPathLabel: row.career_path_label ?? "Unassigned",
        canonicalUrl: row.canonical_url,
        locations: parseJson<string[]>(row.locations_json, []),
        compensation: parseJson<Record<string, unknown> | null>(
          row.compensation_json,
          null,
        ),
        pursuitPriority: priority(row, analysisCurrent, verificationCurrent),
        priorityFormula:
          "55% Job Value + 45% Pursuit Readiness after source and validation gates",
        fitScore: showScores ? fitScore : null,
        moveValue: showScores ? row.move_value_score : null,
        pursuitReadiness: showScores ? row.pursuit_readiness_score : null,
        evidenceStrength: evidenceStrength(
          row,
          unknowns,
          analysisCurrent,
          verificationCurrent,
        ),
        sourceStatus: sourceStatus(
          row,
          analysisCurrent,
          verificationCurrent,
        ),
        analysisCurrent,
        freshnessState: row.freshness_state,
        recommendation: itemRecommendation,
        nextMove,
        unknowns,
        lastVerifiedAt: row.source_checked_at,
        pursuitId: row.pursuit_id,
        pursuitState: row.pursuit_state,
        documentStatus: {
          resume: documentState(
            latestAssets,
            row.pursuit_id,
            "resume",
          ),
          coverLetter: documentState(
            latestAssets,
            row.pursuit_id,
            "cover_letter",
          ),
        },
      };
    })
    .sort((left, right) => {
      const priorityDifference =
        (right.pursuitPriority ?? -1) - (left.pursuitPriority ?? -1);
      if (priorityDifference) return priorityDifference;
      const fitDifference = (right.fitScore ?? -1) - (left.fitScore ?? -1);
      if (fitDifference) return fitDifference;
      return (right.lastVerifiedAt ?? 0) - (left.lastVerifiedAt ?? 0);
    });

  const paths = pathResult.results.map((path): TodayCareerPath => {
    const jobs = scoreboard.filter((job) => job.careerPathId === path.id);
    return {
      id: path.id,
      label: path.label,
      isPrimary: Boolean(path.is_primary),
      state: path.state,
      jobsReviewed: jobs.length,
      jobsClearingStandard: jobs.filter(
        (job) => job.recommendation === "Pursue now",
      ).length,
      verifiedLast24Hours: jobs.filter(
        (job) =>
          job.lastVerifiedAt !== null &&
          now - job.lastVerifiedAt <= 24 * 60 * 60 * 1000,
      ).length,
      lastVerifiedAt: jobs.reduce<number | null>(
        (latest, job) =>
          job.lastVerifiedAt !== null &&
          (latest === null || job.lastVerifiedAt > latest)
            ? job.lastVerifiedAt
            : latest,
        null,
      ),
    };
  });

  const leading = scoreboard[0];
  const nextAction = leading
    ? {
        label:
          leading.recommendation === "Pursue now"
            ? `Review ${leading.title} at ${leading.employer}`
            : leading.recommendation === "Review next"
              ? `Resolve what is missing for ${leading.title}`
              : "Review your highest-ranked current job",
        detail: leading.nextMove,
        href: `/app/jobs/${encodeURIComponent(leading.jobPostingId)}`,
        ctaLabel: "Review job",
      }
    : paths.some((path) => path.state === "active")
      ? {
          label: "Add and assess a current job",
          detail:
            "No job has been evaluated for your active Job Paths yet. Add a direct employer job to create the first source-bound decision.",
          href: "/app/jobs",
          ctaLabel: "Continue to Jobs",
        }
      : {
          label: "Finish choosing your Job Paths",
          detail:
            "Home can rank work only after you define at least one active Job Path.",
          href: "/app/plan",
          ctaLabel: "Continue to Plan",
        };

  return {
    displayName: user.display_name ?? actor.displayName,
    paths,
    scoreboard,
    nextAction,
    system: {
      generatedAt: now,
      rankingExplanation:
        "Pursuit priority orders effort after source and validation gates. It is not the probability of an interview or offer.",
      submissionEnabled: false,
    },
  };
}
