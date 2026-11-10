---
name: incident-runbook
version: 2.0.0
description: Maintain owned, actionable service runbooks linked directly from SLO alerts and deploy plans.
applies_to: [delivery, reliability]
triggers:
  - launching a new web service, endpoint, or integration
  - adding or modifying production alerts
requires_gate: gates/post-deploy/auto-rollback-trigger
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever introducing a new service, critical user journey, third-party integration, or production alert rule.

## 2. Non-negotiables

- Every service and alert links to an owned runbook (`templates/runbook/service-runbook.md`).
- Runbooks list concrete triage dashboards, trace queries, dependency degradation toggles (feature flags/circuit breakers), and copy-pasteable rollback commands.
- Prioritize fast customer mitigation (rollback / kill-switch) over live root-cause investigation.
- Keep ownership and escalation contacts current.

## 3. Rejection criteria

Fail the task if new services or alerts lack an owned runbook, rollback instructions are vague, or incident links are missing on auto-rollback.

## 4. Step-by-step procedure

1. Create runbook from `templates/runbook/service-runbook.md`.
2. Link the runbook URL inside alert definitions and `deploy-plan.yaml`.
3. Verify triage steps and rollback commands during game-day or staging drill.
4. Confirm `gates/post-deploy/auto-rollback-trigger` records incident links properly.

## 5. Evidence required

Committed runbook file with owner, alert links, and passing `gates/post-deploy/auto-rollback-trigger` configuration.

## 6. Anti-patterns

- **REJECT:** Paging on-call at 3 AM with an alert that has no runbook or owner.
- **REJECT:** Runbook steps that say "SSH into server and figure it out."

## 7. References

- [Production readiness](../../../knowledge/production-readiness.md)
- [Runbook template](../../../templates/runbook/service-runbook.md)

