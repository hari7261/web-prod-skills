import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runAutoRollbackCheck(context) {
  const findings = [];
  const raw = await readTextSafe(path.join(context.targetDir, "post-deploy-status.json"));
  if (raw === null) return { findings };
  let state;
  try {
    state = JSON.parse(raw);
  } catch (err) {
    return { findings: [{ id: "INVALID_POST_DEPLOY_STATUS", file: "post-deploy-status.json", message: err.message }] };
  }
  if (typeof state.rollbackCommand !== "string" || !state.rollbackCommand.trim()) {
    findings.push({ id: "MISSING_ROLLBACK_HOOK", message: "Automated rollback command must be configured." });
  }
  if (state.healthy === false) {
    if (state.rollbackTriggered !== true) {
      findings.push({ id: "AUTO_ROLLBACK_NOT_TRIGGERED", message: "Post-deploy check failed without triggering automated rollback." });
    }
    if (context.config.require_incident_link_on_rollback !== false && (typeof state.incidentUrl !== "string" || !state.incidentUrl.trim())) {
      findings.push({ id: "MISSING_INCIDENT_LINK", message: "Rollback triggered without recording an incident link." });
    }
  }
  return { findings };
}

