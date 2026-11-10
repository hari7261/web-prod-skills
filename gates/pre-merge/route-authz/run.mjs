import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runRouteAuthzCheck } from "./checks/authz.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/route-authz",
  stage: "pre-merge",
  checks: [{ id: "route-authn-authz-tenant-scope", run: runRouteAuthzCheck }]
});
