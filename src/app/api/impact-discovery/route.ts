import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getFixture, listEvidenceDeltas } from "@/lib/harness/fixtures";
import {
  finalizeImpactDiscovery,
  prepareImpactDiscoveryForDocument,
  prepareImpactDiscoveryForEvent,
} from "@/lib/harness/impact-discovery";
import {
  DocumentIngestionResultSchema,
  ImpactDiscoveryResultSchema,
} from "@/lib/harness/schemas";

export const runtime = "nodejs";
export const maxDuration = 180;
export const dynamic = "force-dynamic";

const MAX_PROCESS_OUTPUT_BYTES = 1_000_000;

const RequestSchema = z
  .strictObject({
    fixtureId: z.string().min(1),
    eventId: z.string().min(1).nullable().optional(),
    document: DocumentIngestionResultSchema.nullable().optional(),
  })
  .refine(
    (value) => Boolean(value.eventId) !== Boolean(value.document),
    "Provide exactly one impact source: eventId or document",
  );

async function executeImpactDiscovery(
  fixtureId: string,
  eventId: string | null,
  document: z.infer<typeof DocumentIngestionResultSchema> | null,
) {
  const rootDir = process.cwd();
  const runtimeDirectory = path.join(
    tmpdir(),
    "tendergraph-impact",
    randomUUID(),
  );
  const inputDirectory = path.join(runtimeDirectory, "api-inputs");
  const inputPath = path.join(inputDirectory, `impact-${randomUUID()}.json`);
  const args = [
    "run",
    "tendergraph:impact",
    "--",
    "--fixture",
    fixtureId,
    "--model",
    "gpt-5.6-terra",
  ];

  if (document) {
    const fixture = getFixture(fixtureId);
    if (!fixture) throw new Error("Unknown golden case");
    const input = prepareImpactDiscoveryForDocument(
      fixture,
      document,
      "gpt-5.6-terra",
    );
    await mkdir(inputDirectory, { recursive: true });
    await writeFile(inputPath, JSON.stringify(input, null, 2));
    args.push("--input", inputPath);
  } else if (eventId) {
    args.push("--event", eventId);
  }

  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      const child = spawn("npm", args, {
        cwd: rootDir,
        env: {
          ...process.env,
          TENDERGRAPH_RUNTIME_DIR: runtimeDirectory,
        },
        detached: process.platform !== "win32",
      });
      child.stdin.end();
      let output = "";
      let errorOutput = "";
      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        callback();
      };
      const terminate = () => {
        try {
          if (child.pid && process.platform !== "win32") {
            process.kill(-child.pid, "SIGTERM");
          } else {
            child.kill("SIGTERM");
          }
        } catch {
          // The child may have exited between the timeout and cleanup.
        }
      };
      const timeout = setTimeout(() => {
        terminate();
        finish(() => reject(new Error("Impact discovery exceeded the process limit")));
      }, 165_000);

      child.stdout.on("data", (chunk) => {
        output += chunk.toString();
        if (Buffer.byteLength(output) > MAX_PROCESS_OUTPUT_BYTES) {
          terminate();
          finish(() => reject(new Error("Impact process output exceeded the safety limit")));
        }
      });
      child.stderr.on("data", (chunk) => {
        errorOutput += chunk.toString();
        if (Buffer.byteLength(errorOutput) > MAX_PROCESS_OUTPUT_BYTES) {
          terminate();
          finish(() => reject(new Error("Impact process error output exceeded the safety limit")));
        }
      });
      child.on("error", (error) => finish(() => reject(error)));
      child.on("close", (code) => {
        if (code !== 0) {
          if (errorOutput) console.error("Impact runtime stderr:", errorOutput);
          finish(() => reject(new Error(`Impact process failed with exit code ${code}`)));
          return;
        }
        finish(() => resolve(output));
      });
    });

    const completed = stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Record<string, unknown>;
        } catch {
          return {};
        }
      })
      .find((event) => event.event === "tendergraph.impact.completed");
    const runId = completed?.runId;
    if (typeof runId !== "string" || !/^[a-f0-9-]{36}$/.test(runId)) {
      throw new Error("Impact process did not return a valid run ID");
    }
    return ImpactDiscoveryResultSchema.parse(
      JSON.parse(
        await readFile(
          path.join(runtimeDirectory, "impact-runs", runId, "result.json"),
          "utf8",
        ),
      ),
    );
  } finally {
    await rm(runtimeDirectory, { force: true, recursive: true });
  }
}

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid impact discovery request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (!getFixture(parsed.data.fixtureId)) {
    return NextResponse.json({ error: "Unknown golden case" }, { status: 404 });
  }

  try {
    return NextResponse.json(
      await executeImpactDiscovery(
        parsed.data.fixtureId,
        parsed.data.eventId ?? null,
        parsed.data.document ?? null,
      ),
    );
  } catch (error) {
    const fixture = getFixture(parsed.data.fixtureId);
    if (!fixture) {
      return NextResponse.json({ error: "Unknown golden case" }, { status: 404 });
    }
    const event =
      parsed.data.eventId
        ? listEvidenceDeltas().find(
            (delta) => delta.event.id === parsed.data.eventId,
          )?.event ?? null
        : null;
    if (parsed.data.eventId && !event) {
      return NextResponse.json({ error: "Unknown evidence event" }, { status: 404 });
    }
    try {
      const input = parsed.data.document
        ? prepareImpactDiscoveryForDocument(
            fixture,
            parsed.data.document,
            "gpt-5.6-terra",
          )
        : prepareImpactDiscoveryForEvent(
            fixture,
            event!,
            "gpt-5.6-terra",
          );
      return NextResponse.json(
        finalizeImpactDiscovery(
          fixture,
          input,
          null,
          {
            model: "gpt-5.6-terra",
            sessionId: null,
            elapsedMs: 0,
            failureReason:
              error instanceof Error ? error.message : "Codex runtime unavailable",
          },
          event,
        ),
      );
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error:
            fallbackError instanceof Error
              ? fallbackError.message
              : "Impact discovery failed",
        },
        { status: 500 },
      );
    }
  }
}
