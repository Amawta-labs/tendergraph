# Three-Minute Demo Script

Rendered runtime: **2:23**. Narration and on-screen labels are in English. The video uses no music.

The repository includes a reproducible narrated render at
`public/tendergraph-build-week-demo.mp4`. Regenerate it with
`scripts/render-submission-video.sh` after setting `PIPER_BIN` and `VOICE_MODEL`
to a local Piper installation and English voice model.

## 0:00-0:18 — Problem and product

**Screen:** Public Chile case, full workbench.

**Narration:**

"Procurement teams do not need another tender chatbot. They need to know who was recommended, why competitors lost, which document proves each statement, and what changes when a new resolution arrives. TenderGraph is an auditable procurement decision compiler built with Codex and GPT-5.6."

## 0:18-0:45 — Public evidence chain

**Screen:** Public-snapshot banner, score finding, commission recommendation, and evidence inspector.

**Narration:**

"This is a hash-verified public Chilean evaluation. TenderGraph reports the commission recommendation and preserves the boundary that this is not proof of a signed contract. Every factual finding is an admitted claim bound to reviewed evidence, and each section reproduces the admitted claim text verbatim. The reader view stays clean while the evidence panel retains page, section, parser version, source URL, and content hash."

## 0:45-1:15 — Codex runtime and gates

**Action:** Record authenticated localhost, keep `Codex live` selected, and click `Run audit`. Show the running state. When complete, show `Codex 5.6`, `15/15`, the Codex session ID, and audit trace. Do not present the hosted replay as a fresh Codex execution.

**Narration:**

"The workbench invokes a ChatGPT-authenticated Codex session with GPT-5.6 Terra; it does not require an API key. Here is the real click, running state, completed answer, fifteen passed gates, and full Codex session identifier. GPT composes only from the selected claim contract. Code-owned gates reject invented text, evidence swaps, missing claims, scope contamination, false source status, leakage, and incomplete traces."

## 1:15-1:38 — Frontier workflow: evidence change impact

**Action:** Open `/?case=cl-correction-demo`. Show the synthetic banner and expanded incremental reevaluation band.

**Narration:**

"The core workflow is controlled reevaluation, not generic question answering. This visibly synthetic benchmark contains a versioned corrective-resolution contract. TenderGraph validates four declared affected claim versions: the original winner and loss reason are superseded by corrected claims. The award rule remains unchanged. Automatic impact discovery is the next product boundary."

## 1:38-1:55 — Evidence diff

**Screen:** Exact before/after statements, evidence dependencies, and supersession reasons.

**Narration:**

"The diff shows the exact before and after statements and evidence anchors instead of silently regenerating everything. New evidence can corroborate one claim, invalidate a claim, or create an explicit supersession. Unrelated conclusions remain stable and auditable."

## 1:55-2:23 — Verification and Codex collaboration

**Screen:** Generated verification slide backed by test, ablation, and live Codex artifacts.

**Narration:**

"The repository includes 30 adversarial and contract tests, 23 deterministic contract scenarios, and an enforcement ablation where the harness blocks all eight injected faults while the schema-only control admits all eight. Two live Codex smoke runs and this browser run passed 15 of 15 gates. Codex accelerated implementation, source verification, testing, and browser review. We retained the product, governance, and truth-boundary decisions."

## Recording checklist

- Keep the final video under 3:00; judges are not required to watch beyond that point.
- Record at 1440x900 or 1920x1080 with browser zoom that keeps evidence and gates legible.
- Use the public case and the visibly synthetic correction case; do not imply that synthetic entities are real.
- Show one live Codex run, but pre-warm dependencies and have the verified artifact ready if network latency becomes excessive.
- Include clear audio and upload as a publicly visible YouTube video.
- Do not use third-party logos, music, or copyrighted footage without permission.
