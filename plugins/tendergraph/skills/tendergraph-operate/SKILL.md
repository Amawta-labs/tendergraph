---
name: tendergraph-operate
description: Operate TenderGraph's governed bidder lifecycle without an API key. Use when asked to rank or select tender opportunities, approve qualification, inspect requirements, unlock a dependency-aware bid plan, check compliance blockers, monitor an amendment, prove changed and unchanged requirements, replan affected tasks, or verify human-only submission authority.
---

# TenderGraph Operate

Run the application-owned lifecycle contract. Never simulate state changes in
prose when the repository command can produce and validate them.

## Workflow

1. Confirm the current directory contains `package.json` and
   `src/lib/lifecycle/engine.ts`.
2. Choose the requested operational state:
   - `discovered`: three ranked opportunities; no bidder selection.
   - `selected`: recommended opportunity selected; investment approval pending.
   - `approved`: named human approved qualification; bid plan unlocked.
   - `amended`: amendment v2 admitted; complete impact and replanning visible.
3. Run:

```bash
npm run tendergraph:lifecycle -- --state amended
```

4. Read `artifacts/lifecycle-runs/latest.json`.
5. Report the lifecycle state, stage statuses, requirement partition, reopened
   tasks, submission status, six gate results, and artifact path.
6. If evidence or an award outcome must be analyzed with GPT-5.6, hand off to
   `$tendergraph-analyze` instead of bypassing its evidence harness.

## Invariants

- Treat opportunity and active-bid fixtures as synthetic benchmarks.
- Do not approve qualification unless the requested state includes a named
  human approval.
- Do not omit unchanged requirements from amendment impact.
- Do not mark a task runnable when an upstream dependency is incomplete.
- Never approve compliance or final submission.
- Never edit a gate or artifact to manufacture a passing result.
- Do not request `OPENAI_API_KEY`; the lifecycle is deterministic and the
  evidence skill uses ChatGPT-authenticated Codex.

For the state and authority contract, read
[references/operating-contract.md](references/operating-contract.md).
