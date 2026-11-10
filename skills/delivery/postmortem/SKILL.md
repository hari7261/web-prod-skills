---
name: postmortem
version: 2.0.0
description: Conduct blameless postmortems after SLO breaches or rollbacks and convert root causes into permanent gates and evals.
applies_to: [delivery, reliability]
triggers:
  - recovering from a production incident or automated rollback
  - investigating an SLO or error-budget breach
requires_gate: gates/post-deploy/slo-check
resources: []
scripts: []
---

## 1. When to use / when not to use

Use after any Sev-1/Sev-2 incident, customer-facing outage, automated rollback, or error-budget burn alert.

## 2. Non-negotiables

- Keep postmortems strictly blameless: examine systemic gaps in validation, gates, tests, observability, and rollout safety—not individuals.
- Document exact timeline (detection, mitigation, recovery), customer impact, root cause, and contributing factors.
- Produce concrete, owned action items with due dates that add a missing test, eval case (`evals/golden-sets/`), or gate check so the failure class cannot recur.

## 3. Rejection criteria

Fail the task if an incident closes without root-cause analysis, blames individuals, or omits preventive gate/test/eval action items.

## 4. Step-by-step procedure

1. Capture timeline, SLO impact (`gates/post-deploy/slo-check`), and blast radius once mitigation/rollback is complete.
2. Identify why pre-merge/pre-deploy gates failed to catch the regression.
3. Add a regression test, eval case, or gate check before closing follow-ups.
4. Update the service runbook with new detection or mitigation signals.

## 5. Evidence required

Published blameless postmortem document, tracked preventive action items, and added regression test/eval/gate proof.

## 6. Anti-patterns

- **REJECT:** Action items consisting solely of "be more careful next time."
- **REJECT:** Closing an incident without verifying SLO recovery via `gates/post-deploy/slo-check`.

## 7. References

- [Reliability baseline](../../../knowledge/reliability-baseline.md)
- [SLO check gate](../../../gates/post-deploy/slo-check/README.md)
