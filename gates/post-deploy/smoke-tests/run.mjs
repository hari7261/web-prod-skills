import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runSmokeGateCheck } from "./checks/smoke.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "post-deploy/smoke-tests",
  stage: "post-deploy",
  checks: [{ id: "critical-path-smoke-tests", run: runSmokeGateCheck }]
});

