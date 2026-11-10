import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

const EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".vue", ".svelte"]);
const SINK_RE = /\.(?:innerHTML|outerHTML)\s*=|\bdangerouslySetInnerHTML\b|\bv-html\b|\bdocument\.write\s*\(/;

export async function runHtmlSinkCheck(context) {
  const findings = [];
  const sanitizers = Array.isArray(context.config.allowed_sanitizers) ? context.config.allowed_sanitizers : ["DOMPurify", "sanitizeHtml", "sanitizeUntrustedHtml"];

  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.startsWith("tests/") || rel.includes(".test.") || rel.includes(".spec.")) continue;
    if (!EXTS.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(context.targetDir, rel));
    if (src === null) continue;
    if (!SINK_RE.test(src)) continue;
    if (/WEB-PROD-HTML-EXEMPT:\s+\S+/.test(src)) continue;
    if (sanitizers.some((s) => src.includes(s))) continue;
    findings.push({
      id: "UNSANITIZED_HTML_SINK",
      file: rel,
      message: "Dangerous HTML sink used without recognized allowlist sanitizer or reasoned exemption."
    });
  }
  return { findings };
}

