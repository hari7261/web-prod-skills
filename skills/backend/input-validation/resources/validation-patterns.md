# Boundary Validation Patterns

## 1. Strict object schemas
- **Zod (TypeScript):** `z.object({ email: z.string().email().max(254) }).strict()`
- **JSON Schema:** `{ "type": "object", "additionalProperties": false, "required": ["email"] }`
- **Pydantic v2 (Python):** `model_config = ConfigDict(extra="forbid")`
- **Go:** `dec := json.NewDecoder(io.LimitReader(r.Body, maxBytes)); dec.DisallowUnknownFields()`

## 2. Mandatory bounds
- Max JSON body: 64 KB default (higher only on explicit upload endpoints).
- Max string length: explicit per field (e.g., name <= 120, bio <= 2000).
- Max array items: explicit ceiling (e.g., batch IDs <= 100).
- Max pagination limit: <= 100.
