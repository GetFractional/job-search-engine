export type EvidenceState =
  | "proven"
  | "plausible"
  | "missing"
  | "risky"
  | "excluded"
  | "disqualifying";

export type RequirementPriority =
  | "Required"
  | "Preferred"
  | "Bonus"
  | "Context"
  | "Anti-fit"
  | "Ambiguous";

export type Recommendation =
  | "Pursue"
  | "Investigate"
  | "Watch"
  | "Pass"
  | "Ignore";

export type SourceSpan = {
  sourceRef: string;
  startLine: number | null;
  endLine: number | null;
  exactText: string | null;
  spanState: "exact" | "derived" | "unavailable";
};

export type EmployerRequirement = {
  id: string;
  displayText: string;
  exactEmployerText: string | null;
  source: string;
  sourceKind: "job" | "application";
  sourceSpan: SourceSpan;
  interpretationState:
    | "gold_locked"
    | "adjudicated_derived"
    | "provisional_derived";
  requirementKind:
    | "experience"
    | "capability"
    | "tool"
    | "leadership"
    | "domain"
    | "logistics"
    | "application_instruction"
    | "opportunity_integrity";
  priority: RequirementPriority;
  modality:
    | "must"
    | "required"
    | "expected"
    | "preferred"
    | "ideally"
    | "bonus"
    | "not_for"
    | "contextual"
    | "ambiguous";
  logicalGroupId: string | null;
  logicalOperator: "AND" | "OR" | null;
  alternatives: string[];
  alternativeSemantics:
    | "all_of"
    | "any_of"
    | "examples_only"
    | "not_applicable";
  negated: boolean;
};

export type RequirementAssessment = {
  id: string;
  requirementId: string;
  state: EvidenceState;
  rationale: string;
  proof: string;
  proofState:
    | "approved"
    | "narrowly_approved"
    | "unverified"
    | "not_found"
    | "excluded";
  source: string;
  sourceRef: string | null;
  sourceKind:
    | "profile"
    | "metrics"
    | "story"
    | "baseline"
    | "source-adjudication"
    | "none";
  effect: string;
  recoveryAction: string | null;
};

export type ApplicationQuestion = {
  id: string;
  displayPrompt: string;
  exactPrompt: string | null;
  promptState: "exact" | "derived" | "unavailable";
  source: string;
  sourceSpan: SourceSpan;
  responseType: "yes_no" | "single_select" | "multi_select" | "text";
  required: boolean;
  options: string[] | null;
  linkedRequirementIds: string[];
  gateEffect: "blocking_if_unresolved" | "warning" | "none";
  answerState: "unanswered" | "supported" | "unsupported" | "needs_review";
};

export type Gate = {
  id: string;
  kind:
    | "opportunity_integrity"
    | "source_conflict"
    | "application_requirement"
    | "candidate_proof"
    | "logistics"
    | "compensation"
    | "freshness"
    | "mandate_fit";
  status: "clear" | "unresolved" | "blocked" | "overridden";
  overridePolicy: "non_overridable" | "explicit_user_exception";
  blocksPreparation: boolean;
  reason: string;
  recoveryAction: string;
  sourceRefs: string[];
  linkedRequirementIds: string[];
};

export type FitDimension = {
  id: string;
  type:
    | "candidate_evidence_confidence"
    | "mandate_and_role_lane_fit"
    | "material_upside"
    | "compensation_and_benefits"
    | "hiring_plausibility"
    | "opportunity_integrity"
    | "career_capital"
    | "logistics"
    | "freshness_and_effort";
  label: string;
  weight: number;
  score: number;
  contribution: number;
  rationale: string;
  uncertainty: string | null;
  evidenceRefs: string[];
  policyVersion: string;
  adjudicationState: "adjudicated";
};

export type ScoreRange = {
  lower: number;
  upper: number;
  status: "adjudicated";
};

export type PayComponent = {
  id: string;
  kind:
    | "base"
    | "variable"
    | "bonus"
    | "commission"
    | "equity"
    | "sign_on"
    | "other";
  label: string;
  value: string;
  state:
    | "published"
    | "offered"
    | "eligible"
    | "target"
    | "unknown"
    | "not_stated"
    | "suppressed_by_gate";
  disclosureSemantics:
    | "exact_range"
    | "starting_at"
    | "up_to"
    | "lower_only"
    | "upper_only"
    | "percentage_stated"
    | "offered_unvalued"
    | "eligibility_only"
    | "not_disclosed";
  lower: number | null;
  upper: number | null;
  percentage: number | null;
  currency: "USD" | "CAD" | null;
  cadence: "annual" | "hourly" | "one_time" | null;
  guaranteed: "yes" | "no" | "unknown";
  geography: {
    label: string | null;
    applicability: "applicable" | "unresolved" | "not_applicable" | "not_stated";
  };
  equity: {
    type: string | null;
    amount: number | null;
    vesting: string | null;
    valuation: number | null;
  } | null;
  note: string;
  sourceRef: string | null;
};

export type Benefit = {
  id: string;
  category:
    | "medical"
    | "dental"
    | "vision"
    | "retirement"
    | "leave"
    | "pto"
    | "stipend"
    | "life_insurance"
    | "disability"
    | "other";
  label: string;
  value: string;
  exactText: string | null;
  state:
    | "explicitly_offered"
    | "eligibility_only"
    | "explicitly_absent"
    | "unknown";
  employeeCoveragePercent: number | null;
  dependentCoveragePercent: number | null;
  matchPercent: number | null;
  vesting: string | null;
  leaveWeeks: number | null;
  leaveQualifier: "exact" | "up_to" | "unknown" | null;
  waitingPeriod: string | null;
  employeeApplicability: "stated" | "unknown";
  dependentApplicability: "stated" | "unknown";
  geography: string | null;
  note: string;
  sourceRef: string | null;
};

export type CompensationAmbiguityObservation = {
  id: string;
  exactText: string;
  source: string;
  sourceState: "synthetic_test";
  classification: "excluded_non_compensation";
  reason: string;
};

export type ExtractionReceipt = {
  evidenceTier:
    | "extraction_gold"
    | "adjudication_gold"
    | "negative_control"
    | "provisional";
  captureCompleteness: "full" | "partial" | "derived" | "unknown";
  coverageEligible: boolean;
  coverage: string;
  source: string;
  sourceRef: string;
  captured: string;
  snapshotHash: string | null;
  interpretation: string;
  flags: string[];
};

export type JobFixture = {
  id: string;
  company: string;
  title: string;
  lane: string;
  recommendation: Recommendation;
  alignment: string;
  score: number | null;
  scoreRange: ScoreRange | null;
  scoreStatus:
    | "legacy_case_input"
    | "suppressed_by_gate"
    | "not_adjudicated";
  scoreSource: string;
  scoreCoverage: string;
  fitDimensions: FitDimension[];
  fitDimensionStatus:
    | "adjudicated"
    | "suppressed_pending_adjudication"
    | "suppressed_by_gate";
  location: string;
  compensation: string;
  freshness: string;
  sourceStatus: string;
  integrity: "verified" | "unknown" | "conflict" | "inactive";
  why: string;
  risk: string;
  workflowAction: string;
  employerRequirements: EmployerRequirement[];
  requirementAssessments: RequirementAssessment[];
  applicationQuestions: ApplicationQuestion[];
  gates: Gate[];
  pay: PayComponent[];
  benefits: Benefit[];
  compensationAmbiguityObservations: CompensationAmbiguityObservation[];
  baseline: { label: string; current: string; opportunity: string; result: string }[];
  extraction: ExtractionReceipt;
};

export type RequirementView = {
  id: string;
  text: string;
  exactEmployerText: string | null;
  priority: RequirementPriority;
  modality: EmployerRequirement["modality"];
  logicalGroupId: string | null;
  logicalOperator: EmployerRequirement["logicalOperator"];
  alternatives: string[];
  alternativeSemantics: EmployerRequirement["alternativeSemantics"];
  interpretationState: EmployerRequirement["interpretationState"];
  employerSource: string;
  employerSourceKind: EmployerRequirement["sourceKind"];
  employerSourceSpan: SourceSpan;
  state: EvidenceState;
  rationale: string;
  proof: string;
  proofState: RequirementAssessment["proofState"];
  source: string;
  sourceRef: string | null;
  effect: string;
  recoveryAction: string | null;
  sourceKind: RequirementAssessment["sourceKind"];
};

// Compatibility name for the existing prototype UI while it migrates to the
// separate employer-requirement and candidate-assessment collections.
export type Requirement = RequirementView;

export const COMPENSATION_AMBIGUITY_OBSERVATIONS: CompensationAmbiguityObservation[] = [
  {
    id: "equity-language-negative-control",
    exactText: "diversity, equity, and inclusion; advancing health equity",
    source: "Synthetic ambiguity control required by the JD interpretation contract",
    sourceState: "synthetic_test",
    classification: "excluded_non_compensation",
    reason:
      "Equity used in equal-opportunity, inclusion, or health-outcomes language is company context, not an equity-compensation component.",
  },
];

// Client-safe evidence labels only. Private filenames, local paths, storage keys,
// and line locators belong in server-side provenance records and must never be
// serialized into a customer bundle.
const GOING_RECEIPT = "Going decision evidence record";
const GOING_PROOF = "Going candidate proof record";
const TEBRA_PROOF = "Tebra candidate proof record";
const TEXTNOW_RECEIPT = "TextNow decision evidence record";
const THNKS_JD = "THNKS employer job record";
const RADAR = "Opportunity watch evidence register";
const PROFILE = "Candidate profile evidence record";
const METRICS = "Candidate metrics evidence record";
const STORY = "Candidate story evidence record";

function exactSpan(
  sourceRef: string,
  startLine: number,
  endLine: number,
  exactText: string,
): SourceSpan {
  return {
    sourceRef,
    startLine,
    endLine,
    exactText,
    spanState: "exact",
  };
}

function derivedSpan(
  sourceRef: string,
  startLine: number,
  endLine: number,
  exactText: string,
): SourceSpan {
  return {
    sourceRef,
    startLine,
    endLine,
    exactText,
    spanState: "derived",
  };
}

