import path from "node:path";
import { fileExists, readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runDependencyAudit(context) {
  const findings = [];
  const auditRaw = await readTextSafe(path.join(context.targetDir, "audit-report.json"));
  if (auditRaw !== null) {
    try {
      const report = JSON.parse(auditRaw);
      if (Number(report.high ?? 0) > Number(context.config.max_high_vulns ?? 0) || Number(report.critical ?? 0) > Number(context.config.max_critical_vulns ?? 0)) {
        findings.push({ id: "VULNERABLE_DEPENDENCIES", high: report.high ?? 0, critical: report.critical ?? 0, message: "High or critical dependency vulnerabilities found." });
      }
    } catch (err) {
      findings.push({ id: "INVALID_AUDIT_REPORT", file: "audit-report.json", message: err.message });
    }
  }

  const pkgRaw = await readTextSafe(path.join(context.targetDir, "package.json"));
  if (pkgRaw !== null) {
    try {
      const pkg = JSON.parse(pkgRaw);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const entries = Object.entries(allDeps);
      if (context.config.require_pinned_versions !== false) {
        for (const [name, ver] of entries) {
          if (/^[\^~*]|\blatest\b/i.test(String(ver))) {
            findings.push({ id: "UNPINNED_DEPENDENCY", package: name, version: ver, message: `Dependency ${name}@${ver} must be pinned to an exact version.` });
          }
        }
      }
      if (entries.length > 0 && !(await fileExists(path.join(context.targetDir, "sbom.json"))) && !(await fileExists(path.join(context.targetDir, "package-lock.json")))) {
        findings.push({ id: "MISSING_LOCK_OR_SBOM", message: "Project with dependencies requires package-lock.json or sbom.json." });
      }
    } catch (err) {
      findings.push({ id: "INVALID_PACKAGE_JSON", file: "package.json", message: err.message });
    }
  }
  return { findings };
}

