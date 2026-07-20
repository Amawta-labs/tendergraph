"use client";

import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  ListChecks,
  LoaderCircle,
  Radar,
  RefreshCw,
  Send,
  ShieldCheck,
  Target,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  LifecycleApprovalId,
  LifecycleWorkspace,
} from "@/lib/lifecycle/schemas";

type LifecycleTab =
  | "opportunities"
  | "requirements"
  | "bid_plan"
  | "compliance"
  | "monitoring";

const stageIcons = {
  discovery: FileSearch,
  qualification: Target,
  requirements: ListChecks,
  bid_preparation: Bot,
  compliance: ClipboardCheck,
  monitoring: Radar,
  outcome: ShieldCheck,
};

const statusLabels = {
  complete: "Complete",
  active: "Active",
  needs_review: "Review",
  blocked: "Blocked",
  not_started: "Queued",
};

export function LifecycleConsole({
  initialWorkspace,
}: {
  initialWorkspace: LifecycleWorkspace;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [tab, setTab] = useState<LifecycleTab>("opportunities");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const approvedIds = useMemo(
    () =>
      workspace.approvals
        .filter((approval) => approval.status === "approved")
        .map((approval) => approval.id),
    [workspace.approvals],
  );
  const passedGates = workspace.validationResults.filter(
    (gate) => gate.passed,
  ).length;
  const coveredRequirements = workspace.requirements.filter(
    (requirement) => requirement.status === "covered",
  ).length;
  const qualification = workspace.approvals.find(
    (approval) => approval.id === "qualification",
  );

  async function runLifecycle(approval?: LifecycleApprovalId) {
    setRunning(true);
    setError("");
    try {
      const approvals = approval
        ? [...new Set([...approvedIds, approval])]
        : approvedIds;
      const response = await fetch("/api/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.workspaceId,
          approvals,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Lifecycle run failed");
      }
      setWorkspace(body as LifecycleWorkspace);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lifecycle run failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="lifecycle-console" aria-label="Agentic bid lifecycle">
      <div className="lifecycle-topbar">
        <div className="lifecycle-title">
          <span><Bot size={19} /></span>
          <div>
            <div className="lifecycle-eyebrow">
              Agentic bid workspace
              <i>Synthetic active-bid benchmark</i>
            </div>
            <h2>{workspace.opportunity.title}</h2>
            <p>
              {workspace.opportunity.jurisdiction} /{" "}
              {workspace.opportunity.procedureId}
              <span>Due Jul 27</span>
            </p>
          </div>
        </div>
        <button
          className="lifecycle-refresh"
          type="button"
          title="Refresh agent plan"
          aria-label="Refresh agent plan"
          disabled={running}
          onClick={() => void runLifecycle()}
        >
          {running ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <RefreshCw size={17} />
          )}
        </button>
      </div>

      <div className="lifecycle-metrics">
        <div>
          <span>Opportunity fit</span>
          <strong>{workspace.opportunity.fitScore}/100</strong>
        </div>
        <div>
          <span>Requirements covered</span>
          <strong>{coveredRequirements}/{workspace.requirements.length}</strong>
        </div>
        <div>
          <span>Detected changes</span>
          <strong>{workspace.changes.length}</strong>
        </div>
        <div>
          <span>Contract gates</span>
          <strong>{passedGates}/{workspace.validationResults.length}</strong>
        </div>
      </div>

      <div className="lifecycle-stage-rail">
        {workspace.stages.map((stage) => {
          const Icon = stageIcons[stage.id];
          return (
            <div className={`lifecycle-stage ${stage.status}`} key={stage.id}>
              <span className="stage-icon"><Icon size={16} /></span>
              <div>
                <strong>{stage.label}</strong>
                <small>{stage.metric}</small>
              </div>
              <b>{statusLabels[stage.status]}</b>
            </div>
          );
        })}
      </div>

      <div className="lifecycle-command-row">
        <div>
          {qualification?.status === "approved" ? (
            <CheckCircle2 size={18} />
          ) : (
            <UserCheck size={18} />
          )}
          <span>
            <strong>
              {qualification?.status === "approved"
                ? "Qualification approved"
                : "Human gate ready"}
            </strong>
            {qualification?.reason}
          </span>
        </div>
        {qualification?.status !== "approved" && (
          <button
            type="button"
            disabled={running}
            onClick={() => void runLifecycle("qualification")}
          >
            Approve qualification
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      <div className="lifecycle-tabs" role="tablist" aria-label="Bid workspace views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "opportunities"}
          className={tab === "opportunities" ? "selected" : ""}
          onClick={() => setTab("opportunities")}
        >
          Opportunities
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "requirements"}
          className={tab === "requirements" ? "selected" : ""}
          onClick={() => setTab("requirements")}
        >
          Requirements
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "compliance"}
          className={tab === "compliance" ? "selected" : ""}
          onClick={() => setTab("compliance")}
        >
          Compliance
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "bid_plan"}
          className={tab === "bid_plan" ? "selected" : ""}
          onClick={() => setTab("bid_plan")}
        >
          Bid plan
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "monitoring"}
          className={tab === "monitoring" ? "selected" : ""}
          onClick={() => setTab("monitoring")}
        >
          Monitoring
        </button>
      </div>

      {tab === "opportunities" && (
        <div className="lifecycle-table">
          {workspace.opportunityMatches.map((opportunity) => (
            <div className="lifecycle-row opportunity-row" key={opportunity.id}>
              <span className={`opportunity-fit ${opportunity.status}`}>
                {opportunity.fitScore}
              </span>
              <div>
                <strong>{opportunity.title}</strong>
                <small>{opportunity.matchReason}</small>
              </div>
              <span>
                {opportunity.jurisdiction} /{" "}
                {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <b>{opportunity.status}</b>
            </div>
          ))}
        </div>
      )}

      {tab === "requirements" && (
        <div className="lifecycle-table">
          {workspace.requirements.map((requirement) => (
            <div className="lifecycle-row" key={requirement.id}>
              <span className={`requirement-status ${requirement.status}`}>
                {requirement.status === "covered" ? (
                  <Check size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
              </span>
              <div>
                <strong>{requirement.title}</strong>
                <small>{requirement.currentValue}</small>
                {requirement.previousValue && (
                  <em>
                    Was {requirement.previousValue}
                    <ArrowRight size={12} />
                    Now {requirement.currentValue}
                  </em>
                )}
              </div>
              <span>{requirement.owner}</span>
              <b>{requirement.status.replaceAll("_", " ")}</b>
            </div>
          ))}
        </div>
      )}

      {tab === "bid_plan" && (
        <div className="lifecycle-table">
          {workspace.bidTasks.map((task) => (
            <div className="lifecycle-row task-row" key={task.id}>
              <span className={`task-status ${task.status}`}>
                {task.status === "complete" ? (
                  <Check size={15} />
                ) : task.status === "in_progress" ? (
                  <Bot size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
              </span>
              <div>
                <strong>{task.title}</strong>
                <small>
                  {task.agent.replaceAll("_", " ")}
                  {task.dependsOn.length > 0
                    ? ` / ${task.dependsOn.length} dependencies`
                    : " / ready"}
                </small>
              </div>
              <span>{task.humanOwner ?? "Agent owned"}</span>
              <b>{task.status.replaceAll("_", " ")}</b>
            </div>
          ))}
        </div>
      )}

      {tab === "compliance" && (
        <div className="compliance-view">
          {workspace.requirements
            .filter((requirement) => requirement.blocker)
            .map((requirement) => (
              <div className="compliance-blocker" key={requirement.id}>
                <span><AlertTriangle size={17} /></span>
                <div>
                  <strong>{requirement.title}</strong>
                  <p>{requirement.currentValue}</p>
                </div>
                <b>{requirement.status.replaceAll("_", " ")}</b>
              </div>
            ))}
          <div className="compliance-decision">
            <ShieldCheck size={18} />
            <span>
              <strong>Compliance approval blocked</strong>
              The package cannot advance until both blockers are resolved and
              reviewed by their named owners.
            </span>
          </div>
        </div>
      )}

      {tab === "monitoring" && (
        <div className="monitoring-view">
          {workspace.changes.map((change) => (
            <div className="monitoring-change" key={change.id}>
              <span><Radar size={19} /></span>
              <div>
                <strong>{change.title}</strong>
                <p>
                  {change.affectedRequirementIds.length} requirement changed;{" "}
                  {change.unchangedRequirementIds.length} remain valid.
                </p>
              </div>
              <b>Shadow replan</b>
            </div>
          ))}
          <div className="monitoring-authority">
            <ShieldCheck size={17} />
            <span>
              <strong>Submission authority remains human-only</strong>
              Agents can discover, qualify, plan, check and monitor. They cannot
              release the bid.
            </span>
          </div>
        </div>
      )}

      <div className="lifecycle-next-action">
        <span><Send size={16} /></span>
        <p>
          <strong>Next controlled action</strong>
          {workspace.nextAction}
        </p>
      </div>

      {error && <div className="lifecycle-error">{error}</div>}
    </section>
  );
}
