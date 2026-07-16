import { Workbench } from "@/components/workbench";
import { loadLatestCodexResult } from "@/lib/harness/codex-runtime";
import {
  getFixture,
  listEvidenceDeltas,
  listFixtures,
} from "@/lib/harness/fixtures";
import { runHarness } from "@/lib/harness/run";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ case?: string; submission?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const fixture =
    getFixture(params.case ?? "cl-real-5802381-7547UCUK") ??
    getFixture("cl-real-5802381-7547UCUK");
  if (!fixture) throw new Error("Default fixture not found");
  const latestCodexResult = await loadLatestCodexResult(process.cwd());
  const initialResult =
    latestCodexResult?.trace.resolvedScope.procedureId === fixture.scope.procedureId
      ? latestCodexResult
      : await runHarness(
          fixture,
          fixture.id === "cl-correction-demo"
            ? "Who won after the correction and why?"
            : "Who was recommended for award and why?",
          {
          mode: "fallback",
          },
        );

  return (
    <Workbench
      fixtures={listFixtures()}
      initialFixtureId={fixture.id}
      initialResult={initialResult}
      evidenceDeltas={listEvidenceDeltas()}
      publicPresentation={params.submission === "public"}
    />
  );
}
