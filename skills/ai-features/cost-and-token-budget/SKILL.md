---
name: cost-and-token-budget
version: 2.0.0
description: Enforce per-request token limits, per-tenant spend quotas, loop caps, and cost alarms on AI paths.
applies_to: [ai, backend, cost]
triggers:
  - adding AI endpoints, embeddings, or autonomous agent loops
  - configuring model parameters or tenant quotas
requires_gate: gates/pre-merge/llm-call-resilience
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on every LLM, embedding, reranker, or multi-step agent loop to prevent runaway spend and DoS wallet attacks.

## 2. Non-negotiables

- Cap input prompt size, `max_tokens` output, and maximum agent/tool iterations (`maxSteps <= 5` unless explicitly approved).
- Enforce per-user and per-tenant token/cost rate budgets before dispatching upstream LLM calls.
- Emit token count (`input_tokens`, `output_tokens`) and estimated USD cost metrics with anomaly alarms.
- Fail gracefully (`429` / degraded non-AI fallback) when tenant budget is exhausted.

## 3. Rejection criteria

Fail the task if LLM calls omit `max_tokens`, agent loops are unbounded (`while (true)`), per-tenant quotas are missing, or `gates/pre-merge/llm-call-resilience` fails.

## 4. Step-by-step procedure

1. Enforce strict input length and `max_tokens` in request/prompt config.
2. Check tenant token/cost quota prior to provider call and debit actual usage afterward.
3. Cap loop iterations and wall-clock budget for tool-calling agents.
4. Run `gates/pre-merge/llm-call-resilience` and attach JSON output.

## 5. Evidence required

Passing `gates/pre-merge/llm-call-resilience` output, budget enforcement tests, and cost/token telemetry fields.

## 6. Anti-patterns

- **REJECT:** Unbounded `while (!done)` tool-calling agent loops.
- **REJECT:** Accepting 500 KB of raw user text into an expensive frontier model without truncation/rejection.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
