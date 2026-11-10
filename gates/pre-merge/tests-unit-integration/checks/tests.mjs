import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runTestCoverageCheck(context) {
  const findings = [];
  const minCov = Number(context.config.min_coverage_pct ?? 80);
  const reportRaw = await readTextSafe(path.join(context.targetDir, "test-report.json"));
  if (reportRaw !== null) {
    let report;
    try {
      report = JSON.parse(reportRaw);
    } catch (err) {
      return { findings: [{ id: "INVALID_TEST_REPORT", file: "test-report.json", message: err.message }] };
    }
    if (Number(report.failed ?? 0) > 0) {
      findings.push({ id: "TESTS_FAILED", failed: report.failed, message: `${report.failed} unit/integration test(s) failed.` });
    }
    if (Number(report.passed ?? 0) <= 0) {
      findings.push({ id: "NO_TESTS_EXECUTED", message: "Test report indicates zero passing tests." });
    }
    if (typeof report.coveragePct === "number" && report.coveragePct < minCov) {
      findings.push({ id: "LOW_COVERAGE", coveragePct: report.coveragePct, requiredPct: minCov, message: `Coverage ${report.coveragePct}% is below minimum ${minCov}%.` });
    }
    return { findings };
  }

  const testFiles = context.files.filter((f) => /\.(?:test|spec)\.[jt]sx?$|\.test\.mjs$|_test\.go$|test_.*\.py$/.test(f));
  const sourceFiles = context.files.filter((f) => /\.(?:[jt]sx?|mjs|py|go)$/.test(f) && !testFiles.includes(f));
  if (context.config.require_test_files !== false && sourceFiles.length > 0 && testFiles.length === 0) {
    findings.push({ id: "NO_TEST_FILES_FOUND", message: "No unit or integration test files found in target." });
  }
  return { findings };
}

