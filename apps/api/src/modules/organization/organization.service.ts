import type { OrganizationRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export async function getOrganizationMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOrganization(organizationId: string) {
  return prisma.organization.findUnique({ where: { id: organizationId } });
}

export async function updateOrganization(organizationId: string, data: { name: string }) {
  return prisma.organization.update({
    where: { id: organizationId },
    data: { name: data.name },
  });
}

export async function inviteMember(
  organizationId: string,
  email: string,
  role: OrganizationRole,
  invitedByUserId: string,
) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new Error("User with this email does not exist. They must register first.");

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: user.id } },
  });
  if (existing) throw new Error("User is already a member of this organization");

  return prisma.organizationMember.create({
    data: { userId: user.id, organizationId, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}
