import type { Request, Response } from "express";
import * as notificationService from "./notification.service";

export async function list(req: Request, res: Response) {
  try {
    const notifications = await notificationService.listNotifications(
      req.user!.id,
      req.organization!.id,
      { onlyUnread: req.query.unread === "true" },
    );
    return res.json({ notifications });
  } catch (error) {
    console.error("Notification list error:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

export async function unreadCount(req: Request, res: Response) {
  try {
    const count = await notificationService.getUnreadCount(
      req.user!.id,
      req.organization!.id,
    );
    return res.json({ count });
  } catch (error) {
    console.error("Notification unread count error:", error);
    return res.status(500).json({ error: "Failed to get unread count" });
  }
}

export async function markRead(req: Request, res: Response) {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user!.id,
      req.organization!.id,
    );
    return res.json({ notification });
  } catch (error) {
    if (error instanceof Error && error.message === "Notification not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Notification mark read error:", error);
    return res.status(500).json({ error: "Failed to mark notification as read" });
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    const result = await notificationService.markAllAsRead(
      req.user!.id,
      req.organization!.id,
    );
    return res.json(result);
  } catch (error) {
    console.error("Notification mark all read error:", error);
    return res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
}
