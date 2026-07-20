"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleMinus,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  GitBranch,
  History,
  Inbox,
  LoaderCircle,
  LockKeyhole,
  Menu,
  Paperclip,
  PanelRight,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { LifecycleConsole } from "@/components/lifecycle-console";
import type {
  CaseFixture,
  CompositionResult,
  DocumentIngestionResult,
  EvidenceDeltaResult,
  EvidenceRecord,
  ImpactDiscoveryResult,
  SourceManifest,
} from "@/lib/harness/schemas";
import type { LifecycleWorkspace } from "@/lib/lifecycle/schemas";
import { redactSubmissionText } from "@/lib/submission-redaction";

type RuntimeMode = "codex" | "api" | "fallback";
type InspectorTab = "operations" | "evidence" | "changes" | "trace";

interface RuntimeCapabilities {
  apiConfigured: boolean;
  apiModel: string;
  hosted: boolean;
}

interface WorkbenchProps {
  fixtures: CaseFixture[];
  initialFixtureId: string;
  initialResult: CompositionResult;
  evidenceDeltas: EvidenceDeltaResult[];
  publicPresentation: boolean;
  runtimeCapabilities: RuntimeCapabilities;
  initialLifecycle: LifecycleWorkspace;
  initialLifecycleFocus: boolean;
}

const questions: Record<string, string> = {
  "cl-real-5802381-7547UCUK": "Who was recommended for award, and why?",
  "cl-correction-demo": "Who won after the correction, and why?",
  "cl-deep-demo": "Who won Lot 1, and why?",
  "eu-portability-demo": "Who won the EU lot?",
  "uk-portability-demo": "What was the UK award price?",
};

