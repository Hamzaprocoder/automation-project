import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { COOKIE_NAME, verifyToken } from "../lib/auth";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Authentication required" });

    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: "Invalid or expired session" });

    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: payload.organizationId, userId: payload.userId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    if (!membership) return res.status(401).json({ error: "Invalid session" });
    req.user = membership.user;
    req.organization = membership.organization;
    req.membership = { role: membership.role };
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
