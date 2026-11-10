import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

const EXTS = new Set([".js", ".mjs", ".ts", ".tsx", ".py", ".go"]);
const LLM_RE = /\b(?:openai\.|anthropic\.|generateText|streamText|callProvider|completions\.create|messages\.create)\b/;

export async function runLlmResilienceCheck(context) {
  const findings = [];
  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.includes(".test.") || rel.includes(".spec.")) continue;
    if (!EXTS.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(context.targetDir, rel));
    if (src === null || !LLM_RE.test(src)) continue;
    if (/WEB-PROD-LLM-RESILIENCE-EXEMPT:\s+\S+/.test(src)) continue;
    const missing = [];
    if (!/(?:timeout|AbortController|signal)/.test(src)) missing.push("timeout");
    if (!/(?:retry|maxRetries|backoff|attempt)/.test(src)) missing.push("retry-policy");
    if (!/(?:fallback|degrade|catch\s*\()/i.test(src)) missing.push("fallback");
    if (!/(?:maxTokens|max_tokens|tokenBudget|rateLimit)/.test(src)) missing.push("token-or-rate-budget");
    if (missing.length) {
      findings.push({ id: "MISSING_LLM_RESILIENCE_CONTROLS", file: rel, missing, message: `LLM call missing: ${missing.join(", ")}.` });
    }
  }
  return { findings };
}

