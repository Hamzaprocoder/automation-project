import { prisma } from "../../lib/prisma";
import type { CreateAppointmentInput, ListAppointmentsQuery, UpdateAppointmentInput } from "./appointment.schema";

export class AppointmentNotFoundError extends Error {
  constructor() {
    super("Appointment not found");
    this.name = "AppointmentNotFoundError";
  }
}

export class CustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found");
    this.name = "CustomerNotFoundError";
  }
}

export class ServiceNotFoundError extends Error {
  constructor() {
    super("Service not found");
    this.name = "ServiceNotFoundError";
  }
}

export class StaffNotFoundError extends Error {
  constructor() {
    super("Staff member not found in this organization");
    this.name = "StaffNotFoundError";
  }
}

const includeRelations = {
  customer: { select: { id: true, name: true, phone: true } },
  service: { select: { id: true, name: true, durationMins: true, price: true } },
};

async function validateReferences(
  organizationId: string,
  customerId: string,
  serviceId?: string | null,
  staffId?: string | null,
) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, deletedAt: null },
  });
  if (!customer) throw new CustomerNotFoundError();

  if (serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, organizationId, deletedAt: null, isActive: true },
    });
    if (!service) throw new ServiceNotFoundError();
  }

  if (staffId) {
    const staff = await prisma.organizationMember.findFirst({
      where: { id: staffId, organizationId },
    });
    if (!staff) throw new StaffNotFoundError();
  }
}

function resolveDateRange(options: ListAppointmentsQuery) {
  if (options.today) {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { from: start, to: end };
  }

  if (options.upcoming) {
    return { from: new Date(), to: undefined };
  }

  return {
    from: options.from ? new Date(options.from) : undefined,
    to: options.to ? new Date(options.to) : undefined,
  };
}

export async function listAppointments(
  organizationId: string,
  options: ListAppointmentsQuery,
) {
  const skip = (options.page - 1) * options.limit;
  const range = resolveDateRange(options);

  const where = {
    organizationId,
    deletedAt: null,
    ...(options.status ? { status: options.status } : {}),
    ...(options.customerId ? { customerId: options.customerId } : {}),
    ...(options.staffId ? { staffId: options.staffId } : {}),
    ...(range.from || range.to
      ? {
          startsAt: {
            ...(range.from ? { gte: range.from } : {}),
            ...(range.to ? { lt: range.to } : {}),
          },
        }
      : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: includeRelations,
      orderBy: { startsAt: "asc" },
      skip,
      take: options.limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data: appointments,
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function createAppointment(
  organizationId: string,
  data: CreateAppointmentInput,
) {
  await validateReferences(organizationId, data.customerId, data.serviceId, data.staffId);

  const startsAt = new Date(data.startsAt);
  let endsAt = data.endsAt ? new Date(data.endsAt) : null;

  if (endsAt && endsAt <= startsAt) {
    throw new Error("Appointment end time must be after start time");
  }

  if (!endsAt && data.serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, organizationId, deletedAt: null },
      select: { durationMins: true },
    });
    if (service) {
      endsAt = new Date(startsAt.getTime() + service.durationMins * 60 * 1000);
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      organizationId,
      customerId: data.customerId,
      serviceId: data.serviceId,
      staffId: data.staffId,
      title: data.title,
      startsAt,
      endsAt,
      notes: data.notes,
      status: data.status ?? "SCHEDULED",
    },
    include: includeRelations,
  });

  await prisma.customer.update({
    where: { id: data.customerId },
    data: { lastInteractionAt: new Date() },
  });

  return appointment;
}

const allowedTransitions: Record<string, string[]> = {
  SCHEDULED: ["SCHEDULED", "CONFIRMED", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
  NO_SHOW: ["NO_SHOW"],
};

export async function updateAppointment(
  organizationId: string,
  appointmentId: string,
  data: UpdateAppointmentInput,
) {
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, organizationId, deletedAt: null },
  });
  if (!existing) throw new AppointmentNotFoundError();

  await validateReferences(
    organizationId,
    existing.customerId,
    data.serviceId === undefined ? existing.serviceId : data.serviceId,
    data.staffId === undefined ? existing.staffId : data.staffId,
  );

  if (data.status && !allowedTransitions[existing.status].includes(data.status)) {
    throw new Error(`Invalid appointment status transition: ${existing.status} -> ${data.status}`);
  }

  const startsAt = data.startsAt ? new Date(data.startsAt) : existing.startsAt;
  const endsAt = data.endsAt === undefined
    ? existing.endsAt
    : data.endsAt
      ? new Date(data.endsAt)
      : null;

  if (endsAt && endsAt <= startsAt) {
    throw new Error("Appointment end time must be after start time");
  }

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ...(data.serviceId !== undefined ? { serviceId: data.serviceId } : {}),
      ...(data.staffId !== undefined ? { staffId: data.staffId } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.startsAt !== undefined ? { startsAt } : {}),
      ...(data.endsAt !== undefined ? { endsAt } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    include: includeRelations,
  });

  await prisma.customer.update({
    where: { id: existing.customerId },
    data: { lastInteractionAt: new Date() },
  });

  return appointment;
}

export async function softDeleteAppointment(organizationId: string, appointmentId: string) {
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, organizationId, deletedAt: null },
  });
  if (!existing) throw new AppointmentNotFoundError();

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { deletedAt: new Date() },
  });

  await prisma.customer.update({
    where: { id: existing.customerId },
    data: { lastInteractionAt: new Date() },
  });

  return appointment;
}
