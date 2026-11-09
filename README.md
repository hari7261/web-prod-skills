# web-prod-skills

web-prod-skills is a skill + gate repo for web applications (frontend + backend + AI + integrations). skills/ tells the agent how to do production work, gates/ refuses to let it claim done without proof, knowledge/ defines the bar once, templates/ remove the excuse of wrong structure, and evals/ keep AI behavior from regressing. That combination is what makes it production, not college project.

## Current implementation status

This repository is being built in enforceable increments. The initial foundation includes the agent contract, the ten production principles, the definition of done, machine-readable skill/gate indexes, and three blocking gate entrypoints:
- `pre-commit/secrets-scan`
- `pre-merge/input-validation`
- `pre-merge/route-authz`

The first gate implementations use conservative static heuristics. They are not substitutes for provider secret scanning, framework-aware AST analysis, SAST, or runtime security tests. A clean heuristic scan is limited evidence, not proof of production security.

## Agent entrypoint

Read [AGENTS.md](AGENTS.md) before changing this repository.

## Run locally

Requirements: Node.js 20+.

```sh
npm test
npm run gate:secrets
npm run gate:input-validation
npm run gate:route-authz
```

Changed-file gates accept newline-separated paths in `WEB_PROD_CHANGED_FILES`. Without it, they inspect tracked source files in the current checkout.

## Gate contract

Each gate emits a JSON result to stdout and a human summary to stderr, returning exit code 1 on blocking findings. A gate pass only proves the checks implemented by that gate ran and passed; it does not imply unrelated production-readiness requirements are satisfied.

## Scope

Web applications only: frontend, backend, AI features, integrations, security, observability, and delivery. Mobile-native, desktop, games, embedded systems, and pure ML research are out of scope.
