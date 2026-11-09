# Migration safety gate

**Severity:** blocking.

This gate validates a reviewed evidence manifest; it does not infer that an implementation is safe from source-code keywords. The manifest is supplied by the CI job or reviewer through `WEB_PROD_EVIDENCE_FILE`.

## Required manifest

A JSON object with:
- `gate`: exact gate identifier `[gates/pre-deploy/migration-safety]`
- `status`: `pass`
- `generated_at`: ISO-8601 timestamp
- `checks`: array of objects with `id`, `status: "pass"`, and non-empty `evidence`

Required check IDs: `forward-plan`, `rollback-or-forward-recovery-test`, `lock-time-estimate`, `backfill-plan`, `mixed-version-compatibility`, `abort-criteria`.

Evidence references must point to actual test reports, dashboards, approved plans or review records. Do not fabricate evidence. The gate rejects missing, stale (older than 7 days), malformed or failing manifests.

## Run

`WEB_PROD_EVIDENCE_FILE=path/to/migration-safety.json npm run gate:migration-safety`

Exit 0 only when the manifest is fresh and complete; otherwise exit 1. A passing manifest proves only that the declared evidence was supplied and passed review, not that the gate independently reran those tests.
