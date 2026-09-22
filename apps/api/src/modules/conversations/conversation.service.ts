import type { ConversationStatus, MessageDirection } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { sendWhatsAppTextMessage } from "../../lib/whatsapp";

const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000;

export class ConversationNotFoundError extends Error {
  constructor() {
    super("Conversation not found");
  }
}

export class MessagingWindowExpiredError extends Error {
  constructor() {
    super("The 24-hour WhatsApp customer service window has expired. Use an approved WhatsApp template for outbound messaging.");
  }
}

export class AssignedStaffNotFoundError extends Error {
  constructor() {
    super("Assigned staff member is not part of this organization");
  }
}

async function getConversationForOrganization(organizationId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, organizationId },
    include: { customer: true },
  });

  if (!conversation) throw new ConversationNotFoundError();
  return conversation;
}

export async function listConversations(
  organizationId: string,
  options: {
    search?: string;
    status?: ConversationStatus;
    unreadOnly?: boolean;
    page: number;
    limit: number;
  },
) {
  const { search, status, unreadOnly, page, limit } = options;
  const skip = (page - 1) * limit;

  const where: {
    organizationId: string;
    status?: ConversationStatus;
    unreadCount?: { gt: number };
    customer?: { OR: Array<Record<string, unknown>> };
  } = { organizationId };

  if (status) where.status = status;
  if (unreadOnly) where.unreadCount = { gt: 0 };

  if (search) {
    where.customer = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { whatsappNumber: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [data, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsappNumber: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.conversation.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getConversation(organizationId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, organizationId },
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "asc" } },
      internalNotes: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!conversation) throw new ConversationNotFoundError();
  return conversation;
}

export async function sendMessage(
  organizationId: string,
  conversationId: string,
  content: string,
  sentByUserId: string,
) {
  const conversation = await getConversationForOrganization(organizationId, conversationId);

  const latestInbound = await prisma.message.findFirst({
    where: {
      organizationId,
      conversationId,
      direction: "INBOUND" as MessageDirection,
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const message = await prisma.message.create({
    data: {
      organizationId,
      conversationId,
      customerId: conversation.customerId,
      senderId: sentByUserId,
      direction: "OUTBOUND",
      type: "TEXT",
      status: "QUEUED",
      body: content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date(), unreadCount: 0 },
  });

  await prisma.customer.update({
    where: { id: conversation.customerId },
    data: { lastInteractionAt: new Date() },
  });

  const withinWindow =
    latestInbound !== null &&
    Date.now() - latestInbound.createdAt.getTime() <= MESSAGING_WINDOW_MS;

  if (!withinWindow) {
    await prisma.message.update({
      where: { id: message.id },
      data: { status: "FAILED" },
    });
    throw new MessagingWindowExpiredError();
  }

  const accessToken = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = conversation.organizationId
    ? (await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { whatsappPhoneId: true },
      }))?.whatsappPhoneId
    : null;

  if (!accessToken || !phoneNumberId || !conversation.customer.whatsappNumber) {
    return message;
  }

  try {
    const result = await sendWhatsAppTextMessage({
      to: conversation.customer.whatsappNumber,
      message: content,
      phoneNumberId,
      accessToken,
    });

    const whatsappMessageId = result.messages?.[0]?.id as string | undefined;

    return await prisma.message.update({
      where: { id: message.id },
      data: {
        status: "SENT",
        externalId: whatsappMessageId ?? undefined,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.message.update({
      where: { id: message.id },
      data: { status: "FAILED" },
    });
    console.error("Failed to send WhatsApp message:", error);
    return await prisma.message.findUniqueOrThrow({ where: { id: message.id } });
  }
}

export async function updateConversation(
  organizationId: string,
  conversationId: string,
  data: {
    status?: ConversationStatus;
    assignedStaffId?: string | null;
    markAsRead?: boolean;
  },
) {
  await getConversationForOrganization(organizationId, conversationId);

  if (data.assignedStaffId !== undefined && data.assignedStaffId !== null) {
    const member = await prisma.organizationMember.findFirst({
      where: { organizationId, userId: data.assignedStaffId },
      select: { id: true },
    });
    if (!member) throw new AssignedStaffNotFoundError();
  }

  const updateData: {
    status?: ConversationStatus;
    assignedToId?: string | null;
    unreadCount?: number;
  } = {};

  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignedStaffId !== undefined) updateData.assignedToId = data.assignedStaffId;
  if (data.markAsRead) updateData.unreadCount = 0;

  return prisma.conversation.update({
    where: { id: conversationId },
    data: updateData,
  });
}

export async function listInternalNotes(organizationId: string, conversationId: string) {
  await getConversationForOrganization(organizationId, conversationId);

  return prisma.internalNote.findMany({
    where: { organizationId, conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createInternalNote(
  organizationId: string,
  conversationId: string,
  authorId: string,
  body: string,
) {
  await getConversationForOrganization(organizationId, conversationId);

  return prisma.internalNote.create({
    data: { organizationId, conversationId, authorId, body },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}
