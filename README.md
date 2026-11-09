# web-prod-skills

web-prod-skills is a skill + gate repo for web applications (frontend + backend + AI + integrations). skills/ tells the agent how to do production work, gates/ refuses to let it claim done without proof, knowledge/ defines the bar once, templates/ remove the excuse of wrong structure, and evals/ keep AI behavior from regressing. That combination is what makes it production, not college project.

## Implemented foundation

- Agent contract and ten-part production definition of done.
- Frontend, backend, AI, security, reliability and integration baselines.
- Ten indexed implementation skills across frontend, backend, AI, integrations, observability and secrets.
- Blocking gates for secrets, input validation, route authorization, LLM output safety, prompt eval evidence, integration resilience, observability, frontend quality, API contracts and migration safety.
- Evidence manifest template, starter eval dataset/rubric, skill/gate templates and CI workflow.

## Important gate limitations

The secrets, input-validation and route-authorization runners are static heuristics. They do not replace secret-provider/history scanning, AST-aware analysis, SAST, or runtime authorization and tenant-isolation tests.

Evidence-manifest gates validate that a reviewer-supplied manifest is complete, passing and no more than seven days old. They do **not** independently execute the referenced browser audits, integration tests, evals, migration tests or observability checks. CI must generate and attach genuine evidence before these gates are considered release proof.

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

Evidence gates are available as `npm run gate:ai-evals`, `gate:llm-safety`, `gate:integrations`, `gate:observability`, `gate:frontend`, `gate:api-contract` and `gate:migrations`. Set `WEB_PROD_EVIDENCE_FILE` to the appropriate reviewed JSON manifest before running them.

Changed-file static gates accept newline-separated paths in `WEB_PROD_CHANGED_FILES`. Without it, they inspect tracked source files.

## Scope

Web applications only: frontend, backend, AI features, integrations, security, observability and delivery. Mobile-native, desktop, games, embedded systems and pure ML research are out of scope.
