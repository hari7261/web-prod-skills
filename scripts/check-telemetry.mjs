#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getTargetFiles, readTextSafe } from "./lib/files.mjs";

const IO_PATTERNS = [
  /\bfetch\s*\(/,
  /\baxios\./,
  /\bprisma\./,
  /\bpool\.query\s*\(/,
  /\bdb\.query\s*\(/,
  /\bopenai\.|\banthropic\.|\bgenerateText\s*\(|\bstreamText\s*\(/
];

const LOG_MARKERS = ["logger.", "log.info", "log.error", "structuredLog", "pino", "winston"];
const METRIC_MARKERS = ["metrics.", "histogram", "counter", "recordMetric", "promClient", "otelMeter"];
const TRACE_MARKERS = ["startSpan", "withSpan", "tracer.", "trace.getTracer", "otelTrace", "span.end"];

export async function checkTelemetry({ targetDir = process.cwd(), files } = {}) {
  const targetFiles = files ?? (await getTargetFiles(targetDir));
  const findings = [];
  const exts = new Set([".js", ".mjs", ".ts", ".tsx", ".py", ".go"]);

  for (const rel of targetFiles) {
    if (rel.includes("/fixtures/") || rel.includes(".test.") || rel.includes(".spec.") || rel.startsWith("scripts/") || rel.startsWith("gates/") || rel.startsWith("evals/") || rel.startsWith("templates/")) continue;
    if (!exts.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(targetDir, rel));
    if (src === null) continue;
    if (!IO_PATTERNS.some((re) => re.test(src))) continue;
    if (/WEB-PROD-OBSERVABILITY-EXEMPT:\s+\S+/.test(src)) continue;

    const missing = [];
    if (!LOG_MARKERS.some((m) => src.includes(m))) missing.push("structured-log");
    if (!METRIC_MARKERS.some((m) => src.includes(m))) missing.push("metric");
    if (!TRACE_MARKERS.some((m) => src.includes(m))) missing.push("trace-span");

    if (missing.length) {
      findings.push({
        id: "MISSING_OBSERVABILITY_SIGNALS",
        file: rel,
        missing,
        message: `Network/DB/LLM file '${rel}' is missing: ${missing.join(", ")}.`
      });
    }
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targetIdx = process.argv.indexOf("--target");
  const targetDir = targetIdx !== -1 && process.argv[targetIdx + 1] ? path.resolve(process.argv[targetIdx + 1]) : process.cwd();
  const findings = await checkTelemetry({ targetDir });
  console.log(JSON.stringify({ tool: "check-telemetry", status: findings.length ? "fail" : "pass", findings }, null, 2));
  if (findings.length) process.exit(1);
}
