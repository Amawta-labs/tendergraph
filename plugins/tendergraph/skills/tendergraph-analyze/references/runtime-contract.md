# Runtime contract

The command performs four boundaries:

1. Application code selects runtime-eligible claims and evidence.
2. `codex exec` runs `gpt-5.6-terra` under ChatGPT authentication and a strict JSON Schema.
3. Application code validates schema, claim admission, grounding, source integrity, scope, completeness, hygiene, trace, and latency.
4. Invalid composition is discarded and rebuilt deterministically.

Published artifacts:

- `latest-input.json`: exact plan, eligible claims, evidence, scope, and requested model.
- `latest-candidate.json`: GPT-5.6 structured composition before harness admission.
- `latest.json`: admitted reader output plus audit trace.

The fixture field `dataStatus` controls output status. `synthetic` always requires `simulated`.
