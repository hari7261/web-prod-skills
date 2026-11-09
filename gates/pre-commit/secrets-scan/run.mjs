import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules", "dist", "coverage"]);
const findings = [];
const patterns = [
  { id: "PRIVATE_KEY", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { id: "CLOUD_ACCESS_KEY", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "GENERIC_SECRET_ASSIGNMENT", re: /(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[:=]\s*["'`]?[A-Za-z0-9_\-/+=]{20,}/i }
];
async function walk(dir) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    if (ent.isDirectory() && ignored.has(ent.name)) continue;
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(file);
    else if (ent.isFile()) {
      const rel = path.relative(root, file).replaceAll(path.sep, "/");
      if ((/^\.env(?:\..+)?$/.test(rel) && rel !== ".env.example")) {
        findings.push({ id: "COMMITTED_ENV_FILE", file: rel, message: "Environment file must not be committed." });
        continue;
      }
      const st = await readFile(file);
      if (st.length > 2_000_000 || st.includes(0)) continue;
      const content = st.toString("utf8");
      for (const p of patterns) if (p.re.test(content)) findings.push({ id: p.id, file: rel, message: "Potential secret pattern detected; verify and rotate if exposed." });
    }
  }
}
await walk(root);
const result = { gate: "pre-commit/secrets-scan", status: findings.length ? "fail" : "pass", findings, summary: findings.length ? `${findings.length} finding(s)` : "No configured secret patterns found." };
console.log(JSON.stringify(result, null, 2));
if (findings.length) { console.error(result.summary); process.exitCode = 1; }
