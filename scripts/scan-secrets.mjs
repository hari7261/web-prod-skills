#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getTargetFiles, readTextSafe } from "./lib/files.mjs";

export const SECRET_PATTERNS = [
  { id: "PRIVATE_KEY", re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { id: "AWS_ACCESS_KEY", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "GITHUB_TOKEN", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/ },
  { id: "OPENAI_KEY", re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/ },
  { id: "SLACK_TOKEN", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    id: "GENERIC_SECRET_ASSIGNMENT",
    re: /(?:api[_-]?key|client[_-]?secret|password|access[_-]?token|secret[_-]?key|signing[_-]?secret)\s*[:=]\s*["'`](?!<|YOUR_|EXAMPLE|CHANGEME|test|dummy)[A-Za-z0-9_\-/+=.]{20,}["'`]/i
  }
];

export async function scanSecrets({ targetDir = process.cwd(), files } = {}) {
  const targetFiles = files ?? (await getTargetFiles(targetDir));
  const findings = [];
  for (const rel of targetFiles) {
    if (rel.includes("/fixtures/") || rel.startsWith("fixtures/")) continue;
    if (/^\.env(?:\..+)?$/.test(path.basename(rel)) && path.basename(rel) !== ".env.example" && path.basename(rel) !== ".env.template") {
      findings.push({ id: "COMMITTED_ENV_FILE", file: rel, message: "Environment file must not be committed." });
      continue;
    }
    const content = await readTextSafe(path.resolve(targetDir, rel));
    if (content === null) continue;
    const isClientBundle = /(?:^|\/)(?:dist|build|\.next\/static|public)\//.test(rel) && /\.(?:js|mjs|cjs)$/.test(rel);
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.re.test(content)) {
        findings.push({
          id: isClientBundle ? `BUNDLE_${pattern.id}` : pattern.id,
          file: rel,
          message: isClientBundle
            ? "Potential secret detected in frontend bundle output; rotate and remove from client code."
            : "Potential secret pattern detected; verify and rotate if exposed."
        });
      }
    }
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targetIdx = process.argv.indexOf("--target");
  const targetDir = targetIdx !== -1 && process.argv[targetIdx + 1] ? path.resolve(process.argv[targetIdx + 1]) : process.cwd();
  const findings = await scanSecrets({ targetDir });
  const out = { tool: "scan-secrets", status: findings.length ? "fail" : "pass", findings, summary: findings.length ? `${findings.length} secret finding(s)` : "No secret patterns detected." };
  console.log(JSON.stringify(out, null, 2));
  if (findings.length) process.exit(1);
}

