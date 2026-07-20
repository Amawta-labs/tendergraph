import { createHash } from "node:crypto";

import {
  LifecycleRunRequestSchema,
  LifecycleWorkspaceSchema,
  type LifecycleApprovalId,
  type LifecycleWorkspace,
} from "./schemas";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const opportunityNotice: LifecycleWorkspace["evidence"][number] = {
  id: "evidence-opportunity-notice",
  sourceId: "source-opportunity-notice",
  label: "Opportunity notice",
  version: "2026-07-18",
  current: true,
  contentHash: hash("tg-active-bid-demo:opportunity-notice:v1"),
};

const capabilityPack: LifecycleWorkspace["evidence"][number] = {
  id: "evidence-capability-pack",
  sourceId: "source-supplier-capabilities",
  label: "Supplier capability pack",
  version: "2026-Q3",
  current: true,
  contentHash: hash("tg-active-bid-demo:capabilities:2026-q3"),
};

function buildEvidence(
  amendmentDetected: boolean,
): LifecycleWorkspace["evidence"] {
  return [
    opportunityNotice,
    {
      id: "evidence-requirements-v1",
      sourceId: "source-requirements",
      label: "Technical and administrative requirements",
      version: "v1",
      current: !amendmentDetected,
      contentHash: hash("tg-active-bid-demo:requirements:v1"),
    },
    ...(amendmentDetected
      ? [
          {
            id: "evidence-requirements-v2",
            sourceId: "source-requirements",
            label: "Requirements amendment",
            version: "v2 current",
            current: true,
            contentHash: hash("tg-active-bid-demo:requirements:v2"),
          },
        ]
      : []),
    capabilityPack,
  ];
}

function buildRequirements(
  amendmentDetected: boolean,
): LifecycleWorkspace["requirements"] {
  const currentRequirementsEvidence = amendmentDetected
    ? "evidence-requirements-v2"
    : "evidence-requirements-v1";

  return [
  {
    id: "req-tax-standing",
    title: "Current tax-standing certificate",
    category: "administrative",
    status: "covered",
    currentValue: "Certificate dated within 30 days",
    previousValue: null,
    evidenceIds: [currentRequirementsEvidence, "evidence-capability-pack"],
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
    evidenceIds: [currentRequirementsEvidence, "evidence-capability-pack"],
    owner: "Quality lead",
    blocker: true,
  },
  {
    id: "req-delivery",
    title: "Maximum delivery time",
    category: "delivery",
    status: amendmentDetected ? "changed" : "covered",
    currentValue: amendmentDetected ? "10 calendar days" : "15 calendar days",
    previousValue: amendmentDetected ? "15 calendar days" : null,
    evidenceIds: amendmentDetected
      ? ["evidence-requirements-v1", "evidence-requirements-v2"]
      : ["evidence-requirements-v1"],
    owner: "Operations lead",
    blocker: amendmentDetected,
  },
  {
    id: "req-warranty",
    title: "Minimum warranty",
    category: "technical",
    status: "covered",
    currentValue: "24 months",
    previousValue: null,
    evidenceIds: [currentRequirementsEvidence, "evidence-capability-pack"],
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
    evidenceIds: [currentRequirementsEvidence],
    owner: "Pricing lead",
    blocker: false,
  },
  ];
}

