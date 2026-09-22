import type { Request, Response } from "express";
import { createOrderSchema, updateOrderSchema, listOrdersQuerySchema } from "./order.schema";
import * as orderService from "./order.service";

export async function list(req: Request, res: Response) {
  const parsed = listOrdersQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query", details: parsed.error.flatten().fieldErrors });
  return res.json(await orderService.listOrders(req.organization!.id, parsed.data));
}

export async function getById(req: Request, res: Response) {
  try { return res.json({ order: await orderService.getOrder(req.organization!.id, req.params.id) }); }
  catch (error) { return res.status(404).json({ error: error instanceof Error ? error.message : "Order not found" }); }
}

export async function create(req: Request, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  try { return res.status(201).json({ order: await orderService.createOrder(req.organization!.id, parsed.data) }); }
  catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create order" }); }
}

export async function update(req: Request, res: Response) {
  const parsed = updateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  try { return res.json({ order: await orderService.updateOrder(req.organization!.id, req.params.id, parsed.data) }); }
  catch (error) {
    const status = error instanceof orderService.OrderNotFoundError ? 404 : 400;
    return res.status(status).json({ error: error instanceof Error ? error.message : "Unable to update order" });
  }
}

export async function remove(req: Request, res: Response) {
  try { await orderService.softDeleteOrder(req.organization!.id, req.params.id); return res.json({ message: "Order deleted" }); }
  catch (error) { return res.status(404).json({ error: error instanceof Error ? error.message : "Order not found" }); }
}
