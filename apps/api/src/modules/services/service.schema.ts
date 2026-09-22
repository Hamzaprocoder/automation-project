import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "Service name is required").max(120),
  description: z.string().trim().max(2000).optional(),
  durationMins: z.coerce.number().int().min(5).max(480).default(30),
  price: z.coerce.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();
