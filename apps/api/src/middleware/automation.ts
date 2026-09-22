import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function requireAutomationToken(req: Request, res: Response, next: NextFunction) {
  const expectedToken = process.env.N8N_AUTOMATION_TOKEN;
  const organizationId = process.env.N8N_ORGANIZATION_ID;

  if (!expectedToken || !organizationId) {
    return res.status(503).json({ error: "Automation integration is not configured" });
  }

  const authHeader = req.header("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const providedToken = bearerToken || req.header("x-automation-token") || "";

  if (!providedToken || providedToken !== expectedToken) {
    return res.status(401).json({ error: "Invalid automation token" });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });

  if (!organization) {
    return res.status(503).json({ error: "Automation organization is not configured" });
  }

  req.organization = organization;
  return next();
}