const goingEmployerRequirements: EmployerRequirement[] = [
  {
    id: "going-scale",
    displayText: "Lifecycle programs at meaningful consumer scale",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      71,
      81,
      "Lifecycle strategy, execution, reporting, activation, engagement, retention, channel orchestration, experimentation, and team leadership.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "expected",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "going-braze-platform",
    displayText: "Braze or an equivalent lifecycle platform",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      46,
      58,
      "Core platform: Braze or equivalent lifecycle platform.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "tool",
    priority: "Required",
    modality: "expected",
    logicalGroupId: "going-lifecycle-platform",
    logicalOperator: "OR",
    alternatives: ["Braze", "equivalent lifecycle platform"],
    alternativeSemantics: "any_of",
    negated: false,
  },
  {
    id: "going-audience",
    displayText: "Grow and operate a large CRM audience",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      63,
      67,
      "Turn a large travel-membership audience into stronger activation, engagement, retention, and lifetime value.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "expected",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "going-leadership",
    displayText: "Lead across creative, product, data, and technical partners",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      71,
      81,
      "Partnership with Product, Engineering, and Data, plus creative quality and lifecycle team leadership.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "leadership",
    priority: "Required",
    modality: "expected",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "going-ownership",
    displayText: "End-to-end lifecycle ownership",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      71,
      81,
      "Lifecycle strategy, execution, calendar, reporting, and performance.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "expected",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "going-segmentation",
    displayText: "Behavioral segmentation and personalization",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      71,
      81,
      "Segmentation, experimentation, and customer-journey design.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Preferred",
    modality: "ambiguous",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "going-liquid",
    displayText: "Braze Canvas, Liquid, event, integration, and testing mechanics",
    exactEmployerText: null,
    source: "Going requirement interpretation; raw employer span not locally frozen",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_PROOF,
      26,
      27,
      "Braze platform experience is proven narrowly; Canvas, Liquid, events, integrations, testing, or architecture remain missing or risky.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "tool",
    priority: "Ambiguous",
    modality: "ambiguous",
    logicalGroupId: "going-braze-mechanics",
    logicalOperator: "AND",
    alternatives: ["Canvas", "Liquid", "events", "integrations", "testing"],
    alternativeSemantics: "all_of",
    negated: false,
  },
  {
    id: "going-mobile",
    displayText: "Push and in-app channel ownership",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      71,
      81,
      "Email, push, in-app, and web orchestration.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "expected",
    logicalGroupId: "going-mobile-channels",
    logicalOperator: "AND",
    alternatives: ["push", "in-app"],
    alternativeSemantics: "all_of",
    negated: false,
  },
  {
    id: "going-ltv",
    displayText: "Cohort, retention, and LTV analysis",
    exactEmployerText: null,
    source: "Going role interpretation derived from the local decision receipt",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      GOING_RECEIPT,
      71,
      83,
      "Activation, engagement, retention, and LTV programs; likely KPI families include cohort retention and LTV.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "expected",
    logicalGroupId: "going-lifecycle-analysis",
    logicalOperator: "AND",
    alternatives: ["cohort analysis", "retention analysis", "LTV analysis"],
    alternativeSemantics: "all_of",
    negated: false,
  },
];

const goingRequirementAssessments: RequirementAssessment[] = [
  {
    id: "assessment-going-scale",
    requirementId: "going-scale",
    state: "proven",
    rationale: "Approved evidence supports systems work at meaningful scale without claiming direct management of the full audience.",
    proof: "Supported lifecycle and operational systems across 600K+ activations/customers.",
    proofState: "approved",
    source: "Metrics Ledger · Prosper Wireless",
    sourceRef: `${METRICS}:126`,
    sourceKind: "metrics",
    effect: "Strengthens evidence confidence",
    recoveryAction: null,
  },
  {
    id: "assessment-going-braze-platform",
    requirementId: "going-braze-platform",
    state: "proven",
    rationale: "Braze appears in approved Prosper systems evidence, but dates, access level, and operating mechanics remain unknown.",
    proof: "Narrowly proven Braze platform experience; no advanced-depth claim.",
    proofState: "narrowly_approved",
    source: "Canonical Profile · Prosper systems",
    sourceRef: `${PROFILE}:255`,
    sourceKind: "profile",
    effect: "Supports platform familiarity only",
    recoveryAction: "Confirm dates, access level, and one personally operated Braze journey.",
  },
  {
    id: "assessment-going-audience",
    requirementId: "going-audience",
    state: "proven",
    rationale: "Candidate evidence is separate from Going's audience description and supports large CRM audience growth.",
    proof: "Grew the Bob's Watches email list 225% to 250K+ subscribers.",
    proofState: "approved",
    source: "Metrics Ledger · Bob's Watches",
    sourceRef: `${METRICS}:114`,
    sourceKind: "metrics",
    effect: "Material positive evidence",
    recoveryAction: null,
  },
  {
    id: "assessment-going-leadership",
    requirementId: "going-leadership",
    state: "proven",
    rationale: "Approved history supports team, vendor, data, automation, and cross-functional leadership.",
    proof: "Led cross-functional teams and 15+ vendors; exact Product/Engineering decision rights remain open.",
    proofState: "narrowly_approved",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Supports level and operating style",
    recoveryAction: "Confirm direct reports and Product, Engineering, and Data decision rights.",
  },
  {
    id: "assessment-going-ownership",
    requirementId: "going-ownership",
    state: "plausible",
    rationale: "Multi-stage lifecycle responsibility is documented, but one exact end-to-end journey and ownership boundary remain unresolved.",
    proof: "Transferable multi-stage lifecycle responsibility.",
    proofState: "unverified",
    source: "Story Bank",
    sourceRef: STORY,
    sourceKind: "story",
    effect: "Decision-critical proof question",
    recoveryAction: "Document one end-to-end journey, ownership split, and measured result.",
  },
  {
    id: "assessment-going-segmentation",
    requirementId: "going-segmentation",
    state: "plausible",
    rationale: "Related CRM work exists, but behavioral depth is not approved for external use.",
    proof: "Transferable segmentation work without an approved behavioral example.",
    proofState: "unverified",
    source: "Story Bank",
    sourceRef: STORY,
    sourceKind: "story",
    effect: "Keeps recommendation conditional",
    recoveryAction: "Provide one source-backed segment, trigger, channel, and result.",
  },
  {
    id: "assessment-going-liquid",
    requirementId: "going-liquid",
    state: "missing",
    rationale: "No approved evidence documents Canvas, Liquid, event, integration, or testing mechanics.",
    proof: "No verified record found.",
    proofState: "not_found",
    source: "Going proof audit",
    sourceRef: `${GOING_PROOF}:26`,
    sourceKind: "source-adjudication",
    effect: "Proof gap 1 of 3",
    recoveryAction: "Confirm exact Braze features personally operated; `none` is valid.",
  },
  {
    id: "assessment-going-mobile",
    requirementId: "going-mobile",
    state: "missing",
    rationale: "Email and CRM tenure cannot establish push or in-app ownership.",
    proof: "No verified push or in-app example found.",
    proofState: "not_found",
    source: "Going proof audit",
    sourceRef: `${GOING_PROOF}:30`,
    sourceKind: "source-adjudication",
    effect: "Proof gap 2 of 3",
    recoveryAction: "Confirm a source-backed push or in-app example; `none` is valid.",
  },
  {
    id: "assessment-going-ltv",
    requirementId: "going-ltv",
    state: "risky",
    rationale: "No externally safe cohort, churn, or LTV method or result is approved.",
    proof: "Related lifecycle responsibility exists; exact analytics claims remain excluded.",
    proofState: "excluded",
    source: "Going proof audit",
    sourceRef: `${GOING_PROOF}:38`,
    sourceKind: "source-adjudication",
    effect: "Proof gap 3 of 3",
    recoveryAction: "Classify cohort, retention, churn, LTV, and SQL depth with one decision example each.",
  },
];

