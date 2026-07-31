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
  renderCoverLetterDocx,
  renderCoverLetterPdf,
} from "./document-export";
import {
  emptyCoverLetterContent,
  type CoverLetterContent,
  type CoverLetterStudioRecord,
  type DocumentPursuitOption,
} from "./document-types";
import styles from "./document-studio.module.css";

type CoverLetterApiResponse = {
  displayName: string;
  letters: CoverLetterStudioRecord[];
  pursuits: DocumentPursuitOption[];
  error?: string;
};

type Panel = "content" | "design" | "preview";

export function CoverLetterStudio({
  initialLetterId = null,
  onDocumentSelected,
}: {
  initialLetterId?: string | null;
  onDocumentSelected?: (letterId: string) => void;
}) {
  const [letters, setLetters] = useState<CoverLetterStudioRecord[]>([]);
  const [pursuits, setPursuits] = useState<DocumentPursuitOption[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pursuitId, setPursuitId] = useState("");
  const [content, setContent] = useState<CoverLetterContent>(
    emptyCoverLetterContent,
  );
  const [panel, setPanel] = useState<Panel>("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [notice, setNotice] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);

  const selected = useMemo(
    () => letters.find((letter) => letter.id === selectedId) ?? null,
    [letters, selectedId],
  );
  const hasUnsavedChanges = selected
    ? pursuitId !== selected.pursuitId ||
      JSON.stringify(content) !== JSON.stringify(selected.content)
    : JSON.stringify(content) !== JSON.stringify(emptyCoverLetterContent());

  const choose = useCallback((letter: CoverLetterStudioRecord) => {
    setSelectedId(letter.id);
    setPursuitId(letter.pursuitId);
    setContent(structuredClone(letter.content));
    setNotice(null);
  }, []);

  const load = useCallback(
    async (preferredId?: string) => {
      setLoading(true);
      try {
        const response = await fetch("/api/cover-letters", {
          cache: "no-store",
        });
        const payload = (await response.json()) as CoverLetterApiResponse;
        if (!response.ok) {
          throw new Error(
            payload.error ?? "Cover Letter Studio could not load.",
          );
        }
        setLetters(payload.letters);
        setPursuits(payload.pursuits);
        setDisplayName(payload.displayName);
        const requestedId = preferredId ?? initialLetterId;
        const requested = requestedId
          ? payload.letters.find((letter) => letter.id === requestedId)
          : null;
        if (requestedId && !requested) {
          setSelectedId(null);
          setNotice({
            tone: "error",
            text: "This cover letter is not available in your private workspace. No different letter was substituted.",
          });
          return;
        }
        const next = requested ?? payload.letters[0];
        if (next) choose(next);
        if (!next && payload.pursuits[0]) {
          setPursuitId(payload.pursuits[0].id);
        }
      } catch (error) {
        setNotice({
          tone: "error",
          text:
            error instanceof Error
              ? error.message
              : "Cover Letter Studio could not load.",
        });
      } finally {
        setLoading(false);
      }
    },
    [choose, initialLetterId],
  );

  useEffect(() => {
    const task = window.setTimeout(
      () => void load(initialLetterId ?? undefined),
      0,
    );
    return () => window.clearTimeout(task);
  }, [initialLetterId, load]);

  useEffect(() => {
    if (selectedId) onDocumentSelected?.(selectedId);
  }, [onDocumentSelected, selectedId]);

  useEffect(() => {
    document.documentElement.dataset.wayAheadUnsavedDocument =
      hasUnsavedChanges ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.wayAheadUnsavedDocument;
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  const confirmDiscard = () =>
    !hasUnsavedChanges ||
    window.confirm("Discard the unsaved cover-letter changes on this screen?");

  const requestChoose = (letter: CoverLetterStudioRecord) => {
    if (letter.id === selectedId || !confirmDiscard()) return;
    choose(letter);
  };

  async function createStarter() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "starter_for_pursuit",
          pursuitId,
        }),
      });
      const payload = (await response.json()) as {
        letter?: CoverLetterStudioRecord;
        error?: string;
      };
      if (!response.ok || !payload.letter) {
        throw new Error(
          payload.error ?? "The cover letter could not be created.",
        );
      }
      await load(payload.letter.id);
      setNotice({
        tone: "success",
        text: "Built from your confirmed profile plus the selected employer and role. Review and tailor it to the current posting before use.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The cover letter could not be created.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveVersion() {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_version",
          sourceLetterId: selected?.id ?? null,
          pursuitId,
          content,
        }),
      });
      const payload = (await response.json()) as {
        letter?: CoverLetterStudioRecord;
        error?: string;
      };
      if (!response.ok || !payload.letter) {
        throw new Error(
          payload.error ?? "The cover letter could not be saved.",
        );
      }
      await load(payload.letter.id);
      setNotice({
        tone: "success",
        text: `Version ${payload.letter.version} saved. Earlier versions remain available.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The cover letter could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function exportVersion(format: "pdf" | "docx") {
    if (!selected || hasUnsavedChanges) {
      setNotice({
        tone: "error",
        text: "Save a new version before downloading so the file stays tied to the exact letter you reviewed.",
      });
      return;
    }
    setExporting(format);
    setNotice(null);
    try {
      const rendered =
        format === "pdf"
          ? await renderCoverLetterPdf(content, displayName)
          : await renderCoverLetterDocx(content, displayName);
      const response = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_render",
          pursuitId,
          letterId: selected.id,
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
      downloadDocument(rendered);
      setNotice({
        tone: "success",
        text: `${format.toUpperCase()} downloaded and recorded as a draft application asset. It still needs file QA before approval.`,
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
    if (!confirmDiscard()) return;
    const firstPursuit = pursuits[0];
    setSelectedId(null);
    setPursuitId(firstPursuit?.id ?? "");
    setContent(emptyCoverLetterContent());
    setPanel("content");
    setNotice(null);
  }

  const hasContent = content.paragraphs.some((paragraph) => paragraph.trim());
  const showEmpty = !loading && !selected && !hasContent;

  return (
    <section
      className={styles.studio}
      aria-labelledby="cover-letter-studio-title"
    >
      <header className={styles.heading}>
        <div className={styles.headingCopy}>
          <p className="wa-eyebrow">Cover Letter Studio</p>
          <h1 id="cover-letter-studio-title">
            Make the case for this job without stretching the truth.
          </h1>
          <p>
            Start with your confirmed career record plus the selected employer
            and title, then tailor every word to the current posting and
            preserve version history.
          </p>
          <span className={styles.trustLine}>
            <ShieldCheck aria-hidden="true" /> Nothing is uploaded or submitted
            from this studio.
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
            <Plus aria-hidden="true" /> New letter
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => void saveVersion()}
            disabled={saving || !pursuitId}
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
            <p>Loading your cover letters…</p>
          </div>
        </div>
      ) : showEmpty ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <FileText size={34} aria-hidden="true" />
            <h2>Choose a pursuit to build a job-specific cover letter.</h2>
            <p>
              The first outline uses only your approved experience and the
              selected employer and role. Tailoring to the posting still needs
              review.
            </p>
            {pursuits.length ? (
              <>
                <label className={styles.fieldWide}>
                  <span>Pursuit</span>
                  <select
                    value={pursuitId}
                    onChange={(event) => setPursuitId(event.target.value)}
                  >
                    {pursuits.map((pursuit) => (
                      <option key={pursuit.id} value={pursuit.id}>
                        {pursuit.roleTitle} · {pursuit.employer}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => void createStarter()}
                  disabled={saving || !pursuitId}
                >
                  Build evidence-grounded outline
                </button>
              </>
            ) : (
              <p>
                No active pursuit is ready yet. Choose Pursue on a verified job
                first.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.workspace}>
          <aside className={styles.library} aria-label="Cover letter library">
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
              {letters.map((letter) => (
                <button
                  className={styles.recordButton}
                  data-active={letter.id === selectedId}
                  key={letter.id}
                  onClick={() => requestChoose(letter)}
                  type="button"
                >
                  <span>Cover letter · v{letter.version}</span>
                  <strong>
                    {letter.content.roleTitle} · {letter.content.employer}
                  </strong>
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.studio}>
            <nav
              className={styles.mobileTabs}
              aria-label="Cover letter editor views"
            >
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
                    <legend>Job</legend>
                    <div className={styles.fieldGrid}>
                      <div className={styles.fieldWide}>
                        <label htmlFor="letter-pursuit">Pursuit</label>
                        <select
                          id="letter-pursuit"
                          value={pursuitId}
                          onChange={(event) => setPursuitId(event.target.value)}
                        >
                          <option value="">Choose a pursuit</option>
                          {pursuits.map((pursuit) => (
                            <option key={pursuit.id} value={pursuit.id}>
                              {pursuit.roleTitle} · {pursuit.employer}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="letter-role">Role title</label>
                        <input
                          id="letter-role"
                          value={content.roleTitle}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              roleTitle: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="letter-employer">Employer</label>
                        <input
                          id="letter-employer"
                          value={content.employer}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              employer: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className={styles.section}>
                    <legend>Letter</legend>
                    <div className={styles.fieldWide}>
                      <label htmlFor="letter-salutation">Salutation</label>
                      <input
                        id="letter-salutation"
                        value={content.salutation}
                        onChange={(event) =>
                          setContent({
                            ...content,
                            salutation: event.target.value,
                          })
                        }
                      />
                    </div>
                    {content.paragraphs.map((paragraph, index) => (
                      <div className={styles.repeatCard} key={index}>
                        <div className={styles.repeatHeader}>
                          <strong>Paragraph {index + 1}</strong>
                          <button
                            className={styles.removeButton}
                            type="button"
                            onClick={() =>
                              setContent({
                                ...content,
                                paragraphs: content.paragraphs.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              })
                            }
                          >
                            <Trash aria-hidden="true" /> Remove
                          </button>
                        </div>
                        <textarea
                          aria-label={`Paragraph ${index + 1}`}
                          value={paragraph}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              provenance: {
                                ...content.provenance,
                                source: "user_authored",
                              },
                              paragraphs: content.paragraphs.map(
                                (item, itemIndex) =>
                                  itemIndex === index
                                    ? event.target.value
                                    : item,
                              ),
                            })
                          }
                        />
                      </div>
                    ))}
                    <button
                      className={styles.textButton}
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          paragraphs: [...content.paragraphs, ""],
                        })
                      }
                    >
                      <Plus aria-hidden="true" /> Add paragraph
                    </button>
                    <div className={styles.fieldGrid}>
                      <div className={styles.fieldWide}>
                        <label htmlFor="letter-closing">Closing</label>
                        <input
                          id="letter-closing"
                          value={content.closing}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              closing: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div className={styles.fieldWide}>
                        <label htmlFor="letter-signoff">Signoff</label>
                        <input
                          id="letter-signoff"
                          value={content.signoff}
                          onChange={(event) =>
                            setContent({
                              ...content,
                              signoff: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
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
                    disabled={saving || !pursuitId}
                  >
                    <FloppyDisk aria-hidden="true" /> Save new version
                  </button>
                </div>
              </div>

              <aside
                className={`${styles.preview} ${
                  panel === "preview" ? "" : styles.mobileHidden
                }`}
                aria-label="Cover letter preview"
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
                    {[content.roleTitle, content.employer]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <p>{content.salutation}</p>
                  {content.paragraphs.map((paragraph, index) =>
                    paragraph ? <p key={index}>{paragraph}</p> : null,
                  )}
                  <p>{content.closing}</p>
                  <p>
                    {content.signoff}
                    <br />
                    {displayName}
                  </p>
                  {!hasContent ? (
                    <p>Your edited letter will appear here.</p>
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
