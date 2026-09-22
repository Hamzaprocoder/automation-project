import { prisma } from "../../lib/prisma";
import type { NotificationType } from "@prisma/client";

interface CreateNotificationInput {
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(data: CreateNotificationInput) {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: data.organizationId,
        userId: data.userId,
      },
    },
    select: { userId: true },
  });

  if (!member) throw new Error("Notification recipient is not a member of the organization");

  return prisma.notification.create({
    data: {
      organizationId: data.organizationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    },
  });
}

export async function listNotifications(
  userId: string,
  organizationId: string,
  options: { onlyUnread?: boolean; limit?: number } = {},
) {
  const onlyUnread = options.onlyUnread ?? false;
  const limit = Math.min(Math.max(options.limit ?? 30, 1), 100);

  return prisma.notification.findMany({
    where: {
      userId,
      organizationId,
      ...(onlyUnread ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string, organizationId: string) {
  return prisma.notification.count({
    where: { userId, organizationId, isRead: false },
  });
}

export async function markAsRead(
  notificationId: string,
  userId: string,
  organizationId: string,
) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId, organizationId },
  });

  if (!notification) throw new Error("Notification not found");
  if (notification.isRead) return notification;

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string, organizationId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, organizationId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return { message: "All notifications marked as read", updated: result.count };
}
