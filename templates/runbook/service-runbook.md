# Service Runbook: `<service-name>`

- **Owner:** `<team-or-handle>`
- **SLO:** Availability >= 99.9%, p99 latency <= 400ms
- **Dashboards:** `<dashboard-url>`
- **Canary & Rollback:** `canary: 5% for 15m; abort if 5xx > 1% or p99 > 600ms; rollback via scripts/rollback.sh`

## Triage steps
1. Check error-rate and latency dashboards for recent deploy markers.
2. Inspect structured logs filtered by `trace_id` and `error_code` (ensure PII is scrubbed).
3. If caused by recent release or flag, execute rollback immediately before deep-dive debugging.

## Rollback command
1. Disable feature flag (`killSwitch = false`) or run deployment rollback to previous immutable tag.
2. Verify `post-deploy/smoke-tests` and `post-deploy/error-rate-vs-baseline` recover.
3. Open postmortem within 24 hours for Sev-1/Sev-2 incidents.

