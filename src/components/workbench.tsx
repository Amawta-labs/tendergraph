"use client";

import {
  Activity,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  ExternalLink,
  FileSearch,
  FilePlus2,
  FileUp,
  GitBranch,
  GitCompareArrows,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Play,
  Search,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  CaseFixture,
  CompositionResult,
  DocumentIngestionResult,
  EvidenceRecord,
  EvidenceDeltaResult,
  ImpactDiscoveryResult,
  SourceManifest,
} from "@/lib/harness/schemas";
import { redactSubmissionText } from "@/lib/submission-redaction";

interface WorkbenchProps {
  fixtures: CaseFixture[];
  initialFixtureId: string;
  initialResult: CompositionResult;
  evidenceDeltas: EvidenceDeltaResult[];
  publicPresentation: boolean;
}

const questions: Record<string, string> = {
  "cl-real-5802381-7547UCUK": "Who was recommended for award and why?",
  "cl-correction-demo": "Who won after the correction and why?",
  "cl-deep-demo": "Who won Lot 1 and why?",
  "eu-portability-demo": "Who won the EU lot?",
  "uk-portability-demo": "What was the UK award price?",
};

function EvidenceDetail({
  evidence,
  manifest,
  displayText,
}: {
  evidence: EvidenceRecord | undefined;
  manifest: SourceManifest | undefined;
  displayText: (text: string) => string;
}) {
  if (!evidence) {
    return (
      <div className="empty-evidence">
        <FileSearch size={22} />
        <p>Select a finding to inspect its exact source anchor.</p>
      </div>
    );
  }
  return (
    <div className="evidence-detail">
      <div className="eyebrow">Evidence record</div>
      <code>{evidence.id}</code>
      <blockquote>{displayText(evidence.extractedText)}</blockquote>
      <dl>
        <div><dt>Page</dt><dd>{evidence.locator.page ?? "API"}</dd></div>
        <div><dt>Section</dt><dd>{evidence.locator.section ?? "Not provided"}</dd></div>
        <div><dt>Parser</dt><dd>{evidence.parserVersion}</dd></div>
        <div><dt>Content hash</dt><dd className="hash">{evidence.contentHash.slice(0, 16)}...</dd></div>
      </dl>
      {manifest && (
        <a className="source-link" href={manifest.canonicalUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={14} /> Open source portal
        </a>
      )}
    </div>
  );
}

export function Workbench({
  fixtures,
  initialFixtureId,
  initialResult,
  evidenceDeltas,
  publicPresentation,
}: WorkbenchProps) {
  const [fixtureId, setFixtureId] = useState(initialFixtureId);
  const [question, setQuestion] = useState(questions[initialFixtureId]);
  const [mode, setMode] = useState<"codex" | "fallback">("codex");
  const [result, setResult] = useState(initialResult);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(
    initialResult.readerOutput.sections[0]?.evidenceIds[0] ?? "",
  );
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [runtimeWarning, setRuntimeWarning] = useState("");
  const [deltaExpanded, setDeltaExpanded] = useState(
    initialFixtureId === "cl-correction-demo",
  );
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [ingestion, setIngestion] = useState<DocumentIngestionResult | null>(null);
  const [impactRunning, setImpactRunning] = useState(false);
  const [impact, setImpact] = useState<ImpactDiscoveryResult | null>(null);
  const [pipelineError, setPipelineError] = useState("");

  const fixture = useMemo(
    () => fixtures.find((item) => item.id === fixtureId) ?? fixtures[0],
    [fixtureId, fixtures],
  );
  const selectedEvidence = fixture.evidence.find(
    (item) => item.id === selectedEvidenceId,
  );
  const selectedManifest = fixture.manifests.find(
    (item) => item.id === selectedEvidence?.sourceManifestId,
  );
  const passedGates = result.trace.validationResults.filter((gate) => gate.passed).length;
  const evidenceUsed = new Set(result.trace.evidenceIds).size;
  const coverage = Math.round(
    (evidenceUsed / Math.max(1, fixture.evidence.length)) * 100,
  );
  const provenanceLabel =
    result.readerOutput.status === "insufficient_evidence"
      ? "insufficient evidence"
      : fixture.dataStatus === "public_snapshot"
        ? "public snapshot"
        : "simulated";
  const activeDelta = evidenceDeltas.find(
    (delta) => delta.event.procedureId === fixture.scope.procedureId,
  ) ?? null;
  const publicFixtureCount = fixtures.filter(
    (item) => item.dataStatus === "public_snapshot",
  ).length;
  const syntheticFixtureCount = fixtures.length - publicFixtureCount;
  const displayText = publicPresentation
    ? redactSubmissionText
    : (text: string) => text;

  function changeFixture(nextId: string) {
    const nextQuestion = questions[nextId];
    setFixtureId(nextId);
    setQuestion(nextQuestion);
    setSelectedEvidenceId("");
    setDeltaExpanded(nextId === "cl-correction-demo");
    setUploadFile(null);
    setCanonicalUrl("");
    setIngestion(null);
    setImpact(null);
    setPipelineError("");
    void executeAudit(nextId, nextQuestion, "fallback");
  }

  async function executeAudit(
    targetFixtureId: string,
    targetQuestion: string,
    targetMode: "codex" | "fallback",
  ) {
    setRunning(true);
    setError("");
    setRuntimeWarning("");
    try {
      const response = await fetch(
        targetMode === "codex" ? "/api/codex-run" : "/api/harness",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId: targetFixtureId,
          question: targetQuestion,
          ...(targetMode === "fallback" ? { mode: "fallback" } : {}),
        }),
        },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Harness request failed");
      const nextResult = body as CompositionResult & { runtimeWarning?: string };
      setResult(nextResult);
      setRuntimeWarning(nextResult.runtimeWarning ?? "");
      setSelectedEvidenceId(nextResult.readerOutput.sections[0]?.evidenceIds[0] ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Harness request failed");
    } finally {
      setRunning(false);
    }
  }

  function runAudit() {
    void executeAudit(fixtureId, question, mode);
  }

  function inspectEvidenceDelta() {
    if (!activeDelta) return;
    setDeltaExpanded(true);
    setSelectedEvidenceId(activeDelta.addedEvidenceIds[0]);
    requestAnimationFrame(() => {
      document.getElementById("evidence")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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
      setIngestion(body as DocumentIngestionResult);
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
    } catch (cause) {
      setPipelineError(
        cause instanceof Error ? cause.message : "Impact discovery failed",
      );
    } finally {
      setImpactRunning(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><GitBranch size={21} /><span>TenderGraph</span></div>
        <nav aria-label="Primary navigation">
          <a className="nav-item active" href="#workspace"><Activity size={18} />Case workspace</a>
          <a className="nav-item" href="#findings"><BookOpenCheck size={18} />Findings</a>
          <a className="nav-item" href="#evidence"><FileSearch size={18} />Evidence</a>
          <a className="nav-item" href="#delta"><GitCompareArrows size={18} />Evidence diff</a>
          <a className="nav-item" href="#intelligence"><ScanSearch size={18} />Impact discovery</a>
          <a className="nav-item" href="#trace"><ShieldCheck size={18} />Audit trace</a>
        </nav>
        <div className="sidebar-note">
          <Database size={17} />
          <div><strong>Golden corpus</strong><span>{publicFixtureCount} public · {syntheticFixtureCount} synthetic</span></div>
        </div>
      </aside>

      <main id="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">Opening + award intelligence</div>
            <h1>{displayText(fixture.name)}</h1>
          </div>
          <div className="header-status"><span className="status-dot" />Harness operational</div>
        </header>

        <section className="case-strip" aria-label="Golden cases">
          {fixtures.map((item) => (
            <button
              className={item.id === fixtureId ? "case-tab selected" : "case-tab"}
              key={item.id}
              onClick={() => changeFixture(item.id)}
            >
              <Globe2 size={16} />
              <span>{item.scope.jurisdiction}</span>
              <small>{item.scope.procedureId}</small>
            </button>
          ))}
        </section>

        <div className="simulation-banner">
          <CircleAlert size={17} />
          <span>
            <strong>
              {fixture.dataStatus === "public_snapshot"
                ? "Hash-verified public snapshot."
                : "Illustrative benchmark."}
            </strong>{" "}
            {fixture.sourceNote}
            {publicPresentation && fixture.dataStatus === "public_snapshot" && (
              <> Display names are anonymized; hashes refer to the frozen source evidence.</>
            )}
          </span>
        </div>

        <section className="metrics" aria-label="Harness metrics">
          <div><span>Runtime claims</span><strong>{result.trace.selectedClaimIds.length}</strong><small>promoted only</small></div>
          <div><span>Evidence coverage</span><strong>{coverage}%</strong><small>{evidenceUsed} anchors used</small></div>
          <div><span>Validation gates</span><strong>{passedGates}/{result.trace.validationResults.length}</strong><small>code-owned checks</small></div>
          <div><span>Composition</span><strong className="compact-value">{result.trace.compositionSurface === "codex" ? "Codex 5.6" : result.mode === "live" ? "API 5.6" : "Fallback"}</strong><small>{result.trace.timings.totalMs} ms</small></div>
        </section>

        <section className="query-bar">
          <Search size={18} />
          <input
            aria-label="Question for the procurement case"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <div className="mode-control" aria-label="Composition mode">
            <button className={mode === "codex" ? "selected" : ""} onClick={() => setMode("codex")}>Codex live</button>
            <button className={mode === "fallback" ? "selected" : ""} onClick={() => setMode("fallback")}>Deterministic</button>
          </div>
          <button className="run-button" disabled={running || question.length < 3} onClick={runAudit}>
            {running ? <LoaderCircle className="spin" size={17} /> : <Play size={17} />}
            {running ? "Running audit" : "Run audit"}
          </button>
        </section>
        {error && <div className="error-banner">{error}</div>}
        {runtimeWarning && (
          <div className="simulation-banner" role="status">
            <CircleAlert size={17} />
            <span><strong>Codex unavailable.</strong> The audit completed with the deterministic composer.</span>
          </div>
        )}

        {activeDelta && (
          <section className="delta-band" id="delta" aria-label="Incremental evidence diff">
            <div className="delta-heading">
              <div className="delta-icon"><GitCompareArrows size={19} /></div>
              <div>
                <div className="eyebrow">Incremental reevaluation</div>
                <h2>{displayText(activeDelta.event.title)}</h2>
                <p>{displayText(activeDelta.event.description)}</p>
              </div>
              <div className="delta-metrics">
                <span><strong>{activeDelta.affectedClaimIds.length}</strong> claim affected</span>
                <span><strong>{activeDelta.unchangedClaimIds.length}</strong> unchanged</span>
              </div>
              <button className="inspect-delta" onClick={inspectEvidenceDelta}>
                <FilePlus2 size={16} /> Inspect update
              </button>
            </div>
            {deltaExpanded && (
              <div className="delta-details">
                {activeDelta.event.affectedClaims.map((change) => {
                  const previousClaimId =
                    change.changeType === "claim_superseded"
                      ? change.previousClaimId
                      : change.claimId;
                  const previousClaim = fixture.claims.find(
                    (claim) => claim.id === previousClaimId,
                  );
                  const currentClaim = fixture.claims.find(
                    (claim) => claim.id === change.claimId,
                  );
                  return (
                    <div className="delta-row" key={`${previousClaimId}-${change.claimId}`}>
                      <div>
                        <span>Before · {change.beforeEvidenceIds.length} anchor{change.beforeEvidenceIds.length === 1 ? "" : "s"}</span>
                        <strong>{displayText(previousClaim?.statement ?? "Prior claim unavailable")}</strong>
                      </div>
                      <ChevronRight size={17} />
                      <div>
                        <span>After · {change.afterEvidenceIds.length} anchor{change.afterEvidenceIds.length === 1 ? "" : "s"}</span>
                        <strong>{displayText(currentClaim?.statement ?? "Current claim unavailable")}</strong>
                      </div>
                      <p><b>{change.changeType.replaceAll("_", " ")}</b> · {displayText(change.explanation)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="intelligence-band" id="intelligence">
          <div className="pipeline-heading">
            <div>
              <div className="eyebrow">Extensible evidence control plane</div>
              <h2>Ingest a source, then discover which claims may change</h2>
            </div>
            <span className="shadow-badge"><LockKeyhole size={14} /> Shadow mode</span>
          </div>

          <div className="pipeline-grid">
            <div className="pipeline-panel">
              <div className="pipeline-step">
                <span>1</span>
                <div><strong>Document ingestion</strong><small>Parse, anchor and hash</small></div>
              </div>
              <label className="file-picker" htmlFor="evidence-upload">
                <FileUp size={18} />
                <span>
                  <strong>{uploadFile?.name ?? "Choose procurement document"}</strong>
                  <small>PDF, DOCX, HTML, JSON, CSV, Markdown or text · 10 MB max</small>
                </span>
              </label>
              <input
                className="visually-hidden"
                id="evidence-upload"
                type="file"
                accept=".pdf,.docx,.html,.htm,.json,.csv,.md,.txt,image/*"
                onChange={(event) => {
                  setUploadFile(event.target.files?.[0] ?? null);
                  setIngestion(null);
                  setImpact(null);
                }}
              />
              <input
                className="source-url-input"
                aria-label="Canonical source URL"
                placeholder="Canonical source URL (recommended)"
                value={canonicalUrl}
                onChange={(event) => setCanonicalUrl(event.target.value)}
              />
              <button
                className="pipeline-button"
                disabled={!uploadFile || uploading}
                onClick={uploadEvidence}
              >
                {uploading ? <LoaderCircle className="spin" size={16} /> : <FileUp size={16} />}
                {uploading ? "Extracting evidence" : "Ingest source"}
              </button>

              {ingestion && (
                <div className="ingestion-result">
                  <div>
                    <CheckCircle2 size={17} />
                    <strong>{ingestion.status.replaceAll("_", " ")}</strong>
                    <span>{ingestion.format.toUpperCase()} · {ingestion.parser.adapter}</span>
                  </div>
                  <dl>
                    <div><dt>Evidence anchors</dt><dd>{ingestion.evidence.length}</dd></div>
                    <div><dt>File hash</dt><dd><code>{ingestion.file.sha256.slice(0, 12)}</code></dd></div>
                    <div><dt>Authority</dt><dd>{ingestion.authorityState.replaceAll("_", " ")}</dd></div>
                  </dl>
                  {ingestion.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="pipeline-panel">
              <div className="pipeline-step">
                <span>2</span>
                <div><strong>Codex impact discovery</strong><small>Classify every active claim</small></div>
              </div>
              <div className="impact-actions">
                {activeDelta && (
                  <button
                    className="pipeline-button"
                    disabled={impactRunning}
                    onClick={() => void discoverImpact("event")}
                  >
                    {impactRunning ? <LoaderCircle className="spin" size={16} /> : <ScanSearch size={16} />}
                    Analyze verified update
                  </button>
                )}
                <button
                  className="pipeline-button secondary"
                  disabled={impactRunning || ingestion?.status !== "extracted"}
                  onClick={() => void discoverImpact("document")}
                >
                  <ScanSearch size={16} />
                  Analyze uploaded source
                </button>
              </div>
              {!activeDelta && ingestion?.status !== "extracted" && (
                <div className="pipeline-empty">
                  Ingest an extracted document to activate impact discovery.
                </div>
              )}

              {impact && (
                <div className="impact-result">
                  <div className="impact-summary">
                    <span className="shadow-badge"><LockKeyhole size={13} /> {impact.status}</span>
                    <strong>{impact.items.length} claim{impact.items.length === 1 ? "" : "s"} flagged</strong>
                    <small>
                      {impact.compositionSurface === "codex"
                        ? "GPT-5.6 via Codex"
                        : "Validated deterministic fallback"}
                    </small>
                  </div>
                  {impact.items.map((item) => {
                    const currentClaim = fixture.claims.find(
                      (claim) => claim.id === item.claimId,
                    );
                    return (
                      <article className="impact-item" key={item.claimId}>
                        <div>
                          <span>{item.action}</span>
                          <code>{item.claimId}</code>
                          <b>{Math.round(item.confidence * 100)}%</b>
                        </div>
                        <p>{displayText(item.rationale)}</p>
                        <small>{displayText(currentClaim?.statement ?? item.claimId)}</small>
                        {item.proposedStatement && (
                          <strong>{displayText(item.proposedStatement)}</strong>
                        )}
                      </article>
                    );
                  })}
                  <div className="impact-gates">
                    <span>
                      <ShieldCheck size={15} />
                      {impact.validationResults.filter((gate) => gate.passed).length}/
                      {impact.validationResults.length} code gates
                    </span>
                    <span>{impact.unchangedClaimIds.length} unchanged</span>
                    {impact.referenceAgreement && (
                      <span>
                        Reference {impact.referenceAgreement.exact ? "exact" : `${Math.round(impact.referenceAgreement.recall * 100)}% recall`}
                      </span>
                    )}
                  </div>
                  <div className="human-review-lock">
                    <LockKeyhole size={16} />
                    <span><strong>Human decision required.</strong> No claim was changed or promoted automatically.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {pipelineError && <div className="error-banner">{pipelineError}</div>}
        </section>

        <div className="workspace-grid">
          <section className="findings-panel" id="findings">
            <div className="section-heading">
              <div><div className="eyebrow">Reader output</div><h2>{displayText(result.readerOutput.title)}</h2></div>
              <span
                className={`answer-status ${
                  fixture.dataStatus === "public_snapshot"
                    ? "public_snapshot"
                    : result.readerOutput.status
                }`}
              >
                {provenanceLabel} · {result.readerOutput.decisionStage.replaceAll("_", " ")}
              </span>
            </div>
            <p className="summary">{displayText(result.readerOutput.summary)}</p>
            <div className="findings-list">
              {result.readerOutput.sections.map((section) => (
                <button
                  className="finding-row"
                  key={`${section.heading}-${section.claimIds[0]}`}
                  onClick={() => setSelectedEvidenceId(section.evidenceIds[0])}
                >
                  <CheckCircle2 size={18} />
                  <span><strong>{displayText(section.heading)}</strong><small>{displayText(section.body)}</small></span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
            {result.readerOutput.gaps.length > 0 && (
              <div className="review-queue">
                <div className="eyebrow">Human review queue</div>
                {result.readerOutput.gaps.map((gap) => <p key={gap}>{displayText(gap)}</p>)}
              </div>
            )}
          </section>

          <aside className="evidence-panel" id="evidence">
            <div className="panel-title"><FileSearch size={18} /><h2>Evidence inspector</h2></div>
            <EvidenceDetail
              evidence={selectedEvidence}
              manifest={selectedManifest}
              displayText={displayText}
            />
          </aside>
        </div>

        <section className="trace-band" id="trace">
          <div className="panel-title"><ShieldCheck size={18} /><h2>Audit trace</h2><code>{result.trace.traceId.slice(0, 8)}</code></div>
          <div className="gate-grid">
            {result.trace.validationResults.map((gate) => (
              <div className={gate.passed ? "gate passed" : "gate failed"} key={gate.gate}>
                {gate.passed ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
                <span>{gate.gate.replaceAll("_", " ")}</span>
              </div>
            ))}
          </div>
          {result.trace.stages.length > 0 && (
            <div className="trace-stages" aria-label="Runtime trace stages">
              {result.trace.stages.map((stage, index) => (
                <div className={`trace-stage ${stage.status}`} key={stage.stage}>
                  <span>{index + 1}</span>
                  <strong>{stage.stage.replaceAll("_", " ")}</strong>
                  <small>{stage.sourceState ?? stage.status}</small>
                </div>
              ))}
            </div>
          )}
          <div className="trace-meta">
            <span>Scope <code>{result.trace.resolvedScope.procedureId}/{result.trace.resolvedScope.lotId}</code></span>
            <span>Contract <code>{result.trace.contractVersion}</code></span>
            <span>Mode <code>{result.trace.compositionMode}</code></span>
            <span>Surface <code>{result.trace.compositionSurface}</code></span>
            {result.trace.codexSessionId && (
              <span>Codex session <code>{result.trace.codexSessionId}</code></span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
