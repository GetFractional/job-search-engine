"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  ChatCircleDots,
  DownloadSimple,
  SignOut,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  ACCOUNT_DELETION_CONFIRMATION,
  MAXIMUM_D1_RECOVERY_WINDOW_DAYS,
  PUBLIC_ALPHA_POLICY_VERSION,
} from "./account-policy";
import styles from "./privacy-center.module.css";

type PrivacyCenterProps = {
  role: "owner" | "member";
  signOutHref: string;
  onBack?: () => void;
};

type ActionNotice = {
  tone: "success" | "error";
  text: string;
};

function responseFilename(response: Response): string {
  const header = response.headers.get("Content-Disposition") ?? "";
  return (
    header.match(/filename="([^"]+)"/)?.[1] ??
    `way-ahead-account-export-${new Date().toISOString().slice(0, 10)}.json`
  );
}

export function PrivacyCenter({
  role,
  signOutHref,
  onBack,
}: PrivacyCenterProps) {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [notice, setNotice] = useState<ActionNotice | null>(null);

  async function downloadExport() {
    setExporting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "export_my_account" }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Your export could not be prepared.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = responseFilename(response);
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
      setNotice({
        tone: "success",
        text: "Your private JSON export was downloaded to this device.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Your export could not be prepared.",
      });
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const result = (await response.json()) as {
        error?: string;
        deleted?: boolean;
      };
      if (!response.ok || result.deleted !== true) {
        throw new Error(result.error ?? "Your account could not be deleted.");
      }
      window.location.assign(signOutHref);
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Your account could not be deleted.",
      });
      setDeleting(false);
    }
  }

  return (
    <section className={styles.center} aria-labelledby="privacy-center-title">
      {onBack ? (
        <button className={styles.back} type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Return to setup
        </button>
      ) : null}

      <header className={styles.hero}>
        <p>Privacy and control</p>
        <h1 id="privacy-center-title">
          Know what is saved before you trust Way Ahead with your career.
        </h1>
        <span>Alpha policy {PUBLIC_ALPHA_POLICY_VERSION}</span>
      </header>

      <div className={styles.contract}>
        <article>
          <span>1</span>
          <div>
            <h2>What this alpha saves</h2>
            <p>
              Answers and reviewed text you submit, profile facts, job
              preferences, Job Paths, jobs you add, analyses, pursuits,
              document versions, consent, and audit receipts. PDF and DOCX
              files are read on this device; their raw bytes are not uploaded.
            </p>
          </div>
        </article>
        <article>
          <span>2</span>
          <div>
            <h2>How it is used</h2>
            <p>
              Only to run your private Way Ahead workspace and prepare work you
              can review. Paid AI generation, email, billing, employer-form
              changes, uploads, outreach, and application submission are not
              connected.
            </p>
          </div>
        </article>
        <article>
          <span>3</span>
          <div>
            <h2>Retention and recovery copies</h2>
            <p>
              Live account data stays until you delete the account. The current
              database service can retain point-in-time recovery history for
              up to {MAXIMUM_D1_RECOVERY_WINDOW_DAYS} days after deletion,
              depending on the hosting tier.
              It is for disaster recovery, not ordinary account restoration,
              and expires through the provider&apos;s rotation.
            </p>
            <a
              href="https://developers.cloudflare.com/d1/reference/time-travel/"
              target="_blank"
              rel="noreferrer"
            >
              Database recovery documentation
              <ArrowSquareOut aria-hidden="true" />
            </a>
          </div>
        </article>
        <article>
          <span>4</span>
          <div>
            <h2>Correction and export</h2>
            <p>
              Review and correct important facts during setup and from Career
              Profile or Search Plan. Corrections can make dependent scores and
              documents require review again. The export below downloads the
              account data and receipts currently tied to you.
            </p>
          </div>
        </article>
        <article>
          <span>5</span>
          <div>
            <h2>Deletion</h2>
            <p>
              A member can delete the live account and its private workspace
              immediately. Shared public employer records remain without the
              personal link. A pseudonymous deletion receipt remains; the
              ChatGPT account itself is not deleted.
            </p>
          </div>
        </article>
      </div>

      <div className={styles.actionsGrid}>
        <article className={styles.actionCard}>
          <p>Take your data</p>
          <h2>Download an account export</h2>
          <p>
            A private JSON file includes your current career records,
            preferences, jobs, documents, approvals, consent, and audit trail.
          </p>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => void downloadExport()}
            disabled={exporting || deleting}
          >
            <DownloadSimple aria-hidden="true" />
            {exporting ? "Preparing export…" : "Download my data"}
          </button>
        </article>

        <article className={`${styles.actionCard} ${styles.dangerCard}`}>
          <p>Leave the alpha</p>
          <h2>Delete this account</h2>
          {role === "owner" ? (
            <p>
              The configured owner account is the company recovery surface.
              Its deletion is reserved until the Board approves an exact data
              and rollback plan.
            </p>
          ) : (
            <>
              <p>
                This removes the live private workspace and cannot be undone
                inside Way Ahead. Download your data first if you want a copy.
              </p>
              <label>
                <span>
                  Type <strong>{ACCOUNT_DELETION_CONFIRMATION}</strong> to
                  confirm
                </span>
                <input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <button
                className={styles.dangerButton}
                type="button"
                onClick={() => void deleteAccount()}
                disabled={
                  deleting ||
                  exporting ||
                  confirmation !== ACCOUNT_DELETION_CONFIRMATION
                }
              >
                <Trash aria-hidden="true" />
                {deleting ? "Deleting account…" : "Delete my account"}
              </button>
            </>
          )}
        </article>
      </div>

      {notice ? (
        <div
          className={styles.notice}
          data-tone={notice.tone}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.tone === "error" ? (
            <WarningCircle aria-hidden="true" />
          ) : null}
          {notice.text}
        </div>
      ) : null}

      <aside className={styles.stopCard}>
        <div>
          <p>Need help or want to stop?</p>
          <h2>You can pause without entering more information.</h2>
          <span>
            Report a privacy, sign-in, isolation, or product problem. Do not
            include a résumé or other sensitive details in the email.
          </span>
        </div>
        <div className={styles.stopActions}>
          <a href="mailto:matt@getfractional.co?subject=Way%20Ahead%20alpha%20feedback">
            <ChatCircleDots aria-hidden="true" /> Report a problem
          </a>
          <a href={signOutHref}>
            <SignOut aria-hidden="true" /> Stop and sign out
          </a>
        </div>
      </aside>
    </section>
  );
}
