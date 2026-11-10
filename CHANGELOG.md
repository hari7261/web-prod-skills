# Changelog

## [2.0.0] - 2026-11-10

End-to-end production-ready release implementing the complete 49-skill, 27-gate, template, eval, and tooling specification.

### Added
- **49 indexed skills** across 6 web domains (`frontend/` 9, `backend/` 11, `ai-features/` 10, `integrations/` 5, `cross-cutting/` 9, `delivery/` 5), including `skills/integrations/webhook-handling/scripts/check-webhook-safety.mjs` and `skills/backend/input-validation/` resources and scripts.
- **27 executable gates** across 4 stages (`pre-commit/` 4, `pre-merge/` 12, `pre-deploy/` 6, `post-deploy/` 5), each with `README.md`, `run.mjs`, `checks/`, `config.yaml`, and passing + failing `fixtures/`.
- **3 additional knowledge baselines:** `knowledge/anti-patterns.md`, `knowledge/review-checklist.md`, `knowledge/glossary.md` (11 total knowledge files).
- **8 production starter templates:** `frontend-app/`, `backend-service/`, `ai-endpoint/`, `integration-client/`, `migration/`, `feature-flag/`, `runbook/`, `adr/`.
- **Golden eval suites & runner:** `evals/golden-sets/` (`prompt-injection`, `output-guardrails`, `rag-accuracy`, `refusal-safety`), `evals/rubrics/` (`correctness.md`, `safety.md`, `tone.md`), `evals/baselines/v2.0.0.json`, and `evals/runners/run-suite.mjs`.
- **Shared library & CLI tooling:** `scripts/lib/` (`yaml.mjs`, `files.mjs`, `gate-runner.mjs`), `scan-secrets.mjs`, `check-bundle.mjs`, `contract-diff.mjs`, `run-evals.mjs`, `smoke-test.mjs`, `check-telemetry.mjs`, `report.mjs`, and `scaffold.mjs`.
- **Repository governance & automation:** `CONTRIBUTING.md`, `.github/workflows/nightly.yml`, expanded CI and automated fixture/contract tests in `tests/`.

### Changed
- Updated `config/skills.index.json` and `config/gates.index.json` to version 2 with exact 1:1 coverage across all 49 skills and 27 gates.
- Updated `install.sh` to copy `scripts/` and `VERSION` alongside skills, gates, knowledge, config, templates, and evals.

## [1.0.0] - 2026-11-10

First versioned release of Web Prod Skills.

### Added
- Repository-level agent operating contract and production-readiness definition of done.
- Ten indexed skills covering secrets, validation, authentication/authorization, LLM safety, prompt evals, integrations, observability, migrations, accessibility/performance and API contracts.
- Ten indexed quality and security gates.
- Knowledge baselines, reusable templates, starter LLM evaluation dataset and rubric.
- Static gate runners and evidence-manifest validation.
- Public documentation site, crawler metadata and GitHub Pages publishing workflow.
- Versioned installer that copies skills, gates, knowledge, indexes, templates and eval assets into a consuming repository.

### Limitations
- Some gates are static heuristics and can produce false positives or false negatives.
- Evidence-manifest gates validate supplied declarations; they do not independently execute the underlying tests.
- This release does not provide framework-specific runtime security tests or universal CI integration.
- This is a source-distributed toolkit, not an npm package.
