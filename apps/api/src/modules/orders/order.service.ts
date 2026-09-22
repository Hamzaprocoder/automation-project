import { prisma } from "../../lib/prisma";
import type { CreateOrderInput, ListOrdersQuery, UpdateOrderInput } from "./order.schema";

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${datePart}-${Date.now().toString(36).toUpperCase()}`;
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found");
    this.name = "OrderNotFoundError";
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

const includeList = {
  customer: { select: { id: true, name: true, phone: true } },
  items: true,
};

const includeDetail = {
  customer: true,
  items: { include: { service: true } },
};

const allowedTransitions: Record<string, string[]> = {
  DRAFT: ["DRAFT", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CONFIRMED", "IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};

async function validateCustomerAndItems(organizationId: string, data: CreateOrderInput) {
  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, organizationId, deletedAt: null },
  });
  if (!customer) throw new CustomerNotFoundError();

  for (const item of data.items) {
    if (item.serviceId) {
      const service = await prisma.service.findFirst({
        where: { id: item.serviceId, organizationId, deletedAt: null },
      });
      if (!service) throw new ServiceNotFoundError();
    }
  }
}

async function applyLifetimeMetrics(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], order: { customerId: string; status: string; paymentStatus: string; total: unknown }) {
  if (order.status === "COMPLETED" && order.paymentStatus === "PAID") {
    await tx.customer.update({
      where: { id: order.customerId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: order.total as never },
        lastInteractionAt: new Date(),
      },
    });
  }
}

export async function listOrders(organizationId: string, options: ListOrdersQuery) {
  const where = {
    organizationId,
    deletedAt: null,
    ...(options.status ? { status: options.status } : {}),
    ...(options.paymentStatus ? { paymentStatus: options.paymentStatus } : {}),
    ...(options.customerId ? { customerId: options.customerId } : {}),
  };

  const skip = (options.page - 1) * options.limit;
  const [data, total] = await Promise.all([
    prisma.order.findMany({ where, include: includeList, orderBy: { createdAt: "desc" }, skip, take: options.limit }),
    prisma.order.count({ where }),
  ]);

  return { data, meta: { total, page: options.page, limit: options.limit, totalPages: Math.ceil(total / options.limit) } };
}

export async function getOrder(organizationId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, organizationId, deletedAt: null }, include: includeDetail });
  if (!order) throw new OrderNotFoundError();
  return order;
}

export async function createOrder(organizationId: string, data: CreateOrderInput) {
  await validateCustomerAndItems(organizationId, data);

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - data.discount + data.tax;
  if (total < 0) throw new Error("Discount cannot exceed subtotal plus tax");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        organizationId,
        customerId: data.customerId,
        orderNumber: generateOrderNumber(),
        status: data.status ?? "CONFIRMED",
        paymentStatus: data.paymentStatus ?? "PENDING",
        subtotal,
        discount: data.discount,
        tax: data.tax,
        total,
        notes: data.notes,
        items: { create: data.items.map(item => ({ serviceId: item.serviceId ?? null, name: item.name, quantity: item.quantity, unitPrice: item.unitPrice, total: item.quantity * item.unitPrice })) },
      },
      include: includeDetail,
    });

    await tx.customer.update({
      where: { id: data.customerId },
      data: { lastInteractionAt: new Date() },
    });

    if (order.status === "COMPLETED" && order.paymentStatus === "PAID") {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { totalOrders: { increment: 1 }, totalSpent: { increment: order.total } },
      });
    }

    return order;
  });
}

export async function updateOrder(organizationId: string, orderId: string, data: UpdateOrderInput) {
  const existing = await prisma.order.findFirst({ where: { id: orderId, organizationId, deletedAt: null } });
  if (!existing) throw new OrderNotFoundError();

  if (data.status && !allowedTransitions[existing.status].includes(data.status)) {
    throw new Error(`Invalid order status transition: ${existing.status} -> ${data.status}`);
  }

  const discount = data.discount ?? Number(existing.discount);
  const tax = data.tax ?? Number(existing.tax);
  const total = Number(existing.subtotal) - discount + tax;
  if (total < 0) throw new Error("Discount cannot exceed subtotal plus tax");

  const becomesCompletedAndPaid =
    !(existing.status === "COMPLETED" && existing.paymentStatus === "PAID") &&
    (data.status ?? existing.status) === "COMPLETED" &&
    (data.paymentStatus ?? existing.paymentStatus) === "PAID";

  const leavesCompletedAndPaid =
    existing.status === "COMPLETED" &&
    existing.paymentStatus === "PAID" &&
    ((data.status && data.status !== "COMPLETED") || (data.paymentStatus && data.paymentStatus !== "PAID"));

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.paymentStatus !== undefined ? { paymentStatus: data.paymentStatus } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.discount !== undefined ? { discount: data.discount } : {}),
        ...(data.tax !== undefined ? { tax: data.tax } : {}),
        total,
      },
      include: includeDetail,
    });

    if (becomesCompletedAndPaid) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { totalOrders: { increment: 1 }, totalSpent: { increment: order.total }, lastInteractionAt: new Date() },
      });
    } else if (leavesCompletedAndPaid) {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { totalOrders: { decrement: 1 }, totalSpent: { decrement: existing.total }, lastInteractionAt: new Date() },
      });
    } else {
      await tx.customer.update({
        where: { id: order.customerId },
        data: { lastInteractionAt: new Date() },
      });
    }

    return order;
  });
}

export async function softDeleteOrder(organizationId: string, orderId: string) {
  const existing = await prisma.order.findFirst({ where: { id: orderId, organizationId, deletedAt: null } });
  if (!existing) throw new OrderNotFoundError();

  const deleted = await prisma.order.update({ where: { id: orderId }, data: { deletedAt: new Date() } });

  if (existing.status === "COMPLETED" && existing.paymentStatus === "PAID") {
    await prisma.customer.update({
      where: { id: existing.customerId },
      data: { totalOrders: { decrement: 1 }, totalSpent: { decrement: existing.total }, lastInteractionAt: new Date() },
    });
  }

  return deleted;
}
