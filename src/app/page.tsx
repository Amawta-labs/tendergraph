import { Workbench } from "@/components/workbench";
import { loadLatestCodexResult } from "@/lib/harness/codex-runtime";
import {
  getFixture,
  listEvidenceDeltas,
  listFixtures,
} from "@/lib/harness/fixtures";
import { runHarness } from "@/lib/harness/run";
import { runLifecycleWorkspace } from "@/lib/lifecycle/engine";

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
      runtimeCapabilities={{
        apiConfigured: Boolean(process.env.OPENAI_API_KEY),
        apiModel: process.env.OPENAI_MODEL ?? "gpt-5.6",
        hosted: Boolean(process.env.VERCEL),
      }}
      initialLifecycle={runLifecycleWorkspace({
        workspaceId: "tg-active-bid-demo",
      })}
      initialLifecycleFocus={!params.case}
    />
  );
}
