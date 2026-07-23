"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Briefcase,
  CaretDown,
  CheckCircle,
  Compass,
  Database,
  Desktop,
  FileText,
  LockKey,
  Moon,
  Plus,
  RoadHorizon,
  ShieldCheck,
  SignOut,
  Sun,
  Target,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssetRecord,
  CareerPathRecord,
  FounderActor,
  JobStandardRecord,
  OpportunityRecord,
  WorkspaceRecord,
} from "./production-types";

type ViewKey = "today" | "jobs" | "pursuit" | "direction" | "profile";
type ThemeChoice = "light" | "dark" | "system";
type FormMessage = { text: string; kind: "success" | "error" };

const NAVIGATION: Array<{
  key: ViewKey;
  label: string;
  icon: typeof Compass;
}> = [
  { key: "today", label: "Today", icon: Compass },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "pursuit", label: "Pursuit", icon: Target },
  { key: "direction", label: "Direction", icon: RoadHorizon },
  { key: "profile", label: "Profile", icon: UserCircle },
];

const THEMES: Array<{ value: ThemeChoice; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Desktop },
];

function currentView(): ViewKey {
  if (typeof window === "undefined") return "today";
  const view = new URLSearchParams(window.location.search).get("view");
  return NAVIGATION.some((item) => item.key === view) ? (view as ViewKey) : "today";
}

function applyTheme(choice: ThemeChoice) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = choice === "system" ? (systemDark ? "dark" : "light") : choice;
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

function shortDate(value: number | null): string {
  if (!value) return "Not reported";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(value);
}

function scoreLabel(score: number | null): string {
  return score === null ? "Open" : String(score);
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

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

function hasReviewableAnswer(answers: Record<string, unknown>, key: string): boolean {
  if (!Object.prototype.hasOwnProperty.call(answers, key)) return false;
  const value = answers[key];
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === "object");
}

function formAnswerKeys(label: string, fieldNames: string[]): string[] {
  const normalizedLabel = label.toLowerCase();
  const keys = fieldNames.flatMap((name) => {
    const bracketValue = name.match(/\[([^\]]+)\]$/)?.[1] ?? name;
    const camel = bracketValue.replace(/_([a-z])/g, (_, character: string) => character.toUpperCase());
    return [name, bracketValue, camel];
  });
  if (normalizedLabel.includes("first name")) keys.push("firstName");
  if (normalizedLabel.includes("last name")) keys.push("lastName");
  if (normalizedLabel.includes("email")) keys.push("email");
  if (normalizedLabel.includes("phone")) keys.push("phone");
  if (normalizedLabel.includes("linkedin")) keys.push("linkedInProfile");
  if (normalizedLabel.includes("sponsor")) keys.push("requiresSponsorship");
  return [...new Set(keys)];
}

function requiredFormAnswerGaps(
  sourceFacts: Record<string, unknown>,
  answers: Record<string, unknown>,
  assets: OutboundManifestAsset[],
): string[] {
  if (!Array.isArray(sourceFacts.questionSet)) return ["The employer question set is missing."];
  const assetTypes = new Set(assets.map((asset) => asset.type));
  return sourceFacts.questionSet.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return ["An employer question is malformed."];
    }
    const question = entry as Record<string, unknown>;
    if (question.required !== true) return [];
    const label = typeof question.label === "string" ? question.label : "Required employer question";
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes("resume")) return assetTypes.has("resume") ? [] : [label];
    if (normalizedLabel.includes("cover letter")) return assetTypes.has("cover_letter") ? [] : [label];
    const fieldNames = Array.isArray(question.fields)
      ? question.fields.flatMap((field) => {
          if (!field || typeof field !== "object" || Array.isArray(field)) return [];
          const name = (field as Record<string, unknown>).name;
          return typeof name === "string" && name ? [name] : [];
        })
      : [];
    return formAnswerKeys(label, fieldNames).some((key) => hasReviewableAnswer(answers, key)) ? [] : [label];
  });
}

