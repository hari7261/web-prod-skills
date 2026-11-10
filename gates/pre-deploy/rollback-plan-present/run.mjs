import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runRollbackPlanCheck } from "./checks/rollback-plan.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-deploy/rollback-plan-present",
  stage: "pre-deploy",
  checks: [{ id: "deploy-rollback-documented-and-tested", run: runRollbackPlanCheck }]
});
