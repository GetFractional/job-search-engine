"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ClockCounterClockwise,
  Info,
  WarningCircle,
} from "@phosphor-icons/react";
import type { TodayRecord, TodayScoreboardItem } from "./today-types";
import styles from "./today-dashboard.module.css";

function formatTime(value: number | null): string {
  if (!value) return "Not verified";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function score(value: number | null): string {
  return value === null ? "—" : String(value);
}

function JobIdentity({ job }: { job: TodayScoreboardItem }) {
  return (
    <div className={styles.job}>
      <strong>{job.title}</strong>
      <span>{job.employer}</span>
      <span>{job.careerPathLabel}</span>
    </div>
  );
}

export function TodayDashboard() {
  const [record, setRecord] = useState<TodayRecord | null>(null);
  const [selectedPath, setSelectedPath] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/today", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as TodayRecord & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Today could not load.");
        }
        if (active) setRecord(payload);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Today could not load.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const jobs = useMemo(() => {
    if (!record) return [];
    return selectedPath === "all"
      ? record.scoreboard
      : record.scoreboard.filter(
          (job) => job.careerPathId === selectedPath,
        );
  }, [record, selectedPath]);

  if (error) {
    return (
      <section className={styles.empty} role="alert">
        <div>
          <h2>Today’s trusted view did not load.</h2>
          <p>{error} Your saved profile and decisions were not changed.</p>
        </div>
      </section>
    );
  }

  if (!record) {
    return (
      <section className={styles.empty} aria-live="polite">
        <div>
          <p>Building your current view…</p>
        </div>
      </section>
    );
  }

  const activePursuits = record.scoreboard.filter((job) => job.pursuitId);
  const documentGaps = activePursuits.filter(
    (job) =>
      job.documentStatus.resume === "missing" ||
      job.documentStatus.coverLetter === "missing",
  );
  const verifiedToday = jobs.filter(
    (job) =>
      job.lastVerifiedAt !== null &&
      record.system.generatedAt - job.lastVerifiedAt <= 24 * 60 * 60 * 1000,
  );

  return (
    <section className={styles.dashboard} aria-labelledby="today-title">
      <header className={styles.heading}>
        <p className="wa-eyebrow">Today</p>
        <h1 id="today-title">Your best next moves</h1>
        <p>
          Ranked across your active career paths using your Job Standard,
          approved experience, and current source checks.
        </p>
      </header>

      <span className={styles.pathHint} aria-hidden="true">
        Swipe to compare career paths →
      </span>
      <nav className={styles.pathTabs} aria-label="Career path view">
        <button
          data-active={selectedPath === "all"}
          onClick={() => setSelectedPath("all")}
          type="button"
        >
          All paths
        </button>
        {record.paths
          .filter((path) => path.state === "active")
          .map((path) => (
            <button
              data-active={selectedPath === path.id}
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              type="button"
            >
              {path.label}
            </button>
          ))}
      </nav>

      <article className={styles.nextAction}>
        <div>
          <p className="wa-eyebrow">Do this next</p>
          <h2>{record.nextAction.label}</h2>
          <p>{record.nextAction.detail}</p>
        </div>
        <a className={styles.primaryLink} href={record.nextAction.href}>
          Continue <ArrowRight aria-hidden="true" />
        </a>
      </article>

      <section className={styles.module} aria-labelledby="scoreboard-title">
        <div className={styles.moduleHeader}>
          <div>
            <p className="wa-eyebrow">Opportunity scoreboard</p>
            <h2 id="scoreboard-title">Jobs worth your attention</h2>
          </div>
          <p>
            Fit shows role alignment. Priority appears only when both Move
            Value and Pursuit Readiness are defensible.
          </p>
        </div>

        {jobs.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.scoreboard}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Role</th>
                    <th>Fit</th>
                    <th>Priority</th>
                    <th>Move value</th>
                    <th>Readiness</th>
                    <th>Evidence</th>
                    <th>Source</th>
                    <th>Next move</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <tr key={`${job.jobPostingId}-${job.careerPathId}`}>
                      <td>
                        <span className={styles.rank}>{index + 1}</span>
                      </td>
                      <td>
                        <JobIdentity job={job} />
                      </td>
                      <td>
                        <span className={styles.score}>
                          {score(job.fitScore)}
                          <span>/100</span>
                        </span>
                      </td>
                      <td>
                        <span className={styles.score}>
                          {score(job.pursuitPriority)}
                          <span>/100</span>
                        </span>
                      </td>
                      <td>{score(job.moveValue)}</td>
                      <td>{score(job.pursuitReadiness)}</td>
                      <td>
                        <span
                          className={styles.status}
                          data-state={job.evidenceStrength}
                        >
                          {job.evidenceStrength}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.status}
                          data-state={job.sourceStatus}
                        >
                          {job.sourceStatus}
                        </span>
                        <div>{formatTime(job.lastVerifiedAt)}</div>
                      </td>
                      <td>
                        <div className={styles.nextMove}>
                          <span
                            className={styles.status}
                            data-state={job.recommendation}
                          >
                            {job.recommendation}
                          </span>
                          <span>{job.nextMove}</span>
                          <a
                            href={`/app?view=jobs&job=${encodeURIComponent(
                              job.jobPostingId,
                            )}`}
                          >
                            Review job
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {jobs.map((job, index) => (
                <article
                  className={styles.mobileJobCard}
                  key={`${job.jobPostingId}-${job.careerPathId}`}
                >
                  <div className={styles.mobileJobHeader}>
                    <span className={styles.rank}>{index + 1}</span>
                    <JobIdentity job={job} />
                    <span
                      className={styles.status}
                      data-state={job.recommendation}
                    >
                      {job.recommendation}
                    </span>
                  </div>
                  <div className={styles.mobileJobScores}>
                    <div className={styles.metric}>
                      <strong>{score(job.fitScore)}</strong>
                      <span>Fit</span>
                    </div>
                    <div className={styles.metric}>
                      <strong>{score(job.pursuitPriority)}</strong>
                      <span>Priority</span>
                    </div>
                    <div className={styles.metric}>
                      <strong>{score(job.moveValue)}</strong>
                      <span>Move value</span>
                    </div>
                    <div className={styles.metric}>
                      <strong>{score(job.pursuitReadiness)}</strong>
                      <span>Readiness</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={styles.status}
                      data-state={job.evidenceStrength}
                    >
                      {job.evidenceStrength}
                    </span>{" "}
                    <span
                      className={styles.status}
                      data-state={job.sourceStatus}
                    >
                      {job.sourceStatus}
                    </span>
                  </div>
                  <p>
                    {job.freshnessState.replaceAll("_", " ")} · checked{" "}
                    {formatTime(job.lastVerifiedAt)}
                  </p>
                  <p>{job.nextMove}</p>
                  <a
                    className={styles.secondaryLink}
                    href={`/app?view=jobs&job=${encodeURIComponent(
                      job.jobPostingId,
                    )}`}
                  >
                    Review job <ArrowRight aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <div>
              <h3>Nothing clears your standard right now.</h3>
              <p>
                That is a useful result. We will keep your active paths intact
                and show a job only when it earns your attention.
              </p>
            </div>
          </div>
        )}
        <p className={styles.explanation}>
          <Info size={16} aria-hidden="true" />
          {record.system.rankingExplanation}
        </p>
      </section>

      <section className={styles.module} aria-labelledby="changed-title">
        <div className={styles.moduleHeader}>
          <div>
            <p className="wa-eyebrow">Current evidence</p>
            <h2 id="changed-title">What was verified recently</h2>
          </div>
        </div>
        {verifiedToday.length ? (
          <div className={styles.list}>
            {verifiedToday.slice(0, 5).map((job) => (
              <article
                className={styles.listItem}
                key={`${job.jobPostingId}-${job.careerPathId}`}
              >
                <div>
                  <strong>
                    {job.title} · {job.employer}
                  </strong>
                  <p>
                    {job.sourceStatus}; last checked{" "}
                    {formatTime(job.lastVerifiedAt)}
                  </p>
                </div>
                <span
                  className={styles.status}
                  data-state={job.recommendation}
                >
                  {job.recommendation}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div>
              <ClockCounterClockwise size={24} aria-hidden="true" />
              <h3>No verification event in this view during the last 24 hours.</h3>
              <p>Your last trusted rankings remain unchanged.</p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.module} aria-labelledby="path-pulse-title">
        <div className={styles.moduleHeader}>
          <div>
            <p className="wa-eyebrow">Career path pulse</p>
            <h2 id="path-pulse-title">What each search is finding</h2>
          </div>
        </div>
        <div className={styles.cardGrid}>
          {record.paths
            .filter((path) => path.state === "active")
            .map((path) => (
              <article className={styles.summaryCard} key={path.id}>
                <h3>
                  {path.label}
                  {path.isPrimary ? " · Primary" : ""}
                </h3>
                <div className={styles.metricGrid}>
                  <div className={styles.metric}>
                    <strong>{path.jobsReviewed}</strong>
                    <span>Reviewed</span>
                  </div>
                  <div className={styles.metric}>
                    <strong>{path.jobsClearingStandard}</strong>
                    <span>Clear the bar</span>
                  </div>
                  <div className={styles.metric}>
                    <strong>{path.verifiedLast24Hours}</strong>
                    <span>Verified in 24h</span>
                  </div>
                  <div className={styles.metric}>
                    <strong>{formatTime(path.lastVerifiedAt)}</strong>
                    <span>Last verified</span>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className={styles.module} aria-labelledby="pursuits-title">
        <div className={styles.moduleHeader}>
          <div>
            <p className="wa-eyebrow">Pursuits needing you</p>
            <h2 id="pursuits-title">Focused work, with the next step visible</h2>
          </div>
        </div>
        {activePursuits.length ? (
          <div className={styles.list}>
            {activePursuits.map((job) => (
              <article
                className={styles.listItem}
                key={`${job.jobPostingId}-${job.careerPathId}`}
              >
                <div>
                  <strong>
                    {job.title} · {job.employer}
                  </strong>
                  <p>{job.nextMove}</p>
                </div>
                <a
                  className={styles.secondaryLink}
                  href={`/app?view=pursuit&job=${encodeURIComponent(
                    job.jobPostingId,
                  )}`}
                >
                  Open pursuit
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div>
              <h3>No active pursuits yet.</h3>
              <p>
                Choose Pursue when a job deserves focused effort. That never
                submits an application.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.module} aria-labelledby="documents-title">
        <div className={styles.moduleHeader}>
          <div>
            <p className="wa-eyebrow">Documents to strengthen</p>
            <h2 id="documents-title">Assets that still need work</h2>
          </div>
        </div>
        {documentGaps.length ? (
          <div className={styles.list}>
            {documentGaps.map((job) => (
              <article
                className={styles.listItem}
                key={`${job.jobPostingId}-${job.careerPathId}`}
              >
                <div>
                  <strong>
                    {job.title} · {job.employer}
                  </strong>
                  <p>
                    Resume: {job.documentStatus.resume}. Cover letter:{" "}
                    {job.documentStatus.coverLetter}.
                  </p>
                </div>
                <a
                  className={styles.secondaryLink}
                  href="/app?view=studio&asset=resume"
                >
                  Open Studio
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div>
              <WarningCircle size={24} aria-hidden="true" />
              <h3>No missing pursuit documents in this view.</h3>
              <p>Only real asset state is shown. No outcome data is invented.</p>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
