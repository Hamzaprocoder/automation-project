import type { CustomerStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type { CreateCustomerInput, UpdateCustomerInput } from "./customer.schema";

export async function listCustomers(organizationId: string, options: {
  search?: string; status?: CustomerStatus; page: number; limit: number;
}) {
  const { search, status, page, limit } = options;
  const where: {
    organizationId: string;
    deletedAt: null;
    status?: CustomerStatus;
    OR?: Array<Record<string, unknown>>;
  } = { organizationId, deletedAt: null };

  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
      { whatsappNumber: { contains: search } },
    ];
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.customer.findMany({ where, orderBy: { lastInteractionAt: "desc" }, skip, take: limit }),
    prisma.customer.count({ where }),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getCustomerById(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, deletedAt: null },
    include: {
      tags: { include: { tag: true } },
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 10,
        include: { messages: { orderBy: { createdAt: "desc" }, take: 5 } },
      },
      appointments: { orderBy: { startAt: "desc" }, take: 10 },
      tasks: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) throw new Error("Customer not found");
  return customer;
}

export async function createCustomer(organizationId: string, data: CreateCustomerInput) {
  const phone = data.phone.trim();
  const existing = await prisma.customer.findUnique({
    where: { organizationId_phone: { organizationId, phone } },
  });
  if (existing && !existing.deletedAt) throw new Error("A customer with this phone number already exists");

  return prisma.customer.create({
    data: {
      organizationId, name: data.name || null, phone,
      whatsappNumber: data.whatsappNumber || phone,
      email: data.email || null, address: data.address || null,
      source: data.source || "manual", notes: data.notes || null,
      status: data.status ?? "ACTIVE",
      firstInteractionAt: new Date(), lastInteractionAt: new Date(),
    },
  });
}

export async function updateCustomer(organizationId: string, customerId: string, data: UpdateCustomerInput) {
  const existing = await prisma.customer.findFirst({ where: { id: customerId, organizationId, deletedAt: null } });
  if (!existing) throw new Error("Customer not found");

  if (data.phone && data.phone !== existing.phone) {
    const duplicate = await prisma.customer.findUnique({
      where: { organizationId_phone: { organizationId, phone: data.phone } },
    });
    if (duplicate && !duplicate.deletedAt) throw new Error("A customer with this phone number already exists");
  }

  return prisma.customer.update({
    where: { id: customerId },
    data: {
      ...data,
      email: data.email === "" ? null : data.email,
      updatedAt: new Date(),
    },
  });
}

export async function softDeleteCustomer(organizationId: string, customerId: string) {
  const existing = await prisma.customer.findFirst({ where: { id: customerId, organizationId, deletedAt: null } });
  if (!existing) throw new Error("Customer not found");

  await prisma.customer.update({ where: { id: customerId }, data: { deletedAt: new Date() } });
  return { message: "Customer deleted successfully" };
}
