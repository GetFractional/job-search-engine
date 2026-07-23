export type TodayCareerPath = {
  id: string;
  label: string;
  isPrimary: boolean;
  state: "suggested" | "active" | "paused" | "rejected";
  jobsReviewed: number;
  jobsClearingStandard: number;
  verifiedLast24Hours: number;
  lastVerifiedAt: number | null;
};

export type TodayScoreboardItem = {
  jobPostingId: string;
  employer: string;
  title: string;
  careerPathId: string | null;
  careerPathLabel: string;
  canonicalUrl: string;
  locations: string[];
  compensation: Record<string, unknown> | null;
  pursuitPriority: number | null;
  priorityFormula: string;
  fitScore: number | null;
  moveValue: number | null;
  pursuitReadiness: number | null;
  evidenceStrength: "Strong" | "Moderate" | "Needs review" | "Blocked";
  sourceStatus:
    | "Verified"
    | "Changed"
    | "Needs refresh"
    | "Partial"
    | "Conflict"
    | "Unavailable"
    | "Not checked";
  analysisCurrent: boolean;
  freshnessState: "fresh" | "stale_risk" | "stale" | "removed" | "unknown";
  recommendation:
    | "Pursue now"
    | "Review next"
    | "Keep watch"
    | "Pass"
    | "On hold";
  nextMove: string;
  unknowns: string[];
  lastVerifiedAt: number | null;
  pursuitId: string | null;
  pursuitState: string | null;
  documentStatus: {
    resume: "missing" | "draft" | "claim_safe" | "approved";
    coverLetter: "missing" | "draft" | "claim_safe" | "approved";
  };
};

export type TodayRecord = {
  displayName: string;
  paths: TodayCareerPath[];
  scoreboard: TodayScoreboardItem[];
  nextAction: {
    label: string;
    detail: string;
    href: string;
  };
  system: {
    generatedAt: number;
    rankingExplanation: string;
    submissionEnabled: false;
  };
};
