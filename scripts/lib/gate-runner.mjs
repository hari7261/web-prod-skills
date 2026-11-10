import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseYaml } from "./yaml.mjs";
import { getTargetFiles } from "./files.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");

export function parseGateArgs(argv = process.argv.slice(2)) {
  const args = {
    targetDir: process.env.WEB_PROD_TARGET_DIR || process.cwd(),
    changed: process.env.WEB_PROD_CHANGED_FILES || "",
    evidenceFile: process.env.WEB_PROD_EVIDENCE_FILE || "",
    quiet: false
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--target" && argv[i + 1]) {
      args.targetDir = path.resolve(argv[++i]);
    } else if (token === "--changed" && argv[i + 1]) {
      args.changed = argv[++i];
    } else if (token === "--evidence" && argv[i + 1]) {
      args.evidenceFile = argv[++i];
    } else if (token === "--quiet") {
      args.quiet = true;
    }
  }
  return args;
}

export async function loadGateConfig(gateDir) {
  const cfgPath = path.join(gateDir, "config.yaml");
  const raw = await readFile(cfgPath, "utf8");
  return parseYaml(raw);
}

export async function loadSeverityLevels() {
  const sevPath = path.join(REPO_ROOT, "config", "severity-levels.yaml");
  const raw = await readFile(sevPath, "utf8");
  return parseYaml(raw);
}

export async function runGate({ gateDir, gateId, stage, checks }) {
  const args = parseGateArgs();
  const config = await loadGateConfig(gateDir);
  const severitySpec = await loadSeverityLevels();
  const severity = config.severity || severitySpec.default || "block";
  const targetDir = path.resolve(args.targetDir);
  const files = await getTargetFiles(targetDir, { changedEnv: args.changed });

  const context = {
    targetDir,
    files,
    config,
    evidenceFile: args.evidenceFile,
    gateDir,
    repoRoot: REPO_ROOT
  };

  const checkResults = [];
  const findings = [];

  for (const check of checks) {
    const outcome = await check.run(context);
    const checkFindings = Array.isArray(outcome?.findings) ? outcome.findings : [];
    findings.push(...checkFindings);
    checkResults.push({
      id: check.id,
      status: checkFindings.length === 0 ? "pass" : "fail",
      finding_count: checkFindings.length,
      details: outcome?.summary || (checkFindings.length === 0 ? "Passed" : `${checkFindings.length} finding(s)`)
    });
  }

  const passed = findings.length === 0;
  const behavior = severitySpec.levels?.[severity]?.behavior || "fail";
  const status = passed ? "pass" : "fail";
  const result = {
    gate: gateId,
    stage,
    status,
    severity,
    target: targetDir,
    timestamp: new Date().toISOString(),
    checks: checkResults,
    findings,
    summary: passed
      ? `[PASS] ${gateId}: all ${checkResults.length} check(s) passed.`
      : `[FAIL] ${gateId}: ${findings.length} finding(s) across ${checkResults.filter((c) => c.status === "fail").length} check(s).`
  };

  if (!args.quiet) {
    console.log(JSON.stringify(result, null, 2));
    if (!passed) {
      console.error(result.summary);
    }
  }

  if (!passed && behavior === "fail") {
    process.exitCode = 1;
  }

  return result;
}

export async function evaluateEvidenceOrStatic({
  context,
  gateId,
  requiredChecks = [],
  maxAgeDays = 7,
  staticCheck
}) {
  if (context.evidenceFile) {
    const findings = [];
    let manifest;
    try {
      manifest = JSON.parse(await readFile(path.resolve(context.evidenceFile), "utf8"));
    } catch (err) {
      return {
        findings: [{ id: "INVALID_EVIDENCE_FILE", message: `Cannot read/parse evidence JSON: ${err.message}` }]
      };
    }
    if (manifest.gate !== gateId && manifest.gate !== `gates/${gateId}`) {
      findings.push({ id: "GATE_ID_MISMATCH", message: `Expected gate ${gateId}, got ${manifest.gate}.` });
    }
    if (manifest.status !== "pass") {
      findings.push({ id: "MANIFEST_NOT_PASSING", message: "Evidence manifest status must be 'pass'." });
    }
    const ts = Date.parse(manifest.generated_at ?? "");
    if (!Number.isFinite(ts) || ts > Date.now() + 300_000 || Date.now() - ts > maxAgeDays * 86_400_000) {
      findings.push({ id: "STALE_OR_INVALID_EVIDENCE", message: `generated_at must be valid and <= ${maxAgeDays} days old.` });
    }
    const items = Array.isArray(manifest.checks) ? manifest.checks : [];
    for (const id of requiredChecks) {
      const match = items.find((x) => x?.id === id);
      if (!match || match.status !== "pass" || typeof match.evidence !== "string" || !match.evidence.trim()) {
        findings.push({ id: "MISSING_OR_FAILED_EVIDENCE", check: id, message: `Missing passing evidence for ${id}.` });
      }
    }
    return { findings };
  }

  return staticCheck(context);
}
