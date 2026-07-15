---
name: tendergraph-analyze
description: Run TenderGraph tender, opening, award, compliance, or evidence analysis through GPT-5.6 in Codex without an API key. Use when asked to audit a TenderGraph golden case, explain who won or lost and why, produce a procurement trace, verify evidence-backed claims, or demonstrate the Build Week Codex runtime.
---

# TenderGraph Analyze

Run the application-owned harness. Do not answer the procurement question directly from model memory.

## Workflow

1. Confirm the current directory is the TenderGraph repository by checking for `package.json` and `contracts/structured-tender-answer.schema.json`.
2. Select the fixture:
   - Chile public evaluation: `cl-real-5802381-7547UCUK`
   - Chile deep case: `cl-deep-demo`
   - TED portability case: `eu-portability-demo`
   - UK portability case: `uk-portability-demo`
3. Run the complete GPT-5.6 Codex composition and validation workflow:

```bash
npm run tendergraph:codex -- \
  --fixture cl-real-5802381-7547UCUK \
  --question "Who was recommended for award and why?" \
  --model gpt-5.6-terra
```

4. Read `artifacts/codex-runs/latest.json` after the command completes.
5. Report the model, Codex session ID, composition mode, trace ID, gate count, and artifact path.
6. Treat a deterministic fallback as a safe result but clearly state that GPT-5.6 composition was rejected.

## Invariants

- Never bypass or edit validation gates to make a run pass.
- Never promote a pending consequential claim.
- Never present synthetic fixtures as official procurement records.
- Never reuse a claim or evidence ID from another procedure.
- Never expose prompts, hidden reasoning, credentials, or unrelated trace data.
- Do not set or request `OPENAI_API_KEY`; this workflow uses ChatGPT-authenticated Codex.

For contract definitions and expected outputs, read [references/runtime-contract.md](references/runtime-contract.md).
