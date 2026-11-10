# Migration Rollout & Rollback Plan

- **Migration ID:** `0001_example`
- **Target table row estimate:** `<rows>`
- **Lock-time estimate:** `< 200ms` (`lock_timeout = 2s`, concurrent index build)
- **Backfill strategy:** Batched (`1,000` rows/tx, `100ms` sleep) after expand deploy.
- **Dry-run verified:** Yes (`pre-deploy/migration-dry-run` + `pre-deploy/migration-rollback-present`).