const thnksEmployerRequirements: EmployerRequirement[] = [
  {
    id: "thnks-years",
    displayText: "7+ years doing growth, performance, or lifecycle marketing hands-on",
    exactEmployerText: "7 or more years doing growth, performance, or lifecycle marketing yourself",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      34,
      34,
      "7 or more years doing growth, performance, or lifecycle marketing yourself, ideally at a consumption, product-led, or marketplace business. Not seven years managing people who did it.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "experience",
    priority: "Required",
    modality: "required",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "thnks-business",
    displayText: "Consumption, product-led, or marketplace business experience",
    exactEmployerText: "ideally at a consumption, product-led, or marketplace business",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      34,
      34,
      "ideally at a consumption, product-led, or marketplace business",
    ),
    interpretationState: "gold_locked",
    requirementKind: "domain",
    priority: "Preferred",
    modality: "ideally",
    logicalGroupId: "thnks-business-model",
    logicalOperator: "OR",
    alternatives: ["consumption", "product-led", "marketplace"],
    alternativeSemantics: "any_of",
    negated: false,
  },
  {
    id: "thnks-paid",
    displayText: "Hands-on LinkedIn, Meta, and Google paid platforms",
    exactEmployerText: "Real hands-on with paid platforms (LinkedIn, Meta, Google)",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      35,
      35,
      "Real hands-on with paid platforms (LinkedIn, Meta, Google)",
    ),
    interpretationState: "gold_locked",
    requirementKind: "tool",
    priority: "Required",
    modality: "required",
    logicalGroupId: "thnks-paid-platforms",
    logicalOperator: "AND",
    alternatives: ["LinkedIn Ads", "Meta Ads", "Google Ads"],
    alternativeSemantics: "all_of",
    negated: false,
  },
  {
    id: "thnks-crm",
    displayText: "Hands-on lifecycle or CRM stack experience",
    exactEmployerText: "a lifecycle or CRM stack (HubSpot or similar)",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      35,
      35,
      "a lifecycle or CRM stack (HubSpot or similar)",
    ),
    interpretationState: "gold_locked",
    requirementKind: "tool",
    priority: "Required",
    modality: "required",
    logicalGroupId: "thnks-crm-stack",
    logicalOperator: "OR",
    alternatives: ["HubSpot", "similar lifecycle or CRM stack"],
    alternativeSemantics: "any_of",
    negated: false,
  },
  {
    id: "thnks-analytics",
    displayText: "Product and web analytics",
    exactEmployerText: "product and web analytics (GA4, Mixpanel, or Amplitude)",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      35,
      35,
      "product and web analytics (GA4, Mixpanel, or Amplitude)",
    ),
    interpretationState: "gold_locked",
    requirementKind: "tool",
    priority: "Required",
    modality: "required",
    logicalGroupId: "thnks-analytics-tools",
    logicalOperator: "OR",
    alternatives: ["GA4", "Mixpanel", "Amplitude"],
    alternativeSemantics: "any_of",
    negated: false,
  },
  {
    id: "thnks-seo",
    displayText: "Proven organic acquisition and SEO growth",
    exactEmployerText: "Proven organic acquisition and SEO growth using tools like Ahrefs, SEMrush, and Search Console.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      36,
      36,
      "Proven organic acquisition and SEO growth using tools like Ahrefs, SEMrush, and Search Console.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "capability",
    priority: "Required",
    modality: "required",
    logicalGroupId: "thnks-seo-examples",
    logicalOperator: null,
    alternatives: ["Ahrefs", "SEMrush", "Search Console"],
    alternativeSemantics: "examples_only",
    negated: false,
  },
  {
    id: "thnks-tracking",
    displayText: "Set up tracking before launch and retire what is not paying back",
    exactEmployerText: "A strict discipline to set up tracking before you launch and retire what isn't paying back.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      37,
      37,
      "A strict discipline to set up tracking before you launch and retire what isn't paying back.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "capability",
    priority: "Required",
    modality: "required",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "thnks-ai",
    displayText: "Use AI as a daily multiplier for testing, modeling, and writing",
    exactEmployerText: "An AI-native mindset where AI is a daily multiplier",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      38,
      38,
      "An AI-native mindset where AI is a daily multiplier, using it to run more tests, build models faster, and write sharper briefs and emails at the same headcount.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "capability",
    priority: "Required",
    modality: "required",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: ["Claude", "Clay"],
    alternativeSemantics: "examples_only",
    negated: false,
  },
  {
    id: "thnks-pql",
    displayText: "Run a product-qualified-lead motion",
    exactEmployerText: "You have run a PQL motion.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(THNKS_JD, 41, 41, "You have run a PQL motion."),
    interpretationState: "gold_locked",
    requirementKind: "capability",
    priority: "Bonus",
    modality: "bonus",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "thnks-self-serve-enterprise",
    displayText: "Work across a self-serve-to-enterprise motion",
    exactEmployerText: "You have worked a self-serve to enterprise motion.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      42,
      42,
      "You have worked a self-serve to enterprise motion.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "domain",
    priority: "Bonus",
    modality: "bonus",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "thnks-intent",
    displayText: "Use 6sense or a similar intent source in live routing",
    exactEmployerText: "You have used 6sense or a similar intent data source in a live routing motion.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      43,
      43,
      "You have used 6sense or a similar intent data source in a live routing motion.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "tool",
    priority: "Bonus",
    modality: "bonus",
    logicalGroupId: "thnks-intent-tools",
    logicalOperator: "OR",
    alternatives: ["6sense", "similar intent data source"],
    alternativeSemantics: "any_of",
    negated: false,
  },
  {
    id: "thnks-manager-antifit",
    displayText: "This is not a strategy-only people-management role",
    exactEmployerText: "If you want to manage a team and set strategy from a deck, this is not it.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      46,
      46,
      "If you want to manage a team and set strategy from a deck, this is not it.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "leadership",
    priority: "Anti-fit",
    modality: "not_for",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: true,
  },
  {
    id: "thnks-remote-antifit",
    displayText: "Fully remote work is not available",
    exactEmployerText: "If you want a fully remote job, this is not it.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(THNKS_JD, 47, 47, "If you want a fully remote job, this is not it."),
    interpretationState: "gold_locked",
    requirementKind: "logistics",
    priority: "Anti-fit",
    modality: "not_for",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: true,
  },
  {
    id: "thnks-recency-antifit",
    displayText: "Recent direct work in an ad account or query editor",
    exactEmployerText: "If the last time you were in an ad account or a query editor was three years ago, this is not it.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      48,
      48,
      "If the last time you were in an ad account or a query editor was three years ago, this is not it.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "experience",
    priority: "Anti-fit",
    modality: "not_for",
    logicalGroupId: "thnks-recent-hands-on",
    logicalOperator: "OR",
    alternatives: ["ad account", "query editor"],
    alternativeSemantics: "any_of",
    negated: true,
  },
  {
    id: "thnks-office",
    displayText: "Work in Franklin Monday through Thursday, with Friday remote",
    exactEmployerText: "In-office Monday through Thursday with Friday remote.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(THNKS_JD, 54, 54, "In-office Monday through Thursday with Friday remote."),
    interpretationState: "gold_locked",
    requirementKind: "logistics",
    priority: "Required",
    modality: "required",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "thnks-work-samples",
    displayText: "Submit one or two measured work examples",
    exactEmployerText: "Include one or two examples of a number you moved, what you did to move it, and how you measured it.",
    source: "Local full-text THNKS JD",
    sourceKind: "job",
    sourceSpan: exactSpan(
      THNKS_JD,
      59,
      60,
      "Include one or two examples of a number you moved, what you did to move it, and how you measured it.",
    ),
    interpretationState: "gold_locked",
    requirementKind: "application_instruction",
    priority: "Required",
    modality: "required",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
];

const thnksRequirementAssessments: RequirementAssessment[] = [
  {
    id: "assessment-thnks-years",
    requirementId: "thnks-years",
    state: "plausible",
    rationale: "Nineteen calendar years of marketing experience are established, but the exact seven-year hands-on map should be reviewed rather than inferred from tenure.",
    proof: "Long marketing tenure plus current hands-on systems work; exact qualifying-year map pending.",
    proofState: "unverified",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Experience gate remains reviewable, not automatically proven",
    recoveryAction: "Map seven qualifying years to direct growth, performance, or lifecycle execution.",
  },
  {
    id: "assessment-thnks-business",
    requirementId: "thnks-business",
    state: "plausible",
    rationale: "Subscription and ecommerce experience is adjacent to the preferred business models.",
    proof: "Transferable subscription and ecommerce context.",
    proofState: "unverified",
    source: "Story Bank",
    sourceRef: STORY,
    sourceKind: "story",
    effect: "Preference does not block preparation",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-paid",
    requirementId: "thnks-paid",
    state: "risky",
    rationale: "The role expects current direct operation across all three platforms; paid-search depth and recency are intentionally bounded.",
    proof: "Paid platform leadership exists; exact current hands-on depth needs confirmation.",
    proofState: "unverified",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Material fit risk",
    recoveryAction: "Confirm platform-by-platform access, last-use date, work performed, and result.",
  },
  {
    id: "assessment-thnks-crm",
    requirementId: "thnks-crm",
    state: "proven",
    rationale: "Approved history includes multiple lifecycle and CRM systems; HubSpot itself is not required because the source says `or similar`.",
    proof: "Dynamics 365, Zoho One, Keap/Infusionsoft, Braze, and related lifecycle systems.",
    proofState: "approved",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Clears the CRM alternatives group",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-analytics",
    requirementId: "thnks-analytics",
    state: "proven",
    rationale: "The OR group is satisfied by approved GA4 and web-analytics evidence.",
    proof: "GA4 and web analytics experience.",
    proofState: "approved",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "One approved alternative satisfies the group",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-seo",
    requirementId: "thnks-seo",
    state: "proven",
    rationale: "Long-term SEO ownership and approved tool evidence substantively address the capability.",
    proof: "SEO strategy and execution with Ahrefs, SEMrush, Search Console, and related tools.",
    proofState: "approved",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Strong capability match",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-tracking",
    requirementId: "thnks-tracking",
    state: "plausible",
    rationale: "Tracking, dashboards, and experimentation are documented, but one end-to-end launch discipline example should be selected.",
    proof: "GA4, GTM, dashboards, BI, CRO, and experiment operating systems.",
    proofState: "unverified",
    source: "Story Bank",
    sourceRef: STORY,
    sourceKind: "story",
    effect: "Needs one concrete operating example",
    recoveryAction: "Select one launch where tracking preceded execution and informed a stop/fund decision.",
  },
  {
    id: "assessment-thnks-ai",
    requirementId: "thnks-ai",
    state: "proven",
    rationale: "Approved AI-assisted workflow design supports the capability; Claude and Clay are examples, not mandatory proof.",
    proof: "AI-assisted workflow design, research, evaluation, drafting, and automation.",
    proofState: "approved",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Supports the AI-native requirement without inventing brand ownership",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-pql",
    requirementId: "thnks-pql",
    state: "missing",
    rationale: "No approved PQL-motion example was found.",
    proof: "No verified record found.",
    proofState: "not_found",
    source: "Profile review",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Bonus only; no hard-gate effect",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-self-serve-enterprise",
    requirementId: "thnks-self-serve-enterprise",
    state: "plausible",
    rationale: "Adjacent business motions exist, but a direct self-serve-to-enterprise example is not approved.",
    proof: "Transferable funnel and enterprise context.",
    proofState: "unverified",
    source: "Story Bank",
    sourceRef: STORY,
    sourceKind: "story",
    effect: "Bonus only; no hard-gate effect",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-intent",
    requirementId: "thnks-intent",
    state: "missing",
    rationale: "No approved 6sense or equivalent intent-routing ownership was found.",
    proof: "No verified record found.",
    proofState: "not_found",
    source: "Profile review",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Bonus only; no hard-gate effect",
    recoveryAction: null,
  },
  {
    id: "assessment-thnks-manager-antifit",
    requirementId: "thnks-manager-antifit",
    state: "plausible",
    rationale: "Matt has recent hands-on systems work, but the role explicitly rejects strategy-only leadership and requires an intentional operating-posture check.",
    proof: "Hands-on workflow, analytics, automation, and operating-system work is documented; exact weekly execution mix remains to be confirmed.",
    proofState: "unverified",
    source: "Canonical Profile and Story Bank",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Anti-fit posture must be resolved before preparation",
    recoveryAction: "Confirm willingness and recent examples of direct execution rather than strategy-only management.",
  },
  {
    id: "assessment-thnks-remote-antifit",
    requirementId: "thnks-remote-antifit",
    state: "risky",
    rationale: "The Career Baseline prefers remote work, while the employer explicitly rejects a fully remote arrangement.",
    proof: "Remote is preferred; local hybrid is only acceptable when the total move is compelling.",
    proofState: "unverified",
    source: "Career Baseline",
    sourceRef: "Career Baseline evidence record",
    sourceKind: "baseline",
    effect: "Explicit logistics exception required",
    recoveryAction: "Confirm willingness to accept the non-remote structure for this exact role.",
  },
  {
    id: "assessment-thnks-recency-antifit",
    requirementId: "thnks-recency-antifit",
    state: "risky",
    rationale: "Recent direct work exists, but no approved source yet proves ad-account or query-editor execution within the employer's three-year anti-fit window.",
    proof: "Current systems and marketing work is documented; exact platform or query-editor recency is not locked.",
    proofState: "unverified",
    source: "Profile review",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Material anti-fit and candidate-proof gate",
    recoveryAction: "Name the exact ad account or query editor, task, date, access level, and result; `none` is valid.",
  },
  {
    id: "assessment-thnks-office",
    requirementId: "thnks-office",
    state: "risky",
    rationale: "Remote is preferred, but local hybrid may be acceptable. Four office days require an explicit feasibility decision rather than an automatic disqualification.",
    proof: "Career Baseline permits compelling local hybrid roles; exact commute and schedule acceptance remain unresolved.",
    proofState: "unverified",
    source: "Career Baseline",
    sourceRef: "Career Baseline evidence record",
    sourceKind: "baseline",
    effect: "Blocks preparation until an intentional logistics exception is recorded",
    recoveryAction: "Confirm commute, schedule, and willingness to work in Franklin Monday through Thursday.",
  },
  {
    id: "assessment-thnks-work-samples",
    requirementId: "thnks-work-samples",
    state: "plausible",
    rationale: "Approved metrics exist, but the exact one or two examples and ownership-safe framing must be selected.",
    proof: "Validated metrics exist in the Metrics Ledger.",
    proofState: "unverified",
    source: "Metrics Ledger",
    sourceRef: METRICS,
    sourceKind: "metrics",
    effect: "Application instruction requires a claim-safe work-sample selection",
    recoveryAction: "Select one or two validated examples and verify ownership wording before use.",
  },
];

