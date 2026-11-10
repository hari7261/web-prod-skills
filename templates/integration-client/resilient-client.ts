export async function resilientFetch(
  url: string,
  opts: { timeoutMs?: number; maxRetries?: number; logger: any; metrics: any; tracer: any }
): Promise<{ ok: boolean; status: number; fallback?: boolean }> {
  const timeoutMs = opts.timeoutMs ?? 3000;
  const maxRetries = Math.min(opts.maxRetries ?? 2, 3);
  const span = opts.tracer.startSpan("integration.fetch");
  try {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        opts.metrics.counter("integration.requests", 1);
        if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
          return { ok: res.ok, status: res.status };
        }
      } catch (err) {
        opts.logger.error({ event: "integration_attempt_failed", attempt, error: String(err) });
      } finally {
        clearTimeout(timer);
      }
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 100 * 2 ** attempt + Math.floor(Math.random() * 50)));
      }
    }
    return { ok: false, status: 503, fallback: true };
  } finally {
    span.end();
  }
}
