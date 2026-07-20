import { describe, expect, it } from "vitest";

import { runLifecycleWorkspace } from "../src/lib/lifecycle/engine";
import { LifecycleWorkspaceSchema } from "../src/lib/lifecycle/schemas";

describe("agentic tender lifecycle", () => {
  it("builds a valid seven-stage workspace from versioned evidence", () => {
    const workspace = runLifecycleWorkspace({
      workspaceId: "tg-active-bid-demo",
    });

    expect(LifecycleWorkspaceSchema.parse(workspace)).toEqual(workspace);
    expect(workspace.stages).toHaveLength(7);
    expect(workspace.opportunityMatches).toHaveLength(3);
    expect(
      workspace.opportunityMatches.map((opportunity) => opportunity.fitScore),
    ).toEqual([84, 72, 46]);
    expect(workspace.opportunityMatches[0].status).toBe("selected");
    expect(workspace.evidence.some((item) => !item.current)).toBe(true);
    expect(workspace.evidence.some((item) => item.current)).toBe(true);
    expect(workspace.validationResults.every((gate) => gate.passed)).toBe(true);
  });

  it("keeps bid preparation blocked before human qualification approval", () => {
    const workspace = runLifecycleWorkspace({
      workspaceId: "tg-active-bid-demo",
    });

    expect(
      workspace.stages.find((stage) => stage.id === "qualification")?.status,
    ).toBe("needs_review");
    expect(
      workspace.stages.find((stage) => stage.id === "bid_preparation")?.status,
    ).toBe("blocked");
    expect(
      workspace.bidTasks.find(
        (task) => task.id === "task-technical-response",
      )?.status,
    ).toBe("blocked");
  });

  it("activates the bid plan only after a named human approval", () => {
    const workspace = runLifecycleWorkspace({
      workspaceId: "tg-active-bid-demo",
      approvals: ["qualification"],
    });

    expect(
      workspace.approvals.find(
        (approval) => approval.id === "qualification",
      ),
    ).toEqual(
      expect.objectContaining({
        status: "approved",
        approvedBy: "Bid manager",
      }),
    );
    expect(
      workspace.stages.find((stage) => stage.id === "bid_preparation")?.status,
    ).toBe("active");
    expect(
      workspace.bidTasks.find(
        (task) => task.id === "task-technical-response",
      )?.status,
    ).toBe("in_progress");
  });

  it("preserves a complete requirement partition when an amendment changes one item", () => {
    const workspace = runLifecycleWorkspace({
      workspaceId: "tg-active-bid-demo",
    });
    const change = workspace.changes[0];
    const partition = new Set([
      ...change.affectedRequirementIds,
      ...change.unchangedRequirementIds,
    ]);

    expect(partition).toEqual(
      new Set(workspace.requirements.map((requirement) => requirement.id)),
    );
    expect(
      workspace.requirements.find(
        (requirement) => requirement.id === "req-delivery",
      ),
    ).toEqual(
      expect.objectContaining({
        status: "changed",
        previousValue: "15 calendar days",
        currentValue: "10 calendar days",
      }),
    );
  });

  it("never grants agents submission authority", () => {
    const workspace = runLifecycleWorkspace({
      workspaceId: "tg-active-bid-demo",
      approvals: ["qualification"],
    });

    expect(workspace.submissionAuthority).toBe("human_only");
    expect(
      workspace.approvals.find((approval) => approval.id === "submission")
        ?.status,
    ).toBe("blocked");
    expect(
      workspace.validationResults.find(
        (gate) => gate.gate === "human_submission_authority",
      )?.passed,
    ).toBe(true);
  });
});
