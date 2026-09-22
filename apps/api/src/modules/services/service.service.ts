import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { createServiceSchema, updateServiceSchema } from "./service.schema";

type CreateInput = z.infer<typeof createServiceSchema>;
type UpdateInput = z.infer<typeof updateServiceSchema>;

export class ServiceNotFoundError extends Error {
  constructor() {
    super("Service not found");
    this.name = "ServiceNotFoundError";
  }
}

export async function listServices(organizationId: string) {
  return prisma.service.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function createService(organizationId: string, data: CreateInput) {
  const existing = await prisma.service.findUnique({
    where: { organizationId_name: { organizationId, name: data.name } },
  });

  if (existing?.deletedAt) {
    return prisma.service.update({
      where: { id: existing.id },
      data: {
        description: data.description,
        durationMins: data.durationMins,
        price: data.price,
        isActive: data.isActive ?? true,
        deletedAt: null,
      },
    });
  }

  if (existing) {
    throw new Error("A service with this name already exists");
  }

  return prisma.service.create({
    data: {
      organizationId,
      name: data.name,
      description: data.description,
      durationMins: data.durationMins,
      price: data.price,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateService(
  organizationId: string,
  serviceId: string,
  data: UpdateInput,
) {
  const existing = await prisma.service.findFirst({
    where: { id: serviceId, organizationId, deletedAt: null },
  });
  if (!existing) throw new ServiceNotFoundError();

  return prisma.service.update({
    where: { id: serviceId },
    data,
  });
}

export async function softDeleteService(organizationId: string, serviceId: string) {
  const existing = await prisma.service.findFirst({
    where: { id: serviceId, organizationId, deletedAt: null },
  });
  if (!existing) throw new ServiceNotFoundError();

  return prisma.service.update({
    where: { id: serviceId },
    data: { deletedAt: new Date(), isActive: false },
  });
}
