import type { Request, Response } from "express";
import { createServiceSchema, updateServiceSchema } from "./service.schema";
import * as serviceService from "./service.service";

export async function list(req: Request, res: Response) {
  const services = await serviceService.listServices(req.organization!.id);
  return res.json({ services });
}

export async function create(req: Request, res: Response) {
  const parsed = createServiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const service = await serviceService.createService(req.organization!.id, parsed.data);
    return res.status(201).json({ service });
  } catch (error) {
    return res.status(409).json({ error: error instanceof Error ? error.message : "Unable to create service" });
  }
}

export async function update(req: Request, res: Response) {
  const parsed = updateServiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const service = await serviceService.updateService(req.organization!.id, req.params.id, parsed.data);
    return res.json({ service });
  } catch (error) {
    const status = error instanceof serviceService.ServiceNotFoundError ? 404 : 409;
    return res.status(status).json({ error: error instanceof Error ? error.message : "Unable to update service" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await serviceService.softDeleteService(req.organization!.id, req.params.id);
    return res.json({ message: "Service deleted" });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Service not found" });
  }
}
