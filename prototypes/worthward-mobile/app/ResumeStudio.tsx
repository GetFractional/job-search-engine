"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  FloppyDisk,
  DownloadSimple,
  Plus,
  ShieldCheck,
  Trash,
} from "@phosphor-icons/react";
import { DocumentDesignControls } from "./DocumentDesignControls";
import {
  downloadDocument,
  renderResumeDocx,
  renderResumePdf,
} from "./document-export";
import {
  emptyResumeContent,
  type ResumeCareerPathOption,
  type ResumeContent,
  type ResumeExperienceContent,
  type ResumeJobOption,
  type ResumeStudioRecord,
} from "./document-types";
import styles from "./document-studio.module.css";

type ResumeApiResponse = {
  displayName: string;
  resumes: ResumeStudioRecord[];
  careerPaths: ResumeCareerPathOption[];
  jobs: ResumeJobOption[];
  error?: string;
};

type Panel = "content" | "design" | "preview";

function recordType(kind: ResumeStudioRecord["kind"]): string {
  if (kind === "master") return "Master";
  if (kind === "path") return "Career path";
  return "Job";
}

function copyContent(content: ResumeContent): ResumeContent {
  return structuredClone(content);
}

export function ResumeStudio() {
  const [records, setRecords] = useState<ResumeStudioRecord[]>([]);
  const [careerPaths, setCareerPaths] = useState<ResumeCareerPathOption[]>([]);
  const [jobs, setJobs] = useState<ResumeJobOption[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("Master Resume");
  const [kind, setKind] = useState<ResumeStudioRecord["kind"]>("master");
  const [careerPathId, setCareerPathId] = useState("");
  const [jobPostingId, setJobPostingId] = useState("");
  const [content, setContent] = useState<ResumeContent>(emptyResumeContent);
  const [panel, setPanel] = useState<Panel>("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [notice, setNotice] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);

  const selected = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  );
  const hasUnsavedChanges = selected
    ? name !== selected.name ||
      kind !== selected.kind ||
      careerPathId !== (selected.assignment?.careerPathId ?? "") ||
      jobPostingId !== (selected.assignment?.jobPostingId ?? "") ||
      JSON.stringify(content) !== JSON.stringify(selected.content)
    : true;

  const choose = useCallback((record: ResumeStudioRecord) => {
    setSelectedId(record.id);
    setName(record.name);
    setKind(record.kind);
    setCareerPathId(record.assignment?.careerPathId ?? "");
    setJobPostingId(record.assignment?.jobPostingId ?? "");
    setContent(copyContent(record.content));
    setNotice(null);
  }, []);

  const load = useCallback(
    async (preferredId?: string) => {
      setLoading(true);
      try {
        const response = await fetch("/api/resumes", { cache: "no-store" });
        const payload = (await response.json()) as ResumeApiResponse;
        if (!response.ok) {
          throw new Error(payload.error ?? "Resume Studio could not load.");
        }
        setRecords(payload.resumes);
        setCareerPaths(payload.careerPaths);
        setJobs(payload.jobs);
        setDisplayName(payload.displayName);
        const next =
          payload.resumes.find((record) => record.id === preferredId) ??
          payload.resumes[0];
        if (next) choose(next);
      } catch (error) {
        setNotice({
          tone: "error",
          text:
            error instanceof Error
              ? error.message
              : "Resume Studio could not load.",
        });
      } finally {
        setLoading(false);
      }
    },
    [choose],
  );

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function create(action: "starter_from_profile" | "create_blank") {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as {
        resume?: ResumeStudioRecord;
        error?: string;
      };
      if (!response.ok || !payload.resume) {
        throw new Error(payload.error ?? "The resume could not be created.");
      }
      await load(payload.resume.id);
      setNotice({
        tone: "success",
        text:
          action === "starter_from_profile"
            ? "Built only from your confirmed career profile. Review every line before use."
            : "Your empty master resume is ready.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The resume could not be created.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveVersion() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_version",
          sourceResumeId: selected?.id ?? null,
          name,
          kind,
          content,
          assignment:
            kind === "master"
              ? { scope: "default" }
              : kind === "path"
                ? { scope: "path", careerPathId }
                : { scope: "job", jobPostingId },
        }),
      });
      const payload = (await response.json()) as {
        resume?: ResumeStudioRecord;
        error?: string;
      };
      if (!response.ok || !payload.resume) {
        throw new Error(payload.error ?? "The resume could not be saved.");
      }
      await load(payload.resume.id);
      setNotice({
        tone: "success",
        text: `Version ${payload.resume.version} saved. Earlier versions remain available.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The resume could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function exportVersion(format: "pdf" | "docx") {
    if (!selected || hasUnsavedChanges) {
      setNotice({
        tone: "error",
        text: "Save a new version before downloading so the file stays tied to the exact content you reviewed.",
      });
      return;
    }
    setExporting(format);
    setNotice(null);
    try {
      const rendered =
        format === "pdf"
          ? await renderResumePdf(content, displayName, name)
          : await renderResumeDocx(content, displayName, name);
      if (selected.kind === "job") {
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "record_render",
            resumeId: selected.id,
            format: rendered.format,
            filename: rendered.filename,
            fileSha256: rendered.fileSha256,
            pageCount: rendered.pageCount,
            rendererVersion: rendered.rendererVersion,
          }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(
            payload.error ?? "The rendered file receipt could not be saved.",
          );
        }
      }
      downloadDocument(rendered);
      setNotice({
        tone: "success",
        text:
          selected.kind === "job"
            ? `${format.toUpperCase()} downloaded and recorded as a draft application asset. It still needs file QA before approval.`
            : `${format.toUpperCase()} downloaded from the exact saved version.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The file could not be rendered.",
      });
    } finally {
      setExporting(null);
    }
  }

  function startNew() {
    setSelectedId(null);
    setName("Master Resume");
    setKind("master");
    setCareerPathId("");
    setJobPostingId("");
    setContent(emptyResumeContent());
    setPanel("content");
    setNotice(null);
  }

  function updateExperience(
    index: number,
    patch: Partial<ResumeExperienceContent>,
  ) {
    setContent((current) => ({
      ...current,
      experiences: current.experiences.map((experience, itemIndex) =>
        itemIndex === index ? { ...experience, ...patch } : experience,
      ),
      provenance: { ...current.provenance, source: "user_authored" },
    }));
  }

  function addExperience() {
    setContent((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        {
          id: crypto.randomUUID(),
          employer: "",
          title: "",
          startDate: "",
          endDate: "",
          location: "",
          summary: "",
          bullets: [""],
        },
      ],
    }));
  }

  const hasNewContent =
    content.summary.trim() ||
    content.targetTitle.trim() ||
    content.experiences.length ||
    content.skillGroups.length;
  const showEmpty = !loading && records.length === 0 && !hasNewContent;

  return (
    <section className={styles.studio} aria-labelledby="resume-studio-title">
      <header className={styles.heading}>
        <div className={styles.headingCopy}>
          <p className="wa-eyebrow">Resume Studio</p>
          <h1 id="resume-studio-title">
            One career record. The right resume for each move.
          </h1>
          <p>
            Start with one accurate master, then save career-path and job
            versions without losing the source truth.
          </p>
          <span className={styles.trustLine}>
            <ShieldCheck aria-hidden="true" /> Nothing is submitted from this
            studio.
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => void exportVersion("pdf")}
            disabled={saving || Boolean(exporting) || !selected}
          >
            <DownloadSimple aria-hidden="true" />{" "}
            {exporting === "pdf" ? "Rendering…" : "Download PDF"}
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => void exportVersion("docx")}
            disabled={saving || Boolean(exporting) || !selected}
          >
            <DownloadSimple aria-hidden="true" />{" "}
            {exporting === "docx" ? "Rendering…" : "Download DOCX"}
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={startNew}
          >
            <Plus aria-hidden="true" /> New resume
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => void saveVersion()}
            disabled={saving}
          >
            <FloppyDisk aria-hidden="true" />{" "}
            {saving ? "Saving…" : "Save new version"}
          </button>
        </div>
      </header>

      {notice ? (
        <div
          className={styles.notice}
          data-tone={notice.tone}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.text}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <p>Loading your resume library…</p>
          </div>
        </div>
      ) : showEmpty ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <FileText size={34} aria-hidden="true" />
            <h2>Start with one accurate master resume.</h2>
            <p>
              Build a starter from confirmed profile facts, or begin with a
              clean document. No invented experience is added.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => void create("starter_from_profile")}
                disabled={saving}
              >
                Build from my profile
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => void create("create_blank")}
                disabled={saving}
              >
                Start blank
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.workspace}>
          <aside className={styles.library} aria-label="Resume library">
            <div className={styles.libraryHeader}>
              <h2>Library</h2>
              <button
                className={styles.textButton}
                type="button"
                onClick={startNew}
              >
                <Plus aria-hidden="true" /> New
              </button>
            </div>
            <div className={styles.recordList}>
              {records.map((record) => (
                <button
                  className={styles.recordButton}
                  data-active={record.id === selectedId}
                  key={record.id}
                  onClick={() => choose(record)}
                  type="button"
                >
                  <span>
                    {recordType(record.kind)} · v{record.version}
                  </span>
                  <strong>{record.name}</strong>
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.studio}>
            <nav className={styles.mobileTabs} aria-label="Resume editor views">
              {(["content", "design", "preview"] as const).map((item) => (
                <button
                  data-active={panel === item}
                  key={item}
                  onClick={() => setPanel(item)}
                  type="button"
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </nav>

            <div className={styles.contentArea}>
              <div
                className={`${styles.editor} ${
                  panel === "preview" ? styles.mobileHidden : ""
                }`}
              >
                <div
                  className={
                    panel === "design" ? styles.mobileHidden : undefined
                  }
                >
                  <fieldset className={styles.section}>
                    <legend>Document</legend>
                    <div className={styles.fieldGrid}>
                      <div className={styles.fieldWide}>
                        <label htmlFor="resume-name">Resume name</label>
                        <input
                          id="resume-name"
                          value={name}
                          disabled={Boolean(selected)}
                          onChange={(event) => setName(event.target.value)}
                        />
                        {selected ? (
                          <small>
                            Name and use stay fixed across versions. Choose New
                            resume to create a different assignment.
                          </small>
                        ) : null}
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="resume-scope">Use</label>
                        <select
                          id="resume-scope"
                          value={kind}
                          disabled={Boolean(selected)}
                          onChange={(event) => {
                            const nextKind = event.target
                              .value as ResumeStudioRecord["kind"];
                            setKind(nextKind);
                            if (nextKind === "path" && !careerPathId) {
                              setCareerPathId(careerPaths[0]?.id ?? "");
                            }
                            if (nextKind === "job" && !jobPostingId) {
                              setJobPostingId(jobs[0]?.id ?? "");
                            }
                          }}
                        >
                          <option value="master">Master</option>
                          <option value="path">Career path</option>
                          <option value="job">Specific job</option>
                        </select>
                      </div>
                      {kind === "path" ? (
                        <div className={styles.field}>
                          <label htmlFor="resume-path">Career path</label>
                          <select
                            id="resume-path"
                            value={careerPathId}
                            disabled={Boolean(selected)}
                            onChange={(event) =>
                              setCareerPathId(event.target.value)
                            }
                          >
                            <option value="">Choose a path</option>
                            {careerPaths.map((path) => (
                              <option key={path.id} value={path.id}>
                                {path.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                      {kind === "job" ? (
                        <div className={styles.field}>
                          <label htmlFor="resume-job">Pursuit</label>
                          <select
                            id="resume-job"
                            value={jobPostingId}
                            disabled={Boolean(selected)}
                            onChange={(event) =>
                              setJobPostingId(event.target.value)
                            }
                          >
                            <option value="">Choose a pursuit</option>
                            {jobs.map((job) => (
                              <option key={job.id} value={job.id}>
                                {job.title} · {job.employer}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                      <div className={styles.field}>
                        <label htmlFor="resume-title">Target title</label>
                        <input
                          id="resume-title"
                          value={content.targetTitle}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              targetTitle: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div className={styles.fieldWide}>
                        <label htmlFor="resume-summary">
                          Professional summary
                        </label>
                        <textarea
                          id="resume-summary"
                          value={content.summary}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              summary: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div className={styles.fieldWide}>
                        <label htmlFor="resume-location">Location</label>
                        <input
                          id="resume-location"
                          value={content.location}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              location: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>

                  <section
                    className={styles.section}
                    aria-labelledby="resume-experience-title"
                  >
                    <div className={styles.repeatHeader}>
                      <strong id="resume-experience-title">Experience</strong>
                      <button
                        className={styles.textButton}
                        type="button"
                        onClick={addExperience}
                      >
                        <Plus aria-hidden="true" /> Add role
                      </button>
                    </div>
                    {content.experiences.map((experience, index) => (
                      <div className={styles.repeatCard} key={experience.id}>
                        <div className={styles.repeatHeader}>
                          <strong>
                            {experience.title ||
                              experience.employer ||
                              `Role ${index + 1}`}
                          </strong>
                          <button
                            aria-label={`Remove role ${index + 1}`}
                            className={styles.removeButton}
                            type="button"
                            onClick={() =>
                              setContent((current) => ({
                                ...current,
                                experiences: current.experiences.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              }))
                            }
                          >
                            <Trash aria-hidden="true" /> Remove
                          </button>
                        </div>
                        <div className={styles.fieldGrid}>
                          <label className={styles.field}>
                            <span>Title</span>
                            <input
                              value={experience.title}
                              onChange={(event) =>
                                updateExperience(index, {
                                  title: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className={styles.field}>
                            <span>Employer</span>
                            <input
                              value={experience.employer}
                              onChange={(event) =>
                                updateExperience(index, {
                                  employer: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className={styles.field}>
                            <span>Start</span>
                            <input
                              value={experience.startDate}
                              onChange={(event) =>
                                updateExperience(index, {
                                  startDate: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className={styles.field}>
                            <span>End</span>
                            <input
                              value={experience.endDate}
                              onChange={(event) =>
                                updateExperience(index, {
                                  endDate: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className={styles.fieldWide}>
                            <span>Location</span>
                            <input
                              value={experience.location}
                              onChange={(event) =>
                                updateExperience(index, {
                                  location: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className={styles.fieldWide}>
                            <span>Role summary</span>
                            <textarea
                              value={experience.summary}
                              onChange={(event) =>
                                updateExperience(index, {
                                  summary: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className={styles.fieldWide}>
                            <span>Achievement bullets, one per line</span>
                            <textarea
                              value={experience.bullets.join("\n")}
                              onChange={(event) =>
                                updateExperience(index, {
                                  bullets: event.target.value.split("\n"),
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </section>

                  <section
                    className={styles.section}
                    aria-labelledby="resume-skills-title"
                  >
                    <div className={styles.repeatHeader}>
                      <strong id="resume-skills-title">Skills</strong>
                      <button
                        className={styles.textButton}
                        type="button"
                        onClick={() =>
                          setContent({
                            ...content,
                            skillGroups: [
                              ...content.skillGroups,
                              {
                                id: crypto.randomUUID(),
                                label: "",
                                skills: [],
                              },
                            ],
                          })
                        }
                      >
                        <Plus aria-hidden="true" /> Add group
                      </button>
                    </div>
                    {content.skillGroups.map((group, index) => (
                      <div className={styles.repeatCard} key={group.id}>
                        <label className={styles.field}>
                          <span>Group name</span>
                          <input
                            value={group.label}
                            onChange={(event) =>
                              setContent({
                                ...content,
                                skillGroups: content.skillGroups.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, label: event.target.value }
                                      : item,
                                ),
                              })
                            }
                          />
                        </label>
                        <label className={styles.fieldWide}>
                          <span>Skills, separated by commas</span>
                          <input
                            value={group.skills.join(", ")}
                            onChange={(event) =>
                              setContent({
                                ...content,
                                skillGroups: content.skillGroups.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          skills: event.target.value
                                            .split(",")
                                            .map((skill) => skill.trim())
                                            .filter(Boolean),
                                        }
                                      : item,
                                ),
                              })
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </section>
                </div>

                <div
                  className={
                    panel === "content" ? styles.mobileHidden : undefined
                  }
                >
                  <DocumentDesignControls
                    value={content.design}
                    onChange={(design) => setContent({ ...content, design })}
                  />
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => void saveVersion()}
                    disabled={saving}
                  >
                    <FloppyDisk aria-hidden="true" /> Save new version
                  </button>
                </div>
              </div>

              <aside
                className={`${styles.preview} ${
                  panel === "preview" ? "" : styles.mobileHidden
                }`}
                aria-label="Resume preview"
              >
                <div
                  className={styles.paper}
                  data-template={content.design.templateKey}
                  data-accent={content.design.accent}
                  data-density={content.design.density}
                  data-font-scale={content.design.fontScale}
                >
                  <h2>{displayName || "Your name"}</h2>
                  <div className={styles.paperMeta}>
                    {[content.targetTitle, content.location]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  {content.summary ? <p>{content.summary}</p> : null}
                  {content.experiences.length ? <h3>Experience</h3> : null}
                  {content.experiences.map((experience) => (
                    <section className={styles.paperRole} key={experience.id}>
                      <strong>
                        {[experience.title, experience.employer]
                          .filter(Boolean)
                          .join(" · ")}
                      </strong>
                      <span>
                        {[experience.startDate, experience.endDate]
                          .filter(Boolean)
                          .join(" – ")}
                      </span>
                      {experience.location ? (
                        <span>{experience.location}</span>
                      ) : null}
                      {experience.summary ? <p>{experience.summary}</p> : null}
                      {experience.bullets.some(Boolean) ? (
                        <ul>
                          {experience.bullets
                            .filter(Boolean)
                            .map((bullet, index) => (
                              <li key={`${experience.id}-${index}`}>
                                {bullet}
                              </li>
                            ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                  {content.skillGroups.some((group) => group.skills.length) ? (
                    <h3>Skills</h3>
                  ) : null}
                  {content.skillGroups.map((group) =>
                    group.skills.length ? (
                      <p key={group.id}>
                        <strong>{group.label ? `${group.label}: ` : ""}</strong>
                        {group.skills.join(", ")}
                      </p>
                    ) : null,
                  )}
                  {!hasNewContent ? (
                    <p>Your edited content will appear here.</p>
                  ) : null}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
