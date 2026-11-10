import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

const EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".py", ".go"]);
const ROUTE_RE = /(?:app|router|route|fastify|server)\.(?:get|post|put|patch|delete)\s*\(|@(?:app|router)\.(?:get|post|put|patch|delete)|http\.HandleFunc|@(?:Get|Post|Put|Patch|Delete)Mapping/;
const AUTHN_RES = [/requireAuth\s*\(/, /authenticate\s*\(/, /authMiddleware/, /current_user/, /currentUser/, /AuthN/, /Depends\(.*get_current_user/];
const AUTHZ_RES = [/authorize\s*\(/, /requirePermission\s*\(/, /checkPermission\s*\(/, /policy\.can\s*\(/, /hasPermission\s*\(/, /tenant_id/, /tenantId/];

export async function runRouteAuthzCheck(context) {
  const findings = [];
  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.includes(".test.") || rel.includes(".spec.")) continue;
    if (!EXTS.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(context.targetDir, rel));
    if (src === null || !ROUTE_RE.test(src)) continue;
    if (/WEB-PROD-AUTHZ-EXEMPT:\s+\S+/.test(src)) continue;
    const missing = [];
    if (!AUTHN_RES.some((r) => r.test(src))) missing.push("authentication");
    if (!AUTHZ_RES.some((r) => r.test(src))) missing.push("authorization/tenant-scope");
    if (missing.length) {
      findings.push({ id: "MISSING_ROUTE_SECURITY_EVIDENCE", file: rel, missing, message: `Missing evidence: ${missing.join(", ")}.` });
    }
  }
  return { findings };
}