const tebraEmployerRequirements: EmployerRequirement[] = [
  {
    id: "tebra-tenure",
    displayText: "At least eight years in RevOps, Sales Ops, Marketing Ops, or related GTM Operations",
    exactEmployerText: null,
    source: "Derived from the Tebra application-gate proof audit",
    sourceKind: "application",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      35,
      35,
      "At least 8 years in RevOps, Sales Ops, Marketing Ops, or related GTM Operations.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "experience",
    priority: "Required",
    modality: "required",
    logicalGroupId: "tebra-operations-tenure",
    logicalOperator: "OR",
    alternatives: ["Revenue Operations", "Sales Operations", "Marketing Operations", "related GTM Operations"],
    alternativeSemantics: "any_of",
    negated: false,
  },
  {
    id: "tebra-pipeline",
    displayText: "Own a high-velocity Sales/SDR motion through closed-won",
    exactEmployerText: null,
    source: "Derived from the Tebra application-gate proof audit",
    sourceKind: "application",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      35,
      38,
      "Owned new-business GTM performance across a high-velocity Sales/SDR motion and the lead-to-closed-won acquisition funnel.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "required",
    logicalGroupId: "tebra-pipeline-ownership",
    logicalOperator: "AND",
    alternatives: ["high-velocity Sales/SDR motion", "lead-to-closed-won funnel"],
    alternativeSemantics: "all_of",
    negated: false,
  },
  {
    id: "tebra-forecast",
    displayText: "Run forecast, pipeline-review, and MBR operating cadences",
    exactEmployerText: null,
    source: "Derived from the Tebra application-gate proof audit",
    sourceKind: "application",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      39,
      39,
      "Ran forecast, pipeline, funnel, MBR, QBR, or executive review cadences.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "required",
    logicalGroupId: "tebra-operating-cadence",
    logicalOperator: "OR",
    alternatives: ["forecast review", "pipeline review", "MBR", "QBR", "executive review"],
    alternativeSemantics: "any_of",
    negated: false,
  },
  {
    id: "tebra-tools",
    displayText: "Own Salesforce and specified GTM tool categories",
    exactEmployerText: null,
    source: "Derived from the Tebra application-gate proof audit",
    sourceKind: "application",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      40,
      45,
      "Salesforce, sales engagement, marketing automation, lead routing/data quality, conversational marketing, and revenue/call intelligence tool ownership.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "tool",
    priority: "Required",
    modality: "required",
    logicalGroupId: "tebra-gtm-tool-categories",
    logicalOperator: "AND",
    alternatives: [
      "Salesforce/CRM",
      "sales engagement",
      "marketing automation",
      "lead routing/data quality",
      "conversational marketing",
      "revenue/call intelligence",
    ],
    alternativeSemantics: "all_of",
    negated: false,
  },
  {
    id: "tebra-team",
    displayText: "Manage at least three to five operations, systems, analytics, or GTM professionals",
    exactEmployerText: null,
    source: "Derived from the Tebra application-gate proof audit",
    sourceKind: "application",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      46,
      46,
      "Managed at least 3-5 operations, systems, analytics, or GTM professionals.",
    ),
    interpretationState: "adjudicated_derived",
    requirementKind: "leadership",
    priority: "Required",
    modality: "required",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
];

const tebraRequirementAssessments: RequirementAssessment[] = [
  {
    id: "assessment-tebra-tenure",
    requirementId: "tebra-tenure",
    state: "plausible",
    rationale: "Nineteen calendar years of marketing experience are established, but eight exact years have not been mapped to Tebra's listed operations categories.",
    proof: "Systems-heavy leadership spans multiple roles; the qualifying role-to-category timeline remains unapproved.",
    proofState: "unverified",
    source: "Tebra proof audit",
    sourceRef: `${TEBRA_PROOF}:35`,
    sourceKind: "source-adjudication",
    effect: "Hard application gate",
    recoveryAction: "Map each qualifying role and date to direct RevOps, Sales Ops, Marketing Ops, or related GTM Operations ownership.",
  },
  {
    id: "assessment-tebra-pipeline",
    requirementId: "tebra-pipeline",
    state: "risky",
    rationale: "Growth systems ownership is strong, but exact Sales/SDR accountability and closed-won decision rights remain unresolved.",
    proof: "Adjacent lead-engine and pipeline systems evidence; no approved direct high-velocity SDR ownership claim.",
    proofState: "unverified",
    source: "Tebra proof audit",
    sourceRef: `${TEBRA_PROOF}:35`,
    sourceKind: "source-adjudication",
    effect: "Hard application gate",
    recoveryAction: "Document one high-volume motion, funnel stages, handoffs, metrics, and decision rights.",
  },
  {
    id: "assessment-tebra-forecast",
    requirementId: "tebra-forecast",
    state: "missing",
    rationale: "Dashboards and operating cadence exist, but no named forecast, pipeline, MBR, or QBR example is approved.",
    proof: "No specific cadence, attendees, inputs, decision, and result are documented.",
    proofState: "not_found",
    source: "Tebra proof audit",
    sourceRef: `${TEBRA_PROOF}:39`,
    sourceKind: "source-adjudication",
    effect: "Hard application gate",
    recoveryAction: "Provide one exact operating-cadence example; `none` is valid.",
  },
  {
    id: "assessment-tebra-tools",
    requirementId: "tebra-tools",
    state: "missing",
    rationale: "Category adjacency cannot be treated as direct Salesforce or GTM-tool ownership.",
    proof: "Salesforce familiarity only; several named tool categories have no approved ownership evidence.",
    proofState: "not_found",
    source: "Tebra proof audit",
    sourceRef: `${TEBRA_PROOF}:40`,
    sourceKind: "source-adjudication",
    effect: "Hard application gate",
    recoveryAction: "Classify each tool category by managed, implemented, administered, used, familiar, or none.",
  },
  {
    id: "assessment-tebra-team",
    requirementId: "tebra-team",
    state: "plausible",
    rationale: "Broader team leadership is proven, but exact qualifying direct-report composition is not.",
    proof: "Led a nine-person marketing team and a five-person SEO team; qualifying GTM-operations composition remains open.",
    proofState: "unverified",
    source: "Tebra proof audit",
    sourceRef: `${TEBRA_PROOF}:46`,
    sourceKind: "source-adjudication",
    effect: "Hard application gate",
    recoveryAction: "Confirm functions, direct versus dotted-line status, dates, and management responsibilities.",
  },
];

const tebraApplicationQuestions: ApplicationQuestion[] = [
  {
    id: "tebra-question-tenure",
    displayPrompt: "Do you have at least eight years in RevOps, Sales Ops, Marketing Ops, or related GTM Operations?",
    exactPrompt: null,
    promptState: "derived",
    source: "Local Tebra proof audit; exact live prompt not frozen",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      35,
      35,
      "Derived summary of the eight-year operations-tenure application gate.",
    ),
    responseType: "yes_no",
    required: true,
    options: ["Yes", "No"],
    linkedRequirementIds: ["tebra-tenure"],
    gateEffect: "blocking_if_unresolved",
    answerState: "needs_review",
  },
  {
    id: "tebra-question-pipeline",
    displayPrompt: "Have you owned a high-velocity Sales/SDR new-business motion through closed-won?",
    exactPrompt: null,
    promptState: "derived",
    source: "Local Tebra proof audit; exact live prompt not frozen",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      35,
      38,
      "Derived summary of the high-velocity Sales/SDR and lead-to-closed-won application gate.",
    ),
    responseType: "yes_no",
    required: true,
    options: ["Yes", "No"],
    linkedRequirementIds: ["tebra-pipeline"],
    gateEffect: "blocking_if_unresolved",
    answerState: "needs_review",
  },
  {
    id: "tebra-question-forecast",
    displayPrompt: "Have you run forecast, pipeline-review, MBR, QBR, or equivalent operating cadences?",
    exactPrompt: null,
    promptState: "derived",
    source: "Local Tebra proof audit; exact live prompt not frozen",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      39,
      39,
      "Derived summary of the operating-cadence application gate.",
    ),
    responseType: "yes_no",
    required: true,
    options: ["Yes", "No"],
    linkedRequirementIds: ["tebra-forecast"],
    gateEffect: "blocking_if_unresolved",
    answerState: "needs_review",
  },
  {
    id: "tebra-question-tools",
    displayPrompt: "Which Salesforce and GTM tool categories have you personally owned?",
    exactPrompt: null,
    promptState: "derived",
    source: "Local Tebra proof audit; exact live prompt and options not frozen",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      40,
      45,
      "Derived summary of the CRM and GTM-tool category application gate.",
    ),
    responseType: "multi_select",
    required: true,
    options: null,
    linkedRequirementIds: ["tebra-tools"],
    gateEffect: "blocking_if_unresolved",
    answerState: "needs_review",
  },
  {
    id: "tebra-question-team",
    displayPrompt: "Have at least three to five operations, systems, analytics, or GTM professionals reported to you?",
    exactPrompt: null,
    promptState: "derived",
    source: "Local Tebra proof audit; exact live prompt not frozen",
    sourceSpan: derivedSpan(
      TEBRA_PROOF,
      46,
      46,
      "Derived summary of the operations-team management application gate.",
    ),
    responseType: "yes_no",
    required: true,
    options: ["Yes", "No"],
    linkedRequirementIds: ["tebra-team"],
    gateEffect: "blocking_if_unresolved",
    answerState: "needs_review",
  },
];

