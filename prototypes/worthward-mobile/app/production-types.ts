export type JsonRecord = Record<string, unknown>;

export type FounderActor = {
  displayName: string;
  email: string;
};

export type ExperienceRecord = {
  id: string;
  employer: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  location: string | null;
  summary: string | null;
  reviewState: "draft" | "confirmed" | "conflict" | "removed";
  provenance: {
    method:
      | "manual_entry"
      | "client_side_file_extraction"
      | "imported_text"
      | "unknown";
    label: string;
    factState:
      | "user_confirmed"
      | "user_corrected"
      | "suggested"
      | "missing"
      | "unknown";
    sourceImportType: string | null;
    policyVersion: string | null;
  };
  updatedAt: number;
};

export type JobStandardRecord = {
  id: string;
  version: number;
  payBasis: "salary" | "hourly" | "either" | null;
  minimumPayCents: number | null;
  targetPayCents: number | null;
  currency: string;
  workArrangements: string[];
  commuteMiles: number | null;
  locations: string[];
  travelMaximumPercent: number | null;
  scheduleRequirements: string | null;
  benefits: string[];
  growthPriorities: string[];
  exclusions: string[];
};

export type CareerPathRecord = {
  id: string;
  label: string;
  primaryLane: string;
  secondaryLanes: string[];
  fitScore: number | null;
  opportunityScore: number | null;
  rationale: JsonRecord | null;
  gaps: string[];
  state: "suggested" | "active" | "paused" | "rejected";
  isPrimary: boolean;
};

export type AssetRecord = {
  id: string;
  type:
    | "resume"
    | "cover_letter"
    | "research"
    | "application_answers"
    | "interview"
    | "ninety_day_plan";
  version: number;
  filename: string | null;
  contentSha256: string | null;
  pageCount: number | null;
  reviewState: "draft" | "claim_safe" | "approved" | "superseded";
  content: JsonRecord | null;
  invalidatedAt: number | null;
  updatedAt: number;
};

export type OpportunityRecord = {
  id: string;
  employer: string;
  title: string;
  canonicalUrl: string;
  locations: string[];
  compensation: JsonRecord | null;
  freshnessState: "fresh" | "stale_risk" | "stale" | "removed" | "unknown";
  postedAt: number | null;
  lastCheckedAt: number;
  sourceName: string;
  sourceRightsState: "approved" | "restricted" | "unknown" | "rejected";
  sourceVersion: {
    id: string;
    checksum: string;
    captureState: "verified" | "partial" | "conflict" | "unavailable";
    conflicts: string[];
    facts: JsonRecord;
    checkedAt: number;
  } | null;
  analysis: {
    id: string;
    moveValueScore: number | null;
    pursuitReadinessScore: number | null;
    fit: JsonRecord;
    integrityGates: JsonRecord;
    unknowns: string[];
    recommendation: "pursue" | "watch" | "pass" | "needs_evidence";
    validationState: "pending" | "trusted" | "blocked" | "invalidated";
  } | null;
  pursuit: {
    id: string;
    state:
      | "saved"
      | "researching"
      | "preparing"
      | "ready_for_approval"
      | "applying"
      | "applied"
      | "interviewing"
      | "closed";
    nextAction: string | null;
    externalApprovalState:
      | "not_requested"
      | "requested"
      | "approved"
      | "revoked"
      | "completed";
    starters: {
      resume: {
        id: string;
        name: string;
        version: number;
        reviewState: "draft" | "approved" | "superseded";
      } | null;
      coverLetter: {
        id: string;
        version: number;
        reviewState: "draft" | "claim_safe" | "approved" | "superseded";
      } | null;
    };
    assets: AssetRecord[];
    package: {
      id: string;
      version: number;
      destinationUrl: string;
      jobPostingVersionId: string;
      payloadSha256: string;
      approvalState: "approved" | "not_approved";
      blockers: string[];
      readinessState: "blocked" | "ready_for_review" | "superseded";
      assetManifest: JsonRecord;
      answers: JsonRecord;
      createdAt: number;
    } | null;
  } | null;
};

