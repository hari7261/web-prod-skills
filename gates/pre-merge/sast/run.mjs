import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runSastCheck } from "./checks/sast.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/sast",
  stage: "pre-merge",
  checks: [{ id: "static-security-analysis", run: runSastCheck }]
});
