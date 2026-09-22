import type { OrganizationRole } from "@prisma/client";

const rolePermissions: Record<OrganizationRole, readonly string[]> = {
  OWNER: ["org:manage","org:delete","member:invite","member:remove","member:change-role","customer:create","customer:read","customer:update","customer:delete","conversation:read","conversation:reply","conversation:assign","appointment:manage","order:manage","settings:manage","analytics:view"],
  ADMIN: ["member:invite","member:remove","member:change-role","customer:create","customer:read","customer:update","customer:delete","conversation:read","conversation:reply","conversation:assign","appointment:manage","order:manage","settings:manage","analytics:view"],
  MANAGER: ["customer:create","customer:read","customer:update","conversation:read","conversation:reply","conversation:assign","appointment:manage","order:manage","analytics:view"],
  STAFF: ["customer:read","customer:update","conversation:read","conversation:reply","appointment:manage"],
};

export function hasPermission(role: OrganizationRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
