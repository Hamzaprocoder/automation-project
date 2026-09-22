import type { Request, Response } from "express";
import {
  createInternalNoteSchema,
  listConversationsQuerySchema,
  sendMessageSchema,
  updateConversationSchema,
} from "./conversation.schema";
import * as conversationService from "./conversation.service";

export async function list(req: Request, res: Response) {
  const parsed = listConversationsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    return res.json(await conversationService.listConversations(req.organization!.id, parsed.data));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const conversation = await conversationService.getConversation(
      req.organization!.id,
      req.params.id,
    );
    return res.json({ conversation });
  } catch (error) {
    if (error instanceof conversationService.ConversationNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch conversation" });
  }
}

export async function sendMessage(req: Request, res: Response) {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const message = await conversationService.sendMessage(
      req.organization!.id,
      req.params.id,
      parsed.data.content,
      req.user!.id,
    );
    return res.status(201).json({ message: "Message queued", data: message });
  } catch (error) {
    if (error instanceof conversationService.ConversationNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof conversationService.MessagingWindowExpiredError) {
      return res.status(422).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}

export async function update(req: Request, res: Response) {
  const parsed = updateConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const conversation = await conversationService.updateConversation(
      req.organization!.id,
      req.params.id,
      parsed.data,
    );
    return res.json({ message: "Conversation updated", conversation });
  } catch (error) {
    if (error instanceof conversationService.ConversationNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof conversationService.AssignedStaffNotFoundError) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to update conversation" });
  }
}

export async function listNotes(req: Request, res: Response) {
  try {
    const notes = await conversationService.listInternalNotes(
      req.organization!.id,
      req.params.id,
    );
    return res.json({ data: notes });
  } catch (error) {
    if (error instanceof conversationService.ConversationNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch internal notes" });
  }
}

export async function createNote(req: Request, res: Response) {
  const parsed = createInternalNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const note = await conversationService.createInternalNote(
      req.organization!.id,
      req.params.id,
      req.user!.id,
      parsed.data.body,
    );
    return res.status(201).json({ data: note });
  } catch (error) {
    if (error instanceof conversationService.ConversationNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to create internal note" });
  }
}
