"use client";

import {
  ArrowLeft,
  Briefcase,
  CaretRight,
  Check,
  CheckCircle,
  CircleNotch,
  Copy,
  CreditCard,
  FileText,
  Info,
  LinkSimple,
  List,
  LockKey,
  MagnifyingGlass,
  Receipt,
  ShieldCheck,
  Target,
  TrendUp,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { type FormEvent, useEffect, useRef, useState } from "react";

export type IntegrityPhase = "idle" | "loading" | "ready";

export type PlanId =
  | "free"
  | "watch-monthly"
  | "watch-three-month"
  | "multi-watch-monthly"
  | "multi-watch-three-month"
  | "active-search"
  | "multi-active";
export type SearchMode = "urgent" | "better-job" | "change" | "passive";
export type DemoProfileId = "established" | "hourly" | "career-change";
export type CareerLaneId =
  | "revops"
  | "lifecycle"
  | "growth"
  | "hospitality-supervisor"
  | "operations-coordinator"
  | "support-lead"
  | "customer-education"
  | "learning-development"
  | "implementation-coordinator";

export const DEMO_PROFILES: Record<DemoProfileId, {
  name: string;
  summary: string;
  current: string;
  experience: string;
  confirmation: string;
  excluded: string;
}> = {
  established: {
    name: "Experienced salaried professional",
    summary: "10+ years in customer, revenue, reporting, and operations work.",
    current: "Growth and revenue systems",
    experience: "Customer follow-up, CRM, reporting, automation, and teamwork across functions",
    confirmation: "Depth with specific tools and direct ownership of several results",
    excluded: "Numbers and claims that the sample cannot support safely",
  },
  hourly: {
    name: "Hourly worker with schedule limits",
    summary: "Hospitality operations experience with commute and shift constraints.",
    current: "Hospitality service and shift operations",
    experience: "Guest service, staff training, shift coordination, inventory, and point-of-sale work",
    confirmation: "Team size, scheduling authority, usual hours, and tip income",
    excluded: "A management title, exact earnings, or duties the sample does not prove",
  },
  "career-change": {
    name: "Career changer",
    summary: "Education and program experience being tested against adjacent business roles.",
    current: "Education, programs, and stakeholder support",
    experience: "Facilitation, curriculum, communication, and progress tracking",
    confirmation: "Customer ownership, business tools, and direct commercial results",
    excluded: "Direct SaaS or customer-success experience that the sample does not show",
  },
};

export type LaneDefinition = {
  id: CareerLaneId;
  name: string;
  fit: string;
  proof: string;
  gap: string;
  planBody: string;
  planSummary: string;
  lookFor: string[];
  careful: string[];
};

export const LANE_DEFINITIONS: Record<DemoProfileId, LaneDefinition[]> = {
  established: [
    { id: "revops", name: "Revenue and Growth Operations", fit: "Best fit", proof: "Systems, customer follow-up, reporting, automation, and teamwork across sales and marketing", gap: "Show more direct sales-process examples for some jobs", planBody: "These roles use your systems, reporting, automation, and cross-team experience while building a strong path to better pay and responsibility.", planSummary: "Look for jobs that improve how sales and marketing work together, how results are measured, and how repeated work gets done.", lookFor: ["Clear ownership of revenue systems and reporting", "Strong pay, useful benefits, and room to improve the work", "Leaders who can explain how success is measured"], careful: ["Jobs that are mostly software administration", "Titles that sound senior but offer little control", "Companies that cannot explain who owns the work"] },
    { id: "lifecycle", name: "Customer Lifecycle and Retention", fit: "Strong option", proof: "Customer follow-up, segmentation, owned channels, and retention programs", gap: "Confirm experience with the tools each employer uses", planBody: "These roles use your customer follow-up, retention, CRM, and owned-channel experience while opening a path to broader leadership.", planSummary: "Look for jobs that improve how a company keeps, helps, and grows customers across email, mobile, and other owned channels.", lookFor: ["Ownership of customer follow-up and retention", "A clear customer journey and useful performance measures", "Strong pay, family benefits, and room to lead"], careful: ["Jobs that require deep tool expertise you cannot yet prove", "Roles focused only on sending campaigns", "Teams that cannot explain why customers leave"] },
    { id: "growth", name: "Growth and Revenue Marketing", fit: "Possible stretch", proof: "Website improvement, search, ecommerce, reporting, automation, and growth planning", gap: "Avoid jobs focused mostly on buying ads", planBody: "These roles use your website, search, ecommerce, reporting, and growth-planning experience while keeping you close to measurable results.", planSummary: "Look for jobs that connect customer insight, website improvement, useful content, and clear growth measures.", lookFor: ["Ownership of the full path from interest to revenue", "A healthy mix of website, search, lifecycle, and testing work", "Clear authority to improve how growth work gets done"], careful: ["Jobs focused mostly on buying ads", "Brand-only roles with little connection to revenue", "Teams that expect one person to fix every channel"] },
  ],
  hourly: [
    { id: "hospitality-supervisor", name: "Hospitality Supervisor", fit: "Best fit", proof: "Guest service, shift coordination, training, and inventory experience", gap: "Confirm formal team leadership and scheduling authority", planBody: "These roles build directly on your service and shift experience without requiring a complete career reset.", planSummary: "Look for jobs where you can lead a shift, improve service, and make day-to-day operations run better.", lookFor: ["Predictable hours and a clear tip or bonus policy", "Real authority to train and coordinate a team", "Health coverage and a manageable commute"], careful: ["Supervisor titles without higher pay or authority", "Schedules that change without notice", "Roles that hide expected hours or tip rules"] },
    { id: "operations-coordinator", name: "Operations Coordinator", fit: "Strong option", proof: "Organization, inventory, handoffs, and keeping busy work on track", gap: "Show comfort with spreadsheets and office systems", planBody: "These roles turn practical shift and service experience into broader operations work.", planSummary: "Look for jobs that value organization, problem solving, reliable handoffs, and keeping people informed.", lookFor: ["A clear training plan", "Stable hours and a defined workload", "Room to learn business systems"], careful: ["Jobs that require years of office experience without alternatives", "Coordinator titles that are mostly unpaid overtime", "Roles with vague duties and no training"] },
    { id: "support-lead", name: "Customer Support Team Lead", fit: "Possible stretch", proof: "Guest service, de-escalation, training, and helping coworkers succeed", gap: "Confirm written support and ticketing-system experience", planBody: "These roles use your service strengths while moving toward office or remote customer work.", planSummary: "Look for teams that value calm problem solving, clear communication, and coaching newer employees.", lookFor: ["Paid training on the support tools", "A clear path from frontline work to team leadership", "Schedules that match your life needs"], careful: ["Remote jobs with no real training", "High-volume call roles presented as leadership", "Pay that depends on unrealistic targets"] },
  ],
  "career-change": [
    { id: "customer-education", name: "Customer Education", fit: "Best fit", proof: "Facilitation, curriculum, communication, and helping people learn", gap: "Build proof that the work improved customer use or success", planBody: "These roles carry your teaching and program strengths into customer-facing business work.", planSummary: "Look for jobs that need clear lessons, useful resources, live facilitation, and progress measurement.", lookFor: ["A clear audience and learning goal", "Room to create and improve training", "Employers open to transferable experience"], careful: ["Roles that require direct software experience with no alternative", "Jobs that combine training with heavy sales quotas", "Teams that cannot explain how learning is measured"] },
    { id: "learning-development", name: "Learning and Development", fit: "Strong option", proof: "Program planning, facilitation, stakeholder communication, and progress tracking", gap: "Show experience serving adult learners or employees", planBody: "These roles apply your education and program skills inside an organization.", planSummary: "Look for work that improves how employees learn, practice, and use new skills.", lookFor: ["A defined learner group and training need", "Support from managers and subject experts", "Clear measures beyond attendance"], careful: ["Administrative roles labeled as strategy", "Jobs that require credentials you do not have", "Teams with no time or budget for learning"] },
    { id: "implementation-coordinator", name: "Implementation Coordinator", fit: "Possible stretch", proof: "Planning, communication, progress tracking, and helping people through change", gap: "Build proof with business tools, customer ownership, and project handoffs", planBody: "These roles test whether your program and communication strengths can transfer into customer projects.", planSummary: "Look for entry points with strong training, clear project steps, and close support from experienced teammates.", lookFor: ["Structured onboarding and a clear playbook", "Smaller projects before full ownership", "Employers that value teaching and communication"], careful: ["Jobs requiring immediate technical ownership", "Roles that hide sales work inside implementation", "Positions with no training for career changers"] },
  ],
};

export const PLAN_DETAILS: Record<PlanId, {
  name: string;
  price: string;
  cadence: string;
  summary: string;
  renewal: string;
  next: string;
  kind: "free" | "subscription" | "pass";
}> = {
  free: {
    name: "Try It Free",
    price: "$0",
    cadence: "No card",
    summary: "Check one real job, see the reasons and unknowns, and keep the result.",
    renewal: "No renewal",
    next: "Open your saved job decision",
    kind: "free",
  },
  "watch-monthly": {
    name: "Keep Watch",
    price: "$9",
    cadence: "per month",
    summary: "Monitor one active career path and hear from us only when a job looks meaningfully better.",
    renewal: "Renews monthly until canceled",
    next: "Choose what your job alerts should watch for",
    kind: "subscription",
  },
  "watch-three-month": {
    name: "Keep Watch",
    price: "$24",
    cadence: "for three months",
    summary: "Monitor one active career path for three months. Save $3 versus paying monthly.",
    renewal: "Ends after three months; no automatic renewal",
    next: "Choose what your job alerts should watch for",
    kind: "subscription",
  },
  "multi-watch-monthly": {
    name: "Multi-Path Watch",
    price: "$19",
    cadence: "per month",
    summary: "Monitor up to three active career paths without flattening them into one generic search.",
    renewal: "Renews monthly until canceled",
    next: "Choose the career paths you want to monitor",
    kind: "subscription",
  },
  "multi-watch-three-month": {
    name: "Multi-Path Watch",
    price: "$49",
    cadence: "for three months",
    summary: "Monitor up to three active career paths for three months. Save $8 versus paying monthly.",
    renewal: "Ends after three months; no automatic renewal",
    next: "Choose the career paths you want to monitor",
    kind: "subscription",
  },
  "active-search": {
    name: "Active Search",
    price: "$99",
    cadence: "for 30 days",
    summary: "Compare the jobs you are considering and prepare your strongest truthful pursuit.",
    renewal: "Ends after 30 days; no automatic renewal",
    next: "Open your job list and choose what to review next",
    kind: "pass",
  },
  "multi-active": {
    name: "Multi-Path Active",
    price: "$149",
    cadence: "for 30 days",
    summary: "Run and prepare a focused search across up to three distinct career paths.",
    renewal: "Ends after 30 days; no automatic renewal",
    next: "Open your job list and choose what to review next",
    kind: "pass",
  },
};

function safeHostname(value: string) {
  if (value === "sample:going") return "the sample job included in this prototype";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "submitted source";
  }
}

