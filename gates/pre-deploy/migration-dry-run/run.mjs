import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runMigrationDryRunCheck } from "./checks/dry-run.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-deploy/migration-dry-run",
  stage: "pre-deploy",
  checks: [{ id: "migration-dry-run-and-locks", run: runMigrationDryRunCheck }]
});
