import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runWebVitalsCheck } from "./checks/vitals.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "post-deploy/web-vitals-check",
  stage: "post-deploy",
  checks: [{ id: "core-web-vitals-targets", run: runWebVitalsCheck }]
});

