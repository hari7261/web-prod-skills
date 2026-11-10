export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function validateSchema<T extends Record<string, unknown>>(
  payload: unknown,
  allowedKeys: readonly string[],
  maxBytes = 16_384
): ValidationResult<T> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Payload must be a JSON object." };
  }
  if (JSON.stringify(payload).length > maxBytes) {
    return { ok: false, error: "Payload exceeds maximum allowed size." };
  }
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(payload)) {
    if (!allowed.has(key)) {
      return { ok: false, error: `Unknown field: ${key}` };
    }
  }
  return { ok: true, data: payload as T };
}
