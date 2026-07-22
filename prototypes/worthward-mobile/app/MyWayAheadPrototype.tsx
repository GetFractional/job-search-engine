"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  Briefcase,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  CircleNotch,
  CloudSlash,
  Crosshair,
  CurrencyDollar,
  Desktop,
  Eye,
  FileText,
  Gear,
  Info,
  Lightbulb,
  ListChecks,
  MagnifyingGlass,
  MapPin,
  Moon,
  PencilSimple,
  ShieldCheck,
  Sparkle,
  Sun,
  TrendUp,
  UserCircle,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_RADAR,
  JOBS,
  JOB_BY_ID,
  getBlockingGates,
  getProofRecoveryRequirements,
  getRequirementViews,
  type EvidenceState,
  type Gate,
  type JobFixture,
  type Requirement,
} from "./prototype-data";
import {
  approveCurrentPayload,
  classifyFixtureForScenario,
  deriveReviewAction,
  initialApprovalState,
  isApprovalCurrent,
  parseReviewRecords,
  recordUnconfirmed,
  recordVisibleConfirmation,
  returnToApprovedPayload,
  simulateHandoff,
  simulatePackageChange,
  upsertReviewRecord,
  type ApprovalState,
  type CorrectionRecord,
  type DemoPayload,
  type LocalReviewRecord,
  type ProofRecord,
} from "./prototype-state";
import {
  AuthenticationScreen,
  CheckoutScreen,
  ConfirmationScreen,
  ExperienceImportScreen,
  GuidedHelpScreen,
  HomeScreen,
  IntegrityPreviewScreen,
  LANE_DEFINITIONS,
  MaterialsScreen,
  ModeScreen,
  MyWayAheadBrand,
  OnboardingProgress,
  PlanSelectionScreen,
  PricingScreen,
  PLAN_DETAILS,
  PublicHeader,
  RoleLanesScreen,
  StrategyBriefScreen,
  type CareerLaneId,
  type DemoProfileId,
  type IntegrityPhase,
  type PlanId,
  type SearchMode,
} from "./MyWayAheadFunnel";

type ThemeChoice = "system" | "light" | "dark";
type Scenario =
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
type BaselinePreferences = {
  payType: "" | "salary" | "hourly";
  minimumPay: number | "";
  targetPay: number | "";
  remote: boolean;
  hybrid: boolean;
  onsite: boolean;
  commute: string;
  schedule: string;
  benefits: string[];
  growth: string[];
};

type OnboardingSession = {
  accountReady: boolean;
  searchMode: SearchMode | null;
  selectedProfile: DemoProfileId | null;
  baselinePreferences: BaselinePreferences;
  primaryLane: CareerLaneId | null;
  includedLanes: CareerLaneId[];
};

function defaultBaselinePreferences(): BaselinePreferences {
  return {
    payType: "",
    minimumPay: "",
    targetPay: "",
    remote: false,
    hybrid: false,
    onsite: false,
    commute: "Not applicable",
    schedule: "",
    benefits: [],
    growth: [],
  };
}

function storedOnboardingSession(): OnboardingSession {
  const defaults: OnboardingSession = {
    accountReady: false,
    searchMode: null,
    selectedProfile: null,
    baselinePreferences: defaultBaselinePreferences(),
    primaryLane: null,
    includedLanes: [],
  };
  if (typeof window === "undefined") return defaults;
  try {
    const saved = window.localStorage.getItem("my-way-ahead-onboarding");
    if (!saved) return defaults;
    const parsed = JSON.parse(saved) as Partial<OnboardingSession>;
    const modes: SearchMode[] = ["urgent", "better-job", "change", "passive"];
    const profiles: DemoProfileId[] = ["established", "hourly", "career-change"];
    const laneIds = new Set<CareerLaneId>(Object.values(LANE_DEFINITIONS).flat().map((lane) => lane.id));
    const baseline = parsed.baselinePreferences && typeof parsed.baselinePreferences === "object"
      ? parsed.baselinePreferences
      : defaults.baselinePreferences;
    const payType = baseline.payType === "salary" || baseline.payType === "hourly" ? baseline.payType : "";
    const payValue = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value > 0 ? value : "";
    const stringList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    const primaryLane = parsed.primaryLane && laneIds.has(parsed.primaryLane) ? parsed.primaryLane : null;
    const includedLanes = Array.isArray(parsed.includedLanes)
      ? [...new Set(parsed.includedLanes.filter((lane): lane is CareerLaneId => laneIds.has(lane as CareerLaneId)))]
      : [];
    return {
      accountReady: parsed.accountReady === true,
      searchMode: parsed.searchMode && modes.includes(parsed.searchMode) ? parsed.searchMode : null,
      selectedProfile: parsed.selectedProfile && profiles.includes(parsed.selectedProfile) ? parsed.selectedProfile : null,
      baselinePreferences: {
        payType,
        minimumPay: payValue(baseline.minimumPay),
        targetPay: payValue(baseline.targetPay),
        remote: baseline.remote === true,
        hybrid: baseline.hybrid === true,
        onsite: baseline.onsite === true,
        commute: typeof baseline.commute === "string" ? baseline.commute : "Not applicable",
        schedule: typeof baseline.schedule === "string" ? baseline.schedule : "",
        benefits: stringList(baseline.benefits),
        growth: stringList(baseline.growth),
      },
      primaryLane,
      includedLanes: primaryLane && !includedLanes.includes(primaryLane) ? [primaryLane, ...includedLanes] : includedLanes,
    };
  } catch {
    return defaults;
  }
}

type PreferenceComparison = {
  label: string;
  current: string;
  opportunity: string;
  result: string;
};

type PreferenceAssessment = {
  headline: string;
  summary: string;
  recommendation: string;
  matches: string[];
  concerns: string[];
  unknowns: string[];
  comparison: PreferenceComparison[];
};

type NotificationPreferences = {
  radar: boolean;
  applications: boolean;
  product: boolean;
};

