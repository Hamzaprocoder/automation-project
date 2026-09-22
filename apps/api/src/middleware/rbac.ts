import type { NextFunction, Request, Response } from "express";
import type { OrganizationRole } from "@prisma/client";
import { hasPermission } from "../lib/permissions";

export function requireRole(...allowedRoles: OrganizationRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.membership) return res.status(401).json({ error: "Authentication required" });
    if (!allowedRoles.includes(req.membership.role)) {
      return res.status(403).json({ error: "Forbidden", message: "Insufficient role permissions" });
    }
    return next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.membership) return res.status(401).json({ error: "Authentication required" });
    if (!hasPermission(req.membership.role, permission)) {
      return res.status(403).json({ error: "Forbidden", message: "You do not have permission to perform this action" });
    }
    return next();
  };
}
