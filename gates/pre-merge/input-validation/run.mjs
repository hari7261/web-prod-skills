import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runValidationCheck } from "./checks/validate.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/input-validation",
  stage: "pre-merge",
  checks: [{ id: "boundary-schema-validation", run: runValidationCheck }]
});