export default function WayAheadApp({ actor }: { actor: FounderActor }) {
  const [view, setView] = useState<ViewKey>("today");
  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedPursuitJobId, setSelectedPursuitJobId] = useState<string | null>(null);
  const accountRootRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const hasLoadedWorkspaceRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setView(currentView());
      const storedTheme = window.localStorage.getItem("way-ahead-theme");
      const choice: ThemeChoice = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
      setTheme(choice);
      applyTheme(choice);
    });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => document.documentElement.dataset.themeChoice === "system" && applyTheme("system");
    media.addEventListener("change", onSystemChange);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", onSystemChange);
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

  const navigate = (nextView: ViewKey) => {
    const main = document.querySelector<HTMLElement>("#main-content");
    if (main) main.scrollTop = 0;
    setView(nextView);
    setSettingsOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    window.history.replaceState({}, "", url);
    window.requestAnimationFrame(() => {
      if (main) main.scrollTop = 0;
      main?.focus();
    });
  };

  const chooseTheme = (choice: ThemeChoice) => {
    setTheme(choice);
    window.localStorage.setItem("way-ahead-theme", choice);
    applyTheme(choice);
  };

  const selectedJob = workspace?.opportunities.find((job) => job.id === selectedJobId) ?? null;
  const pursuedJobs = workspace?.opportunities.filter((job) => job.pursuit) ?? [];
  const pursuedJob = pursuedJobs.find((job) => job.id === selectedPursuitJobId) ?? pursuedJobs[0] ?? null;
  const activeLabel = NAVIGATION.find((item) => item.key === view)?.label ?? "Today";

  const openPursuit = (jobId: string) => {
    setSelectedPursuitJobId(jobId);
    navigate("pursuit");
  };

  return (
    <div className="wa-shell">
      <a className="wa-skip-link" href="#main-content">Skip to main content</a>
      <header className="wa-header">
        <button className="wa-brand" type="button" onClick={() => navigate("today")} aria-label="Way Ahead home">
          <span className="wa-brand-mark" aria-hidden="true"><RoadHorizon size={24} weight="bold" /></span>
          <span>Way Ahead</span>
        </button>
        <nav className="wa-desktop-nav" aria-label="Primary navigation">
          {NAVIGATION.map((item) => (
            <button
              className={view === item.key ? "is-active" : ""}
              type="button"
              key={item.key}
              onClick={() => navigate(item.key)}
              aria-current={view === item.key ? "page" : undefined}
            >
              {item.label}
            </button>
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
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSettingsOpen(false);
              }}
            >
              <div className="wa-account-identity">
                <strong>{actor.displayName}</strong>
                <span>{actor.email}</span>
              </div>
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
        <div className="wa-mobile-title" aria-live="polite">{activeLabel}</div>
        {loading ? <WorkspaceLoading /> : null}
        {!loading && error ? <WorkspaceError message={error} onRetry={refresh} /> : null}
        {!loading && !error && workspace ? (
          <>
            {view === "today" ? <TodayView workspace={workspace} pursuedJob={pursuedJob} navigate={navigate} /> : null}
            {view === "jobs" ? (
              <JobsView
                opportunities={workspace.opportunities}
                selectedJob={selectedJob}
                onSelect={setSelectedJobId}
                onRefresh={refresh}
                onOpenPursuit={openPursuit}
              />
            ) : null}
            {view === "pursuit" ? (
              <PursuitView
                key={`${pursuedJob?.id ?? "none"}:${pursuedJob?.sourceVersion?.id ?? "none"}:${pursuedJob?.pursuit?.package?.id ?? "none"}:${pursuedJob?.pursuit?.package?.payloadSha256 ?? "none"}`}
                opportunity={pursuedJob}
                pursuedJobs={pursuedJobs}
                onSelectOpportunity={setSelectedPursuitJobId}
                navigate={navigate}
                onRefresh={refresh}
              />
            ) : null}
            {view === "direction" ? <DirectionView workspace={workspace} onRefresh={refresh} /> : null}
            {view === "profile" ? <ProfileView workspace={workspace} /> : null}
          </>
        ) : null}
      </main>

      <nav className="wa-mobile-nav" aria-label="Primary navigation">
        {NAVIGATION.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              className={view === item.key ? "is-active" : ""}
              onClick={() => navigate(item.key)}
              aria-current={view === item.key ? "page" : undefined}
            >
              <Icon size={23} weight={view === item.key ? "fill" : "regular"} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function WorkspaceLoading() {
  return (
    <section className="wa-state-panel" aria-live="polite" aria-busy="true">
      <div className="wa-pulse-orb" aria-hidden="true" />
      <p className="wa-eyebrow">Secure workspace</p>
      <h1>Loading the evidence behind your next move.</h1>
      <p>Your profile, standards, live jobs, and application work are being read from your private account.</p>
    </section>
  );
}

function WorkspaceError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="wa-state-panel wa-state-error" role="alert">
      <WarningCircle size={30} weight="fill" aria-hidden="true" />
      <p className="wa-eyebrow">Workspace unavailable</p>
      <h1>Your records are safe. This view did not load.</h1>
      <p>{message}</p>
      <button className="wa-primary-button" type="button" onClick={onRetry}>Try again</button>
    </section>
  );
}

function TodayView({
  workspace,
  pursuedJob,
  navigate,
}: {
  workspace: WorkspaceRecord;
  pursuedJob: OpportunityRecord | null;
  navigate: (view: ViewKey) => void;
}) {
  const opportunity = pursuedJob ?? workspace.opportunities[0] ?? null;
  const packageBlockers = opportunity?.pursuit?.package?.blockers ?? [];
  const attentionItems = [...new Set([
    ...packageBlockers,
    ...(opportunity?.analysis?.unknowns ?? []),
    ...(opportunity?.sourceVersion?.conflicts ?? []),
  ])];
  const recommendation = opportunity?.analysis?.recommendation
    ? titleCase(opportunity.analysis.recommendation)
    : "Needs evidence";
  return (
    <div className="wa-page wa-today-page">
      <section className="wa-hero">
        <div>
          <p className="wa-eyebrow">Your next best move</p>
          {opportunity ? (
            <>
              <h1>Stop wasting your best effort on the wrong jobs.</h1>
              <p className="wa-hero-role"><strong>{opportunity.title}</strong> at {opportunity.employer} is your strongest current pursuit.</p>
              <p className="wa-hero-copy">
                Way Ahead finds the work worth pursuing, proves the real fit, and builds your strongest truthful case for the offer.
              </p>
              <div className="wa-hero-actions">
                <button className="wa-primary-button" type="button" onClick={() => navigate(opportunity.pursuit ? "pursuit" : "jobs")}>
                  {opportunity.pursuit ? "Finish this pursuit" : "Review this job"} <ArrowRight size={19} aria-hidden="true" />
                </button>
                <a className="wa-text-link" href={opportunity.canonicalUrl} target="_blank" rel="noreferrer">
                  View employer source <ArrowSquareOut size={17} aria-hidden="true" />
                </a>
              </div>
            </>
          ) : (
            <>
              <h1>Find the job worth changing your life for.</h1>
              <p className="wa-hero-copy">Your career record and standards are ready. Add a direct employer job to begin the first evidence-backed pursuit.</p>
              <button className="wa-primary-button" type="button" onClick={() => navigate("jobs")}>Add a live job <ArrowRight size={19} /></button>
            </>
          )}
        </div>
        {opportunity ? (
          <aside className="wa-hero-brief" aria-label="Why this opportunity is next">
            <div>
              <span>Current recommendation</span>
              <strong>{recommendation} · {scoreLabel(opportunity.analysis?.moveValueScore ?? null)}/100 move value</strong>
            </div>
            <div>
              <span>Next action</span>
              <strong>{packageBlockers.length ? `Resolve ${packageBlockers.length} package blocker${packageBlockers.length === 1 ? "" : "s"} before approval.` : attentionItems.length ? `Review the exact package with ${attentionItems.length} recorded risk${attentionItems.length === 1 ? "" : "s"}.` : "Review the exact package for approval."}</strong>
            </div>
            <div className="wa-hero-privacy">
              <LockKey size={20} weight="duotone" aria-hidden="true" />
              <span>Private. Nothing is sent without exact approval.</span>
            </div>
          </aside>
        ) : (
          <div className="wa-trust-card">
            <LockKey size={27} weight="duotone" aria-hidden="true" />
            <div>
              <strong>Private and approval-bound</strong>
              <span>Nothing is submitted, messaged, billed, or shared from this environment.</span>
            </div>
          </div>
        )}
      </section>

      {opportunity ? (
        <section className="wa-decision-grid" aria-label="Current decision evidence">
          <article className="wa-score-card wa-score-card-strong">
            <span>Move value</span>
            <strong>{scoreLabel(opportunity.analysis?.moveValueScore ?? null)}</strong>
            <p>Is this job better than your current baseline?</p>
          </article>
          <article className="wa-score-card">
            <span>Pursuit readiness</span>
            <strong>{scoreLabel(opportunity.analysis?.pursuitReadinessScore ?? null)}</strong>
            <p>Can your evidence support a strong application now?</p>
          </article>
          <article className={opportunity.sourceVersion?.captureState === "conflict" ? "wa-score-card wa-score-card-warning" : "wa-score-card"}>
            <span>Source status</span>
            <strong className="wa-word-score wa-source-score">
              {opportunity.sourceVersion?.captureState === "conflict" ? <WarningCircle size={25} weight="fill" aria-hidden="true" /> : null}
              {opportunity.sourceVersion?.captureState === "conflict" ? "Conflict recorded" : titleCase(opportunity.sourceVersion?.captureState ?? "unavailable")}
            </strong>
            <p>Checked {shortDate(opportunity.lastCheckedAt)} at the employer source.</p>
          </article>
        </section>
      ) : null}

      <section className="wa-section wa-two-column-section">
        <div>
          <p className="wa-eyebrow">What needs attention</p>
          <h2>{attentionItems.length ? `${attentionItems.length} recorded risk${attentionItems.length === 1 ? "" : "s"} need your attention.` : "The evidence is ready for your review."}</h2>
        </div>
        <div className="wa-action-list">
          {attentionItems.length ? attentionItems.map((item) => (
            <div className="wa-action-row" key={item}>
              <WarningCircle size={22} weight="fill" aria-hidden="true" />
              <span>{item}</span>
            </div>
          )) : (
            <div className="wa-action-row is-positive">
              <CheckCircle size={22} weight="fill" aria-hidden="true" />
              <span>No unresolved package blocker is recorded.</span>
            </div>
          )}
        </div>
      </section>

      <section className="wa-section wa-system-receipt">
        <div><Database size={24} weight="duotone" /><span><strong>Durable account</strong>Your decisions persist across phone and laptop.</span></div>
        <div><ShieldCheck size={24} weight="duotone" /><span><strong>Evidence first</strong>Unknowns and conflicts remain visible.</span></div>
        <div><Target size={24} weight="duotone" /><span><strong>Exact approval</strong>Any package change invalidates approval.</span></div>
      </section>
    </div>
  );
}

function JobsView({
  opportunities,
  selectedJob,
  onSelect,
  onRefresh,
  onOpenPursuit,
}: {
  opportunities: OpportunityRecord[];
  selectedJob: OpportunityRecord | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => Promise<void>;
  onOpenPursuit: (jobId: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const addJob = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/jobs/greenhouse", {
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

  if (selectedJob) {
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
        {selectedJob.sourceVersion?.conflicts.length ? (
          <div className="wa-alert wa-alert-warning" role="status">
            <WarningCircle size={23} weight="fill" />
            <div><strong>Source conflict</strong>{selectedJob.sourceVersion.conflicts.map((conflict) => <span key={conflict}>{conflict}</span>)}</div>
          </div>
        ) : null}
        <section className="wa-decision-grid">
          <article className="wa-score-card wa-score-card-strong"><span>Move value</span><strong>{scoreLabel(selectedJob.analysis?.moveValueScore ?? null)}</strong><p>Compared with your job standard.</p></article>
          <article className="wa-score-card"><span>Pursuit readiness</span><strong>{scoreLabel(selectedJob.analysis?.pursuitReadinessScore ?? null)}</strong><p>Grounded in confirmed profile evidence.</p></article>
          <article className="wa-score-card"><span>Recommendation</span><strong className="wa-word-score">{titleCase(selectedJob.analysis?.recommendation ?? "needs_evidence")}</strong><p>{selectedJob.analysis ? "Analysis stored in your account." : "A verified source needs operator analysis."}</p></article>
        </section>
        <section className="wa-section wa-detail-grid">
          <div>
            <p className="wa-eyebrow">Decision evidence</p>
            <h2>What holds up, and what still needs proof.</h2>
          </div>
          <div>
            <h3>Open questions</h3>
            {selectedJob.analysis?.unknowns.length ? (
              <ul className="wa-clean-list">{selectedJob.analysis.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul>
            ) : <p className="wa-muted">No analysis unknowns are stored yet.</p>}
          </div>
        </section>
        {!selectedJob.pursuit ? <button className="wa-primary-button" type="button" disabled={saving} onClick={() => startPursuit(selectedJob)}>Start this pursuit <ArrowRight size={19} /></button> : <button className="wa-primary-button" type="button" onClick={() => onOpenPursuit(selectedJob.id)}>Open pursuit <ArrowRight size={19} /></button>}
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
        <label htmlFor="greenhouse-job-url">Add a direct employer job</label>
        <div>
          <input
            id="greenhouse-job-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://job-boards.greenhouse.io/company/jobs/123"
            required
            aria-invalid={message?.kind === "error" ? true : undefined}
            aria-describedby="greenhouse-job-url-help greenhouse-job-url-feedback"
          />
          <button type="submit" className="wa-primary-button" disabled={saving}>{saving ? "Verifying…" : <><Plus size={18} /> Add job</>}</button>
        </div>
        <small id="greenhouse-job-url-help">Current live intake supports canonical Greenhouse employer URLs. It never submits an application.</small>
        <FormFeedback message={message} id="greenhouse-job-url-feedback" />
      </form>
      <div className="wa-job-list">
        {opportunities.length ? opportunities.map((job) => (
          <button className="wa-job-card" type="button" key={job.id} onClick={() => onSelect(job.id)}>
            <span className="wa-job-company">{job.employer}</span>
            <strong>{job.title}</strong>
            <span>{job.locations.join(" · ") || "Location not reported"}</span>
            <div className="wa-job-meta">
              <span className={`wa-status wa-status-${job.sourceVersion?.captureState ?? "unavailable"}`}>{titleCase(job.sourceVersion?.captureState ?? "unavailable")}</span>
              <span>{job.analysis?.moveValueScore ?? "Open"} move value</span>
              <span>{job.pursuit ? titleCase(job.pursuit.state) : "Not pursued"}</span>
            </div>
            <ArrowRight className="wa-job-arrow" size={21} aria-hidden="true" />
          </button>
        )) : (
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
  opportunity,
  pursuedJobs,
  onSelectOpportunity,
  navigate,
  onRefresh,
}: {
  opportunity: OpportunityRecord | null;
  pursuedJobs: OpportunityRecord[];
  onSelectOpportunity: (jobId: string) => void;
  navigate: (view: ViewKey) => void;
  onRefresh: () => Promise<void>;
}) {
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<FormMessage | null>(null);
  if (!opportunity?.pursuit) {
    return (
      <div className="wa-page"><div className="wa-empty-card"><Target size={30} weight="duotone" /><h1>No pursuit is active.</h1><p>Review verified jobs and start only the one that is worth the effort.</p><button className="wa-primary-button" type="button" onClick={() => navigate("jobs")}>Review jobs <ArrowRight size={19} /></button></div></div>
    );
  }
  const { pursuit } = opportunity;
  const packageRecord = pursuit.package;
  const blockers = packageRecord?.blockers ?? [];
  const sourceVersion = opportunity.sourceVersion;
  const manifestAssets = packageRecord ? outboundManifestAssets(packageRecord.assetManifest) : [];
  const rawManifestAssets = packageRecord?.assetManifest.assets;
  const answers = packageRecord?.answers ?? {};
  const questionSetChecksum = typeof answers.questionSetChecksum === "string" ? answers.questionSetChecksum : "";
  const answerEntries = Object.entries(answers).filter(([key]) => key !== "questionSetChecksum");
  const outboundTypes = new Set(manifestAssets.map((asset) => asset.type));
  const manifestReviewable = Array.isArray(rawManifestAssets)
    && rawManifestAssets.length === 2
    && manifestAssets.length === rawManifestAssets.length
    && outboundTypes.has("resume")
    && outboundTypes.has("cover_letter")
    && outboundTypes.size === 2
    && new Set(manifestAssets.map((asset) => asset.id)).size === 2
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
    ? requiredFormAnswerGaps(sourceVersion.facts, answers, manifestAssets)
    : ["The employer question set is unavailable."];
  const sourceQuestionSetChecksum = typeof sourceVersion?.facts.questionSetChecksum === "string"
    ? sourceVersion.facts.questionSetChecksum
    : "";
  const baseAnswersReviewable = hasReviewableAnswer(answers, "firstName")
    && hasReviewableAnswer(answers, "lastName")
    && hasReviewableAnswer(answers, "email")
    && typeof answers.email === "string"
    && /^\S+@\S+\.\S+$/.test(answers.email)
    && typeof answers.requiresSponsorship === "boolean";
  const answersReviewable = baseAnswersReviewable
    && answerEntries.length >= 4
    && SHA256_PATTERN.test(questionSetChecksum)
    && questionSetChecksum === sourceQuestionSetChecksum
    && formAnswerGaps.length === 0;
  const sourceReviewable = Boolean(
    packageRecord
      && sourceVersion?.id
      && packageRecord.jobPostingVersionId === sourceVersion.id
      && SHA256_PATTERN.test(sourceVersion.checksum)
      && sourceVersion.checkedAt
      && (sourceVersion.captureState === "verified" || sourceVersion.captureState === "conflict")
      && packageRecord.destinationUrl === opportunity.canonicalUrl,
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
    ...formAnswerGaps.map((label) => `Required answer missing: ${label}`),
    !manifestReviewable ? "The outbound resume and cover letter manifest is incomplete." : null,
  ].filter((value): value is string => Boolean(value));
  const canApprove = Boolean(
    packageRecord
      && packageRecord.readinessState === "ready_for_review"
      && blockers.length === 0
      && reviewGaps.length === 0
      && packageRecord.approvalState !== "approved",
  );

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
          <select value={opportunity.id} onChange={(event) => onSelectOpportunity(event.target.value)}>
            {pursuedJobs.map((job) => <option key={job.id} value={job.id}>{job.title} · {job.employer}</option>)}
          </select>
        </label>
      ) : null}
      <section className="wa-page-heading wa-pursuit-heading">
        <div><p className="wa-eyebrow">{opportunity.employer} · Active pursuit</p><h1>{opportunity.title}</h1></div>
        <span className={`wa-status wa-status-${packageRecord?.readinessState === "ready_for_review" ? "verified" : "conflict"}`}>{titleCase(packageRecord?.readinessState ?? pursuit.state)}</span>
      </section>
      <div className="wa-pursuit-banner">
        <div><span>Next action</span><strong>{pursuit.nextAction ?? "Review the current evidence and assets."}</strong></div>
        <div><span>External action</span><strong>Not authorized</strong></div>
      </div>

      <section className="wa-section">
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Application assets</p><h2>One truthful story, tailored to this role.</h2></div><span>{pursuit.assets.length} stored</span></div>
        <div className="wa-asset-list">
          {pursuit.assets.length ? pursuit.assets.map((asset) => <AssetCard key={asset.id} asset={asset} />) : (
            <div className="wa-empty-inline"><FileText size={24} /><span>No role-specific asset has passed into this pursuit yet.</span></div>
          )}
        </div>
      </section>

      <section className="wa-section wa-approval-section">
        <div>
          <p className="wa-eyebrow">Exact action gate</p>
          <h2>{blockers.length ? "Approval stays locked until the package is internally consistent." : "This exact package is ready for Matt's decision."}</h2>
          <p>Approval is bound to the employer destination, source version, answers, filenames, asset versions, and payload fingerprint shown here.</p>
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
                {answerEntries.map(([key, value]) => <div key={key}><dt>{answerLabel(key)}</dt><dd>{reviewValue(value)}</dd></div>)}
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
            ) : canApprove ? (
              <div className="wa-approval-control">
                <label>
                  <input type="checkbox" checked={approvalChecked} onChange={(event) => setApprovalChecked(event.target.checked)} />
                  <span>
                    <strong>Approval attestation</strong>
                    I approve only this exact package and employer-form version for staging at {opportunity.employer}. This is not submission authorization.
                    <small>I attest that I have not previously applied to this exact {opportunity.employer} role and intentionally approve the professional resume without the current Zaytinya bridge role.</small>
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
          <div className="wa-empty-inline"><LockKey size={24} /><span>No fingerprinted application package exists yet.</span></div>
        )}
      </section>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetRecord }) {
  const lines = getAssetText(asset);
  return (
    <details className="wa-asset-card">
      <summary>
        <span className="wa-asset-icon"><FileText size={21} weight="duotone" /></span>
        <span><strong>{assetLabel(asset.type)}</strong><small>{asset.filename ?? `Version ${asset.version}`}</small></span>
        <span className={`wa-status wa-status-${asset.reviewState === "claim_safe" || asset.reviewState === "approved" ? "verified" : "partial"}`}>{titleCase(asset.reviewState)}</span>
        <CaretDown className="wa-asset-caret" size={18} weight="bold" aria-hidden="true" />
      </summary>
      <div className="wa-asset-content">
        <div className="wa-asset-receipt"><span>Version {asset.version}</span><span>{asset.pageCount ? `${asset.pageCount} page${asset.pageCount === 1 ? "" : "s"}` : "Page count open"}</span><span>{asset.contentSha256 ? `${asset.contentSha256.slice(0, 12)}…` : "Fingerprint open"}</span></div>
        {asset.filename ? <a className="wa-asset-download" href={`/founder-assets/${encodeURIComponent(asset.filename)}`} download aria-label={`Download ${asset.filename}`}>Download {assetLabel(asset.type)} PDF <ArrowSquareOut size={16} aria-hidden="true" /></a> : null}
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
      if (!response.ok) throw new Error(result.error ?? "The career path could not be saved.");
      await onRefresh();
      setPathMessage({ text: `${path.label} is now your primary path.`, kind: "success" });
    } catch (pathError) {
      setPathMessage({ text: pathError instanceof Error ? pathError.message : "The career path could not be saved.", kind: "error" });
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
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Career paths</p><h2>Choose a primary lane without giving up credible options.</h2></div><span>{workspace.careerPaths.filter((path) => path.state === "active").length} active</span></div>
        <div className="wa-path-list" role="radiogroup" aria-label="Primary career path" ref={pathListRef}>
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

function ProfileView({ workspace }: { workspace: WorkspaceRecord }) {
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
      <section className="wa-section wa-profile-summary"><p className="wa-eyebrow">Positioning</p><h2>{workspace.profile.summary ?? "Your confirmed professional summary has not been stored yet."}</h2></section>
      <section className="wa-section">
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Experience</p><h2>The record behind every claim.</h2></div><span>{workspace.profile.experiences.length} roles</span></div>
        <div className="wa-experience-list">
          {workspace.profile.experiences.map((role) => (
            <article key={role.id} className="wa-experience-card">
              <div><span>{role.startDate ?? "Start open"} – {role.isCurrent ? "Present" : role.endDate ?? "End open"}</span><strong>{role.title}</strong><p>{role.employer}{role.location ? ` · ${role.location}` : ""}</p></div>
              <span className={`wa-status wa-status-${role.reviewState === "confirmed" ? "verified" : role.reviewState === "conflict" ? "conflict" : "partial"}`}>{titleCase(role.reviewState)}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="wa-section">
        <div className="wa-section-heading"><div><p className="wa-eyebrow">Skills evidence</p><h2>What the record can credibly support.</h2></div><span>{workspace.profile.skills.length} tracked</span></div>
        <div className="wa-skill-cloud">{workspace.profile.skills.map((skill) => <span key={skill.id}>{skill.name}<small>{skill.level ?? skill.reviewState}</small></span>)}</div>
      </section>
    </div>
  );
}
