import { createHash } from "node:crypto";

import {
  LifecycleRunRequestSchema,
  LifecycleWorkspaceSchema,
  type LifecycleApprovalId,
  type LifecycleWorkspace,
} from "./schemas";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const evidence: LifecycleWorkspace["evidence"] = [
  {
    id: "evidence-opportunity-notice",
    sourceId: "source-opportunity-notice",
    label: "Opportunity notice",
    version: "2026-07-18",
    current: true,
    contentHash: hash("tg-active-bid-demo:opportunity-notice:v1"),
  },
  {
    id: "evidence-requirements-v1",
    sourceId: "source-requirements",
    label: "Technical and administrative requirements",
    version: "v1",
    current: false,
    contentHash: hash("tg-active-bid-demo:requirements:v1"),
  },
  {
    id: "evidence-requirements-v2",
    sourceId: "source-requirements",
    label: "Requirements amendment",
    version: "v2 current",
    current: true,
    contentHash: hash("tg-active-bid-demo:requirements:v2"),
  },
  {
    id: "evidence-capability-pack",
    sourceId: "source-supplier-capabilities",
    label: "Supplier capability pack",
    version: "2026-Q3",
    current: true,
    contentHash: hash("tg-active-bid-demo:capabilities:2026-q3"),
  },
];

const requirements: LifecycleWorkspace["requirements"] = [
  {
    id: "req-tax-standing",
    title: "Current tax-standing certificate",
    category: "administrative",
    status: "covered",
    currentValue: "Certificate dated within 30 days",
    previousValue: null,
    evidenceIds: ["evidence-requirements-v2", "evidence-capability-pack"],
    owner: "Bid operations",
    blocker: false,
  },
  {
    id: "req-ce-certificate",
    title: "CE certificate for offered devices",
    category: "technical",
    status: "needs_review",
    currentValue: "Certificate attached; scope match requires human review",
    previousValue: null,
    evidenceIds: ["evidence-requirements-v2", "evidence-capability-pack"],
    owner: "Quality lead",
    blocker: true,
  },
  {
    id: "req-delivery",
    title: "Maximum delivery time",
    category: "delivery",
    status: "changed",
    currentValue: "10 calendar days",
    previousValue: "15 calendar days",
    evidenceIds: ["evidence-requirements-v1", "evidence-requirements-v2"],
    owner: "Operations lead",
    blocker: true,
  },
  {
    id: "req-warranty",
    title: "Minimum warranty",
    category: "technical",
    status: "covered",
    currentValue: "24 months",
    previousValue: null,
    evidenceIds: ["evidence-requirements-v2", "evidence-capability-pack"],
    owner: "Product lead",
    blocker: false,
  },
  {
    id: "req-price-template",
    title: "Official price template",
    category: "commercial",
    status: "covered",
    currentValue: "Template completed in CLP, taxes separated",
    previousValue: null,
    evidenceIds: ["evidence-requirements-v2"],
    owner: "Pricing lead",
    blocker: false,
  },
];

function bidTasks(
  qualificationApproved: boolean,
): LifecycleWorkspace["bidTasks"] {
  return [
    {
      id: "task-price",
      title: "Complete commercial workbook",
      agent: "bid_agent",
      status: "complete",
      requirementIds: ["req-price-template"],
      dependsOn: [],
      humanOwner: "Pricing lead",
    },
    {
      id: "task-technical-response",
      title: "Update technical response for amendment v2",
      agent: "bid_agent",
      status: qualificationApproved ? "in_progress" : "blocked",
      requirementIds: ["req-delivery", "req-warranty"],
      dependsOn: ["approval-qualification"],
      humanOwner: "Product lead",
    },
    {
      id: "task-delivery-confirmation",
      title: "Confirm 10-day delivery capacity",
      agent: "requirements_agent",
      status: "blocked",
      requirementIds: ["req-delivery"],
      dependsOn: ["task-technical-response"],
      humanOwner: "Operations lead",
    },
    {
      id: "task-certificate-review",
      title: "Validate CE certificate scope",
      agent: "compliance_agent",
      status: "needs_review",
      requirementIds: ["req-ce-certificate"],
      dependsOn: [],
      humanOwner: "Quality lead",
    },
    {
      id: "task-submission-approval",
      title: "Approve final submission package",
      agent: "compliance_agent",
      status: "blocked",
      requirementIds: requirements.map((requirement) => requirement.id),
      dependsOn: [
        "task-price",
        "task-technical-response",
        "task-delivery-confirmation",
        "task-certificate-review",
      ],
      humanOwner: "Bid manager",
    },
  ];
}

