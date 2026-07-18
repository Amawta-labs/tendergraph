# Three-Minute Demo Script

Target runtime: **under 2:50**. Narration and on-screen labels are in English. The video uses no music.
The public-procurement scenes use stable supplier aliases in the presentation
layer while retaining the procedure ID, scores, evidence anchors, and hashes.

The repository includes a reproducible narrated render at
`public/tendergraph-build-week-demo.mp4`. Regenerate it with
`scripts/render-submission-video.sh` after setting `PIPER_BIN` and `VOICE_MODEL`
to a local Piper installation and English voice model.

## 0:00-0:16 — Problem and product

**Screen:** Public Chile case, full workbench, with buyer and supplier display
names anonymized for the submission video.

**Narration:**

"Procurement teams do not need another tender chatbot. They need to know who was recommended, why competitors lost, which document proves each statement, and what changes when a new resolution arrives. TenderGraph is an auditable procurement decision compiler built with Codex and GPT-5.6."

## 0:16-0:40 — Public evidence chain

**Screen:** Public-snapshot banner, score finding, commission recommendation, and evidence inspector.

**Narration:**

"This is a hash-verified public Chilean evaluation. TenderGraph reports the commission recommendation and preserves the boundary that this is not proof of a signed contract. Every factual finding is an admitted claim bound to reviewed evidence, and each section reproduces the admitted claim text verbatim. The reader view stays clean while the evidence panel retains page, section, parser version, source URL, and content hash."

## 0:40-1:08 — Codex runtime and gates

**Action:** Record authenticated localhost, keep `Codex live` selected, and click `Run audit`. Show the running state. When complete, show `Codex 5.6`, `15/15`, the Codex session ID, and audit trace. Do not present the hosted replay as a fresh Codex execution.

**Narration:**

"The workbench invokes a ChatGPT-authenticated Codex session with GPT-5.6 Terra; it does not require an API key. Here is the real click, running state, completed answer, fifteen passed gates, and full Codex session identifier. GPT composes only from the selected claim contract. Code-owned gates reject invented text, evidence swaps, missing claims, scope contamination, false source status, leakage, and incomplete traces."

## 1:08-1:35 — Frontier workflow: ingest and discover

**Action:** Upload the public evaluation PDF in the evidence control plane. Show
eight extracted anchors, the file hash, parser identity, and `eligible for
review`. Run `Analyze verified update` and show the completed shadow proposal,
6/6 gates, explicit unchanged claims, and `Reference exact`.

**Narration:**

"This is the frontier workflow. TenderGraph ingests common procurement formats into hashed, addressable evidence without granting authority. GPT-5.6 through Codex compares the new evidence with every active claim and discovers material corroboration, invalidation, or supersession. Six code-owned gates verify scope, the complete claim partition, evidence identity, action semantics, and shadow authority. Nothing changes until human review."

## 1:35-1:57 — Corrective resolution benchmark

**Action:** Open `/?case=cl-correction-demo`. Show the synthetic banner and expanded incremental reevaluation band.

**Narration:**

"This visibly synthetic correction benchmark tests a harder transition. Automatic impact discovery identifies two supersessions: the original winner and loss reason are replaced, while the award rule remains unchanged. The live Codex result matches the versioned reference exactly and still cannot modify authority."

## 1:57-2:12 — Evidence diff

**Screen:** Exact before/after statements, evidence dependencies, and supersession reasons.

**Narration:**

"The diff shows the exact before and after statements and evidence anchors instead of silently regenerating everything. New evidence can corroborate one claim, invalidate a claim, or create an explicit supersession. Unrelated conclusions remain stable and auditable."

## 2:12-2:27 — Verification metrics

**Screen:** Generated verification slide backed by tests, ablation, and live Codex artifacts.

**Narration:**

"The repository includes 44 adversarial and contract tests, 23 deterministic scenarios, two live composition runs, and two live impact runs. The enforcement ablation blocks all eight injected faults while the schema-only control admits all eight."

## 2:27-2:48 — Codex collaboration evidence

**Screen:** Five dated Build Week commits and the retained browser and smoke-run
Codex Session IDs.

**Narration:**

"The dated repository history distinguishes the Build Week implementation. Retained Session IDs prove live GPT-5.6 composition and impact discovery through Codex. Codex accelerated implementation, source verification, testing, and browser review. We retained the product, governance, and truth-boundary decisions."

## Recording checklist

- Keep the final video under 3:00; judges are not required to watch beyond that point.
- Record at 1440x900 or 1920x1080 with browser zoom that keeps evidence and gates legible.
- Use the public case and the visibly synthetic correction case; do not imply that synthetic entities are real.
- Use `?submission=public` for public-facing captures so real buyer and supplier display names are replaced with stable aliases.
- Show one live Codex run, but pre-warm dependencies and have the verified artifact ready if network latency becomes excessive.
- Include clear audio and upload as a publicly visible YouTube video.
- Do not use third-party logos, music, or copyrighted footage without permission.