const lumerisEmployerRequirements: EmployerRequirement[] = [
  {
    id: "lumeris-sfmc",
    displayText: "Deep Salesforce Marketing Cloud ownership",
    exactEmployerText: null,
    source: "Provisional Radar summary; official raw posting not frozen",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      RADAR,
      26,
      26,
      "Deep Salesforce Marketing Cloud is required.",
    ),
    interpretationState: "provisional_derived",
    requirementKind: "tool",
    priority: "Required",
    modality: "required",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
  {
    id: "lumeris-regulated",
    displayText: "Regulated multi-audience lifecycle experience",
    exactEmployerText: null,
    source: "Provisional Radar summary; official raw posting not frozen",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      RADAR,
      26,
      26,
      "Medicare Advantage, regulated multi-audience lifecycle, holdouts, and incrementality are unproven.",
    ),
    interpretationState: "provisional_derived",
    requirementKind: "domain",
    priority: "Required",
    modality: "ambiguous",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
];

const lumerisRequirementAssessments: RequirementAssessment[] = [
  {
    id: "assessment-lumeris-sfmc",
    requirementId: "lumeris-sfmc",
    state: "missing",
    rationale: "SFMC is specific and material; other CRM tools do not automatically satisfy it.",
    proof: "No verified SFMC depth found.",
    proofState: "not_found",
    source: "Profile review",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Possible knockout",
    recoveryAction: "Freeze the raw posting, confirm exact modality, then verify any direct SFMC work.",
  },
  {
    id: "assessment-lumeris-regulated",
    requirementId: "lumeris-regulated",
    state: "plausible",
    rationale: "Transferable regulated and multi-audience work exists, but Medicare Advantage is not proven.",
    proof: "Adjacent regulated-industry experience.",
    proofState: "unverified",
    source: "Story Bank",
    sourceRef: STORY,
    sourceKind: "story",
    effect: "Needs domain-specific review",
    recoveryAction: "Freeze the raw posting and identify the exact regulated-domain requirement.",
  },
];

const babylistEmployerRequirements: EmployerRequirement[] = [
  {
    id: "babylist-media",
    displayText: "Media and advertising revenue operations",
    exactEmployerText: null,
    source: "Provisional Radar summary; official raw posting not frozen",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      RADAR,
      30,
      30,
      "Media/ad operations, inventory yield, ad servers, pricing, packaging, and revenue recognition are the core mandate.",
    ),
    interpretationState: "provisional_derived",
    requirementKind: "domain",
    priority: "Required",
    modality: "ambiguous",
    logicalGroupId: "babylist-ad-revenue-mandate",
    logicalOperator: "AND",
    alternatives: ["media/ad operations", "inventory yield", "ad servers", "pricing", "packaging"],
    alternativeSemantics: "all_of",
    negated: false,
  },
  {
    id: "babylist-recognition",
    displayText: "Advertising revenue recognition and finance governance",
    exactEmployerText: null,
    source: "Provisional Radar summary; official raw posting not frozen",
    sourceKind: "job",
    sourceSpan: derivedSpan(
      RADAR,
      30,
      30,
      "Revenue recognition is part of the core mandate.",
    ),
    interpretationState: "provisional_derived",
    requirementKind: "capability",
    priority: "Required",
    modality: "ambiguous",
    logicalGroupId: null,
    logicalOperator: null,
    alternatives: [],
    alternativeSemantics: "not_applicable",
    negated: false,
  },
];

const babylistRequirementAssessments: RequirementAssessment[] = [
  {
    id: "assessment-babylist-media",
    requirementId: "babylist-media",
    state: "missing",
    rationale: "The actual mandate centers ad inventory, yield, pricing, and packaging rather than general RevOps.",
    proof: "No direct ad-operations evidence found.",
    proofState: "not_found",
    source: "Canonical Profile",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Mandate mismatch overrides attractive title and pay",
    recoveryAction: "Freeze the raw posting before finalizing the requirement set.",
  },
  {
    id: "assessment-babylist-recognition",
    requirementId: "babylist-recognition",
    state: "missing",
    rationale: "No approved advertising-revenue recognition evidence exists.",
    proof: "No verified record found.",
    proofState: "not_found",
    source: "Profile review",
    sourceRef: PROFILE,
    sourceKind: "profile",
    effect: "Supports Pass recommendation",
    recoveryAction: "Freeze the raw posting before finalizing the requirement set.",
  },
];

