export function getUserQuery(db: any, userId: string) {
  try {
    return db.query(`SELECT id, email FROM users WHERE id = ${userId}`);
  } catch {}
}
