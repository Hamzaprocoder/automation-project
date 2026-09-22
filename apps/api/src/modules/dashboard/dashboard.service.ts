import { prisma } from "../../lib/prisma";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export async function getOverview(organizationId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalCustomers,
    newCustomersLast7Days,
    newCustomersLast30Days,
    openConversations,
    latestConversationMessages,
    recentCustomers,
  ] = await Promise.all([
    prisma.customer.count({
      where: { organizationId, deletedAt: null, status: "ACTIVE" },
    }),
    prisma.customer.count({
      where: { organizationId, deletedAt: null, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.customer.count({
      where: { organizationId, deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.conversation.count({
      where: { organizationId, status: "OPEN" },
    }),
    prisma.message.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      distinct: ["conversationId"],
      select: { conversationId: true, direction: true, createdAt: true },
    }),
    prisma.customer.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        source: true,
        createdAt: true,
        lastInteractionAt: true,
      },
    }),
  ]);

  const unansweredConversations = latestConversationMessages.filter(
    (message) => message.direction === "INBOUND",
  ).length;

  const attentionRequired: Array<{
    type: string;
    message: string;
    count: number;
    severity: "high" | "medium" | "low";
  }> = [];

  if (unansweredConversations > 0) {
    attentionRequired.push({
      type: "unanswered_conversations",
      message:
        unansweredConversations +
        " conversation" +
        (unansweredConversations === 1 ? "" : "s") +
        " waiting for a reply",
      count: unansweredConversations,
      severity: "high",
    });
  }

  attentionRequired.push({
    type: "appointments_today",
    message: "0 appointments scheduled for today",
    count: 0,
    severity: "low",
  });

  attentionRequired.push({
    type: "overdue_followups",
    message: "0 overdue follow-ups",
    count: 0,
    severity: "medium",
  });

  return {
    kpis: {
      totalCustomers,
      newCustomersLast7Days,
      newCustomersLast30Days,
      openConversations,
      unansweredConversations,
      todaysAppointments: 0,
      overdueFollowUps: 0,
      revenueThisMonth: 0,
    },
    attentionRequired,
    recentCustomers,
  };
}

export async function getCustomerGrowth(organizationId: string, days = 30) {
  const safeDays = Math.min(Math.max(Math.trunc(days), 1), 90);
  const startDate = startOfDay(new Date());
  startDate.setDate(startDate.getDate() - safeDays);

  const customers = await prisma.customer.findMany({
    where: {
      organizationId,
      deletedAt: null,
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const growthMap = new Map<string, number>();

  for (let i = 0; i <= safeDays; i += 1) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    growthMap.set(date.toISOString().split("T")[0], 0);
  }

  for (const customer of customers) {
    const key = customer.createdAt.toISOString().split("T")[0];
    growthMap.set(key, (growthMap.get(key) ?? 0) + 1);
  }

  return Array.from(growthMap.entries()).map(([date, count]) => ({ date, count }));
}
