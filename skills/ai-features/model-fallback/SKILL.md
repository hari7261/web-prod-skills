---
name: model-fallback
version: 2.0.0
description: Implement circuit breakers, secondary model/provider fallbacks, and deterministic degradation when AI providers fail.
applies_to: [ai, reliability]
triggers:
  - calling external LLM providers in user-facing flows
  - configuring multi-model routing or circuit breakers
requires_gate: gates/pre-merge/llm-call-resilience
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on every production AI feature so an upstream OpenAI/Anthropic/Vertex/Bedrock outage or 429 spike degrades gracefully instead of breaking your web app.

## 2. Non-negotiables

- Define an explicit fallback chain: primary model -> secondary model/provider (if compatible) -> deterministic non-LLM fallback or cached response.
- Trip a circuit breaker on sustained upstream errors/timeouts so requests fail fast instead of queueing indefinitely.
- Never silently switch to an un-evaluated model without compatible schema/safety guarantees.
- Record `model_used` and `fallback_triggered` in structured logs, metrics, and trace spans.

## 3. Rejection criteria

Fail the task if provider errors crash the route with unhandled 500s, fallback behavior lacks schema validation, or `gates/pre-merge/llm-call-resilience` fails.

## 4. Step-by-step procedure

1. Define primary/fallback config and circuit-breaker thresholds (`templates/ai-endpoint/ai-route.ts`).
2. Validate both primary and fallback outputs through the same output schema.
3. Test primary timeout, `429`, and `503` scenarios to verify clean degradation.
4. Run `gates/pre-merge/llm-call-resilience`.

## 5. Evidence required

Passing `gates/pre-merge/llm-call-resilience` output and simulated provider-outage tests.

## 6. Anti-patterns

- **REJECT:** Assuming 100% uptime from a single LLM provider API.
- **REJECT:** Retrying 10 times synchronously on a slow provider, exhausting web worker threads.

## 7. References

- [Reliability baseline](../../../knowledge/reliability-baseline.md)
- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)

