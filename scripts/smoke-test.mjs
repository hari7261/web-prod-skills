#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readTextSafe } from "./lib/files.mjs";

export async function runSmokeChecks({ targetDir = process.cwd(), baseUrl = process.env.WEB_PROD_SMOKE_URL || "", timeoutMs = 5000 } = {}) {
  const findings = [];
  const reportRaw = await readTextSafe(path.join(targetDir, "smoke-report.json"));
  if (reportRaw !== null) {
    let report;
    try {
      report = JSON.parse(reportRaw);
    } catch (err) {
      return [{ id: "INVALID_SMOKE_REPORT", file: "smoke-report.json", message: err.message }];
    }
    const checks = Array.isArray(report.checks) ? report.checks : [];
    if (checks.length === 0) {
      findings.push({ id: "EMPTY_SMOKE_SUITE", message: "Smoke report contains zero executed critical-path checks." });
    }
    for (const chk of checks) {
      if (chk.status !== "pass") {
        findings.push({ id: "SMOKE_CHECK_FAILED", name: chk.name || "unnamed", statusCode: chk.statusCode, message: chk.message || `Smoke check ${chk.name} failed.` });
      }
    }
    return findings;
  }

  if (baseUrl) {
    const targetsRaw = await readTextSafe(path.join(targetDir, "smoke-targets.json"));
    const endpoints = targetsRaw ? JSON.parse(targetsRaw).endpoints || ["/health"] : ["/health"];
    for (const ep of endpoints) {
      const url = new URL(ep.path || ep, baseUrl).toString();
      const expected = ep.expectedStatus || 200;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (res.status !== expected) {
          findings.push({ id: "SMOKE_HTTP_STATUS_MISMATCH", url, expected, actual: res.status, message: `Expected ${expected} from ${url}, got ${res.status}.` });
        }
      } catch (err) {
        findings.push({ id: "SMOKE_REQUEST_ERROR", url, message: err.message });
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targetIdx = process.argv.indexOf("--target");
  const targetDir = targetIdx !== -1 && process.argv[targetIdx + 1] ? path.resolve(process.argv[targetIdx + 1]) : process.cwd();
  const findings = await runSmokeChecks({ targetDir });
  console.log(JSON.stringify({ tool: "smoke-test", status: findings.length ? "fail" : "pass", findings }, null, 2));
  if (findings.length) process.exit(1);
}
