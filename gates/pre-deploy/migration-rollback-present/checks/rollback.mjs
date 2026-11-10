import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runMigrationRollbackCheck(context) {
  const findings = [];
  const dryRaw = await readTextSafe(path.join(context.targetDir, "migration-dry-run.json"));
  if (dryRaw !== null) {
    try {
      const report = JSON.parse(dryRaw);
      if (context.config.require_tested_down_migration !== false && report.rollbackTested !== true) {
        findings.push({ id: "ROLLBACK_NOT_TESTED", message: "Down migration was not tested in dry-run." });
      }
    } catch (err) {
      findings.push({ id: "INVALID_DRY_RUN_REPORT", file: "migration-dry-run.json", message: err.message });
    }
  }

  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("templates/")) continue;
    if (!rel.endsWith(".up.sql")) continue;
    const downRel = rel.replace(/\.up\.sql$/, ".down.sql");
    const downSql = await readTextSafe(path.resolve(context.targetDir, downRel));
    if (downSql === null || !downSql.trim()) {
      findings.push({ id: "MISSING_DOWN_MIGRATION", file: rel, expected: downRel, message: `Missing or empty rollback migration '${downRel}'.` });
    }
  }
  return { findings };
}
