---
name: eval-harness
version: 2.0.0
description: Run reproducible golden-set evaluations and block prompt, model, or retrieval regressions.
applies_to: [ai, delivery]
triggers:
  - changing prompts, models, temperatures, tools, or retrieval logic
  - adding new AI evaluation cases or rubrics
requires_gate: gates/pre-merge/prompt-evals
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever evaluating AI feature changes or expanding golden sets in `evals/golden-sets/`.

## 2. Non-negotiables

- Pin dataset version, prompt version, model ID, and baseline thresholds (`evals/baselines/v2.0.0.json`) before running.
- Cover all four golden suites: `prompt-injection`, `output-guardrails`, `rag-accuracy`, and `refusal-safety`.
- Never delete a failing test case just to make metrics pass; document and fix regressions properly.
- Block merge on any `severity: block` safety failure or threshold drop below baseline.

## 3. Rejection criteria

Fail the task if AI changes ship without an eval report, thresholds are weakened after seeing failures, or `gates/pre-merge/prompt-evals` fails.

## 4. Step-by-step procedure

1. Add new regression cases to the appropriate `evals/golden-sets/<suite>/cases.jsonl`.
2. Run `node evals/runners/run-suite.mjs --report <eval-report.json>`.
3. Verify zero blocking failures and latency/cost within baseline bounds.
4. Run `gates/pre-merge/prompt-evals` and attach JSON output.

## 5. Evidence required

Reproducible eval report JSON and passing `gates/pre-merge/prompt-evals` output.

## 6. Anti-patterns

- **REJECT:** "Vibe-checking" 3 manual prompts instead of running the versioned suite.
- **REJECT:** Deleting failing safety cases from JSONL to pass CI.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [Eval framework](../../../evals/README.md)