function storedNotificationPreferences(): NotificationPreferences {
  const defaults = { radar: true, applications: true, product: false };
  if (typeof window === "undefined") return defaults;
  try {
    const saved = window.localStorage.getItem("my-way-ahead-notifications");
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

function hasCompleteBaseline(preferences: BaselinePreferences) {
  return Boolean(
    preferences.payType
    && typeof preferences.minimumPay === "number"
    && typeof preferences.targetPay === "number"
    && preferences.minimumPay > 0
    && preferences.targetPay >= preferences.minimumPay
    && (preferences.remote || preferences.hybrid || preferences.onsite),
  );
}

function formatBaselineSummary(preferences: BaselinePreferences) {
  if (!hasCompleteBaseline(preferences)) return "Finish your pay and work preferences before using this standard.";
  const pay = preferences.payType === "salary"
    ? `${formatMoney(Number(preferences.minimumPay))} minimum · ${formatMoney(Number(preferences.targetPay))} target`
    : `$${preferences.minimumPay}/hour minimum · $${preferences.targetPay}/hour target`;
  const arrangements = [preferences.remote && "remote", preferences.hybrid && "hybrid", preferences.onsite && "on-site"].filter(Boolean).join(" or ");
  const priorities = [...preferences.benefits, ...preferences.growth].slice(0, 2);
  const priorityText = priorities.length ? ` · ${priorities.join(" · ")}` : "";
  const schedule = preferences.schedule.trim() ? ` · ${preferences.schedule.trim()}` : "";
  return `${pay} · ${arrangements}${priorityText}${schedule}`;
}

function assessPreferences(job: JobFixture, preferences: BaselinePreferences): PreferenceAssessment | null {
  if (job.id !== "going" || !hasCompleteBaseline(preferences)) return null;

  const matches: string[] = [];
  const concerns: string[] = [];
  const unknowns: string[] = [];
  const comparison: PreferenceComparison[] = [];
  const publishedStart = 175000;

  if (preferences.payType === "salary") {
    const minimum = Number(preferences.minimumPay);
    const target = Number(preferences.targetPay);
    if (target <= publishedStart) {
      matches.push(`Published starting pay meets your ${formatMoney(target)} target.`);
      comparison.push({ label: "Pay", current: `${formatMoney(minimum)} minimum · ${formatMoney(target)} target`, opportunity: "Starts at $175,000 · upper range not public", result: "Meets target" });
    } else if (minimum <= publishedStart) {
      matches.push(`Published starting pay clears your ${formatMoney(minimum)} minimum.`);
      unknowns.push(`The public starting pay is below your ${formatMoney(target)} target, and the upper range is not listed.`);
      comparison.push({ label: "Pay", current: `${formatMoney(minimum)} minimum · ${formatMoney(target)} target`, opportunity: "Starts at $175,000 · upper range not public", result: "Minimum clears · target open" });
    } else {
      unknowns.push(`The job starts at $175,000, below your ${formatMoney(minimum)} minimum, but its upper range is not public.`);
      comparison.push({ label: "Pay", current: `${formatMoney(minimum)} minimum · ${formatMoney(target)} target`, opportunity: "Starts at $175,000 · upper range not public", result: "Needs confirmation" });
    }
  } else {
    unknowns.push("This job publishes an annual salary, while your standard uses hourly pay. The two are not compared as if they were the same.");
    comparison.push({ label: "Pay", current: `$${preferences.minimumPay}/hour minimum · $${preferences.targetPay}/hour target`, opportunity: "Annual salary starting at $175,000", result: "Different pay basis" });
  }

  const acceptedWork = [preferences.remote && "Remote", preferences.hybrid && "Hybrid", preferences.onsite && "On-site"].filter(Boolean).join(" or ");
  if (preferences.remote) {
    matches.push("The job is remote in the United States, which matches an arrangement you selected.");
    comparison.push({ label: "Work arrangement", current: acceptedWork, opportunity: "Remote · United States", result: "Matches" });
  } else {
    concerns.push(`The job is remote, but you selected ${acceptedWork.toLowerCase()} work only.`);
    comparison.push({ label: "Work arrangement", current: acceptedWork, opportunity: "Remote · United States", result: "Does not match" });
  }

  if (preferences.schedule.trim()) {
    unknowns.push(`The posting does not confirm your schedule need: ${preferences.schedule.trim()}.`);
    comparison.push({ label: "Schedule", current: preferences.schedule.trim(), opportunity: "Not stated in the saved posting", result: "Needs confirmation" });
  }

  const benefitResults = preferences.benefits.map((benefit) => {
    if (benefit === "Health coverage") return { benefit, result: "Listed", state: "match" as const };
    if (benefit === "Retirement") return { benefit, result: "401(k) match listed", state: "match" as const };
    if (benefit === "Childcare or family support") return { benefit, result: "Paid family leave listed; other support unknown", state: "open" as const };
    return { benefit, result: "Not confirmed in the saved posting", state: "open" as const };
  });
  benefitResults.filter((item) => item.state === "match").forEach((item) => matches.push(`${item.benefit} is listed in the saved job information.`));
  benefitResults.filter((item) => item.state === "open").forEach((item) => unknowns.push(`${item.benefit} is not fully confirmed.`));
  if (benefitResults.length) {
    comparison.push({
      label: "Benefits",
      current: preferences.benefits.join(" · "),
      opportunity: benefitResults.map((item) => `${item.benefit}: ${item.result}`).join(" · "),
      result: benefitResults.every((item) => item.state === "match") ? "Matches selected benefits" : "Some details open",
    });
  }

  const growthResults = preferences.growth.map((priority) => {
    if (priority === "Leadership opportunity") return { priority, result: "Leadership work is described", state: "match" as const };
    if (priority === "More responsibility") return { priority, result: "Director-level responsibility is described; scope needs confirmation", state: "open" as const };
    if (priority === "Future earning potential") return { priority, result: "Starting pay and equity are listed; future upside is unknown", state: "open" as const };
    return { priority, result: "Not confirmed by the saved posting", state: "open" as const };
  });
  growthResults.filter((item) => item.state === "match").forEach((item) => matches.push(`${item.priority} is supported by the work described.`));
  growthResults.filter((item) => item.state === "open").forEach((item) => unknowns.push(`${item.priority} still needs confirmation.`));
  if (growthResults.length) {
    comparison.push({ label: "Growth and stability", current: preferences.growth.join(" · "), opportunity: growthResults.map((item) => `${item.priority}: ${item.result}`).join(" · "), result: growthResults.every((item) => item.state === "match") ? "Matches" : "Needs confirmation" });
  }

  const headline = concerns.length
    ? "This job does not match one of the work standards you set."
    : unknowns.length
      ? "This job clears some of your standards, but missing details could change the answer."
      : "This job clears the standards you set and is worth a closer look.";
  const recommendation = concerns.length ? "Does not clear your standard" : unknowns.length ? "Worth a closer look" : "Strong match on your priorities";
  const summary = `Your priorities show ${matches.length} clear ${matches.length === 1 ? "match" : "matches"}${concerns.length ? `, ${concerns.length} conflict` : ""}, and ${unknowns.length} ${unknowns.length === 1 ? "open question" : "open questions"}. Experience proof is checked separately below.`;
  return { headline, summary, recommendation, matches, concerns, unknowns, comparison };
}
type Route =
  | { view: "home" }
  | { view: "pricing" }
  | { view: "guided" }
  | { view: "integrity" }
  | { view: "auth" }
  | { view: "mode" }
  | { view: "import" }
  | { view: "lanes" }
  | { view: "strategy" }
  | { view: "plans" }
  | { view: "checkout" }
  | { view: "receipt" }
  | { view: "baseline" }
  | { view: "radar-setup" }
  | { view: "radar" }
  | { view: "opportunities" }
  | { view: "review"; jobId: string }
  | { view: "pursuits" }
  | { view: "materials" }
  | { view: "application" }
  | { view: "appearance" };

type SheetState =
  | { type: "source"; job: JobFixture; requirement?: Requirement }
  | { type: "correction"; job: JobFixture; requirement: Requirement }
  | { type: "proof"; job: JobFixture }
  | { type: "assessment"; job: JobFixture }
  | { type: "package-preview"; asset: "resume" | "cover-letter" | "answers" }
  | { type: "approval" }
  | null;

const HASHES: Record<Exclude<Route["view"], "review">, string> = {
  home: "/",
  pricing: "/pricing",
  guided: "/guided-help",
  integrity: "/integrity-preview",
  auth: "/account",
  mode: "/start",
  import: "/onboarding/experience",
  lanes: "/strategy/lanes",
  strategy: "/strategy/brief",
  plans: "/plans",
  checkout: "/checkout",
  receipt: "/confirmation",
  baseline: "/profile/baseline",
  "radar-setup": "/jobs/radar/setup",
  radar: "/jobs/radar",
  opportunities: "/jobs/opportunities",
  pursuits: "/pursuits",
  materials: "/pursuits/demo/materials",
  application: "/pursuits/demo/application",
  appearance: "/settings/appearance",
};

function parseRoute(): Route {
  if (typeof window === "undefined") return { view: "home" };
  const path = window.location.hash.replace(/^#/, "") || HASHES.home;
  const reviewMatch = path.match(/^\/jobs\/review\/([^/?]+)/);
  if (reviewMatch) return { view: "review", jobId: reviewMatch[1] };
  const match = Object.entries(HASHES).find(([, value]) => value === path);
  return match ? ({ view: match[0] } as Route) : { view: "home" };
}

function routeHash(route: Route) {
  return route.view === "review" ? `/jobs/review/${route.jobId}` : HASHES[route.view];
}

function primarySection(route: Route): "today" | "find" | "profile" | "pursuits" | null {
  if (["baseline", "lanes", "strategy"].includes(route.view)) return "profile";
  if (route.view === "radar") return "today";
  if (["radar-setup", "opportunities", "review"].includes(route.view)) return "find";
  if (["pursuits", "materials", "application"].includes(route.view)) return "pursuits";
  return null;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function storedRadar() {
  if (typeof window === "undefined") return DEFAULT_RADAR;
  try {
    const saved = window.localStorage.getItem("my-way-ahead-radar");
    return saved ? { ...DEFAULT_RADAR, ...JSON.parse(saved) } : DEFAULT_RADAR;
  } catch {
    return DEFAULT_RADAR;
  }
}

function storedPlan(): PlanId {
  if (typeof window === "undefined") return "free";
  const saved = window.localStorage.getItem("my-way-ahead-selected-plan");
  return saved && ["free", "watch-monthly", "watch-three-month", "multi-watch-monthly", "multi-watch-three-month", "active-search", "multi-active"].includes(saved) ? saved as PlanId : "free";
}

function storedDecisions() {
  if (typeof window === "undefined") return {};
  try {
    const saved = window.localStorage.getItem("my-way-ahead-decisions");
    if (!saved) return {};
    const parsed = JSON.parse(saved) as Record<string, string>;
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => ["Pursue", "Watch", "Pass"].includes(value)));
  } catch {
    return {};
  }
}

function storedReviewRecords() {
  if (typeof window === "undefined") return [];
  try {
    return parseReviewRecords(window.localStorage.getItem("my-way-ahead-review-records"));
  } catch {
    return [];
  }
}

function requestedQaScenario(): Scenario {
  if (typeof window === "undefined") return "material";
  try {
    const requested = new URLSearchParams(window.location.search).get("qaScenario") as Scenario | null;
    return requested && ["material", "no-action", "conflict", "offline", "loading", "partial", "capacity", "budget", "validation", "error"].includes(requested) ? requested : "material";
  } catch {
    return "material";
  }
}

function stateLabel(state: EvidenceState) {
  return {
    proven: "Proven",
    plausible: "Plausible",
    missing: "Missing",
    risky: "Risky",
    excluded: "Excluded",
    disqualifying: "Disqualifying",
  }[state];
}

function StateIcon({ state, size = 18 }: { state: EvidenceState; size?: number }) {
  if (state === "proven") return <CheckCircle size={size} weight="fill" aria-hidden="true" />;
  if (state === "plausible") return <Lightbulb size={size} weight="fill" aria-hidden="true" />;
  if (state === "missing") return <MagnifyingGlass size={size} weight="bold" aria-hidden="true" />;
  if (state === "excluded") return <X size={size} weight="bold" aria-hidden="true" />;
  return <WarningCircle size={size} weight="fill" aria-hidden="true" />;
}

function IntegrityBadge({ job }: { job: JobFixture }) {
  const labels = job.integrity === "inactive"
    ? "Sample job appears closed"
    : job.integrity === "conflict"
      ? "Sample job details disagree"
      : job.integrity === "unknown"
        ? "Sample still-open status unknown"
        : "Sample posting checked";
  return (
    <span className={`integrity-badge integrity-${job.integrity}`}>
      {job.integrity === "verified" ? (
        <ShieldCheck size={16} weight="fill" aria-hidden="true" />
      ) : (
        <WarningCircle size={16} weight="fill" aria-hidden="true" />
      )}
      {labels}
    </span>
  );
}

function RecommendationBadge({ job, lastVerified = false, correctionPending = false, displayRecommendation }: { job: JobFixture; lastVerified?: boolean; correctionPending?: boolean; displayRecommendation?: string }) {
  const label = correctionPending ? "Needs another look" : lastVerified ? "Last checked recommendation" : "Our recommendation";
  const recommendation = displayRecommendation ?? recommendationLabel(job.recommendation);
  return (
    <span className={`recommendation ${correctionPending ? "recommendation-stale" : `recommendation-${job.recommendation.toLowerCase()}`}`}>
      <span className="eyebrow">{label}</span>
      <strong>{correctionPending ? "Review required" : recommendation}</strong>
    </span>
  );
}

function recommendationLabel(recommendation: JobFixture["recommendation"]) {
  if (recommendation === "Pursue") return "Strong fit";
  if (recommendation === "Investigate") return "Worth a closer look";
  if (recommendation === "Watch") return "Watch";
  return "Pass";
}

function Sheet({
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const closeHandler = useRef(onClose);

  useEffect(() => {
    closeHandler.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeHandler.current();
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = Array.from(
        panel.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      returnFocus?.focus();
    };
  }, []);

  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`sheet ${wide ? "sheet-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="sheet-title" ref={panel}>
        <header className="sheet-header">
          <div>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <h2 id="sheet-title">{title}</h2>
          </div>
          <button ref={closeButton} className="icon-button" onClick={onClose} aria-label={`Close ${title}`}>
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

function TopBrand() {
  return (
    <MyWayAheadBrand compact />
  );
}

function PrimaryNav({ route, navigate }: { route: Route; navigate: (route: Route) => void }) {
  const selected = primarySection(route);
  return (
    <nav className="primary-nav" aria-label="Primary">
      <button aria-current={selected === "today" ? "page" : undefined} className={selected === "today" ? "active" : ""} onClick={() => navigate({ view: "radar" })}>Today</button>
      <button aria-current={selected === "find" ? "page" : undefined} className={selected === "find" ? "active" : ""} onClick={() => navigate({ view: "opportunities" })}>Find Jobs</button>
      <button aria-current={selected === "pursuits" ? "page" : undefined} className={selected === "pursuits" ? "active" : ""} onClick={() => navigate({ view: "pursuits" })}>Pursuits</button>
      <button aria-current={selected === "profile" ? "page" : undefined} className={selected === "profile" ? "active" : ""} onClick={() => navigate({ view: "baseline" })}>Career Profile</button>
    </nav>
  );
}

function BottomNav({ route, navigate, modalOpen }: { route: Route; navigate: (route: Route) => void; modalOpen: boolean }) {
  const selected = primarySection(route);
  return (
    <nav className="bottom-nav" aria-label="Primary mobile navigation" inert={modalOpen}>
      <button aria-current={selected === "today" ? "page" : undefined} className={selected === "today" ? "active" : ""} onClick={() => navigate({ view: "radar" })}>
        <Sparkle size={23} weight={selected === "today" ? "fill" : "regular"} aria-hidden="true" />
        <span>Today</span>
      </button>
      <button aria-current={selected === "find" ? "page" : undefined} className={selected === "find" ? "active" : ""} onClick={() => navigate({ view: "opportunities" })}>
        <MagnifyingGlass size={23} weight={selected === "find" ? "bold" : "regular"} aria-hidden="true" />
        <span>Find Jobs</span>
      </button>
      <button aria-current={selected === "pursuits" ? "page" : undefined} className={selected === "pursuits" ? "active" : ""} onClick={() => navigate({ view: "pursuits" })}>
        <Briefcase size={23} weight={selected === "pursuits" ? "fill" : "regular"} aria-hidden="true" />
        <span>Pursuits</span>
      </button>
      <button aria-current={selected === "profile" ? "page" : undefined} className={selected === "profile" ? "active" : ""} onClick={() => navigate({ view: "baseline" })}>
        <UserCircle size={23} weight={selected === "profile" ? "fill" : "regular"} aria-hidden="true" />
        <span>Profile</span>
      </button>
    </nav>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </header>
  );
}

function BaselineScreen({ preferences, onBack, onSave }: { preferences: BaselinePreferences; onBack: () => void; onSave: (next: BaselinePreferences) => void }) {
  const [draft, setDraft] = useState(preferences);
  const [error, setError] = useState("");
  const update = <K extends keyof BaselinePreferences>(key: K, value: BaselinePreferences[K]) => setDraft({ ...draft, [key]: value });
  const toggleList = (key: "benefits" | "growth", value: string) => update(key, draft[key].includes(value) ? draft[key].filter((item) => item !== value) : [...draft[key], value]);
  const changePayType = (payType: Exclude<BaselinePreferences["payType"], "">) => {
    if (payType === draft.payType) return;
    setDraft({ ...draft, payType, minimumPay: "", targetPay: "" });
    setError("");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.payType) {
      setError("Choose annual salary or hourly pay before entering your amounts.");
      return;
    }
    if (typeof draft.minimumPay !== "number" || typeof draft.targetPay !== "number" || draft.minimumPay <= 0 || draft.targetPay < draft.minimumPay) {
      setError("Enter a target that is at least as high as the minimum you would consider.");
      return;
    }
    if (!draft.remote && !draft.hybrid && !draft.onsite) {
      setError("Choose at least one place you are willing to work.");
      return;
    }
    setError("");
    onSave(draft);
  };
  const moneyLabel = draft.payType === "salary" ? "per year" : draft.payType === "hourly" ? "per hour" : "";
  const paySummary = typeof draft.minimumPay === "number" && typeof draft.targetPay === "number" && draft.minimumPay > 0
    ? draft.payType === "salary"
      ? `${formatMoney(draft.minimumPay)} minimum and ${formatMoney(draft.targetPay)} target`
      : `$${draft.minimumPay} minimum and $${draft.targetPay} target per hour`
    : draft.payType ? "Add your minimum and target pay" : "Choose annual salary or hourly pay";
  const workSummary = [draft.remote && "Remote", draft.hybrid && "Hybrid", draft.onsite && "On-site"].filter(Boolean).join(", ") || "Choose where you can work";
  return (
    <section className="screen onboarding-screen baseline-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to my experience</button>
      <OnboardingProgress step={3} />
      <header className="funnel-heading"><h1>What would make your next job better?</h1><p>Choose the pay, schedule, location, benefits, and growth that matter most. These answers are a starting point, not a permanent rule.</p></header>
      <form className="setup-form baseline-form" onSubmit={submit} noValidate>
        {error ? <div className="operational-banner banner-danger" role="alert"><WarningCircle size={21} weight="fill" aria-hidden="true" /><p>{error}</p></div> : null}
        <fieldset><legend><span>1</span> Pay</legend><div className="billing-toggle baseline-pay-toggle" role="group" aria-label="Pay type"><button type="button" className={draft.payType === "salary" ? "active" : ""} aria-pressed={draft.payType === "salary"} onClick={() => changePayType("salary")}>Annual salary</button><button type="button" className={draft.payType === "hourly" ? "active" : ""} aria-pressed={draft.payType === "hourly"} onClick={() => changePayType("hourly")}>Hourly pay</button></div><div className="field-grid"><label><span>Minimum pay I’d consider</span><input type="number" inputMode="decimal" min="1" disabled={!draft.payType} value={draft.minimumPay} placeholder={!draft.payType ? "Choose pay type first" : draft.payType === "salary" ? "For example: 120000" : "For example: 25"} onChange={(event) => update("minimumPay", event.target.value === "" ? "" : Number(event.target.value))} />{typeof draft.minimumPay === "number" && draft.minimumPay > 0 ? <small>{draft.payType === "salary" ? formatMoney(draft.minimumPay) : `$${draft.minimumPay}`} {moneyLabel}</small> : <small>{draft.payType ? "Enter the lowest pay that would make a move worthwhile." : "Choose annual salary or hourly pay above."}</small>}</label><label><span>Pay I’m aiming for</span><input type="number" inputMode="decimal" min="1" disabled={!draft.payType} value={draft.targetPay} placeholder={!draft.payType ? "Choose pay type first" : draft.payType === "salary" ? "For example: 150000" : "For example: 32"} onChange={(event) => update("targetPay", event.target.value === "" ? "" : Number(event.target.value))} />{typeof draft.targetPay === "number" && draft.targetPay > 0 ? <small>{draft.payType === "salary" ? formatMoney(draft.targetPay) : `$${draft.targetPay}`} {moneyLabel}</small> : <small>{draft.payType ? "Enter the pay you would be pleased to reach." : "Choose annual salary or hourly pay above."}</small>}</label></div><p>You can change this for any individual job.</p></fieldset>
        <fieldset><legend><span>2</span> Where and how I work</legend><div className="choice-grid"><label className={`choice-card ${draft.remote ? "selected" : ""}`}><input type="checkbox" checked={draft.remote} onChange={(event) => update("remote", event.target.checked)} /><span>Remote</span>{draft.remote ? <Check size={18} weight="bold" aria-hidden="true" /> : null}</label><label className={`choice-card ${draft.hybrid ? "selected" : ""}`}><input type="checkbox" checked={draft.hybrid} onChange={(event) => update("hybrid", event.target.checked)} /><span>Hybrid</span>{draft.hybrid ? <Check size={18} weight="bold" aria-hidden="true" /> : null}</label><label className={`choice-card ${draft.onsite ? "selected" : ""}`}><input type="checkbox" checked={draft.onsite} onChange={(event) => update("onsite", event.target.checked)} /><span>On-site</span>{draft.onsite ? <Check size={18} weight="bold" aria-hidden="true" /> : null}</label></div><div className="field-grid"><label><span>Maximum commute distance</span><select value={draft.commute} onChange={(event) => update("commute", event.target.value)}><option>Not applicable</option><option>5 miles</option><option>10 miles</option><option>25 miles</option><option>50 miles</option><option>Flexible</option></select></label><label><span>Schedule requirements (optional)</span><input value={draft.schedule} onChange={(event) => update("schedule", event.target.value)} placeholder="For example: weekdays only or predictable shifts" /></label></div></fieldset>
        <fieldset><legend><span>3</span> Benefits that matter</legend><div className="choice-grid">{["Health coverage", "Retirement", "Paid time off", "Childcare or family support"].map((item) => <label className={`choice-card ${draft.benefits.includes(item) ? "selected" : ""}`} key={item}><input type="checkbox" checked={draft.benefits.includes(item)} onChange={() => toggleList("benefits", item)} /><span>{item}</span>{draft.benefits.includes(item) ? <Check size={18} weight="bold" aria-hidden="true" /> : null}</label>)}</div></fieldset>
        <fieldset><legend><span>4</span> Growth and stability</legend><div className="choice-grid">{["More responsibility", "New skills", "Leadership opportunity", "Job stability", "Future earning potential"].map((item) => <label className={`choice-card ${draft.growth.includes(item) ? "selected" : ""}`} key={item}><input type="checkbox" checked={draft.growth.includes(item)} onChange={() => toggleList("growth", item)} /><span>{item}</span>{draft.growth.includes(item) ? <Check size={18} weight="bold" aria-hidden="true" /> : null}</label>)}</div></fieldset>
        <section className="baseline-summary"><span className="eyebrow">Your current job standard</span><h2>A job must improve what matters most to you, not just have a better title.</h2><p>{paySummary} · {workSummary} · {draft.benefits.length || "No"} priority benefits selected</p></section>
        <button className="primary-button funnel-primary" type="submit">Save my priorities <CaretRight size={19} aria-hidden="true" /></button>
      </form>
    </section>
  );
}

function RadarSetupScreen({
  radar,
  laneOptions,
  onSave,
  saving,
}: {
  radar: typeof DEFAULT_RADAR;
  laneOptions: string[];
  onSave: (next: typeof DEFAULT_RADAR) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState(radar);
  const [errors, setErrors] = useState<string[]>([]);
  const validationSummary = useRef<HTMLDivElement>(null);
  const update = <K extends keyof typeof DEFAULT_RADAR>(key: K, value: (typeof DEFAULT_RADAR)[K]) => setDraft({ ...draft, [key]: value });
  const toggleLane = (lane: string) => update("lanes", draft.lanes.includes(lane) ? draft.lanes.filter((item) => item !== lane) : [...draft.lanes, lane]);
  const changePayBasis = (payBasis: typeof DEFAULT_RADAR.payBasis) => {
    if (draft.payBasis === payBasis) return;
    setDraft({ ...draft, payBasis, minimumBase: 0, idealBase: 0 });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!draft.lanes.length) nextErrors.push("Choose at least one career direction.");
    if (draft.minimumBase <= 0 || draft.idealBase <= 0) nextErrors.push("Pay values must be greater than zero.");
    if (draft.idealBase < draft.minimumBase) nextErrors.push("Target pay cannot be lower than the minimum.");
    if (!draft.remote && !draft.hybrid && !draft.onsite) nextErrors.push("Choose at least one acceptable work arrangement.");
    setErrors(nextErrors);
    if (nextErrors.length) {
      window.requestAnimationFrame(() => {
        validationSummary.current?.focus();
        validationSummary.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    onSave(draft);
  };
  return (
    <section className="screen radar-setup-screen">
      <PageHeader eyebrow="Job watch settings" title="Tell us which jobs are worth an alert." description="Choose what matters most. We’ll show you jobs that clear your standards and explain why." />
      <form className="setup-form" onSubmit={submit} noValidate>
        {errors.length ? <div className="operational-banner banner-danger validation-summary" role="alert" tabIndex={-1} ref={validationSummary}><WarningCircle size={21} weight="fill" aria-hidden="true" /><div><strong>Review these job watch settings</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div></div> : null}
        <fieldset aria-describedby={errors.some((error) => error.includes("career direction")) ? "radar-lanes-error" : undefined}>
          <legend><span>1</span> Which jobs should we watch?</legend>
          <p>Choose the career paths you want included.</p>
          <div className="choice-grid">
            {laneOptions.map((lane) => (
              <label className={`choice-card ${draft.lanes.includes(lane) ? "selected" : ""}`} key={lane}>
                <input type="checkbox" checked={draft.lanes.includes(lane)} onChange={() => toggleLane(lane)} />
                <span>{lane}</span>
                {draft.lanes.includes(lane) ? <Check size={18} weight="bold" aria-hidden="true" /> : null}
              </label>
            ))}
          </div>
          {errors.some((error) => error.includes("career direction")) ? <p className="field-error" id="radar-lanes-error">Choose at least one direction before starting job watch.</p> : null}
        </fieldset>
        <fieldset>
          <legend><span>2</span> Pay and work preferences</legend>
          <div className="billing-toggle baseline-pay-toggle" role="group" aria-label="Job watch pay type"><button type="button" className={draft.payBasis === "salary" ? "active" : ""} aria-pressed={draft.payBasis === "salary"} onClick={() => changePayBasis("salary")}>Annual salary</button><button type="button" className={draft.payBasis === "hourly" ? "active" : ""} aria-pressed={draft.payBasis === "hourly"} onClick={() => changePayBasis("hourly")}>Hourly pay</button></div>
          <div className="field-grid">
            <label><span>Minimum pay</span><input type="number" min="1" inputMode="numeric" value={draft.minimumBase || ""} placeholder={draft.payBasis === "salary" ? "For example: 120000" : "For example: 25"} aria-invalid={errors.some((error) => error.includes("Pay values") || error.includes("Target pay"))} aria-describedby={errors.some((error) => error.includes("Pay values") || error.includes("Target pay")) ? "radar-compensation-error" : undefined} onChange={(event) => update("minimumBase", Number(event.target.value))} /><small>{draft.minimumBase > 0 ? `${draft.payBasis === "salary" ? formatMoney(draft.minimumBase) : `$${draft.minimumBase}`} per ${draft.payBasis === "salary" ? "year" : "hour"}` : "Enter the lowest pay worth an alert."}</small></label>
            <label><span>Target pay</span><input type="number" min="1" inputMode="numeric" value={draft.idealBase || ""} placeholder={draft.payBasis === "salary" ? "For example: 150000" : "For example: 32"} aria-invalid={errors.some((error) => error.includes("Pay values") || error.includes("Target pay"))} aria-describedby={errors.some((error) => error.includes("Pay values") || error.includes("Target pay")) ? "radar-compensation-error" : undefined} onChange={(event) => update("idealBase", Number(event.target.value))} /><small>{draft.idealBase > 0 ? `${draft.payBasis === "salary" ? formatMoney(draft.idealBase) : `$${draft.idealBase}`} per ${draft.payBasis === "salary" ? "year" : "hour"}` : "Enter the pay you would be pleased to reach."}</small></label>
          </div>
          {errors.some((error) => error.includes("Pay values") || error.includes("Target pay")) ? <p className="field-error" id="radar-compensation-error">Use positive values and keep the target at or above the minimum.</p> : null}
          <div className="toggle-list">
            <label><span><strong>Remote roles</strong><small>Anywhere in the United States</small></span><input className="switch" type="checkbox" checked={draft.remote} aria-describedby={errors.some((error) => error.includes("work arrangement")) ? "radar-arrangement-error" : undefined} onChange={(event) => update("remote", event.target.checked)} /></label>
            <label><span><strong>Hybrid roles</strong><small>Partly at home and partly at a workplace</small></span><input className="switch" type="checkbox" checked={draft.hybrid} aria-describedby={errors.some((error) => error.includes("work arrangement")) ? "radar-arrangement-error" : undefined} onChange={(event) => update("hybrid", event.target.checked)} /></label>
            <label><span><strong>On-site roles</strong><small>At a workplace</small></span><input className="switch" type="checkbox" checked={draft.onsite} aria-describedby={errors.some((error) => error.includes("work arrangement")) ? "radar-arrangement-error" : undefined} onChange={(event) => update("onsite", event.target.checked)} /></label>
          </div>
          {errors.some((error) => error.includes("work arrangement")) ? <p className="field-error" id="radar-arrangement-error">Choose remote, hybrid, on-site, or any combination.</p> : null}
          <div className="field-grid"><label><span>Maximum commute distance</span><select value={draft.commute} onChange={(event) => update("commute", event.target.value)}><option>Not applicable</option><option>5 miles</option><option>10 miles</option><option>25 miles</option><option>50 miles</option><option>Flexible</option></select></label><label><span>Schedule requirements (optional)</span><input value={draft.schedule} onChange={(event) => update("schedule", event.target.value)} placeholder="For example: weekdays only or predictable shifts" /></label></div>
        </fieldset>
        <fieldset>
          <legend><span>3</span> Alert preferences</legend>
          <div className="field-grid">
            <label><span>How fresh should jobs be?</span><select value={draft.freshness} onChange={(event) => update("freshness", event.target.value)}><option value="14">Posted within 14 days</option><option value="30">Posted within 30 days</option><option value="60">Older jobs only when hiring still looks active</option></select><small>Older jobs stay out unless there is a clear sign that hiring is active.</small></label>
            <label><span>How often should we check?</span><select value={draft.cadence} onChange={(event) => update("cadence", event.target.value)}><option value="daily">Daily</option><option value="weekdays">Weekdays</option><option value="weekly">Weekly</option></select><small>Capacity limits queue work without weakening analysis.</small></label>
          </div>
          <div className="toggle-list">
            <label><span><strong>Notify me only when a job meets my standards</strong><small>No alerts just to create activity.</small></span><input className="switch" type="checkbox" checked={draft.notifications} onChange={(event) => update("notifications", event.target.checked)} /></label>
          </div>
          <details className="demo-disclosure"><summary>How we check job quality</summary><p>We check the employer, duplicates, whether the job still appears open, the posting date, and missing pay before recommending it.</p></details>
        </fieldset>
        <div className="sticky-form-action"><button type="submit" className="primary-button" disabled={saving}>{saving ? <CircleNotch className="spin" size={20} aria-hidden="true" /> : <Crosshair size={20} aria-hidden="true" />}{saving ? "Saving my job watch" : "Save and start job watch"}</button></div>
      </form>
    </section>
  );
}

function BriefAccounting({ scenario, correctedJobIds }: { scenario: Scenario; correctedJobIds: Set<string> }) {
  const categories = JOBS.map((job) => classifyFixtureForScenario(job, scenario, correctedJobIds.has(job.id)));
  const counts = [JOBS.length, categories.filter((category) => category === "surfaced").length, categories.filter((category) => category === "suppressed").length, categories.filter((category) => category === "unresolved").length];
  return (
    <details className="radar-accounting"><summary>What happened to the other sample jobs?</summary><p>Each sample is kept in one clear group so a weak or incomplete job cannot quietly become a recommendation.</p><dl className="accounting" aria-label="Sample job accounting">
      <div><dt>Checked</dt><dd>{counts[0]}</dd></div>
      <div><dt>Worth showing</dt><dd>{counts[1]}</dd></div>
      <div><dt>Did not meet your standard</dt><dd>{counts[2]}</dd></div>
      <div><dt>Missing important details</dt><dd>{counts[3]}</dd></div>
    </dl></details>
  );
}

function BriefJobCard({ job, rank, onOpen }: { job: JobFixture; rank: number; onOpen: () => void }) {
  return (
    <article className="brief-job">
      <div className="rank" aria-label={`Rank ${rank}`}>{rank}</div>
      <div className="brief-job-main">
        <span className="eyebrow">{rank === 1 ? "Top match" : "Worth a look"}</span>
        <h2 className="opportunity-title">{job.title}</h2>
        <strong>{job.company}</strong>
        <p>{job.why}</p>
        <div className="metadata"><span><MapPin size={16} aria-hidden="true" />{job.location}</span><span><CurrencyDollar size={16} aria-hidden="true" />{job.compensation}</span><span><ShieldCheck size={16} aria-hidden="true" />{job.freshness.replace("Published", "Posted").replace("verified", "last checked")}</span></div>
        <div className="baseline-delta"><TrendUp size={18} aria-hidden="true" /><span><strong>Why it stands out:</strong> {job.baseline[0]?.result ?? "Needs review"}</span></div>
        <div className="risk-line"><WarningCircle size={18} weight="fill" aria-hidden="true" /><span><strong>Biggest question:</strong> {job.risk}</span></div>
      </div>
      <div className="brief-job-action"><span className={`small-recommendation rec-${job.recommendation.toLowerCase()}`}>{recommendationLabel(job.recommendation)}</span><button id={`brief-review-${job.id}`} className="text-button" onClick={onOpen}>Review this job <CaretRight size={17} aria-hidden="true" /></button></div>
    </article>
  );
}

function RadarBriefScreen({ scenario, navigate, correctedJobIds }: { scenario: Scenario; navigate: (route: Route) => void; correctedJobIds: Set<string> }) {
  const accountingEntries = JOBS.map((job) => ({ job, category: classifyFixtureForScenario(job, scenario, correctedJobIds.has(job.id)) }));
  const surfacedJobs = accountingEntries.filter((entry) => entry.category === "surfaced").map((entry) => entry.job);
  const surfacedCount = surfacedJobs.length;
  const suppressedCount = accountingEntries.filter((entry) => entry.category === "suppressed").length;
  const unresolvedCount = accountingEntries.filter((entry) => entry.category === "unresolved").length;
  const leadingCorrectionPending = correctedJobIds.has("going");
  const copy: Record<Scenario, { title: string; description: string }> = {
    material: leadingCorrectionPending
      ? { title: "One job needs another look before we recommend it.", description: "A correction changed the information used for this job, so the old answer is on hold." }
      : { title: "One job deserves a closer look.", description: "It clears your current standard, but there are still a few details to confirm." },
    "no-action": { title: "No new job meets your standards yet.", description: "Your job watch stayed selective. We’ll keep looking without lowering the bar just to create activity." },
    conflict: { title: "One job needs a closer look before we recommend it.", description: "The job details do not fully agree, so we are keeping the recommendation on hold." },
    offline: { title: "You’re seeing your last saved update.", description: "You can still review jobs and save decisions. New results will appear when the connection returns." },
    loading: { title: "Checking for better opportunities.", description: "Your last saved results remain available while we review new jobs." },
    partial: { title: "Some job details are still missing.", description: "We kept the safe information and put any answer that depends on missing facts on hold." },
    capacity: { title: "Your next job check is waiting.", description: "Your work is saved. We will not use a weaker analysis just to finish sooner." },
    budget: { title: "Your next job check is waiting.", description: "Your work is saved and no extra model cost was added in the background." },
    validation: { title: "We could not trust the latest job check.", description: "Your last saved jobs are unchanged while we review the problem." },
    error: { title: "We could not refresh your jobs.", description: "Your last saved results are still available, and incomplete information did not change them." },
  };
  const showJobs = ["material", "conflict", "offline"].includes(scenario) && surfacedJobs.length > 0;
  const showAccounting = !["loading", "capacity", "budget", "validation", "error"].includes(scenario);
  return (
    <section className="screen radar-brief-screen" aria-busy={scenario === "loading"}>
      <PageHeader eyebrow="Today" title={copy[scenario].title} description={copy[scenario].description} />
      {scenario === "material" && leadingCorrectionPending ? <div className="operational-banner banner-warning"><WarningCircle size={21} weight="fill" aria-hidden="true" /><div><strong>The leading job needs another look</strong><p>Your correction is saved. This job is no longer recommended, and we will not promote a weaker job just to fill the list.</p></div><button id="brief-review-going" onClick={() => navigate({ view: "review", jobId: "going" })}>Review correction</button></div> : null}
      {scenario === "offline" ? <div className="operational-banner banner-neutral"><CloudSlash size={21} aria-hidden="true" /><div><strong>Offline · cached at 9:14 AM</strong><p>Source refresh and sync are unavailable. Corrections and decisions remain pending on this device. No external approval can occur.</p></div></div> : null}
      {scenario === "conflict" ? <div className="operational-banner banner-warning"><WarningCircle size={21} weight="fill" aria-hidden="true" /><div><strong>Two job sources disagree</strong><p>A job-board page and the employer page show different title and pay details. We put the recommendation on hold.</p></div><button id="brief-review-tebra" onClick={() => navigate({ view: "review", jobId: "tebra" })}>Review conflict</button></div> : null}
      {scenario === "partial" ? <div className="operational-banner banner-warning"><WarningCircle size={21} weight="fill" aria-hidden="true" /><div><strong>Four important job details are missing</strong><p>We kept the facts we can support, but we will not create a new score or recommendation until the missing details are checked.</p></div></div> : null}
      {scenario === "loading" ? <div className="analysis-state"><CircleNotch className="spin" size={30} aria-hidden="true" /><h2>Checking the job information</h2><p>Your last trusted result stays available. We will not guess how long the new check will take or lower the quality bar.</p><button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>Open my last saved jobs</button></div> : null}
      {scenario === "capacity" ? <div className="analysis-state"><ShieldCheck size={32} weight="duotone" aria-hidden="true" /><h2>Waiting for a quality-checked analysis</h2><p>We will retry only when the available route meets the same quality, privacy, and cost standards.</p><button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>Open my last saved jobs</button></div> : null}
      {scenario === "budget" ? <div className="analysis-state"><CurrencyDollar size={32} weight="duotone" aria-hidden="true" /><h2>The next check is waiting</h2><p>No extra model cost was added in the background, and no lower-quality result was substituted.</p><button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>Open my last saved jobs</button></div> : null}
      {scenario === "validation" ? <div className="analysis-state"><WarningCircle size={32} weight="duotone" aria-hidden="true" /><h2>We could not trust the latest check</h2><p>The job information failed one or more quality checks, so your last trusted results remain unchanged.</p><button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>Open my last saved jobs</button></div> : null}
      {scenario === "error" ? <div className="analysis-state"><WarningCircle size={32} weight="duotone" aria-hidden="true" /><h2>We could not accept the new information</h2><p>The failed refresh did not change your rankings or decisions. You can still review your last trusted results.</p><button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>Open my last saved jobs</button></div> : null}
      {scenario === "no-action" ? (
        <div className="no-action-state">
          <ShieldCheck size={38} weight="duotone" aria-hidden="true" />
          <h2>No job is better than a weak job.</h2>
          <p>We will keep looking. {unresolvedCount} {unresolvedCount === 1 ? "job still needs" : "jobs still need"} important information before we can recommend them.</p>
          <div className="no-action-grid"><span><strong>{JOBS.length}</strong> checked</span><span><strong>{surfacedCount}</strong> worth showing</span><span><strong>{suppressedCount}</strong> did not meet your standard</span><span><strong>{unresolvedCount}</strong> missing details</span></div>
          <div className="brief-timing"><span><strong>Last checked</strong>July 17 · 9:14 AM CT</span><span><strong>Next check</strong>Your next scheduled job watch</span><span><strong>Alert trigger</strong>A verified role clears your standard</span></div>
          <button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>See all jobs</button>
        </div>
      ) : showJobs ? (
        <div className="brief-list">
          {surfacedJobs.map((job, index) => <BriefJobCard key={job.id} job={job} rank={index + 1} onOpen={() => navigate({ view: "review", jobId: job.id })} />)}
        </div>
      ) : null}
      {showAccounting ? <BriefAccounting scenario={scenario} correctedJobIds={correctedJobIds} /> : null}
      {showAccounting ? <div className="radar-actions"><button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>See all jobs</button><button className="text-button" onClick={() => navigate({ view: "radar-setup" })}>Edit job watch</button></div> : null}
    </section>
  );
}

function AnalysisContextBanner({ scenario }: { scenario: Scenario }) {
  if (scenario === "material") return null;
  const context: Record<Exclude<Scenario, "material">, { title: string; body: string; tone: "neutral" | "warning" | "danger" }> = {
    "no-action": {
      title: "No new job met your standards",
      body: "The jobs below are saved samples from an earlier prototype state, not new results from this check.",
      tone: "neutral",
    },
    conflict: {
      title: "Source conflict remains unresolved",
      body: "The new recommendation is on hold. Trusted facts and your last saved recommendations remain visible.",
      tone: "warning",
    },
    offline: {
      title: "Offline · last saved jobs",
      body: "Evidence is cached. Local decisions and review drafts remain pending on this device, and exact external approval is unavailable.",
      tone: "neutral",
    },
    loading: {
      title: "New analysis is still queued",
      body: "The jobs below are your last trusted results. New recommendations are still waiting.",
      tone: "neutral",
    },
    partial: {
      title: "Some important job details are missing",
      body: "Four details still need checking. The screen below shows your last trusted results, not a completed new check.",
      tone: "warning",
    },
    capacity: {
      title: "Analysis delayed by qualified-model capacity",
      body: "The jobs below are your last trusted results. We did not substitute a lower-quality check or promise a completion time.",
      tone: "neutral",
    },
    budget: {
      title: "Analysis delayed by the applicable budget",
      body: "The jobs below are your last trusted results. No hidden model cost or lower-quality result was used.",
      tone: "neutral",
    },
    validation: {
      title: "The latest job check could not finish",
      body: "Your last trusted scores and recommendations are unchanged. Open a job to review what still needs verification.",
      tone: "danger",
    },
    error: {
      title: "We could not refresh the job sources",
      body: "Your last trusted facts, scores, recommendations, and decisions are unchanged. Open a job to review the saved evidence.",
      tone: "danger",
    },
  };
  const item = context[scenario];
  const Icon = item.tone === "danger" || item.tone === "warning" ? WarningCircle : scenario === "offline" ? CloudSlash : ShieldCheck;
  return <div className="global-analysis-notice"><div className={`operational-banner banner-${item.tone}`}><Icon size={20} weight={item.tone === "neutral" ? "regular" : "fill"} aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.body}</p></div></div></div>;
}

function SampleWorkspaceNotice() {
  return <div className="global-analysis-notice sample-workspace-notice"><div className="operational-banner banner-neutral"><Info size={20} aria-hidden="true" /><div><strong>Private-alpha sample jobs</strong><p>Every job, score, source check, and recommendation below is a labeled fictionalized test fixture. Nothing here is a live result or a current ranking of the job market.</p></div></div></div>;
}

function OpportunityRow({ job, onOpen, correctionPending }: { job: JobFixture; onOpen: () => void; correctionPending: boolean }) {
  return (
    <article className="opportunity-row">
      <div className="company-icon"><Briefcase size={22} aria-hidden="true" /></div>
      <div className="opportunity-main">
        <div className="opportunity-title-line"><h2 className="opportunity-title">{job.title}</h2><span className={`small-recommendation ${correctionPending ? "recommendation-stale" : `rec-${job.recommendation.toLowerCase()}`}`}>{correctionPending ? "Needs another look" : recommendationLabel(job.recommendation)}</span></div>
        <strong>{job.company}</strong>
        <p>{job.alignment}</p>
        <div className="metadata"><span><MapPin size={15} aria-hidden="true" />{job.location}</span><span><CurrencyDollar size={15} aria-hidden="true" />{job.compensation}</span></div>
      </div>
      <div className="opportunity-source"><IntegrityBadge job={job} /><span>{job.freshness}</span><button id={`opportunity-review-${job.id}`} className="text-button" onClick={onOpen}>Review job <CaretRight size={17} aria-hidden="true" /></button></div>
    </article>
  );
}

function OpportunitiesScreen({ navigate, correctedJobIds }: { navigate: (route: Route) => void; correctedJobIds: Set<string> }) {
  const [filter, setFilter] = useState("all");
  const filtered = JOBS.filter((job) => filter === "all" || (filter === "attention" && ["Pursue", "Investigate"].includes(job.recommendation)) || (filter === "watch" && job.recommendation === "Watch") || (filter === "pass" && job.recommendation === "Pass"));
  return (
    <section className="screen opportunities-screen">
      <PageHeader eyebrow="Find Jobs · sample workspace" title="Sample jobs organized around your paths" description="Try the decision experience with fictionalized fixtures. These are not live jobs selected for you." />
      <span className="eyebrow filter-label">Show</span>
      <div className="filter-row" role="group" aria-label="Filter jobs">
        {[['all','All'],['attention','Best matches'],['watch','Watch'],['pass','Passed']].map(([value,label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
      {filtered.length ? <div className="opportunity-list">{filtered.map((job) => <OpportunityRow key={job.id} job={job} correctionPending={correctedJobIds.has(job.id)} onOpen={() => navigate({ view: "review", jobId: job.id })} />)}</div> : <div className="no-action-state"><h2>No jobs match this view.</h2><p>Try another filter or update your job watch preferences.</p><button className="secondary-button" onClick={() => navigate({ view: "radar-setup" })}>Update job watch</button></div>}
    </section>
  );
}

function SampleWorkspaceBoundary({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="screen sample-workspace-boundary">
      <PageHeader eyebrow="Finish setup first" title="Your sample job workspace needs a complete plan." description="Way Ahead will not show fixture jobs as personal results before you choose a goal, a synthetic profile, a complete Job Standard, and one primary career path." />
      <div className="operational-banner banner-neutral"><ShieldCheck size={21} aria-hidden="true" /><div><strong>No personalized jobs were generated</strong><p>The private-alpha examples stay hidden until the walkthrough has enough context to label and explain them honestly.</p></div></div>
      <button className="primary-button" type="button" onClick={onContinue}>Continue from my first missing choice</button>
    </section>
  );
}

function UnknownOpportunityScreen({ navigate, jobId }: { navigate: (route: Route) => void; jobId: string }) {
  return (
    <section className="screen unknown-opportunity-screen">
      <PageHeader eyebrow="Job unavailable" title="We can’t open this job." description="The link may be old or the job may have been removed. Return to your jobs and choose another listing." />
      <details className="demo-disclosure"><summary>Technical details</summary><p>Unknown record: {jobId}</p></details>
      <button className="primary-button" onClick={() => navigate({ view: "opportunities" })}>Back to my jobs</button>
    </section>
  );
}

function PayState({ state }: { state: JobFixture["pay"][number]["state"] }) {
  const labels = {
    published: "Published",
    offered: "Offered",
    eligible: "Eligibility only",
    target: "Target",
    unknown: "Unknown",
    not_stated: "Not stated",
    suppressed_by_gate: "Gated",
  };
  return <span className={`pay-state pay-${state}`}>{labels[state]}</span>;
}

function RequirementCard({ job, requirement, openSheet, correctionPending }: { job: JobFixture; requirement: Requirement; openSheet: (sheet: SheetState) => void; correctionPending: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = `requirement-${requirement.id}`;
  const evidenceLabel = correctionPending ? "Correction pending" : requirement.proofState === "narrowly_approved" ? "Narrowly proven" : stateLabel(requirement.state);
  const interpretationLabel = requirement.interpretationState === "gold_locked"
    ? "Exact employer text locked"
    : requirement.interpretationState === "adjudicated_derived"
      ? "Reviewed interpretation"
      : "Provisional interpretation";
  return (
    <article className={`requirement-card state-${requirement.state} ${correctionPending ? "correction-pending" : ""}`}>
      <button className="requirement-summary" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        <span className="requirement-state"><StateIcon state={requirement.state} /><span>{evidenceLabel}</span></span>
        <span className="requirement-copy"><strong>{requirement.text}</strong><small>{requirement.priority} · {requirement.modality} · {interpretationLabel}</small></span>
        <CaretDown className={open ? "rotated" : ""} size={19} aria-hidden="true" />
      </button>
      {open ? (
        <div className="requirement-detail" id={panelId}>
          {correctionPending ? <div className="operational-banner banner-warning"><WarningCircle size={19} weight="fill" aria-hidden="true" /><div><strong>This requirement is stale pending correction review</strong><p>The prior proof state remains visible for audit only and cannot support a current score or recommendation.</p></div></div> : null}
          <p>{requirement.rationale}</p>
          <dl><div><dt>{requirement.employerSourceKind === "application" ? "Application-derived gate" : "Job-description requirement"}</dt><dd>{requirement.text}</dd></div><div><dt>Employer source</dt><dd>{requirement.employerSource}</dd></div><div><dt>Candidate proof</dt><dd>{requirement.proof}</dd></div><div><dt>Candidate source</dt><dd>{requirement.source}</dd></div><div><dt>Effect on recommendation</dt><dd>{requirement.effect}</dd></div></dl>
          {requirement.logicalGroupId ? <div className="separation-note"><Info size={19} aria-hidden="true" /><p>{requirement.alternativeSemantics === "any_of" ? `OR group: ${requirement.alternatives.join(" · ")}. One accepted alternative can satisfy the grouped statement.` : requirement.alternativeSemantics === "all_of" ? `AND group: ${requirement.alternatives.join(" · ")}. All named elements may matter, so the phrase stays one compound requirement.` : `Examples group: ${requirement.alternatives.join(" · ")}. These are preserved as examples, not silently converted into mandatory skills.`}</p></div> : null}
          <div className="inline-actions"><button className="text-button" onClick={() => openSheet({ type: "source", job, requirement })}><Eye size={17} aria-hidden="true" /> View source</button><button className="text-button" onClick={() => openSheet({ type: "correction", job, requirement })}><PencilSimple size={17} aria-hidden="true" /> Report incorrect evidence</button></div>
        </div>
      ) : null}
    </article>
  );
}

function DecisionGroup({ job, decision, onDecision, correctionPending }: { job: JobFixture; decision?: string; onDecision: (value: string) => void; correctionPending: boolean }) {
  const blockingGates = getBlockingGates(job);
  const disabledPursue = correctionPending || job.integrity === "inactive" || blockingGates.some((gate) => gate.kind === "opportunity_integrity" && gate.status === "blocked");
  const gateCount = blockingGates.length + (correctionPending ? 1 : 0);
  return (
    <fieldset className="decision-group" id={`decision-${job.id}`}>
      <legend>What do you want to do?</legend>
      <div className="decision-options">
        {[
          ["Pursue", correctionPending ? "Check the correction first" : blockingGates.length ? "Start getting ready after open items are resolved" : "Start getting ready to apply"],
          ["Watch", "Keep this job on my alerts"],
          ["Pass", "Remove it from my active list"],
        ].map(([value, helper]) => (
          <label key={value} className={`${decision === value ? "selected" : ""} ${value === "Pursue" && disabledPursue ? "disabled" : ""}`}>
            <input type="radio" name={`decision-${job.id}`} value={value} checked={decision === value} disabled={value === "Pursue" && disabledPursue} onChange={() => onDecision(value)} />
            <span>{value}</span><small>{helper}</small>
          </label>
        ))}
      </div>
      <p>Choosing Pursue starts preparation only. Nothing is sent to an employer until you review and approve that exact application.</p>
      {gateCount ? <details className="gate-summary"><summary>{gateCount} {gateCount === 1 ? "item" : "items"} to resolve before applying</summary><ul>{correctionPending ? <li><strong>Correction review</strong><span>Check the information you corrected before using this recommendation.</span></li> : null}{blockingGates.map((gate) => <li key={gate.id}>{gate.reason}<span>{gate.recoveryAction}</span></li>)}</ul></details> : <div className="gate-summary clear"><CheckCircle size={18} weight="fill" aria-hidden="true" /><strong>No open item blocks preparation.</strong></div>}
    </fieldset>
  );
}

function ReviewScreen({
  job,
  baselinePreferences,
  scenario,
  navigate,
  backRoute,
  openSheet,
  decision,
  onDecision,
  pendingCorrections,
}: {
  job: JobFixture;
  baselinePreferences: BaselinePreferences;
  scenario: Scenario;
  navigate: (route: Route) => void;
  backRoute: Route;
  openSheet: (sheet: SheetState) => void;
  decision?: string;
  onDecision: (value: string) => void;
  pendingCorrections: CorrectionRecord[];
}) {
  const requirements = getRequirementViews(job).filter((requirement) => requirement.employerSourceKind === "job");
  const applicationRequirements = getRequirementViews(job).filter((requirement) => requirement.employerSourceKind === "application");
  const blockingGates = getBlockingGates(job);
  const correctionPending = pendingCorrections.length > 0;
  const correctedRequirementIds = new Set(pendingCorrections.map((record) => record.requirementId));
  const correctionRequirement = getRequirementViews(job).find((requirement) => correctedRequirementIds.has(requirement.id));
  const preferenceAssessment = assessPreferences(job, baselinePreferences);
  const hasReviewItems = getProofRecoveryRequirements(job).length > 0 || job.applicationQuestions.some((question) => question.required && question.answerState !== "supported");
  const nextAction = deriveReviewAction({
    decision,
    correctionPending,
    inactive: job.integrity === "inactive",
    blockingGateCount: blockingGates.length,
    hasReviewItems,
    workflowAction: job.workflowAction,
  });
  const runNextAction = () => {
    if (nextAction.kind === "return_opportunities") return navigate({ view: "opportunities" });
    if (nextAction.kind === "edit_radar") return navigate({ view: "radar-setup" });
    if (nextAction.kind === "continue_pursuit") return navigate({ view: "pursuits" });
    if (nextAction.kind === "review_correction" && correctionRequirement) return openSheet({ type: "correction", job, requirement: correctionRequirement });
    if (nextAction.kind === "resolve_review_items") return openSheet({ type: "proof", job });
    return openSheet({ type: "source", job });
  };
  const recommendationHeadline = correctionPending
    ? "We need to check one correction before this recommendation is useful."
    : job.integrity === "inactive"
      ? "This job is probably not worth more time because the opening appears closed."
      : job.integrity === "conflict"
        ? "This job needs a closer look because important details do not agree."
        : preferenceAssessment
          ? preferenceAssessment.headline
        : job.recommendation === "Pursue"
          ? "This job is worth pursuing, with a few things to confirm."
          : job.recommendation === "Investigate"
            ? "This job looks promising, but one proof gap could change the answer."
          : job.recommendation === "Watch"
            ? "This job may be worth watching, but it is not ready for a yes."
            : "This job is probably not worth your time right now.";
  return (
    <section className="screen review-screen">
      <button className="back-button" onClick={() => navigate(backRoute)}><ArrowLeft size={18} aria-hidden="true" /> Back to {backRoute.view === "radar" ? "my job alerts" : backRoute.view === "pursuits" ? "my jobs" : backRoute.view === "strategy" ? "my plan" : "all jobs"}</button>
      <header className="review-header">
        <div className="review-identity"><span className="eyebrow">{job.company}</span><h1>{job.title}</h1><p>{job.location}</p></div>
        <IntegrityBadge job={job} />
      </header>
      {job.integrity === "inactive" ? <div className="operational-banner banner-danger"><WarningCircle size={22} weight="fill" aria-hidden="true" /><div><strong>This opening appears closed</strong><p>The score and Pursue option are on hold. A form that still loads is not enough to prove that the employer is hiring.</p></div></div> : null}
      {job.integrity === "conflict" ? <div className="operational-banner banner-warning"><WarningCircle size={22} weight="fill" aria-hidden="true" /><div><strong>Two sources disagree</strong><p>The title and pay details need review. Facts that do not depend on the disagreement remain visible.</p></div></div> : null}
      {correctionPending ? <div className="operational-banner banner-warning correction-pending-banner"><WarningCircle size={22} weight="fill" aria-hidden="true" /><div><strong>Your correction needs review</strong><p>The affected proof, score, recommendation, and preparation steps are on hold. Your saved decision remains visible but cannot start preparation.</p></div></div> : null}
      <div className="review-summary-grid">
        <article className="decision-summary">
          <RecommendationBadge job={job} lastVerified={scenario !== "material"} correctionPending={correctionPending} displayRecommendation={preferenceAssessment?.recommendation} />
          <h2>{recommendationHeadline}</h2>
          <p>{preferenceAssessment?.summary ?? job.why}</p>
          <div className="main-risk"><WarningCircle size={20} weight="fill" aria-hidden="true" /><div><span>Main risk</span><p>{preferenceAssessment?.concerns[0] ?? job.risk}</p></div></div>
        </article>
        <article className="review-fit-card"><span className="eyebrow">Fast summary</span><dl><div><dt>{preferenceAssessment ? "Sample experience fit" : "Overall fit"}</dt><dd>{correctionPending || job.integrity === "inactive" ? "On hold" : `${job.score} / 100`}</dd></div>{preferenceAssessment ? <div><dt>Your priorities</dt><dd>{preferenceAssessment.matches.length} match · {preferenceAssessment.concerns.length} conflict · {preferenceAssessment.unknowns.length} open</dd></div> : null}<div><dt>Confidence</dt><dd>{job.integrity === "verified" && !correctionPending ? "Medium" : "Low"}</dd></div></dl><button className="text-button" onClick={() => openSheet({ type: "assessment", job })}>Why this score</button></article>
      </div>
      <div className="review-reasons"><article><h3>Why it fits</h3><p>{preferenceAssessment?.matches.length ? preferenceAssessment.matches.slice(0, 2).join(" ") : job.alignment}</p></article><article><h3>Main concern</h3><p>{preferenceAssessment?.concerns[0] ?? job.risk}</p></article><article><h3>What could change the answer</h3><p>{preferenceAssessment?.unknowns[0] ?? "Better source information or stronger proof for the most important open requirement."}</p></article></div>
      <DecisionGroup job={job} decision={decision} onDecision={onDecision} correctionPending={correctionPending} />
      {decision ? <section className="review-next-action" aria-label="Next action"><div><span className="eyebrow">Next step</span><h2>{nextAction.label}</h2><p>{decision === "Pass" ? "This job will leave your active list." : decision === "Watch" ? "We’ll keep this job in view without starting application work." : correctionPending ? "Review the information you corrected before using this recommendation." : "Your choice is saved. Open items and final approval remain separate."}</p></div><button className="primary-button" onClick={runNextAction}>{nextAction.label}<CaretRight size={19} aria-hidden="true" /></button></section> : null}
      <details className="review-detail"><summary>How we read this job</summary><article className="interpretation-card">
          <div className="interpretation-title"><Sparkle size={20} weight="fill" aria-hidden="true" /><div><span className="eyebrow">Job posting check</span><strong>{job.extraction.coverage}</strong></div></div>
          <p>{job.extraction.source}</p>
          <div className="flag-list">{job.extraction.flags.map((flag) => <span key={flag}>{flag}</span>)}</div>
          <button className="text-button" onClick={() => openSheet({ type: "source", job })}>View source details <CaretRight size={17} aria-hidden="true" /></button>
        </article></details>
      <details className="review-detail"><summary>How this job compares with your goals</summary><section className="plain-section">
        <div className="section-heading"><div><span className="eyebrow">Career Baseline comparison</span><h2>What changes if you take this move</h2></div></div>
        <div className="comparison-list">{(preferenceAssessment?.comparison ?? job.baseline).map((item) => <div key={item.label}><span>{item.label}</span><p><small>Your standard</small>{item.current}</p><p><small>Opportunity</small>{item.opportunity}</p><strong>{item.result}</strong></div>)}</div>
      </section></details>
      <details className="review-detail"><summary>Pay and benefits</summary><section className="plain-section compensation-section">
        <div className="section-heading"><div><span className="eyebrow">Career economics</span><h2>Compensation components stay separate</h2></div></div>
        <div className="pay-grid">{job.pay.map((item) => <article key={item.label}><div><span>{item.label}</span><PayState state={item.state} /></div><strong>{item.value}</strong><p>{item.note}</p><small className="pay-provenance">{item.disclosureSemantics.replaceAll("_", " ")} · guaranteed: {item.guaranteed} · source: {item.sourceRef ?? "exact source not frozen"}</small></article>)}</div>
        {job.compensationAmbiguityObservations.map((observation) => <div className="operational-banner banner-neutral ambiguity-observation" key={observation.id}><ShieldCheck size={20} weight="fill" aria-hidden="true" /><div><strong>Synthetic classifier control · not employer evidence</strong><p>“{observation.exactText}” was classified as context, not stock or ownership compensation. {observation.reason}</p></div></div>)}
        <details className="benefits-disclosure"><summary>Benefits observed in the posting <CaretDown size={18} aria-hidden="true" /></summary><div>{job.benefits.map((benefit) => <p key={benefit.id}><CheckCircle size={17} weight={benefit.state === "explicitly_offered" ? "fill" : "regular"} aria-hidden="true" /><span><strong>{benefit.label}</strong>{benefit.value}<em>{benefit.note}</em></span><small>{benefit.state === "explicitly_offered" ? "Explicitly offered" : benefit.state === "eligibility_only" ? "Eligibility only" : benefit.state === "explicitly_absent" ? "Explicitly absent" : "Unknown"}<br />Source: {benefit.sourceRef ?? "not frozen"}<br />{benefit.exactText ? `${job.extraction.captureCompleteness === "full" ? "Exact employer text" : "Derived source summary"}: “${benefit.exactText}”` : "Exact employer text not frozen"}</small></p>)}</div></details>
      </section></details>
      <details className="review-detail"><summary>What the job requires</summary><section className="plain-section requirements-section">
        <div className="section-heading"><div><span className="eyebrow">Requirements and proof</span><h2>What the role asks for, versus what you can prove</h2></div><button className="secondary-button" onClick={() => openSheet({ type: "assessment", job })}>Assessment details</button></div>
        {requirements.length ? <div className="requirements-list">{requirements.map((requirement) => <RequirementCard job={job} requirement={requirement} key={requirement.id} correctionPending={correctedRequirementIds.has(requirement.id)} openSheet={openSheet} />)}</div> : <div className="empty-inline"><Info size={20} aria-hidden="true" /><p>We need a saved copy of the official posting before we can compare each requirement safely.</p></div>}
      </section></details>
      {job.applicationQuestions.length ? <details className="review-detail"><summary>Application questions</summary><section className="plain-section application-questions-section"><div className="section-heading"><div><span className="eyebrow">Questions on the application</span><h2>Check the answers separately from the job description</h2></div></div><p className="section-intro">A required application question can stop preparation, but it does not become a job requirement or a fact about you.</p><div className="application-question-list">{job.applicationQuestions.map((question) => { const linked = applicationRequirements.filter((requirement) => question.linkedRequirementIds.includes(requirement.id)); return <article key={question.id}><div><span className="status-pill">{question.promptState === "exact" ? "Exact question" : question.promptState === "derived" ? "Question summarized" : "Question unavailable"}</span><span className={`question-state question-${question.answerState}`}>{question.answerState.replaceAll("_", " ")}</span></div><h3>{question.displayPrompt}</h3><p>{question.required ? "Required answer" : "Optional answer"} · {question.responseType.replaceAll("_", " ")}</p>{linked.map((requirement) => <dl className="application-linked-assessment" key={requirement.id}><div><dt>Your experience</dt><dd>{stateLabel(requirement.state)} · {requirement.rationale}</dd></div><div><dt>What supports it</dt><dd>{requirement.proof}</dd></div><div><dt>What to do</dt><dd>{requirement.recoveryAction ?? "No additional action specified."}</dd></div></dl>)}</article>; })}</div></section></details> : null}
    </section>
  );
}

function gateKindLabel(gate: Gate) {
  return {
    opportunity_integrity: "Opportunity integrity",
    source_conflict: "Source conflict",
    application_requirement: "Application question",
    candidate_proof: "Candidate proof",
    logistics: "Logistics",
    compensation: "Compensation",
    freshness: "Freshness",
    mandate_fit: "Mandate fit",
  }[gate.kind];
}

function PursuitsScreen({ navigate, decisions, correctedJobIds }: { navigate: (route: Route) => void; decisions: Record<string, string>; correctedJobIds: Set<string> }) {
  const pursuits = JOBS.filter((job) => decisions[job.id] === "Pursue");
  return (
    <section className="screen pursuits-screen">
      <PageHeader eyebrow="Pursuits" title="Jobs you’re actively considering" description="See what needs to happen next for each job. Nothing is sent until you approve it." />
      <div className="pursuit-list">
        {pursuits.length ? pursuits.map((job) => {
          const gates = getBlockingGates(job);
          const correctionPending = correctedJobIds.has(job.id);
          const gateCount = gates.length + (correctionPending ? 1 : 0);
          return <article className="pursuit-card" key={job.id}><div className={`pursuit-state ${gateCount ? "state-warning" : "state-positive"}`}>{gateCount ? <WarningCircle size={19} weight="fill" aria-hidden="true" /> : <CheckCircle size={19} weight="fill" aria-hidden="true" />}{gateCount ? `${gateCount} ${gateCount === 1 ? "item" : "items"} to resolve` : "Ready to get started"}</div><h2>{job.title}</h2><strong>{job.company}</strong><p>{gateCount ? "Check the open items before preparing this application. Nothing was sent." : "You can start preparing, but sending still requires your approval."}</p>{gateCount ? <details className="pursuit-gates"><summary>What to resolve before applying</summary><ul>{correctionPending ? <li><strong>Correction review</strong><span>Check the information you corrected before using the recommendation.</span></li> : null}{gates.map((gate) => <li key={gate.id}><strong>{gateKindLabel(gate)}</strong><span>{gate.recoveryAction}</span></li>)}</ul></details> : null}<button id={`pursuit-review-${job.id}`} className="secondary-button" onClick={() => navigate({ view: "review", jobId: job.id })}>{gateCount ? `Resolve ${gateCount} ${gateCount === 1 ? "item" : "items"}` : "Continue preparation"}</button></article>;
        }) : <article className="pursuit-card quiet"><div className="pursuit-state"><Info size={19} aria-hidden="true" /> No active jobs yet</div><h2>Your first job will appear here.</h2><p>Choose Pursue on a job to bring it here. That choice never submits an application.</p><button className="secondary-button" onClick={() => navigate({ view: "opportunities" })}>Review jobs</button></article>}
        <article className="pursuit-card demo-card"><div className="pursuit-state state-positive"><CheckCircle size={19} weight="fill" aria-hidden="true" /> Try the application demo</div><span className="demo-label">Fictional job · no employer action</span><h2>Senior Growth Operations</h2><strong>Cedarfield</strong><p>Use this separate example to review materials and see the exact approval step safely.</p><button className="primary-button" onClick={() => navigate({ view: "materials" })}>Try the application demo <CaretRight size={18} aria-hidden="true" /></button></article>
      </div>
    </section>
  );
}

function ApplicationScreen({ navigate, openApproval, openPreview, approvalState, offline, setApprovalState, onPlans }: { navigate: (route: Route) => void; openApproval: () => void; openPreview: (asset: "resume" | "cover-letter" | "answers") => void; approvalState: ApprovalState; offline: boolean; setApprovalState: (state: ApprovalState) => void; onPlans: () => void }) {
  const phase = approvalState.phase;
  const statusRef = useRef<HTMLDivElement>(null);
  const previousPhase = useRef(phase);
  useEffect(() => {
    if (previousPhase.current !== phase) statusRef.current?.focus();
    previousPhase.current = phase;
  }, [phase]);
  const statusLabels: Record<ApprovalState["phase"], string> = {
    unapproved: "No external action approved",
    approved: "Exact demo payload approved; handoff has not occurred",
    handoff: "Demo handoff simulated; confirmation not yet observed",
    verified: "Demo confirmation verified and receipt recorded",
    unconfirmed: "Demo returned without visible confirmation",
    revoked: "Prior approval revoked because the package changed",
  };
  const statusTone = offline ? "neutral" : phase === "verified" ? "positive" : phase === "unconfirmed" || phase === "revoked" ? "warning" : "neutral";
  const StatusIcon = offline ? CloudSlash : phase === "verified" ? CheckCircle : phase === "unconfirmed" || phase === "revoked" ? WarningCircle : ShieldCheck;
  return (
    <section className="screen application-screen">
      <button className="back-button" onClick={() => navigate({ view: "materials" })}><ArrowLeft size={18} aria-hidden="true" /> Back to materials</button>
      <PageHeader eyebrow="Application review · Step 2 of 2" title="Review before anything is sent." description="Check the employer, job, files, and answers below. This is a local demo, and no employer action will occur." />
      <div className={`approval-status approval-status-${statusTone}`} role="status" aria-live="polite" tabIndex={-1} ref={statusRef}><StatusIcon size={24} weight={statusTone === "positive" || statusTone === "warning" ? "fill" : "regular"} aria-hidden="true" /><div><span>Application status</span><strong>{offline ? "Offline; approval unavailable" : statusLabels[phase]}</strong></div></div>
      <section className="package-section">
        <div className="section-heading"><div><span className="eyebrow">Files and answers</span><h2>Check what would be used</h2></div><span className="status-pill status-positive">Checked against the sample profile</span></div>
        <article className="package-row"><FileText size={21} aria-hidden="true" /><div><strong>Resume.pdf</strong><span>Sample file ready to preview</span></div><button className="text-button" aria-label="Preview synthetic resume" onClick={() => openPreview("resume")}>Preview</button></article>
        <article className="package-row"><FileText size={21} aria-hidden="true" /><div><strong>Cover-letter.pdf</strong><span>Sample file ready to preview</span></div><button className="text-button" aria-label="Preview synthetic cover letter" onClick={() => openPreview("cover-letter")}>Preview</button></article>
        <article className="package-row"><ListChecks size={21} aria-hidden="true" /><div><strong>Application answers</strong><span>{approvalState.payload.answerCount} answers ready to review</span></div><button className="text-button" aria-label="Review synthetic application answers" onClick={() => openPreview("answers")}>Review</button></article>
      </section>
      <section className="destination-section">
        <span className="eyebrow">Where this application would go</span><h2>Cedarfield employer application</h2><p>{approvalState.payload.destination}</p><div className="operational-banner banner-neutral"><Info size={20} aria-hidden="true" /><div><strong>Safe demo address</strong><p>This address cannot open a real employer site.</p></div></div>
      </section>
      <section className="approval-explanation"><h2>What your approval covers</h2><ul><li><Check size={18} weight="bold" aria-hidden="true" />Use only the files and answers shown here</li><li><Check size={18} weight="bold" aria-hidden="true" />Open only the employer application shown here</li><li><Check size={18} weight="bold" aria-hidden="true" />Mark it sent only after you see confirmation</li><li><X size={18} weight="bold" aria-hidden="true" />Do not send email, outreach, or another application</li></ul></section>
      <details className="review-detail application-technical-record"><summary>Technical record</summary><dl><div><dt>Version</dt><dd>{approvalState.payload.version}</dd></div><div><dt>File check</dt><dd>{approvalState.payload.fingerprint}</dd></div><div><dt>Destination</dt><dd>{approvalState.payload.destination}</dd></div></dl></details>
      {phase === "approved" && !offline ? <section className="approval-next-step"><span className="eyebrow">Approved, not handed off</span><h2>Choose the next simulated state</h2><p>Production would open only the exact destination and payload. This prototype changes local state only.</p><div className="inline-actions"><button className="primary-button" onClick={() => setApprovalState(simulateHandoff(approvalState))}>Simulate safe handoff</button><button className="secondary-button" onClick={() => setApprovalState(simulatePackageChange(approvalState))}>Change package and revoke approval</button></div></section> : null}
      {phase === "handoff" && !offline ? <section className="approval-next-step"><span className="eyebrow">Handoff returned</span><h2>Was a visible confirmation observed?</h2><p>The product cannot infer success from a click, redirect, or missing error.</p><div className="inline-actions"><button className="primary-button" onClick={() => setApprovalState(recordVisibleConfirmation(approvalState, new Date().toISOString()))}>Simulate visible confirmation</button><button className="secondary-button" onClick={() => setApprovalState(recordUnconfirmed(approvalState))}>Return without confirmation</button></div></section> : null}
      {phase === "verified" && approvalState.receipt ? <section className="approval-next-step receipt-panel"><span className="eyebrow">Verified demo receipt</span><h2>Confirmation, payload, and destination agree</h2><dl><div><dt>Receipt</dt><dd>{approvalState.receipt.id}</dd></div><div><dt>Approval</dt><dd>{approvalState.receipt.approvalId}</dd></div><div><dt>Package</dt><dd>Version {approvalState.payload.version} · {approvalState.payload.fingerprint}</dd></div><div><dt>Destination</dt><dd>{approvalState.receipt.destination}</dd></div><div><dt>Confirmation evidence</dt><dd>Visible demo confirmation</dd></div><div><dt>Recorded</dt><dd>{approvalState.receipt.confirmedAt}</dd></div></dl><p>No live employer action occurred. In production, only this payload-bound state could update the pursuit to Submitted.</p></section> : null}
      {phase === "unconfirmed" ? <section className="approval-next-step"><span className="eyebrow">Needs review</span><h2>No submission is recorded</h2><p>The result remains unconfirmed until a visible receipt or another approved recovery path is reviewed.</p><button className="secondary-button" onClick={() => setApprovalState(returnToApprovedPayload(approvalState))}>Return to approved payload</button></section> : null}
      {phase === "revoked" ? <section className="approval-next-step"><span className="eyebrow">Approval invalidated</span><h2>Package version {approvalState.payload.version} requires a new exact approval</h2><p>The fingerprint is now {approvalState.payload.fingerprint}. The previous authorization remains in history but cannot apply to this changed payload.</p></section> : null}
      <button className={`${phase === "unapproved" || phase === "revoked" ? "primary-button" : "secondary-button"} application-review-button`} disabled={offline} onClick={openApproval}>{offline ? "Exact approval unavailable offline" : phase === "unapproved" || phase === "revoked" ? "Review exact approval" : "Inspect exact approval"} {!offline ? <CaretRight size={19} aria-hidden="true" /> : null}</button>
      <section className="application-plan-next"><div><span className="eyebrow">Want ongoing help?</span><h2>Keep reviewing jobs and watch for better ones.</h2><p>Plans are separate from this application approval. No payment is connected in the prototype.</p></div><button className="secondary-button" onClick={onPlans}>See plan options</button></section>
    </section>
  );
}

function AppearanceScreen({
  theme,
  setTheme,
  selectedPlan,
  localReviewCount,
  resetLocalData,
  onPlans,
  onCancelPlan,
}: {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  selectedPlan: PlanId;
  localReviewCount: number;
  resetLocalData: () => void;
  onPlans: () => void;
  onCancelPlan: () => void;
}) {
  const plan = PLAN_DETAILS[selectedPlan];
  const [notifications, setNotifications] = useState<NotificationPreferences>(storedNotificationPreferences);
  useEffect(() => {
    window.localStorage.setItem("my-way-ahead-notifications", JSON.stringify(notifications));
  }, [notifications]);
  const updateNotification = (key: keyof NotificationPreferences, value: boolean) => setNotifications((current) => ({ ...current, [key]: value }));
  return (
    <section className="screen appearance-screen">
      <PageHeader eyebrow="Settings" title="Settings" description="Manage appearance, privacy, notifications, and your account." />
      <fieldset className="appearance-options"><legend>Appearance</legend>{[
        ["system", "Use device setting", Desktop, "Match your phone or computer"],
        ["light", "Light", Sun, "Use a light background"],
        ["dark", "Dark", Moon, "Use a dark background"],
      ].map(([value, label, Icon, helper]) => { const ThemeIcon = Icon as typeof Desktop; return <label key={String(value)} className={theme === value ? "selected" : ""}><input type="radio" name="theme" value={String(value)} checked={theme === value} onChange={() => setTheme(value as ThemeChoice)} /><ThemeIcon size={22} aria-hidden="true" /><span><strong>{String(label)}</strong><small>{String(helper)}</small></span></label>; })}</fieldset>
      <section className="plain-section settings-section"><div className="section-heading"><div><span className="eyebrow">Notifications</span><h2>Choose what you want to hear about</h2></div></div><div className="toggle-list"><label><span><strong>Job watch alerts</strong><small>Jobs that meet the standards you set</small></span><input className="switch" type="checkbox" checked={notifications.radar} onChange={(event) => updateNotification("radar", event.target.checked)} /></label><label><span><strong>Application reminders</strong><small>Open items and follow-up dates for active jobs</small></span><input className="switch" type="checkbox" checked={notifications.applications} onChange={(event) => updateNotification("applications", event.target.checked)} /></label><label><span><strong>Product updates</strong><small>Occasional news about Way Ahead</small></span><input className="switch" type="checkbox" checked={notifications.product} onChange={(event) => updateNotification("product", event.target.checked)} /></label></div></section>
      <section className="plain-section privacy-settings">
        <div className="section-heading"><div><span className="eyebrow">Privacy and data</span><h2>Your choices stay on this device in the prototype</h2></div><span className="status-pill status-positive"><ShieldCheck size={15} weight="fill" aria-hidden="true" /> Local only</span></div>
        <p>This build does not call an AI model, job board, employer, analytics service, or payment provider. Your theme, job watch preferences, decisions, and {localReviewCount} review {localReviewCount === 1 ? "draft" : "drafts"} stay in this browser.</p>
        <details className="demo-disclosure"><summary>How Way Ahead uses AI</summary><p>AI will help read job postings, compare jobs with your goals, and prepare drafts. Important facts stay linked to their source, and missing information remains visible.</p></details>
        <button className="secondary-button" type="button" onClick={resetLocalData}>Reset demo data</button>
      </section>
      <section className="plain-section settings-section"><div className="section-heading"><div><span className="eyebrow">Plan and billing</span><h2>{plan.name}</h2></div><span className="status-pill">{plan.price} · {plan.cadence}</span></div><p>{plan.summary} This is a saved test selection; no payment method is connected.</p><div className="inline-actions"><button className="secondary-button" type="button" onClick={onPlans}>See plan options</button>{selectedPlan.includes("watch") ? <button className="text-button" type="button" onClick={onCancelPlan}>Cancel test renewal</button> : null}</div></section>
    </section>
  );
}

function sourceSpanLabel(requirement: Requirement) {
  const span = requirement.employerSourceSpan;
  if (span.spanState === "unavailable") return "Exact span unavailable";
  if (span.startLine === null) return span.spanState === "exact" ? "Exact source text" : "Derived source text";
  return `${span.spanState === "exact" ? "Exact" : "Derived"} source lines ${span.startLine}${span.endLine && span.endLine !== span.startLine ? `–${span.endLine}` : ""}`;
}

function evidenceTierLabel(job: JobFixture) {
  return {
    extraction_gold: "Extraction benchmark",
    adjudication_gold: "Adjudicated derived evidence",
    negative_control: "Negative control",
    provisional: "Provisional evidence",
  }[job.extraction.evidenceTier];
}

function SourceSheet({ job, requirement, close }: { job: JobFixture; requirement?: Requirement; close: () => void }) {
  return <Sheet title={requirement ? requirement.text : `${job.company} source interpretation`} eyebrow="Source and provenance" onClose={close} wide><div className="source-sheet"><div className="source-authority"><ShieldCheck size={25} weight="fill" aria-hidden="true" /><div><strong>{evidenceTierLabel(job)}</strong><p>{job.extraction.source} · {job.extraction.captured}</p></div></div>{requirement ? <><dl><div><dt>{requirement.employerSourceKind === "application" ? "Application-derived gate" : "Job-description interpretation"}</dt><dd>{requirement.text}</dd></div><div><dt>Exact employer text</dt><dd>{requirement.exactEmployerText || "Unavailable in the frozen local evidence; this interpretation remains visibly derived."}</dd></div><div><dt>Employer source span</dt><dd>{sourceSpanLabel(requirement)} · {requirement.employerSourceSpan.sourceRef}</dd></div><div><dt>Priority and modality</dt><dd>{requirement.priority} · {requirement.modality}</dd></div><div><dt>Interpretation state</dt><dd>{requirement.interpretationState.replaceAll("_", " ")}</dd></div><div><dt>Candidate evidence state</dt><dd>{stateLabel(requirement.state)} · {requirement.proofState.replaceAll("_", " ")}</dd></div><div><dt>Candidate proof</dt><dd>{requirement.proof}</dd></div><div><dt>Candidate source</dt><dd>{requirement.source}{requirement.sourceRef ? ` · ${requirement.sourceRef}` : ""}</dd></div></dl><div className="separation-note"><Info size={20} aria-hidden="true" /><p>The employer statement defines the requirement. The candidate source defines the evidence. Neither can substitute for the other.</p></div></> : <><dl><div><dt>Evidence tier</dt><dd>{evidenceTierLabel(job)}</dd></div><div><dt>Capture completeness</dt><dd>{job.extraction.captureCompleteness}</dd></div><div><dt>Extraction coverage</dt><dd>{job.extraction.coverage}</dd></div><div><dt>Source reference</dt><dd>{job.extraction.sourceRef}</dd></div><div><dt>Snapshot hash</dt><dd>{job.extraction.snapshotHash || "Not available; no immutable raw snapshot is claimed."}</dd></div><div><dt>Interpretation status</dt><dd>{job.extraction.interpretation}</dd></div><div><dt>Current source status</dt><dd>{job.sourceStatus}</dd></div></dl><div className="flag-list large">{job.extraction.flags.map((flag) => <span key={flag}>{flag}</span>)}</div></>}</div></Sheet>;
}

function CorrectionSheet({ job, requirement, existing, close, save }: { job: JobFixture; requirement: Requirement; existing?: CorrectionRecord; close: () => void; save: (record: LocalReviewRecord, message: string) => void }) {
  const [kind, setKind] = useState<CorrectionRecord["kind"]>(existing?.kind ?? "candidate");
  const [note, setNote] = useState(existing?.note ?? "");
  return <Sheet title="Report incorrect evidence" eyebrow={`${job.company} · ${requirement.text}`} onClose={close}><form className="correction-form" onSubmit={(event) => { event.preventDefault(); const now = new Date().toISOString(); save({ id: `correction-${job.id}-${requirement.id}`, type: "correction", jobId: job.id, requirementId: requirement.id, kind, note: note.trim(), updatedAt: now, syncState: "local_only" }, `Correction saved on this device for ${requirement.text}. The affected proof and dependent assessment are now stale; preparation is blocked until review.`); }}><fieldset><legend>What is wrong?</legend><label><input type="radio" name="correction-kind" value="candidate" checked={kind === "candidate"} onChange={(event) => setKind(event.target.value as CorrectionRecord["kind"])} /><span><strong>My evidence is wrong or incomplete</strong><small>Correct a candidate fact without changing the employer requirement.</small></span></label><label><input type="radio" name="correction-kind" value="requirement" checked={kind === "requirement"} onChange={(event) => setKind(event.target.value as CorrectionRecord["kind"])} /><span><strong>The requirement was interpreted incorrectly</strong><small>Correct required, preferred, bonus, alternatives, or scope.</small></span></label><label><input type="radio" name="correction-kind" value="source" checked={kind === "source"} onChange={(event) => setKind(event.target.value as CorrectionRecord["kind"])} /><span><strong>The source is wrong or outdated</strong><small>Flag a canonical, date, pay, title, or availability conflict.</small></span></label></fieldset><label className="text-area-label"><span>What should be reviewed?</span><textarea required value={note} onChange={(event) => setNote(event.target.value)} placeholder="Describe the correction without inventing a claim." /></label>{existing ? <div className="separation-note"><CheckCircle size={20} weight="fill" aria-hidden="true" /><p>A local draft from {new Date(existing.updatedAt).toLocaleString()} was restored for editing.</p></div> : null}<div className="impact-preview"><span className="eyebrow">After saving</span><h3>Dependent analysis becomes stale</h3><p>This prototype marks the affected requirement, score, fixture recommendation, and preparation state as pending review. It preserves your note and decision but does not invent replacement evidence or recalculate a score.</p></div><button className="primary-button" type="submit">Save correction for review</button></form></Sheet>;
}

function ProofSheet({ job, existing, close, save }: { job: JobFixture; existing?: ProofRecord; close: () => void; save: (record: LocalReviewRecord, message: string) => void }) {
  const gaps = getProofRecoveryRequirements(job);
  const questions = job.applicationQuestions.filter((question) => question.required && question.answerState !== "supported");
  const [answers, setAnswers] = useState<Record<string, string>>(existing?.answers ?? {});
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const requiredIds = [...gaps.map((gap) => gap.id), ...questions.map((question) => question.id)];
  const clearError = () => setError("");
  return <Sheet title={job.workflowAction} eyebrow={`${job.company} · proof review`} onClose={close} wide><form className="proof-form" noValidate onSubmit={(event) => { event.preventDefault(); const unanswered = requiredIds.filter((id) => !answers[id]); if (unanswered.length) { setError(`Choose an explicit response for all ${requiredIds.length} review items before saving.`); window.requestAnimationFrame(() => { errorRef.current?.focus(); errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }); }); return; } const now = new Date().toISOString(); save({ id: `proof-${job.id}`, type: "proof", jobId: job.id, answers, updatedAt: now, syncState: "local_only" }, `Review answers saved on this device for ${job.company}. Unsupported items remain unproven, and this prototype leaves the recommendation unchanged.`); }}><div className="separation-note"><ShieldCheck size={20} weight="fill" aria-hidden="true" /><p>Prototype entries are local and never become Proven automatically. Verification requires an approved source and a separate adjudication step.</p></div>{existing ? <div className="separation-note"><CheckCircle size={20} weight="fill" aria-hidden="true" /><p>A local review from {new Date(existing.updatedAt).toLocaleString()} was restored for editing. Saved answers remain unverified.</p></div> : null}{error ? <div id="proof-review-error" className="operational-banner banner-danger" role="alert" tabIndex={-1} ref={errorRef}><WarningCircle size={20} weight="fill" aria-hidden="true" /><div><strong>Review incomplete</strong><p>{error}</p></div></div> : null}{gaps.map((gap) => <fieldset key={gap.id} aria-describedby={error ? "proof-review-error" : undefined}><legend>{gap.text}</legend><p>{gap.rationale}</p><label><input type="radio" name={`gap-${gap.id}`} checked={answers[gap.id] === "evidence"} onChange={() => { setAnswers({ ...answers, [gap.id]: "evidence" }); clearError(); }} />I have a source to review</label><label><input type="radio" name={`gap-${gap.id}`} checked={answers[gap.id] === "none"} onChange={() => { setAnswers({ ...answers, [gap.id]: "none" }); clearError(); }} />I do not have this evidence</label><label><input type="radio" name={`gap-${gap.id}`} checked={answers[gap.id] === "wrong"} onChange={() => { setAnswers({ ...answers, [gap.id]: "wrong" }); clearError(); }} />The requirement was read incorrectly</label></fieldset>)}{questions.map((question) => <fieldset key={question.id} aria-describedby={error ? "proof-review-error" : undefined}><legend>{question.displayPrompt}</legend><p>This is a separate application-form gate. It is not an employer requirement and no answer is inferred.</p><label><input type="radio" name={`question-${question.id}`} checked={answers[question.id] === "supported"} onChange={() => { setAnswers({ ...answers, [question.id]: "supported" }); clearError(); }} />I have an approved answer and source</label><label><input type="radio" name={`question-${question.id}`} checked={answers[question.id] === "no"} onChange={() => { setAnswers({ ...answers, [question.id]: "no" }); clearError(); }} />The truthful answer is no or none</label><label><input type="radio" name={`question-${question.id}`} checked={answers[question.id] === "review"} onChange={() => { setAnswers({ ...answers, [question.id]: "review" }); clearError(); }} />The exact prompt or answer needs review</label></fieldset>)}{!gaps.length && !questions.length ? <div className="empty-inline"><CheckCircle size={20} weight="fill" aria-hidden="true" /><p>No unresolved proof or application-question items are present in this fixture. Return to the source or gate-specific recovery surface.</p></div> : null}{requiredIds.length ? <button className="primary-button" type="submit">Save answers for review</button> : null}</form></Sheet>;
}

function AssessmentSheet({ job, close, correctionPending }: { job: JobFixture; close: () => void; correctionPending: boolean }) {
  const gates = getBlockingGates(job);
  const scoreLabel = correctionPending ? "Suppressed · correction pending" : job.score === null ? "Suppressed" : job.scoreStatus === "legacy_case_input" ? `Legacy ${job.score}/100` : `${job.score}/100`;
  const rangeLabel = correctionPending ? "Not current" : job.scoreRange ? `${job.scoreRange.lower}–${job.scoreRange.upper}` : "Not adjudicated";
  return <Sheet title="Assessment details" eyebrow="Evidence-grounded score contract" onClose={close} wide><div className="assessment-sheet"><div className="assessment-hero"><div><span>Assessment status</span><strong>{scoreLabel}</strong></div><div><span>Uncertainty range</span><strong>{rangeLabel}</strong></div><div><span>Coverage</span><strong>{correctionPending ? "Dependent coverage stale" : job.scoreCoverage}</strong></div></div>{correctionPending ? <div className="operational-banner banner-warning"><WarningCircle size={20} weight="fill" aria-hidden="true" /><div><strong>Assessment withheld pending correction review</strong><p>The prior value remains in provenance only. It cannot support ranking, recommendation, or preparation until the corrected requirement is re-adjudicated.</p></div></div> : <div className="operational-banner banner-neutral"><Info size={20} aria-hidden="true" /><div><strong>Gates come first</strong><p>A high score cannot overrule inactive status, source conflict, duplicate state, hard logistics, or unsupported mandatory proof.</p></div></div>}{!correctionPending && job.fitDimensions.length ? <div className="dimension-list">{job.fitDimensions.map((dimension) => <div key={dimension.id}><span>{dimension.label}<small>{dimension.weight}% weight · {dimension.rationale}</small></span><div className="progress-track"><span style={{ width: `${dimension.score}%` }} /></div><strong>{dimension.score}</strong></div>)}</div> : <div className="assessment-suppressed"><WarningCircle size={22} weight="fill" aria-hidden="true" /><div><strong>Dimension scores intentionally withheld</strong><p>{correctionPending ? "A pending correction invalidates the dependent assessment until re-adjudication." : job.fitDimensionStatus === "suppressed_by_gate" ? "A hard gate suppresses this score." : "The displayed top-line value came from a legacy decision input and has not been decomposed through the current nine-dimension policy."} No factor values are reverse-engineered from the total.</p></div></div>}<dl className="assessment-provenance"><div><dt>Score source</dt><dd>{correctionPending ? `Stale prior source: ${job.scoreSource}` : job.scoreSource}</dd></div><div><dt>Blocking gates</dt><dd>{correctionPending ? `Correction review${gates.length ? ` · ${gates.map((gate) => gateKindLabel(gate)).join(" · ")}` : ""}` : gates.length ? gates.map((gate) => gateKindLabel(gate)).join(" · ") : "None"}</dd></div></dl><p className="fine-print">The score supports ranking and audit only while its evidence is current. The mobile decision is led by recommendation, strongest reason, main risk, baseline difference, and next action.</p></div></Sheet>;
}

function PackagePreviewSheet({ asset, payload, close }: { asset: "resume" | "cover-letter" | "answers"; payload: DemoPayload; close: () => void }) {
  const content = {
    resume: {
      eyebrow: "Synthetic file preview",
      title: "Resume.pdf",
      summary: `A two-page demonstration resume tied to evidence fingerprint ${payload.fingerprint}.`,
      items: ["Target title: Senior Growth Operations", "Claims checked against the synthetic evidence record", "No private candidate data or real employer destination"],
    },
    "cover-letter": {
      eyebrow: "Synthetic file preview",
      title: "Cover-letter.pdf",
      summary: `A one-page demonstration letter using evidence fingerprint ${payload.fingerprint}.`,
      items: ["Employer and mandate are explicitly scoped to Cedarfield", "No invented metrics or unsupported ownership language", "Package changes would invalidate approval"],
    },
    answers: {
      eyebrow: "Synthetic answer review",
      title: "Application answers",
      summary: `${payload.answerCount} demonstration answers are present; none are connected to a live form.`,
      items: ["Work authorization: supported in the synthetic profile", "Compensation answer: within the synthetic career standard", "Voluntary fields remain visibly separate"],
    },
  }[asset];
  return <Sheet title={content.title} eyebrow={content.eyebrow} onClose={close}><div className="package-preview"><div className="source-authority"><ShieldCheck size={25} weight="fill" aria-hidden="true" /><div><strong>Safe demonstration content</strong><p>{content.summary}</p></div></div><ul className="check-list">{content.items.map((item) => <li key={item}><CheckCircle size={19} weight="fill" aria-hidden="true" />{item}</li>)}</ul><div className="separation-note"><Info size={20} aria-hidden="true" /><p>This is a product-state preview, not a downloadable file and not authorization to use the package externally.</p></div></div></Sheet>;
}

function ApprovalSheet({ state, close, onApprove }: { state: ApprovalState; close: () => void; onApprove: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const approved = isApprovalCurrent(state) && state.phase !== "unapproved" && state.phase !== "revoked";
  return <Sheet title="Approve one exact demo action" eyebrow="Synthetic fixture · no network action" onClose={close}><div className="approval-sheet"><dl><div><dt>Employer</dt><dd>Cedarfield · synthetic</dd></div><div><dt>Destination</dt><dd>{state.payload.destination}</dd></div><div><dt>Package</dt><dd>Version {state.payload.version} · fingerprint {state.payload.fingerprint} · {state.payload.answerCount} answers</dd></div><div><dt>Permitted action</dt><dd>Simulate opening this exact destination with this exact package</dd></div><div><dt>Not permitted</dt><dd>Email, outreach, another employer, changed files, or an inferred submission</dd></div></dl>{state.authorization && !isApprovalCurrent(state) ? <div className="operational-banner banner-warning"><WarningCircle size={20} weight="fill" aria-hidden="true" /><div><strong>Previous approval does not match this payload</strong><p>{state.authorization.id} authorized a different version or fingerprint and cannot be reused.</p></div></div> : null}<label className="approval-checkbox"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I understand that a production approval would apply only to the exact payload and destination shown above.</span></label><button className="primary-button" disabled={!confirmed || approved} onClick={onApprove}>{approved ? <><CheckCircle size={20} weight="fill" aria-hidden="true" /> Current payload approved</> : <>Simulate exact approval <ArrowSquareOut size={19} aria-hidden="true" /></>}</button><p className="fine-print">This prototype never opens an employer site, uploads a file, sends a message, or submits an application.</p></div></Sheet>;
}

export default function MyWayAheadPrototype() {
  const [route, setRoute] = useState<Route>({ view: "home" });
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [capturedUrl, setCapturedUrl] = useState("");
  const [integrityPhase, setIntegrityPhase] = useState<IntegrityPhase>("idle");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(storedPlan);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId>(storedPlan);
  const [accountReady, setAccountReady] = useState(false);
  const [pendingAfterAuth, setPendingAfterAuth] = useState<Route | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<DemoProfileId | null>(null);
  const [baselinePreferences, setBaselinePreferences] = useState<BaselinePreferences>(defaultBaselinePreferences);
  const [primaryLane, setPrimaryLane] = useState<CareerLaneId | null>(null);
  const [includedLanes, setIncludedLanes] = useState<CareerLaneId[]>([]);
  const [scenario, setScenario] = useState<Scenario>(requestedQaScenario);
  const [radar, setRadar] = useState(storedRadar);
  const [savingRadar, setSavingRadar] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [decisions, setDecisions] = useState<Record<string, string>>(storedDecisions);
  const [reviewRecords, setReviewRecords] = useState<LocalReviewRecord[]>(storedReviewRecords);
  const [storageReady, setStorageReady] = useState(false);
  const [announcement, setAnnouncement] = useState("Prototype loaded.");
  const [toast, setToast] = useState("");
  const [approvalState, setApprovalState] = useState<ApprovalState>(initialApprovalState);
  const [reviewedMaterials, setReviewedMaterials] = useState<Array<"resume" | "cover-letter" | "answers">>([]);
  const mainRef = useRef<HTMLElement>(null);
  const [reviewOrigin, setReviewOrigin] = useState<Route>({ view: "opportunities" });
  const scrollPositions = useRef<Record<string, number>>({});
  const reviewReturnFocusId = useRef<string | null>(null);
  const correctedJobIds = new Set(reviewRecords.filter((record) => record.type === "correction").map((record) => record.jobId));

  useEffect(() => {
    const sync = () => {
      const next = parseRoute();
      setRoute(next);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const main = mainRef.current;
        if (!main) return;
        main.scrollTo({ top: scrollPositions.current[routeHash(next)] || 0, behavior: "auto" });
        const returnTarget = next.view !== "review" && reviewReturnFocusId.current
          ? document.getElementById(reviewReturnFocusId.current)
          : null;
        if (returnTarget instanceof HTMLElement) returnTarget.focus({ preventScroll: true });
        else main.focus({ preventScroll: true });
        if (next.view !== "review") reviewReturnFocusId.current = null;
      }));
    };
    if (!window.location.hash) window.location.replace(`#${HASHES.home}`);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const labels: Record<Route["view"], string> = {
      home: "Career Opportunity Decisions",
      pricing: "Pricing",
      guided: "Human Support Options",
      integrity: "Opportunity Integrity Preview",
      auth: "Local Account Simulation",
      mode: "Choose Your Goal",
      import: "Add Your Experience",
      lanes: "Choose Career Paths",
      strategy: "Your Job-Search Plan",
      plans: "Choose a Plan",
      checkout: "Review Your Plan",
      receipt: "Plan Confirmation",
      baseline: "Your Job Priorities",
      "radar-setup": "Job Watch Settings",
      radar: "Today",
      opportunities: "Find Jobs",
      review: "Job Review",
      pursuits: "Pursuits",
      materials: "Application Materials",
      application: "Application Review",
      appearance: "Settings",
    };
    document.title = `${labels[route.view]} · Way Ahead Prototype`;
  }, [route]);

  useEffect(() => {
    const saved = window.localStorage.getItem("my-way-ahead-theme") as ThemeChoice | null;
    if (!saved || !["system", "light", "dark"].includes(saved)) return;
    const frame = window.requestAnimationFrame(() => setThemeState(saved));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const onboarding = storedOnboardingSession();
      setRadar(storedRadar());
      setDecisions(storedDecisions());
      setReviewRecords(storedReviewRecords());
      setAccountReady(onboarding.accountReady);
      setSearchMode(onboarding.searchMode);
      setSelectedProfile(onboarding.selectedProfile);
      setBaselinePreferences(onboarding.baselinePreferences);
      setPrimaryLane(onboarding.primaryLane);
      setIncludedLanes(onboarding.includedLanes);
      window.localStorage.removeItem("my-way-ahead-prototype-scenario");
      setScenario(requestedQaScenario());
      setStorageReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (storageReady) window.localStorage.setItem("my-way-ahead-radar", JSON.stringify(radar));
  }, [radar, storageReady]);

  useEffect(() => {
    if (storageReady) window.localStorage.setItem("my-way-ahead-decisions", JSON.stringify(decisions));
  }, [decisions, storageReady]);

  useEffect(() => {
    if (storageReady) window.localStorage.setItem("my-way-ahead-review-records", JSON.stringify(reviewRecords));
  }, [reviewRecords, storageReady]);

  useEffect(() => {
    if (storageReady) window.localStorage.setItem("my-way-ahead-selected-plan", selectedPlan);
  }, [selectedPlan, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    const onboarding: OnboardingSession = {
      accountReady,
      searchMode,
      selectedProfile,
      baselinePreferences,
      primaryLane,
      includedLanes,
    };
    window.localStorage.setItem("my-way-ahead-onboarding", JSON.stringify(onboarding));
  }, [accountReady, baselinePreferences, includedLanes, primaryLane, searchMode, selectedProfile, storageReady]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.dataset.themeChoice = theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (next: Route) => {
    const currentRoute = parseRoute();
    if (mainRef.current) scrollPositions.current[routeHash(currentRoute)] = mainRef.current.scrollTop;
    if (next.view === "review" && currentRoute.view !== "review") {
      const origin = currentRoute.view === "radar" || currentRoute.view === "opportunities" || currentRoute.view === "pursuits" || currentRoute.view === "strategy" ? currentRoute : { view: "opportunities" as const };
      setReviewOrigin(origin);
      reviewReturnFocusId.current = currentRoute.view === "radar"
        ? `brief-review-${next.jobId}`
        : currentRoute.view === "pursuits"
          ? `pursuit-review-${next.jobId}`
          : `opportunity-review-${next.jobId}`;
    }
    const nextHash = routeHash(next);
    if (window.location.hash === `#${nextHash}`) setRoute(next);
    else window.location.hash = nextHash;
  };

  const setTheme = (next: ThemeChoice) => {
    setThemeState(next);
    window.localStorage.setItem("my-way-ahead-theme", next);
    const message = `Theme changed to ${next}.`;
    setAnnouncement(message);
    setToast(message);
  };

  const saveRadar = (next: typeof DEFAULT_RADAR) => {
    setRadar(next);
    setSavingRadar(true);
    setAnnouncement("Job watch settings are being saved.");
    window.setTimeout(() => {
      setSavingRadar(false);
      const message = scenario === "offline"
        ? "Job watch preferences saved on this device. The source run remains queued until the connection returns."
        : scenario === "capacity"
          ? "Job watch preferences saved. Analysis remains in the quality-safe queue."
          : scenario === "budget"
            ? "Job watch preferences saved. Analysis remains in the budget-safe queue."
            : scenario === "validation"
              ? "Job watch preferences saved. The invalid analysis remains suppressed."
          : scenario === "error"
            ? "Job watch preferences saved. The source error still blocks a new brief."
            : "Job watch saved. The selected prototype state is ready to review.";
      setToast(message);
      setAnnouncement(message);
      navigate({ view: "radar" });
    }, 650);
  };

  const saveReviewRecord = (record: LocalReviewRecord, message: string) => {
    const storedRecord = scenario === "offline" ? { ...record, syncState: "pending_sync" as const } : record;
    setReviewRecords((current) => upsertReviewRecord(current, storedRecord));
    setSheet(null);
    const finalMessage = scenario === "offline" ? `${message} It remains pending on this device until sync returns.` : message;
    setToast(finalMessage);
    setAnnouncement(finalMessage);
  };

  const chooseDecision = (job: JobFixture, value: string) => {
    setDecisions({ ...decisions, [job.id]: value });
    const message = scenario === "offline"
      ? `${value} decision stored on this device for ${job.company}; sync is pending. No external action was taken.`
      : value === "Pursue"
        ? `Pursue choice saved for ${job.company}. Open proof questions still block preparation, and nothing was submitted or sent.`
        : `${value} decision saved for ${job.company}. No external action was taken.`;
    setToast(message);
    setAnnouncement(message);
  };

  const resetLocalData = () => {
    setRadar(DEFAULT_RADAR);
    setDecisions({});
    setReviewRecords([]);
    setScenario("material");
    setApprovalState(initialApprovalState());
    setReviewedMaterials([]);
    setCapturedUrl("");
    setIntegrityPhase("idle");
    setSelectedPlan("free");
    setCheckoutPlan("free");
    setAccountReady(false);
    setPendingAfterAuth(null);
    setSearchMode(null);
    setSelectedProfile(null);
    setBaselinePreferences(defaultBaselinePreferences());
    setPrimaryLane(null);
    setIncludedLanes([]);
    window.localStorage.removeItem("my-way-ahead-radar");
    window.localStorage.removeItem("my-way-ahead-decisions");
    window.localStorage.removeItem("my-way-ahead-review-records");
    window.localStorage.removeItem("my-way-ahead-prototype-scenario");
    window.localStorage.removeItem("my-way-ahead-selected-plan");
    window.localStorage.removeItem("my-way-ahead-onboarding");
    const message = "Local profile setup, job watch preferences, decisions, review drafts, and demo approval state were reset. Theme was preserved.";
    setToast(message);
    setAnnouncement(message);
  };

  const job = route.view === "review" ? JOB_BY_ID[route.jobId] || null : null;
  const usesFunnelChrome = ["home", "pricing", "guided", "integrity", "auth", "mode", "import", "baseline", "lanes", "strategy", "plans", "checkout", "receipt"].includes(route.view);
  const hasCompletePlan = Boolean(accountReady && searchMode && selectedProfile && primaryLane && hasCompleteBaseline(baselinePreferences));
  const canUseSampleWorkspace = hasCompletePlan && selectedProfile === "established";
  const sampleWorkspaceRoute = ["radar", "opportunities", "review", "pursuits", "materials", "application"].includes(route.view);

  const beginIntegrityPreview = (source = capturedUrl) => {
    if (!source) return navigate({ view: "auth" });
    setCapturedUrl(source);
    setIntegrityPhase("loading");
    navigate({ view: "integrity" });
    window.setTimeout(() => {
      setIntegrityPhase("ready");
      setAnnouncement("Synthetic Integrity Preview is ready. Unknown source facts remain unresolved.");
    }, 650);
  };

  const nextSetupRoute = (source = capturedUrl): Route => {
    if (!searchMode) return { view: "mode" };
    if (!selectedProfile) return { view: "import" };
    if (!hasCompleteBaseline(baselinePreferences)) return { view: "baseline" };
    if (!primaryLane) return { view: "lanes" };
    if (source === "sample:going" && selectedProfile === "established") return { view: "review", jobId: "going" };
    return { view: "strategy" };
  };

  const continueFromIntegrity = () => {
    const sampleSource = "sample:going";
    if (capturedUrl !== sampleSource) {
      setCapturedUrl(sampleSource);
      setAnnouncement("The unprocessed input was replaced with the clearly labeled Going sample job for this walkthrough.");
    }
    const next = nextSetupRoute(sampleSource);
    if (accountReady) navigate(next);
    else {
      setPendingAfterAuth(next);
      navigate({ view: "auth" });
    }
  };

  const choosePublicPlan = (plan: PlanId) => {
    setCheckoutPlan(plan);
    if (accountReady) navigate({ view: "checkout" });
    else {
      setPendingAfterAuth({ view: "checkout" });
      navigate({ view: "auth" });
    }
  };

  return (
    <div className="prototype-shell mobile-prototype way-ahead-v3">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); mainRef.current?.scrollTo({ top: 0 }); }}>Skip to main content</a>
      {usesFunnelChrome ? <PublicHeader signedIn={accountReady} active={primarySection(route)} onHome={() => navigate({ view: "home" })} onPricing={() => navigate({ view: "pricing" })} onSignIn={() => navigate(accountReady ? { view: "appearance" } : { view: "auth" })} onToday={() => navigate({ view: "radar" })} onFindJobs={() => navigate({ view: "opportunities" })} onPursuits={() => navigate({ view: "pursuits" })} onProfile={() => navigate({ view: "baseline" })} /> : <><header className="desktop-header" inert={sheet !== null}><TopBrand /><PrimaryNav route={route} navigate={navigate} /><button className="account-button" onClick={() => navigate({ view: "appearance" })}><Gear size={19} aria-hidden="true" /> Settings</button></header><header className="mobile-header" inert={sheet !== null}><TopBrand /><button className="icon-button" onClick={() => navigate({ view: "appearance" })} aria-label="Open settings"><Gear size={21} aria-hidden="true" /></button></header></>}
      <main className="prototype-main" id="main-content" ref={mainRef} tabIndex={-1} inert={sheet !== null}>
        {sampleWorkspaceRoute && canUseSampleWorkspace ? <SampleWorkspaceNotice /> : null}
        {canUseSampleWorkspace && (route.view === "opportunities" || route.view === "review") ? <AnalysisContextBanner scenario={scenario} /> : null}
        {route.view === "home" ? <HomeScreen onReview={beginIntegrityPreview} onExplore={() => { setCapturedUrl(""); setIntegrityPhase("idle"); navigate(accountReady && searchMode && selectedProfile && primaryLane && hasCompleteBaseline(baselinePreferences) ? { view: "radar-setup" } : { view: "mode" }); }} onPricing={() => navigate({ view: "pricing" })} /> : null}
        {route.view === "pricing" ? <PricingScreen onChoose={choosePublicPlan} onStart={() => navigate({ view: "home" })} /> : null}
        {route.view === "guided" ? <GuidedHelpScreen onBack={() => navigate({ view: "pricing" })} onComplete={() => navigate(capturedUrl === "sample:going" ? { view: "review", jobId: "going" } : { view: "home" })} /> : null}
        {route.view === "mode" ? <ModeScreen selected={searchMode} onSelect={(mode) => { setSearchMode(mode); setRadar({ ...radar, cadence: mode === "urgent" ? "daily" : mode === "passive" ? "weekly" : "weekdays" }); }} onBack={() => navigate(capturedUrl ? { view: "integrity" } : { view: "home" })} onContinue={() => navigate(accountReady ? { view: "import" } : { view: "auth" })} /> : null}
        {route.view === "integrity" ? <IntegrityPreviewScreen sourceUrl={capturedUrl} phase={integrityPhase} onBack={() => navigate({ view: "home" })} onContinue={continueFromIntegrity} /> : null}
        {route.view === "auth" ? <AuthenticationScreen onBack={() => { const fromPricing = pendingAfterAuth?.view === "checkout"; setPendingAfterAuth(null); navigate(fromPricing ? { view: "pricing" } : searchMode ? { view: "mode" } : capturedUrl ? { view: "integrity" } : { view: "home" }); }} onContinue={() => { setAccountReady(true); const next = pendingAfterAuth ?? nextSetupRoute(); setPendingAfterAuth(null); navigate(next); }} /> : null}
        {route.view === "import" ? <ExperienceImportScreen selected={selectedProfile} onSelect={(profile) => { setSelectedProfile(profile); setPrimaryLane(null); setIncludedLanes([]); }} onBack={() => navigate({ view: "mode" })} onContinue={() => navigate({ view: "baseline" })} /> : null}
        {route.view === "baseline" ? <BaselineScreen preferences={baselinePreferences} onBack={() => navigate({ view: "import" })} onSave={(next) => { setBaselinePreferences(next); setRadar({ ...radar, payBasis: next.payType === "hourly" ? "hourly" : "salary", minimumBase: Number(next.minimumPay), idealBase: Number(next.targetPay), remote: next.remote, hybrid: next.hybrid, onsite: next.onsite, commute: next.commute, schedule: next.schedule }); navigate({ view: "lanes" }); }} /> : null}
        {route.view === "lanes" && selectedProfile ? <RoleLanesScreen profileId={selectedProfile} primary={primaryLane} included={includedLanes} onBack={() => navigate({ view: "baseline" })} onPrimary={(lane) => { setPrimaryLane(lane); setIncludedLanes((current) => current.includes(lane) ? current : [...current, lane]); }} onToggle={(lane) => setIncludedLanes((current) => current.includes(lane) ? current.filter((item) => item !== lane) : [...current, lane])} onContinue={() => { const lanes = LANE_DEFINITIONS[selectedProfile].filter((lane) => includedLanes.includes(lane.id)).map((lane) => lane.name); setRadar({ ...radar, lanes }); navigate({ view: "strategy" }); }} /> : null}
        {route.view === "lanes" && !selectedProfile ? <ExperienceImportScreen selected={selectedProfile} onSelect={setSelectedProfile} onBack={() => navigate({ view: "mode" })} onContinue={() => navigate({ view: "baseline" })} /> : null}
        {route.view === "strategy" && selectedProfile && primaryLane && searchMode ? <StrategyBriefScreen profileId={selectedProfile} searchMode={searchMode} primary={primaryLane} baselineSummary={formatBaselineSummary(baselinePreferences)} fullReviewConnected={selectedProfile === "established"} onBack={() => navigate({ view: "lanes" })} onEdit={() => navigate({ view: "lanes" })} onChangeProfile={() => navigate({ view: "import" })} onJobs={() => navigate({ view: "opportunities" })} /> : null}
        {route.view === "strategy" && (!selectedProfile || !primaryLane || !searchMode) ? <section className="screen funnel-screen"><div className="funnel-intro"><span className="eyebrow">Continue setup</span><h1>Your plan needs one missing choice.</h1><p>Way Ahead will not guess at your goal, experience, or primary career path. Continue from the first incomplete step and your saved choices will remain intact.</p></div><button className="primary-button funnel-primary" type="button" onClick={() => navigate(nextSetupRoute())}>Continue where I left off</button></section> : null}
        {route.view === "plans" ? <PlanSelectionScreen selected={checkoutPlan} onSelect={setCheckoutPlan} onContinue={() => { if (checkoutPlan === "free") { setSelectedPlan("free"); navigate({ view: "receipt" }); } else navigate({ view: "checkout" }); }} /> : null}
        {route.view === "checkout" && checkoutPlan !== "free" ? <CheckoutScreen plan={checkoutPlan} onBack={() => navigate({ view: "plans" })} onConfirm={() => { setSelectedPlan(checkoutPlan); navigate({ view: "receipt" }); }} /> : null}
        {route.view === "checkout" && checkoutPlan === "free" ? <PlanSelectionScreen selected={checkoutPlan} onSelect={setCheckoutPlan} onContinue={() => { if (checkoutPlan === "free") { setSelectedPlan("free"); navigate({ view: "receipt" }); } else navigate({ view: "checkout" }); }} /> : null}
        {route.view === "receipt" ? <ConfirmationScreen plan={selectedPlan} onContinue={() => navigate(selectedPlan === "free" ? (capturedUrl === "sample:going" ? { view: "review", jobId: "going" } : { view: "opportunities" }) : selectedPlan === "active-search" || selectedPlan === "multi-active" ? { view: "opportunities" } : { view: "radar-setup" })} /> : null}
        {route.view === "radar-setup" && hasCompletePlan ? <RadarSetupScreen radar={radar} laneOptions={selectedProfile ? LANE_DEFINITIONS[selectedProfile].map((lane) => lane.name) : ["Revenue and Growth Operations", "Customer Lifecycle and Retention", "Growth and Revenue Marketing", "Ecommerce and DTC Growth"]} onSave={saveRadar} saving={savingRadar} /> : null}
        {route.view === "radar-setup" && !hasCompletePlan ? <SampleWorkspaceBoundary onContinue={() => navigate(nextSetupRoute())} /> : null}
        {route.view === "radar" && canUseSampleWorkspace ? <RadarBriefScreen scenario={scenario} navigate={navigate} correctedJobIds={correctedJobIds} /> : null}
        {route.view === "radar" && !canUseSampleWorkspace ? <SampleWorkspaceBoundary onContinue={() => navigate(nextSetupRoute())} /> : null}
        {route.view === "opportunities" && canUseSampleWorkspace ? <OpportunitiesScreen navigate={navigate} correctedJobIds={correctedJobIds} /> : null}
        {route.view === "opportunities" && !canUseSampleWorkspace ? <SampleWorkspaceBoundary onContinue={() => navigate(nextSetupRoute())} /> : null}
        {route.view === "review" && canUseSampleWorkspace && job ? <ReviewScreen job={job} baselinePreferences={baselinePreferences} scenario={scenario} navigate={navigate} backRoute={reviewOrigin} openSheet={setSheet} decision={decisions[job.id]} pendingCorrections={reviewRecords.filter((record): record is CorrectionRecord => record.type === "correction" && record.jobId === job.id)} onDecision={(value) => chooseDecision(job, value)} /> : null}
        {route.view === "review" && canUseSampleWorkspace && !job ? <UnknownOpportunityScreen navigate={navigate} jobId={route.jobId} /> : null}
        {route.view === "review" && !canUseSampleWorkspace ? <SampleWorkspaceBoundary onContinue={() => navigate(nextSetupRoute())} /> : null}
        {route.view === "pursuits" && canUseSampleWorkspace ? <PursuitsScreen navigate={navigate} decisions={decisions} correctedJobIds={correctedJobIds} /> : null}
        {route.view === "pursuits" && !canUseSampleWorkspace ? <SampleWorkspaceBoundary onContinue={() => navigate(nextSetupRoute())} /> : null}
        {route.view === "materials" && canUseSampleWorkspace ? <MaterialsScreen reviewed={reviewedMaterials} onBack={() => navigate({ view: "pursuits" })} onPreview={(asset) => { setReviewedMaterials((current) => current.includes(asset) ? current : [...current, asset]); setSheet({ type: "package-preview", asset }); }} onContinue={() => navigate({ view: "application" })} /> : null}
        {route.view === "materials" && !canUseSampleWorkspace ? <SampleWorkspaceBoundary onContinue={() => navigate(nextSetupRoute())} /> : null}
        {route.view === "application" && canUseSampleWorkspace ? <ApplicationScreen navigate={navigate} openApproval={() => setSheet({ type: "approval" })} openPreview={(asset) => setSheet({ type: "package-preview", asset })} approvalState={approvalState} offline={scenario === "offline"} setApprovalState={setApprovalState} onPlans={() => { setCheckoutPlan(selectedPlan); navigate({ view: "plans" }); }} /> : null}
        {route.view === "application" && !canUseSampleWorkspace ? <SampleWorkspaceBoundary onContinue={() => navigate(nextSetupRoute())} /> : null}
        {route.view === "appearance" ? <AppearanceScreen theme={theme} setTheme={setTheme} selectedPlan={selectedPlan} localReviewCount={reviewRecords.length} resetLocalData={resetLocalData} onPlans={() => { setCheckoutPlan(selectedPlan); navigate({ view: "plans" }); }} onCancelPlan={() => { setSelectedPlan("free"); setCheckoutPlan("free"); setToast("Test renewal canceled. Your saved demo jobs remain available."); setAnnouncement("Test renewal canceled. No charge occurred."); }} /> : null}
      </main>
      {!usesFunnelChrome ? <BottomNav route={route} navigate={navigate} modalOpen={sheet !== null} /> : null}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      {toast ? <div className="toast"><CheckCircle size={19} weight="fill" aria-hidden="true" /><span>{toast}</span><button onClick={() => setToast("")} aria-label="Dismiss message"><X size={17} aria-hidden="true" /></button></div> : null}
      {sheet?.type === "source" ? <SourceSheet job={sheet.job} requirement={sheet.requirement} close={() => setSheet(null)} /> : null}
      {sheet?.type === "correction" ? <CorrectionSheet job={sheet.job} requirement={sheet.requirement} existing={reviewRecords.find((record): record is CorrectionRecord => record.type === "correction" && record.jobId === sheet.job.id && record.requirementId === sheet.requirement.id)} close={() => setSheet(null)} save={saveReviewRecord} /> : null}
      {sheet?.type === "proof" ? <ProofSheet job={sheet.job} existing={reviewRecords.find((record): record is ProofRecord => record.type === "proof" && record.jobId === sheet.job.id)} close={() => setSheet(null)} save={saveReviewRecord} /> : null}
      {sheet?.type === "assessment" ? <AssessmentSheet job={sheet.job} correctionPending={correctedJobIds.has(sheet.job.id)} close={() => setSheet(null)} /> : null}
      {sheet?.type === "package-preview" ? <PackagePreviewSheet asset={sheet.asset} payload={approvalState.payload} close={() => setSheet(null)} /> : null}
      {sheet?.type === "approval" ? <ApprovalSheet state={approvalState} close={() => setSheet(null)} onApprove={() => { setApprovalState(approveCurrentPayload(approvalState, new Date().toISOString())); setSheet(null); setAnnouncement("Exact demo approval recorded for the displayed payload. No external action occurred."); setToast("Demo approval recorded for this version, fingerprint, answer set, and destination. Nothing was submitted."); }} /> : null}
    </div>
  );
}
