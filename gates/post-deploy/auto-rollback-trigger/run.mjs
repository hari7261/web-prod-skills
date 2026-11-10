import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runAutoRollbackCheck } from "./checks/auto-rollback.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "post-deploy/auto-rollback-trigger",
  stage: "post-deploy",
  checks: [{ id: "auto-rollback-and-incident-record", run: runAutoRollbackCheck }]
});
