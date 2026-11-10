import { requireAuth, authorize } from "./authz-middleware";
import { validateSchema } from "./validation";

export function registerRoutes(app: { post: Function }, deps: { logger: any; metrics: any; tracer: any }) {
  app.post("/api/v1/items", async (req: any, res: any) => {
    const span = deps.tracer.startSpan("items.create");
    try {
      const ctx = requireAuth(req);
      const parsed = validateSchema<{ name: string; tenantId: string }>(req.body, ["name", "tenantId"]);
      if (!parsed.ok || !parsed.data) {
        return res.status(400).json({ error: parsed.error });
      }
      authorize(ctx, "items:write", parsed.data.tenantId);
      deps.metrics.counter("items.created", 1);
      deps.logger.info({ event: "item_created", tenantId: ctx.tenantId });
      return res.status(201).json({ ok: true });
    } finally {
      span.end();
    }
  });
}