const shortNames: Record<string, string> = {
  "cl-real-5802381-7547UCUK": "Office furniture evaluation",
  "cl-correction-demo": "Award correction review",
  "cl-deep-demo": "Medical supplies award",
  "eu-portability-demo": "EU services notice",
  "uk-portability-demo": "UK facilities award",
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function runtimeResultLabel(result: CompositionResult) {
  if (result.trace.compositionSurface === "codex") return "GPT-5.6 via Codex";
  if (result.trace.compositionSurface === "openai_responses_api") {
    return "GPT-5.6 via Responses API";
  }
  return "Validated deterministic fallback";
}

function sourceForEvidence(
  evidence: EvidenceRecord | undefined,
  manifests: SourceManifest[],
) {
  return manifests.find((manifest) => manifest.id === evidence?.sourceManifestId);
}

function AnswerIcon({ heading }: { heading: string }) {
  const normalized = heading.toLowerCase();
  if (normalized.includes("award") || normalized.includes("winner")) {
    return <Trophy size={17} />;
  }
  if (normalized.includes("loss") || normalized.includes("reject")) {
    return <CircleMinus size={17} />;
  }
  return <BarChart3 size={17} />;
}

export function Workbench({
  fixtures,
  initialFixtureId,
  initialResult,
  evidenceDeltas,
  publicPresentation,
  runtimeCapabilities,
  initialLifecycle,
  initialLifecycleFocus,
}: WorkbenchProps) {
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [fixtureId, setFixtureId] = useState(initialFixtureId);
  const [question, setQuestion] = useState(questions[initialFixtureId]);
  const [submittedQuestion, setSubmittedQuestion] = useState(
    questions[initialFixtureId],
  );
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>("codex");
  const [result, setResult] = useState(initialResult);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(
    initialResult.readerOutput.sections[0]?.evidenceIds[0] ?? "",
  );
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("operations");
  const [lifecycleFocus, setLifecycleFocus] = useState(initialLifecycleFocus);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [runtimeWarning, setRuntimeWarning] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [ingestion, setIngestion] = useState<DocumentIngestionResult | null>(null);
  const [impactRunning, setImpactRunning] = useState(false);
  const [impact, setImpact] = useState<ImpactDiscoveryResult | null>(null);
  const [pipelineError, setPipelineError] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);

  const fixture = useMemo(
    () => fixtures.find((item) => item.id === fixtureId) ?? fixtures[0],
    [fixtureId, fixtures],
  );
  const activeDelta =
    evidenceDeltas.find(
      (delta) => delta.event.procedureId === fixture.scope.procedureId,
    ) ?? null;
  const availableEvidence = useMemo(
    () => [...fixture.evidence, ...(ingestion?.evidence ?? [])],
    [fixture.evidence, ingestion],
  );
  const availableManifests = useMemo(
    () => [
      ...fixture.manifests,
      ...(ingestion ? [ingestion.sourceManifest] : []),
    ],
    [fixture.manifests, ingestion],
  );
  const selectedEvidence =
    availableEvidence.find((item) => item.id === selectedEvidenceId) ??
    availableEvidence[0];
  const selectedManifest = sourceForEvidence(
    selectedEvidence,
    availableManifests,
  );
  const selectedEvidenceIndex = Math.max(
    0,
    availableEvidence.findIndex((item) => item.id === selectedEvidence?.id),
  );
  const passedGates = result.trace.validationResults.filter(
    (gate) => gate.passed,
  ).length;
  const reviewCount =
    (impact?.items.length ?? activeDelta?.affectedClaimIds.length ?? 0) +
    result.readerOutput.gaps.length;
  const displayText = publicPresentation
    ? redactSubmissionText
    : (text: string) => text;

  function openInspector(tab: InspectorTab) {
    setInspectorTab(tab);
    setInspectorOpen(true);
  }

  function selectEvidence(evidenceId: string) {
    setSelectedEvidenceId(evidenceId);
    openInspector("evidence");
  }

  function changeFixture(nextId: string) {
    const nextQuestion = questions[nextId];
    setFixtureId(nextId);
    setQuestion(nextQuestion);
    setSubmittedQuestion(nextQuestion);
    setSelectedEvidenceId("");
    setSidebarOpen(false);
    setUploadFile(null);
    setCanonicalUrl("");
    setIngestion(null);
    setImpact(null);
    setError("");
    setPipelineError("");
    setLifecycleFocus(false);
    setInspectorTab("evidence");
    void executeAudit(nextId, nextQuestion, "fallback");
  }

  async function executeAudit(
    targetFixtureId: string,
    targetQuestion: string,
    targetMode: RuntimeMode,
  ) {
    setRunning(true);
    setError("");
    setRuntimeWarning("");
    setSubmittedQuestion(targetQuestion);
    try {
      const response = await fetch(
        targetMode === "codex" ? "/api/codex-run" : "/api/harness",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fixtureId: targetFixtureId,
            question: targetQuestion,
            ...(targetMode === "fallback"
              ? { mode: "fallback" }
              : targetMode === "api"
                ? { mode: "auto" }
                : {}),
          }),
        },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Harness request failed");
      const nextResult = body as CompositionResult & { runtimeWarning?: string };
      setResult(nextResult);
      setRuntimeWarning(nextResult.runtimeWarning ?? "");
      setSelectedEvidenceId(
        nextResult.readerOutput.sections[0]?.evidenceIds[0] ?? "",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Harness request failed");
    } finally {
      setRunning(false);
    }
  }

  function runAudit() {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3 || running) return;
    void executeAudit(fixtureId, trimmedQuestion, runtimeMode);
  }

  async function uploadEvidence() {
    if (!uploadFile) return;
    setUploading(true);
    setPipelineError("");
    setImpact(null);
    try {
      const form = new FormData();
      form.set("file", uploadFile);
      form.set("jurisdiction", fixture.scope.jurisdiction);
      form.set("procedureId", fixture.scope.procedureId);
      if (fixture.scope.lotId) form.set("lotId", fixture.scope.lotId);
      form.set("artifactType", "procurement_document");
      if (canonicalUrl.trim()) form.set("canonicalUrl", canonicalUrl.trim());
      const response = await fetch("/api/ingest", {
        method: "POST",
        body: form,
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Document ingestion failed");
      }
      const nextIngestion = body as DocumentIngestionResult;
      setIngestion(nextIngestion);
      setSelectedEvidenceId(nextIngestion.evidence[0]?.id ?? "");
      openInspector("evidence");
    } catch (cause) {
      setPipelineError(
        cause instanceof Error ? cause.message : "Document ingestion failed",
      );
    } finally {
      setUploading(false);
    }
  }

  async function discoverImpact(source: "event" | "document") {
    if (source === "event" && !activeDelta) return;
    if (source === "document" && !ingestion) return;
    setImpactRunning(true);
    setPipelineError("");
    try {
      const response = await fetch("/api/impact-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId,
          ...(source === "event"
            ? { eventId: activeDelta?.event.id }
            : { document: ingestion }),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Impact discovery failed");
      }
      setImpact(body as ImpactDiscoveryResult);
      openInspector("changes");
    } catch (cause) {
      setPipelineError(
        cause instanceof Error ? cause.message : "Impact discovery failed",
      );
    } finally {
      setImpactRunning(false);
    }
  }

  function moveEvidence(direction: -1 | 1) {
    const nextIndex =
      (selectedEvidenceIndex + direction + availableEvidence.length) %
      availableEvidence.length;
    setSelectedEvidenceId(availableEvidence[nextIndex]?.id ?? "");
  }

  async function copyHash() {
    if (!selectedEvidence) return;
    await navigator.clipboard.writeText(selectedEvidence.contentHash);
    setCopiedHash(true);
    window.setTimeout(() => setCopiedHash(false), 1200);
  }

  const runtimeStatus =
    runtimeMode === "api"
      ? runtimeCapabilities.apiConfigured
        ? `${runtimeCapabilities.apiModel} configured`
        : "API not configured; safe fallback remains available"
      : runtimeMode === "codex"
        ? runtimeCapabilities.hosted
          ? "Local Codex login required for a live run"
          : "Uses the authenticated local Codex session"
        : "No model or credential required";

  return (
    <div className="chat-shell">
      <button
        className="mobile-nav-button"
        type="button"
        title="Open tender list"
        aria-label="Open tender list"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {sidebarOpen && (
        <button
          className="mobile-scrim"
          type="button"
          aria-label="Close tender list"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`tender-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><GitBranch size={21} /></span>
          <strong>TenderGraph</strong>
          <button
            className="sidebar-close"
            type="button"
            title="Close tender list"
            aria-label="Close tender list"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <button
          className="new-analysis"
          type="button"
          onClick={() => {
            setSidebarOpen(false);
            setLifecycleFocus(true);
            setInspectorTab("operations");
          }}
        >
          <Plus size={17} />
          New bid workspace
        </button>

        <div className="sidebar-section-label">Recent tenders</div>
        <nav className="tender-list" aria-label="Tender cases">
          {fixtures.map((item) => (
            <button
              type="button"
              className={
                !lifecycleFocus && item.id === fixtureId
                  ? "tender-item selected"
                  : "tender-item"
              }
              key={item.id}
              onClick={() => changeFixture(item.id)}
            >
              <FileText size={18} />
              <span>
                <strong>{displayText(shortNames[item.id] ?? item.name)}</strong>
                <small>
                  {item.scope.jurisdiction} / {item.scope.procedureId}
                </small>
              </span>
              {!lifecycleFocus && item.id === fixtureId && (
                <i aria-label="Current tender" />
              )}
            </button>
          ))}
        </nav>

        <div className="review-queue-link">
          <span><Inbox size={17} /></span>
          <div>
            <strong>Review queue</strong>
            <small>Items awaiting human review</small>
          </div>
          <b>{lifecycleFocus ? 3 : reviewCount}</b>
        </div>

        <div className="sidebar-footer">
          <div>
            <span><ShieldCheck size={17} /></span>
            <p>
              <strong>Golden corpus</strong>
              <small>{fixtures.length} verified cases</small>
            </p>
          </div>
          <button type="button" title="Runtime settings" aria-label="Runtime settings">
            <Settings size={18} />
          </button>
        </div>
      </aside>

      <main className="conversation-column">
        <header className="conversation-header">
          <div>
            <h1>
              {lifecycleFocus
                ? "Agentic tender operations"
                : displayText(shortNames[fixture.id] ?? fixture.name)}
            </h1>
            {lifecycleFocus ? (
              <p>
                CL
                <span>/</span>
                CL-BID-DEMO-2026-01
                <span>/</span>
                Bid in preparation
              </p>
            ) : (
              <p>
                {fixture.scope.jurisdiction}
                <span>/</span>
                {fixture.scope.procedureId}
                {fixture.scope.lotId && <><span>/</span>{fixture.scope.lotId}</>}
              </p>
            )}
          </div>
          <div className="verified-state">
            <ShieldCheck size={15} />
            {lifecycleFocus
              ? "6/6 lifecycle gates"
              : fixture.dataStatus === "public_snapshot"
                ? "Evidence verified"
                : "Benchmark verified"}
          </div>
          <button
            className="mobile-inspector-button"
            type="button"
            title="Open inspector"
            aria-label="Open inspector"
            onClick={() => setInspectorOpen(true)}
          >
            <PanelRight size={20} />
          </button>
        </header>

        <div className="conversation-scroll">
          {lifecycleFocus && (
            <LifecycleConsole initialWorkspace={initialLifecycle} />
          )}

          {!lifecycleFocus && (
          <><section className="message user-message" aria-label="Your question">
            <div className="message-avatar user-avatar"><UserRound size={17} /></div>
            <div className="message-content">
              <div className="message-byline">
                <strong>You</strong>
                <span>current analysis</span>
              </div>
              <p>{submittedQuestion}</p>
            </div>
          </section>

          <section className="message assistant-message" aria-label="TenderGraph answer">
            <div className="message-avatar assistant-avatar"><GitBranch size={18} /></div>
            <div className="message-content">
              <div className="message-byline">
                <strong>TenderGraph</strong>
                <span className="ai-label">AI</span>
                <span>{runtimeResultLabel(result)}</span>
              </div>
              <div className="answer-heading">
                <ShieldCheck size={20} />
                <h2>{displayText(result.readerOutput.title)}</h2>
              </div>
              <p className="answer-summary">{displayText(result.readerOutput.summary)}</p>

              <div className="claim-list">
                {result.readerOutput.sections.map((section) => (
                  <button
                    type="button"
                    className="claim-row"
                    key={`${section.heading}-${section.claimIds[0]}`}
                    onClick={() => selectEvidence(section.evidenceIds[0])}
                  >
                    <span className="claim-icon"><AnswerIcon heading={section.heading} /></span>
                    <span>
                      <strong>{displayText(section.heading)}</strong>
                      <small>{displayText(section.body)}</small>
                    </span>
                    <span className="claim-validation">
                      <CheckCircle2 size={15} />
                      Verified
                    </span>
                    <span className="citation-count">
                      {section.evidenceIds.length} citation
                      {section.evidenceIds.length === 1 ? "" : "s"}
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>

              {result.readerOutput.gaps.length > 0 && (
                <div className="review-notice">
                  <AlertTriangle size={17} />
                  <span>
                    <strong>Human review required</strong>
                    {displayText(result.readerOutput.gaps.join(" "))}
                  </span>
                </div>
              )}
            </div>
          </section>

          {ingestion && (
            <section className="message event-message" aria-label="Uploaded evidence">
              <div className="message-avatar event-avatar"><Paperclip size={18} /></div>
              <div className="message-content">
                <div className="message-byline">
                  <strong>You</strong>
                  <span>uploaded evidence</span>
                </div>
                <button
                  type="button"
                  className="file-event"
                  onClick={() => selectEvidence(ingestion.evidence[0]?.id ?? "")}
                >
                  <FileCheck2 size={20} />
                  <span>
                    <strong>{ingestion.file.name}</strong>
                    <small>
                      {ingestion.format.toUpperCase()} / {ingestion.evidence.length} evidence anchors
                    </small>
                  </span>
                  <CheckCircle2 size={17} />
                </button>
              </div>
            </section>
          )}

          {activeDelta && (
            <section className="message assistant-message change-message" aria-label="Evidence change">
              <div className="message-avatar change-avatar"><GitBranch size={18} /></div>
              <div className="message-content">
                <div className="message-byline">
                  <strong>TenderGraph</strong>
                  <span className="ai-label">AI</span>
                  <span>incremental reevaluation</span>
                </div>
                <div className="change-title">
                  <AlertTriangle size={19} />
                  <h2>{displayText(activeDelta.event.title)}</h2>
                </div>
                <p className="change-description">
                  {displayText(activeDelta.event.description)}
                </p>
                <div className="change-summary">
                  <div>
                    <span>Before</span>
                    <strong>
                      {displayText(
                        fixture.claims.find((claim) =>
                          activeDelta.event.affectedClaims.some(
                            (change) =>
                              ("previousClaimId" in change
                                ? change.previousClaimId
                                : change.claimId) === claim.id,
                          ),
                        )?.statement ?? "Prior decision state",
                      )}
                    </strong>
                  </div>
                  <span className="change-arrow"><ArrowRight size={18} /></span>
                  <div>
                    <span>After</span>
                    <strong>
                      {displayText(
                        fixture.claims.find((claim) =>
                          activeDelta.event.affectedClaims.some(
                            (change) => change.claimId === claim.id,
                          ),
                        )?.statement ?? "Updated evidence state",
                      )}
                    </strong>
                  </div>
                </div>
                <div className="change-footer">
                  <span>
                    <AlertTriangle size={15} />
                    {activeDelta.affectedClaimIds.length} affected
                  </span>
                  <span>
                    <ShieldCheck size={15} />
                    {activeDelta.unchangedClaimIds.length} unchanged
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvidenceId(activeDelta.addedEvidenceIds[0]);
                      openInspector("changes");
                    }}
                  >
                    Review proposal
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {impact && (
            <section className="message assistant-message impact-message" aria-label="Impact proposal">
              <div className="message-avatar assistant-avatar"><Sparkles size={18} /></div>
              <div className="message-content">
                <div className="message-byline">
                  <strong>TenderGraph</strong>
                  <span className="ai-label">AI</span>
                  <span>{impact.compositionSurface === "codex" ? "Codex impact discovery" : "validated fallback"}</span>
                </div>
                <div className="answer-heading">
                  <LockKeyhole size={19} />
                  <h2>{impact.items.length} claim changes proposed in shadow mode</h2>
                </div>
                <p className="answer-summary">
                  Every active claim was classified. No authority or decision state
                  changed automatically.
                </p>
                <button
                  type="button"
                  className="review-proposal-button"
                  onClick={() => openInspector("changes")}
                >
                  Review {impact.items.length} proposal{impact.items.length === 1 ? "" : "s"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          )}

          {(error || runtimeWarning || pipelineError) && (
            <div className={error || pipelineError ? "inline-status error" : "inline-status"}>
              <AlertTriangle size={16} />
              <span>
                {error ||
                  pipelineError ||
                  `Codex was unavailable. ${runtimeWarning} The validated fallback completed the run.`}
              </span>
            </div>
          )}
          </>
          )}
        </div>

        {!lifecycleFocus && <div className="composer-area">
          {uploadFile && (
            <div className="attachment-tray">
              <FileText size={19} />
              <div>
                <strong>{uploadFile.name}</strong>
                <small>{Math.max(1, Math.round(uploadFile.size / 1024))} KB</small>
              </div>
              <input
                aria-label="Canonical source URL"
                placeholder="Canonical source URL"
                value={canonicalUrl}
                onChange={(event) => setCanonicalUrl(event.target.value)}
              />
              {!ingestion ? (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => void uploadEvidence()}
                >
                  {uploading ? <LoaderCircle className="spin" size={15} /> : <Upload size={15} />}
                  {uploading ? "Extracting" : "Extract evidence"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={impactRunning || ingestion.status !== "extracted"}
                  onClick={() => void discoverImpact("document")}
                >
                  {impactRunning ? <LoaderCircle className="spin" size={15} /> : <Sparkles size={15} />}
                  Analyze impact
                </button>
              )}
              <button
                className="icon-button"
                type="button"
                title="Remove attachment"
                aria-label="Remove attachment"
                onClick={() => {
                  setUploadFile(null);
                  setCanonicalUrl("");
                  setIngestion(null);
                  setImpact(null);
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="composer">
            <label className="attach-button" title="Attach procurement evidence">
              <Paperclip size={19} />
              <span className="visually-hidden">Attach procurement evidence</span>
              <input
                type="file"
                accept=".pdf,.docx,.html,.htm,.json,.csv,.md,.txt,image/*"
                onChange={(event) => {
                  setUploadFile(event.target.files?.[0] ?? null);
                  setIngestion(null);
                  setImpact(null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <textarea
              ref={composerRef}
              aria-label="Ask about this tender"
              rows={1}
              value={question}
              placeholder="Ask about this tender or attach new evidence..."
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  runAudit();
                }
              }}
            />
            <button
              className="send-button"
              type="button"
              title="Run analysis"
              aria-label="Run analysis"
              disabled={running || question.trim().length < 3}
              onClick={runAudit}
            >
              {running ? <LoaderCircle className="spin" size={19} /> : <Send size={19} />}
            </button>
          </div>

          <div className="composer-meta">
            <div className="runtime-select-wrap">
              {runtimeMode === "codex" ? (
                <Bot size={14} />
              ) : runtimeMode === "api" ? (
                <Sparkles size={14} />
              ) : (
                <ShieldCheck size={14} />
              )}
              <select
                aria-label="Analysis runtime"
                value={runtimeMode}
                onChange={(event) => setRuntimeMode(event.target.value as RuntimeMode)}
              >
                <option value="codex">Codex</option>
                <option value="api">OpenAI API</option>
                <option value="fallback">Safe fallback</option>
              </select>
            </div>
            <span>{runtimeStatus}</span>
            {activeDelta && !impact && (
              <button
                type="button"
                disabled={impactRunning}
                onClick={() => void discoverImpact("event")}
              >
                {impactRunning ? <LoaderCircle className="spin" size={13} /> : <Sparkles size={13} />}
                Analyze verified update
              </button>
            )}
          </div>
        </div>}
      </main>

      {inspectorOpen && (
        <button
          className="mobile-scrim inspector-scrim"
          type="button"
          aria-label="Close inspector"
          onClick={() => setInspectorOpen(false)}
        />
      )}

      <aside className={`inspector ${inspectorOpen ? "mobile-open" : ""}`}>
        <div className="inspector-tabs" role="tablist" aria-label="Analysis inspector">
          {(
            lifecycleFocus
              ? (["operations"] as InspectorTab[])
              : (["evidence", "changes", "trace"] as InspectorTab[])
          ).map((tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === tab}
              className={inspectorTab === tab ? "selected" : ""}
              key={tab}
              onClick={() => setInspectorTab(tab)}
            >
              {tab === "operations"
                ? "Operating contract"
                : tab === "evidence"
                  ? "Evidence"
                  : tab === "changes"
                    ? "Changes"
                    : "Trace"}
            </button>
          ))}
          <button
            className="inspector-close"
            type="button"
            title="Close inspector"
            aria-label="Close inspector"
            onClick={() => setInspectorOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {inspectorTab === "operations" && (
          <div className="inspector-body">
            <div className="inspector-heading">
              <h2>Operating contract</h2>
              <code>{initialLifecycle.contractVersion}</code>
            </div>
            <div className="operations-summary">
              <div>
                <span>Current sources</span>
                <strong>
                  {initialLifecycle.evidence.filter((item) => item.current).length}
                </strong>
              </div>
              <div>
                <span>Requirements</span>
                <strong>{initialLifecycle.requirements.length}</strong>
              </div>
              <div>
                <span>Agent stages</span>
                <strong>{initialLifecycle.stages.length}</strong>
              </div>
              <div>
                <span>Authority</span>
                <strong>Human</strong>
              </div>
            </div>
            <div className="operations-section">
              <h3>Versioned source set</h3>
              {initialLifecycle.evidence.map((item) => (
                <div className="operations-row" key={item.id}>
                  <FileText size={15} />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.version}</small>
                  </span>
                  <b className={item.current ? "current" : "superseded"}>
                    {item.current ? "Current" : "Superseded"}
                  </b>
                </div>
              ))}
            </div>
            <div className="operations-section">
              <h3>Lifecycle gates</h3>
              {initialLifecycle.validationResults.map((gate) => (
                <div className="operations-row gate-row" key={gate.gate}>
                  {gate.passed ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <AlertTriangle size={15} />
                  )}
                  <span>
                    <strong>{formatLabel(gate.gate)}</strong>
                    <small>{gate.details}</small>
                  </span>
                  <b className={gate.passed ? "current" : "superseded"}>
                    {gate.passed ? "Passed" : "Failed"}
                  </b>
                </div>
              ))}
            </div>
            <div className="operations-authority">
              <LockKeyhole size={17} />
              <span>
                <strong>Human-only submission authority</strong>
                Agents may discover, qualify, plan, check and monitor. They
                cannot release a bid.
              </span>
            </div>
          </div>
        )}

        {inspectorTab === "evidence" && (
          <div className="inspector-body">
            <div className="inspector-heading">
              <h2>Evidence [{availableEvidence.length}]</h2>
              <div>
                <button
                  type="button"
                  title="Previous evidence"
                  aria-label="Previous evidence"
                  onClick={() => moveEvidence(-1)}
                >
                  <ChevronLeft size={17} />
                </button>
                <span>{selectedEvidenceIndex + 1} of {availableEvidence.length}</span>
                <button
                  type="button"
                  title="Next evidence"
                  aria-label="Next evidence"
                  onClick={() => moveEvidence(1)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            {selectedEvidence ? (
              <>
                <div className="evidence-field">
                  <span>Source</span>
                  <div className="source-name">
                    <FileText size={18} />
                    <strong>
                      {selectedManifest?.artifactType.replaceAll("_", " ") ??
                        "Procurement document"}
                    </strong>
                  </div>
                </div>
                <div className="evidence-field split-field">
                  <div>
                    <span>Page</span>
                    <strong>{selectedEvidence.locator.page ?? "N/A"}</strong>
                  </div>
                  <div>
                    <span>Section</span>
                    <strong>{selectedEvidence.locator.section ?? "Not specified"}</strong>
                  </div>
                </div>
                <div className="evidence-field">
                  <span>Quoted excerpt</span>
                  <blockquote>{displayText(selectedEvidence.extractedText)}</blockquote>
                </div>
                <div className="evidence-field">
                  <span>Content hash (SHA-256)</span>
                  <div className="hash-row">
                    <code>{selectedEvidence.contentHash}</code>
                    <button
                      type="button"
                      title="Copy content hash"
                      aria-label="Copy content hash"
                      onClick={() => void copyHash()}
                    >
                      {copiedHash ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="evidence-field split-field">
                  <div>
                    <span>Parser</span>
                    <strong>{selectedEvidence.parserVersion}</strong>
                  </div>
                  <div>
                    <span>Authority</span>
                    <strong className="authority-state">
                      <ShieldCheck size={15} />
                      {selectedManifest?.sourceStatus ?? "eligible for review"}
                    </strong>
                  </div>
                </div>
                {selectedManifest && (
                  <a
                    className="open-source-button"
                    href={selectedManifest.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source
                    <ExternalLink size={16} />
                  </a>
                )}
              </>
            ) : (
              <div className="empty-inspector">
                <FileText size={24} />
                <p>Select a finding to inspect its source anchor.</p>
              </div>
            )}
          </div>
        )}

        {inspectorTab === "changes" && (
          <div className="inspector-body">
            <div className="inspector-heading">
              <h2>Change review</h2>
              <span className="shadow-status"><LockKeyhole size={13} /> Shadow mode</span>
            </div>

            {impact ? (
              <div className="change-list">
                {impact.items.map((item) => {
                  const claim = fixture.claims.find(
                    (candidate) => candidate.id === item.claimId,
                  );
                  return (
                    <article key={`${item.claimId}-${item.action}`}>
                      <div className="change-item-topline">
                        <span>{item.action}</span>
                        <b>{Math.round(item.confidence * 100)}%</b>
                      </div>
                      <strong>{displayText(claim?.statement ?? item.claimId)}</strong>
                      <p>{displayText(item.rationale)}</p>
                      {item.proposedStatement && (
                        <div className="proposed-statement">
                          <span>Proposed state</span>
                          {displayText(item.proposedStatement)}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => selectEvidence(item.evidenceIds[0])}
                      >
                        Inspect evidence
                        <ChevronRight size={15} />
                      </button>
                    </article>
                  );
                })}
                <div className="review-lock">
                  <LockKeyhole size={18} />
                  <span>
                    <strong>Human decision required</strong>
                    No claim was changed or promoted automatically.
                  </span>
                </div>
              </div>
            ) : activeDelta ? (
              <div className="change-list">
                {activeDelta.event.affectedClaims.map((change) => {
                  const previousClaimId =
                    "previousClaimId" in change
                      ? change.previousClaimId
                      : change.claimId;
                  const previousClaim = fixture.claims.find(
                    (claim) => claim.id === previousClaimId,
                  );
                  const currentClaim = fixture.claims.find(
                    (claim) => claim.id === change.claimId,
                  );
                  return (
                    <article key={`${previousClaimId}-${change.claimId}`}>
                      <div className="change-item-topline">
                        <span>{formatLabel(change.changeType)}</span>
                        <b>{change.afterEvidenceIds.length} anchors</b>
                      </div>
                      <div className="before-after">
                        <span>Before</span>
                        <p>{displayText(previousClaim?.statement ?? "Prior claim")}</p>
                        <span>After</span>
                        <p>{displayText(currentClaim?.statement ?? "Updated claim")}</p>
                      </div>
                      <p>{displayText(change.explanation)}</p>
                      <button
                        type="button"
                        onClick={() => selectEvidence(change.afterEvidenceIds[0])}
                      >
                        Inspect evidence
                        <ChevronRight size={15} />
                      </button>
                    </article>
                  );
                })}
                <button
                  className="run-impact-button"
                  type="button"
                  disabled={impactRunning}
                  onClick={() => void discoverImpact("event")}
                >
                  {impactRunning ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={16} />}
                  Run impact discovery
                </button>
              </div>
            ) : (
              <div className="empty-inspector">
                <History size={24} />
                <p>No evidence change is registered for this case.</p>
              </div>
            )}
          </div>
        )}

        {inspectorTab === "trace" && (
          <div className="inspector-body">
            <div className="inspector-heading">
              <h2>Audit trace</h2>
              <code>{result.trace.traceId.slice(0, 8)}</code>
            </div>
            <div className="trace-summary">
              <div><span>Surface</span><strong>{formatLabel(result.trace.compositionSurface)}</strong></div>
              <div><span>Mode</span><strong>{formatLabel(result.trace.compositionMode)}</strong></div>
              <div><span>Model</span><strong>{result.trace.model ?? "None"}</strong></div>
              <div><span>Total</span><strong>{result.trace.timings.totalMs} ms</strong></div>
            </div>
            {result.trace.codexSessionId && (
              <div className="trace-session">
                <span>Codex Session ID</span>
                <code>{result.trace.codexSessionId}</code>
              </div>
            )}
            <div className="trace-section">
              <h3>Validation gates</h3>
              {result.trace.validationResults.map((gate) => (
                <div className="trace-row" key={gate.gate}>
                  {gate.passed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  <span>{formatLabel(gate.gate)}</span>
                  <b>{gate.passed ? "Passed" : "Failed"}</b>
                </div>
              ))}
            </div>
            <div className="trace-section">
              <h3>Runtime stages</h3>
              {result.trace.stages.map((stage, index) => (
                <div className="trace-row" key={stage.stage}>
                  <span className="stage-index">{index + 1}</span>
                  <span>{formatLabel(stage.stage)}</span>
                  <b>{stage.sourceState ?? stage.status}</b>
                </div>
              ))}
            </div>
            <div className="trace-contract">
              <ShieldCheck size={17} />
              <span>
                <strong>{passedGates}/{result.trace.validationResults.length} gates passed</strong>
                Contract {result.trace.contractVersion}
              </span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
