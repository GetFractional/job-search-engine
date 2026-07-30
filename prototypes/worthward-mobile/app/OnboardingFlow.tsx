"use client";

import {
  ArrowRight,
  Briefcase,
  Check,
  File,
  FileDoc,
  ShieldCheck,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ONBOARDING_STEPS,
  type OnboardingState,
  type OnboardingStepPayload,
} from "./onboarding-types";
import {
  parseResumeFile,
  type ParsedResumeFile,
} from "./resume-import";
import { PrivacyCenter } from "./PrivacyCenter";
import styles from "./onboarding.module.css";

type OnboardingFlowProps = {
  initialState: OnboardingState;
  signOutHref: string;
  editMode?: "experience";
};

async function postStep(payload: OnboardingStepPayload) {
  const response = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as {
    error?: string;
    state?: OnboardingState;
  };
  if (!response.ok || !result.state) {
    throw new Error(result.error ?? "This setup step could not be saved.");
  }
  return result.state;
}

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function OnboardingFlow({
  initialState,
  signOutHref,
  editMode,
}: OnboardingFlowProps) {
  const [state, setState] = useState(initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editMode) return;
    window.history.replaceState(
      null,
      "",
      `/app/onboarding?step=${state.currentStep}`,
    );
  }, [editMode, state.currentStep]);

  const save = async (payload: OnboardingStepPayload) => {
    setBusy(true);
    setError("");
    try {
      const nextState = await postStep(payload);
      setState(nextState);
      if (nextState.complete) {
        window.location.assign(editMode ? "/app/profile" : "/app/home");
        return;
      }
      document.querySelector<HTMLElement>("#onboarding-main")?.focus();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "This setup step could not be saved.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#onboarding-main">
        Skip to setup
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Way Ahead public site">
          <span className={styles.brandMark} aria-hidden="true">
            <Briefcase size={20} weight="duotone" />
          </span>
          Way Ahead
        </Link>
        <span className={styles.headerContext}>
          {editMode ? "Career profile" : "Career setup"}
        </span>
        <div className={styles.account}>
          <span>{state.account.displayName}</span>
          <button
            className={styles.privacyButton}
            type="button"
            onClick={() => setPrivacyOpen(true)}
          >
            <ShieldCheck size={18} />
            <span>Data &amp; privacy</span>
          </button>
          <a href={signOutHref}>
            <SignOut size={18} />
            <span>Sign out</span>
          </a>
        </div>
      </header>

      {privacyOpen ? (
        <main
          id="onboarding-main"
          className={styles.privacyMain}
          tabIndex={-1}
        >
          <PrivacyCenter
            role={state.account.role}
            signOutHref={signOutHref}
            onBack={() => setPrivacyOpen(false)}
          />
        </main>
      ) : (
      <main
        id="onboarding-main"
        className={styles.main}
        tabIndex={-1}
      >
        {editMode ? (
          <aside className={styles.progress} aria-label="Profile update">
            <p>Career profile</p>
            <p className={styles.progressHeading}>
              Keep the evidence behind your search current.
            </p>
            <p className={styles.progressTrust}>
              Your raw file stays on this device. You review the extracted text
              before Way Ahead saves it.
            </p>
          </aside>
        ) : (
        <aside className={styles.progress} aria-label="Setup progress">
          <p>Build your search plan</p>
          <ol>
            {ONBOARDING_STEPS.map((step) => {
              const complete = state.completedSteps.includes(step.id);
              const current = state.currentStep === step.id;
              return (
                <li
                  key={step.id}
                  className={`${complete ? styles.complete : ""} ${current ? styles.current : ""}`}
                  aria-current={current ? "step" : undefined}
                >
                  <span aria-hidden="true">
                    {complete ? <Check size={14} weight="bold" /> : step.id}
                  </span>
                  <div>
                    <strong>{step.shortLabel}</strong>
                    <small>{step.title}</small>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className={styles.progressTrust}>
            Nothing is sent to an employer from setup.
          </p>
        </aside>
        )}

        <section className={styles.stepPanel}>
          <div className={styles.stepCounter}>
            {editMode
              ? "Update experience"
              : `Step ${state.currentStep} of ${ONBOARDING_STEPS.length}`}
          </div>
          {error ? (
            <div
              ref={errorRef}
              className={styles.error}
              role="alert"
              tabIndex={-1}
            >
              {error}
            </div>
          ) : null}

          {editMode === "experience" ? (
            <ExperienceStep
              busy={busy}
              save={save}
              initialSourceText={state.careerInput.sourceText ?? ""}
            />
          ) : null}
          {!editMode && state.currentStep === 1 ? (
            <GoalStep state={state} busy={busy} save={save} />
          ) : null}
          {!editMode && state.currentStep === 2 ? (
            <ExperienceStep
              busy={busy}
              save={save}
              initialSourceText={state.careerInput.sourceText ?? ""}
            />
          ) : null}
          {!editMode && state.currentStep === 3 ? (
            <ProfileReviewStep state={state} busy={busy} save={save} />
          ) : null}
          {!editMode && state.currentStep === 4 ? (
            <JobStandardStep state={state} busy={busy} save={save} />
          ) : null}
          {!editMode && state.currentStep === 5 ? (
            <CareerPathsStep state={state} busy={busy} save={save} />
          ) : null}
          {!editMode && state.currentStep === 6 ? (
            <PlanReviewStep state={state} busy={busy} save={save} />
          ) : null}
        </section>
      </main>
      )}

      <nav className={styles.mobileNav} aria-label="Account navigation">
        <Link href="/">
          <Briefcase size={20} />
          Public site
        </Link>
        <Link className={styles.activeMobileNav} href="/app/onboarding" aria-current="page">
          <UserCircle size={20} />
          Setup
        </Link>
        <button
          className={privacyOpen ? styles.activeMobileNav : ""}
          type="button"
          onClick={() => setPrivacyOpen(true)}
        >
          <ShieldCheck size={20} />
          Privacy
        </button>
        <a href={signOutHref}>
          <SignOut size={20} />
          Sign out
        </a>
      </nav>
    </div>
  );
}

type StepProps = {
  state: OnboardingState;
  busy: boolean;
  save: (payload: OnboardingStepPayload) => Promise<void>;
};

function GoalStep({ state, busy, save }: StepProps) {
  const options = [
    "Earn more",
    "Do work that fits",
    "Get more flexibility",
    "Grow into stronger responsibility",
    "Change career direction",
    "Find more stability",
  ];
  const [priorities, setPriorities] = useState<string[]>(
    state.goal?.priorities ?? [],
  );
  const [notes, setNotes] = useState(state.goal?.notes ?? "");
  const [noticeAccepted, setNoticeAccepted] = useState(false);
  const [processingAccepted, setProcessingAccepted] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void save({
      step: 1,
      data: {
        priorities,
        notes,
        noticeAccepted,
        processingAccepted,
      },
    });
  };

  return (
    <form onSubmit={submit}>
      <p className={styles.eyebrow}>Start with the outcome</p>
      <h1>What should your next job change?</h1>
      <p className={styles.intro}>
        Choose everything that matters. Your answer becomes the standard Way
        Ahead uses to organize the search, not a generic preference quiz.
      </p>
      <fieldset className={styles.choiceFieldset}>
        <legend>What needs to be better?</legend>
        <div className={styles.choiceGrid}>
          {options.map((option) => {
            const selected = priorities.includes(option);
            return (
              <label
                key={option}
                className={selected ? styles.choiceSelected : ""}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    setPriorities((current) =>
                      current.includes(option)
                        ? current.filter((item) => item !== option)
                        : [...current, option],
                    )
                  }
                />
                <span aria-hidden="true">
                  {selected ? <Check size={15} weight="bold" /> : null}
                </span>
                <strong>{option}</strong>
              </label>
            );
          })}
        </div>
      </fieldset>
      <label className={styles.field}>
        <span>Anything else your next job needs to solve?</span>
        <textarea
          value={notes}
          maxLength={500}
          rows={4}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="For example: I need a healthier schedule and work where I can see the impact I own."
        />
      </label>
      <details className={styles.dataNotice}>
        <summary>Alpha Data Notice</summary>
        <div>
          <p>
            Way Ahead saves the answers and reviewed text you submit, plus file
            name, type, size, and checksums when you import a résumé. PDF and
            DOCX bytes stay in this browser and are not uploaded in this alpha.
          </p>
          <p>
            This information is used only for your private career profile, job
            standard, job paths, scores, pursuits, and documents. Do not enter
            Social Security, banking, medical, voluntary self-identification,
            password, or reference-contact information.
          </p>
          <p>
            Paid AI, email, billing, employer-form changes, outreach, and
            application submission are not connected. You can correct your
            data, download an export, or delete a member account from Data &amp;
            privacy. Hosting recovery history may persist for up to 30 days
            after deletion.
          </p>
        </div>
      </details>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={noticeAccepted}
          onChange={(event) => setNoticeAccepted(event.target.checked)}
        />
        <span>
          <strong>I read the Alpha Data Notice.</strong>
          I understand what this alpha saves, why it is used, and what I should
          not enter.
        </span>
      </label>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={processingAccepted}
          onChange={(event) => setProcessingAccepted(event.target.checked)}
        />
        <span>
          <strong>
            I want Way Ahead to process the career information I choose to
            provide.
          </strong>
          I can review and correct it, download an export, or delete a member
          account.
        </span>
      </label>
      <StepSubmit busy={busy}>Save and add my experience</StepSubmit>
    </form>
  );
}

function ExperienceStep({
  busy,
  save,
  initialSourceText = "",
}: Omit<StepProps, "state"> & { initialSourceText?: string }) {
  const [method, setMethod] = useState<"paste" | "manual">("paste");
  const [careerText, setCareerText] = useState(initialSourceText);
  const [parsedResume, setParsedResume] = useState<ParsedResumeFile | null>(
    null,
  );
  const [fileBusy, setFileBusy] = useState(false);
  const [fileNotice, setFileNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [role, setRole] = useState({
    employer: "",
    title: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    location: "",
    summary: "",
  });

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setFileBusy(true);
    setFileNotice(null);
    setParsedResume(null);
    try {
      const parsed = await parseResumeFile(file);
      setParsedResume(parsed);
      setCareerText(parsed.extractedText);
      setMethod("paste");
      setFileNotice({
        tone: "success",
        message: `${parsed.originalName} was read on this device. Review and correct the extracted text before saving.${
          parsed.warnings.length
            ? ` Parser note: ${parsed.warnings.join(" ")}`
            : ""
        }`,
      });
    } catch (fileError) {
      setFileNotice({
        tone: "error",
        message:
          fileError instanceof Error
            ? fileError.message
            : "The resume file could not be read.",
      });
    } finally {
      setFileBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (method === "paste") {
      if (parsedResume) {
        void save({
          step: 2,
          data: {
            method: "file",
            originalName: parsedResume.originalName,
            contentType: parsedResume.contentType,
            byteSize: parsedResume.byteSize,
            clientFileChecksumSha256:
              parsedResume.clientFileChecksumSha256,
            extractedText: careerText,
            pageCount: parsedResume.pageCount,
            parser: parsedResume.parser,
          },
        });
      } else {
        void save({ step: 2, data: { method, careerText } });
      }
      return;
    }
    void save({
      step: 2,
      data: {
        method,
        role: {
          employer: role.employer,
          title: role.title,
          startDate: role.startDate || null,
          endDate: role.isCurrent ? null : role.endDate || null,
          isCurrent: role.isCurrent,
          location: role.location || null,
          summary: role.summary || null,
        },
      },
    });
  };

  return (
    <form onSubmit={submit}>
      <p className={styles.eyebrow}>Build from the truth</p>
      <h1>Bring in your experience</h1>
      <p className={styles.intro}>
        Start with the fastest accurate source. Way Ahead will not claim that a
        document was parsed or understood when it was not.
      </p>

      <div className={styles.filePanel}>
        <FileDoc size={28} weight="duotone" aria-hidden="true" />
        <div>
          <strong>Choose a résumé file</strong>
          <p>PDF, DOCX, or TXT, up to 5 MB.</p>
          <label className={styles.fileButton}>
            <File size={18} />
            Choose file
            <input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              disabled={fileBusy}
              onChange={(event) => void handleFile(event)}
            />
          </label>
        </div>
      </div>
      <p className={styles.fileTruth}>
        The file is read in your browser. The raw PDF or DOCX is not uploaded
        or stored; only the extracted text you review is saved.
      </p>
      {fileNotice ? (
        <p
          className={`${styles.fileNotice} ${fileNotice.tone === "error" ? styles.fileNoticeError : ""}`}
          role={fileNotice.tone === "error" ? "alert" : "status"}
        >
          {fileNotice.message}
        </p>
      ) : null}

      <fieldset className={styles.methodFieldset}>
        <legend>How do you want to continue?</legend>
        <div>
          <label className={method === "paste" ? styles.methodSelected : ""}>
            <input
              type="radio"
              name="experience-method"
              checked={method === "paste"}
              onChange={() => setMethod("paste")}
            />
            <strong>Paste résumé or career text</strong>
            <span>Review the exact text before it is saved.</span>
          </label>
          <label className={method === "manual" ? styles.methodSelected : ""}>
            <input
              type="radio"
              name="experience-method"
              checked={method === "manual"}
              onChange={() => setMethod("manual")}
            />
            <strong>Add a role manually</strong>
            <span>
              Start with your current or most recent job. One structured role
              with dates is required before activation.
            </span>
          </label>
        </div>
      </fieldset>

      {method === "paste" ? (
        <label className={styles.field}>
          <span>Career text</span>
          <textarea
            value={careerText}
            maxLength={80_000}
            rows={12}
            onChange={(event) => setCareerText(event.target.value)}
            placeholder="Paste your résumé text or career history here."
          />
          <small>
            Saved as source text, not confirmed career facts. File parsing
            happens locally; the next step asks you to structure and confirm
            your current or most recent role separately.
          </small>
        </label>
      ) : (
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Employer</span>
            <input
              value={role.employer}
              maxLength={160}
              required
              onChange={(event) =>
                setRole((current) => ({ ...current, employer: event.target.value }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>Job title</span>
            <input
              value={role.title}
              maxLength={160}
              required
              onChange={(event) =>
                setRole((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>Start date</span>
            <input
              type="month"
              value={role.startDate}
              required
              onChange={(event) =>
                setRole((current) => ({ ...current, startDate: event.target.value }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>End date</span>
            <input
              type="month"
              value={role.endDate}
              disabled={role.isCurrent}
              required={!role.isCurrent}
              min={role.startDate || undefined}
              onChange={(event) =>
                setRole((current) => ({ ...current, endDate: event.target.value }))
              }
            />
          </label>
          <label className={styles.inlineCheck}>
            <input
              type="checkbox"
              checked={role.isCurrent}
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  isCurrent: event.target.checked,
                }))
              }
            />
            I currently work here
          </label>
          <label className={styles.field}>
            <span>Location</span>
            <input
              value={role.location}
              maxLength={160}
              onChange={(event) =>
                setRole((current) => ({ ...current, location: event.target.value }))
              }
            />
          </label>
          <label className={`${styles.field} ${styles.fullField}`}>
            <span>What did you own and accomplish?</span>
            <textarea
              value={role.summary}
              maxLength={4_000}
              rows={6}
              onChange={(event) =>
                setRole((current) => ({ ...current, summary: event.target.value }))
              }
            />
          </label>
        </div>
      )}
      <StepSubmit busy={busy}>Save and review my information</StepSubmit>
    </form>
  );
}

function ProfileReviewStep({ state, busy, save }: StepProps) {
  const [confirmed, setConfirmed] = useState(false);
  const savedRole = state.careerInput.role;
  const [role, setRole] = useState({
    employer: savedRole?.employer ?? "",
    title: savedRole?.title ?? "",
    startDate: savedRole?.startDate ?? "",
    endDate: savedRole?.endDate ?? "",
    isCurrent: savedRole?.isCurrent ?? false,
    location: savedRole?.location ?? "",
    summary: savedRole?.summary ?? "",
  });
  const savedRoleReady = Boolean(
    savedRole?.employer.trim() &&
      savedRole.title.trim() &&
      savedRole.startDate &&
      (savedRole.isCurrent ||
        (savedRole.endDate && savedRole.endDate >= savedRole.startDate)),
  );
  const roleChanged = Boolean(
    role.employer.trim() !== (savedRole?.employer ?? "").trim() ||
      role.title.trim() !== (savedRole?.title ?? "").trim() ||
      role.startDate !== (savedRole?.startDate ?? "") ||
      role.endDate !== (savedRole?.endDate ?? "") ||
      role.isCurrent !== (savedRole?.isCurrent ?? false) ||
      role.location.trim() !== (savedRole?.location ?? "").trim() ||
      role.summary.trim() !== (savedRole?.summary ?? "").trim(),
  );
  const roleReady = Boolean(
    role.employer.trim() &&
      role.title.trim() &&
      role.startDate &&
      (role.isCurrent || (role.endDate && role.endDate >= role.startDate)),
  );

  const saveStructuredRole = () => {
    setConfirmed(false);
    void save({
      step: 2,
      data: {
        method: "manual",
        role: {
          employer: role.employer,
          title: role.title,
          startDate: role.startDate || null,
          endDate: role.isCurrent ? null : role.endDate || null,
          isCurrent: role.isCurrent,
          location: role.location || null,
          summary: role.summary || null,
        },
      },
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!savedRoleReady || roleChanged) return;
    void save({ step: 3, data: { confirmed } });
  };
  return (
    <form onSubmit={submit}>
      <p className={styles.eyebrow}>You are the source of truth</p>
      <h1>Make your profile accurate</h1>
      <p className={styles.intro}>
        Review the exact structured role that can become confirmed evidence.
        Imported text stays source material and is never promoted in bulk.
      </p>
      <div className={styles.reviewCard}>
        {state.careerInput.sourceText ? (
          <>
            <span>Imported source text · not confirmed career facts</span>
            <pre>{state.careerInput.sourceText}</pre>
          </>
        ) : null}
      </div>
      <section
        className={styles.reviewCard}
        aria-labelledby="structured-role-heading"
      >
        <h2 id="structured-role-heading">Current or most recent role</h2>
        <p>
          Save one structured role before confirming it. You can add the rest
          of your history from Career Profile after setup.
        </p>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Employer</span>
            <input
              value={role.employer}
              maxLength={160}
              required
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  employer: event.target.value,
                }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>Job title</span>
            <input
              value={role.title}
              maxLength={160}
              required
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>Start date</span>
            <input
              type="month"
              value={role.startDate}
              required
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>End date</span>
            <input
              type="month"
              value={role.endDate}
              disabled={role.isCurrent}
              required={!role.isCurrent}
              min={role.startDate || undefined}
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
            />
          </label>
          <label className={styles.inlineCheck}>
            <input
              type="checkbox"
              checked={role.isCurrent}
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  isCurrent: event.target.checked,
                  endDate: event.target.checked ? "" : current.endDate,
                }))
              }
            />
            I currently work here
          </label>
          <label className={styles.field}>
            <span>Location</span>
            <input
              value={role.location}
              maxLength={160}
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
            />
          </label>
          <label className={`${styles.field} ${styles.fullField}`}>
            <span>What did you own and accomplish?</span>
            <textarea
              value={role.summary}
              maxLength={4_000}
              rows={5}
              onChange={(event) =>
                setRole((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={busy || !roleReady || !roleChanged}
          onClick={saveStructuredRole}
        >
          {savedRole ? "Save role changes" : "Save structured role"}
        </button>
        {savedRoleReady && !roleChanged ? (
          <p role="status">
            Saved for confirmation: {savedRole?.title} at{" "}
            {savedRole?.employer}.
          </p>
        ) : (
          <p>
            This role is not confirmation-ready until the required fields and
            dates are saved.
          </p>
        )}
      </section>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={confirmed}
          disabled={!savedRoleReady || roleChanged}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>
          <strong>
            I confirm this one structured role as accurate career evidence.
          </strong>
          Imported source text remains unconfirmed. I can review and add other
          roles later from Career Profile.
        </span>
      </label>
      <StepSubmit
        busy={busy}
        disabled={!savedRoleReady || roleChanged || !confirmed}
      >
        Confirm this role and define a better job
      </StepSubmit>
    </form>
  );
}

function JobStandardStep({ state, busy, save }: StepProps) {
  const initial = state.jobStandard;
  const [payBasis, setPayBasis] = useState<"salary" | "hourly" | "either">(
    initial?.payBasis ?? "salary",
  );
  const [minimumPay, setMinimumPay] = useState(
    initial?.minimumPayCents ? String(initial.minimumPayCents / 100) : "",
  );
  const [targetPay, setTargetPay] = useState(
    initial?.targetPayCents ? String(initial.targetPayCents / 100) : "",
  );
  const [arrangements, setArrangements] = useState<string[]>(
    initial?.workArrangements ?? ["Remote"],
  );
  const [commuteMiles, setCommuteMiles] = useState(
    initial?.commuteMiles === null || initial?.commuteMiles === undefined
      ? ""
      : String(initial.commuteMiles),
  );
  const [locations, setLocations] = useState(initial?.locations.join(", ") ?? "");
  const [travel, setTravel] = useState(
    initial?.travelMaximumPercent === null ||
      initial?.travelMaximumPercent === undefined
      ? ""
      : String(initial.travelMaximumPercent),
  );
  const [schedule, setSchedule] = useState(initial?.scheduleRequirements ?? "");
  const [benefits, setBenefits] = useState(initial?.benefits.join(", ") ?? "");
  const [growth, setGrowth] = useState(
    initial?.growthPriorities.join(", ") ?? "",
  );
  const [exclusions, setExclusions] = useState(
    initial?.exclusions.join(", ") ?? "",
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void save({
      step: 4,
      data: {
        payBasis,
        minimumPayCents: Math.round(Number(minimumPay) * 100),
        targetPayCents: Math.round(Number(targetPay) * 100),
        currency: "USD",
        workArrangements: arrangements,
        commuteMiles: commuteMiles ? Number(commuteMiles) : null,
        locations: splitList(locations),
        travelMaximumPercent: travel ? Number(travel) : null,
        scheduleRequirements: schedule || null,
        benefits: splitList(benefits),
        growthPriorities: splitList(growth),
        exclusions: splitList(exclusions),
      },
    });
  };

  return (
    <form onSubmit={submit}>
      <p className={styles.eyebrow}>Your Job Standard</p>
      <h1>What would make the next job worth it?</h1>
      <p className={styles.intro}>
        These are decision inputs, not promises about what a role offers. Way
        Ahead keeps missing details visible instead of filling them in.
      </p>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Compare pay as</span>
          <select
            value={payBasis}
            onChange={(event) =>
              setPayBasis(event.target.value as "salary" | "hourly" | "either")
            }
          >
            <option value="salary">Annual salary</option>
            <option value="hourly">Hourly pay</option>
            <option value="either">Either</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Minimum {payBasis === "hourly" ? "hourly pay" : "annual pay"}</span>
          <input
            type="number"
            min="0"
            step={payBasis === "hourly" ? "0.01" : "1000"}
            value={minimumPay}
            onChange={(event) => setMinimumPay(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Target {payBasis === "hourly" ? "hourly pay" : "annual pay"}</span>
          <input
            type="number"
            min="0"
            step={payBasis === "hourly" ? "0.01" : "1000"}
            value={targetPay}
            onChange={(event) => setTargetPay(event.target.value)}
          />
        </label>
        <fieldset className={styles.compactFieldset}>
          <legend>Work arrangements</legend>
          {["Remote", "Hybrid", "On-site"].map((arrangement) => (
            <label key={arrangement}>
              <input
                type="checkbox"
                checked={arrangements.includes(arrangement)}
                onChange={() =>
                  setArrangements((current) =>
                    current.includes(arrangement)
                      ? current.filter((item) => item !== arrangement)
                      : [...current, arrangement],
                  )
                }
              />
              {arrangement}
            </label>
          ))}
        </fieldset>
        <label className={styles.field}>
          <span>Maximum commute (miles)</span>
          <input
            type="number"
            min="0"
            max="500"
            value={commuteMiles}
            onChange={(event) => setCommuteMiles(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Locations to include</span>
          <input
            value={locations}
            onChange={(event) => setLocations(event.target.value)}
            placeholder="Nashville, TN, United States"
          />
        </label>
        <label className={styles.field}>
          <span>Maximum travel (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            value={travel}
            onChange={(event) => setTravel(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Schedule needs, if any</span>
          <input
            value={schedule}
            maxLength={500}
            onChange={(event) => setSchedule(event.target.value)}
            placeholder="For example: predictable weekdays"
          />
        </label>
        <label className={styles.field}>
          <span>Benefits that matter</span>
          <input
            value={benefits}
            onChange={(event) => setBenefits(event.target.value)}
            placeholder="Family health insurance, 401(k), paid leave"
          />
        </label>
        <label className={styles.field}>
          <span>Growth priorities</span>
          <input
            value={growth}
            onChange={(event) => setGrowth(event.target.value)}
            placeholder="Clear ownership, strong leadership, learning"
          />
        </label>
        <label className={`${styles.field} ${styles.fullField}`}>
          <span>Dealbreakers</span>
          <textarea
            value={exclusions}
            rows={3}
            onChange={(event) => setExclusions(event.target.value)}
            placeholder="One per line or separated by commas"
          />
        </label>
      </div>
      <StepSubmit busy={busy}>Save my Job Standard</StepSubmit>
    </form>
  );
}

function CareerPathsStep({ state, busy, save }: StepProps) {
  const initialPaths =
    state.careerPaths.length > 0
      ? state.careerPaths.map((path) => path.label)
      : [""];
  const initialPrimary = Math.max(
    0,
    state.careerPaths.findIndex((path) => path.isPrimary),
  );
  const [paths, setPaths] = useState(initialPaths);
  const [primaryIndex, setPrimaryIndex] = useState(initialPrimary);

  const updatePath = (index: number, value: string) => {
    setPaths((current) =>
      current.map((path, pathIndex) => (pathIndex === index ? value : path)),
    );
  };
  const removePath = (index: number) => {
    setPaths((current) => current.filter((_, pathIndex) => pathIndex !== index));
    setPrimaryIndex((current) => {
      if (current === index) return 0;
      return current > index ? current - 1 : current;
    });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const keptPaths = paths.map((path) => path.trim()).filter(Boolean);
    const primaryLabel = paths[primaryIndex]?.trim();
    const normalizedPrimaryIndex = Math.max(0, keptPaths.indexOf(primaryLabel));
    void save({
      step: 5,
      data: { paths: keptPaths, primaryIndex: normalizedPrimaryIndex },
    });
  };

  return (
    <form onSubmit={submit}>
      <p className={styles.eyebrow}>Search without flattening your options</p>
      <h1>Choose the paths worth exploring</h1>
      <p className={styles.intro}>
        Add the career directions you want to organize. Choose one primary
        focus for Home, while keeping the others visible as separate
        scoreboards. Way Ahead has not scored these paths yet.
      </p>
      <fieldset className={styles.pathFieldset}>
        <legend>Job Paths</legend>
        {paths.map((path, index) => (
          <div
            key={`${index}-${paths.length}`}
            className={primaryIndex === index ? styles.primaryPath : ""}
          >
            <label className={styles.primaryRadio}>
              <input
                type="radio"
                name="primary-path"
                checked={primaryIndex === index}
                onChange={() => setPrimaryIndex(index)}
              />
              <span aria-hidden="true" />
              Primary
            </label>
            <label className={styles.field}>
              <span>Job Path {index + 1}</span>
              <input
                value={path}
                maxLength={80}
                onChange={(event) => updatePath(index, event.target.value)}
                placeholder="For example: Revenue Operations"
              />
            </label>
            {paths.length > 1 ? (
              <button
                className={styles.removeButton}
                type="button"
                onClick={() => removePath(index)}
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </fieldset>
      {paths.length < 5 ? (
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => setPaths((current) => [...current, ""])}
        >
          Add another Job Path
        </button>
      ) : null}
      <StepSubmit busy={busy}>Build my search plan</StepSubmit>
    </form>
  );
}

function PlanReviewStep({ state, busy, save }: StepProps) {
  const [confirmed, setConfirmed] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void save({ step: 6, data: { confirmed } });
  };
  const standard = state.jobStandard;
  const formatPay = (cents: number | null) => {
    if (cents === null) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: standard?.payBasis === "hourly" ? 2 : 0,
    }).format(cents / 100);
  };
  return (
    <form onSubmit={submit}>
      <p className={styles.eyebrow}>Review before activation</p>
      <h1>Your search has a direction now.</h1>
      <p className={styles.intro}>
        This is the plan Way Ahead will use to organize Home. Scores and job
        recommendations will appear only after current source evidence and your
        career proof have actually been evaluated.
      </p>
      <div className={styles.planGrid}>
        <article>
          <span>What should change</span>
          <strong>
            {state.goal?.priorities.join(" · ") || state.goal?.notes || "Not set"}
          </strong>
        </article>
        <article>
          <span>Job Standard</span>
          <strong>
            {formatPay(standard?.minimumPayCents ?? null)} minimum ·{" "}
            {formatPay(standard?.targetPayCents ?? null)} target
          </strong>
          <p>{standard?.workArrangements.join(", ") || "Arrangement not set"}</p>
        </article>
        <article className={styles.fullPlanCard}>
          <span>Job Paths</span>
          <ul>
            {state.careerPaths.map((path) => (
              <li key={path.id}>
                <strong>{path.label}</strong>
                {path.isPrimary ? <small>Primary</small> : null}
                <span>Not scored yet</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>
          <strong>Use this plan to activate my workspace.</strong>
          I understand that Way Ahead will preserve unknowns and ask me to
          approve the exact version before any future employer-facing action.
          This does not authorize outreach or application submission.
        </span>
      </label>
      <StepSubmit busy={busy}>Finish setup and see Home</StepSubmit>
    </form>
  );
}

function StepSubmit({
  busy,
  disabled = false,
  children,
}: {
  busy: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.actions}>
      <button
        className={styles.primaryButton}
        type="submit"
        disabled={busy || disabled}
      >
        {busy ? "Saving…" : children}
        {!busy ? <ArrowRight size={19} weight="bold" /> : null}
      </button>
      <span>Saved to your private Way Ahead workspace.</span>
    </div>
  );
}