export const JOBS: JobFixture[] = [
  {
    id: "going",
    company: "Going",
    title: "Director, Lifecycle Marketing",
    lane: "Lifecycle / CRM / Retention",
    recommendation: "Investigate",
    alignment: "The work, pay, location, and benefits match what you asked for. A few important claims still need proof.",
    score: 85,
    scoreRange: null,
    scoreStatus: "legacy_case_input",
    scoreSource: `${GOING_RECEIPT}:85-97`,
    scoreCoverage: "Coverage percentage not calculated; four decision-critical proof questions remain.",
    fitDimensions: [],
    fitDimensionStatus: "suppressed_pending_adjudication",
    location: "Remote · United States",
    compensation: "Starts at $175,000 plus equity; public upper bound unknown",
    freshness: "Published Jul 10 · verified Jul 17",
    sourceStatus: "Canonical source verified; raw JD snapshot not stored locally",
    integrity: "verified",
    why: "The work, remote setup, starting pay, family benefits, and career growth all improve on what you said matters.",
    risk: "The posting asks for proof that you owned customer follow-up across mobile channels and used Braze. Your profile does not prove that yet.",
    workflowAction: "Review 4 proof questions",
    employerRequirements: goingEmployerRequirements,
    requirementAssessments: goingRequirementAssessments,
    applicationQuestions: [],
    gates: [
      {
        id: "going-proof-gate",
        kind: "candidate_proof",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "Four decision-critical proof questions remain unresolved.",
        recoveryAction: "Complete the Going proof interview and re-adjudicate the affected assessments.",
        sourceRefs: [`${GOING_PROOF}:92`],
        linkedRequirementIds: ["going-ownership", "going-liquid", "going-mobile", "going-ltv"],
      },
    ],
    pay: [
      {
        id: "going-base",
        kind: "base",
        label: "Base salary",
        value: "Starts at $175,000",
        state: "published",
        disclosureSemantics: "starting_at",
        lower: 175000,
        upper: null,
        percentage: null,
        currency: "USD",
        cadence: "annual",
        guaranteed: "unknown",
        geography: { label: "Remote United States", applicability: "applicable" },
        equity: null,
        note: "Lower bound only; upper bound remains null.",
        sourceRef: `${GOING_RECEIPT}:51`,
      },
      {
        id: "going-equity",
        kind: "equity",
        label: "Equity compensation",
        value: "Offered; value and terms unknown",
        state: "offered",
        disclosureSemantics: "offered_unvalued",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: { type: null, amount: null, vesting: null, valuation: null },
        note: "Type, amount, vesting, and value are not public.",
        sourceRef: `${GOING_RECEIPT}:52`,
      },
      {
        id: "going-bonus",
        kind: "bonus",
        label: "Bonus",
        value: "Not stated",
        state: "not_stated",
        disclosureSemantics: "not_disclosed",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "Omission is not proof that no bonus exists.",
        sourceRef: GOING_RECEIPT,
      },
    ],
    benefits: [
      {
        id: "going-health",
        category: "medical",
        label: "Health coverage",
        value: "90% employee and 80% dependent coverage",
        exactText: "Going states it covers 90% of employee and 80% of dependent health coverage.",
        state: "explicitly_offered",
        employeeCoveragePercent: 90,
        dependentCoveragePercent: 80,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "stated",
        geography: null,
        note: "Coverage percentages are preserved from the local decision receipt.",
        sourceRef: `${GOING_RECEIPT}:60`,
      },
      {
        id: "going-leave",
        category: "leave",
        label: "Paid family leave",
        value: "Up to 12 weeks",
        exactText: "Going provides up to 12 weeks of paid family leave.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: 12,
        leaveQualifier: "up_to",
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "The maximum is preserved; eligibility details remain unknown.",
        sourceRef: `${GOING_RECEIPT}:60`,
      },
      {
        id: "going-retirement",
        category: "retirement",
        label: "401(k) match",
        value: "Up to 5% with immediate vesting",
        exactText: "Going matches 401(k) contributions up to 5% with immediate vesting.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: 5,
        vesting: "immediate",
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "The `up to` qualifier is preserved.",
        sourceRef: `${GOING_RECEIPT}:60`,
      },
    ],
    compensationAmbiguityObservations: [],
    baseline: [
      { label: "Base target", current: "$180K ideal", opportunity: "$175K minimum + equity", result: "Near target; upside unknown" },
      { label: "Work style", current: "Remote preferred", opportunity: "Remote U.S.", result: "Clears" },
      { label: "Role lane", current: "Lifecycle is a supported lane", opportunity: "Lifecycle leadership", result: "Strong" },
      { label: "Family package", current: "Benefits matter", opportunity: "Health, leave, 401(k) stated", result: "Positive" },
    ],
    extraction: {
      evidenceTier: "adjudication_gold",
      captureCompleteness: "derived",
      coverageEligible: false,
      coverage: "Not eligible for span-level coverage until the official raw posting is frozen.",
      source: "Local Going decision receipt and proof audit derived from official sources",
      sourceRef: GOING_RECEIPT,
      captured: "Official sources observed Jul 17, 2026; no local raw snapshot hash",
      snapshotHash: null,
      interpretation: "Adjudicated derived fixture; employer wording remains provisional where exact text is unavailable.",
      flags: ["Lower-bound-only salary", "Equity value unknown", "4 proof questions"],
    },
  },
  {
    id: "tebra",
    company: "Tebra",
    title: "Director, GTM Technology",
    lane: "Revenue / Growth Operations",
    recommendation: "Investigate",
    alignment: "High upside, unresolved application gates",
    score: 84,
    scoreRange: null,
    scoreStatus: "legacy_case_input",
    scoreSource: "Opportunity watch evaluation record",
    scoreCoverage: "Coverage percentage not calculated; five derived application gates remain unresolved.",
    fitDimensions: [],
    fitDimensionStatus: "suppressed_pending_adjudication",
    location: "Remote · U.S.; Tennessee pay zone unresolved",
    compensation: "Zone 1: $200,000-$228,000 plus variable pay",
    freshness: "Published Jul 4 · verified Jul 17",
    sourceStatus: "Official source observed; title and geo-pay need adjudication",
    integrity: "conflict",
    why: "The mandate maps to the strongest default role lane and may offer excellent economics.",
    risk: "The eight-year, Sales/SDR, forecasting, Salesforce, and team-ownership questions are not safely answerable yet.",
    workflowAction: "Review 5 application gates",
    employerRequirements: tebraEmployerRequirements,
    requirementAssessments: tebraRequirementAssessments,
    applicationQuestions: tebraApplicationQuestions,
    gates: [
      {
        id: "tebra-source-conflict",
        kind: "source_conflict",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "The public title, body title, and applicable Tennessee pay zone are not fully adjudicated.",
        recoveryAction: "Freeze the official job and application sources, resolve the canonical title, and map Tennessee to the correct pay zone.",
        sourceRefs: [`${TEBRA_PROOF}:19`, `${TEBRA_PROOF}:21`, `${TEBRA_PROOF}:25`],
        linkedRequirementIds: [],
      },
      {
        id: "tebra-application-gates",
        kind: "application_requirement",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "Five required application gates lack exact source-backed candidate answers.",
        recoveryAction: "Answer each application question from approved evidence or record `No`/`none`.",
        sourceRefs: [`${TEBRA_PROOF}:31`],
        linkedRequirementIds: ["tebra-tenure", "tebra-pipeline", "tebra-forecast", "tebra-tools", "tebra-team"],
      },
      {
        id: "tebra-geo-pay",
        kind: "compensation",
        status: "unresolved",
        overridePolicy: "explicit_user_exception",
        blocksPreparation: true,
        reason: "Zone 1 compensation cannot be applied to a Tennessee candidate without a geographic mapping.",
        recoveryAction: "Confirm Tebra's Tennessee pay zone and applicable base range.",
        sourceRefs: [`${TEBRA_PROOF}:25`],
        linkedRequirementIds: [],
      },
    ],
    pay: [
      {
        id: "tebra-base",
        kind: "base",
        label: "Base salary",
        value: "$200,000-$228,000 for Zone 1",
        state: "published",
        disclosureSemantics: "exact_range",
        lower: 200000,
        upper: 228000,
        percentage: null,
        currency: "USD",
        cadence: "annual",
        guaranteed: "unknown",
        geography: { label: "Zone 1", applicability: "unresolved" },
        equity: null,
        note: "The range is published, but Tennessee applicability is unresolved.",
        sourceRef: `${TEBRA_PROOF}:25`,
      },
      {
        id: "tebra-variable",
        kind: "variable",
        label: "Variable pay",
        value: "Eligibility stated; amount unknown",
        state: "eligible",
        disclosureSemantics: "eligibility_only",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "no",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "Target, guarantee, and amount are not public.",
        sourceRef: `${TEBRA_PROOF}:25`,
      },
      {
        id: "tebra-equity",
        kind: "equity",
        label: "Equity",
        value: "Not stated",
        state: "not_stated",
        disclosureSemantics: "not_disclosed",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "No award or eligibility should be inferred.",
        sourceRef: TEBRA_PROOF,
      },
    ],
    benefits: [
      {
        id: "tebra-benefits",
        category: "other",
        label: "Benefits",
        value: "Broad package stated; details not frozen locally",
        exactText: null,
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "unknown",
        dependentApplicability: "unknown",
        geography: null,
        note: "Do not infer individual benefit terms from the broad package label.",
        sourceRef: `${RADAR}:24`,
      },
    ],
    compensationAmbiguityObservations: [],
    baseline: [
      { label: "Base target", current: "$180K ideal", opportunity: "Zone 1 clears", result: "Applicable zone unknown" },
      { label: "Role lane", current: "RevOps strongest", opportunity: "GTM technology", result: "Strong" },
      { label: "Proof burden", current: "Evidence-first", opportunity: "5 application gates", result: "Unresolved" },
    ],
    extraction: {
      evidenceTier: "adjudication_gold",
      captureCompleteness: "derived",
      coverageEligible: false,
      coverage: "Not eligible for span-level coverage; exact job and application text are not frozen locally.",
      source: "Local Tebra proof audit derived from the official Greenhouse job and live application",
      sourceRef: TEBRA_PROOF,
      captured: "Official sources observed Jul 17, 2026; no local raw snapshot hash",
      snapshotHash: null,
      interpretation: "Adjudicated derived fixture with explicit source and application uncertainty.",
      flags: ["Body-title conflict", "Geo-pay applicability unknown", "5 derived application gates"],
    },
  },
  {
    id: "thnks",
    company: "THNKS",
    title: "Growth Marketer",
    lane: "Growth / Revenue Marketing",
    recommendation: "Watch",
    alignment: "Relevant work, but live availability and anti-fit gates are unresolved",
    score: 71,
    scoreRange: null,
    scoreStatus: "legacy_case_input",
    scoreSource: "Prior local role evaluation; dimensions not adjudicated under the current policy",
    scoreCoverage: "Full source exists; span-level benchmark coverage has not yet been computed.",
    fitDimensions: [],
    fitDimensionStatus: "suppressed_pending_adjudication",
    location: "Franklin, TN · in office Mon-Thu; remote Friday",
    compensation: "$150,000-$160,000 base plus 10% bonus",
    freshness: "Full local JD captured; current opening status unverified",
    sourceStatus: "Complete line-addressable local source; no current official URL or requisition verification",
    integrity: "unknown",
    why: "The role offers broad growth ownership and a clear package close to the preferred compensation range.",
    risk: "Current availability, hands-on recency, strategy-only anti-fit, and four office days all require explicit resolution.",
    workflowAction: "Verify source and anti-fit gates",
    employerRequirements: thnksEmployerRequirements,
    requirementAssessments: thnksRequirementAssessments,
    applicationQuestions: [],
    gates: [
      {
        id: "thnks-freshness",
        kind: "freshness",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "A complete local JD is not proof that the exact opening remains active.",
        recoveryAction: "Verify the current official employer URL, requisition, and posting or repost date before preparation.",
        sourceRefs: [THNKS_JD],
        linkedRequirementIds: [],
      },
      {
        id: "thnks-logistics",
        kind: "logistics",
        status: "unresolved",
        overridePolicy: "explicit_user_exception",
        blocksPreparation: true,
        reason: "Four Franklin office days may conflict with the remote-preferred Career Baseline.",
        recoveryAction: "Record an intentional schedule and commute decision for this exact role.",
        sourceRefs: [`${THNKS_JD}:3`, `${THNKS_JD}:47`, `${THNKS_JD}:54`],
        linkedRequirementIds: ["thnks-remote-antifit", "thnks-office"],
      },
      {
        id: "thnks-hands-on",
        kind: "candidate_proof",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "Current direct paid-platform depth and the three-year ad-account or query-editor recency gate are not yet proven.",
        recoveryAction: "Complete a platform-by-platform recency and ownership proof review, including the exact last ad-account or query-editor work.",
        sourceRefs: [`${THNKS_JD}:35`, `${THNKS_JD}:48`, PROFILE],
        linkedRequirementIds: ["thnks-years", "thnks-paid", "thnks-tracking", "thnks-manager-antifit", "thnks-recency-antifit", "thnks-work-samples"],
      },
    ],
    pay: [
      {
        id: "thnks-base",
        kind: "base",
        label: "Base salary",
        value: "$150,000-$160,000",
        state: "published",
        disclosureSemantics: "exact_range",
        lower: 150000,
        upper: 160000,
        percentage: null,
        currency: "USD",
        cadence: "annual",
        guaranteed: "unknown",
        geography: { label: "Franklin, Tennessee hybrid role", applicability: "applicable" },
        equity: null,
        note: "Closed annual base range.",
        sourceRef: `${THNKS_JD}:6`,
      },
      {
        id: "thnks-bonus",
        kind: "bonus",
        label: "Bonus",
        value: "10% stated; guarantee and terms unknown",
        state: "published",
        disclosureSemantics: "percentage_stated",
        lower: null,
        upper: null,
        percentage: 10,
        currency: null,
        cadence: "annual",
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "Stored separately from base; the source does not say target, guaranteed, or eligibility-only.",
        sourceRef: `${THNKS_JD}:6`,
      },
      {
        id: "thnks-equity",
        kind: "equity",
        label: "Equity",
        value: "Not stated",
        state: "not_stated",
        disclosureSemantics: "not_disclosed",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "No equity compensation is inferred.",
        sourceRef: THNKS_JD,
      },
    ],
    benefits: [
      {
        id: "thnks-health",
        category: "medical",
        label: "Medical, vision, and dental",
        value: "80-100% employer-covered",
        exactText: "Medical, vision, and dental insurance, 80-100% employer-covered.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "unknown",
        dependentApplicability: "unknown",
        geography: null,
        note: "The posting does not map the 80-100% range to employee versus dependent coverage.",
        sourceRef: `${THNKS_JD}:51`,
      },
      {
        id: "thnks-retirement",
        category: "retirement",
        label: "401(k) match",
        value: "Employer match stated; amount unknown",
        exactText: "401(k) matching.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "Match percentage and vesting are unknown.",
        sourceRef: `${THNKS_JD}:52`,
      },
      {
        id: "thnks-stipend",
        category: "stipend",
        label: "Cell phone and internet stipend",
        value: "Monthly stipend",
        exactText: "Monthly cell phone and internet stipend.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "Amount is not stated.",
        sourceRef: `${THNKS_JD}:53`,
      },
      {
        id: "thnks-pto",
        category: "pto",
        label: "PTO and holidays",
        value: "20 PTO days plus company-paid holidays",
        exactText: "20 PTO days, company-paid holidays, and maternity leave.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "Maternity-leave duration and eligibility are not stated.",
        sourceRef: `${THNKS_JD}:55`,
      },
      {
        id: "thnks-maternity",
        category: "leave",
        label: "Maternity leave",
        value: "Offered; duration and terms unknown",
        exactText: "maternity leave",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: "unknown",
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "Do not generalize this to parental leave without source evidence.",
        sourceRef: `${THNKS_JD}:55`,
      },
      {
        id: "thnks-life",
        category: "life_insurance",
        label: "Life insurance",
        value: "Company-paid",
        exactText: "Company-paid life and long-term disability insurance.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "Coverage amount is unknown.",
        sourceRef: `${THNKS_JD}:56`,
      },
      {
        id: "thnks-disability",
        category: "disability",
        label: "Long-term disability",
        value: "Company-paid",
        exactText: "Company-paid life and long-term disability insurance.",
        state: "explicitly_offered",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "stated",
        dependentApplicability: "unknown",
        geography: null,
        note: "Coverage amount and waiting period are unknown.",
        sourceRef: `${THNKS_JD}:56`,
      },
    ],
    compensationAmbiguityObservations: [],
    baseline: [
      { label: "Base target", current: "$150K preferred minimum", opportunity: "$150K-$160K + 10%", result: "Clears minimum" },
      { label: "Work style", current: "Remote preferred", opportunity: "4 office days", result: "Needs explicit decision" },
      { label: "Hands-on depth", current: "Systems-led operator", opportunity: "Direct channel execution", result: "Needs recency proof" },
    ],
    extraction: {
      evidenceTier: "extraction_gold",
      captureCompleteness: "full",
      coverageEligible: true,
      coverage: "Full source is available; benchmark percentage is withheld until every meaningful statement is annotated and counted.",
      source: "Local full-text THNKS JD",
      sourceRef: THNKS_JD,
      captured: "Frozen local fixture",
      snapshotHash: "bb1678a080c10afe2304a7c6fc67ec7500b2016a5e995ce37070d3db4cac4538",
      interpretation: "Employer requirements use exact line-addressable spans; full statement-level coverage remains pending.",
      flags: ["Ideally = Preferred", "Bonus Points separated", "Tool alternatives preserve AND/OR/example semantics", "3 atomic anti-fit statements", "Current opening status unverified"],
    },
  },
  {
    id: "lumeris",
    company: "Lumeris",
    title: "Director, Lifecycle Marketing & Martech",
    lane: "Lifecycle / CRM / Retention",
    recommendation: "Investigate",
    alignment: "Attractive range, possible tool-specific knockout",
    score: 82,
    scoreRange: null,
    scoreStatus: "legacy_case_input",
    scoreSource: `${RADAR}:26`,
    scoreCoverage: "Not eligible for coverage scoring; the raw official posting is not gold-locked.",
    fitDimensions: [],
    fitDimensionStatus: "suppressed_pending_adjudication",
    location: "Remote · United States",
    compensation: "$153,800-$210,650; incentive/equity eligible",
    freshness: "Official role live; exact publication date unknown",
    sourceStatus: "Official source observed; raw snapshot not yet gold-locked",
    integrity: "unknown",
    why: "The mandate and upper range are attractive for the Lifecycle lane.",
    risk: "Deep Salesforce Marketing Cloud and regulated-domain requirements may be knockouts.",
    workflowAction: "Resolve the SFMC and source gates",
    employerRequirements: lumerisEmployerRequirements,
    requirementAssessments: lumerisRequirementAssessments,
    applicationQuestions: [],
    gates: [
      {
        id: "lumeris-source",
        kind: "opportunity_integrity",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "The raw official posting and exact publication evidence are not frozen.",
        recoveryAction: "Capture and hash the official posting, then re-adjudicate modality, freshness, pay, and benefits.",
        sourceRefs: [`${RADAR}:26`],
        linkedRequirementIds: [],
      },
      {
        id: "lumeris-sfmc-gate",
        kind: "candidate_proof",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "The provisional source identifies deep SFMC ownership as required, and no direct proof is approved.",
        recoveryAction: "Confirm exact source modality and any direct SFMC experience before preparation.",
        sourceRefs: [`${RADAR}:26`, PROFILE],
        linkedRequirementIds: ["lumeris-sfmc", "lumeris-regulated"],
      },
    ],
    pay: [
      {
        id: "lumeris-base",
        kind: "base",
        label: "Base salary",
        value: "$153,800-$210,650",
        state: "published",
        disclosureSemantics: "exact_range",
        lower: 153800,
        upper: 210650,
        percentage: null,
        currency: "USD",
        cadence: "annual",
        guaranteed: "unknown",
        geography: { label: "Remote United States", applicability: "unresolved" },
        equity: null,
        note: "Published range; applicant-specific applicability requires confirmation.",
        sourceRef: `${RADAR}:26`,
      },
      {
        id: "lumeris-incentive",
        kind: "variable",
        label: "Incentive",
        value: "Eligibility only",
        state: "eligible",
        disclosureSemantics: "eligibility_only",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "no",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "Eligibility does not prove target, award, or amount.",
        sourceRef: `${RADAR}:26`,
      },
      {
        id: "lumeris-equity",
        kind: "equity",
        label: "Equity compensation",
        value: "Eligibility only",
        state: "eligible",
        disclosureSemantics: "eligibility_only",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "no",
        geography: { label: null, applicability: "not_stated" },
        equity: { type: null, amount: null, vesting: null, valuation: null },
        note: "Eligibility does not prove grant, amount, vesting, or value.",
        sourceRef: `${RADAR}:26`,
      },
    ],
    benefits: [
      {
        id: "lumeris-benefits",
        category: "other",
        label: "Benefits",
        value: "Broad package summarized; exact terms unknown",
        exactText: null,
        state: "unknown",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "unknown",
        dependentApplicability: "unknown",
        geography: null,
        note: "A broad derived summary is insufficient to label individual benefits explicitly offered.",
        sourceRef: `${RADAR}:26`,
      },
    ],
    compensationAmbiguityObservations: [],
    baseline: [
      { label: "Base target", current: "$180K ideal", opportunity: "Range can clear", result: "Positive if applicable" },
      { label: "Required platform", current: "Braze evidence", opportunity: "Deep SFMC", result: "Not equivalent" },
    ],
    extraction: {
      evidenceTier: "provisional",
      captureCompleteness: "derived",
      coverageEligible: false,
      coverage: "Not eligible for span-level coverage; only a derived Radar summary is local.",
      source: "Fresh Opportunity Radar summary derived from the official Workday job",
      sourceRef: `${RADAR}:26`,
      captured: "Official role observed Jul 17, 2026; no local raw snapshot hash",
      snapshotHash: null,
      interpretation: "Provisional policy fixture only.",
      flags: ["Original date unknown", "Equity eligibility only", "SFMC-specific gate", "Health-equity language excluded from compensation"],
    },
  },
  {
    id: "babylist",
    company: "Babylist",
    title: "Director, Revenue Operations",
    lane: "Specialized media / ad revenue operations",
    recommendation: "Pass",
    alignment: "Strong economics, wrong operating mandate",
    score: 73,
    scoreRange: null,
    scoreStatus: "legacy_case_input",
    scoreSource: `${RADAR}:30`,
    scoreCoverage: "Not eligible for coverage scoring; the raw official posting is not gold-locked.",
    fitDimensions: [],
    fitDimensionStatus: "suppressed_pending_adjudication",
    location: "Remote-first · United States",
    compensation: "$171,976-$206,338 plus 22.5% bonus and equity",
    freshness: "Official role live; original date unknown",
    sourceStatus: "Official source observed; third-party repost date excluded",
    integrity: "unknown",
    why: "The package is strong, but the title disguises a specialized advertising-revenue mandate.",
    risk: "Media inventory, yield, ad servers, pricing, and revenue recognition are central and unproven.",
    workflowAction: "See why this is a pass",
    employerRequirements: babylistEmployerRequirements,
    requirementAssessments: babylistRequirementAssessments,
    applicationQuestions: [],
    gates: [
      {
        id: "babylist-source",
        kind: "opportunity_integrity",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "The exact raw posting and original publication date are not frozen.",
        recoveryAction: "Capture the official posting before any reconsideration.",
        sourceRefs: [`${RADAR}:30`],
        linkedRequirementIds: [],
      },
      {
        id: "babylist-mandate",
        kind: "mandate_fit",
        status: "blocked",
        overridePolicy: "explicit_user_exception",
        blocksPreparation: true,
        reason: "The specialized advertising-revenue mandate is materially outside the defensible general RevOps lane.",
        recoveryAction: "Record an intentional lane exception only if direct ad-revenue evidence emerges.",
        sourceRefs: [`${RADAR}:30`, PROFILE],
        linkedRequirementIds: ["babylist-media", "babylist-recognition"],
      },
    ],
    pay: [
      {
        id: "babylist-base",
        kind: "base",
        label: "Base salary",
        value: "$171,976-$206,338",
        state: "published",
        disclosureSemantics: "exact_range",
        lower: 171976,
        upper: 206338,
        percentage: null,
        currency: "USD",
        cadence: "annual",
        guaranteed: "unknown",
        geography: { label: "Remote-first United States", applicability: "unresolved" },
        equity: null,
        note: "Published range; exact applicant applicability remains to be confirmed.",
        sourceRef: `${RADAR}:30`,
      },
      {
        id: "babylist-bonus",
        kind: "bonus",
        label: "Bonus",
        value: "22.5% stated; guarantee and terms unknown",
        state: "published",
        disclosureSemantics: "percentage_stated",
        lower: null,
        upper: null,
        percentage: 22.5,
        currency: null,
        cadence: "annual",
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "Stored separately from base; the local summary does not prove guarantee or target semantics.",
        sourceRef: `${RADAR}:30`,
      },
      {
        id: "babylist-equity",
        kind: "equity",
        label: "Equity compensation",
        value: "Offered; value and terms unknown",
        state: "offered",
        disclosureSemantics: "offered_unvalued",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: { type: null, amount: null, vesting: null, valuation: null },
        note: "The derived summary states equity but does not prove grant details or value.",
        sourceRef: `${RADAR}:30`,
      },
    ],
    benefits: [
      {
        id: "babylist-benefits",
        category: "other",
        label: "Family benefits",
        value: "Strong package summarized; exact terms unknown",
        exactText: null,
        state: "unknown",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "unknown",
        dependentApplicability: "unknown",
        geography: null,
        note: "The raw posting is required before individual benefits can be labeled explicitly offered.",
        sourceRef: `${RADAR}:30`,
      },
    ],
    compensationAmbiguityObservations: [],
    baseline: [
      { label: "Economics", current: "$180K ideal", opportunity: "Can clear", result: "Strong if applicable" },
      { label: "Mandate", current: "General RevOps", opportunity: "Ad-revenue specialization", result: "Poor fit" },
      { label: "Optionality", current: "Broader growth systems", opportunity: "Narrower media path", result: "Weak" },
    ],
    extraction: {
      evidenceTier: "provisional",
      captureCompleteness: "derived",
      coverageEligible: false,
      coverage: "Not eligible for span-level coverage; only a derived Radar summary is local.",
      source: "Fresh Opportunity Radar summary derived from the official Greenhouse job",
      sourceRef: `${RADAR}:30`,
      captured: "Official role observed Jul 17, 2026; no local raw snapshot hash",
      snapshotHash: null,
      interpretation: "Provisional mandate-first policy fixture only.",
      flags: ["Title/mandate mismatch", "Bonus separated", "Original date unknown"],
    },
  },
  {
    id: "textnow",
    company: "TextNow",
    title: "Head of Lifecycle Marketing",
    lane: "Lifecycle / CRM / Retention",
    recommendation: "Pass",
    alignment: "Inactive exact opening",
    score: null,
    scoreRange: null,
    scoreStatus: "suppressed_by_gate",
    scoreSource: "Inactive-source gate; no score is decision-relevant",
    scoreCoverage: "Score suppressed by the inactive exact-opening gate.",
    fitDimensions: [],
    fitDimensionStatus: "suppressed_by_gate",
    location: "Legacy posting",
    compensation: "Not decision-relevant while inactive",
    freshness: "Canonical board absent",
    sourceStatus: "Legacy form excluded as activity proof",
    integrity: "inactive",
    why: "A visible application wrapper does not outweigh the canonical board and filled-role evidence.",
    risk: "Pursuit would waste time and could duplicate a closed process.",
    workflowAction: "Return to opportunities",
    employerRequirements: [],
    requirementAssessments: [],
    applicationQuestions: [],
    gates: [
      {
        id: "textnow-inactive",
        kind: "opportunity_integrity",
        status: "blocked",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "The exact requisition is absent from the canonical board and filled-role evidence exists.",
        recoveryAction: "Require a new canonical requisition on TextNow's current board before reconsideration.",
        sourceRefs: [`${TEXTNOW_RECEIPT}:13`, `${TEXTNOW_RECEIPT}:19`],
        linkedRequirementIds: [],
      },
    ],
    pay: [
      {
        id: "textnow-compensation",
        kind: "base",
        label: "Compensation",
        value: "Suppressed by inactive-opening gate",
        state: "suppressed_by_gate",
        disclosureSemantics: "not_disclosed",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_applicable" },
        equity: null,
        note: "Legacy economics do not make the inactive opening actionable.",
        sourceRef: TEXTNOW_RECEIPT,
      },
    ],
    benefits: [
      {
        id: "textnow-benefits",
        category: "other",
        label: "Benefits",
        value: "Not evaluated for the inactive opening",
        exactText: null,
        state: "unknown",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "unknown",
        dependentApplicability: "unknown",
        geography: null,
        note: "Inactive status gates the role before package comparison.",
        sourceRef: TEXTNOW_RECEIPT,
      },
    ],
    compensationAmbiguityObservations: [],
    baseline: [{ label: "Availability", current: "Active role required", opportunity: "Inactive", result: "Blocked" }],
    extraction: {
      evidenceTier: "negative_control",
      captureCompleteness: "derived",
      coverageEligible: false,
      coverage: "Source-adjudication fixture; not a JD extraction benchmark.",
      source: "Local TextNow decision receipt using legacy and canonical source evidence",
      sourceRef: TEXTNOW_RECEIPT,
      captured: "Adjudicated Jul 17, 2026; no raw multi-source snapshot bundle stored here",
      snapshotHash: null,
      interpretation: "Negative-control integrity fixture.",
      flags: ["Canonical board absent", "Legacy form still visible", "Filled/closed evidence"],
    },
  },
  {
    id: "finite-state",
    company: "Finite State",
    title: "Director, GTM Operations",
    lane: "Revenue / Growth Operations",
    recommendation: "Watch",
    alignment: "Relevant mandate, economics missing",
    score: 75,
    scoreRange: null,
    scoreStatus: "legacy_case_input",
    scoreSource: `${RADAR}:29`,
    scoreCoverage: "Not eligible for coverage scoring; pay, benefits, and exact publication evidence remain unresolved.",
    fitDimensions: [],
    fitDimensionStatus: "suppressed_pending_adjudication",
    location: "Remote · U.S. / Canada",
    compensation: "Not stated",
    freshness: "Official role live; precise date unresolved",
    sourceStatus: "Economics, benefits, and raw source coverage unknown",
    integrity: "unknown",
    why: "The mandate is relevant enough to monitor after compensation and hard requirements are resolved.",
    risk: "Pay, family benefits, Salesforce/HubSpot depth, and the degree requirement remain unknown or unproven.",
    workflowAction: "Resolve source and economics",
    employerRequirements: [],
    requirementAssessments: [],
    applicationQuestions: [],
    gates: [
      {
        id: "finite-source",
        kind: "opportunity_integrity",
        status: "unresolved",
        overridePolicy: "non_overridable",
        blocksPreparation: true,
        reason: "The raw posting, exact publication date, and requirement-level benchmark are not frozen.",
        recoveryAction: "Capture and hash the official posting before requirement or score adjudication.",
        sourceRefs: [`${RADAR}:29`],
        linkedRequirementIds: [],
      },
      {
        id: "finite-economics",
        kind: "compensation",
        status: "unresolved",
        overridePolicy: "explicit_user_exception",
        blocksPreparation: true,
        reason: "Compensation and family benefits are not stated, so material-upside comparison is incomplete.",
        recoveryAction: "Obtain an applicable compensation range and benefit details or record an intentional uncertainty exception.",
        sourceRefs: [`${RADAR}:29`],
        linkedRequirementIds: [],
      },
    ],
    pay: [
      {
        id: "finite-compensation",
        kind: "base",
        label: "Compensation",
        value: "Not stated",
        state: "not_stated",
        disclosureSemantics: "not_disclosed",
        lower: null,
        upper: null,
        percentage: null,
        currency: null,
        cadence: null,
        guaranteed: "unknown",
        geography: { label: null, applicability: "not_stated" },
        equity: null,
        note: "Missing posting text is not a zero-dollar package.",
        sourceRef: `${RADAR}:29`,
      },
    ],
    benefits: [
      {
        id: "finite-benefits",
        category: "other",
        label: "Benefits",
        value: "Not stated",
        exactText: null,
        state: "unknown",
        employeeCoveragePercent: null,
        dependentCoveragePercent: null,
        matchPercent: null,
        vesting: null,
        leaveWeeks: null,
        leaveQualifier: null,
        waitingPeriod: null,
        employeeApplicability: "unknown",
        dependentApplicability: "unknown",
        geography: null,
        note: "Omission maps to unknown, never explicitly absent.",
        sourceRef: `${RADAR}:29`,
      },
    ],
    compensationAmbiguityObservations: [],
    baseline: [{ label: "Economics", current: "$150K preferred minimum", opportunity: "Unknown", result: "Cannot compare" }],
    extraction: {
      evidenceTier: "provisional",
      captureCompleteness: "derived",
      coverageEligible: false,
      coverage: "Not eligible for span-level coverage; only a derived Radar summary is local.",
      source: "Fresh Opportunity Radar summary derived from the official Greenhouse role",
      sourceRef: `${RADAR}:29`,
      captured: "Official role observed Jul 17, 2026; no local raw snapshot hash",
      snapshotHash: null,
      interpretation: "Provisional source and economics fixture only.",
      flags: ["Compensation unknown", "Benefits unknown", "Publication date unresolved"],
    },
  },
];

