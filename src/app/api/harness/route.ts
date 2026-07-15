import { NextResponse } from "next/server";
import { z } from "zod";

import { getFixture } from "@/lib/harness/fixtures";
import { runHarness } from "@/lib/harness/run";

const RequestSchema = z.object({
  fixtureId: z.string().min(1),
  question: z.string().min(3).max(500),
  mode: z.enum(["auto", "fallback"]).default("auto"),
});

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid harness request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const fixture = getFixture(parsed.data.fixtureId);
  if (!fixture) {
    return NextResponse.json({ error: "Unknown golden case" }, { status: 404 });
  }

  const result = await runHarness(fixture, parsed.data.question, {
    mode: parsed.data.mode,
  });
  return NextResponse.json(result);
}
