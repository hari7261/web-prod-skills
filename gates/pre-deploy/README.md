# Pre-deploy gates

Release-readiness checks executed before shifting production traffic:
- `production-build`
- `migration-dry-run`
- `migration-rollback-present`
- `env-config-diff`
- `canary-plan-present`
- `rollback-plan-present`

See `config/gates.index.json` for the canonical index.