function bidTasks(
  selected: boolean,
  qualificationApproved: boolean,
  amendmentDetected: boolean,
  requirements: LifecycleWorkspace["requirements"],
): LifecycleWorkspace["bidTasks"] {
  const planUnlocked = selected && qualificationApproved;
  return [
    {
      id: "task-price",
      title: "Complete commercial workbook",
      agent: "bid_agent",
      status: planUnlocked ? "complete" : "blocked",
      requirementIds: ["req-price-template"],
      dependsOn: [],
      humanOwner: "Pricing lead",
      reopenedByChangeId: null,
    },
    {
      id: "task-technical-response",
      title: amendmentDetected
        ? "Update technical response for amendment v2"
        : "Complete technical response",
      agent: "bid_agent",
      status: !planUnlocked
        ? "blocked"
        : amendmentDetected
          ? "in_progress"
          : "complete",
      requirementIds: ["req-delivery", "req-warranty"],
      dependsOn: ["approval-qualification"],
      humanOwner: "Product lead",
      reopenedByChangeId: amendmentDetected
        ? "change-delivery-window"
        : null,
    },
    {
      id: "task-delivery-confirmation",
      title: amendmentDetected
        ? "Reconfirm 10-day delivery capacity"
        : "Confirm 15-day delivery capacity",
      agent: "requirements_agent",
      status: !planUnlocked
        ? "blocked"
        : amendmentDetected
          ? "blocked"
          : "complete",
      requirementIds: ["req-delivery"],
      dependsOn: ["task-technical-response"],
      humanOwner: "Operations lead",
      reopenedByChangeId: amendmentDetected
        ? "change-delivery-window"
        : null,
    },
    {
      id: "task-certificate-review",
      title: "Validate CE certificate scope",
      agent: "compliance_agent",
      status: planUnlocked ? "needs_review" : "blocked",
      requirementIds: ["req-ce-certificate"],
      dependsOn: [],
      humanOwner: "Quality lead",
      reopenedByChangeId: null,
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
      reopenedByChangeId: null,
    },
  ];
}

