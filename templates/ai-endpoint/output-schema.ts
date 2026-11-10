const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateAiOutput(raw: string): { priority: "low" | "medium" | "high"; reason: string } {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid AI output shape");
  }
  const keys = Object.keys(parsed);
  if (keys.some((k) => k !== "priority" && k !== "reason")) {
    throw new Error("Unknown field in AI output");
  }
  if (!ALLOWED_PRIORITIES.has(parsed.priority) || typeof parsed.reason !== "string" || parsed.reason.length > 500) {
    throw new Error("AI output failed schema constraints");
  }
  return { priority: parsed.priority, reason: parsed.reason.trim() };
}
