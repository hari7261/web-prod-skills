export function register(app: any, requireAuth: any, authorize: any) {
  app.get("/tenants/:tenantId/orders", requireAuth(), (req: any, res: any) => {
    authorize(req.user, "orders:read", req.params.tenantId);
    return res.json([]);
  });
}

