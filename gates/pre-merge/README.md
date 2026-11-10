# Pre-merge gates

Blocking pull-request checks executed before merging:
- `tests-unit-integration`
- `accessibility`
- `api-contract-diff`
- `input-validation`
- `route-authz`
- `sast`
- `dependency-audit`
- `observability-presence`
- `llm-call-resilience`
- `prompt-hygiene`
- `output-guardrails`
- `prompt-evals`

See `config/gates.index.json` for the canonical index.
