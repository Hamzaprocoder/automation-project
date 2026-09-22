import type { Request, Response } from "express";
import * as auditService from "./audit.service";

export async function list(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 30);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ error: "Invalid pagination parameters" });
  }

  try {
    const result = await auditService.listLogs(req.organization!.id, {
      page,
      limit,
      action: typeof req.query.action === "string" ? req.query.action : undefined,
      userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
    });
    return res.json(result);
  } catch (error) {
    console.error("Audit log list error:", error);
    return res.status(500).json({ error: "Failed to fetch audit logs" });
  }
}
