# Changelog

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