export function getRequirementViews(job: JobFixture): RequirementView[] {
  const assessments = new Map(
    job.requirementAssessments.map((assessment) => [
      assessment.requirementId,
      assessment,
    ]),
  );

  return job.employerRequirements.map((requirement) => {
    const assessment = assessments.get(requirement.id);

    return {
      id: requirement.id,
      text: requirement.displayText,
      exactEmployerText: requirement.exactEmployerText,
      priority: requirement.priority,
      modality: requirement.modality,
      logicalGroupId: requirement.logicalGroupId,
      logicalOperator: requirement.logicalOperator,
      alternatives: requirement.alternatives,
      alternativeSemantics: requirement.alternativeSemantics,
      interpretationState: requirement.interpretationState,
      employerSource: requirement.source,
      employerSourceKind: requirement.sourceKind,
      employerSourceSpan: requirement.sourceSpan,
      state: assessment?.state ?? "missing",
      rationale:
        assessment?.rationale ??
        "No candidate assessment exists for this employer requirement.",
      proof: assessment?.proof ?? "No candidate evidence assessed.",
      proofState: assessment?.proofState ?? "not_found",
      source: assessment?.source ?? "No candidate source",
      sourceRef: assessment?.sourceRef ?? null,
      effect: assessment?.effect ?? "Assessment required before recommendation",
      recoveryAction:
        assessment?.recoveryAction ?? "Create a source-linked candidate assessment.",
      sourceKind: assessment?.sourceKind ?? "none",
    };
  });
}

