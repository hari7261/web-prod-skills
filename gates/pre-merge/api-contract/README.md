# API contract gate

Blocking evidence-manifest gate for api contract. It checks the presence, status and freshness of reviewer-supplied evidence; it does not independently run browser audits or API compatibility suites.

Set `WEB_PROD_EVIDENCE_FILE` to a JSON manifest with `gate: "gates/pre-merge/api-contract"`, `status: "pass"`, a current ISO `generated_at`, and `checks[]` entries containing `id`, `status: "pass"`, and non-empty `evidence`. Required IDs: schema-diff, compatibility-tests, changelog-review. Evidence must be less than seven days old.

Run: `WEB_PROD_EVIDENCE_FILE=report.json node gates/pre-merge/api-contract/run.mjs`. Exit 1 on missing, stale or failing evidence.
