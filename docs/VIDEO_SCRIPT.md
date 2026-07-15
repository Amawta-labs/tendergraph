# Three-Minute Demo Script

Rendered runtime: **2:09**. Narration and on-screen labels are in English. The video uses no music.

The repository includes a reproducible narrated render at
`public/tendergraph-build-week-demo.mp4`. Regenerate it with
`scripts/render-submission-video.sh` after setting `PIPER_BIN` and `VOICE_MODEL`
to a local Piper installation and English voice model.

## 0:00-0:20 — Problem and product

**Screen:** Public Chile case, full workbench.

**Narration:**

"Procurement teams do not need another tender chatbot. They need to know who was recommended, why competitors lost, which document proves each statement, and what changes when a new resolution arrives. TenderGraph is an auditable procurement decision compiler built with Codex and GPT-5.6."

## 0:20-0:55 — Public evidence chain

**Action:** Point to the public-snapshot banner, score finding, award recommendation, and evidence inspector. Open one finding.

**Narration:**

"This is a hash-verified public Chilean evaluation. TenderGraph reports the commission recommendation and preserves the boundary that this is not proof of a signed contract. Every sentence is an admitted claim copied exactly from reviewed evidence. The reader view stays clean while the evidence panel retains page, section, parser version, source URL, and content hash."

## 0:55-1:30 — Codex runtime and gates

**Action:** Keep `Codex live` selected and click `Run audit`. While it runs, point to the mode control. When complete, show `Codex 5.6`, `15/15`, and audit trace.

**Narration:**

"The workbench invokes a ChatGPT-authenticated Codex session with GPT-5.6 Terra; it does not require an API key. GPT composes only from the selected claim contract. Fifteen code-owned gates reject invented text, evidence swaps, missing claims, scope contamination, false source status, leakage, and incomplete traces. If the process fails, TenderGraph returns a deterministic safe answer and records the fallback."

## 1:30-2:10 — Frontier workflow: evidence change impact

**Action:** Open `/?case=cl-correction-demo`. Show the synthetic banner and expanded incremental reevaluation band.

**Narration:**

"The core workflow is not question answering; it is controlled reevaluation. This visibly synthetic benchmark receives a corrective resolution. TenderGraph identifies four affected claim versions: the original winner and loss reason are superseded by corrected claims. The award rule remains unchanged. The diff shows the exact before and after statements and evidence anchors instead of silently regenerating everything."

## 2:10-2:35 — Verification

**Screen:** Terminal with concise test outputs or `artifacts/evals/codex-smoke.json`.

**Narration:**

"The repository includes 30 adversarial and contract tests, 23 golden scenarios, an enforcement ablation where the harness blocks all eight injected faults, and two live Codex smoke runs with 15 of 15 gates. Traces are immutable and recoverable across processes."

## 2:35-2:45 — Codex collaboration

**Screen:** Git log and Codex session evidence.

**Narration:**

"Codex accelerated implementation, testing, source verification, and product review. We made the product, governance, and truth-boundary decisions. TenderGraph turns that collaboration into a working tool for evidence-backed procurement intelligence."

## Recording checklist

- Keep the final video under 3:00; judges are not required to watch beyond that point.
- Record at 1440x900 or 1920x1080 with browser zoom that keeps evidence and gates legible.
- Use the public case and the visibly synthetic correction case; do not imply that synthetic entities are real.
- Show one live Codex run, but pre-warm dependencies and have the verified artifact ready if network latency becomes excessive.
- Include clear audio and upload as a publicly visible YouTube video.
- Do not use third-party logos, music, or copyrighted footage without permission.
