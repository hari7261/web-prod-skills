import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runProductionBuildCheck(context) {
  const findings = [];
  const reportRaw = await readTextSafe(path.join(context.targetDir, "build-report.json"));
  if (reportRaw !== null) {
    try {
      const report = JSON.parse(reportRaw);
      if (report.status !== "pass") {
        findings.push({ id: "PRODUCTION_BUILD_FAILED", message: "Production build status is not 'pass'." });
      }
      if (context.config.require_artifact_hash !== false && (typeof report.artifactHash !== "string" || report.artifactHash.trim().length < 16)) {
        findings.push({ id: "MISSING_BUILD_ARTIFACT_HASH", message: "Build report must record an immutable artifactHash (>= 16 chars)." });
      }
    } catch (err) {
      findings.push({ id: "INVALID_BUILD_REPORT", file: "build-report.json", message: err.message });
    }
  }
  return { findings };
}
