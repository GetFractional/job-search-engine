"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Briefcase,
  CaretDown,
  CheckCircle,
  Compass,
  FileText,
  LockKey,
  Moon,
  Plus,
  RoadHorizon,
  SignOut,
  Sun,
  Target,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CareerEvidenceManager } from "./CareerEvidenceManager";
import { CoverLetterStudio } from "./CoverLetterStudio";
import {
  applicationQuestionFields,
  invalidApplicationAnswers,
  isBooleanApplicationQuestion,
  requiredApplicationGaps,
  sourceAcceptsAsset,
  sourceRequiresAsset,
} from "./application-package";
import { CURRENT_DETERMINISTIC_ASSESSMENT_POLICY } from "./deterministic-assessment";
import { PrivacyCenter } from "./PrivacyCenter";
import { ResumeStudio } from "./ResumeStudio";
import { TodayDashboard } from "./TodayDashboard";
import type {
  AssetRecord,
  CareerPathRecord,
  FounderActor,
  JobStandardRecord,
  OpportunityRecord,
  PursuitEventType,
  WorkspaceRecord,
} from "./production-types";

export type ViewKey =
  | "today"
  | "jobs"
  | "pursuit"
  | "studio"
  | "direction"
  | "profile"
  | "account";
export type StudioKey = "resume" | "cover";
type ThemeChoice = "light" | "dark";
type FormMessage = { text: string; kind: "success" | "error" };

const NAVIGATION: Array<{
  key: ViewKey;
  label: string;
  icon: typeof Compass;
}> = [
  { key: "today", label: "Home", icon: Compass },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "pursuit", label: "Pursuits", icon: Target },
  { key: "studio", label: "Documents", icon: FileText },
  { key: "profile", label: "Career Profile", icon: UserCircle },
];

const VIEW_KEYS = new Set<ViewKey>([
  "today",
  "jobs",
  "pursuit",
  "studio",
  "direction",
  "profile",
  "account",
]);

const THEMES: Array<{ value: ThemeChoice; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function currentView(): ViewKey {
  if (typeof window === "undefined") return "today";
  const pathname = window.location.pathname.replace(/\/+$/, "");
  if (pathname === "/app/home") return "today";
  if (pathname === "/app/jobs" || pathname.startsWith("/app/jobs/")) return "jobs";
  if (pathname === "/app/pursuits" || pathname.startsWith("/app/pursuits/")) return "pursuit";
  if (pathname.startsWith("/app/documents/")) return "studio";
  if (pathname === "/app/plan") return "direction";
  if (pathname === "/app/profile") return "profile";
  if (pathname === "/app/settings/privacy") return "account";
  const view = new URLSearchParams(window.location.search).get("view");
  return VIEW_KEYS.has(view as ViewKey) ? (view as ViewKey) : "today";
}

function currentStudio(): StudioKey {
  if (typeof window === "undefined") return "resume";
  if (window.location.pathname.startsWith("/app/documents/cover-letters")) {
    return "cover";
  }
  return new URLSearchParams(window.location.search).get("asset") === "cover"
    ? "cover"
    : "resume";
}

function currentJobId(): string | null {
  if (typeof window === "undefined") return null;
  const pathMatch = window.location.pathname.match(
    /^\/app\/(?:jobs|pursuits)\/([^/]+)\/?$/,
  );
  if (pathMatch?.[1]) {
    try {
      return decodeURIComponent(pathMatch[1]);
    } catch {
      return pathMatch[1];
    }
  }
  return new URLSearchParams(window.location.search).get("job");
}

function currentDocumentId(): string | null {
  if (typeof window === "undefined") return null;
  const pathMatch = window.location.pathname.match(
    /^\/app\/documents\/(?:resumes|cover-letters)\/([^/]+)\/?$/,
  );
  if (!pathMatch?.[1]) return null;
  try {
    return decodeURIComponent(pathMatch[1]);
  } catch {
    return pathMatch[1];
  }
}

function currentClientRoute(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function viewPath(
  view: ViewKey,
  jobId?: string | null,
  studio: StudioKey = "resume",
  documentId?: string | null,
): string {
  if (view === "today") return "/app/home";
  if (view === "jobs") {
    return jobId
      ? `/app/jobs/${encodeURIComponent(jobId)}`
      : "/app/jobs";
  }
  if (view === "pursuit") {
    return jobId
      ? `/app/pursuits/${encodeURIComponent(jobId)}`
      : "/app/pursuits";
  }
  if (view === "studio") {
    const base =
      studio === "cover"
        ? "/app/documents/cover-letters"
        : "/app/documents/resumes";
    return documentId ? `${base}/${encodeURIComponent(documentId)}` : base;
  }
  if (view === "direction") return "/app/plan";
  if (view === "profile") return "/app/profile";
  return "/app/settings/privacy";
}

function applyTheme(choice: ThemeChoice) {
  document.documentElement.dataset.theme = choice;
  document.documentElement.dataset.themeChoice = choice;
}

function money(cents: number | null, currency = "USD"): string {
  if (cents === null) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function scoreLabel(score: number | null): string {
  return score === null ? "Open" : `${score}%`;
}

function currentTrustedAnalysis(job: OpportunityRecord) {
  const analysis = job.analysis;
  const currentVersionId = job.sourceVersion?.id;
  const boundVersionId =
    typeof analysis?.integrityGates.jobVersionId === "string"
      ? analysis.integrityGates.jobVersionId
      : null;
  const deterministicPolicyIsCurrent =
    analysis?.integrityGates.deterministic !== true ||
    analysis.integrityGates.policyVersion ===
      CURRENT_DETERMINISTIC_ASSESSMENT_POLICY;
  return analysis?.validationState === "trusted" &&
    Boolean(currentVersionId) &&
    boundVersionId === currentVersionId &&
    deterministicPolicyIsCurrent
    ? analysis
    : null;
}

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function assetLabel(type: AssetRecord["type"]): string {
  const labels: Record<AssetRecord["type"], string> = {
    resume: "Resume",
    cover_letter: "Cover letter",
    research: "Research brief",
    application_answers: "Application answers",
    interview: "Interview preparation",
    ninety_day_plan: "90-day plan",
  };
  return labels[type];
}

function getAssetText(asset: AssetRecord): string[] {
  if (!asset.content) return [];
  const content = asset.content;
  const candidates = [content.text, content.body, content.summary, content.content];
  for (const candidate of candidates) {
    if (typeof candidate === "string") return candidate.split("\n").filter(Boolean);
  }
  if (Array.isArray(content.sections)) {
    return content.sections.flatMap((section) => {
      if (typeof section === "string") return [section];
      if (section && typeof section === "object") {
        const record = section as Record<string, unknown>;
        return [record.heading, record.text, record.body].filter((value): value is string => typeof value === "string");
      }
      return [];
    });
  }
  return Object.entries(content)
    .filter(([, value]) => typeof value === "string")
    .map(([key, value]) => `${titleCase(key)}: ${value as string}`);
}

type OutboundManifestAsset = {
  id: string;
  type: string;
  version: number | null;
  filename: string;
  pageCount: number | null;
  reviewState: string;
  contentSha256: string;
  fileSha256: string;
};

function outboundManifestAssets(manifest: Record<string, unknown>): OutboundManifestAsset[] {
  if (!Array.isArray(manifest.assets)) return [];
  return manifest.assets.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const asset = entry as Record<string, unknown>;
    return [{
      id: typeof asset.id === "string" ? asset.id : "",
      type: typeof asset.type === "string" ? asset.type : "",
      version: typeof asset.version === "number" ? asset.version : null,
      filename: typeof asset.filename === "string" ? asset.filename : "",
      pageCount: typeof asset.pageCount === "number" ? asset.pageCount : null,
      reviewState: typeof asset.reviewState === "string" ? asset.reviewState : "",
      contentSha256: typeof asset.contentSha256 === "string" ? asset.contentSha256 : "",
      fileSha256: typeof asset.fileSha256 === "string" ? asset.fileSha256 : "",
    }];
  });
}

function answerLabel(key: string): string {
  const labels: Record<string, string> = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    linkedInProfile: "LinkedIn profile",
    requiresSponsorship: "Requires sponsorship now or later",
  };
  return labels[key] ?? titleCase(key.replace(/([a-z])([A-Z])/g, "$1 $2"));
}