function buildStages(
  qualificationApproved: boolean,
): LifecycleWorkspace["stages"] {
  return [
    {
      id: "discovery",
      label: "Discovery",
      agent: "opportunity_agent",
      status: "complete",
      summary: "Opportunity normalized from the admitted notice.",
      metric: "1 selected",
      evidenceIds: ["evidence-opportunity-notice"],
      requiresApproval: null,
    },
    {
      id: "qualification",
      label: "Qualification",
      agent: "qualification_agent",
      status: qualificationApproved ? "complete" : "needs_review",
      summary: qualificationApproved
        ? "Fit and capacity assumptions approved by the bid manager."
        : "Fit score is ready; a human must authorize bid investment.",
      metric: "84 / 100",
      evidenceIds: ["evidence-opportunity-notice", "evidence-capability-pack"],
      requiresApproval: "qualification",
    },
    {
      id: "requirements",
      label: "Requirements",
      agent: "requirements_agent",
      status: "active",
      summary: "Every current requirement is partitioned by readiness state.",
      metric: "3 / 5 covered",
      evidenceIds: [
        "evidence-requirements-v1",
        "evidence-requirements-v2",
        "evidence-capability-pack",
      ],
      requiresApproval: null,
    },
    {
      id: "bid_preparation",
      label: "Bid plan",
      agent: "bid_agent",
      status: qualificationApproved ? "active" : "blocked",
      summary: qualificationApproved
        ? "The amendment-aware response plan is active."
        : "Tasks are proposed but cannot start before qualification approval.",
      metric: qualificationApproved ? "2 active" : "1 / 5 complete",
      evidenceIds: ["evidence-requirements-v2"],
      requiresApproval: null,
    },
    {
      id: "compliance",
      label: "Compliance",
      agent: "compliance_agent",
      status: "blocked",
      summary: "Delivery capacity and certificate scope remain unresolved.",
      metric: "2 blockers",
      evidenceIds: ["evidence-requirements-v2", "evidence-capability-pack"],
      requiresApproval: "compliance",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      agent: "monitoring_agent",
      status: "active",
      summary: "Amendment v2 changed delivery and triggered a bounded replan.",
      metric: "1 change",
      evidenceIds: ["evidence-requirements-v1", "evidence-requirements-v2"],
      requiresApproval: null,
    },
    {
      id: "outcome",
      label: "Outcome",
      agent: "outcome_agent",
      status: "not_started",
      summary: "Opening and award learning begins after publication.",
      metric: "Awaiting bid",
      evidenceIds: [],
      requiresApproval: null,
    },
  ];
}

export function validateLifecycleWorkspace(
  workspace: Omit<LifecycleWorkspace, "validationResults">,
): LifecycleWorkspace["validationResults"] {
  const evidenceIds = new Set(workspace.evidence.map((item) => item.id));
  const currentEvidenceIds = new Set(
    workspace.evidence.filter((item) => item.current).map((item) => item.id),
  );
  const requirementIds = new Set(
    workspace.requirements.map((requirement) => requirement.id),
  );
  const taskIds = new Set(workspace.bidTasks.map((task) => task.id));
  const tasksById = new Map(workspace.bidTasks.map((task) => [task.id, task]));
  const qualificationApproved =
    workspace.approvals.find((approval) => approval.id === "qualification")
      ?.status === "approved";
  const validTaskDependencies = workspace.bidTasks.every((task) =>
    task.dependsOn.every(
      (dependency) =>
        dependency === "approval-qualification" || taskIds.has(dependency),
    ),
  );
  const runnableTasksHaveSatisfiedDependencies = workspace.bidTasks.every(
    (task) =>
      task.status === "blocked" ||
      task.dependsOn.every((dependency) =>
        dependency === "approval-qualification"
          ? qualificationApproved
          : tasksById.get(dependency)?.status === "complete",
      ),
  );
  const changed = workspace.requirements.filter(
    (requirement) => requirement.status === "changed",
  );
  const sourceGroups = Map.groupBy(
    workspace.evidence,
    (item) => item.sourceId,
  );
  const validChangePartitions = workspace.changes.every((change) => {
    const combined = [
      ...change.affectedRequirementIds,
      ...change.unchangedRequirementIds,
    ];
    const partition = new Set(combined);
    return (
      combined.length === partition.size &&
      partition.size === requirementIds.size &&
      [...requirementIds].every((id) => partition.has(id)) &&
      change.affectedRequirementIds.every(
        (id) =>
          workspace.requirements.find((requirement) => requirement.id === id)
            ?.status === "changed",
      ) &&
      change.unchangedRequirementIds.every(
        (id) =>
          workspace.requirements.find((requirement) => requirement.id === id)
            ?.status !== "changed",
      )
    );
  });

  return [
    {
      gate: "current_source_set",
      passed:
        workspace.evidence.some((item) => item.current) &&
        workspace.evidence.every((item) => item.contentHash.length === 64) &&
        [...sourceGroups.values()].every(
          (versions) => versions.filter((item) => item.current).length === 1,
        ),
      details: "Current and superseded document versions remain explicit.",
    },
    {
      gate: "requirement_evidence_binding",
      passed: workspace.requirements.every(
        (requirement) =>
          requirement.evidenceIds.every((id) => evidenceIds.has(id)) &&
          requirement.evidenceIds.some((id) => currentEvidenceIds.has(id)),
      ),
      details: "Every requirement resolves only to registered evidence.",
    },
    {
      gate: "requirement_partition",
      passed:
        workspace.requirements.length === requirementIds.size &&
        workspace.requirements.every((requirement) =>
          ["covered", "changed", "needs_review", "gap"].includes(
            requirement.status,
          ),
        ),
      details: "Every current requirement has exactly one readiness state.",
    },
    {
      gate: "task_dependency_graph",
      passed:
        validTaskDependencies &&
        runnableTasksHaveSatisfiedDependencies &&
        workspace.bidTasks.every((task) =>
          task.requirementIds.every((id) => requirementIds.has(id)),
        ),
      details: "Bid tasks reference known requirements and dependencies.",
    },
    {
      gate: "change_impact_completeness",
      passed: changed.length > 0 && validChangePartitions,
      details: "The amendment identifies affected and unchanged requirements.",
    },
    {
      gate: "human_submission_authority",
      passed:
        workspace.submissionAuthority === "human_only" &&
        workspace.approvals.some(
          (approval) =>
            approval.id === "submission" && approval.status === "blocked",
        ),
      details: "No agent can approve or submit the bid autonomously.",
    },
  ];
}

