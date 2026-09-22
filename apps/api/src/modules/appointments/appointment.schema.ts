import { z } from "zod";

const appointmentStatuses = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

export const createAppointmentSchema = z.object({
  customerId: z.string().cuid(),
  serviceId: z.string().cuid().optional(),
  staffId: z.string().cuid().optional(),
  title: z.string().trim().max(200).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  notes: z.string().trim().max(5000).optional(),
  status: z.enum(["SCHEDULED", "CONFIRMED"]).optional(),
});

export const updateAppointmentSchema = z.object({
  serviceId: z.string().cuid().nullable().optional(),
  staffId: z.string().cuid().nullable().optional(),
  title: z.string().trim().max(200).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(5000).optional(),
  status: z.enum(appointmentStatuses).optional(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z.enum(appointmentStatuses).optional(),
  staffId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  today: z.coerce.boolean().default(false),
  upcoming: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
