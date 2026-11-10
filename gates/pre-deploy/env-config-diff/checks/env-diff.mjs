import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runEnvConfigDiffCheck(context) {
  const findings = [];
  const diffRaw = await readTextSafe(path.join(context.targetDir, "env-diff.json"));
  if (diffRaw !== null) {
    try {
      const diff = JSON.parse(diffRaw);
      if (context.config.require_reviewed_diff !== false && diff.reviewed !== true) {
        findings.push({ id: "UNREVIEWED_ENV_DIFF", file: "env-diff.json", message: "Environment/config diff has not been reviewed." });
      }
      const removed = Array.isArray(diff.removedProdKeys) ? diff.removedProdKeys : [];
      if (context.config.disallow_unapproved_prod_removals !== false && removed.length > 0 && !diff.removalsApproved) {
        findings.push({ id: "UNAPPROVED_PROD_ENV_REMOVAL", keys: removed, message: `Unapproved removal of production env key(s): ${removed.join(", ")}.` });
      }
    } catch (err) {
      findings.push({ id: "INVALID_ENV_DIFF", file: "env-diff.json", message: err.message });
    }
  }
  return { findings };
}

