# Input validation gate

**Enforces:** production-readiness 1 (correctness) and 2 (security).

**Inputs:** changed-file evidence supplied through `WEB_PROD_CHANGED_FILES` (newline-separated paths). If unset, scans tracked source files from the current checkout.

**Checks:** every changed server handler must contain a recognized schema-validation marker or an explicit allowlisted exemption comment with a reason. This deliberately conservative heuristic cannot prove runtime schema correctness; pair it with framework-specific integration tests.

**Pass criteria:** no handler-like file without schema validation evidence. Exit 1 on findings.

**Failure format:** JSON on stdout and human summary on stderr.

**Run:** `npm run gate:input-validation`.
