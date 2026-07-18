import { createHash, randomUUID } from "node:crypto";
import path from "node:path";

import {
  DocumentIngestionMetadataSchema,
  DocumentIngestionResultSchema,
  type DocumentFormat,
  type DocumentIngestionMetadata,
  type DocumentIngestionResult,
  type EvidenceRecord,
} from "./schemas";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MAX_EXTRACTED_CHARACTERS = 250_000;
const CHUNK_CHARACTERS = 1_800;

interface ParsedSegment {
  text: string;
  page: number | null;
  section: string | null;
  startOffset: number | null;
  endOffset: number | null;
}

interface ParsedDocument {
  status: DocumentIngestionResult["status"];
  parser: string;
  version: string;
  pageCount: number | null;
  segments: ParsedSegment[];
  warnings: string[];
}

export interface IngestDocumentOptions {
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
  metadata: DocumentIngestionMetadata;
}

function sha256(value: Uint8Array | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).replaceAll(/[\u0000-\u001f\u007f]/g, "");
  return base.slice(0, 240) || "uploaded-document";
}

function normalizeText(value: string): string {
  return value
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll("\u0000", "")
    .replaceAll(/[ \t]+\n/g, "\n")
    .replaceAll(/\n{4,}/g, "\n\n\n")
    .trim();
}

function detectFormat(filename: string, mimeType: string, bytes: Uint8Array): DocumentFormat {
  const extension = path.extname(filename).toLowerCase();
  const mime = mimeType.toLowerCase();
  const signature = new TextDecoder("latin1").decode(bytes.slice(0, 8));

  if (signature.startsWith("%PDF-") || mime === "application/pdf" || extension === ".pdf") {
    return "pdf";
  }
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === ".docx"
  ) {
    return "docx";
  }
  if (mime === "text/html" || extension === ".html" || extension === ".htm") {
    return "html";
  }
  if (mime === "application/json" || extension === ".json") return "json";
  if (mime === "text/markdown" || extension === ".md" || extension === ".markdown") {
    return "markdown";
  }
  if (mime === "text/csv" || extension === ".csv") return "csv";
  if (mime.startsWith("text/") || [".txt", ".xml", ".log"].includes(extension)) {
    return "text";
  }
  if (mime.startsWith("image/") || [".png", ".jpg", ".jpeg", ".tif", ".tiff"].includes(extension)) {
    return "image";
  }
  return "unsupported";
}

function chunkText(
  rawText: string,
  options: { page?: number | null; section?: string | null } = {},
): ParsedSegment[] {
  const text = normalizeText(rawText);
  if (!text) return [];
  const segments: ParsedSegment[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + CHUNK_CHARACTERS, text.length);
    if (end < text.length) {
      const preferredBreak = Math.max(
        text.lastIndexOf("\n\n", end),
        text.lastIndexOf(". ", end),
        text.lastIndexOf(" ", end),
      );
      if (preferredBreak > start + Math.floor(CHUNK_CHARACTERS * 0.55)) {
        end = preferredBreak + 1;
      }
    }
    const leadingWhitespace = text.slice(start, end).search(/\S/);
    if (leadingWhitespace < 0) break;
    const actualStart = start + leadingWhitespace;
    const value = text.slice(actualStart, end).trimEnd();
    if (value) {
      segments.push({
        text: value,
        page: options.page ?? null,
        section: options.section ?? null,
        startOffset: actualStart,
        endOffset: actualStart + value.length,
      });
    }
    start = Math.max(end, start + 1);
  }

  return segments;
}

async function parsePdf(bytes: Uint8Array): Promise<ParsedDocument> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
    verbosity: 0,
  });
  const document = await loadingTask.promise;
  const pageCount = document.numPages;
  const segments: ParsedSegment[] = [];
  const emptyPages: number[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) =>
          typeof item === "object" && item !== null && "str" in item
            ? String(item.str)
            : "",
        )
        .join(" ");
      const pageSegments = chunkText(text, {
        page: pageNumber,
        section: `Page ${pageNumber}`,
      });
      if (pageSegments.length === 0) emptyPages.push(pageNumber);
      segments.push(...pageSegments);
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return {
    status: segments.length > 0 ? "extracted" : "needs_ocr",
    parser: "pdfjs-dist",
    version: "6.1.200",
    pageCount,
    segments,
    warnings: [
      ...(emptyPages.length > 0
        ? [`No embedded text was found on PDF pages: ${emptyPages.join(", ")}.`]
        : []),
      ...(segments.length === 0
        ? ["The PDF appears scanned or image-only and requires OCR before claim discovery."]
        : []),
    ],
  };
}

async function parseDocx(bytes: Uint8Array): Promise<ParsedDocument> {
  const mammothModule = await import("mammoth");
  const mammoth = mammothModule.default ?? mammothModule;
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  const segments = chunkText(result.value, { section: "DOCX body" });
  return {
    status: segments.length > 0 ? "extracted" : "rejected",
    parser: "mammoth",
    version: "1.12.0",
    pageCount: null,
    segments,
    warnings: result.messages.map((message) => message.message),
  };
}

async function parseHtml(bytes: Uint8Array): Promise<ParsedDocument> {
  const { load } = await import("cheerio");
  const document = load(new TextDecoder().decode(bytes));
  document("script, style, noscript, svg, template").remove();
  const segments = chunkText(document("body").text() || document.root().text(), {
    section: "HTML body",
  });
  return {
    status: segments.length > 0 ? "extracted" : "rejected",
    parser: "cheerio",
    version: "1.2.0",
    pageCount: null,
    segments,
    warnings: [],
  };
}

