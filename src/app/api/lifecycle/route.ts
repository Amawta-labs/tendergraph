import { NextResponse } from "next/server";

import { runLifecycleWorkspace } from "@/lib/lifecycle/engine";
import { LifecycleRunRequestSchema } from "@/lib/lifecycle/schemas";

export async function POST(request: Request) {
  try {
    const input = LifecycleRunRequestSchema.parse(await request.json());
    return NextResponse.json(runLifecycleWorkspace(input));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Lifecycle request failed",
      },
      { status: 400 },
    );
  }
}