function reviewValue(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "Not provided";
  if (Array.isArray(value)) return value.map(reviewValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function normalizedAbsoluteUrl(value: string): string {
  try {
    return new URL(value).toString();
  } catch {
    return value;
  }
}

function localDateTimeInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

export default function WayAheadApp({
  actor,
  initialView = "today",
  initialJobId = null,
  initialStudio = "resume",
  initialDocumentId = null,
}: {
  actor: FounderActor;
  initialView?: ViewKey;
  initialJobId?: string | null;
  initialStudio?: StudioKey;
  initialDocumentId?: string | null;
}) {
  const [view, setView] = useState<ViewKey>(initialView);
  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeChoice>("light");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId);
  const [selectedPursuitId, setSelectedPursuitId] = useState<string | null>(initialJobId);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    initialDocumentId,
  );
  const [selectedStudio, setSelectedStudio] =
    useState<StudioKey>(initialStudio);
  const accountRootRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const hasLoadedWorkspaceRef = useRef(false);

  useEffect(() => {
    const syncLocation = () => {
      const nextRoute = currentClientRoute();
      const previousRoute =
        document.documentElement.dataset.wayAheadCurrentRoute;
      if (
        previousRoute &&
        nextRoute !== previousRoute &&
        document.documentElement.dataset.wayAheadUnsavedDocument === "true" &&
        !window.confirm("Discard the unsaved document changes on this screen?")
      ) {
        window.history.pushState({}, "", previousRoute);
        return;
      }
      document.documentElement.dataset.wayAheadCurrentRoute = nextRoute;
      setView(currentView());
      const jobId = currentJobId();
      setSelectedJobId(jobId);
      setSelectedPursuitId(jobId);
      setSelectedStudio(currentStudio());
      setSelectedDocumentId(currentDocumentId());
    };
    const frame = window.requestAnimationFrame(() => {
      syncLocation();
      const storedTheme = window.localStorage.getItem("way-ahead-theme");
      const choice: ThemeChoice = storedTheme === "dark" ? "dark" : "light";
      setTheme(choice);
      applyTheme(choice);
    });
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("popstate", syncLocation);
    };
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const focusFrame = window.requestAnimationFrame(() => {
      accountMenuRef.current?.querySelector<HTMLInputElement>('input[name="theme"]:checked')?.focus();
    });
    const closeAndRestoreFocus = () => {
      setSettingsOpen(false);
      window.requestAnimationFrame(() => accountButtonRef.current?.focus());
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndRestoreFocus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRootRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [settingsOpen]);

  const refresh = useCallback(async () => {
    const isInitialLoad = !hasLoadedWorkspaceRef.current;
    if (isInitialLoad) setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/workspace", { cache: "no-store" });
      const data = await response.json() as WorkspaceRecord | { error?: string };
      if (!response.ok || !("system" in data)) {
        throw new Error("error" in data && data.error ? data.error : "Way Ahead could not load your workspace.");
      }
      setWorkspace(data);
      hasLoadedWorkspaceRef.current = true;
    } catch (loadError) {
      if (isInitialLoad) {
        setError(loadError instanceof Error ? loadError.message : "Way Ahead could not load your workspace.");
      }
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const navigate = (
    nextView: ViewKey,
    jobId?: string,
    studio: StudioKey = "resume",
    documentId?: string,
  ) => {
    const nextPath = viewPath(nextView, jobId, studio, documentId);
    if (
      view === "studio" &&
      nextPath !== currentClientRoute() &&
      document.documentElement.dataset.wayAheadUnsavedDocument === "true" &&
      !window.confirm("Discard the unsaved document changes on this screen?")
    ) {
      return;
    }
    const main = document.querySelector<HTMLElement>("#main-content");
    if (main) main.scrollTop = 0;
    setView(nextView);
    if (nextView === "jobs") setSelectedJobId(jobId ?? null);
    if (nextView === "pursuit") setSelectedPursuitId(jobId ?? null);
    if (nextView === "studio") {
      setSelectedStudio(studio);
      setSelectedDocumentId(documentId ?? null);
    }
    setSettingsOpen(false);
    window.history.pushState(
      {},
      "",
      nextPath,
    );
    document.documentElement.dataset.wayAheadCurrentRoute = nextPath;
    window.requestAnimationFrame(() => {
      if (main) main.scrollTop = 0;
      main?.focus();
    });
  };

  const followRoute = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    nextView: ViewKey,
    jobId?: string,
    studio: StudioKey = "resume",
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(nextView, jobId, studio);
  };

  const replaceStudioDocumentRoute = useCallback(
    (studio: StudioKey, documentId: string) => {
      const nextPath = viewPath("studio", null, studio, documentId);
      setSelectedStudio(studio);
      setSelectedDocumentId(documentId);
      if (nextPath !== currentClientRoute()) {
        window.history.replaceState({}, "", nextPath);
      }
      document.documentElement.dataset.wayAheadCurrentRoute = nextPath;
    },
    [],
  );

  const chooseTheme = (choice: ThemeChoice) => {
    setTheme(choice);
    window.localStorage.setItem("way-ahead-theme", choice);
    applyTheme(choice);
  };

  const selectedJob = workspace?.opportunities.find((job) => job.id === selectedJobId) ?? null;
  const pursuedJobs = workspace?.opportunities.filter((job) => job.pursuit) ?? [];
  const pursuedJob = selectedPursuitId
    ? pursuedJobs.find(
        (job) =>
          job.pursuit?.id === selectedPursuitId || job.id === selectedPursuitId,
      ) ?? null
    : pursuedJobs[0] ?? null;
  const openPursuit = (jobOrPursuitId: string) => {
    const match = workspace?.opportunities.find(
      (job) =>
        job.id === jobOrPursuitId || job.pursuit?.id === jobOrPursuitId,
    );
    const pursuitId = match?.pursuit?.id ?? jobOrPursuitId;
    setSelectedPursuitId(pursuitId);
    navigate("pursuit", pursuitId);
  };

  const selectJob = (jobId: string | null) => {
    setSelectedJobId(jobId);
    window.history.pushState({}, "", viewPath("jobs", jobId));
  };

  return (
    <div className="wa-shell">
      <a className="wa-skip-link" href="#main-content">Skip to main content</a>
      <header className="wa-header">
        <a
          className="wa-brand"
          href={viewPath("today")}
          onClick={(event) => followRoute(event, "today")}
          aria-label="Way Ahead home"
        >
          <span className="wa-brand-mark" aria-hidden="true"><RoadHorizon size={24} weight="bold" /></span>
          <span>Way Ahead</span>
        </a>
        <nav className="wa-desktop-nav" aria-label="Primary navigation">
          {NAVIGATION.map((item) => (
            <a
              className={view === item.key ? "is-active" : ""}
              key={item.key}
              href={viewPath(item.key)}
              onClick={(event) => followRoute(event, item.key)}
              aria-current={view === item.key ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="wa-account" ref={accountRootRef}>
          <button
            className="wa-account-button"
            type="button"
            ref={accountButtonRef}
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
            aria-controls="account-menu"
            aria-label={`Account and appearance for ${actor.displayName}`}
          >
            <span>{actor.displayName.split(" ")[0]}</span>
            <UserCircle size={25} weight="duotone" aria-hidden="true" />
          </button>
          {settingsOpen ? (
            <div
              className="wa-account-menu"
              id="account-menu"
              role="dialog"
              aria-modal="false"
              aria-label="Account and appearance"
              ref={accountMenuRef}
            >
              <div className="wa-account-identity">
                <strong>{actor.displayName}</strong>
                <span>{actor.email}</span>
              </div>
              <nav className="wa-account-links" aria-label="Account navigation">
                <a
                  className={view === "profile" ? "is-active" : ""}
                  href={viewPath("profile")}
                  onClick={(event) => followRoute(event, "profile")}
                  aria-current={view === "profile" ? "page" : undefined}
                >
                  <UserCircle size={18} aria-hidden="true" />
                  Career profile
                </a>
                <a
                  className={view === "direction" ? "is-active" : ""}
                  href={viewPath("direction")}
                  onClick={(event) => followRoute(event, "direction")}
                  aria-current={view === "direction" ? "page" : undefined}
                >
                  <RoadHorizon size={18} aria-hidden="true" />
                  Search plan
                </a>
                <a
                  className={view === "account" ? "is-active" : ""}
                  href={viewPath("account")}
                  onClick={(event) => followRoute(event, "account")}
                  aria-current={view === "account" ? "page" : undefined}
                >
                  <LockKey size={18} aria-hidden="true" />
                  Data &amp; privacy
                </a>
              </nav>
              <fieldset className="wa-theme-fieldset">
                <legend>Appearance</legend>
                <div className="wa-theme-options">
                  {THEMES.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label key={option.value} className={theme === option.value ? "is-selected" : ""}>
                        <input
                          type="radio"
                          name="theme"
                          value={option.value}
                          checked={theme === option.value}
                          onChange={() => chooseTheme(option.value)}
                        />
                        <Icon size={18} aria-hidden="true" />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <a className="wa-menu-link" href="/signout-with-chatgpt?return_to=%2F">
                <SignOut size={18} aria-hidden="true" /> Sign out
              </a>
            </div>
          ) : null}
        </div>
      </header>

      <main className="wa-main" id="main-content" tabIndex={-1}>
        {loading ? <WorkspaceLoading /> : null}
        {!loading && error ? <WorkspaceError message={error} onRetry={refresh} /> : null}
        {!loading && !error && workspace ? (
          <>
            {view === "today" ? (
              <div className="wa-page wa-today-dashboard">
                <TodayDashboard />
              </div>
            ) : null}
            {view === "jobs" ? (
              <JobsView
                careerPaths={workspace.careerPaths}
                opportunities={workspace.opportunities}
                requestedJobId={selectedJobId}
                selectedJob={selectedJob}
                onSelect={selectJob}
                onRefresh={refresh}
                onOpenPursuit={openPursuit}
              />
            ) : null}
            {view === "pursuit" ? (
              <PursuitView
                actor={actor}
                key={`${pursuedJob?.id ?? "none"}:${pursuedJob?.sourceVersion?.id ?? "none"}:${pursuedJob?.pursuit?.package?.id ?? "none"}:${pursuedJob?.pursuit?.package?.payloadSha256 ?? "none"}`}
                opportunity={pursuedJob}
                pursuedJobs={pursuedJobs}
                requestedJobId={selectedPursuitId}
                onSelectOpportunity={openPursuit}
                navigate={navigate}
                onRefresh={refresh}
              />
            ) : null}
            {view === "studio" ? (
              <DocumentStudioView
                documentId={selectedDocumentId}
                studio={selectedStudio}
                navigate={navigate}
                onDocumentSelected={replaceStudioDocumentRoute}
              />
            ) : null}
            {view === "direction" ? <DirectionView workspace={workspace} onRefresh={refresh} /> : null}
            {view === "profile" ? (
              <ProfileView workspace={workspace} onRefresh={refresh} />
            ) : null}
            {view === "account" ? (
              <div className="wa-page wa-account-privacy">
                <PrivacyCenter
                  role={
                    workspace.system.canRecordOperatorAnalysis
                      ? "owner"
                      : "member"
                  }
                  signOutHref="/signout-with-chatgpt?return_to=%2F"
                />
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      <nav className="wa-mobile-nav" aria-label="Primary navigation">
        {NAVIGATION.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.key}
              className={view === item.key ? "is-active" : ""}
              href={viewPath(item.key)}
              onClick={(event) => followRoute(event, item.key)}
              aria-current={view === item.key ? "page" : undefined}
            >
              <Icon size={23} weight={view === item.key ? "fill" : "regular"} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function DocumentStudioView({
  documentId,
  studio,
  navigate,
  onDocumentSelected,
}: {
  documentId: string | null;
  studio: StudioKey;
  navigate: (
    view: ViewKey,
    jobId?: string,
    studio?: StudioKey,
    documentId?: string,
  ) => void;
  onDocumentSelected: (studio: StudioKey, documentId: string) => void;
}) {
  const selectResumeDocument = useCallback(
    (resumeId: string) => onDocumentSelected("resume", resumeId),
    [onDocumentSelected],
  );
  const selectCoverDocument = useCallback(
    (letterId: string) => onDocumentSelected("cover", letterId),
    [onDocumentSelected],
  );
  const chooseStudio = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    nextStudio: StudioKey,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate("studio", undefined, nextStudio);
  };

  return (
    <div className="wa-page wa-document-studio">
      <div className="wa-studio-switcher" aria-label="Application document">
        <a
          className={studio === "resume" ? "is-active" : ""}
          href={viewPath("studio", null, "resume")}
          onClick={(event) => chooseStudio(event, "resume")}
          aria-current={studio === "resume" ? "page" : undefined}
        >
          <FileText size={18} aria-hidden="true" />
          Resumes
        </a>
        <a
          className={studio === "cover" ? "is-active" : ""}
          href={viewPath("studio", null, "cover")}
          onClick={(event) => chooseStudio(event, "cover")}
          aria-current={studio === "cover" ? "page" : undefined}
        >
          <FileText size={18} aria-hidden="true" />
          Cover letters
        </a>
      </div>
      <section id="document-studio-content" tabIndex={-1}>
        {studio === "resume" ? (
          <ResumeStudio
            initialResumeId={documentId}
            onDocumentSelected={selectResumeDocument}
          />
        ) : (
          <CoverLetterStudio
            initialLetterId={documentId}
            onDocumentSelected={selectCoverDocument}
          />
        )}
      </section>
    </div>
  );
}

function WorkspaceLoading() {
  return (
    <section className="wa-state-panel" aria-live="polite" aria-busy="true">
      <div className="wa-pulse-orb" aria-hidden="true" />
      <p className="wa-eyebrow">Secure workspace</p>
      <h1>Loading the evidence behind your next job.</h1>
      <p>Your profile, standards, live jobs, and application work are being read from your private account.</p>
    </section>
  );
}

function WorkspaceError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="wa-state-panel wa-state-error" role="alert">
      <WarningCircle size={30} weight="fill" aria-hidden="true" />
      <p className="wa-eyebrow">Workspace unavailable</p>
      <h1>Your workspace did not load.</h1>
      <p>{message}</p>
      <button className="wa-primary-button" type="button" onClick={onRetry}>Try again</button>
    </section>
  );
}

export function OwnerAnalysisPanel({
  job,
  careerPaths,
  onRefresh,
}: {
  job: OpportunityRecord;
  careerPaths: CareerPathRecord[];
  onRefresh: () => Promise<void>;
}) {
  const activePaths = useMemo(
    () => careerPaths.filter((path) => path.state === "active"),
    [careerPaths],
  );
  const existingPath =
    typeof job.analysis?.integrityGates.careerPathId === "string"
      ? job.analysis.integrityGates.careerPathId
      : "";
  const [careerPathId, setCareerPathId] = useState(
    existingPath || activePaths.find((path) => path.isPrimary)?.id || activePaths[0]?.id || "",
  );
  const [moveValue, setMoveValue] = useState(
    job.analysis?.moveValueScore === null ||
      job.analysis?.moveValueScore === undefined
      ? ""
      : String(job.analysis.moveValueScore),
  );
  const [fitScore, setFitScore] = useState(
    typeof job.analysis?.fit.fitScore === "number"
      ? String(job.analysis.fit.fitScore)
      : typeof job.analysis?.fit.score === "number"
        ? String(job.analysis.fit.score)
        : "",
  );
  const [readiness, setReadiness] = useState(
    job.analysis?.pursuitReadinessScore === null ||
      job.analysis?.pursuitReadinessScore === undefined
      ? ""
      : String(job.analysis.pursuitReadinessScore),
  );
  const [recommendation, setRecommendation] = useState(
    job.analysis?.recommendation ?? "needs_evidence",
  );
  const [unknowns, setUnknowns] = useState(
    job.analysis?.unknowns.join("\n") ?? "",
  );
  const [evidenceNote, setEvidenceNote] = useState(
    typeof job.analysis?.fit.evidenceNote === "string"
      ? job.analysis.fit.evidenceNote
      : "",
  );
  const [sourceArtifact, setSourceArtifact] = useState(
    typeof job.analysis?.fit.sourceArtifact === "string"
      ? job.analysis.fit.sourceArtifact
      : "",
  );
  const [nextAction, setNextAction] = useState(
    job.pursuit?.nextAction ??
      (typeof job.analysis?.fit.nextAction === "string"
        ? job.analysis.fit.nextAction
        : ""),
  );
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/operator-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: job.id,
          sourceVersionId: job.sourceVersion?.id,
          careerPathId,
          fitScore: fitScore.trim() ? Number(fitScore) : null,
          moveValueScore: moveValue.trim() ? Number(moveValue) : null,
          pursuitReadinessScore: readiness.trim()
            ? Number(readiness)
            : null,
          recommendation,
          unknowns: unknowns
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          evidenceNote,
          sourceArtifact,
          nextAction,
          confirmation: confirmed ? "record_reviewed_analysis" : "",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "The analysis receipt could not be recorded.");
      }
      setConfirmed(false);
      setMessage({
        text: "Reviewed analysis recorded against this exact source version.",
        kind: "success",
      });
      await onRefresh();
    } catch (saveError) {
      setMessage({
        text:
          saveError instanceof Error
            ? saveError.message
            : "The analysis receipt could not be recorded.",
        kind: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <details className="wa-operator-panel">
      <summary>Operator analysis</summary>
      <form onSubmit={submit}>
        <div className="wa-operator-heading">
          <div>
            <p className="wa-eyebrow">Internal operator control</p>
            <h2>Bind a reviewed decision to this source version.</h2>
          </div>
          <p>
            This changes the account&apos;s private scoreboard only. It does not generate,
            populate, upload, send, or submit anything.
          </p>
        </div>
        <div className="wa-form-grid">
          <label>
            Job Path
            <select
              value={careerPathId}
              onChange={(event) => setCareerPathId(event.target.value)}
              required
            >
              <option value="">Choose an active path</option>
              {activePaths.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Recommendation
            <select
              value={recommendation}
              onChange={(event) =>
                setRecommendation(
                  event.target.value as
                    | "pursue"
                    | "watch"
                    | "pass"
                    | "needs_evidence",
                )
              }
            >
              <option value="needs_evidence">Needs evidence</option>
              <option value="pursue">Pursue</option>
              <option value="watch">Keep watch</option>
              <option value="pass">Pass</option>
            </select>
          </label>
          <label>
            Fit score
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={fitScore}
              onChange={(event) => setFitScore(event.target.value)}
              placeholder="Role alignment"
            />
          </label>
          <label>
            Job Value
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={moveValue}
              onChange={(event) => setMoveValue(event.target.value)}
              placeholder="Leave open if not scored"
            />
          </label>
          <label>
            Pursuit Readiness
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={readiness}
              onChange={(event) => setReadiness(event.target.value)}
              placeholder="Leave open while facts are missing"
            />
          </label>
        </div>
        <label>
          Unresolved facts, one per line
          <textarea
            value={unknowns}
            onChange={(event) => setUnknowns(event.target.value)}
            rows={5}
          />
        </label>
        <label>
          Evidence note
          <textarea
            value={evidenceNote}
            onChange={(event) => setEvidenceNote(event.target.value)}
            rows={4}
            required
          />
        </label>
        <label>
          Source artifact
          <input
            type="text"
            value={sourceArtifact}
            onChange={(event) => setSourceArtifact(event.target.value)}
            placeholder="Private review artifact or source receipt"
            required
          />
        </label>
        <label>
          Exact next action
          <textarea
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
            rows={3}
            required
          />
        </label>
        <label className="wa-checkbox-row">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            required
          />
          I reviewed the canonical source, claim safety, and every unresolved
          fact recorded above.
        </label>
        <button
          className="wa-primary-button"
          type="submit"
          disabled={saving || !job.sourceVersion}
        >
          {saving ? "Recording…" : "Record reviewed analysis"}
        </button>
        <FormFeedback message={message} />
      </form>
    </details>
  );
}

type DisplayCriterion = {
  id: string;
  label: string;
  category: string;
  state: "met" | "conflict" | "unknown";
  explanation: string;
  evidence: string;
};

function displayCriteria(
  analysis: NonNullable<OpportunityRecord["analysis"]> | null,
): DisplayCriterion[] {
  if (!Array.isArray(analysis?.fit.criteria)) return [];
  return analysis.fit.criteria.flatMap((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const record = value as Record<string, unknown>;
    if (
      typeof record.id !== "string" ||
      typeof record.label !== "string" ||
      typeof record.category !== "string" ||
      (record.state !== "met" &&
        record.state !== "conflict" &&
        record.state !== "unknown") ||
      typeof record.explanation !== "string" ||
      typeof record.evidence !== "string"
    ) {
      return [];
    }
    return [
      {
        id: record.id,
        label: record.label,
        category: record.category,
        state: record.state,
        explanation: record.explanation,
        evidence: record.evidence,
      },
    ];
  });
}

function JobsView({
  careerPaths,
  opportunities,
  requestedJobId,
  selectedJob,
  onSelect,
  onRefresh,
  onOpenPursuit,
}: {
  careerPaths: CareerPathRecord[];
  opportunities: OpportunityRecord[];
  requestedJobId: string | null;
  selectedJob: OpportunityRecord | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => Promise<void>;
  onOpenPursuit: (jobId: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const activePaths = useMemo(
    () => careerPaths.filter((path) => path.state === "active"),
    [careerPaths],
  );
  const [assessmentSelection, setAssessmentSelection] = useState<{
    jobId: string | null;
    pathId: string;
  }>({ jobId: null, pathId: "" });
  const analysisPathId =
    typeof selectedJob?.analysis?.integrityGates.careerPathId === "string"
      ? selectedJob.analysis.integrityGates.careerPathId
      : null;
  const defaultAssessmentPathId =
    activePaths.find((path) => path.id === analysisPathId)?.id ??
    activePaths.find((path) => path.isPrimary)?.id ??
    activePaths[0]?.id ??
    "";
  const assessmentPathId =
    assessmentSelection.jobId === selectedJob?.id &&
    activePaths.some((path) => path.id === assessmentSelection.pathId)
      ? assessmentSelection.pathId
      : defaultAssessmentPathId;

  const addJob = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/jobs/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json() as { error?: string; jobPostingId?: string };
      if (!response.ok) throw new Error(result.error ?? "The employer job could not be added.");
      setUrl("");
      setMessage({ text: "The employer source was verified and added.", kind: "success" });
      await onRefresh();
      if (result.jobPostingId) onSelect(result.jobPostingId);
    } catch (saveError) {
      setMessage({ text: saveError instanceof Error ? saveError.message : "The employer job could not be added.", kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  const startPursuit = async (job: OpportunityRecord) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/pursuits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId: job.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The pursuit could not be started.");
      await onRefresh();
      onOpenPursuit(job.id);
    } catch (pursuitError) {
      setMessage({ text: pursuitError instanceof Error ? pursuitError.message : "The pursuit could not be started.", kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  const assessJob = async (job: OpportunityRecord) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/jobs/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: job.id,
          careerPathId: assessmentPathId,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        recommendation?: string;
      };
      if (!response.ok) {
        throw new Error(
          result.error ?? "The source-bound assessment could not be recorded.",
        );
      }
      setMessage({
        text: `Assessment recorded against this employer-source version${
          result.recommendation
            ? `: ${titleCase(result.recommendation)}`
            : ""
        }.`,
        kind: "success",
      });
      await onRefresh();
    } catch (assessmentError) {
      setMessage({
        text:
          assessmentError instanceof Error
            ? assessmentError.message
            : "The source-bound assessment could not be recorded.",
        kind: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (requestedJobId && !selectedJob) {
    return (
      <div className="wa-page">
        <section className="wa-state-panel wa-state-error" role="alert">
          <WarningCircle size={30} weight="fill" aria-hidden="true" />
          <p className="wa-eyebrow">Job unavailable</p>
          <h1>This job is not in your workspace.</h1>
          <p>
            The link may be stale, or the job may belong to another private
            workspace. No other job was substituted.
          </p>
          <button
            className="wa-primary-button"
            type="button"
            onClick={() => onSelect(null)}
          >
            Return to Jobs
          </button>
        </section>
      </div>
    );
  }

  if (selectedJob) {
    const currentAnalysis = currentTrustedAnalysis(selectedJob);
    const analysisNeedsRefresh =
      Boolean(selectedJob.analysis) && !currentAnalysis;
    const criteria = displayCriteria(currentAnalysis);
    const scoreMeaning =
      typeof currentAnalysis?.fit.scoreMeaning === "string"
        ? currentAnalysis.fit.scoreMeaning
        : "Alignment with verified criteria. It is not hiring probability or a prediction of an interview or offer.";
    const recommendationReason =
      typeof currentAnalysis?.fit.recommendationReason === "string"
        ? currentAnalysis.fit.recommendationReason
        : null;
    const verifiedCriterionCount =
      typeof currentAnalysis?.fit.verifiedCriterionCount === "number"
        ? currentAnalysis.fit.verifiedCriterionCount
        : criteria.filter((criterion) => criterion.state !== "unknown").length;

    return (
      <div className="wa-page">
        <button className="wa-back-button" type="button" onClick={() => onSelect(null)}><ArrowLeft size={18} /> All jobs</button>
        <section className="wa-detail-hero">
          <div>
            <p className="wa-eyebrow">{selectedJob.employer}</p>
            <h1>{selectedJob.title}</h1>
            <p>{selectedJob.locations.join(" · ") || "Location not reported"}</p>
          </div>
          <a className="wa-secondary-button" href={selectedJob.canonicalUrl} target="_blank" rel="noreferrer">Employer source <ArrowSquareOut size={18} /></a>
        </section>
        <div className="wa-source-receipt" aria-label="Employer source status">
          <div>
            <span>Source</span>
            <strong>{selectedJob.sourceName}</strong>
          </div>
          <div>
            <span>Capture</span>
            <strong>
              {titleCase(
                selectedJob.sourceVersion?.captureState ?? "unavailable",
              )}
            </strong>
          </div>
          <div>
            <span>Freshness</span>
            <strong>{titleCase(selectedJob.freshnessState)}</strong>
          </div>
          <div>
            <span>Checked</span>
            <strong>
              {selectedJob.sourceVersion?.checkedAt
                ? new Date(
                    selectedJob.sourceVersion.checkedAt,
                  ).toLocaleString()
                : "Not checked"}
            </strong>
          </div>
        </div>
        {selectedJob.sourceVersion?.conflicts.length ? (
          <div className="wa-alert wa-alert-warning" role="status">
            <WarningCircle size={23} weight="fill" />
            <div><strong>Source conflict</strong>{selectedJob.sourceVersion.conflicts.map((conflict) => <span key={conflict}>{conflict}</span>)}</div>
          </div>
        ) : null}
        {analysisNeedsRefresh ? (
          <div className="wa-alert wa-alert-warning" role="status">
            <WarningCircle size={23} weight="fill" />
            <div>
              <strong>Recheck this job</strong>
              <span>
                Your profile, Job Standard, or source changed. The previous
                analysis is preserved as history, but its scores are hidden
                until the job is analyzed again.
              </span>
            </div>
          </div>
        ) : null}
        <section className="wa-section wa-assessment-control">
          <div>
            <p className="wa-eyebrow">Source-bound assessment</p>
            <h2>
              {currentAnalysis
                ? "Recheck this job when the source or your priorities change."
                : "Compare this exact job with one Job Path and your Job Standard."}
            </h2>
            <p>
              Way Ahead uses deterministic structured criteria only. No model
              call, employer action, or invented qualification is involved.
            </p>
          </div>
          <div className="wa-assessment-actions">
            <label>
              <span>Job Path</span>
              <select
                value={assessmentPathId}
                onChange={(event) =>
                  setAssessmentSelection({
                    jobId: selectedJob.id,
                    pathId: event.target.value,
                  })
                }
                disabled={saving}
              >
                <option value="">Choose an active Job Path</option>
                {activePaths.map((path) => (
                  <option key={path.id} value={path.id}>
                    {path.label}
                    {path.isPrimary ? " · Primary" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="wa-primary-button"
              type="button"
              disabled={saving || !assessmentPathId}
              onClick={() => assessJob(selectedJob)}
            >
              {saving
                ? "Assessing…"
                : currentAnalysis
                  ? "Reassess this version"
                  : "Assess this job"}
            </button>
          </div>
        </section>
        <section className="wa-decision-grid">
          <article className="wa-score-card"><span>Preliminary alignment</span><strong>{scoreLabel(typeof currentAnalysis?.fit.fitScore === "number" ? currentAnalysis.fit.fitScore : typeof currentAnalysis?.fit.score === "number" ? currentAnalysis.fit.score : null)}</strong><p>Structured fields only. Role requirements remain an explicit open gate.</p></article>
          <article className="wa-score-card wa-score-card-strong"><span>Job value</span><strong>{scoreLabel(currentAnalysis?.moveValueScore ?? null)}</strong><p>Compared with your job standard.</p></article>
          <article className="wa-score-card"><span>Pursuit readiness</span><strong>{scoreLabel(currentAnalysis?.pursuitReadinessScore ?? null)}</strong><p>Grounded in confirmed profile evidence.</p></article>
          <article className="wa-score-card"><span>Recommendation</span><strong className="wa-word-score">{analysisNeedsRefresh ? "Recheck needed" : titleCase(currentAnalysis?.recommendation ?? "needs_evidence")}</strong><p>{analysisNeedsRefresh ? "Previous analysis preserved as history." : currentAnalysis ? "Current analysis stored in your account." : "A verified source needs analysis."}</p></article>
        </section>
        <p className="wa-muted">
          {scoreMeaning}
          {currentAnalysis
            ? ` Based on ${verifiedCriterionCount} verified ${
                verifiedCriterionCount === 1 ? "criterion" : "criteria"
              }.`
            : ""}
        </p>
        {recommendationReason ? (
          <div className="wa-decision-reason">
            <strong>Why this recommendation</strong>
            <span>{recommendationReason}</span>
          </div>
        ) : null}
        <section className="wa-section wa-detail-grid">
          <div>
            <p className="wa-eyebrow">Decision evidence</p>
            <h2>What holds up, and what still needs proof.</h2>
          </div>
          <div>
            <h3>Open questions</h3>
            {currentAnalysis?.unknowns.length ? (
              <ul className="wa-clean-list">{currentAnalysis.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul>
            ) : analysisNeedsRefresh ? (
              <p className="wa-muted">
                Re-run the analysis before relying on previous questions or
                preparing application assets.
              </p>
            ) : <p className="wa-muted">No current analysis unknowns are stored yet.</p>}
          </div>
        </section>
        {criteria.length ? (
          <section className="wa-section">
            <div className="wa-section-heading">
              <div>
                <p className="wa-eyebrow">Why these scores</p>
                <h2>Inspect every criterion and its evidence.</h2>
              </div>
              <span>
                {verifiedCriterionCount} of {criteria.length} verified
              </span>
            </div>
            <div className="wa-criteria-list">
              {criteria.map((criterion) => (
                <article
                  className="wa-criterion"
                  data-state={criterion.state}
                  key={criterion.id}
                >
                  <div>
                    <strong>{criterion.label}</strong>
                    <span>{titleCase(criterion.category)}</span>
                  </div>
                  <p>{criterion.explanation}</p>
                  <small>{criterion.evidence}</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}
        {!selectedJob.pursuit ? (
          <div className="wa-pursuit-start">
            <button
              className="wa-primary-button"
              type="button"
              disabled={saving || !currentAnalysis}
              onClick={() => startPursuit(selectedJob)}
            >
              Start this pursuit <ArrowRight size={19} />
            </button>
            <small>
              {currentAnalysis
                ? "This creates private, editable job-specific document starters. It does not populate an employer form, upload a file, or submit an application."
                : "Assess this exact source version before starting a pursuit."}
            </small>
          </div>
        ) : (
          <button
            className="wa-primary-button"
            type="button"
            onClick={() => onOpenPursuit(selectedJob.id)}
          >
            Open pursuit <ArrowRight size={19} />
          </button>
        )}
        <FormFeedback message={message} />
      </div>
    );
  }

  return (
    <div className="wa-page">
      <section className="wa-page-heading">
        <div><p className="wa-eyebrow">Verified opportunities</p><h1>Spend your effort where it can actually pay off.</h1></div>
        <p>Every job here keeps its canonical source, freshness, evidence gaps, and pursuit state visible.</p>
      </section>
      <form className="wa-add-job" onSubmit={addJob}>
        <label htmlFor="employer-job-url">Add a direct employer job</label>
        <div>
          <input
            id="employer-job-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a direct Greenhouse, Lever, or Ashby job URL"
            required
            aria-invalid={message?.kind === "error" ? true : undefined}
            aria-describedby="employer-job-url-help employer-job-url-feedback"
          />
          <button type="submit" className="wa-primary-button" disabled={saving}>{saving ? "Verifying…" : <><Plus size={18} /> Add job</>}</button>
        </div>
        <small id="employer-job-url-help">Current live intake verifies canonical Greenhouse, Lever, and Ashby employer URLs. It never submits an application.</small>
        <FormFeedback message={message} id="employer-job-url-feedback" />
      </form>
      <div className="wa-job-list">
        {opportunities.length ? opportunities.map((job) => {
          const visibleAnalysis = currentTrustedAnalysis(job);
          return (
            <button className="wa-job-card" type="button" key={job.id} onClick={() => onSelect(job.id)}>
              <span className="wa-job-company">{job.employer}</span>
              <strong>{job.title}</strong>
              <span>{job.locations.join(" · ") || "Location not reported"}</span>
              <div className="wa-job-meta">
                <span className={`wa-status wa-status-${job.sourceVersion?.captureState ?? "unavailable"}`}>{titleCase(job.sourceVersion?.captureState ?? "unavailable")}</span>
                <span>
                  {visibleAnalysis?.moveValueScore === null ||
                  visibleAnalysis?.moveValueScore === undefined
                    ? "Open"
                    : `${visibleAnalysis.moveValueScore}%`}{" "}
                  job value
                </span>
                <span>{job.pursuit ? titleCase(job.pursuit.state) : "Not pursued"}</span>
              </div>
              <ArrowRight className="wa-job-arrow" size={21} aria-hidden="true" />
            </button>
          );
        }) : (
          <div className="wa-empty-card">
            <Briefcase size={28} weight="duotone" />
            <h2>No job has cleared source verification yet.</h2>
            <p>Add a direct employer URL above. Way Ahead will keep the source and the decision separate.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PursuitView({
  actor,
  opportunity,
  pursuedJobs,
  requestedJobId,
  onSelectOpportunity,
  navigate,
  onRefresh,
}: {
  actor: FounderActor;
  opportunity: OpportunityRecord | null;
  pursuedJobs: OpportunityRecord[];
  requestedJobId: string | null;
  onSelectOpportunity: (jobId: string) => void;
  navigate: (
    view: ViewKey,
    jobId?: string,
    studio?: StudioKey,
    documentId?: string,
  ) => void;
  onRefresh: () => Promise<void>;
}) {
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<FormMessage | null>(null);
  const [starterBusy, setStarterBusy] = useState(false);
  const [starterMessage, setStarterMessage] = useState<FormMessage | null>(null);
  const nameParts = actor.displayName.trim().split(/\s+/).filter(Boolean);
  const initialPackageAnswers = opportunity?.pursuit?.package?.answers ?? {};
  const initialQuestionFields = applicationQuestionFields(
    opportunity?.sourceVersion?.facts ?? {},
  );
  const [draftAnswers, setDraftAnswers] = useState<Record<string, unknown>>(() => {
    const semanticDefaults: Record<string, unknown> = {
      firstName: nameParts[0] ?? "",
      lastName: nameParts.slice(1).join(" "),
      email: actor.email,
    };
    return Object.fromEntries(
      initialQuestionFields.flatMap((field) => {
        if (field.isFileUpload || field.unsupportedReason) return [];
        const exactValue = initialPackageAnswers[field.key];
        const legacyValue = initialPackageAnswers[field.semanticKey];
        let value =
          exactValue !== undefined
            ? exactValue
            : legacyValue !== undefined
              ? legacyValue
              : semanticDefaults[field.semanticKey];
        if (field.options.length && typeof value === "boolean") {
          const expected = value ? "yes" : "no";
          value = field.options.find(
            (option) =>
              option.label.trim().toLowerCase() === expected ||
              option.value.trim().toLowerCase() === expected,
          )?.value;
        }
        return value === undefined ? [] : [[field.key, value]];
      }),
    );
  });
  const [includeCoverLetter, setIncludeCoverLetter] = useState(
    Boolean(
      opportunity?.pursuit?.package &&
        outboundManifestAssets(
          opportunity.pursuit.package.assetManifest,
        ).some((asset) => asset.type === "cover_letter"),
    ),
  );
  const [packageBusy, setPackageBusy] = useState(false);
  const [packageMessage, setPackageMessage] = useState<FormMessage | null>(null);
  const [assetReviewBusy, setAssetReviewBusy] = useState<string | null>(null);
  const [assetReviewChecks, setAssetReviewChecks] = useState<Record<string, boolean>>({});
  const [eventType, setEventType] =
    useState<PursuitEventType>("application_submitted");
  const [eventOccurredAt, setEventOccurredAt] = useState(
    localDateTimeInputValue,
  );
  const [eventNote, setEventNote] = useState("");
  const [eventBaseCompensation, setEventBaseCompensation] = useState("");
  const [eventCurrency, setEventCurrency] = useState("USD");
  const [eventSubmissionSource, setEventSubmissionSource] = useState<
    "" | "approved_package" | "outside_way_ahead"
  >("");
  const [renderedAt] = useState(() => Date.now());
  const [eventConstraintNow, setEventConstraintNow] = useState(() =>
    Date.now(),
  );
  const [eventConfirmed, setEventConfirmed] = useState(false);
  const [eventBusy, setEventBusy] = useState(false);
  const [eventMessage, setEventMessage] = useState<FormMessage | null>(null);
  if (requestedJobId && !opportunity) {
    return (
      <div className="wa-page">
        <section className="wa-state-panel wa-state-error" role="alert">
          <WarningCircle size={30} weight="fill" aria-hidden="true" />
          <p className="wa-eyebrow">Pursuit unavailable</p>
          <h1>This pursuit is not in your workspace.</h1>
          <p>
            The link may be stale, or it may belong to another private
            workspace. No different pursuit was substituted.
          </p>
          <button
            className="wa-primary-button"
            type="button"
            onClick={() => navigate("pursuit")}
          >
            Return to Pursuits
          </button>
        </section>
      </div>
    );
  }
  if (!opportunity?.pursuit) {
    return (
      <div className="wa-page"><div className="wa-empty-card"><Target size={30} weight="duotone" /><h1>No pursuit is active.</h1><p>Review verified jobs and start only the one that is worth the effort.</p><button className="wa-primary-button" type="button" onClick={() => navigate("jobs")}>Review jobs <ArrowRight size={19} /></button></div></div>
    );
  }
  const { pursuit } = opportunity;
  const packageRecord = pursuit.package;
  const blockers = packageRecord?.blockers ?? [];
  const sourceVersion = opportunity.sourceVersion;
  const sourceFacts = sourceVersion?.facts ?? {};
  const questionFields = applicationQuestionFields(sourceFacts);
  const answerFields = questionFields.filter(
    (field) => !field.isFileUpload && !field.unsupportedReason,
  );
  const answerLabels = new Map(
    answerFields.map((field) => [field.key, field.label]),
  );
  const acceptsCoverLetter = sourceAcceptsAsset(sourceFacts, "cover_letter");
  const requiresCoverLetter = sourceRequiresAsset(sourceFacts, "cover_letter");
  const manifestAssets = packageRecord ? outboundManifestAssets(packageRecord.assetManifest) : [];
  const rawManifestAssets = packageRecord?.assetManifest.assets;
  const sourceRecheck =
    packageRecord?.assetManifest.sourceRecheck &&
    typeof packageRecord.assetManifest.sourceRecheck === "object" &&
    !Array.isArray(packageRecord.assetManifest.sourceRecheck)
      ? (packageRecord.assetManifest.sourceRecheck as Record<string, unknown>)
      : null;
  const sourceRecheckAuditEventId =
    typeof sourceRecheck?.auditEventId === "string"
      ? sourceRecheck.auditEventId
      : "";
  const sourceRecheckPostingCheckedAt =
    typeof sourceRecheck?.postingLastCheckedAt === "number"
      ? sourceRecheck.postingLastCheckedAt
      : null;
  const sourceRecheckVerifiedAt =
    typeof sourceRecheck?.verifiedAt === "number"
      ? sourceRecheck.verifiedAt
      : null;
  const sourceRecheckDescriptionChecksum =
    typeof sourceRecheck?.descriptionChecksum === "string"
      ? sourceRecheck.descriptionChecksum
      : "";
  const answers = packageRecord?.answers ?? {};
  const questionSetChecksum = typeof answers.questionSetChecksum === "string" ? answers.questionSetChecksum : "";
  const answerEntries = Object.entries(answers).filter(([key]) => key !== "questionSetChecksum");
  const outboundTypes = new Set(manifestAssets.map((asset) => asset.type));
  const coverLetterCount = manifestAssets.filter(
    (asset) => asset.type === "cover_letter",
  ).length;
  const manifestReviewable = Array.isArray(rawManifestAssets)
    && rawManifestAssets.length >= 1
    && rawManifestAssets.length <= 2
    && manifestAssets.length === rawManifestAssets.length
    && outboundTypes.has("resume")
    && coverLetterCount <= 1
    && (!requiresCoverLetter || coverLetterCount === 1)
    && (coverLetterCount === 0 || acceptsCoverLetter)
    && new Set(manifestAssets.map((asset) => asset.id)).size === manifestAssets.length
    && manifestAssets.every((asset) =>
      Boolean(asset.id.trim())
      && Boolean(asset.filename.trim())
      && Number.isInteger(asset.version)
      && (asset.version ?? 0) > 0
      && Number.isInteger(asset.pageCount)
      && (asset.pageCount ?? 0) > 0
      && asset.reviewState === "claim_safe"
      && SHA256_PATTERN.test(asset.contentSha256)
      && SHA256_PATTERN.test(asset.fileSha256));
  const formAnswerGaps = sourceVersion
    ? requiredApplicationGaps(sourceFacts, answers, outboundTypes)
    : ["The employer question set is unavailable."];
  const invalidAnswers = sourceVersion
    ? invalidApplicationAnswers(sourceFacts, answers)
    : [];
  const sourceQuestionSetChecksum = typeof sourceVersion?.facts.questionSetChecksum === "string"
    ? sourceVersion.facts.questionSetChecksum
    : "";
  const answersReviewable = SHA256_PATTERN.test(questionSetChecksum)
    && questionSetChecksum === sourceQuestionSetChecksum
    && formAnswerGaps.length === 0
    && invalidAnswers.length === 0;
  const expectedDestination =
    typeof sourceFacts.applyUrl === "string" && sourceFacts.applyUrl
      ? normalizedAbsoluteUrl(sourceFacts.applyUrl)
      : typeof sourceFacts.canonicalUrl === "string" && sourceFacts.canonicalUrl
        ? normalizedAbsoluteUrl(sourceFacts.canonicalUrl)
        : normalizedAbsoluteUrl(opportunity.canonicalUrl);
  const sourceReviewable = Boolean(
    packageRecord
      && sourceVersion?.id
      && packageRecord.jobPostingVersionId === sourceVersion.id
      && SHA256_PATTERN.test(sourceVersion.checksum)
      && sourceVersion.checkedAt
      && sourceVersion.captureState === "verified"
      && Boolean(sourceRecheckAuditEventId)
      && sourceRecheckDescriptionChecksum === sourceVersion.checksum
      && sourceRecheckPostingCheckedAt !== null
      && sourceRecheckVerifiedAt !== null
      && sourceRecheckPostingCheckedAt >= renderedAt - 24 * 60 * 60 * 1000
      && sourceRecheckPostingCheckedAt <= renderedAt + 5 * 60 * 1000
      && Math.abs(sourceRecheckVerifiedAt - sourceRecheckPostingCheckedAt)
        <= 5 * 60 * 1000
      && packageRecord.destinationUrl === expectedDestination,
  );
  const packageFingerprintReviewable = Boolean(
    packageRecord
      && Number.isInteger(packageRecord.version)
      && packageRecord.version > 0
      && SHA256_PATTERN.test(packageRecord.payloadSha256),
  );
  const reviewGaps = [
    !packageFingerprintReviewable ? "The package version or fingerprint is invalid." : null,
    !sourceReviewable ? "The package is not bound to the current reviewable employer source and destination." : null,
    !answersReviewable ? "The exact answers or employer form version receipt is incomplete." : null,
    ...formAnswerGaps.map(
      (label) => `Required employer-form item unresolved: ${label}`,
    ),
    ...invalidAnswers,
    !manifestReviewable ? "The exact outbound file manifest is incomplete." : null,
  ].filter((value): value is string => Boolean(value));
  const approvalWorkflowEnabled = true;
  const canApprove = Boolean(
    approvalWorkflowEnabled
      && packageRecord
      && pursuit.state === "ready_for_approval"
      && packageRecord.readinessState === "ready_for_review"
      && blockers.length === 0
      && reviewGaps.length === 0
      && packageRecord.approvalState === "not_approved",
  );

  const ensureStarters = async () => {
    setStarterBusy(true);
    setStarterMessage(null);
    try {
      const response = await fetch("/api/pursuits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId: opportunity.id }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(
          result.error ?? "The editable document starters could not be built.",
        );
      }
      await onRefresh();
      setStarterMessage({
        text: "Job-specific resume and cover-letter starters are ready to edit.",
        kind: "success",
      });
    } catch (starterError) {
      setStarterMessage({
        text:
          starterError instanceof Error
            ? starterError.message
            : "The editable document starters could not be built.",
        kind: "error",
      });
    } finally {
      setStarterBusy(false);
    }
  };

  const reviewAsset = async (assetId: string) => {
    if (!assetReviewChecks[assetId]) return;
    setAssetReviewBusy(assetId);
    setPackageMessage(null);
    try {
      const response = await fetch("/api/pursuit-assets/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          confirmation: "confirm_claim_safe_file",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(
          result.error ?? "The application file review could not be recorded.",
        );
      }
      setPackageMessage({
        text: "Exact PDF review recorded. This file can now be considered for a new package version.",
        kind: "success",
      });
      setAssetReviewChecks((current) => ({ ...current, [assetId]: false }));
      await onRefresh();
    } catch (assetError) {
      setPackageMessage({
        text:
          assetError instanceof Error
            ? assetError.message
            : "The application file review could not be recorded.",
        kind: "error",
      });
    } finally {
      setAssetReviewBusy(null);
    }
  };

  const buildPackage = async (event: React.FormEvent) => {
    event.preventDefault();
    setPackageBusy(true);
    setPackageMessage(null);
    try {
      const response = await fetch("/api/application-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pursuitId: pursuit.id,
          answers: draftAnswers,
          includeCoverLetter,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        applicationPackage?: {
          readinessState: "blocked" | "ready_for_review";
          blockers: string[];
        };
      };
      if (!response.ok || !result.applicationPackage) {
        throw new Error(
          result.error ?? "The exact application package could not be built.",
        );
      }
      await onRefresh();
      setPackageMessage({
        text:
          result.applicationPackage.readinessState === "ready_for_review"
            ? "A new immutable package version is ready for exact review."
            : `A blocked package receipt was saved with ${result.applicationPackage.blockers.length} issue${result.applicationPackage.blockers.length === 1 ? "" : "s"} to resolve.`,
        kind:
          result.applicationPackage.readinessState === "ready_for_review"
            ? "success"
            : "error",
      });
    } catch (packageError) {
      setPackageMessage({
        text:
          packageError instanceof Error
            ? packageError.message
            : "The exact application package could not be built.",
        kind: "error",
      });
    } finally {
      setPackageBusy(false);
    }
  };

  const recordEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!eventConfirmed) return;
    setEventBusy(true);
    setEventMessage(null);
    const occurredAt = new Date(eventOccurredAt).getTime();
    const metadata: Record<string, unknown> = {};
    if (eventType === "application_submitted") {
      if (
        eventSubmissionSource === "approved_package" &&
        packageRecord?.approvalState === "approved"
      ) {
        metadata.packageId = packageRecord.id;
      } else if (eventSubmissionSource === "outside_way_ahead") {
        metadata.reportedOutsideWayAhead = true;
      }
    }
    if (eventType === "offer_received") {
      metadata.baseCompensation = Number(eventBaseCompensation);
      metadata.currency = eventCurrency;
    }
    try {
      const response = await fetch("/api/pursuit-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pursuitId: pursuit.id,
          type: eventType,
          occurredAt,
          note: eventNote,
          metadata,
          confirmation: eventConfirmed ? "record_member_reported_event" : "",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(
          result.error ?? "The pursuit update could not be recorded.",
        );
      }
      setEventNote("");
      setEventSubmissionSource("");
      setEventConfirmed(false);
      setEventMessage({
        text: "Member-reported pursuit update recorded. Way Ahead did not perform an external action.",
        kind: "success",
      });
      await onRefresh();
    } catch (eventError) {
      setEventMessage({
        text:
          eventError instanceof Error
            ? eventError.message
            : "The pursuit update could not be recorded.",
        kind: "error",
      });
    } finally {
      setEventBusy(false);
    }
  };

  const recordApproval = async () => {
    if (!packageRecord || !approvalChecked) return;
    setApprovalBusy(true);
    setApprovalMessage(null);
    try {
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: packageRecord.id,
          payloadSha256: packageRecord.payloadSha256,
          confirmation: "approve_application_package",
          expectedRevision: pursuit.revision,
          attestationVersion: "application-package-staging-v1",
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The approval could not be recorded.");
      setApprovalMessage({ text: "Package and form-staging approval recorded. No form was populated, no file was uploaded, and no application was submitted.", kind: "success" });
      await onRefresh();
    } catch (approvalError) {
      setApprovalMessage({ text: approvalError instanceof Error ? approvalError.message : "The approval could not be recorded.", kind: "error" });
    } finally {
      setApprovalBusy(false);
    }
  };
  return (
    <div className="wa-page">
      {pursuedJobs.length > 1 ? (
        <label className="wa-pursuit-switcher">
          <span>Active pursuit</span>
          <select value={pursuit.id} onChange={(event) => onSelectOpportunity(event.target.value)}>
            {pursuedJobs.map((job) => <option key={job.pursuit?.id ?? job.id} value={job.pursuit?.id ?? job.id}>{job.title} · {job.employer}</option>)}
          </select>
        </label>
      ) : null}
      <section className="wa-page-heading wa-pursuit-heading">
        <div><p className="wa-eyebrow">{opportunity.employer} · Active pursuit</p><h1>{opportunity.title}</h1></div>
        <div className="wa-pursuit-statuses">
          <span className="wa-status wa-status-partial">
            Pursuit: {titleCase(pursuit.state)}
          </span>
          <span className={`wa-status wa-status-${packageRecord?.readinessState === "ready_for_review" ? "verified" : "conflict"}`}>
            Package: {titleCase(packageRecord?.readinessState ?? "not started")}
          </span>
        </div>
      </section>
      <div className="wa-pursuit-banner">
        <div><span>Next action</span><strong>{pursuit.nextAction ?? "Review the current evidence and assets."}</strong></div>
        <div>
          <span>External action</span>
          <strong>
            {packageRecord?.approvalState === "approved"
              ? "Exact package approved for manual staging only"
              : packageRecord?.approvalState === "completed"
                ? "Approval consumed by the recorded application"
              : "Not authorized"}
          </strong>
        </div>
      </div>

      <section className="wa-section">
        <div className="wa-section-heading">
          <div>
            <p className="wa-eyebrow">Editable starters</p>
            <h2>Prepare the strongest truthful case for this job.</h2>
            <p>
              Starters are bound to this pursuit and your confirmed profile.
              Employer requirements have not been used unless their exact
              provenance is shown.
            </p>
          </div>
        </div>
        {pursuit.starters.resume && pursuit.starters.coverLetter ? (
          <div className="wa-starter-grid">
            <article>
              <FileText size={23} weight="duotone" aria-hidden="true" />
              <div>
                <strong>Job-specific resume</strong>
                <span>
                  {pursuit.starters.resume.name} · Version{" "}
                  {pursuit.starters.resume.version}
                </span>
                <small>
                  {titleCase(pursuit.starters.resume.reviewState)}
                </small>
              </div>
              <button
                className="wa-secondary-button"
                type="button"
                onClick={() =>
                  navigate(
                    "studio",
                    undefined,
                    "resume",
                    pursuit.starters.resume?.id,
                  )
                }
              >
                Edit resume
              </button>
            </article>
            <article>
              <FileText size={23} weight="duotone" aria-hidden="true" />
              <div>
                <strong>Cover-letter outline</strong>
                <span>
                  Bound to {opportunity.employer} · Version{" "}
                  {pursuit.starters.coverLetter.version}
                </span>
                <small>
                  {titleCase(pursuit.starters.coverLetter.reviewState)}
                </small>
              </div>
              <button
                className="wa-secondary-button"
                type="button"
                onClick={() =>
                  navigate(
                    "studio",
                    undefined,
                    "cover",
                    pursuit.starters.coverLetter?.id,
                  )
                }
              >
                Edit cover letter
              </button>
            </article>
          </div>
        ) : (
          <div className="wa-starter-recovery">
            <p>
              One or more editable starters are missing. Build them from the
              current source-bound pursuit and confirmed profile.
            </p>
            <button
              className="wa-primary-button"
              type="button"
              disabled={starterBusy}
              onClick={ensureStarters}
            >
              {starterBusy ? "Building…" : "Build editable starters"}
            </button>
          </div>
        )}
        <FormFeedback message={starterMessage} />
        <small className="wa-muted">
          Nothing here populates an employer form, uploads a file, or submits
          an application.
        </small>
      </section>

      <section className="wa-section">
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Application assets</p><h2>Build a truthful story for this role.</h2><p>Profile-built starters use confirmed career evidence and the selected employer and title. Review the current posting and tailor every claim before claim-safe package review becomes available.</p></div><span>{pursuit.assets.length} stored</span></div>
        <div className="wa-asset-list">
          {pursuit.assets.length ? pursuit.assets.map((asset) => <AssetCard key={asset.id} asset={asset} />) : (
            <div className="wa-empty-inline"><FileText size={24} /><span>No role-specific asset has passed into this pursuit yet.</span></div>
          )}
        </div>
        {pursuit.assets.some(
          (asset) =>
            asset.reviewState === "draft" &&
            asset.invalidatedAt === null &&
            asset.filename?.toLowerCase().endsWith(".pdf") &&
            Boolean(asset.pageCount),
        ) ? (
          <div className="wa-file-review-list">
            <h3>Review downloaded PDFs</h3>
            <p>
              Open each downloaded file and inspect every page. This is a
              human review receipt, not automated proof that the visual output
              is correct.
            </p>
            {pursuit.assets
              .filter(
                (asset) =>
                  asset.reviewState === "draft" &&
                  asset.invalidatedAt === null &&
                  asset.filename?.toLowerCase().endsWith(".pdf") &&
                  Boolean(asset.pageCount),
              )
              .map((asset) => (
                <article key={asset.id} className="wa-file-review">
                  <div>
                    <strong>{asset.filename}</strong>
                    <span>
                      {asset.pageCount} page{asset.pageCount === 1 ? "" : "s"} ·
                      Version {asset.version}
                    </span>
                  </div>
                  <label className="wa-checkbox-row">
                    <input
                      type="checkbox"
                      checked={assetReviewChecks[asset.id] === true}
                      onChange={(event) =>
                        setAssetReviewChecks((current) => ({
                          ...current,
                          [asset.id]: event.target.checked,
                        }))
                      }
                    />
                    I reviewed this exact PDF and every career claim is
                    accurate.
                  </label>
                  <button
                    className="wa-secondary-button"
                    type="button"
                    disabled={
                      assetReviewBusy === asset.id ||
                      assetReviewChecks[asset.id] !== true
                    }
                    onClick={() => void reviewAsset(asset.id)}
                  >
                    {assetReviewBusy === asset.id
                      ? "Recording…"
                      : "Mark exact PDF claim-safe"}
                  </button>
                </article>
              ))}
          </div>
        ) : null}
        <FormFeedback message={packageMessage} />
      </section>

      <section className="wa-section">
        <div className="wa-section-heading">
          <div>
            <p className="wa-eyebrow">Application package</p>
            <h2>Bind the exact answers and files before any approval.</h2>
            <p>
              Way Ahead reads the employer&apos;s current question set,
              validates required answers and upload slots, and computes the
              package fingerprint on the server.
            </p>
          </div>
          <span>
            {sourceVersion?.captureState === "verified"
              ? "Source verified"
              : "Source blocked"}
          </span>
        </div>
        <form className="wa-package-builder" onSubmit={buildPackage}>
          {answerFields.length ? (
            <div className="wa-form-grid">
              {answerFields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  {field.options.length ? (
                    <select
                      value={
                        typeof draftAnswers[field.key] === "string"
                          ? String(draftAnswers[field.key])
                          : ""
                      }
                      onChange={(event) =>
                        setDraftAnswers((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      required={field.required}
                    >
                      <option value="">Choose an employer option</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : isBooleanApplicationQuestion(field) ? (
                    <select
                      value={
                        typeof draftAnswers[field.key] === "boolean"
                          ? draftAnswers[field.key]
                            ? "yes"
                            : "no"
                          : ""
                      }
                      onChange={(event) =>
                        setDraftAnswers((current) => {
                          const next = { ...current };
                          if (!event.target.value) delete next[field.key];
                          else next[field.key] = event.target.value === "yes";
                          return next;
                        })
                      }
                      required={field.required}
                    >
                      <option value="">Choose Yes or No</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  ) : (
                    <input
                      type={
                        field.semanticKey === "email"
                          ? "email"
                          : field.semanticKey === "phone"
                            ? "tel"
                            : field.semanticKey === "linkedInProfile"
                              ? "url"
                              : "text"
                      }
                      value={
                        typeof draftAnswers[field.key] === "string" ||
                        typeof draftAnswers[field.key] === "number"
                          ? String(draftAnswers[field.key])
                          : ""
                      }
                      onChange={(event) =>
                        setDraftAnswers((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      required={field.required}
                    />
                  )}
                </label>
              ))}
            </div>
          ) : (
            <div className="wa-recorded-risks">
              <strong>Employer form receipt unavailable</strong>
              <p>
                This source does not expose a verified question set. Way Ahead
                will save a blocked receipt rather than invent an application
                form.
              </p>
            </div>
          )}
          {acceptsCoverLetter ? (
            <label className="wa-checkbox-row">
              <input
                type="checkbox"
                checked={includeCoverLetter || requiresCoverLetter}
                disabled={requiresCoverLetter}
                onChange={(event) =>
                  setIncludeCoverLetter(event.target.checked)
                }
              />
              {requiresCoverLetter
                ? "The current employer form requires a cover letter."
                : "Include my reviewed cover letter in this package."}
            </label>
          ) : (
            <p className="wa-muted">
              The current employer form does not expose a cover-letter upload
              slot, so the package will use the reviewed resume only.
            </p>
          )}
          <button
            className="wa-primary-button"
            type="submit"
            disabled={packageBusy}
          >
            {packageBusy
              ? "Building exact package…"
              : "Build new immutable package version"}
          </button>
          <small>
            Building a package does not populate an employer form, upload a
            file, or submit an application.
          </small>
        </form>
      </section>

      <section className="wa-section wa-approval-section">
        <div>
          <p className="wa-eyebrow">Exact action gate</p>
          <h2>
            {!packageRecord
              ? "Build and review the exact package before approval."
              : blockers.length || reviewGaps.length
                ? "Approval stays locked until the package is internally consistent."
                : "This exact package is ready for your decision."}
          </h2>
          <p>
            Approval binds only this employer destination, source and form
            version, answer set, filenames, asset versions, and fingerprint.
            It authorizes manual staging review only. Population, upload, and
            submission remain unavailable.
          </p>
        </div>
        {packageRecord ? (
          <div className="wa-package-card">
            <div><span>Package fingerprint</span><code className="wa-hash-code">{packageRecord.payloadSha256}</code></div>
            <div><span>Destination</span><a href={packageRecord.destinationUrl} target="_blank" rel="noreferrer">Employer application <ArrowSquareOut size={15} /></a></div>
            <div><span>Package version</span><strong>{packageRecord.version}</strong></div>
            <section className="wa-package-review-block" aria-labelledby="source-version-heading">
              <h3 id="source-version-heading">Employer source receipt</h3>
              <dl className="wa-review-list">
                <div><dt>Job record</dt><dd><code>{opportunity.id}</code></dd></div>
                <div><dt>Package-bound version</dt><dd><code>{packageRecord.jobPostingVersionId || "Missing"}</code></dd></div>
                <div><dt>Current source version</dt><dd><code>{sourceVersion?.id ?? "Missing"}</code></dd></div>
                <div><dt>Source checksum</dt><dd><code className="wa-hash-code">{sourceVersion?.checksum ?? "Missing"}</code></dd></div>
                <div><dt>Checked at</dt><dd>{sourceVersion?.checkedAt ? new Date(sourceVersion.checkedAt).toLocaleString() : "Missing"}</dd></div>
                <div><dt>Canonical recheck</dt><dd>{sourceRecheckPostingCheckedAt ? new Date(sourceRecheckPostingCheckedAt).toLocaleString() : "Missing"}</dd></div>
                <div><dt>Recheck receipt</dt><dd><code className="wa-hash-code">{sourceRecheckAuditEventId || "Missing"}</code></dd></div>
              </dl>
              {sourceVersion?.conflicts.length ? (
                <div className="wa-recorded-risks">
                  <strong>Recorded source conflict</strong>
                  <ul>{sourceVersion.conflicts.map((conflict) => <li key={conflict}>{conflict}</li>)}</ul>
                </div>
              ) : null}
            </section>
            <section className="wa-package-review-block" aria-labelledby="answers-heading">
              <h3 id="answers-heading">Exact employer-form answers</h3>
              <dl className="wa-review-list">
                {answerEntries.map(([key, value]) => <div key={key}><dt>{answerLabels.get(key) ?? answerLabel(key)}</dt><dd>{reviewValue(value)}</dd></div>)}
              </dl>
              <div className="wa-form-version-receipt"><span>Employer form-version receipt</span><code className="wa-hash-code">{questionSetChecksum || "Missing"}</code></div>
            </section>
            <section className="wa-package-review-block" aria-labelledby="outbound-heading">
              <h3 id="outbound-heading">Exact outbound files</h3>
              <div className="wa-outbound-list">
                {manifestAssets.map((asset) => (
                  <article key={`${asset.id}-${asset.version}`}>
                    <strong>{asset.type === "cover_letter" ? "Cover letter" : titleCase(asset.type)}</strong>
                    <dl className="wa-review-list">
                      <div><dt>Filename</dt><dd>{asset.filename || "Missing"}</dd></div>
                      <div><dt>Version</dt><dd>{asset.version ?? "Missing"}</dd></div>
                      <div><dt>Pages</dt><dd>{asset.pageCount ?? "Missing"}</dd></div>
                      <div><dt>Review state</dt><dd>{asset.reviewState ? titleCase(asset.reviewState) : "Missing"}</dd></div>
                      <div><dt>Content hash</dt><dd><code className="wa-hash-code">{asset.contentSha256 || "Missing"}</code></dd></div>
                      <div><dt>File hash</dt><dd><code className="wa-hash-code">{asset.fileSha256 || "Missing"}</code></dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
            {opportunity.analysis?.unknowns.length ? (
              <section className="wa-package-review-block" aria-labelledby="decision-risks-heading">
                <h3 id="decision-risks-heading">Recorded fit and freshness risks</h3>
                <ul>{opportunity.analysis.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul>
              </section>
            ) : null}
            {blockers.length ? <ul>{blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul> : null}
            {reviewGaps.length ? <ul>{reviewGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul> : null}
            {packageRecord.approvalState === "approved" ? (
              <div className="wa-approved-receipt"><CheckCircle size={22} weight="fill" /><span><strong>Exact package approved for form staging</strong>No employer form has been populated and no application has been submitted.</span></div>
            ) : packageRecord.approvalState === "completed" ? (
              <div className="wa-approved-receipt"><CheckCircle size={22} weight="fill" /><span><strong>Approval consumed</strong>This exact package was tied to the member-reported application at {packageRecord.completedAt ? new Date(packageRecord.completedAt).toLocaleString() : "the recorded submission time"}. It is no longer authorized for another action.</span></div>
            ) : canApprove ? (
              <div className="wa-approval-control">
                <label>
                  <input type="checkbox" checked={approvalChecked} onChange={(event) => setApprovalChecked(event.target.checked)} />
                  <span>
                    <strong>Approval attestation</strong>
                    I approve only this exact package and employer-form version for staging at {opportunity.employer}. This is not submission authorization.
                    <small>I confirm that the application history and included career evidence shown here are accurate for this exact {opportunity.employer} role.</small>
                  </span>
                </label>
                <button className="wa-primary-button" type="button" disabled={!approvalChecked || approvalBusy} onClick={recordApproval}>
                  {approvalBusy ? "Recording…" : "Approve exact package for form staging"}
                </button>
              </div>
            ) : (
              <button className="wa-primary-button" type="button" disabled>Approval unavailable</button>
            )}
            <FormFeedback message={approvalMessage} />
            <small>Way Ahead has no employer-form population, upload, outreach, or submission capability in this release.</small>
          </div>
        ) : (
          <div className="wa-empty-inline"><LockKey size={24} /><span>Build a package above to see its exact immutable review receipt.</span></div>
        )}
      </section>

      <section className="wa-section">
        <div className="wa-section-heading">
          <div>
            <p className="wa-eyebrow">Application through outcome</p>
            <h2>Manage the search, not just the documents.</h2>
            <p>
              Record what happened after you act outside Way Ahead. Events are
              append-only, member-reported receipts. The platform does not
              submit, message, schedule, negotiate, accept, or decline.
            </p>
          </div>
          <span>{pursuit.events.length} updates</span>
        </div>
        <form className="wa-pursuit-event-form" onSubmit={recordEvent}>
          <div className="wa-form-grid">
            <label>
              Update
              <select
                value={eventType}
                onChange={(event) => {
                  setEventType(event.target.value as PursuitEventType);
                  setEventSubmissionSource("");
                  setEventConstraintNow(Date.now());
                }}
              >
                <option value="application_submitted">
                  Application submitted
                </option>
                <option value="interview_scheduled">
                  Interview scheduled
                </option>
                <option value="interview_completed">
                  Interview completed
                </option>
                <option value="follow_up_scheduled">
                  Follow-up scheduled
                </option>
                <option value="offer_received">Offer received</option>
                <option value="offer_accepted">Offer accepted</option>
                <option value="offer_declined">Offer declined</option>
                <option value="rejected">Employer declined</option>
                <option value="withdrawn">I withdrew</option>
                <option value="closed_no_response">
                  Closed after no response
                </option>
                <option value="learning_recorded">Learning recorded</option>
              </select>
            </label>
            <label>
              Date and time
              <input
                type="datetime-local"
                step="1"
                value={eventOccurredAt}
                onFocus={() => setEventConstraintNow(Date.now())}
                onChange={(event) =>
                  setEventOccurredAt(event.target.value)
                }
                min={
                  eventType === "application_submitted" &&
                  eventSubmissionSource === "approved_package" &&
                  packageRecord?.approvedAt
                    ? localDateTimeInputValue(
                        new Date(packageRecord.approvedAt),
                      )
                    : localDateTimeInputValue(
                        new Date(
                          eventConstraintNow -
                            10 * 365 * 24 * 60 * 60 * 1000,
                        ),
                      )
                }
                max={
                  eventType === "interview_scheduled" ||
                  eventType === "follow_up_scheduled"
                    ? localDateTimeInputValue(
                        new Date(
                          eventConstraintNow +
                            2 * 365 * 24 * 60 * 60 * 1000,
                        ),
                      )
                    : localDateTimeInputValue(
                        new Date(eventConstraintNow),
                      )
                }
                required
              />
            </label>
            {eventType === "offer_received" ? (
              <>
                <label>
                  Base compensation
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={eventBaseCompensation}
                    onChange={(event) =>
                      setEventBaseCompensation(event.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  Currency
                  <select
                    value={eventCurrency}
                    onChange={(event) => setEventCurrency(event.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </label>
              </>
            ) : null}
          </div>
          {eventType === "application_submitted" ? (
            <fieldset className="wa-submission-source">
              <legend>Which application package did you use?</legend>
              <label>
                <input
                  type="radio"
                  name="application-submission-source"
                  value="approved_package"
                  checked={eventSubmissionSource === "approved_package"}
                  disabled={packageRecord?.approvalState !== "approved"}
                  onChange={() => {
                    const selectedAt = Date.now();
                    setEventConstraintNow(selectedAt);
                    setEventSubmissionSource("approved_package");
                    if (
                      packageRecord?.approvedAt &&
                      new Date(eventOccurredAt).getTime() <
                        packageRecord.approvedAt
                    ) {
                      setEventOccurredAt(
                        localDateTimeInputValue(new Date(selectedAt)),
                      );
                    }
                  }}
                  required
                />
                <span>
                  <strong>This exact approved package</strong>
                  <small>
                    {packageRecord?.approvalState === "approved"
                      ? `Package v${packageRecord.version} · ${packageRecord.payloadSha256.slice(0, 12)}…`
                      : "No current approved package is available."}
                  </small>
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="application-submission-source"
                  value="outside_way_ahead"
                  checked={eventSubmissionSource === "outside_way_ahead"}
                  onChange={() => {
                    setEventConstraintNow(Date.now());
                    setEventSubmissionSource("outside_way_ahead");
                  }}
                  required
                />
                <span>
                  <strong>A different or no Way Ahead package</strong>
                  <small>
                    Record the application truthfully without consuming this
                    package&apos;s approval.
                  </small>
                </span>
              </label>
            </fieldset>
          ) : null}
          <label>
            Evidence and note
            <textarea
              value={eventNote}
              onChange={(event) => setEventNote(event.target.value)}
              rows={4}
              required={
                eventType === "offer_accepted" ||
                eventType === "offer_declined"
              }
              placeholder="Record what is known. Keep assumptions and sourced feedback separate."
            />
          </label>
          <label className="wa-checkbox-row">
            <input
              type="checkbox"
              checked={eventConfirmed}
              onChange={(event) => setEventConfirmed(event.target.checked)}
              required
            />
            I confirm this is my report of what happened. Way Ahead did not
            perform the external action.
          </label>
          <button
            className="wa-primary-button"
            type="submit"
            disabled={eventBusy || !eventConfirmed}
          >
            {eventBusy ? "Recording…" : "Record pursuit update"}
          </button>
          <FormFeedback message={eventMessage} />
        </form>
        {pursuit.events.length ? (
          <ol className="wa-pursuit-timeline">
            {pursuit.events.map((event) => (
              <li key={event.id}>
                <div>
                  <strong>{titleCase(event.type)}</strong>
                  <time dateTime={new Date(event.occurredAt).toISOString()}>
                    {new Date(event.occurredAt).toLocaleDateString()}
                  </time>
                </div>
                {event.type === "offer_received" &&
                typeof event.metadata.baseCompensation === "number" ? (
                  <p>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency:
                        typeof event.metadata.currency === "string"
                          ? event.metadata.currency
                          : "USD",
                      maximumFractionDigits: 0,
                    }).format(event.metadata.baseCompensation)}
                  </p>
                ) : null}
                {event.note ? <p>{event.note}</p> : null}
                <small>Member reported · Way Ahead executed nothing</small>
              </li>
            ))}
          </ol>
        ) : (
          <div className="wa-empty-inline">
            <Target size={24} />
            <span>
              No application, interview, offer, outcome, or learning receipt
              has been recorded yet.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetRecord }) {
  const lines = getAssetText(asset);
  const current = asset.invalidatedAt === null;
  const statusVerified =
    current &&
    (asset.reviewState === "claim_safe" || asset.reviewState === "approved");
  return (
    <details className="wa-asset-card">
      <summary>
        <span className="wa-asset-icon"><FileText size={21} weight="duotone" /></span>
        <span><strong>{assetLabel(asset.type)}</strong><small>{asset.filename ?? `Version ${asset.version}`}</small></span>
        <span className={`wa-status wa-status-${statusVerified ? "verified" : "partial"}`}>{current ? titleCase(asset.reviewState) : "Needs rebuild"}</span>
        <CaretDown className="wa-asset-caret" size={18} weight="bold" aria-hidden="true" />
      </summary>
      <div className="wa-asset-content">
        {!current ? (
          <p className="wa-muted">
            Confirmed career evidence changed after this version. Rebuild and
            review it before relying on this asset.
          </p>
        ) : null}
        <div className="wa-asset-receipt"><span>Version {asset.version}</span><span>{asset.pageCount ? `${asset.pageCount} page${asset.pageCount === 1 ? "" : "s"}` : "Page count open"}</span><span>{asset.contentSha256 ? `${asset.contentSha256.slice(0, 12)}…` : "Fingerprint open"}</span></div>
        {asset.filename ? (
          <p className="wa-muted">
            The recorded filename is private. Re-render it from Studio to
            download a current, user-scoped copy.
          </p>
        ) : null}
        {lines.length ? lines.map((line, index) => <p key={`${asset.id}-${index}`}>{line}</p>) : <p className="wa-muted">Structured content is stored, but this asset has no readable text view yet.</p>}
      </div>
    </details>
  );
}

function DirectionView({ workspace, onRefresh }: { workspace: WorkspaceRecord; onRefresh: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [standard, setStandard] = useState<JobStandardRecord | null>(workspace.jobStandard);
  const [saving, setSaving] = useState(false);
  const [standardMessage, setStandardMessage] = useState<FormMessage | null>(null);
  const [pathMessage, setPathMessage] = useState<FormMessage | null>(null);
  const pathListRef = useRef<HTMLDivElement>(null);

  const choosePath = async (path: CareerPathRecord) => {
    setSaving(true);
    setPathMessage(null);
    try {
      const response = await fetch("/api/career-paths", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathId: path.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The Job Path could not be saved.");
      await onRefresh();
      setPathMessage({ text: `${path.label} is now your primary path.`, kind: "success" });
    } catch (pathError) {
      setPathMessage({ text: pathError instanceof Error ? pathError.message : "The Job Path could not be saved.", kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  const saveStandard = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!standard) return;
    setSaving(true);
    setStandardMessage(null);
    try {
      const payload = {
        payBasis: standard.payBasis,
        minimumPayCents: standard.minimumPayCents,
        targetPayCents: standard.targetPayCents,
        currency: standard.currency,
        workArrangements: standard.workArrangements,
        commuteMiles: standard.commuteMiles,
        locations: standard.locations,
        travelMaximumPercent: standard.travelMaximumPercent,
        scheduleRequirements: standard.scheduleRequirements,
        benefits: standard.benefits,
        growthPriorities: standard.growthPriorities,
        exclusions: standard.exclusions,
      };
      const response = await fetch("/api/job-standard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your job standard could not be saved.");
      await onRefresh();
      setEditing(false);
      setStandardMessage({ text: "Your job standard was saved. Dependent job scores were correctly marked for recheck.", kind: "success" });
    } catch (standardError) {
      setStandardMessage({ text: standardError instanceof Error ? standardError.message : "Your job standard could not be saved.", kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wa-page">
      <section className="wa-page-heading"><div><p className="wa-eyebrow">Your decision rules</p><h1>Define what makes the next job worth it.</h1></div><p>Way Ahead uses this standard to separate attractive titles from moves that improve your life.</p></section>
      <section className="wa-section wa-standard-section">
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Job Standard</p><h2>Your non-negotiables and upside.</h2></div>{standard ? <button className="wa-secondary-button" type="button" onClick={() => { setStandardMessage(null); setEditing((value) => !value); }}>{editing ? "Cancel" : "Edit standard"}</button> : null}</div>
        {standard && editing ? (
          <form className="wa-standard-form" onSubmit={saveStandard} aria-describedby="job-standard-feedback">
            <label>Minimum base pay<input type="number" min="0" step="1000" value={(standard.minimumPayCents ?? 0) / 100} onChange={(event) => setStandard({ ...standard, minimumPayCents: Number(event.target.value) * 100 })} /></label>
            <label>Target base pay<input type="number" min="0" step="1000" value={(standard.targetPayCents ?? 0) / 100} onChange={(event) => setStandard({ ...standard, targetPayCents: Number(event.target.value) * 100 })} /></label>
            <label>Maximum commute (miles)<input type="number" min="0" max="500" value={standard.commuteMiles ?? ""} onChange={(event) => setStandard({ ...standard, commuteMiles: event.target.value ? Number(event.target.value) : null })} /></label>
            <label>Maximum travel (%)<input type="number" min="0" max="100" value={standard.travelMaximumPercent ?? ""} onChange={(event) => setStandard({ ...standard, travelMaximumPercent: event.target.value ? Number(event.target.value) : null })} /></label>
            <div className="wa-form-actions"><button className="wa-primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save and recheck jobs"}</button></div>
          </form>
        ) : standard ? (
          <div className="wa-standard-grid">
            <div><span>Compensation</span><strong>{money(standard.minimumPayCents)} minimum</strong><small>{money(standard.targetPayCents)} target</small></div>
            <div><span>Work setup</span><strong>{standard.workArrangements.join(" · ") || "Open"}</strong><small>{standard.locations.join(" · ") || "Location open"}</small></div>
            <div><span>Commute</span><strong>{standard.commuteMiles === null ? "Open" : `${standard.commuteMiles} miles maximum`}</strong><small>{standard.travelMaximumPercent === null ? "Travel open" : `${standard.travelMaximumPercent}% travel maximum`}</small></div>
            <div><span>Benefits</span><strong>{standard.benefits.slice(0, 2).join(" · ") || "Open"}</strong><small>{standard.benefits.slice(2).join(" · ")}</small></div>
          </div>
        ) : <div className="wa-empty-inline"><WarningCircle size={24} /><span>Your Job Standard has not been stored yet.</span></div>}
        <FormFeedback message={standardMessage} id="job-standard-feedback" />
      </section>

      <section className="wa-section">
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Job Paths</p><h2>Choose a primary role family without giving up credible options.</h2></div><span>{workspace.careerPaths.filter((path) => path.state === "active").length} active</span></div>
        <div className="wa-path-list" role="radiogroup" aria-label="Primary Job Path" ref={pathListRef}>
          {workspace.careerPaths.map((path, index) => (
            <button
              key={path.id}
              type="button"
              className={path.isPrimary ? "wa-path-card is-primary" : "wa-path-card"}
              role="radio"
              aria-checked={path.isPrimary}
              tabIndex={path.isPrimary || (!workspace.careerPaths.some((candidate) => candidate.isPrimary) && index === 0) ? 0 : -1}
              onClick={() => choosePath(path)}
              onKeyDown={(event) => {
                const movement = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
                if (!movement) return;
                event.preventDefault();
                const nextIndex = (index + movement + workspace.careerPaths.length) % workspace.careerPaths.length;
                const nextButton = pathListRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex];
                nextButton?.focus();
                void choosePath(workspace.careerPaths[nextIndex]);
              }}
              disabled={saving}
            >
              <span className="wa-radio-indicator" aria-hidden="true" />
              <span className="wa-path-copy"><strong>{path.label}</strong><small>{typeof path.rationale?.summary === "string" ? path.rationale.summary : `${path.primaryLane.replaceAll("_", " ")} evidence lane`}</small></span>
              <span className="wa-path-score"><strong>{path.fitScore ?? "Open"}</strong><small>fit</small></span>
            </button>
          ))}
        </div>
        <FormFeedback message={pathMessage} id="career-path-feedback" />
      </section>
    </div>
  );
}

function FormFeedback({ message, id }: { message: FormMessage | null; id?: string }) {
  if (!message) return null;
  return (
    <p
      className={`wa-form-message ${message.kind === "error" ? "is-error" : "is-success"}`}
      id={id}
      role={message.kind === "error" ? "alert" : "status"}
    >
      {message.text}
    </p>
  );
}

function ProfileView({
  workspace,
  onRefresh,
}: {
  workspace: WorkspaceRecord;
  onRefresh: () => Promise<void>;
}) {
  const currentConflicts = workspace.profile.experiences.filter((role) => role.isCurrent && role.reviewState === "conflict");
  return (
    <div className="wa-page">
      <section className="wa-profile-hero">
        <div className="wa-profile-avatar" aria-hidden="true">{workspace.profile.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
        <div><p className="wa-eyebrow">Career record</p><h1>{workspace.profile.displayName}</h1><p>{workspace.profile.headline ?? "Profile headline needs confirmation."}</p></div>
        <div className="wa-profile-proof"><span>{workspace.profile.confirmedFactCount}</span><small>confirmed facts</small></div>
      </section>
      {currentConflicts.length ? (
        <div className="wa-alert wa-alert-warning"><WarningCircle size={24} weight="fill" /><div><strong>Current-work timeline needs a decision</strong>{currentConflicts.map((role) => <span key={role.id}>{role.title} at {role.employer} is marked as current and conflicting.</span>)}</div></div>
      ) : null}
      <section className="wa-section wa-profile-source">
        <div className="wa-section-heading">
          <div>
            <p className="wa-eyebrow">Source record</p>
            <h2>Add or update the experience behind your profile.</h2>
          </div>
          <a
            className="wa-secondary-button"
            href="/app/onboarding/experience"
          >
            Import or paste a source
          </a>
        </div>
        <p className="wa-muted">
          Upload a PDF or DOCX, paste your career history, or enter a role.
          Files are read on this device. Imported text remains source material
          until you structure and confirm the role facts Way Ahead may rely on.
        </p>
      </section>
      <section className="wa-section wa-profile-summary"><p className="wa-eyebrow">Positioning</p><h2>{workspace.profile.summary ?? "Your confirmed professional summary has not been stored yet."}</h2></section>
      <CareerEvidenceManager
        roles={workspace.profile.experiences}
        removedRoles={workspace.profile.removedExperiences}
        onRefresh={onRefresh}
      />
      <section className="wa-section">
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Skills evidence</p><h2>What the record can credibly support.</h2></div><span>{workspace.profile.skills.length} tracked</span></div>
        <div className="wa-skill-cloud">{workspace.profile.skills.map((skill) => <span key={skill.id}>{skill.name}<small>{skill.level ?? skill.reviewState}</small></span>)}</div>
      </section>
    </div>
  );
}
