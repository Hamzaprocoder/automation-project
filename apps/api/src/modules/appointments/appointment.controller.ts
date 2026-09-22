import type { Request, Response } from "express";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  listAppointmentsQuerySchema,
} from "./appointment.schema";
import * as appointmentService from "./appointment.service";
import { log as auditLog } from "../audit/audit.service";

export async function list(req: Request, res: Response) {
  const parsed = listAppointmentsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const result = await appointmentService.listAppointments(req.organization!.id, parsed.data);
  return res.json(result);
}

export async function create(req: Request, res: Response) {
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const appointment = await appointmentService.createAppointment(req.organization!.id, parsed.data);
    await auditLog({ organizationId: req.organization!.id, userId: req.user!.id, action: "appointment.created", entityType: "Appointment", entityId: appointment.id, metadata: { customerId: appointment.customerId, serviceId: appointment.serviceId } });
    return res.status(201).json({ appointment });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create appointment" });
  }
}

export async function update(req: Request, res: Response) {
  const parsed = updateAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const appointment = await appointmentService.updateAppointment(
      req.organization!.id,
      req.params.id,
      parsed.data,
    );
    if (parsed.data.status !== undefined) {
      await auditLog({ organizationId: req.organization!.id, userId: req.user!.id, action: "appointment.status_changed", entityType: "Appointment", entityId: appointment.id, metadata: { status: appointment.status } });
    }
    return res.json({ appointment });
  } catch (error) {
    const status = error instanceof appointmentService.AppointmentNotFoundError ? 404 : 400;
    return res.status(status).json({ error: error instanceof Error ? error.message : "Unable to update appointment" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await appointmentService.softDeleteAppointment(req.organization!.id, req.params.id);
    return res.json({ message: "Appointment deleted" });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Appointment not found" });
  }
}
