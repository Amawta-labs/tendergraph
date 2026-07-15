import { NextResponse } from "next/server";

import { getTrace } from "@/lib/harness/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ traceId: string }> },
) {
  const { traceId } = await context.params;
  const trace = getTrace(traceId);
  if (!trace) {
    return NextResponse.json({ error: "Trace not found" }, { status: 404 });
  }
  return NextResponse.json(trace);
}
