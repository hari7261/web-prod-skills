import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runEnvConfigDiffCheck } from "./checks/env-diff.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-deploy/env-config-diff",
  stage: "pre-deploy",
  checks: [{ id: "env-config-diff-review", run: runEnvConfigDiffCheck }]
});

