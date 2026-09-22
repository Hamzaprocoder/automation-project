import type { Request, Response } from "express";
import { z } from "zod";
import type { OrganizationRole } from "@prisma/client";
import * as orgService from "./organization.service";
import { log as auditLog } from "../audit/audit.service";

const inviteSchema = z.object({
  email: z.string().trim().email().max(320),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
});

const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export async function getOrganization(req: Request, res: Response) {
  try {
    const organization = await orgService.getOrganization(req.organization!.id);
    if (!organization) return res.status(404).json({ error: "Organization not found" });
    return res.json({ organization });
  } catch (error) {
    console.error("Get organization error:", error);
    return res.status(500).json({ error: "Failed to fetch organization" });
  }
}

export async function updateOrganization(req: Request, res: Response) {
  const parsed = updateOrganizationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const organization = await orgService.updateOrganization(req.organization!.id, parsed.data);
    await auditLog({
      organizationId: req.organization!.id,
      userId: req.user!.id,
      action: "organization.updated",
      entityType: "Organization",
      entityId: organization.id,
      metadata: { name: organization.name },
    });
    return res.json({ organization });
  } catch (error) {
    console.error("Update organization error:", error);
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to update organization" });
  }
}

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
    await auditLog({ organizationId: req.organization!.id, userId: req.user!.id, action: "member.invited", entityType: "OrganizationMember", entityId: membership.id, metadata: { invitedUserId: membership.userId, role: membership.role } });
    return res.status(201).json({ message: "Member added successfully", membership });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to add member" });
  }
}
