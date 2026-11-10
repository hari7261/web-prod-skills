export interface AuthContext {
  userId: string;
  tenantId: string;
  permissions: string[];
}

export function requireAuth(req: { headers?: Record<string, string>; user?: AuthContext }): AuthContext {
  if (!req.user?.userId || !req.user?.tenantId) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }
  return req.user;
}

export function authorize(ctx: AuthContext, permission: string, resourceTenantId: string): void {
  if (ctx.tenantId !== resourceTenantId || !ctx.permissions.includes(permission)) {
    throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  }
}

