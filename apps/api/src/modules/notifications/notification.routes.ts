import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./notification.controller";

const router = Router();

router.use(requireAuth);

router.get("/", controller.list);
router.get("/unread-count", controller.unreadCount);
router.patch("/:id/read", controller.markRead);
router.post("/mark-all-read", controller.markAllRead);

export default router;
