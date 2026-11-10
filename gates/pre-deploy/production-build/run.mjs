import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runProductionBuildCheck } from "./checks/build.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-deploy/production-build",
  stage: "pre-deploy",
  checks: [{ id: "production-build-and-hash", run: runProductionBuildCheck }]
});

