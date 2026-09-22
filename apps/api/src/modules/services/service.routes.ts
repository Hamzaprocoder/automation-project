import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as controller from "./service.controller";

const router = Router();

router.use(requireAuth);
router.get("/", controller.list);
router.post("/", requireRole("OWNER", "ADMIN", "MANAGER"), controller.create);
router.patch("/:id", requireRole("OWNER", "ADMIN", "MANAGER"), controller.update);
router.delete("/:id", requireRole("OWNER", "ADMIN"), controller.remove);

export default router;
