import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

const EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".py", ".go"]);
const HANDLER_RE = /(?:app|router|route|fastify|server)\.(?:get|post|put|patch|delete)\s*\(|@(?:app|router)\.(?:get|post|put|patch|delete)|http\.HandleFunc|func\s+\w+\s*\(w\s+http\.ResponseWriter|def\s+(?:post|get|put|patch|delete)_/;

export async function runValidationCheck(context) {
  const findings = [];
  const markers = Array.isArray(context.config.markers)
    ? context.config.markers
    : ["safeParse(", "validateSchema(", "validateRequest(", ".parse(", "schema.validate(", "validate_request(", "ShouldBind", "DecodeAndValidate"];

  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.includes(".test.") || rel.includes(".spec.")) continue;
    if (!EXTS.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(context.targetDir, rel));
    if (src === null) continue;
    if (!HANDLER_RE.test(src)) continue;
    if (/WEB-PROD-VALIDATION-EXEMPT:\s+\S+/.test(src)) continue;
    const hasMarker = markers.some((m) => {
      if (src.includes(m)) return true;
      if (m.endsWith("(")) {
        const base = m.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`${base}\\s*<[^>]+>\\s*\\(`).test(src);
      }
      return false;
    });
    if (!hasMarker) {
      findings.push({
        id: "MISSING_SCHEMA_VALIDATION_EVIDENCE",
        file: rel,
        message: "Handler file has no recognized schema-validation marker or reasoned exemption."
      });
    }
  }
  return { findings };
}