export function getBlockingGates(job: JobFixture): Gate[] {
  return job.gates.filter(
    (gate) => gate.blocksPreparation && gate.status !== "clear" && gate.status !== "overridden",
  );
}

export function getProofRecoveryRequirements(job: JobFixture): RequirementView[] {
  const gateLinkedRequirementIds = new Set(job.gates.flatMap((gate) => gate.linkedRequirementIds));
  return getRequirementViews(job).filter((requirement) => {
    if (requirement.employerSourceKind !== "job" || !requirement.recoveryAction) return false;
    if (requirement.proofState === "approved" || requirement.proofState === "narrowly_approved") return false;
    const materiallyUnresolvedState = ["missing", "risky", "disqualifying"].includes(requirement.state);
    return gateLinkedRequirementIds.has(requirement.id) || materiallyUnresolvedState;
  });
}

export const JOB_BY_ID = Object.fromEntries(
  JOBS.map((job) => [job.id, job]),
) as Record<string, JobFixture>;

export const DEFAULT_RADAR = {
  lanes: [] as string[],
  payBasis: "salary" as "salary" | "hourly",
  minimumBase: 0,
  idealBase: 0,
  remote: false,
  hybrid: false,
  onsite: false,
  commute: "",
  schedule: "",
  freshness: "30",
  cadence: "daily",
  notifications: true,
};
