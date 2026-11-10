import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runDependencyAudit } from "./checks/audit.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/dependency-audit",
  stage: "pre-merge",
  checks: [{ id: "dependency-pinning-and-vulns", run: runDependencyAudit }]
});

