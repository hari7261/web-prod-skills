# pre-merge/dependency-audit

## Production-readiness items enforced
- 2. Security

## Inputs
- `package.json`, `audit-report.json` (if present), and `sbom.json` (when dependencies are declared).

## Pass criteria
- Zero high/critical vulnerabilities, all dependencies pinned (no `*`, `latest`, `^`, `~`), and SBOM present when dependencies exist.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/dependency-audit/run.mjs
```

