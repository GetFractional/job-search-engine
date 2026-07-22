export type ApprovalPhase =
  | "unapproved"
  | "approved"
  | "handoff"
  | "verified"
  | "unconfirmed"
  | "revoked";

export type AccountingScenario =
  | "material"
  | "no-action"
  | "conflict"
  | "offline"
  | "loading"
  | "partial"
  | "capacity"
  | "budget"
  | "validation"
  | "error";

export type FixtureAccountingCategory = "surfaced" | "suppressed" | "unresolved";

export type ReviewActionKind =
  | "return_opportunities"
  | "edit_radar"
  | "review_correction"
  | "resolve_review_items"
  | "inspect_source"
  | "continue_pursuit";

export function deriveReviewAction(input: {
  decision?: string;
  correctionPending: boolean;
  inactive: boolean;
  blockingGateCount: number;
  hasReviewItems: boolean;
  workflowAction: string;
}): { kind: ReviewActionKind; label: string } {
  if (input.decision === "Pass") return { kind: "return_opportunities", label: "Return to opportunities" };
  if (input.decision === "Watch") return { kind: "edit_radar", label: "Edit job watch" };
  if (input.inactive) return { kind: "return_opportunities", label: "Return to opportunities" };
  if (input.correctionPending) return { kind: "review_correction", label: "Review pending correction" };
  if (input.decision === "Pursue" && !input.blockingGateCount) return { kind: "continue_pursuit", label: "Continue pursuit preparation" };
  if (input.hasReviewItems) {
    return {
      kind: "resolve_review_items",
      label: input.decision === "Pursue" && input.blockingGateCount ? "Review what still needs proof" : input.workflowAction,
    };
  }
  return { kind: "inspect_source", label: input.workflowAction };
}

export function classifyFixtureForScenario(
  job: { id: string; recommendation: string; integrity: string },
  scenario: AccountingScenario,
  correctionPending = false,
): FixtureAccountingCategory {
  if (correctionPending) return "unresolved";
  const structurallyUnresolved = job.integrity === "unknown" || job.integrity === "conflict" || job.recommendation === "Watch";
  const structurallySuppressed = job.integrity === "inactive" || job.recommendation === "Pass" || job.recommendation === "Ignore";

  if (structurallySuppressed) return "suppressed";
  if (scenario === "no-action") return structurallyUnresolved ? "unresolved" : "suppressed";
  if (scenario === "partial") {
    if (job.id === "going" || structurallyUnresolved) return "unresolved";
    return "suppressed";
  }
  if (structurallyUnresolved) return "unresolved";
  return job.recommendation === "Pursue" || job.recommendation === "Investigate" ? "surfaced" : "suppressed";
}

export type DemoPayload = {
  version: number;
  fingerprint: string;
  destination: string;
  answerCount: number;
};

export type ApprovalAuthorization = {
  id: string;
  payloadKey: string;
  approvedAt: string;
};

export type ApprovalReceipt = {
  id: string;
  approvalId: string;
  payloadKey: string;
  destination: string;
  confirmationEvidence: "visible_demo_confirmation";
  confirmedAt: string;
};

export type ApprovalState = {
  phase: ApprovalPhase;
  payload: DemoPayload;
  authorization: ApprovalAuthorization | null;
  receipt: ApprovalReceipt | null;
};

export const INITIAL_DEMO_PAYLOAD: DemoPayload = {
  version: 3,
  fingerprint: "8F2C",
  destination: "https://careers.example.invalid/cedarfield/demo-1842",
  answerCount: 11,
};

export function payloadKey(payload: DemoPayload) {
  return [payload.version, payload.fingerprint, payload.destination, payload.answerCount].join("|");
}

export function initialApprovalState(): ApprovalState {
  return {
    phase: "unapproved",
    payload: { ...INITIAL_DEMO_PAYLOAD },
    authorization: null,
    receipt: null,
  };
}

export function isApprovalCurrent(state: ApprovalState) {
  return state.authorization?.payloadKey === payloadKey(state.payload);
}

