import type { Request, Response } from "express";
import { z } from "zod";
import * as automationService from "./automation.service";

const hoursSchema = z.coerce.number().int().min(1).max(168).default(24);

const logSchema = z.object({
  workflow: z.string().trim().min(1).max(120),
  status: z.enum(["SUCCESS", "FAILED"]),
  executionId: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function upcomingAppointments(req: Request, res: Response) {
  try {
    const organizationId = req.organization!.id;
    const hours = hoursSchema.parse(req.query.hours);
    const data = await automationService.getUpcomingAppointmentsForReminder(
      organizationId,
      hours,
    );
    return res.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid hours parameter" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch upcoming appointments" });
  }
}

export async function overdueFollowUps(req: Request, res: Response) {
  try {
    const data = await automationService.getOverdueFollowUps(req.organization!.id);
    return res.json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch overdue follow-ups" });
  }
}

export async function logExecution(req: Request, res: Response) {
  const parsed = logSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid automation log payload" });
  }

  try {
    const auditLog = await automationService.logAutomationExecution(
      req.organization!.id,
      parsed.data,
    );
    return res.status(201).json({ data: auditLog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to log automation execution" });
  }
}

export async function logError(req: Request, res: Response) {
  const parsed = logSchema.safeParse({
    ...req.body,
    status: "FAILED",
  });

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid automation error payload" });
  }

  try {
    const auditLog = await automationService.logAutomationExecution(
      req.organization!.id,
      parsed.data,
    );
    return res.status(201).json({ data: auditLog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to log automation error" });
  }
}
