import { readFileSync } from "node:fs";
import { validateAiOutput } from "./output-schema";

const PROMPT_VERSION = "support-classifier@1.0.0";

export function loadVersionedPrompt(promptPath: string): string {
  return readFileSync(promptPath, "utf8");
}

export async function runAiClassification(
  callProvider: (opts: { prompt: string; input: string; signal: AbortSignal; maxTokens: number }) => Promise<string>,
  promptPath: string,
  userInput: string,
  deps: { logger: any; metrics: any; tracer: any }
) {
  const span = deps.tracer.startSpan("ai.classify");
  const maxRetries = 2;
  try {
    const prompt = loadVersionedPrompt(promptPath);
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const raw = await callProvider({ prompt, input: userInput.slice(0, 2000), signal: controller.signal, maxTokens: 300 });
        deps.metrics.counter("ai.tokens.bounded", 1);
        deps.logger.info({ event: "ai_classification_ok", promptVersion: PROMPT_VERSION, attempt });
        return validateAiOutput(raw);
      } catch (err) {
        deps.logger.error({ event: "ai_classification_retry", promptVersion: PROMPT_VERSION, attempt, error: String(err) });
        if (attempt === maxRetries) {
          return { priority: "medium" as const, reason: "Fallback classification due to provider error." };
        }
        await new Promise((r) => setTimeout(r, 100 * 2 ** attempt + Math.floor(Math.random() * 50)));
      } finally {
        clearTimeout(timeout);
      }
    }
    return { priority: "medium" as const, reason: "Fallback classification due to provider error." };
  } finally {
    span.end();
  }
}
