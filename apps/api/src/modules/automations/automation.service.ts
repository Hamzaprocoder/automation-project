import { prisma } from "../../lib/prisma";

export async function getUpcomingAppointmentsForReminder(
  organizationId: string,
  hoursAhead = 24,
) {
  const now = new Date();
  const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  return prisma.appointment.findMany({
    where: {
      organizationId,
      deletedAt: null,
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      startsAt: {
        gte: now,
        lte: future,
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsappNumber: true,
          whatsappOptIn: true,
        },
      },
      service: {
        select: { id: true, name: true },
      },
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getOverdueFollowUps(organizationId: string) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return prisma.conversation.findMany({
    where: {
      organizationId,
      status: "OPEN",
      lastMessageAt: { lte: twentyFourHoursAgo },
      unreadCount: { gt: 0 },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsappNumber: true,
          lastInteractionAt: true,
        },
      },
    },
    orderBy: { lastMessageAt: "asc" },
    take: 50,
  });
}

export async function logAutomationExecution(
  organizationId: string,
  input: {
    workflow: string;
    status: "SUCCESS" | "FAILED";
    executionId?: string;
    message?: string;
    metadata?: Record<string, unknown>;
  },
) {
  return prisma.auditLog.create({
    data: {
      organizationId,
      action: `AUTOMATION_${input.status}`,
      entityType: "Automation",
      entityId: input.executionId,
      metadata: {
        workflow: input.workflow,
        ...(input.executionId ? { executionId: input.executionId } : {}),
        ...(input.message ? { message: input.message } : {}),
        ...(input.metadata ?? {}),
      },
    },
  });
}