export function MyWayAheadBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mwa-brand ${compact ? "compact" : ""}`}>
      <Copy size={compact ? 27 : 32} weight="regular" aria-hidden="true" />
      <span>Way Ahead</span>
      <small>provisional</small>
    </div>
  );
}

export function PublicHeader({
  onHome,
  onPricing,
  onSignIn,
  onToday,
  onFindJobs,
  onPursuits,
  onProfile,
  active,
  signedIn = false,
}: {
  onHome: () => void;
  onPricing: () => void;
  onSignIn: () => void;
  onToday: () => void;
  onFindJobs: () => void;
  onPursuits: () => void;
  onProfile: () => void;
  active?: "today" | "find" | "profile" | "pursuits" | null;
  signedIn?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const accountLabel = signedIn ? "Settings" : "Sign in";

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      window.requestAnimationFrame(() => menuToggle.current?.focus());
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="public-header">
      <button className="mwa-brand-button" onClick={onHome} aria-label="Way Ahead home">
        <MyWayAheadBrand compact />
      </button>
      <nav className="public-nav" aria-label={signedIn ? "Account navigation" : "Public navigation"}>
        {signedIn ? <><button aria-current={active === "today" ? "page" : undefined} onClick={onToday}>Today</button><button aria-current={active === "find" ? "page" : undefined} onClick={onFindJobs}>Find Jobs</button><button aria-current={active === "pursuits" ? "page" : undefined} onClick={onPursuits}>Pursuits</button><button aria-current={active === "profile" ? "page" : undefined} onClick={onProfile}>Career Profile</button></> : <><button onClick={onHome}>Home</button><button onClick={onPricing}>Pricing</button></>}
        <button onClick={onSignIn}>{accountLabel}</button>
      </nav>
      <div className="public-mobile-actions">
        {!signedIn ? <button className="public-signin" onClick={onSignIn}>{accountLabel}</button> : null}
        <button ref={menuToggle} className="icon-button" aria-expanded={open} aria-controls="public-mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={24} aria-hidden="true" /> : <List size={25} aria-hidden="true" />}
        </button>
      </div>
      {open ? (
        <nav className="public-mobile-menu" id="public-mobile-menu" aria-label={signedIn ? "Mobile account navigation" : "Mobile public navigation"}>
          {signedIn ? <><button aria-current={active === "today" ? "page" : undefined} onClick={() => { setOpen(false); onToday(); }}>Today</button><button aria-current={active === "find" ? "page" : undefined} onClick={() => { setOpen(false); onFindJobs(); }}>Find Jobs</button><button aria-current={active === "pursuits" ? "page" : undefined} onClick={() => { setOpen(false); onPursuits(); }}>Pursuits</button><button aria-current={active === "profile" ? "page" : undefined} onClick={() => { setOpen(false); onProfile(); }}>Career Profile</button><button onClick={() => { setOpen(false); onSignIn(); }}>Settings</button></> : <><button onClick={() => { setOpen(false); onHome(); }}>Home</button><button onClick={() => { setOpen(false); onPricing(); }}>Pricing</button></>}
        </nav>
      ) : null}
    </header>
  );
}

const INTEGRITY_STEPS = [
  {
    title: "Is the job real and still open?",
    body: "Check the employer, original source, posting date, and possible duplicates.",
    compactBody: "Check the employer, source, and freshness.",
  },
  {
    title: "What does the employer truly require?",
    body: "Separate required experience from preferences, alternatives, and application questions.",
    compactBody: "Separate requirements from preferences.",
  },
  {
    title: "Would it improve your pay, work, or future?",
    body: "Compare the job with what you earn now, how you want to work, and where you want your career to go.",
    compactBody: "Compare it with what a better job means to you.",
  },
  {
    title: "What needs a closer look?",
    body: "Show missing facts, risks, and experience you may need to prove before you act.",
    compactBody: "Show missing facts, risks, and proof gaps.",
  },
];

export function IntegrityChecks({ phase = "idle", reviewedReadyChecks = false }: { phase?: IntegrityPhase; reviewedReadyChecks?: boolean }) {
  return (
    <div className={`integrity-check-grid checks-${phase}`} aria-label="Independent opportunity checks">
      {INTEGRITY_STEPS.map((step, index) => {
        const reviewed = phase === "ready" && reviewedReadyChecks && index < 2;
        const notChecked = phase === "ready" && !reviewedReadyChecks && index < 2;
        const active = phase === "loading" && index === 0;
        return (
          <article className={`integrity-check-card ${reviewed ? "reviewed" : ""} ${active ? "active" : ""}`} key={step.title}>
            <span className="integrity-check-number" aria-hidden="true">{reviewed ? <MagnifyingGlass size={16} weight="bold" /> : String(index + 1).padStart(2, "0")}</span>
            <div>
              <span className="integrity-check-state">{reviewed ? "Sample check complete, details still open" : notChecked ? "Not checked in this prototype" : active ? "Checking the local boundary" : index < 2 ? "First job check" : "After we know what you want"}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function HomeScreen({
  onReview,
  onExplore,
  onPricing,
}: {
  onReview: (url: string) => void;
  onExplore: () => void;
  onPricing: () => void;
}) {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [showJobCheck, setShowJobCheck] = useState(false);
  const sourceInput = useRef<HTMLTextAreaElement>(null);
  const revealJobCheck = () => {
    setShowJobCheck(true);
    window.requestAnimationFrame(() => sourceInput.current?.focus());
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = source.trim();
    try {
      if (/^https?:\/\//i.test(trimmed)) {
        const parsed = new URL(trimmed);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error("protocol");
        setError("");
        onReview(trimmed);
        return;
      }
      if (trimmed.length >= 80 && trimmed.includes(" ")) {
        setError("");
        onReview(trimmed);
        return;
      }
      throw new Error("incomplete");
    } catch {
      setError("Paste the complete public job link, or paste enough of the job description for us to recognize it.");
    }
  };
  return (
    <section className="public-screen home-screen">
      <div className="home-hero">
        <span className="home-kicker">You are more than your last job title.</span>
        <h1>Find the work that moves your life forward.</h1>
        <p className="home-lede">Way Ahead reveals credible career paths, finds jobs that can improve your pay, time, growth, or stability, and helps you prepare your strongest honest case.</p>
        <div className="home-hero-actions">
          <button className="primary-button home-primary" type="button" onClick={onExplore}><MagnifyingGlass size={24} weight="bold" aria-hidden="true" /> Find better-fit jobs for me</button>
          <button className="secondary-button home-job-check-toggle" type="button" aria-expanded={showJobCheck} aria-controls="home-job-check" onClick={revealJobCheck}><FileText size={23} aria-hidden="true" /> Check a job I found</button>
        </div>
        <div className="home-trust"><LockKey size={24} aria-hidden="true" /><p>Private by default. No invented experience. Nothing is sent without your approval.</p></div>
        {showJobCheck ? <form className="capture-form home-job-check" id="home-job-check" onSubmit={submit} noValidate>
          <label className="capture-label" htmlFor="home-job-source">Paste the job link or description</label>
          <div className="capture-input">
            <LinkSimple size={24} aria-hidden="true" />
            <textarea ref={sourceInput} className="capture-text-input" id="home-job-source" rows={3} autoCapitalize="none" autoCorrect="off" value={source} aria-invalid={Boolean(error)} aria-describedby={error ? "home-url-error" : "home-job-help"} placeholder="https://company.com/jobs/role" onChange={(event) => setSource(event.target.value)} />
          </div>
          <p className="capture-help" id="home-job-help">Live job extraction is not connected in this private-alpha build. Your input stays on this device, and the complete walkthrough uses a clearly labeled synthetic job.</p>
          {error ? <p className="field-error" id="home-url-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="submit">Check this job</button>
          <button className="sample-job-button" type="button" onClick={() => onReview("sample:going")}>Use the private-alpha example instead</button>
        </form> : null}
      </div>

      <section className="way-ahead-outcomes" aria-labelledby="way-ahead-outcomes-title">
        <span className="eyebrow">Your way ahead</span>
        <h2 id="way-ahead-outcomes-title">Clarity, confidence, and momentum for what comes next.</h2>
        <div className="outcome-row-list">
          <button className="outcome-row" type="button" onClick={onExplore}><Target size={27} aria-hidden="true" /><span><strong>See credible career paths</strong><small>Explore directions grounded in your experience and the real job market.</small></span><CaretRight size={22} aria-hidden="true" /></button>
          <button className="outcome-row" type="button" onClick={onExplore}><Briefcase size={27} aria-hidden="true" /><span><strong>Find better-fit jobs</strong><small>See work that matches your strengths and goals, not just keywords.</small></span><CaretRight size={22} aria-hidden="true" /></button>
          <button className="outcome-row" type="button" onClick={onExplore}><ShieldCheck size={27} aria-hidden="true" /><span><strong>Build your strongest honest case</strong><small>Turn approved experience into role-specific proof, materials, and next steps.</small></span><CaretRight size={22} aria-hidden="true" /></button>
        </div>
      </section>

      <section className="home-value-section">
        <div className="home-section-heading"><span className="eyebrow">Less noise, better choices</span><h2>More than another list of jobs.</h2></div>
        <div className="home-value-grid">
          <article><ShieldCheck size={24} aria-hidden="true" /><h3>Investigate before you invest time</h3><p>We separate current employer facts from missing details, duplicates, and stale postings before a job can earn your attention.</p></article>
          <article><Target size={24} aria-hidden="true" /><h3>Judge the job against your life</h3><p>Pay matters, but so do time, benefits, work style, stability, growth, and the direction the role creates next.</p></article>
          <article><TrendUp size={24} aria-hidden="true" /><h3>Prepare the proof employers need</h3><p>Connect your real experience to the role, expose proof gaps, and review every job-specific asset before it leaves your control.</p></article>
        </div>
      </section>

      <section className="home-mechanism-section">
        <span className="eyebrow">How it works</span>
        <h2>From a job posting to a clear next step.</h2>
        <div className="mechanism-grid">
          <article><span>01</span><h3>Tell us what better means</h3><p>Choose the pay, schedule, location, benefits, and growth that matter most.</p></article>
          <article><span>02</span><h3>See whether the job is worth it</h3><p>Understand the upside, risks, missing facts, and how ready you are.</p></article>
          <article><span>03</span><h3>Prepare without exaggerating</h3><p>Build truthful materials and approve anything that would leave the product.</p></article>
        </div>
      </section>

      <section className="home-conversion-section">
        <div><span className="eyebrow">Start without a card</span><h2>Let your experience open more than one door.</h2><p>See the paths first. Decide which ones deserve your time. Ongoing monitoring and active-search packages remain separate choices.</p></div>
        <div className="inline-actions"><button className="primary-button" onClick={onExplore}>Find my way ahead</button><button className="secondary-button" onClick={onPricing}>See private pricing hypotheses</button></div>
      </section>
    </section>
  );
}

export function IntegrityPreviewScreen({
  sourceUrl,
  phase,
  onBack,
  onContinue,
}: {
  sourceUrl: string;
  phase: IntegrityPhase;
  onBack: () => void;
  onContinue: () => void;
}) {
  const source = safeHostname(sourceUrl);
  const isSampleJob = sourceUrl === "sample:going";
  return (
    <section className="public-screen integrity-result-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to home</button>
      <header className="funnel-heading">
        <span className="eyebrow">Free job check</span>
        <h1>{phase === "loading" ? (isSampleJob ? "We’re checking the sample job." : "We’re checking what this demo can do.") : (isSampleJob ? "Here’s what we know so far." : "Your job was not analyzed.")}</h1>
        <p>{phase === "loading" ? (isSampleJob ? "We’re checking the sample source, employer, date, requirements, pay, and benefits. We won’t fill in missing details." : "Your input stays on this device while we confirm the limits of this prototype.") : isSampleJob ? `We loaded ${source}. A few details still need confirmation before we compare the sample job with your goals.` : "Live job extraction is not connected in this prototype. We received your input locally, but we will not pretend that we checked the employer, requirements, pay, benefits, or posting status."}</p>
      </header>
      {phase === "loading" ? (
        <div className="integrity-loading" role="status" aria-live="polite"><CircleNotch className="spin" size={30} aria-hidden="true" /><strong>{isSampleJob ? "Checking the sample job" : "Checking the prototype boundary"}</strong><span>This demo does not contact the source, employer, or an AI service.</span></div>
      ) : null}
      <IntegrityChecks phase={phase} reviewedReadyChecks={isSampleJob} />
      {phase === "ready" ? (
        <>
          <section className="integrity-result-card" aria-label="Integrity Preview result">
            <div className="integrity-result-title"><WarningCircle size={24} weight="fill" aria-hidden="true" /><div><span className="eyebrow">{isSampleJob ? "What we found" : "Prototype boundary"}</span><h2>{isSampleJob ? "Ready for the next step, with a few facts still missing." : "Use the included sample to experience the complete job-review flow."}</h2></div></div>
            <dl className="integrity-result-list">
              <div><dt>Job information</dt><dd><CheckCircle size={18} weight="fill" aria-hidden="true" />{isSampleJob ? "Sample loaded" : "Received locally"}</dd></div>
              <div><dt>Employer</dt><dd><MagnifyingGlass size={18} aria-hidden="true" />{isSampleJob ? "Needs confirmation" : "Not checked"}</dd></div>
              <div><dt>Still open</dt><dd><MagnifyingGlass size={18} aria-hidden="true" />{isSampleJob ? "Needs confirmation" : "Not checked"}</dd></div>
              <div><dt>Duplicate listing</dt><dd><MagnifyingGlass size={18} aria-hidden="true" />Not checked</dd></div>
              <div><dt>Pay and benefits</dt><dd><MagnifyingGlass size={18} aria-hidden="true" />{isSampleJob ? "Not confirmed yet" : "Not checked"}</dd></div>
            </dl>
          </section>
          <div className="decision-boundary"><Info size={21} aria-hidden="true" /><div><strong>{isSampleJob ? "Next, tell us what makes a job better for you." : "Your pasted job will not be used for the walkthrough."}</strong><p>{isSampleJob ? "Then we can compare this sample with your pay, work, and career goals." : "Continuing replaces it with the clearly labeled Going sample job. Your original input stays unprocessed."}</p></div></div>
          <button className="primary-button funnel-primary" onClick={onContinue}>{isSampleJob ? "Continue to compare the sample" : "Continue with the sample job"} <CaretRight size={19} aria-hidden="true" /></button>
          <details className="demo-disclosure"><summary>About this demo</summary><p>This local prototype does not contact the source, call an AI model, create an account, charge a card, or contact an employer.</p></details>
        </>
      ) : null}
    </section>
  );
}

export function OnboardingProgress({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <div className={`onboarding-progress progress-${step}`} aria-label={`Step ${step} of ${total}`}>
      <div><span>Set up your plan</span><strong>Step {step} of {total}</strong></div>
      <div className="onboarding-progress-track" aria-hidden="true"><span /></div>
    </div>
  );
}

export function AuthenticationScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [accepted, setAccepted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onContinue(); };
  return (
    <section className="public-screen compact-funnel-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back</button>
      <header className="funnel-heading"><span className="eyebrow">Save your progress</span><h1>{mode === "signup" ? "Create your free account." : "Welcome back."}</h1><p>{mode === "signup" ? "Save this job and finish the comparison. Your first complete job review is free." : "Sign in to continue where you left off."}</p></header>
      <div className="auth-switch" role="group" aria-label="Account mode"><button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button><button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button></div>
      <form className="funnel-form" onSubmit={submit}>
        <label><span>Email</span><input type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        <label><span>Password</span><input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 8 characters" /></label>
        {mode === "signup" ? <label className="consent-row"><input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>I understand this is a local demo and agree to the prototype Terms and Privacy notice.</span></label> : null}
        <button className="primary-button funnel-primary" type="submit" disabled={mode === "signup" && !accepted}>{mode === "signup" ? "Create account and continue" : "Sign in and continue"}</button>
      </form>
      <details className="demo-disclosure"><summary>Demo information</summary><p>This screen creates no real account. Nothing is sent, charged, uploaded, or shared.</p></details>
    </section>
  );
}

export function ModeScreen({ selected, onSelect, onBack, onContinue }: { selected: SearchMode | null; onSelect: (mode: SearchMode) => void; onBack: () => void; onContinue: () => void }) {
  const options: Array<[SearchMode, string, string]> = [
    ["urgent", "I need work soon", "Focus on solid jobs I can reach quickly."],
    ["better-job", "I want a better job", "Look for better pay, work, and growth."],
    ["change", "I want to change careers", "Show nearby paths and what I would need."],
    ["passive", "Keep me ready", "Watch for standout jobs while I stay put."],
  ];
  return (
    <section className="screen onboarding-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back</button>
      <OnboardingProgress step={1} />
      <header className="funnel-heading"><span className="eyebrow">Start with the change you need</span><h1>What would help most right now?</h1><p>Choose the closest answer. We’ll move forward immediately, and you can change it later.</p></header>
      <fieldset className="mode-grid"><legend className="sr-only">Choose what would help</legend>{options.map(([value, title, body]) => <label className={selected === value ? "selected" : ""} key={value}><input type="radio" name="career-mode" value={value} checked={selected === value} onChange={() => { onSelect(value); onContinue(); }} /><span><strong>{title}</strong><small>{body}</small></span>{selected === value ? <CheckCircle size={22} weight="fill" aria-hidden="true" /> : <CaretRight size={22} aria-hidden="true" />}</label>)}</fieldset>
      <p className="selection-helper">Selecting a row takes you to the next step.</p>
    </section>
  );
}

export function ExperienceImportScreen({ selected, onSelect, onBack, onContinue }: { selected: DemoProfileId | null; onSelect: (profile: DemoProfileId) => void; onBack: () => void; onContinue: () => void }) {
  const profile = selected ? DEMO_PROFILES[selected] : null;
  const [resumeName, setResumeName] = useState("");
  return (
    <section className="screen onboarding-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back</button>
      <OnboardingProgress step={2} />
      <header className="funnel-heading"><span className="eyebrow">Career profile</span><h1>Help us understand the work you’ve actually done.</h1><p>Start with the easiest source, then correct anything we misunderstand. Your career profile should preserve the proof, context, and skills from every role without creating duplicates.</p></header>
      <section className="career-input-methods" aria-labelledby="career-input-methods-title"><div className="section-heading"><div><span className="eyebrow">Choose the easiest starting point</span><h2 id="career-input-methods-title">Bring your experience in your way.</h2></div></div><div className="input-method-grid">
        <label className="input-method available"><FileText size={25} aria-hidden="true" /><span><strong>Add a resume</strong><small>{resumeName ? `${resumeName} selected locally. Parsing is not connected yet.` : "Select a PDF, DOC, or DOCX on this device."}</small></span><input className="sr-only" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setResumeName(event.target.files?.[0]?.name ?? "")} /><em>{resumeName ? "Selected" : "Local only"}</em></label>
        <div className="input-method planned" aria-disabled="true"><LinkSimple size={25} aria-hidden="true" /><span><strong>Add LinkedIn</strong><small>Planned after permission, source-policy, and duplicate controls are complete.</small></span><em>Not connected</em></div>
        <div className="input-method planned" aria-disabled="true"><List size={25} aria-hidden="true" /><span><strong>Type my work history</strong><small>Planned as inline role, project, achievement, skill, and proof entry.</small></span><em>Not connected</em></div>
        <div className="input-method planned" aria-disabled="true"><Info size={25} aria-hidden="true" /><span><strong>Talk through my experience</strong><small>Planned with explicit recording consent, transcription review, and correction.</small></span><em>Not connected</em></div>
      </div></section>
      <div className="prototype-boundary-heading"><span className="eyebrow">Private-alpha walkthrough</span><h2>Continue with a synthetic career profile.</h2><p>Resume parsing is not connected in this local build. Choose a fictional profile to test how different experience changes the paths and advice. No personal information is used.</p></div>
      <fieldset className="mode-grid profile-sample-grid"><legend className="sr-only">Choose a synthetic career profile</legend>{(Object.entries(DEMO_PROFILES) as Array<[DemoProfileId, (typeof DEMO_PROFILES)[DemoProfileId]]>).map(([id, item]) => <label className={selected === id ? "selected" : ""} key={id}><input type="radio" name="demo-profile" value={id} checked={selected === id} onChange={() => onSelect(id)} /><span><strong>{item.name}</strong><small>{item.summary}</small></span>{selected === id ? <CheckCircle size={22} weight="fill" aria-hidden="true" /> : null}</label>)}</fieldset>
      {profile ? <section className="extraction-preview sample-profile-preview"><div className="section-heading"><div><span className="eyebrow">Synthetic profile review</span><h2>Confirm what the system may use</h2></div></div><dl><div><dt>Current or recent work</dt><dd>{profile.current}</dd></div><div><dt>Experience we can use</dt><dd>{profile.experience}</dd></div><div><dt>Needs confirmation</dt><dd>{profile.confirmation}</dd></div><div><dt>Excluded until proven</dt><dd>{profile.excluded}</dd></div></dl><details className="demo-disclosure"><summary>Why these states stay separate</summary><p>Supported experience, open questions, generated interpretation, and excluded claims must remain distinct before the system recommends a career path or job.</p></details></section> : <p className="selection-helper">Choose a synthetic profile to continue.</p>}
      <button className="primary-button funnel-primary" disabled={!selected} onClick={onContinue}>Review what makes the next job worth it <CaretRight size={19} aria-hidden="true" /></button>
    </section>
  );
}

export function RoleLanesScreen({
  profileId,
  primary,
  included,
  onBack,
  onPrimary,
  onToggle,
  onContinue,
}: {
  profileId: DemoProfileId;
  primary: CareerLaneId | null;
  included: CareerLaneId[];
  onBack: () => void;
  onPrimary: (lane: CareerLaneId) => void;
  onToggle: (lane: CareerLaneId) => void;
  onContinue: () => void;
}) {
  const lanes = LANE_DEFINITIONS[profileId];
  return (
    <section className="screen onboarding-screen lane-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to my priorities</button>
      <OnboardingProgress step={4} />
      <header className="funnel-heading"><span className="eyebrow">Your career paths</span><h1>Compare the futures your experience can open.</h1><p>Choose one primary path and keep any other credible direction you want to monitor. Plan limits never hide a valid path.</p></header>
      <div className="lane-list career-portfolio">{lanes.map((item, index) => {
        const readiness = index === 0 ? "Ready now" : index === 1 ? "Credible now" : "Build one bridge";
        return (
          <article className={primary === item.id ? "selected" : ""} key={item.id}>
            <div className="lane-portfolio-heading">
              <div><span className={`path-readiness readiness-${index}`}>{readiness}</span><h2>{item.name}</h2></div>
              <span className="lane-rank" aria-label={`Path ${index + 1}`}>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <details className="lane-evidence-details"><summary>Why it fits and what to strengthen</summary><p><strong>Why it fits:</strong> {item.proof}</p><p><strong>Bridge or proof to strengthen:</strong> {item.gap}</p></details>
            <div className="lane-controls">
              <label className="lane-primary-control"><input type="radio" name="primary-lane" aria-label={primary === item.id ? `${item.name} is the primary path` : `Make ${item.name} primary`} checked={primary === item.id} onChange={() => onPrimary(item.id)} /><span>{primary === item.id ? "Primary path" : "Make primary"}</span></label>
              {primary !== item.id ? <label className="lane-include-control"><input type="checkbox" aria-label={`${included.includes(item.id) ? "Remove" : "Include"} ${item.name} ${included.includes(item.id) ? "from" : "in"} search`} checked={included.includes(item.id)} onChange={() => onToggle(item.id)} /><span>{included.includes(item.id) ? "Included" : "Include"}</span></label> : <span className="lane-primary-note"><CheckCircle size={18} weight="fill" aria-hidden="true" /> Included</span>}
            </div>
          </article>
        );
      })}</div>
      <button className="primary-button funnel-primary" disabled={!primary} onClick={onContinue}>Build my path-based search plan <CaretRight size={19} aria-hidden="true" /></button>
    </section>
  );
}

export function StrategyBriefScreen({ profileId, searchMode, primary, baselineSummary, fullReviewConnected, onBack, onEdit, onChangeProfile, onJobs }: { profileId: DemoProfileId; searchMode: SearchMode; primary: CareerLaneId; baselineSummary: string; fullReviewConnected: boolean; onBack: () => void; onEdit: () => void; onChangeProfile: () => void; onJobs: () => void }) {
  const copy = LANE_DEFINITIONS[profileId].find((lane) => lane.id === primary) ?? LANE_DEFINITIONS[profileId][0];
  const goalLead: Record<SearchMode, string> = {
    urgent: "Because you need work soon, this plan starts with credible roles you can reach without hiding the proof gaps.",
    "better-job": "Because you want a better job, this plan gives extra weight to pay, work quality, and future growth.",
    change: "Because you want to change careers, this plan separates transferable strengths from experience you still need to build.",
    passive: "Because you are staying ready, this plan keeps the bar high and looks only for jobs that would justify a move.",
  };
  return (
    <section className="screen strategy-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to career paths</button>
      <header className="funnel-heading"><span className="eyebrow">Your job-search plan</span><h1>Focus on {copy.name}.</h1><p>{goalLead[searchMode]} {copy.planBody}</p></header>
      <section className="strategy-hero"><div><span className="eyebrow">Best starting point</span><h2>{copy.name}</h2><p>{copy.planSummary}</p></div><span className="status-pill status-positive"><ShieldCheck size={16} weight="fill" aria-hidden="true" /> Supported by the sample</span></section>
      <section className="strategy-baseline"><span className="eyebrow">Your job standard</span><h2>Use this when you compare individual jobs.</h2><p>{baselineSummary}</p></section>
      <div className="strategy-grid">
        <article><h3>Look for</h3><ul>{copy.lookFor.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h3>Be careful with</h3><ul>{copy.careful.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h3>What could change this plan</h3><ul><li>Better response rates in another career path</li><li>New experience that opens stronger options</li><li>Your pay, schedule, or family needs changing</li></ul></article>
      </div>
      <details className="demo-disclosure"><summary>Why we recommend this</summary><p>The career-path recommendation uses the experience shown in the fictional profile. Your pay, location, benefits, and growth priorities stay separate and are used when an individual job is compared with your standard.</p></details>
      {fullReviewConnected ? <div className="strategy-actions"><button className="primary-button" onClick={onJobs}>See jobs for this plan <CaretRight size={19} aria-hidden="true" /></button><button className="secondary-button" onClick={onEdit}>Edit my plan</button></div> : <section className="strategy-boundary"><span className="eyebrow">Prototype boundary</span><h2>Your sample plan is ready.</h2><p>Full job-review examples for this path are not connected in this prototype yet. We will not send you into an unrelated senior-role example and pretend it is personal.</p><button className="secondary-button" onClick={onChangeProfile}>Choose another sample</button></section>}
    </section>
  );
}

export function PricingScreen({ onChoose, onStart }: { onChoose: (plan: PlanId) => void; onStart: () => void }) {
  const [watchTerm, setWatchTerm] = useState<"watch-monthly" | "watch-three-month">("watch-monthly");
  const [multiWatchTerm, setMultiWatchTerm] = useState<"multi-watch-monthly" | "multi-watch-three-month">("multi-watch-monthly");
  const watch = PLAN_DETAILS[watchTerm];
  const multiWatch = PLAN_DETAILS[multiWatchTerm];
  return (
    <section className="public-screen pricing-screen">
      <div className="pricing-test-notice" role="note"><Info size={20} aria-hidden="true" /><p><strong>Pricing is being tested.</strong> Every price on this page is a hypothesis. No payment can occur in this prototype.</p></div>
      <header className="funnel-heading centered-heading"><span className="eyebrow">Private offer hypotheses</span><h1>Start free. Expand only when the search earns it.</h1><p>Test one decision, monitor one path, or run a focused search. Multi-path packages preserve distinct resumes, evidence, jobs, and preparation across different career directions.</p><small>No price is public or approved for sale. No job, interview, offer, or pay increase is guaranteed.</small></header>
      <article className="pricing-free-strip"><div><span className="pricing-ribbon neutral">Start here</span><h2>Try It Free</h2><p>See the reasons, risks, and unknowns behind one job decision, then keep the result.</p><strong>$0 · no card · no renewal</strong></div><button className="primary-button" onClick={onStart}>Start with my goals</button></article>
      <div className="home-section-heading pricing-section-heading"><span className="eyebrow">Recurring career watch</span><h2>Pay for useful monitoring, not manufactured alerts.</h2><p>Choose one path or keep up to three distinct paths active. A no-opportunity update is valid when nothing clears your standard.</p></div>
      <div className="pricing-grid">
        <article className="pricing-card featured"><span className="pricing-ribbon">One active path</span><h2>Keep Watch</h2><p>Monitor one approved career path and hear from us only when a job clears the pay, work, and life standards you set.</p><div className="billing-toggle" role="group" aria-label="Keep Watch billing term"><button className={watchTerm === "watch-monthly" ? "active" : ""} aria-pressed={watchTerm === "watch-monthly"} onClick={() => setWatchTerm("watch-monthly")}>$9 monthly</button><button className={watchTerm === "watch-three-month" ? "active" : ""} aria-pressed={watchTerm === "watch-three-month"} onClick={() => setWatchTerm("watch-three-month")}>$24 for 3 months</button></div><div className="price-line"><strong>{watch.price}</strong><span>{watch.cadence}</span></div>{watchTerm === "watch-three-month" ? <p className="savings-line">Save $3 compared with three monthly payments.</p> : null}<p className="renewal-line">{watch.renewal}.</p><ul><li><Check size={17} weight="bold" aria-hidden="true" />One active path with its own job standard</li><li><Check size={17} weight="bold" aria-hidden="true" />Verified, restrained alerts</li><li><Check size={17} weight="bold" aria-hidden="true" />Useful “nothing better right now” updates</li></ul><button className="primary-button" onClick={() => onChoose(watchTerm)}>Choose Keep Watch</button></article>
        <article className="pricing-card"><span className="pricing-ribbon neutral">Up to three paths</span><h2>Multi-Path Watch</h2><p>Keep separate searches active when one career direction would hide viable alternatives or require different proof.</p><div className="billing-toggle" role="group" aria-label="Multi-Path Watch billing term"><button className={multiWatchTerm === "multi-watch-monthly" ? "active" : ""} aria-pressed={multiWatchTerm === "multi-watch-monthly"} onClick={() => setMultiWatchTerm("multi-watch-monthly")}>$19 monthly</button><button className={multiWatchTerm === "multi-watch-three-month" ? "active" : ""} aria-pressed={multiWatchTerm === "multi-watch-three-month"} onClick={() => setMultiWatchTerm("multi-watch-three-month")}>$49 for 3 months</button></div><div className="price-line"><strong>{multiWatch.price}</strong><span>{multiWatch.cadence}</span></div>{multiWatchTerm === "multi-watch-three-month" ? <p className="savings-line">Save $8 compared with three monthly payments.</p> : null}<p className="renewal-line">{multiWatch.renewal}.</p><ul><li><Check size={17} weight="bold" aria-hidden="true" />Up to three distinct active paths</li><li><Check size={17} weight="bold" aria-hidden="true" />Separate job, evidence, and resume context</li><li><Check size={17} weight="bold" aria-hidden="true" />One combined Today view</li></ul><button className="secondary-button" onClick={() => onChoose(multiWatchTerm)}>Choose Multi-Path Watch</button></article>
      </div>
      <div className="home-section-heading pricing-section-heading"><span className="eyebrow">Thirty-day active search</span><h2>Research, decide, and prepare without starting over.</h2><p>These one-time packages do not create MRR. They are designed to solve the active-search job when urgency and preparation depth are higher.</p></div>
      <div className="pricing-grid">
        <article className="pricing-card"><span className="pricing-ribbon neutral">One path</span><h2>Active Search</h2><div className="price-line"><strong>$99</strong><span>for 30 days</span></div><p>Choose the right jobs and prepare your strongest honest application within one career path.</p><ul><li><Check size={17} weight="bold" aria-hidden="true" />Thirty days of single-path monitoring</li><li><Check size={17} weight="bold" aria-hidden="true" />Up to 10 full job decisions</li><li><Check size={17} weight="bold" aria-hidden="true" />Application workspace for up to 3 jobs</li><li><Check size={17} weight="bold" aria-hidden="true" />Nothing sent without exact approval</li></ul><p className="renewal-line">One payment. Ends after 30 days and does not renew.</p><button className="secondary-button" onClick={() => onChoose("active-search")}>Choose Active Search</button></article>
        <article className="pricing-card"><span className="pricing-ribbon neutral">Up to three paths</span><h2>Multi-Path Active</h2><div className="price-line"><strong>$149</strong><span>for 30 days</span></div><p>Keep different industries or role families separate while coordinating one active search.</p><ul><li><Check size={17} weight="bold" aria-hidden="true" />Up to three path-specific searches</li><li><Check size={17} weight="bold" aria-hidden="true" />Distinct proof and resume context by path</li><li><Check size={17} weight="bold" aria-hidden="true" />Job-specific company and role research</li><li><Check size={17} weight="bold" aria-hidden="true" />Nothing sent without exact approval</li></ul><p className="renewal-line">One payment. Ends after 30 days and does not renew.</p><button className="secondary-button" onClick={() => onChoose("multi-active")}>Choose Multi-Path Active</button></article>
      </div>
      <section className="contextual-addons"><div className="home-section-heading"><span className="eyebrow">Only when the moment calls for it</span><h2>One-time depth without bloating the subscription.</h2><p>These are separate private hypotheses, not automatic upsells or recurring revenue.</p></div><div className="addon-grid"><article><span>Application moment</span><h3>Role Decision + Application Pack</h3><strong>$39 once</strong><p>Deepen one job decision and prepare the role-specific application package for review.</p></article><article><span>Interview moment</span><h3>Interview + 90-Day Plan</h3><strong>$49 once</strong><p>Research the company and role, prepare the interview, and build a credible first-90-day plan.</p></article></div></section>
      <section className="partner-referral-note"><Info size={24} aria-hidden="true" /><div><span className="eyebrow">Human help</span><h2>We are not pretending to staff a service we cannot fulfill.</h2><p>Way Ahead is evaluating independent partners for coaching, negotiation, and human review. No partner is active, no profile data would be transferred, and any commission would be disclosed beside the recommendation.</p></div></section>
      <div className="home-conversion-section compact"><div><span className="eyebrow">Not ready to choose?</span><h2>Start with the free job check.</h2><p>Experience the explanation before deciding whether ongoing help is useful.</p></div><button className="primary-button" onClick={onStart}>Try the free check</button></div>
    </section>
  );
}

export function PlanSelectionScreen({ selected, onSelect, onContinue }: { selected: PlanId; onSelect: (plan: PlanId) => void; onContinue: () => void }) {
  const [watchTerm, setWatchTerm] = useState<"watch-monthly" | "watch-three-month">(selected === "watch-three-month" ? "watch-three-month" : "watch-monthly");
  const [multiWatchTerm, setMultiWatchTerm] = useState<"multi-watch-monthly" | "multi-watch-three-month">(selected === "multi-watch-three-month" ? "multi-watch-three-month" : "multi-watch-monthly");
  const chooseWatch = (term: "watch-monthly" | "watch-three-month") => { setWatchTerm(term); onSelect(term); };
  const chooseMultiWatch = (term: "multi-watch-monthly" | "multi-watch-three-month") => { setMultiWatchTerm(term); onSelect(term); };
  return (
    <section className="public-screen plan-selection-screen">
      <header className="funnel-heading"><span className="eyebrow">Your free job check is saved</span><h1>How do you want to continue?</h1><p>Stay free, monitor one or more paths, or use a focused 30-day search. No payment happens in this prototype.</p></header>
      <fieldset className="plan-choice-list"><legend className="sr-only">Choose how to continue</legend>
        <label className={selected === "free" ? "selected" : ""}><input type="radio" name="selected-plan" value="free" checked={selected === "free"} onChange={() => onSelect("free")} /><div><h2>Stay on Free</h2><p>Your completed review remains saved.</p><span>$0 · no renewal</span></div>{selected === "free" ? <CheckCircle size={24} weight="fill" aria-hidden="true" /> : null}</label>
        <div className={`plan-choice-group ${selected.startsWith("watch-") ? "selected" : ""}`}><label className="plan-choice-header"><input type="radio" name="selected-plan" value="keep-watch" checked={selected.startsWith("watch-")} onChange={() => chooseWatch(watchTerm)} /><div><h2>Keep Watch</h2><p>Monitor one active career path.</p></div>{selected.startsWith("watch-") ? <CheckCircle size={24} weight="fill" aria-hidden="true" /> : null}</label><div className="billing-toggle" role="group" aria-label="Keep Watch billing term"><button type="button" className={selected === "watch-monthly" ? "active" : ""} aria-pressed={selected === "watch-monthly"} onClick={() => chooseWatch("watch-monthly")}>$9 monthly</button><button type="button" className={selected === "watch-three-month" ? "active" : ""} aria-pressed={selected === "watch-three-month"} onClick={() => chooseWatch("watch-three-month")}>$24 for 3 months</button></div><p className="renewal-line">{PLAN_DETAILS[watchTerm].renewal}.</p></div>
        <div className={`plan-choice-group ${selected.startsWith("multi-watch-") ? "selected" : ""}`}><label className="plan-choice-header"><input type="radio" name="selected-plan" value="multi-path-watch" checked={selected.startsWith("multi-watch-")} onChange={() => chooseMultiWatch(multiWatchTerm)} /><div><h2>Multi-Path Watch</h2><p>Monitor up to three distinct career paths.</p></div>{selected.startsWith("multi-watch-") ? <CheckCircle size={24} weight="fill" aria-hidden="true" /> : null}</label><div className="billing-toggle" role="group" aria-label="Multi-Path Watch billing term"><button type="button" className={selected === "multi-watch-monthly" ? "active" : ""} aria-pressed={selected === "multi-watch-monthly"} onClick={() => chooseMultiWatch("multi-watch-monthly")}>$19 monthly</button><button type="button" className={selected === "multi-watch-three-month" ? "active" : ""} aria-pressed={selected === "multi-watch-three-month"} onClick={() => chooseMultiWatch("multi-watch-three-month")}>$49 for 3 months</button></div><p className="renewal-line">{PLAN_DETAILS[multiWatchTerm].renewal}.</p></div>
        <label className={selected === "active-search" ? "selected" : ""}><input type="radio" name="selected-plan" value="active-search" checked={selected === "active-search"} onChange={() => onSelect("active-search")} /><div><h2>Active Search</h2><p>Thirty days of job decisions and preparation within one path.</p><span>$99 · one payment · no renewal</span></div>{selected === "active-search" ? <CheckCircle size={24} weight="fill" aria-hidden="true" /> : null}</label>
        <label className={selected === "multi-active" ? "selected" : ""}><input type="radio" name="selected-plan" value="multi-active" checked={selected === "multi-active"} onChange={() => onSelect("multi-active")} /><div><h2>Multi-Path Active</h2><p>Thirty days of distinct search and preparation across up to three paths.</p><span>$149 · one payment · no renewal</span></div>{selected === "multi-active" ? <CheckCircle size={24} weight="fill" aria-hidden="true" /> : null}</label>
      </fieldset>
      <button className="primary-button funnel-primary" onClick={onContinue}>{selected === "free" ? "Stay on Free" : `Continue with ${PLAN_DETAILS[selected].name}`} <CaretRight size={19} aria-hidden="true" /></button>
      <p className="fine-print">Human services are not included or currently offered. Any future partner recommendation will be separate and disclosed.</p>
    </section>
  );
}

export function CheckoutScreen({ plan, onBack, onConfirm }: { plan: PlanId; onBack: () => void; onConfirm: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const details = PLAN_DETAILS[plan];
  const isWatch = plan.includes("watch");
  const isMonthlyRenewal = plan === "watch-monthly" || plan === "multi-watch-monthly";
  const isMultiPath = plan.startsWith("multi-");
  const terms = {
    access: isWatch ? (isMonthlyRenewal ? "One month at a time" : "Three prepaid months") : "30 days",
    allowance: isWatch ? (isMultiPath ? "Monitoring across up to three active paths" : "Monitoring across one active path") : (isMultiPath ? "Up to three path-specific searches" : "One path-specific search"),
    renewal: details.renewal,
    application: isWatch ? "Not included" : "Application workspace and role-specific preparation",
  };
  return (
    <section className="public-screen compact-funnel-screen checkout-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Change selection</button>
      <header className="funnel-heading"><span className="eyebrow">Test checkout</span><h1>Review {details.name}.</h1><p>Check the price, access, path limit, and renewal before you confirm. No payment field or billing connection is enabled.</p></header>
      <section className="order-review"><div className="order-icon"><CreditCard size={26} aria-hidden="true" /></div><div><h2>{details.name}</h2><p>{details.summary}</p></div><div className="order-price"><strong>{details.price}</strong><span>{details.cadence}</span></div></section>
      <dl className="checkout-terms"><div><dt>Due today in this prototype</dt><dd>$0</dd></div><div><dt>Future live price being tested</dt><dd>{details.price} · {details.cadence}</dd></div><div><dt>Access</dt><dd>{terms.access}</dd></div><div><dt>Job checks</dt><dd>{terms.allowance}</dd></div><div><dt>Application help</dt><dd>{terms.application}</dd></div><div><dt>Renewal</dt><dd>{terms.renewal}</dd></div><div><dt>Human help</dt><dd>Not included</dd></div><div><dt>External action</dt><dd>Nothing is applied for, submitted, or sent without your exact approval</dd></div></dl>
      <label className="approval-checkbox"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>{isMonthlyRenewal ? `I understand that ${details.name} renews monthly until I cancel.` : `I reviewed the ${details.price} price, ${terms.access.toLowerCase()}, and no-automatic-renewal terms.`}</span></label>
      <button className="primary-button funnel-primary" disabled={!accepted} onClick={onConfirm}>Confirm test selection</button>
      <p className="fine-print centered">No payment method is collected and no charge occurs.</p>
    </section>
  );
}

export function ConfirmationScreen({ plan, onContinue }: { plan: PlanId; onContinue: () => void }) {
  const details = PLAN_DETAILS[plan];
  const isActive = plan === "active-search" || plan === "multi-active";
  return (
    <section className="public-screen compact-funnel-screen confirmation-screen">
      <div className="confirmation-icon"><Receipt size={34} aria-hidden="true" /></div>
      <header className="funnel-heading centered-heading"><span className="eyebrow">{plan === "free" ? "Saved" : "Test selection saved"}</span><h1>{plan === "free" ? "Your free job review is saved." : isActive ? `Your 30-day ${details.name} is ready.` : `${details.name} is on.`}</h1><p>{plan === "free" ? "You can return to the recommendation and your notes at any time." : isActive ? "Choose the first job you want to review. Nothing is sent without your approval." : "We’ll use your approved paths, goals, and filters to look for jobs that may be better. You stay in control."}</p></header>
      <section className="confirmation-card"><dl><div><dt>Selection</dt><dd>{details.name}</dd></div><div><dt>Displayed price</dt><dd>{details.price} · {details.cadence}</dd></div><div><dt>Renewal</dt><dd>{details.renewal}</dd></div><div><dt>Transaction</dt><dd>None · local prototype state only</dd></div><div><dt>Next</dt><dd>{details.next}</dd></div></dl></section>
      <button className="primary-button funnel-primary" onClick={onContinue}>{details.next} <CaretRight size={19} aria-hidden="true" /></button>
    </section>
  );
}

export function GuidedHelpScreen({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  return (
    <section className="public-screen compact-funnel-screen guided-screen"><button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to pricing</button><header className="funnel-heading"><span className="eyebrow">Human support</span><h1>Human services are paused.</h1><p>Way Ahead does not currently have qualified staff to deliver coaching, review, or guided application work reliably. We will not sell a service we cannot fulfill.</p></header><section className="guided-request-summary"><div><span className="eyebrow">What we are evaluating</span><h2>Independent, disclosed partners</h2></div><p>A future referral may offer coaching, negotiation, or a human second opinion. It must remain optional, commission-neutral, and separate from Way Ahead software. No profile data would be transferred automatically.</p></section><button className="primary-button funnel-primary" onClick={onComplete}>Return to my job review <CaretRight size={19} aria-hidden="true" /></button></section>
  );
}

export function MaterialsScreen({ reviewed, onBack, onPreview, onContinue }: { reviewed: Array<"resume" | "cover-letter" | "answers">; onBack: () => void; onPreview: (asset: "resume" | "cover-letter" | "answers") => void; onContinue: () => void }) {
  const review = (asset: "resume" | "cover-letter" | "answers") => {
    onPreview(asset);
  };
  const allReviewed = reviewed.length === 3;
  return (
    <section className="screen materials-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to my jobs</button>
      <header className="funnel-heading"><span className="eyebrow">Application materials · Step 1 of 2</span><h1>Review your application materials.</h1><p>We’ll tailor your resume, cover letter, and answers using only experience you have approved. This demo job is fictional, and nothing can be sent.</p></header>
      <section className="package-section"><div className="section-heading"><div><span className="eyebrow">Ready for your review</span><h2>Open each item before you continue</h2></div><span className="status-pill">{reviewed.length} of 3 opened</span></div><article className="package-row"><FileText size={21} aria-hidden="true" /><div><strong>Resume</strong><span>{reviewed.includes("resume") ? "Opened for review" : "Ready to review"}</span></div><button className="text-button" onClick={() => review("resume")}>{reviewed.includes("resume") ? "Review again" : "Review resume"}</button></article><article className="package-row"><FileText size={21} aria-hidden="true" /><div><strong>Cover letter</strong><span>{reviewed.includes("cover-letter") ? "Opened for review" : "Ready to review"}</span></div><button className="text-button" onClick={() => review("cover-letter")}>{reviewed.includes("cover-letter") ? "Review again" : "Review cover letter"}</button></article><article className="package-row"><Briefcase size={21} aria-hidden="true" /><div><strong>Application answers</strong><span>{reviewed.includes("answers") ? "Opened for review" : "3 answers need review"}</span></div><button className="text-button" onClick={() => review("answers")}>{reviewed.includes("answers") ? "Review again" : "Review answers"}</button></article></section>
      <div className="decision-boundary"><ShieldCheck size={21} aria-hidden="true" /><div><strong>Before you continue</strong><p>Review any highlighted claim, missing answer, or job requirement that still needs attention.</p></div></div>
      <button className="primary-button funnel-primary" disabled={!allReviewed} onClick={onContinue}>Review the full application <CaretRight size={19} aria-hidden="true" /></button>
    </section>
  );
}