export function runLifecycleWorkspace(input: {
  workspaceId: string;
  approvals?: LifecycleApprovalId[];
}): LifecycleWorkspace {
  const request = LifecycleRunRequestSchema.parse(input);
  const approved = new Set(request.approvals);
  const qualificationApproved = approved.has("qualification");
  const now = new Date().toISOString();

  const withoutValidation: Omit<LifecycleWorkspace, "validationResults"> = {
    contractVersion: "tender-lifecycle.v1",
    workspaceId: request.workspaceId,
    generatedAt: now,
    dataStatus: "synthetic",
    opportunity: {
      title: "Regional clinic diagnostic supplies",
      buyer: "Regional Health Network",
      jurisdiction: "CL",
      procedureId: "CL-BID-DEMO-2026-01",
      deadline: "2026-07-27T21:00:00.000Z",
      lifecycleState: "bid_in_preparation",
      fitScore: 84,
      valueBand: "CLP 45M-60M",
    },
    opportunityMatches: [
      {
        id: "opportunity-clinic-supplies",
        title: "Regional clinic diagnostic supplies",
        jurisdiction: "CL",
        deadline: "2026-07-27T21:00:00.000Z",
        fitScore: 84,
        status: "selected",
        matchReason: "Strong product and commercial fit; two review gates remain.",
      },
      {
        id: "opportunity-lab-consumables",
        title: "Municipal laboratory consumables",
        jurisdiction: "CL",
        deadline: "2026-07-29T19:00:00.000Z",
        fitScore: 72,
        status: "review",
        matchReason: "Portfolio fit is credible; delivery capacity is unverified.",
      },
      {
        id: "opportunity-cold-chain",
        title: "Hospital cold-chain equipment",
        jurisdiction: "OTHER",
        deadline: "2026-08-03T16:00:00.000Z",
        fitScore: 46,
        status: "pass",
        matchReason: "Mandatory service footprint is unsupported.",
      },
    ],
    evidence,
    requirements,
    bidTasks: bidTasks(qualificationApproved),
    stages: buildStages(qualificationApproved),
    changes: [
      {
        id: "change-delivery-window",
        title: "Delivery window reduced by amendment v2",
        detectedAt: "2026-07-20T13:30:00.000Z",
        sourceId: "source-requirements",
        affectedRequirementIds: ["req-delivery"],
        unchangedRequirementIds: [
          "req-tax-standing",
          "req-ce-certificate",
          "req-warranty",
          "req-price-template",
        ],
        action: "replan",
        authority: "shadow",
      },
    ],
    approvals: [
      {
        id: "qualification",
        label: "Authorize bid investment",
        status: qualificationApproved ? "approved" : "ready",
        reason: qualificationApproved
          ? "The bid manager approved the bounded qualification result."
          : "An 84/100 fit score cannot allocate team capacity without approval.",
        approvedBy: qualificationApproved ? "Bid manager" : null,
        approvedAt: qualificationApproved ? now : null,
      },
      {
        id: "compliance",
        label: "Approve compliance package",
        status: "blocked",
        reason: "Delivery capacity and certificate scope remain unresolved.",
        approvedBy: null,
        approvedAt: null,
      },
      {
        id: "submission",
        label: "Release final bid",
        status: "blocked",
        reason: "Only a named human may release a complete, reviewed package.",
        approvedBy: null,
        approvedAt: null,
      },
    ],
    nextAction: qualificationApproved
      ? "Resolve the delivery and certificate blockers before compliance review."
      : "A bid manager must approve qualification before preparation can proceed.",
    submissionAuthority: "human_only",
  };

  return LifecycleWorkspaceSchema.parse({
    ...withoutValidation,
    validationResults: validateLifecycleWorkspace(withoutValidation),
  });
}
