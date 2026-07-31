"use client";

import { useState } from "react";
import styles from "./onboarding.module.css";

type BootstrapReceipt = {
  imported: true;
  counts: Record<string, number>;
};

export default function OwnerBootstrapForm() {
  const [payload, setPayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function importWorkspace() {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setError("Paste a valid owner workspace JSON packet.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/owner-bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const result = await response.json() as BootstrapReceipt | { error?: string };
      if (!response.ok) {
        throw new Error("error" in result && result.error
          ? result.error
          : "The owner workspace could not be imported.");
      }
      window.location.replace("/app/home");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The owner workspace could not be imported.");
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className={styles.main}>
      <aside className={styles.progress} aria-label="Owner import safeguards">
        <p>Private owner operation</p>
        <h2 className={styles.progressHeading}>One protected import</h2>
        <p className={styles.progressTrust}>
          The server verifies the configured owner, same-origin request, payload
          bounds, and an empty workspace before writing anything.
        </p>
      </aside>

      <section className={styles.stepPanel} aria-labelledby="owner-bootstrap-heading">
        <p className={styles.eyebrow}>Way Ahead production setup</p>
        <h1 id="owner-bootstrap-heading">Initialize the owner workspace</h1>
        <p className={styles.intro}>
          Paste the private, provenance-backed owner packet. This operation
          cannot overwrite an initialized workspace and does not authorize any
          outreach or application submission.
        </p>

        {error ? (
          <p className={styles.error} role="alert">{error}</p>
        ) : null}

        <label className={styles.field}>
          Owner workspace JSON
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            rows={12}
            placeholder="Paste the private owner workspace packet"
          />
          <small>The packet remains private and is sent only to this Way Ahead deployment.</small>
        </label>

        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={submitting || !payload.trim()}
            onClick={importWorkspace}
          >
            {submitting ? "Importing…" : "Import and open Way Ahead"}
          </button>
          <span>Reserved for the configured owner account.</span>
        </div>
      </section>
    </main>
  );
}