function parseTextDocument(
  bytes: Uint8Array,
  format: Exclude<DocumentFormat, "pdf" | "docx" | "html" | "image" | "unsupported">,
): ParsedDocument {
  const decoded = new TextDecoder().decode(bytes);
  let text = decoded;
  const warnings: string[] = [];
  if (format === "json") {
    try {
      text = JSON.stringify(JSON.parse(decoded), null, 2);
    } catch {
      warnings.push("The file extension or MIME type indicated JSON, but parsing failed; plain text was retained.");
    }
  }
  const segments = chunkText(text, { section: `${format.toUpperCase()} body` });
  return {
    status: segments.length > 0 ? "extracted" : "rejected",
    parser: `tendergraph-${format}`,
    version: "1.0.0",
    pageCount: null,
    segments,
    warnings,
  };
}

async function parseDocument(
  format: DocumentFormat,
  bytes: Uint8Array,
): Promise<ParsedDocument> {
  if (format === "pdf") return parsePdf(bytes);
  if (format === "docx") return parseDocx(bytes);
  if (format === "html") return parseHtml(bytes);
  if (format === "image") {
    return {
      status: "needs_ocr",
      parser: "none",
      version: "1.0.0",
      pageCount: null,
      segments: [],
      warnings: ["Image ingestion is registered, but OCR is not available in this deployment."],
    };
  }
  if (format === "unsupported") {
    return {
      status: "unsupported",
      parser: "none",
      version: "1.0.0",
      pageCount: null,
      segments: [],
      warnings: ["The uploaded file type is not supported by the current adapter registry."],
    };
  }
  return parseTextDocument(bytes, format);
}

export async function ingestDocument(
  options: IngestDocumentOptions,
): Promise<DocumentIngestionResult> {
  const metadata = DocumentIngestionMetadataSchema.parse(options.metadata);
  if (options.bytes.byteLength === 0) throw new Error("The uploaded document is empty");
  if (options.bytes.byteLength > MAX_DOCUMENT_BYTES) {
    throw new Error(`The uploaded document exceeds the ${MAX_DOCUMENT_BYTES} byte limit`);
  }

  const filename = sanitizeFilename(options.filename);
  const mimeType = options.mimeType || "application/octet-stream";
  const fileHash = sha256(options.bytes);
  const format = detectFormat(filename, mimeType, options.bytes);
  const parsed = await parseDocument(format, options.bytes);
  const extractedCharacters = parsed.segments.reduce(
    (total, segment) => total + segment.text.length,
    0,
  );
  if (extractedCharacters > MAX_EXTRACTED_CHARACTERS) {
    throw new Error(
      `Extracted text exceeds the ${MAX_EXTRACTED_CHARACTERS} character safety limit`,
    );
  }

  const manifestId = `manifest-upload-${fileHash.slice(0, 16)}`;
  const canonicalUrl =
    metadata.canonicalUrl ??
    `https://uploads.tendergraph.invalid/${fileHash}/${encodeURIComponent(filename)}`;
  const sourceManifest = {
    id: manifestId,
    connector: "manual_upload" as const,
    jurisdiction: metadata.jurisdiction,
    procedureId: metadata.procedureId,
    lotId: metadata.lotId,
    artifactType: metadata.artifactType,
    canonicalUrl,
    retrievedAt: new Date().toISOString(),
    publishedAt: metadata.publishedAt,
    mimeType,
    sha256: fileHash,
    license: metadata.license,
    snapshotKey: `uploads/${fileHash}/${filename}`,
    retrievalMode: "live" as const,
    sourceStatus: "eligible" as const,
    runtimePolicy: "context_only" as const,
    issuer: metadata.issuer,
    selectionRule:
      "Uploaded sources remain context-only until provenance and consequential claims are reviewed.",
  };
  const evidence: EvidenceRecord[] = parsed.segments.map((segment, index) => ({
    id: `ev-upload-${fileHash.slice(0, 12)}-${String(index + 1).padStart(3, "0")}`,
    sourceManifestId: manifestId,
    contentHash: sha256(segment.text),
    locator: {
      page: segment.page,
      section: segment.section,
      table: null,
      startOffset: segment.startOffset,
      endOffset: segment.endOffset,
    },
    extractedText: segment.text,
    parserVersion: `${parsed.parser}@${parsed.version}`,
  }));
  const eligibleForReview =
    parsed.status === "extracted" &&
    evidence.length > 0 &&
    metadata.canonicalUrl !== null;

  return DocumentIngestionResultSchema.parse({
    contractVersion: "document-ingestion.v1",
    ingestionId: randomUUID(),
    createdAt: new Date().toISOString(),
    status: parsed.status,
    format,
    file: {
      name: filename,
      mimeType,
      byteLength: options.bytes.byteLength,
      sha256: fileHash,
    },
    parser: {
      adapter: parsed.parser,
      version: parsed.version,
    },
    pageCount: parsed.pageCount,
    sourceManifest,
    evidence,
    authorityState: eligibleForReview ? "eligible_for_review" : "context_only",
    warnings: [
      ...parsed.warnings,
      ...(metadata.canonicalUrl === null
        ? ["No canonical source URL was supplied; the document cannot become claim authority."]
        : []),
      "Uploaded bytes are processed in memory and are not persisted by this demo route.",
    ],
  });
}
