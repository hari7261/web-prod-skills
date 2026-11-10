import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runObservabilityCheck } from "./checks/telemetry.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/observability-presence",
  stage: "pre-merge",
  checks: [{ id: "logs-metrics-traces-presence", run: runObservabilityCheck }]
});