function buildStages(
  selected: boolean,
  qualificationApproved: boolean,
  amendmentDetected: boolean,
): LifecycleWorkspace["stages"] {
  return [
    {
      id: "discovery",
      label: "Discovery",
      agent: "opportunity_agent",
      status: selected ? "complete" : "active",
      summary: selected
        ? "The recommended opportunity was selected by the bidder."
        : "Three opportunities ranked; one is recommended for selection.",
      metric: selected ? "1 selected" : "3 ranked",
      evidenceIds: ["evidence-opportunity-notice"],
      requiresApproval: null,
    },
    {
      id: "qualification",
      label: "Qualification",
      agent: "qualification_agent",
      status: !selected
        ? "not_started"
        : qualificationApproved
          ? "complete"
          : "needs_review",
      summary: qualificationApproved
        ? "Fit and capacity assumptions approved by the bid manager."
        : selected
          ? "Fit score is ready; a human must authorize bid investment."
          : "Qualification begins after opportunity selection.",
      metric: "84 / 100",
      evidenceIds: ["evidence-opportunity-notice", "evidence-capability-pack"],
      requiresApproval: "qualification",
    },
    {
      id: "requirements",
      label: "Requirements",
      agent: "requirements_agent",
      status: qualificationApproved ? "active" : "not_started",
      summary: "Every current requirement is partitioned by readiness state.",
      metric: amendmentDetected ? "3 / 5 covered" : "4 / 5 covered",
      evidenceIds: amendmentDetected
        ? [
            "evidence-requirements-v1",
            "evidence-requirements-v2",
            "evidence-capability-pack",
          ]
        : ["evidence-requirements-v1", "evidence-capability-pack"],
      requiresApproval: null,
    },
    {
      id: "bid_preparation",
      label: "Bid plan",
      agent: "bid_agent",
      status: qualificationApproved ? "active" : "blocked",
      summary: qualificationApproved
        ? amendmentDetected
          ? "Affected tasks were reopened by amendment v2."
          : "The dependency-aware response plan is active."
        : "Tasks are proposed but cannot start before qualification approval.",
      metric: !qualificationApproved
        ? "Locked"
        : amendmentDetected
          ? "2 replanned"
          : "3 / 5 complete",
      evidenceIds: [
        amendmentDetected
          ? "evidence-requirements-v2"
          : "evidence-requirements-v1",
      ],
      requiresApproval: null,
    },
    {
      id: "compliance",
      label: "Compliance",
      agent: "compliance_agent",
      status: "blocked",
      summary: amendmentDetected
        ? "Delivery capacity and certificate scope remain unresolved."
        : "Certificate scope remains unresolved.",
      metric: amendmentDetected ? "2 blockers" : "1 blocker",
      evidenceIds: [
        amendmentDetected
          ? "evidence-requirements-v2"
          : "evidence-requirements-v1",
        "evidence-capability-pack",
      ],
      requiresApproval: "compliance",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      agent: "monitoring_agent",
      status: qualificationApproved ? "active" : "not_started",
      summary: amendmentDetected
        ? "Amendment v2 changed delivery and triggered a bounded replan."
        : "No later publication has been admitted into the workspace.",
      metric: amendmentDetected ? "1 change" : "Watching",
      evidenceIds: amendmentDetected
        ? ["evidence-requirements-v1", "evidence-requirements-v2"]
        : ["evidence-requirements-v1"],
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
      passed:
        (changed.length === 0 && workspace.changes.length === 0) ||
        (changed.length > 0 && validChangePartitions),
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
  selectedOpportunityId?: "opportunity-clinic-supplies" | null;
  observedChangeIds?: "change-delivery-window"[];
  approvals?: LifecycleApprovalId[];
}): LifecycleWorkspace {
  const request = LifecycleRunRequestSchema.parse(input);
  const selected =
    request.selectedOpportunityId === "opportunity-clinic-supplies";
  const amendmentDetected = request.observedChangeIds.includes(
    "change-delivery-window",
  );
  const approved = new Set(request.approvals);
  const qualificationApproved =
    selected && approved.has("qualification");
  const evidence = buildEvidence(amendmentDetected);
  const requirements = buildRequirements(amendmentDetected);
  const now = new Date().toISOString();

  const withoutValidation: Omit<LifecycleWorkspace, "validationResults"> = {
    contractVersion: "tender-lifecycle.v1",
    workspaceId: request.workspaceId,
    generatedAt: now,
    dataStatus: "synthetic",
    selectedOpportunityId: selected
      ? "opportunity-clinic-supplies"
      : null,
    opportunity: {
      title: "Regional clinic diagnostic supplies",
      buyer: "Regional Health Network",
      jurisdiction: "CL",
      procedureId: "CL-BID-DEMO-2026-01",
      deadline: "2026-07-27T21:00:00.000Z",
      lifecycleState: !selected
        ? "discovered"
        : qualificationApproved
          ? "bid_in_preparation"
          : "qualification_pending",
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
    bidTasks: bidTasks(
      selected,
      qualificationApproved,
      amendmentDetected,
      requirements,
    ),
    stages: buildStages(
      selected,
      qualificationApproved,
      amendmentDetected,
    ),
    changes: amendmentDetected
      ? [
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
        ]
      : [],
    approvals: [
      {
        id: "qualification",
        label: "Authorize bid investment",
        status: qualificationApproved
          ? "approved"
          : selected
            ? "ready"
            : "blocked",
        reason: qualificationApproved
          ? "The bid manager approved the bounded qualification result."
          : selected
            ? "An 84/100 fit score cannot allocate team capacity without approval."
            : "Select the recommended opportunity before authorizing investment.",
        approvedBy: qualificationApproved ? "Bid manager" : null,
        approvedAt: qualificationApproved ? now : null,
      },
      {
        id: "compliance",
        label: "Approve compliance package",
        status: "blocked",
        reason: amendmentDetected
          ? "Delivery capacity and certificate scope remain unresolved."
          : "Certificate scope remains unresolved.",
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
    nextAction: !selected
      ? "Select the recommended opportunity to open a controlled qualification."
      : !qualificationApproved
        ? "A bid manager must approve qualification before preparation can proceed."
        : amendmentDetected
          ? "Resolve the delivery and certificate blockers before compliance review."
          : "Monitor publications while the team resolves the certificate review.",
    submissionAuthority: "human_only",
  };

  return LifecycleWorkspaceSchema.parse({
    ...withoutValidation,
    validationResults: validateLifecycleWorkspace(withoutValidation),
  });
}
