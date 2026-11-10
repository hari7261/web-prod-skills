import path from "node:path";
import { spawnSync } from "node:child_process";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runLintCheck(context) {
  const findings = [];
  const reportRaw = await readTextSafe(path.join(context.targetDir, "lint-report.json"));
  if (reportRaw !== null) {
    try {
      const report = JSON.parse(reportRaw);
      if (Number(report.errors ?? 0) > 0 || Number(report.typeErrors ?? 0) > 0) {
        findings.push({
          id: "LINT_OR_TYPECHECK_FAILED",
          file: "lint-report.json",
          message: `Lint/typecheck report has ${report.errors ?? 0} lint error(s) and ${report.typeErrors ?? 0} type error(s).`
        });
      }
    } catch (err) {
      findings.push({ id: "INVALID_LINT_REPORT", file: "lint-report.json", message: err.message });
    }
  }

  for (const rel of context.files) {
    if (rel.includes("/fixtures/")) continue;
    const abs = path.resolve(context.targetDir, rel);
    const ext = path.extname(rel);
    if (ext === ".json") {
      const raw = await readTextSafe(abs);
      if (raw !== null) {
        try {
          JSON.parse(raw);
        } catch (err) {
          findings.push({ id: "INVALID_JSON", file: rel, message: err.message });
        }
      }
    } else if (ext === ".js" || ext === ".mjs") {
      const raw = await readTextSafe(abs);
      if (raw !== null) {
        if (/^(?:<<<<<<<|>>>>>>>)\s/m.test(raw)) {
          findings.push({ id: "MERGE_CONFLICT_MARKER", file: rel, message: "Unresolved merge conflict marker found." });
        }
        if (context.config.allow_debugger === false && /\bdebugger\s*;?/.test(raw) && !rel.startsWith("gates/")) {
          findings.push({ id: "DEBUGGER_STATEMENT", file: rel, message: "Remove debugger statement before commit." });
        }
      }
      const res = spawnSync(process.execPath, ["--check", abs], { encoding: "utf8" });
      if (res.status !== 0) {
        findings.push({ id: "JS_SYNTAX_ERROR", file: rel, message: (res.stderr || "Syntax check failed").trim().split("\n")[0] });
      }
    }
  }
  return { findings };
}
