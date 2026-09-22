import type { Request, Response } from "express";
import { z } from "zod";
import type { OrganizationRole } from "@prisma/client";
import * as orgService from "./organization.service";

const inviteSchema = z.object({
  email: z.string().trim().email().max(320),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
});

export async function listMembers(req: Request, res: Response) {
  try {
    const members = await orgService.getOrganizationMembers(req.organization!.id);
    return res.json({ members });
  } catch (error) {
    console.error("List organization members error:", error);
    return res.status(500).json({ error: "Failed to fetch members" });
  }
}

export async function inviteMember(req: Request, res: Response) {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const membership = await orgService.inviteMember(
      req.organization!.id,
      parsed.data.email,
      parsed.data.role as OrganizationRole,
      req.user!.id,
    );
    return res.status(201).json({ message: "Member added successfully", membership });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to add member" });
  }
}
