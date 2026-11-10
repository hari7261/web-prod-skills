import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runMigrationRollbackCheck } from "./checks/rollback.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-deploy/migration-rollback-present",
  stage: "pre-deploy",
  checks: [{ id: "down-migration-present-and-tested", run: runMigrationRollbackCheck }]
});

