import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runContractDiffCheck } from "./checks/diff.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/api-contract-diff",
  stage: "pre-merge",
  checks: [{ id: "openapi-breaking-diff", run: runContractDiffCheck }]
});

