import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runErrorRateCheck } from "./checks/error-rate.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "post-deploy/error-rate-vs-baseline",
  stage: "post-deploy",
  checks: [{ id: "error-rate-vs-baseline", run: runErrorRateCheck }]
});
