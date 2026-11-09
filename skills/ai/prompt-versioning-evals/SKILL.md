---
name: prompt-versioning-evals
version: 1.0.0
description: Version prompts as deployable artifacts and gate changes on evaluation.
applies_to: [ai, backend]
triggers:
  - creating or editing a production prompt
  - changing model, sampling, retrieval or tool configuration
  - changing output schema or safety policy
requires_gate: gates/pre-merge/ai-eval-evidence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for any change that can alter model behavior: prompt text, model/provider, parameters, retrieval, tools, output schema or safety instructions.

## 2. Non-negotiables

- Store prompts as versioned files with stable IDs; do not bury production prompts in application source.
- Record model/provider, parameters, schema version and prompt version.
- Maintain representative golden and adversarial datasets.
- Evaluate quality, safety, refusal behavior, tool correctness, latency and cost.
- Define thresholds before evaluating; do not tune thresholds after seeing a regression to force a pass.
- Support staged rollout and fast rollback to the prior prompt/model configuration.

## 3. Rejection criteria

Reject unversioned prompt changes, missing eval evidence, unreviewed golden-set changes, silent model upgrades, or production rollout without rollback.

## 4. Step-by-step procedure

1. Copy the current prompt into a new immutable version.
2. Describe intent and expected behavioral changes.
3. Add or update eval cases with reviewable rationale.
4. Run the pinned evaluation configuration.
5. Compare against baseline and thresholds for quality, safety, latency and cost.
6. Review failures; never hide regressions by deleting cases without justification.
7. Stage rollout, monitor and retain a one-step rollback.

## 5. Evidence required

Prompt diff, dataset version, evaluator/model version, metrics, failed examples, reviewer decision and rollout/rollback reference.

## 6. Anti-patterns

- **REJECT:** prompt edits directly in production without versioning.
- **REJECT:** evaluating only happy paths or a single aggregate score.
- **REJECT:** claiming deterministic behavior from a stochastic model.
- **REJECT:** storing real customer PII in golden datasets without approved controls.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [AI eval evidence gate](../../../gates/pre-merge/ai-eval-evidence/README.md)
