# Route authorization gate

**Enforces:** production-readiness 2 (security).

**Inputs:** changed-file evidence via `WEB_PROD_CHANGED_FILES`; otherwise tracked source files.

**Checks:** route-like files must show recognized authentication and authorization evidence, or a reasoned `WEB-PROD-AUTHZ-EXEMPT` annotation. The marker heuristic is not proof of correct policy or tenant isolation. Security integration tests remain mandatory.

**Pass criteria:** zero route files missing either evidence marker. Exit 1 on findings.

**Failure format:** JSON on stdout and human summary on stderr.

**Run:** `npm run gate:route-authz`.