export type WorkspaceRecord = {
  actor: FounderActor;
  profile: {
    displayName: string;
    headline: string | null;
    summary: string | null;
    confirmedFactCount: number;
    unresolvedFactCount: number;
    experiences: ExperienceRecord[];
    removedExperiences: ExperienceRecord[];
    skills: Array<{
      id: string;
      name: string;
      category: string;
      level: string | null;
      reviewState: "draft" | "confirmed" | "rejected";
    }>;
  };
  jobStandard: JobStandardRecord | null;
  careerPaths: CareerPathRecord[];
  opportunities: OpportunityRecord[];
  system: {
    environment: "founder_production";
    operatorAssisted: true;
    canRecordOperatorAnalysis: boolean;
    billingEnabled: false;
    submissionEnabled: false;
    refreshedAt: number;
  };
};

export type FounderBootstrapPayload = {
  profile: {
    displayName: string;
    headline: string;
    summary: string;
    facts: Array<{
      id: string;
      factType: string;
      value: JsonRecord;
      sourceSpan?: string;
      state: "user_confirmed" | "user_corrected" | "missing";
      confidence?: number;
      ownership?: "owned" | "shared" | "supported" | "unknown";
    }>;
    experiences: Array<{
      id: string;
      employer: string;
      title: string;
      startDate?: string;
      endDate?: string;
      isCurrent: boolean;
      location?: string;
      summary?: string;
      reviewState: "draft" | "confirmed" | "conflict";
    }>;
    skills: Array<{
      id: string;
      name: string;
      category: string;
      level?: "foundational" | "working" | "advanced" | "expert";
      reviewState: "draft" | "confirmed" | "rejected";
    }>;
  };
  jobStandard: Omit<JobStandardRecord, "id" | "version">;
  careerPaths: CareerPathRecord[];
  opportunities: Array<{
    source: {
      id: string;
      name: string;
      kind: "employer_ats" | "employer_page" | "government" | "user_added" | "partner";
      rightsState: "approved" | "restricted" | "unknown" | "rejected";
      termsVersion?: string;
    };
    posting: {
      id: string;
      externalId: string;
      canonicalUrl: string;
      employer: string;
      title: string;
      mandate?: string;
      locations: string[];
      compensation: JsonRecord;
      descriptionChecksum: string;
      firstSeenAt: number;
      lastCheckedAt: number;
      postedAt?: number;
      freshnessState: "fresh" | "stale_risk" | "stale" | "removed" | "unknown";
    };
    version: {
      id: string;
      sourceCheckedAt: number;
      sourceUrl: string;
      descriptionChecksum: string;
      sourceFacts: JsonRecord;
      sourceConflicts: string[];
      captureState: "verified" | "partial" | "conflict" | "unavailable";
    };
    analysis: {
      id: string;
      careerPathId?: string;
      policyVersion: string;
      evidenceVersion: string;
      integrityGates: JsonRecord;
      moveValueScore?: number;
      pursuitReadinessScore?: number;
      fit: JsonRecord;
      unknowns: string[];
      recommendation: "pursue" | "watch" | "pass" | "needs_evidence";
      validationState: "pending" | "trusted" | "blocked" | "invalidated";
    };
    pursuit?: {
      id: string;
      state: OpportunityRecord["pursuit"] extends infer P
        ? P extends { state: infer S }
          ? S
          : never
        : never;
      nextAction: string;
      assets: Array<{
        id: string;
        type: AssetRecord["type"];
        version: number;
        content: JsonRecord;
        contentSha256: string;
        filename?: string;
        pageCount?: number;
        reviewState: AssetRecord["reviewState"];
        sourceVersions: JsonRecord;
        generationPolicyVersion: string;
      }>;
      package?: {
        id: string;
        version: number;
        destinationUrl: string;
        answers: JsonRecord;
        assetManifest: JsonRecord;
        blockers: string[];
        payloadSha256: string;
        readinessState: "blocked" | "ready_for_review";
      };
    };
  }>;
};
