export function register(app: any) {
  app.get("/tenants/:tenantId/orders", (req: any, res: any) => {
    return res.json([]);
  });
}
