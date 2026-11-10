export function getUserQuery(db: any, userId: string) {
  return db.query("SELECT id, email FROM users WHERE id = $1", [userId]);
}

