import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
const root = process.cwd();
const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".py", ".go"]);
const changed = process.env.WEB_PROD_CHANGED_FILES?.split("\n").filter(Boolean);
let files = changed;
if (!files) {
  try { files = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean); }
  catch { files = []; }
}
const markers = ["safeParse(", "validateSchema(", "validateRequest(", ".parse(", "schema.validate(", "validate_request(", "ShouldBind", "DecodeAndValidate"];
const findings = [];
for (const rel of files) {
  if (!rel || rel.includes("node_modules/") || rel.includes("/test") || rel.includes(".test.") || rel.includes(".spec.")) continue;
  if (!exts.has(path.extname(rel))) continue;
  let src; try { src = await readFile(path.resolve(root, rel), "utf8"); } catch { continue; }
  const handlerLike = /(?:app|router|route|fastify|server)\.(?:get|post|put|patch|delete)\s*\(|@(?:app|router)\.(?:get|post|put|patch|delete)|http\.HandleFunc|func\s+\w+\s*\(w\s+http\.ResponseWriter|def\s+(?:post|get|put|patch|delete)_/.test(src);
  if (handlerLike && !markers.some(m => src.includes(m)) && !/WEB-PROD-VALIDATION-EXEMPT:\s+\S+/.test(src)) findings.push({ id: "MISSING_SCHEMA_VALIDATION_EVIDENCE", file: rel, message: "Handler-like code has no recognized schema-validation marker or reasoned exemption." });
}
const out = { gate: "pre-merge/input-validation", status: findings.length ? "fail" : "pass", findings, summary: findings.length ? `${findings.length} handler file(s) need review` : "No missing validation evidence detected." };
console.log(JSON.stringify(out, null, 2)); if (findings.length) { console.error(out.summary); process.exitCode = 1; }
