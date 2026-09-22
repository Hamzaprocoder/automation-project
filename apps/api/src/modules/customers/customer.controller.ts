import type { Request, Response } from "express";
import type { CustomerStatus } from "@prisma/client";
import { createCustomerSchema, listCustomersQuerySchema, updateCustomerSchema } from "./customer.schema";
import * as customerService from "./customer.service";

export async function list(req: Request, res: Response) {
  const parsed = listCustomersQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors });
  try {
    return res.json(await customerService.listCustomers(req.organization!.id, {
      ...parsed.data, status: parsed.data.status as CustomerStatus | undefined,
    }));
  } catch (error) {
    console.error("List customers error:", error);
    return res.status(500).json({ error: "Failed to fetch customers" });
  }
}

export async function getById(req: Request, res: Response) {
  try { return res.json({ customer: await customerService.getCustomerById(req.organization!.id, req.params.id) }); }
  catch (error) {
    if (error instanceof Error && error.message === "Customer not found") return res.status(404).json({ error: error.message });
    console.error("Get customer error:", error);
    return res.status(500).json({ error: "Failed to fetch customer" });
  }
}

export async function create(req: Request, res: Response) {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  try {
    const customer = await customerService.createCustomer(req.organization!.id, parsed.data);
    return res.status(201).json({ message: "Customer created successfully", customer });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) return res.status(409).json({ error: error.message });
    console.error("Create customer error:", error);
    return res.status(500).json({ error: "Failed to create customer" });
  }
}

export async function update(req: Request, res: Response) {
  const parsed = updateCustomerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  try {
    const customer = await customerService.updateCustomer(req.organization!.id, req.params.id, parsed.data);
    return res.json({ message: "Customer updated successfully", customer });
  } catch (error) {
    if (error instanceof Error && error.message === "Customer not found") return res.status(404).json({ error: error.message });
    if (error instanceof Error && error.message.includes("already exists")) return res.status(409).json({ error: error.message });
    return res.status(500).json({ error: "Failed to update customer" });
  }
}

export async function remove(req: Request, res: Response) {
  try { return res.json(await customerService.softDeleteCustomer(req.organization!.id, req.params.id)); }
  catch (error) {
    if (error instanceof Error && error.message === "Customer not found") return res.status(404).json({ error: error.message });
    return res.status(500).json({ error: "Failed to delete customer" });
  }
}
