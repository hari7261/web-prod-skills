export function register(app: any) {
  app.post("/users", (req: any, res: any) => {
    if (req.body.email) return res.json({ email: req.body.email });
    return res.status(400).end();
  });
}

