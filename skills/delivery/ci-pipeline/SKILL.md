---
name: ci-pipeline
version: 2.0.0
description: Enforce deterministic, reproducible CI/CD pipelines with pinned actions, blocking gates, and immutable build artifacts.
applies_to: [delivery, security]
triggers:
  - creating or modifying GitHub Actions or CI workflows
  - configuring build artifact hashing or release automation
requires_gate: gates/pre-deploy/production-build
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever configuring or updating CI/CD build, test, security, or release workflows.

## 2. Non-negotiables

- Run every blocking pre-commit, pre-merge, and pre-deploy gate in CI; never mark failing gates `continue-on-error: true`.
- Grant minimal `permissions:` (`contents: read` by default) in workflow jobs.
- Record an immutable build artifact hash (SHA-256) and build once, promote across environments.
- Never echo secrets into CI logs or run untrusted PR fork code with write tokens (`pull_request_target` hazard).

## 3. Rejection criteria

Fail the task if CI bypasses blocking gates, grants excessive workflow permissions, omits artifact hash verification, or fails `gates/pre-deploy/production-build`.

## 4. Step-by-step procedure

1. Define deterministic install (`npm ci`) and run test + gate checks.
2. Generate `build-report.json` with SHA-256 artifact digest.
3. Enforce least-privilege `permissions:` per workflow/job.
4. Run `gates/pre-deploy/production-build`.

## 5. Evidence required

Passing CI workflow run logs and passing `gates/pre-deploy/production-build` JSON output with artifact hash.

## 6. Anti-patterns

- **REJECT:** `continue-on-error: true` on security or test gates.
- **REJECT:** Rebuilding different binaries between staging and production.

## 7. References

- [Production readiness](../../../knowledge/production-readiness.md)
- [Production build gate](../../../gates/pre-deploy/production-build/README.md)
