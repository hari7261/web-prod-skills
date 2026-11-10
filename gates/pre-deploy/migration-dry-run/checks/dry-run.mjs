import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runMigrationDryRunCheck(context) {
  const findings = [];
  const dryRaw = await readTextSafe(path.join(context.targetDir, "migration-dry-run.json"));
  if (dryRaw !== null) {
    try {
      const report = JSON.parse(dryRaw);
      if (report.applied !== true) {
        findings.push({ id: "MIGRATION_DRY_RUN_FAILED", message: "Migration dry-run did not apply cleanly." });
      }
      const maxLock = Number(context.config.max_lock_ms ?? 2000);
      if (Number(report.estimatedLockMs ?? 0) > maxLock) {
        findings.push({ id: "LOCK_TIME_EXCEEDED", estimatedLockMs: report.estimatedLockMs, maxLockMs: maxLock, message: `Estimated lock time ${report.estimatedLockMs}ms exceeds ${maxLock}ms.` });
      }
    } catch (err) {
      findings.push({ id: "INVALID_DRY_RUN_REPORT", file: "migration-dry-run.json", message: err.message });
    }
  }

  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("templates/")) continue;
    if (!rel.endsWith(".up.sql")) continue;
    const sql = await readTextSafe(path.resolve(context.targetDir, rel));
    if (sql === null) continue;
    if (/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?!CONCURRENTLY)/i.test(sql)) {
      findings.push({ id: "BLOCKING_INDEX_BUILD", file: rel, message: "Use CREATE INDEX CONCURRENTLY to avoid table write locks." });
    }
    if (context.config.require_lock_timeout !== false && !/lock_timeout/i.test(sql)) {
      findings.push({ id: "MISSING_LOCK_TIMEOUT", file: rel, message: "Migration must set lock_timeout." });
    }
  }
  return { findings };
}
