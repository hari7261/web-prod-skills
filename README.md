# Web Prod Skills

**Production-readiness skills, security gates and engineering standards for AI coding agents and web application teams.**

[![CI](https://github.com/hari7261/web-prod-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/hari7261/web-prod-skills/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/hari7261/web-prod-skills/actions/workflows/pages.yml/badge.svg)](https://github.com/hari7261/web-prod-skills/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Project website:** https://hari7261.github.io/web-prod-skills/  
**Repository:** https://github.com/hari7261/web-prod-skills

Web Prod Skills is an open-source toolkit for making AI-assisted web engineering more systematic and auditable. It provides reusable agent instructions, implementation skills, engineering baselines, quality/security gates, starter eval assets and CI automation.

## What is included

- **Agent contract:** `AGENTS.md` defines repository-level expectations and a production-oriented definition of done.
- **10 indexed skills:** secrets management, input validation, authentication/authorization, LLM output safety, prompt/eval versioning, external integrations, observability, database migrations, accessibility/performance and API contracts.
- **10 indexed gates:** secrets scan, input validation, route authorization, AI eval evidence, integration resilience, observability evidence, frontend quality, API contract, migration safety and LLM output safety.
- **Knowledge baselines:** web security, reliability, AI features, frontend, backend and integrations.
- **Templates and evals:** skill/gate templates, evidence manifest, starter JSONL dataset and scoring rubric.
- **Automation:** GitHub Actions CI and a static documentation site deployed with GitHub Pages.

## Documentation website and publishing

The website source lives in `docs/` in this repository. It is intentionally static (no build framework or runtime dependency).

After the Pages workflow is merged into `main` and GitHub Pages is configured to use **GitHub Actions**, every push to `main` that changes `docs/**` or the Pages workflow automatically validates and deploys the site. The workflow can also be started manually.

The site includes:
- Search-oriented title, description and relevant topic metadata.
- Canonical URL, Open Graph and Twitter metadata.
- Schema.org `SoftwareSourceCode` structured data.
- `robots.txt`, XML sitemap and an `llms.txt` discovery file.
- Direct links to source documentation, indexes, skills, gates and license.

SEO and GEO (Generative Engine Optimization) improve discoverability signals; they do **not** guarantee indexing, rankings, citations or inclusion in AI chatbot answers. Search engines and AI products independently decide whether and when to crawl, index and cite public content. Submit the sitemap in Google Search Console and Bing Webmaster Tools after deployment, and keep substantive, accurate documentation on the canonical site and repository.

## Implemented foundation and limitations

This repository is an evolving engineering foundation, **not a certification or guarantee of production safety**.

The secrets, input-validation and route-authorization runners are static heuristics. They do not replace provider secret scanning, history scanning, AST-aware analysis, SAST, or runtime authorization and tenant-isolation tests.

Evidence-manifest gates validate that a reviewer-supplied manifest is complete, passing and no more than seven days old. They do **not** independently execute the referenced browser audits, integration tests, evals, migration tests or observability checks. A passing manifest proves only that the declared evidence was supplied in the expected format. Consuming projects must generate genuine evidence tied to the exact commit.

Read each gate's README and limitations before using it as a release blocker.

## Quick start

Requirements: Node.js 20+.

```sh
npm test
npm run gate:secrets
npm run gate:input-validation
npm run gate:route-authz
```

Evidence-manifest gates are available through:

```sh
npm run gate:ai-evals
npm run gate:llm-safety
npm run gate:integrations
npm run gate:observability
npm run gate:frontend
npm run gate:api-contract
npm run gate:migrations
```

Set `WEB_PROD_EVIDENCE_FILE` to the appropriate reviewed JSON manifest before running an evidence gate. Changed-file static gates accept newline-separated paths in `WEB_PROD_CHANGED_FILES`; without it, they inspect tracked source files.

## Repository map

| Path | Purpose |
|---|---|
| `AGENTS.md` | Agent contract and repository workflow |
| `skills/` | Indexed implementation skills |
| `gates/` | Static and evidence-manifest gates |
| `knowledge/` | Shared engineering baselines |
| `config/` | Skill and gate indexes |
| `templates/` | Reusable authoring templates |
| `evals/` | Starter LLM evaluation data and rubric |
| `tests/` | Automated tests for repository tooling |
| `docs/` | Public project website and crawler metadata |
| `.github/workflows/` | CI and Pages deployment |

## Scope

Web applications: frontend, backend, AI features, integrations, security, observability and delivery. Mobile-native apps, desktop apps, games, embedded systems and pure ML research are out of scope.

## Contributing

Read [AGENTS.md](AGENTS.md), preserve the documented skill/gate contracts, add tests for behavior changes, and never claim a gate passed without executing it or verifying current-commit CI evidence. See [CHANGELOG.md](CHANGELOG.md) for project history.

## License

Released under the [MIT License](LICENSE).
