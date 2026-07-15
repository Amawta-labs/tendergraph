import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getFixture } from "@/lib/harness/fixtures";
import { runHarness } from "@/lib/harness/run";
import { CompositionResultSchema } from "@/lib/harness/schemas";

export const maxDuration = 180;
export const dynamic = "force-dynamic";

const MAX_PROCESS_OUTPUT_BYTES = 1_000_000;

const RequestSchema = z.object({
  fixtureId: z.string().min(1),
  question: z.string().min(3).max(500),
});

async function executeCodexRun(
  fixtureId: string,
  question: string,
): Promise<z.infer<typeof CompositionResultSchema>> {
  const rootDir = process.cwd();
  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn(
      "npm",
      [
        "run",
        "tendergraph:codex",
        "--",
        "--fixture",
        fixtureId,
        "--question",
        question,
        "--model",
        "gpt-5.6-terra",
      ],
      { cwd: rootDir, env: process.env, detached: process.platform !== "win32" },
    );
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
          return;
        }
        child.kill("SIGTERM");
      } catch {
        // The process may already have exited between the timeout and cleanup.
      }
    };
    const timeout = setTimeout(() => {
      terminate();
      finish(() => reject(new Error("Codex composition exceeded the process limit")));
    }, 150_000);

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (Buffer.byteLength(output) > MAX_PROCESS_OUTPUT_BYTES) {
        terminate();
        finish(() => reject(new Error("Codex process output exceeded the safety limit")));
      }
    });
    child.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
      if (Buffer.byteLength(errorOutput) > MAX_PROCESS_OUTPUT_BYTES) {
        terminate();
        finish(() => reject(new Error("Codex process error output exceeded the safety limit")));
      }
    });
    child.on("error", (error) => {
      finish(() => reject(error));
    });
    child.on("close", (code) => {
      if (code !== 0) {
        if (errorOutput) console.error("Codex runtime stderr:", errorOutput);
        finish(() => reject(new Error(`Codex process failed with exit code ${code}`)));
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
    .find((event) => event.event === "tendergraph.run.completed");
  const runId = completed?.runId;
  if (typeof runId !== "string" || !/^[a-f0-9-]{36}$/.test(runId)) {
    throw new Error("Codex process did not return a valid TenderGraph run ID");
  }

  const resultPath = path.join(rootDir, ".tendergraph", "runs", runId, "result.json");
  return CompositionResultSchema.parse(
    JSON.parse(await readFile(resultPath, "utf8")),
  );
}

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid Codex run request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const fixture = getFixture(parsed.data.fixtureId);
  if (!fixture) {
    return NextResponse.json({ error: "Unknown golden case" }, { status: 404 });
  }

  try {
    return NextResponse.json(
      await executeCodexRun(parsed.data.fixtureId, parsed.data.question),
    );
  } catch (error) {
    const fallback = await runHarness(fixture, parsed.data.question, {
      mode: "fallback",
    });
    return NextResponse.json({
      ...fallback,
      runtimeWarning:
        error instanceof Error ? error.message : "Codex process failed",
    });
  }
}
