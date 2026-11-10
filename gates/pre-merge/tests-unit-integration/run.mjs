import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runTestCoverageCheck } from "./checks/tests.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/tests-unit-integration",
  stage: "pre-merge",
  checks: [{ id: "unit-integration-and-coverage", run: runTestCoverageCheck }]
});
