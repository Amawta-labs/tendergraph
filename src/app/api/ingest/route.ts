import { NextResponse } from "next/server";

import { ingestDocument } from "@/lib/harness/ingestion";
import { DocumentIngestionMetadataSchema } from "@/lib/harness/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_REQUEST_BYTES = 11 * 1024 * 1024;

function nullableField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: `Upload exceeds the ${MAX_REQUEST_BYTES} byte request limit` },
      { status: 413 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A document file is required" }, { status: 400 });
    }

    const metadata = DocumentIngestionMetadataSchema.safeParse({
      jurisdiction: formData.get("jurisdiction"),
      procedureId: formData.get("procedureId"),
      lotId: nullableField(formData, "lotId"),
      artifactType: formData.get("artifactType"),
      canonicalUrl: nullableField(formData, "canonicalUrl"),
      issuer: nullableField(formData, "issuer"),
      license: nullableField(formData, "license"),
      publishedAt: nullableField(formData, "publishedAt"),
    });
    if (!metadata.success) {
      return NextResponse.json(
        { error: "Invalid document metadata", issues: metadata.error.issues },
        { status: 400 },
      );
    }

    const result = await ingestDocument({
      filename: file.name,
      mimeType: file.type,
      bytes: new Uint8Array(await file.arrayBuffer()),
      metadata: metadata.data,
    });
    return NextResponse.json(result, {
      status: result.status === "rejected" ? 422 : 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Document ingestion failed",
      },
      { status: 400 },
    );
  }
}
