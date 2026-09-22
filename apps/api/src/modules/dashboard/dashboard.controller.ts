import type { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export async function overview(req: Request, res: Response) {
  try {
    const data = await dashboardService.getOverview(req.organization!.id);
    return res.json(data);
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return res.status(500).json({ error: "Failed to load dashboard" });
  }
}

export async function customerGrowth(req: Request, res: Response) {
  try {
    const requestedDays = req.query.days ? Number(req.query.days) : 30;
    if (!Number.isFinite(requestedDays) || requestedDays < 1) {
      return res.status(400).json({ error: "days must be a positive number" });
    }

    const series = await dashboardService.getCustomerGrowth(
      req.organization!.id,
      requestedDays,
    );

    return res.json({ series });
  } catch (error) {
    console.error("Customer growth error:", error);
    return res.status(500).json({ error: "Failed to load growth data" });
  }
}
