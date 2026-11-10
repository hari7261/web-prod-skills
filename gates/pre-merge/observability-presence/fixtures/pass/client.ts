export async function fetchOrder(id: string, deps: { logger: any; metrics: any; tracer: any }) {
  const span = deps.tracer.startSpan("orders.fetch");
  try {
    deps.metrics.counter("orders.fetch", 1);
    deps.logger.info({ event: "order_fetch", id });
    return await fetch(`https://orders.internal/v1/${id}`);
  } finally {
    span.end();
  }
}
