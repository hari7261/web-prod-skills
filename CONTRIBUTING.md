# Contributing to Web Prod Skills

Thank you for contributing! This repository is the production-readiness source of truth for web applications. Every contribution must keep `knowledge/`, `skills/`, `gates/`, `templates/`, `evals/`, `scripts/`, and `config/` synchronized and tested.

## Contribution rules

1. **Stay in scope:** Web frontend, backend, AI features, third-party integrations, cross-cutting security/observability, and delivery only.
2. **Follow contracts:**
   - New or modified skills must follow `templates/skill.template.md` (mandatory YAML frontmatter and 7 ordered body sections, concise and composable).
   - New or modified gates must follow `templates/gate.template.md` (have `README.md`, `run.mjs`, `checks/`, `config.yaml`, and passing + failing `fixtures/`).
3. **Keep indexes synchronized:** Update `config/skills.index.json`, `config/gates.index.json`, `README.md`, and run `node scripts/build-site.mjs` when adding or renaming skills or gates.
4. **No bypassed gates:** Run the full verification suite locally before opening a pull request.

## Local verification

```sh
npm test
npm run check
npm run evals
npm run report
```

## Scaffolding a new component

Use `node scripts/scaffold.mjs` to generate compliant skill, gate, or template files:

```sh
node scripts/scaffold.mjs --type skill --domain backend --name example-skill --gate gates/pre-merge/input-validation
node scripts/scaffold.mjs --type gate --stage pre-merge --name example-gate
```
