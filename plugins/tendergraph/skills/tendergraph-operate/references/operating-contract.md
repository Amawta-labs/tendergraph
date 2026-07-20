# Operating contract

The lifecycle contains seven stages: discovery, qualification, requirements,
bid preparation, compliance, monitoring, and outcome learning.

The submitted benchmark must preserve these boundaries:

- The agent recommends select, review, or pass; the bidder selects.
- A named bid manager approves qualification before preparation starts.
- Requirements resolve to current, versioned evidence.
- Tasks reference requirements and satisfied upstream dependencies.
- An admitted amendment classifies the complete requirement set.
- The delivery amendment changes one requirement and preserves four.
- Exactly two affected tasks reopen in the submitted benchmark.
- Compliance remains blocked while delivery and certificate gaps remain.
- Submission authority is always `human_only`; the agent cannot release a bid.

The six code-owned gates are `current_source_set`,
`requirement_evidence_binding`, `requirement_partition`,
`task_dependency_graph`, `change_impact_completeness`, and
`human_submission_authority`.
