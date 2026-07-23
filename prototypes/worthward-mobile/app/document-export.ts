"use client";

import type {
  CoverLetterContent,
  ResumeContent,
} from "./document-types";

export type DocumentExport = {
  blob: Blob;
  filename: string;
  format: "pdf" | "docx";
  fileSha256: string;
  pageCount: number | null;
  rendererVersion: string;
};

function safeFilename(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

async function blobSha256(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function accentColor(accent: ResumeContent["design"]["accent"]): [
  number,
  number,
  number,
] {
  if (accent === "navy") return [36, 79, 115];
  if (accent === "charcoal") return [51, 61, 56];
  return [31, 90, 67];
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function downloadDocument(result: DocumentExport): void {
  download(result.blob, result.filename);
}

export async function renderResumePdf(
  content: ResumeContent,
  displayName: string,
  documentName: string,
): Promise<DocumentExport> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    unit: "pt",
    format: "letter",
    compress: true,
    putOnlyUsedFonts: true,
  });
  pdf.setProperties({
    title: documentName,
    author: displayName,
    subject: "Resume",
    creator: "Way Ahead renderer pdf-v1",
  });
  pdf.setCreationDate(new Date("2000-01-01T00:00:00.000Z"));

  const margin = content.design.density === "compact" ? 40 : 46;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const width = pageWidth - margin * 2;
  const scale = content.design.fontScale / 100;
  const bodySize = 9.3 * scale;
  const lineHeight = bodySize * (content.design.density === "compact" ? 1.32 : 1.48);
  const accent = accentColor(content.design.accent);
  let y = margin;

  const ensureSpace = (height: number) => {
    if (y + height <= pageHeight - margin) return;
    pdf.addPage();
    y = margin;
  };
  const write = (
    value: string,
    options: {
      size?: number;
      bold?: boolean;
      color?: [number, number, number];
      gapAfter?: number;
    } = {},
  ) => {
    if (!value.trim()) return;
    const size = (options.size ?? bodySize) * scale;
    pdf.setFont(
      content.design.templateKey === "classic" ? "times" : "helvetica",
      options.bold ? "bold" : "normal",
    );
    pdf.setFontSize(size);
    const color = options.color ?? [24, 32, 28];
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(value, width) as string[];
    const height = lines.length * lineHeight;
    ensureSpace(height);
    pdf.text(lines, margin, y);
    y += height + (options.gapAfter ?? 5);
  };
  const section = (label: string) => {
    ensureSpace(30);
    y += 8;
    write(label.toUpperCase(), {
      size: 8.2,
      bold: true,
      color: accent,
      gapAfter: 5,
    });
    pdf.setDrawColor(accent[0], accent[1], accent[2]);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y - 2, pageWidth - margin, y - 2);
    y += 4;
  };

  write(displayName || "Your name", {
    size: content.design.templateKey === "modern" ? 19 : 21,
    bold: true,
    color: accent,
    gapAfter: 3,
  });
  write(
    [content.targetTitle, content.location].filter(Boolean).join(" · "),
    { size: 9, gapAfter: 8 },
  );
  if (content.summary) {
    section("Professional Summary");
    write(content.summary, { gapAfter: 4 });
  }
  if (content.experiences.length) section("Experience");
  for (const role of content.experiences) {
    ensureSpace(56);
    write(
      [role.title, role.employer].filter(Boolean).join(" · "),
      { bold: true, gapAfter: 1 },
    );
    write(
      [
        [role.startDate, role.endDate].filter(Boolean).join(" – "),
        role.location,
      ]
        .filter(Boolean)
        .join(" · "),
      { size: 8.3, color: [88, 100, 94], gapAfter: 3 },
    );
    write(role.summary, { gapAfter: 2 });
    for (const bullet of role.bullets) {
      write(`• ${bullet}`, { gapAfter: 1 });
    }
    y += 4;
  }
  if (content.skillGroups.length) {
    section("Skills");
    for (const group of content.skillGroups) {
      write(
        `${group.label ? `${group.label}: ` : ""}${group.skills.join(", ")}`,
        { gapAfter: 2 },
      );
    }
  }

  const blob = pdf.output("blob");
  const filename = `${safeFilename(documentName || "Resume")}.pdf`;
  return {
    blob,
    filename,
    format: "pdf",
    fileSha256: await blobSha256(blob),
    pageCount: pdf.getNumberOfPages(),
    rendererVersion: "way-ahead-pdf-v1",
  };
}

