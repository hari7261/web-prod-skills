# Evaluation framework

Evals are versioned regression tests for AI-backed web features. Any change to prompts, model/provider, sampling config, retrieval pipeline, tool definitions, or output schema requires running `evals/runners/run-suite.mjs` and comparing against `evals/baselines/`.

## Golden sets

- `evals/golden-sets/prompt-injection/cases.jsonl` — direct & indirect prompt injection, delimiter escape, role hijacking, RAG instruction smuggling.
- `evals/golden-sets/output-guardrails/cases.jsonl` — XSS payloads, SQL/shell/path injection attempts, strict JSON schema adherence, extra-field rejection.
- `evals/golden-sets/rag-accuracy/cases.jsonl` — grounded citation accuracy, abstention when context is missing, tenant-scoped retrieval isolation.
- `evals/golden-sets/refusal-safety/cases.jsonl` — secret/PII exfiltration refusal, unauthorized tool invocation refusal, policy-boundary enforcement.

## Rubrics

- `evals/rubrics/correctness.md`
- `evals/rubrics/safety.md`
- `evals/rubrics/tone.md`

## Running

```sh
node evals/runners/run-suite.mjs
node evals/runners/run-suite.mjs --report path/to/eval-results.json
```