export function approveCurrentPayload(state: ApprovalState, now: string): ApprovalState {
  const currentKey = payloadKey(state.payload);
  return {
    ...state,
    phase: "approved",
    authorization: {
      id: `demo-approval-${state.payload.version}-${state.payload.fingerprint}`,
      payloadKey: currentKey,
      approvedAt: now,
    },
    receipt: null,
  };
}

export function simulatePackageChange(state: ApprovalState): ApprovalState {
  const nextVersion = state.payload.version + 1;
  return {
    ...state,
    phase: "revoked",
    payload: {
      ...state.payload,
      version: nextVersion,
      fingerprint: nextVersion === 4 ? "91BD" : `CHG${nextVersion}`,
    },
    receipt: null,
  };
}

export function simulateHandoff(state: ApprovalState): ApprovalState {
  if (state.phase !== "approved" || !isApprovalCurrent(state)) return { ...state, phase: "revoked", receipt: null };
  return { ...state, phase: "handoff", receipt: null };
}

export function recordVisibleConfirmation(state: ApprovalState, now: string): ApprovalState {
  if (state.phase !== "handoff" || !state.authorization || !isApprovalCurrent(state)) return { ...state, phase: "revoked", receipt: null };
  const currentKey = payloadKey(state.payload);
  return {
    ...state,
    phase: "verified",
    receipt: {
      id: `demo-receipt-${state.payload.version}-${state.payload.fingerprint}`,
      approvalId: state.authorization.id,
      payloadKey: currentKey,
      destination: state.payload.destination,
      confirmationEvidence: "visible_demo_confirmation",
      confirmedAt: now,
    },
  };
}

export function recordUnconfirmed(state: ApprovalState): ApprovalState {
  return state.phase === "handoff" && isApprovalCurrent(state)
    ? { ...state, phase: "unconfirmed", receipt: null }
    : { ...state, phase: "revoked", receipt: null };
}

export function returnToApprovedPayload(state: ApprovalState): ApprovalState {
  return state.phase === "unconfirmed" && isApprovalCurrent(state)
    ? { ...state, phase: "approved", receipt: null }
    : { ...state, phase: "revoked", receipt: null };
}

type LocalReviewRecordBase = {
  id: string;
  jobId: string;
  updatedAt: string;
  syncState: "local_only" | "pending_sync";
};

export type CorrectionRecord = LocalReviewRecordBase & {
  type: "correction";
  requirementId: string;
  kind: "candidate" | "requirement" | "source";
  note: string;
};

export type ProofRecord = LocalReviewRecordBase & {
  type: "proof";
  answers: Record<string, string>;
};

export type LocalReviewRecord = CorrectionRecord | ProofRecord;

export function reviewRecordKey(record: LocalReviewRecord) {
  return record.type === "correction"
    ? `${record.type}|${record.jobId}|${record.requirementId}`
    : `${record.type}|${record.jobId}`;
}

export function upsertReviewRecord(records: LocalReviewRecord[], record: LocalReviewRecord) {
  const key = reviewRecordKey(record);
  return [...records.filter((item) => reviewRecordKey(item) !== key), record];
}

export function parseReviewRecords(raw: string | null): LocalReviewRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is LocalReviewRecord => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<LocalReviewRecord>;
      const baseIsValid = (
        (candidate.type === "correction" || candidate.type === "proof") &&
        typeof candidate.id === "string" &&
        typeof candidate.jobId === "string" &&
        typeof candidate.updatedAt === "string" &&
        (candidate.syncState === "local_only" || candidate.syncState === "pending_sync")
      );
      if (!baseIsValid) return false;
      if (candidate.type === "correction") {
        return (
          typeof candidate.requirementId === "string" &&
          (candidate.kind === "candidate" || candidate.kind === "requirement" || candidate.kind === "source") &&
          typeof candidate.note === "string"
        );
      }
      const proof = candidate as Partial<ProofRecord>;
      return Boolean(proof.answers && typeof proof.answers === "object" && !Array.isArray(proof.answers));
    });
  } catch {
    return [];
  }
}
