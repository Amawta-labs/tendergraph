import { Workbench } from "@/components/workbench";
import { loadLatestCodexResult } from "@/lib/harness/codex-runtime";
import { getFixture, listFixtures } from "@/lib/harness/fixtures";
import { runHarness } from "@/lib/harness/run";

export const dynamic = "force-dynamic";

export default async function Home() {
  const fixture = getFixture("cl-deep-demo");
  if (!fixture) throw new Error("Default fixture not found");
  const latestCodexResult = await loadLatestCodexResult(process.cwd());
  const initialResult =
    latestCodexResult?.trace.resolvedScope.procedureId === fixture.scope.procedureId
      ? latestCodexResult
      : await runHarness(fixture, "Who won Lot 1 and why?", { mode: "fallback" });

  return (
    <Workbench
      fixtures={listFixtures()}
      initialFixtureId={fixture.id}
      initialResult={initialResult}
    />
  );
}
