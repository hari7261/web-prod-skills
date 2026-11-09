# Evaluation framework

Evals are versioned regression tests for model-backed behavior. A prompt/model/retrieval/tool/schema change must identify the dataset and evaluator versions and attach a report.

## Minimum suite

- Task quality and correctness
- Safety and refusal behavior
- Direct and indirect prompt injection
- Tool selection, argument schema and authorization boundary
- Retrieval relevance and citation fidelity
- Latency, token consumption and cost
- Robustness to malformed, oversized and adversarial inputs

## Dataset rules

Use synthetic or approved de-identified examples. Every case has a stable ID, category, expected behavior, severity and rationale. Do not remove a failing case solely to obtain a passing score; review and version dataset changes.

## Report contract

Each run records commit, prompt version, model/provider, dataset version, evaluator version, timestamp, per-case outcomes, aggregate metrics, thresholds and reviewer. A report without reproducible configuration is not release evidence.
