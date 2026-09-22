import type { MessageDirection, MessageStatus, MessageType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type { WhatsAppWebhookPayload } from "./whatsapp.types";

const statusMap: Record<string, MessageStatus> = {
  sent: "SENT",
  delivered: "DELIVERED",
  read: "READ",
  failed: "FAILED",
};

const typeMap: Record<string, MessageType> = {
  text: "TEXT",
  image: "IMAGE",
  video: "VIDEO",
  audio: "AUDIO",
  document: "DOCUMENT",
  template: "TEMPLATE",
  interactive: "INTERACTIVE",
};

export async function processIncomingWebhook(payload: WhatsAppWebhookPayload) {
  if (payload.object !== "whatsapp_business_account") {
    return { processed: false, reason: "Not a WhatsApp event" };
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const value = change.value;

      for (const message of value.messages ?? []) {
        await handleIncomingMessage({
          phoneNumberId: value.metadata.phone_number_id,
          from: message.from,
          messageId: message.id,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text?.body ?? null,
          contactName: value.contacts?.find((contact) => contact.wa_id === message.from)?.profile?.name ?? null,
        });
      }

      for (const status of value.statuses ?? []) {
        await handleStatusUpdate(status.id, status.status);
      }
    }
  }

  return { processed: true };
}

async function handleIncomingMessage(data: {
  phoneNumberId: string;
  from: string;
  messageId: string;
  timestamp: string;
  type: string;
  text: string | null;
  contactName: string | null;
}) {
  const organization = await prisma.organization.findUnique({
    where: { whatsappPhoneId: data.phoneNumberId },
  });

  if (!organization) {
    console.warn("No organization configured for WhatsApp phone number id", data.phoneNumberId);
    return;
  }

  const existingMessage = await prisma.message.findUnique({
    where: {
      organizationId_externalId: {
        organizationId: organization.id,
        externalId: data.messageId,
      },
    },
  });

  if (existingMessage) return;

  const messageDate = new Date(Number(data.timestamp) * 1000);
  const receivedAt = Number.isNaN(messageDate.getTime()) ? new Date() : messageDate;
  const phone = data.from;

  let customer = await prisma.customer.findUnique({
    where: {
      organizationId_phone: {
        organizationId: organization.id,
        phone,
      },
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: data.contactName,
        phone,
        whatsappNumber: phone,
        source: "whatsapp",
        status: "ACTIVE",
        firstInteractionAt: receivedAt,
        lastInteractionAt: receivedAt,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        deletedAt: null,
        lastInteractionAt: receivedAt,
        name: customer.name || data.contactName,
      },
    });
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      organizationId: organization.id,
      customerId: customer.id,
      status: "OPEN",
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        organizationId: organization.id,
        customerId: customer.id,
        status: "OPEN",
        unreadCount: 0,
        lastMessageAt: receivedAt,
      },
    });
  }

  await prisma.message.create({
    data: {
      organizationId: organization.id,
      conversationId: conversation.id,
      customerId: customer.id,
      direction: "INBOUND" satisfies MessageDirection,
      type: typeMap[data.type] ?? "UNKNOWN",
      status: "RECEIVED",
      body: data.text ?? `[${data.type} message]`,
      externalId: data.messageId,
      createdAt: receivedAt,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: receivedAt,
      unreadCount: { increment: 1 },
    },
  });

  console.log(`Processed WhatsApp message from ${phone}`);
}

async function handleStatusUpdate(whatsappMessageId: string, status: string) {
  const messages = await prisma.message.findMany({
    where: { externalId: whatsappMessageId },
    take: 1,
  });
  const message = messages[0];
  if (!message) return;

  const newStatus = statusMap[status];
  if (!newStatus) return;

  await prisma.message.update({
    where: { id: message.id },
    data: { status: newStatus },
  });
}
