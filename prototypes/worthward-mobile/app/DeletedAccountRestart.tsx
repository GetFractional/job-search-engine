"use client";

import { ArrowRight, SignOut } from "@phosphor-icons/react";
import { useState } from "react";
import { ACCOUNT_RESTART_CONFIRMATION } from "./account-policy";
import styles from "./privacy-center.module.css";

export function DeletedAccountRestart({
  signOutHref,
}: {
  signOutHref: string;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function restart() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/account/restart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const result = (await response.json()) as {
        error?: string;
        restarted?: boolean;
      };
      if (!response.ok || result.restarted !== true) {
        throw new Error(result.error ?? "A new account could not be started.");
      }
      window.location.assign("/app");
    } catch (restartError) {
      setError(
        restartError instanceof Error
          ? restartError.message
          : "A new account could not be started.",
      );
      setBusy(false);
    }
  }

  return (
    <main className={styles.restartShell}>
      <section className={styles.center} aria-labelledby="restart-title">
        <header className={styles.hero}>
          <p>Deleted account</p>
          <h1 id="restart-title">Your prior Way Ahead workspace stays deleted.</h1>
          <span>
            Starting again creates a separate, empty account. It does not
            restore your old career information.
          </span>
        </header>
        <article className={styles.actionCard}>
          <p>Explicit restart</p>
          <h2>Start a new empty account</h2>
          <p>
            You will return to the first onboarding step and choose what, if
            anything, to provide again.
          </p>
          <label>
            <span>
              Type <strong>{ACCOUNT_RESTART_CONFIRMATION}</strong>
            </span>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={
              busy || confirmation !== ACCOUNT_RESTART_CONFIRMATION
            }
            onClick={() => void restart()}
          >
            <ArrowRight aria-hidden="true" />
            {busy ? "Starting…" : "Start a new empty account"}
          </button>
          {error ? (
            <div className={styles.notice} data-tone="error" role="alert">
              {error}
            </div>
          ) : null}
          <a className={styles.signOutLink} href={signOutHref}>
            <SignOut aria-hidden="true" /> Sign out instead
          </a>
        </article>
      </section>
    </main>
  );
}
