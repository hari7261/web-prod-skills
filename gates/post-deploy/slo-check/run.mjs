import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runSloCheck } from "./checks/slo.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "post-deploy/slo-check",
  stage: "post-deploy",
  checks: [{ id: "slo-budget-compliance", run: runSloCheck }]
});
