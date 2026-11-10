# Web Prod Skills

> `web-prod-skills` is a skill + gate repo for **web applications** (frontend + backend + AI + integrations). `skills/` tells the agent how to do production work, `gates/` refuses to let it claim done without proof, `knowledge/` defines the bar once, `templates/` remove the excuse of wrong structure, and `evals/` keep AI behavior from regressing. That combination is what makes it **production, not college project**.

[![CI](https://github.com/hari7261/web-prod-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/hari7261/web-prod-skills/actions/workflows/ci.yml)
[![Nightly](https://github.com/hari7261/web-prod-skills/actions/workflows/nightly.yml/badge.svg)](https://github.com/hari7261/web-prod-skills/actions/workflows/nightly.yml)
[![Deploy Pages](https://github.com/hari7261/web-prod-skills/actions/workflows/pages.yml/badge.svg)](https://github.com/hari7261/web-prod-skills/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Project website:** https://hari7261.github.io/web-prod-skills/  
**Repository:** https://github.com/hari7261/web-prod-skills

## What is included

- **Agent contract (`AGENTS.md`):** Mandatory load order, scope boundary, and operating rules.
- **11 knowledge baselines (`knowledge/`):** Principles, Definition of Done, web security, reliability, AI features, frontend, backend, integrations, anti-patterns, review checklist, and glossary.
- **49 indexed skills (`skills/`):**
  - `frontend/` (9): `component-architecture`, `state-management`, `accessibility`, `performance-budget`, `ssr-hydration-safety`, `error-boundaries`, `forms-and-validation`, `safe-rendering`, `i18n-and-timezone`
  - `backend/` (11): `api-contract-first`, `input-validation`, `authn-authz`, `multi-tenancy`, `rate-limiting`, `idempotency`, `pagination-and-filtering`, `db-migrations`, `background-jobs`, `file-uploads`, `query-performance`
  - `ai-features/` (10): `llm-integration`, `prompt-management`, `output-guardrails`, `prompt-injection-defense`, `rag-pipeline`, `streaming-safety`, `eval-harness`, `cost-and-token-budget`, `model-fallback`, `pii-redaction`
  - `integrations/` (5): `third-party-api-client`, `webhook-handling`, `oauth-flows`, `quota-and-degradation`, `payment-integrations`
  - `cross-cutting/` (9): `secrets-management`, `observability`, `error-handling`, `logging-pii-scrubbing`, `feature-flags`, `caching`, `security-headers`, `cors-and-csrf`, `dependency-supply-chain`
  - `delivery/` (5): `ci-pipeline`, `deployment-strategy`, `rollback`, `incident-runbook`, `postmortem`
- **27 executable gates (`gates/`):**
  - `pre-commit/` (4): `lint-and-typecheck`, `secrets-scan`, `dangerous-html-scan`, `bundle-budget`
  - `pre-merge/` (12): `tests-unit-integration`, `accessibility`, `api-contract-diff`, `input-validation`, `route-authz`, `sast`, `dependency-audit`, `observability-presence`, `llm-call-resilience`, `prompt-hygiene`, `output-guardrails`, `prompt-evals`
  - `pre-deploy/` (6): `production-build`, `migration-dry-run`, `migration-rollback-present`, `env-config-diff`, `canary-plan-present`, `rollback-plan-present`
  - `post-deploy/` (5): `smoke-tests`, `error-rate-vs-baseline`, `slo-check`, `web-vitals-check`, `auto-rollback-trigger`
- **8 template suites (`templates/`):** `frontend-app/`, `backend-service/`, `ai-endpoint/`, `integration-client/`, `migration/`, `feature-flag/`, `runbook/`, `adr/`, plus skill, gate, and evidence templates.
- **Golden evaluation suites (`evals/`):** `prompt-injection`, `output-guardrails`, `rag-accuracy`, and `refusal-safety` golden sets, rubrics, baselines, and deterministic runner.
- **CLI tooling (`scripts/`):** `scan-secrets.mjs`, `check-bundle.mjs`, `contract-diff.mjs`, `run-evals.mjs`, `smoke-test.mjs`, `check-telemetry.mjs`, `report.mjs`, `scaffold.mjs`, and `build-site.mjs`.
- **Automation (`tests/`, `docs/`, `.github/workflows/`):** Automated contract & fixture tests, GitHub Pages catalog site, CI, nightly eval sweep, and tagged release publishing.

## Install in an existing project

Requirements: Git, Bash (macOS/Linux, or Git Bash on Windows), and Node.js 20+.

```sh
curl -fsSL https://raw.githubusercontent.com/hari7261/web-prod-skills/v2.0.0/install.sh -o /tmp/install-web-prod-skills.sh
bash /tmp/install-web-prod-skills.sh --version v2.0.0 --target .
```

Or clone the repository and run `./install.sh --version v2.0.0 --target /path/to/your/project`.

The installer copies `.web-prod-skills/` (`skills/`, `gates/`, `knowledge/`, `config/`, `templates/`, `evals/`, `scripts/`) and adds an idempotent integration block to your root `AGENTS.md`.

## Quick start

```sh
npm test
npm run evals
npm run report
```

Run an individual gate against your project or a specific directory:

```sh
node gates/pre-commit/secrets-scan/run.mjs --target .
WEB_PROD_CHANGED_FILES="src/api/users.ts" node gates/pre-merge/input-validation/run.mjs
```

## Implemented foundation and limitations

This repository is an engineering standard and gate harness, **not a substitute for runtime security, load, and integration testing in your application**. Static heuristic checks detect common missing controls and unsafe sinks, while report-driven gates (`bundle-budget`, `tests-unit-integration`, `accessibility`, `production-build`, `post-deploy/*`) validate structured outputs produced by your build, test, and telemetry pipelines.

## Repository map

| Path | Purpose |
|---|---|
| `AGENTS.md` | Agent contract, load order, and operating rules |
| `CONTRIBUTING.md` | Contribution rules and scaffolding guide |
| `knowledge/` | 11 shared production baselines, anti-patterns, checklist, and glossary |
| `config/` | Canonical `skills.index.json`, `gates.index.json`, and `severity-levels.yaml` |
| `skills/` | 49 modular skills across 6 web domains |
| `gates/` | 27 deterministic gates across 4 delivery stages with checks and fixtures |
| `templates/` | 8 starter templates plus skill/gate/evidence templates |
| `evals/` | Golden sets, rubrics, baselines, and deterministic eval runner |
| `scripts/` | Shared gate runner library and CLI tools |
| `tests/` | Automated repository contract, fixture, eval, and tooling tests |
| `docs/` | Public GitHub Pages site and crawler metadata |
| `.github/workflows/` | CI, nightly eval sweep, Pages deploy, and tagged release workflows |

## Scope

Web applications only: frontend, backend, AI features, integrations, cross-cutting security/observability, and delivery. Mobile-native apps, desktop apps, games, embedded/firmware, pure ML research, and non-web CLIs are out of scope.

## License

Released under the [MIT License](LICENSE).
