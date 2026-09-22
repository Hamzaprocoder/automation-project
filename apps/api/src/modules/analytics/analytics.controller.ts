import type { Request, Response } from "express";
import * as analyticsService from "./analytics.service";

function parseDays(value: unknown) {
  if (value === undefined) return undefined;
  const days = Number(value);
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    throw new Error("days must be an integer between 1 and 90");
  }
  return days;
}

export async function overview(req: Request, res: Response) {
  try {
    const data = await analyticsService.getOverviewMetrics(req.organization!.id);
    return res.json(data);
  } catch (error) {
    console.error("Analytics overview error:", error);
    return res.status(500).json({ error: "Failed to load analytics" });
  }
}

export async function revenueSeries(req: Request, res: Response) {
  try {
    const series = await analyticsService.getRevenueSeries(
      req.organization!.id,
      parseDays(req.query.days),
    );
    return res.json({ series });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("days must")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Analytics revenue series error:", error);
    return res.status(500).json({ error: "Failed to load revenue series" });
  }
}

export async function customerGrowth(req: Request, res: Response) {
  try {
    const series = await analyticsService.getCustomerGrowthSeries(
      req.organization!.id,
      parseDays(req.query.days),
    );
    return res.json({ series });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("days must")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Analytics customer growth error:", error);
    return res.status(500).json({ error: "Failed to load customer growth" });
  }
}
