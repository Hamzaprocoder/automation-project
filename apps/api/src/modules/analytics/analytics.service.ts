import { prisma } from "../../lib/prisma";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDailyMap(startDate: Date, days: number) {
  const map = new Map<string, number>();
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    map.set(dayKey(date), 0);
  }
  return map;
}

function boundedDays(value: number | undefined) {
  if (value === undefined) return 30;
  if (!Number.isInteger(value) || value < 1 || value > 90) {
    throw new Error("days must be an integer between 1 and 90");
  }
  return value;
}

export async function getOverviewMetrics(organizationId: string) {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCustomers,
    newCustomersThisMonth,
    newCustomersLastMonth,
    returningCustomers,
    paidOrdersThisMonth,
    paidOrdersLastMonth,
    revenueThisMonth,
    revenueLastMonth,
    completedAppointments,
    appointmentOutcomeCount,
    noShowAppointments,
    openConversations,
    unansweredConversations,
    recentMessages,
  ] = await Promise.all([
    prisma.customer.count({
      where: { organizationId, deletedAt: null, status: "ACTIVE" },
    }),
    prisma.customer.count({
      where: { organizationId, deletedAt: null, createdAt: { gte: startOfThisMonth } },
    }),
    prisma.customer.count({
      where: {
        organizationId,
        deletedAt: null,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.customer.count({
      where: {
        organizationId,
        deletedAt: null,
        orders: {
          some: {
            deletedAt: null,
            status: "COMPLETED",
            paymentStatus: "PAID",
            createdAt: { lt: startOfThisMonth },
          },
          some: {
            deletedAt: null,
            status: "COMPLETED",
            paymentStatus: "PAID",
            createdAt: { gte: startOfThisMonth },
          },
        },
      },
    }),
    prisma.order.count({
      where: {
        organizationId,
        deletedAt: null,
        status: "COMPLETED",
        paymentStatus: "PAID",
        createdAt: { gte: startOfThisMonth },
      },
    }),
    prisma.order.count({
      where: {
        organizationId,
        deletedAt: null,
        status: "COMPLETED",
        paymentStatus: "PAID",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.order.aggregate({
      where: {
        organizationId,
        deletedAt: null,
        status: "COMPLETED",
        paymentStatus: "PAID",
        createdAt: { gte: startOfThisMonth },
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        organizationId,
        deletedAt: null,
        status: "COMPLETED",
        paymentStatus: "PAID",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
    }),
    prisma.appointment.count({
      where: { organizationId, deletedAt: null, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        deletedAt: null,
        status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] },
      },
    }),
    prisma.appointment.count({
      where: { organizationId, deletedAt: null, status: "NO_SHOW" },
    }),
    prisma.conversation.count({
      where: { organizationId, status: "OPEN" },
    }),
    prisma.conversation.count({
      where: { organizationId, status: { in: ["OPEN", "PENDING"] }, unreadCount: { gt: 0 } },
    }),
    prisma.message.findMany({
      where: {
        organizationId,
        direction: { in: ["INBOUND", "OUTBOUND"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { conversationId: true, direction: true, createdAt: true },
      orderBy: [{ conversationId: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const revenueThisMonthValue = Number(revenueThisMonth._sum.total ?? 0);
  const revenueLastMonthValue = Number(revenueLastMonth._sum.total ?? 0);
  const averageOrderValue = paidOrdersThisMonth > 0
    ? revenueThisMonthValue / paidOrdersThisMonth
    : 0;

  const appointmentCompletionRate = appointmentOutcomeCount > 0
    ? Math.round((completedAppointments / appointmentOutcomeCount) * 100)
    : 0;
  const noShowRate = appointmentOutcomeCount > 0
    ? Math.round((noShowAppointments / appointmentOutcomeCount) * 100)
    : 0;

  let responseSamples = 0;
  let responseSeconds = 0;
  let unansweredInbound = 0;
  let totalInbound = 0;
  let previousInbound: Date | null = null;

  for (const message of recentMessages) {
    if (message.direction === "INBOUND") {
      totalInbound++;
      previousInbound = message.createdAt;
      continue;
    }
    if (previousInbound) {
      responseSeconds += (message.createdAt.getTime() - previousInbound.getTime()) / 1000;
      responseSamples++;
      previousInbound = null;
    }
  }

  const averageResponseMinutes = responseSamples > 0
    ? Math.round(responseSeconds / responseSamples / 60)
    : 0;

  // An inbound message without a subsequent outbound response in the sampled window.
  // This is intentionally a simple operational metric; conversation-level SLA tracking
  // can be added later without changing this API shape.
  unansweredInbound = Math.max(totalInbound - responseSamples, 0);

  return {
    customers: {
      total: totalCustomers,
      newThisMonth: newCustomersThisMonth,
      newLastMonth: newCustomersLastMonth,
      returningThisMonth: returningCustomers,
      retentionRate: totalCustomers > 0
        ? Math.round((returningCustomers / totalCustomers) * 100)
        : 0,
    },
    revenue: {
      thisMonth: revenueThisMonthValue,
      lastMonth: revenueLastMonthValue,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalPaidOrders: paidOrdersThisMonth,
      paidOrdersLastMonth,
    },
    appointments: {
      completed: completedAppointments,
      completionRate: appointmentCompletionRate,
      noShowRate,
    },
    conversations: {
      open: openConversations,
      unanswered: unansweredConversations,
      unansweredRate: totalInbound > 0
        ? Math.round((unansweredInbound / totalInbound) * 100)
        : 0,
      averageResponseMinutes,
      responseSampleSize: responseSamples,
    },
  };
}

export async function getRevenueSeries(organizationId: string, requestedDays?: number) {
  const days = boundedDays(requestedDays);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      organizationId,
      deletedAt: null,
      status: "COMPLETED",
      paymentStatus: "PAID",
      createdAt: { gte: startDate },
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  const map = buildDailyMap(startDate, days);
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    map.set(key, (map.get(key) ?? 0) + Number(order.total));
  }

  return Array.from(map.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));
}

export async function getCustomerGrowthSeries(
  organizationId: string,
  requestedDays?: number,
) {
  const days = boundedDays(requestedDays);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const customers = await prisma.customer.findMany({
    where: {
      organizationId,
      deletedAt: null,
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const map = buildDailyMap(startDate, days);
  for (const customer of customers) {
    const key = dayKey(customer.createdAt);
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}
