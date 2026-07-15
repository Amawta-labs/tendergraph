import type { HarnessTrace } from "./schemas";

const globalStore = globalThis as typeof globalThis & {
  tenderGraphTraces?: Map<string, HarnessTrace>;
};

const traces = globalStore.tenderGraphTraces ?? new Map<string, HarnessTrace>();
globalStore.tenderGraphTraces = traces;

export function saveTrace(trace: HarnessTrace): void {
  traces.set(trace.traceId, trace);
}

export function getTrace(traceId: string): HarnessTrace | undefined {
  return traces.get(traceId);
}
