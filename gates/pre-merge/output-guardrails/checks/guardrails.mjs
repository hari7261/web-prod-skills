import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

const EXTS = new Set([".js", ".mjs", ".ts", ".tsx", ".py"]);
const AI_CONSUMER_RE = /\b(?:llmOutput|modelOutput|completionText|aiResponse|generateText|streamText|callProvider)\b/;
const VALIDATORS = ["validateAiOutput", "safeParse(", ".parse(", "DOMPurify", "sanitize", "validateSchema("];
const UNSAFE_SINKS = [/\beval\s*\(/, /\bexec\s*\(/, /\binnerHTML\s*=/, /\bdangerouslySetInnerHTML\b/, /\bwriteFile\s*\(/];

export async function runOutputGuardrailsCheck(context) {
  const findings = [];
  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.includes(".test.") || rel.includes(".spec.")) continue;
    if (!EXTS.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(context.targetDir, rel));
    if (src === null || !AI_CONSUMER_RE.test(src)) continue;
    if (/WEB-PROD-GUARDRAIL-EXEMPT:\s+\S+/.test(src)) continue;
    const hasValidator = VALIDATORS.some((v) => src.includes(v));
    if (!hasValidator) {
      findings.push({ id: "UNVALIDATED_LLM_OUTPUT", file: rel, message: "LLM output consumed without schema validation or sanitization." });
    }
    for (const sink of UNSAFE_SINKS) {
      if (sink.test(src) && !src.includes("DOMPurify") && !src.includes("sanitize")) {
        findings.push({ id: "DANGEROUS_LLM_OUTPUT_SINK", file: rel, message: "LLM output flows into a dangerous sink without sanitization/allowlist." });
        break;
      }
    }
  }
  return { findings };
}
