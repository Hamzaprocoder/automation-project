import { z } from "zod";

export const listConversationsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED", "ARCHIVED"]).optional(),
  unreadOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(4096),
});

export const updateConversationSchema = z.object({
  status: z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED", "ARCHIVED"]).optional(),
  assignedStaffId: z.string().cuid().nullable().optional(),
  markAsRead: z.boolean().optional(),
});

export const createInternalNoteSchema = z.object({
  body: z.string().trim().min(1, "Note cannot be empty").max(5000),
});
