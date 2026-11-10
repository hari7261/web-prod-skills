export async function askModel(openai: any, input: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await openai.responses.create({ model: "gpt-4o-mini", input, max_tokens: 300 }, { signal: controller.signal });
    } catch {
      if (attempt === maxRetries) return { fallback: true, text: "Service temporarily unavailable." };
    } finally {
      clearTimeout(timeout);
    }
  }
}
