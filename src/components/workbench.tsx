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
  GitBranch,
  Globe2,
  LoaderCircle,
  Play,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  CaseFixture,
  CompositionResult,
  EvidenceRecord,
  SourceManifest,
} from "@/lib/harness/schemas";

interface WorkbenchProps {
  fixtures: CaseFixture[];
  initialFixtureId: string;
  initialResult: CompositionResult;
}

const questions: Record<string, string> = {
  "cl-deep-demo": "Who won Lot 1 and why?",
  "eu-portability-demo": "Who won the EU lot?",
  "uk-portability-demo": "What was the UK award price?",
};

function EvidenceDetail({
  evidence,
  manifest,
}: {
  evidence: EvidenceRecord | undefined;
  manifest: SourceManifest | undefined;
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
      <blockquote>{evidence.extractedText}</blockquote>
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
}: WorkbenchProps) {
  const [fixtureId, setFixtureId] = useState(initialFixtureId);
  const [question, setQuestion] = useState(questions[initialFixtureId]);
  const [mode, setMode] = useState<"auto" | "fallback">("auto");
  const [result, setResult] = useState(initialResult);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(
    initialResult.readerOutput.sections[0]?.evidenceIds[0] ?? "",
  );
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

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

  function changeFixture(nextId: string) {
    const nextQuestion = questions[nextId];
    setFixtureId(nextId);
    setQuestion(nextQuestion);
    setSelectedEvidenceId("");
    void executeAudit(nextId, nextQuestion, mode);
  }

  async function executeAudit(
    targetFixtureId: string,
    targetQuestion: string,
    targetMode: "auto" | "fallback",
  ) {
    setRunning(true);
    setError("");
    try {
      const response = await fetch("/api/harness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId: targetFixtureId,
          question: targetQuestion,
          mode: targetMode,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Harness request failed");
      const nextResult = body as CompositionResult;
      setResult(nextResult);
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><GitBranch size={21} /><span>TenderGraph</span></div>
        <nav aria-label="Primary navigation">
          <a className="nav-item active" href="#workspace"><Activity size={18} />Case workspace</a>
          <a className="nav-item" href="#findings"><BookOpenCheck size={18} />Findings</a>
          <a className="nav-item" href="#evidence"><FileSearch size={18} />Evidence</a>
          <a className="nav-item" href="#trace"><ShieldCheck size={18} />Audit trace</a>
        </nav>
        <div className="sidebar-note">
          <Database size={17} />
          <div><strong>Golden corpus</strong><span>3 jurisdictions · synthetic</span></div>
        </div>
      </aside>

      <main id="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">Opening + award intelligence</div>
            <h1>{fixture.name}</h1>
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
          <span><strong>Illustrative benchmark.</strong> {fixture.sourceNote}</span>
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
            <button className={mode === "auto" ? "selected" : ""} onClick={() => setMode("auto")}>GPT + fallback</button>
            <button className={mode === "fallback" ? "selected" : ""} onClick={() => setMode("fallback")}>Deterministic</button>
          </div>
          <button className="run-button" disabled={running || question.length < 3} onClick={runAudit}>
            {running ? <LoaderCircle className="spin" size={17} /> : <Play size={17} />}
            Run audit
          </button>
        </section>
        {error && <div className="error-banner">{error}</div>}

        <div className="workspace-grid">
          <section className="findings-panel" id="findings">
            <div className="section-heading">
              <div><div className="eyebrow">Reader output</div><h2>{result.readerOutput.title}</h2></div>
              <span className={`answer-status ${result.readerOutput.status}`}>{result.readerOutput.status.replace("_", " ")}</span>
            </div>
            <p className="summary">{result.readerOutput.summary}</p>
            <div className="findings-list">
              {result.readerOutput.sections.map((section) => (
                <button
                  className="finding-row"
                  key={`${section.heading}-${section.claimIds[0]}`}
                  onClick={() => setSelectedEvidenceId(section.evidenceIds[0])}
                >
                  <CheckCircle2 size={18} />
                  <span><strong>{section.heading}</strong><small>{section.body}</small></span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
            {result.readerOutput.gaps.length > 0 && (
              <div className="review-queue">
                <div className="eyebrow">Human review queue</div>
                {result.readerOutput.gaps.map((gap) => <p key={gap}>{gap}</p>)}
              </div>
            )}
          </section>

          <aside className="evidence-panel" id="evidence">
            <div className="panel-title"><FileSearch size={18} /><h2>Evidence inspector</h2></div>
            <EvidenceDetail evidence={selectedEvidence} manifest={selectedManifest} />
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
          <div className="trace-meta">
            <span>Scope <code>{result.trace.resolvedScope.procedureId}/{result.trace.resolvedScope.lotId}</code></span>
            <span>Contract <code>{result.trace.contractVersion}</code></span>
            <span>Mode <code>{result.trace.compositionMode}</code></span>
            <span>Surface <code>{result.trace.compositionSurface}</code></span>
          </div>
        </section>
      </main>
    </div>
  );
}
