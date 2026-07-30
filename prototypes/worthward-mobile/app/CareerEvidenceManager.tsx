"use client";

import {
  ArrowCounterClockwise,
  CheckCircle,
  PencilSimple,
  Plus,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ExperienceRecord } from "./production-types";
import styles from "./career-evidence.module.css";

type CareerEvidenceManagerProps = {
  roles: ExperienceRecord[];
  removedRoles: ExperienceRecord[];
  onRefresh: () => Promise<void>;
};

type RoleDraft = {
  employer: string;
  title: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  location: string;
  summary: string;
};

type MutationResponse = {
  roleId?: string;
  changed?: boolean;
  dependentStateInvalidated?: boolean;
  message?: string;
  error?: string;
};

const EMPTY_ROLE: RoleDraft = {
  employer: "",
  title: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  location: "",
  summary: "",
};

function draftFromRole(role: ExperienceRecord): RoleDraft {
  return {
    employer: role.employer,
    title: role.title,
    startDate: role.startDate ?? "",
    endDate: role.endDate ?? "",
    isCurrent: role.isCurrent,
    location: role.location ?? "",
    summary: role.summary ?? "",
  };
}

function formatMonth(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return "Month not set";
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

async function postMutation(
  body: Record<string, unknown>,
): Promise<MutationResponse> {
  const response = await fetch("/api/career-evidence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as MutationResponse;
  if (!response.ok) {
    throw new Error(
      result.error ?? "The Career Evidence change could not be saved.",
    );
  }
  return result;
}

export function CareerEvidenceManager({
  roles,
  removedRoles,
  onRefresh,
}: CareerEvidenceManagerProps) {
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<RoleDraft>(EMPTY_ROLE);
  const [confirmed, setConfirmed] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [busyRoleId, setBusyRoleId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const openEditor = (role?: ExperienceRecord) => {
    setEditingRoleId(role?.id ?? null);
    setDraft(role ? draftFromRole(role) : EMPTY_ROLE);
    setConfirmed(false);
    setPendingRemoveId(null);
    setNotice(null);
    setEditorOpen(true);
    window.requestAnimationFrame(() => editorRef.current?.focus());
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingRoleId(null);
    setDraft(EMPTY_ROLE);
    setConfirmed(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusyRoleId(editingRoleId ?? "new");
    setNotice(null);
    try {
      const result = await postMutation({
        action: "upsert",
        roleId: editingRoleId,
        confirmed,
        role: {
          ...draft,
          endDate: draft.isCurrent ? null : draft.endDate,
          location: draft.location || null,
          summary: draft.summary || null,
        },
      });
      await onRefresh();
      closeEditor();
      setNotice({
        tone: "success",
        message:
          result.message ??
          "Career Evidence saved. Dependent work now reflects its review state.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "The Career Evidence change could not be saved.",
      });
      window.requestAnimationFrame(() => editorRef.current?.focus());
    } finally {
      setBusyRoleId(null);
    }
  };

  const remove = async (roleId: string) => {
    setBusyRoleId(roleId);
    setNotice(null);
    try {
      const result = await postMutation({ action: "remove", roleId });
      await onRefresh();
      setPendingRemoveId(null);
      if (editingRoleId === roleId) closeEditor();
      setNotice({
        tone: "success",
        message: result.message ?? "Role removed from active Career Evidence.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "The role could not be removed.",
      });
    } finally {
      setBusyRoleId(null);
    }
  };

  const restore = async (roleId: string) => {
    setBusyRoleId(roleId);
    setNotice(null);
    try {
      const result = await postMutation({ action: "restore", roleId });
      await onRefresh();
      setNotice({
        tone: "success",
        message: result.message ?? "Role restored to active Career Evidence.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "The role could not be restored.",
      });
    } finally {
      setBusyRoleId(null);
    }
  };

  return (
    <section className={styles.manager} aria-labelledby="career-evidence-title">
      <div className={styles.heading}>
        <div>
          <p className="wa-eyebrow">Career Evidence</p>
          <h2 id="career-evidence-title">The experience behind every claim.</h2>
          <p>
            Keep every role accurate and specific. Confirmed changes make
            existing job decisions and profile-built documents reviewable
            again before they can be trusted.
          </p>
        </div>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => openEditor()}
          disabled={Boolean(busyRoleId)}
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Add role
        </button>
      </div>

      {notice ? (
        <div
          className={
            notice.tone === "error"
              ? `${styles.notice} ${styles.noticeError}`
              : styles.notice
          }
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.tone === "error" ? (
            <WarningCircle size={20} weight="fill" aria-hidden="true" />
          ) : (
            <CheckCircle size={20} weight="fill" aria-hidden="true" />
          )}
          <span>{notice.message}</span>
        </div>
      ) : null}

      {editorOpen ? (
        <div
          className={styles.editor}
          ref={editorRef}
          tabIndex={-1}
          aria-labelledby="career-evidence-editor-title"
        >
          <div className={styles.editorHeading}>
            <div>
              <span>{editingRoleId ? "Correct confirmed evidence" : "Add confirmed evidence"}</span>
              <h3 id="career-evidence-editor-title">
                {editingRoleId ? "Edit role" : "Add a role"}
              </h3>
            </div>
            <button
              className={styles.textButton}
              type="button"
              onClick={closeEditor}
              disabled={Boolean(busyRoleId)}
            >
              Cancel
            </button>
          </div>
          <form onSubmit={(event) => void submit(event)}>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>Employer</span>
                <input
                  value={draft.employer}
                  maxLength={160}
                  required
                  autoComplete="organization"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      employer: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Job title</span>
                <input
                  value={draft.title}
                  maxLength={160}
                  required
                  autoComplete="organization-title"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Start month</span>
                <input
                  type="month"
                  value={draft.startDate}
                  max={currentMonth}
                  required
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>End month</span>
                <input
                  type="month"
                  value={draft.endDate}
                  min={draft.startDate || undefined}
                  max={currentMonth}
                  disabled={draft.isCurrent}
                  required={!draft.isCurrent}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.currentCheck}>
                <input
                  type="checkbox"
                  checked={draft.isCurrent}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      isCurrent: event.target.checked,
                      endDate: event.target.checked ? "" : current.endDate,
                    }))
                  }
                />
                <span>I currently work here</span>
              </label>
              <label className={styles.field}>
                <span>Location</span>
                <input
                  value={draft.location}
                  maxLength={160}
                  autoComplete="address-level2"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.wideField}>
                <span>What did you own and accomplish?</span>
                <textarea
                  value={draft.summary}
                  maxLength={4_000}
                  rows={6}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                />
                <small>
                  Add the responsibilities, deliverables, scope, tools, and
                  results that could help Way Ahead evaluate a real job.
                </small>
              </label>
            </div>
            <label className={styles.confirmation}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span>
                <strong>I confirm these role details are accurate.</strong>
                Saving a correction invalidates dependent scores, profile-built
                documents, packages, and pending approvals until they are
                rebuilt and reviewed.
              </span>
            </label>
            <div className={styles.formActions}>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={!confirmed || Boolean(busyRoleId)}
              >
                {busyRoleId
                  ? "Saving…"
                  : editingRoleId
                    ? "Save confirmed correction"
                    : "Add confirmed role"}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={closeEditor}
                disabled={Boolean(busyRoleId)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {roles.length ? (
        <div className={styles.roleList}>
          {roles.map((role) => {
            const removing = pendingRemoveId === role.id;
            return (
              <article className={styles.roleCard} key={role.id}>
                <div className={styles.roleMain}>
                  <div className={styles.roleDates}>
                    {formatMonth(role.startDate)} –{" "}
                    {role.isCurrent ? "Present" : formatMonth(role.endDate)}
                  </div>
                  <h3>{role.title}</h3>
                  <p className={styles.employer}>
                    {role.employer}
                    {role.location ? ` · ${role.location}` : ""}
                  </p>
                  {role.summary ? (
                    <p className={styles.summary}>{role.summary}</p>
                  ) : (
                    <p className={styles.summaryOpen}>
                      Add what you owned and accomplished to improve evidence
                      coverage.
                    </p>
                  )}
                  <div className={styles.provenance}>
                    <CheckCircle size={16} weight="fill" aria-hidden="true" />
                    <span>{role.provenance.label}</span>
                    <small>{role.reviewState}</small>
                  </div>
                </div>
                <div className={styles.roleActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => openEditor(role)}
                    disabled={Boolean(busyRoleId)}
                  >
                    <PencilSimple size={16} aria-hidden="true" />
                    Edit
                  </button>
                  {!removing ? (
                    <button
                      className={styles.dangerTextButton}
                      type="button"
                      onClick={() => setPendingRemoveId(role.id)}
                      disabled={Boolean(busyRoleId)}
                    >
                      <Trash size={16} aria-hidden="true" />
                      Remove
                    </button>
                  ) : (
                    <div className={styles.removeConfirm} role="alert">
                      <p>
                        Remove this role from active evidence? You can restore
                        it later.
                      </p>
                      <div>
                        <button
                          className={styles.dangerButton}
                          type="button"
                          onClick={() => void remove(role.id)}
                          disabled={Boolean(busyRoleId)}
                        >
                          {busyRoleId === role.id ? "Removing…" : "Remove role"}
                        </button>
                        <button
                          className={styles.textButton}
                          type="button"
                          onClick={() => setPendingRemoveId(null)}
                          disabled={Boolean(busyRoleId)}
                        >
                          Keep role
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <WarningCircle size={24} weight="duotone" aria-hidden="true" />
          <div>
            <strong>No active experience roles</strong>
            <p>
              Add your current or most recent role before relying on job
              decisions or profile-built documents.
            </p>
          </div>
        </div>
      )}

      {removedRoles.length ? (
        <details className={styles.removed}>
          <summary>Recently removed roles ({removedRoles.length})</summary>
          <div>
            {removedRoles.map((role) => (
              <article key={role.id}>
                <div>
                  <strong>{role.title}</strong>
                  <span>{role.employer}</span>
                </div>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => void restore(role.id)}
                  disabled={Boolean(busyRoleId)}
                >
                  <ArrowCounterClockwise size={16} aria-hidden="true" />
                  {busyRoleId === role.id ? "Restoring…" : "Restore"}
                </button>
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
