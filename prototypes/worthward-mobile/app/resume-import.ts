"use client";

export const MAX_RESUME_FILE_BYTES = 5 * 1024 * 1024;
const MAX_EXTRACTED_CHARACTERS = 120_000;
const MAX_PDF_PAGES = 12;
const MIN_USEFUL_CHARACTERS = 80;

export type ParsedResumeFile = {
  originalName: string;
  contentType: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "text/plain";
  byteSize: number;
  clientFileChecksumSha256: string;
  extractedText: string;
  pageCount: number | null;
  parser: "pdfjs-browser-v1" | "mammoth-browser-v1" | "text-browser-v1";
  warnings: string[];
};

function extension(name: string): string {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function startsWith(bytes: Uint8Array, expected: number[]): boolean {
  return expected.every((value, index) => bytes[index] === value);
}

function normalizeExtractedText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, MAX_EXTRACTED_CHARACTERS);
}

async function checksum(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function assertUsefulText(text: string, kind: string): void {
  if (text.replace(/\s/g, "").length < MIN_USEFUL_CHARACTERS) {
    throw new Error(
      `${kind} did not contain enough selectable text. If it is a scanned image, paste the text or enter your experience manually.`,
    );
  }
}

async function parsePdf(buffer: ArrayBuffer): Promise<{
  text: string;
  pageCount: number;
  warnings: string[];
}> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
  });
  const document = await loadingTask.promise;
  if (document.numPages > MAX_PDF_PAGES) {
    await loadingTask.destroy();
    throw new Error(`PDF resumes can contain at most ${MAX_PDF_PAGES} pages.`);
  }
  const pages: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .flatMap((item) =>
          "str" in item && typeof item.str === "string" ? [item.str] : [],
        )
        .join(" ");
      pages.push(text);
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }
  const text = normalizeExtractedText(pages.join("\n\n"));
  assertUsefulText(text, "This PDF");
  return { text, pageCount: pages.length, warnings: [] };
}

async function parseDocx(buffer: ArrayBuffer): Promise<{
  text: string;
  warnings: string[];
}> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = normalizeExtractedText(result.value);
  assertUsefulText(text, "This DOCX");
  return {
    text,
    warnings: result.messages
      .map((message) => message.message)
      .filter(Boolean)
      .slice(0, 5),
  };
}

export async function parseResumeFile(file: File): Promise<ParsedResumeFile> {
  if (file.size < 1) throw new Error("Choose a non-empty resume file.");
  if (file.size > MAX_RESUME_FILE_BYTES) {
    throw new Error("Resume files must be 5 MB or smaller.");
  }
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 8));
  const suffix = extension(file.name);
  const isPdf =
    suffix === "pdf" &&
    startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  const isDocx =
    suffix === "docx" &&
    startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
  const isText =
    suffix === "txt" &&
    !bytes.some((byte) => byte === 0);
  if (!isPdf && !isDocx && !isText) {
    throw new Error(
      "Choose a valid PDF, DOCX, or plain-text resume. Renaming another file type is not supported.",
    );
  }

  const clientFileChecksumSha256 = await checksum(buffer);
  if (isPdf) {
    const parsed = await parsePdf(buffer);
    return {
      originalName: file.name.slice(0, 180),
      contentType: "application/pdf",
      byteSize: file.size,
      clientFileChecksumSha256,
      extractedText: parsed.text,
      pageCount: parsed.pageCount,
      parser: "pdfjs-browser-v1",
      warnings: parsed.warnings,
    };
  }
  if (isDocx) {
    const parsed = await parseDocx(buffer);
    return {
      originalName: file.name.slice(0, 180),
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      byteSize: file.size,
      clientFileChecksumSha256,
      extractedText: parsed.text,
      pageCount: null,
      parser: "mammoth-browser-v1",
      warnings: parsed.warnings,
    };
  }

  const text = normalizeExtractedText(new TextDecoder("utf-8", {
    fatal: true,
  }).decode(buffer));
  assertUsefulText(text, "This text file");
  return {
    originalName: file.name.slice(0, 180),
    contentType: "text/plain",
    byteSize: file.size,
    clientFileChecksumSha256,
    extractedText: text,
    pageCount: null,
    parser: "text-browser-v1",
    warnings: [],
  };
}
