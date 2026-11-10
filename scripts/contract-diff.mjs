#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readTextSafe } from "./lib/files.mjs";

export function detectBreakingChanges(baseSpec, headSpec) {
  const breaking = [];
  const basePaths = baseSpec?.paths && typeof baseSpec.paths === "object" ? baseSpec.paths : {};
  const headPaths = headSpec?.paths && typeof headSpec.paths === "object" ? headSpec.paths : {};

  for (const [routePath, methods] of Object.entries(basePaths)) {
    if (!headPaths[routePath]) {
      breaking.push({ id: "REMOVED_ENDPOINT", path: routePath, message: `Endpoint ${routePath} was removed.` });
      continue;
    }
    for (const [method, baseOp] of Object.entries(methods || {})) {
      const headOp = headPaths[routePath]?.[method];
      if (!headOp) {
        breaking.push({ id: "REMOVED_METHOD", path: routePath, method, message: `Method ${method.toUpperCase()} ${routePath} was removed.` });
        continue;
      }
      const baseReqFields = new Set(baseOp?.requestBody?.requiredFields ?? []);
      const headReqFields = headOp?.requestBody?.requiredFields ?? [];
      for (const field of headReqFields) {
        if (!baseReqFields.has(field)) {
          breaking.push({ id: "NEW_REQUIRED_REQUEST_FIELD", path: routePath, method, field, message: `New required request field '${field}' on ${method.toUpperCase()} ${routePath}.` });
        }
      }
      const baseResFields = baseOp?.response?.fields ?? {};
      const headResFields = headOp?.response?.fields ?? {};
      for (const [field, type] of Object.entries(baseResFields)) {
        if (!(field in headResFields)) {
          breaking.push({ id: "REMOVED_RESPONSE_FIELD", path: routePath, method, field, message: `Response field '${field}' removed on ${method.toUpperCase()} ${routePath}.` });
        } else if (headResFields[field] !== type) {
          breaking.push({ id: "CHANGED_RESPONSE_FIELD_TYPE", path: routePath, method, field, from: type, to: headResFields[field], message: `Response field '${field}' changed type from ${type} to ${headResFields[field]}.` });
        }
      }
    }
  }
  return breaking;
}

export async function checkContractDiff({ targetDir = process.cwd() } = {}) {
  const baseRaw = await readTextSafe(path.join(targetDir, "openapi.base.json"));
  const headRaw = await readTextSafe(path.join(targetDir, "openapi.json"));
  if (!baseRaw || !headRaw) return [];

  let baseSpec, headSpec;
  try {
    baseSpec = JSON.parse(baseRaw);
    headSpec = JSON.parse(headRaw);
  } catch (err) {
    return [{ id: "INVALID_CONTRACT_JSON", message: `Failed parsing OpenAPI contract JSON: ${err.message}` }];
  }

  const breaking = detectBreakingChanges(baseSpec, headSpec);
  if (breaking.length === 0) return [];

  const baseVer = String(baseSpec.info?.version ?? "0.0.0");
  const headVer = String(headSpec.info?.version ?? "0.0.0");
  const baseMajor = Number(baseVer.split(".")[0] || 0);
  const headMajor = Number(headVer.split(".")[0] || 0);
  const changelogRaw = await readTextSafe(path.join(targetDir, "CHANGELOG.md"));

  const findings = [];
  if (headMajor <= baseMajor) {
    findings.push({
      id: "BREAKING_CHANGE_WITHOUT_MAJOR_VERSION_BUMP",
      baseVersion: baseVer,
      headVersion: headVer,
      breaking,
      message: `Breaking API changes detected (${breaking.length}) without a major version bump (${baseVer} -> ${headVer}).`
    });
  }
  if (!changelogRaw || !changelogRaw.includes(headVer)) {
    findings.push({
      id: "BREAKING_CHANGE_WITHOUT_CHANGELOG",
      headVersion: headVer,
      message: `CHANGELOG.md must document breaking API version ${headVer}.`
    });
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targetIdx = process.argv.indexOf("--target");
  const targetDir = targetIdx !== -1 && process.argv[targetIdx + 1] ? path.resolve(process.argv[targetIdx + 1]) : process.cwd();
  const findings = await checkContractDiff({ targetDir });
  console.log(JSON.stringify({ tool: "contract-diff", status: findings.length ? "fail" : "pass", findings }, null, 2));
  if (findings.length) process.exit(1);
}

