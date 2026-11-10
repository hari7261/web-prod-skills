export function register(app: any, validateSchema: any) {
  app.post("/users", (req: any, res: any) => {
    const parsed = validateSchema(req.body, ["email"]);
    return res.json(parsed);
  });
}
