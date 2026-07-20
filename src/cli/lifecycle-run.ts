import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runLifecycleWorkspace } from "../lib/lifecycle/engine";

const states = ["discovered", "selected", "approved", "amended"] as const;
type LifecycleCliState = (typeof states)[number];

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseState(): LifecycleCliState {
  const value = argument("--state") ?? "amended";
  if (!states.includes(value as LifecycleCliState)) {
    throw new Error(
      `Invalid --state ${value}. Expected one of: ${states.join(", ")}.`,
    );
  }
  return value as LifecycleCliState;
}

async function main() {
  const state = parseState();
  const selected = state !== "discovered";
  const approved = state === "approved" || state === "amended";
  const amended = state === "amended";
  const workspace = runLifecycleWorkspace({
    workspaceId: "tg-active-bid-demo",
    selectedOpportunityId: selected
      ? "opportunity-clinic-supplies"
      : null,
    approvals: approved ? ["qualification"] : [],
    observedChangeIds: amended ? ["change-delivery-window"] : [],
  });

  const output = path.resolve(
    argument("--output") ?? "artifacts/lifecycle-runs/latest.json",
  );
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(workspace, null, 2)}\n`);

  process.stdout.write(
    `${JSON.stringify(
      {
        contractVersion: workspace.contractVersion,
        requestedState: state,
        selectedOpportunityId: workspace.selectedOpportunityId,
        lifecycleState: workspace.opportunity.lifecycleState,
        stages: workspace.stages.map(({ id, status, metric }) => ({
          id,
          status,
          metric,
        })),
        changePartition: workspace.changes.map((change) => ({
          changeId: change.id,
          affectedRequirementIds: change.affectedRequirementIds,
          unchangedRequirementIds: change.unchangedRequirementIds,
        })),
        reopenedTasks: workspace.bidTasks
          .filter((task) => task.reopenedByChangeId !== null)
          .map(({ id, status, reopenedByChangeId }) => ({
            id,
            status,
            reopenedByChangeId,
          })),
        submission: workspace.approvals.find(
          (approval) => approval.id === "submission",
        ),
        gates: workspace.validationResults,
        artifact: path.relative(process.cwd(), output),
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
