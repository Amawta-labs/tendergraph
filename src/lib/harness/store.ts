import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { HarnessTraceSchema, type HarnessTrace } from "./schemas";

const globalStore = globalThis as typeof globalThis & {
  tenderGraphTraces?: Map<string, HarnessTrace>;
};

const traces = globalStore.tenderGraphTraces ?? new Map<string, HarnessTrace>();
globalStore.tenderGraphTraces = traces;

function tracePath(rootDir: string, traceId: string): string {
  if (!/^[a-f0-9-]{36}$/.test(traceId)) throw new Error("Invalid trace ID");
  return path.join(rootDir, ".tendergraph", "traces", `${traceId}.json`);
}

export async function saveTrace(
  traceValue: HarnessTrace,
  rootDir = process.cwd(),
): Promise<void> {
  const trace = HarnessTraceSchema.parse(traceValue);
  traces.set(trace.traceId, trace);
  const outputPath = tracePath(rootDir, trace.traceId);
  await mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await writeFile(outputPath, JSON.stringify(trace, null, 2), { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const persisted = HarnessTraceSchema.parse(
      JSON.parse(await readFile(outputPath, "utf8")),
    );
    if (JSON.stringify(persisted) !== JSON.stringify(trace)) {
      throw new Error(`Immutable trace collision: ${trace.traceId}`);
    }
  }
}

export async function getTrace(
  traceId: string,
  rootDir = process.cwd(),
): Promise<HarnessTrace | undefined> {
  const cached = traces.get(traceId);
  if (cached) return cached;
  try {
    const trace = HarnessTraceSchema.parse(
      JSON.parse(await readFile(tracePath(rootDir, traceId), "utf8")),
    );
    traces.set(traceId, trace);
    return trace;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    if (error instanceof Error && error.message === "Invalid trace ID") return undefined;
    throw error;
  }
}