export async function renderCoverLetterPdf(
  content: CoverLetterContent,
  displayName: string,
): Promise<DocumentExport> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    unit: "pt",
    format: "letter",
    compress: true,
    putOnlyUsedFonts: true,
  });
  const title = `${content.employer} - ${content.roleTitle} - Cover Letter`;
  pdf.setProperties({
    title,
    author: displayName,
    subject: "Cover letter",
    creator: "Way Ahead renderer pdf-v1",
  });
  pdf.setCreationDate(new Date("2000-01-01T00:00:00.000Z"));
  const margin = 56;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const height = pdf.internal.pageSize.getHeight();
  const accent = accentColor(content.design.accent);
  const size = 10.5 * (content.design.fontScale / 100);
  const lineHeight = size * (content.design.density === "compact" ? 1.38 : 1.58);
  let y = margin;
  const write = (value: string, gap = 13, bold = false) => {
    if (!value.trim()) return;
    pdf.setFont(
      content.design.templateKey === "classic" ? "times" : "helvetica",
      bold ? "bold" : "normal",
    );
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(value, width) as string[];
    if (y + lines.length * lineHeight > height - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(lines, margin, y);
    y += lines.length * lineHeight + gap;
  };
  pdf.setTextColor(accent[0], accent[1], accent[2]);
  write(displayName || "Your name", 4, true);
  pdf.setTextColor(88, 100, 94);
  write([content.roleTitle, content.employer].filter(Boolean).join(" · "), 24);
  pdf.setTextColor(24, 32, 28);
  write(content.salutation);
  content.paragraphs.forEach((paragraph) => write(paragraph));
  write(content.closing, 5);
  write(`${content.signoff}\n${displayName}`, 0);
  const blob = pdf.output("blob");
  return {
    blob,
    filename: `${safeFilename(title)}.pdf`,
    format: "pdf",
    fileSha256: await blobSha256(blob),
    pageCount: pdf.getNumberOfPages(),
    rendererVersion: "way-ahead-pdf-v1",
  };
}

export async function renderResumeDocx(
  content: ResumeContent,
  displayName: string,
  documentName: string,
): Promise<DocumentExport> {
  const {
    AlignmentType,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    TextRun,
  } = await import("docx");
  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      alignment:
        content.design.templateKey === "classic"
          ? AlignmentType.CENTER
          : AlignmentType.LEFT,
      children: [
        new TextRun({
          text: displayName || "Your name",
          bold: true,
          size: 34,
        }),
      ],
    }),
    new Paragraph({
      alignment:
        content.design.templateKey === "classic"
          ? AlignmentType.CENTER
          : AlignmentType.LEFT,
      text: [content.targetTitle, content.location].filter(Boolean).join(" · "),
      spacing: { after: 220 },
    }),
  ];
  const heading = (text: string) =>
    children.push(
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
      }),
    );
  if (content.summary) {
    heading("Professional Summary");
    children.push(new Paragraph({ text: content.summary }));
  }
  if (content.experiences.length) heading("Experience");
  for (const role of content.experiences) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: [role.title, role.employer].filter(Boolean).join(" · "),
            bold: true,
          }),
        ],
        spacing: { before: 140 },
      }),
      new Paragraph({
        text: [
          [role.startDate, role.endDate].filter(Boolean).join(" – "),
          role.location,
        ]
          .filter(Boolean)
          .join(" · "),
      }),
    );
    if (role.summary) children.push(new Paragraph({ text: role.summary }));
    role.bullets.forEach((bullet) =>
      children.push(
        new Paragraph({
          text: bullet,
          bullet: { level: 0 },
        }),
      ),
    );
  }
  if (content.skillGroups.length) heading("Skills");
  content.skillGroups.forEach((group) =>
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: group.label ? `${group.label}: ` : "",
            bold: Boolean(group.label),
          }),
          new TextRun(group.skills.join(", ")),
        ],
      }),
    ),
  );
  const doc = new Document({
    creator: "Way Ahead",
    title: documentName,
    description: "Resume",
    sections: [{ children }],
  });
  const blob = await Packer.toBlob(doc);
  return {
    blob,
    filename: `${safeFilename(documentName || "Resume")}.docx`,
    format: "docx",
    fileSha256: await blobSha256(blob),
    pageCount: null,
    rendererVersion: "way-ahead-docx-v1",
  };
}

export async function renderCoverLetterDocx(
  content: CoverLetterContent,
  displayName: string,
): Promise<DocumentExport> {
  const {
    AlignmentType,
    Document,
    Packer,
    Paragraph,
    TextRun,
  } = await import("docx");
  const title = `${content.employer} - ${content.roleTitle} - Cover Letter`;
  const alignment =
    content.design.templateKey === "classic"
      ? AlignmentType.CENTER
      : AlignmentType.LEFT;
  const children = [
    new Paragraph({
      alignment,
      children: [
        new TextRun({
          text: displayName || "Your name",
          bold: true,
          size: 34,
        }),
      ],
    }),
    new Paragraph({
      alignment,
      text: [content.roleTitle, content.employer].filter(Boolean).join(" · "),
      spacing: { after: 360 },
    }),
    new Paragraph({
      text: content.salutation,
      spacing: { after: 220 },
    }),
    ...content.paragraphs
      .filter((paragraph) => paragraph.trim())
      .map(
        (paragraph) =>
          new Paragraph({
            text: paragraph,
            spacing: { after: 220 },
          }),
      ),
    new Paragraph({
      text: content.closing,
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: `${content.signoff}\n${displayName}`,
    }),
  ];
  const doc = new Document({
    creator: "Way Ahead",
    title,
    description: "Cover letter",
    sections: [{ children }],
  });
  const blob = await Packer.toBlob(doc);
  return {
    blob,
    filename: `${safeFilename(title)}.docx`,
    format: "docx",
    fileSha256: await blobSha256(blob),
    pageCount: null,
    rendererVersion: "way-ahead-docx-v1",
  };
}
