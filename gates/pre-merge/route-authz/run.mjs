import { readFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
const root = process.cwd();
const changed = process.env.WEB_PROD_CHANGED_FILES?.split("\n").filter(Boolean);
let files = changed;
if (!files) { try { files = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean); } catch { files = []; } }
const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".py", ".go"]);
const routePattern = /(?:app|router|route|fastify|server)\.(?:get|post|put|patch|delete)\s*\(|@(?:app|router)\.(?:get|post|put|patch|delete)|http\.HandleFunc|@(?:Get|Post|Put|Patch|Delete)Mapping/;
const authn = [/requireAuth\s*\(/, /authenticate\s*\(/, /authMiddleware/, /current_user/, /currentUser/, /AuthN/, /Depends\(.*get_current_user/];
const authz = [/authorize\s*\(/, /requirePermission\s*\(/, /checkPermission\s*\(/, /policy\.can\s*\(/, /hasPermission\s*\(/, /tenant_id/, /tenantId/];
const findings = [];
for (const rel of files) {
 if (!rel || !exts.has(path.extname(rel)) || rel.includes("node_modules/") || rel.includes(".test.") || rel.includes(".spec.")) continue;
 let src; try { src = await readFile(path.resolve(root, rel), "utf8"); } catch { continue; }
 if (!routePattern.test(src)) continue;
 const exempt = /WEB-PROD-AUTHZ-EXEMPT:\s+\S+/.test(src);
 const missing = [];
 if (!authn.some(r => r.test(src))) missing.push("authentication");
 if (!authz.some(r => r.test(src))) missing.push("authorization/tenant-scope");
 if (missing.length && !exempt) findings.push({ id: "MISSING_ROUTE_SECURITY_EVIDENCE", file: rel, missing, message: `Missing evidence: ${missing.join(", ")}.` });
}
const out = { gate: "pre-merge/route-authz", status: findings.length ? "fail" : "pass", findings, summary: findings.length ? `${findings.length} route file(s) need review` : "No missing route security evidence detected." };
console.log(JSON.stringify(out, null, 2)); if (findings.length) { console.error(out.summary); process.exitCode = 1; }
