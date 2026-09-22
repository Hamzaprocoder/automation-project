import { z } from "zod";

const orderStatuses = ["DRAFT", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const paymentStatuses = ["PENDING", "PAID", "PARTIALLY_PAID", "REFUNDED"] as const;

export const orderItemSchema = z.object({
  serviceId: z.string().cuid().optional(),
  name: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createOrderSchema = z.object({
  customerId: z.string().cuid(),
  items: z.array(orderItemSchema).min(1),
  discount: z.coerce.number().nonnegative().default(0),
  tax: z.coerce.number().nonnegative().default(0),
  notes: z.string().trim().max(5000).optional(),
  status: z.enum(["DRAFT", "CONFIRMED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID"]).optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(orderStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  notes: z.string().trim().max(5000).optional(),
  discount: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().nonnegative().optional(),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(orderStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  customerId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
