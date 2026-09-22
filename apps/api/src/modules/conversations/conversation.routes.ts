import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";
import * as controller from "./conversation.controller";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission("conversation:read"), controller.list);
router.get("/:id", requirePermission("conversation:read"), controller.getById);

router.post(
  "/:id/messages",
  requirePermission("conversation:reply"),
  controller.sendMessage,
);

router.patch("/:id", (req, res, next) => {
  const body = req.body as Record<string, unknown> | undefined;
  const keys = Object.keys(body ?? {});
  const readOnlyUpdate = keys.length > 0 && keys.every((key) => key === "markAsRead");
  return requirePermission(readOnlyUpdate ? "conversation:read" : "conversation:assign")(req, res, next);
}, controller.update);

router.get("/:id/notes", requirePermission("conversation:read"), controller.listNotes);
router.post("/:id/notes", requirePermission("conversation:reply"), controller.createNote);

export default router;
