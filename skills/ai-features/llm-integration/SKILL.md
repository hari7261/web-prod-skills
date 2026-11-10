---
name: llm-integration
version: 2.0.0
description: Integrate LLM providers with bounded timeouts, jittered retries, budgets, fallback, and full telemetry.
applies_to: [ai, backend]
triggers:
  - adding or changing an LLM provider call
  - building an AI-backed API endpoint
requires_gate: gates/pre-merge/llm-call-resilience
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every server-side LLM API call (completions, chat, embeddings, tool-use, structured output). Never call paid LLM provider keys directly from browser clients.

## 2. Non-negotiables

- Set explicit request timeout (`AbortController` / deadline) and bounded jittered retries on transient errors (`429`, `502`, `503`, `504`) only.
- Bound `max_tokens`, input character length, tool-call loop iterations, and per-tenant spend.
- Define a deterministic fallback/degradation path when the provider is unreachable or rate-limited.
- Load prompts from versioned files (`templates/ai-endpoint/`) and emit trace spans, latency, token counts, and model/prompt version metadata.

## 3. Rejection criteria

Fail the task if LLM calls lack timeouts, retries, `max_tokens`, fallback handling, or fail `gates/pre-merge/llm-call-resilience`.

## 4. Step-by-step procedure

1. Scaffold using `templates/ai-endpoint/`.
2. Wrap provider call with timeout, transient-only retry, token cap, and fallback response.
3. Add observability (logs, token/latency metrics, trace span) with PII scrubbed.
4. Test provider timeout, 429 rate limit, and fallback behavior.
5. Run `gates/pre-merge/llm-call-resilience` and `gates/pre-merge/observability-presence`.

## 5. Evidence required

Passing `gates/pre-merge/llm-call-resilience` JSON output and timeout/fallback integration test results.

## 6. Anti-patterns

- **REJECT:** `await openai.responses.create({ model, input })` with no timeout, `max_tokens`, or `catch` fallback.
- **REJECT:** Calling LLM APIs directly from React/browser code with exposed API keys.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [LLM call resilience gate](../../../gates/pre-merge/llm-call-resilience/README.md)

