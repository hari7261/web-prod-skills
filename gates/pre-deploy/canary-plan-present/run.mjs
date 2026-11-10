import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runCanaryPlanCheck } from "./checks/canary.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-deploy/canary-plan-present",
  stage: "pre-deploy",
  checks: [{ id: "canary-plan-and-abort-criteria", run: runCanaryPlanCheck }]
});

