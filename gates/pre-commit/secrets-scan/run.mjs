import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runSecretsCheck } from "./checks/scan.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-commit/secrets-scan",
  stage: "pre-commit",
  checks: [{ id: "secrets-and-env-scan", run: runSecretsCheck }]
});
